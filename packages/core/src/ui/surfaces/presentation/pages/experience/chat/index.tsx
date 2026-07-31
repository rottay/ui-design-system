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
 *
 * Composition seam with the assistant kit: transcript messages render through
 * {@link MessageBubble}, whose parts drive `StreamingText` (streaming shimmer
 * that stops dead on completion) and `ToolCallCard` (a terminal receipt for
 * completed/errored calls, including `duration`). Higher-order compounds --
 * `PreviewDiffCard`, `ConfirmActionCard`, and `AssistantStatusIndicator` --
 * compose into the transcript through the `renderMessage` / `renderPart` slots
 * or a message `artifact` part, with the app supplying domain copy and
 * callbacks. This surface is the single conversation host: no `AgentChatSurface`
 * is introduced (monorepo non-negotiable).
 *
 * States: `loading` renders a surface-owned mirror skeleton (message-bubble
 * blocks plus a composer block inside the same section cards, so the swap to
 * real content is paint-only -- the page-shell loading early-return is
 * intentionally not engaged); `error` composes the shared `SurfaceErrorState`
 * kit with retry under the live page chrome; `behavior.sending` drives the
 * composer's async/busy posture (disabled input + loading send button). The
 * transcript carries NO live-region role on purpose: the chat contract does
 * not declare live-region semantics (owner directive: never infer
 * `role="log"`/`alert`/`status` without an explicit contract), and the
 * pattern-owned `TypingIndicator` already announces itself with its own
 * `role="status"`.
 */

import React, { useEffect, useState } from 'react';
import { Box, Button, Card, Grid, Stack, Textarea } from '../../../../../primitives';
import {
  MessageBubble,
  TypingIndicator,
  type AssistantMessagePart,
} from '../../../../../patterns';
import { FadeIn, StaggerChildren } from '@/graphics/motion';
import { useSurfaceTranslations } from '../../../../runtime/helpers/states/i18n';
import { useSurfaceProfileDefaultsWithOverrides } from '../../../../runtime/profile-defaults/overrides';
import { useSurfaceResponsiveLayout } from '../../../../runtime/responsive';
import {
  resolveStackSpacing,
  SurfaceAccentBarWrapper,
} from '../../../../runtime/profile-defaults/personality';
import type { ChatSurfaceConfig, ChatSurfaceMessage } from '../../../../foundation/contracts';
import { PageShellSurface } from '../../../../composition/layout/page-shell';
import { SurfaceActionBar, SurfaceSectionCard } from '../../../../runtime/helpers/rendering';
import { SurfaceEmptyState, SurfaceErrorState } from '../../../../runtime/helpers/states';
import { useResponsive } from '@/infrastructure/runtime/responsive';

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

/**
 * Loading placeholder that mirrors the conversation anatomy. The bubble
 * blocks alternate alignment and length like a real transcript and the
 * composer block keeps the input/send geometry, all inside the same section
 * cards as the loaded state, so the swap to real content is a pure paint
 * change, never a layout shift. Geometry and pulse live in the chat skin;
 * the blocks are decorative (`aria-hidden`) while the root carries
 * `aria-busy`.
 */
function ChatLoadingSkeleton(): React.ReactElement {
  const { tSurfaceOr } = useSurfaceTranslations();

  return (
    <>
      <SurfaceSectionCard title={tSurfaceOr('chat.conversation_title', 'Conversation')}>
        <Stack data-part="transcript-skeleton" spacing="md" aria-hidden="true">
          <Box data-part="chat-skeleton-bubble" data-align="start" data-size="lg" />
          <Box data-part="chat-skeleton-bubble" data-align="end" data-size="md" />
          <Box data-part="chat-skeleton-bubble" data-align="start" data-size="sm" />
        </Stack>
      </SurfaceSectionCard>
      <Box
        className="ds-chat__composer"
        data-part="composer"
        data-mobile-sticky="false"
        data-keyboard-open="false"
      >
        <SurfaceSectionCard title={tSurfaceOr('chat.composer_title', 'Composer')}>
          <Stack spacing="md" aria-hidden="true">
            <Box data-part="chat-skeleton-block" data-size="composer-input" />
            <Box data-part="chat-skeleton-block" data-size="send-button" />
          </Stack>
        </SurfaceSectionCard>
      </Box>
    </>
  );
}

export interface ChatSurfaceProps {
  config: ChatSurfaceConfig;
  loading?: boolean;
  /** Load failure of the conversation payload; renders the shared error kit under the live page chrome. */
  error?: unknown;
  /** Retry handler wired to the error state's retry action. */
  onRetry?: () => void | Promise<void>;
}

/** Full chat surface composed from transcript, composer, optional sidebar, and shell chrome. */
export function ChatSurface({
  config,
  loading = false,
  error,
  onRetry,
}: ChatSurfaceProps): React.ReactElement {
  const { tSurfaceOr } = useSurfaceTranslations();
  const profileDefaults = useSurfaceProfileDefaultsWithOverrides(config.visual?.profileOverrides);
  const { shouldStack, isMobile, hasResolvedViewport } = useSurfaceResponsiveLayout(config.visual);
  const { virtualKeyboardInset, isVirtualKeyboardOpen } = useResponsive();
  const resolvedMobile = isMobile && hasResolvedViewport;
  const showSidebar =
    !!config.presentation.sidebar &&
    !(resolvedMobile && config.visual.hideListOnMobile === true);
  const stickyComposer = resolvedMobile && config.visual.stickyInputOnMobile === true;
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

  const useSplit = showSidebar && !shouldStack;
  // `sidebarWidth` is contract-declared: when set, the split leaves the fixed
  // 12-column 8/4 recipe and gives the sidebar its own track; the main column
  // stays fluid (`minmax(0, 1fr)`) so long content can never overflow it.
  const sidebarTrack =
    config.visual.sidebarWidth === undefined || config.visual.sidebarWidth === null
      ? undefined
      : typeof config.visual.sidebarWidth === 'number'
        ? `${config.visual.sidebarWidth}px`
        : config.visual.sidebarWidth;

  // Error state renders under the live page chrome so header actions (e.g.
  // refresh) stay usable, mirroring the dashboard surface idiom.
  if (error) {
    return (
      <PageShellSurface
        chrome={{
          ...config.presentation.chrome,
          maxWidth: config.visual.maxWidth ?? config.presentation.chrome.maxWidth,
        }}
        actions={<SurfaceActionBar actions={config.behavior.actions} access={config.access} />}
      >
        <SurfaceErrorState error={error} onRetry={onRetry} />
      </PageShellSurface>
    );
  }

  // The chat layout uses a 12-column grid with 8/4 split when a sidebar is
  // present and viewport is wide enough (or a contract-declared sidebar
  // track). On mobile or when no sidebar content is provided, it collapses
  // to a single column.
  const chatContent = (
    <Grid
      className={`ds-surface ds-chat ds-chat--${useSplit ? 'split' : 'stacked'}${loading ? ' ds-chat--loading' : ''}`}
      data-part="root"
      data-layout={useSplit ? 'split' : 'stacked'}
      data-mobile={resolvedMobile ? 'true' : 'false'}
      data-loading={loading ? 'true' : 'false'}
      aria-busy={loading ? 'true' : undefined}
      data-mobile-sidebar={showSidebar ? 'visible' : 'hidden'}
      data-mobile-composer={stickyComposer ? 'sticky' : 'inline'}
      columns={useSplit ? 12 : 1}
      templateColumns={useSplit && sidebarTrack ? `minmax(0, 1fr) minmax(0, ${sidebarTrack})` : undefined}
      gap={sectionSpacing}
    >
      <Grid.Item span={useSplit && !sidebarTrack ? 8 : undefined}>
        <Stack spacing={sectionSpacing}>
          {config.presentation.headerContent}

          {loading ? (
            /* Mirror skeleton: the section frames and page chrome stay live
               and the swap to real content is paint-only. The page-shell
               loading early-return is intentionally NOT engaged (dashboard
               idiom) because it would drop the conversation anatomy. */
            <ChatLoadingSkeleton />
          ) : (
            <>
              <SurfaceSectionCard title={tSurfaceOr('chat.conversation_title', 'Conversation')}>
                {config.behavior.messages.length === 0 ? (
                  config.presentation.emptyState ?? (
                    <SurfaceEmptyState
                      title={tSurfaceOr('chat.empty_title', 'No messages yet')}
                      description={tSurfaceOr('chat.empty_description', 'Send the first message to start the conversation.')}
                    />
                  )
                ) : (
                  <Stack
                    className="ds-chat__transcript"
                    data-part="transcript"
                    spacing="md"
                    style={
                      config.visual.transcriptHeight !== undefined
                        ? // Contract-declared instance geometry. The skin owns
                          // the default max-block-size and the scroll behavior
                          // (overflow, overscroll containment, stable gutter).
                          { maxBlockSize: config.visual.transcriptHeight }
                        : undefined
                    }
                  >
                    {/* When entrance motion is enabled, transcript messages reveal as a coordinated group. */}
                    {profileDefaults.animateEntrance ? (
                      <StaggerChildren
                        staggerDelayMs={profileDefaults.staggerDelay}
                        durationMs={profileDefaults.entranceDuration}
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
                      <Box className="ds-chat__typing" data-part="typing-indicator">
                        <TypingIndicator
                          label={config.behavior.typingLabel ?? tSurfaceOr('chat.typing', 'Assistant is typing')}
                        />
                      </Box>
                    ) : null}
                  </Stack>
                )}
              </SurfaceSectionCard>

              <Box
                className="ds-chat__composer"
                data-part="composer"
                data-mobile-sticky={stickyComposer ? 'true' : 'false'}
                data-keyboard-open={isVirtualKeyboardOpen ? 'true' : 'false'}
                style={
                  {
                    '--ds-virtual-keyboard-inset': `${Math.max(0, virtualKeyboardInset)}px`,
                  } as React.CSSProperties
                }
              >
                <SurfaceSectionCard title={tSurfaceOr('chat.composer_title', 'Composer')}>
                  <Stack spacing="md">
                    <Textarea
                      className="ds-chat__composer-input"
                      value={draft}
                      onChange={(nextValue) => setDraft(nextValue)}
                      placeholder={config.presentation.composerPlaceholder ?? tSurfaceOr('chat.placeholder', 'Write a message')}
                      aria-label={config.presentation.composerPlaceholder ?? tSurfaceOr('chat.composer_label', 'Message input')}
                      rows={config.visual.composerRows ?? 4}
                      disabled={config.behavior.sending}
                    />
                    <Button
                      className="ds-chat__send-button"
                      variant="primary"
                      onClick={() => void handleSend()}
                      loading={config.behavior.sending}
                      disabled={!draft.trim() || config.behavior.sending}
                    >
                      {config.behavior.sendLabel ?? tSurfaceOr('chat.send', 'Send')}
                    </Button>
                  </Stack>
                </SurfaceSectionCard>
              </Box>
            </>
          )}

          {config.presentation.footer}
        </Stack>
      </Grid.Item>

      {showSidebar && (
        <Grid.Item span={useSplit && !sidebarTrack ? 4 : undefined}>
          <Card className="ds-chat__sidebar" variant={profileDefaults.cardVariant}>
            <Card.Body>{config.presentation.sidebar}</Card.Body>
          </Card>
        </Grid.Item>
      )}
    </Grid>
  );

  return (
    /* The shell's loading early-return is intentionally not engaged: the
       surface owns a mirror skeleton that preserves the conversation anatomy
       (dashboard idiom), so the page chrome and section frames stay live and
       the swap to real content is paint-only. */
    <PageShellSurface
      chrome={{
        ...config.presentation.chrome,
        maxWidth: config.visual.maxWidth ?? config.presentation.chrome.maxWidth,
      }}
      actions={<SurfaceActionBar actions={config.behavior.actions} access={config.access} />}
      loading={false}
    >
      <SurfaceAccentBarWrapper defaults={profileDefaults}>
        {profileDefaults.animateEntrance ? (
          <FadeIn durationMs={profileDefaults.entranceDuration}>
            {chatContent}
          </FadeIn>
        ) : (
          chatContent
        )}
      </SurfaceAccentBarWrapper>
    </PageShellSurface>
  );
}
