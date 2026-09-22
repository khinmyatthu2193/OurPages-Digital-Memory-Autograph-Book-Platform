import { rateLimit } from 'express-rate-limit';
import { Router } from 'express';
import {
  getBook,
  getPrompts,
  submitMemory,
} from '../controllers/public.controller.js';

const publicRouter = Router();
const submissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many submissions; please try again later',
    },
  },
});

publicRouter.get('/prompts', getPrompts);
publicRouter.get('/:username', getBook);
publicRouter.post('/:username/memories', submissionLimiter, submitMemory);

export default publicRouter;
