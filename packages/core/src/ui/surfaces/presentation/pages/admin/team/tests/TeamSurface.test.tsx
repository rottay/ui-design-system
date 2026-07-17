/** @fileoverview TeamSurface tests -- member list, role assignment, and invite. */

import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TeamSurface } from '..';
import type { TeamSurfaceConfig } from '../../../../../foundation/contracts';
import { renderSurface } from '../../../../../foundation/common/test-utils';

function buildConfig(overrides?: Partial<TeamSurfaceConfig>): TeamSurfaceConfig {
  return {
    visual: {
      layout: 'table',
    },
    presentation: {
      chrome: {
        title: 'Team',
        subtitle: 'Manage your team members',
      },
    },
    behavior: {
      members: [
        { id: 'm1', name: 'Alice Johnson', email: 'alice@example.com', role: 'admin', status: 'active' },
        { id: 'm2', name: 'Bob Smith', email: 'bob@example.com', role: 'member', status: 'invited' },
      ],
      roles: [
        { id: 'admin', label: 'Admin' },
        { id: 'member', label: 'Member' },
        { id: 'viewer', label: 'Viewer' },
      ],
      onInvite: vi.fn(),
      onRemove: vi.fn(),
      onRoleChange: vi.fn(),
    },
    ...overrides,
  };
}

describe('TeamSurface', () => {
  it('renders team members with names and emails', async () => {
    renderSurface(<TeamSurface config={buildConfig()} />);

    expect(await screen.findByText('Team')).toBeInTheDocument();
    expect(await screen.findByText('Alice Johnson')).toBeInTheDocument();
    expect(await screen.findByText('bob@example.com')).toBeInTheDocument();
  });

  it('fires invite action', async () => {
    const config = buildConfig();

    renderSurface(<TeamSurface config={config} />);

    const inviteButton = await screen.findByText('Invite Member').then((node) => node.closest('button'));
    if (!inviteButton) throw new Error('Invite Member button not found');
    fireEvent.click(inviteButton);
    expect(config.behavior.onInvite).toHaveBeenCalledTimes(1);
  });

  it('fires remove action', async () => {
    const config = buildConfig();

    renderSurface(<TeamSurface config={config} />);

    const removeButton = await screen.findAllByText('Remove').then((nodes) => nodes[0]?.closest('button'));
    if (!removeButton) throw new Error('Remove button not found');
    fireEvent.click(removeButton);
    expect(config.behavior.onRemove).toHaveBeenCalledWith('m1');
  });

  it('renders empty state when no members', async () => {
    const config = buildConfig({
      behavior: {
        members: [],
        roles: [{ id: 'admin', label: 'Admin' }],
      },
    });

    renderSurface(<TeamSurface config={config} />);

    expect(await screen.findByText('No team members')).toBeInTheDocument();
  });
});
