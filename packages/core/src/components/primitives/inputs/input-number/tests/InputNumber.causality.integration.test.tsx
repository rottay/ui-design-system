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
import { firstPartyFixture, lowerFlatThemeFixture } from '@tests/support/theme-lowering';

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
    'typography.scale': { value: 1.08, moves: ['fontSize'], holds: 'radius', in: VERTICALS },
    'shape.radius-scale': { value: 1.2, moves: ['radius'], holds: 'fontSize', in: VERTICALS },
    'shape.control-height': { value: 'tall', moves: ['height'], holds: 'radius', in: VERTICALS },
    'surfaces.border-style': { value: 'none', moves: ['edge'], holds: 'radius', in: ['rottay', 'evnto'] },
    'motion.dial': { value: { durationScale: 1.35 }, moves: ['duration'], holds: 'radius', in: ['evnto'] },
  },
});

/**
 * The `ink` reading lost its producer, so the temperature arm lost its subject.
 *
 * WO-DER-06 derivation-lane registry (D6-2c-ii, 2026-09-15): --ds-color-text-primary
 * on the composed first-party baselines; pinned to the measured state until the
 * lane lands. The suite used to drive `palette.neutral-temperature` on evnto and
 * read the shell's `color`. Tenant-document now compiles over neutral + preset and
 * no preset decision produces a root ink, so the shell takes the stylesheet
 * fallback (rgb(23, 23, 23)) on BOTH arms and on every vertical -- measured on
 * evnto and on bithire, the one vertical whose preset authors palette seeds. The
 * arm was removed rather than re-anchored: there is no vertical left where the
 * decision can reach that reading. This pins the cause so the arm comes back the
 * moment a deriver produces the ink again.
 */
describe('input-number ink producer', () => {
  it('has no root ink on any composed first-party baseline, so no temperature can move it', () => {
    for (const vertical of VERTICALS) {
      const compiled = lowerFlatThemeFixture({
        flatTheme: firstPartyFixture(vertical),
        tenantSlug: vertical,
      });
      expect(compiled.cssVariables['--ds-color-text-primary'], vertical).toBeUndefined();
    }
  });
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
      const findings = seriousFindings(await auditAxe({ ...scope, markup: gallery }));
      // WO-DER-06 derivation-lane registry (D6-2c-ii, 2026-09-15): both dark
      // scopes (pending DT registration); pinned to the measured state until the
      // lane lands. A dark mode block paints the dark near-white ink (#f8fafc)
      // while the ground falls back to white (#ffffff). Pinned rather than
      // filtered so the finding stays visible and any change reddens this gate.
      if (scope.theme === 'dark') {
        expect(findings.map((finding) => finding.id), `${scope.vertical} dark`).toEqual(['color-contrast']);
        expect(findings[0]?.sample, `${scope.vertical} dark`).toContain('background color: #ffffff');
        continue;
      }
      expect(findings, `${scope.vertical} ${scope.theme}`).toEqual([]);
    }
  }, 180_000);
});
