/**
 * EvRadioChannel - Core Interface
 * Digital walkie-talkie with multi-channel communication and quick responses
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type EvRadioChannelPreset = 'dispatcher' | 'personal';

export interface RadioChannel {
  id: string;
  name: string;
  type: 'security' | 'medical' | 'bar' | 'stage' | 'vip' | 'general';
  activeUsers: number;
  unreadCount: number;
  priority: 'normal' | 'high' | 'emergency';
}

export interface RadioMessage {
  id: string;
  channelId: string;
  sender: string;
  senderRole: string;
  message: string;
  timestamp: Date;
  type: 'text' | 'alert' | 'acknowledgment';
  priority: 'normal' | 'urgent';
}

export interface EvRadioChannelProps extends EngineAwareProps {
  preset?: EvRadioChannelPreset;
  channels?: RadioChannel[];
  messages?: RadioMessage[];
  activeChannelId?: string;
  currentUser?: string;
  onSendMessage?: (channelId: string, message: string) => void;
  onChannelSwitch?: (channelId: string) => void;
  onQuickResponse?: (channelId: string, response: string) => void;
  className?: string;
  style?: CSSProperties;
}

export const EV_RADIO_CHANNEL_DEFAULTS: Partial<EvRadioChannelProps> = {
  preset: 'dispatcher',
};
