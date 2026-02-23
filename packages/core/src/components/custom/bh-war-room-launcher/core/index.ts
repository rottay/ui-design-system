/**
 * BhWarRoomLauncher - Core Interface
 * Small widget to quickly create/join a war room from other pages.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type BhWarRoomLauncherPreset = 'compact';

/**
 * A recent/active session for the launcher dropdown.
 */
export interface LauncherSession {
  id: string;
  title: string;
  jobTitle: string;
  status: 'scheduled' | 'active' | 'voting' | 'decided' | 'closed';
  participantCount: number;
  candidateCount: number;
}

export interface BhWarRoomLauncherProps extends EngineAwareProps {
  preset?: BhWarRoomLauncherPreset;

  /** Number of currently active war room sessions */
  activeSessionCount?: number;

  /** Recent/active sessions for quick access */
  recentSessions?: LauncherSession[];

  /** Callback to create a new war room */
  onCreateNew?: () => void;

  /** Callback to join/view an existing session */
  onJoinSession?: (sessionId: string) => void;

  /** Whether data is loading */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_WAR_ROOM_LAUNCHER_DEFAULTS: Partial<BhWarRoomLauncherProps> = {
  preset: 'compact',
};
