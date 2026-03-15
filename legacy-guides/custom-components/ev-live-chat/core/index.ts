/**
 * EvLiveChat - Core Interface
 * Live event chat
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type EvLiveChatPreset = 'standard' | 'compact';

export interface LiveMessage {
  id: string;
  author: string;
  authorAvatar?: string;
  message: string;
  time: Date;
  isPinned: boolean;
  isHighlighted: boolean;
  reactions: Array<{ emoji: string;
  count: number }>;
}

export interface EvLiveChatProps extends EngineAwareProps {
  preset?: EvLiveChatPreset;
  messages?: LiveMessage[];
  pinnedMessage?: LiveMessage;
  onSend?: (message: string) => void;
  onPin?: (messageId: string) => void;
  onReact?: (messageId: string, emoji: string) => void;
  onDelete?: (messageId: string) => void;
  className?: string;
  style?: CSSProperties;
}

export const EV_LIVE_CHAT_DEFAULTS: Partial<EvLiveChatProps> = {
  preset: 'standard',

};
