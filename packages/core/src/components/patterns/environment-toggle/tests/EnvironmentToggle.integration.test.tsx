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
      { id: 'dev', name: 'Development', color: '#3b82f6', badge: 'DEV' },
      { id: 'staging', name: 'Staging', color: '#f59e0b', badge: 'STG' },
      { id: 'live', name: 'Live', color: '#22c55e', badge: 'LIVE' },
    ],
    activeEnvironment: 'dev',
    onChange: vi.fn(),
    ...overrides,
  };
}

describe('PatternEnvironmentToggle integration', () => {
  describe('toggle between environments', () => {
    it.each(STABLE_ENGINES)(
      'switches from dev to staging through the %s engine',
      (engine) => {
        const onChange = vi.fn();
        const Component = COMPONENTS[engine];
        renderWithEngine(<Component {...createProps({ onChange })} />, engine);

        fireEvent.click(screen.getByTestId('env-option-staging'));
        expect(onChange).toHaveBeenCalledWith('staging');
      }
    );

    it.each(STABLE_ENGINES)(
      'switches from dev to live through the %s engine',
      (engine) => {
        const onChange = vi.fn();
        const Component = COMPONENTS[engine];
        renderWithEngine(<Component {...createProps({ onChange })} />, engine);

        fireEvent.click(screen.getByTestId('env-option-live'));
        expect(onChange).toHaveBeenCalledWith('live');
      }
    );

    it.each(STABLE_ENGINES)(
      'calls onChange with correct env id for each switch through the %s engine',
      (engine) => {
        const onChange = vi.fn();
        const Component = COMPONENTS[engine];
        renderWithEngine(
          <Component
            {...createProps({
              onChange,
              environments: [
                { id: 'test', name: 'Test', color: '#f59e0b', badge: 'TEST' },
                { id: 'prod', name: 'Production', color: '#22c55e', badge: 'PROD' },
              ],
              activeEnvironment: 'test',
            })}
          />,
          engine
        );

        fireEvent.click(screen.getByTestId('env-option-prod'));
        expect(onChange).toHaveBeenCalledWith('prod');
        expect(onChange).toHaveBeenCalledTimes(1);
      }
    );
  });

  describe('banner visibility', () => {
    it.each(STABLE_ENGINES)(
      'shows banner when not in production environment through the %s engine',
      (engine) => {
        const Component = COMPONENTS[engine];
        renderWithEngine(
          <Component
            {...createProps({
              showBanner: true,
              productionId: 'live',
              activeEnvironment: 'dev',
            })}
          />,
          engine
        );

        expect(screen.getByTestId('env-banner')).toBeInTheDocument();
      }
    );

    it.each(STABLE_ENGINES)(
      'hides banner when in production environment through the %s engine',
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
          engine
        );

        expect(screen.queryByTestId('env-banner')).not.toBeInTheDocument();
      }
    );

    it.each(STABLE_ENGINES)(
      'shows banner for staging environment through the %s engine',
      (engine) => {
        const Component = COMPONENTS[engine];
        renderWithEngine(
          <Component
            {...createProps({
              showBanner: true,
              productionId: 'live',
              activeEnvironment: 'staging',
            })}
          />,
          engine
        );

        expect(screen.getByTestId('env-banner')).toBeInTheDocument();
      }
    );

    it.each(STABLE_ENGINES)(
      'hides banner when showBanner is false through the %s engine',
      (engine) => {
        const Component = COMPONENTS[engine];
        renderWithEngine(
          <Component
            {...createProps({
              showBanner: false,
              productionId: 'live',
              activeEnvironment: 'dev',
            })}
          />,
          engine
        );

        expect(screen.queryByTestId('env-banner')).not.toBeInTheDocument();
      }
    );

    it.each(STABLE_ENGINES)(
      'shows custom banner message through the %s engine',
      (engine) => {
        const Component = COMPONENTS[engine];
        renderWithEngine(
          <Component
            {...createProps({
              showBanner: true,
              productionId: 'live',
              activeEnvironment: 'dev',
              bannerMessage: 'You are in development mode',
            })}
          />,
          engine
        );

        expect(screen.getByText('You are in development mode')).toBeInTheDocument();
      }
    );
  });

  describe('variant rendering', () => {
    it.each(STABLE_ENGINES)(
      'renders pills variant with all environment options through the %s engine',
      (engine) => {
        const Component = COMPONENTS[engine];
        renderWithEngine(
          <Component {...createProps({ variant: 'pills', showBanner: false })} />,
          engine
        );

        expect(screen.getByTestId('env-option-dev')).toBeInTheDocument();
        expect(screen.getByTestId('env-option-staging')).toBeInTheDocument();
        expect(screen.getByTestId('env-option-live')).toBeInTheDocument();
      }
    );

    it.each(STABLE_ENGINES)(
      'renders dropdown variant with trigger through the %s engine',
      (engine) => {
        const Component = COMPONENTS[engine];
        renderWithEngine(
          <Component {...createProps({ variant: 'dropdown', showBanner: false })} />,
          engine
        );

        expect(screen.getByTestId('env-toggle-trigger')).toBeInTheDocument();
      }
    );
  });

  describe('environment names display', () => {
    it.each(STABLE_ENGINES)(
      'displays all environment names through the %s engine',
      (engine) => {
        const Component = COMPONENTS[engine];
        renderWithEngine(<Component {...createProps()} />, engine);

        expect(screen.getByText('Development')).toBeInTheDocument();
        expect(screen.getByText('Staging')).toBeInTheDocument();
        expect(screen.getByText('Live')).toBeInTheDocument();
      }
    );
  });
});
