const BASE_URL = '/api/public';
async function request(path, options) {
  const response = await fetch(`${BASE_URL}${path}`, options);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error?.message || 'Something went wrong. Please try again.');
  return payload.data;
}
export const publicBookService = {
  getBook: (username) => request(`/${encodeURIComponent(username)}`),
  getPrompts: () => request('/prompts'),
  submitMemory: (username, memory) => request(`/${encodeURIComponent(username)}/memories`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(memory) }),
};
