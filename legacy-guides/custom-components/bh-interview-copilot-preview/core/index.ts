/**
 * BhInterviewCopilotPreview - Core Interface
 * Dashboard widget showing interviewer copilot stats at a glance.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import { n } from '../../helpers';

// =============================================================================
// PRESET TYPE
// =============================================================================

export type BhInterviewCopilotPreviewPreset = 'compact';

// =============================================================================
// DATA TYPES
// =============================================================================

/** Summary of a recent copilot session */
export interface RecentCopilotSession {
  id: string;
  interviewId: string;
  interviewTitle?: string;
  candidateName?: string;
  date: Date | string;
  effectiveness: number;
  whisperCount: number;
}

/** Average talk time data for trend display */
export interface TalkTimeAverage {
  interviewerPercent: number;
  candidatePercent: number;
  silencePercent: number;
  trend: number; // positive = improving, negative = worsening
}

// =============================================================================
// COMPONENT PROPS
// =============================================================================

export interface BhInterviewCopilotPreviewProps extends EngineAwareProps {
  preset?: BhInterviewCopilotPreviewPreset;

  /** Recent copilot sessions */
  recentSessions?: RecentCopilotSession[];

  /** Average effectiveness score across sessions */
  avgEffectiveness?: number;

  /** Average talk time data */
  talkTimeAvg?: TalkTimeAverage;

  /** Total sessions completed */
  totalSessions?: number;

  /** Callback when "View All" is clicked */
  onViewAll?: () => void;

  /** Callback when a session is clicked */
  onSessionClick?: (sessionId: string) => void;

  /** Loading state */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

// =============================================================================
// DEFAULTS
// =============================================================================

export const BH_INTERVIEW_COPILOT_PREVIEW_DEFAULTS: Partial<BhInterviewCopilotPreviewProps> = {
  preset: 'compact',
};

/** Re-export n helper for convenience */
export { n };
