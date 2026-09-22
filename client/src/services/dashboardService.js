const BASE_URL = '/api';

async function request(path, accessToken, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });
  if (response.status === 204) return null;
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

export const dashboardService = {
  getIdentity: (token) => request('/auth/me', token),
  getMemories: (token) => request('/memories', token),
  updateMemory: (token, id, updates) =>
    request(`/memories/${encodeURIComponent(id)}`, token, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),
  deleteMemory: (token, id) =>
    request(`/memories/${encodeURIComponent(id)}`, token, { method: 'DELETE' }),
  updateProfile: (token, updates) =>
    request('/profile/me', token, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),
};
