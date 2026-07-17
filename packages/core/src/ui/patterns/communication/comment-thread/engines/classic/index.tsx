'use client';

/**
 * @fileoverview Classic (Ant Design) engine for the CommentThread pattern.
 * Renders a recursive tree of comments using Ant Design Avatar, Button, Input
 * TextArea, Tooltip, and Empty components. Supports nested replies up to a
 * configurable maxDepth, inline editing, deletion, and emoji reactions.
 * Comment ownership is determined by comparing currentUser.name to the comment
 * author's name to gate edit/delete actions.
 *
 * @example
 * <ClassicCommentThread
 *   comments={[{ id: '1', author: { name: 'Alice' }, content: 'Hello!', timestamp: new Date().toISOString() }]}
 *   currentUser={{ name: 'Alice' }}
 *   onAdd={(text) => addComment(text)}
 *   onReply={(parentId, text) => replyTo(parentId, text)}
 *   maxDepth={4}
 * />
 */

import React, { useState, useCallback } from 'react';
import { Avatar, Button, Input, List, Space, Tooltip, Empty } from 'antd';
import {
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import type { CommentThreadProps, Comment } from '../../contracts';

const { TextArea } = Input;

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

/** Props for the recursive CommentNode used internally by ClassicCommentThread. */
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
 * Recursive comment node. Each instance renders its own content, actions,
 * and optionally its children (replies), indented by 24px per depth level.
 * The recursion terminates when depth reaches maxDepth.
 */
function CommentNode({ comment, depth, maxDepth, currentUser, onReply, onEdit, onDelete, onReaction }: CommentNodeProps) {
  const [replyVisible, setReplyVisible] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);

  // Only the comment author can edit or delete their own comments.
  // Identity is matched by name (not id) since the Comment type only
  // exposes author.name at this level.
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

  // Reply action is only available when we haven't reached maxDepth,
  // preventing infinitely nested threads in the UI.
  const actions = [
    ...(depth < maxDepth && onReply ? [
      <Tooltip key="reply" title="Reply">
        <span onClick={() => setReplyVisible(!replyVisible)}>
          <MessageOutlined /> Reply
        </span>
      </Tooltip>,
    ] : []),
    ...(isOwner && onEdit ? [
      <Tooltip key="edit" title="Edit">
        <span onClick={() => setEditing(!editing)}>
          <EditOutlined /> Edit
        </span>
      </Tooltip>,
    ] : []),
    ...(isOwner && onDelete ? [
      <Tooltip key="delete" title="Delete">
        <span onClick={() => onDelete(comment.id)}>
          <DeleteOutlined /> Delete
        </span>
      </Tooltip>,
    ] : []),
  ];

  return (
    <div style={{ marginLeft: depth > 0 ? 24 : 0 }}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <Avatar
          src={comment.author.avatar}
          icon={!comment.author.avatar ? <UserOutlined /> : undefined}
          size={32}
        />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>{comment.author.name}</span>
            <span style={{ color: 'var(--ds-color-text-secondary, rgba(0,0,0,0.45))', fontSize: 12 }}>
              {formatTimestamp(comment.timestamp)}
            </span>
            {comment.edited && (
              <span
                style={{
                  color: 'var(--ds-color-text-tertiary, rgba(0,0,0,0.3))',
                  fontSize: 11,
                  fontStyle: 'italic',
                }}
              >
                (edited)
              </span>
            )}
          </div>

          {editing ? (
            <div style={{ marginBottom: 8 }}>
              <TextArea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={2}
                style={{ marginBottom: 8 }}
              />
              <Space>
                <Button size="small" type="primary" onClick={handleEdit}>Save</Button>
                <Button size="small" onClick={() => { setEditing(false); setEditText(comment.content); }}>Cancel</Button>
              </Space>
            </div>
          ) : (
            <div style={{ fontSize: 14, marginBottom: 8, lineHeight: 1.6 }}>
              {comment.content}
            </div>
          )}

          {/* Reactions */}
          {comment.reactions && comment.reactions.length > 0 && (
            <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
              {comment.reactions.map(r => (
                <Button
                  key={r.emoji}
                  size="small"
                  type={r.active ? 'primary' : 'default'}
                  onClick={() => onReaction?.(comment.id, r.emoji)}
                  style={{ padding: '0 8px', height: 24, fontSize: 12 }}
                >
                  {r.emoji} {r.count}
                </Button>
              ))}
            </div>
          )}

          {/* Actions */}
          <div
            style={{
              display: 'flex',
              gap: 16,
              fontSize: 12,
              color: 'var(--ds-color-text-secondary, rgba(0,0,0,0.45))',
            }}
          >
            {actions.map((action, i) => (
              <span key={i} style={{ cursor: 'pointer' }}>{action}</span>
            ))}
          </div>

          {/* Reply input */}
          {replyVisible && (
            <div style={{ marginTop: 8 }}>
              <TextArea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={2}
                placeholder="Write a reply..."
                style={{ marginBottom: 8 }}
              />
              <Space>
                <Button size="small" type="primary" onClick={handleReply} disabled={!replyText.trim()}>
                  Reply
                </Button>
                <Button size="small" onClick={() => setReplyVisible(false)}>Cancel</Button>
              </Space>
            </div>
          )}
        </div>
      </div>

      {/* Nested replies -- rendered recursively with a left border line to
          visually connect children to their parent comment. Stops at maxDepth
          to prevent infinitely deep DOM nesting. */}
      {comment.replies && comment.replies.length > 0 && depth < maxDepth && (
        <div style={{ borderLeft: '2px solid var(--ds-color-border-secondary, #f0f0f0)', paddingLeft: 12 }}>
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
 * Classic (Ant Design) comment thread with recursive nesting, reactions, and CRUD actions.
 * @param props - CommentThreadProps controlling the comment list, user identity,
 *   CRUD callbacks, nesting depth, and display options.
 * @returns A comment list with an optional top-level input for adding new comments.
 */
export default function ClassicCommentThread(props: CommentThreadProps) {
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
        <span style={{ color: 'var(--ds-color-text-secondary, rgba(0,0,0,0.45))' }}>Loading...</span>
      </div>
    );
  }

  return (
    <div className={`ds-pattern-comment-thread ds-engine-classic ${className ?? ''}`} style={style}>
      {/* New comment input -- only rendered when both onAdd and currentUser
          are provided. Without a user identity we cannot attribute the comment. */}
      {onAdd && currentUser && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          <Avatar
            src={currentUser.avatar}
            icon={!currentUser.avatar ? <UserOutlined /> : undefined}
            size={32}
          />
          <div style={{ flex: 1 }}>
            <TextArea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              placeholder={placeholder}
              style={{ marginBottom: 8 }}
            />
            <Button type="primary" onClick={handleAdd} disabled={!newComment.trim()}>
              Comment
            </Button>
          </div>
        </div>
      )}

      {/* Comments list */}
      {comments.length === 0 ? (
        <Empty description={emptyMessage} />
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
