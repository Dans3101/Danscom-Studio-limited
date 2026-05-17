import { Request, Response } from 'express';

export const generateImage = async (req: Request, res: Response) => {
    const { prompt, model, guidance, steps } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const modelMap: Record<string, string> = {
        'SDV 1.5': 'runwayml/stable-diffusion-v1-5',
        'SDXL BASE': 'stabilityai/stable-diffusion-xl-base-1.0',
        'Flux': 'flux',
        'Flux Realism': 'flux-realism',
        'Flux Anime': 'flux-anime',
        'Flux 3D': 'flux-3d',
        'Turbo': 'turbo'
    };

    const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;
    const modelToUse = model || 'Flux';
    const isPollinationsModel = ['Flux', 'Flux Realism', 'Flux Anime', 'Flux 3D', 'Turbo'].includes(modelToUse);
    
    // 1. POLLINATIONS (Fast & Free) - Default or specifically chosen
    if (isPollinationsModel || !HF_API_KEY) {
      try {
        const seed = Math.floor(Math.random() * 1000000);
        const encodedPrompt = encodeURIComponent(prompt);
        const pollinationsModel = modelMap[modelToUse] || 'flux';
        const imageUrl = `https://pollinations.ai/p/${encodedPrompt}?width=1024&height=1024&seed=${seed}&model=${pollinationsModel}&nologo=true`;
        
        return res.json({ 
          imageUrl, 
          message: HF_API_KEY ? `Synergizing via Pollinations ${modelToUse} Core.` : "Neural synthesis powered by Pollinations (Free Tier). Add HUGGINGFACE_API_KEY for HuggingFace specific models." 
        });
      } catch (err) {
        console.error("Pollinations failed:", err);
        if (!HF_API_KEY) return res.status(500).json({ error: "All neural cores offline." });
      }
    }

    const hfModelId = modelMap[modelToUse] || 'runwayml/stable-diffusion-v1-5';

    try {
      const response = await fetch(
        `https://api-inference.huggingface.co/models/${hfModelId}`,
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
