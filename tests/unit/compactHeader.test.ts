import { describe, expect, it } from 'vitest';
import { getNextCompactHeaderState } from '../../src/hooks/useCompactHeader';

const next = (current: boolean, scrollTop: number) =>
  getNextCompactHeaderState({
    collapseAfter: 96,
    current,
    expandBefore: 24,
    scrollTop,
  });

describe('compact header hysteresis', () => {
  it('does not collapse before the lower scroll threshold has clearly passed', () => {
    expect(next(false, 24)).toBe(false);
    expect(next(false, 72)).toBe(false);
  });

  it('collapses after the upper scroll threshold', () => {
    expect(next(false, 96)).toBe(true);
    expect(next(false, 140)).toBe(true);
  });

  it('stays collapsed in the middle band to avoid flicker', () => {
    expect(next(true, 72)).toBe(true);
    expect(next(true, 25)).toBe(true);
  });

  it('expands only when the user is genuinely near the top', () => {
    expect(next(true, 24)).toBe(false);
    expect(next(true, 0)).toBe(false);
  });
});
