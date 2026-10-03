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
