/** @fileoverview DetailSurface tests -- adapter mapping, tabs, actions, and sidebar. */

import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DetailSurface } from '.';
import type { DetailSurfaceConfig, EntityAdapter } from '../types';
import { renderSurface } from '../common/test-utils';
import { mockMatchMedia } from '../../../testing/helpers/match-media';

interface RawWorkspace {
  id: string;
  name: string;
}

interface WorkspaceView {
  id: string;
  name: string;
}

const adapter: EntityAdapter<RawWorkspace, WorkspaceView> = {
  entity: 'workspace',
  version: '1.0',
  map: (raw) => ({
    id: raw.id,
    name: raw.name,
  }),
  fields: [
    {
      key: 'name',
      fieldId: 'workspace.name',
    },
  ],
};

function buildConfig(overrides?: Partial<DetailSurfaceConfig<WorkspaceView>>): DetailSurfaceConfig<WorkspaceView> {
  return {
    visual: {},
    presentation: {
      title: (item) => item.name,
      tabs: [
        {
          key: 'overview',
          label: 'Overview',
          badge: 1,
          content: () => <div>Overview content</div>,
        },
        {
          key: 'activity',
          label: 'Activity',
          content: () => <div>Activity content</div>,
        },
        {
          key: 'security',
          label: 'Security',
          permissionId: 'workspace.security',
          content: () => <div>Security content</div>,
        },
      ],
    },
    behavior: {
      activeTab: 'security',
      onTabChange: vi.fn(),
      actions: [
        {
          id: 'edit',
          label: 'Edit',
          onClick: vi.fn(),
        },
        {
          id: 'archive',
          label: 'Archive',
          onClick: vi.fn(),
        },
      ],
    },
    permissions: {
      granted: [],
      tabs: {
        'workspace.security': {
          permission: 'workspace:security:read',
        },
      },
      actions: {
        archive: {
          permission: 'workspace:archive',
        },
      },
    },
    ...overrides,
  };
}

describe('DetailSurface', () => {
  it('renders error and retry states before detail content', async () => {
    const onRetry = vi.fn();

    renderSurface(
      <DetailSurface
        data={{ id: 'ws-1', name: 'Acme Workspace' }}
        adapter={adapter}
        config={buildConfig()}
        error={new Error('Could not load workspace')}
        onRetry={onRetry}
      />
    );

    fireEvent.click(await screen.findByRole('button', { name: /try again/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('renders both default and custom empty states when no data is available', async () => {
    renderSurface(
      <DetailSurface data={null} adapter={adapter} config={buildConfig()} />
    );

    expect(await screen.findByText(/no detail data available/i)).toBeInTheDocument();

    renderSurface(
      <DetailSurface
        data={null}
        adapter={adapter}
        config={buildConfig({
          emptyState: <div>Custom empty detail</div>,
        })}
      />
    );

    expect(await screen.findByText('Custom empty detail')).toBeInTheDocument();
  });

  it('filters protected tabs, falls back to the first visible tab, and filters actions', async () => {
    const config = buildConfig();

    renderSurface(
      <DetailSurface
        data={{ id: 'ws-1', name: 'Acme Workspace' }}
        adapter={adapter}
        config={config}
      />
    );

    expect(await screen.findByText('Acme Workspace')).toBeInTheDocument();
    expect(screen.getByText('Overview content')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Security/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Edit/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Archive/i })).not.toBeInTheDocument();
  });

  it('switches visible tabs and forwards tab changes', async () => {
    const config = buildConfig({
      behavior: {
        activeTab: undefined,
        onTabChange: vi.fn(),
        actions: [
          {
            id: 'edit',
            label: 'Edit',
            onClick: vi.fn(),
          },
        ],
      },
      permissions: undefined,
    });

    renderSurface(
      <DetailSurface
        data={{ id: 'ws-1', name: 'Acme Workspace' }}
        adapter={adapter}
        config={config}
      />
    );

    fireEvent.click(await screen.findByRole('button', { name: /Activity/i }));

    await waitFor(() => {
      expect(config.behavior.onTabChange).toHaveBeenCalledWith('activity');
    });

    expect(await screen.findByText('Activity content')).toBeInTheDocument();
  });

  it('renders chrome, sidebar, subtitle, header extra, footer, and mapped action variants', async () => {
    const editAction = vi.fn();

    renderSurface(
      <DetailSurface
        data={{ id: 'ws-1', name: 'Acme Workspace' }}
        adapter={adapter}
        config={buildConfig({
          visual: {
            sidebarPosition: 'left',
            sidebarWidth: 280,
          },
          presentation: {
            title: (item) => item.name,
            subtitle: () => 'Operational workspace',
            avatar: () => <div>WS</div>,
            status: () => ({ label: 'Healthy', color: '#16a34a' }),
            headerExtra: () => <div>Header slot</div>,
            sidebar: () => <div>Workspace sidebar</div>,
            footer: () => <div>Workspace footer</div>,
            chrome: {
              maxWidth: '960px',
              back: {
                label: 'Back',
                onClick: vi.fn(),
              },
              breadcrumbs: [
                { label: 'Workspaces', onClick: vi.fn() },
                { label: 'Acme Workspace' },
              ],
            },
            tabs: [
              {
                key: 'overview',
                label: 'Overview',
                content: () => <div>Overview content</div>,
              },
            ],
          },
          behavior: {
            activeTab: 'overview',
            onTabChange: vi.fn(),
            actions: [
              {
                id: 'edit',
                label: 'Edit',
                variant: 'primary',
                onClick: editAction,
              },
            ],
          },
          permissions: undefined,
        })}
      />
    );

    expect(await screen.findByText('Operational workspace')).toBeInTheDocument();
    expect(screen.getByText('WS')).toBeInTheDocument();
    expect(screen.getByText('Healthy')).toBeInTheDocument();
    expect(screen.getByText('Header slot')).toBeInTheDocument();
    expect(screen.getByText('Workspace sidebar')).toBeInTheDocument();
    expect(screen.getByText('Workspace footer')).toBeInTheDocument();
    expect(screen.getByText('Workspaces')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    expect(editAction).toHaveBeenCalledTimes(1);
  });

  it('moves the sidebar into the footer stack on mobile by default', async () => {
    mockMatchMedia(390);

    renderSurface(
      <DetailSurface
        data={{ id: 'ws-1', name: 'Acme Workspace' }}
        adapter={adapter}
        config={buildConfig({
          presentation: {
            title: (item) => item.name,
            sidebar: () => <div>Workspace sidebar</div>,
            footer: () => <div>Workspace footer</div>,
            tabs: [
              {
                key: 'overview',
                label: 'Overview',
                content: () => <div>Overview content</div>,
              },
            ],
          },
          behavior: {
            activeTab: 'overview',
            actions: [],
          },
          permissions: undefined,
        })}
      />
    );

    expect(await screen.findByText('Workspace sidebar')).toBeInTheDocument();
    expect(screen.getByText('Workspace footer')).toBeInTheDocument();
  });
});
