'use client';

/**
 * @fileoverview Presence awareness primitives -- visual components for
 * real-time collaboration awareness. Exports PresenceBar, TypingIndicator,
 * and LiveCursor.
 *
 * These components own the VISUAL contract only. Apps provide the WebSocket
 * data (user lists, typing state, cursor positions). All components are
 * engine-agnostic -- they use DS primitives with runtime style props and CSS
 * variables, no engine switch needed.
 *
 * Inline `style` carries ONLY genuine runtime data (per-user ring color,
 * size-variant pixel geometry, the overlap offset, the cursor coordinates);
 * every static geometry/paint/motion decision lives in
 * `presentation/components/skin/presence/index.css`. Motion rides the
 * `--ds-motion-*` canon, and the typing-dot loop period rides the
 * private `--_ds-presence-dot-duration` channel.
 * Typing copy is ONE parametric catalog message per arity (never
 * concatenated fragments) and the name list joins through Intl.ListFormat
 * in the active locale.
 */

import React from 'react';

import { Avatar } from '../../../primitives/display/avatar';
import type { AvatarSize } from '../../../primitives/display/avatar/contracts';
import { Box } from '../../../primitives/layout/box';
import { Text } from '../../../primitives/display/typography/compound/text';
import { formatList, useOptionalTranslation } from '@/infrastructure/runtime/i18n';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * A user present on the current page/entity. Apps supply this from their
 * WebSocket presence channel.
 */
export interface PresenceUser {
  /** Unique identifier for the user. */
  id: string;
  /** Display name shown on hover tooltip. */
  name: string;
  /** URL to the user's avatar image. */
  avatar?: string;
  /** Accent color for the user's ring/cursor indicator. */
  color?: string;
}

/**
 * Props for the PresenceBar component. Shows who else is viewing the
 * current page or entity as an overlapping avatar stack.
 */
export interface PresenceBarProps {
  /** List of users currently present. */
  users: PresenceUser[];
  /** Maximum number of avatars to show before displaying a "+N" badge. @default 5 */
  maxVisible?: number;
  /** Avatar size variant. @default 'md' */
  size?: 'sm' | 'md';
  /** Whether to show the user's name in a tooltip on hover. @default true */
  showNames?: boolean;
}

/**
 * Props for the PresenceTypingIndicator component. Shows animated dots
 * with a label describing who is currently typing.
 */
export interface PresenceTypingIndicatorProps {
  /** Users who are currently typing. */
  users: Array<{ name: string }>;
  /** Maximum number of names to show before summarizing as "N people". @default 2 */
  maxNames?: number;
}

/**
 * Props for the LiveCursor component. Renders a colored cursor arrow
 * with a name label, positioned absolutely at the given coordinates.
 * Apps position this within a relative container.
 */
export interface LiveCursorProps {
  /** The user this cursor belongs to. */
  user: { name: string; color?: string };
  /** Absolute position within the containing element. */
  position: { x: number; y: number };
  /** Whether the cursor is visible. @default true */
  visible?: boolean;
}

// ---------------------------------------------------------------------------
// Shared constants
// ---------------------------------------------------------------------------

// The face geometry is the Avatar primitive's governed size scale, not a
// pattern-local pixel table: `token` selects the primitive size and the ring
// is the only px the stack still owns.
const SIZE_MAP = {
  sm: { token: 'sm' as AvatarSize, font: 10, ring: 2 },
  md: { token: 'md' as AvatarSize, font: 12, ring: 2 },
} as const;

const DEFAULT_COLOR = 'var(--ds-color-primary)';

/** Outer slot edge = the primitive's face plus the pattern-owned ring. */
function slotSize(token: AvatarSize, ring: number): string {
  return `calc(var(--ds-avatar-${token}-size) + ${ring * 2}px)`;
}

/** Stack overlap, kept at the historical 0.3 of the face. */
function slotOverlap(token: AvatarSize): string {
  return `calc(var(--ds-avatar-${token}-size) * -0.3)`;
}

// ---------------------------------------------------------------------------
// PresenceBar
// ---------------------------------------------------------------------------

/**
 * Renders a horizontal stack of overlapping user avatars with colored ring
 * indicators. When more users are present than `maxVisible`, a "+N" overflow
 * badge is appended.
 *
 * Each avatar shows a tooltip with the user's name on hover (when
 * `showNames` is true). The overlap direction is left-to-right with each
 * subsequent avatar slightly overlapping the previous one.
 *
 * @param props - {@link PresenceBarProps}
 * @returns A horizontal avatar stack with optional overflow badge.
 *
 * @example
 * ```tsx
 * <PresenceBar
 *   users={[
 *     { id: '1', name: 'Alice', avatar: '/alice.jpg', color: '#e74c3c' },
 *     { id: '2', name: 'Bob', color: '#3498db' },
 *   ]}
 *   maxVisible={5}
 *   size="md"
 * />
 * ```
 */
export function PresenceBar({
  users,
  maxVisible = 5,
  size = 'md',
  showNames = true,
}: PresenceBarProps): React.ReactElement | null {
  // Optional channel with an English floor: renders standalone (no provider)
  // without crashing and never echoes a raw key.
  const i18n = useOptionalTranslation('components');
  if (users.length === 0) return null;

  const dims = SIZE_MAP[size];
  const visibleUsers = users.slice(0, maxVisible);
  const overflowCount = Math.max(0, users.length - maxVisible);
  const slotEdge = slotSize(dims.token, dims.ring);
  const overlap = slotOverlap(dims.token);

  // The stack reads as a LIST to assistive tech: who is present is
  // information, not decoration -- each avatar is a named listitem (the
  // image alt or the visible initials name it) and the root carries the
  // group's accessible name.
  return (
    <Box
      className="ds-presence-bar"
      data-part="root"
      role="list"
      aria-label={i18n?.tOr('presence.barLabel', 'People present') ?? 'People present'}
    >
      {visibleUsers.map((user, index) => {
        const ringColor = user.color || DEFAULT_COLOR;

        return (
          <Box
            key={user.id}
            data-part="avatar"
            role="listitem"
            // The name is IDENTITY, not a hover affordance: `showNames`
            // governs the visual tooltip only, so the roster stays fully
            // named for AT (initials alone never identify a person).
            aria-label={user.name}
            title={showNames ? user.name : undefined}
            style={{
              // Runtime-only inline: the slot edge derived from the primitive's
              // size token, the caller-supplied ring color, the overlap offset
              // and the stacking order. Static geometry, the hover lift and its
              // transition are skin-owned.
              inlineSize: slotEdge,
              blockSize: slotEdge,
              border: `${dims.ring}px solid ${ringColor}`,
              marginInlineStart: index > 0 ? overlap : 0,
              zIndex: users.length - index,
            }}
          >
            {/* The face is the Avatar primitive: it owns the image element, the
                derived initials, the empty-fallback glyph, the load/error
                lifecycle and initials typography. */}
            <Avatar size={dims.token} src={user.avatar} name={user.name} />
          </Box>
        );
      })}

      {overflowCount > 0 && (
        <Box
          data-part="overflow-badge"
          role="listitem"
          /* The overflow is named for AT as ONE parametric catalog message
             ({count}); the hover tooltip lists the hidden names joined
             through Intl.ListFormat in the active locale (never a raw
             comma-join). */
          aria-label={
            i18n?.tOr('presence.overflowLabel', '{count} more people', { count: overflowCount })
            ?? `${overflowCount} more people`
          }
          title={formatList(
            users.slice(maxVisible).map((u) => u.name),
            i18n?.locale ?? 'en',
          )}
          style={{
            // Runtime-only inline: the slot edge shared with the faces, the
            // ring-width hatch (tracks `size`, consumed by the skin's static
            // border) and the overlap offset. Statics live in the skin.
            inlineSize: slotEdge,
            blockSize: slotEdge,
            '--ds-presence-badge-ring': `${dims.ring}px`,
            marginInlineStart: overlap,
          } as React.CSSProperties}
        >
          <Text
            data-part="overflow-badge-count"
            weight="semibold"
            style={{
              fontSize: dims.font,
            }}
          >
            +{overflowCount}
          </Text>
        </Box>
      )}
    </Box>
  );
}

// ---------------------------------------------------------------------------
// PresenceTypingIndicator
// ---------------------------------------------------------------------------

/**
 * Animated typing indicator showing who is currently typing.
 *
 * Displays a grammatically correct label:
 * - 1 user: "{name} is typing..."
 * - 2 users: "{name1} and {name2} are typing..."
 * - 3+ users: "{N} people are typing..."
 *
 * The three bouncing dots are purely decorative (`aria-hidden`). The text
 * label is wrapped in `role="status"` with `aria-live="polite"` for
 * screen reader announcements.
 *
 * @param props - {@link PresenceTypingIndicatorProps}
 * @returns An inline indicator with bouncing dots and a descriptive label.
 *
 * @example
 * ```tsx
 * <PresenceTypingIndicator
 *   users={[{ name: 'Alice' }, { name: 'Bob' }]}
 *   maxNames={2}
 * />
 * // Renders: "Alice and Bob are typing..." with animated dots
 * ```
 */
export function PresenceTypingIndicator({
  users,
  maxNames = 2,
}: PresenceTypingIndicatorProps): React.ReactElement {
  // Optional channel with an English floor: renders standalone (no provider)
  // without crashing and never echoes a raw key.
  const i18n = useOptionalTranslation('components');
  const isTyping = users.length > 0;

  // The live region OUTLIVES the idle gaps: a role=status inserted in the same
  // tick as its first content is not announced, so unmounting at 0 users lost it.
  return (
    <Box
      className="ds-presence-typing-indicator"
      data-part="root"
      role="status"
      aria-live="polite"
    >
      {isTyping && (
        <>
          {/* Geometry + motion are skin-owned: the dots bounce on the
              private `--_ds-presence-dot-duration` channel with an
              nth-child stagger and hold static under `prefers-reduced-motion`
              (the role=status label keeps the state comprehensible). */}
          <Box data-part="dots" aria-hidden="true">
            {[0, 1, 2].map((index) => (
              <Box key={index} data-part="typing-dot" />
            ))}
          </Box>
          <Text data-part="label">
            {buildTypingLabel(users, maxNames, (key, floor, params) =>
              i18n?.tOr(key, floor, params) ?? floor, i18n?.locale)}
          </Text>
        </>
      )}
    </Box>
  );
}

// ---------------------------------------------------------------------------
// LiveCursor
// ---------------------------------------------------------------------------

/**
 * A colored cursor arrow with a name label, positioned absolutely at the
 * given (x, y) coordinates. Apps place this inside a `position: relative`
 * container and update the position from their WebSocket presence channel.
 *
 * Uses CSS `transition` for smooth interpolated movement between position
 * updates. The cursor fades in/out via opacity when `visible` changes.
 *
 * @param props - {@link LiveCursorProps}
 * @returns An absolutely positioned cursor SVG with a name badge.
 *
 * @example
 * ```tsx
 * <div style={{ position: 'relative', width: '100%', height: 400 }}>
 *   <LiveCursor
 *     user={{ name: 'Alice', color: '#e74c3c' }}
 *     position={{ x: 120, y: 80 }}
 *     visible={true}
 *   />
 * </div>
 * ```
 */
export function LiveCursor({
  user,
  position,
  visible = true,
}: LiveCursorProps): React.ReactElement {
  const cursorColor = user.color || DEFAULT_COLOR;

  return (
    <Box
      className="ds-presence-live-cursor"
      data-part="root"
      aria-hidden="true"
      style={{
        // Runtime-only hatches: pointer coordinates are data, while the skin
        // owns the compositor transform. Physical translate is CORRECT here:
        // pointer coordinates live in physical space, not writing direction.
        '--ds-presence-cursor-x': `${position.x}px`,
        '--ds-presence-cursor-y': `${position.y}px`,
        opacity: visible ? 1 : 0,
      } as React.CSSProperties}
    >
      {/* Cursor arrow glyph. ICON GAP (registered, owner: graphics): the
          generated semantic catalog ships 282 roles and none of them is a
          collaboration cursor/pointer -- until a governed role lands, the
          glyph stays pattern-owned, decorative (the root is aria-hidden) and
          tinted by the caller's per-user color. Do NOT mirror it under RTL:
          a pointer glyph lives in physical space, like the coordinates. */}
      <svg
        width="16"
        height="20"
        viewBox="0 0 16 20"
        fill="none"
      >
        <path
          data-part="cursor-fill"
          d="M0.928 0.32L14.728 10.52C15.108 10.79 14.918 11.39 14.448 11.39H8.168L5.128 19.14C4.978 19.52 4.448 19.52 4.298 19.14L0.288 0.93C0.208 0.55 0.598 0.09 0.928 0.32Z"
          fill={cursorColor}
        />
        <path
          data-part="cursor-outline"
          d="M0.928 0.32L14.728 10.52C15.108 10.79 14.918 11.39 14.448 11.39H8.168L5.128 19.14C4.978 19.52 4.448 19.52 4.298 19.14L0.288 0.93C0.208 0.55 0.598 0.09 0.928 0.32Z"
          strokeWidth="0.8"
        />
      </svg>

      {/* Name label badge (background is the caller's per-user color --
          runtime data; the ink, shape, shadow and offsets are skin-owned) */}
      <Box
        data-part="cursor-badge"
        style={{
          background: cursorColor,
        }}
      >
        {user.name}
      </Box>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Builds a grammatically correct typing label from a list of users.
 * - 1 user: "Alice is typing..."
 * - within maxNames: "Alice and Bob are typing..."
 * - beyond maxNames: "3 people are typing..."
 *
 * Each arity is ONE parametric catalog message (`{name}` / `{names}` /
 * `{count}`) with an English floor -- translated fragments are never
 * concatenated. Multi-name lists join through Intl.ListFormat in the active
 * locale, so the conjunction itself localizes ("A, B y C" / Arabic "و").
 */
function buildTypingLabel(
  users: Array<{ name: string }>,
  maxNames: number,
  t: (key: string, floor: string, params: Record<string, string | number>) => string,
  locale?: string,
): string {
  if (users.length === 1) {
    return t('presence.typing.one', '{name} is typing...', { name: users[0].name });
  }
  if (users.length <= maxNames) {
    const names = users.map((u) => u.name);
    const joined = formatList(names, locale ?? 'en');
    return t('presence.typing.some', '{names} are typing...', { names: joined });
  }
  return t('presence.typing.many', '{count} people are typing...', { count: users.length });
}
