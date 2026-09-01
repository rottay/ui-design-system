/**
 * Tag skin reachability under a caller `data-part` (WO-CRA-23, primitives tier).
 *
 * `tag.css` keys its root rules on `[data-part='root']` and all three Tag
 * engines let a caller's `data-part` REPLACE that default (P-79). Three shipped
 * call sites pass one — `list-toolbar` (`filter-chip`), `TagInput`
 * (`tag-chip`), `active-filters-bar` (`chip`) — and each does so precisely to
 * target the chip from its own skin, having retired its hand-rolled chrome on
 * the stated ground that the primitive owns the paint.
 *
 * This test does not count roots and does not read the CSS for a substring: it
 * runs each rule's FULL selector through `querySelectorAll` against the
 * rendered tree, in both arms. A `[data-part]` predicate against a composed
 * primitive is settled only by rendering.
 *
 * Tag is the only primitive in the tier severing under two engines, and the
 * two engines do not share a scope class — modern stamps `rottay-tag-shell`,
 * rustic stamps `rottay-tag` — so the arms are measured per engine by name.
 */
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import { readSkinRules } from '@tests/support/skin-reachability';
import ModernTag from '../engines/modern';
import RusticTag from '../engines/rustic';

const MODERN_SKIN_ROOT = 'src/foundation/tokens/css/runtime/engines/modern/skin';
const RUSTIC_SKIN_ROOT = 'src/foundation/tokens/css/runtime/engines/rustic/skin';

/** The part values the three shipped call sites actually pass. */
const CALLER_PARTS = ['filter-chip', 'tag-chip', 'chip'] as const;

/** Rules whose subject compound demands the engine's own `[data-part='root']`. */
function rootKeyedRules(root: string) {
  return readSkinRules('tag', root).filter((r) => r.selector.includes("[data-part='root']"));
}

/**
 * Selectors that DO match the rendered tree.
 *
 * The complement of `unreachableSelectors` is not the reachable set: that
 * helper deliberately skips state-dependent rules (`:hover`, `:focus-visible`)
 * because a resting fixture cannot reach them, so `dead.length` never equals
 * `rules.length` and an assertion written that way fails on a true finding.
 * The claim worth making is a set difference between two arms of one render.
 */
function reachable(rules: readonly { selector: string }[], scope: ParentNode): string[] {
  return rules
    .filter((r) => {
      try {
        return scope.querySelector(r.selector) !== null;
      } catch {
        return false; // an unparseable selector is an environment limit, not dead paint
      }
    })
    .map((r) => r.selector);
}

describe('Tag skin reachability under a caller data-part', () => {
  it('modern: the root-keyed skin is reachable when the caller passes no part', () => {
    const { container } = render(<ModernTag>chip</ModernTag>);
    const rules = rootKeyedRules(MODERN_SKIN_ROOT);

    // Control: the corpus is non-empty. A reachability test over zero rules
    // passes unconditionally and proves nothing.
    expect(rules.length).toBeGreaterThan(20);
    expect(reachable(rules, container).length).toBeGreaterThan(0);
  });

  it.each(CALLER_PARTS)('modern: a caller data-part="%s" severs every reachable root-keyed rule', (part) => {
    const rules = rootKeyedRules(MODERN_SKIN_ROOT);

    const bare = render(<ModernTag>chip</ModernTag>);
    const before = reachable(rules, bare.container);
    bare.unmount();

    const named = render(<ModernTag data-part={part}>chip</ModernTag>);
    const after = reachable(rules, named.container);

    expect(before.length).toBeGreaterThan(0);
    expect(after).toEqual([]);
  });

  it('rustic: the same severance, against a DIFFERENT scope class', () => {
    const rules = rootKeyedRules(RUSTIC_SKIN_ROOT);
    expect(rules.length).toBeGreaterThan(10);

    const bare = render(<RusticTag>chip</RusticTag>);
    const before = reachable(rules, bare.container);
    bare.unmount();

    const named = render(<RusticTag data-part="chip">chip</RusticTag>);
    const after = reachable(rules, named.container);

    expect(before.length).toBeGreaterThan(0);
    expect(after).toEqual([]);
  });

  it('the two engines do not share a scope class, so one repair cannot key on one class', () => {
    const modern = render(<ModernTag>chip</ModernTag>);
    const modernRoot = modern.container.firstElementChild as HTMLElement;
    expect(Array.from(modernRoot.classList)).toContain('rottay-tag-shell');
    modern.unmount();

    const rustic = render(<RusticTag>chip</RusticTag>);
    const rusticRoot = rustic.container.firstElementChild as HTMLElement;
    expect(Array.from(rusticRoot.classList)).toContain('rottay-tag');
    expect(Array.from(rusticRoot.classList)).not.toContain('rottay-tag-shell');
  });

  it('assistant passes data-part="root", which is the default and severs nothing', () => {
    const rules = rootKeyedRules(MODERN_SKIN_ROOT);

    const bare = render(<ModernTag>chip</ModernTag>);
    const before = reachable(rules, bare.container);
    bare.unmount();

    // The fourth call site in the census. Passing the default value back is a
    // no-op, so 3 of the 4 sites sever, not 4 — the count is a floor only until
    // the values are read.
    const named = render(<ModernTag data-part="root">chip</ModernTag>);
    expect(reachable(rules, named.container)).toEqual(before);
  });
});
