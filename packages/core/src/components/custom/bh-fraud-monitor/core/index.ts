/**
 * BhFraudMonitor - Core Interface
 * DB Reference: DBInterview from @rottay/recruiter
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';
import type { DBInterview } from '@rottay/recruiter';

export type BhFraudMonitorPreset = 'dashboard' | 'compact';

/** Re-export for consumer convenience */
export type { DBInterview };

export type EventSeverity = 'critical' | 'high' | 'medium' | 'low';
export type EventType = 'tab_switch' | 'copy_paste' | 'screen_share' | 'browser_resize' | 'focus_loss' | 'suspicious_timing' | 'similarity_flag';
export type ReviewStatus = 'pending' | 'dismissed' | 'flagged' | 'escalated';

export interface ProctoringEvent {
  id: string;
  type: EventType;
  severity: EventSeverity;
  timestamp: string;
  description: string;
  scorableId: string;
  candidateName?: string;
  reviewStatus: ReviewStatus;
  metadata?: Record<string, string | number>;
}

export interface SimilarityCheck {
  id: string;
  scorableId: string;
  candidateName: string;
  similarityScore: number;
  comparedWith: string;
  flagged: boolean;
  timestamp: string;
}

export interface FraudStats {
  totalEvents: number;
  criticalCount: number;
  pendingReview: number;
  flaggedScorables: number;
}

export interface BhFraudMonitorProps extends EngineAwareProps {
  preset?: BhFraudMonitorPreset;
  events: ProctoringEvent[];
  similarityChecks?: SimilarityCheck[];
  stats?: FraudStats;
  selectedEventId?: string;
  onEventSelect?: (eventId: string) => void;
  onReviewAction?: (eventId: string, status: ReviewStatus) => void;
  severityFilter?: EventSeverity[];
  onSeverityFilterChange?: (severities: EventSeverity[]) => void;
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const BH_FRAUD_MONITOR_DEFAULTS: Partial<BhFraudMonitorProps> = {
  preset: 'dashboard',
};

export function getSeverityColors(tokens: DesignTokens) {
  return {
    critical: { color: tokens.colors.errorScale[800], bgColor: tokens.colors.errorScale[50], border: tokens.colors.errorScale[200], dot: tokens.colors.errorScale[500] },
    high: { color: tokens.colors.errorScale[600], bgColor: tokens.colors.errorScale[50], border: tokens.colors.errorScale[200], dot: tokens.colors.errorScale[400] },
    medium: { color: tokens.colors.warningScale[700], bgColor: tokens.colors.warningScale[50], border: tokens.colors.warningScale[200], dot: tokens.colors.warningScale[500] },
    low: { color: tokens.colors.infoScale[700], bgColor: tokens.colors.infoScale[50], border: tokens.colors.infoScale[200], dot: tokens.colors.infoScale[500] },
  };
}

export function getReviewStatusColors(tokens: DesignTokens) {
  return {
    pending: { color: tokens.colors.warningScale[700], bgColor: tokens.colors.warningScale[50] },
    dismissed: { color: tokens.colors.neutral[600], bgColor: tokens.colors.neutral[100] },
    flagged: { color: tokens.colors.errorScale[700], bgColor: tokens.colors.errorScale[50] },
    escalated: { color: tokens.colors.errorScale[800], bgColor: tokens.colors.errorScale[50] },
  };
}

export function getEventTypeLabel(type: EventType): string {
  const labels: Record<EventType, string> = {
    tab_switch: 'Tab Switch',
    copy_paste: 'Copy/Paste',
    screen_share: 'Screen Share',
    browser_resize: 'Browser Resize',
    focus_loss: 'Focus Loss',
    suspicious_timing: 'Suspicious Timing',
    similarity_flag: 'Similarity Flag',
  };
  return labels[type];
}
