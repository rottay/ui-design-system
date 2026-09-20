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
  axeDebt,
  type AxeDebt,
  measureArms,
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

    // Direction arrives through the i18n authority these families now read.
    // The manual `dir` stamp on the portalled panel existed only to feed the
    // DOM probe across the portal boundary; the locale crosses it by context.
    render(
      <I18nProvider locale="ar" fallbackLocale="en">
        <ModernTimePicker defaultValue="09:30:00" aria-label="Start" />
      </I18nProvider>,
    );
    [hours, minutes] = openColumns();
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
      const key = `${scope.vertical} ${scope.theme}`;
      expect(axeDebt(findings), key).toEqual(AXE_CONTRAST_GAP[key] ?? {});
    }
  }, 180_000);
});
