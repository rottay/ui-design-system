/**
 * BhUnifiedInbox - Core Interface
 * Unified Inbox for BitHire ATS platform - aggregates all candidate
 * communications (email, SMS, WhatsApp, LinkedIn) into a single inbox view.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';

export type BhUnifiedInboxPreset = 'omnichannel' | 'thread' | 'sequences';

// =============================================================================
// CHANNEL TYPES
// =============================================================================

export type InboxChannel = 'email' | 'sms' | 'whatsapp' | 'linkedin' | 'internal';

// =============================================================================
// DATA TYPES
// =============================================================================

/**
 * Attachment on a message
 */
export interface InboxAttachment {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
}

/**
 * A single message within a thread
 */
export interface InboxMessage {
  id: string;
  threadId: string;
  direction: 'inbound' | 'outbound';
  channel: InboxChannel;
  content: string;
  subject?: string;
  senderName: string;
  senderEmail?: string;
  sentAt: string;
  readAt?: string;
  deliveredAt?: string;
  attachments: InboxAttachment[];
  metadata?: Record<string, unknown>;
}

/**
 * A conversation thread in the unified inbox
 */
export interface InboxThread {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  candidateAvatarUrl?: string;
  channel: InboxChannel;
  subject?: string;
  lastMessagePreview: string;
  lastMessageAt: string;
  unreadCount: number;
  isStarred: boolean;
  isArchived: boolean;
  tags: string[];
  messages: InboxMessage[];
}

/**
 * A step in an outreach sequence
 */
export interface SequenceStep {
  order: number;
  delay: number;
  delayUnit: 'hours' | 'days';
  channel: InboxChannel;
  template: string;
  subject?: string;
  sentCount: number;
  openCount: number;
  replyCount: number;
}

/**
 * An automated outreach sequence
 */
export interface InboxSequence {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'paused' | 'completed' | 'draft';
  steps: SequenceStep[];
  targetCount: number;
  completedCount: number;
  openRate?: number;
  replyRate?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Aggregated inbox statistics
 */
export interface InboxStats {
  totalUnread: number;
  unreadByChannel: Record<string, number>;
  totalThreads: number;
  responseRate: number;
  avgResponseTime: number;
  activeSequences: number;
  sequenceReplyRate: number;
}

// =============================================================================
// COMPONENT PROPS
// =============================================================================

export interface BhUnifiedInboxProps extends EngineAwareProps {
  preset?: BhUnifiedInboxPreset;

  /** All inbox threads */
  threads?: InboxThread[];

  /** Currently selected thread */
  selectedThread?: InboxThread | null;

  /** Outreach sequences */
  sequences?: InboxSequence[];

  /** Aggregated inbox stats */
  stats?: InboxStats | null;

  /** Whether data is loading */
  loading?: boolean;

  /** Callback when a thread is selected */
  onSelectThread?: (threadId: string) => void;

  /** Callback to send a message */
  onSendMessage?: (data: {
    threadId: string;
    channel: InboxChannel;
    content: string;
    subject?: string;
  }) => void;

  /** Callback to archive a thread */
  onArchive?: (threadId: string) => void;

  /** Callback to mark a thread as read */
  onMarkRead?: (threadId: string) => void;

  /** Callback to create a sequence */
  onCreateSequence?: (data: {
    name: string;
    description?: string;
    steps: Array<{
      delay: number;
      delayUnit: 'hours' | 'days';
      channel: InboxChannel;
      template: string;
      subject?: string;
    }>;
  }) => void;

  /** Callback to toggle sequence pause/resume */
  onToggleSequence?: (sequenceId: string, action: 'pause' | 'resume') => void;

  /** Current search query */
  searchQuery?: string;

  /** Callback when search query changes */
  onSearch?: (query: string) => void;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_UNIFIED_INBOX_DEFAULTS: Partial<BhUnifiedInboxProps> = {
  preset: 'omnichannel',
};

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Returns the icon name for a given channel
 */
export function getChannelIcon(channel: InboxChannel): string {
  switch (channel) {
    case 'email': return 'Mail';
    case 'sms': return 'MessageSquare';
    case 'whatsapp': return 'MessageCircle';
    case 'linkedin': return 'Linkedin';
    case 'internal': return 'MessagesSquare';
    default: return 'Mail';
  }
}

/**
 * Returns the semantic color scale name for a channel
 */
export function getChannelColor(channel: InboxChannel): 'primary' | 'success' | 'info' | 'warning' | 'error' {
  switch (channel) {
    case 'email': return 'primary';
    case 'sms': return 'success';
    case 'whatsapp': return 'success';
    case 'linkedin': return 'info';
    case 'internal': return 'warning';
    default: return 'primary';
  }
}

/**
 * Formats a timestamp as a relative time string
 */
export function formatTimeAgo(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diffMs = now - date;
  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w`;
  const months = Math.floor(days / 30);
  return `${months}mo`;
}

/**
 * Returns the badge color for a sequence status
 */
export function getSequenceStatusColor(status: InboxSequence['status']): 'success' | 'warning' | 'primary' | 'secondary' {
  switch (status) {
    case 'active': return 'success';
    case 'paused': return 'warning';
    case 'completed': return 'primary';
    case 'draft': return 'secondary';
    default: return 'secondary';
  }
}
