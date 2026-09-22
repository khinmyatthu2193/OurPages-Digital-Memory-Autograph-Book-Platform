import { Router } from 'express';
import {
  deleteMemory,
  getMemories,
  patchMemory,
} from '../controllers/memory.controller.js';
import { requireAuth } from '../middleware/auth.js';

const memoryRouter = Router();
memoryRouter.use(requireAuth);
memoryRouter.get('/', getMemories);
memoryRouter.patch('/:id', patchMemory);
memoryRouter.delete('/:id', deleteMemory);

export default memoryRouter;
