/**
 * The tabs family in a real browser: every decision its paint consumes moves
 * a destination's computed style with a negative control; the first tab sits
 * on the reading side under RTL; the kernel's state attributes paint the same
 * hover and focus the platform pseudo-classes do; and no gated vertical mode
 * carries a serious axe finding.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import ModernTabs from '../engines/modern';
import {
  AXE_SCOPES,
  FIRST_PARTY_VERTICALS as VERTICALS,
  auditAxe,
  describeCausality,
  measureArms,
  seriousFindings,
} from '@tests/support/family-causality';

const ITEMS = [
  { key: 'overview', label: 'Overview', children: 'Overview body' },
  { key: 'details', label: 'Details 4', icon: <span>i</span>, children: 'Details body' },
  { key: 'billing', label: 'Billing', disabled: true, children: 'Billing body' },
];

function tabs(type: 'line' | 'contained' | 'pills', dir: 'ltr' | 'rtl' = 'ltr'): string {
  return renderToStaticMarkup(
    <div dir={dir} style={{ inlineSize: '28rem' }}>
      <ModernTabs items={ITEMS} type={type} defaultActiveKey="overview" panelVariant="contained" />
    </div>,
  );
}

const markup = `<div id="line">${tabs('line')}</div><div id="contained">${tabs('contained')}</div><div id="pills">${tabs('pills')}</div>`;

/** rottay and bithire pin the tabs inks and ring through their vertical chrome, so the seed and focus decisions legitimately cannot move them there. */
const SEED_VERTICALS = ['evnto'] as const;
/** bithire also pins the tabs size steps (heights, paddings, font sizes), so the scale and density decisions cannot move them there. */
const SIZE_VERTICALS = ['rottay', 'evnto'] as const;

const IDLE = "#line [data-part='tab-button'][data-selected='false']:not([data-state])";
const LIST = "#line [data-part='tab-list']";
const PILL = "#pills [data-part='tab-button'][data-selected='true']";
const PANEL = "#contained [data-part='tab-panel']";

describeCausality({
  family: 'tabs',
  markup,
  targets: [
    { id: 'pillInk', selector: PILL, property: 'background-color' },
    { id: 'focusRing', selector: IDLE, property: 'box-shadow', attributes: { 'data-state': 'focused focus-visible' } },
    { id: 'tabSize', selector: IDLE, property: 'font-size' },
    { id: 'tabRadius', selector: IDLE, property: 'border-top-left-radius' },
    { id: 'tabHeight', selector: IDLE, property: 'height' },
    { id: 'listEdge', selector: LIST, property: 'border-bottom-width' },
    { id: 'panelShadow', selector: PANEL, property: 'box-shadow' },
    // The recipe settles to its final state without a motion provider, which
    // the skin honours by switching transitions off; the probe lifts that
    // attribute so the dial's cadence is what gets read.
    { id: 'duration', selector: IDLE, property: 'transition-duration', attributes: { 'data-motion-final': 'false' }, attributesOn: "#line [data-part='root']" },
  ],
  decisions: {
    'palette.seeds': { value: { primary: '#2F6B9A' }, moves: ['pillInk'], holds: 'tabRadius', in: SEED_VERTICALS },
    'states.focus-style': { value: 'glow', moves: ['focusRing'], holds: 'tabRadius', in: SEED_VERTICALS },
    'typography.scale': { value: 1.08, moves: ['tabSize'], holds: 'tabRadius', in: SIZE_VERTICALS },
    'shape.radius-scale': { value: 1.2, moves: ['tabRadius'], holds: 'tabSize', in: VERTICALS },
    'density.mode': { value: 'compact', moves: ['tabHeight'], holds: 'tabRadius', in: SIZE_VERTICALS },
    'surfaces.border-style': { value: 'none', moves: ['listEdge'], holds: 'tabRadius', in: VERTICALS },
    'surfaces.elevation-posture': { value: 'elevated', moves: ['panelShadow'], holds: 'tabRadius', in: ['evnto'] },
    'motion.dial': { value: { durationScale: 1.35 }, moves: ['duration'], holds: 'tabRadius', in: ['evnto'] },
  },
});

describe('tabs direction, state governance and accessibility', () => {
  it('lays the first destination on the reading side in both directions', async () => {
    const result = await measureArms({
      vertical: 'bithire',
      markup: `<div id="ltr">${tabs('line')}</div><div id="rtl">${tabs('line', 'rtl')}</div>`,
      arms: { base: {} },
      targets: [
        { id: 'ltrFirst', selector: "#ltr [data-part='tab-button']", property: '@rect.left' },
        { id: 'ltrList', selector: "#ltr [data-part='tab-list']", property: '@rect.left' },
        { id: 'ltrListRight', selector: "#ltr [data-part='tab-list']", property: '@rect.right' },
        { id: 'rtlFirst', selector: "#rtl [data-part='tab-button']", property: '@rect.right', dir: 'rtl' },
        { id: 'rtlList', selector: "#rtl [data-part='tab-list']", property: '@rect.right', dir: 'rtl' },
        { id: 'rtlListLeft', selector: "#rtl [data-part='tab-list']", property: '@rect.left', dir: 'rtl' },
      ],
    });
    const r = result.base!;
    const ltrGap = Number(r.ltrFirst) - Number(r.ltrList);
    const rtlGap = Number(r.rtlList) - Number(r.rtlFirst);
    expect(ltrGap).toBeLessThan((Number(r.ltrListRight) - Number(r.ltrList)) / 2);
    expect(rtlGap).toBeLessThan((Number(r.rtlList) - Number(r.rtlListLeft)) / 2);
  }, 60_000);

  it('paints the kernel hover and focus states the same as the platform pseudo-classes would', async () => {
    const result = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {} },
      targets: [
        { id: 'restInk', selector: IDLE, property: 'color' },
        { id: 'hoverInk', selector: IDLE, property: 'color', attributes: { 'data-state': 'hovered' } },
        { id: 'restRing', selector: IDLE, property: 'box-shadow' },
        { id: 'focusRing', selector: IDLE, property: 'box-shadow', attributes: { 'data-state': 'focused focus-visible' } },
        { id: 'disabledCursor', selector: "#line [data-part='tab-button'][data-state~='disabled']", property: 'cursor' },
        { id: 'pressedTransform', selector: IDLE, property: 'transform', attributes: { 'data-state': 'pressed' } },
      ],
    });
    const r = result.base!;
    expect(r.hoverInk).not.toBe(r.restInk);
    expect(r.focusRing).not.toBe(r.restRing);
    expect(r.disabledCursor).toBe('not-allowed');
    expect(r.pressedTransform).not.toBe('none');
  }, 60_000);

  it('keys its trays on the public variant so the line and card aliases paint like underline and contained', async () => {
    const result = await measureArms({
      vertical: 'bithire',
      markup: `<div id="line">${tabs('line')}</div><div id="contained">${tabs('contained')}</div>`,
      arms: { base: {} },
      targets: [
        { id: 'lineEdge', selector: "#line [data-part='tab-list']", property: 'border-bottom-width' },
        { id: 'containedEdge', selector: "#contained [data-part='tab-list']", property: 'border-top-width' },
        { id: 'containedRadius', selector: "#contained [data-part='tab-list']", property: 'border-top-left-radius' },
      ],
    });
    const r = result.base!;
    expect(r.lineEdge).not.toBe('0px');
    expect(r.containedEdge).not.toBe('0px');
    expect(r.containedRadius).not.toBe('0px');
  }, 60_000);

  it('has no serious or critical axe violation in any gated vertical mode', async () => {
    for (const scope of AXE_SCOPES) {
      const findings = seriousFindings(await auditAxe({ ...scope, markup }));
      expect(findings, `${scope.vertical} ${scope.theme}`).toEqual([]);
    }
  }, 180_000);
});
