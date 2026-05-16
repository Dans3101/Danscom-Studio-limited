import { Request, Response } from 'express';

export const generateImage = async (req: Request, res: Response) => {
    const { prompt, model, guidance, steps } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const modelMap: Record<string, string> = {
        'SDV 1.5': 'runwayml/stable-diffusion-v1-5',
        'SDXL BASE': 'stabilityai/stable-diffusion-xl-base-1.0'
    };

    const modelId = modelMap[model] || 'runwayml/stable-diffusion-v1-5';

    const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;
    if (!HF_API_KEY) {
      return res.status(500).json({ error: "HUGGINGFACE_API_KEY not configured" });
    }

    try {
      const response = await fetch(
        `https://api-inference.huggingface.co/models/${modelId}`,
        {
          headers: { 
            Authorization: `Bearer ${HF_API_KEY}`,
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          method: "POST",
          body: JSON.stringify({ 
            inputs: prompt,
            parameters: {
              guidance_scale: guidance || 7.5,
              num_inference_steps: steps || 50
            },
            options: { wait_for_model: true }
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("HuggingFace API Error Response:", errorText);
        
        // Handle JSON error vs HTML error
        try {
            const errorJson = JSON.parse(errorText);
            return res.status(response.status).json({ 
                error: errorJson.error || `AI Nexus rejected request (${response.status})`
            });
        } catch {
            return res.status(response.status).json({ 
                error: "HuggingFace endpoint is unavailable or overloaded. Please try again in a few seconds."
            });
        }
      }

      const buffer = await response.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      const imageUrl = `data:image/png;base64,${base64}`;

      res.json({ imageUrl });
    } catch (error) {
      console.error("Image generation error:", error);
      res.status(500).json({ error: "Neural link timeout. The image forge is cooling down." });
    }
};
