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
    'states.emphasis': { value: 'strong', moves: ['disabledOpacity'], holds: 'radius', in: VERTICALS },
    'typography.scale': { value: 1.08, moves: ['fontSize'], holds: 'radius', in: VERTICALS },
    'shape.radius-scale': { value: 1.2, moves: ['radius'], holds: 'fontSize', in: VERTICALS },
    'shape.control-height': { value: 'tall', moves: ['height'], holds: 'radius', in: VERTICALS },
    'density.mode': { value: 'compact', moves: ['height'], holds: 'radius', in: VERTICALS },
    'surfaces.border-style': { value: 'none', moves: ['edge'], holds: 'radius', in: VERTICALS },
    'motion.dial': { value: { durationScale: 1.35 }, moves: ['duration'], holds: 'radius', in: ['evnto'] },
  },
});

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

    render(<ModernTreeSelect treeData={TREE} aria-label="Team" />);
    const rtlRow = await openTree();
    rtlRow.closest('[data-part="dropdown"]')?.setAttribute('dir', 'rtl');
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
      arms: { base: {}, compact: { 'density.mode': 'compact' } },
      targets: [
        { id: 'top', selector: '#top', property: 'padding-inline-start' },
        { id: 'deep', selector: '#deep', property: 'padding-inline-start' },
        { id: 'deepRtl', selector: '#deep', property: 'padding-right', dir: 'rtl' },
      ],
    });
    expect(parseFloat(result.base!.deep)).toBeGreaterThan(parseFloat(result.base!.top));
    expect(result.base!.deepRtl).toBe(result.base!.deep);
    expect(result.compact!.deep).not.toBe(result.base!.deep);
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

  it('has no serious or critical axe violation in any gated vertical mode', async () => {
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
      expect(findings, `${scope.vertical} ${scope.theme}`).toEqual([]);
    }
  }, 180_000);
});
