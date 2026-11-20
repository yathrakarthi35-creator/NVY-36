// @vitest-environment node
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../server';

describe('Security Middleware & Rate Limiting', () => {
  it('enforces COOP, CORP, CSP, and omits CORS header for untrusted origins', async () => {
    const app = createApp();
    const res = await request(app)
      .get('/api/health')
      .set('Origin', 'https://malicious-site.example');
    expect(res.status).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
    expect(res.headers['cross-origin-opener-policy']).toBe('same-origin');
    expect(res.headers['cross-origin-resource-policy']).toBe('same-origin');
    expect(res.headers['content-security-policy']).toContain("object-src 'none'");
  });

  it('allows trusted Vercel origin via CORS allowlist', async () => {
    const app = createApp();
    const res = await request(app)
      .get('/api/health')
      .set('Origin', 'https://nvy-36.vercel.app');
    expect(res.headers['access-control-allow-origin']).toBe('https://nvy-36.vercel.app');
  });

  it('returns HTTP 429 when rate limit is exceeded', async () => {
    const app = createApp({ rateLimitMax: 2 });
    expect((await request(app).get('/api/health')).status).toBe(200);
    expect((await request(app).get('/api/health')).status).toBe(200);
    const blocked = await request(app).get('/api/health');
    expect(blocked.status).toBe(429);
    expect(blocked.body.success).toBe(false);
  });
});
