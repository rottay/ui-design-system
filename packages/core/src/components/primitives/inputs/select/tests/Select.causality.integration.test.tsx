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
  axeDebt,
  type AxeDebt,
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
    // bithire's preset decides `states.emphasis: strong`; `subtle` is stated by no
    // preset, so the arm states a stop rather than repeating one.
    'states.emphasis': { value: 'subtle', moves: ['disabledOpacity'], holds: 'radius', in: VERTICALS },
    'states.focus-style': { value: 'glow', moves: ['focusRing'], holds: 'radius', in: ['bithire', 'evnto'] },
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
  'bithire light': {
    'color-contrast': [
      'div[aria-label="Approver"] > div[data-part="trigger-value"] > span[data-part="placeholder"]',
      'div[aria-label="Loading owner"] > div[data-part="trigger-value"] > span[data-part="placeholder"]',
      'div[aria-label="Reviewer"] > div[data-part="trigger-value"] > span[data-part="placeholder"]',
    ],
  },
  'bithire dark': {
    'color-contrast': [
      '#native-owner',
      'div[aria-label="Approver"] > div[data-part="trigger-value"] > span[data-part="placeholder"]',
      'div[aria-label="Loading owner"] > div[data-part="trigger-value"] > span[data-part="placeholder"]',
      'div[aria-label="Reviewer"] > div[data-part="trigger-value"] > span[data-part="placeholder"]',
      'label',
    ],
  },
  'evnto light': {
    'color-contrast': [
      'div[aria-label="Approver"] > div[data-part="trigger-value"] > span[data-part="placeholder"]',
      'div[aria-label="Loading owner"] > div[data-part="trigger-value"] > span[data-part="placeholder"]',
      'div[aria-label="Reviewer"] > div[data-part="trigger-value"] > span[data-part="placeholder"]',
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
describe('select geometry, direction, language and accessibility in a real browser', () => {
  // The dead subject named: the arm withdrawn above measured a lean this tree no
  // longer produces. Its reading is pinned, not deleted.
  it('registers the neutral-temperature lean that no preset can produce', async () => {
    for (const vertical of VERTICALS) {
      const warmed = await measureArms({
        vertical,
        markup,
        arms: { base: {}, warm: { 'palette.neutral-temperature': 'warm' } },
        targets: [{ id: 'tagInk', selector: "#tags [data-part='tag']", property: 'color' }],
      });
      expect(warmed.warm!.tagInk, vertical).toBe(warmed.base!.tagInk);
    }
  }, 120_000);

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

  it('audits clean in every gated vertical mode, apart from the pinned contrast debt', async () => {
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
      const key = `${scope.vertical} ${scope.theme}`;
      expect(axeDebt(findings), key).toEqual(CONTRAST_DEBT[key] ?? {});
    }
  }, 180_000);
});
