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
    
    // Fallback to Pollinations.ai if HF is missing or explicitly for free tier seekers
    const usePollinations = !HF_API_KEY;

    if (usePollinations) {
      try {
        // Pollinations.ai is a fantastic free resource that needs no key
        const seed = Math.floor(Math.random() * 1000000);
        const encodedPrompt = encodeURIComponent(prompt);
        const imageUrl = `https://pollinations.ai/p/${encodedPrompt}?width=1024&height=1024&seed=${seed}&nologo=true`;
        
        // We return immediately for the free tier experience
        return res.json({ 
          imageUrl, 
          message: "Neural synthesis powered by Pollinations (Free Tier). Add HUGGINGFACE_API_KEY for custom models." 
        });
      } catch (err) {
        console.error("Pollinations fallback failed:", err);
      }
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
        
        // On HF failure, try Pollinations as a last resort before erroring
        const seed = Math.floor(Math.random() * 1000000);
        const imageUrl = `https://pollinations.ai/p/${encodeURIComponent(prompt)}?width=1024&height=1024&seed=${seed}&nologo=true`;
        
        return res.json({ 
            imageUrl, 
            message: "HuggingFace is congested. Diverting to Pollinations Neural Core." 
        });
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
