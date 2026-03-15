import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';

export type SessionManagerPreset = 'table' | 'cards' | 'timeline';

export type SessionStatus = 'active' | 'expired' | 'revoked';

export interface SessionDevice {
  type: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  browser?: string;
  os?: string;
}

export interface Session {
  id: string;
  userId: string;
  device: SessionDevice;
  ipAddress: string;
  location?: string;
  startedAt: Date;
  lastActiveAt: Date;
  expiresAt: Date;
  status: SessionStatus;
  isCurrent?: boolean;
  userAgent?: string;
}

export interface SessionManagerProps extends EngineAwareProps {
  preset?: SessionManagerPreset;
  sessions: Session[];
  onRevoke?: (sessionId: string) => void;
  onRevokeAll?: () => void;
  currentSessionId?: string;
  title?: string;
  subtitle?: string;
  loading?: boolean;
  showLocation?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const SESSION_MANAGER_DEFAULTS: Partial<SessionManagerProps> = {
  preset: 'table',
  title: 'Active Sessions',
  showLocation: true,
};

export function getSessionStatusColors(tokens: DesignTokens) {
  return {
    active: {
      bg: tokens.colors.successScale[50],
      color: tokens.colors.successScale[700],
      dot: tokens.colors.successScale[500],
    },
    expired: {
      bg: tokens.colors.neutral[100],
      color: tokens.colors.neutral[500],
      dot: tokens.colors.neutral[400],
    },
    revoked: {
      bg: tokens.colors.errorScale[50],
      color: tokens.colors.errorScale[700],
      dot: tokens.colors.errorScale[500],
    },
  };
}

export function getDeviceIcon(type: SessionDevice['type']): string {
  switch (type) {
    case 'desktop': return '🖥';
    case 'mobile': return '📱';
    case 'tablet': return '📟';
    default: return '💻';
  }
}

export function formatSessionDuration(startedAt: Date): string {
  const ms = Date.now() - startedAt.getTime();
  const hours = Math.floor(ms / 3600000);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h`;
  const minutes = Math.floor(ms / 60000);
  return `${minutes}m`;
}
