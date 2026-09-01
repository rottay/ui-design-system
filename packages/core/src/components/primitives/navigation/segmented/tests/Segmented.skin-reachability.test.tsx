/**
 * The modern Segmented skin must key its paint on engine-owned anatomy, never
 * on `data-part` — the one hook P-79 lets the CALLER replace.
 *
 * The engine writes `data-part={caller ?? 'root'}` on the same node that
 * carries the scope classes, so a composer that names the control for its own
 * selectors replaces the predicate every rule in the file is anchored on and
 * silently loses the whole skin. Two shipped structures do exactly that
 * (`view-mode-switcher`, `scope-switcher`), and both retired their own frame
 * paint in writing on the strength of the composition this severs.
 *
 * The contract is an EQUALITY, not a match count: naming the control must not
 * change which rules reach it. That is robust to the rules one fixture
 * legitimately cannot satisfy (other sizes, block mode, at-rule conditions),
 * which a raw "everything reaches" assertion would report as dead paint.
 *
 * Every fixture is measured on a CLEAN document. `cleanup` runs afterEach
 * TEST, not after each render, so two renders inside one test both sit in
 * `document` and a document-scoped reading of the second would be satisfied by
 * the first — which makes the equality vacuous rather than false.
 */
import React from 'react';
import { describe, expect, it } from 'vitest';
import { cleanup, waitFor } from '@testing-library/react';

import ModernSegmented from '../engines/modern';
import { ScopeSwitcher } from '../../../../structures/workspace/scope-switcher';
import { ViewModeSwitcher } from '../../../../structures/workspace/view-mode-switcher';
import {
  readSkinRules,
  unreachableSelectors,
  waitForComposedContent,
  STATE_DEPENDENT,
  type SkinRule,
} from '@tests/support/skin-reachability';
import { renderWithEngine } from '@tests/support/engine';

const MODERN_SKIN_ROOT = 'src/foundation/tokens/css/runtime/engines/modern/skin';
const RULES = readSkinRules('segmented', MODERN_SKIN_ROOT);

/** Every rule in the file is anchored on the scope root; none is bare. */
const SCOPE_ANCHOR = /^\.rottay-segmented(\.rottay-segmented--modern|--modern)/;

/** `unreachableSelectors` never judges a state-dependent selector, so this is
 *  the real denominator for any "how many reach" claim about a static fixture. */
const evaluable = RULES.filter((rule) => !STATE_DEPENDENT.test(rule.selector));

/** The same rules as they were written before the fix, for the control. */
const partKeyed: SkinRule[] = RULES.map((rule) => ({
  ...rule,
  selector: rule.selector.replace(SCOPE_ANCHOR, "$&[data-part='root']"),
}));

const OPTIONS = [
  { value: 'table', label: 'Table', icon: <span>T</span> },
  { value: 'cards', label: 'Cards' },
  { value: 'kanban', label: 'Kanban', disabled: true },
];

/** Renders onto an empty document so `document` holds this fixture alone. The
 *  readiness gate counts the options THIS fixture asked for, never the default
 *  set — an override that shortens the list must not wait for a row that will
 *  never mount. */
async function renderSegmented(props: Record<string, unknown>) {
  cleanup();
  const expected = (props.options as unknown[] | undefined)?.length ?? OPTIONS.length;
  const { container } = renderWithEngine(
    <ModernSegmented options={OPTIONS} value="table" ariaLabel="Fixture" {...props} />,
    'modern'
  );
  await waitForComposedContent(waitFor, container, '[data-part="option"]', expected);
  return container;
}

/** A family render, gated on the COMPOSED primitive — never on the family's
 *  own root, which proves only that `Box` resolved. */
async function renderFamily(node: React.ReactElement, options: number) {
  cleanup();
  const { container } = renderWithEngine(node, 'modern');
  await waitForComposedContent(waitFor, container, '[data-part="option"]', options);
  return container;
}

describe('modern Segmented skin reachability', () => {
  it('declares no root-part predicate in any selector', () => {
    // Parsed, never grepped: this file's own prose names the predicate, and a
    // text scan cannot tell a comment from a selector.
    expect(RULES.filter((r) => r.selector.includes("[data-part='root']"))).toEqual([]);
    expect(RULES.length).toBeGreaterThan(25);
  });

  it('reaches a caller-named control exactly as it reaches an unnamed one', async () => {
    const named = await renderSegmented({ 'data-part': 'switcher' });
    const root = named.querySelector('.rottay-segmented.rottay-segmented--modern');
    expect(root?.getAttribute('data-part')).toBe('switcher');
    const namedDead = unreachableSelectors({ rules: RULES, scopes: [named] });

    const plain = await renderSegmented({});
    expect(
      plain.querySelector('.rottay-segmented.rottay-segmented--modern')?.getAttribute('data-part')
    ).toBe('root');
    const plainDead = unreachableSelectors({ rules: RULES, scopes: [plain] });

    expect(namedDead).toEqual(plainDead);
    expect(namedDead.length).toBeLessThan(evaluable.length);
  });

  it('goes wholly unreachable again if the predicate ever returns', async () => {
    // The control for the equality above: without it that assertion would also
    // hold on a skin that had silently gone back to being part-keyed.
    const named = await renderSegmented({ 'data-part': 'switcher' });
    const dead = unreachableSelectors({ rules: partKeyed, scopes: [named] });
    expect(dead.length).toBe(evaluable.length);

    // ...and the same rules DO reach the unnamed control, so the control is
    // measuring the caller's part and not some unrelated fixture gap.
    const plain = await renderSegmented({});
    expect(
      unreachableSelectors({ rules: partKeyed, scopes: [plain] }).length
    ).toBeLessThan(evaluable.length);
  });

  it('reaches the shipped ScopeSwitcher as it reaches the bare control', async () => {
    const scopes = [
      { key: 'all', label: 'All', count: 12 },
      { key: 'mine', label: 'Mine', count: 3 },
    ];
    const family = await renderFamily(
      <ScopeSwitcher scopes={scopes} activeScope="all" onScopeChange={() => undefined} />,
      scopes.length
    );
    const familyDead = unreachableSelectors({ rules: RULES, scopes: [family] });

    // Same anatomy the family composes: two labelled options, no icon, middle.
    const bare = await renderSegmented({
      options: [
        { value: 'all', label: 'All' },
        { value: 'mine', label: 'Mine' },
      ],
      value: 'all',
      size: 'middle',
    });
    expect(familyDead).toEqual(unreachableSelectors({ rules: RULES, scopes: [bare] }));
  });

  it('reaches the shipped ViewModeSwitcher as it reaches the bare control', async () => {
    const modes = [
      { key: 'table' as const, icon: <span>T</span>, label: 'Table' },
      { key: 'cards' as const, icon: <span>C</span>, label: 'Cards', disabled: true },
    ];
    const family = await renderFamily(
      <ViewModeSwitcher modes={modes} value="table" onChange={() => undefined} />,
      modes.length
    );
    const familyDead = unreachableSelectors({ rules: RULES, scopes: [family] });

    const bare = await renderSegmented({
      options: [
        { value: 'table', label: 'Table', icon: <span>T</span> },
        { value: 'cards', label: 'Cards', icon: <span>C</span>, disabled: true },
      ],
      value: 'table',
      size: 'small',
    });
    expect(familyDead).toEqual(unreachableSelectors({ rules: RULES, scopes: [bare] }));
  });

  it('mounts its root inside the render container, not through a portal', async () => {
    // The portal law, asserted rather than assumed: a container-only scope
    // would undercount if any instance mounted outside it. On a clean document
    // these two readings are the same reading, which is what licenses the
    // numbers above as measurements rather than floors.
    const container = await renderSegmented({ 'data-part': 'switcher' });
    expect(container.querySelectorAll('.rottay-segmented--modern')).toHaveLength(
      document.querySelectorAll('.rottay-segmented--modern').length
    );
    expect(unreachableSelectors({ rules: RULES, scopes: [container] })).toEqual(
      unreachableSelectors({ rules: RULES, scopes: [container, document] })
    );
  });
});
