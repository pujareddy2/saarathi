# 🚀 SaarthiAI — FULL STEP-BY-STEP DEPLOYMENT

This guide will take you from code to a live decentralized intelligence guide in minutes.

---

## 🧱 STEP 1 — CREATE GOOGLE CLOUD PROJECT

1. Go to 👉 [https://console.cloud.google.com](https://console.cloud.google.com)
2. Click **“Select Project” → “New Project”**
3. Name it: `saarthi-ai`
4. Click **Create**

---

## 💳 STEP 2 — ENABLE BILLING (CRITICAL)

1. Go to **Billing section** in your Google Cloud Console.
2. Link your hackathon credits or billing account. Cloud Run requires an active billing account for container execution.

---

## ⚙️ STEP 3 — ENABLE REQUIRED SERVICES

Search and enable these APIs in the Google Cloud Console:
- **Cloud Run**
- **Cloud Build**
- **Artifact Registry**
- **Cloud Vision API** (required for the image scanner)

---

## 💻 STEP 4 — INSTALL TOOLS (LOCAL SYSTEM)

Make sure you have these installed on your machine:
1. **Google Cloud CLI**: [Install link](https://cloud.google.com/sdk/docs/install)
   - Run `gcloud init` after install to link your project.
2. **Node.js (18+)**: [Install link](https://nodejs.org/)
3. **Firebase CLI**: `npm install -g firebase-tools`
   - Run `firebase login` after install.

---

## 🚀 STEP 5 — DEPLOY TO CLOUD RUN (ONE COMMAND)

Run this exact command in the root of your project:

```bash
gcloud run deploy saarthi-backend \
  --source . \
  --region asia-south1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=your_key_here
```

👉 **SAVE THE OUTPUT URL** (e.g. `https://saarthi-backend-xxxxx.a.run.app`)

---

## 🔐 STEP 6 — ADD SECRETS

If you didn't set the key during deploy, you can update it anytime:

```bash
gcloud run services update saarthi-backend \
  --set-env-vars GEMINI_API_KEY=your_key_here
```

---

## 🌐 STEP 7 — CONNECT FRONTEND & DEPLOY (FIREBASE)

In a production environment, the backend serves the frontend automatically at the Cloud Run URL. To deploy a separate Firebase Landing:

```bash
# 1. Initialize
firebase init hosting

# 2. Build and Deploy
npm run build
firebase deploy
```

---

## 🏁 FINAL RESULT

| Component | Sync Status |
| --------- | ----------- |
| Backend   | Cloud Run ✅ |
| Frontend  | Hosted ✅    |
| AI        | Gemini Live ✅ |
| Scanner   | Vision Active ✅ |

---

### 🏆 WHAT YOU SAY TO JUDGES

> “We deployed SaarthiAI using **Google Cloud Run** for serverless scaling and **Firebase** for persistence, creating a high-fidelity intelligence guide entirely within the Google Cloud ecosystem.”
