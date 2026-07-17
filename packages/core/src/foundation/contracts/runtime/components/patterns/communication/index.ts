import type { ReactNode } from 'react';

/** Role of a message within an assistant conversation thread. */
export type AssistantMessageRole = 'assistant' | 'user' | 'system' | 'tool';

/** Lifecycle status of an assistant message. */
export type AssistantDeliveryStatus =
  | 'draft'
  | 'sending'
  | 'streaming'
  | 'sent'
  | 'error';

/** Execution status of an assistant tool call. */
export type AssistantToolStatus = 'queued' | 'running' | 'complete' | 'error';

/** Live activity state exposed by an assistant or agent. */
export type AssistantAgentStatus =
  | 'idle'
  | 'thinking'
  | 'streaming'
  | 'acting'
  | 'error';

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
  duration?: ReactNode;
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

/** Canonical discriminated union for assistant message content. */
export type AssistantMessagePart =
  | AssistantTextPart
  | AssistantToolStatusPart
  | AssistantArtifactPart
  | AssistantAttachmentsPart;

/** Domain-extensible base shape for a live-feed item. */
export interface FeedItem {
  key: string;
  isNew?: boolean;
  timestamp?: string | Date;
  [key: string]: unknown;
}
