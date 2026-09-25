import { getOwnedExportBook } from '../services/export.service.js';

export async function getMemoryBookExport(request, response) {
  response.json({
    data: await getOwnedExportBook(request.user.id, request.supabase),
  });
}
