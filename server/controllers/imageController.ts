import { Request, Response } from 'express';
import fetch from 'node-fetch';

export const generateImage = async (req: Request, res: Response) => {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;
    if (!HF_API_KEY) {
      return res.status(500).json({ error: "HUGGINGFACE_API_KEY not configured" });
    }

    try {
      const response = await fetch(
        "https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5",
        {
          headers: { Authorization: `Bearer ${HF_API_KEY}` },
          method: "POST",
          body: JSON.stringify({ inputs: prompt }),
        }
      );

      if (!response.ok) {
        const errData = await response.text();
        return res.status(response.status).json({ error: `HuggingFace API error: ${errData}` });
      }

      const buffer = await response.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      const imageUrl = `data:image/jpeg;base64,${base64}`;

      res.json({ imageUrl });
    } catch (error) {
      console.error("Image generation error:", error);
      res.status(500).json({ error: "Internal server error during image generation" });
    }
};
