'use client';

/**
 * IntegrationSurface
 *
 * Config-driven developer settings page: API key management, webhook
 * configuration, and connected apps, stacked (sections) or tabbed. The app
 * owns the integration CRUD and side effects; the surface owns composition,
 * states, and visual rhythm.
 *
 * Composition: PageShellSurface chrome + Card sections + Tag status chips +
 * the shared state kits (loading skeleton, error with retry, empty states).
 * Visible copy resolves through `tSurfaceOr` under `surfaces.integration.*`
 * with an English floor, and visual defaults cascade config -> product
 * profile -> DS defaults via `useSurfaceProfileDefaultsWithOverrides`.
 */

import { densityScopeAttributes } from '@/infrastructure/runtime/foundation/density';
import { useBreakpoints } from '@/infrastructure/runtime/responsive/composition/react/provider/breakpoint-state';
import { FadeIn } from '@/graphics/motion';
import { AccessApiKeyIcon } from '@/graphics/icons/presentation/semantic/generated/roles/access-api-key';
import { ActionPauseIcon } from '@/graphics/icons/presentation/semantic/generated/roles/action-pause';
import { ActionPlayIcon } from '@/graphics/icons/presentation/semantic/generated/roles/action-play';
import { ConnectivityWebIcon } from '@/graphics/icons/presentation/semantic/generated/roles/connectivity-web';
import { WorkflowWebhookIcon } from '@/graphics/icons/presentation/semantic/generated/roles/workflow-webhook';
import React from 'react';
import { Button, Card, Flex, Stack, Tabs, Tag, Text } from '../../../../../primitives';
import type {
  IntegrationApiKey,
  IntegrationConnectedApp,
  IntegrationSurfaceConfig,
  IntegrationWebhook,
} from '../../../../foundation/contracts';
import { PageShellSurface } from '../../../../composition/layout/page-shell';
import { SurfaceActionBar } from '../../../../runtime/helpers/rendering';
import {
  SurfaceEmptyState,
  SurfaceErrorState,
  SurfaceLoadingSkeleton,
} from '../../../../runtime/helpers/states';
import { useSurfaceTranslations } from '../../../../runtime/helpers/states/i18n';
import { useSurfaceProfileDefaultsWithOverrides } from '../../../../runtime/profile-defaults/overrides';
import { resolveStackSpacing } from '../../../../runtime/profile-defaults/personality';
import type { CardVariant } from '../../../../../primitives/display/Card/contracts';

export interface IntegrationSurfaceProps {
  config: IntegrationSurfaceConfig;
  loading?: boolean;
  /** Load/render failure surfaced as an error state (ListSurface prop precedent). */
  error?: unknown;
  /** Retry handler rendered inside the error state when provided. */
  onRetry?: () => void | Promise<void>;
}

/** Card variant the active profile cascade resolved; sections share it. */
type SectionCardVariant = CardVariant;

/**
 * Section header: governed semantic icon (decorative; the title carries the
 * meaning) next to the section title. Local to the surface — every section
 * header renders the same rhythm.
 */
function SectionHeader({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}): React.ReactElement {
  return (
    <Flex gap={8} align="center">
      {icon}
      <Text size="md" weight="semibold">
        {title}
      </Text>
    </Flex>
  );
}

/**
 * Semantic tones for the closed status vocabularies the contract documents.
 * `revoked` maps to neutral (a deliberate terminal state, not a failure);
 * `paused` maps to warning because a paused webhook silently drops events.
 */
function apiKeyStatusTone(status: NonNullable<IntegrationApiKey['status']>): 'success' | 'warning' | 'neutral' {
  if (status === 'active') return 'success';
  if (status === 'expired') return 'warning';
  return 'neutral';
}

function webhookStatusTone(status: NonNullable<IntegrationWebhook['status']>): 'success' | 'warning' | 'danger' {
  if (status === 'active') return 'success';
  if (status === 'paused') return 'warning';
  return 'danger';
}

function appStatusTone(status: NonNullable<IntegrationConnectedApp['status']>): 'success' | 'neutral' | 'danger' {
  if (status === 'connected') return 'success';
  if (status === 'error') return 'danger';
  return 'neutral';
}

function ApiKeysSection({
  config,
  cardVariant,
}: {
  config: IntegrationSurfaceConfig;
  cardVariant: SectionCardVariant;
}): React.ReactElement {
  const { tSurfaceOr } = useSurfaceTranslations();
  const { apiKeys, onCreateKey, onRevokeKey } = config.behavior;

  return (
    <Card variant={cardVariant}>
      <Card.Body>
        <Stack spacing="md">
          <Flex justify="between" align="center" gap={12} wrap="wrap">
            <SectionHeader
              icon={<AccessApiKeyIcon decorative size={16} />}
              title={tSurfaceOr('integration.keys_title', 'API Keys')}
            />
            {onCreateKey && (
              <Button variant="primary" size="sm" onClick={onCreateKey}>
                {tSurfaceOr('integration.action_create_key', 'Create Key')}
              </Button>
            )}
          </Flex>
          {!apiKeys || apiKeys.length === 0 ? (
            // No duplicate CTA here: the header create button stays visible
            // directly above the empty state inside the same card.
            <SurfaceEmptyState
              icon={<AccessApiKeyIcon decorative size={32} />}
              title={tSurfaceOr('integration.keys_empty_title', 'No API keys')}
              description={tSurfaceOr(
                'integration.keys_empty_description',
                'Create an API key to get started.'
              )}
            />
          ) : (
            <Stack
              spacing="none"
              role="list"
              aria-label={tSurfaceOr('integration.keys_list_aria', 'API keys')}
            >
              {apiKeys.map((key) => {
                // The status string is app data rendered verbatim; only its
                // tone is mapped onto the semantic Tag channel. An absent
                // status reads as active (pre-existing display default).
                const status = key.status ?? 'active';
                return (
                  <Flex
                    key={key.id}
                    className="ds-integration__divider"
                    role="listitem"
                    justify="between"
                    align="center"
                    gap={12}
                    wrap="wrap"
                  >
                    <Stack spacing="xs">
                      <Text weight="medium">{key.name}</Text>
                      <Text
                        size="xs"
                        color="muted"
                        monospace
                        className="ds-integration__muted-text ds-integration__secret"
                      >
                        {key.key}
                      </Text>
                    </Stack>
                    <Flex gap={8} align="center" wrap="wrap">
                      <Tag tone={apiKeyStatusTone(status)}>{status}</Tag>
                      <Text
                        size="xs"
                        color="muted"
                        numeric="tabular"
                        className="ds-integration__muted-text"
                      >
                        {tSurfaceOr('integration.key_created', 'Created {date}', {
                          date: key.createdAt,
                        })}
                      </Text>
                      {/*
                        Revoke fires the contract callback directly: the contract
                        declares no confirmation step, so the surface does not
                        invent one (registered debt — a destructive action this
                        direct wants a contract-declared confirm).
                      */}
                      {onRevokeKey && (
                        <Button
                          variant="danger"
                          size="sm"
                          aria-label={tSurfaceOr(
                            'integration.key_revoke_aria',
                            'Revoke API key {name}',
                            { name: key.name }
                          )}
                          onClick={() => onRevokeKey(key.id)}
                        >
                          {tSurfaceOr('integration.action_revoke', 'Revoke')}
                        </Button>
                      )}
                    </Flex>
                  </Flex>
                );
              })}
            </Stack>
          )}
        </Stack>
      </Card.Body>
    </Card>
  );
}

function WebhooksSection({
  config,
  cardVariant,
}: {
  config: IntegrationSurfaceConfig;
  cardVariant: SectionCardVariant;
}): React.ReactElement {
  const { tSurfaceOr } = useSurfaceTranslations();
  const { webhooks, onCreateWebhook, onDeleteWebhook, onToggleWebhook } = config.behavior;

  return (
    <Card variant={cardVariant}>
      <Card.Body>
        <Stack spacing="md">
          <Flex justify="between" align="center" gap={12} wrap="wrap">
            <SectionHeader
              icon={<WorkflowWebhookIcon decorative size={16} />}
              title={tSurfaceOr('integration.webhooks_title', 'Webhooks')}
            />
            {onCreateWebhook && (
              <Button variant="primary" size="sm" onClick={onCreateWebhook}>
                {tSurfaceOr('integration.action_create_webhook', 'Create Webhook')}
              </Button>
            )}
          </Flex>
          {!webhooks || webhooks.length === 0 ? (
            <SurfaceEmptyState
              icon={<WorkflowWebhookIcon decorative size={32} />}
              title={tSurfaceOr('integration.webhooks_empty_title', 'No webhooks')}
              description={tSurfaceOr(
                'integration.webhooks_empty_description',
                'Create a webhook to receive event notifications.'
              )}
            />
          ) : (
            <Stack
              spacing="none"
              role="list"
              aria-label={tSurfaceOr('integration.webhooks_list_aria', 'Webhooks')}
            >
              {webhooks.map((wh) => {
                const status = wh.status ?? 'active';
                const isPaused = status === 'paused';
                return (
                  <Flex
                    key={wh.id}
                    className="ds-integration__divider"
                    role="listitem"
                    justify="between"
                    align="center"
                    gap={12}
                    wrap="wrap"
                  >
                    <Stack spacing="xs">
                      <Text weight="medium" size="sm" monospace className="ds-integration__endpoint">
                        {wh.url}
                      </Text>
                      <Text size="xs" color="muted" className="ds-integration__muted-text">
                        {tSurfaceOr('integration.webhook_events', 'Events: {events}', {
                          events: wh.events.join(', '),
                        })}
                      </Text>
                    </Stack>
                    <Flex gap={8} align="center" wrap="wrap">
                      <Tag tone={webhookStatusTone(status)}>{status}</Tag>
                      {/*
                        Pause/resume wires the contract-declared onToggleWebhook
                        (previously dead). Delete fires directly — no contract
                        confirmation, none invented (same debt as revoke).
                      */}
                      {onToggleWebhook && (
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={
                            isPaused ? (
                              <ActionPlayIcon decorative size={15} />
                            ) : (
                              <ActionPauseIcon decorative size={15} />
                            )
                          }
                          aria-label={tSurfaceOr(
                            isPaused
                              ? 'integration.webhook_resume_aria'
                              : 'integration.webhook_pause_aria',
                            isPaused ? 'Resume webhook {url}' : 'Pause webhook {url}',
                            { url: wh.url }
                          )}
                          onClick={() => onToggleWebhook(wh.id)}
                        >
                          {tSurfaceOr(
                            isPaused
                              ? 'integration.webhook_action_resume'
                              : 'integration.webhook_action_pause',
                            isPaused ? 'Resume' : 'Pause'
                          )}
                        </Button>
                      )}
                      {onDeleteWebhook && (
                        <Button
                          variant="danger"
                          size="sm"
                          aria-label={tSurfaceOr(
                            'integration.webhook_delete_aria',
                            'Delete webhook {url}',
                            { url: wh.url }
                          )}
                          onClick={() => onDeleteWebhook(wh.id)}
                        >
                          {tSurfaceOr('integration.action_delete', 'Delete')}
                        </Button>
                      )}
                    </Flex>
                  </Flex>
                );
              })}
            </Stack>
          )}
        </Stack>
      </Card.Body>
    </Card>
  );
}

// ConnectedAppsSection renders only when apps exist. Returning null keeps the
// page (and the tab bar) free of a permanently empty section — connected apps
// are optional tooling, unlike keys/webhooks which get an empty state.
function ConnectedAppsSection({
  config,
  cardVariant,
}: {
  config: IntegrationSurfaceConfig;
  cardVariant: SectionCardVariant;
}): React.ReactElement | null {
  const { tSurfaceOr } = useSurfaceTranslations();
  const { connectedApps, onDisconnectApp } = config.behavior;

  if (!connectedApps || connectedApps.length === 0) return null;

  return (
    <Card variant={cardVariant}>
      <Card.Body>
        <Stack spacing="md">
          <SectionHeader
            icon={<ConnectivityWebIcon decorative size={16} />}
            title={tSurfaceOr('integration.apps_title', 'Connected Apps')}
          />
          <Stack
            spacing="none"
            role="list"
            aria-label={tSurfaceOr('integration.apps_list_aria', 'Connected apps')}
          >
            {connectedApps.map((app) => {
              const status = app.status ?? 'connected';
              return (
                <Flex
                  key={app.id}
                  className="ds-integration__divider"
                  role="listitem"
                  justify="between"
                  align="center"
                  gap={12}
                  wrap="wrap"
                >
                  <Flex gap={12} align="center" wrap="wrap">
                    {app.icon}
                    <Stack spacing="xs">
                      <Text weight="medium">{app.name}</Text>
                      {app.description && (
                        <Text size="xs" color="muted" className="ds-integration__muted-text">
                          {app.description}
                        </Text>
                      )}
                    </Stack>
                  </Flex>
                  <Flex gap={8} align="center" wrap="wrap">
                    <Tag tone={appStatusTone(status)}>{status}</Tag>
                    {onDisconnectApp && (
                      <Button
                        variant="secondary"
                        size="sm"
                        aria-label={tSurfaceOr('integration.app_disconnect_aria', 'Disconnect {name}', {
                          name: app.name,
                        })}
                        onClick={() => onDisconnectApp(app.id)}
                      >
                        {tSurfaceOr('integration.action_disconnect', 'Disconnect')}
                      </Button>
                    )}
                  </Flex>
                </Flex>
              );
            })}
          </Stack>
        </Stack>
      </Card.Body>
    </Card>
  );
}

/**
 * Structural loading body: one skeleton card per canonical integration region
 * (API keys, webhooks, connected apps) so the placeholder mirrors the final
 * footprint instead of the shell's whole-page placeholder — PatternPageShell's
 * `loading` early return never renders children, so a shaped body skeleton
 * can only exist here (SU01 idiom). Row counts scale with density.
 */
function IntegrationLoadingBody({
  cardVariant,
  isCompact,
}: {
  cardVariant: SectionCardVariant;
  isCompact: boolean;
}): React.ReactElement {
  return (
    <>
      <Card variant={cardVariant}>
        <Card.Body>
          <SurfaceLoadingSkeleton rows={isCompact ? 4 : 3} />
        </Card.Body>
      </Card>
      <Card variant={cardVariant}>
        <Card.Body>
          <SurfaceLoadingSkeleton rows={isCompact ? 3 : 2} />
        </Card.Body>
      </Card>
      <Card variant={cardVariant}>
        <Card.Body>
          <SurfaceLoadingSkeleton rows={isCompact ? 2 : 1} />
        </Card.Body>
      </Card>
    </>
  );
}

export function IntegrationSurface({
  config,
  loading = false,
  error,
  onRetry,
}: IntegrationSurfaceProps): React.ReactElement {
  const profileDefaults = useSurfaceProfileDefaultsWithOverrides(
    config.visual?.profileOverrides
  );
  const { tSurfaceOr } = useSurfaceTranslations();
  const { isMobile } = useBreakpoints();
  const useTabs = config.visual.layout === 'tabs';
  const cardVariant = profileDefaults.cardVariant;
  const isCompact = profileDefaults.density === 'compact';
  const actionsNode = <SurfaceActionBar actions={config.behavior.actions} access={config.access} />;

  // Error short-circuits the whole body: the shell keeps the page chrome so
  // retry never loses context (ListSurface precedent).
  if (error) {
    return (
      <PageShellSurface
        chrome={{ ...config.presentation.chrome, maxWidth: config.visual.maxWidth }}
        loading={false}
      >
        <SurfaceErrorState error={error} onRetry={onRetry} />
      </PageShellSurface>
    );
  }

  const sections = loading ? (
    <IntegrationLoadingBody cardVariant={cardVariant} isCompact={isCompact} />
  ) : (
    <>
      <ApiKeysSection config={config} cardVariant={cardVariant} />
      <WebhooksSection config={config} cardVariant={cardVariant} />
      <ConnectedAppsSection config={config} cardVariant={cardVariant} />
    </>
  );

  // API Keys and Webhooks always appear because they are the minimum
  // developer tooling any integration page needs. Connected Apps is
  // excluded from the tab bar when empty to avoid a confusing blank tab.
  // Tabs stamps its own root (`data-part="root"`) and does not forward
  // arbitrary data-* attrs, so the state attributes live on the sections
  // root only; the surface classes land on the Tabs root either way.
  const content = useTabs ? (
    <Tabs
      className="ds-surface ds-integration ds-integration--tabs"
      items={[
        {
          key: 'api-keys',
          label: tSurfaceOr('integration.keys_title', 'API Keys'),
          children: loading ? (
            <Card variant={cardVariant}>
              <Card.Body>
                <SurfaceLoadingSkeleton rows={isCompact ? 4 : 3} />
              </Card.Body>
            </Card>
          ) : (
            <ApiKeysSection config={config} cardVariant={cardVariant} />
          ),
        },
        {
          key: 'webhooks',
          label: tSurfaceOr('integration.webhooks_title', 'Webhooks'),
          children: loading ? (
            <Card variant={cardVariant}>
              <Card.Body>
                <SurfaceLoadingSkeleton rows={isCompact ? 3 : 2} />
              </Card.Body>
            </Card>
          ) : (
            <WebhooksSection config={config} cardVariant={cardVariant} />
          ),
        },
        ...(!loading && config.behavior.connectedApps && config.behavior.connectedApps.length > 0
          ? [
              {
                key: 'apps',
                label: tSurfaceOr('integration.apps_title', 'Connected Apps'),
                children: <ConnectedAppsSection config={config} cardVariant={cardVariant} />,
              },
            ]
          : []),
      ]}
    />
  ) : (
    <Stack
      className="ds-surface ds-integration ds-integration--sections"
      data-part="root"
      data-view="sections"
      data-mobile={isMobile ? 'true' : 'false'}
      {...densityScopeAttributes(profileDefaults.density)}
      data-loading={loading ? 'true' : 'false'}
      aria-busy={loading}
      spacing={resolveStackSpacing(profileDefaults.sectionSpacing)}
    >
      {sections}
    </Stack>
  );

  return (
    <PageShellSurface
      chrome={{ ...config.presentation.chrome, maxWidth: config.visual.maxWidth }}
      actions={actionsNode}
      loading={false}
    >
      {profileDefaults.animateEntrance ? (
        <FadeIn durationMs={profileDefaults.entranceDuration}>{content}</FadeIn>
      ) : (
        content
      )}
    </PageShellSurface>
  );
}
