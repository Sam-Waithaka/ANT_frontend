import { describe, expect, it } from 'vitest';
import {
  buildEditorialTaxonomy,
  editorialBindingPalette,
  getEditorialBindingTone,
  getEditorialCoverPresentation,
  stableEditorialHash,
} from '../../src/utils/resourceEditorialPresentation';

describe('resourceEditorialPresentation', () => {
  it('returns a stable deterministic hash for the same taxonomy seed', () => {
    expect(stableEditorialHash('Bible Study')).toBe(stableEditorialHash('Bible Study'));
    expect(stableEditorialHash('Bible Study')).toBe(stableEditorialHash('bible study'));
  });

  it('chooses a stable editorial binding tone from the restrained palette', () => {
    const tone = getEditorialBindingTone('Insights');

    expect(editorialBindingPalette).toContain(tone);
    expect(getEditorialBindingTone('Insights')).toEqual(tone);
  });

  it('builds taxonomy hierarchy without inventing missing levels', () => {
    expect(buildEditorialTaxonomy({
      categories: [],
      resourceType: { name: 'Bible Study' },
      series: [],
      title: 'True Security from Proverbs 21',
    })).toEqual([
      { kind: 'resource', label: 'Bible Study' },
      { kind: 'article', label: 'True Security from Proverbs 21' },
    ]);
  });

  it('includes resource type, category, series, and article when all levels exist', () => {
    expect(buildEditorialTaxonomy({
      categories: [{ name: 'Wisdom' }],
      resourceType: { name: 'Bible Study' },
      series: [{ title: 'Book of Proverbs' }],
      title: 'True Security from Proverbs 21',
    })).toEqual([
      { kind: 'resource', label: 'Bible Study' },
      { kind: 'category', label: 'Wisdom' },
      { kind: 'series', label: 'Book of Proverbs' },
      { kind: 'article', label: 'True Security from Proverbs 21' },
    ]);
  });

  it('creates a full cover presentation using resource type as the color identity seed', () => {
    const presentation = getEditorialCoverPresentation({
      categories: [{ name: 'Wisdom' }],
      resourceType: { name: 'Bible Study' },
      series: [{ title: 'Book of Proverbs' }],
      title: 'True Security from Proverbs 21',
    });

    expect(presentation.taxonomy.at(-1)).toEqual({ kind: 'article', label: 'True Security from Proverbs 21' });
    expect(presentation.palette).toEqual(getEditorialBindingTone('Bible Study'));
  });
});
