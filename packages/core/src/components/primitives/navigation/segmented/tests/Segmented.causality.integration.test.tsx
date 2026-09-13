/**
 * The segmented family in a real browser: every decision it consumes moves its
 * paint with a negative control, a composite that renames its part paints like
 * the bare control, and direction and accessibility hold in each vertical.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { AnatomySkeleton } from '@/components/primitives/feedback/skeleton/runtime/anatomy-renderer';
import ModernSegmented from '../engines/modern';
import {
  AXE_SCOPES,
  FIRST_PARTY_VERTICALS as VERTICALS,
  auditAxe,
  describeCausality,
  measureArms,
  seriousFindings,
} from '@tests/support/family-causality';

const OPTIONS = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
];

const markup = renderToStaticMarkup(
  <ModernSegmented ariaLabel="Period" options={OPTIONS} defaultValue="week" />,
);

const ROOT = "[role='radiogroup']";
const SELECTED = "[data-part='option'][data-selected='true']";
const REST = "[data-part='option'][data-selected='false']";

describeCausality({
  family: 'segmented',
  markup,
  targets: [
    { id: 'trackPadding', selector: ROOT, property: 'padding-top' },
    { id: 'optionRadius', selector: SELECTED, property: 'border-top-left-radius' },
    { id: 'optionHeight', selector: SELECTED, property: 'height' },
    { id: 'optionFont', selector: SELECTED, property: 'font-size' },
    { id: 'selectedWeight', selector: SELECTED, property: 'font-weight' },
    { id: 'hoverBg', selector: REST, property: 'background-color', attributes: { 'data-state': 'hovered' } },
    { id: 'press', selector: REST, property: 'transform', attributes: { 'data-state': 'pressed' } },
    { id: 'focusRing', selector: REST, property: 'box-shadow', attributes: { 'data-state': 'focus-visible' } },
    { id: 'trackDepth', selector: ROOT, property: 'box-shadow', attributes: { 'data-state': 'hovered' } },
  ],
  decisions: {
    'density.mode': { value: 'compact', moves: ['trackPadding'], holds: 'selectedWeight', in: ['rottay', 'evnto'] },
    'shape.radius-scale': { value: 1.2, moves: ['optionRadius'], holds: 'selectedWeight', in: ['rottay', 'evnto'] },
    'shape.control-height': { value: 'tall', moves: ['optionHeight'], holds: 'selectedWeight', in: ['rottay', 'evnto'] },
    'typography.scale': { value: 1.08, moves: ['optionFont'], holds: 'selectedWeight', in: ['rottay', 'evnto'] },
    'typography.role-weights': { value: 'light', moves: ['selectedWeight'], holds: 'optionHeight', in: ['rottay', 'evnto'] },
    'palette.seeds': { value: { primary: '#2F6B9A' }, moves: ['hoverBg'], holds: 'optionHeight', in: ['rottay', 'evnto'] },
    'states.emphasis': { value: 'strong', moves: ['press'], holds: 'optionHeight', in: VERTICALS },
    'states.focus-style': { value: 'glow', moves: ['focusRing'], holds: 'optionHeight', in: VERTICALS },
    'surfaces.elevation-posture': { value: 'elevated', moves: ['trackDepth'], holds: 'optionHeight', in: ['rottay'] },
  },
});

describe('segmented composition, direction and accessibility in a real browser', () => {
  it('paints a control a composite renamed exactly like the bare control', async () => {
    const named = renderToStaticMarkup(
      <ModernSegmented ariaLabel="Period" options={OPTIONS} defaultValue="week" data-part="view-mode" />,
    );
    const targets = [
      { id: 'border', selector: ROOT, property: 'border-top-color' },
      { id: 'padding', selector: ROOT, property: 'padding-top' },
      { id: 'radius', selector: ROOT, property: 'border-top-left-radius' },
      { id: 'selected', selector: SELECTED, property: 'background-color' },
    ];
    for (const vertical of VERTICALS) {
      const bare = await measureArms({ vertical, markup, arms: { base: {} }, targets });
      const renamed = await measureArms({ vertical, markup: named, arms: { base: {} }, targets });
      expect(renamed.base, vertical).toEqual(bare.base);
    }
  }, 120_000);

  it('lays the options out from the inline start in both directions', async () => {
    const first = "[data-part='option']:first-child";
    const last = "[data-part='option']:last-child";
    const result = await measureArms({
      vertical: 'bithire',
      markup,
      arms: { base: {} },
      targets: [
        { id: 'ltrFirst', selector: first, property: '@rect.left', dir: 'ltr' },
        { id: 'ltrLast', selector: last, property: '@rect.left', dir: 'ltr' },
        { id: 'rtlFirst', selector: first, property: '@rect.left', dir: 'rtl' },
        { id: 'rtlLast', selector: last, property: '@rect.left', dir: 'rtl' },
      ],
    });
    const r = result.base!;
    expect(Number(r.ltrFirst)).toBeLessThan(Number(r.ltrLast));
    expect(Number(r.rtlFirst)).toBeGreaterThan(Number(r.rtlLast));
  }, 60_000);

  it('builds its loading state from its own anatomy', () => {
    const loading = renderToStaticMarkup(
      <AnatomySkeleton>
        <ModernSegmented ariaLabel="Period" options={OPTIONS} />
      </AnatomySkeleton>,
    );
    expect(loading).toContain('data-part="option"');
  });

  it('has no serious or critical axe violation in any gated vertical mode', async () => {
    const gallery = markup + renderToStaticMarkup(
      <ModernSegmented ariaLabel="View" options={[...OPTIONS, { value: 'year', label: 'Year', disabled: true }]} size="small" block />,
    );
    for (const scope of AXE_SCOPES) {
      expect(seriousFindings(await auditAxe({ ...scope, markup: gallery })), `${scope.vertical} ${scope.theme}`).toEqual([]);
    }
  }, 120_000);
});
