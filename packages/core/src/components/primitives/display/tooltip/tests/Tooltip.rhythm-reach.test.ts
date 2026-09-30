/**
 * Contract for the tooltip bubble's reach on the rhythm axis: every recipe and
 * density padding is declared at `:root`, so that declaration -- not the skin's
 * `var()` fallback -- is what paints. A bare length there freezes the bubble
 * against the tenant's density decision; the declaration must read the fleet's
 * `--ds-density-effective-scale` with today's length as the unit value, so an
 * unset dial still resolves to that length.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const TOOLTIP_TOKENS = 'src/foundation/tokens/css/presentation/components/tooltip/index.css';
const tokensCss = readFileSync(resolve(process.cwd(), TOOLTIP_TOKENS), 'utf8');

/** The resting length of each padding channel, before the density factor. */
const RESTING: Record<string, string> = {
  'bordered-padding-block': '0.4375rem',
  'bordered-padding-inline': '0.6875rem',
  'minimal-padding-block': '0.3125rem',
  'minimal-padding-inline': '0.5rem',
  'inverse-padding-block': '0.375rem',
  'inverse-padding-inline': '0.625rem',
  'rich-padding-block': '0.6875rem',
  'rich-padding-inline': '0.8125rem',
  'compact-padding-block': '0.25rem',
  'compact-padding-inline': '0.5rem',
  'comfortable-padding-block': '0.4375rem',
  'comfortable-padding-inline': '0.6875rem',
  'spacious-padding-block': '0.6875rem',
  'spacious-padding-inline': '0.875rem',
};

const declaration = (name: string) => {
  const match = new RegExp(`--ds-tooltip-${name}:\\s*([^;]+);`).exec(tokensCss);
  return match?.[1]?.trim();
};

describe('tooltip padding channels -- rhythm reach', () => {
  it.each(Object.entries(RESTING))('--ds-tooltip-%s scales its resting %s by the density dial', (name, length) => {
    expect(declaration(name)).toBe(`calc(${length} * var(--ds-density-effective-scale, 1))`);
  });

  it('declares no bare-length recipe or density padding channel', () => {
    const bare = [
      ...tokensCss.matchAll(
        /--ds-tooltip-(?:bordered|minimal|inverse|rich|compact|comfortable|spacious)-padding-[a-z]+:\s*[0-9.]+rem\s*;/g
      ),
    ].map((m) => m[0]);
    expect(bare).toEqual([]);
  });
});
