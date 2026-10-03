/** @fileoverview IntegrationSurface tests -- API keys, webhooks, and connected apps. */

import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { IntegrationSurface } from '..';
import type { IntegrationSurfaceConfig } from '../../../../../foundation/contracts';
import { renderSurface, RESOLVED_PHONE_TEST_CONTEXT } from '../../../../../foundation/common/test-utils';

function buildConfig(overrides?: Partial<IntegrationSurfaceConfig>): IntegrationSurfaceConfig {
  return {
    visual: {
      layout: 'sections',
    },
    presentation: {
      chrome: {
        title: 'Integrations',
        subtitle: 'Manage API keys, webhooks, and connected apps',
      },
    },
    behavior: {
      apiKeys: [
        { id: 'k1', name: 'Production', key: 'sk_live_abc123', createdAt: '2026-01-15', status: 'active' },
        { id: 'k2', name: 'Staging', key: 'sk_test_xyz789', createdAt: '2026-02-01', status: 'active' },
      ],
      webhooks: [
        { id: 'w1', url: 'https://api.example.com/webhook', events: ['order.created', 'order.updated'], status: 'active' },
      ],
      connectedApps: [
        { id: 'a1', name: 'Slack', description: 'Team notifications', status: 'connected' },
      ],
      onCreateKey: vi.fn(),
      onRevokeKey: vi.fn(),
      onCreateWebhook: vi.fn(),
      onDeleteWebhook: vi.fn(),
    },
    ...overrides,
  };
}

describe('IntegrationSurface', () => {
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
      <IntegrationSurface config={config} postures={{ phone: { primaryAction: placement } }} />,
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
      <IntegrationSurface config={config} postures={postures} />,
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
    rerender(<IntegrationSurface config={config} postures={postures} />);
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
    renderSurface(<IntegrationSurface config={config} postures={{ phone: { primaryAction: 'floating' } }} />, {
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
      <IntegrationSurface config={config} postures={{ phone: { primaryAction: 'bottom-bar', regions: { 'primary-action': disposition } } }} />,
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
    const { container } = renderSurface(<IntegrationSurface config={config} />, {
      engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT,
    });
    fireEvent.click(await screen.findByRole('button', { name: 'Existing primary' }));
    expect(onPrimary).toHaveBeenCalledTimes(1);
    expect(screen.getAllByRole('button', { name: 'Existing primary' })).toHaveLength(1);
    expect(screen.queryByRole('button', { name: 'Restricted operation' })).toBeNull();
    expect(container.querySelector('[data-testid="action-dock"], [data-surface-region]')).toBeNull();
  });

  describe.each([
    { name: 'api-keys', label: 'API Keys', content: 'Production' },
    { name: 'webhooks', label: 'Webhooks', content: 'https://api.example.com/webhook' },
  ])('$name tab posture', ({ name, label, content }) => {
    it.each([
      { loading: true, disposition: 'render' },
      { loading: true, disposition: 'hide' },
      { loading: true, disposition: 'collapse' },
      { loading: false, disposition: 'render' },
      { loading: false, disposition: 'hide' },
      { loading: false, disposition: 'collapse' },
    ] as const)('applies $disposition with loading=$loading', async ({ loading, disposition }) => {
      const config = buildConfig({ visual: { layout: 'tabs' } });
      renderSurface(
        <IntegrationSurface config={config} loading={loading} postures={{ phone: { regions: { [name]: disposition } } }} />,
        { engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT },
      );
      const tab = await screen.findByRole('tab', { name: label });
      fireEvent.click(tab);
      await waitFor(() => expect(tab).toHaveAttribute('aria-selected', 'true'));
      const panel = screen.getByRole('tabpanel');
      const region = panel.querySelector(`[data-surface-region="${name}"]`);
      if (disposition === 'hide') expect(region).toBeNull();
      else {
        expect(region).toHaveAttribute('data-region-disposition', disposition);
        if (disposition === 'collapse') expect(region?.textContent).toBe('');
      }
      if (disposition !== 'render') {
        expect(panel.querySelector('.ds-loading-skeleton')).toBeNull();
        expect(panel.textContent).not.toContain(content);
      } else if (loading) expect(panel.querySelector('.ds-loading-skeleton')).not.toBeNull();
      else await waitFor(() => expect(panel.textContent).toContain(content));
    });
  });

  it('renders API keys, webhooks, and connected apps', async () => {
    renderSurface(<IntegrationSurface config={buildConfig()} />);

    expect(await screen.findByText('Integrations')).toBeInTheDocument();
    expect(await screen.findByText('Production')).toBeInTheDocument();
    expect(await screen.findByText('sk_live_abc123')).toBeInTheDocument();
    expect(await screen.findByText(/api\.example\.com/)).toBeInTheDocument();
    expect(await screen.findByText('Slack')).toBeInTheDocument();
  });

  it('fires create key action', async () => {
    const config = buildConfig();

    renderSurface(<IntegrationSurface config={config} />);

    const createButton = await screen.findByText('Create Key').then((node) => node.closest('button'));
    if (!createButton) throw new Error('Create Key button not found');
    fireEvent.click(createButton);
    expect(config.behavior.onCreateKey).toHaveBeenCalledTimes(1);
  });

  it('fires revoke key action', async () => {
    const config = buildConfig();

    renderSurface(<IntegrationSurface config={config} />);

    const revokeButton = await screen.findAllByText('Revoke').then((nodes) => nodes[0]?.closest('button'));
    if (!revokeButton) throw new Error('Revoke button not found');
    fireEvent.click(revokeButton);
    expect(config.behavior.onRevokeKey).toHaveBeenCalledWith('k1');
  });

  it('renders empty state for API keys when none exist', async () => {
    const config = buildConfig({
      behavior: {
        apiKeys: [],
        webhooks: [],
        onCreateKey: vi.fn(),
        onCreateWebhook: vi.fn(),
      },
    });

    renderSurface(<IntegrationSurface config={config} />);

    expect(await screen.findByText('No API keys')).toBeInTheDocument();
  });
});
