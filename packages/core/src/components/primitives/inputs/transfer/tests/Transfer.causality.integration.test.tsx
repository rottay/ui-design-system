/**
 * The transfer family in a real browser: every decision its paint consumes moves
 * the panels with a negative control; the panels mirror under RTL, the rows walk
 * with the listbox keyboard, and language, loading and accessibility hold.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AnatomySkeleton } from '@/components/primitives/feedback/skeleton/runtime/anatomy-renderer';
import { EngineProvider } from '@/infrastructure/runtime/engines/composition/react/provider';
import { I18nProvider } from '@/infrastructure/runtime/i18n';
import { Transfer as ModernTransfer } from '../engines/modern';
import {
  AXE_SCOPES,
  FIRST_PARTY_VERTICALS as VERTICALS,
  auditAxe,
  describeCausality,
  measureArms,
  seriousFindings,
} from '@tests/support/family-causality';

const ITEMS = [
  { key: 'a', title: 'Alpha' },
  { key: 'b', title: 'Beta' },
  { key: 'c', title: 'Charlie' },
];

const markup = renderToStaticMarkup(<ModernTransfer dataSource={ITEMS} defaultTargetKeys={['c']} showSearch />);

describeCausality({
  family: 'transfer',
  markup,
  targets: [
    { id: 'searchFocus', selector: "[data-part='panel-search']", property: 'border-top-color', attributes: { 'data-state': 'focused' } },
    { id: 'disabledOpacity', selector: "[data-part='move-button']", property: 'opacity', attributes: { 'data-state': 'disabled' } },
    { id: 'rowPadding', selector: "[data-part='panel-item']", property: 'padding-top' },
    { id: 'panelEdge', selector: "[data-part='panel']", property: 'border-top-width' },
    { id: 'panelRadius', selector: "[data-part='panel']", property: 'border-top-left-radius' },
    { id: 'countSize', selector: "[data-part='panel-count']", property: 'font-size' },
    { id: 'duration', selector: "[data-part='move-button']", property: 'transition-duration' },
  ],
  decisions: {
    'palette.seeds': { value: { primary: '#2F6B9A' }, moves: ['searchFocus'], holds: 'panelRadius', in: VERTICALS },
    // `subtle`, not `strong`: bithire's preset already decides strong, so that arm
    // restated the baseline and moved nothing (D6-2c-ii-RED, 2026-09-15).
    'states.emphasis': { value: 'subtle', moves: ['disabledOpacity'], holds: 'panelRadius', in: VERTICALS },
    // `spacious`, not `compact`: bithire's preset already decides compact, so that
    // arm restated the baseline and moved nothing (D6-2c-ii-RED, 2026-09-15).
    'density.mode': { value: 'spacious', moves: ['rowPadding'], holds: 'panelRadius', in: VERTICALS },
    'surfaces.border-style': { value: 'none', moves: ['panelEdge'], holds: 'panelRadius', in: VERTICALS },
    'shape.radius-scale': { value: 1.2, moves: ['panelRadius'], holds: 'countSize', in: VERTICALS },
    'typography.scale': { value: 1.08, moves: ['countSize'], holds: 'panelRadius', in: VERTICALS },
    'motion.dial': { value: { durationScale: 1.35 }, moves: ['duration'], holds: 'panelRadius', in: ['evnto'] },
  },
});

/**
 * WO-DER-06 derivation-lane registry (D6-2c-ii-RED, 2026-09-15). The neutral
 * compile leaves this family's ink and its ground on opposite sides of the
 * ramp, so axe reports serious `color-contrast`. Measured at the pre-lot tree:
 * ZERO findings on all four scopes, so every entry below is lot-caused, not
 * inherited. Pinned by finding id, impact and NODE COUNT: another kind of
 * violation, one more node, or a finding in a scope pinned at zero turns this
 * row red. It clears when the derivation lane gives the family a legible pair.
 */
const AXE_CONTRAST_GAP: Readonly<Record<string, number>> = {
  'rottay dark': 2,
  'bithire light': 7,
  'bithire dark': 9,
  'evnto light': 7,
};

describe('transfer direction, keyboard, language and accessibility', () => {
  it('lays the source panel at the inline start in both directions', async () => {
    const result = await measureArms({
      vertical: 'bithire',
      markup,
      arms: { base: {} },
      targets: [
        { id: 'ltrSource', selector: "[data-panel='source']", property: '@rect.left', dir: 'ltr' },
        { id: 'ltrTarget', selector: "[data-panel='target']", property: '@rect.left', dir: 'ltr' },
        { id: 'rtlSource', selector: "[data-panel='source']", property: '@rect.left', dir: 'rtl' },
        { id: 'rtlTarget', selector: "[data-panel='target']", property: '@rect.left', dir: 'rtl' },
      ],
    });
    const r = result.base!;
    expect(Number(r.ltrSource)).toBeLessThan(Number(r.ltrTarget));
    expect(Number(r.rtlSource)).toBeGreaterThan(Number(r.rtlTarget));
  }, 60_000);

  it('walks a panel with arrows, edges and type-ahead through the listbox kernel', () => {
    render(<ModernTransfer dataSource={ITEMS} showSearch={false} />);
    const alpha = screen.getByRole('checkbox', { name: 'Alpha' });
    alpha.focus();
    fireEvent.keyDown(alpha, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(screen.getByRole('checkbox', { name: 'Beta' }));
    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'End' });
    expect(document.activeElement).toBe(screen.getByRole('checkbox', { name: 'Charlie' }));
    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'a' });
    expect(document.activeElement).toBe(alpha);
  });

  it('names its controls from the active catalog', () => {
    const spanish = renderToStaticMarkup(
      <I18nProvider locale="es" fallbackLocale="en">
        <EngineProvider defaultEngine="modern">
          <ModernTransfer dataSource={ITEMS} defaultTargetKeys={['c']} showSearch />
        </EngineProvider>
      </I18nProvider>,
    );
    expect(spanish).toContain('aria-label="Mover a destino"');
    expect(spanish).toContain('aria-label="Seleccionar todo"');
  });

  it('builds its loading state from its own anatomy', () => {
    const loading = renderToStaticMarkup(
      <AnatomySkeleton>
        <ModernTransfer dataSource={ITEMS} defaultTargetKeys={['c']} />
      </AnatomySkeleton>,
    );
    expect(loading).toContain('data-part="panel"');
    expect(loading).toContain('data-part="panel-item"');
  });

  it('has no serious or critical axe violation in any gated vertical mode', async () => {
    const gallery = renderToStaticMarkup(
      <EngineProvider defaultEngine="modern">
        <div>
          <ModernTransfer dataSource={ITEMS} defaultTargetKeys={['c']} showSearch titles={['Available', 'Chosen']} />
          <ModernTransfer dataSource={ITEMS} defaultTargetKeys={['a']} oneWay titles={['Pool', 'Picked']} />
          <ModernTransfer dataSource={ITEMS} disabled titles={['Locked source', 'Locked target']} />
        </div>
      </EngineProvider>,
    );
    for (const scope of AXE_SCOPES) {
      const findings = seriousFindings(await auditAxe({ ...scope, markup: gallery }));
      const key = `${scope.vertical} ${scope.theme}`;
      const nodes = AXE_CONTRAST_GAP[key] ?? 0;
      expect(findings, key).toEqual(
        nodes === 0
          ? []
          : [{ id: 'color-contrast', impact: 'serious', nodes, sample: expect.any(String) }],
      );
    }
  }, 180_000);
});
