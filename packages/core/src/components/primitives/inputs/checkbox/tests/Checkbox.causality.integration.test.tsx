/**
 * The checkbox family in a real browser: every decision it consumes moves its
 * paint with a negative control, and its geometry, direction and accessibility
 * hold in each first-party vertical.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { AnatomySkeleton } from '@/components/primitives/feedback/skeleton/runtime/anatomy-renderer';
import ModernCheckbox from '../engines/modern';
import { CheckboxGroup } from '../compound/group';
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

const markup = renderToStaticMarkup(
  <div>
    <ModernCheckbox label="Accept terms" description="Required to continue" defaultChecked />
    <ModernCheckbox label="Subscribe" />
    <ModernCheckbox label="Consent" error />
  </div>,
);

const CHECKED = "[data-checked='true']";
const PLAIN = "[data-checked='false'][data-error='false']";
const ERROR = "[data-error='true']";

describeCausality({
  family: 'checkbox',
  markup,
  targets: [
    { id: 'fill', selector: `${CHECKED} [data-part='box']`, property: 'background-color' },
    { id: 'errorFrame', selector: `${ERROR} [data-part='box']`, property: 'border-top-color' },
    { id: 'radius', selector: `${CHECKED} [data-part='box']`, property: 'border-top-left-radius' },
    { id: 'edge', selector: `${PLAIN} [data-part='box']`, property: 'border-top-width' },
    { id: 'size', selector: `${CHECKED} [data-part='box']`, property: 'inline-size' },
    { id: 'labelSize', selector: `${CHECKED} [data-part='label']`, property: 'font-size' },
    { id: 'press', selector: `${PLAIN} [data-part='box']`, property: 'transform', attributes: { 'data-state': 'pressed' }, attributesOn: PLAIN },
    { id: 'ring', selector: `${PLAIN} [data-part='box']`, property: 'outline-width', attributes: { 'data-state': 'focus-visible' }, attributesOn: PLAIN },
    { id: 'duration', selector: `${CHECKED} [data-part='box']`, property: 'transition-duration' },
  ],
  decisions: {
    'palette.seeds': { value: { primary: '#2F6B9A' }, moves: ['fill'], holds: 'size', in: VERTICALS },
    'palette.status-seeds': { value: { error: '#B00020' }, moves: ['errorFrame'], holds: 'fill', in: VERTICALS },
    'shape.radius-scale': { value: 1.2, moves: ['radius'], holds: 'fill', in: VERTICALS },
    'surfaces.border-style': { value: 'none', moves: ['edge'], holds: 'fill', in: VERTICALS },
    // bithire's preset decides `density.mode: compact`, so the retired arm restated
    // the vertical's own stop and moved nothing. `spacious` is stated by no preset.
    'density.mode': { value: 'spacious', moves: ['size'], holds: 'fill', in: VERTICALS },
    'typography.scale': { value: 1.08, moves: ['labelSize'], holds: 'fill', in: VERTICALS },
    // bithire's preset decides `states.emphasis: strong`; `subtle` is stated by no
    // preset, so the arm states a stop rather than repeating one.
    'states.emphasis': { value: 'subtle', moves: ['press'], holds: 'fill', in: VERTICALS },
    'states.focus-style': { value: 'glow', moves: ['ring'], holds: 'fill', in: VERTICALS },
    'motion.dial': { value: { durationScale: 1.35 }, moves: ['duration'], holds: 'fill', in: VERTICALS },
  },
});

/**
 * WO-DER-06 derivation-lane registry (D6-2c-ii-RED, 2026-09-15): under the
 * neutral compile a governed chrome pair can reach a scope with no producer --
 * the menu ink IS the sidebar ink, and the tenant's light ground cascades into
 * the dark block -- so axe reports `color-contrast` in the scopes pinned below.
 * Nothing is lowered: every other serious rule must still be empty, and the
 * contrast debt is pinned by the IDENTITY of every failing node, so this row
 * reddens when the debt spreads, when a node is repaired, and when one node is
 * fixed while another starts failing in its place -- the substitution a count
 * could not see (EVI-02, 2026-09-15).
 *
 * `bithire dark` DRAINED: that scope's dark block now re-derives its own canvas
 * ground instead of inheriting the light body's, so the pair is legible there.
 * Dropped by identity, not waived -- with no entry the scope must measure
 * clean, and a relapse reddens here.
 */
const CONTRAST_DEBT: Readonly<Record<string, AxeDebt>> = {
  'bithire light': {
    'color-contrast': [
      '#checkbox-modern-_R_1_-description',
    ],
  },
  'evnto light': {
    'color-contrast': [
      '#checkbox-modern-_R_1_-description',
    ],
  },
};

describe('checkbox geometry, direction and accessibility in a real browser', () => {
  it('holds the 44px touch floor under a coarse pointer, standalone included', async () => {
    const touch = renderToStaticMarkup(
      <div>
        <ModernCheckbox label="Labelled" />
        <ModernCheckbox aria-label="Standalone" />
      </div>,
    );
    const result = await measureArms({
      vertical: 'bithire',
      markup: touch,
      arms: { base: {} },
      environment: { touch: true },
      targets: [
        { id: 'labelled', selector: "[data-standalone='false']", property: '@rect.height' },
        { id: 'standaloneHeight', selector: "[data-standalone='true']", property: '@rect.height' },
        { id: 'standaloneWidth', selector: "[data-standalone='true']", property: '@rect.width' },
      ],
    });
    for (const value of Object.values(result.base!)) expect(Number(value)).toBeGreaterThanOrEqual(44);
  }, 60_000);

  it('never wraps a label per character in a narrow flex row, and mirrors in RTL', async () => {
    const narrow = renderToStaticMarkup(
      <div style={{ display: 'flex', inlineSize: '120px' }}>
        <ModernCheckbox label="Notifications everywhere" />
      </div>,
    );
    const result = await measureArms({
      vertical: 'bithire',
      markup: narrow,
      arms: { base: {} },
      targets: [
        { id: 'labelWidth', selector: "[data-part='label']", property: '@rect.width' },
        { id: 'ltrBox', selector: "[data-part='box']", property: '@rect.left', dir: 'ltr' },
        { id: 'ltrLabel', selector: "[data-part='label']", property: '@rect.left', dir: 'ltr' },
        { id: 'rtlBox', selector: "[data-part='box']", property: '@rect.left', dir: 'rtl' },
        { id: 'rtlLabel', selector: "[data-part='label']", property: '@rect.left', dir: 'rtl' },
      ],
    });
    const r = result.base!;
    expect(Number(r.labelWidth)).toBeGreaterThan(40);
    expect(Number(r.ltrBox)).toBeLessThan(Number(r.ltrLabel));
    expect(Number(r.rtlBox)).toBeGreaterThan(Number(r.rtlLabel));
  }, 60_000);

  it('builds its loading state from its own anatomy', async () => {
    const loading = renderToStaticMarkup(
      <AnatomySkeleton>
        <ModernCheckbox label="Accept terms" description="Required to continue" />
      </AnatomySkeleton>,
    );
    expect(loading).toContain('data-part="source"');
    expect(loading).toContain('data-part="box"');
  });

  it('audits clean in every gated vertical mode, apart from the pinned contrast debt', async () => {
    const gallery = renderToStaticMarkup(
      <CheckboxGroup engine="modern" options={[{ label: 'One', value: 1 }, { label: 'Two', value: 2, disabled: true }]} defaultValue={[1]} />,
    ) + markup;
    for (const scope of AXE_SCOPES) {
      const findings = seriousFindings(await auditAxe({ ...scope, markup: gallery }));
      const key = `${scope.vertical} ${scope.theme}`;
      expect(axeDebt(findings), key).toEqual(CONTRAST_DEBT[key] ?? {});
    }
  }, 120_000);
});
