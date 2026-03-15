import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';

import type { StableEngineName } from '../../../testing/helpers/engine-test-utils';
import { STABLE_ENGINES, renderWithEngine } from '../../../testing/helpers/engine-test-utils';
import type { WorkspaceSwitcherProps } from './WorkspaceSwitcher.types';
import ClassicWorkspaceSwitcher from './engines/classic';
import ModernWorkspaceSwitcher from './engines/modern';
import RusticWorkspaceSwitcher from './engines/rustic';

const COMPONENTS: Record<StableEngineName, React.ComponentType<WorkspaceSwitcherProps>> = {
  classic: ClassicWorkspaceSwitcher,
  modern: ModernWorkspaceSwitcher,
  rustic: RusticWorkspaceSwitcher,
};

function createProps(overrides: Partial<WorkspaceSwitcherProps> = {}): WorkspaceSwitcherProps {
  return {
    workspaces: [
      { id: 'ws-1', name: 'Acme Corp', role: 'Admin', plan: 'pro', unreadCount: 3, online: 12 },
      { id: 'ws-2', name: 'Beta Inc', role: 'Member', plan: 'free', unreadCount: 0, online: 5 },
      { id: 'ws-3', name: 'Gamma LLC', role: 'Owner', plan: 'enterprise' },
    ],
    activeWorkspaceId: 'ws-1',
    onSwitch: vi.fn(),
    ...overrides,
  };
}

describe('PatternWorkspaceSwitcher integration', () => {
  describe('workspace list rendering', () => {
    it.each(STABLE_ENGINES)(
      'displays all workspaces with their names in the %s engine',
      (engine) => {
        const Component = COMPONENTS[engine];
        renderWithEngine(<Component {...createProps()} />, engine);

        fireEvent.click(screen.getByTestId('workspace-trigger'));

        // Active workspace name may appear in both trigger and list
        expect(screen.getAllByText('Acme Corp').length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText('Beta Inc').length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText('Gamma LLC').length).toBeGreaterThanOrEqual(1);
      }
    );

    it.each(STABLE_ENGINES)(
      'displays workspace roles in the %s engine',
      (engine) => {
        const Component = COMPONENTS[engine];
        renderWithEngine(<Component {...createProps()} />, engine);

        fireEvent.click(screen.getByTestId('workspace-trigger'));

        expect(screen.getByText('Admin')).toBeInTheDocument();
        expect(screen.getByText('Member')).toBeInTheDocument();
        expect(screen.getByText('Owner')).toBeInTheDocument();
      }
    );

    it.each(STABLE_ENGINES)(
      'renders workspace items with correct test ids in the %s engine',
      (engine) => {
        const Component = COMPONENTS[engine];
        renderWithEngine(<Component {...createProps()} />, engine);

        fireEvent.click(screen.getByTestId('workspace-trigger'));

        expect(screen.getByTestId('workspace-item-ws-1')).toBeInTheDocument();
        expect(screen.getByTestId('workspace-item-ws-2')).toBeInTheDocument();
        expect(screen.getByTestId('workspace-item-ws-3')).toBeInTheDocument();
      }
    );
  });

  describe('switch callback', () => {
    it.each(STABLE_ENGINES)(
      'calls onSwitch with the target workspace id in the %s engine',
      (engine) => {
        const onSwitch = vi.fn();
        const Component = COMPONENTS[engine];
        renderWithEngine(<Component {...createProps({ onSwitch })} />, engine);

        fireEvent.click(screen.getByTestId('workspace-trigger'));
        fireEvent.click(screen.getByTestId('workspace-item-ws-2'));

        expect(onSwitch).toHaveBeenCalledWith('ws-2');
        expect(onSwitch).toHaveBeenCalledTimes(1);
      }
    );

    it.each(STABLE_ENGINES)(
      'calls onSwitch for each distinct workspace selection in the %s engine',
      (engine) => {
        const onSwitch = vi.fn();
        const Component = COMPONENTS[engine];
        renderWithEngine(<Component {...createProps({ onSwitch })} />, engine);

        fireEvent.click(screen.getByTestId('workspace-trigger'));
        fireEvent.click(screen.getByTestId('workspace-item-ws-3'));

        expect(onSwitch).toHaveBeenCalledWith('ws-3');
      }
    );
  });

  describe('create button', () => {
    it.each(STABLE_ENGINES)(
      'shows create workspace button and fires onCreate in the %s engine',
      (engine) => {
        const onCreate = vi.fn();
        const Component = COMPONENTS[engine];
        renderWithEngine(<Component {...createProps({ onCreate })} />, engine);

        fireEvent.click(screen.getByTestId('workspace-trigger'));
        expect(screen.getByTestId('workspace-create')).toBeInTheDocument();

        fireEvent.click(screen.getByTestId('workspace-create'));
        expect(onCreate).toHaveBeenCalledTimes(1);
      }
    );

    it.each(STABLE_ENGINES)(
      'hides create button when showCreateButton is false in the %s engine',
      (engine) => {
        const Component = COMPONENTS[engine];
        renderWithEngine(
          <Component {...createProps({ onCreate: vi.fn(), showCreateButton: false })} />,
          engine
        );

        fireEvent.click(screen.getByTestId('workspace-trigger'));
        expect(screen.queryByTestId('workspace-create')).not.toBeInTheDocument();
      }
    );

    it.each(STABLE_ENGINES)(
      'does not show create button when onCreate is not provided in the %s engine',
      (engine) => {
        const Component = COMPONENTS[engine];
        renderWithEngine(<Component {...createProps()} />, engine);

        fireEvent.click(screen.getByTestId('workspace-trigger'));
        expect(screen.queryByTestId('workspace-create')).not.toBeInTheDocument();
      }
    );
  });

  describe('current user info', () => {
    it.each(STABLE_ENGINES)(
      'displays current user details when provided in the %s engine',
      (engine) => {
        const Component = COMPONENTS[engine];
        renderWithEngine(
          <Component
            {...createProps({
              currentUser: { name: 'Jane Smith', email: 'jane@example.com' },
            })}
          />,
          engine
        );

        fireEvent.click(screen.getByTestId('workspace-trigger'));

        expect(screen.getByTestId('workspace-current-user')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.getByText('jane@example.com')).toBeInTheDocument();
      }
    );
  });

  describe('empty workspace list', () => {
    it.each(STABLE_ENGINES)(
      'renders trigger even with no workspaces in the %s engine',
      (engine) => {
        const Component = COMPONENTS[engine];
        renderWithEngine(
          <Component {...createProps({ workspaces: [] })} />,
          engine
        );

        expect(screen.getByTestId('workspace-trigger')).toBeInTheDocument();
      }
    );
  });
});
