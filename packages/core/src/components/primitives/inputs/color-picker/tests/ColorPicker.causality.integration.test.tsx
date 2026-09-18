/**
 * The color-picker family in a real browser: every decision its paint consumes
 * moves the trigger or the panel with a negative control; the panel follows the
 * declared placement, and language, loading and accessibility hold.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AnatomySkeleton } from '@/components/primitives/feedback/skeleton/runtime/anatomy-renderer';
import { EngineProvider } from '@/infrastructure/runtime/engines/composition/react/provider';
import { I18nProvider } from '@/infrastructure/runtime/i18n';
import { ColorPicker as ModernColorPicker } from '../engines/modern';
import {
  AXE_SCOPES,
  FIRST_PARTY_VERTICALS as VERTICALS,
  auditAxe,
  axeDebt,
  type AxeDebt,
  describeCausality,
  seriousFindings,
} from '@tests/support/family-causality';

const PRESETS = [{ label: 'Brand', colors: ['#2a7d4f', '#123456'] }];

const openPanelMarkup = (element: React.ReactElement): string => {
  const view = render(element);
  const panel = document.querySelector('.ds-color-picker-panel')!.outerHTML;
  view.unmount();
  return panel;
};

const markup =
  renderToStaticMarkup(<div id="rest"><ModernColorPicker defaultValue="#2a7d4f" showText /></div>) +
  `<div id="panel">${openPanelMarkup(<ModernColorPicker open defaultValue="#2a7d4f" allowClear presets={PRESETS} />)}</div>`;

const HEX = "#panel [data-part='hex-input']";

describeCausality({
  family: 'color-picker',
  markup,
  targets: [
    { id: 'triggerFocus', selector: "#rest [data-part='trigger']", property: 'box-shadow', attributes: { 'data-state': 'focused focus-visible' } },
    { id: 'swatchRadius', selector: "#rest [data-part='swatch']", property: 'border-top-left-radius' },
    { id: 'textSize', selector: "#rest [data-part='display-text']", property: 'font-size' },
    { id: 'panelRadius', selector: "#panel [data-part='dropdown']", property: 'border-top-left-radius' },
    { id: 'panelShadow', selector: "#panel [data-part='dropdown']", property: 'box-shadow' },
    { id: 'panelPad', selector: "#panel [data-part='dropdown']", property: 'padding-top' },
    { id: 'hexFocus', selector: HEX, property: 'border-top-color', attributes: { 'data-state': 'focused' } },
    { id: 'hexInvalid', selector: HEX, property: 'border-top-color', attributes: { 'data-invalid': 'true' } },
    { id: 'hexEdge', selector: HEX, property: 'border-top-width' },
    { id: 'selectedRing', selector: "#panel [data-part='preset-swatch'][data-selected='true']", property: 'box-shadow' },
    { id: 'disabledOpacity', selector: "#panel [data-part='clear-button']", property: 'opacity', attributes: { 'data-state': 'disabled' } },
    { id: 'duration', selector: HEX, property: 'transition-duration' },
  ],
  decisions: {
    'palette.seeds': { value: { primary: '#2F6B9A' }, moves: ['hexFocus', 'selectedRing'], holds: 'panelRadius', in: VERTICALS },
    'palette.status-seeds': { value: { error: '#B00020' }, moves: ['hexInvalid'], holds: 'panelRadius', in: VERTICALS },
    'states.focus-style': { value: 'glow', moves: ['triggerFocus'], holds: 'panelRadius', in: VERTICALS },
    // `subtle`, not `strong`: bithire's preset already decides strong, so that arm
    // restated the baseline and moved nothing (D6-2c-ii-RED, 2026-09-15).
    'states.emphasis': { value: 'subtle', moves: ['disabledOpacity'], holds: 'panelRadius', in: VERTICALS },
    'typography.scale': { value: 1.08, moves: ['textSize'], holds: 'panelRadius', in: VERTICALS },
    'shape.radius-scale': { value: 1.2, moves: ['swatchRadius', 'panelRadius'], holds: 'textSize', in: VERTICALS },
    // `spacious`, not `compact`: bithire's preset already decides compact, so that
    // arm restated the baseline and moved nothing (D6-2c-ii-RED, 2026-09-15).
    'density.mode': { value: 'spacious', moves: ['panelPad'], holds: 'panelRadius', in: VERTICALS },
    'surfaces.border-style': { value: 'none', moves: ['hexEdge'], holds: 'panelRadius', in: VERTICALS },
    'surfaces.elevation-posture': { value: 'elevated', moves: ['panelShadow'], holds: 'panelRadius', in: VERTICALS },
    'motion.dial': { value: { durationScale: 1.35 }, moves: ['duration'], holds: 'panelRadius', in: ['evnto'] },
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
 * `bithire dark` DRAINED: that scope's dark block now re-derives its own canvas
 * ground instead of inheriting the light body's, so the pair is legible there.
 * Dropped by identity, not waived -- with no entry the scope must measure
 * clean, and a relapse reddens here.
 */
const AXE_CONTRAST_GAP: Readonly<Record<string, AxeDebt>> = {};

describe('color-picker disclosure, language and accessibility', () => {
  it('opens from the keyboard into the panel at the declared placement and returns focus on Escape', () => {
    render(<ModernColorPicker defaultValue="#2a7d4f" placement="topRight" allowClear presets={PRESETS} />);
    const trigger = screen.getByRole('button', { name: 'Color picker' });
    trigger.focus();
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    const panel = screen.getByRole('dialog', { name: 'Color picker panel' });
    expect(panel).toHaveAttribute('data-placement', 'topRight');
    expect(panel.contains(document.activeElement)).toBe(true);
    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'Escape' });
    expect(document.activeElement).toBe(trigger);
  });

  it('names its controls from the active catalog', () => {
    render(
      <I18nProvider locale="es" fallbackLocale="en">
        <ModernColorPicker open defaultValue="#2a7d4f" allowClear />
      </I18nProvider>,
    );
    expect(screen.getByRole('dialog', { name: 'Panel del selector de color' })).toBeInTheDocument();
    expect(screen.getByLabelText('Color hexadecimal')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Limpiar' })).toBeInTheDocument();
  });

  it('builds its loading state from its own anatomy', () => {
    const loading = renderToStaticMarkup(
      <AnatomySkeleton>
        <ModernColorPicker defaultValue="#2a7d4f" showText />
      </AnatomySkeleton>,
    );
    expect(loading).toContain('data-part="trigger"');
    expect(loading).toContain('data-part="swatch"');
  });

  it('audits clean in every gated vertical mode, apart from the pinned contrast debt', async () => {
    const gallery =
      renderToStaticMarkup(
        <EngineProvider defaultEngine="modern">
          <div>
            <ModernColorPicker defaultValue="#2a7d4f" showText />
            <ModernColorPicker defaultValue="" allowClear />
            <ModernColorPicker disabled defaultValue="#123456" />
          </div>
        </EngineProvider>,
      ) + openPanelMarkup(<ModernColorPicker open defaultValue="#2a7d4f" allowClear presets={PRESETS} />);
    for (const scope of AXE_SCOPES) {
      const findings = seriousFindings(await auditAxe({ ...scope, markup: gallery }));
      const key = `${scope.vertical} ${scope.theme}`;
      expect(axeDebt(findings), key).toEqual(AXE_CONTRAST_GAP[key] ?? {});
    }
  }, 180_000);
});
