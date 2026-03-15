/**
 * PlTokenManager - Core Interface
 * Authentication token management for Platform Login
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type PlTokenManagerPreset = 'table' | 'cards';

export type TokenType = 'api_key' | 'personal_access_token' | 'oauth_token' | 'refresh_token' | 'service_account';

export type TokenStatus = 'active' | 'expired' | 'revoked';

export interface AuthToken {
  id: string;
  name: string;
  type: TokenType;
  status: TokenStatus;
  token: string; // Masked string like "sk_live_...a3f4"
  scopes: string[];
  createdBy: {
    id: string;
    name: string;
  };
  createdAt: Date;
  expiresAt?: Date;
  lastUsed?: Date;
  usageCount: number;
  ipRestrictions?: string[];
  rateLimit?: number;
  description?: string;
}

export interface TokenUsageData {
  date: string;
  count: number;
}

export interface PlTokenManagerProps extends EngineAwareProps {
  /** Preset to use */
  preset?: PlTokenManagerPreset;

  /** List of authentication tokens */
  tokens: AuthToken[];

  /** Callback when a token is clicked */
  onTokenClick?: (tokenId: string) => void;

  /** Callback when token copy button is clicked */
  onCopyToken?: (tokenId: string, token: string) => void;

  /** Callback when regenerate button is clicked */
  onRegenerateToken?: (tokenId: string) => void;

  /** Callback when revoke button is clicked */
  onRevokeToken?: (tokenId: string) => void;

  /** Callback when edit scopes is clicked */
  onEditScopes?: (tokenId: string) => void;

  /** Callback when create token button is clicked */
  onCreateToken?: () => void;

  /** Token usage data for sparklines (last 7 days) */
  usageData?: Record<string, TokenUsageData[]>;

  /** Filter by token type */
  filterType?: TokenType | null;

  /** Callback when filter changes */
  onFilterChange?: (type: TokenType | null) => void;

  /** Filter by status */
  filterStatus?: TokenStatus | null;

  /** Callback when status filter changes */
  onStatusFilterChange?: (status: TokenStatus | null) => void;

  /** Text shown when no tokens exist */
  emptyText?: string;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const PL_TOKEN_MANAGER_DEFAULTS: Partial<PlTokenManagerProps> = {
  preset: 'table',
  emptyText: 'No authentication tokens found',
};
