/**
 * @fileoverview Type definitions for the CommentThread pattern component.
 * Defines the recursive `Comment` data shape (with nested replies and emoji
 * reactions), the `CommentReaction` structure, and `CommentThreadProps`
 * controlling the full comment lifecycle: adding, editing, deleting, replying,
 * and reacting. Supports configurable nesting depth and authenticated user
 * context for permission checks.
 */

import type { ReactNode } from 'react';
import type { PatternBaseProps } from '../../types';

/**
 * Represents an emoji reaction on a comment, including the aggregate count
 * and whether the current user has toggled it.
 */
export interface CommentReaction {
  /** The emoji character or shortcode (e.g. "thumbsup", "heart"). */
  emoji: string;

  /** Total number of users who reacted with this emoji. */
  count: number;

  /**
   * Whether the current authenticated user has added this reaction.
   * Determines the visual "active" highlight on the reaction badge.
   * @default false
   */
  active?: boolean;
}

/**
 * Represents a single comment in the thread. Comments form a recursive tree
 * via the `replies` property, enabling nested discussions.
 */
export interface Comment {
  /** Unique identifier for this comment. Used for edit/delete/reply callbacks. */
  id: string;

  /** The comment author's display information. */
  author: {
    /** Author's display name. */
    name: string;
    /** URL or path to the author's avatar image. When omitted, a fallback initial is shown. */
    avatar?: string;
  };

  /**
   * The comment body text. Rendered as plain text by default; rich text
   * rendering can be achieved via a custom render slot at the component level.
   */
  content: string;

  /**
   * Display timestamp for the comment (e.g. "2 hours ago", "Mar 15, 2026").
   * Passed as a pre-formatted string -- the component does not perform
   * date formatting.
   */
  timestamp: string;

  /**
   * Nested reply comments. Replies are rendered indented below this comment,
   * up to the `maxDepth` limit. When omitted or empty, no reply subtree
   * is rendered.
   */
  replies?: Comment[];

  /**
   * Emoji reactions on this comment. Each reaction shows an emoji badge with
   * a count and optional active state.
   */
  reactions?: CommentReaction[];

  /**
   * Whether this comment has been edited after initial creation. When true,
   * an "(edited)" indicator is shown beside the timestamp.
   * @default false
   */
  edited?: boolean;
}

/**
 * Props for the CommentThread pattern component.
 *
 * CommentThread renders a threaded discussion with nested replies, emoji
 * reactions, and CRUD operations. It is fully controlled -- the parent owns
 * the comment data and handles all mutations via callbacks.
 *
 * @example
 * ```tsx
 * <PatternCommentThread
 *   comments={threadComments}
 *   currentUser={{ name: 'Daniel', avatar: '/avatars/daniel.png' }}
 *   onAdd={(content, parentId) => createComment(content, parentId)}
 *   onEdit={(id, content) => updateComment(id, content)}
 *   onDelete={(id) => deleteComment(id)}
 *   onReply={(parentId, content) => createComment(content, parentId)}
 *   onReaction={(commentId, emoji) => toggleReaction(commentId, emoji)}
 *   maxDepth={3}
 *   placeholder="Write a comment..."
 * />
 * ```
 */
export interface CommentThreadProps extends PatternBaseProps {
  /**
   * Array of top-level comments. Each comment may contain nested `replies`
   * forming a tree structure. Order in the array determines display order.
   */
  comments: Comment[];

  /**
   * Called when a new comment is added. For top-level comments, `parentId`
   * is undefined. For replies added via the inline reply box, `parentId`
   * contains the parent comment's ID.
   *
   * @param content  - The comment text.
   * @param parentId - The parent comment ID (undefined for top-level).
   */
  onAdd?: (content: string, parentId?: string) => void;

  /**
   * Called when an existing comment's content is edited.
   *
   * @param id      - The comment being edited.
   * @param content - The updated text.
   */
  onEdit?: (id: string, content: string) => void;

  /**
   * Called when a comment is deleted. The parent should handle cascade
   * behavior (e.g. soft-delete vs. remove replies).
   *
   * @param id - The comment to delete.
   */
  onDelete?: (id: string) => void;

  /**
   * Called when replying to a specific comment via the inline reply input.
   * Functionally similar to `onAdd` with a parentId, but provided as a
   * separate callback for cases where reply creation differs from top-level
   * comment creation (e.g. different API endpoint or notification logic).
   *
   * @param parentId - The comment being replied to.
   * @param content  - The reply text.
   */
  onReply?: (parentId: string, content: string) => void;

  /**
   * Called when the current user toggles an emoji reaction on a comment.
   * The parent should add or remove the reaction based on current state.
   *
   * @param commentId - The comment being reacted to.
   * @param emoji     - The emoji character or shortcode toggled.
   */
  onReaction?: (commentId: string, emoji: string) => void;

  /**
   * The currently authenticated user. Used to:
   * - Display the user's avatar in the comment input box.
   * - Determine which comments show edit/delete controls (only the author's
   *   own comments).
   *
   * When omitted, the comment input is hidden and the thread is read-only.
   */
  currentUser?: {
    /** Current user's display name. */
    name: string;
    /** URL or path to the current user's avatar image. */
    avatar?: string;
  };

  /**
   * Maximum nesting depth for reply threads. At this depth, the "Reply"
   * button is hidden and new replies are added at the deepest allowed level.
   * @default 3
   */
  maxDepth?: number;

  /**
   * Placeholder text for the comment text input.
   * @default "Write a comment..."
   */
  placeholder?: string;

  /**
   * Message displayed when `comments` is empty.
   * @default "No comments yet"
   */
  emptyMessage?: string;
}
