/**
 * PlSessionManager - Core Interface
 * Session management screen showing active user sessions across devices and locations
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type PlSessionManagerPreset = 'table' | 'cards';

export type SessionStatus = 'active' | 'expired' | 'revoked' | 'suspicious';

export type RiskLevel = 'low' | 'medium' | 'high';

export type DeviceType = 'desktop' | 'mobile' | 'tablet';

export interface DeviceInfo {
  type: DeviceType;
  name: string;
  os: string;
  browser: string;
  version: string;
}

export interface LocationInfo {
  city: string;
  country: string;
  countryCode: string;
  lat?: number;
  lng?: number;
}

export interface SessionItem {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  device: DeviceInfo;
  ip: string;
  location: LocationInfo;
  status: SessionStatus;
  createdAt: Date;
  lastActive: Date;
  expiresAt: Date;
  isCurrent: boolean;
  riskLevel: RiskLevel;
  fingerprint: string;
}

export interface SessionStats {
  total: number;
  active: number;
  suspicious: number;
  expired: number;
}

export interface PlSessionManagerProps extends EngineAwareProps {
  /** Preset to use */
  preset?: PlSessionManagerPreset;

  /** Session items to display */
  sessions: SessionItem[];

  /** Summary statistics for the stats bar */
  stats?: SessionStats;

  /** Callback when a session is clicked */
  onSessionClick?: (sessionId: string) => void;

  /** Callback when revoke button is clicked for a session */
  onRevokeSession?: (sessionId: string) => void;

  /** Callback when "Revoke All Others" button is clicked */
  onRevokeAllOthers?: () => void;

  /** Currently selected session IDs (for bulk actions) */
  selectedSessions?: string[];

  /** Callback when selection changes */
  onSelectionChange?: (sessionIds: string[]) => void;

  /** Callback when bulk revoke is triggered */
  onBulkRevoke?: (sessionIds: string[]) => void;

  /** Current filter by status */
  statusFilter?: SessionStatus | null;

  /** Callback when status filter changes */
  onStatusFilterChange?: (status: SessionStatus | null) => void;

  /** Current sort field */
  sortBy?: 'lastActive' | 'createdAt' | 'riskLevel';

  /** Current sort direction */
  sortDirection?: 'asc' | 'desc';

  /** Callback when sort changes */
  onSortChange?: (field: string, direction: 'asc' | 'desc') => void;

  /** Search query */
  searchQuery?: string;

  /** Callback when search query changes */
  onSearchChange?: (query: string) => void;

  /** Text shown when no sessions match filters */
  emptyText?: string;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const PL_SESSION_MANAGER_DEFAULTS: Partial<PlSessionManagerProps> = {
  preset: 'table',
  emptyText: 'No sessions found',
  sortBy: 'lastActive',
  sortDirection: 'desc',
};
