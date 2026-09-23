const BASE_URL = '/api/public';
async function request(path, options) {
  const response = await fetch(`${BASE_URL}${path}`, options);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(
      payload.error?.message || 'Something went wrong. Please try again.',
    );
    error.code = payload.error?.code;
    throw error;
  }
  return payload.data;
}
export const publicBookService = {
  getBook: (username) => request(`/${encodeURIComponent(username)}`),
  getPrompts: () => request('/prompts'),
  submitMemory: (username, memory) => {
    const form = new FormData();
    for (const [key, value] of Object.entries(memory)) {
      if (value !== undefined && value !== null && key !== 'photo') {
        form.append(key, String(value));
      }
    }
    if (memory.photo) form.append('photo', memory.photo);
    return request(`/${encodeURIComponent(username)}/memories`, {
      method: 'POST',
      body: form,
    });
  },
};
