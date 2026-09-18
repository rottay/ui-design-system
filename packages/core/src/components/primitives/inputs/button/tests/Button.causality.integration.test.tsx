/**
 * Every decision the button family consumes moves the button's computed paint in
 * a real browser, and a negative control stays put.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeAll, describe, expect, it } from 'vitest';

import { ButtonGroup } from '../compound';
import ModernButton from '../engines/modern';
import { RecipeProfileProvider } from '@/infrastructure/runtime/foundation/recipes/profiles';
import {
  AXE_SCOPES,
  auditAxe,
  axeDebt,
  type AxeDebt,
  measureArms,
  seriousFindings,
  type ProbeReadings,
  type ProbeTarget,
  type ProbeVertical,
} from '@tests/support/family-causality';

const VERTICALS: readonly ProbeVertical[] = ['rottay', 'bithire', 'evnto'];

const markup = renderToStaticMarkup(
  <div>
    <ModernButton variant="primary">Save changes</ModernButton>
    <ModernButton variant="default" data-part="composite-action">Cancel</ModernButton>
  </div>,
);

const PRIMARY = "[data-variant='primary']";
const DEFAULT = "[data-variant='default']";

const TARGETS: readonly ProbeTarget[] = [
  { id: 'background', selector: PRIMARY, property: 'background-color' },
  { id: 'radius', selector: PRIMARY, property: 'border-top-left-radius' },
  { id: 'height', selector: PRIMARY, property: 'min-block-size' },
  { id: 'padding', selector: PRIMARY, property: 'padding-inline-start' },
  { id: 'fontSize', selector: PRIMARY, property: 'font-size' },
  { id: 'fontWeight', selector: PRIMARY, property: 'font-weight' },
  { id: 'hoverDepth', selector: DEFAULT, property: 'box-shadow', attributes: { 'data-state': 'hovered' } },
  { id: 'press', selector: PRIMARY, property: 'transform', attributes: { 'data-state': 'pressed' } },
  { id: 'focusRing', selector: PRIMARY, property: 'box-shadow', attributes: { 'data-state': 'focus-visible' } },
  { id: 'duration', selector: PRIMARY, property: 'transition-duration', attributes: { 'data-recipe-state': 'animated' } },
  { id: 'callerPartBackground', selector: DEFAULT, property: 'background-color' },
];

/** decision arm -> the readings it must move, the vertical scope, and one reading it must not move. */
const DECISIONS = {
  'palette.seeds': { value: { primary: '#2F6B9A' }, moves: ['background'], holds: 'radius', in: VERTICALS },
  'shape.radius-scale': { value: 1.2, moves: ['radius'], holds: 'background', in: VERTICALS },
  'shape.button-style': { value: 'pill', moves: ['radius'], holds: 'height', in: VERTICALS },
  // `shape.control-height` moves the button's min-block-size on rottay and evnto
  // only; bithire is pinned inert by the row below, with its channel evidence.
  'shape.control-height': { value: 'tall', moves: ['height'], holds: 'background', in: ['rottay', 'evnto'] },
  // bithire's preset decides `density.mode: compact`, so the retired arm restated
  // the vertical's own stop and moved nothing. `spacious` is stated by no preset.
  'density.mode': { value: 'spacious', moves: ['padding'], holds: 'background', in: VERTICALS },
  'typography.scale': { value: 1.08, moves: ['fontSize'], holds: 'background', in: VERTICALS },
  'typography.role-weights': { value: 'light', moves: ['fontWeight'], holds: 'radius', in: ['evnto'] },
  'surfaces.elevation-posture': { value: 'elevated', moves: ['hoverDepth'], holds: 'background', in: ['rottay'] },
  // bithire's preset decides `states.emphasis: strong`; `subtle` is stated by no
  // preset, so the arm states a stop rather than repeating one.
  'states.emphasis': { value: 'subtle', moves: ['press'], holds: 'background', in: VERTICALS },
  'states.focus-style': { value: 'glow', moves: ['focusRing'], holds: 'radius', in: VERTICALS },
  'motion.dial': { value: { durationScale: 1.35 }, moves: ['duration'], holds: 'background', in: VERTICALS },
} as const;

const readings: Partial<Record<ProbeVertical, ProbeReadings>> = {};

beforeAll(async () => {
  const arms = Object.fromEntries([
    ['base', {}],
    ...Object.entries(DECISIONS).map(([id, arm]) => [id, { [id]: arm.value }]),
  ]);
  for (const vertical of VERTICALS) {
    readings[vertical] = await measureArms({ vertical, markup, arms, targets: TARGETS });
  }
}, 180_000);

/**
 * WO-DER-06 derivation-lane registry (D6-2c-ii-RED, 2026-09-15): under the
 * neutral compile a governed chrome pair can reach a scope with no producer --
 * the menu ink IS the sidebar ink -- so axe reports `color-contrast` in the
 * scopes pinned below.
 * Nothing is lowered: every other serious rule must still be empty, and the
 * contrast debt is pinned by the IDENTITY of every failing node, so this row
 * reddens when the debt spreads, when a node is repaired, and when one node is
 * fixed while another starts failing in its place -- the substitution a count
 * could not see (EVI-02, 2026-09-15).
 *
 * `bithire dark` had three rows -- ghost, link and text labels -- and they
 * DRAINED: that scope's dark block now re-derives its own canvas ground
 * instead of inheriting the light body's, so those labels no longer sit on a
 * near-white ground. Dropped by identity, not waived: with no entry the scope
 * must now measure clean, and a relapse reddens here.
 */
const CONTRAST_DEBT: Readonly<Record<string, AxeDebt>> = {
  'rottay dark': {
    'color-contrast': [
      '.ds-button--link > span[data-state="visible"][data-part="content"] > span[data-part="label"]',
      '.ds-button--text > span[data-state="visible"][data-part="content"] > span[data-part="label"]',
    ],
  },
};

describe('button causality', () => {
  for (const [decision, arm] of Object.entries(DECISIONS)) {
    it(`${decision} moves ${arm.moves.join(', ')} and holds ${arm.holds}`, () => {
      for (const vertical of arm.in) {
        const base = readings[vertical]!.base!;
        const moved = readings[vertical]![decision]!;
        for (const id of arm.moves) {
          expect(moved[id], `${vertical}: ${id}`).not.toBe(base[id]);
        }
        expect(moved[arm.holds], `${vertical}: control ${arm.holds}`).toBe(base[arm.holds]);
      }
    });
  }

  /**
   * WO-DER-06 derivation-lane registry (D6-2c-ii-RED, 2026-09-15):
   * `shape.control-height` reaches its channel on bithire and stops there. The
   * decision moves `--ds-control-height-scale` 0.9 / 1 / 1.15 for compact /
   * standard / tall, and the button's `min-block-size` reads 36px for all three
   * -- while rottay moves 37.5 -> 43.125 and evnto 37.5 -> 43.125 on the same
   * stops. Measured at HEAD, bithire moved 36 -> 37.26: this is a reach the lot
   * lost, not a stop that coincides. Pinned so it reddens when the lane restores
   * the reader.
   */
  it('registers the control-height reach bithire lost: the channel moves, the box does not', () => {
    const base = readings.bithire!.base!;
    const tall = readings.bithire!['shape.control-height']!;
    expect(tall.height, 'bithire min-block-size is pinned at the floor').toBe(base.height);
    expect(base.height).toBe('36px');
  });

  it('paints a button whose part a composite renamed exactly like a standalone one', () => {
    for (const vertical of VERTICALS) {
      const base = readings[vertical]!.base!;
      expect(base.callerPartBackground).not.toBe('rgba(0, 0, 0, 0)');
      expect(base.callerPartBackground).not.toMatch(/^<no match/);
    }
  });

  it('recipe-profile reaches the button through the runtime profile it compiles to', async () => {
    const profiled = renderToStaticMarkup(
      <RecipeProfileProvider profileId="rottay/editorial-round@1">
        <ModernButton>Continue</ModernButton>
      </RecipeProfileProvider>,
    );
    const plain = renderToStaticMarkup(<ModernButton>Continue</ModernButton>);
    const target: ProbeTarget = { id: 'radius', selector: 'button', property: 'border-top-left-radius' };
    const withProfile = await measureArms({
      vertical: 'bithire',
      markup: profiled,
      arms: { profile: { 'recipe-profile': 'rottay/editorial-round@1' } },
      targets: [target],
    });
    const without = await measureArms({ vertical: 'bithire', markup: plain, arms: { base: {} }, targets: [target] });
    expect(withProfile.profile!.radius).not.toBe(without.base!.radius);
  }, 120_000);
});

function channels(color: string): number[] {
  const parts = color.match(/[\d.]+/g)?.map(Number) ?? [];
  if (color.startsWith('color(srgb')) return parts.slice(0, 3).map((part) => part * 255);
  return parts.slice(0, 3);
}

function luminance(color: string): number {
  const [r, g, b] = channels(color).map((value) => {
    const c = value / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

function contrast(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light! + 0.05) / (dark! + 0.05);
}

describe('button environments in a real browser', () => {
  it('draws a focus ring that clears 3:1 against the canvas in every vertical', async () => {
    for (const vertical of VERTICALS) {
      const result = await measureArms({
        vertical,
        markup,
        arms: { base: {} },
        targets: [
          { id: 'ring', selector: PRIMARY, property: 'box-shadow', attributes: { 'data-state': 'focus-visible' } },
          { id: 'canvas', selector: PRIMARY, property: '--ds-color-bg-primary' },
        ],
      });
      const ring = result.base!.ring!;
      const outer = ring.split(/,(?![^(]*\))/).map((layer) => layer.trim()).pop()!;
      const ringColor = outer.match(/^(rgba?\([^)]*\)|color\([^)]*\))/)?.[1] ?? '';
      const canvas = result.base!.canvas!.trim();
      const probe = await measureArms({
        vertical,
        markup: `<i style="color: ${canvas}"></i>`,
        arms: { base: {} },
        targets: [{ id: 'canvas', selector: 'i', property: 'color' }],
      });
      const measured = contrast(ringColor, probe.base!.canvas!);
      expect(measured, `${vertical}: ${ringColor} on ${probe.base!.canvas}`).toBeGreaterThanOrEqual(3);
    }
  }, 120_000);

  it('rounds only the exterior corners of a connected group, logically, in both directions', async () => {
    const group = renderToStaticMarkup(
      <ButtonGroup connected aria-label="View mode">
        <ModernButton variant="default">One</ModernButton>
        <ModernButton variant="default">Two</ModernButton>
        <ModernButton variant="default">Three</ModernButton>
      </ButtonGroup>,
    );
    const first = "[data-group-position~='first']";
    const middle = "[data-group-position~='middle']";
    const result = await measureArms({
      vertical: 'bithire',
      markup: group,
      arms: { base: {} },
      targets: [
        { id: 'ltrFirstLeft', selector: first, property: 'border-top-left-radius', dir: 'ltr' },
        { id: 'ltrFirstRight', selector: first, property: 'border-top-right-radius', dir: 'ltr' },
        { id: 'rtlFirstLeft', selector: first, property: 'border-top-left-radius', dir: 'rtl' },
        { id: 'rtlFirstRight', selector: first, property: 'border-top-right-radius', dir: 'rtl' },
        { id: 'middle', selector: middle, property: 'border-top-left-radius' },
      ],
    });
    const r = result.base!;
    expect(r.ltrFirstLeft).not.toBe('0px');
    expect(r.ltrFirstRight).toBe('0px');
    expect(r.rtlFirstRight).not.toBe('0px');
    expect(r.rtlFirstLeft).toBe('0px');
    expect(r.middle).toBe('0px');
  }, 60_000);

  it('drops motion under reduced motion, repaints for forced colors, and floors touch targets', async () => {
    const targets: ProbeTarget[] = [
      { id: 'transition', selector: PRIMARY, property: 'transition-duration', attributes: { 'data-recipe-state': 'animated' } },
      { id: 'border', selector: PRIMARY, property: 'border-top-color' },
      { id: 'height', selector: PRIMARY, property: 'min-block-size' },
    ];
    const run = (environment: Parameters<typeof measureArms>[0]['environment']) =>
      measureArms({ vertical: 'bithire', markup, arms: { base: {} }, targets, environment });
    const plain = (await run({})).base!;
    const reduced = (await run({ reducedMotion: 'reduce' })).base!;
    const forced = (await run({ forcedColors: 'active' })).base!;
    const touch = (await run({ touch: true })).base!;
    const longest = (value: string) => Math.max(...value.split(',').map((part) => Number.parseFloat(part)));
    expect(longest(plain.transition!)).toBeGreaterThan(0.01);
    expect(longest(reduced.transition!)).toBeLessThanOrEqual(0.00001);
    expect(forced.border).not.toBe(plain.border);
    expect(Number.parseFloat(touch.height!)).toBeGreaterThanOrEqual(44);
  }, 120_000);
});

describe('button direction and accessibility in a real browser', () => {
  it('places a start icon on the inline-start side in both directions', async () => {
    const withIcon = renderToStaticMarkup(
      <ModernButton icon={<svg aria-hidden="true" width="16" height="16" />}>Upload</ModernButton>,
    );
    const icon = "[data-part='icon']";
    const label = "[data-part='label']";
    const result = await measureArms({
      vertical: 'bithire',
      markup: withIcon,
      arms: { base: {} },
      targets: [
        { id: 'ltrIcon', selector: icon, property: '@rect.left', dir: 'ltr' },
        { id: 'ltrLabel', selector: label, property: '@rect.left', dir: 'ltr' },
        { id: 'rtlIcon', selector: icon, property: '@rect.left', dir: 'rtl' },
        { id: 'rtlLabel', selector: label, property: '@rect.left', dir: 'rtl' },
      ],
    });
    const { ltrIcon, ltrLabel, rtlIcon, rtlLabel } = result.base!;
    expect(Number(ltrIcon)).toBeLessThan(Number(ltrLabel));
    expect(Number(rtlIcon)).toBeGreaterThan(Number(rtlLabel));
  }, 60_000);

  it('audits clean in every gated vertical mode, apart from the pinned contrast debt', async () => {
    const gallery = renderToStaticMarkup(
      <div>
        {(['primary', 'secondary', 'default', 'ghost', 'text', 'link', 'danger'] as const).map((variant) => (
          <ModernButton key={variant} variant={variant}>{`Action ${variant}`}</ModernButton>
        ))}
        <ModernButton disabled>Disabled</ModernButton>
        <ModernButton pending pendingLabel="Saving">Save</ModernButton>
        <ModernButton icon={<svg aria-hidden="true" />} aria-label="Delete" />
      </div>,
    );
    for (const scope of AXE_SCOPES) {
      const findings = seriousFindings(await auditAxe({ ...scope, markup: gallery }));
      const key = `${scope.vertical} ${scope.theme}`;
      expect(axeDebt(findings), key).toEqual(CONTRAST_DEBT[key] ?? {});
    }
  }, 120_000);
});
