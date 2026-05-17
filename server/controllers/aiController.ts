import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const enhancePrompt = async (req: Request, res: Response) => {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
      try {
        const systemPrompt = "You are an expert AI art prompt engineer. Enhance the user prompt for high quality images. Return only the enhanced text.";
        const fullPrompt = `${systemPrompt}\n\nUser Prompt: ${prompt}`;
        const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(fullPrompt)}?model=openai`);
        const enhanced = await response.text();
        return res.json({ 
          enhanced: enhanced || `${prompt} (Static Enhancement)`,
          message: "Simulation active using Pollinations Core."
        });
      } catch (e) {
        return res.json({ 
          enhanced: `${prompt} (Demo Enhanced: Added cinematic lighting, ultra-detailed, 8k)`,
          message: "Simulation active. GEMINI_API_KEY missing."
        });
      }
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
      try {
        const scriptPrompt = `Write a ${tone || 'viral'} high-energy ${platform} script for the ${industry || 'General'} industry. Goal: ${goal}. Topic: ${topic}. Include hook, scenes, and CTA. Tone: ${tone}. Use markdown-like formatting with scenes labeled.`;
        const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(scriptPrompt)}?model=openai`);
        const script = await response.text();
        return res.json({ 
          script: script || "[Failed to manifest script]",
          message: "Simulation active using Pollinations Text Engine." 
        });
      } catch (e) {
        return res.json({ 
          script: `[DEMO MODE: SCRIPT SYNTHESIS]
Title: ${topic} - A Global Perspective
Industry: ${industry} | Goal: ${goal} | Tone: ${tone}

[SCENE 1: THE HOOK]
Audio: "Have you ever wondered how ${topic} is changing the world? Stick around because we're diving deep."

(Add GEMINI_API_KEY in Settings for full Gemini logic)`,
          message: "Simulation active. GEMINI_API_KEY missing." 
        });
      }
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
      try {
        const captionPrompt = `Generate 3 catchy social media captions for: ${context}. Formats: ${formats?.join(', ') || 'Standard'}. Hashtag count: ${hashtagCount}. Emoji priority: ${emojiDensity}. Return only the captions.`;
        const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(captionPrompt)}?model=openai`);
        const captions = await response.text();
        return res.json({ 
          captions: captions || "[Failed to forge captions]",
          message: "Simulation active using Pollinations Text Engine." 
        });
      } catch (e) {
        return res.json({ 
          captions: `✨ [DEMO MODE: CAPTION FORGE] ✨

🚀 Ready to level up your ${context?.slice(0, 20)}...? 
The future is here! 🧠💻

#AI #TechInnovation #DanscomAI

(Add GEMINI_API_KEY in Settings for real AI generation)`,
          message: "Simulation active. GEMINI_API_KEY missing." 
        });
      }
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
