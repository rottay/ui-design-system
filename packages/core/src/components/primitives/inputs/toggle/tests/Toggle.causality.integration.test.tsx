/**
 * The toggle family (and Switch, its deprecated name) in a real browser: every
 * decision it consumes moves its paint with a negative control, and its travel,
 * direction, floors and accessibility hold in each first-party vertical.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { AnatomySkeleton } from '@/components/primitives/feedback/skeleton/runtime/anatomy-renderer';
import ModernToggle from '../engines/modern';
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
    <ModernToggle label="Alerts" description="Sent by email" defaultChecked />
    <ModernToggle label="Digest" />
    <ModernToggle label="Terms" error errorMessage="Accept to continue" />
  </div>,
);

const ON = "[data-checked='true'][data-error='false']";
const OFF = "[data-checked='false'][data-error='false']";
const ERROR = "[data-error='true']";

describeCausality({
  family: 'toggle',
  markup,
  targets: [
    { id: 'fill', selector: `${ON} [data-part='track']`, property: 'background-color' },
    { id: 'errorFill', selector: `${ERROR} [data-part='track']`, property: 'background-color' },
    { id: 'hoverFill', selector: `${ON} [data-part='track']`, property: 'background-color', attributes: { 'data-state': 'hovered' }, attributesOn: ON },
    { id: 'press', selector: `${OFF} [data-part='thumb']`, property: 'transform', attributes: { 'data-state': 'pressed' }, attributesOn: OFF },
    { id: 'ring', selector: `${OFF} [data-part='track']`, property: 'outline-width', attributes: { 'data-state': 'focus-visible' }, attributesOn: OFF },
    { id: 'trackRadius', selector: `${ON} [data-part='track']`, property: 'border-top-left-radius' },
    { id: 'thumbRadius', selector: `${ON} [data-part='thumb']`, property: 'border-top-left-radius' },
    { id: 'width', selector: `${ON} [data-part='track']`, property: 'inline-size' },
    { id: 'height', selector: `${ON} [data-part='track']`, property: 'block-size' },
    { id: 'labelSize', selector: `${ON} [data-part='label']`, property: 'font-size' },
    { id: 'thumbDepth', selector: `${ON} [data-part='thumb']`, property: 'box-shadow' },
    { id: 'duration', selector: `${ON} [data-part='thumb']`, property: 'transition-duration' },
  ],
  decisions: {
    'palette.seeds': { value: { primary: '#2F6B9A' }, moves: ['fill'], holds: 'width', in: VERTICALS },
    'palette.status-seeds': { value: { error: '#B00020' }, moves: ['errorFill'], holds: 'fill', in: VERTICALS },
    // bithire's preset decides `states.emphasis: strong`; `subtle` is stated by no
    // preset, so the arm states a stop rather than repeating one.
    // `hoverFill` follows the emphasis on rottay and bithire; evnto's hover tint
    // is pinned inert by the row below, with its measured value.
    'states.emphasis': { value: 'subtle', moves: ['hoverFill', 'press'], holds: 'fill', in: ['rottay', 'bithire'] },
    'states.focus-style': { value: 'glow', moves: ['ring'], holds: 'fill', in: VERTICALS },
    // bithire's preset decides `density.mode: compact`, so the retired arm restated
    // the vertical's own stop and moved nothing. `spacious` is stated by no preset.
    'density.mode': { value: 'spacious', moves: ['width'], holds: 'fill', in: VERTICALS },
    // bithire's preset decides `shape.button-style: sharp`; `pill` is stated by no
    // preset, so the silhouette arm moves rather than restating it.
    'shape.button-style': { value: 'pill', moves: ['trackRadius', 'thumbRadius'], holds: 'height', in: VERTICALS },
    'shape.control-height': { value: 'tall', moves: ['height'], holds: 'fill', in: VERTICALS },
    'typography.scale': { value: 1.08, moves: ['labelSize'], holds: 'fill', in: VERTICALS },
    'surfaces.elevation-posture': { value: 'elevated', moves: ['thumbDepth'], holds: 'fill', in: ['bithire', 'evnto'] },
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
 */
const CONTRAST_DEBT: Readonly<Record<string, AxeDebt>> = {
  'bithire light': {
    'color-contrast': [
      '#toggle-modern-_R_1_-description',
      '#toggle-modern-_R_4_-helper',
      'span[data-part="state-label"]',
    ],
  },
  'bithire dark': {
    'color-contrast': [
      '#toggle-modern-_R_11_-label',
      '#toggle-modern-_R_19_-label',
      '#toggle-modern-_R_1_-description',
      '#toggle-modern-_R_1_-label',
      '#toggle-modern-_R_1h_-label',
      '#toggle-modern-_R_3_-error',
      '#toggle-modern-_R_4_-helper',
      '#toggle-modern-_R_9_-label',
      '#toggle-modern-_R_h_-label',
      '#toggle-modern-_R_p_-label',
      '.ds-toggle-field[data-part="field"]:nth-child(2) > label[data-checked="false"][data-color="primary"][data-disabled="false"] > span[data-part="text"] > span[data-part="label"]',
      'label[data-error="true"] > span[data-part="text"] > span[data-part="label"]',
      'span[data-part="state-label"]',
    ],
  },
  'evnto light': {
    'color-contrast': [
      '#toggle-modern-_R_1_-description',
      '#toggle-modern-_R_3_-error',
      '#toggle-modern-_R_4_-helper',
      'label[data-error="true"] > span[data-part="text"] > span[data-part="label"]',
      'span[data-part="state-label"]',
    ],
  },
};

describe('toggle travel, direction, floors and accessibility in a real browser', () => {
  /**
   * WO-DER-06 derivation-lane registry (D6-2c-ii-RED, 2026-09-15): every preset
   * now STATES a silhouette -- rottay and evnto `soft`, bithire `sharp` -- so
   * "no silhouette is chosen" has no first-party subject left. The corner the
   * switch takes from the stated silhouette is asserted instead, and the pill
   * identity is asserted where it still has a subject: a document that states
   * `pill`. Measured: rottay 8px, bithire 2px, evnto 8px at rest; 9999px on all
   * three under `pill`.
   */
  /**
   * WO-DER-06 derivation-lane registry (D6-2c-ii-RED, 2026-09-15): on evnto the
   * hover tint of the track is the track's own fill, so `states.emphasis` moves
   * the press but not the hover. Measured: fill `rgb(23, 23, 23)` and hoverFill
   * `color(srgb 0.0901961 0.0901961 0.0901961)` -- the same colour -- on every
   * emphasis stop, while rottay and bithire move both. The press half is
   * asserted here at full strength so the arm is not lost for evnto.
   */
  it('registers the hover tint evnto cannot move, and keeps its press', async () => {
    const measured = await measureArms({
      vertical: 'evnto',
      markup,
      arms: { base: {}, subtle: { 'states.emphasis': 'subtle' } },
      targets: [
        { id: 'fill', selector: `${ON} [data-part='track']`, property: 'background-color' },
        { id: 'hoverFill', selector: `${ON} [data-part='track']`, property: 'background-color', attributes: { 'data-state': 'hovered' }, attributesOn: ON },
        { id: 'press', selector: `${OFF} [data-part='thumb']`, property: 'transform', attributes: { 'data-state': 'pressed' }, attributesOn: OFF },
      ],
    });
    expect(measured.subtle!.press, 'press still follows the emphasis').not.toBe(measured.base!.press);
    expect(measured.subtle!.hoverFill, 'hover tint is pinned inert').toBe(measured.base!.hoverFill);
  }, 120_000);

  it('takes the corner its vertical states, and the full pill when one is stated', async () => {
    const STATED: Readonly<Record<string, string>> = { rottay: '8px', bithire: '2px', evnto: '8px' };
    for (const vertical of VERTICALS) {
      const resting = await measureArms({
        vertical,
        markup,
        arms: { base: {}, pill: { 'shape.button-style': 'pill' } },
        targets: [
          { id: 'track', selector: `${ON} [data-part='track']`, property: 'border-top-left-radius' },
          { id: 'thumb', selector: `${ON} [data-part='thumb']`, property: 'border-top-left-radius' },
        ],
      });
      expect(resting.base!.track, vertical).toBe(STATED[vertical]);
      expect(resting.base!.thumb, vertical).toBe(STATED[vertical]);
      expect(resting.pill!.track, `${vertical} pill`).toBe('9999px');
      expect(resting.pill!.thumb, `${vertical} pill`).toBe('9999px');
    }
  }, 120_000);

  it('travels the thumb toward the inline end in both directions', async () => {
    const pair = renderToStaticMarkup(
      <div>
        <ModernToggle aria-label="Off" />
        <ModernToggle aria-label="On" defaultChecked />
      </div>,
    );
    const thumb = (checked: boolean) => `[data-checked='${checked}'] [data-part='thumb']`;
    const result = await measureArms({
      vertical: 'bithire',
      markup: pair,
      arms: { base: {} },
      targets: [
        { id: 'ltrOff', selector: thumb(false), property: '@rect.left', dir: 'ltr' },
        { id: 'ltrOn', selector: thumb(true), property: '@rect.left', dir: 'ltr' },
        { id: 'rtlOff', selector: thumb(false), property: '@rect.left', dir: 'rtl' },
        { id: 'rtlOn', selector: thumb(true), property: '@rect.left', dir: 'rtl' },
        { id: 'ltrOffTrack', selector: "[data-checked='false'] [data-part='track']", property: '@rect.left', dir: 'ltr' },
        { id: 'ltrOnTrack', selector: "[data-checked='true'] [data-part='track']", property: '@rect.left', dir: 'ltr' },
        { id: 'rtlOffTrack', selector: "[data-checked='false'] [data-part='track']", property: '@rect.left', dir: 'rtl' },
        { id: 'rtlOnTrack', selector: "[data-checked='true'] [data-part='track']", property: '@rect.left', dir: 'rtl' },
      ],
    });
    const r = result.base!;
    const offset = (thumbKey: string, trackKey: string) => Number(r[thumbKey]) - Number(r[trackKey]);
    expect(offset('ltrOn', 'ltrOnTrack')).toBeGreaterThan(offset('ltrOff', 'ltrOffTrack'));
    expect(offset('rtlOn', 'rtlOnTrack')).toBeLessThan(offset('rtlOff', 'rtlOffTrack'));
  }, 60_000);

  it('holds the touch floor on both axes for a standalone switch and drops motion under reduced motion', async () => {
    const standalone = renderToStaticMarkup(<ModernToggle aria-label="Sync" size="xs" />);
    const touch = await measureArms({
      vertical: 'bithire', markup: standalone, arms: { base: {} }, environment: { touch: true },
      targets: [
        { id: 'height', selector: "[data-part='root']", property: '@rect.height' },
        { id: 'width', selector: "[data-part='root']", property: '@rect.width' },
      ],
    });
    expect(Number(touch.base!.height)).toBeGreaterThanOrEqual(44);
    expect(Number(touch.base!.width)).toBeGreaterThanOrEqual(44);
    const reduced = await measureArms({
      vertical: 'bithire', markup: standalone, arms: { base: {} }, environment: { reducedMotion: 'reduce' },
      targets: [{ id: 'duration', selector: "[data-part='thumb']", property: 'transition-duration' }],
    });
    expect(Math.max(...reduced.base!.duration!.split(',').map((part) => Number.parseFloat(part)))).toBeLessThanOrEqual(0.00001);
  }, 60_000);

  it('builds its loading state from its own anatomy', () => {
    const loading = renderToStaticMarkup(
      <AnatomySkeleton>
        <ModernToggle label="Alerts" />
      </AnatomySkeleton>,
    );
    expect(loading).toContain('data-part="track"');
  });

  it('audits clean in every gated vertical mode, apart from the pinned contrast debt', async () => {
    const gallery = markup + renderToStaticMarkup(
      <div>
        {(['primary', 'secondary', 'success', 'warning', 'error', 'default'] as const).map((color) => (
          <ModernToggle key={color} label={`Colour ${color}`} color={color} defaultChecked />
        ))}
        <ModernToggle label="Busy" loading />
        <ModernToggle label="Off" disabled />
        <ModernToggle aria-label="With state" checkedLabel="On" uncheckedLabel="Off" helperText="Change later" />
      </div>,
    );
    for (const scope of AXE_SCOPES) {
      const findings = seriousFindings(await auditAxe({ ...scope, markup: gallery }));
      const key = `${scope.vertical} ${scope.theme}`;
      expect(axeDebt(findings), key).toEqual(CONTRAST_DEBT[key] ?? {});
    }
  }, 120_000);
});
