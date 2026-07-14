'use client';

/**
 * @fileoverview Modern engine for the CommentThread pattern.
 * Renders a recursive tree of comments with DS token inline styles.
 * Supports nested replies up to maxDepth, inline editing, deletion, and
 * emoji reactions. Falls back to a first-initial avatar placeholder when
 * no image URL is provided.
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
import type { CommentThreadProps, Comment } from '../CommentThread.types';

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
 * Recursive comment node using DaisyUI classes. Each instance renders its own
 * content, reactions, action buttons, and optionally its children (replies),
 * indented via Tailwind's ml-6 class per depth level.
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
    <div className={depth > 0 ? 'ml-6' : ''}>
      <div className="flex gap-3 mb-3">
        <div className="flex-shrink-0" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <div data-part="avatar" className="rounded-full w-8 h-8" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {comment.author.avatar ? (
              <img src={comment.author.avatar} alt={comment.author.name} />
            ) : (
              <span className="text-xs">{comment.author.name.charAt(0).toUpperCase()}</span>
            )}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm">{comment.author.name}</span>
            <span className="text-xs opacity-50">{formatTimestamp(comment.timestamp)}</span>
            {comment.edited && (
              <span className="text-xs opacity-30 italic">(edited)</span>
            )}
          </div>

          {editing ? (
            <div className="mb-2">
              <textarea
                data-part="edit-textarea"
                className="w-full mb-2"
                style={{ width: '100%', padding: '6px 10px', fontSize: 13, resize: 'vertical' }}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={2}
              />
              <div className="flex gap-2">
                <button data-part="save" style={{ height: 24, padding: '0 8px', fontSize: 12, cursor: 'pointer' }} onClick={handleEdit}>Save</button>
                <button data-part="cancel" style={{ height: 24, padding: '0 8px', fontSize: 12, cursor: 'pointer' }} onClick={() => { setEditing(false); setEditText(comment.content); }}>Cancel</button>
              </div>
            </div>
          ) : (
            <p className="text-sm mb-2 leading-relaxed">{comment.content}</p>
          )}

          {/* Reactions */}
          {comment.reactions && comment.reactions.length > 0 && (
            <div className="flex gap-1 mb-2">
              {comment.reactions.map(r => (
                <button
                  key={r.emoji}
                  data-part="reaction"
                  data-active={r.active}
                  style={{
                    height: 24, padding: '0 8px', fontSize: 12,
                    cursor: 'pointer',
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
          <div className="flex gap-3 text-xs opacity-50">
            {depth < maxDepth && onReply && (
              <button data-part="reply" style={{ height: 24, padding: '0 8px', fontSize: 12, cursor: 'pointer' }} onClick={() => setReplyVisible(!replyVisible)}>
                Reply
              </button>
            )}
            {isOwner && onEdit && (
              <button data-part="edit" style={{ height: 24, padding: '0 8px', fontSize: 12, cursor: 'pointer' }} onClick={() => setEditing(true)}>
                Edit
              </button>
            )}
            {isOwner && onDelete && (
              <button data-part="delete" style={{ height: 24, padding: '0 8px', fontSize: 12, cursor: 'pointer' }} onClick={() => onDelete(comment.id)}>
                Delete
              </button>
            )}
          </div>

          {/* Reply input */}
          {replyVisible && (
            <div className="mt-2">
              <textarea
                data-part="reply-textarea"
                className="w-full mb-2"
                style={{ width: '100%', padding: '6px 10px', fontSize: 13, resize: 'vertical' }}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={2}
                placeholder="Write a reply..."
              />
              <div className="flex gap-2">
                <button data-part="reply-submit" style={{ height: 24, padding: '0 8px', fontSize: 12, cursor: 'pointer' }} onClick={handleReply} disabled={!replyText.trim()}>
                  Reply
                </button>
                <button data-part="reply-cancel" style={{ height: 24, padding: '0 8px', fontSize: 12, cursor: 'pointer' }} onClick={() => setReplyVisible(false)}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Nested replies -- rendered recursively with a left border line for
          visual threading. Stops at maxDepth to cap DOM nesting depth. */}
      {comment.replies && comment.replies.length > 0 && depth < maxDepth && (
        <div data-part="nested-line" className="border-l-2 pl-3">
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
 * Modern (DaisyUI/Tailwind) comment thread with recursive nesting, reactions, and CRUD.
 * @param props - CommentThreadProps controlling the comment list, user identity,
 *   CRUD callbacks, nesting depth, and display options.
 * @returns A comment list with a DaisyUI spinner for loading and an optional input area.
 */
export default function ModernCommentThread(props: CommentThreadProps) {
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
      <div data-part="root" className={`ds-pattern-comment-thread ds-engine-modern flex justify-center items-center py-12 ${className ?? ''}`} style={style}>
        <span
          data-part="spinner"
          role="status"
          aria-label="Loading"
          style={{ display: 'inline-block', width: 24, height: 24, animation: 'ds-spin var(--ds-motion-glacial) linear infinite' }}
        />
      </div>
    );
  }

  return (
    <div data-part="root" className={`ds-pattern-comment-thread ds-engine-modern ${className ?? ''}`} style={style}>
      {/* New comment input -- only rendered when both onAdd and currentUser
          are provided. Without a user identity we cannot attribute the comment. */}
      {onAdd && currentUser && (
        <div className="flex gap-3 mb-6">
          <div className="flex-shrink-0" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <div data-part="avatar" className="rounded-full w-8 h-8" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {currentUser.avatar ? (
                <img src={currentUser.avatar} alt={currentUser.name} />
              ) : (
                <span className="text-xs">{currentUser.name.charAt(0).toUpperCase()}</span>
              )}
            </div>
          </div>
          <div className="flex-1">
            <textarea
              data-part="composer"
              className="w-full mb-2"
              style={{ width: '100%', padding: '8px 10px', fontSize: 13, resize: 'vertical' }}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              placeholder={placeholder}
            />
            <button data-part="submit" style={{ height: 32, padding: '0 12px', fontSize: 13, cursor: 'pointer' }} onClick={handleAdd} disabled={!newComment.trim()}>
              Comment
            </button>
          </div>
        </div>
      )}

      {/* Comments */}
      {comments.length === 0 ? (
        <div className="flex justify-center items-center py-12 opacity-50">
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
