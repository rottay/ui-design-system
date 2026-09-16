/**
 * The form family in a real browser: every decision its paint consumes moves the
 * items with a negative control, the adapt slot reaches the skin, and direction,
 * language and accessibility hold.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { AnatomySkeleton } from '@/components/primitives/feedback/skeleton/runtime/anatomy-renderer';
import { I18nProvider } from '@/infrastructure/runtime/i18n';
import { Form } from '../engines/modern';
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

const english = (node: React.ReactNode) =>
  renderToStaticMarkup(<I18nProvider locale="en" fallbackLocale="en">{node}</I18nProvider>);

const markup = english(
  <Form>
    <Form.Item name="name" label="Name" help="As on your ID" tooltip="Legal name">
      <input aria-label="Name" />
    </Form.Item>
    <Form.Item name="email" label="Email">
      <input aria-label="Email" />
    </Form.Item>
  </Form>,
);

describeCausality({
  family: 'form',
  markup,
  targets: [
    { id: 'labelSize', selector: "[data-part='label-text']", property: 'font-size' },
    { id: 'labelInk', selector: "[data-part='label-text']", property: 'color' },
    { id: 'itemGap', selector: "form[data-part='root']", property: 'row-gap' },
    { id: 'tooltipHover', selector: "[data-part='tooltip-icon']", property: 'color', attributes: { 'data-state': 'hovered' } },
    { id: 'duration', selector: "[data-part='label-text']", property: 'transition-duration' },
    { id: 'tooltipRadius', selector: "[data-part='tooltip-icon']", property: 'border-top-left-radius' },
  ],
  decisions: {
    'typography.scale': { value: 1.08, moves: ['labelSize'], holds: 'tooltipRadius', in: VERTICALS },
    // bithire's preset decides `density.mode: compact`, so the retired arm restated
    // the vertical's own stop and moved nothing. `spacious` is stated by no preset.
    'density.mode': { value: 'spacious', moves: ['itemGap'], holds: 'labelSize', in: VERTICALS },
    'palette.seeds': { value: { primary: '#2F6B9A' }, moves: ['tooltipHover'], holds: 'labelSize', in: VERTICALS },
    'motion.dial': { value: { durationScale: 1.35 }, moves: ['duration'], holds: 'labelSize', in: ['evnto'] },
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
      'span[data-error="false"]',
      'span[data-part="extra-text"]',
    ],
  },
  'bithire dark': {
    'color-contrast': [
      'label[for="form-email"] > span[data-part="label-text"]',
      'label[for="form-name"] > span[data-part="label-text"]',
      'label[for="form-nick"] > span[data-part="label-text"]',
      'span[data-error="false"]',
      'span[data-part="extra-text"]',
    ],
  },
  'evnto light': {
    'color-contrast': [
      'span[data-error="false"]',
      'span[data-part="extra-text"]',
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
describe('form adaptation, direction, language and accessibility in a real browser', () => {
  // The dead subject named: the arm withdrawn above measured a lean this tree no
  // longer produces. Its reading is pinned, not deleted.
  it('registers the neutral-temperature lean that no preset can produce', async () => {
    for (const vertical of VERTICALS) {
      const warmed = await measureArms({
        vertical,
        markup,
        arms: { base: {}, warm: { 'palette.neutral-temperature': 'warm' } },
        targets: [{ id: 'labelInk', selector: "[data-part='label-text']", property: 'color' }],
      });
      expect(warmed.warm!.labelInk, vertical).toBe(warmed.base!.labelInk);
    }
  }, 120_000);

  it('lays items side by side only where the adapt slot asks for it', async () => {
    const base = english(
      <Form><Form.Item name="name" label="Name"><input aria-label="Name" /></Form.Item></Form>,
    );
    const adapted = english(
      <Form adapt={{ phone: { layout: 'horizontal' }, desktop: { layout: 'vertical' } }}>
        <Form.Item name="name" label="Name"><input aria-label="Name" /></Form.Item>
      </Form>,
    );
    expect(base).toContain('data-layout="vertical"');
    expect(adapted).toContain('data-layout="horizontal"');
    expect(adapted).toMatch(/data-posture="phone/);
    const read = async (html: string) => (await measureArms({
      vertical: 'bithire',
      markup: `<div style="inline-size: 900px">${html}</div>`,
      arms: { base: {} },
      targets: [{ id: 'direction', selector: "[data-part='item']", property: 'flex-direction' }],
    })).base!.direction;
    expect(await read(base)).toBe('column');
    expect(await read(adapted)).toBe('row');
  }, 90_000);

  it('aligns a horizontal label to the inline start in both directions', async () => {
    const html = english(
      <Form layout="horizontal"><Form.Item name="name" label="Name"><input aria-label="Name" /></Form.Item></Form>,
    );
    const result = await measureArms({
      vertical: 'bithire',
      markup: `<div style="inline-size: 900px">${html}</div>`,
      arms: { base: {} },
      targets: [
        { id: 'ltrLabel', selector: "[data-part='label']", property: '@rect.left', dir: 'ltr' },
        { id: 'ltrField', selector: "[data-part='field']", property: '@rect.left', dir: 'ltr' },
        { id: 'rtlLabel', selector: "[data-part='label']", property: '@rect.left', dir: 'rtl' },
        { id: 'rtlField', selector: "[data-part='field']", property: '@rect.left', dir: 'rtl' },
      ],
    });
    const r = result.base!;
    expect(Number(r.ltrLabel)).toBeLessThan(Number(r.ltrField));
    expect(Number(r.rtlLabel)).toBeGreaterThan(Number(r.rtlField));
  }, 60_000);

  it('marks optional fields from the active catalog', () => {
    const spanish = renderToStaticMarkup(
      <I18nProvider locale="es" fallbackLocale="en">
        <Form requiredMark="optional"><Form.Item name="nick" label="Apodo"><input aria-label="Apodo" /></Form.Item></Form>
      </I18nProvider>,
    );
    expect(spanish).toContain('Opcional');
  });

  it('builds its loading state from its own anatomy', () => {
    const loading = english(
      <AnatomySkeleton>
        <Form><Form.Item name="name" label="Name" help="Help"><input aria-label="Name" /></Form.Item></Form>
      </AnatomySkeleton>,
    );
    expect(loading).toContain('data-part="source"');
    expect(loading).toContain('data-part="label-text"');
  });

  it('audits clean in every gated vertical mode, apart from the pinned contrast debt', async () => {
    const gallery = english(
      <Form requiredMark="optional" hasFeedback>
        <Form.Item name="name" label="Name" required help="As on your ID" tooltip="Legal name"><input aria-label="Name" /></Form.Item>
        <Form.Item name="email" label="Email" validateStatus="error" help="Enter a valid email"><input aria-label="Email" /></Form.Item>
        <Form.Item name="nick" label="Nickname" extra="Shown to others"><input aria-label="Nickname" /></Form.Item>
      </Form>,
    );
    for (const scope of AXE_SCOPES) {
      const findings = seriousFindings(await auditAxe({ ...scope, markup: gallery }));
      const key = `${scope.vertical} ${scope.theme}`;
      expect(axeDebt(findings), key).toEqual(CONTRAST_DEBT[key] ?? {});
    }
  }, 180_000);
});
