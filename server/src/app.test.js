import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from './app.js';

describe('API foundation', () => {
  const app = createApp();

  it('reports service health', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'ok',
      service: 'ourpages-api',
    });
  });

  it('returns a JSON 404 for unknown routes', async () => {
    const response = await request(app).get('/api/unknown');

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('NOT_FOUND');
  });

  it('rejects unauthenticated access to the current-user endpoint', async () => {
    const response = await request(app).get('/api/auth/me');
    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('UNAUTHENTICATED');
  });

  it.each([
    ['get', '/api/memories'],
    ['patch', '/api/memories/11111111-1111-4111-8111-111111111111'],
    ['delete', '/api/memories/11111111-1111-4111-8111-111111111111'],
  ])('rejects unauthenticated %s access to %s', async (method, path) => {
    const response = await request(app)[method](path);
    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('UNAUTHENTICATED');
  });
});
