import {
  deleteOwnedMemory,
  listOwnedMemories,
  updateOwnedMemory,
} from '../services/owner-memory.service.js';

export async function getMemories(request, response) {
  response.json({
    data: await listOwnedMemories(request.user.id, request.supabase),
  });
}

export async function patchMemory(request, response) {
  response.json({
    data: await updateOwnedMemory(
      request.user.id,
      request.params.id,
      request.body,
      request.supabase,
    ),
  });
}

export async function deleteMemory(request, response) {
  await deleteOwnedMemory(request.user.id, request.params.id, request.supabase);
  response.status(204).end();
}
