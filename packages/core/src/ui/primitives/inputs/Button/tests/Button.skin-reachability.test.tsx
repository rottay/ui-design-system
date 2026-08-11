/**
 * The modern Button skin must key its root paint on engine-owned anatomy, never
 * on `data-part` — the one hook P-79 lets the CALLER replace.
 *
 * `Button.passthrough-contract.test.tsx` is the authority on the pass-through
 * law and states it as an outcome: modern lets the caller's part win, rustic and
 * classic keep `trigger`. So only the modern skin was exposed, and it was keyed
 * on `[data-part='trigger']` at all 7 of its root rules while 123 production
 * call sites pass a part of their own.
 *
 * The anchor is `[data-variant]` rather than the bare class pair because the
 * swap must be WEIGHT-PRESERVING: (0,3,0) at six selectors and (0,3,1) at the
 * `::before`. Dropping to the class pair costs one unit at all 7, which is a
 * cascade question this environment cannot adjudicate — the reason the repair
 * sat deferred. `data-variant` is written into `anatomyProps`, spread AFTER the
 * caller's props, so no caller reaches it; the first test proves that by
 * measurement rather than by reading the engine.
 *
 * Every fixture is measured on a CLEAN document. `cleanup` runs afterEach TEST,
 * not after each render, so two renders in one test both sit in `document` and a
 * document-scoped reading of the second would be satisfied by the first.
 */
import React from 'react';
import { describe, expect, it } from 'vitest';
import { cleanup, waitFor } from '@testing-library/react';

import ModernButton from '../engines/modern';
import {
  readSkinRules,
  unreachableSelectors,
  STATE_DEPENDENT,
  type SkinRule,
} from '../../../../../tooling/testing/helpers/skin-reachability';
import { renderWithEngine } from '../../../../../tooling/testing/helpers/engine';

const MODERN_SKIN_ROOT = 'src/foundation/tokens/css/runtime/engines/modern/skin';
const RULES = readSkinRules('button', MODERN_SKIN_ROOT);

/** The root rules — the ones that were keyed on the caller-replaceable part. */
const ROOT_ANCHOR = /^(button|a)?\.rottay-button\.rottay-button--modern\[data-variant\]/;
const rootRules = RULES.filter((rule) => ROOT_ANCHOR.test(rule.selector));

/** `unreachableSelectors` never judges a state-dependent selector. */
const evaluable = RULES.filter((rule) => !STATE_DEPENDENT.test(rule.selector));

/** The same rules as they were written before the fix, for the control. */
const partKeyed: SkinRule[] = RULES.map((rule) => ({
  ...rule,
  selector: rule.selector.replace(
    /\.rottay-button\.rottay-button--modern\[data-variant\]/,
    ".rottay-button.rottay-button--modern[data-part='trigger']"
  ),
}));

/** A caller doing everything it is allowed to do, and one thing it is not. */
const HOSTILE = {
  'data-part': 'toolbar-action',
  'data-variant': 'caller-variant',
  'data-size': 'caller-size',
  'data-shape': 'caller-shape',
  className: 'ds-consumer__action rottay-button--fake',
} as const;

async function renderButton(props: Record<string, unknown>) {
  cleanup();
  const { container } = renderWithEngine(
    <ModernButton {...props}>Go</ModernButton>,
    'modern'
  );
  await waitFor(() => expect(container.querySelector('.rottay-button--modern')).not.toBeNull());
  return container;
}

const VARIANTS = [
  'primary', 'secondary', 'default', 'outline', 'dashed', 'ghost', 'text',
  'link', 'danger', 'success', 'warning', 'info', 'ai', 'error', 'gradient',
] as const;
const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

describe('modern Button skin reachability', () => {
  it('declares no trigger-part predicate in any selector', () => {
    // Parsed, never grepped: this file's own prose names the predicate, and a
    // text scan cannot tell a comment from a selector.
    expect(RULES.filter((r) => r.selector.includes("[data-part='trigger']"))).toEqual([]);
    expect(rootRules).toHaveLength(7);
  });

  it('stamps data-variant on every root a caller can produce, and the caller cannot remove it', async () => {
    // The anchor is only sound if it is UNCONDITIONAL. A single absent cell
    // would silently unpaint that button, so the matrix is the control for the
    // claim rather than a reading of `effectiveVariant`.
    const cells: Array<Record<string, unknown>> = [
      {}, { variant: undefined }, { danger: true }, { danger: true, variant: 'ghost' },
      { busy: true }, { disabled: true }, { loading: true }, { block: true },
      { shape: 'circle' }, { icon: <span>i</span> }, { href: '/x' },
      { href: '/x', ...HOSTILE }, { ...HOSTILE },
      ...VARIANTS.map((variant) => ({ variant })),
      ...SIZES.map((size) => ({ size })),
    ];

    for (const cell of cells) {
      const container = await renderButton(cell);
      const root = container.querySelector('.rottay-button.rottay-button--modern');
      const label = JSON.stringify(cell);
      expect(root, label).not.toBeNull();
      expect(root!.getAttribute('data-variant'), label).toBeTruthy();
      // ...and the class pair survives a caller className, which is appended.
      expect(root!.className, label).toContain('rottay-button--modern');
    }
  });

  it('lets the caller keep its part while the engine keeps the anchor', async () => {
    const container = await renderButton({ ...HOSTILE });
    const root = container.querySelector('.rottay-button.rottay-button--modern')!;
    // P-79 is preserved exactly — the caller still names its own part.
    expect(root.getAttribute('data-part')).toBe('toolbar-action');
    // ...and the three engine-owned attributes beat the caller's spread.
    expect(root.getAttribute('data-variant')).toBe('primary');
    expect(root.getAttribute('data-size')).toBe('md');
    expect(root.getAttribute('data-shape')).toBe('default');
    expect(root.className).toContain('ds-consumer__action');
  });

  it('reaches a caller-named button exactly as it reaches an unnamed one', async () => {
    const named = await renderButton({ 'data-part': 'toolbar-action' });
    const namedDead = unreachableSelectors({ rules: RULES, scopes: [named] });

    const plain = await renderButton({});
    expect(
      plain.querySelector('.rottay-button--modern')!.getAttribute('data-part')
    ).toBe('trigger');
    const plainDead = unreachableSelectors({ rules: RULES, scopes: [plain] });

    expect(namedDead).toEqual(plainDead);
    expect(namedDead.length).toBeLessThan(evaluable.length);
  });

  it('loses exactly the 7 root rules again if the predicate ever returns', async () => {
    // The control for the equality above. Stated as a DIFFERENCE of 7 rather
    // than as a total, because one fixture cannot satisfy 127 selectors and a
    // total would drift with every unrelated rule added to the file.
    const named = await renderButton({ 'data-part': 'toolbar-action' });
    const now = unreachableSelectors({ rules: RULES, scopes: [named] });
    const then = unreachableSelectors({ rules: partKeyed, scopes: [named] });

    // THE INSTRUMENT'S BLIND SPOT, named rather than absorbed into the number.
    // Reachability is decided by `querySelector`, which cannot express a
    // pseudo-element, so the `::before` root rule is excluded from BOTH
    // readings and this contract cannot see it move in either direction. Its
    // severance is real and is covered by the header, not by this assertion.
    const rootEvaluable = rootRules.filter((r) => !STATE_DEPENDENT.test(r.selector));
    const pseudo = rootEvaluable.filter((r) => r.selector.includes('::'));
    expect(pseudo).toHaveLength(1);
    expect(then.length - now.length).toBe(rootEvaluable.length - pseudo.length);

    // ...and the same rules DO reach an unnamed button, so the control is
    // measuring the caller's part and not an unrelated fixture gap. Compared by
    // COUNT: the two rule sets print different selector strings by construction,
    // so a set equality here would fail on the rename rather than on reach.
    const plain = await renderButton({});
    expect(unreachableSelectors({ rules: partKeyed, scopes: [plain] })).toHaveLength(
      unreachableSelectors({ rules: RULES, scopes: [plain] }).length
    );
  });

  it('keeps the reduced-transparency suppressor reachable on a named button', async () => {
    // The second-order loss, asserted where it lives: the ONLY declaration of
    // `--ds-button-surface-highlight: none` sits in a root rule, while the
    // `::before` that reads it is keyed on the class pair and survives
    // severance. Keyed on the part, a named button silently ignored
    // `prefers-reduced-transparency: reduce`.
    const suppressor = RULES.find(
      (r) => r.conditions.includes('prefers-reduced-transparency')
        && '--ds-button-surface-highlight' in r.decls
    );
    expect(suppressor?.decls['--ds-button-surface-highlight']).toBe('none');

    const named = await renderButton({ 'data-part': 'toolbar-action' });
    expect(named.querySelector(suppressor!.selector)).not.toBeNull();
  });

  it('mounts its root inside the render container, not through a portal', async () => {
    const container = await renderButton({ 'data-part': 'toolbar-action' });
    expect(container.querySelectorAll('.rottay-button--modern')).toHaveLength(
      document.querySelectorAll('.rottay-button--modern').length
    );
    expect(unreachableSelectors({ rules: RULES, scopes: [container] })).toEqual(
      unreachableSelectors({ rules: RULES, scopes: [container, document] })
    );
  });
});
