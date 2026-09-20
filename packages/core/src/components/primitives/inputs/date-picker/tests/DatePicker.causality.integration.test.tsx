/**
 * The date-picker family in a real browser: every decision its paint consumes
 * moves the trigger or the calendar with a negative control; the grid follows
 * the locale's week and the reading direction, and loading and accessibility hold.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AnatomySkeleton } from '@/components/primitives/feedback/skeleton/runtime/anatomy-renderer';
import { EngineProvider } from '@/infrastructure/runtime/engines/composition/react/provider';
import { I18nProvider } from '@/infrastructure/runtime/i18n';
import ModernDatePicker from '../engines/modern';
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

const openPanelMarkup = (element: React.ReactElement): string => {
  const view = render(element);
  const panel = document.querySelector('.ds-date-picker-panel')!.outerHTML;
  view.unmount();
  return panel;
};

const markup =
  renderToStaticMarkup(
    <div>
      <div id="rest"><ModernDatePicker defaultValue="2026-03-10" aria-label="Start" /></div>
      <div id="error"><ModernDatePicker status="error" aria-label="End" /></div>
    </div>,
  ) + `<div id="panel">${openPanelMarkup(<ModernDatePicker open defaultValue="2026-03-10" aria-label="Panel" />)}</div>`;

const REST = "#rest [data-part='trigger-input']";
const SELECTED = "#panel [data-part='cell'][data-selected='true']";

describeCausality({
  family: 'date-picker',
  markup,
  targets: [
    { id: 'focusRing', selector: REST, property: 'box-shadow', attributes: { 'data-state': 'focused focus-visible' } },
    { id: 'errorBorder', selector: "#error [data-part='trigger-input']", property: 'border-top-color' },
    { id: 'disabledOpacity', selector: REST, property: 'opacity', attributes: { 'data-state': 'disabled' } },
    { id: 'radius', selector: REST, property: 'border-top-left-radius' },
    { id: 'height', selector: REST, property: '@rect.height' },
    { id: 'fontSize', selector: REST, property: 'font-size' },
    { id: 'edge', selector: REST, property: 'border-top-width' },
    { id: 'duration', selector: REST, property: 'transition-duration' },
    { id: 'selectedBg', selector: SELECTED, property: 'background-color' },
    { id: 'cellRadius', selector: SELECTED, property: 'border-top-left-radius' },
    { id: 'cellHeight', selector: SELECTED, property: '@rect.height' },
    { id: 'weekdaySize', selector: "#panel [data-part='weekday-header']", property: 'font-size' },
    { id: 'panelShadow', selector: "#panel [data-part='panel']", property: 'box-shadow' },
    { id: 'cellHover', selector: "#panel [data-part='cell']:not([data-selected])", property: 'background-color', attributes: { 'data-state': 'hovered' } },
  ],
  decisions: {
    'palette.seeds': { value: { primary: '#2F6B9A' }, moves: ['selectedBg'], holds: 'radius', in: VERTICALS },
    'palette.status-seeds': { value: { error: '#B00020' }, moves: ['errorBorder'], holds: 'radius', in: VERTICALS },
    'states.focus-style': { value: 'glow', moves: ['focusRing'], holds: 'radius', in: ['bithire', 'evnto'] },
    // `subtle`, not `strong`: bithire's preset already decides strong, so that arm
    // restated the baseline and moved nothing (D6-2c-ii-RED, 2026-09-15).
    'states.emphasis': { value: 'subtle', moves: ['disabledOpacity'], holds: 'radius', in: VERTICALS },
    'typography.scale': { value: 1.08, moves: ['fontSize', 'weekdaySize'], holds: 'radius', in: VERTICALS },
    'shape.radius-scale': { value: 1.2, moves: ['radius', 'cellRadius'], holds: 'fontSize', in: VERTICALS },
    'shape.control-height': { value: 'tall', moves: ['height'], holds: 'radius', in: VERTICALS },
    // `spacious`, not `compact`: bithire's preset already decides compact, so that
    // arm restated the baseline and moved nothing (D6-2c-ii-RED, 2026-09-15).
    'density.mode': { value: 'spacious', moves: ['cellHeight'], holds: 'radius', in: VERTICALS },
    'surfaces.border-style': { value: 'none', moves: ['edge'], holds: 'radius', in: VERTICALS },
    'surfaces.elevation-posture': { value: 'elevated', moves: ['panelShadow'], holds: 'radius', in: ['rottay'] },
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
 * `bithire dark` had 4 rows and they DRAINED: that scope's dark block now
 * re-derives its own canvas ground instead of inheriting the light body's, so
 * the family's quiet ink is read against the ground it was designed for.
 * Dropped by identity, not waived -- with no entry the scope must measure
 * clean, and a relapse reddens here.
 *
 * `rottay dark` DRAINED at the Input base, not in this family: every node in
 * that row was a control ground, and the Input component base stated
 * `--ds-input-bg: var(--ds-color-white)` mode-lessly, which shadowed the
 * mode-aware chain beneath it (the component tokens sit in a LATER cascade
 * layer than the theme). The base now states
 * `var(--ds-color-bg-input, var(--ds-surface-control))`, so the control grounds
 * at `#0F0F12` there. Dropped by identity, not waived: with no entry the scope
 * must measure clean, and a relapse reddens here.
 */
const AXE_CONTRAST_GAP: Readonly<Record<string, AxeDebt>> = {
};

describe('date-picker calendar, language and accessibility', () => {
  const grid = () => screen.getByRole('grid');
  const focusedLabel = () => (document.activeElement as HTMLElement).getAttribute('aria-label');

  it('walks the date grid with the calendar kernel and mirrors the arrows under RTL', () => {
    const ltr = render(<ModernDatePicker open defaultValue="2026-03-10" aria-label="Start" />);
    const selected = within(grid()).getByRole('gridcell', { selected: true });
    selected.focus();
    fireEvent.keyDown(selected, { key: 'ArrowRight' });
    expect(document.activeElement).toHaveTextContent('11');
    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'ArrowDown' });
    expect(document.activeElement).toHaveTextContent('18');
    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'End' });
    expect(document.activeElement).toHaveTextContent('21');
    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'PageDown' });
    expect(screen.getByText('April 2026')).toBeInTheDocument();
    ltr.unmount();

    // Direction arrives through the i18n authority these families now read.
    // The manual `dir` stamp on the portalled panel existed only to feed the
    // DOM probe across the portal boundary; the locale crosses it by context.
    render(
      <I18nProvider locale="ar" fallbackLocale="en">
        <ModernDatePicker open defaultValue="2026-03-10" aria-label="Start" />
      </I18nProvider>,
    );
    const rtlSelected = within(grid()).getByRole('gridcell', { selected: true });
    rtlSelected.focus();
    fireEvent.keyDown(rtlSelected, { key: 'ArrowRight' });
    expect(document.activeElement).toHaveTextContent('9');
  });

  it('starts the week on the locale and names days, months and actions from the catalog', () => {
    render(
      <I18nProvider locale="es" fallbackLocale="en">
        <ModernDatePicker open defaultValue="2026-03-10" aria-label="Inicio" />
      </I18nProvider>,
    );
    const headers = within(grid()).getAllByRole('columnheader');
    expect(headers).toHaveLength(7);
    expect(headers[0]).toHaveAttribute('aria-label', expect.stringMatching(/^lu/i));
    expect(screen.getByRole('dialog', { name: 'Selector de fecha' })).toBeInTheDocument();
    const selected = within(grid()).getByRole('gridcell', { selected: true });
    expect(selected.getAttribute('aria-label')).toMatch(/marzo/);
    selected.focus();
    expect(focusedLabel()).toMatch(/2026/);
  });

  it('builds its loading state from its own anatomy', () => {
    const loading = renderToStaticMarkup(
      <AnatomySkeleton>
        <ModernDatePicker defaultValue="2026-03-10" aria-label="Start" />
      </AnatomySkeleton>,
    );
    expect(loading).toContain('data-part="trigger-input"');
    expect(loading).toContain('data-part="calendar-icon"');
  });

  // WO-DER-06 derivation-lane registry (D6-2c-ii-RED, 2026-09-15): the neutral
  // ramp has no producer. `deriveNeutralAxis` leans an AUTHORED
  // `palette.ramps.neutral` and no preset authors one, so the whole
  // palette.neutral-temperature axis is inert and the ramp keeps the foundation
  // constants. Measured on BOTH light-default verticals, not just the one the
  // causality loop reported first. The arm it replaces asserted cellHover moved.
  it('pins the inert neutral-temperature axis: no lean reaches the ramp', async () => {
    for (const vertical of ['bithire', 'evnto'] as const) {
      const arms = await measureArms({
        vertical,
        markup,
        arms: {
          base: {},
          warm: { 'palette.neutral-temperature': 'warm' },
          neutral: { 'palette.neutral-temperature': 'neutral' },
        },
        targets: [
          { id: 'cellHover', selector: "#panel [data-part='cell']:not([data-selected])", property: 'background-color', attributes: { 'data-state': 'hovered' } },
          { id: 'n100', selector: "#panel [data-part='cell']", property: '--ds-color-neutral-100' },
        ],
      });
      expect(arms.warm!.cellHover, `${vertical} hover`).toBe(arms.base!.cellHover);
      expect(arms.neutral!.cellHover, `${vertical} hover`).toBe(arms.base!.cellHover);
      expect(arms.base!.n100.trim(), `${vertical} ramp`).toBe('#f5f5f5');
    }
  }, 120_000);

  it('audits clean in every gated vertical mode, apart from the pinned contrast debt', async () => {
    const gallery =
      renderToStaticMarkup(
        <EngineProvider defaultEngine="modern">
          <div>
            <ModernDatePicker aria-label="Start" />
            <ModernDatePicker defaultValue="2026-03-10" aria-label="Filled start" variant="filled" />
            <ModernDatePicker status="error" aria-label="Error start" />
            <ModernDatePicker disabled defaultValue="2026-03-10" aria-label="Locked" />
            <ModernDatePicker.RangePicker defaultValue={['2026-03-02', '2026-03-12']} />
          </div>
        </EngineProvider>,
      ) +
      openPanelMarkup(
        <ModernDatePicker.RangePicker open defaultValue={['2026-03-02', '2026-03-12']} />,
      );
    for (const scope of AXE_SCOPES) {
      const findings = seriousFindings(await auditAxe({ ...scope, markup: gallery }));
      const key = `${scope.vertical} ${scope.theme}`;
      expect(axeDebt(findings), key).toEqual(AXE_CONTRAST_GAP[key] ?? {});
    }
  }, 180_000);
});
