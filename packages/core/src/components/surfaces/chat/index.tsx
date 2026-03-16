'use client';

/**
 * @fileoverview ChatSurface - Rottay Design System
 * @description Reusable conversation surface for assistants, support inboxes,
 * and operator messaging workflows.
 *
 * @remarks
 * The surface owns layout, transcript scaffolding, composer behavior, and
 * personality-aware motion. It deliberately delegates rich message rendering
 * to assistant patterns so the shell stays vendor-agnostic.
 */

import React, { useEffect, useState } from 'react';
import { Box, Button, Card, Grid, Stack, Text, Textarea } from '../../primitives';
import {
  MessageBubble,
  TypingIndicator,
  type AssistantMessagePart,
} from '../../patterns';
import { FadeIn, StaggerChildren } from '../../../motion';
import { useSurfaceTranslations } from '../i18n';
import { useSurfaceProfileDefaults } from '../profile-defaults';
import { useSurfaceResponsiveLayout } from '../responsive';
import {
  resolveStackSpacing,
  SurfaceAccentBarWrapper,
} from '../personality-helpers';
import type { ChatSurfaceConfig, ChatSurfaceMessage } from '../types';
import { PageShellSurface } from '../page-shell';
import { SurfaceActionBar, SurfaceSectionCard } from '../shared';
import { SurfaceEmptyState } from '../states';

/** Default transcript renderer used when consumers do not provide a custom message slot. */
function DefaultMessage({
  message,
  renderPart,
}: {
  message: ChatSurfaceMessage;
  renderPart?: (part: AssistantMessagePart, context: { message: ChatSurfaceMessage; index: number }) => React.ReactNode;
}): React.ReactElement {
  const parts = normalizeMessageParts(message);

  return (
    <MessageBubble
      author={message.author}
      parts={parts}
      avatar={message.avatar}
      timestamp={message.timestamp}
      meta={message.meta}
      status={message.status}
      align={message.align}
      role={message.role}
      deliveryStatus={message.deliveryStatus}
      renderPart={renderPart ? (part, index) => renderPart(part, { message, index }) : undefined}
    />
  );
}

/**
 * Normalize legacy `body` fields into the richer assistant message part model.
 *
 * This keeps older surface configs working while newer configs can provide
 * explicit rich parts such as tool blocks or attachments.
 */
function normalizeMessageParts(message: ChatSurfaceMessage): AssistantMessagePart[] {
  // Start from explicit parts if the caller provided them.
  const parts = [...(message.parts ?? [])];

  // Legacy compat: older configs pass a `body` string instead of typed parts.
  // We auto-promote it so callers do not have to migrate all at once.
  if (parts.length === 0 && message.body !== undefined && message.body !== null) {
    if (typeof message.body === 'string' || typeof message.body === 'number') {
      parts.push({
        type: 'text',
        content: String(message.body),
        streaming: message.streaming,
      });
    } else {
      // Non-primitive bodies (React nodes, objects) are treated as artifacts
      // so the pattern can render them in a distinct visual container.
      parts.push({
        type: 'artifact',
        content: message.body,
      });
    }
  }

  // Attachments are appended only when not already represented in the parts
  // array. This prevents duplication when a config supplies both `parts` and
  // the legacy `attachments` field.
  if (
    message.attachments &&
    !parts.some((part) => part.type === 'attachments')
  ) {
    parts.push({
      type: 'attachments',
      content: message.attachments,
    });
  }

  return parts;
}

export interface ChatSurfaceProps {
  config: ChatSurfaceConfig;
  loading?: boolean;
}

/** Full chat surface composed from transcript, composer, optional sidebar, and shell chrome. */
export function ChatSurface({
  config,
  loading = false,
}: ChatSurfaceProps): React.ReactElement {
  const { tSurface } = useSurfaceTranslations();
  const profileDefaults = useSurfaceProfileDefaults();
  const { shouldStack } = useSurfaceResponsiveLayout(config.visual);
  const sectionSpacing = resolveStackSpacing(profileDefaults.sectionSpacing);
  // The composer supports both controlled (app owns draft state) and
  // uncontrolled (surface owns draft state) modes. When `config.behavior.draft`
  // is defined, the surface defers to the app's value.
  const [internalDraft, setInternalDraft] = useState(config.behavior.draft ?? '');
  const draft = config.behavior.draft ?? internalDraft;

  // Keep local draft state in sync when the surface is controlled from outside.
  useEffect(() => {
    if (config.behavior.draft !== undefined) {
      setInternalDraft(config.behavior.draft);
    }
  }, [config.behavior.draft]);

  /** Update the draft while supporting both controlled and uncontrolled usage. */
  const setDraft = (nextValue: string): void => {
    if (config.behavior.draft === undefined) {
      setInternalDraft(nextValue);
    }

    config.behavior.onDraftChange?.(nextValue);
  };

  /** Submit the current draft through the configured send handler and reset local state when allowed. */
  const handleSend = async (): Promise<void> => {
    if (!draft.trim() || !config.behavior.onSend) {
      return;
    }

    await config.behavior.onSend(draft);

    if (config.behavior.draft === undefined) {
      setInternalDraft('');
    }
  };

  /**
   * Resolve typing indicator speed to a CSS animation-duration value.
   * Personality pulse speed drives how fast the dots animate.
   */
  const typingSpeed = profileDefaults.pulseSpeed === 'fast'
    ? '0.8s'
    : profileDefaults.pulseSpeed === 'slow'
      ? '1.8s'
      : '1.2s';

  // The chat layout uses a 12-column grid with 8/4 split when a sidebar is
  // present and viewport is wide enough. On mobile or when no sidebar
  // content is provided, it collapses to a single column.
  const chatContent = (
    <Grid columns={config.presentation.sidebar && !shouldStack ? 12 : 1} gap={sectionSpacing}>
      <Grid.Item span={config.presentation.sidebar && !shouldStack ? 8 : undefined}>
        <Stack spacing={sectionSpacing}>
          {config.presentation.headerContent}

          <SurfaceSectionCard title={tSurface('chat.conversation_title')}>
            {config.behavior.messages.length === 0 ? (
              config.presentation.emptyState ?? (
                <SurfaceEmptyState
                  title={tSurface('chat.empty_title')}
                  description={tSurface('chat.empty_description')}
                />
              )
            ) : (
              <Stack
                spacing="md"
                style={{
                  maxHeight: config.visual.transcriptHeight ?? 520,
                  overflowY: 'auto',
                }}
                role="log"
                aria-live="polite"
                aria-relevant="additions text"
              >
                {/* When entrance motion is enabled, transcript messages reveal as a coordinated group. */}
                {profileDefaults.animateEntrance ? (
                  <StaggerChildren
                    staggerDelay={profileDefaults.staggerDelay}
                    duration={profileDefaults.entranceDuration}
                  >
                    {config.behavior.messages.map((message, index) => (
                      <React.Fragment key={message.id}>
                        {config.presentation.renderMessage?.(message, index) ?? (
                          <DefaultMessage
                            message={message}
                            renderPart={config.presentation.renderPart}
                          />
                        )}
                      </React.Fragment>
                    ))}
                  </StaggerChildren>
                ) : (
                  config.behavior.messages.map((message, index) => (
                    <React.Fragment key={message.id}>
                      {config.presentation.renderMessage?.(message, index) ?? (
                        <DefaultMessage
                          message={message}
                          renderPart={config.presentation.renderPart}
                        />
                      )}
                    </React.Fragment>
                  ))
                )}
                {config.behavior.assistantTyping ? (
                  <Box style={{ '--ds-typing-speed': typingSpeed } as React.CSSProperties}>
                    <TypingIndicator
                      label={config.behavior.typingLabel ?? tSurface('chat.typing')}
                    />
                  </Box>
                ) : null}
              </Stack>
            )}
          </SurfaceSectionCard>

          <SurfaceSectionCard title={tSurface('chat.composer_title')}>
            <Stack spacing="md">
              {/* When a personality accent bar is active, the composer gets a
                  matching primary border to visually tie it to the accent
                  theme. Without an accent, the default border is used. */}
              <Textarea
                value={draft}
                onChange={(nextValue) => setDraft(nextValue)}
                placeholder={config.presentation.composerPlaceholder ?? tSurface('chat.placeholder')}
                rows={config.visual.composerRows ?? 4}
                disabled={config.behavior.sending}
                style={
                  profileDefaults.accentPosition !== 'none'
                    ? { borderColor: 'var(--ds-color-primary)' }
                    : undefined
                }
              />
              <Button
                variant="primary"
                onClick={() => void handleSend()}
                loading={config.behavior.sending}
                disabled={!draft.trim() || config.behavior.sending}
              >
                {config.behavior.sendLabel ?? tSurface('chat.send')}
              </Button>
            </Stack>
          </SurfaceSectionCard>

          {config.presentation.footer}
        </Stack>
      </Grid.Item>

      {config.presentation.sidebar && (
        <Grid.Item span={!shouldStack ? 4 : undefined}>
          <Card variant={profileDefaults.cardVariant}>
            <Card.Body>{config.presentation.sidebar}</Card.Body>
          </Card>
        </Grid.Item>
      )}
    </Grid>
  );

  return (
    <PageShellSurface
      chrome={{
        ...config.presentation.chrome,
        maxWidth: config.visual.maxWidth ?? config.presentation.chrome.maxWidth,
      }}
      actions={<SurfaceActionBar actions={config.behavior.actions} permissions={config.permissions} />}
      loading={loading}
    >
      <SurfaceAccentBarWrapper defaults={profileDefaults}>
        {profileDefaults.animateEntrance ? (
          <FadeIn duration={profileDefaults.entranceDuration}>
            {chatContent}
          </FadeIn>
        ) : (
          chatContent
        )}
      </SurfaceAccentBarWrapper>
    </PageShellSurface>
  );
}
