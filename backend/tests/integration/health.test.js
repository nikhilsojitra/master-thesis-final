const request = require('supertest');
const app = require('../../app');

describe('GET /api/health (integration)', () => {
  test('returns 200 and status OK', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('OK');
    expect(res.body.timestamp).toBeDefined();
  });
});