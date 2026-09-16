import { Router } from 'express';
import { getCurrentUser } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.js';

const authRouter = Router();
authRouter.get('/me', requireAuth, getCurrentUser);

export default authRouter;
