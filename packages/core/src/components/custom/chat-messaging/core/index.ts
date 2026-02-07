import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';

export type ChatMessagingPreset = 'split' | 'panel';

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
export type EmbeddedCardType = 'job' | 'project' | 'link' | 'file';
export type ConversationTab = 'conversations' | 'requests';

export interface EmbeddedCard {
  type: EmbeddedCardType;
  title: string;
  subtitle?: string;
  image?: string;
  url?: string;
  metadata?: Record<string, string>;
}

export interface MessageAttachment {
  id: string;
  name: string;
  size?: string;
  type?: string;
  url?: string;
}

export interface ChatMessage {
  id: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
    isOwn?: boolean;
  };
  content: string;
  timestamp: string;
  status?: MessageStatus;
  embeddedCard?: EmbeddedCard;
  attachments?: MessageAttachment[];
}

export interface ConversationParticipant {
  id: string;
  name: string;
  avatar?: string;
  online?: boolean;
}

export interface Conversation {
  id: string;
  participants: ConversationParticipant[];
  lastMessage?: {
    content: string;
    timestamp: string;
    senderId: string;
  };
  unreadCount?: number;
  archived?: boolean;
}

export interface ChatMessagingProps extends EngineAwareProps {
  preset?: ChatMessagingPreset;
  conversations?: Conversation[];
  activeConversationId?: string;
  onConversationSelect?: (id: string) => void;
  messages: ChatMessage[];
  onSendMessage?: (content: string, attachments?: File[]) => void;
  onAttach?: () => void;
  activeTab?: ConversationTab;
  onTabChange?: (tab: ConversationTab) => void;
  archivedBanner?: boolean;
  onUnarchive?: () => void;
  title?: string;
  placeholder?: string;
  showToolbar?: boolean;
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const CHAT_MESSAGING_DEFAULTS: Partial<ChatMessagingProps> = {
  preset: 'split',
  placeholder: 'Type a message...',
  showToolbar: true,
  title: 'Messages',
  activeTab: 'conversations',
};

export function getMessageBubbleColors(tokens: DesignTokens) {
  return {
    own: {
      color: tokens.colors.common.white,
      bgColor: tokens.colors.primaryScale[500],
    },
    other: {
      color: tokens.colors.neutral[800],
      bgColor: tokens.colors.neutral[100],
    },
  };
}

export function getBannerColors(tokens: DesignTokens) {
  return {
    color: tokens.colors.warningScale[800],
    bgColor: tokens.colors.warningScale[50],
    border: tokens.colors.warningScale[200],
  };
}

export function formatMessageTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function formatConversationDate(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return formatMessageTime(timestamp);
  if (days === 1) return 'Yesterday';
  if (days < 7) return date.toLocaleDateString([], { weekday: 'short' });
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}
