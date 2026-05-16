import { Router } from 'express';
import { generateImage } from '../controllers/imageController';
import { generateVideo } from '../controllers/videoController';
import { enhancePrompt, generateScript, generateCaptions } from '../controllers/aiController';

const router = Router();

router.get('/health', (req, res) => res.json({ status: 'live', time: new Date().toISOString() }));

router.post('/generate-image', generateImage);
router.post('/generate-video', generateVideo);
router.post('/enhance-prompt', enhancePrompt);
router.post('/generate-script', generateScript);
router.post('/generate-captions', generateCaptions);

export default router;
