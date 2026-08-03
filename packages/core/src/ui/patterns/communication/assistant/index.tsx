'use client';

/**
 * @fileoverview Assistant UI pattern -- composable chat primitives for AI
 * assistant interfaces. Exports StreamingText, TypingIndicator, ToolCallCard,
 * MessageBubble, AssistantStatusBadge, AssistantStatusIndicator,
 * PreviewDiffCard, and ConfirmActionCard.
 *
 * Unlike engine-based patterns, these components use DS primitives directly
 * (Box, Card, Stack, Text, Tag, Button) and are engine-agnostic. They handle
 * rendering concerns (streaming shimmer/caret, typing dots, tool receipts,
 * diff/confirm surfaces) while leaving message state management to the consumer.
 *
 * The kit is domain-agnostic: field labels, values, actions, and callbacks
 * arrive as props so no product entity meaning leaks into the design system.
 */

import React from 'react';

import { Box, Button, Card, Stack, Text, Tag } from '../../../primitives';
import { ShimmerText, useReducedMotion } from '@/graphics/motion';
import { MarkdownView } from '../../../primitives/display/MarkdownView';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { NavigationForwardIcon } from '@/graphics/icons/presentation/semantic/generated/roles/navigation-forward';
import type {
  AssistantAgentStatus,
  AssistantDeliveryStatus,
  AssistantMessagePart,
  AssistantMessageRole,
  AssistantStatusBadgeProps,
  AssistantStatusIndicatorProps,
  AssistantToolStatus,
  ConfirmActionCardProps,
  MessageBubbleProps,
  PreviewDiffCardProps,
  StreamingTextProps,
  ToolCallCardProps,
  TypingIndicatorProps,
} from './contracts';

export type {
  AssistantMessageRole,
  AssistantDeliveryStatus,
  AssistantToolStatus,
  AssistantAgentStatus,
  AssistantMessagePart,
  AssistantStatusBadgeProps,
  AssistantStatusIndicatorProps,
  StreamingTextProps,
  TypingIndicatorProps,
  ToolCallCardProps,
  PreviewDiffChange,
  PreviewDiffRow,
  PreviewDiffCardProps,
  ConfirmActionCardProps,
  MessageBubbleProps,
} from './contracts';

// Animation keyframes (`ds-assistant-caret`, `ds-assistant-dot`) live in
// `components/skin/assistant.css`, not injected per-mount here, so the
// streaming caret and typing/status dots animate without a co-mounted
// dependency.

// -- Internal mapping helpers --

/** Floor-resolving translator shape (the optional `components` i18n channel
    with an English floor; the kit renders standalone without a provider). */
type FloorTranslator = (key: string, floor: string) => string;

/** Returns the identity-bound translator for the calling component. */
function useAssistantCopy(): FloorTranslator {
  const i18n = useOptionalTranslation('components');
  return (key, floor) => i18n?.tOr(key, floor) ?? floor;
}

// Maps assistant-specific tone names to the DS Tag's variant prop. "danger"
// maps to "error" because the Tag component uses semantic color names while
// the assistant domain uses UX-oriented tone labels.
function toneToVariant(
  tone: AssistantStatusBadgeProps['tone']
): 'default' | 'primary' | 'success' | 'warning' | 'error' {
  switch (tone) {
    case 'success':
      return 'success';
    case 'warning':
      return 'warning';
    case 'danger':
      return 'error';
    case 'info':
      return 'primary';
    default:
      return 'default';
  }
}

/** Converts a delivery lifecycle status into a visual tone for badge display. */
function deliveryStatusToTone(
  deliveryStatus: AssistantDeliveryStatus | undefined
): AssistantStatusBadgeProps['tone'] {
  switch (deliveryStatus) {
    case 'sent':
      return 'success';
    case 'sending':
    case 'streaming':
      return 'info';
    case 'error':
      return 'danger';
    default:
      return 'neutral';
  }
}

/** Returns a human-readable label for the message role, or null for unknown
    roles. Visible copy resolves through the `components` catalog with an
    English floor (never a hardcoded-only string). */
function roleLabel(
  role: AssistantMessageRole | undefined,
  t: FloorTranslator
): string | null {
  switch (role) {
    case 'assistant':
      return t('assistant.role.assistant', 'Assistant');
    case 'user':
      return t('assistant.role.user', 'User');
    case 'system':
      return t('assistant.role.system', 'System');
    case 'tool':
      return t('assistant.role.tool', 'Tool');
    default:
      return null;
  }
}

/** Maps a tool execution status to the badge tone used across the kit. */
function toolStatusToTone(
  status: AssistantToolStatus
): AssistantStatusBadgeProps['tone'] {
  switch (status) {
    case 'complete':
      return 'success';
    case 'error':
      return 'danger';
    case 'running':
      return 'info';
    default:
      return 'warning';
  }
}

/**
 * Resolves an agent activity status to its liveness and default label. Live
 * states (thinking/streaming/acting) animate; idle/error hold static. The
 * dot's per-status color is a skin rule keyed on the stamped `data-status`
 * (`components/skin/assistant.css`), not computed here. Default labels
 * resolve through the `components` catalog with an English floor.
 */
function agentStatusVisual(
  status: AssistantAgentStatus,
  t: FloorTranslator
): {
  live: boolean;
  defaultLabel: string;
} {
  switch (status) {
    case 'thinking':
      return { live: true, defaultLabel: t('assistant.status.thinking', 'Thinking') };
    case 'streaming':
      return { live: true, defaultLabel: t('assistant.status.streaming', 'Streaming') };
    case 'acting':
      return { live: true, defaultLabel: t('assistant.status.acting', 'Acting') };
    case 'error':
      return { live: false, defaultLabel: t('assistant.status.error', 'Error') };
    default:
      return { live: false, defaultLabel: t('assistant.status.idle', 'Idle') };
  }
}

/**
 * Renders a tonal badge for delivery or tool status.
 *
 * @param props - Badge label and optional tone (neutral, success, warning, danger, info).
 * @returns A small outlined Tag with the appropriate semantic color.
 */
export function AssistantStatusBadge({
  label,
  tone = 'neutral',
}: AssistantStatusBadgeProps): React.ReactElement {
  return (
    <Tag className="ds-assistant-status-badge" data-part="root" variant={toneToVariant(tone)} outlined size="sm">
      {label}
    </Tag>
  );
}

/**
 * Displays text with a live affordance while streaming is active.
 *
 * While streaming with motion enabled, the text renders through the shared
 * ShimmerText effect so the copy reads as actively generating; a blinking
 * caret marks the insertion point. The shimmer and caret exist only inside the
 * streaming branch, so both stop the instant streaming completes. Under reduced
 * motion the shimmer is dropped in favor of a static (non-blinking) caret.
 *
 * The `as` prop switches between plain text and monospace (markdown) rendering.
 * The caret is `aria-hidden` because the streaming state is conveyed by the
 * parent's delivery status badge, not by the decorative motion.
 *
 * @param props - Text content, streaming flag, display mode, reduced-motion override.
 * @returns A text block with a streaming-only shimmer and caret.
 */
export function StreamingText({
  text,
  streaming = false,
  as = 'text',
  reducedMotion,
}: StreamingTextProps): React.ReactElement {
  const prefersReducedMotion = useReducedMotion();
  // A controlled `reducedMotion` wins; otherwise defer to the OS preference.
  const reduceMotion = reducedMotion ?? prefersReducedMotion;
  // Bare declared channel (fallback-parity): `--ds-font-family-mono` is a
  // catalogued foundation token, so no literal/var fallback rides along.
  // Kept inline (not the skin) because the Typography engine skins paint
  // `font-family` directly on the Text root and would beat an inherited rule.
  // The `white-space: pre-wrap` behavior is skin-owned (the Typography skins
  // declare no white-space, so the root's rule inherits cleanly).
  const fontFamily =
    as === 'markdown' ? 'var(--ds-font-family-mono)' : undefined;

  return (
    <Box className="ds-assistant-streaming-text" data-part="root">
      {streaming && !reduceMotion ? (
        <ShimmerText text={text} style={fontFamily ? { fontFamily } : undefined} />
      ) : (
        <Text style={fontFamily ? { fontFamily } : undefined}>{text}</Text>
      )}
      {streaming ? (
        // The blink runs only while motion is allowed: the engine stamps
        // `data-motion` (the controlled `reducedMotion` prop wins over the OS
        // preference, so a media query alone cannot express the cut-off) and
        // the SKIN owns the loop on its private period channel
        // (`--_ds-assistant-caret-duration`) -- same
        // contract as AssistantStatusIndicator's dot; the keyframe itself
        // stays skin-owned (`ds-assistant-caret`). The caret is aria-hidden:
        // the streaming state is conveyed by the parent's delivery status.
        <span
          data-part="caret"
          data-motion={reduceMotion ? 'static' : 'live'}
          aria-hidden="true"
        >
          |
        </span>
      ) : null}
    </Box>
  );
}

/**
 * Animated three-dot indicator with an accessible "typing" status label.
 *
 * Uses `role="status"` and `aria-live="polite"` so screen readers
 * announce when the assistant starts typing. The dots are `aria-hidden`
 * since they are purely decorative.
 *
 * @param props - Optional custom label (defaults to "Assistant is typing").
 * @returns An inline indicator with bouncing dots and a muted text label.
 */
export function TypingIndicator({
  label,
}: TypingIndicatorProps): React.ReactElement {
  const t = useAssistantCopy();
  // Default copy reuses the catalogued chat surface string (EN/ES/AR ship
  // `surfaces.chat.typing`); a caller label always wins.
  const resolvedLabel = label ?? t('surfaces.chat.typing', 'Assistant is typing');
  return (
    <Box
      className="ds-assistant-typing-indicator"
      data-part="root"
      role="status"
      aria-live="polite"
    >
      {/* Geometry + motion are skin-owned: the dots bounce on the private
          `--_ds-assistant-dot-duration` channel with an nth-child stagger,
          and hold static under
          `prefers-reduced-motion` (the role=status label keeps the state
          comprehensible without motion). */}
      <Box data-part="dots" aria-hidden="true">
        {[0, 1, 2].map((index) => (
          <Box key={index} data-part="typing-dot" />
        ))}
      </Box>
      <Text color="muted">{resolvedLabel}</Text>
    </Box>
  );
}

/**
 * Card displaying a tool invocation with its name, status badge, and either a
 * live input/output expansion or a terminal receipt.
 *
 * Designed for AI assistant UIs where the model calls external tools
 * (e.g. search, code execution). The status badge tone derives from the status
 * string. Once the call reaches `complete` or `error` the card collapses to a
 * compact receipt: a single outcome line plus the elapsed `duration`, tinted by
 * the status tone through semantic `--ds-color-*` tokens.
 *
 * @param props - Tool name, execution status, optional I/O content, and duration.
 * @returns An outlined Card with structured tool call information.
 */
export function ToolCallCard({
  name,
  status,
  summary,
  input,
  output,
  duration,
  meta,
}: ToolCallCardProps): React.ReactElement {
  const t = useAssistantCopy();
  const tone = toolStatusToTone(status);
  // Completed and errored calls read as a compact receipt (outcome + elapsed
  // time), not the live input/output expansion.
  const terminal = status === 'complete' || status === 'error';

  return (
    <Card className="ds-assistant-tool-call-card" data-part="root" variant="outlined">
      <Card.Body>
        <Stack spacing="sm">
          <Stack direction="horizontal" justify="space-between" align="center">
            <Text weight="bold">{name}</Text>
            <AssistantStatusBadge label={status} tone={tone} />
          </Stack>
          {terminal ? (
            summary || duration ? (
              <Stack
                direction="horizontal"
                justify="space-between"
                align="center"
                spacing="sm"
              >
                {summary ? (
                  <Text size="sm" color="muted">
                    {summary}
                  </Text>
                ) : (
                  <Box />
                )}
                {duration ? (
                  <Text data-part="tool-card" data-tone={tone} size="sm">
                    {duration}
                  </Text>
                ) : null}
              </Stack>
            ) : null
          ) : (
            <>
              {summary ? <Box>{summary}</Box> : null}
              {input ? (
                <Box>
                  <Text size="sm" color="muted">
                    {t('assistant.tool.input', 'Input')}
                  </Text>
                  <Box>{input}</Box>
                </Box>
              ) : null}
              {output ? (
                <Box>
                  <Text size="sm" color="muted">
                    {t('assistant.tool.output', 'Output')}
                  </Text>
                  <Box>{output}</Box>
                </Box>
              ) : null}
            </>
          )}
          {meta ? <Box>{meta}</Box> : null}
        </Stack>
      </Card.Body>
    </Card>
  );
}

/**
 * Compact activity indicator for an assistant/agent. Renders a tonal dot and a
 * label for the current status. The dot animates only for live states
 * (thinking, streaming, acting) and holds static for idle/error or under
 * reduced motion. Reuses the typing-dot keyframes.
 *
 * @param props - Agent status, optional label, and reduced-motion override.
 * @returns An inline status indicator with a tonal dot and label.
 */
export function AssistantStatusIndicator({
  status,
  label,
  reducedMotion,
}: AssistantStatusIndicatorProps): React.ReactElement {
  const t = useAssistantCopy();
  const prefersReducedMotion = useReducedMotion();
  const reduceMotion = reducedMotion ?? prefersReducedMotion;
  const visual = agentStatusVisual(status, t);
  // Animation runs only while the state is live and motion is allowed; the
  // dot stamps `data-motion` so the SKIN owns the loop (proto channel) and
  // its reduced-motion cut-off -- the JS no longer carries raw durations.
  const animate = visual.live && !reduceMotion;

  return (
    <Box
      className="ds-assistant-status-indicator"
      data-part="root"
      role="status"
      aria-live="polite"
    >
      <Box
        data-part="dot"
        data-status={status}
        data-motion={animate ? 'live' : 'static'}
        aria-hidden="true"
      />
      <Text size="sm" color="muted">
        {label ?? visual.defaultLabel}
      </Text>
    </Box>
  );
}

/**
 * Before/after field table for a proposed mutation. Each row shows the prior
 * and proposed value; added values are tinted with `--ds-color-success` and
 * removed values with `--ds-color-error`. Fully domain-agnostic: labels and
 * values arrive as opaque nodes.
 *
 * @param props - Optional title, before/after rows, column labels, and metadata.
 * @returns An outlined Card presenting the diff rows.
 */
export function PreviewDiffCard({
  title,
  rows,
  beforeLabel,
  afterLabel,
  meta,
}: PreviewDiffCardProps): React.ReactElement {
  const t = useAssistantCopy();
  const resolvedBeforeLabel = beforeLabel ?? t('assistant.diff.before', 'Before');
  const resolvedAfterLabel = afterLabel ?? t('assistant.diff.after', 'After');
  return (
    <Card className="ds-assistant-preview-diff-card" data-part="root" variant="outlined">
      <Card.Body>
        <Stack spacing="sm">
          {title ? <Text weight="bold">{title}</Text> : null}
          <Stack direction="horizontal" spacing="sm" align="center">
            {/* Column geometry (2/3/3 split, arrow gutter) is skin-owned via
                the stamped parts; the arrow cell is the governed
                auto-mirroring forward icon (flips in RTL), never a Unicode
                arrow glyph. */}
            <Box data-part="diff-spacer" />
            <Text data-part="diff-head-cell" data-diff-side="before" size="xs" color="muted">
              {resolvedBeforeLabel}
            </Text>
            <Box data-part="diff-arrow" aria-hidden="true" />
            <Text data-part="diff-head-cell" data-diff-side="after" size="xs" color="muted">
              {resolvedAfterLabel}
            </Text>
          </Stack>
          {rows.map((row, index) => {
            const change = row.change ?? 'updated';
            return (
              <Stack
                key={`diff-row-${index}`}
                data-part="divider"
                direction="horizontal"
                spacing="sm"
                align="center"
              >
                <Text data-part="diff-label" size="sm" weight="semibold">
                  {row.label}
                </Text>
                <Box data-part="diff-cell-wrap" data-diff-side="before">
                  {row.before !== undefined ? (
                    <Text
                      data-part="preview-cell"
                      data-diff-side="before"
                      data-change={change}
                      size="sm"
                    >
                      {row.before}
                    </Text>
                  ) : null}
                </Box>
                <Box data-part="diff-arrow" aria-hidden="true">
                  <NavigationForwardIcon decorative size={12} />
                </Box>
                <Box data-part="diff-cell-wrap" data-diff-side="after">
                  {row.after !== undefined ? (
                    <Text
                      data-part="preview-cell"
                      data-diff-side="after"
                      data-change={change}
                      size="sm"
                      weight={change === 'unchanged' ? undefined : 'semibold'}
                    >
                      {row.after}
                    </Text>
                  ) : null}
                </Box>
              </Stack>
            );
          })}
          {meta ? <Box>{meta}</Box> : null}
        </Stack>
      </Card.Body>
    </Card>
  );
}

/**
 * Proposed-action confirmation surface. Presents a summary and optional detail
 * slot, then confirm/cancel controls wired to caller callbacks. Fully
 * domain-agnostic: copy and callbacks are supplied by the consumer. Passing
 * `actions` replaces the default control pair entirely.
 *
 * @param props - Summary, details, control labels, callbacks, and state flags.
 * @returns An outlined Card with an action summary and confirm/cancel controls.
 */
export function ConfirmActionCard({
  title,
  summary,
  details,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  confirmDisabled = false,
  busy = false,
  tone = 'default',
  actions,
}: ConfirmActionCardProps): React.ReactElement {
  const t = useAssistantCopy();
  // Default control copy reuses the catalogued shared button strings
  // (`button.confirm` / `button.cancel`, shipped EN/ES/AR); explicit labels
  // always win.
  const resolvedConfirmLabel = confirmLabel ?? t('button.confirm', 'Confirm');
  const resolvedCancelLabel = cancelLabel ?? t('button.cancel', 'Cancel');
  return (
    <Card className="ds-assistant-confirm-action-card" data-part="root" variant="outlined">
      <Card.Body>
        <Stack spacing="sm">
          {title ? <Text weight="bold">{title}</Text> : null}
          {summary ? <Box>{summary}</Box> : null}
          {details ? <Box>{details}</Box> : null}
          {actions ?? (
            <Stack direction="horizontal" justify="end" align="center" spacing="sm">
              <Button variant="secondary" onClick={onCancel} disabled={busy}>
                {resolvedCancelLabel}
              </Button>
              <Button
                variant={tone === 'danger' ? 'danger' : 'primary'}
                onClick={onConfirm}
                loading={busy}
                disabled={confirmDisabled || busy}
              >
                {resolvedConfirmLabel}
              </Button>
            </Stack>
          )}
        </Stack>
      </Card.Body>
    </Card>
  );
}

/**
 * Default renderer for a single message part. Handles text, markdown,
 * tool-status, artifact, and attachment part types. Consumers can override
 * this via `MessageBubble.renderPart` for custom rendering.
 */
function renderDefaultPart(part: AssistantMessagePart, index: number): React.ReactNode {
  switch (part.type) {
    case 'text':
      return <StreamingText key={`part-${index}`} text={part.content} streaming={part.streaming} />;
    case 'markdown':
      // While tokens are still streaming, keep the raw monospace stream (a
      // per-chunk markdown re-parse is a deliberate follow-up, not v1). Once the
      // part completes, swap to MarkdownView so the user sees rendered markdown
      // -- headings, lists, code, links -- instead of raw source. MarkdownView
      // is XSS-safe by construction (AST -> DS primitives, no innerHTML).
      // ChatSurface needs no change: it renders parts through this default
      // renderer (or a consumer `renderPart` override), and the part union
      // already carries the `markdown` type.
      return part.streaming ? (
        <StreamingText
          key={`part-${index}`}
          text={part.content}
          streaming
          as="markdown"
        />
      ) : (
        <MarkdownView key={`part-${index}`} source={part.content} />
      );
    case 'tool-status':
      return (
        <ToolCallCard
          key={`part-${index}`}
          name={part.name}
          status={part.status}
          summary={part.summary}
          input={part.input}
          output={part.output}
          duration={part.duration}
          meta={part.meta}
        />
      );
    case 'artifact':
      return (
        <Card key={`part-${index}`} variant="filled">
          <Card.Body>
            <Stack spacing="sm">
              {part.title ? <Text weight="bold">{part.title}</Text> : null}
              <Box>{part.content}</Box>
              {part.meta ? <Box>{part.meta}</Box> : null}
            </Stack>
          </Card.Body>
        </Card>
      );
    case 'attachments':
      return <Box key={`part-${index}`}>{part.content}</Box>;
    default:
      return null;
  }
}

/**
 * Chat message bubble rendering multi-part content with author, avatar,
 * timestamp, and delivery status.
 *
 * Layout adapts based on `align`: "end" uses a filled Card and right-aligns
 * (for user messages), "start" uses an outlined Card and left-aligns
 * (for assistant/system messages).
 *
 * Each message part is rendered by `renderPart` (custom) or the built-in
 * `renderDefaultPart` which supports text, markdown, tool-status, artifact,
 * and attachment part types.
 *
 * @param props - Message content, metadata, and optional custom part renderer.
 * @returns A positioned Card with author header, message parts, and footer metadata.
 */
export function MessageBubble({
  author,
  parts,
  avatar,
  timestamp,
  meta,
  status,
  align = 'start',
  role,
  deliveryStatus,
  renderPart,
}: MessageBubbleProps): React.ReactElement {
  const t = useAssistantCopy();
  // User messages align to the end side, assistant/system to the start side.
  // The filled vs outlined variant gives an additional visual cue (never
  // alignment alone). Geometry lives in the skin, keyed on `data-align`.
  const alignEnd = align === 'end';
  const roleText = roleLabel(role, t);

  return (
    <Box
      className="ds-assistant-message-bubble"
      data-part="root"
      data-align={alignEnd ? 'end' : 'start'}
    >
      <Card
        className="ds-assistant-message-bubble-card"
        variant={alignEnd ? 'filled' : 'outlined'}
      >
        <Card.Body>
          <Stack spacing="sm">
            <Stack direction="horizontal" justify="space-between" align="center">
              <Stack direction="horizontal" spacing="sm" align="center">
                {avatar ? <Box>{avatar}</Box> : null}
                <Stack spacing="xs">
                  {/* title mirrors a string author: the skin truncates long
                      names with ellipsis (truncation never eats content
                      silently); a node author carries its own reveal. */}
                  <Text
                    data-part="author"
                    weight="bold"
                    title={typeof author === 'string' ? author : undefined}
                  >
                    {author}
                  </Text>
                  {roleText ? (
                    <Text size="sm" color="muted">
                      {roleText}
                    </Text>
                  ) : null}
                </Stack>
              </Stack>
              {deliveryStatus ? (
                <AssistantStatusBadge
                  label={deliveryStatus}
                  tone={deliveryStatusToTone(deliveryStatus)}
                />
              ) : null}
            </Stack>
            <Stack spacing="sm">
              {parts.map((part, index) => (
                <React.Fragment key={`${part.type}-${index}`}>
                  {renderPart ? renderPart(part, index) : renderDefaultPart(part, index)}
                </React.Fragment>
              ))}
            </Stack>
            {timestamp || status || meta ? (
              <Stack spacing="xs">
                {timestamp ? (
                  <Text data-part="timestamp" size="xs">
                    {timestamp}
                  </Text>
                ) : null}
                {status ? <Box>{status}</Box> : null}
                {meta ? <Box>{meta}</Box> : null}
              </Stack>
            ) : null}
          </Stack>
        </Card.Body>
      </Card>
    </Box>
  );
}
