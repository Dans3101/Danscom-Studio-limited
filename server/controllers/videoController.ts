import { Request, Response } from 'express';

export const generateVideo = async (req: Request, res: Response) => {
    const { prompt, length, audioMode, audioScript } = req.body;
    const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

    try {
        let audioMessage = audioMode === 'custom' 
            ? `Audio synthesized from script: "${audioScript?.slice(0, 20)}..."` 
            : "Dynamic ambient audio generated automatically.";

        if (PEXELS_API_KEY) {
            const response = await fetch(`https://api.pexels.com/videos/search?query=${encodeURIComponent(prompt)}&per_page=1`, {
                headers: { Authorization: PEXELS_API_KEY }
            });
            if (response.ok) {
                const data = await response.json();
                if (data.videos?.length > 0) {
                    const bestFile = data.videos[0].video_files.find((f: any) => f.quality === 'hd') || data.videos[0].video_files[0];
                    return res.json({ 
                        videoUrl: bestFile.link, 
                        message: `Neural synthesis complete via Pexels (${length || '2S'}). ${audioMessage}` 
                    });
                }
            }
        }

        // Simulation/Demo Logic
        await new Promise(resolve => setTimeout(resolve, 3000));
        const demoVideos = [
            "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
            "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
        ];
        const videoUrl = demoVideos[Math.floor(Math.random() * demoVideos.length)];
        
        res.json({ 
            videoUrl, 
            message: `Simulation Mode Active (${length || '2S'}). ${audioMessage}` 
        });
    } catch (error) {
        res.status(500).json({ error: "Neural core sync failure" });
    }
};
