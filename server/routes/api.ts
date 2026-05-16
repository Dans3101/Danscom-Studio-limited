import { Router } from 'express';
import { generateImage } from '../controllers/imageController';
import { generateVideo } from '../controllers/videoController';
import { enhancePrompt } from '../controllers/aiController';

const router = Router();

router.get('/health', (req, res) => res.json({ status: 'live', time: new Date().toISOString() }));

router.post('/generate-image', generateImage);
router.post('/generate-video', generateVideo);
router.post('/enhance-prompt', enhancePrompt);

export default router;
