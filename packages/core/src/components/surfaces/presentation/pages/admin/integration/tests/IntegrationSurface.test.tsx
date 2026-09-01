/** @fileoverview IntegrationSurface tests -- API keys, webhooks, and connected apps. */

import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { IntegrationSurface } from '..';
import type { IntegrationSurfaceConfig } from '../../../../../foundation/contracts';
import { renderSurface } from '../../../../../foundation/common/test-utils';

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
