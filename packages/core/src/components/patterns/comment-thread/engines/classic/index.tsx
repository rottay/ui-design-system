'use client';

/**
 * CommentThread - Classic Engine (Ant Design)
 */

import React, { useState, useCallback } from 'react';
import { Avatar, Button, Input, List, Space, Tooltip, Empty } from 'antd';
import {
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import type { CommentThreadProps, Comment } from '../../types';

const { TextArea } = Input;

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
            <span style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>
              {formatTimestamp(comment.timestamp)}
            </span>
            {comment.edited && (
              <span style={{ color: 'rgba(0,0,0,0.3)', fontSize: 11, fontStyle: 'italic' }}>
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
          <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>
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

      {/* Nested replies */}
      {comment.replies && comment.replies.length > 0 && depth < maxDepth && (
        <div style={{ borderLeft: '2px solid #f0f0f0', paddingLeft: 12 }}>
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
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div className={`ds-pattern-comment-thread ds-engine-classic ${className ?? ''}`} style={style}>
      {/* New comment input */}
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
