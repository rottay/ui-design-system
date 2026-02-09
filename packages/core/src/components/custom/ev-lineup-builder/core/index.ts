/**
 * EvLineupBuilder - Core Interface
 * Lineup/scheduling builder
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type EvLineupBuilderPreset = 'timeline' | 'list';

export interface ArtistSlot {
  id: string;
  artistName: string;
  artistImage?: string;
  genre: string;
  startTime: Date;
  endTime: Date;
  stageId: string;
  stageName: string;
  status: "confirmed" | "pending" | "cancelled";
}

export interface StageTrack {
  id: string;
  name: string;
  color: string;
}

export interface TimeConflict {
  slotAId: string;
  slotBId: string;
  message: string;
}

export interface EvLineupBuilderProps extends EngineAwareProps {
  preset?: EvLineupBuilderPreset;
  slots?: ArtistSlot[];
  stages?: StageTrack[];
  conflicts?: TimeConflict[];
  eventDate?: Date;
  onSlotClick?: (slotId: string) => void;
  onSlotMove?: (slotId: string, newStart: Date, newStageId: string) => void;
  className?: string;
  style?: CSSProperties;
}

export const EV_LINEUP_BUILDER_DEFAULTS: Partial<EvLineupBuilderProps> = {
  preset: 'timeline',

};
