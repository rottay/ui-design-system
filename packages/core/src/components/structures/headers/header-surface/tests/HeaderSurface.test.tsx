/** @fileoverview HeaderSurface tests -- chrome rendering, tab navigation. */

import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { HeaderSurface } from '..';
import type { HeaderSurfaceConfig } from '../../../foundation/chrome/contracts';
import {
  renderSurface,
  RESOLVED_PHONE_TEST_CONTEXT,
} from '../../../../surfaces/foundation/common/test-utils';

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
    await import('../../../../primitives/navigation/tabs/engines/rustic');
    await import('../../../../primitives/inputs/button/engines/rustic');
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
    await import('../../../../primitives/inputs/button/engines/rustic');

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
            capabilityId: 'workspace.activity',
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

  it('lets the surface instance override the profile-derived tab treatment', async () => {
    const config = buildConfig({
      visual: {
        profileOverrides: {
          density: 'spacious',
        },
      },
    });

    renderSurface(<HeaderSurface config={config} />);

    const tabList = await screen.findByRole('tablist');
    expect(tabList.parentElement).toHaveAttribute('data-variant', 'card');
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

describe('HeaderSurface access contract on the Modern engine', () => {
  const ENGINE_TIMEOUT = 10000;

  beforeAll(async () => {
    await import('../../../../primitives/navigation/tabs/engines/modern');
    await import('../../../../primitives/inputs/button/engines/modern');
  });

  function renderModern(
    config: HeaderSurfaceConfig,
    responsiveContext?: typeof RESOLVED_PHONE_TEST_CONTEXT
  ) {
    return renderSurface(<HeaderSurface config={config} />, { engine: 'modern', responsiveContext });
  }

  async function findAction(name: string): Promise<HTMLElement> {
    const action = await screen.findByRole('button', { name }, { timeout: ENGINE_TIMEOUT });
    expect(action).toHaveClass('ds-button--modern');
    return action;
  }

  const queryAction = (name: string) => screen.queryByRole('button', { name });
  const findTab = (name: string) => screen.findByRole('tab', { name }, { timeout: ENGINE_TIMEOUT });

  function panelTabs(): NonNullable<HeaderSurfaceConfig['behavior']['tabs']> {
    return [
      { key: 'overview', label: 'Overview', content: 'Overview panel' },
      { key: 'activity', label: 'Activity', content: 'Activity panel', visible: false },
      { key: 'audit', label: 'Audit', content: 'Audit panel', visible: vi.fn(() => false) },
    ];
  }

  it("mode 'all' renders a predicate-hidden action and never runs its predicate", async () => {
    const predicate = vi.fn(() => false);
    const onClick = vi.fn();

    renderModern(
      buildConfig({
        behavior: {
          actions: [
            { id: 'invite', label: 'Invite' },
            { id: 'archive', label: 'Archive', visible: predicate, onClick },
          ],
        },
        access: { mode: 'all' },
      })
    );

    await findAction('Invite');
    expect(predicate).not.toHaveBeenCalled();

    const archive = screen.getByRole('button', { name: 'Archive' });
    expect(archive).toHaveAttribute('data-surface-action', 'archive');
    fireEvent.click(archive);

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(predicate).not.toHaveBeenCalled();
  });

  it("mode 'all' keeps every tab and never runs a tab predicate", async () => {
    const tabs = panelTabs();

    renderModern(buildConfig({ behavior: { tabs }, access: { mode: 'all' } }));

    expect(await findTab('Overview')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Activity' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Audit' })).toBeInTheDocument();
    expect(tabs[2].visible).not.toHaveBeenCalled();
  });

  it("mode 'resolved' keeps capability filtering, the predicate and disabled decisions", async () => {
    const predicate = vi.fn(() => false);
    const onLockedClick = vi.fn();

    renderModern(
      buildConfig({
        behavior: {
          actions: [
            { id: 'invite', label: 'Invite' },
            { id: 'danger-zone', label: 'Danger zone' },
            { id: 'unlisted', label: 'Unlisted' },
            { id: 'archive', label: 'Archive', visible: predicate },
            { id: 'locked', label: 'Locked', onClick: onLockedClick },
            { id: 'self-disabled', label: 'Self disabled', disabled: true },
          ],
        },
        access: {
          mode: 'resolved',
          capabilities: [
            { kind: 'action', id: 'invite', visible: true },
            { kind: 'action', id: 'danger-zone', visible: false },
            { kind: 'action', id: 'archive', visible: true },
            { kind: 'action', id: 'locked', visible: true, disabled: true },
            { kind: 'action', id: 'self-disabled', visible: true },
          ],
        },
      })
    );

    expect(await findAction('Invite')).toBeEnabled();
    expect(queryAction('Danger zone')).not.toBeInTheDocument();
    expect(queryAction('Unlisted')).not.toBeInTheDocument();
    expect(queryAction('Archive')).not.toBeInTheDocument();
    expect(predicate).toHaveBeenCalled();

    const locked = screen.getByRole('button', { name: 'Locked' });
    expect(locked).toBeDisabled();
    fireEvent.click(locked);
    expect(onLockedClick).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Self disabled' })).toBeDisabled();
  });

  it("mode 'resolved' keeps resolving tabs by capability", async () => {
    renderModern(
      buildConfig({
        behavior: {
          tabs: [
            { key: 'overview', label: 'Overview', content: 'Overview panel' },
            {
              key: 'activity',
              label: 'Activity',
              capabilityId: 'workspace.activity',
              content: 'Activity panel',
            },
            { key: 'audit', label: 'Audit', content: 'Audit panel' },
            { key: 'billing', label: 'Billing', content: 'Billing panel' },
          ],
        },
        access: {
          mode: 'resolved',
          capabilities: [
            { kind: 'tab', id: 'overview', visible: true },
            { kind: 'tab', id: 'workspace.activity', visible: true, disabled: true },
            { kind: 'tab', id: 'audit', visible: false },
          ],
        },
      })
    );

    expect(await findTab('Overview')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Activity' })).toBeDisabled();
    expect(screen.queryByRole('tab', { name: 'Audit' })).not.toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: 'Billing' })).not.toBeInTheDocument();
  });

  it('keeps the visible predicates as the only filter when access is omitted', async () => {
    const hiddenAction = vi.fn(() => false);
    const shownAction = vi.fn(() => true);
    const tabs = panelTabs();

    renderModern(
      buildConfig({
        behavior: {
          actions: [
            { id: 'invite', label: 'Invite' },
            { id: 'export', label: 'Export', visible: shownAction },
            { id: 'archive', label: 'Archive', visible: hiddenAction },
          ],
          tabs,
        },
      })
    );

    await findAction('Invite');
    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
    expect(queryAction('Archive')).not.toBeInTheDocument();
    expect(shownAction).toHaveBeenCalled();
    expect(hiddenAction).toHaveBeenCalled();

    expect(await findTab('Overview')).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: 'Activity' })).not.toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: 'Audit' })).not.toBeInTheDocument();
    expect(tabs[2].visible).toHaveBeenCalled();
  });

  it("keeps the phone primary selection in mode 'all' without running a predicate", async () => {
    const predicate = vi.fn(() => false);

    renderModern(
      buildConfig({
        visual: { hideSecondaryActionsOnMobile: true },
        behavior: {
          actions: [
            { id: 'export', label: 'Export', variant: 'secondary', visible: predicate },
            { id: 'invite', label: 'Invite', variant: 'primary', visible: predicate },
          ],
        },
        access: { mode: 'all' },
      }),
      RESOLVED_PHONE_TEST_CONTEXT
    );

    await findAction('Invite');
    expect(queryAction('Export')).not.toBeInTheDocument();
    expect(predicate).not.toHaveBeenCalled();
  });

  it.each([
    {
      arm: 'omitted access',
      visible: (): boolean => false,
      access: undefined,
    },
    {
      arm: "mode 'resolved'",
      visible: undefined,
      access: {
        mode: 'resolved' as const,
        capabilities: [
          { kind: 'action' as const, id: 'export', visible: true },
          { kind: 'action' as const, id: 'share', visible: true },
        ],
      },
    },
  ])('selects the phone fallback after filtering with $arm', async ({ visible, access }) => {
    renderModern(
      buildConfig({
        visual: { hideSecondaryActionsOnMobile: true },
        behavior: {
          actions: [
            { id: 'publish', label: 'Publish', variant: 'primary', visible },
            { id: 'export', label: 'Export', variant: 'secondary' },
            { id: 'share', label: 'Share', variant: 'secondary' },
          ],
        },
        access,
      }),
      RESOLVED_PHONE_TEST_CONTEXT
    );

    await findAction('Export');
    expect(queryAction('Publish')).not.toBeInTheDocument();
    expect(queryAction('Share')).not.toBeInTheDocument();
  });
});
