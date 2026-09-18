/**
 * The tree-select family in a real browser: every decision its paint consumes
 * moves the trigger with a negative control; the tree keyboard follows the
 * reading direction; indent, language, loading and accessibility hold.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AnatomySkeleton } from '@/components/primitives/feedback/skeleton/runtime/anatomy-renderer';
import { EngineProvider } from '@/infrastructure/runtime/engines/composition/react/provider';
import { I18nProvider } from '@/infrastructure/runtime/i18n';
import ModernTreeSelect from '../engines/modern';
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

const TREE = [
  { value: 'eng', title: 'Engineering', children: [{ value: 'fe', title: 'Frontend' }, { value: 'be', title: 'Backend' }] },
  { value: 'des', title: 'Design' },
];

const markup = renderToStaticMarkup(
  <div>
    <div id="rest"><ModernTreeSelect treeData={TREE} aria-label="Team" /></div>
    <div id="error"><ModernTreeSelect treeData={TREE} status="error" aria-label="Owner" /></div>
  </div>,
);

const REST = "#rest [data-part='trigger']";
const FOCUS = { 'data-state': 'focused focus-visible' };

describeCausality({
  family: 'tree-select',
  markup,
  targets: [
    { id: 'focusRing', selector: REST, property: 'box-shadow', attributes: FOCUS },
    { id: 'errorBorder', selector: "#error [data-part='trigger']", property: 'border-top-color' },
    { id: 'disabledOpacity', selector: REST, property: 'opacity', attributes: { 'data-disabled': 'true' } },
    { id: 'radius', selector: REST, property: 'border-top-left-radius' },
    { id: 'height', selector: REST, property: '@rect.height' },
    { id: 'fontSize', selector: REST, property: 'font-size' },
    { id: 'edge', selector: REST, property: 'border-top-width' },
    { id: 'duration', selector: REST, property: 'transition-duration' },
  ],
  decisions: {
    'palette.seeds': { value: { primary: '#2F6B9A' }, moves: ['focusRing'], holds: 'radius', in: VERTICALS },
    'palette.status-seeds': { value: { error: '#B00020' }, moves: ['errorBorder'], holds: 'radius', in: VERTICALS },
    'states.focus-style': { value: 'glow', moves: ['focusRing'], holds: 'radius', in: VERTICALS },
    // `subtle`, not `strong`: bithire's preset already decides strong, so that arm
    // restated the baseline and moved nothing (D6-2c-ii-RED, 2026-09-15).
    'states.emphasis': { value: 'subtle', moves: ['disabledOpacity'], holds: 'radius', in: VERTICALS },
    'typography.scale': { value: 1.08, moves: ['fontSize'], holds: 'radius', in: VERTICALS },
    'shape.radius-scale': { value: 1.2, moves: ['radius'], holds: 'fontSize', in: VERTICALS },
    'shape.control-height': { value: 'tall', moves: ['height'], holds: 'radius', in: VERTICALS },
    // `spacious`, not `compact`: bithire's preset already decides compact, so that
    // arm restated the baseline and moved nothing (D6-2c-ii-RED, 2026-09-15).
    'density.mode': { value: 'spacious', moves: ['height'], holds: 'radius', in: VERTICALS },
    'surfaces.border-style': { value: 'none', moves: ['edge'], holds: 'radius', in: VERTICALS },
    'motion.dial': { value: { durationScale: 1.35 }, moves: ['duration'], holds: 'radius', in: ['evnto'] },
  },
});

/**
 * WO-DER-06 derivation-lane registry (D6-2c-ii-RED, 2026-09-15). The neutral
 * compile leaves this family's ink and its ground on opposite sides of the
 * ramp, so axe reports serious `color-contrast`. Measured at the pre-lot tree:
 * ZERO findings on all four scopes, so every entry below is lot-caused, not
 * inherited. Pinned by finding id and the IDENTITY of every failing node:
 * another kind of violation, one more node, one node repaired, a same-count
 * swap, or a finding in a scope pinned clean turns this row red. It clears when
 * the derivation lane gives the family a legible pair (EVI-02, 2026-09-15).
 *
 * `bithire dark` had 3 rows and they DRAINED: that scope's dark block now
 * re-derives its own canvas ground instead of inheriting the light body's, so
 * the trigger and placeholder inks are read against the ground they were
 * designed for.
 * Dropped by identity, not waived -- with no entry the scope must measure
 * clean, and a relapse reddens here.
 */
const AXE_CONTRAST_GAP: Readonly<Record<string, AxeDebt>> = {
  'rottay dark': {
    'color-contrast': [
      'div[aria-label="Team"] > span[data-part="placeholder"]',
      'div[data-status="error"] > span[data-part="placeholder"]',
      'span[data-part="value"]',
    ],
  },
  'bithire light': {
    'color-contrast': [
      'div[aria-label="Team"] > span[data-part="placeholder"]',
      'div[data-status="error"] > span[data-part="placeholder"]',
    ],
  },
  'evnto light': {
    'color-contrast': [
      'div[aria-label="Team"] > span[data-part="placeholder"]',
      'div[data-status="error"] > span[data-part="placeholder"]',
    ],
  },
};

describe('tree-select direction, indent, language and accessibility', () => {
  const openTree = async () => {
    fireEvent.click(screen.getByRole('combobox'));
    const row = await waitFor(() => screen.getByRole('treeitem', { name: /Engineering/ }));
    row.focus();
    return row;
  };

  it('expands with ArrowRight in LTR and ArrowLeft in RTL', async () => {
    const ltr = render(<ModernTreeSelect treeData={TREE} aria-label="Team" />);
    const row = await openTree();
    fireEvent.keyDown(row, { key: 'ArrowRight' });
    await waitFor(() => expect(row).toHaveAttribute('aria-expanded', 'true'));
    fireEvent.keyDown(row, { key: 'ArrowLeft' });
    await waitFor(() => expect(row).toHaveAttribute('aria-expanded', 'false'));
    ltr.unmount();

    // Direction arrives through the i18n authority these families now read.
    // The manual `dir` stamp on the portalled panel existed only to feed the
    // DOM probe across the portal boundary; the locale crosses it by context.
    render(
      <I18nProvider locale="ar" fallbackLocale="en">
        <ModernTreeSelect treeData={TREE} aria-label="Team" />
      </I18nProvider>,
    );
    const rtlRow = await openTree();
    fireEvent.keyDown(rtlRow, { key: 'ArrowRight' });
    expect(rtlRow).toHaveAttribute('aria-expanded', 'false');
    fireEvent.keyDown(rtlRow, { key: 'ArrowLeft' });
    await waitFor(() => expect(rtlRow).toHaveAttribute('aria-expanded', 'true'));
  });

  it('indents a child row by its level on the inline start in both directions', async () => {
    const rows = renderToStaticMarkup(
      <div data-part="dropdown" className="ds-tree-select ds-tree-select--modern ds-tree-select-panel">
        <div data-part="option" style={{ '--ds-tree-select-level': 0 } as React.CSSProperties} id="top" />
        <div data-part="option" style={{ '--ds-tree-select-level': 2 } as React.CSSProperties} id="deep" />
      </div>,
    );
    const result = await measureArms({
      vertical: 'bithire',
      markup: rows,
      // `spacious`: bithire's preset already decides compact, so that arm restated
      // the baseline and the indent could not move (D6-2c-ii-RED, 2026-09-15).
      arms: { base: {}, spacious: { 'density.mode': 'spacious' } },
      targets: [
        { id: 'top', selector: '#top', property: 'padding-inline-start' },
        { id: 'deep', selector: '#deep', property: 'padding-inline-start' },
        { id: 'deepRtl', selector: '#deep', property: 'padding-right', dir: 'rtl' },
      ],
    });
    expect(parseFloat(result.base!.deep)).toBeGreaterThan(parseFloat(result.base!.top));
    expect(result.base!.deepRtl).toBe(result.base!.deep);
    expect(result.spacious!.deep).not.toBe(result.base!.deep);
  }, 60_000);

  it('names its placeholder and clear action from the active catalog', async () => {
    render(
      <I18nProvider locale="es" fallbackLocale="en">
        <ModernTreeSelect treeData={TREE} defaultValue="des" allowClear />
      </I18nProvider>,
    );
    expect(await screen.findByRole('button', { name: 'Limpiar' })).toBeInTheDocument();
    const spanish = renderToStaticMarkup(
      <I18nProvider locale="es" fallbackLocale="en">
        <ModernTreeSelect treeData={TREE} />
      </I18nProvider>,
    );
    expect(spanish).toContain('Seleccionar');
  });

  it('builds its loading state from its own anatomy', () => {
    const loading = renderToStaticMarkup(
      <AnatomySkeleton>
        <ModernTreeSelect treeData={TREE} aria-label="Team" />
      </AnatomySkeleton>,
    );
    expect(loading).toContain('data-part="trigger"');
    expect(loading).toContain('data-part="placeholder"');
  });

  // WO-DER-06 N1 (closed 2026-09-15): the foundation derives the ring from the
  // primary seed in both scopes, so a seed reaches the ring on every vertical.
  it('the seed reaches the focus ring on every vertical', async () => {
    for (const vertical of VERTICALS) {
      const seeded = await measureArms({
        vertical,
        markup,
        arms: { base: {}, seeded: { 'palette.seeds': { primary: '#2F6B9A' } } },
        targets: [
          { id: 'ringColor', selector: REST, property: '--ds-focus-ring-color' },
          { id: 'primary', selector: REST, property: '--ds-color-primary' },
        ],
      });
      expect(seeded.seeded!.ringColor.trim(), `${vertical}: the seed reaches the ring`).not.toBe(seeded.base!.ringColor.trim());
      expect(seeded.seeded!.primary.trim(), `${vertical}: the seed reaches the palette`).not.toBe(seeded.base!.primary.trim());
    }
  }, 180_000);

  it('audits clean in every gated vertical mode, apart from the pinned contrast debt', async () => {
    const gallery = renderToStaticMarkup(
      <EngineProvider defaultEngine="modern">
        <div>
          <ModernTreeSelect treeData={TREE} aria-label="Team" />
          <ModernTreeSelect treeData={TREE} defaultValue="des" allowClear aria-label="Owner" />
          <ModernTreeSelect treeData={TREE} status="error" aria-label="Approver" />
          <ModernTreeSelect treeData={TREE} disabled aria-label="Locked" />
        </div>
      </EngineProvider>,
    );
    for (const scope of AXE_SCOPES) {
      const findings = seriousFindings(await auditAxe({ ...scope, markup: gallery }));
      const key = `${scope.vertical} ${scope.theme}`;
      expect(axeDebt(findings), key).toEqual(AXE_CONTRAST_GAP[key] ?? {});
    }
  }, 180_000);
});
