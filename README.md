# SaarthiAI — Real-Time Food Decision Guide

**SaarthiAI** is a synchronized behavioral intelligence system designed to help users make mindful food decisions in high-risk environments. By combining Computer Vision, Personalized Psychographics, and Generative AI, SaarthiAI acts as a digital "Saarthi" (Guide), nudging users toward decisional resilience.

## 🚀 Vision
In a world of constant impulse, SaarthiAI bridges the gap between biological craving and cognitive intention. It doesn't just track calories; it tracks awareness.

## ✨ Features
-   **Adaptive Awareness HUD**: A professional dashboard that visualizes decisional risk based on environmental and physiological context (Sleep, Time, Proximity to triggers).
-   **High-Fidelity Food Scanner**: Powered by Google Vision AI (via Gemini 3 Flash), detecting real food items and rejecting non-edible objects for 100% demo reliability.
-   **Intelligence Insights**: Dynamic behavioral trends and weekly AI summaries derived from real decision logs stored in Firebase.
-   **Personalized Guidance ChatBot**: A context-aware conversational AI that understands your specific goals, stress levels, and dietary preferences.
-   **Biorhythm Simulation**: A terminal to test how different contexts (e.g., Late Night + Poor Sleep) affect your risk profile.

## 🛠️ Tech Stack
-   **Frontend**: React 18, Vite, Framer Motion (Animations), Tailwind CSS.
-   **Backend**: Node.js, Express (API Orchestration).
-   **AI Ecosystem**: Google Gemini 1.5 Flash (Vision + Chat + Summarization).
-   **Database & Auth**: Firebase Firestore & Firebase Authentication.
-   **Language**: TypeScript.

## ☁️ Google Integration Highlights
-   **Gemini API**: The brain of the system, handling multi-modal food identification, empathetic nudging, and complex weekly intelligence summaries.
-   **Firebase Partitioning**: Secured user profiles and decision logs using Firestore ABAC rules and synchronized authentication.
-   **Vision Protocol**: High-speed image label detection with confidence filtering `(>0.6)` to ensure production-grade accuracy.

## 🏁 Setup & Deployment
1.  **Clone & Install**:
    ```bash
    npm install
    ```
2.  **Environment Configuration**: Create a `.env` file with:
    -   `GEMINI_API_KEY`: Your Google AI Studio API Key.
    -   `FIREBASE_CONFIG`: Config from Firebase Console.
3.  **Run Development**:
    ```bash
    npm run dev
    ```

## 🎬 Demo Instructions
For a seamless hackathon evaluation:
1.  **Login**: Use the "One-Click Demo" button or credentials:
    -   **Email**: `test@saarthi.ai`
    -   **Password**: `123456`
2.  **Scan**: Use the Camera icon to identify food. Try a manual selection (e.g., Biryani) to see the Smart Swap logic.
3.  **Chat**: Ask "I'm stressed, should I have pizza?" to see the AI leverage your profile.
4.  **Simulate**: Go to Settings (Gear icon) and toggle "Late Night" and "Poor Sleep" to see the Risk Sphere adapt in real-time.

## 🔮 Future Scope
-   **Wearable Integration**: Synchronizing real-time glucose and heart rate data for even more precise risk modeling.
-   **Community Resilience**: Collaborative decision challenges to build social accountability.
-   **AR Nudging**: Projecting guidance directly onto food items via AR glasses.

---
*Built for the Google AI Studio Build Hackathon.*
