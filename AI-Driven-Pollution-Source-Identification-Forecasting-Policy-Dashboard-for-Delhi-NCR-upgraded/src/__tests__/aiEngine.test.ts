import { describe, it, expect } from 'vitest';
import {
  runSourceAttributionEngine,
  runForecastEngine,
  runPolicyEngine,
  runAdvisoryEngine,
  runExposureEngine,
  runCadrEngine,
  runInstitutionalEngine,
  generatePolicyBriefingReport,
  composeEmergencyAlert,
  generateVoiceScript,
  runChatEngine,
  clampNumber,
  sanitizeString,
} from '../../server/ai-engine';

describe('NVY AI Deterministic Reasoning Engine', () => {
  it('produces non-negative source shares summing to 100%', () => {
    const result = runSourceAttributionEngine({ pm25: 240, pm10: 380, no2: 95, so2: 40, co: 3.1 });
    const values = Object.values(result.shares);
    expect(values.every((v) => v >= 0)).toBe(true);
    const total = values.reduce((acc, v) => acc + v, 0);
    expect(total).toBeCloseTo(100, 1);
    expect(result.dominantSource).toBeTruthy();
  });

  it('forecasts 24h/48h/72h AQI bounded within valid range', () => {
    const fc = runForecastEngine({ stationName: 'Anand Vihar', currentAqi: 380, windSpeedKmh: 3.5 });
    expect(fc.success).toBe(true);
    expect(fc.horizons.h24).toBeGreaterThanOrEqual(15);
    expect(fc.horizons.h24).toBeLessThanOrEqual(500);
    expect(fc.grapProjection.stage).toMatch(/GRAP/);
  });

  it('reduces projected AQI monotonically when policy sliders increase', () => {
    const low = runPolicyEngine({ baseAqi: 400, sliders: { traffic: 10, stubble: 10, industry: 10, construction: 10, trucks: 10 } });
    const high = runPolicyEngine({ baseAqi: 400, sliders: { traffic: 90, stubble: 90, industry: 90, construction: 90, trucks: 90 } });
    expect(high.projectedAqi).toBeLessThan(low.projectedAqi);
    expect(high.aqiDrop).toBeGreaterThan(low.aqiDrop);
  });

  it('prioritizes vulnerable patients in clinical advisories', () => {
    const adv = runAdvisoryEngine({ aqi: 360, stationName: 'Rohini', hasAsthmaOrCardiac: true });
    expect(adv.riskLevel).toBe('VERY_POOR');
    expect(adv.recommendations[0]).toMatch(/inhaler|physician/i);
  });

  it('models massive PM2.5 reduction when wearing an N95 mask', () => {
    const unmasked = runExposureEngine({ aqi: 350, durationMinutes: 60, mode: 'two_wheeler', maskType: 'none' });
    const masked = runExposureEngine({ aqi: 350, durationMinutes: 60, mode: 'two_wheeler', maskType: 'n95' });
    expect(masked.inhaledPm25Ug).toBeLessThan(unmasked.inhaledPm25Ug * 0.15);
  });

  it('calculates room CADR requirements and indoor AQI drop', () => {
    const cadr = runCadrEngine({ roomAreaSqFt: 250, ceilingHeightFt: 10, outdoorAqi: 400, purifierCadrM3h: 400 });
    expect(cadr.roomVolumeM3).toBeGreaterThan(0);
    expect(cadr.estimatedIndoorAqi).toBeLessThan(400);
  });

  it('generates institutional circulars, briefings, alerts, bilingual scripts, and chat responses', () => {
    expect(runInstitutionalEngine({ aqi: 420 }).directives.length).toBeGreaterThanOrEqual(3);
    expect(generatePolicyBriefingReport({ baseAqi: 350 }).success).toBe(true);
    expect(composeEmergencyAlert({ stationName: 'Dwarka', aqi: 430 }).smsText).toContain('Dwarka');
    expect(generateVoiceScript({ language: 'hi', aqi: 350 }).script).toContain('नमस्ते');
    expect(runChatEngine({ message: 'Show policy impact' }).intent).toBe('policy');
    expect(runChatEngine({ message: 'What is tomorrow forecast?' }).intent).toBe('forecast');
  });

  it('sanitizes strings and clamps invalid numbers safely', () => {
    expect(clampNumber(Number.NaN, 0, 100, 50)).toBe(50);
    expect(clampNumber(999, 0, 100, 50)).toBe(100);
    expect(sanitizeString('<script>alert(1)</script>Delhi', 'fallback')).not.toContain('<');
  });
});
