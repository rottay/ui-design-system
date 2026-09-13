/**
 * The cascader family in a real browser: every decision its paint consumes moves
 * the trigger with a negative control; the column keyboard follows the reading
 * direction; language, loading and accessibility hold.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AnatomySkeleton } from '@/components/primitives/feedback/skeleton/runtime/anatomy-renderer';
import { EngineProvider } from '@/infrastructure/runtime/engines/composition/react/provider';
import { I18nProvider } from '@/infrastructure/runtime/i18n';
import ModernCascader from '../engines/modern';
import {
  AXE_SCOPES,
  FIRST_PARTY_VERTICALS as VERTICALS,
  auditAxe,
  describeCausality,
  seriousFindings,
} from '@tests/support/family-causality';

const OPTIONS = [
  { value: 'pt', label: 'Portugal', children: [{ value: 'lis', label: 'Lisbon' }, { value: 'opo', label: 'Porto' }] },
  { value: 'es', label: 'Spain', children: [{ value: 'mad', label: 'Madrid' }] },
];

const markup = renderToStaticMarkup(
  <div>
    <div id="rest"><ModernCascader options={OPTIONS} defaultValue={['pt', 'lis']} allowClear /></div>
    <div id="error"><ModernCascader options={OPTIONS} status="error" /></div>
  </div>,
);

const REST = "#rest [data-part='trigger']";
const FOCUS = { 'data-state': 'focused focus-visible' };

describeCausality({
  family: 'cascader',
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

describe('cascader direction, language and accessibility', () => {
  const openFirstColumn = async () => {
    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);
    return waitFor(() => screen.getByRole('option', { name: /Portugal/ }));
  };

  it('drills forward with ArrowRight in LTR and ArrowLeft in RTL', async () => {
    const ltr = render(<ModernCascader options={OPTIONS} />);
    (await openFirstColumn()).focus();
    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'ArrowRight' });
    await waitFor(() => expect(document.activeElement).toHaveTextContent('Lisbon'));
    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'ArrowLeft' });
    await waitFor(() => expect(document.activeElement).toHaveTextContent('Portugal'));
    ltr.unmount();

    render(
      <div dir="rtl">
        <ModernCascader options={OPTIONS} />
      </div>,
    );
    const portugal = await openFirstColumn();
    portugal.closest('[data-part="dropdown"]')?.setAttribute('dir', 'rtl');
    portugal.focus();
    fireEvent.keyDown(portugal, { key: 'ArrowRight' });
    expect(screen.queryByRole('option', { name: /Lisbon/ })).toBeNull();
    fireEvent.keyDown(portugal, { key: 'ArrowLeft' });
    await waitFor(() => expect(document.activeElement).toHaveTextContent('Lisbon'));
  });

  it('walks a column and type-aheads through the listbox kernel', async () => {
    render(<ModernCascader options={OPTIONS} />);
    const portugal = await openFirstColumn();
    portugal.focus();
    fireEvent.keyDown(portugal, { key: 'End' });
    expect(document.activeElement).toHaveTextContent('Spain');
    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'p' });
    expect(document.activeElement).toHaveTextContent('Portugal');
  });

  it('names its placeholder and clear action from the active catalog', async () => {
    render(
      <I18nProvider locale="es" fallbackLocale="en">
        <ModernCascader options={OPTIONS} defaultValue={['pt', 'lis']} allowClear />
      </I18nProvider>,
    );
    expect(await screen.findByRole('button', { name: 'Limpiar' })).toBeInTheDocument();
    const spanish = renderToStaticMarkup(
      <I18nProvider locale="es" fallbackLocale="en">
        <ModernCascader options={OPTIONS} />
      </I18nProvider>,
    );
    expect(spanish).toContain('aria-label="Seleccionar"');
  });

  it('builds its loading state from its own anatomy', () => {
    const loading = renderToStaticMarkup(
      <AnatomySkeleton>
        <ModernCascader options={OPTIONS} />
      </AnatomySkeleton>,
    );
    expect(loading).toContain('data-part="trigger"');
    expect(loading).toContain('data-part="placeholder"');
  });

  it('has no serious or critical axe violation in any gated vertical mode', async () => {
    const gallery = renderToStaticMarkup(
      <EngineProvider defaultEngine="modern">
        <div>
          <ModernCascader options={OPTIONS} />
          <ModernCascader options={OPTIONS} defaultValue={['pt', 'lis']} allowClear />
          <ModernCascader options={OPTIONS} status="error" />
          <ModernCascader options={OPTIONS} disabled defaultValue={['es', 'mad']} />
          <ModernCascader options={OPTIONS} loading />
        </div>
      </EngineProvider>,
    );
    for (const scope of AXE_SCOPES) {
      const findings = seriousFindings(await auditAxe({ ...scope, markup: gallery }));
      expect(findings, `${scope.vertical} ${scope.theme}`).toEqual([]);
    }
  }, 180_000);
});
