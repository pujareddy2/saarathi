import { GoogleGenAI } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

function getAI() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY as string;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not defined");
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

/**
 * SaarthiAI Service Layer
 * Centralized AI logic for high-abstraction cognitive tasks.
 */

export async function identifyFoodFromImage(base64Image: string) {
  try {
    const ai = getAI();
    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            { text: "Identify the food item in this image. Return just the name of the food." },
            { inlineData: { mimeType: "image/jpeg", data: base64Image } }
          ]
        }
      ]
    });
    return result.text?.trim() || "Unknown Item";
  } catch (error) {
    console.error("AI Scan Error:", error);
    return "Scan Failed";
  }
}

export async function getSmartNudge(foodItem: string, goal: string, mindfulnessLevel: string) {
  try {
    const ai = getAI();
    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `User is considering ${foodItem}. Their goal is ${goal}. Guidance context: ${mindfulnessLevel}. Provide a 1-sentence supportive, non-judgmental nudge as SaarthiAI (a helpful guide).`,
      config: {
        systemInstruction: "You are SaarthiAI, a supportive and non-judgmental food decision guide. You help users make mindful choices by offering gentle, empathetic nudges. You never scold; you only guide.",
      }
    });
    return result.text?.trim() || "Maybe try a smaller portion?";
  } catch (error) {
    console.error("Nudge AI Error:", error);
    return "Think about your long-term goal!";
  }
}

export async function generateWeeklySummary(data: any) {
  try {
    const ai = getAI();
    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Based on this week's nutritional performance data: ${JSON.stringify(data)}, provide a concise 2-sentence empathetic summary of their progress and one specific actionable tip for the next week.`,
      config: {
        systemInstruction: "You are SaarthiAI, a personalized success guide. Your tone is supportive, encouraging, and focused on acknowledging the user's progress in their mindfulness journey.",
      }
    });
    return result.text?.trim() || "You're doing great! Keep tracking your progress.";
  } catch (error) {
    console.error("Summary AI Error:", error);
    return "Great effort this week. Focus on staying hydrated and mindful of late-night environments.";
  }
}
