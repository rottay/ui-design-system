/**
 * The select family in a real browser: every decision its paint consumes moves
 * the trigger with a negative control, and direction, language, loading and
 * accessibility hold.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { AnatomySkeleton } from '@/components/primitives/feedback/skeleton/runtime/anatomy-renderer';
import { EngineProvider } from '@/infrastructure/runtime/engines/composition/react/provider';
import { I18nProvider } from '@/infrastructure/runtime/i18n';
import ModernSelect from '../engines/modern';
import {
  AXE_SCOPES,
  FIRST_PARTY_VERTICALS as VERTICALS,
  auditAxe,
  describeCausality,
  measureArms,
  seriousFindings,
} from '@tests/support/family-causality';

const OPTIONS = [
  { value: 'ada', label: 'Ada Lovelace' },
  { value: 'grace', label: 'Grace Hopper' },
];

const markup = renderToStaticMarkup(
  <div>
    <div id="rest"><ModernSelect options={OPTIONS} forceCustomDropdown aria-label="Owner" /></div>
    <div id="error"><ModernSelect options={OPTIONS} forceCustomDropdown status="error" aria-label="Reviewer" /></div>
    <div id="tags"><ModernSelect options={OPTIONS} defaultValue={['ada']} multiple aria-label="Watchers" /></div>
  </div>,
);

const REST = "#rest [data-part='trigger']";
const FOCUS = { 'data-state': 'focused focus-visible' };

describeCausality({
  family: 'select',
  markup,
  targets: [
    { id: 'arrowOpen', selector: "#rest [data-part='arrow-icon']", property: 'color', attributes: { 'data-open': 'true' }, attributesOn: REST },
    { id: 'errorBorder', selector: "#error [data-part='trigger']", property: 'border-top-color' },
    { id: 'focusRing', selector: REST, property: 'box-shadow', attributes: FOCUS },
    { id: 'tagInk', selector: "#tags [data-part='tag']", property: 'color' },
    { id: 'disabledOpacity', selector: REST, property: 'opacity', attributes: { 'data-disabled': 'true' } },
    { id: 'radius', selector: REST, property: 'border-top-left-radius' },
    { id: 'height', selector: REST, property: '@rect.height' },
    { id: 'fontSize', selector: REST, property: 'font-size' },
    { id: 'edge', selector: REST, property: 'border-top-width' },
    { id: 'duration', selector: REST, property: 'transition-duration' },
  ],
  decisions: {
    'palette.seeds': { value: { primary: '#2F6B9A' }, moves: ['arrowOpen'], holds: 'radius', in: VERTICALS },
    'palette.status-seeds': { value: { error: '#B00020' }, moves: ['errorBorder'], holds: 'radius', in: VERTICALS },
    'palette.neutral-temperature': { value: 'warm', moves: ['tagInk'], holds: 'radius', in: ['bithire', 'evnto'] },
    'states.emphasis': { value: 'strong', moves: ['disabledOpacity'], holds: 'radius', in: VERTICALS },
    'states.focus-style': { value: 'glow', moves: ['focusRing'], holds: 'radius', in: ['bithire', 'evnto'] },
    'typography.scale': { value: 1.08, moves: ['fontSize'], holds: 'radius', in: VERTICALS },
    'shape.radius-scale': { value: 1.2, moves: ['radius'], holds: 'fontSize', in: VERTICALS },
    'shape.control-height': { value: 'tall', moves: ['height'], holds: 'radius', in: VERTICALS },
    'density.mode': { value: 'compact', moves: ['height'], holds: 'radius', in: VERTICALS },
    'surfaces.border-style': { value: 'none', moves: ['edge'], holds: 'radius', in: ['rottay', 'evnto'] },
    'motion.dial': { value: { durationScale: 1.35 }, moves: ['duration'], holds: 'radius', in: ['evnto'] },
  },
});

describe('select geometry, direction, language and accessibility in a real browser', () => {
  it('keeps the value at the inline start and the chevron at the inline end in both directions', async () => {
    const chosen = renderToStaticMarkup(
      <ModernSelect options={OPTIONS} defaultValue="ada" forceCustomDropdown clearable aria-label="Owner" />,
    );
    const result = await measureArms({
      vertical: 'bithire',
      markup: chosen,
      arms: { base: {} },
      targets: [
        { id: 'ltrValue', selector: "[data-part='value']", property: '@rect.left', dir: 'ltr' },
        { id: 'ltrArrow', selector: "[data-part='arrow-icon']", property: '@rect.left', dir: 'ltr' },
        { id: 'rtlValue', selector: "[data-part='value']", property: '@rect.left', dir: 'rtl' },
        { id: 'rtlArrow', selector: "[data-part='arrow-icon']", property: '@rect.left', dir: 'rtl' },
      ],
    });
    const r = result.base!;
    expect(Number(r.ltrValue)).toBeLessThan(Number(r.ltrArrow));
    expect(Number(r.rtlValue)).toBeGreaterThan(Number(r.rtlArrow));
  }, 60_000);

  it('paints hover and press from the interaction kernel state on its actions', async () => {
    const chosen = renderToStaticMarkup(
      <ModernSelect options={OPTIONS} defaultValue={['ada']} multiple clearable aria-label="Owners" />,
    );
    const result = await measureArms({
      vertical: 'evnto',
      markup: chosen,
      arms: { base: {} },
      targets: [
        { id: 'rest', selector: "[data-part='clear-button']", property: 'border-top-color' },
        { id: 'hovered', selector: "[data-part='clear-button']", property: 'border-top-color', attributes: { 'data-state': 'hovered' } },
        { id: 'restScale', selector: "[data-part='tag-remove']", property: 'transform' },
        { id: 'pressed', selector: "[data-part='tag-remove']", property: 'transform', attributes: { 'data-state': 'pressed' } },
      ],
    });
    const r = result.base!;
    expect(r.hovered).not.toBe(r.rest);
    expect(r.pressed).not.toBe(r.restScale);
  }, 60_000);

  it('names its placeholder and actions from the active catalog', () => {
    const spanish = renderToStaticMarkup(
      <I18nProvider locale="es" fallbackLocale="en">
        <EngineProvider defaultEngine="modern">
          <ModernSelect options={OPTIONS} defaultValue="ada" forceCustomDropdown clearable aria-label="Responsable" />
          <ModernSelect options={OPTIONS} forceCustomDropdown aria-label="Revisor" />
        </EngineProvider>
      </I18nProvider>,
    );
    expect(spanish).toContain('aria-label="Limpiar selección"');
    expect(spanish).toContain('Selecciona una opción');
    const english = renderToStaticMarkup(<ModernSelect options={OPTIONS} forceCustomDropdown aria-label="Owner" />);
    expect(english).toContain('Select an option');
  });

  it('builds its loading state from its own anatomy', () => {
    const loading = renderToStaticMarkup(
      <AnatomySkeleton>
        <ModernSelect options={OPTIONS} defaultValue={['ada']} multiple aria-label="Owners" />
      </AnatomySkeleton>,
    );
    expect(loading).toContain('data-part="trigger"');
    expect(loading).toContain('data-part="tag"');
  });

  it('has no serious or critical axe violation in any gated vertical mode', async () => {
    const gallery = renderToStaticMarkup(
      <EngineProvider defaultEngine="modern">
        <div>
          <label htmlFor="native-owner">Owner</label>
          <ModernSelect id="native-owner" options={OPTIONS} defaultValue="ada" />
          <ModernSelect options={OPTIONS} forceCustomDropdown aria-label="Reviewer" />
          <ModernSelect options={OPTIONS} defaultValue={['ada', 'grace']} multiple clearable aria-label="Watchers" />
          <ModernSelect options={OPTIONS} forceCustomDropdown status="error" aria-label="Approver" />
          <ModernSelect options={OPTIONS} forceCustomDropdown disabled aria-label="Locked" />
          <ModernSelect options={OPTIONS} forceCustomDropdown loading aria-label="Loading owner" />
        </div>
      </EngineProvider>,
    );
    for (const scope of AXE_SCOPES) {
      const findings = seriousFindings(await auditAxe({ ...scope, markup: gallery }));
      expect(findings, `${scope.vertical} ${scope.theme}`).toEqual([]);
    }
  }, 180_000);
});
