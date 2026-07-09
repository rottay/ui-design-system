/**
 * @fileoverview Type definitions for the Assistant UI pattern. Defines the
 * message part discriminated union (text, markdown, tool-status, artifact,
 * attachments), delivery/tool/agent status enums, and props for each
 * sub-component (StreamingText, TypingIndicator, ToolCallCard, MessageBubble,
 * AssistantStatusIndicator, PreviewDiffCard, ConfirmActionCard).
 */

import type { ReactNode } from 'react';

// ---------------------------------------------------------------------------
// Enums / union types
// ---------------------------------------------------------------------------

/**
 * Role of a message within an assistant conversation thread.
 * Determines visual styling and alignment of the message bubble.
 */
export type AssistantMessageRole = 'assistant' | 'user' | 'system' | 'tool';

/**
 * Lifecycle status of a message as it moves from draft to delivered.
 * Used to show spinners, retry buttons, or error indicators on the bubble.
 */
export type AssistantDeliveryStatus =
  | 'draft'
  | 'sending'
  | 'streaming'
  | 'sent'
  | 'error';

/**
 * Execution status of a tool/function call initiated by the assistant.
 */
export type AssistantToolStatus = 'queued' | 'running' | 'complete' | 'error';

/**
 * Live activity state of an assistant/agent surfaced as a tonal dot indicator.
 * `thinking`, `streaming`, and `acting` are live states whose dot animates;
 * `idle` and `error` are terminal/at-rest states whose dot holds static.
 */
export type AssistantAgentStatus =
  | 'idle'
  | 'thinking'
  | 'streaming'
  | 'acting'
  | 'error';

// ---------------------------------------------------------------------------
// Message part discriminated union
// ---------------------------------------------------------------------------

/**
 * A plain-text or markdown content part within a message.
 * When `streaming` is true, a blinking cursor is appended.
 */
export interface AssistantTextPart {
  /** Discriminator: `'text'` for plain text, `'markdown'` for rendered markdown. */
  type: 'text' | 'markdown';
  /** The raw text or markdown content string. */
  content: string;
  /** Whether the content is still being streamed (shows a typing cursor). */
  streaming?: boolean;
}

/**
 * A tool/function call status card embedded in a message.
 * Displayed as a collapsible card showing the tool name, status, and I/O.
 */
export interface AssistantToolStatusPart {
  /** Discriminator for tool-status parts. */
  type: 'tool-status';
  /** Name of the tool or function being invoked. */
  name: string;
  /** Current execution status of the tool call. */
  status: AssistantToolStatus;
  /** Brief summary of what the tool did (shown in the collapsed card header). */
  summary?: ReactNode;
  /** Rendered view of the input arguments sent to the tool. */
  input?: ReactNode;
  /** Rendered view of the tool's return value. */
  output?: ReactNode;
  /** Elapsed execution time shown in the terminal receipt line (complete/error). */
  duration?: ReactNode;
  /** Additional metadata (e.g. token usage) displayed in the card footer. */
  meta?: ReactNode;
}

/**
 * A rich artifact block embedded in a message (e.g. generated code, image, chart).
 */
export interface AssistantArtifactPart {
  /** Discriminator for artifact parts. */
  type: 'artifact';
  /** Optional heading rendered above the artifact content. */
  title?: ReactNode;
  /** The artifact body (code block, image, interactive widget, etc.). */
  content: ReactNode;
  /** Additional metadata rendered below the artifact. */
  meta?: ReactNode;
}

/**
 * A collection of file attachments embedded in a message.
 */
export interface AssistantAttachmentsPart {
  /** Discriminator for attachment parts. */
  type: 'attachments';
  /** Rendered attachment list (thumbnails, file cards, etc.). */
  content: ReactNode;
}

/**
 * Discriminated union of all possible content parts within an assistant message.
 * Each part has a `type` discriminator that determines the rendered component.
 */
export type AssistantMessagePart =
  | AssistantTextPart
  | AssistantToolStatusPart
  | AssistantArtifactPart
  | AssistantAttachmentsPart;

// ---------------------------------------------------------------------------
// Sub-component props
// ---------------------------------------------------------------------------

/**
 * Props for the AssistantStatusBadge component. Renders a colored badge
 * indicating a status or category within the assistant UI.
 */
export interface AssistantStatusBadgeProps {
  /** Badge text or icon content. */
  label: ReactNode;
  /** Color tone applied to the badge background and text. */
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info';
}

/**
 * Props for the StreamingText component. Renders text with an optional
 * animated cursor to indicate content is still being generated.
 *
 * @example
 * ```tsx
 * <StreamingText text={partialResponse} streaming={!isDone} as="markdown" />
 * ```
 */
export interface StreamingTextProps {
  /** The current text content to display. */
  text: string;
  /** When true, appends an animated cursor to indicate ongoing generation. */
  streaming?: boolean;
  /** Rendering mode: plain text or parsed markdown. */
  as?: 'text' | 'markdown';
  /**
   * Forces the reduced-motion posture (static caret, no shimmer) regardless of
   * the OS `prefers-reduced-motion` setting. When omitted, the OS preference
   * governs the affordance.
   */
  reducedMotion?: boolean;
}

/**
 * Props for the TypingIndicator component. Shows an animated "..." indicator
 * while the assistant is composing a response.
 */
export interface TypingIndicatorProps {
  /** Optional label rendered alongside the animation (e.g. "Thinking..."). */
  label?: ReactNode;
}

/**
 * Props for the ToolCallCard component. Renders a collapsible card showing
 * the status and I/O of a single tool/function invocation.
 */
export interface ToolCallCardProps {
  /** Tool or function name displayed in the card header. */
  name: ReactNode;
  /** Current execution status controlling the card's visual indicator. */
  status: AssistantToolStatus;
  /** Brief summary shown in the collapsed card header. */
  summary?: ReactNode;
  /** Rendered view of the input arguments. */
  input?: ReactNode;
  /** Rendered view of the output/result. */
  output?: ReactNode;
  /**
   * Elapsed execution time shown in the terminal receipt line once the call
   * reaches `complete` or `error`. Ignored while the call is queued or running.
   */
  duration?: ReactNode;
  /** Footer metadata (duration, token count, etc.). */
  meta?: ReactNode;
}

/**
 * Props for the AssistantStatusIndicator component. Renders a tonal dot plus an
 * optional label describing the current agent activity state.
 */
export interface AssistantStatusIndicatorProps {
  /** Current agent activity state controlling the dot tone and animation. */
  status: AssistantAgentStatus;
  /** Optional label rendered beside the dot; defaults to the status name. */
  label?: ReactNode;
  /**
   * Forces the static (non-animated) dot regardless of the OS
   * `prefers-reduced-motion` setting. When omitted, the OS preference governs.
   */
  reducedMotion?: boolean;
}

/**
 * Semantic change classification for a single preview-diff row. Drives the
 * emphasis color applied to the before/after values.
 */
export type PreviewDiffChange = 'added' | 'removed' | 'updated' | 'unchanged';

/**
 * A single before/after field row within a PreviewDiffCard. Labels and values
 * are opaque nodes; the component attaches no entity meaning to them.
 */
export interface PreviewDiffRow {
  /** Field label shown at the start of the row. */
  label: ReactNode;
  /** Prior value; omitted for a purely added field. */
  before?: ReactNode;
  /** Proposed value; omitted for a purely removed field. */
  after?: ReactNode;
  /** Change classification controlling value emphasis; defaults to `updated`. */
  change?: PreviewDiffChange;
}

/**
 * Props for the PreviewDiffCard compound. Renders a before/after field table
 * for a proposed mutation, with added/removed emphasis on semantic tokens.
 * Domain-agnostic: field labels and values arrive entirely as props.
 */
export interface PreviewDiffCardProps {
  /** Optional heading rendered above the diff rows. */
  title?: ReactNode;
  /** Ordered before/after rows to render. */
  rows: PreviewDiffRow[];
  /** Column heading for the prior values; defaults to `Before`. */
  beforeLabel?: ReactNode;
  /** Column heading for the proposed values; defaults to `After`. */
  afterLabel?: ReactNode;
  /** Additional metadata rendered below the diff rows. */
  meta?: ReactNode;
}

/**
 * Props for the ConfirmActionCard compound. Presents a proposed-action summary
 * with confirm/cancel controls wired to caller callbacks. Domain-agnostic: the
 * summary, details, labels, and callbacks are supplied by the consumer.
 */
export interface ConfirmActionCardProps {
  /** Optional heading naming the proposed action. */
  title?: ReactNode;
  /** Short summary of what confirming will do. */
  summary?: ReactNode;
  /** Optional expanded detail slot (e.g. an embedded PreviewDiffCard). */
  details?: ReactNode;
  /** Confirm control label; defaults to `Confirm`. */
  confirmLabel?: ReactNode;
  /** Cancel control label; defaults to `Cancel`. */
  cancelLabel?: ReactNode;
  /** Invoked when the confirm control is activated. */
  onConfirm?: () => void;
  /** Invoked when the cancel control is activated. */
  onCancel?: () => void;
  /** Disables the confirm control (e.g. while validation is pending). */
  confirmDisabled?: boolean;
  /** Marks the confirm control busy and disables both controls. */
  busy?: boolean;
  /** When `danger`, the confirm control renders in a destructive tone. */
  tone?: 'default' | 'danger';
  /** Replaces the default confirm/cancel controls with fully custom nodes. */
  actions?: ReactNode;
}

/**
 * Props for the MessageBubble component. Renders a single message within
 * an assistant conversation thread, composed of one or more content parts.
 *
 * @example
 * ```tsx
 * <MessageBubble
 *   author="Assistant"
 *   role="assistant"
 *   align="start"
 *   parts={[{ type: 'markdown', content: '**Hello!**' }]}
 *   avatar={<Avatar src="/bot.png" />}
 *   timestamp="2 min ago"
 * />
 * ```
 */
export interface MessageBubbleProps {
  /** Display name of the message author. */
  author: ReactNode;
  /** Ordered array of content parts composing the message body. */
  parts: AssistantMessagePart[];
  /** Avatar element rendered beside the message bubble. */
  avatar?: ReactNode;
  /** Timestamp label displayed below or beside the bubble. */
  timestamp?: ReactNode;
  /** Additional metadata rendered in the bubble footer. */
  meta?: ReactNode;
  /** Status indicator element (e.g. read receipt, delivery icon). */
  status?: ReactNode;
  /** Horizontal alignment of the bubble within the conversation thread. */
  align?: 'start' | 'end';
  /** Message role, controlling visual styling (colors, alignment defaults). */
  role?: AssistantMessageRole;
  /** Current delivery lifecycle status of this message. */
  deliveryStatus?: AssistantDeliveryStatus;
  /** Custom renderer for individual parts, overriding the default part components. */
  renderPart?: (part: AssistantMessagePart, index: number) => ReactNode;
}
