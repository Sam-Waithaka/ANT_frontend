import { describe, expect, it } from 'vitest';
import { formatScriptureVerseSelection } from '../../src/components/portal/writing/editor/scriptureSelection';

describe('formatScriptureVerseSelection', () => {
  it('formats consecutive verses as a range', () => {
    expect(formatScriptureVerseSelection([3, 4, 5])).toBe('3-5');
  });

  it('keeps non-consecutive verses visibly discrete', () => {
    expect(formatScriptureVerseSelection([10, 3, 7])).toBe('3, 7, 10');
  });

  it('compresses each consecutive run within a mixed selection', () => {
    expect(formatScriptureVerseSelection([8, 1, 6, 7, 3])).toBe('1, 3, 6-8');
  });
});
