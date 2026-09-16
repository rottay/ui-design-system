/**
 * The password-input family in a real browser: every decision its paint consumes
 * moves the field with a negative control, and direction, language and accessibility hold.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { AnatomySkeleton } from '@/components/primitives/feedback/skeleton/runtime/anatomy-renderer';
import { I18nProvider } from '@/infrastructure/runtime/i18n';
import ModernPasswordInput from '../engines/modern';
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
    <div id="rest"><ModernPasswordInput defaultValue="Secret12!" aria-label="Password" /></div>
    <div id="weak"><ModernPasswordInput defaultValue="abc" strengthIndicator strengthLevel="weak" aria-label="New password" /></div>
  </div>,
);

const ROOT = "#rest [data-part='root']";

describeCausality({
  family: 'password-input',
  markup,
  targets: [
    { id: 'strength', selector: "#weak [data-part='strength-fill']", property: 'background-color' },
    { id: 'radius', selector: ROOT, property: 'border-top-left-radius' },
    { id: 'height', selector: ROOT, property: '@rect.height' },
    { id: 'fontSize', selector: ROOT, property: 'font-size' },
    { id: 'edge', selector: ROOT, property: 'border-top-width' },
    { id: 'duration', selector: ROOT, property: 'transition-duration' },
    { id: 'ink', selector: ROOT, property: 'color' },
  ],
  decisions: {
    'palette.status-seeds': { value: { error: '#B00020' }, moves: ['strength'], holds: 'radius', in: VERTICALS },
    'typography.scale': { value: 1.08, moves: ['fontSize'], holds: 'radius', in: VERTICALS },
    'shape.radius-scale': { value: 1.2, moves: ['radius'], holds: 'fontSize', in: VERTICALS },
    'shape.control-height': { value: 'tall', moves: ['height'], holds: 'radius', in: VERTICALS },
    // bithire's preset decides `density.mode: compact`, so the retired arm restated
    // the vertical's own stop and moved nothing. `spacious` is stated by no preset.
    'density.mode': { value: 'spacious', moves: ['height'], holds: 'radius', in: VERTICALS },
    'surfaces.border-style': { value: 'none', moves: ['edge'], holds: 'radius', in: ['rottay', 'evnto'] },
    'motion.dial': { value: { durationScale: 1.35 }, moves: ['duration'], holds: 'radius', in: ['evnto'] },
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
  'rottay dark': {
    'color-contrast': [
      '#password-modern-_R_1_',
      '#password-modern-_R_2_',
    ],
  },
  'bithire light': {
    'color-contrast': [
      'span[data-part="strength-label"]',
    ],
  },
  'bithire dark': {
    'color-contrast': [
      '#password-modern-_R_1_',
      '#password-modern-_R_2_',
      '#password-modern-_R_3_-error',
      'span[data-part="strength-label"]',
    ],
  },
  'evnto light': {
    'color-contrast': [
      '#password-modern-_R_3_-error',
      'span[data-part="strength-label"]',
    ],
  },
};

/**
 * WO-DER-06 derivation-lane registry (D6-2c-ii-RED, 2026-09-15):
 * `palette.neutral-temperature` is INERT on all three verticals. The lean is
 * applied by `deriveNeutralAxis` only to an AUTHORED `palette.ramps.neutral`,
 * and no preset document authors one, so every stop -- warm, cool, neutral --
 * leaves `--ds-color-neutral-700` at `#404040` (rottay reads the foundation
 * dark scope and is equally unmoved). Measured at HEAD the same arm moved
 * bithire `#474747` -> `#4B4640` and evnto `#404040` -> `#443F39`: the control
 * had a subject and the lot removed it. The arm is withdrawn from the causality
 * table because it can no longer move anything anywhere, and the measured
 * inertness is pinned below so the row reddens when the lane restores it.
 */
describe('password-input geometry, direction, language and accessibility in a real browser', () => {
  // The dead subject named: the arm withdrawn above measured a lean this tree no
  // longer produces. Its reading is pinned, not deleted.
  it('registers the neutral-temperature lean that no preset can produce', async () => {
    for (const vertical of VERTICALS) {
      const warmed = await measureArms({
        vertical,
        markup,
        arms: { base: {}, warm: { 'palette.neutral-temperature': 'warm' } },
        targets: [{ id: 'ink', selector: ROOT, property: 'color' }],
      });
      expect(warmed.warm!.ink, vertical).toBe(warmed.base!.ink);
    }
  }, 120_000);

  it('keeps the visibility toggle at the inline end in both directions', async () => {
    const field = renderToStaticMarkup(<ModernPasswordInput defaultValue="Secret12!" aria-label="Password" />);
    const result = await measureArms({
      vertical: 'bithire',
      markup: field,
      arms: { base: {} },
      targets: [
        { id: 'ltrControl', selector: "[data-part='control']", property: '@rect.left', dir: 'ltr' },
        { id: 'ltrToggle', selector: "[data-part='visibility-toggle']", property: '@rect.left', dir: 'ltr' },
        { id: 'rtlControl', selector: "[data-part='control']", property: '@rect.left', dir: 'rtl' },
        { id: 'rtlToggle', selector: "[data-part='visibility-toggle']", property: '@rect.left', dir: 'rtl' },
      ],
    });
    const r = result.base!;
    expect(Number(r.ltrToggle)).toBeGreaterThan(Number(r.ltrControl));
    expect(Number(r.rtlToggle)).toBeLessThan(Number(r.rtlControl));
  }, 60_000);

  it('names its strength level from the active catalog', () => {
    const spanish = renderToStaticMarkup(
      <I18nProvider locale="es" fallbackLocale="en">
        <ModernPasswordInput defaultValue="abc" strengthIndicator strengthLevel="weak" aria-label="Contraseña" />
      </I18nProvider>,
    );
    expect(spanish).toContain('Débil');
  });

  it('builds its loading state from its own anatomy', () => {
    const loading = renderToStaticMarkup(
      <AnatomySkeleton>
        <ModernPasswordInput defaultValue="abc" strengthIndicator strengthLevel="fair" aria-label="Password" />
      </AnatomySkeleton>,
    );
    expect(loading).toContain('data-part="source"');
    expect(loading).toContain('data-part="strength-track"');
  });

  it('audits clean in every gated vertical mode, apart from the pinned contrast debt', async () => {
    const gallery = renderToStaticMarkup(
      <div>
        <ModernPasswordInput aria-label="Plain" placeholder="Password" />
        <ModernPasswordInput aria-label="Strong" defaultValue="Secret12!" strengthIndicator strengthLevel="strong" />
        <ModernPasswordInput aria-label="Invalid" defaultValue="x" error errorMessage="Too short" />
        <ModernPasswordInput aria-label="Disabled" defaultValue="x" disabled />
      </div>,
    );
    for (const scope of AXE_SCOPES) {
      const findings = seriousFindings(await auditAxe({ ...scope, markup: gallery }));
      const key = `${scope.vertical} ${scope.theme}`;
      expect(axeDebt(findings), key).toEqual(CONTRAST_DEBT[key] ?? {});
    }
  }, 180_000);
});
