'use client';

/**
 * @fileoverview Rustic (Vanilla CSS) engine for the CommentThread pattern.
 * Renders a recursive tree of comments using only inline CSSProperties backed
 * by --ds-* design tokens with hardcoded fallbacks. Zero dependency on Ant
 * Design or Tailwind. Defines reusable style objects (avatarStyle, btnStyle,
 * primaryBtnStyle, linkBtnStyle, textareaStyle) at module scope so they are
 * allocated once rather than on every render.
 *
 * @example
 * <RusticCommentThread
 *   comments={[{ id: '1', author: { name: 'Eve' }, content: 'Nice!', timestamp: new Date().toISOString() }]}
 *   currentUser={{ name: 'Eve' }}
 *   onEdit={(id, text) => editComment(id, text)}
 *   onDelete={(id) => deleteComment(id)}
 * />
 */

import React, { useState, useCallback, type CSSProperties } from 'react';
import type { CommentThreadProps, Comment } from '../../contracts';

/**
 * Convert an ISO timestamp string into a human-readable relative time label.
 * Uses progressively coarser units (minutes, hours, days) and falls back to
 * an absolute date for timestamps older than 7 days.
 */
function formatTimestamp(ts: string): string {
  const date = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

/**
 * Generate a circular avatar style for the given pixel size. Font size is
 * scaled to 40% of the container so the initial letter fits proportionally.
 */
const avatarStyle = (size: number): CSSProperties => ({
  width: size,
  height: size,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: size * 0.4,
  fontWeight: 600,
  overflow: 'hidden',
  flexShrink: 0,
});

/** Shared textarea style for comment input and reply fields. */
const textareaStyle: CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  fontSize: 'var(--ds-font-size-sm, 14px)',
  resize: 'vertical' as const,
  fontFamily: 'inherit',
};

/** Base button style -- neutral border, white background, used for Cancel actions. */
const btnStyle: CSSProperties = {
  padding: '4px 12px',
  fontSize: 'var(--ds-font-size-sm, 14px)',
  cursor: 'pointer',
  fontWeight: 500,
};

/** Primary action button style -- shares btnStyle's non-paint metrics; the
 * primary-color treatment (background/text/border) lives in the skin, keyed
 * by data-part. */
const primaryBtnStyle: CSSProperties = {
  ...btnStyle,
};

/** Ghost/link button style for inline actions (Reply, Edit, Delete). No border or background. */
const linkBtnStyle: CSSProperties = {
  padding: '2px 4px',
  fontSize: 'var(--ds-font-size-xs, 12px)',
  cursor: 'pointer',
  fontWeight: 500,
};

/** Props for the recursive CommentNode used internally by RusticCommentThread. */
interface CommentNodeProps {
  comment: Comment;
  depth: number;
  maxDepth: number;
  currentUser?: { name: string; avatar?: string };
  onReply?: (parentId: string, content: string) => void;
  onEdit?: (id: string, content: string) => void;
  onDelete?: (id: string) => void;
  onReaction?: (commentId: string, emoji: string) => void;
}

/**
 * Recursive comment node using inline styles. Each instance renders its own
 * content, reactions, action links, and optionally its children (replies),
 * indented by 24px per depth level via marginLeft.
 */
function CommentNode({ comment, depth, maxDepth, currentUser, onReply, onEdit, onDelete, onReaction }: CommentNodeProps) {
  const [replyVisible, setReplyVisible] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);

  // Only the comment author can edit or delete their own comments.
  // Identity is matched by name since the Comment type only exposes
  // author.name at this level (no user ID available).
  const isOwner = currentUser?.name === comment.author.name;

  // Submit the reply text to the parent handler and reset local state.
  // Whitespace-only text is rejected to prevent empty replies.
  const handleReply = useCallback(() => {
    if (replyText.trim() && onReply) {
      onReply(comment.id, replyText.trim());
      setReplyText('');
      setReplyVisible(false);
    }
  }, [replyText, onReply, comment.id]);

  // Submit the edited content and exit edit mode. The trim() guard
  // prevents saving a comment that contains only whitespace.
  const handleEdit = useCallback(() => {
    if (editText.trim() && onEdit) {
      onEdit(comment.id, editText.trim());
      setEditing(false);
    }
  }, [editText, onEdit, comment.id]);

  return (
    <div style={{ marginLeft: depth > 0 ? 24 : 0 }}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <div data-part="avatar" style={avatarStyle(32)}>
          {comment.author.avatar ? (
            <img src={comment.author.avatar} alt={comment.author.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            comment.author.name.charAt(0).toUpperCase()
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontWeight: 600, fontSize: 'var(--ds-font-size-sm, 14px)' }}>{comment.author.name}</span>
            <span data-part="timestamp" style={{ fontSize: 'var(--ds-font-size-xs, 12px)' }}>
              {formatTimestamp(comment.timestamp)}
            </span>
            {comment.edited && (
              <span data-part="edited-label" style={{ fontSize: 'var(--ds-font-size-xs, 12px)', fontStyle: 'italic', opacity: 0.6 }}>
                (edited)
              </span>
            )}
          </div>

          {editing ? (
            <div style={{ marginBottom: 8 }}>
              <textarea
                data-part="edit-textarea"
                style={{ ...textareaStyle, marginBottom: 8 }}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={2}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button data-part="save" style={primaryBtnStyle} onClick={handleEdit}>Save</button>
                <button data-part="cancel" style={btnStyle} onClick={() => { setEditing(false); setEditText(comment.content); }}>Cancel</button>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: 'var(--ds-font-size-sm, 14px)', marginBottom: 8, lineHeight: 1.6 }}>
              {comment.content}
            </div>
          )}

          {/* Reactions */}
          {comment.reactions && comment.reactions.length > 0 && (
            <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
              {comment.reactions.map(r => (
                <button
                  key={r.emoji}
                  data-part="reaction"
                  data-active={r.active}
                  style={{
                    ...btnStyle,
                    padding: '2px 8px',
                    fontSize: 'var(--ds-font-size-xs, 12px)',
                  }}
                  onClick={() => onReaction?.(comment.id, r.emoji)}
                >
                  {r.emoji} {r.count}
                </button>
              ))}
            </div>
          )}

          {/* Actions -- reply is depth-gated to prevent infinitely nested threads.
              Edit and delete are restricted to the comment owner. */}
          <div style={{ display: 'flex', gap: 8 }}>
            {depth < maxDepth && onReply && (
              <button data-part="reply" style={linkBtnStyle} onClick={() => setReplyVisible(!replyVisible)}>Reply</button>
            )}
            {isOwner && onEdit && (
              <button data-part="edit" style={linkBtnStyle} onClick={() => setEditing(true)}>Edit</button>
            )}
            {isOwner && onDelete && (
              <button data-part="delete" style={linkBtnStyle} onClick={() => onDelete(comment.id)}>Delete</button>
            )}
          </div>

          {/* Reply input */}
          {replyVisible && (
            <div style={{ marginTop: 8 }}>
              <textarea
                data-part="reply-textarea"
                style={{ ...textareaStyle, marginBottom: 8 }}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={2}
                placeholder="Write a reply..."
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  data-part="reply-submit"
                  style={{ ...primaryBtnStyle, opacity: replyText.trim() ? 1 : 0.5 }}
                  onClick={handleReply}
                  disabled={!replyText.trim()}
                >
                  Reply
                </button>
                <button data-part="reply-cancel" style={btnStyle} onClick={() => setReplyVisible(false)}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Nested replies -- rendered recursively with a left border line for
          visual threading. Stops at maxDepth to cap DOM nesting depth. */}
      {comment.replies && comment.replies.length > 0 && depth < maxDepth && (
        <div data-part="nested-line" style={{ paddingLeft: 12 }}>
          {comment.replies.map(reply => (
            <CommentNode
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              maxDepth={maxDepth}
              currentUser={currentUser}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              onReaction={onReaction}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Rustic (Vanilla CSS) comment thread with recursive nesting, reactions, and CRUD.
 * All styling uses inline CSSProperties backed by --ds-* design tokens with
 * hardcoded fallbacks, ensuring the component works without any CSS framework.
 * @param props - CommentThreadProps controlling the comment list, user identity,
 *   CRUD callbacks, nesting depth, and display options.
 * @returns A comment list with an optional top-level input for adding new comments.
 */
export default function RusticCommentThread(props: CommentThreadProps) {
  const {
    comments,
    onAdd,
    onEdit,
    onDelete,
    onReply,
    onReaction,
    currentUser,
    maxDepth = 3,
    placeholder = 'Write a comment...',
    emptyMessage = 'No comments yet',
    loading,
    className,
    style,
  } = props;

  const [newComment, setNewComment] = useState('');

  const handleAdd = useCallback(() => {
    if (newComment.trim() && onAdd) {
      onAdd(newComment.trim());
      setNewComment('');
    }
  }, [newComment, onAdd]);

  if (loading) {
    return (
      <div data-part="root" className={`ds-pattern-comment-thread ds-engine-rustic ${className ?? ''}`} style={{ textAlign: 'center', padding: 48, ...style }}>
        <span data-part="loading">Loading...</span>
      </div>
    );
  }

  return (
    <div data-part="root" className={`ds-pattern-comment-thread ds-engine-rustic ${className ?? ''}`} style={style}>
      {/* New comment input -- only rendered when both onAdd and currentUser
          are provided. Without a user identity we cannot attribute the comment. */}
      {onAdd && currentUser && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          <div data-part="avatar" style={avatarStyle(32)}>
            {currentUser.avatar ? (
              <img src={currentUser.avatar} alt={currentUser.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              currentUser.name.charAt(0).toUpperCase()
            )}
          </div>
          <div style={{ flex: 1 }}>
            <textarea
              data-part="composer"
              style={{ ...textareaStyle, marginBottom: 8 }}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              placeholder={placeholder}
            />
            <button
              data-part="submit"
              style={{ ...primaryBtnStyle, opacity: newComment.trim() ? 1 : 0.5 }}
              onClick={handleAdd}
              disabled={!newComment.trim()}
            >
              Comment
            </button>
          </div>
        </div>
      )}

      {/* Comments */}
      {comments.length === 0 ? (
        <div data-part="empty" style={{ textAlign: 'center', padding: 48 }}>
          {emptyMessage}
        </div>
      ) : (
        <div>
          {comments.map(comment => (
            <CommentNode
              key={comment.id}
              comment={comment}
              depth={0}
              maxDepth={maxDepth}
              currentUser={currentUser}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              onReaction={onReaction}
            />
          ))}
        </div>
      )}
    </div>
  );
}
