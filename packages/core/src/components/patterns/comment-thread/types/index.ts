/**
 * CommentThread - Pattern Component Types
 */

import type { ReactNode } from 'react';
import type { PatternBaseProps } from '../../types';

export interface CommentReaction {
  emoji: string;
  count: number;
  active?: boolean;
}

export interface Comment {
  id: string;
  author: {
    name: string;
    avatar?: string;
  };
  content: string;
  timestamp: string;
  replies?: Comment[];
  reactions?: CommentReaction[];
  edited?: boolean;
}

export interface CommentThreadProps extends PatternBaseProps {
  /** List of top-level comments */
  comments: Comment[];
  /** Called when a new comment is added */
  onAdd?: (content: string, parentId?: string) => void;
  /** Called when a comment is edited */
  onEdit?: (id: string, content: string) => void;
  /** Called when a comment is deleted */
  onDelete?: (id: string) => void;
  /** Called when replying to a comment */
  onReply?: (parentId: string, content: string) => void;
  /** Called when a reaction is toggled */
  onReaction?: (commentId: string, emoji: string) => void;
  /** Current authenticated user */
  currentUser?: {
    name: string;
    avatar?: string;
  };
  /** Maximum nesting depth for replies */
  maxDepth?: number;
  /** Placeholder text for the comment input */
  placeholder?: string;
  /** Empty state message */
  emptyMessage?: string;
}
