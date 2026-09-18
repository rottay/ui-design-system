/**
 * The auto-complete family in a real browser: every decision its paint consumes
 * moves the field with a negative control, and direction, language, loading and
 * accessibility hold.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { AnatomySkeleton } from '@/components/primitives/feedback/skeleton/runtime/anatomy-renderer';
import { EngineProvider } from '@/infrastructure/runtime/engines/composition/react/provider';
import { I18nProvider } from '@/infrastructure/runtime/i18n';
import ModernAutoComplete from '../engines/modern';
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

const OPTIONS = [{ value: 'Lisbon' }, { value: 'London' }];

const markup = renderToStaticMarkup(
  <div>
    <div id="rest"><ModernAutoComplete options={OPTIONS} defaultValue="Lisbon" allowClear aria-label="City" /></div>
    <div id="error"><ModernAutoComplete options={OPTIONS} status="error" aria-label="Origin" /></div>
  </div>,
);

const REST = "#rest [data-part='input']";
const FOCUS = { 'data-state': 'focused focus-visible' };

describeCausality({
  family: 'auto-complete',
  markup,
  targets: [
    { id: 'focusRing', selector: REST, property: 'box-shadow', attributes: FOCUS },
    { id: 'errorBorder', selector: "#error [data-part='input']", property: 'border-top-color' },
    { id: 'disabledOpacity', selector: REST, property: 'opacity', attributes: { 'data-state': 'disabled' } },
    { id: 'radius', selector: REST, property: 'border-top-left-radius' },
    { id: 'height', selector: REST, property: '@rect.height' },
    { id: 'fontSize', selector: REST, property: 'font-size' },
    { id: 'edge', selector: REST, property: 'border-top-width' },
    { id: 'duration', selector: REST, property: 'transition-duration' },
  ],
  decisions: {
    'palette.seeds': { value: { primary: '#2F6B9A' }, moves: ['focusRing'], holds: 'radius', in: VERTICALS },
    'palette.status-seeds': { value: { error: '#B00020' }, moves: ['errorBorder'], holds: 'radius', in: ['bithire', 'evnto'] },
    'states.focus-style': { value: 'glow', moves: ['focusRing'], holds: 'radius', in: VERTICALS },
    // `subtle`, not `strong`: bithire's preset already decides strong, so that arm
    // restated the baseline and moved nothing (D6-2c-ii-RED, 2026-09-15).
    'states.emphasis': { value: 'subtle', moves: ['disabledOpacity'], holds: 'radius', in: VERTICALS },
    'typography.scale': { value: 1.08, moves: ['fontSize'], holds: 'radius', in: VERTICALS },
    'shape.radius-scale': { value: 1.2, moves: ['radius'], holds: 'fontSize', in: VERTICALS },
    'shape.control-height': { value: 'tall', moves: ['height'], holds: 'radius', in: VERTICALS },
    // `spacious`, not `compact`: bithire's preset already decides compact, so that
    // arm restated the baseline and moved nothing (D6-2c-ii-RED, 2026-09-15).
    'density.mode': { value: 'spacious', moves: ['height'], holds: 'radius', in: VERTICALS },
    'surfaces.border-style': { value: 'none', moves: ['edge'], holds: 'radius', in: VERTICALS },
    'motion.dial': { value: { durationScale: 1.35 }, moves: ['duration'], holds: 'radius', in: ['evnto'] },
  },
});

/**
 * WO-DER-06 derivation-lane registry (D6-2c-ii-RED, 2026-09-15). The neutral
 * compile leaves this family's ink and its ground on opposite sides of the
 * ramp, so axe reports serious `color-contrast`. Measured at the pre-lot tree:
 * ZERO findings on all four scopes, so every entry below is lot-caused, not
 * inherited. Pinned by finding id and the IDENTITY of every failing node:
 * another kind of violation, one more node, one node repaired, a same-count
 * swap, or a finding in a scope pinned clean turns this row red. It clears when
 * the derivation lane gives the family a legible pair (EVI-02, 2026-09-15).
 *
 * `bithire dark` DRAINED: that scope's dark block now re-derives its own canvas
 * ground instead of inheriting the light body's, so the pair is legible there.
 * Dropped by identity, not waived -- with no entry the scope must measure
 * clean, and a relapse reddens here.
 */
const AXE_CONTRAST_GAP: Readonly<Record<string, AxeDebt>> = {
  'rottay dark': {
    'color-contrast': [
      'input[aria-label="Destination"]',
      'input[aria-label="Origin"]',
      'input[placeholder="Search a city"]',
    ],
  },
};

describe('auto-complete geometry, direction, language and accessibility in a real browser', () => {
  it('parks the clear action at the inline end in both directions', async () => {
    const field = renderToStaticMarkup(
      <ModernAutoComplete options={OPTIONS} defaultValue="Lisbon" allowClear aria-label="City" />,
    );
    const result = await measureArms({
      vertical: 'bithire',
      markup: field,
      arms: { base: {} },
      targets: [
        { id: 'ltrInput', selector: "[data-part='input']", property: '@rect.left', dir: 'ltr' },
        { id: 'ltrClear', selector: "[data-part='clear-button']", property: '@rect.left', dir: 'ltr' },
        { id: 'rtlInput', selector: "[data-part='input']", property: '@rect.right', dir: 'rtl' },
        { id: 'rtlClear', selector: "[data-part='clear-button']", property: '@rect.right', dir: 'rtl' },
      ],
    });
    const r = result.base!;
    expect(Number(r.ltrClear)).toBeGreaterThan(Number(r.ltrInput));
    expect(Number(r.rtlClear)).toBeLessThan(Number(r.rtlInput));
  }, 60_000);

  it('paints the clear action hover from the field-action kernel state', async () => {
    const field = renderToStaticMarkup(
      <ModernAutoComplete options={OPTIONS} defaultValue="Lisbon" allowClear aria-label="City" />,
    );
    const result = await measureArms({
      vertical: 'evnto',
      markup: field,
      arms: { base: {} },
      targets: [
        { id: 'rest', selector: "[data-part='clear-button']", property: 'color' },
        { id: 'hovered', selector: "[data-part='clear-button']", property: 'color', attributes: { 'data-state': 'hovered' } },
      ],
    });
    expect(result.base!.hovered).not.toBe(result.base!.rest);
  }, 60_000);

  it('names its field and clear action from the active catalog', () => {
    const spanish = renderToStaticMarkup(
      <I18nProvider locale="es" fallbackLocale="en">
        <EngineProvider defaultEngine="modern">
          <ModernAutoComplete options={OPTIONS} defaultValue="Lisbon" allowClear />
        </EngineProvider>
      </I18nProvider>,
    );
    expect(spanish).toContain('aria-label="Autocompletado"');
    expect(spanish).toContain('aria-label="Limpiar"');
  });

  it('builds its loading state from its own anatomy', () => {
    const loading = renderToStaticMarkup(
      <AnatomySkeleton>
        <ModernAutoComplete options={OPTIONS} defaultValue="Lisbon" aria-label="City" />
      </AnatomySkeleton>,
    );
    expect(loading).toContain('data-part="input"');
    expect(loading).toContain('data-part="input-wrapper"');
  });

  // WO-DER-06 N1 (closed 2026-09-15): the foundation derives the ring from the
  // primary seed in both scopes, so a seed reaches the ring on every vertical.
  it('the seed reaches the focus ring on every vertical', async () => {
    for (const vertical of VERTICALS) {
      const seeded = await measureArms({
        vertical,
        markup,
        arms: { base: {}, seeded: { 'palette.seeds': { primary: '#2F6B9A' } } },
        targets: [
          { id: 'ringColor', selector: REST, property: '--ds-focus-ring-color' },
          { id: 'primary', selector: REST, property: '--ds-color-primary' },
        ],
      });
      expect(seeded.seeded!.ringColor.trim(), `${vertical}: the seed reaches the ring`).not.toBe(seeded.base!.ringColor.trim());
      expect(seeded.seeded!.primary.trim(), `${vertical}: the seed reaches the palette`).not.toBe(seeded.base!.primary.trim());
    }
  }, 180_000);

  it('audits clean in every gated vertical mode, apart from the pinned contrast debt', async () => {
    const gallery = renderToStaticMarkup(
      <EngineProvider defaultEngine="modern">
        <div>
          <ModernAutoComplete options={OPTIONS} placeholder="Search a city" aria-label="City" />
          <ModernAutoComplete options={OPTIONS} defaultValue="Lisbon" allowClear aria-label="Origin" />
          <ModernAutoComplete options={OPTIONS} status="error" defaultValue="x" aria-label="Destination" />
          <ModernAutoComplete options={OPTIONS} disabled defaultValue="Lisbon" aria-label="Locked" />
        </div>
      </EngineProvider>,
    );
    for (const scope of AXE_SCOPES) {
      const findings = seriousFindings(await auditAxe({ ...scope, markup: gallery }));
      const key = `${scope.vertical} ${scope.theme}`;
      expect(axeDebt(findings), key).toEqual(AXE_CONTRAST_GAP[key] ?? {});
    }
  }, 180_000);
});
