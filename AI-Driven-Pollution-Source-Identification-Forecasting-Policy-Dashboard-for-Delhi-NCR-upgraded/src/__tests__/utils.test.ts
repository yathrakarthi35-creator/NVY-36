import { describe, it, expect } from 'vitest';
import { cn, getAqiCategory } from '../lib/utils';

describe('Utility & CPCB NAQI Classification', () => {
  it('merges Tailwind classes cleanly with cn()', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
    expect(cn('text-sm', false && 'hidden', 'font-bold')).toBe('text-sm font-bold');
  });

  it('classifies all 6 CPCB India NAQI bands accurately', () => {
    expect(getAqiCategory(30).category).toBe('Good');
    expect(getAqiCategory(80).category).toBe('Satisfactory');
    expect(getAqiCategory(150).category).toBe('Moderate');
    expect(getAqiCategory(260).category).toBe('Poor');
    expect(getAqiCategory(350).category).toBe('Very Poor');
    expect(getAqiCategory(450).category).toBe('Severe');
  });

  it('handles exact boundary thresholds consistently', () => {
    expect(getAqiCategory(50).category).toBe('Good');
    expect(getAqiCategory(51).category).toBe('Satisfactory');
    expect(getAqiCategory(100).category).toBe('Satisfactory');
    expect(getAqiCategory(200).category).toBe('Moderate');
    expect(getAqiCategory(300).category).toBe('Poor');
    expect(getAqiCategory(400).category).toBe('Very Poor');
  });
});
