import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';

import type { StableEngineName } from '../../../../_internal/testing/helpers/engine-test-utils';
import { STABLE_ENGINES, renderWithEngine } from '../../../../_internal/testing/helpers/engine-test-utils';
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

describe('PatternWorkspaceSwitcher', () => {
  it.each(STABLE_ENGINES)(
    'renders trigger button with the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      renderWithEngine(<Component {...createProps()} />, engine);

      expect(screen.getByTestId('workspace-trigger')).toBeInTheDocument();
    },
  );

  it.each(STABLE_ENGINES)(
    'shows workspace list when opened in the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      renderWithEngine(<Component {...createProps()} />, engine);

      fireEvent.click(screen.getByTestId('workspace-trigger'));

      expect(screen.getByTestId('workspace-item-ws-1')).toBeInTheDocument();
      expect(screen.getByTestId('workspace-item-ws-2')).toBeInTheDocument();
      expect(screen.getByTestId('workspace-item-ws-3')).toBeInTheDocument();
    },
  );

  it.each(STABLE_ENGINES)(
    'calls onSwitch when a workspace is clicked in the %s engine',
    (engine) => {
      const onSwitch = vi.fn();
      const Component = COMPONENTS[engine];
      renderWithEngine(<Component {...createProps({ onSwitch })} />, engine);

      fireEvent.click(screen.getByTestId('workspace-trigger'));
      fireEvent.click(screen.getByTestId('workspace-item-ws-2'));

      expect(onSwitch).toHaveBeenCalledWith('ws-2');
    },
  );

  it.each(STABLE_ENGINES)(
    'shows create workspace button when onCreate is provided in the %s engine',
    (engine) => {
      const onCreate = vi.fn();
      const Component = COMPONENTS[engine];
      renderWithEngine(<Component {...createProps({ onCreate })} />, engine);

      fireEvent.click(screen.getByTestId('workspace-trigger'));

      expect(screen.getByTestId('workspace-create')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('workspace-create'));
      expect(onCreate).toHaveBeenCalled();
    },
  );

  it.each(STABLE_ENGINES)(
    'displays current user info when provided in the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      renderWithEngine(
        <Component
          {...createProps({
            currentUser: { name: 'John Doe', email: 'john@example.com' },
          })}
        />,
        engine,
      );

      fireEvent.click(screen.getByTestId('workspace-trigger'));

      expect(screen.getByTestId('workspace-current-user')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    },
  );

  it.each(STABLE_ENGINES)(
    'hides create button when showCreateButton is false in the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      renderWithEngine(
        <Component {...createProps({ onCreate: vi.fn(), showCreateButton: false })} />,
        engine,
      );

      fireEvent.click(screen.getByTestId('workspace-trigger'));

      expect(screen.queryByTestId('workspace-create')).not.toBeInTheDocument();
    },
  );
});
