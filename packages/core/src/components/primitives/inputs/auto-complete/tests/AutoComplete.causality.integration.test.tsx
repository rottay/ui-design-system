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
    'states.emphasis': { value: 'strong', moves: ['disabledOpacity'], holds: 'radius', in: VERTICALS },
    'typography.scale': { value: 1.08, moves: ['fontSize'], holds: 'radius', in: VERTICALS },
    'shape.radius-scale': { value: 1.2, moves: ['radius'], holds: 'fontSize', in: VERTICALS },
    'shape.control-height': { value: 'tall', moves: ['height'], holds: 'radius', in: VERTICALS },
    'density.mode': { value: 'compact', moves: ['height'], holds: 'radius', in: VERTICALS },
    'surfaces.border-style': { value: 'none', moves: ['edge'], holds: 'radius', in: VERTICALS },
    'motion.dial': { value: { durationScale: 1.35 }, moves: ['duration'], holds: 'radius', in: ['evnto'] },
  },
});

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

  it('has no serious or critical axe violation in any gated vertical mode', async () => {
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
      expect(findings, `${scope.vertical} ${scope.theme}`).toEqual([]);
    }
  }, 180_000);
});
