// @vitest-environment node
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../server';

describe('NVY AI Express API & Security Hardening', () => {
  const app = createApp();

  it('returns security headers and healthy status on GET /api/health', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-frame-options']).toBe('DENY');
    expect(res.headers['content-security-policy']).toBeTruthy();
    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  it('returns source attribution summing to 100% on GET /api/source-attribution', async () => {
    const res = await request(app).get('/api/source-attribution');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const total = Object.values(res.body.shares as Record<string, number>).reduce((a, b) => a + b, 0);
    expect(total).toBeCloseTo(100, 1);
  });

  it('rejects invalid email and blocks mass-assignment on POST /api/alerts/subscribe', async () => {
    const bad = await request(app)
      .post('/api/alerts/subscribe')
      .send({ emailAddress: 'not-an-email' });
    expect(bad.status).toBe(400);

    const good = await request(app)
      .post('/api/alerts/subscribe')
      .send({ emailAddress: 'valid@example.com', aqiThreshold: 250, adminRole: true });
    expect(good.status).toBe(200);
    expect(good.body.subscription.aqiThreshold).toBe(250);
    expect(good.body.subscription.adminRole).toBeUndefined();
  });

  it('escapes HTML injection payloads in POST /api/alerts/send-test', async () => {
    const res = await request(app)
      .post('/api/alerts/send-test')
      .send({ stationName: '<img src=x onerror=alert(1)>Rohini', aqi: 410 });
    expect(res.status).toBe(200);
    expect(res.body.dispatchedAlert.emailHtmlBody).not.toContain('<img');
  });
});
