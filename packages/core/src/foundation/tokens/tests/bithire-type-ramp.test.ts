/**
 * Composite type-ramp emission gate (WO-DES-04).
 *
 * The brand compiler must emit the closed composite type ramp
 * --ds-text-{detail,body,emphasis,title,display} plus the --ds-text-eyebrow
 * variant, each as a `font`-shorthand token AND the four addressable facets
 * (size, weight, line-height, letter-spacing). Values are the design-language.md
 * §2.1 table verbatim; the weight set is 400/600/700 only and eyebrow is the sole
 * uppercase. This is what lets app code bind numeric fontSize/fontWeight literals
 * onto a single named ramp entry instead of hand-picking a size/weight/tracking
 * triple.
 *
 * WO-DER-04 changed HOW the ramp says it, not what it says. The shorthand is
 * expressed on the entry's own facets instead of repeating their literals, so
 * the entry and its facets cannot drift; and size and leading carry
 * `var(--ds-type-scale, 1)`, so the ramp -- the one type surface a tenant's own
 * `typography.scale` could not move -- finally answers to it. At the default
 * scale of 1 every value below computes exactly as it always did.
 */
import { describe, expect, it } from 'vitest';

import { firstPartyFixture, lowerBrandThemeFixture } from "@tests/support/theme-lowering";

const bithireBrandTheme = firstPartyFixture('bithire');

/** design-language §2.1 table — size / line-height / weight / tracking, per entry. */
const RAMP = [
  { name: 'detail', size: '0.75rem', line: '1rem', weight: '400', tracking: '0' },
  { name: 'body', size: '0.875rem', line: '1.25rem', weight: '400', tracking: '0' },
  { name: 'emphasis', size: '1rem', line: '1.5rem', weight: '600', tracking: '0' },
  { name: 'title', size: '1.25rem', line: '1.75rem', weight: '600', tracking: '-0.01em' },
  { name: 'display', size: '2rem', line: '2.25rem', weight: '700', tracking: '-0.02em' },
] as const;

const FAMILY = 'var(--ds-font-family-base)';

/** A §2.1 literal as the ramp now states it: the literal, times the type dial. */
const dialed = (literal: string) => `calc(${literal} * var(--ds-type-scale, 1))`;

describe('bithire brand compiler emits the composite type ramp', () => {
  const { cssVariables } = lowerBrandThemeFixture({
    brandTheme: bithireBrandTheme,
    tenantSlug: 'bithire',
  });

  it('expresses each shorthand on its own facets, never on repeated literals', () => {
    for (const { name } of RAMP) {
      expect(cssVariables[`--ds-text-${name}`]).toBe(
        `var(--ds-text-${name}-weight) var(--ds-text-${name}-size)` +
          `/var(--ds-text-${name}-line-height) ${FAMILY}`,
      );
    }
  });

  it('emits the four addressable facets with the §2.1 values, on the type dial', () => {
    for (const { name, size, line, weight, tracking } of RAMP) {
      expect(cssVariables[`--ds-text-${name}-size`]).toBe(dialed(size));
      expect(cssVariables[`--ds-text-${name}-weight`]).toBe(weight);
      expect(cssVariables[`--ds-text-${name}-line-height`]).toBe(dialed(line));
      expect(cssVariables[`--ds-text-${name}-letter-spacing`]).toBe(tracking);
    }
  });

  it('emits --ds-text-eyebrow at detail size, weight 600, +0.08em, uppercase (the sole uppercase)', () => {
    expect(cssVariables['--ds-text-eyebrow']).toBe(
      `var(--ds-text-eyebrow-weight) var(--ds-text-eyebrow-size)` +
        `/var(--ds-text-eyebrow-line-height) ${FAMILY}`,
    );
    expect(cssVariables['--ds-text-eyebrow-size']).toBe(dialed('0.75rem'));
    expect(cssVariables['--ds-text-eyebrow-weight']).toBe('600');
    expect(cssVariables['--ds-text-eyebrow-line-height']).toBe(dialed('1rem'));
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
