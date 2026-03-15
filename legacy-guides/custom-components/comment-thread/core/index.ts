import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';

export type CommentThreadPreset = 'thread' | 'inline';

export type AuthorRole = 'admin' | 'team' | 'member' | 'guest';

export interface CommentAuthor {
  id: string;
  name: string;
  avatar?: string;
  role: AuthorRole;
}

export interface CommentReaction {
  emoji: string;
  count: number;
  reacted?: boolean;
}

export interface Comment {
  id: string;
  author: CommentAuthor;
  content: string;
  timestamp: string;
  reactions?: CommentReaction[];
  replies?: Comment[];
  mentions?: string[];
  edited?: boolean;
}

export interface CategoryItem {
  key: string;
  label: string;
  icon?: ReactNode;
  count?: number;
  active?: boolean;
}

export interface SidebarMember {
  id: string;
  name: string;
  avatar?: string;
  role: AuthorRole;
  online?: boolean;
}

export interface CommentThreadProps extends EngineAwareProps {
  preset?: CommentThreadPreset;
  comments: Comment[];
  categories?: CategoryItem[];
  activeCategoryKey?: string;
  onCategorySelect?: (key: string) => void;
  members?: SidebarMember[];
  title?: string;
  description?: string;
  onReply?: (commentId: string, content: string) => void;
  onReact?: (commentId: string, emoji: string) => void;
  onMention?: (userId: string) => void;
  onNewComment?: (content: string) => void;
  showSidebar?: boolean;
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const COMMENT_THREAD_DEFAULTS: Partial<CommentThreadProps> = {
  preset: 'thread',
  showSidebar: true,
  title: 'Discussion',
};

export function getRoleBadgeColors(tokens: DesignTokens): Record<AuthorRole, { color: string; bgColor: string }> {
  return {
    admin: { color: tokens.colors.errorScale[700], bgColor: tokens.colors.errorScale[50] },
    team: { color: tokens.colors.primaryScale[700], bgColor: tokens.colors.primaryScale[50] },
    member: { color: tokens.colors.neutral[600], bgColor: tokens.colors.neutral[100] },
    guest: { color: tokens.colors.neutral[500], bgColor: tokens.colors.neutral[50] },
  };
}

export function formatRelativeTime(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(timestamp).toLocaleDateString();
}
