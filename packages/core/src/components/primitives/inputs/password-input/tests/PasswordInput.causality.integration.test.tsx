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
    'palette.neutral-temperature': { value: 'warm', moves: ['ink'], holds: 'radius', in: ['evnto'] },
    'typography.scale': { value: 1.08, moves: ['fontSize'], holds: 'radius', in: VERTICALS },
    'shape.radius-scale': { value: 1.2, moves: ['radius'], holds: 'fontSize', in: VERTICALS },
    'shape.control-height': { value: 'tall', moves: ['height'], holds: 'radius', in: VERTICALS },
    'density.mode': { value: 'compact', moves: ['height'], holds: 'radius', in: VERTICALS },
    'surfaces.border-style': { value: 'none', moves: ['edge'], holds: 'radius', in: ['rottay', 'evnto'] },
    'motion.dial': { value: { durationScale: 1.35 }, moves: ['duration'], holds: 'radius', in: ['evnto'] },
  },
});

describe('password-input geometry, direction, language and accessibility in a real browser', () => {
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

  it('has no serious or critical axe violation in any gated vertical mode', async () => {
    const gallery = renderToStaticMarkup(
      <div>
        <ModernPasswordInput aria-label="Plain" placeholder="Password" />
        <ModernPasswordInput aria-label="Strong" defaultValue="Secret12!" strengthIndicator strengthLevel="strong" />
        <ModernPasswordInput aria-label="Invalid" defaultValue="x" error errorMessage="Too short" />
        <ModernPasswordInput aria-label="Disabled" defaultValue="x" disabled />
      </div>,
    );
    for (const scope of AXE_SCOPES) {
      expect(seriousFindings(await auditAxe({ ...scope, markup: gallery })), `${scope.vertical} ${scope.theme}`).toEqual([]);
    }
  }, 180_000);
});
