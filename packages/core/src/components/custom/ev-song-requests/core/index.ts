/**
 * EvSongRequests - Core Interface
 * Song request queue with voting
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type EvSongRequestsPreset = 'queue' | 'voting';

export interface SongRequestItem {
  id: string;
  songTitle: string;
  artist: string;
  requesterName: string;
  votes: number;
  status: "pending" | "accepted" | "playing" | "rejected";
  requestedAt: Date;
  tipAmount?: number;
}

export interface EvSongRequestsProps extends EngineAwareProps {
  preset?: EvSongRequestsPreset;
  requests?: SongRequestItem[];
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onVote?: (id: string) => void;
  onSearch?: (query: string) => void;
  className?: string;
  style?: CSSProperties;
}

export const EV_SONG_REQUESTS_DEFAULTS: Partial<EvSongRequestsProps> = {
  preset: 'queue',

};
