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
import { ShimmerText, useReducedMotion } from '../../../../motion';
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
} from './types';

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
} from './types';

// Keyframes are owned inline by the streaming and typing paths so their
// animations run whether or not a sibling indicator is mounted. Identical
// duplicate definitions are idempotent at the CSS cascade level.
const ASSISTANT_CARET_KEYFRAMES =
  '@keyframes ds-assistant-caret { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }';
const ASSISTANT_DOT_KEYFRAMES =
  '@keyframes ds-assistant-dot { 0%, 80%, 100% { opacity: .35; transform: translateY(0); } 40% { opacity: 1; transform: translateY(-2px); } }';

// -- Internal mapping helpers --

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

/** Returns a human-readable label for the message role, or null for unknown roles. */
function roleLabel(role: AssistantMessageRole | undefined): string | null {
  switch (role) {
    case 'assistant':
      return 'Assistant';
    case 'user':
      return 'User';
    case 'system':
      return 'System';
    case 'tool':
      return 'Tool';
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

/** Resolves a badge tone to its semantic color CSS variable. */
function toneToColorVar(tone: AssistantStatusBadgeProps['tone']): string {
  switch (tone) {
    case 'success':
      return 'var(--ds-color-success)';
    case 'warning':
      return 'var(--ds-color-warning)';
    case 'danger':
      return 'var(--ds-color-error)';
    case 'info':
      return 'var(--ds-color-info)';
    default:
      return 'var(--ds-color-text-muted)';
  }
}

/**
 * Resolves an agent activity status to its dot color, liveness, and default
 * label. Live states (thinking/streaming/acting) animate; idle/error hold
 * static. Colors resolve through semantic `--ds-color-*` tokens.
 */
function agentStatusVisual(status: AssistantAgentStatus): {
  color: string;
  live: boolean;
  defaultLabel: string;
} {
  switch (status) {
    case 'thinking':
      return { color: 'var(--ds-color-info)', live: true, defaultLabel: 'Thinking' };
    case 'streaming':
      return { color: 'var(--ds-color-primary-500)', live: true, defaultLabel: 'Streaming' };
    case 'acting':
      return { color: 'var(--ds-color-warning)', live: true, defaultLabel: 'Acting' };
    case 'error':
      return { color: 'var(--ds-color-error)', live: false, defaultLabel: 'Error' };
    default:
      return { color: 'var(--ds-color-text-muted)', live: false, defaultLabel: 'Idle' };
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
  const fontFamily =
    as === 'markdown' ? 'var(--ds-font-family-mono, inherit)' : undefined;

  return (
    <Box className="ds-assistant-streaming-text" data-part="root">
      {streaming && !reduceMotion ? (
        <ShimmerText text={text} style={{ whiteSpace: 'pre-wrap', fontFamily }} />
      ) : (
        <Text style={{ whiteSpace: 'pre-wrap', fontFamily }}>{text}</Text>
      )}
      {streaming ? (
        <>
          {/* Caret keyframes are owned here so the caret animates without a
              co-mounted TypingIndicator. Under reduced motion the caret holds
              a static position instead of blinking. */}
          <style>{ASSISTANT_CARET_KEYFRAMES}</style>
          <Text
            data-part="caret"
            aria-hidden="true"
            style={{
              marginLeft: 4,
              display: 'inline-block',
              color: 'var(--ds-color-primary-500)',
              animation: reduceMotion
                ? 'none'
                : 'ds-assistant-caret 1s steps(2, jump-none) infinite',
            }}
          >
            |
          </Text>
        </>
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
  label = 'Assistant is typing',
}: TypingIndicatorProps): React.ReactElement {
  return (
    <Box
      className="ds-assistant-typing-indicator"
      data-part="root"
      role="status"
      aria-live="polite"
      style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
    >
      <style>{ASSISTANT_DOT_KEYFRAMES}</style>
      <Box aria-hidden="true" style={{ display: 'inline-flex', gap: 4 }}>
        {[0, 1, 2].map((index) => (
          <Box
            key={index}
            data-part="typing-dot"
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'var(--ds-color-primary-500)',
              animation: `ds-assistant-dot 1.1s ease-in-out ${index * 0.12}s infinite`,
            }}
          />
        ))}
      </Box>
      <Text color="muted">{label}</Text>
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
  const tone = toolStatusToTone(status);
  // Completed and errored calls read as a compact receipt (outcome + elapsed
  // time), not the live input/output expansion.
  const terminal = status === 'complete' || status === 'error';

  return (
    <Card className="ds-assistant-tool-call-card" data-part="root" variant="outlined">
      <Card.Body>
        <Stack spacing="sm">
          <Stack direction="horizontal" justify="space-between" align="center">
            <Text style={{ fontWeight: 700 }}>{name}</Text>
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
                  <Text data-part="tool-card" data-tone={tone} size="sm" style={{ color: toneToColorVar(tone) }}>
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
                    Input
                  </Text>
                  <Box>{input}</Box>
                </Box>
              ) : null}
              {output ? (
                <Box>
                  <Text size="sm" color="muted">
                    Output
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
  const prefersReducedMotion = useReducedMotion();
  const reduceMotion = reducedMotion ?? prefersReducedMotion;
  const visual = agentStatusVisual(status);
  // Animation runs only while the state is live and motion is allowed.
  const animate = visual.live && !reduceMotion;

  return (
    <Box
      className="ds-assistant-status-indicator"
      data-part="root"
      role="status"
      aria-live="polite"
      style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
    >
      {animate ? <style>{ASSISTANT_DOT_KEYFRAMES}</style> : null}
      <Box
        data-part="dot"
        data-status={status}
        aria-hidden="true"
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: visual.color,
          animation: animate ? 'ds-assistant-dot 1.1s ease-in-out infinite' : 'none',
        }}
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
  beforeLabel = 'Before',
  afterLabel = 'After',
  meta,
}: PreviewDiffCardProps): React.ReactElement {
  return (
    <Card className="ds-assistant-preview-diff-card" data-part="root" variant="outlined">
      <Card.Body>
        <Stack spacing="sm">
          {title ? <Text style={{ fontWeight: 700 }}>{title}</Text> : null}
          <Stack direction="horizontal" spacing="sm" align="center">
            <Box style={{ flex: 2, minWidth: 0 }} />
            <Text size="xs" color="muted" style={{ flex: 3, minWidth: 0 }}>
              {beforeLabel}
            </Text>
            <Box aria-hidden="true" style={{ width: 16 }} />
            <Text size="xs" color="muted" style={{ flex: 3, minWidth: 0 }}>
              {afterLabel}
            </Text>
          </Stack>
          {rows.map((row, index) => {
            const change = row.change ?? 'updated';
            const beforeColor =
              change === 'removed'
                ? 'var(--ds-color-error)'
                : 'var(--ds-color-text-muted)';
            const afterColor =
              change === 'added' || change === 'updated'
                ? 'var(--ds-color-success)'
                : change === 'removed'
                  ? 'var(--ds-color-text-muted)'
                  : undefined;
            return (
              <Stack
                key={`diff-row-${index}`}
                data-part="divider"
                direction="horizontal"
                spacing="sm"
                align="center"
                style={{ borderTop: '1px solid var(--ds-color-border)', paddingTop: 6 }}
              >
                <Text size="sm" style={{ flex: 2, minWidth: 0, fontWeight: 600 }}>
                  {row.label}
                </Text>
                <Box style={{ flex: 3, minWidth: 0 }}>
                  {row.before !== undefined ? (
                    <Text
                      data-part="preview-cell"
                      data-diff-side="before"
                      data-change={change}
                      size="sm"
                      style={{
                        color: beforeColor,
                        textDecoration:
                          change === 'removed' || change === 'updated'
                            ? 'line-through'
                            : undefined,
                      }}
                    >
                      {row.before}
                    </Text>
                  ) : null}
                </Box>
                <Text
                  aria-hidden="true"
                  size="sm"
                  color="muted"
                  style={{ width: 16, textAlign: 'center' }}
                >
                  {'→'}
                </Text>
                <Box style={{ flex: 3, minWidth: 0 }}>
                  {row.after !== undefined ? (
                    <Text
                      data-part="preview-cell"
                      data-diff-side="after"
                      data-change={change}
                      size="sm"
                      style={{
                        color: afterColor,
                        fontWeight: change === 'unchanged' ? undefined : 600,
                      }}
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
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  confirmDisabled = false,
  busy = false,
  tone = 'default',
  actions,
}: ConfirmActionCardProps): React.ReactElement {
  return (
    <Card className="ds-assistant-confirm-action-card" data-part="root" variant="outlined">
      <Card.Body>
        <Stack spacing="sm">
          {title ? <Text style={{ fontWeight: 700 }}>{title}</Text> : null}
          {summary ? <Box>{summary}</Box> : null}
          {details ? <Box>{details}</Box> : null}
          {actions ?? (
            <Stack direction="horizontal" justify="end" align="center" spacing="sm">
              <Button variant="secondary" onClick={onCancel} disabled={busy}>
                {cancelLabel}
              </Button>
              <Button
                variant={tone === 'danger' ? 'danger' : 'primary'}
                onClick={onConfirm}
                loading={busy}
                disabled={confirmDisabled || busy}
              >
                {confirmLabel}
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
      return (
        <StreamingText
          key={`part-${index}`}
          text={part.content}
          streaming={part.streaming}
          as="markdown"
        />
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
              {part.title ? <Text style={{ fontWeight: 700 }}>{part.title}</Text> : null}
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
  // User messages align right, assistant/system messages align left.
  // The filled vs outlined variant gives an additional visual cue.
  const alignEnd = align === 'end';
  const roleText = roleLabel(role);

  return (
    <Box
      className="ds-assistant-message-bubble"
      data-part="root"
      style={{
        display: 'flex',
        justifyContent: alignEnd ? 'flex-end' : 'flex-start',
      }}
    >
      <Card
        variant={alignEnd ? 'filled' : 'outlined'}
        style={{ maxWidth: '80%', width: 'fit-content' }}
      >
        <Card.Body>
          <Stack spacing="sm">
            <Stack direction="horizontal" justify="space-between" align="center">
              <Stack direction="horizontal" spacing="sm" align="center">
                {avatar ? <Box>{avatar}</Box> : null}
                <Stack spacing="xs">
                  <Text style={{ fontWeight: 700 }}>{author}</Text>
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
                  <Text data-part="timestamp" style={{ color: 'var(--ds-color-text-muted)', fontSize: 12 }}>
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
