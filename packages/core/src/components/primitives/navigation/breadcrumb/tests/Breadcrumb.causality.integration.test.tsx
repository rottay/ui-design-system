/**
 * The breadcrumb family in a real browser: every decision its paint consumes
 * moves a crumb's computed style with a negative control; the trail reads from
 * the inline start in both directions; the kernel's state attributes paint the
 * same hover and focus the platform pseudo-classes do; and no gated vertical
 * mode carries a serious axe finding.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import ModernBreadcrumb from '../engines/modern';
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
  { key: 'home', label: 'Home', href: '/', icon: <span>H</span> },
  { key: 'catalog', label: 'Catalog', href: '/catalog' },
  { key: 'filters', label: 'Filters', onClick: () => undefined },
  { key: 'current', label: 'Current page' },
];

function trail(dir: 'ltr' | 'rtl' = 'ltr'): string {
  return renderToStaticMarkup(
    <div dir={dir} style={{ inlineSize: '32rem' }}>
      <ModernBreadcrumb items={ITEMS} />
    </div>,
  );
}

const markup = `<div id="trail">${trail()}</div>`;

/** rottay and bithire pin the breadcrumb inks through their vertical chrome, so the seed and focus decisions legitimately cannot move them there. */
const SEED_VERTICALS = ['evnto'] as const;
/** bithire also pins the crumb font size, so the scale decision cannot move it there. */
const SIZE_VERTICALS = ['rottay', 'evnto'] as const;

const ROOT = "#trail [data-part='root']";
const LINK = "#trail [data-part='crumb'][data-clickable='true']";
const CURRENT = "#trail [data-part='crumb'][data-current='true']";

describeCausality({
  family: 'breadcrumb',
  markup,
  targets: [
    { id: 'currentWash', selector: CURRENT, property: 'background-color' },
    { id: 'focusRing', selector: LINK, property: 'box-shadow', attributes: { 'data-state': 'focused focus-visible' } },
    { id: 'crumbSize', selector: LINK, property: 'font-size' },
    { id: 'crumbRadius', selector: LINK, property: 'border-top-left-radius' },
    { id: 'crumbHeight', selector: LINK, property: 'min-height' },
    { id: 'rootEdge', selector: ROOT, property: 'border-top-width' },
    { id: 'rootShadow', selector: ROOT, property: 'box-shadow' },
    { id: 'duration', selector: LINK, property: 'transition-duration' },
  ],
  decisions: {
    'palette.seeds': { value: { primary: '#2F6B9A' }, moves: ['currentWash'], holds: 'crumbRadius', in: SEED_VERTICALS },
    'states.focus-style': { value: 'glow', moves: ['focusRing'], holds: 'crumbRadius', in: SEED_VERTICALS },
    'typography.scale': { value: 1.08, moves: ['crumbSize'], holds: 'crumbRadius', in: SIZE_VERTICALS },
    'shape.radius-scale': { value: 1.2, moves: ['crumbRadius'], holds: 'crumbSize', in: VERTICALS },
    'density.mode': { value: 'spacious', moves: ['crumbHeight'], holds: 'crumbRadius', in: VERTICALS },
    'surfaces.border-style': { value: 'none', moves: ['rootEdge'], holds: 'crumbRadius', in: VERTICALS },
    'surfaces.elevation-posture': { value: 'elevated', moves: ['rootShadow'], holds: 'crumbRadius', in: ['evnto'] },
    'motion.dial': { value: { durationScale: 1.35 }, moves: ['duration'], holds: 'crumbRadius', in: ['evnto'] },
  },
});

/**
 * WO-DER-06 derivation-lane registry (D6-2c-ii-RED, 2026-09-15): the chrome
 * pair this family paints on loses its authored half under neutral+preset, so
 * ink and ground come from opposite ends of the ramp. Measured against a
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
 */
const CONTRAST_GAP: Readonly<Record<string, AxeDebt>> = {};

describe('breadcrumb direction, state governance and accessibility', () => {
  it('starts the trail on the reading side in both directions', async () => {
    const result = await measureArms({
      vertical: 'bithire',
      markup: `<div id="ltr">${trail()}</div><div id="rtl">${trail('rtl')}</div>`,
      arms: { base: {} },
      targets: [
        { id: 'ltrFirst', selector: "#ltr [data-part='crumb']", property: '@rect.left' },
        { id: 'ltrCurrent', selector: "#ltr [data-part='crumb'][data-current='true']", property: '@rect.left' },
        { id: 'rtlFirst', selector: "#rtl [data-part='crumb']", property: '@rect.right', dir: 'rtl' },
        { id: 'rtlCurrent', selector: "#rtl [data-part='crumb'][data-current='true']", property: '@rect.right', dir: 'rtl' },
      ],
    });
    const r = result.base!;
    expect(Number(r.ltrFirst)).toBeLessThan(Number(r.ltrCurrent));
    expect(Number(r.rtlFirst)).toBeGreaterThan(Number(r.rtlCurrent));
  }, 60_000);

  it('paints the kernel hover and focus states the same as the platform pseudo-classes would', async () => {
    const result = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {} },
      targets: [
        { id: 'restBg', selector: LINK, property: 'background-color' },
        { id: 'hoverBg', selector: LINK, property: 'background-color', attributes: { 'data-state': 'hovered' } },
        { id: 'restRing', selector: LINK, property: 'box-shadow' },
        { id: 'focusRing', selector: LINK, property: 'box-shadow', attributes: { 'data-state': 'focused focus-visible' } },
        { id: 'restUnderline', selector: `${LINK} [data-part='label']`, property: 'text-decoration-line' },
        { id: 'currentCursor', selector: CURRENT, property: 'cursor' },
      ],
    });
    const r = result.base!;
    expect(r.hoverBg).not.toBe(r.restBg);
    expect(r.focusRing).not.toBe(r.restRing);
    expect(r.restUnderline).toBe('underline');
    expect(r.currentCursor).toBe('default');
  }, 60_000);

  it('audits clean in every gated vertical mode, apart from the pinned contrast gap', async () => {
    for (const scope of AXE_SCOPES) {
      const findings = seriousFindings(await auditAxe({ ...scope, markup }));
      const key = `${scope.vertical} ${scope.theme}`;
      expect(axeDebt(findings), key).toEqual(CONTRAST_GAP[key] ?? {});
    }
  }, 180_000);
});
