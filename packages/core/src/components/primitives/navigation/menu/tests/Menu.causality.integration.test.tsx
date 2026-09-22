/**
 * The menu family in a real browser: every decision its paint consumes moves
 * the rail's computed style with a negative control; the child indent sits on
 * the reading side under RTL; the kernel's state attributes paint the same
 * hover and focus the platform pseudo-classes do; and no gated vertical mode
 * carries a serious axe finding.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import ModernMenu from '../engines/modern';
import {
  AXE_SCOPES,
  FIRST_PARTY_VERTICALS as VERTICALS,
  auditAxe,
  axeDebt,
  type AxeDebt,
  describeCausality,
  measureArms,
  seriousFindings,
} from '@tests/support/family-causality';

const ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: <span>D</span> },
  {
    key: 'settings',
    label: 'Settings',
    children: [
      { key: 'profile', label: 'Profile' },
      { key: 'billing', label: 'Billing', disabled: true },
    ],
  },
  { key: 'g', type: 'group' as const, label: 'Danger zone', children: [{ key: 'delete', label: 'Delete workspace', danger: true }] },
  { key: 'd', type: 'divider' as const },
];

function rail(dir: 'ltr' | 'rtl' = 'ltr', mode: 'vertical' | 'horizontal' = 'vertical'): string {
  return renderToStaticMarkup(
    <div dir={dir} style={{ inlineSize: '20rem' }}>
      <ModernMenu items={ITEMS} mode={mode} selectedKeys={['profile']} openKeys={['settings']} />
    </div>,
  );
}

const markup = `<div id="rail">${rail()}</div><div id="bar">${rail('ltr', 'horizontal')}</div>`;

/** rottay's vertical chrome pins the menu inks (30 `--ds-menu-*` channels at verticalOverride rank), so the seed decisions legitimately cannot move them there. */
const SEED_VERTICALS = ['bithire', 'evnto'] as const;

const ROOT = "#rail [data-part='root']";
const SELECTED = "#rail [data-part='item'][data-selected='true']";
const TOP = "#rail [data-part='item'][data-level='top']";
const DANGER = "#rail [data-part='item'][data-tone='danger']";
const GROUP = "#rail [data-part='group-label']";

describeCausality({
  family: 'menu',
  markup,
  targets: [
    { id: 'selectedInk', selector: SELECTED, property: 'color' },
    { id: 'dangerInk', selector: DANGER, property: 'color' },
    { id: 'focusRing', selector: TOP, property: 'box-shadow', attributes: { 'data-state': 'focused focus-visible' } },
    { id: 'rowSize', selector: TOP, property: 'font-size' },
    { id: 'groupSize', selector: GROUP, property: 'font-size' },
    { id: 'rowRadius', selector: TOP, property: 'border-top-left-radius' },
    { id: 'rowHeight', selector: TOP, property: 'height' },
    { id: 'rootEdge', selector: ROOT, property: 'border-top-width' },
    { id: 'rootShadow', selector: ROOT, property: 'box-shadow' },
    { id: 'duration', selector: TOP, property: 'transition-duration' },
  ],
  decisions: {
    // The selected ink rides the primary on the card in both seed verticals;
    // bithire rejoined when the menu stopped chaining the sidebar tone (N2).
    'palette.seeds': { value: { primary: '#2F6B9A' }, moves: ['selectedInk'], holds: 'rowRadius', in: SEED_VERTICALS },
    'palette.status-seeds': { value: { error: '#B23A48' }, moves: ['dangerInk'], holds: 'rowRadius', in: SEED_VERTICALS },
    'states.focus-style': { value: 'glow', moves: ['focusRing'], holds: 'rowRadius', in: SEED_VERTICALS },
    'typography.scale': { value: 1.08, moves: ['rowSize', 'groupSize'], holds: 'rowRadius', in: VERTICALS },
    'shape.radius-scale': { value: 1.2, moves: ['rowRadius'], holds: 'rowSize', in: VERTICALS },
    'density.mode': { value: 'spacious', moves: ['rowHeight'], holds: 'rowRadius', in: VERTICALS },
    'surfaces.border-style': { value: 'none', moves: ['rootEdge'], holds: 'rowRadius', in: VERTICALS },
    'surfaces.elevation-posture': { value: 'elevated', moves: ['rootShadow'], holds: 'rowRadius', in: ['evnto'] },
    'motion.dial': { value: { durationScale: 1.35 }, moves: ['duration'], holds: 'rowRadius', in: ['evnto'] },
  },
});

/**
 * WO-DER-06 derivation-lane registry (D6-2c-ii-RED, 2026-09-15): the DER-06
 * compile corrected this family's chrome ink to the dark ramp, which exposed a
 * pre-existing mode-blind GROUND underneath it in
 * `presentation/components/card` (the card base stated `--ds-card-bg:
 * var(--ds-color-white)` in the `rottay-components` layer; repaired in
 * 51fd557fc). Measured against a
 * pristine HEAD archive, every scope below audited CLEAN there, so each entry
 * is lot-caused and none is a pre-existing finding. The gap is pinned by axe
 * rule id AND the identity of every failing node: another rule, one more node,
 * a repaired node or a same-count swap reddens the scope, and a scope absent
 * from this map must still audit clean (EVI-02, 2026-09-15).
 *
 * `rottay dark` DRAINED, and its cause was the Card component base rather than
 * this family: `presentation/components/card/index.css` stated `--ds-card-bg:
 * var(--ds-color-white)` mode-lessly in the `rottay-components` layer, which
 * outranks the theme's own `--ds-card-bg: var(--ds-color-bg-elevated)` by layer
 * ORDER, so every ground derived from the card role resolved white under the
 * dark mode's near-white ink. That base now states the mode-aware role and the
 * ground resolves `#182235`. Dropped by identity, not waived: with no entry the
 * scope must measure clean, and a relapse reddens here.
 *
 * `bithire light` and `bithire dark` DRAINED (WO-DER-06 residual N2, DT ruling
 * option A, 2026-09-22): the menu deriver chained its inks and washes to the
 * sidebar tone while its ground stayed the card, so bithire's inverse tone
 * painted `#f5f5f5` rows over the light card (1.04:1) and a `#171717` open
 * trigger over the `#262626` sidebar hover (1.18:1). The colour chain now pairs
 * with the card: rows read `--ds-color-text-secondary`, the open trigger
 * `--ds-color-text-primary` over a 5% primary card wash. Measured after the
 * change: all four scopes here audit `{}`; on the production overlay-edge
 * route axe reads bithire rows 6.55:1 (`#5a5a61` on `#f9fafe`), the open
 * trigger 16.74:1, the selected row 4.87:1, and the-management 10.53 / 16.75
 * / 14.48:1.
 */
const CONTRAST_GAP: Readonly<Record<string, AxeDebt>> = {};

describe('menu direction, state governance and accessibility', () => {
  it('indents child rows on the reading side in both directions', async () => {
    const result = await measureArms({
      vertical: 'bithire',
      markup: `<div id="ltr">${rail('ltr')}</div><div id="rtl">${rail('rtl')}</div>`,
      arms: { base: {} },
      targets: [
        { id: 'ltrChild', selector: "#ltr [data-part='item'][data-level='child']", property: '@rect.left' },
        { id: 'ltrTop', selector: "#ltr [data-part='item'][data-level='top']", property: '@rect.left' },
        { id: 'ltrChildText', selector: "#ltr [data-part='item'][data-level='child'] [data-part='label']", property: '@rect.left' },
        { id: 'rtlChildText', selector: "#rtl [data-part='item'][data-level='child'] [data-part='label']", property: '@rect.right' },
        { id: 'rtlChild', selector: "#rtl [data-part='item'][data-level='child']", property: '@rect.right' },
      ],
    });
    const r = result.base!;
    expect(Number(r.ltrChildText) - Number(r.ltrChild)).toBeGreaterThan(Number(r.ltrTop) - Number(r.ltrChild));
    expect(Number(r.rtlChild) - Number(r.rtlChildText)).toBeGreaterThan(0);
  }, 60_000);

  it('paints the kernel hover and focus states the same as the platform pseudo-classes would', async () => {
    const result = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {} },
      targets: [
        { id: 'restBg', selector: TOP, property: 'background-color' },
        { id: 'hoverBg', selector: TOP, property: 'background-color', attributes: { 'data-state': 'hovered' } },
        { id: 'restRing', selector: TOP, property: 'box-shadow' },
        { id: 'focusRing', selector: TOP, property: 'box-shadow', attributes: { 'data-state': 'focused focus-visible' } },
        { id: 'disabledCursor', selector: TOP, property: 'cursor', attributes: { 'data-state': 'disabled' } },
      ],
    });
    const r = result.base!;
    expect(r.hoverBg).not.toBe(r.restBg);
    expect(r.focusRing).not.toBe(r.restRing);
    expect(r.disabledCursor).toBe('not-allowed');
  }, 60_000);

  it('lays the horizontal menubar out as a row with its current mark on the block end', async () => {
    const result = await measureArms({
      vertical: 'bithire',
      markup,
      arms: { base: {} },
      targets: [
        { id: 'railDirection', selector: ROOT, property: 'flex-direction' },
        { id: 'barDirection', selector: "#bar [data-part='root']", property: 'flex-direction' },
        { id: 'barTop', selector: "#bar [data-part='item'][data-level='top']", property: 'height' },
        { id: 'railTop', selector: TOP, property: 'height' },
      ],
    });
    const r = result.base!;
    expect(r.railDirection).toBe('column');
    expect(r.barDirection).toBe('row');
    expect(r.barTop).not.toBe(r.railTop);
  }, 60_000);

  it('audits clean in every gated vertical mode, apart from the pinned contrast gap', async () => {
    for (const scope of AXE_SCOPES) {
      const findings = seriousFindings(await auditAxe({ ...scope, markup }));
      const key = `${scope.vertical} ${scope.theme}`;
      expect(axeDebt(findings), key).toEqual(CONTRAST_GAP[key] ?? {});
    }
  }, 180_000);
});

/**
 * The menu ink pairs with the card it paints, never with the sidebar tone.
 *
 * bithire's preset states `navigation.sidebar-tone: inverse` (`--ds-sidebar-text`
 * `#f5f5f5`). The menu deriver used to chain its row ink to that root, so a menu
 * over the page's light card painted the inverse rail ink at 1.04:1 (WO-DER-06
 * residual N2). Option A of the DT ruling (2026-09-22) cut every sidebar channel
 * from the menu's colour chain: measured on this tree the row ink resolves to
 * `--ds-color-text-secondary` (`#5A5A61`) while the sidebar ink stays
 * `#f5f5f5`, and the palette seed now moves the selected ink
 * (`rgb(47, 91, 232)` -> `rgb(47, 107, 154)`). This row reddens if a menu ink
 * becomes a sidebar ink again.
 */

describe('menu ink provenance under the neutral compile', () => {
  it('pairs the menu ink with the card on bithire, whose sidebar tone is inverse', async () => {
    const result = await measureArms({
      vertical: 'bithire',
      markup,
      arms: { base: {}, seed: { 'palette.seeds': { primary: '#2F6B9A' } } },
      targets: [
        { id: 'selectedInk', selector: SELECTED, property: 'color' },
        { id: 'menuInk', selector: ROOT, property: '--ds-menu-item-color' },
        { id: 'secondaryInk', selector: ROOT, property: '--ds-color-text-secondary' },
        { id: 'sidebarInk', selector: ROOT, property: '--ds-sidebar-text' },
      ],
    });
    expect(result.base!.menuInk).toBe(result.base!.secondaryInk);
    expect(result.base!.menuInk).not.toBe(result.base!.sidebarInk);
    expect(result.seed!.selectedInk).not.toBe(result.base!.selectedInk);
  }, 120_000);
});
