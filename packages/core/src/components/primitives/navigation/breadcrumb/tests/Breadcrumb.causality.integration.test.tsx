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
    'density.mode': { value: 'compact', moves: ['crumbHeight'], holds: 'crumbRadius', in: VERTICALS },
    'surfaces.border-style': { value: 'none', moves: ['rootEdge'], holds: 'crumbRadius', in: VERTICALS },
    'surfaces.elevation-posture': { value: 'elevated', moves: ['rootShadow'], holds: 'crumbRadius', in: ['evnto'] },
    'motion.dial': { value: { durationScale: 1.35 }, moves: ['duration'], holds: 'crumbRadius', in: ['evnto'] },
  },
});

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

  it('has no serious or critical axe violation in any gated vertical mode', async () => {
    for (const scope of AXE_SCOPES) {
      const findings = seriousFindings(await auditAxe({ ...scope, markup }));
      expect(findings, `${scope.vertical} ${scope.theme}`).toEqual([]);
    }
  }, 180_000);
});
