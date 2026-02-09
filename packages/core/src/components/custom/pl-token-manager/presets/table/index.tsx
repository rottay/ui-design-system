'use client';

/**
 * PlTokenManager - Table Preset
 * Token management table with type badges, scopes, and actions
 */

import { useState, useCallback, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createEmptyStateStyle,
  createFilterPillStyle,
  formatDistanceToNow,
} from '../../../helpers';
import type { PlTokenManagerProps, AuthToken, TokenType, TokenStatus } from '../../core';
import { PL_TOKEN_MANAGER_DEFAULTS } from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  Key,
  User,
  Globe,
  RefreshCw,
  Shield,
  Copy,
  RotateCcw,
  Ban,
  Edit3,
  Plus,
  Filter,
  Check,
  Clock,
  AlertTriangle,
} from 'lucide-react';

// Type badge config
interface TypeConfig {
  icon: any;
  label: string;
  color: string;
  bgColor: string;
}

function getTypeConfig(type: TokenType, tokens: DesignTokens): TypeConfig {
  switch (type) {
    case 'api_key':
      return {
        icon: Key,
        label: 'API Key',
        color: tokens.colors.primaryScale[700],
        bgColor: tokens.colors.primaryScale[100],
      };
    case 'personal_access_token':
      return {
        icon: User,
        label: 'Personal',
        color: tokens.colors.infoScale[700],
        bgColor: tokens.colors.infoScale[100],
      };
    case 'oauth_token':
      return {
        icon: Globe,
        label: 'OAuth',
        color: tokens.colors.secondaryScale[700],
        bgColor: tokens.colors.secondaryScale[100],
      };
    case 'refresh_token':
      return {
        icon: RefreshCw,
        label: 'Refresh',
        color: tokens.colors.warningScale[700],
        bgColor: tokens.colors.warningScale[100],
      };
    case 'service_account':
      return {
        icon: Shield,
        label: 'Service',
        color: tokens.colors.successScale[700],
        bgColor: tokens.colors.successScale[100],
      };
  }
}

// Status badge config
function getStatusColor(status: TokenStatus, tokens: DesignTokens) {
  switch (status) {
    case 'active':
      return {
        color: tokens.colors.successScale[700],
        bgColor: tokens.colors.successScale[50],
        dotColor: tokens.colors.successScale[500],
      };
    case 'expired':
      return {
        color: tokens.colors.warningScale[700],
        bgColor: tokens.colors.warningScale[50],
        dotColor: tokens.colors.warningScale[500],
      };
    case 'revoked':
      return {
        color: tokens.colors.errorScale[700],
        bgColor: tokens.colors.errorScale[50],
        dotColor: tokens.colors.errorScale[500],
      };
  }
}

export const TablePlTokenManager = createPreset<PlTokenManagerProps>({
  name: 'PlTokenManager.Table',
  render: ({ primitives, props, tokens, engine }: PresetContext<PlTokenManagerProps>) => {
    const { Box, Stack } = primitives;
    const isModern = tokens.surface.useGlass;

    const {
      tokens: authTokens,
      onTokenClick,
      onCopyToken,
      onRegenerateToken,
      onRevokeToken,
      onEditScopes,
      onCreateToken,
      usageData = {},
      filterType,
      onFilterChange,
      filterStatus,
      onStatusFilterChange,
      emptyText = PL_TOKEN_MANAGER_DEFAULTS.emptyText,
      className,
      style,
    } = props;

    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [internalFilterType, setInternalFilterType] = useState<TokenType | null>(null);
    const [internalFilterStatus, setInternalFilterStatus] = useState<TokenStatus | null>(null);

    const activeFilterType = filterType !== undefined ? filterType : internalFilterType;
    const activeFilterStatus = filterStatus !== undefined ? filterStatus : internalFilterStatus;

    const handleFilterTypeChange = useCallback((type: TokenType | null) => {
      if (filterType === undefined) setInternalFilterType(type);
      onFilterChange?.(type);
    }, [filterType, onFilterChange]);

    const handleFilterStatusChange = useCallback((status: TokenStatus | null) => {
      if (filterStatus === undefined) setInternalFilterStatus(status);
      onStatusFilterChange?.(status);
    }, [filterStatus, onStatusFilterChange]);

    const handleCopy = useCallback((tokenId: string, token: string) => {
      setCopiedId(tokenId);
      onCopyToken?.(tokenId, token);
      setTimeout(() => setCopiedId(null), 2000);
    }, [onCopyToken]);

    // Filter tokens
    const filteredTokens = useMemo(() => {
      return authTokens.filter(t => {
        if (activeFilterType && t.type !== activeFilterType) return false;
        if (activeFilterStatus && t.status !== activeFilterStatus) return false;
        return true;
      });
    }, [authTokens, activeFilterType, activeFilterStatus]);

    // Stats
    const stats = useMemo(() => {
      const total = authTokens.length;
      const active = authTokens.filter(t => t.status === 'active').length;
      const expiringThisWeek = authTokens.filter(t => {
        if (!t.expiresAt || t.status !== 'active') return false;
        const daysUntilExpiry = Math.ceil((t.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
      }).length;
      const usageToday = authTokens.reduce((sum, t) => {
        const todayData = usageData[t.id]?.[usageData[t.id].length - 1];
        return sum + (todayData?.count || 0);
      }, 0);
      return { total, active, expiringThisWeek, usageToday };
    }, [authTokens, usageData]);

    // Check if expiring soon
    const isExpiringSoon = (expiresAt?: Date): boolean => {
      if (!expiresAt) return false;
      const daysUntilExpiry = Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
    };

    const cardStyle = useMemo(() => createCardStyle(tokens, {
      elevation: 'sm',
      glass: isModern,
    }), [tokens, isModern]);

    return (
      <div
        className={className}
        style={{
          padding: tokens.spacing[6],
          backgroundColor: tokens.colors.neutral[50],
          minHeight: '100%',
          fontFamily: 'inherit',
          ...style,
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: tokens.spacing[6],
        }}>
          <div>
            <h1 style={{
              fontSize: tokens.typography.fontSize['2xl'],
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
              margin: 0,
              lineHeight: tokens.typography.lineHeight.tight,
            }}>
              Authentication Tokens
            </h1>
            <p style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[500],
              margin: 0,
              marginTop: tokens.spacing[1],
            }}>
              Manage API keys, personal access tokens, and service account credentials
            </p>
          </div>
          {onCreateToken && (
            <button
              onClick={onCreateToken}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
                padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                borderRadius: tokens.borderRadius.md,
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                backgroundColor: tokens.colors.primaryScale[600],
                color: tokens.colors.common.white,
                border: 'none',
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
                boxShadow: tokens.shadows.sm,
                outline: 'none',
              }}
            >
              <Plus size={16} />
              Create Token
            </button>
          )}
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: tokens.spacing[4],
          marginBottom: tokens.spacing[6],
        }}>
          {[
            { label: 'Total Tokens', value: stats.total, color: tokens.colors.primaryScale },
            { label: 'Active', value: stats.active, color: tokens.colors.successScale },
            { label: 'Expiring This Week', value: stats.expiringThisWeek, color: tokens.colors.warningScale },
            { label: 'Usage Today', value: stats.usageToday, color: tokens.colors.infoScale },
          ].map((stat, idx) => (
            <div
              key={idx}
              style={{
                ...cardStyle,
                padding: tokens.spacing[4],
              }}
            >
              <div style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[500],
                marginBottom: tokens.spacing[1],
              }}>
                {stat.label}
              </div>
              <div style={{
                fontSize: tokens.typography.fontSize['2xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: stat.color[600],
              }}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing[3],
          marginBottom: tokens.spacing[4],
          flexWrap: 'wrap' as const,
        }}>
          <Filter size={14} color={tokens.colors.neutral[400]} />
          <span style={{
            fontSize: tokens.typography.fontSize.xs,
            color: tokens.colors.neutral[500],
            fontWeight: tokens.typography.fontWeight.medium,
          }}>
            Type:
          </span>
          {([null, 'api_key', 'personal_access_token', 'oauth_token', 'refresh_token', 'service_account'] as (TokenType | null)[]).map(type => {
            const isActive = activeFilterType === type;
            const cfg = type ? getTypeConfig(type, tokens) : null;
            return (
              <button
                key={type ?? 'all'}
                onClick={() => handleFilterTypeChange(type)}
                style={{
                  ...createFilterPillStyle(tokens, { active: isActive }),
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  outline: 'none',
                }}
              >
                {cfg && <cfg.icon size={12} />}
                {type === null ? 'All' : cfg!.label}
              </button>
            );
          })}

          <div style={{ width: 1, height: 16, backgroundColor: tokens.colors.neutral[300], marginLeft: tokens.spacing[2], marginRight: tokens.spacing[2] }} />

          <span style={{
            fontSize: tokens.typography.fontSize.xs,
            color: tokens.colors.neutral[500],
            fontWeight: tokens.typography.fontWeight.medium,
          }}>
            Status:
          </span>
          {([null, 'active', 'expired', 'revoked'] as (TokenStatus | null)[]).map(status => {
            const isActive = activeFilterStatus === status;
            return (
              <button
                key={status ?? 'all'}
                onClick={() => handleFilterStatusChange(status)}
                style={{
                  ...createFilterPillStyle(tokens, { active: isActive }),
                  outline: 'none',
                }}
              >
                {status === null ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            );
          })}
        </div>

        {/* Table */}
        {filteredTokens.length === 0 ? (
          <div style={{
            ...createEmptyStateStyle(tokens),
            ...cardStyle,
            padding: `${tokens.spacing[12]}px ${tokens.spacing[6]}px`,
          }}>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: tokens.borderRadius.full,
              backgroundColor: tokens.colors.primaryScale[50],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: tokens.spacing[4],
            }}>
              <Key size={28} color={tokens.colors.primaryScale[400]} />
            </div>
            <div style={{
              fontSize: tokens.typography.fontSize.lg,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[800],
              marginBottom: tokens.spacing[2],
            }}>
              {emptyText}
            </div>
            <div style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[500],
              marginBottom: tokens.spacing[6],
            }}>
              Create your first authentication token to get started
            </div>
            {onCreateToken && (
              <button
                onClick={onCreateToken}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[5]}px`,
                  borderRadius: tokens.borderRadius.md,
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  backgroundColor: tokens.colors.primaryScale[600],
                  color: tokens.colors.common.white,
                  border: 'none',
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  boxShadow: tokens.shadows.sm,
                  outline: 'none',
                }}
              >
                <Plus size={16} />
                Create Token
              </button>
            )}
          </div>
        ) : (
          <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' as const }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
              <thead>
                <tr style={{ backgroundColor: tokens.colors.neutral[50] }}>
                  <th style={{
                    padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                    textAlign: 'left' as const,
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[500],
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.05em',
                    borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  }}>
                    Name
                  </th>
                  <th style={{
                    padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                    textAlign: 'left' as const,
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[500],
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.05em',
                    borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  }}>
                    Type
                  </th>
                  <th style={{
                    padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                    textAlign: 'left' as const,
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[500],
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.05em',
                    borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  }}>
                    Token
                  </th>
                  <th style={{
                    padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                    textAlign: 'left' as const,
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[500],
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.05em',
                    borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  }}>
                    Scopes
                  </th>
                  <th style={{
                    padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                    textAlign: 'left' as const,
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[500],
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.05em',
                    borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  }}>
                    Status
                  </th>
                  <th style={{
                    padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                    textAlign: 'left' as const,
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[500],
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.05em',
                    borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  }}>
                    Expires
                  </th>
                  <th style={{
                    padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                    textAlign: 'left' as const,
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[500],
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.05em',
                    borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  }}>
                    Last Used
                  </th>
                  <th style={{
                    padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                    textAlign: 'right' as const,
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[500],
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.05em',
                    borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTokens.map((token, idx) => {
                  const typeCfg = getTypeConfig(token.type, tokens);
                  const statusCfg = getStatusColor(token.status, tokens);
                  const isHovered = hoveredId === token.id;
                  const isCopied = copiedId === token.id;
                  const Icon = typeCfg.icon;

                  return (
                    <tr
                      key={token.id}
                      onMouseEnter={() => setHoveredId(token.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      style={{
                        backgroundColor: isHovered ? tokens.colors.neutral[50] : tokens.colors.common.white,
                        transition: `all ${tokens.motion.hover}`,
                      }}
                    >
                      <td style={{
                        padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.medium,
                        color: tokens.colors.neutral[900],
                        borderBottom: idx < filteredTokens.length - 1 ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` : 'none',
                      }}>
                        <div>
                          {token.name}
                        </div>
                        {token.description && (
                          <div style={{
                            fontSize: tokens.typography.fontSize.xs,
                            color: tokens.colors.neutral[500],
                            marginTop: 2,
                          }}>
                            {token.description}
                          </div>
                        )}
                      </td>
                      <td style={{
                        padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                        borderBottom: idx < filteredTokens.length - 1 ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` : 'none',
                      }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: tokens.spacing[1],
                          padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                          borderRadius: tokens.borderRadius.full,
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: tokens.typography.fontWeight.medium,
                          backgroundColor: typeCfg.bgColor,
                          color: typeCfg.color,
                        }}>
                          <Icon size={12} />
                          {typeCfg.label}
                        </span>
                      </td>
                      <td style={{
                        padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.neutral[700],
                        borderBottom: idx < filteredTokens.length - 1 ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` : 'none',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                          <code style={{
                            fontSize: tokens.typography.fontSize.xs,
                            fontFamily: 'monospace',
                            color: tokens.colors.neutral[600],
                          }}>
                            {token.token}
                          </code>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(token.id, token.token);
                            }}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 24,
                              height: 24,
                              borderRadius: tokens.borderRadius.sm,
                              border: 'none',
                              backgroundColor: 'transparent',
                              color: isCopied ? tokens.colors.successScale[600] : tokens.colors.neutral[400],
                              cursor: 'pointer',
                              transition: `all ${tokens.motion.hover}`,
                              outline: 'none',
                            }}
                            title="Copy token"
                          >
                            {isCopied ? <Check size={14} /> : <Copy size={14} />}
                          </button>
                        </div>
                      </td>
                      <td style={{
                        padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.neutral[700],
                        borderBottom: idx < filteredTokens.length - 1 ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` : 'none',
                      }}>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' as const }}>
                          {token.scopes.slice(0, 3).map((scope, i) => (
                            <span
                              key={i}
                              style={{
                                padding: `2px ${tokens.spacing[2]}px`,
                                borderRadius: tokens.borderRadius.sm,
                                fontSize: '10px',
                                fontWeight: tokens.typography.fontWeight.medium,
                                backgroundColor: tokens.colors.neutral[100],
                                color: tokens.colors.neutral[600],
                              }}
                            >
                              {scope}
                            </span>
                          ))}
                          {token.scopes.length > 3 && (
                            <span style={{
                              fontSize: '10px',
                              color: tokens.colors.neutral[500],
                              alignSelf: 'center',
                            }}>
                              +{token.scopes.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{
                        padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                        borderBottom: idx < filteredTokens.length - 1 ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` : 'none',
                      }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: tokens.spacing[1],
                          padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                          borderRadius: tokens.borderRadius.full,
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: tokens.typography.fontWeight.medium,
                          backgroundColor: statusCfg.bgColor,
                          color: statusCfg.color,
                        }}>
                          <span style={{
                            width: 6,
                            height: 6,
                            borderRadius: tokens.borderRadius.full,
                            backgroundColor: statusCfg.dotColor,
                          }} />
                          {token.status.charAt(0).toUpperCase() + token.status.slice(1)}
                        </span>
                      </td>
                      <td style={{
                        padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                        fontSize: tokens.typography.fontSize.sm,
                        color: isExpiringSoon(token.expiresAt) ? tokens.colors.warningScale[600] : tokens.colors.neutral[700],
                        borderBottom: idx < filteredTokens.length - 1 ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` : 'none',
                      }}>
                        {token.expiresAt ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                            {isExpiringSoon(token.expiresAt) && <AlertTriangle size={12} />}
                            {formatDistanceToNow(token.expiresAt, { addSuffix: true })}
                          </div>
                        ) : (
                          <span style={{ color: tokens.colors.neutral[400] }}>Never</span>
                        )}
                      </td>
                      <td style={{
                        padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.neutral[600],
                        borderBottom: idx < filteredTokens.length - 1 ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` : 'none',
                      }}>
                        {token.lastUsed ? (
                          <div>
                            <div>{formatDistanceToNow(token.lastUsed, { addSuffix: true })}</div>
                            <div style={{
                              fontSize: tokens.typography.fontSize.xs,
                              color: tokens.colors.neutral[500],
                              marginTop: 2,
                            }}>
                              {token.usageCount.toLocaleString()} uses
                            </div>
                          </div>
                        ) : (
                          <span style={{ color: tokens.colors.neutral[400] }}>Never used</span>
                        )}
                      </td>
                      <td style={{
                        padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                        textAlign: 'right' as const,
                        borderBottom: idx < filteredTokens.length - 1 ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` : 'none',
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          gap: tokens.spacing[1],
                          opacity: isHovered ? 1 : 0,
                          transition: `opacity ${tokens.motion.hover}`,
                        }}>
                          {onRegenerateToken && token.status === 'active' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onRegenerateToken(token.id);
                              }}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 28,
                                height: 28,
                                borderRadius: tokens.borderRadius.md,
                                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                                backgroundColor: tokens.colors.common.white,
                                color: tokens.colors.neutral[600],
                                cursor: 'pointer',
                                transition: `all ${tokens.motion.hover}`,
                                outline: 'none',
                              }}
                              title="Regenerate"
                            >
                              <RotateCcw size={14} />
                            </button>
                          )}
                          {onEditScopes && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditScopes(token.id);
                              }}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 28,
                                height: 28,
                                borderRadius: tokens.borderRadius.md,
                                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                                backgroundColor: tokens.colors.common.white,
                                color: tokens.colors.neutral[600],
                                cursor: 'pointer',
                                transition: `all ${tokens.motion.hover}`,
                                outline: 'none',
                              }}
                              title="Edit scopes"
                            >
                              <Edit3 size={14} />
                            </button>
                          )}
                          {onRevokeToken && token.status === 'active' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onRevokeToken(token.id);
                              }}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 28,
                                height: 28,
                                borderRadius: tokens.borderRadius.md,
                                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.errorScale[200]}`,
                                backgroundColor: tokens.colors.common.white,
                                color: tokens.colors.errorScale[600],
                                cursor: 'pointer',
                                transition: `all ${tokens.motion.hover}`,
                                outline: 'none',
                              }}
                              title="Revoke"
                            >
                              <Ban size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  },
});
