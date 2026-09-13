/**
 * The time-picker family in a real browser: every decision its paint consumes
 * moves the trigger with a negative control; the columns keep the listbox
 * keyboard in both reading directions; language, loading and accessibility hold.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AnatomySkeleton } from '@/components/primitives/feedback/skeleton/runtime/anatomy-renderer';
import { EngineProvider } from '@/infrastructure/runtime/engines/composition/react/provider';
import { I18nProvider } from '@/infrastructure/runtime/i18n';
import ModernTimePicker from '../engines/modern';
import {
  AXE_SCOPES,
  FIRST_PARTY_VERTICALS as VERTICALS,
  auditAxe,
  describeCausality,
  seriousFindings,
} from '@tests/support/family-causality';

const markup = renderToStaticMarkup(
  <div>
    <div id="rest"><ModernTimePicker defaultValue="09:30:00" aria-label="Start" /></div>
    <div id="error"><ModernTimePicker status="error" aria-label="End" /></div>
  </div>,
);

const REST = "#rest [data-part='trigger-input']";
const FOCUS = { 'data-state': 'focused focus-visible' };

describeCausality({
  family: 'time-picker',
  markup,
  targets: [
    { id: 'focusRing', selector: REST, property: 'box-shadow', attributes: FOCUS },
    { id: 'errorBorder', selector: "#error [data-part='trigger-input']", property: 'border-top-color' },
    { id: 'disabledOpacity', selector: REST, property: 'opacity', attributes: { 'data-state': 'disabled' } },
    { id: 'radius', selector: REST, property: 'border-top-left-radius' },
    { id: 'height', selector: REST, property: '@rect.height' },
    { id: 'fontSize', selector: REST, property: 'font-size' },
    { id: 'edge', selector: REST, property: 'border-top-width' },
    { id: 'duration', selector: REST, property: 'transition-duration' },
  ],
  decisions: {
    'palette.seeds': { value: { primary: '#2F6B9A' }, moves: ['focusRing'], holds: 'radius', in: ['bithire', 'evnto'] },
    'palette.status-seeds': { value: { error: '#B00020' }, moves: ['errorBorder'], holds: 'radius', in: VERTICALS },
    'states.focus-style': { value: 'glow', moves: ['focusRing'], holds: 'radius', in: ['bithire', 'evnto'] },
    'states.emphasis': { value: 'strong', moves: ['disabledOpacity'], holds: 'radius', in: VERTICALS },
    'typography.scale': { value: 1.08, moves: ['fontSize'], holds: 'radius', in: VERTICALS },
    'shape.radius-scale': { value: 1.2, moves: ['radius'], holds: 'fontSize', in: VERTICALS },
    'shape.control-height': { value: 'tall', moves: ['height'], holds: 'radius', in: VERTICALS },
    'density.mode': { value: 'compact', moves: ['height'], holds: 'radius', in: VERTICALS },
    'surfaces.border-style': { value: 'none', moves: ['edge'], holds: 'radius', in: VERTICALS },
    'motion.dial': { value: { durationScale: 1.35 }, moves: ['duration'], holds: 'radius', in: ['evnto'] },
  },
});

describe('time-picker keyboard, language and accessibility', () => {
  const openColumns = () => {
    fireEvent.click(screen.getByRole('combobox'));
    return Array.from(document.querySelectorAll<HTMLElement>('[data-part="time-column"]'));
  };

  it('hops columns in the reading direction and walks a column through the listbox kernel', () => {
    const ltr = render(<ModernTimePicker defaultValue="09:30:00" aria-label="Start" />);
    let [hours, minutes] = openColumns();
    const nine = hours.querySelector<HTMLElement>('[data-selected="true"]')!;
    nine.focus();
    fireEvent.keyDown(nine, { key: 'ArrowDown' });
    expect(document.activeElement).toHaveTextContent('10');
    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'End' });
    expect(document.activeElement).toHaveTextContent('23');
    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'ArrowRight' });
    expect(minutes.contains(document.activeElement)).toBe(true);
    ltr.unmount();

    render(<ModernTimePicker defaultValue="09:30:00" aria-label="Start" />);
    [hours, minutes] = openColumns();
    hours.closest('[data-part="panel"]')?.setAttribute('dir', 'rtl');
    const selected = hours.querySelector<HTMLElement>('[data-selected="true"]')!;
    selected.focus();
    fireEvent.keyDown(selected, { key: 'ArrowLeft' });
    expect(minutes.contains(document.activeElement)).toBe(true);
  });

  it('names its panel, columns and meridiem from the active catalog', () => {
    render(
      <I18nProvider locale="es" fallbackLocale="en">
        <ModernTimePicker defaultValue="09:30" format="hh:mm" use12Hours aria-label="Inicio" />
      </I18nProvider>,
    );
    fireEvent.click(screen.getByRole('combobox'));
    expect(screen.getByRole('dialog', { name: 'Selector de hora' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'p. m.' })).toBeInTheDocument();
  });

  it('builds its loading state from its own anatomy', () => {
    const loading = renderToStaticMarkup(
      <AnatomySkeleton>
        <ModernTimePicker defaultValue="09:30:00" aria-label="Start" />
      </AnatomySkeleton>,
    );
    expect(loading).toContain('data-part="trigger-input"');
    expect(loading).toContain('data-part="clock-icon"');
  });

  it('has no serious or critical axe violation in any gated vertical mode', async () => {
    const gallery = renderToStaticMarkup(
      <EngineProvider defaultEngine="modern">
        <div>
          <ModernTimePicker aria-label="Start" />
          <ModernTimePicker defaultValue="09:30:00" aria-label="Filled start" variant="filled" />
          <ModernTimePicker status="error" aria-label="Error start" />
          <ModernTimePicker disabled defaultValue="18:00:00" aria-label="Locked" />
          <ModernTimePicker.RangePicker defaultValue={['09:00:00', '17:00:00']} />
        </div>
      </EngineProvider>,
    );
    for (const scope of AXE_SCOPES) {
      const findings = seriousFindings(await auditAxe({ ...scope, markup: gallery }));
      expect(findings, `${scope.vertical} ${scope.theme}`).toEqual([]);
    }
  }, 180_000);
});
