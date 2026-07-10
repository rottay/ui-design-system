/**
 * Composite type-ramp emission gate (WO-DES-04).
 *
 * The brand compiler must emit the closed composite type ramp
 * --ds-text-{detail,body,emphasis,title,display} plus the --ds-text-eyebrow
 * variant, each as a bare `font`-shorthand token AND the four addressable facets
 * (size, weight, line-height, letter-spacing). Values are the design-language.md
 * §2.1 table verbatim; the weight set is 400/600/700 only and eyebrow is the sole
 * uppercase. This is what lets app code bind numeric fontSize/fontWeight literals
 * onto a single named ramp entry instead of hand-picking a size/weight/tracking
 * triple.
 */
import { describe, expect, it } from 'vitest';

import { compileBrandTheme } from '../../compilers/brand-theme';
import { bithireBrandTheme } from '../ts/brand-themes/bithire/bithire';

/** design-language §2.1 table — size / line-height / weight / tracking, per entry. */
const RAMP = [
  { name: 'detail', size: '0.75rem', line: '1rem', weight: '400', tracking: '0' },
  { name: 'body', size: '0.875rem', line: '1.25rem', weight: '400', tracking: '0' },
  { name: 'emphasis', size: '1rem', line: '1.5rem', weight: '600', tracking: '0' },
  { name: 'title', size: '1.25rem', line: '1.75rem', weight: '600', tracking: '-0.01em' },
  { name: 'display', size: '2rem', line: '2.25rem', weight: '700', tracking: '-0.02em' },
] as const;

const FAMILY = 'var(--ds-font-family-base)';

describe('bithire brand compiler emits the composite type ramp', () => {
  const { cssVariables } = compileBrandTheme({
    brandTheme: bithireBrandTheme,
    tenantSlug: 'bithire',
  });

  it('emits the bare font-shorthand token for each ramp entry', () => {
    for (const { name, size, line, weight } of RAMP) {
      expect(cssVariables[`--ds-text-${name}`]).toBe(`${weight} ${size}/${line} ${FAMILY}`);
    }
  });

  it('emits the four addressable facets with the §2.1 values', () => {
    for (const { name, size, line, weight, tracking } of RAMP) {
      expect(cssVariables[`--ds-text-${name}-size`]).toBe(size);
      expect(cssVariables[`--ds-text-${name}-weight`]).toBe(weight);
      expect(cssVariables[`--ds-text-${name}-line-height`]).toBe(line);
      expect(cssVariables[`--ds-text-${name}-letter-spacing`]).toBe(tracking);
    }
  });

  it('emits --ds-text-eyebrow at detail size, weight 600, +0.08em, uppercase (the sole uppercase)', () => {
    expect(cssVariables['--ds-text-eyebrow']).toBe(`600 0.75rem/1rem ${FAMILY}`);
    expect(cssVariables['--ds-text-eyebrow-size']).toBe('0.75rem');
    expect(cssVariables['--ds-text-eyebrow-weight']).toBe('600');
    expect(cssVariables['--ds-text-eyebrow-line-height']).toBe('1rem');
    expect(cssVariables['--ds-text-eyebrow-letter-spacing']).toBe('0.08em');
    expect(cssVariables['--ds-text-eyebrow-transform']).toBe('uppercase');
  });

  it('uses only the 400/600/700 weight set across the ramp', () => {
    const weights = new Set<string>();
    for (const [key, value] of Object.entries(cssVariables)) {
      if (/^--ds-text-[a-z]+-weight$/.test(key)) weights.add(value);
    }
    expect([...weights].sort()).toEqual(['400', '600', '700']);
  });
});
