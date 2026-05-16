import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const enhancePrompt = async (req: Request, res: Response) => {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY not configured" });
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
    const { topic, platform } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) return res.status(500).json({ error: "GEMINI_API_KEY not configured" });

    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Write a viral high-energy ${platform} script about: ${topic}. Include scene descriptions and emotive cues. Format with clear headings.`;
      
      const result = await model.generateContent(prompt);
      res.json({ script: result.response.text() });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate script" });
    }
};

export const generateCaptions = async (req: Request, res: Response) => {
    const { context } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) return res.status(500).json({ error: "GEMINI_API_KEY not configured" });

    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Generate 5 catchy, viral-ready social media captions and 10 trending hashtags for this content: ${context}. Use emojis.`;
      
      const result = await model.generateContent(prompt);
      res.json({ captions: result.response.text() });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate captions" });
    }
};
