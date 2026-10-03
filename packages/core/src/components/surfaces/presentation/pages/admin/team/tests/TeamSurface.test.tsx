/** @fileoverview TeamSurface tests -- member list, role assignment, and invite. */

import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, expectTypeOf, it, vi } from 'vitest';

import { TeamSurface, type TeamSurfaceProps } from '..';
import type { SurfacePostures } from '../../../../../foundation/contracts/postures';
import type { TeamSurfaceConfig } from '../../../../../foundation/contracts';
import { renderSurface, RESOLVED_PHONE_TEST_CONTEXT } from '../../../../../foundation/common/test-utils';

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
  it('owns the canonical optional posture prop', () => {
    expectTypeOf<TeamSurfaceProps['postures']>().toEqualTypeOf<SurfacePostures | undefined>();
  });

  it.each(['bottom-bar', 'floating'] as const)('moves the existing invite action once into %s', async (placement) => {
    const config = buildConfig();
    renderSurface(
      <TeamSurface config={config} postures={{ phone: { primaryAction: placement } }} />,
      { engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT },
    );
    const invite = await screen.findByRole('button', { name: 'Invite Member' });
    await waitFor(() => expect(invite.closest(`[data-surface-region="${placement}"]`)).not.toBeNull());
    expect(screen.getAllByRole('button', { name: 'Invite Member' })).toHaveLength(1);
    expect(invite.closest('[data-mode]')).toHaveAttribute('data-mode', placement === 'bottom-bar' ? 'sticky' : 'fixed');
    fireEvent.click(invite);
    expect(config.behavior.onInvite).toHaveBeenCalledTimes(1);
  });

  it('keeps the invite action in existing chrome when postures are omitted on phone', async () => {
    const { container } = renderSurface(<TeamSurface config={buildConfig()} />, {
      engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT,
    });
    expect(await screen.findByRole('button', { name: 'Invite Member' })).toBeInTheDocument();
    expect(container.querySelector('[data-surface-region]')).toBeNull();
    expect(container.querySelector('[data-mode="sticky"], [data-mode="fixed"]')).toBeNull();
  });

  it('hides the real roster while preserving page actions', async () => {
    const { container } = renderSurface(
      <TeamSurface config={buildConfig()} postures={{ phone: { primaryAction: 'app-bar', regions: { members: 'hide' } } }} />,
      { engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT },
    );
    expect(await screen.findByRole('button', { name: 'Invite Member' })).toBeInTheDocument();
    expect(container.querySelector('[data-surface-region="members"]')).toBeNull();
    expect(screen.queryByText('Alice Johnson')).toBeNull();
  });

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
