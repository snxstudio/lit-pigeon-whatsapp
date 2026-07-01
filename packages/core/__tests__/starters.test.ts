import { describe, it, expect } from 'vitest';
import { getStarterTemplates, validateTemplate } from '../src/index.js';

describe('getStarterTemplates', () => {
  const starters = getStarterTemplates();

  it('includes welcome, order-update and OTP starters', () => {
    expect(starters.map((s) => s.id).sort()).toEqual(['order_update', 'otp', 'welcome']);
    expect(starters.find((s) => s.id === 'otp')?.template.category).toBe('AUTHENTICATION');
    expect(starters.find((s) => s.id === 'order_update')?.template.category).toBe('UTILITY');
  });

  it('every starter passes validateTemplate', () => {
    for (const starter of starters) {
      const result = validateTemplate(starter.template);
      expect(
        result.valid,
        `${starter.id} should be valid, got: ${result.errors.map((e) => e.rule).join(', ')}`,
      ).toBe(true);
    }
  });

  it('returns a fresh, independently-mutable set each call', () => {
    const a = getStarterTemplates();
    const b = getStarterTemplates();
    expect(a).not.toBe(b);
    expect(a[0].template).not.toBe(b[0].template);
  });
});
