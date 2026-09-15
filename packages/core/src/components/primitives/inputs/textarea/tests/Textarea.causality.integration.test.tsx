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
 * contrast node count is pinned EXACTLY, so this row reddens when the debt
 * spreads and again when the derivation lane clears it.
 */
const CONTRAST_DEBT: Readonly<Record<string, number>> = {
  'bithire dark': 1,
};

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

  it('has no serious or critical axe violation in any gated vertical mode', async () => {
    const gallery = renderToStaticMarkup(
      <div>
        <ModernTextarea aria-label="Plain" placeholder="Write" />
        <ModernTextarea aria-label="Counted" defaultValue="hello" showCount maxLength={40} allowClear />
        <ModernTextarea aria-label="Invalid" defaultValue="x" status="error" />
        <ModernTextarea aria-label="Disabled" defaultValue="x" disabled />
      </div>,
    );
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
  }, 180_000);
});
