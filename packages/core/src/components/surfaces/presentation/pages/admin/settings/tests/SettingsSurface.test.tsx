/** @fileoverview SettingsSurface tests -- tab rendering, sidebar, and permission filtering. */

import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { beforeAll, describe, expect, expectTypeOf, it, vi } from 'vitest';
import { SettingsSurface, type SettingsSurfaceProps } from '..';
import type { SurfacePostures } from '../../../../../foundation/contracts/postures';
import type { SettingsSurfaceConfig } from '../../../../../foundation/contracts';
import { renderSurface, RESOLVED_PHONE_TEST_CONTEXT } from '../../../../../foundation/common/test-utils';

function buildConfig(overrides?: Partial<SettingsSurfaceConfig>): SettingsSurfaceConfig {
  return {
    visual: {
      tabsType: 'line',
    },
    presentation: {
      chrome: {
        title: 'Workspace Settings',
      },
      intro: 'Tune workspace defaults and governance rules.',
    },
    behavior: {
      tabs: [
        {
          key: 'general',
          label: 'General',
          content: <div>General settings panel</div>,
        },
        {
          key: 'security',
          label: 'Security',
          content: <div>Security settings panel</div>,
        },
      ],
      onTabChange: vi.fn(),
    },
    access: undefined,
    ...overrides,
  };
}

describe('SettingsSurface', () => {
  it('owns the canonical optional posture prop', () => {
    expectTypeOf<SettingsSurfaceProps['postures']>().toEqualTypeOf<SurfacePostures | undefined>();
  });

  it.each(['app-bar', 'bottom-bar', 'floating'] as const)('names the existing primary action row in %s and preserves callbacks and final access', async (placement) => {
    const config = buildConfig();
    const save = vi.fn();
    const denied = vi.fn();
    config.behavior.actions = [
      { id: 'save', label: 'Save settings', variant: 'primary', onClick: save },
      { id: 'denied', label: 'Restricted operation', onClick: denied },
    ];
    config.access = { mode: 'resolved', capabilities: [
      { kind: 'tab', id: 'general', visible: true },
      { kind: 'action', id: 'save', visible: true },
      { kind: 'action', id: 'denied', visible: false },
    ] };
    const { container } = renderSurface(
      <SettingsSurface config={config} postures={{ phone: { primaryAction: placement } }} />,
      { engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT },
    );
    const action = await screen.findByRole('button', { name: 'Save settings' });
    const row = action.closest('[data-surface-region="primary-action"]');
    expect(row).toHaveClass('rottay-flex');
    expect(row).toBe(action.parentElement);
    expect(row).toHaveAttribute('data-region-disposition', 'render');
    expect(row).toHaveAttribute('data-posture', 'phone');
    expect(container.querySelectorAll('[data-surface-region="primary-action"]')).toHaveLength(1);
    if (placement !== 'app-bar') expect(action.closest(`[data-surface-region="${placement}"]`)).not.toBeNull();
    expect(screen.getAllByRole('button', { name: 'Save settings' })).toHaveLength(1);
    expect(screen.queryByRole('button', { name: 'Restricted operation' })).toBeNull();
    fireEvent.click(action);
    expect(save).toHaveBeenCalledTimes(1);
    expect(denied).not.toHaveBeenCalled();
  });

  it('collapses the real sidebar without introducing a wrapper between the grid and its items', async () => {
    const config = buildConfig();
    config.presentation.sidebar = <button>Section navigation</button>;
    const { container } = renderSurface(
      <SettingsSurface config={config} postures={{ phone: { density: 'compact', regions: { sidebar: 'collapse' } } }} />,
      { engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT },
    );
    expect(await screen.findByText('General settings panel')).toBeInTheDocument();
    const sidebar = container.querySelector('[data-surface-region="sidebar"]');
    expect(sidebar).toHaveAttribute('data-region-disposition', 'collapse');
    expect(sidebar?.parentElement).toHaveClass('ds-settings');
    expect(screen.queryByRole('button', { name: 'Section navigation' })).toBeNull();
    expect(container.querySelector('.ds-settings')).toHaveAttribute('data-density', 'compact');
  });

  beforeAll(async () => {
    await import('../../../../../../primitives/navigation/tabs/engines/rustic');
  });

  it('switches tabs and forwards tab changes', async () => {
    const config = buildConfig();

    renderSurface(<SettingsSurface config={config} />);

    const securityTab = await screen.findByRole(
      'tab',
      { name: 'Security' },
      { timeout: 15000 }
    );

    fireEvent.click(securityTab);

    await waitFor(() => {
      expect(config.behavior.onTabChange).toHaveBeenCalledWith('security');
    });

    expect(
      await screen.findByText('Security settings panel', undefined, { timeout: 15000 })
    ).toBeInTheDocument();
  });

  it('applies final tab decisions and renders tab badges', async () => {
    const config = buildConfig();
    config.behavior.tabs = [
      {
        key: 'general',
        label: 'General',
        badge: <span>3</span>,
        content: <div>General settings panel</div>,
      },
      {
        key: 'security',
        label: 'Security',
        permissionId: 'settings.security',
        content: <div>Security settings panel</div>,
      },
    ];
    config.access = {
      mode: 'resolved',
      capabilities: [
        { kind: 'tab', id: 'general', visible: true },
        { kind: 'tab', id: 'settings.security', visible: false },
      ],
    };

    renderSurface(<SettingsSurface config={config} />);

    expect(await screen.findByRole('tab', { name: /General/i })).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: /Security/i })).not.toBeInTheDocument();
  });
});
