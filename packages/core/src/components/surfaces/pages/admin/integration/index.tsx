'use client';

/**
 * @fileoverview IntegrationSurface -- developer settings and connected apps page.
 * @description Composes API key management, webhook configuration, and connected
 * apps overview. Supports tabbed and sectioned layouts. The app owns the actual
 * integration CRUD; this surface standardizes the page composition.
 */

import React from 'react';
import { Button, Card, Flex, Stack, Tabs, Tag, Text } from '../../../../primitives';
import type { IntegrationSurfaceConfig } from '../../../foundation/types';
import { PageShellSurface } from '../../../layout/page-shell';
import { SurfaceActionBar } from '../../../foundation/shared';
import { SurfaceEmptyState } from '../../../foundation/states';

export interface IntegrationSurfaceProps {
  config: IntegrationSurfaceConfig;
  loading?: boolean;
}

function ApiKeysSection({ config }: { config: IntegrationSurfaceConfig }): React.ReactElement {
  const { apiKeys, onCreateKey, onRevokeKey } = config.behavior;

  return (
    <Card variant="outlined">
      <Card.Body>
        <Stack spacing="md">
          <Flex justify="between" align="center">
            <Text style={{ fontSize: 16, fontWeight: 600 }}>API Keys</Text>
            {onCreateKey && (
              <Button variant="primary" size="sm" onClick={onCreateKey}>
                <Text>Create Key</Text>
              </Button>
            )}
          </Flex>
          {!apiKeys || apiKeys.length === 0 ? (
            <SurfaceEmptyState title="No API keys" description="Create an API key to get started." />
          ) : (
            <Stack spacing="xs">
              {apiKeys.map((key) => (
                <Flex
                  key={key.id}
                  className="ds-integration__divider"
                  justify="between"
                  align="center"
                  style={{ padding: '8px 0', borderBottom: '1px solid var(--ds-color-border)' }}
                >
                  <Stack spacing="xs">
                    <Text style={{ fontWeight: 500 }}>{key.name}</Text>
                    <Text
                      className="ds-integration__muted-text"
                      data-part="muted-text"
                      style={{ color: 'var(--ds-color-text-muted)', fontSize: 12, fontFamily: 'monospace' }}
                    >
                      {key.key}
                    </Text>
                  </Stack>
                  <Flex gap={8} align="center">
                    <Tag color={key.status === 'active' ? 'success' : key.status === 'expired' ? 'warning' : 'default'}>
                      {key.status ?? 'active'}
                    </Tag>
                    <Text
                      className="ds-integration__muted-text"
                      data-part="muted-text"
                      style={{ color: 'var(--ds-color-text-muted)', fontSize: 12 }}
                    >
                      Created {key.createdAt}
                    </Text>
                    {onRevokeKey && (
                      <Button variant="danger" size="sm" onClick={() => onRevokeKey(key.id)}>
                        <Text>Revoke</Text>
                      </Button>
                    )}
                  </Flex>
                </Flex>
              ))}
            </Stack>
          )}
        </Stack>
      </Card.Body>
    </Card>
  );
}

function WebhooksSection({ config }: { config: IntegrationSurfaceConfig }): React.ReactElement {
  const { webhooks, onCreateWebhook, onDeleteWebhook } = config.behavior;

  return (
    <Card variant="outlined">
      <Card.Body>
        <Stack spacing="md">
          <Flex justify="between" align="center">
            <Text style={{ fontSize: 16, fontWeight: 600 }}>Webhooks</Text>
            {onCreateWebhook && (
              <Button variant="primary" size="sm" onClick={onCreateWebhook}>
                <Text>Create Webhook</Text>
              </Button>
            )}
          </Flex>
          {!webhooks || webhooks.length === 0 ? (
            <SurfaceEmptyState title="No webhooks" description="Create a webhook to receive event notifications." />
          ) : (
            <Stack spacing="xs">
              {webhooks.map((wh) => (
                <Flex
                  key={wh.id}
                  className="ds-integration__divider"
                  justify="between"
                  align="center"
                  style={{ padding: '8px 0', borderBottom: '1px solid var(--ds-color-border)' }}
                >
                  <Stack spacing="xs">
                    <Text style={{ fontWeight: 500, fontFamily: 'monospace', fontSize: 13 }}>{wh.url}</Text>
                    <Text
                      className="ds-integration__muted-text"
                      data-part="muted-text"
                      style={{ color: 'var(--ds-color-text-muted)', fontSize: 12 }}
                    >
                      Events: {wh.events.join(', ')}
                    </Text>
                  </Stack>
                  <Flex gap={8} align="center">
                    <Tag color={wh.status === 'active' ? 'success' : wh.status === 'failed' ? 'error' : 'default'}>
                      {wh.status ?? 'active'}
                    </Tag>
                    {onDeleteWebhook && (
                      <Button variant="danger" size="sm" onClick={() => onDeleteWebhook(wh.id)}>
                        <Text>Delete</Text>
                      </Button>
                    )}
                  </Flex>
                </Flex>
              ))}
            </Stack>
          )}
        </Stack>
      </Card.Body>
    </Card>
  );
}

function ConnectedAppsSection({ config }: { config: IntegrationSurfaceConfig }): React.ReactElement | null {
  const { connectedApps, onDisconnectApp } = config.behavior;

  if (!connectedApps || connectedApps.length === 0) return null;

  return (
    <Card variant="outlined">
      <Card.Body>
        <Stack spacing="md">
          <Text style={{ fontSize: 16, fontWeight: 600 }}>Connected Apps</Text>
          <Stack spacing="xs">
            {connectedApps.map((app) => (
              <Flex
                key={app.id}
                className="ds-integration__divider"
                justify="between"
                align="center"
                style={{ padding: '8px 0', borderBottom: '1px solid var(--ds-color-border)' }}
              >
                <Flex gap={12} align="center">
                  {app.icon}
                  <Stack spacing="xs">
                    <Text style={{ fontWeight: 500 }}>{app.name}</Text>
                    {app.description && (
                      <Text
                        className="ds-integration__muted-text"
                        data-part="muted-text"
                        style={{ color: 'var(--ds-color-text-muted)', fontSize: 12 }}
                      >{app.description}</Text>
                    )}
                  </Stack>
                </Flex>
                <Flex gap={8} align="center">
                  <Tag color={app.status === 'connected' ? 'success' : app.status === 'error' ? 'error' : 'default'}>
                    {app.status ?? 'connected'}
                  </Tag>
                  {onDisconnectApp && (
                    <Button variant="secondary" size="sm" onClick={() => onDisconnectApp(app.id)}>
                      <Text>Disconnect</Text>
                    </Button>
                  )}
                </Flex>
              </Flex>
            ))}
          </Stack>
        </Stack>
      </Card.Body>
    </Card>
  );
}

export function IntegrationSurface({
  config,
  loading = false,
}: IntegrationSurfaceProps): React.ReactElement {
  const actionsNode = <SurfaceActionBar actions={config.behavior.actions} permissions={config.permissions} />;
  const useTabs = config.visual.layout === 'tabs';

  // API Keys and Webhooks always appear because they are the minimum
  // developer tooling any integration page needs. Connected Apps is
  // excluded from the tab bar when empty to avoid a confusing blank tab.
  const content = useTabs ? (
    <Tabs
      className="ds-surface ds-integration ds-integration--tabs"
      items={[
        {
          key: 'api-keys',
          label: 'API Keys',
          children: <ApiKeysSection config={config} />,
        },
        {
          key: 'webhooks',
          label: 'Webhooks',
          children: <WebhooksSection config={config} />,
        },
        ...(config.behavior.connectedApps && config.behavior.connectedApps.length > 0
          ? [{
              key: 'apps',
              label: 'Connected Apps',
              children: <ConnectedAppsSection config={config} />,
            }]
          : []),
      ]}
    />
  ) : (
    <Stack
      className="ds-surface ds-integration ds-integration--sections"
      data-part="root"
      data-loading={loading ? 'true' : 'false'}
      spacing="lg"
    >
      <ApiKeysSection config={config} />
      <WebhooksSection config={config} />
      <ConnectedAppsSection config={config} />
    </Stack>
  );

  return (
    <PageShellSurface
      chrome={{ ...config.presentation.chrome, maxWidth: config.visual.maxWidth }}
      actions={actionsNode}
      loading={loading}
    >
      {content}
    </PageShellSurface>
  );
}
