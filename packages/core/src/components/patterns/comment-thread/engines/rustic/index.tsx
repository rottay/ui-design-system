'use client';

/**
 * CommentThread - Rustic Engine (Inline styles with --ds-* CSS variables)
 */

import React, { useState, useCallback, type CSSProperties } from 'react';
import type { CommentThreadProps, Comment } from '../../types';

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

const avatarStyle = (size: number): CSSProperties => ({
  width: size,
  height: size,
  borderRadius: '50%',
  background: 'var(--ds-color-neutral-200, #e5e7eb)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: size * 0.4,
  fontWeight: 600,
  color: 'var(--ds-color-text-muted)',
  overflow: 'hidden',
  flexShrink: 0,
});

const textareaStyle: CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  fontSize: 'var(--ds-font-size-sm, 14px)',
  borderRadius: 'var(--ds-radius-md, 6px)',
  border: '1px solid var(--ds-color-neutral-300, #d1d5db)',
  background: 'var(--ds-color-background, #fff)',
  color: 'var(--ds-color-text)',
  resize: 'vertical' as const,
  fontFamily: 'inherit',
};

const btnStyle: CSSProperties = {
  padding: '4px 12px',
  fontSize: 'var(--ds-font-size-sm, 13px)',
  borderRadius: 'var(--ds-radius-md, 6px)',
  border: '1px solid var(--ds-color-neutral-300, #d1d5db)',
  background: 'var(--ds-color-background, #fff)',
  color: 'var(--ds-color-text)',
  cursor: 'pointer',
  fontWeight: 500,
};

const primaryBtnStyle: CSSProperties = {
  ...btnStyle,
  background: 'var(--ds-color-primary)',
  color: 'var(--ds-color-primary-foreground, #fff)',
  borderColor: 'var(--ds-color-primary)',
};

const linkBtnStyle: CSSProperties = {
  background: 'none',
  border: 'none',
  padding: '2px 4px',
  fontSize: 'var(--ds-font-size-xs, 12px)',
  color: 'var(--ds-color-text-muted)',
  cursor: 'pointer',
  fontWeight: 500,
};

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

function CommentNode({ comment, depth, maxDepth, currentUser, onReply, onEdit, onDelete, onReaction }: CommentNodeProps) {
  const [replyVisible, setReplyVisible] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);

  const isOwner = currentUser?.name === comment.author.name;

  const handleReply = useCallback(() => {
    if (replyText.trim() && onReply) {
      onReply(comment.id, replyText.trim());
      setReplyText('');
      setReplyVisible(false);
    }
  }, [replyText, onReply, comment.id]);

  const handleEdit = useCallback(() => {
    if (editText.trim() && onEdit) {
      onEdit(comment.id, editText.trim());
      setEditing(false);
    }
  }, [editText, onEdit, comment.id]);

  return (
    <div style={{ marginLeft: depth > 0 ? 24 : 0 }}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <div style={avatarStyle(32)}>
          {comment.author.avatar ? (
            <img src={comment.author.avatar} alt={comment.author.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            comment.author.name.charAt(0).toUpperCase()
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontWeight: 600, fontSize: 'var(--ds-font-size-sm, 14px)' }}>{comment.author.name}</span>
            <span style={{ color: 'var(--ds-color-text-muted)', fontSize: 'var(--ds-font-size-xs, 12px)' }}>
              {formatTimestamp(comment.timestamp)}
            </span>
            {comment.edited && (
              <span style={{ color: 'var(--ds-color-text-muted)', fontSize: 'var(--ds-font-size-xs, 11px)', fontStyle: 'italic', opacity: 0.6 }}>
                (edited)
              </span>
            )}
          </div>

          {editing ? (
            <div style={{ marginBottom: 8 }}>
              <textarea
                style={{ ...textareaStyle, marginBottom: 8 }}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={2}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={primaryBtnStyle} onClick={handleEdit}>Save</button>
                <button style={btnStyle} onClick={() => { setEditing(false); setEditText(comment.content); }}>Cancel</button>
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
                  style={{
                    ...btnStyle,
                    padding: '2px 8px',
                    fontSize: 'var(--ds-font-size-xs, 12px)',
                    background: r.active ? 'var(--ds-color-primary-50, #eff6ff)' : undefined,
                    borderColor: r.active ? 'var(--ds-color-primary)' : undefined,
                  }}
                  onClick={() => onReaction?.(comment.id, r.emoji)}
                >
                  {r.emoji} {r.count}
                </button>
              ))}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8 }}>
            {depth < maxDepth && onReply && (
              <button style={linkBtnStyle} onClick={() => setReplyVisible(!replyVisible)}>Reply</button>
            )}
            {isOwner && onEdit && (
              <button style={linkBtnStyle} onClick={() => setEditing(true)}>Edit</button>
            )}
            {isOwner && onDelete && (
              <button style={{ ...linkBtnStyle, color: 'var(--ds-color-error, #ef4444)' }} onClick={() => onDelete(comment.id)}>Delete</button>
            )}
          </div>

          {/* Reply input */}
          {replyVisible && (
            <div style={{ marginTop: 8 }}>
              <textarea
                style={{ ...textareaStyle, marginBottom: 8 }}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={2}
                placeholder="Write a reply..."
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  style={{ ...primaryBtnStyle, opacity: replyText.trim() ? 1 : 0.5 }}
                  onClick={handleReply}
                  disabled={!replyText.trim()}
                >
                  Reply
                </button>
                <button style={btnStyle} onClick={() => setReplyVisible(false)}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Nested replies */}
      {comment.replies && comment.replies.length > 0 && depth < maxDepth && (
        <div style={{ borderLeft: '2px solid var(--ds-color-neutral-200, #e5e7eb)', paddingLeft: 12 }}>
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
      <div className={className} style={{ textAlign: 'center', padding: 48, ...style }}>
        <span style={{ color: 'var(--ds-color-text-muted)' }}>Loading...</span>
      </div>
    );
  }

  return (
    <div className={className} style={style}>
      {/* New comment input */}
      {onAdd && currentUser && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          <div style={avatarStyle(32)}>
            {currentUser.avatar ? (
              <img src={currentUser.avatar} alt={currentUser.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              currentUser.name.charAt(0).toUpperCase()
            )}
          </div>
          <div style={{ flex: 1 }}>
            <textarea
              style={{ ...textareaStyle, marginBottom: 8 }}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              placeholder={placeholder}
            />
            <button
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
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--ds-color-text-muted)' }}>
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
