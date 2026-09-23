import {
  createPublicMemory,
  getActivePrompts,
  getPublicBook,
} from '../services/memory.service.js';

export async function getBook(request, response) {
  const data = await getPublicBook(request.params.username);
  response.json({ data });
}

export async function getPrompts(_request, response) {
  response.json({ data: await getActivePrompts() });
}

export async function submitMemory(request, response) {
  const body = {
    ...request.body,
    ...(request.body.isAnonymous === 'true' ? { isAnonymous: true } : {}),
    ...(request.body.isAnonymous === 'false' ? { isAnonymous: false } : {}),
  };
  if (!body.promptId) delete body.promptId;
  const data = await createPublicMemory(
    request.params.username,
    body,
    undefined,
    request.file,
  );
  response.status(201).json({ data });
}
