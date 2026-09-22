import { Router } from 'express';
import { getPrompts } from '../controllers/public.controller.js';

const promptRouter = Router();

promptRouter.get('/', getPrompts);

export default promptRouter;
