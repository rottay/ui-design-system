/** @fileoverview HeaderSurface tests -- chrome rendering, tab navigation. */

import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { HeaderSurface } from '..';
import type { HeaderSurfaceConfig } from '../../../foundation/types';
import { renderSurface } from '../../../foundation/common/test-utils';

function buildConfig(overrides?: Partial<HeaderSurfaceConfig>): HeaderSurfaceConfig {
  return {
    visual: {},
    presentation: {
      chrome: {
        title: 'Workspace',
      },
      description: 'Manage workspace-level content and controls.',
    },
    behavior: {
      tabs: [
        {
          key: 'overview',
          label: 'Overview',
          badge: <span>2</span>,
          content: <div>Overview panel</div>,
        },
        {
          key: 'activity',
          label: 'Activity',
          content: <div>Activity panel</div>,
        },
      ],
      actions: [
        {
          id: 'invite',
          label: 'Invite',
          onClick: vi.fn(),
        },
      ],
      onTabChange: vi.fn(),
    },
    permissions: undefined,
    ...overrides,
  };
}

describe('HeaderSurface', () => {
  beforeAll(async () => {
    await import('../../../../primitives/navigation/Tabs/engines/rustic');
    await import('../../../../primitives/inputs/Button/engines/rustic');
  });

  it('switches tabs and forwards tab changes when uncontrolled', async () => {
    const config = buildConfig();

    renderSurface(<HeaderSurface config={config} />);

    const activityTab = await screen.findByRole(
      'tab',
      { name: 'Activity' },
      { timeout: 15000 }
    );

    fireEvent.click(activityTab);

    await waitFor(() => {
      expect(config.behavior.onTabChange).toHaveBeenCalledWith('activity');
    });

    expect(await screen.findByText('Activity panel', undefined, { timeout: 15000 })).toBeInTheDocument();
  });

  it('filters tabs and actions through permissions while keeping badges visible', async () => {
    await import('../../../../primitives/inputs/Button/engines/rustic');

    const config = buildConfig({
      behavior: {
        tabs: [
          {
            key: 'overview',
            label: 'Overview',
            badge: <span>2</span>,
            content: <div>Overview panel</div>,
          },
          {
            key: 'activity',
            label: 'Activity',
            permissionId: 'workspace.activity',
            content: <div>Activity panel</div>,
          },
        ],
        actions: [
          {
            id: 'invite',
            label: 'Invite',
            onClick: vi.fn(),
          },
          {
            id: 'danger-zone',
            label: 'Danger zone',
            onClick: vi.fn(),
          },
        ],
        onTabChange: vi.fn(),
      },
      permissions: {
        granted: [],
        tabs: {
          'workspace.activity': {
            permission: 'workspace:activity:read',
          },
        },
        actions: {
          'danger-zone': {
            permission: 'workspace:danger:read',
          },
        },
      },
    });

    renderSurface(<HeaderSurface config={config} />);

    expect(await screen.findByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.queryByText('Activity')).not.toBeInTheDocument();
    expect(await screen.findByText('Invite')).toBeInTheDocument();
    expect(screen.queryByText('Danger zone')).not.toBeInTheDocument();
  });
});
