import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type RunsheetPreset = 'producer' | 'display';

export interface RunsheetCue {
  id: string;
  scheduledTime: string;
  actualTime?: string;
  title: string;
  description?: string;
  department: string;
  status: 'upcoming' | 'standby' | 'go' | 'done' | 'skipped';
  delayMinutes: number;
  notes?: string;
}

export interface RunsheetProps extends EngineAwareProps {
  preset?: RunsheetPreset;
  cues?: RunsheetCue[];
  eventName?: string;
  onMarkGo?: (cueId: string) => void;
  onAddDelay?: (cueId: string, minutes: number) => void;
  onSkip?: (cueId: string) => void;
  currentCueId?: string;
  style?: CSSProperties;
  className?: string;
}

export const RUNSHEET_DEFAULTS: Required<
  Pick<RunsheetProps, 'preset' | 'cues'>
> = {
  preset: 'producer',
  cues: [],
};
