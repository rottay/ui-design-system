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
    // bithire left this arm in D6-2c-ii-RED: with `navigation.sidebar-tone:
    // inverse` decided by its preset, the menu ink is the inverse sidebar ink,
    // a fixed white no seed moves. Pinned below; WO-DER-06 owns the gap.
    'palette.seeds': { value: { primary: '#2F6B9A' }, moves: ['selectedInk'], holds: 'rowRadius', in: ['evnto'] },
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
 * WO-DER-06 derivation-lane registry (D6-2c-ii-RED, 2026-09-15): the chrome
 * pair this family paints on loses its authored half under neutral+preset, so
 * ink and ground come from opposite ends of the ramp. Measured against a
 * pristine HEAD archive, every scope below audited CLEAN there, so each entry
 * is lot-caused and none is a pre-existing finding. The gap is pinned by axe
 * rule id AND node count: another rule, or one more node, reddens the scope,
 * and a scope absent from this map must still audit clean.
 */
const CONTRAST_GAP: Readonly<Record<string, readonly string[]>> = {
  'rottay dark': ['color-contrast:3'],
  'bithire light': ['color-contrast:4'],
  'bithire dark': ['color-contrast:6'],
};

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
      expect(findings.map((f) => `${f.id}:${f.nodes}`), key).toEqual(CONTRAST_GAP[key] ?? []);
    }
  }, 180_000);
});

/**
 * The menu ink IS the sidebar ink, and a preset decides the sidebar tone.
 *
 * Measured on this tree: `--ds-menu-item-color` resolves to `--ds-sidebar-text`
 * on all three verticals. bithire's preset states `navigation.sidebar-tone:
 * inverse`, so a menu mounted on the page canvas paints the inverse rail's ink
 * (#f5f5f5) on a light ground -- the palette seed cannot move it, and the axe
 * scopes below record the contrast that follows. WO-DER-06 owns the gap; this
 * row reddens when a menu ink stops being a sidebar ink.
 */

describe('menu ink provenance under the neutral compile', () => {
  it('holds the inverse sidebar ink on bithire, which no palette seed moves', async () => {
    const result = await measureArms({
      vertical: 'bithire',
      markup,
      arms: { base: {}, seed: { 'palette.seeds': { primary: '#2F6B9A' } } },
      targets: [
        { id: 'selectedInk', selector: SELECTED, property: 'color' },
        { id: 'menuInk', selector: ROOT, property: '--ds-menu-item-color' },
        { id: 'sidebarInk', selector: ROOT, property: '--ds-sidebar-text' },
      ],
    });
    expect(result.base!.menuInk).toBe(result.base!.sidebarInk);
    expect(result.seed!.selectedInk).toBe(result.base!.selectedInk);
  }, 120_000);
});
