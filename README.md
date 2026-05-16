# Danscom AI Studio

A production-ready AI content generation platform.

## Features
- **AI Image Generation**: Powered by Stable Diffusion via HuggingFace.
- **AI Video Generation**: Simulated sequence rendering (RunwayML ready).
- **AI Voice Synthesis**: Real-time browser-based text-to-speech.
- **Secure Auth**: Firebase Authentication with Google Login.
- **cloud Storage**: Firestore-powered generation history.
- **Futuristic UI**: High-performance dark mode interface with motion effects.

## Setup
1. Clone the repository.
2. Install dependencies: `npm install`
3. Configure `.env` with your API keys:
   - `GEMINI_API_KEY`: Provided by AI Studio
   - `HUGGINGFACE_API_KEY`: Get from [HuggingFace](https://huggingface.co/settings/tokens)
4. Run development: `npm run dev`
5. Build for production: `npm run build`

## Tech Stack
- **Frontend**: React, Tailwind CSS, Motion (Framer Motion), Lucide Icons.
- **Backend**: Node.js, Express, TSX.
- **Database/Auth**: Firebase (Firestore, Auth).

## Deployment
Compatible with Cloud Run, Render, and Vercel.
