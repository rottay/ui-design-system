import type { ReactNode } from 'react';

export type AssistantMessageRole = 'assistant' | 'user' | 'system' | 'tool';

export type AssistantDeliveryStatus =
  | 'draft'
  | 'sending'
  | 'streaming'
  | 'sent'
  | 'error';

export type AssistantToolStatus = 'queued' | 'running' | 'complete' | 'error';

export interface AssistantTextPart {
  type: 'text' | 'markdown';
  content: string;
  streaming?: boolean;
}

export interface AssistantToolStatusPart {
  type: 'tool-status';
  name: string;
  status: AssistantToolStatus;
  summary?: ReactNode;
  input?: ReactNode;
  output?: ReactNode;
  meta?: ReactNode;
}

export interface AssistantArtifactPart {
  type: 'artifact';
  title?: ReactNode;
  content: ReactNode;
  meta?: ReactNode;
}

export interface AssistantAttachmentsPart {
  type: 'attachments';
  content: ReactNode;
}

export type AssistantMessagePart =
  | AssistantTextPart
  | AssistantToolStatusPart
  | AssistantArtifactPart
  | AssistantAttachmentsPart;

export interface AssistantStatusBadgeProps {
  label: ReactNode;
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info';
}

export interface StreamingTextProps {
  text: string;
  streaming?: boolean;
  as?: 'text' | 'markdown';
}

export interface TypingIndicatorProps {
  label?: ReactNode;
}

export interface ToolCallCardProps {
  name: ReactNode;
  status: AssistantToolStatus;
  summary?: ReactNode;
  input?: ReactNode;
  output?: ReactNode;
  meta?: ReactNode;
}

export interface MessageBubbleProps {
  author: ReactNode;
  parts: AssistantMessagePart[];
  avatar?: ReactNode;
  timestamp?: ReactNode;
  meta?: ReactNode;
  status?: ReactNode;
  align?: 'start' | 'end';
  role?: AssistantMessageRole;
  deliveryStatus?: AssistantDeliveryStatus;
  renderPart?: (part: AssistantMessagePart, index: number) => ReactNode;
}
