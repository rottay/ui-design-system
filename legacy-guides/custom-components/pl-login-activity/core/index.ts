/**
 * PlLoginActivity - Core Interface
 * Login Activity monitoring for Platform security
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type PlLoginActivityPreset = 'timeline' | 'map';

export type LoginResult = 'success' | 'failure' | 'blocked' | 'challenge';

export type LoginMethod = 'password' | 'sso' | 'passkey' | 'magic-link' | 'oauth';

export type DeviceType = 'desktop' | 'mobile' | 'tablet';

export interface LoginLocation {
  city: string;
  country: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface LoginDevice {
  type: DeviceType;
  os: string;
  browser: string;
}

export interface LoginEvent {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  result: LoginResult;
  method: LoginMethod;
  ip: string;
  location: LoginLocation;
  device: LoginDevice;
  timestamp: Date;
  failureReason?: string;
  riskScore: number;
  sessionId: string;
  isSuspicious: boolean;
}

export interface LoginActivityStats {
  totalLogins: number;
  successRate: number;
  failedAttempts: number;
  blockedAttempts: number;
  uniqueLocations: number;
  peakHour: string;
}

export interface PlLoginActivityProps extends EngineAwareProps {
  /** Preset to use */
  preset?: PlLoginActivityPreset;

  /** Login events to display */
  events: LoginEvent[];

  /** Summary statistics */
  stats?: LoginActivityStats;

  /** Filter by result type */
  resultFilter?: LoginResult | null;

  /** Callback when result filter changes */
  onResultFilterChange?: (result: LoginResult | null) => void;

  /** Date range filter */
  dateRange?: { from: Date; to: Date };

  /** Callback when date range changes */
  onDateRangeChange?: (range: { from: Date; to: Date }) => void;

  /** Callback when an event is clicked */
  onEventClick?: (eventId: string) => void;

  /** Text shown when no events match filters */
  emptyText?: string;

  /** Show only suspicious events */
  showSuspiciousOnly?: boolean;

  /** Callback when suspicious filter changes */
  onSuspiciousFilterChange?: (enabled: boolean) => void;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const PL_LOGIN_ACTIVITY_DEFAULTS: Partial<PlLoginActivityProps> = {
  preset: 'timeline',
  emptyText: 'No login activity found',
  showSuspiciousOnly: false,
};
