/**
 * The input-number family in a real browser: every decision its paint consumes moves
 * the field with a negative control, and direction, language and accessibility hold.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { AnatomySkeleton } from '@/components/primitives/feedback/skeleton/runtime/anatomy-renderer';
import { I18nProvider } from '@/infrastructure/runtime/i18n';
import ModernInputNumber from '../engines/modern';
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
    <div id="rest"><ModernInputNumber defaultValue={3} aria-label="Quantity" /></div>
    <div id="error"><ModernInputNumber defaultValue={3} status="error" aria-label="Seats" /></div>
  </div>,
);

const ROOT = "#rest [data-part='root']";

describeCausality({
  family: 'input-number',
  markup,
  targets: [
    { id: 'focusBorder', selector: ROOT, property: 'border-top-color', attributes: { 'data-state': 'focused focus-visible' } },
    { id: 'errorBorder', selector: "#error [data-part='root']", property: 'border-top-color' },
    { id: 'radius', selector: ROOT, property: 'border-top-left-radius' },
    { id: 'height', selector: ROOT, property: '@rect.height' },
    { id: 'fontSize', selector: ROOT, property: 'font-size' },
    { id: 'edge', selector: ROOT, property: 'border-top-width' },
    { id: 'duration', selector: ROOT, property: 'transition-duration' },
    { id: 'ink', selector: ROOT, property: 'color' },
  ],
  decisions: {
    'palette.seeds': { value: { primary: '#2F6B9A' }, moves: ['focusBorder'], holds: 'radius', in: ['bithire', 'evnto'] },
    'palette.status-seeds': { value: { error: '#B00020' }, moves: ['errorBorder'], holds: 'radius', in: ['evnto'] },
    'palette.neutral-temperature': { value: 'warm', moves: ['ink'], holds: 'radius', in: ['evnto'] },
    'typography.scale': { value: 1.08, moves: ['fontSize'], holds: 'radius', in: VERTICALS },
    'shape.radius-scale': { value: 1.2, moves: ['radius'], holds: 'fontSize', in: VERTICALS },
    'shape.control-height': { value: 'tall', moves: ['height'], holds: 'radius', in: VERTICALS },
    'surfaces.border-style': { value: 'none', moves: ['edge'], holds: 'radius', in: ['rottay', 'evnto'] },
    'motion.dial': { value: { durationScale: 1.35 }, moves: ['duration'], holds: 'radius', in: ['evnto'] },
  },
});

describe('input-number geometry, direction, language and accessibility in a real browser', () => {
  it('mirrors its addons and steppers in a right-to-left page', async () => {
    const field = renderToStaticMarkup(
      <ModernInputNumber defaultValue={3} addonBefore="$" addonAfter="USD" aria-label="Price" />,
    );
    const result = await measureArms({
      vertical: 'bithire',
      markup: field,
      arms: { base: {} },
      targets: [
        { id: 'ltrBefore', selector: "[data-part='addon-before']", property: '@rect.left', dir: 'ltr' },
        { id: 'ltrAfter', selector: "[data-part='addon-after']", property: '@rect.left', dir: 'ltr' },
        { id: 'ltrSteppers', selector: "[data-part='steppers']", property: '@rect.left', dir: 'ltr' },
        { id: 'ltrRoot', selector: "[data-part='root']", property: '@rect.left', dir: 'ltr' },
        { id: 'rtlBefore', selector: "[data-part='addon-before']", property: '@rect.left', dir: 'rtl' },
        { id: 'rtlAfter', selector: "[data-part='addon-after']", property: '@rect.left', dir: 'rtl' },
        { id: 'rtlSteppers', selector: "[data-part='steppers']", property: '@rect.left', dir: 'rtl' },
        { id: 'rtlRoot', selector: "[data-part='root']", property: '@rect.left', dir: 'rtl' },
        { id: 'rtlStartRadius', selector: "[data-part='addon-before']", property: 'border-top-right-radius', dir: 'rtl' },
      ],
    });
    const r = result.base!;
    expect(Number(r.ltrBefore)).toBeLessThan(Number(r.ltrAfter));
    expect(Number(r.rtlBefore)).toBeGreaterThan(Number(r.rtlAfter));
    expect(Number(r.ltrSteppers) - Number(r.ltrRoot)).toBeGreaterThan(Number(r.rtlSteppers) - Number(r.rtlRoot));
    expect(r.rtlStartRadius).not.toBe('0px');
  }, 60_000);

  it('names its steppers from the active catalog', () => {
    const spanish = renderToStaticMarkup(
      <I18nProvider locale="es" fallbackLocale="en">
        <ModernInputNumber defaultValue={3} aria-label="Cantidad" />
      </I18nProvider>,
    );
    expect(spanish).toContain('aria-label="Aumentar"');
    expect(spanish).toContain('aria-label="Disminuir"');
  });

  it('builds its loading state from its own anatomy', () => {
    const loading = renderToStaticMarkup(
      <AnatomySkeleton>
        <ModernInputNumber defaultValue={3} addonBefore="$" aria-label="Price" />
      </AnatomySkeleton>,
    );
    expect(loading).toContain('data-part="source"');
    expect(loading).toContain('data-part="addon-before"');
  });

  it('has no serious or critical axe violation in any gated vertical mode', async () => {
    const gallery = renderToStaticMarkup(
      <div>
        <ModernInputNumber defaultValue={3} min={0} max={10} aria-label="Quantity" />
        <ModernInputNumber defaultValue={3} addonBefore="$" addonAfter="USD" prefix="#" aria-label="Price" />
        <ModernInputNumber defaultValue={3} status="error" aria-label="Seats" />
        <ModernInputNumber defaultValue={3} disabled aria-label="Locked" />
      </div>,
    );
    for (const scope of AXE_SCOPES) {
      expect(seriousFindings(await auditAxe({ ...scope, markup: gallery })), `${scope.vertical} ${scope.theme}`).toEqual([]);
    }
  }, 180_000);
});
