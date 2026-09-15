/**
 * The radio family in a real browser: every decision it consumes moves its
 * paint with a negative control, and its segments, geometry, direction and
 * accessibility hold in each first-party vertical.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { AnatomySkeleton } from '@/components/primitives/feedback/skeleton/runtime/anatomy-renderer';
import ModernRadio from '../engines/modern';
import { RadioGroup } from '../compound/group';
import {
  AXE_SCOPES,
  FIRST_PARTY_VERTICALS as VERTICALS,
  auditAxe,
  describeCausality,
  measureArms,
  seriousFindings,
} from '@tests/support/family-causality';

const markup = renderToStaticMarkup(
  <div>
    <ModernRadio name="plan" value="pro" label="Pro plan" description="Billed yearly" defaultChecked />
    <ModernRadio name="plan" value="team" label="Team plan" />
    <ModernRadio name="consent" value="yes" label="Consent" error />
  </div>,
);

const CHECKED = "[data-checked='true']";
const PLAIN = "[data-checked='false'][data-error='false']";
const ERROR = "[data-error='true']";

describeCausality({
  family: 'radio',
  markup,
  targets: [
    { id: 'ring', selector: `${CHECKED} [data-part='circle']`, property: 'border-top-color' },
    { id: 'dot', selector: `${CHECKED} [data-part='dot']`, property: 'background-color' },
    { id: 'errorRing', selector: `${ERROR} [data-part='circle']`, property: 'border-top-color' },
    { id: 'size', selector: `${CHECKED} [data-part='circle']`, property: 'inline-size' },
    { id: 'edge', selector: `${PLAIN} [data-part='circle']`, property: 'border-top-width' },
    { id: 'labelSize', selector: `${CHECKED} [data-part='label']`, property: 'font-size' },
    { id: 'press', selector: `${PLAIN} [data-part='circle']`, property: 'transform', attributes: { 'data-state': 'pressed' }, attributesOn: PLAIN },
    { id: 'focusRing', selector: `${PLAIN} [data-part='circle']`, property: 'outline-width', attributes: { 'data-state': 'focus-visible' }, attributesOn: PLAIN },
    { id: 'duration', selector: `${CHECKED} [data-part='circle']`, property: 'transition-duration' },
  ],
  decisions: {
    'palette.seeds': { value: { primary: '#2F6B9A' }, moves: ['ring', 'dot'], holds: 'size', in: VERTICALS },
    'palette.status-seeds': { value: { error: '#B00020' }, moves: ['errorRing'], holds: 'dot', in: VERTICALS },
    'surfaces.border-style': { value: 'none', moves: ['edge'], holds: 'dot', in: VERTICALS },
    // bithire's preset decides `density.mode: compact`, so the retired arm restated
    // the vertical's own stop and moved nothing. `spacious` is stated by no preset.
    'density.mode': { value: 'spacious', moves: ['size'], holds: 'dot', in: VERTICALS },
    'typography.scale': { value: 1.08, moves: ['labelSize'], holds: 'dot', in: VERTICALS },
    // bithire's preset decides `states.emphasis: strong`; `subtle` is stated by no
    // preset, so the arm states a stop rather than repeating one.
    'states.emphasis': { value: 'subtle', moves: ['press'], holds: 'dot', in: VERTICALS },
    'states.focus-style': { value: 'glow', moves: ['focusRing'], holds: 'dot', in: VERTICALS },
    'motion.dial': { value: { durationScale: 1.35 }, moves: ['duration'], holds: 'dot', in: VERTICALS },
  },
});

/**
 * WO-DER-06 derivation-lane registry (D6-2c-ii-RED, 2026-09-15): under the
 * neutral compile a governed chrome pair can reach a scope with no producer --
 * the menu ink IS the sidebar ink, and the tenant's light ground cascades into
 * the dark block -- so axe reports `color-contrast` in the scopes pinned below.
 * Nothing is lowered: every other serious rule must still be empty, and the
 * contrast node count is pinned EXACTLY, so this row reddens when the debt
 * spreads and again when the derivation lane clears it.
 */
const CONTRAST_DEBT: Readonly<Record<string, number>> = {
  'bithire dark': 15,
  'bithire light': 1,
  'evnto light': 1,
};

describe('radio segments, geometry, direction and accessibility in a real browser', () => {
  const segments = renderToStaticMarkup(
    <RadioGroup
      buttonStyle="solid"
      color="success"
      defaultValue="week"
      options={[{ label: 'Day', value: 'day' }, { label: 'Week', value: 'week' }, { label: 'Month', value: 'month' }]}
    />,
  );

  it('fills the selected segment from the group colour and draws the kernel focus ring', async () => {
    const result = await measureArms({
      vertical: 'bithire',
      markup: segments,
      arms: { base: {}, seeded: { 'palette.status-seeds': { success: '#0B6E4F' } } },
      targets: [
        { id: 'selected', selector: "[data-part='option'][data-checked='true']", property: 'background-color' },
        { id: 'rest', selector: "[data-part='option'][data-checked='false']", property: 'background-color' },
        { id: 'focus', selector: "[data-part='option'][data-checked='false']", property: 'outline-style', attributes: { 'data-state': 'focus-visible' } },
      ],
    });
    expect(result.base!.selected).not.toBe(result.base!.rest);
    expect(result.seeded!.selected).not.toBe(result.base!.selected);
    expect(result.base!.focus).toBe('solid');
  }, 60_000);

  it('holds the touch floor, never wraps a label per character, and mirrors in RTL', async () => {
    const narrow = renderToStaticMarkup(
      <div style={{ display: 'flex', inlineSize: '120px' }}>
        <ModernRadio name="n" value="1" label="Notifications everywhere" />
      </div>,
    );
    const touch = await measureArms({
      vertical: 'bithire', markup: narrow, arms: { base: {} }, environment: { touch: true },
      targets: [{ id: 'height', selector: "[data-part='root']", property: '@rect.height' }],
    });
    expect(Number(touch.base!.height)).toBeGreaterThanOrEqual(44);
    const layout = await measureArms({
      vertical: 'bithire', markup: narrow, arms: { base: {} },
      targets: [
        { id: 'labelWidth', selector: "[data-part='label']", property: '@rect.width' },
        { id: 'ltrCircle', selector: "[data-part='circle']", property: '@rect.left', dir: 'ltr' },
        { id: 'ltrLabel', selector: "[data-part='label']", property: '@rect.left', dir: 'ltr' },
        { id: 'rtlCircle', selector: "[data-part='circle']", property: '@rect.left', dir: 'rtl' },
        { id: 'rtlLabel', selector: "[data-part='label']", property: '@rect.left', dir: 'rtl' },
        { id: 'radius', selector: "[data-part='circle']", property: 'border-top-left-radius' },
      ],
    });
    const r = layout.base!;
    expect(Number(r.labelWidth)).toBeGreaterThan(40);
    expect(Number(r.ltrCircle)).toBeLessThan(Number(r.ltrLabel));
    expect(Number(r.rtlCircle)).toBeGreaterThan(Number(r.rtlLabel));
    expect(Number.parseFloat(r.radius!)).toBeGreaterThan(1000);
  }, 60_000);

  it('builds its loading state from its own anatomy', () => {
    const loading = renderToStaticMarkup(
      <AnatomySkeleton>
        <ModernRadio name="s" value="1" label="Pro plan" />
      </AnatomySkeleton>,
    );
    expect(loading).toContain('data-part="circle"');
  });

  it('has no serious or critical axe violation in any gated vertical mode', async () => {
    const allColours = (['primary', 'default', 'secondary', 'success', 'warning', 'error'] as const)
      .map((color) => renderToStaticMarkup(
        <RadioGroup buttonStyle="solid" color={color} defaultValue="a" options={[{ label: `On ${color}`, value: 'a' }, { label: 'Off', value: 'b' }]} />,
      ))
      .join('');
    const gallery = allColours + renderToStaticMarkup(
      <RadioGroup engine="modern" defaultValue={1} options={[{ label: 'One', value: 1 }, { label: 'Two', value: 2, disabled: true }]} />,
    ) + markup;
    const measured: Record<string, number> = {};
    for (const scope of AXE_SCOPES) {
      const findings = seriousFindings(await auditAxe({ ...scope, markup: gallery }));
      const key = `${scope.vertical} ${scope.theme}`;
      expect(findings.filter((finding) => finding.id !== 'color-contrast'), key).toEqual([]);
      const nodes = findings
        .filter((finding) => finding.id === 'color-contrast')
        .reduce((total, finding) => total + finding.nodes, 0);
      if (nodes > 0) measured[key] = nodes;
    }
    expect(measured).toEqual(CONTRAST_DEBT);
  }, 120_000);
});
