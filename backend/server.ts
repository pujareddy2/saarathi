import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from "@google/genai";
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import { z } from 'zod';
import NodeCache from 'node-cache';
import { FOOD_GUIDANCE, FOOD_KEYWORDS, FOOD_MAPPING, DEFAULT_GUIDANCE } from './constants';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

// --- Intelligence Configuration ---
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
const apiCache = new NodeCache({ stdTTL: 600 }); // 10 minute cache

// --- Validation Schemas ---
const ScanSchema = z.object({
  image: z.string().optional(),
  manual_food: z.string().optional()
}).refine(data => data.image || data.manual_food, {
  message: "Either image or manual_food must be provided"
});

const RiskSchema = z.object({
  near_food_place: z.boolean(),
  late_night: z.boolean(),
  long_gap: z.boolean(),
  poor_sleep: z.boolean()
});

const GuidanceSchema = z.object({
  food: z.string().optional(),
  score: z.number().min(0).max(100)
});

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Basic Middleware
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));

  // --- Security & Rate Limiting ---
  const rateLimit = new Map<string, { count: number, lastReset: number }>();
  const rateLimiter = (req: any, res: any, next: any) => {
    const ip = req.ip || '0.0.0.0';
    const now = Date.now();
    const data = rateLimit.get(ip) || { count: 0, lastReset: now };
    if (now - data.lastReset > 60000) {
      data.count = 0;
      data.lastReset = now;
    }
    data.count++;
    rateLimit.set(ip, data);
    if (data.count > 100) return res.status(429).json({ error: "Access Throttled" });
    next();
  };

  app.use('/api', rateLimiter);

  // --- Reliable API Endpoints ---

  app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', version: '4.2.0-vision-core' });
  });

  // Food Detection Logic (Google Vision API Proxy/Emulator via Gemini 3 Flash)
  app.post('/api/scan', async (req, res) => {
    try {
      const validation = ScanSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ status: "error", errors: validation.error.issues });
      }

      const { image, manual_food } = validation.data;
      
      // 1. Handling Manual Input as bypass
      if (manual_food) {
        const food = manual_food.toLowerCase();
        const guidance = FOOD_GUIDANCE[food] || DEFAULT_GUIDANCE;
        return res.json({
          status: "success",
          food: food.charAt(0).toUpperCase() + food.slice(1),
          confidence: 1.0,
          insight: guidance.insight,
          swap: guidance.swap
        });
      }

      // Check Cache for identical image hash (mocking with slice of base64)
      const imageHash = image ? image.substring(0, 100) : null;
      if (imageHash && apiCache.has(imageHash)) {
        console.log("Serving scan result from cache");
        return res.json(apiCache.get(imageHash));
      }

      // 2. Vision API Call (Using Gemini as a superior label detector)
      const visionResult = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{
          parts: [
            { text: "List the labels for this image with confidence scores from 0-1. Format as JSON: { \"labels\": [{ \"name\": \"string\", \"confidence\": number }] }" },
            { inlineData: { mimeType: "image/jpeg", data: image! } }
          ]
        }],
        config: { responseMimeType: "application/json" }
      });

      const responseText = visionResult.text || "{}";
      const { labels } = JSON.parse(responseText);

      // 3. Confidence & Food Detection Logic
      const topLabels = (labels || []).filter((l: any) => l.confidence >= 0.6);
      
      if (topLabels.length === 0) {
        return res.json({ 
          status: "no_food", 
          message: "Not sure, please try again with a clearer image." 
        });
      }

      // 4. Keyword Match & Mapping
      const detectedFoodLabel = topLabels.find((l: any) => 
        FOOD_KEYWORDS.includes(l.name.toLowerCase()) || 
        Object.keys(FOOD_MAPPING).includes(l.name.toLowerCase())
      );

      if (!detectedFoodLabel) {
        return res.json({ 
          status: "no_food", 
          message: "No food detected. Try scanning a meal." 
        });
      }

      // 5. Mapping Label to Known Food
      const labelName = detectedFoodLabel.name.toLowerCase();
      const mappedFood = FOOD_MAPPING[labelName] || labelName;
      const guidance = FOOD_GUIDANCE[mappedFood] || DEFAULT_GUIDANCE;

      const finalResult = {
        status: "success",
        food: mappedFood.charAt(0).toUpperCase() + mappedFood.slice(1),
        confidence: detectedFoodLabel.confidence,
        insight: guidance.insight,
        swap: guidance.swap
      };

      if (imageHash) apiCache.set(imageHash, finalResult);
      res.json(finalResult);

    } catch (error) {
      console.error("Vision Process Failure:", error);
      res.json({
        status: "error",
        message: "Unable to detect. Try again."
      });
    }
  });

  // Risk Analysis Engine
  app.post('/api/risk', (req, res) => {
    const validation = RiskSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ status: "error", errors: validation.error.issues });
    }

    const { near_food_place, late_night, long_gap, poor_sleep } = validation.data;
    
    let score = 0;
    if (near_food_place === true) score += 30;
    if (late_night === true) score += 25;
    if (long_gap === true) score += 20;
    if (poor_sleep === true) score += 15;
    
    score = Math.min(score, 100);
    res.json({ 
      score, 
      level: score > 70 ? 'High Awareness Needed' : score > 40 ? 'Monitoring' : 'Balanced' 
    });
  });

  // Unified Guidance API (One-call reliability)
  app.post('/api/guidance', (req, res) => {
    const validation = GuidanceSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ status: "error", errors: validation.error.issues });
    }

    const { food, score } = validation.data;
    const item = (food || 'Generic').toLowerCase();
    const guidance = FOOD_GUIDANCE[item] || DEFAULT_GUIDANCE;
    
    res.json({
      item: item.charAt(0).toUpperCase() + item.slice(1),
      nudge: score > 60 ? "Decision-gap detected. Suggesting high-resilience alternative." : "You're in a stable state. Guided awareness active.",
      swaps: [guidance.swap, "Fresh Salad", "Water"],
      insight: guidance.insight
    });
  });

  app.get('/api/insights', (req, res) => {
    res.json({
      summary: "You avoided 14 high-risk impulses this week. Your Decisional Resilience is at 78%.",
      trend: [20, 30, 25, 60, 40, 15, 10],
      learning_moments: 14,
      impulse_avoided: "92%"
    });
  });

  // --- Production & HMR Configuration ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
      root: root
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(root, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SaarthiAI Robust Server [Port ${PORT}]`);
  });
}

startServer();
