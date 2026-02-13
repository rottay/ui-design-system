/**
 * BhProctoringAlert - Core Interface
 * Fixed/sticky banner or toast for critical proctoring events
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';

export type BhProctoringAlertPreset = 'banner' | 'toast';

export type ProctoringEventType =
  | 'tab_switch'
  | 'copy_paste'
  | 'screen_share'
  | 'unusual_typing'
  | 'browser_focus_lost';

export type ProctoringEventSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ProctoringAlertEvent {
  id: string;
  candidateName: string;
  eventType: ProctoringEventType;
  severity: ProctoringEventSeverity;
  timestamp: Date;
  summary: string;
}

export type AlertVariant = 'banner' | 'toast';

export interface BhProctoringAlertProps extends EngineAwareProps {
  preset?: BhProctoringAlertPreset;

  /** Event triggering the alert */
  event: ProctoringAlertEvent;

  /** Callback to review the event */
  onReview?: (eventId: string) => void;

  /** Callback to dismiss the event */
  onDismiss?: (eventId: string) => void;

  /** Callback to close the alert */
  onClose?: () => void;

  /** Visual variant */
  variant?: AlertVariant;

  /** Loading state */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_PROCTORING_ALERT_DEFAULTS: Partial<BhProctoringAlertProps> = {
  preset: 'banner',
  variant: 'banner',
};
