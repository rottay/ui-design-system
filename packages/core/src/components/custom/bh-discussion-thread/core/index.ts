/**
 * BhDiscussionThread - Core Interface
 * Discussion/comments thread component for BitHire ATS platform.
 * Supports threaded conversations attached to recruiting entities.
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';

export type BhDiscussionThreadPreset = 'full';

/* -- Thread Status ---------------------------------------------------- */

export type ThreadStatus = 'open' | 'resolved' | 'archived';

/* -- Entity Types ----------------------------------------------------- */

export type DiscussionEntityType =
  | 'candidate'
  | 'job'
  | 'position'
  | 'interview'
  | 'offer';

/* -- Author ----------------------------------------------------------- */

export interface DiscussionAuthor {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
}

/* -- Reaction --------------------------------------------------------- */

export interface CommentReaction {
  emoji: string;
  count: number;
  reacted: boolean;
}

/* -- Attachment ------------------------------------------------------- */

export interface CommentAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
}

/* -- Comment ---------------------------------------------------------- */

export interface DiscussionComment {
  id: string;
  threadId: string;
  author: DiscussionAuthor;
  content: string;
  timestamp: string;
  isEdited?: boolean;
  reactions?: CommentReaction[];
  attachments?: CommentAttachment[];
}

/* -- Thread ----------------------------------------------------------- */

export interface DiscussionThread {
  id: string;
  title: string;
  entityType: DiscussionEntityType;
  entityId: string;
  entityName: string;
  status: ThreadStatus;
  createdBy: DiscussionAuthor;
  createdAt: string;
  lastActivityAt: string;
  commentCount: number;
  unreadCount?: number;
  participants?: DiscussionAuthor[];
}

/* -- Main Props ------------------------------------------------------- */

export interface BhDiscussionThreadProps extends EngineAwareProps {
  preset?: BhDiscussionThreadPreset;

  /* data */
  threads?: DiscussionThread[];
  selectedThreadId?: string | null;
  comments?: DiscussionComment[];

  /* state & callbacks */
  onSelectThread?: (threadId: string | null) => void;
  onAddComment?: (threadId: string, content: string) => void;
  onResolve?: (threadId: string) => void;
  onReopen?: (threadId: string) => void;
  onArchive?: (threadId: string) => void;
  onReact?: (commentId: string, emoji: string) => void;
  onEntityClick?: (entityType: DiscussionEntityType, entityId: string) => void;

  /* search/filter */
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  statusFilter?: ThreadStatus | 'all';
  onStatusFilterChange?: (status: ThreadStatus | 'all') => void;

  /* layout */
  className?: string;
  style?: CSSProperties;
}

export const BH_DISCUSSION_THREAD_DEFAULTS: Partial<BhDiscussionThreadProps> = {
  preset: 'full',
  threads: [],
  comments: [],
  statusFilter: 'all',
};

/* -- Helpers ---------------------------------------------------------- */

export function getStatusColor(status: ThreadStatus): { bg: string; text: string; label: string } {
  switch (status) {
    case 'open':
      return { bg: 'var(--ds-color-success-100)', text: 'var(--ds-color-success)', label: 'Open' };
    case 'resolved':
      return { bg: 'var(--ds-color-info-100)', text: 'var(--ds-color-info)', label: 'Resolved' };
    case 'archived':
      return { bg: 'var(--ds-color-neutral-100)', text: 'var(--ds-color-neutral-500)', label: 'Archived' };
  }
}

export function getEntityLabel(entityType: DiscussionEntityType): string {
  const labels: Record<DiscussionEntityType, string> = {
    candidate: 'Candidate',
    job: 'Job',
    position: 'Position',
    interview: 'Interview',
    offer: 'Offer',
  };
  return labels[entityType] ?? entityType;
}

export function formatThreadTimestamp(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}
