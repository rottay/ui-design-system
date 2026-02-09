/**
 * EvLiveSession - Core Interface
 * Live DJ session control panel
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type EvLiveSessionPreset = 'performer' | 'audience';

export interface SessionInfo {
  id: string;
  djName: string;
  djImage?: string;
  eventName: string;
  stageName: string;
  startTime: Date;
  endTime: Date;
  status: "upcoming" | "live" | "ended";
  viewerCount: number;
}

export interface ChatMessage {
  id: string;
  author: string;
  message: string;
  time: Date;
  isHighlighted: boolean;
}

export interface SongRequest {
  id: string;
  songTitle: string;
  artist: string;
  requesterName: string;
  votes: number;
  status: "pending" | "accepted" | "playing" | "rejected";
}

export interface TipNotification {
  id: string;
  from: string;
  amount: number;
  currency: string;
  message?: string;
  time: Date;
}

export interface EvLiveSessionProps extends EngineAwareProps {
  preset?: EvLiveSessionPreset;
  session?: SessionInfo;
  chatMessages?: ChatMessage[];
  songRequests?: SongRequest[];
  recentTips?: TipNotification[];
  onSendMessage?: (message: string) => void;
  onAcceptRequest?: (requestId: string) => void;
  onRejectRequest?: (requestId: string) => void;
  className?: string;
  style?: CSSProperties;
}

export const EV_LIVE_SESSION_DEFAULTS: Partial<EvLiveSessionProps> = {
  preset: 'performer',

};
