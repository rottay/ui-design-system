import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { SettingsSurface } from '.';
import type { SettingsSurfaceConfig } from '../types';
import { renderSurface } from '../common/test-utils';

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
    permissions: undefined,
    ...overrides,
  };
}

describe('SettingsSurface', () => {
  beforeAll(async () => {
    await import('../../primitives/navigation/Tabs/engines/rustic');
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

  it('filters tabs through permissions and renders tab badges', async () => {
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
    config.permissions = {
      granted: [],
      tabs: {
        'settings.security': {
          permission: 'settings:security:read',
        },
      },
    };

    renderSurface(<SettingsSurface config={config} />);

    expect(await screen.findByRole('tab', { name: /General/i })).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: /Security/i })).not.toBeInTheDocument();
  });
});
