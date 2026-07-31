'use client';

/**
 * @fileoverview Modern engine for the CommentThread pattern (Lote 2 rebuild).
 * The pattern COMPOSES public primitives -- it never recreates controls:
 * Avatar (author/currentUser), Textarea (composer / reply / edit), Button
 * (submit / save / cancel / reply / edit / delete / reaction pills), Spinner
 * (loading) and the EmptyState pattern (canonical empty kit). Each primitive
 * is the single paint owner of its own chrome; this file owns semantics,
 * recursion and the layout anatomy (`data-part` wrappers) only. All layout
 * geometry lives in the `comment-thread.css` modern skin.
 *
 * @example
 * <ModernCommentThread
 *   comments={[{ id: '1', author: { name: 'Bob' }, content: 'Great work!', timestamp: new Date().toISOString() }]}
 *   currentUser={{ name: 'Bob', avatar: '/avatars/bob.png' }}
 *   onReply={(parentId, text) => reply(parentId, text)}
 *   onReaction={(id, emoji) => toggleReaction(id, emoji)}
 * />
 */

import React, { useState, useCallback } from 'react';
import type { CommentThreadProps, Comment } from '../../contracts';
import ModernAvatar from '../../../../../primitives/display/Avatar/engines/modern';
import ModernButton from '../../../../../primitives/inputs/Button/engines/modern';
import ModernSpinner from '../../../../../primitives/feedback/Spinner/engines/modern';
import ModernTextarea from '../../../../../primitives/inputs/Textarea/engines/modern';
import { ModernEmptyState } from '../../../../facade';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';

/** Shared i18n helper shape for the thread's localized copy. */
type Translate = (key: string, fallback: string, params?: Record<string, string | number>) => string;

/**
 * Convert an ISO timestamp string into a human-readable relative time label.
 * Uses progressively coarser units (minutes, hours, days) and falls back to
 * an absolute date for timestamps older than 7 days. Unit words resolve
 * through the components catalogue with an English floor; the absolute date
 * follows the active locale.
 */
function formatTimestamp(ts: string, tOr: Translate, locale?: string): string {
  const date = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return tOr('comment_thread.just_now', 'just now');
  if (diffMin < 60) return tOr('comment_thread.minutes_ago', '{count}m ago', { count: diffMin });
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return tOr('comment_thread.hours_ago', '{count}h ago', { count: diffHr });
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return tOr('comment_thread.days_ago', '{count}d ago', { count: diffDay });
  return date.toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
}

/** Hook-local `tOr`: catalogue value with an English floor, never a raw key. */
function useThreadTranslation(): { tOr: Translate; locale?: string } {
  const i18n = useOptionalTranslation('components');
  const tOr: Translate = (key, fallback, params) => {
    const resolved = i18n?.t(key, params);
    if (!resolved || resolved === key || resolved === `components.${key}`) return fallback;
    return resolved;
  };
  return { tOr, locale: i18n?.locale };
}

/** Props for the recursive CommentNode used internally by ModernCommentThread. */
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
 * Recursive comment node composed from DS primitives. Each instance renders
 * its own content, reaction pills, ghost action buttons, and optionally its
 * children (replies) inside a skin-owned threading rail.
 */
function CommentNode({ comment, depth, maxDepth, currentUser, onReply, onEdit, onDelete, onReaction }: CommentNodeProps) {
  const { tOr, locale } = useThreadTranslation();
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
    <div data-part="comment">
      <div data-part="comment-row">
        <div data-part="avatar-col">
          <ModernAvatar data-part="avatar" size="sm" src={comment.author.avatar} name={comment.author.name} />
        </div>
        <div data-part="comment-main">
          <div data-part="comment-head">
            <span data-part="author">{comment.author.name}</span>
            <span data-part="timestamp">{formatTimestamp(comment.timestamp, tOr, locale)}</span>
            {comment.edited && (
              <span data-part="edited-mark">{tOr('comment_thread.edited', '(edited)')}</span>
            )}
          </div>

          {editing ? (
            // TextareaProps does not extend BaseComponentProps (no aria/data
            // index), so the accessible name rides a named group wrapper --
            // same registered gap as the Switch contract in filter-builder.
            <div data-part="edit-form" role="group" aria-label={tOr('comment_thread.edit', 'Edit')}>
              <ModernTextarea
                value={editText}
                onChange={(v) => setEditText(v)}
                rows={2}
              />
              <div data-part="form-actions">
                <ModernButton data-part="save" variant="primary" size="xs" onClick={handleEdit}>
                  {tOr('comment_thread.save', 'Save')}
                </ModernButton>
                <ModernButton
                  data-part="cancel"
                  variant="ghost"
                  size="xs"
                  onClick={() => { setEditing(false); setEditText(comment.content); }}
                >
                  {tOr('comment_thread.cancel', 'Cancel')}
                </ModernButton>
              </div>
            </div>
          ) : (
            <p data-part="comment-body">{comment.content}</p>
          )}

          {/* Reactions: pill Buttons; the active pill reads primary, the rest
              ghost -- paint belongs to the button skin. */}
          {comment.reactions && comment.reactions.length > 0 && (
            <div data-part="reactions">
              {comment.reactions.map(r => (
                <ModernButton
                  key={r.emoji}
                  data-part="reaction"
                  data-active={r.active ? "true" : "false"}
                  variant={r.active ? 'primary' : 'ghost'}
                  size="xs"
                  onClick={() => onReaction?.(comment.id, r.emoji)}
                >
                  {r.emoji} {r.count}
                </ModernButton>
              ))}
            </div>
          )}

          {/* Actions -- reply is depth-gated to prevent infinitely nested threads.
              Edit and delete are restricted to the comment owner. */}
          <div data-part="comment-actions">
            {depth < maxDepth && onReply && (
              <ModernButton data-part="reply" variant="ghost" size="xs" onClick={() => setReplyVisible(!replyVisible)}>
                {tOr('comment_thread.reply', 'Reply')}
              </ModernButton>
            )}
            {isOwner && onEdit && (
              <ModernButton data-part="edit" variant="ghost" size="xs" onClick={() => setEditing(true)}>
                {tOr('comment_thread.edit', 'Edit')}
              </ModernButton>
            )}
            {isOwner && onDelete && (
              <ModernButton data-part="delete" variant="danger" size="xs" onClick={() => onDelete(comment.id)}>
                {tOr('comment_thread.delete', 'Delete')}
              </ModernButton>
            )}
          </div>

          {/* Reply composer */}
          {replyVisible && (
            <div data-part="reply-form">
              <ModernTextarea
                value={replyText}
                onChange={(v) => setReplyText(v)}
                rows={2}
                placeholder={tOr('comment_thread.reply_placeholder', 'Write a reply...')}
              />
              <div data-part="form-actions">
                <ModernButton data-part="reply-submit" variant="primary" size="xs" onClick={handleReply} disabled={!replyText.trim()}>
                  {tOr('comment_thread.reply', 'Reply')}
                </ModernButton>
                <ModernButton data-part="reply-cancel" variant="ghost" size="xs" onClick={() => setReplyVisible(false)}>
                  {tOr('comment_thread.cancel', 'Cancel')}
                </ModernButton>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Nested replies -- rendered recursively inside a skin-owned threading
          rail (inline-start hairline). Stops at maxDepth to cap DOM depth. */}
      {comment.replies && comment.replies.length > 0 && depth < maxDepth && (
        <div data-part="nested-line">
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
 * Modern comment thread: recursive nesting, reactions and CRUD composed
 * entirely from DS primitives (Avatar, Textarea, Button, Spinner) plus the
 * canonical EmptyState kit for the empty list.
 * @param props - CommentThreadProps controlling the comment list, user identity,
 *   CRUD callbacks, nesting depth, and display options.
 * @returns A comment list with a primitive composer and canonical state kits.
 */
export default function ModernCommentThread(props: CommentThreadProps) {
  const { tOr } = useThreadTranslation();
  const {
    comments,
    onAdd,
    onEdit,
    onDelete,
    onReply,
    onReaction,
    currentUser,
    maxDepth = 3,
    placeholder: placeholderProp,
    emptyMessage: emptyMessageProp,
    loading,
    className,
    style,
  } = props;

  // Copy defaults: explicit props win; otherwise the localized label with the
  // historical English default as the floor (API and tests are pinned to it).
  const placeholder = placeholderProp ?? tOr('comment_thread.composer_placeholder', 'Write a comment...');
  const emptyMessage = emptyMessageProp ?? tOr('comment_thread.empty', 'No comments yet');

  const [newComment, setNewComment] = useState('');

  const handleAdd = useCallback(() => {
    if (newComment.trim() && onAdd) {
      onAdd(newComment.trim());
      setNewComment('');
    }
  }, [newComment, onAdd]);

  if (loading) {
    return (
      <div data-part="root" data-loading="true" className={`ds-pattern-comment-thread ds-engine-modern ${className ?? ''}`} style={style}>
        {/* Spinner primitive owns its paint and the status role/name
            ("Loading" floor) the tests assert. */}
        <ModernSpinner data-part="spinner" size="md" />
      </div>
    );
  }

  return (
    <div data-part="root" className={`ds-pattern-comment-thread ds-engine-modern ${className ?? ''}`} style={style}>
      {/* New comment composer -- only rendered when both onAdd and currentUser
          are provided. Without a user identity we cannot attribute the comment. */}
      {onAdd && currentUser && (
        <div data-part="composer-row">
          <div data-part="avatar-col">
            <ModernAvatar data-part="avatar" size="sm" src={currentUser.avatar} name={currentUser.name} />
          </div>
          <div data-part="composer-main">
            <ModernTextarea
              value={newComment}
              onChange={(v) => setNewComment(v)}
              rows={3}
              placeholder={placeholder}
            />
            <div data-part="form-actions">
              <ModernButton data-part="submit" variant="primary" size="sm" onClick={handleAdd} disabled={!newComment.trim()}>
                {tOr('comment_thread.submit', 'Comment')}
              </ModernButton>
            </div>
          </div>
        </div>
      )}

      {/* Comments -- canonical empty kit when the list is empty. */}
      {comments.length === 0 ? (
        <div data-part="empty">
          <ModernEmptyState title={emptyMessage} />
        </div>
      ) : (
        <div data-part="comment-list">
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
