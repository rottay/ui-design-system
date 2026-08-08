import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';

import type { StableEngineName } from '../../../../../tooling/testing/helpers/engine';
import { STABLE_ENGINES, renderWithEngine } from '../../../../../tooling/testing/helpers/engine';
import type { EnvironmentToggleProps } from '../contracts';
import ClassicEnvironmentToggle from '../engines/classic';
import ModernEnvironmentToggle from '../engines/modern';
import RusticEnvironmentToggle from '../engines/rustic';

const COMPONENTS: Record<StableEngineName, React.ComponentType<EnvironmentToggleProps>> = {
  classic: ClassicEnvironmentToggle,
  modern: ModernEnvironmentToggle,
  rustic: RusticEnvironmentToggle,
};

function createProps(overrides: Partial<EnvironmentToggleProps> = {}): EnvironmentToggleProps {
  return {
    environments: [
      { id: 'test', name: 'Test', color: '#f59e0b', badge: 'TEST' },
      { id: 'live', name: 'Live', color: '#22c55e', badge: 'LIVE' },
    ],
    activeEnvironment: 'test',
    onChange: vi.fn(),
    ...overrides,
  };
}

describe('PatternEnvironmentToggle', () => {
  it.each(STABLE_ENGINES)(
    'renders toggle control with the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      renderWithEngine(<Component {...createProps()} />, engine);

      expect(screen.getByTestId('env-toggle-trigger')).toBeInTheDocument();
    },
  );

  it.each(STABLE_ENGINES)(
    'shows environment names in the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      renderWithEngine(<Component {...createProps()} />, engine);

      expect(screen.getByText('Test')).toBeInTheDocument();
      expect(screen.getByText('Live')).toBeInTheDocument();
    },
  );

  it.each(STABLE_ENGINES)(
    'calls onChange when switching environment in the %s engine',
    (engine) => {
      const onChange = vi.fn();
      const Component = COMPONENTS[engine];
      renderWithEngine(<Component {...createProps({ onChange })} />, engine);

      fireEvent.click(screen.getByTestId('env-option-live'));

      expect(onChange).toHaveBeenCalledWith('live');
    },
  );

  it.each(STABLE_ENGINES)(
    'shows banner when not in production in the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      renderWithEngine(
        <Component
          {...createProps({
            showBanner: true,
            productionId: 'live',
            activeEnvironment: 'test',
          })}
        />,
        engine,
      );

      expect(screen.getByTestId('env-banner')).toBeInTheDocument();
      expect(screen.getByText(/Test environment/i)).toBeInTheDocument();
    },
  );

  it.each(STABLE_ENGINES)(
    'hides banner when in production in the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      renderWithEngine(
        <Component
          {...createProps({
            showBanner: true,
            productionId: 'live',
            activeEnvironment: 'live',
          })}
        />,
        engine,
      );

      expect(screen.queryByTestId('env-banner')).not.toBeInTheDocument();
    },
  );

  it.each(STABLE_ENGINES)(
    'shows custom banner message in the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      renderWithEngine(
        <Component
          {...createProps({
            showBanner: true,
            productionId: 'live',
            bannerMessage: 'Sandbox mode active',
          })}
        />,
        engine,
      );

      expect(screen.getByText('Sandbox mode active')).toBeInTheDocument();
    },
  );

  it.each(STABLE_ENGINES)(
    'renders pills variant in the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      renderWithEngine(
        <Component {...createProps({ variant: 'pills', showBanner: false })} />,
        engine,
      );

      expect(screen.getByTestId('env-option-test')).toBeInTheDocument();
      expect(screen.getByTestId('env-option-live')).toBeInTheDocument();
    },
  );

  it.each(STABLE_ENGINES)(
    'renders dropdown variant in the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      renderWithEngine(
        <Component {...createProps({ variant: 'dropdown', showBanner: false })} />,
        engine,
      );

      expect(screen.getByTestId('env-toggle-trigger')).toBeInTheDocument();
    },
  );
});

// WO-CRA-23 / Lane W4 — modern-engine regressions.
describe('PatternEnvironmentToggle - modern lifecycle and dropdown dismissal', () => {
  it('honours the declared PatternBaseProps.loading posture', async () => {
    const onChange = vi.fn();
    const { container } = renderWithEngine(
      <ModernEnvironmentToggle {...createProps({ loading: true, onChange })} />,
      'modern',
    );

    const root = container.querySelector('[data-part="root"]');
    expect(root).toHaveAttribute('data-loading', 'true');
    expect(root).toHaveAttribute('aria-busy', 'true');

    const options = await screen.findAllByTestId(/^env-option-/);
    for (const option of options) {
      expect(option).toBeDisabled();
    }

    // The APG radiogroup arrow contract must not switch while busy: it calls
    // handleSwitch directly and therefore bypasses the disabled attribute.
    fireEvent.keyDown(screen.getByTestId('env-toggle-trigger'), { key: 'ArrowRight' });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('leaves the loading posture off by default', async () => {
    const { container } = renderWithEngine(
      <ModernEnvironmentToggle {...createProps()} />,
      'modern',
    );
    const root = container.querySelector('[data-part="root"]');
    expect(root).toHaveAttribute('data-loading', 'false');
    expect(root).not.toHaveAttribute('aria-busy');
    const options = await screen.findAllByTestId(/^env-option-/);
    expect(options[0]).not.toBeDisabled();
  });

  it('dismisses the dropdown on Escape and returns focus to the trigger', async () => {
    renderWithEngine(
      <ModernEnvironmentToggle {...createProps({ variant: 'dropdown' })} />,
      'modern',
    );

    const trigger = await screen.findByTestId('env-toggle-trigger');
    // The panel id is instance-scoped, so the reference is asserted
    // relationally: it must resolve to a real element, and only while mounted.
    expect(trigger).not.toHaveAttribute('aria-controls');

    fireEvent.click(trigger);
    expect(await screen.findByTestId('env-option-live')).toBeInTheDocument();
    const panelId = trigger.getAttribute('aria-controls');
    expect(panelId).toBeTruthy();
    expect(document.getElementById(panelId as string)).not.toBeNull();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.queryByTestId('env-option-live')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });
});
