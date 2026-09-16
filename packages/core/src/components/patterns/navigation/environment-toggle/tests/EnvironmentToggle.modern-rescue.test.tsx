import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, screen } from '@testing-library/react';

import { renderWithEngine } from '@tests/support/engine';
import type { EnvironmentToggleProps } from '../contracts';
import { I18nProvider } from '@/infrastructure/runtime/i18n';

import ModernEnvironmentToggle from '../engines/modern';

function createProps(overrides: Partial<EnvironmentToggleProps> = {}): EnvironmentToggleProps {
  return {
    environments: [
      { id: 'test', name: 'Test', color: '#f59e0b', badge: 'TEST' },
      { id: 'stage', name: 'Stage', color: '#3b82f6' },
      { id: 'live', name: 'Live', color: '#22c55e', badge: 'LIVE' },
    ],
    activeEnvironment: 'test',
    onChange: vi.fn(),
    ...overrides,
  };
}

async function openMenu(): Promise<HTMLElement> {
  const trigger = await screen.findByTestId('env-toggle-trigger');
  fireEvent.click(trigger);
  await screen.findByTestId('env-option-live');
  return trigger;
}

describe('PatternEnvironmentToggle - modern instance scoping', () => {
  it('gives each toggle its own panel id so two on a page never cross-wire', async () => {
    renderWithEngine(
      <>
        <ModernEnvironmentToggle {...createProps({ variant: 'dropdown', showBanner: false })} />
        <ModernEnvironmentToggle {...createProps({ variant: 'dropdown', showBanner: false })} />
      </>,
      'modern',
    );

    const triggers = await screen.findAllByTestId('env-toggle-trigger');
    expect(triggers).toHaveLength(2);

    fireEvent.click(triggers[0]);
    fireEvent.click(triggers[1]);

    const firstPanelId = triggers[0].getAttribute('aria-controls');
    const secondPanelId = triggers[1].getAttribute('aria-controls');
    expect(firstPanelId).toBeTruthy();
    expect(secondPanelId).toBeTruthy();
    expect(firstPanelId).not.toBe(secondPanelId);

    // Every emitted panel id must be unique in the document, or the duplicate
    // makes both triggers resolve to whichever panel the DOM finds first.
    const panelIds = Array.from(document.querySelectorAll('[role="menu"]')).map(p => p.id);
    expect(new Set(panelIds).size).toBe(panelIds.length);
  });
});

describe('PatternEnvironmentToggle - modern dropdown menu semantics', () => {
  it('exposes the panel as a menu whose options carry the checked environment', async () => {
    renderWithEngine(
      <ModernEnvironmentToggle {...createProps({ variant: 'dropdown', showBanner: false })} />,
      'modern',
    );

    const trigger = await openMenu();
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');

    const menu = await screen.findByRole('menu');
    expect(menu).toHaveAttribute('aria-label', 'Environment');

    const options = await screen.findAllByRole('menuitemradio');
    expect(options).toHaveLength(3);
    expect(screen.getByTestId('env-option-test')).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByTestId('env-option-live')).toHaveAttribute('aria-checked', 'false');
  });

  it('moves focus onto the checked option when the menu opens', async () => {
    renderWithEngine(
      <ModernEnvironmentToggle {...createProps({ variant: 'dropdown', showBanner: false })} />,
      'modern',
    );

    await openMenu();

    expect(document.activeElement).toBe(screen.getByTestId('env-option-test'));
  });

  it('roves focus with arrows and Home/End without switching environment', async () => {
    const onChange = vi.fn();
    renderWithEngine(
      <ModernEnvironmentToggle
        {...createProps({ variant: 'dropdown', showBanner: false, onChange })}
      />,
      'modern',
    );

    await openMenu();
    const menu = await screen.findByRole('menu');

    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(screen.getByTestId('env-option-stage'));

    fireEvent.keyDown(menu, { key: 'End' });
    expect(document.activeElement).toBe(screen.getByTestId('env-option-live'));

    fireEvent.keyDown(menu, { key: 'Home' });
    expect(document.activeElement).toBe(screen.getByTestId('env-option-test'));

    // Menu arrows move focus only. A radiogroup's select-on-arrow would fire
    // onChange for every environment passed over, including production.
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('PatternEnvironmentToggle - modern production gate layering', () => {
  it('dismisses the menu when the production gate opens so one Escape closes one layer', async () => {
    renderWithEngine(
      <ModernEnvironmentToggle
        {...createProps({
          variant: 'dropdown',
          showBanner: false,
          productionId: 'live',
          confirmProductionSwitch: 'This affects real customers.',
        })}
      />,
      'modern',
    );

    await openMenu();
    fireEvent.click(screen.getByTestId('env-option-live'));

    // The gate is now the only live layer: no menu behind the scrim.
    expect(await screen.findByText('This affects real customers.')).toBeInTheDocument();
    expect(screen.queryByRole('menu')).toBeNull();
    expect(screen.queryByTestId('env-option-live')).toBeNull();
  });

  it('returns focus to the roving tab stop when the gate is cancelled in the pills variant', async () => {
    renderWithEngine(
      <ModernEnvironmentToggle
        {...createProps({
          variant: 'pills',
          showBanner: false,
          productionId: 'live',
          confirmProductionSwitch: 'This affects real customers.',
        })}
      />,
      'modern',
    );

    const productionOption = await screen.findByTestId('env-option-live');
    fireEvent.click(productionOption);
    await screen.findByText('This affects real customers.');

    const cancel = await screen.findByRole('button', { name: 'Cancel' });
    await act(async () => {
      fireEvent.click(cancel);
    });

    // The pills variant has no trigger, so the invoker is the radiogroup tab
    // stop; without it focus falls to <body> after the gate unmounts.
    expect(document.activeElement).toBe(screen.getByTestId('env-option-test'));
  });

  /**
   * NEW COVERAGE (WO-INV-01 migration 2). The APG radiogroup arrows resolved
   * direction with `getComputedStyle(...).direction` and nothing else, which
   * jsdom never answers -- a `dir` attribute does not cascade into computed
   * style there -- so this family's RTL keyboard contract had no test. Three
   * environments, so the two inline arrows land on different options and the
   * case can tell the directions apart; the LTR counterfactual is the control.
   */
  it('mirrors the radiogroup arrows under an RTL locale', async () => {
    const onChange = vi.fn();
    renderWithEngine(
      <I18nProvider locale="ar" fallbackLocale="en">
        <ModernEnvironmentToggle
          {...createProps({ variant: 'pills', showBanner: false, onChange })}
        />
      </I18nProvider>,
      'modern',
    );

    const test = await screen.findByTestId('env-option-test');
    act(() => test.focus());

    // RTL: ArrowLeft is the visual-forward key, so it advances the selection.
    fireEvent.keyDown(test, { key: 'ArrowLeft' });
    expect(screen.getByTestId('env-option-stage')).toHaveFocus();
    expect(onChange).toHaveBeenLastCalledWith('stage');

    fireEvent.keyDown(screen.getByTestId('env-option-stage'), { key: 'ArrowRight' });
    expect(screen.getByTestId('env-option-test')).toHaveFocus();
  });

  it('walks the same radiogroup the other way under an LTR locale', async () => {
    const onChange = vi.fn();
    renderWithEngine(
      <I18nProvider locale="en" fallbackLocale="en">
        <ModernEnvironmentToggle
          {...createProps({ variant: 'pills', showBanner: false, onChange })}
        />
      </I18nProvider>,
      'modern',
    );

    const test = await screen.findByTestId('env-option-test');
    act(() => test.focus());

    fireEvent.keyDown(test, { key: 'ArrowRight' });
    expect(screen.getByTestId('env-option-stage')).toHaveFocus();
    expect(onChange).toHaveBeenLastCalledWith('stage');

    fireEvent.keyDown(screen.getByTestId('env-option-stage'), { key: 'ArrowLeft' });
    expect(screen.getByTestId('env-option-test')).toHaveFocus();
  });
});
