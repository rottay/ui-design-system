/**
 * The textarea family in a real browser: every decision its paint consumes moves
 * the field with a negative control, and direction, language and accessibility hold.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { AnatomySkeleton } from '@/components/primitives/feedback/skeleton/runtime/anatomy-renderer';
import { I18nProvider } from '@/infrastructure/runtime/i18n';
import ModernTextarea from '../engines/modern';
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
    <div id="rest"><ModernTextarea defaultValue="Notes" aria-label="Notes" /></div>
    <div id="error"><ModernTextarea defaultValue="Notes" status="error" aria-label="Summary" /></div>
  </div>,
);

const REST = '#rest textarea';

describeCausality({
  family: 'textarea',
  markup,
  targets: [
    { id: 'focusBorder', selector: REST, property: 'border-top-color', attributes: { 'data-state': 'focused focus-visible' } },
    { id: 'errorBorder', selector: '#error textarea', property: 'border-top-color' },
    { id: 'radius', selector: REST, property: 'border-top-left-radius' },
    { id: 'inset', selector: REST, property: 'padding-left' },
    { id: 'fontSize', selector: REST, property: 'font-size' },
    { id: 'edge', selector: REST, property: 'border-top-width' },
    { id: 'duration', selector: REST, property: 'transition-duration' },
  ],
  decisions: {
    'palette.seeds': { value: { primary: '#2F6B9A' }, moves: ['focusBorder'], holds: 'radius', in: ['bithire', 'evnto'] },
    'palette.status-seeds': { value: { error: '#B00020' }, moves: ['errorBorder'], holds: 'radius', in: ['evnto'] },
    'typography.scale': { value: 1.08, moves: ['fontSize'], holds: 'radius', in: VERTICALS },
    'shape.radius-scale': { value: 1.2, moves: ['radius'], holds: 'fontSize', in: VERTICALS },
    // bithire's preset decides `density.mode: compact`, so the retired arm restated
    // the vertical's own stop and moved nothing. `spacious` is stated by no preset.
    'density.mode': { value: 'spacious', moves: ['inset'], holds: 'radius', in: VERTICALS },
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
 *
 * `bithire dark` had 1 row and it DRAINED: that scope's dark block now
 * re-derives its own canvas ground instead of inheriting the light body's, so
 * the control chrome is read against the ground it was designed for.
 * Dropped by identity, not waived -- with no entry the scope must measure
 * clean, and a relapse reddens here.
 */
const CONTRAST_DEBT: Readonly<Record<string, AxeDebt>> = {};

describe('textarea geometry, direction, language and accessibility in a real browser', () => {
  it('keeps the clear action at the inline end in both directions', async () => {
    const clearable = renderToStaticMarkup(<ModernTextarea defaultValue="Notes" allowClear aria-label="Notes" />);
    const result = await measureArms({
      vertical: 'bithire',
      markup: clearable,
      arms: { base: {} },
      targets: [
        { id: 'ltrField', selector: 'textarea', property: '@rect.left', dir: 'ltr' },
        { id: 'ltrClear', selector: "[data-part='clear-button']", property: '@rect.left', dir: 'ltr' },
        { id: 'rtlField', selector: 'textarea', property: '@rect.left', dir: 'rtl' },
        { id: 'rtlClear', selector: "[data-part='clear-button']", property: '@rect.left', dir: 'rtl' },
      ],
    });
    const r = result.base!;
    expect(Number(r.ltrClear) - Number(r.ltrField)).toBeGreaterThan(Number(r.rtlClear) - Number(r.rtlField));
  }, 60_000);

  it('formats its counter and names its clear action from the active catalog', () => {
    const spanish = renderToStaticMarkup(
      <I18nProvider locale="es" fallbackLocale="en">
        <ModernTextarea defaultValue="hola" showCount maxLength={20} allowClear aria-label="Notas" />
      </I18nProvider>,
    );
    expect(spanish).toContain('aria-label="Limpiar"');
    expect(spanish).toContain('4/20');
  });

  it('builds its loading state from its own anatomy', () => {
    const loading = renderToStaticMarkup(
      <AnatomySkeleton>
        <ModernTextarea defaultValue="Notes" showCount maxLength={20} aria-label="Notes" />
      </AnatomySkeleton>,
    );
    expect(loading).toContain('data-part="source"');
    expect(loading).toContain('data-part="count"');
  });

  it('audits clean in every gated vertical mode, apart from the pinned contrast debt', async () => {
    const gallery = renderToStaticMarkup(
      <div>
        <ModernTextarea aria-label="Plain" placeholder="Write" />
        <ModernTextarea aria-label="Counted" defaultValue="hello" showCount maxLength={40} allowClear />
        <ModernTextarea aria-label="Invalid" defaultValue="x" status="error" />
        <ModernTextarea aria-label="Disabled" defaultValue="x" disabled />
      </div>,
    );
    for (const scope of AXE_SCOPES) {
      const findings = seriousFindings(await auditAxe({ ...scope, markup: gallery }));
      const key = `${scope.vertical} ${scope.theme}`;
      expect(axeDebt(findings), key).toEqual(CONTRAST_DEBT[key] ?? {});
    }
  }, 180_000);
});
