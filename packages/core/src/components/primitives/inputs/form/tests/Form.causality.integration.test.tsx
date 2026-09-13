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
    'density.mode': { value: 'compact', moves: ['itemGap'], holds: 'labelSize', in: VERTICALS },
    'palette.seeds': { value: { primary: '#2F6B9A' }, moves: ['tooltipHover'], holds: 'labelSize', in: VERTICALS },
    'palette.neutral-temperature': { value: 'warm', moves: ['labelInk'], holds: 'labelSize', in: ['evnto'] },
    'motion.dial': { value: { durationScale: 1.35 }, moves: ['duration'], holds: 'labelSize', in: ['evnto'] },
  },
});

describe('form adaptation, direction, language and accessibility in a real browser', () => {
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

  it('has no serious or critical axe violation in any gated vertical mode', async () => {
    const gallery = english(
      <Form requiredMark="optional" hasFeedback>
        <Form.Item name="name" label="Name" required help="As on your ID" tooltip="Legal name"><input aria-label="Name" /></Form.Item>
        <Form.Item name="email" label="Email" validateStatus="error" help="Enter a valid email"><input aria-label="Email" /></Form.Item>
        <Form.Item name="nick" label="Nickname" extra="Shown to others"><input aria-label="Nickname" /></Form.Item>
      </Form>,
    );
    for (const scope of AXE_SCOPES) {
      expect(seriousFindings(await auditAxe({ ...scope, markup: gallery })), `${scope.vertical} ${scope.theme}`).toEqual([]);
    }
  }, 180_000);
});
