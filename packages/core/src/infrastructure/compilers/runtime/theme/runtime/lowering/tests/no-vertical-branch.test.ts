/**
 * C6.5: static FlatTheme and DB Appearance must compile through ONE semantic
 * channel model, with no vertical-specific compiler branch.
 *
 * A per-vertical branch is the failure mode that makes a "shared" compiler a
 * fiction: bithire gets one derivation, evnto another, and the contract stops
 * describing what a customer can actually author. The property is asserted
 * behaviourally first — the compiler's output must depend on the THEME and not
 * on who is asking — and only then structurally, so a branch that hides behind
 * a lookup table rather than an `if` is still caught by the behavioural half.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';


import { firstPartyFixture, lowerFlatThemeFixture } from "@tests/support/theme-lowering";

const bithireFlatTheme = firstPartyFixture('bithire');
const evntoFlatTheme = firstPartyFixture('evnto');
const rottayFlatTheme = firstPartyFixture('rottay');

const VERTICAL_NAMES = ['bithire', 'evnto', 'rottay', 'platform', 'themanagement'];

describe('the brand compiler has no per-vertical branch', () => {
  it('produces identical channels for one theme under every tenant slug', () => {
    for (const theme of [bithireFlatTheme, evntoFlatTheme, rottayFlatTheme]) {
      const compiled = VERTICAL_NAMES.map((tenantSlug) =>
        lowerFlatThemeFixture({ flatTheme: theme, tenantSlug })
      );
      const [reference, ...rest] = compiled;
      for (const other of rest) {
        expect(other.cssVariables).toEqual(reference.cssVariables);
        expect(other.modeBlocks ?? []).toEqual(reference.modeBlocks ?? []);
      }
    }
  });

  it('swapping two verticals swaps their output exactly', () => {
    // The strongest form of the property: if the compiler knew who bithire was,
    // compiling bithire's theme under evnto's slug could not reproduce, channel
    // for channel, what compiling it under its own slug produces.
    const asBithire = lowerFlatThemeFixture({ flatTheme: bithireFlatTheme, tenantSlug: 'bithire' });
    const asEvnto = lowerFlatThemeFixture({ flatTheme: bithireFlatTheme, tenantSlug: 'evnto' });
    expect(asEvnto.cssVariables).toEqual(asBithire.cssVariables);

    const evntoOwn = lowerFlatThemeFixture({ flatTheme: evntoFlatTheme, tenantSlug: 'evnto' });
    expect(evntoOwn.cssVariables).not.toEqual(asEvnto.cssVariables);
  });

  it('names no vertical in the compiler source', () => {
    const here = dirname(fileURLToPath(import.meta.url));
    const source = readFileSync(join(here, '..', 'index.ts'), 'utf-8');
    // Comments legitimately discuss verticals by name; code must not.
    const code = source
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^\s*\/\/.*$/gm, '');
    const offenders = VERTICAL_NAMES.filter((name) =>
      new RegExp(`['"\`]${name}['"\`]|\\b${name}\\b\\s*[=:]`, 'i').test(code)
    );
    expect(offenders).toEqual([]);
  });
});
