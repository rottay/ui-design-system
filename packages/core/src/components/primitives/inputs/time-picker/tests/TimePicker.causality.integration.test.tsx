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
    // WO-DER-06 derivation-lane registry (D6-2c-ii-RED, 2026-09-15): the light
    // foundation scope pins --ds-focus-ring-color to the constant #ECECEC while the
    // dark scope derives it from --ds-color-primary-400, so a seed reaches the ring
    // only on a dark-default vertical. The gap itself is pinned below.
    'palette.seeds': { value: { primary: '#2F6B9A' }, moves: ['focusRing'], holds: 'radius', in: ['rottay'] },
    'palette.status-seeds': { value: { error: '#B00020' }, moves: ['errorBorder'], holds: 'radius', in: VERTICALS },
    'states.focus-style': { value: 'glow', moves: ['focusRing'], holds: 'radius', in: ['bithire', 'evnto'] },
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
 * inherited. Pinned by finding id, impact and NODE COUNT: another kind of
 * violation, one more node, or a finding in a scope pinned at zero turns this
 * row red. It clears when the derivation lane gives the family a legible pair.
 */
const AXE_CONTRAST_GAP: Readonly<Record<string, number>> = {
  'rottay dark': 4,
  'bithire light': 0,
  'bithire dark': 4,
  'evnto light': 0,
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

  // WO-DER-06 derivation-lane registry (D6-2c-ii-RED, 2026-09-15): the light
  // foundation scope pins --ds-focus-ring-color to the constant #ECECEC and only
  // the dark scope derives it from --ds-color-primary-400. A light-default
  // vertical therefore cannot express a seeded ring; this reddens when it can.
  it('pins the focus-ring gap: a seed cannot reach the ring on a light-default vertical', async () => {
    const seeded = await measureArms({
      vertical: 'bithire',
      markup,
      arms: { base: {}, seeded: { 'palette.seeds': { primary: '#2F6B9A' } } },
      targets: [
        { id: 'ringColor', selector: REST, property: '--ds-focus-ring-color' },
        { id: 'primary', selector: REST, property: '--ds-color-primary' },
      ],
    });
    expect(seeded.base!.ringColor.trim()).toBe('#ECECEC');
    expect(seeded.seeded!.ringColor.trim()).toBe('#ECECEC');
    // The seed DOES reach the palette, so the ring is the only thing stuck.
    expect(seeded.seeded!.primary.trim()).not.toBe(seeded.base!.primary.trim());
  }, 60_000);

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
