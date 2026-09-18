/**
 * The header tone contract: one closed domain, one default, one stamp.
 *
 * The family suites prove the two headers CONSUME this; these cases pin what the
 * owner itself promises, so a change here fails once rather than twice in two
 * families that happen to agree today.
 */
import { describe, expect, it } from 'vitest';

import {
  DEFAULT_HEADER_TONE,
  HEADER_TONES,
  headerToneAttributes,
  resolveHeaderTone,
  type HeaderTone,
} from '..';

describe('header tone contract', () => {
  it('declares the union of what the header families admit, with no duplicates', () => {
    expect([...HEADER_TONES].sort()).toEqual([
      'error',
      'info',
      'primary',
      'secondary',
      'success',
      'warning',
    ]);
    expect(new Set(HEADER_TONES).size).toBe(HEADER_TONES.length);
  });

  /**
   * The domains the two families admit are SUBSETS of this one and are deliberately
   * not equal to it: FormHeader has no `error`, and EditHeader's `status.color` has
   * no `primary`. The contract is the union so neither public prop had to widen.
   */
  it('covers the narrower domain of each family slot', () => {
    const formColorVariant: HeaderTone[] = ['primary', 'secondary', 'success', 'warning', 'info'];
    const editColorVariant: HeaderTone[] = [...formColorVariant, 'error'];
    const editStatusColor: HeaderTone[] = ['success', 'warning', 'error', 'info', 'secondary'];
    for (const slot of [formColorVariant, editColorVariant, editStatusColor]) {
      for (const tone of slot) expect(HEADER_TONES).toContain(tone);
    }
    expect(formColorVariant).not.toContain('error');
    expect(editStatusColor).not.toContain('primary');
  });

  it('resolves an absent tone to the one resting default', () => {
    expect(DEFAULT_HEADER_TONE).toBe('secondary');
    expect(resolveHeaderTone(undefined)).toBe('secondary');
    expect(resolveHeaderTone(null)).toBe('secondary');
    for (const tone of HEADER_TONES) expect(resolveHeaderTone(tone)).toBe(tone);
  });

  it('stamps the governed variant attribute and nothing else', () => {
    expect(headerToneAttributes('warning')).toEqual({ 'data-variant': 'warning' });
    expect(headerToneAttributes()).toEqual({ 'data-variant': 'secondary' });
    expect(Object.keys(headerToneAttributes('info'))).toEqual(['data-variant']);
  });

  /**
   * No colour value lives here. The tone is paint, and paint is the skin's: moving
   * the `color-mix(...)` strings into this owner would have relocated the literal
   * out of the family-cut gate's reach without removing it from the product.
   */
  it('carries no colour value of its own', () => {
    const emitted = HEADER_TONES.map((tone) => JSON.stringify(headerToneAttributes(tone))).join('');
    expect(emitted).not.toMatch(/color-mix|#[0-9a-f]{3,8}\b|rgb\(|var\(/iu);
  });
});
