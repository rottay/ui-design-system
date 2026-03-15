'use client';

/**
 * PlTokenManager - Cards Preset
 * Card grid with usage sparklines, scope pills, and quick actions
 */

import { useState, useCallback, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createEmptyStateStyle,
  formatDistanceToNow,
} from '../../../helpers';
import type { PlTokenManagerProps, AuthToken, TokenType } from '../../core';
import { PL_TOKEN_MANAGER_DEFAULTS } from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  Key,
  User,
  Globe,
  RefreshCw,
  Shield,
  Copy,
  MoreVertical,
  Plus,
  Check,
  Clock,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';

// Type icon mapping
function getTypeIcon(type: TokenType, tokens: DesignTokens) {
  switch (type) {
    case 'api_key':
      return { Icon: Key, color: tokens.colors.primaryScale[600], bgColor: tokens.colors.primaryScale[50] };
    case 'personal_access_token':
      return { Icon: User, color: tokens.colors.infoScale[600], bgColor: tokens.colors.infoScale[50] };
    case 'oauth_token':
      return { Icon: Globe, color: tokens.colors.secondaryScale[600], bgColor: tokens.colors.secondaryScale[50] };
    case 'refresh_token':
      return { Icon: RefreshCw, color: tokens.colors.warningScale[600], bgColor: tokens.colors.warningScale[50] };
    case 'service_account':
      return { Icon: Shield, color: tokens.colors.successScale[600], bgColor: tokens.colors.successScale[50] };
  }
}

// Simple sparkline component
function Sparkline({ data, color, width = 80, height = 24 }: {
  data: number[];
  color: string;
  width?: number;
  height?: number;
}) {
  if (data.length === 0) return null;

  const max = Math.max(...data, 1);
  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * width;
    const y = height - (val / max) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export const CardsPlTokenManager = createPreset<PlTokenManagerProps>({
  name: 'PlTokenManager.Cards',
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
      emptyText = PL_TOKEN_MANAGER_DEFAULTS.emptyText,
      className,
      style,
    } = props;

    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    const handleCopy = useCallback((tokenId: string, token: string) => {
      setCopiedId(tokenId);
      onCopyToken?.(tokenId, token);
      setTimeout(() => setCopiedId(null), 2000);
    }, [onCopyToken]);

    // Check if expiring soon
    const isExpiringSoon = (expiresAt?: Date): boolean => {
      if (!expiresAt) return false;
      const daysUntilExpiry = Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
    };

    const cardStyle = useMemo(() => createCardStyle(tokens, {
      elevation: 'sm',
      glass: isModern,
      interactive: true,
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
              Manage your API keys and access tokens
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

        {/* Cards Grid */}
        {authTokens.length === 0 ? (
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
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: tokens.spacing[4],
          }}>
            {authTokens.map((token) => {
              const typeIconConfig = getTypeIcon(token.type, tokens);
              const Icon = typeIconConfig.Icon;
              const isHovered = hoveredId === token.id;
              const isCopied = copiedId === token.id;
              const menuOpen = openMenuId === token.id;

              // Get usage sparkline data
              const sparklineData = usageData[token.id]?.map(d => d.count) || [];

              return (
                <div
                  key={token.id}
                  onMouseEnter={() => setHoveredId(token.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => onTokenClick?.(token.id)}
                  style={{
                    ...cardStyle,
                    padding: tokens.spacing[4],
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                    transform: isHovered ? tokens.motion.transform : 'none',
                    boxShadow: isHovered ? tokens.shadows.md : tokens.shadows.sm,
                  }}
                >
                  {/* Top: Icon + Status */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: tokens.spacing[3],
                  }}>
                    <div style={{
                      width: 48,
                      height: 48,
                      borderRadius: tokens.borderRadius.lg,
                      backgroundColor: typeIconConfig.bgColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: typeIconConfig.color,
                    }}>
                      <Icon size={24} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                      {/* Status indicator */}
                      {token.status === 'active' && (
                        <span style={{
                          padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                          borderRadius: tokens.borderRadius.full,
                          fontSize: '10px',
                          fontWeight: tokens.typography.fontWeight.medium,
                          backgroundColor: tokens.colors.successScale[50],
                          color: tokens.colors.successScale[700],
                        }}>
                          Active
                        </span>
                      )}
                      {token.status === 'expired' && (
                        <span style={{
                          padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                          borderRadius: tokens.borderRadius.full,
                          fontSize: '10px',
                          fontWeight: tokens.typography.fontWeight.medium,
                          backgroundColor: tokens.colors.warningScale[50],
                          color: tokens.colors.warningScale[700],
                        }}>
                          Expired
                        </span>
                      )}
                      {token.status === 'revoked' && (
                        <span style={{
                          padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                          borderRadius: tokens.borderRadius.full,
                          fontSize: '10px',
                          fontWeight: tokens.typography.fontWeight.medium,
                          backgroundColor: tokens.colors.errorScale[50],
                          color: tokens.colors.errorScale[700],
                        }}>
                          Revoked
                        </span>
                      )}
                      {/* Menu button */}
                      <div style={{ position: 'relative' as const }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(menuOpen ? null : token.id);
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
                        >
                          <MoreVertical size={14} />
                        </button>
                        {menuOpen && (
                          <div style={{
                            position: 'absolute' as const,
                            top: '100%',
                            right: 0,
                            marginTop: tokens.spacing[1],
                            minWidth: 160,
                            backgroundColor: tokens.colors.common.white,
                            borderRadius: tokens.borderRadius.lg,
                            boxShadow: tokens.shadows.lg,
                            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                            zIndex: 50,
                            padding: `${tokens.spacing[1]}px 0`,
                          }}>
                            {onRegenerateToken && token.status === 'active' && (
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onRegenerateToken(token.id);
                                  setOpenMenuId(null);
                                }}
                                style={{
                                  padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                                  fontSize: tokens.typography.fontSize.sm,
                                  color: tokens.colors.neutral[700],
                                  cursor: 'pointer',
                                  transition: `all ${tokens.motion.hover}`,
                                }}
                              >
                                Regenerate
                              </div>
                            )}
                            {onEditScopes && (
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEditScopes(token.id);
                                  setOpenMenuId(null);
                                }}
                                style={{
                                  padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                                  fontSize: tokens.typography.fontSize.sm,
                                  color: tokens.colors.neutral[700],
                                  cursor: 'pointer',
                                  transition: `all ${tokens.motion.hover}`,
                                }}
                              >
                                Edit Scopes
                              </div>
                            )}
                            {onRevokeToken && token.status === 'active' && (
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onRevokeToken(token.id);
                                  setOpenMenuId(null);
                                }}
                                style={{
                                  padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                                  fontSize: tokens.typography.fontSize.sm,
                                  color: tokens.colors.errorScale[600],
                                  cursor: 'pointer',
                                  transition: `all ${tokens.motion.hover}`,
                                }}
                              >
                                Revoke
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Token name + description */}
                  <div style={{ marginBottom: tokens.spacing[3] }}>
                    <div style={{
                      fontSize: tokens.typography.fontSize.md,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[900],
                      marginBottom: tokens.spacing[1],
                    }}>
                      {token.name}
                    </div>
                    {token.description && (
                      <div style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[500],
                        lineHeight: tokens.typography.lineHeight.relaxed,
                      }}>
                        {token.description}
                      </div>
                    )}
                  </div>

                  {/* Token value with copy */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[2],
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                    borderRadius: tokens.borderRadius.md,
                    backgroundColor: tokens.colors.neutral[50],
                    marginBottom: tokens.spacing[3],
                  }}>
                    <code style={{
                      flex: 1,
                      fontSize: tokens.typography.fontSize.xs,
                      fontFamily: 'monospace',
                      color: tokens.colors.neutral[700],
                      overflow: 'hidden' as const,
                      textOverflow: 'ellipsis' as const,
                      whiteSpace: 'nowrap' as const,
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
                    >
                      {isCopied ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>

                  {/* Scopes */}
                  <div style={{ marginBottom: tokens.spacing[3] }}>
                    <div style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[500],
                      fontWeight: tokens.typography.fontWeight.medium,
                      marginBottom: tokens.spacing[1],
                    }}>
                      SCOPES
                    </div>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' as const }}>
                      {token.scopes.slice(0, 3).map((scope, i) => (
                        <span
                          key={i}
                          style={{
                            padding: `2px ${tokens.spacing[2]}px`,
                            borderRadius: tokens.borderRadius.sm,
                            fontSize: '10px',
                            fontWeight: tokens.typography.fontWeight.medium,
                            backgroundColor: tokens.colors.primaryScale[50],
                            color: tokens.colors.primaryScale[700],
                          }}
                        >
                          {scope}
                        </span>
                      ))}
                      {token.scopes.length > 3 && (
                        <span style={{
                          padding: `2px ${tokens.spacing[2]}px`,
                          fontSize: '10px',
                          color: tokens.colors.neutral[500],
                        }}>
                          +{token.scopes.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Usage sparkline */}
                  {sparklineData.length > 0 && (
                    <div style={{ marginBottom: tokens.spacing[3] }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: tokens.spacing[1],
                      }}>
                        <div style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.neutral[500],
                          fontWeight: tokens.typography.fontWeight.medium,
                        }}>
                          USAGE (LAST 7 DAYS)
                        </div>
                        <TrendingUp size={12} color={tokens.colors.infoScale[500]} />
                      </div>
                      <Sparkline
                        data={sparklineData}
                        color={tokens.colors.infoScale[500]}
                        width={120}
                        height={28}
                      />
                    </div>
                  )}

                  {/* Expiry countdown */}
                  {token.expiresAt && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[1],
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                      borderRadius: tokens.borderRadius.md,
                      backgroundColor: isExpiringSoon(token.expiresAt)
                        ? tokens.colors.warningScale[50]
                        : tokens.colors.neutral[50],
                      marginBottom: tokens.spacing[3],
                    }}>
                      <Clock
                        size={14}
                        color={isExpiringSoon(token.expiresAt)
                          ? tokens.colors.warningScale[600]
                          : tokens.colors.neutral[500]}
                      />
                      <span style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: isExpiringSoon(token.expiresAt)
                          ? tokens.colors.warningScale[700]
                          : tokens.colors.neutral[600],
                        fontWeight: tokens.typography.fontWeight.medium,
                      }}>
                        {isExpiringSoon(token.expiresAt) && (
                          <>
                            <AlertTriangle size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                            Expires {formatDistanceToNow(token.expiresAt, { addSuffix: true })}
                          </>
                        )}
                        {!isExpiringSoon(token.expiresAt) && (
                          <>Expires {formatDistanceToNow(token.expiresAt, { addSuffix: true })}</>
                        )}
                      </span>
                    </div>
                  )}

                  {/* Footer: Created + Last Used */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: tokens.spacing[3],
                    borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                  }}>
                    <div style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[500],
                    }}>
                      Created {formatDistanceToNow(token.createdAt, { addSuffix: true })}
                    </div>
                    <div style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[600],
                      fontWeight: tokens.typography.fontWeight.medium,
                    }}>
                      {token.usageCount.toLocaleString()} uses
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Create new token card */}
            {onCreateToken && (
              <button
                onClick={onCreateToken}
                style={{
                  ...cardStyle,
                  padding: tokens.spacing[4],
                  display: 'flex',
                  flexDirection: 'column' as const,
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: tokens.spacing[3],
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  minHeight: 280,
                  border: `2px dashed ${tokens.colors.neutral[300]}`,
                  backgroundColor: 'transparent',
                  outline: 'none',
                }}
              >
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: tokens.borderRadius.full,
                  backgroundColor: tokens.colors.primaryScale[50],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: tokens.colors.primaryScale[600],
                }}>
                  <Plus size={28} />
                </div>
                <div>
                  <div style={{
                    fontSize: tokens.typography.fontSize.md,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[700],
                    marginBottom: tokens.spacing[1],
                  }}>
                    Create New Token
                  </div>
                  <div style={{
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.neutral[500],
                  }}>
                    Add a new authentication token
                  </div>
                </div>
              </button>
            )}
          </div>
        )}
      </div>
    );
  },
});
