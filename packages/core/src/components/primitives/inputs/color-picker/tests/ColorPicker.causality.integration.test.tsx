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
    'states.emphasis': { value: 'strong', moves: ['disabledOpacity'], holds: 'panelRadius', in: VERTICALS },
    'typography.scale': { value: 1.08, moves: ['textSize'], holds: 'panelRadius', in: VERTICALS },
    'shape.radius-scale': { value: 1.2, moves: ['swatchRadius', 'panelRadius'], holds: 'textSize', in: VERTICALS },
    'density.mode': { value: 'compact', moves: ['panelPad'], holds: 'panelRadius', in: VERTICALS },
    'surfaces.border-style': { value: 'none', moves: ['hexEdge'], holds: 'panelRadius', in: VERTICALS },
    'surfaces.elevation-posture': { value: 'elevated', moves: ['panelShadow'], holds: 'panelRadius', in: VERTICALS },
    'motion.dial': { value: { durationScale: 1.35 }, moves: ['duration'], holds: 'panelRadius', in: ['evnto'] },
  },
});

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

  it('has no serious or critical axe violation in any gated vertical mode', async () => {
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
      expect(findings, `${scope.vertical} ${scope.theme}`).toEqual([]);
    }
  }, 180_000);
});
