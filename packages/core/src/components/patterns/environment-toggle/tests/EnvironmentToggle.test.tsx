import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';

import type { StableEngineName } from '../../../../testing/helpers/engine-test-utils';
import { STABLE_ENGINES, renderWithEngine } from '../../../../testing/helpers/engine-test-utils';
import type { EnvironmentToggleProps } from '../EnvironmentToggle.types';
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
