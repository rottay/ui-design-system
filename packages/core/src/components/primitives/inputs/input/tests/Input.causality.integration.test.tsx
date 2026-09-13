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
    'palette.neutral-temperature': { value: 'warm', moves: ['ink'], holds: 'radius', in: ['evnto'] },
    'typography.scale': { value: 1.08, moves: ['fontSize'], holds: 'radius', in: VERTICALS },
    'shape.radius-scale': { value: 1.2, moves: ['radius'], holds: 'fontSize', in: VERTICALS },
    'shape.control-height': { value: 'tall', moves: ['height'], holds: 'radius', in: VERTICALS },
    'density.mode': { value: 'compact', moves: ['height'], holds: 'radius', in: VERTICALS },
    'surfaces.border-style': { value: 'none', moves: ['edge'], holds: 'radius', in: ['rottay', 'evnto'] },
    'motion.dial': { value: { durationScale: 1.35 }, moves: ['duration'], holds: 'radius', in: ['evnto'] },
  },
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
      // bithire authors --ds-input-error-color once in its body, so its dark mode keeps the light ink (routed to WO-DER-06).
      const vertical = scope.vertical === 'bithire' && scope.theme === 'dark'
        ? findings.filter((finding) => !(finding.id === 'color-contrast' && finding.nodes === 1 && finding.sample?.includes('aria-label="Invalid"')))
        : findings;
      expect(vertical, `${scope.vertical} ${scope.theme}`).toEqual([]);
    }
  }, 180_000);
});
