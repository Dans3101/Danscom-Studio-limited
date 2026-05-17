import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const enhancePrompt = async (req: Request, res: Response) => {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
      return res.json({ 
        enhanced: `${prompt} (Demo Enhanced: Added cinematic lighting, ultra-detailed, 8k, professional photography style)`,
        message: "Simulation active. GEMINI_API_KEY missing."
      });
    }

    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const systemPrompt = "You are an expert AI art prompt engineer. Enhance the user's prompt to be more descriptive, artistic, and effective for high-quality image generation. Keep it under 500 characters. Return ONLY the enhanced prompt text, no explanations.";
      
      const result = await model.generateContent([systemPrompt, prompt]);
      const enhanced = result.response.text();

      res.json({ enhanced });
    } catch (error) {
      console.error("Prompt enhancement error:", error);
      res.status(500).json({ error: "Failed to enhance prompt" });
    }
};

export const generateScript = async (req: Request, res: Response) => {
    const { topic, platform, tone, industry, goal } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
      return res.json({ 
        script: `[DEMO MODE: SCRIPT SYNTHESIS]
Title: ${topic} - A Global Perspective
Industry: ${industry} | Goal: ${goal} | Tone: ${tone}

[SCENE 1: THE HOOK]
Visual: High-speed montage of ${industry} innovation.
Audio: "Have you ever wondered how ${topic} is changing the world? Stick around because we're diving deep into the future of ${industry}."

[SCENE 2: THE CORE]
Visual: Animated infographics showing the growth of ${topic}.
Audio: "${topic} isn't just a trend. It's a fundamental shift in how we approach ${industry}. Here's why..."

[SCENE 3: THE CALL TO ACTION]
Visual: Up-close shot of the creator.
Audio: "Ready to join the revolution? Hit like and subscribe for more ${industry} insights."

(Add GEMINI_API_KEY in Settings to enable real AI generation)`,
        message: "Simulation active. GEMINI_API_KEY missing." 
      });
    }

    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Act as a senior content strategist and scriptwriter. Write a ${tone || 'viral'} high-energy ${platform} script for the ${industry || 'General'} industry. 
      The core goal is ${goal || 'Engagement'}.
      Topic: ${topic}. 
      Include:
      1. A powerful hook (first 3 seconds).
      2. Structured chapters/scenes.
      3. Precise visual directions for editors.
      4. A clear call to action (CTA).
      Tone: ${tone}. Style: Marketable, professional, and trend-aware.`;
      
      const result = await model.generateContent(prompt);
      res.json({ script: result.response.text() });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate script" });
    }
};

export const generateCaptions = async (req: Request, res: Response) => {
    const { context, formats, hashtagCount, emojiDensity } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
      return res.json({ 
        captions: `✨ [DEMO MODE: CAPTION FORGE] ✨

🚀 Ready to level up your ${context?.slice(0, 20)}...? 
The future of content is here and it's powered by neural architecture! 🧠💻

Check out the latest from the forge. 🛠️⚡

#AI #TechInnovation #FutureReady #ContentCreator #DanscomAI

(Add GEMINI_API_KEY in Settings for real AI generation)`,
        message: "Simulation active. GEMINI_API_KEY missing." 
      });
    }

    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const formatString = formats?.length ? `Formats required: ${formats.join(', ')}` : "Generate standard social media captions";
      const prompt = `Generate catchy, viral-ready social media captions for this content: ${context}. 
      Target Platforms: ${formatString}. 
      Hashtag Constraint: Exactly ${hashtagCount || 5} trending hashtags.
      Emoji Strategy: ${emojiDensity || 'Moderate'} use of emojis.
      Ensure the tone matches the content and varies across formats. Return only well-formatted captions.`;
      
      const result = await model.generateContent(prompt);
      res.json({ captions: result.response.text() });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate captions" });
    }
};
