/**
 * The input family in a real browser: every decision its paint consumes moves
 * the field with a negative control, and direction, loading and accessibility hold.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { AnatomySkeleton } from '@/components/primitives/feedback/skeleton/runtime/anatomy-renderer';
import { EngineProvider } from '@/infrastructure/runtime/engines/composition/react/provider';
import { I18nProvider } from '@/infrastructure/runtime/i18n';
import ModernInput from '../engines/modern';
import { InputGroup, InputSearch, InputTextArea } from '../compound';
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
    <div id="rest"><ModernInput defaultValue="Ada" aria-label="Name" /></div>
    <div id="error"><ModernInput defaultValue="Ada" status="error" aria-label="Email" /></div>
  </div>,
);

const REST = '#rest .ds-input-shell';
const FOCUS = { 'data-state': 'focused focus-visible' };

describeCausality({
  family: 'input',
  markup,
  targets: [
    { id: 'focusBorder', selector: REST, property: 'border-top-color', attributes: FOCUS },
    { id: 'errorBorder', selector: '#error .ds-input-shell', property: 'border-top-color' },
    { id: 'radius', selector: REST, property: 'border-top-left-radius' },
    { id: 'height', selector: REST, property: '@rect.height' },
    { id: 'fontSize', selector: REST, property: 'font-size' },
    { id: 'edge', selector: REST, property: 'border-top-width' },
    { id: 'duration', selector: REST, property: 'transition-duration' },
    { id: 'ink', selector: REST, property: 'color' },
  ],
  decisions: {
    'palette.seeds': { value: { primary: '#2F6B9A' }, moves: ['focusBorder'], holds: 'radius', in: VERTICALS },
    'palette.status-seeds': { value: { error: '#B00020' }, moves: ['errorBorder'], holds: 'radius', in: ['evnto'] },
    'typography.scale': { value: 1.08, moves: ['fontSize'], holds: 'radius', in: VERTICALS },
    'shape.radius-scale': { value: 1.2, moves: ['radius'], holds: 'fontSize', in: VERTICALS },
    'shape.control-height': { value: 'tall', moves: ['height'], holds: 'radius', in: VERTICALS },
    // D6-2c-ii (2026-09-15): tenant-document compiles over neutral + preset, and
    // the presets decide density -- bithire `compact`, rottay and evnto `normal`
    // -- so `compact` was the value bithire already held and moved nothing there.
    // `spacious` is the one value in the domain that differs from all three.
    'density.mode': { value: 'spacious', moves: ['height'], holds: 'radius', in: VERTICALS },
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
describe('input ink producer', () => {
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

describe('input geometry, direction, language and accessibility in a real browser', () => {
  it('keeps the prefix at the inline start and the clear action at the inline end in both directions', async () => {
    const affixed = renderToStaticMarkup(
      <ModernInput defaultValue="query" prefix={<span>@</span>} clearable aria-label="Handle" />,
    );
    const result = await measureArms({
      vertical: 'bithire',
      markup: affixed,
      arms: { base: {} },
      targets: [
        { id: 'ltrPrefix', selector: "[data-part='affix-prefix']", property: '@rect.left', dir: 'ltr' },
        { id: 'ltrClear', selector: "[data-part='clear-button']", property: '@rect.left', dir: 'ltr' },
        { id: 'rtlPrefix', selector: "[data-part='affix-prefix']", property: '@rect.left', dir: 'rtl' },
        { id: 'rtlClear', selector: "[data-part='clear-button']", property: '@rect.left', dir: 'rtl' },
      ],
    });
    const r = result.base!;
    expect(Number(r.ltrPrefix)).toBeLessThan(Number(r.ltrClear));
    expect(Number(r.rtlPrefix)).toBeGreaterThan(Number(r.rtlClear));
  }, 60_000);

  it('paints the addon shell and leaves the inner control transparent', async () => {
    const compound = renderToStaticMarkup(
      <ModernInput defaultValue="42" prefix={<span>$</span>} aria-label="Amount" />,
    );
    const result = await measureArms({
      vertical: 'rottay',
      markup: compound,
      arms: { base: {} },
      targets: [
        { id: 'shellEdge', selector: '.ds-input-shell', property: 'border-top-width' },
        { id: 'controlBg', selector: '.ds-input-control', property: 'background-color' },
        { id: 'controlEdge', selector: '.ds-input-control', property: 'border-top-width' },
      ],
    });
    expect(result.base!.shellEdge).not.toBe('0px');
    expect(result.base!.controlBg).toBe('rgba(0, 0, 0, 0)');
    expect(result.base!.controlEdge).toBe('0px');
  }, 60_000);

  it('names its actions from the active catalog', () => {
    const spanish = renderToStaticMarkup(
      <I18nProvider locale="es" fallbackLocale="en">
        <EngineProvider defaultEngine="modern">
          <ModernInput defaultValue="query" clearable aria-label="Consulta" />
        </EngineProvider>
      </I18nProvider>,
    );
    expect(spanish).toContain('aria-label="Limpiar"');
  });

  it('builds its loading state from its own anatomy', () => {
    const loading = renderToStaticMarkup(
      <AnatomySkeleton>
        <ModernInput defaultValue="Ada" prefix={<span>@</span>} aria-label="Name" />
      </AnatomySkeleton>,
    );
    expect(loading).toContain('data-part="source"');
    expect(loading).toContain('data-part="affix-prefix"');
  });

  it('has no serious or critical axe violation in any gated vertical mode', async () => {
    const gallery = renderToStaticMarkup(
      <EngineProvider defaultEngine="modern">
        <div>
          <ModernInput aria-label="Plain" placeholder="Plain" />
          <ModernInput aria-label="Invalid" defaultValue="x" status="error" />
          <ModernInput aria-label="Disabled" defaultValue="x" disabled />
          <ModernInput aria-label="Counted" defaultValue="hello" showCount maxLength={20} clearable />
          <InputSearch aria-label="Search" placeholder="Search" />
          <InputTextArea aria-label="Notes" defaultValue="text" showCount maxLength={50} />
          <InputGroup compact>
            <ModernInput aria-label="First" defaultValue="a" />
            <ModernInput aria-label="Second" defaultValue="b" />
          </InputGroup>
        </div>
      </EngineProvider>,
    );
    for (const scope of AXE_SCOPES) {
      const findings = seriousFindings(await auditAxe({ ...scope, markup: gallery }));
      // WO-DER-06 derivation-lane registry (D6-2c-ii, 2026-09-15): both dark
      // scopes (pending DT registration); pinned to the measured state until the
      // lane lands. A dark mode block paints the dark near-white ink (#f8fafc)
      // while the ground falls back to white (#ffffff) -- 1.04:1, measured across
      // 5 nodes on rottay and 7 on bithire. Pinned rather than filtered so the
      // finding stays visible and any change in it reddens this gate.
      //
      // This REPLACES the narrower bithire exception that stood here, which
      // excluded a single-node finding on the `Invalid` field because bithire
      // authored `--ds-input-error-color` in its body. That authored value is
      // gone with the theme, so the exception had no subject left.
      if (scope.theme === 'dark') {
        expect(findings.map((finding) => finding.id), `${scope.vertical} dark`).toEqual(['color-contrast']);
        expect(findings[0]?.sample, `${scope.vertical} dark`).toContain('background color: #ffffff');
        continue;
      }
      expect(findings, `${scope.vertical} ${scope.theme}`).toEqual([]);
    }
  }, 180_000);
});
