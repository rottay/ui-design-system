/** @fileoverview HeaderSurface tests -- chrome rendering, tab navigation. */

import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { HeaderSurface } from '..';
import type { HeaderSurfaceConfig } from '../../../../../foundation/contracts';
import {
  renderSurface,
  RESOLVED_PHONE_TEST_CONTEXT,
} from '../../../../../foundation/common/test-utils';

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
    access: undefined,
    ...overrides,
  };
}

describe('HeaderSurface', () => {
  beforeAll(async () => {
    await import('../../../../../../primitives/navigation/Tabs/engines/rustic');
    await import('../../../../../../primitives/inputs/Button/engines/rustic');
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

  it('applies final tab and action decisions while keeping badges visible', async () => {
    await import('../../../../../../primitives/inputs/Button/engines/rustic');

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
      access: {
        mode: 'resolved',
        capabilities: [
          { kind: 'tab', id: 'overview', visible: true },
          { kind: 'tab', id: 'workspace.activity', visible: false },
          { kind: 'action', id: 'invite', visible: true },
          { kind: 'action', id: 'danger-zone', visible: false },
        ],
      },
    });

    renderSurface(<HeaderSurface config={config} />);

    expect(await screen.findByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.queryByText('Activity')).not.toBeInTheDocument();
    expect(await screen.findByText('Invite')).toBeInTheDocument();
    expect(screen.queryByText('Danger zone')).not.toBeInTheDocument();
  });

  it('keeps one primary action and compacts body chrome on a resolved phone', async () => {
    const config = buildConfig({
      visual: {
        compactOnMobile: true,
        hideSecondaryActionsOnMobile: true,
      },
      presentation: {
        chrome: { title: 'Workspace' },
        description: 'Manage workspace-level content and controls.',
        actionsStart: <div>Secondary status control</div>,
      },
      behavior: {
        actions: [
          { id: 'export', label: 'Export', variant: 'secondary', onClick: vi.fn() },
          { id: 'invite', label: 'Invite', variant: 'primary', onClick: vi.fn() },
        ],
        tabs: [],
      },
    });

    renderSurface(<HeaderSurface config={config} />, {
      responsiveContext: RESOLVED_PHONE_TEST_CONTEXT,
    });

    expect(await screen.findByRole('button', { name: 'Invite' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Export' })).not.toBeInTheDocument();
    expect(screen.queryByText('Secondary status control')).not.toBeInTheDocument();
    await waitFor(() => {
      expect(document.querySelector('.ds-header')).toHaveAttribute('data-mobile-compact', 'true');
      expect(document.querySelector('.ds-header')).toHaveAttribute(
        'data-mobile-actions',
        'primary-only'
      );
    });
  });
});
