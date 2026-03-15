import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';

export type SecurityEventTimelinePreset = 'timeline' | 'feed' | 'table';

export type SecurityEventSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type SecurityEventCategory = 'authentication' | 'authorization' | 'data-access' | 'configuration' | 'network' | 'compliance' | 'threat';

export interface SecurityActor {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  role?: string;
}

export interface SecurityEvent {
  id: string;
  title: string;
  description?: string;
  severity: SecurityEventSeverity;
  category: SecurityEventCategory;
  actor?: SecurityActor;
  ipAddress?: string;
  location?: string;
  resource?: string;
  action: string;
  outcome: 'success' | 'failure' | 'blocked';
  timestamp: Date;
  metadata?: Record<string, string>;
}

export interface SecurityEventTimelineProps extends EngineAwareProps {
  preset?: SecurityEventTimelinePreset;
  events: SecurityEvent[];
  onEventClick?: (eventId: string) => void;
  onFilter?: (filters: { severity?: SecurityEventSeverity; category?: SecurityEventCategory }) => void;
  selectedEventId?: string;
  title?: string;
  subtitle?: string;
  loading?: boolean;
  maxEvents?: number;
  showFilters?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const SECURITY_EVENT_TIMELINE_DEFAULTS: Partial<SecurityEventTimelineProps> = {
  preset: 'timeline',
  title: 'Security Events',
  showFilters: true,
  maxEvents: 50,
};

export function getSeverityColors(tokens: DesignTokens) {
  return {
    critical: { bg: tokens.colors.errorScale[100], color: tokens.colors.errorScale[800], dot: tokens.colors.errorScale[600], border: tokens.colors.errorScale[300] },
    high: { bg: tokens.colors.errorScale[50], color: tokens.colors.errorScale[700], dot: tokens.colors.errorScale[500], border: tokens.colors.errorScale[200] },
    medium: { bg: tokens.colors.warningScale[50], color: tokens.colors.warningScale[700], dot: tokens.colors.warningScale[500], border: tokens.colors.warningScale[200] },
    low: { bg: tokens.colors.infoScale[50], color: tokens.colors.infoScale[700], dot: tokens.colors.infoScale[500], border: tokens.colors.infoScale[200] },
    info: { bg: tokens.colors.neutral[50], color: tokens.colors.neutral[600], dot: tokens.colors.neutral[400], border: tokens.colors.neutral[200] },
  };
}

export function getOutcomeColors(tokens: DesignTokens) {
  return {
    success: { bg: tokens.colors.successScale[50], color: tokens.colors.successScale[700] },
    failure: { bg: tokens.colors.errorScale[50], color: tokens.colors.errorScale[700] },
    blocked: { bg: tokens.colors.warningScale[50], color: tokens.colors.warningScale[700] },
  };
}

export function getCategoryLabel(category: SecurityEventCategory): string {
  const labels: Record<SecurityEventCategory, string> = {
    'authentication': 'Auth',
    'authorization': 'Access',
    'data-access': 'Data',
    'configuration': 'Config',
    'network': 'Network',
    'compliance': 'Compliance',
    'threat': 'Threat',
  };
  return labels[category];
}
