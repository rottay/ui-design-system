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
  axeDebt,
  type AxeDebt,
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
    { id: 'trackGap', selector: ROOT, property: 'column-gap' },
    { id: 'optionPadding', selector: SELECTED, property: 'padding-left' },
    { id: 'optionGap', selector: SELECTED, property: 'column-gap' },
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
    'density.mode': {
      value: 'spacious',
      moves: ['trackPadding', 'trackGap', 'optionPadding', 'optionGap'],
      holds: 'selectedWeight',
      in: VERTICALS,
    },
    'shape.radius-scale': { value: 1.2, moves: ['optionRadius'], holds: 'selectedWeight', in: ['rottay', 'evnto'] },
    'shape.control-height': { value: 'tall', moves: ['optionHeight'], holds: 'selectedWeight', in: ['rottay', 'evnto'] },
    'typography.scale': { value: 1.08, moves: ['optionFont'], holds: 'selectedWeight', in: ['rottay', 'evnto'] },
    'typography.role-weights': { value: 'light', moves: ['selectedWeight'], holds: 'optionHeight', in: ['rottay', 'evnto'] },
    'palette.seeds': { value: { primary: '#2F6B9A' }, moves: ['hoverBg'], holds: 'optionHeight', in: ['rottay', 'evnto'] },
    'states.emphasis': { value: 'subtle', moves: ['press'], holds: 'optionHeight', in: VERTICALS },
    'states.focus-style': { value: 'glow', moves: ['focusRing'], holds: 'optionHeight', in: VERTICALS },
    'surfaces.elevation-posture': { value: 'elevated', moves: ['trackDepth'], holds: 'optionHeight', in: ['rottay'] },
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
 * `bithire dark` had 5 rows and they DRAINED: that scope's dark block now
 * re-derives its own canvas ground instead of inheriting the light body's, so
 * the unselected option inks are read against the ground they were designed
 * for.
 * Dropped by identity, not waived -- with no entry the scope must measure
 * clean, and a relapse reddens here.
 */
const CONTRAST_GAP: Readonly<Record<string, AxeDebt>> = {
  'bithire light': {
    'color-contrast': [
      'button[data-selected="false"]:nth-child(2) > span',
      'div[data-size="middle"] > button[data-selected="false"]:nth-child(1) > span',
      'div[data-size="middle"] > button[data-selected="false"]:nth-child(3) > span',
      'div[data-size="small"] > button[data-selected="false"]:nth-child(1) > span',
      'div[data-size="small"] > button[data-selected="false"]:nth-child(3) > span',
    ],
  },
  'evnto light': {
    'color-contrast': [
      'button[data-selected="false"]:nth-child(2) > span',
      'div[data-size="middle"] > button[data-selected="false"]:nth-child(1) > span',
      'div[data-size="middle"] > button[data-selected="false"]:nth-child(3) > span',
      'div[data-size="small"] > button[data-selected="false"]:nth-child(1) > span',
      'div[data-size="small"] > button[data-selected="false"]:nth-child(3) > span',
    ],
  },
};

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

  it('audits clean in every gated vertical mode, apart from the pinned contrast gap', async () => {
    const gallery = markup + renderToStaticMarkup(
      <ModernSegmented ariaLabel="View" options={[...OPTIONS, { value: 'year', label: 'Year', disabled: true }]} size="small" block />,
    );
    for (const scope of AXE_SCOPES) {
      const findings = seriousFindings(await auditAxe({ ...scope, markup: gallery }));
      const key = `${scope.vertical} ${scope.theme}`;
      expect(axeDebt(findings), key).toEqual(CONTRAST_GAP[key] ?? {});
    }
  }, 120_000);
});
