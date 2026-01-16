import {Router} from 'express';
import { askGemini } from '../controllers/chatController';

const router = Router()

router.post('/message', askGemini)

export default router;