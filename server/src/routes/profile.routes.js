import { Router } from 'express';
import { patchCurrentProfile } from '../controllers/profile.controller.js';
import { requireAuth } from '../middleware/auth.js';

const profileRouter = Router();
profileRouter.patch('/me', requireAuth, patchCurrentProfile);

export default profileRouter;
