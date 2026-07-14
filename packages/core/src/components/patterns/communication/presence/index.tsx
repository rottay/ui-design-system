'use client';

/**
 * @fileoverview Presence awareness primitives -- visual components for
 * real-time collaboration awareness. Exports PresenceBar, TypingIndicator,
 * and LiveCursor.
 *
 * These components own the VISUAL contract only. Apps provide the WebSocket
 * data (user lists, typing state, cursor positions). All components are
 * engine-agnostic -- they use DS primitives with inline styles and CSS
 * variables, no engine switch needed.
 */

import React from 'react';

import { Box, Text } from '../../../primitives';

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

const SIZE_MAP = {
  sm: { avatar: 28, font: 10, ring: 2 },
  md: { avatar: 36, font: 12, ring: 2.5 },
} as const;

const DEFAULT_COLOR = 'var(--ds-color-primary)';

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
  if (users.length === 0) return null;

  const dims = SIZE_MAP[size];
  const visibleUsers = users.slice(0, maxVisible);
  const overflowCount = Math.max(0, users.length - maxVisible);
  const overlap = Math.round(dims.avatar * 0.3);

  return (
    <Box
      className="ds-presence-bar"
      data-part="root"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        position: 'relative',
      }}
    >
      {visibleUsers.map((user, index) => {
        const ringColor = user.color || DEFAULT_COLOR;

        return (
          <Box
            key={user.id}
            data-part="avatar"
            title={showNames ? user.name : undefined}
            style={{
              width: dims.avatar,
              height: dims.avatar,
              borderRadius: '50%',
              border: `${dims.ring}px solid ${ringColor}`,
              background: 'var(--ds-color-surface, #fff)',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: index > 0 ? -overlap : 0,
              position: 'relative',
              zIndex: users.length - index,
              cursor: 'default',
              flexShrink: 0,
              boxSizing: 'border-box',
              transition: 'transform 150ms ease',
            }}
          >
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '50%',
                  display: 'block',
                }}
              />
            ) : (
              <Text
                data-part="avatar-initials"
                style={{
                  fontSize: dims.font,
                  fontWeight: 600,
                  lineHeight: 1,
                  color: ringColor,
                  userSelect: 'none',
                }}
              >
                {getInitials(user.name)}
              </Text>
            )}
          </Box>
        );
      })}

      {overflowCount > 0 && (
        <Box
          data-part="overflow-badge"
          title={users
            .slice(maxVisible)
            .map((u) => u.name)
            .join(', ')}
          style={{
            width: dims.avatar,
            height: dims.avatar,
            borderRadius: '50%',
            border: `${dims.ring}px solid var(--ds-color-border, #d9d9d9)`,
            background: 'var(--ds-color-surface-secondary, var(--ds-color-bg-secondary, #f5f5f5))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: -overlap,
            position: 'relative',
            zIndex: 0,
            cursor: 'default',
            flexShrink: 0,
            boxSizing: 'border-box',
          }}
        >
          <Text
            data-part="overflow-badge-count"
            style={{
              fontSize: dims.font,
              fontWeight: 600,
              lineHeight: 1,
              color: 'var(--ds-color-text-secondary, var(--ds-color-text-muted))',
              userSelect: 'none',
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
}: PresenceTypingIndicatorProps): React.ReactElement | null {
  if (users.length === 0) return null;

  const label = buildTypingLabel(users, maxNames);

  return (
    <Box
      className="ds-presence-typing-indicator"
      data-part="root"
      role="status"
      aria-live="polite"
      style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
    >
      <style>{`@keyframes ds-presence-dot { 0%, 80%, 100% { opacity: .35; transform: translateY(0); } 40% { opacity: 1; transform: translateY(-3px); } }`}</style>
      <Box aria-hidden="true" style={{ display: 'inline-flex', gap: 3 }}>
        {[0, 1, 2].map((index) => (
          <Box
            key={index}
            data-part="typing-dot"
            style={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              background: 'var(--ds-color-text-secondary, var(--ds-color-text-muted))',
              animation: `ds-presence-dot 1.2s ease-in-out ${index * 0.15}s infinite`,
            }}
          />
        ))}
      </Box>
      <Text
        data-part="label"
        style={{
          fontSize: 13,
          color: 'var(--ds-color-text-secondary, var(--ds-color-text-muted))',
        }}
      >
        {label}
      </Text>
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
        position: 'absolute',
        left: position.x,
        top: position.y,
        pointerEvents: 'none',
        zIndex: 9999,
        opacity: visible ? 1 : 0,
        transition: 'left 120ms linear, top 120ms linear, opacity 200ms ease',
        willChange: 'left, top',
      }}
    >
      {/* Cursor arrow SVG */}
      <svg
        width="16"
        height="20"
        viewBox="0 0 16 20"
        fill="none"
        style={{ display: 'block' }}
      >
        <path
          d="M0.928 0.32L14.728 10.52C15.108 10.79 14.918 11.39 14.448 11.39H8.168L5.128 19.14C4.978 19.52 4.448 19.52 4.298 19.14L0.288 0.93C0.208 0.55 0.598 0.09 0.928 0.32Z"
          fill={cursorColor}
        />
        <path
          d="M0.928 0.32L14.728 10.52C15.108 10.79 14.918 11.39 14.448 11.39H8.168L5.128 19.14C4.978 19.52 4.448 19.52 4.298 19.14L0.288 0.93C0.208 0.55 0.598 0.09 0.928 0.32Z"
          stroke="var(--ds-color-surface, #fff)"
          strokeWidth="0.8"
        />
      </svg>

      {/* Name label badge */}
      <Box
        data-part="cursor-badge"
        style={{
          position: 'absolute',
          left: 12,
          top: 16,
          background: cursorColor,
          color: '#fff',
          fontSize: 11,
          fontWeight: 600,
          lineHeight: 1,
          padding: '3px 6px',
          borderRadius: 4,
          whiteSpace: 'nowrap',
          userSelect: 'none',
          boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
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

/** Extracts up to two uppercase initials from a full name. */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Builds a grammatically correct typing label from a list of users.
 * - 1 user: "Alice is typing..."
 * - 2 users (within maxNames): "Alice and Bob are typing..."
 * - 3+ users (beyond maxNames): "3 people are typing..."
 */
function buildTypingLabel(
  users: Array<{ name: string }>,
  maxNames: number,
): string {
  if (users.length === 1) {
    return `${users[0].name} is typing...`;
  }
  if (users.length <= maxNames) {
    const names = users.map((u) => u.name);
    const last = names.pop()!;
    return `${names.join(', ')} and ${last} are typing...`;
  }
  return `${users.length} people are typing...`;
}
