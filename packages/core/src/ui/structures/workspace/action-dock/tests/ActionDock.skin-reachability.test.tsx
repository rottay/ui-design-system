/**
 * ActionDock skin reachability + cascade.
 *
 * The dock is NOT portalled, but it is the family whose whole grammar keys on
 * `data-placement` / `data-mode` combinations, so a single-fixture sweep would
 * report three quarters of the file as dead. Every combination the skin names
 * is rendered here.
 *
 * The z-index pin is the point of the file: the base rule carries three
 * attribute selectors and the mode rules carry two, so a mode rule cannot win
 * a property the base rule also sets. Specificity is compared as arithmetic,
 * not through `getComputedStyle`, which this environment patches to prefer
 * inline styles and cannot adjudicate a cascade.
 */

import React from 'react';

import { describe, expect, it } from 'vitest';

import { ActionDock } from '..';
import { ResponsiveContext, type ResponsiveContextValue } from '../../../../../infrastructure/runtime/responsive';
import { renderWithEngine } from '../../../../../tooling/testing/helpers/engine';
import { readSkinRules, unreachableSelectors } from '../../../../../tooling/testing/helpers/skin-reachability';

const DESKTOP: ResponsiveContextValue = {
  hasResolvedViewport: true,
  deviceClass: 'desktop',
  activeBreakpoint: 'lg',
  isPhone: false,
  isTablet: false,
  isDesktop: true,
  pointer: 'fine',
  orientation: 'landscape',
  prefersReducedMotion: false,
  isPhoneOrTablet: false,
  isTabletOrDesktop: true,
  isTouchDevice: false,
  virtualKeyboardInset: 0,
  isVirtualKeyboardOpen: false,
};

const PHONE_KEYBOARD_OPEN: ResponsiveContextValue = {
  ...DESKTOP,
  deviceClass: 'phone',
  activeBreakpoint: 'xs',
  isPhone: true,
  isDesktop: false,
  isTabletOrDesktop: false,
  isPhoneOrTablet: true,
  isTouchDevice: true,
  pointer: 'coarse',
  virtualKeyboardInset: 260,
  isVirtualKeyboardOpen: true,
};

/**
 * Every placement × mode the skin names, plus the collapsed phone posture that
 * is the only state rendering the overflow trigger.
 */
async function renderEveryPosture() {
  const rendered = renderWithEngine(
    <>
      <ResponsiveContext.Provider value={DESKTOP}>
        <ActionDock
          data-testid="dock-bottom-fixed"
          actions={[
            { key: 'reject', label: 'Reject', priority: 'danger' },
            { key: 'note', label: 'Add note' },
            { key: 'advance', label: 'Advance', priority: 'primary' },
          ]}
        />
        <ActionDock data-testid="dock-bottom-sticky" mode="sticky" actions={[{ key: 'a', label: 'A' }]} />
        <ActionDock data-testid="dock-top-fixed" position="top" actions={[{ key: 'b', label: 'B' }]} />
        <ActionDock data-testid="dock-top-sticky" position="top" mode="sticky" actions={[{ key: 'c', label: 'C' }]} />
      </ResponsiveContext.Provider>
      <ResponsiveContext.Provider value={PHONE_KEYBOARD_OPEN}>
        <ActionDock
          data-testid="dock-keyboard"
          actions={[
            { key: 'reject', label: 'Reject', priority: 'danger' },
            { key: 'note', label: 'Add note' },
            { key: 'share', label: 'Share' },
            { key: 'advance', label: 'Advance', priority: 'primary' },
          ]}
        />
      </ResponsiveContext.Provider>
    </>,
    'modern'
  );
  // The engine component resolves its implementation asynchronously, so a
  // synchronous sweep would measure an empty container and report the whole
  // file dead.
  await rendered.findByTestId('dock-keyboard-overflow');
  return rendered;
}

/** `a,b,c` specificity of a compound/descendant selector, ids/classes/types. */
function specificity(selector: string): [number, number, number] {
  const stripped = selector.replace(/::?[a-z-]+(\([^)]*\))?/g, ' ');
  const ids = stripped.match(/#[\w-]+/g)?.length ?? 0;
  const classes =
    (stripped.match(/\.[\w-]+/g)?.length ?? 0) + (stripped.match(/\[[^\]]+\]/g)?.length ?? 0);
  const types = stripped.match(/(^|[\s>+~])[a-z][\w-]*/g)?.length ?? 0;
  return [ids, classes, types];
}

function compare(a: [number, number, number], b: [number, number, number]): number {
  for (let i = 0; i < 3; i += 1) if (a[i] !== b[i]) return a[i] - b[i];
  return 0;
}

describe('ActionDock skin reachability', () => {
  it('every authored selector matches a node the family actually renders', async () => {
    const { container } = await renderEveryPosture();
    expect(
      unreachableSelectors({
        rules: readSkinRules('action-dock'),
        scopes: [container, document],
      })
    ).toEqual([]);
  });

  it('a mode rule outranks the base rule for every property both declare', () => {
    // The dock's z-index is authored twice: once unconditionally and once for
    // the sticky mode. A sticky dock that loses the second declaration stacks
    // in the fixed band, and `--ds-action-dock-sticky-z-index` never resolves.
    const rules = readSkinRules('action-dock');
    const base = rules.filter((rule) => /\[data-placement\]\[data-mode\]$/.test(rule.selector));
    const modes = rules.filter((rule) => /\[data-mode='(fixed|sticky)'\]/.test(rule.selector));
    expect(base).not.toHaveLength(0);
    expect(modes).not.toHaveLength(0);

    for (const mode of modes) {
      for (const root of base) {
        const shared = Object.keys(mode.decls).filter((prop) => prop in root.decls);
        if (shared.length === 0) continue;
        expect(
          compare(specificity(mode.selector), specificity(root.selector)),
          `${mode.selector} must outrank ${root.selector} for ${shared.join(', ')}`
        ).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('the shrink guard names the row item, not the control two levels inside it', async () => {
    // The Dropdown wraps the trigger, so `> .rottay-action-dock__overflow-trigger`
    // matched nothing and the more-actions control could be squeezed by the
    // growing primary. The guard belongs on the Dropdown root.
    const { container, getByTestId } = await renderEveryPosture();
    const trigger = getByTestId('dock-keyboard-overflow');
    expect(trigger.parentElement?.classList.contains('rottay-action-dock__actions')).toBe(false);

    const item = container.querySelector(
      '.rottay-action-dock__actions > .rottay-action-dock__overflow'
    );
    expect(item).not.toBeNull();
    expect(item?.contains(trigger)).toBe(true);
    // The coarse-pointer floor stays on the control itself.
    expect(trigger.classList.contains('rottay-action-dock__overflow-trigger')).toBe(true);
  });
});
