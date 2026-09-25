import { Router } from 'express';
import { getMemoryBookExport } from '../controllers/export.controller.js';
import { requireAuth } from '../middleware/auth.js';

const exportRouter = Router();
exportRouter.get('/memory-book', requireAuth, getMemoryBookExport);

export default exportRouter;
