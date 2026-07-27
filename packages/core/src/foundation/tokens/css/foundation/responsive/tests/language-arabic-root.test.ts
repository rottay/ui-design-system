/**
 * Arabic tracking floor — the root case.
 *
 * Arabic is cursive: letters join, and `letter-spacing` pulls the joins apart.
 * Neutralizing tracking is a legibility requirement, not a preference, so it
 * must outrank brand paint. The layered guard could not do that for the one
 * emitter that is not layered -- the tenant artifact -- so a tenant shipping
 * negative display tracking won it back on a wholly-Arabic document.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const CSS_ROOT = 'src/foundation/tokens/css';

const read = (relative: string): string =>
  readFileSync(resolve(process.cwd(), relative), 'utf8');

const layeredGuard = read(`${CSS_ROOT}/foundation/responsive/language-arabic.css`);
const rootGuard = read(`${CSS_ROOT}/foundation/responsive/language-arabic-root.css`);
const bithireBundle = read('styles/bithire.css');

/**
 * CSS with comments removed. Both helpers below must read CODE, not prose --
 * these files DOCUMENT the selectors and the `!important` decision, so matching
 * raw text finds the explanation instead of the rule.
 */
function code(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

/** Tracking tokens zeroed by the first `:lang(ar)` rule. */
function zeroedTokens(css: string): string[] {
  const stripped = code(css);
  const block = stripped.slice(stripped.indexOf('lang(ar)'));
  const body = block.slice(0, block.indexOf('}'));
  return [...body.matchAll(/(--ds-[a-z0-9-]+):\s*0;/g)].map((match) => match[1]).sort();
}

describe('Arabic tracking floor', () => {
  it('mirrors the layered guard exactly, so the two cannot drift', () => {
    // Two copies of one list is a drift risk; this converts it into a failure.
    expect(zeroedTokens(rootGuard)).toEqual(zeroedTokens(layeredGuard));
    expect(zeroedTokens(rootGuard).length).toBeGreaterThan(25);
  });

  it('ships UNLAYERED in the vertical bundle', () => {
    // The whole point. Inside any @layer it would lose to the unlayered
    // artifact no matter its specificity.
    expect(bithireBundle).toContain('html[lang]:lang(ar)');

    const index = bithireBundle.indexOf('html[lang]:lang(ar) {');
    expect(index).toBeGreaterThan(-1);
    // Walk back to the nearest brace-or-at-rule boundary and confirm we are not
    // inside a `@layer` block.
    const preceding = bithireBundle.slice(0, index);
    const lastLayerOpen = preceding.lastIndexOf('@layer');
    if (lastLayerOpen !== -1) {
      const between = preceding.slice(lastLayerOpen);
      const opens = (between.match(/\{/g) ?? []).length;
      const closes = (between.match(/\}/g) ?? []).length;
      expect(opens, 'the root guard must not sit inside an open @layer block').toBeLessThanOrEqual(
        closes,
      );
    }
  });

  it('outranks the tenant artifact selector on specificity', () => {
    // `html[lang]:lang(ar)` = element + attribute + pseudo-class = (0,2,1).
    // The artifact is `:is(html[data-tenant='x'], :where(...))`, and `:is()`
    // takes the specificity of its MOST specific argument, statically = (0,1,1).
    const specificity = (selector: string) => {
      const withoutWhere = selector.replace(/:where\([^)]*\)/g, '');
      const classes = (withoutWhere.match(/\[[^\]]+\]|\.[\w-]+|:(?!is\b)[\w-]+/g) ?? []).length;
      const elements = (withoutWhere.match(/(^|[\s(,])[a-z]+\b/g) ?? []).length;
      return { classes, elements };
    };

    const guard = specificity('html[lang]:lang(ar)');
    const artifact = specificity(
      ":is(html[data-tenant='bithire'], :where([data-ds-root][data-vertical='bithire']))",
    );

    expect(guard.classes).toBeGreaterThan(artifact.classes);
  });

  it('uses no !important, so an application can still override it deliberately', () => {
    // A correctness floor must beat brand paint, not silence every consumer.
    expect(code(rootGuard)).not.toContain('!important');
  });

  it('zeroes the four tokens the bithire artifact actually contests', () => {
    // The measured overlap. If the artifact grows a new tracking channel, the
    // drift test above fails first and forces this list to be revisited.
    for (const token of [
      '--ds-letter-spacing-display',
      '--ds-letter-spacing-heading',
      '--ds-letter-spacing-body',
      '--ds-letter-spacing-mono',
    ]) {
      expect(zeroedTokens(rootGuard)).toContain(token);
    }
  });

  it('matches regional variants, not just the bare tag', () => {
    // `:lang()` matches `ar-SA`/`ar-EG`; `[lang="ar"]` would not.
    expect(code(rootGuard)).toContain(':lang(ar)');
    expect(code(rootGuard)).not.toContain('[lang="ar"]');
  });
});
