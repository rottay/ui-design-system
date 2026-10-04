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
  it.each(['bottom-bar', 'floating'] as const)('creates no %s dock for a primary operation denied by final access', async (placement) => {
    const config = buildConfig();
    const denied = vi.fn();
    const allowed = vi.fn();
    config.behavior.actions = [
      { id: 'primary-denied', label: 'Restricted primary', variant: 'primary', onClick: denied },
      { id: 'secondary', label: 'Allowed operation', onClick: allowed },
    ];
    config.access = { mode: 'resolved', capabilities: [
      { kind: 'action', id: 'primary-denied', visible: false },
      { kind: 'action', id: 'secondary', visible: true },
    ] };
    const { container } = renderSurface(
      <SettingsSurface config={config} postures={{ phone: { primaryAction: placement } }} />,
      { engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT },
    );
    fireEvent.click(await screen.findByRole('button', { name: 'Allowed operation' }));
    expect(allowed).toHaveBeenCalledTimes(1);
    expect(denied).not.toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: 'Restricted primary' })).toBeNull();
    expect(container.querySelector('[data-testid="action-dock"]')).toBeNull();
    expect(container.querySelector('[data-surface-region="primary-action"]')).toBeNull();
  });

  it('chooses the permitted primary once and passes resolved rows without rerunning their predicates', async () => {
    const config = buildConfig();
    const onPrimary = vi.fn();
    const visible = vi.fn(() => true);
    config.behavior.actions = [
      { id: 'denied', label: 'Restricted primary', variant: 'primary' },
      { id: 'primary', label: 'Permitted primary', variant: 'primary', visible, onClick: onPrimary },
      { id: 'secondary', label: 'Secondary operation' },
    ];
    config.access = { mode: 'resolved', capabilities: [
      { kind: 'action', id: 'denied', visible: false },
      { kind: 'action', id: 'primary', visible: true },
      { kind: 'action', id: 'secondary', visible: true },
    ] };
    const postures = { phone: { primaryAction: 'bottom-bar' as const } };
    const { container, rerender } = renderSurface(
      <SettingsSurface config={config} postures={postures} />,
      { engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT },
    );
    const primary = await screen.findByRole('button', { name: 'Permitted primary' });
    expect(primary.closest('[data-testid="action-dock"]')).not.toBeNull();
    expect(screen.getAllByRole('button', { name: 'Permitted primary' })).toHaveLength(1);
    expect(container.querySelectorAll('[data-testid="action-dock"]')).toHaveLength(1);
    expect(screen.queryByRole('button', { name: 'Restricted primary' })).toBeNull();
    fireEvent.click(primary);
    expect(onPrimary).toHaveBeenCalledTimes(1);
    visible.mockClear();
    rerender(<SettingsSurface config={config} postures={postures} />);
    expect(visible).toHaveBeenCalledTimes(1);
  });

  it('does not duplicate a primary cloned as disabled by the resolved capability', async () => {
    const config = buildConfig();
    const onPrimary = vi.fn();
    const onSecondary = vi.fn();
    config.behavior.actions = [
      { id: 'primary', label: 'Disabled primary', variant: 'primary', onClick: onPrimary },
      { id: 'secondary', label: 'Secondary operation', onClick: onSecondary },
    ];
    config.access = { mode: 'resolved', capabilities: [
      { kind: 'action', id: 'primary', visible: true, disabled: true },
      { kind: 'action', id: 'secondary', visible: true },
    ] };
    renderSurface(<SettingsSurface config={config} postures={{ phone: { primaryAction: 'floating' } }} />, {
      engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT,
    });
    const primary = await screen.findByRole('button', { name: 'Disabled primary' });
    expect(primary).toBeDisabled();
    expect(screen.getAllByRole('button', { name: 'Disabled primary' })).toHaveLength(1);
    expect(config.behavior.actions[0].disabled).toBeUndefined();
    fireEvent.click(primary);
    fireEvent.click(screen.getByRole('button', { name: 'Secondary operation' }));
    expect(onPrimary).not.toHaveBeenCalled();
    expect(onSecondary).toHaveBeenCalledTimes(1);
  });

  it.each(['hide', 'collapse'] as const)('retains explicit %s of the permitted primary without an empty dock', async (disposition) => {
    const config = buildConfig();
    const primary = vi.fn();
    config.behavior.actions = [
      { id: 'primary', label: 'Primary operation', variant: 'primary', onClick: primary },
      { id: 'secondary', label: 'Secondary operation' },
    ];
    const { container } = renderSurface(
      <SettingsSurface config={config} postures={{ phone: { primaryAction: 'bottom-bar', regions: { 'primary-action': disposition } } }} />,
      { engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT },
    );
    expect(await screen.findByRole('button', { name: 'Secondary operation' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Primary operation' })).toBeNull();
    expect(container.querySelector('[data-testid="action-dock"]')).toBeNull();
    const region = container.querySelector('[data-surface-region="primary-action"]');
    if (disposition === 'hide') expect(region).toBeNull();
    else {
      expect(region).toHaveAttribute('data-region-disposition', 'collapse');
      expect(region?.textContent).toBe('');
    }
    expect(primary).not.toHaveBeenCalled();
  });

  it('keeps omitted postures on the original action row and final access path', async () => {
    const config = buildConfig();
    const onPrimary = vi.fn();
    config.behavior.actions = [
      { id: 'primary', label: 'Existing primary', variant: 'primary', onClick: onPrimary },
      { id: 'denied', label: 'Restricted operation' },
    ];
    config.access = { mode: 'resolved', capabilities: [
      { kind: 'action', id: 'primary', visible: true },
      { kind: 'action', id: 'denied', visible: false },
    ] };
    const { container } = renderSurface(<SettingsSurface config={config} />, {
      engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT,
    });
    fireEvent.click(await screen.findByRole('button', { name: 'Existing primary' }));
    expect(onPrimary).toHaveBeenCalledTimes(1);
    expect(screen.getAllByRole('button', { name: 'Existing primary' })).toHaveLength(1);
    expect(screen.queryByRole('button', { name: 'Restricted operation' })).toBeNull();
    expect(container.querySelector('[data-testid="action-dock"], [data-surface-region]')).toBeNull();
  });

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
        capabilityId: 'settings.security',
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
