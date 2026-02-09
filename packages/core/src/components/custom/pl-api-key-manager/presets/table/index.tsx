'use client';

/**
 * PlApiKeyManager - Table Preset
 * Full-featured table view with stats, search, environment filter,
 * masked keys, scope badges, rate limit bars, and expiry countdown
 */

import { useState, useCallback, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createBadgeStyle,
  createCardStyle,
  createEmptyStateStyle,
  createSurfaceStyle,
  createStatusDotStyle,
  createProgressBarStyle,
  formatDistanceToNow,
} from '../../../helpers';
import type {
  PlApiKeyManagerProps,
  ApiKey,
  ApiKeyStatus,
  ApiKeyScope,
  ApiKeyEnvironment,
} from '../../core';
import { PL_API_KEY_MANAGER_DEFAULTS } from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  Key,
  Search,
  Plus,
  Copy,
  Check,
  X,
  RefreshCw,
  Ban,
  Shield,
  AlertTriangle,
  Clock,
  ChevronDown,
  Activity,
  Zap,
  Globe,
  Server,
  Code,
  Eye,
  EyeOff,
  Lock,
} from 'lucide-react';

// ─── Status Config ────────────────────────────────────────────────────────

interface StatusConfig {
  label: string;
  dotColor: string;
  bgColor: string;
  textColor: string;
}

function getStatusConfig(status: ApiKeyStatus, tokens: DesignTokens): StatusConfig {
  switch (status) {
    case 'active':
      return {
        label: 'Active',
        dotColor: tokens.colors.successScale[500],
        bgColor: tokens.colors.successScale[50],
        textColor: tokens.colors.successScale[700],
      };
    case 'expired':
      return {
        label: 'Expired',
        dotColor: tokens.colors.warningScale[500],
        bgColor: tokens.colors.warningScale[50],
        textColor: tokens.colors.warningScale[700],
      };
    case 'revoked':
      return {
        label: 'Revoked',
        dotColor: tokens.colors.errorScale[500],
        bgColor: tokens.colors.errorScale[50],
        textColor: tokens.colors.errorScale[700],
      };
  }
}

// ─── Scope Config ─────────────────────────────────────────────────────────

interface ScopeConfig {
  label: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
}

function getScopeConfig(scope: ApiKeyScope, tokens: DesignTokens): ScopeConfig {
  switch (scope) {
    case 'read':
      return {
        label: 'Read',
        bgColor: tokens.colors.neutral[100],
        textColor: tokens.colors.neutral[700],
        borderColor: tokens.colors.neutral[200],
      };
    case 'write':
      return {
        label: 'Write',
        bgColor: tokens.colors.infoScale[100],
        textColor: tokens.colors.infoScale[700],
        borderColor: tokens.colors.infoScale[200],
      };
    case 'admin':
      return {
        label: 'Admin',
        bgColor: tokens.colors.secondaryScale[100],
        textColor: tokens.colors.secondaryScale[700],
        borderColor: tokens.colors.secondaryScale[200],
      };
    case 'full':
      return {
        label: 'Full',
        bgColor: tokens.colors.errorScale[100],
        textColor: tokens.colors.errorScale[700],
        borderColor: tokens.colors.errorScale[200],
      };
  }
}

// ─── Environment Config ───────────────────────────────────────────────────

interface EnvConfig {
  label: string;
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
  borderColor: string;
}

function getEnvConfig(env: ApiKeyEnvironment, tokens: DesignTokens): EnvConfig {
  const iconSize = 12;
  switch (env) {
    case 'production':
      return {
        label: 'Production',
        icon: <Globe size={iconSize} />,
        bgColor: tokens.colors.errorScale[50],
        textColor: tokens.colors.errorScale[700],
        borderColor: tokens.colors.errorScale[200],
      };
    case 'staging':
      return {
        label: 'Staging',
        icon: <Server size={iconSize} />,
        bgColor: tokens.colors.warningScale[50],
        textColor: tokens.colors.warningScale[700],
        borderColor: tokens.colors.warningScale[200],
      };
    case 'development':
      return {
        label: 'Development',
        icon: <Code size={iconSize} />,
        bgColor: tokens.colors.successScale[50],
        textColor: tokens.colors.successScale[700],
        borderColor: tokens.colors.successScale[200],
      };
  }
}

// ─── Expiry Helpers ───────────────────────────────────────────────────────

function getExpiryInfo(expiresAt: Date | undefined, tokens: DesignTokens): {
  label: string;
  color: string;
  isExpiringSoon: boolean;
} {
  if (!expiresAt) {
    return { label: 'Never', color: tokens.colors.neutral[500], isExpiringSoon: false };
  }

  const now = Date.now();
  const diff = expiresAt.getTime() - now;

  if (diff <= 0) {
    return { label: 'Expired', color: tokens.colors.errorScale[600], isExpiringSoon: false };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 30) {
    return { label: `${days}d`, color: tokens.colors.neutral[500], isExpiringSoon: false };
  }

  if (days > 7) {
    return { label: `${days}d`, color: tokens.colors.warningScale[600], isExpiringSoon: true };
  }

  if (days > 0) {
    return { label: `${days}d ${hours}h`, color: tokens.colors.errorScale[600], isExpiringSoon: true };
  }

  return { label: `${hours}h`, color: tokens.colors.errorScale[600], isExpiringSoon: true };
}

// ─── Table Preset ─────────────────────────────────────────────────────────

export const TablePlApiKeyManager = createPreset<PlApiKeyManagerProps>({
  name: 'PlApiKeyManager.Table',
  render: ({ primitives, props, tokens, engine }: PresetContext<PlApiKeyManagerProps>) => {
    const { Box, Stack, Spinner } = primitives;
    const isModern = tokens.surface.useGlass;

    const {
      apiKeys,
      onKeyClick,
      onCreate,
      onRevoke,
      onRegenerate,
      onCopyKey,
      searchQuery: controlledSearchQuery,
      onSearchChange,
      loading = false,
      emptyText = PL_API_KEY_MANAGER_DEFAULTS.emptyText,
      className,
      style,
    } = props;

    // ─── Internal State ─────────────────────────────────────────────────

    const [internalSearchQuery, setInternalSearchQuery] = useState('');
    const [hoveredKeyId, setHoveredKeyId] = useState<string | null>(null);
    const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
    const [envFilter, setEnvFilter] = useState<ApiKeyEnvironment | null>(null);
    const [showEnvDropdown, setShowEnvDropdown] = useState(false);

    const searchQuery = controlledSearchQuery ?? internalSearchQuery;

    // ─── Handlers ───────────────────────────────────────────────────────

    const handleSearchChange = useCallback((query: string) => {
      if (controlledSearchQuery === undefined) setInternalSearchQuery(query);
      onSearchChange?.(query);
    }, [controlledSearchQuery, onSearchChange]);

    const handleCopyKey = useCallback((apiKey: ApiKey) => {
      onCopyKey?.(apiKey.id, apiKey.key);
      setCopiedKeyId(apiKey.id);
      setTimeout(() => setCopiedKeyId(null), 2000);
    }, [onCopyKey]);

    const handleEnvFilter = useCallback((env: ApiKeyEnvironment | null) => {
      setEnvFilter(env);
      setShowEnvDropdown(false);
    }, []);

    // ─── Filtered Keys ──────────────────────────────────────────────────

    const filteredKeys = useMemo(() => {
      let result = [...apiKeys];

      if (envFilter) {
        result = result.filter(k => k.environment === envFilter);
      }

      if (searchQuery) {
        const lower = searchQuery.toLowerCase();
        result = result.filter(k =>
          k.name.toLowerCase().includes(lower) ||
          k.prefix.toLowerCase().includes(lower) ||
          k.description?.toLowerCase().includes(lower) ||
          k.createdBy.toLowerCase().includes(lower)
        );
      }

      return result;
    }, [apiKeys, envFilter, searchQuery]);

    // ─── Computed Stats ─────────────────────────────────────────────────

    const stats = useMemo(() => {
      const totalKeys = apiKeys.length;
      const activeKeys = apiKeys.filter(k => k.status === 'active').length;
      const totalRequestsToday = apiKeys.reduce((sum, k) => sum + k.requestsToday, 0);
      const now = Date.now();
      const expiringSoon = apiKeys.filter(k => {
        if (!k.expiresAt || k.status !== 'active') return false;
        const diff = k.expiresAt.getTime() - now;
        return diff > 0 && diff <= 7 * 24 * 60 * 60 * 1000;
      }).length;
      return { totalKeys, activeKeys, totalRequestsToday, expiringSoon };
    }, [apiKeys]);

    // ─── Glass Style ────────────────────────────────────────────────────

    const glassCardStyle = isModern && tokens.glass ? {
      backdropFilter: tokens.glass.blur,
      WebkitBackdropFilter: tokens.glass.blur,
      backgroundColor: tokens.glass.bg,
      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.glass.border}`,
    } : {};

    // ─── Loading State ──────────────────────────────────────────────────

    if (loading) {
      return (
        <div
          className={className}
          style={{
            padding: tokens.spacing[6],
            backgroundColor: tokens.colors.neutral[50],
            minHeight: '100%',
            fontFamily: 'inherit',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            ...style,
          }}
        >
          <Spinner size="lg" />
        </div>
      );
    }

    // ─── Render: Header ─────────────────────────────────────────────────

    const renderHeader = () => (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
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
            API Keys
          </h1>
          <p style={{
            fontSize: tokens.typography.fontSize.sm,
            color: tokens.colors.neutral[500],
            margin: 0,
            marginTop: tokens.spacing[1],
          }}>
            Manage API keys, scopes, and rate limits for your integrations
          </p>
        </div>
        {onCreate && (
          <button
            onClick={onCreate}
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
            Generate Key
          </button>
        )}
      </div>
    );

    // ─── Render: Stats ──────────────────────────────────────────────────

    const renderStats = () => {
      const statItems = [
        {
          label: 'API Keys',
          value: stats.totalKeys,
          icon: <Key size={18} />,
          color: tokens.colors.primaryScale[600],
          bgColor: tokens.colors.primaryScale[50],
        },
        {
          label: 'Active',
          value: stats.activeKeys,
          icon: <Shield size={18} />,
          color: tokens.colors.successScale[600],
          bgColor: tokens.colors.successScale[50],
        },
        {
          label: 'Requests Today',
          value: stats.totalRequestsToday.toLocaleString(),
          icon: <Activity size={18} />,
          color: tokens.colors.infoScale[600],
          bgColor: tokens.colors.infoScale[50],
        },
        {
          label: 'Expiring Soon',
          value: stats.expiringSoon,
          icon: <AlertTriangle size={18} />,
          color: stats.expiringSoon > 0 ? tokens.colors.warningScale[600] : tokens.colors.neutral[400],
          bgColor: stats.expiringSoon > 0 ? tokens.colors.warningScale[50] : tokens.colors.neutral[50],
        },
      ];

      return (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: tokens.spacing[4],
          marginBottom: tokens.spacing[6],
        }}>
          {statItems.map((stat, idx) => (
            <div
              key={idx}
              style={{
                ...createCardStyle(tokens, { elevation: 'sm', glass: isModern }),
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[3],
                padding: `${tokens.spacing[4]}px ${tokens.spacing[4]}px`,
                ...(isModern ? glassCardStyle : {}),
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: tokens.borderRadius.lg,
                backgroundColor: stat.bgColor,
                color: stat.color,
                flexShrink: 0,
              }}>
                {stat.icon}
              </div>
              <div>
                <div style={{
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: tokens.colors.neutral[500],
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.05em',
                  marginBottom: 2,
                }}>
                  {stat.label}
                </div>
                <div style={{
                  fontSize: tokens.typography.fontSize.xl,
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.neutral[900],
                  lineHeight: tokens.typography.lineHeight.tight,
                }}>
                  {stat.value}
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    };

    // ─── Render: Filter Bar ─────────────────────────────────────────────

    const renderFilterBar = () => {
      const allEnvs: ApiKeyEnvironment[] = ['production', 'staging', 'development'];

      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing[3],
          marginBottom: tokens.spacing[4],
          flexWrap: 'wrap' as const,
        }}>
          {/* Environment filter dropdown */}
          <div style={{ position: 'relative' as const }}>
            <button
              onClick={() => setShowEnvDropdown(!showEnvDropdown)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${envFilter ? tokens.colors.primaryScale[300] : tokens.colors.neutral[200]}`,
                backgroundColor: envFilter ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                color: envFilter ? tokens.colors.primaryScale[600] : tokens.colors.neutral[600],
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
                outline: 'none',
              }}
            >
              {envFilter ? getEnvConfig(envFilter, tokens).label : 'All Environments'}
              <ChevronDown size={14} />
            </button>
            {showEnvDropdown && (
              <div style={{
                position: 'absolute' as const,
                top: '100%',
                left: 0,
                marginTop: tokens.spacing[1],
                minWidth: 200,
                backgroundColor: tokens.colors.common.white,
                borderRadius: tokens.borderRadius.lg,
                boxShadow: tokens.shadows.lg,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                zIndex: 50,
                padding: `${tokens.spacing[1]}px 0`,
              }}>
                <div
                  onClick={() => handleEnvFilter(null)}
                  style={{
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                    fontSize: tokens.typography.fontSize.sm,
                    color: !envFilter ? tokens.colors.primaryScale[600] : tokens.colors.neutral[700],
                    backgroundColor: !envFilter ? tokens.colors.primaryScale[50] : 'transparent',
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                  }}
                >
                  All Environments
                </div>
                {allEnvs.map(env => {
                  const cfg = getEnvConfig(env, tokens);
                  return (
                    <div
                      key={env}
                      onClick={() => handleEnvFilter(env)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: tokens.spacing[2],
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                        fontSize: tokens.typography.fontSize.sm,
                        color: envFilter === env ? tokens.colors.primaryScale[600] : tokens.colors.neutral[700],
                        backgroundColor: envFilter === env ? tokens.colors.primaryScale[50] : 'transparent',
                        cursor: 'pointer',
                        transition: `all ${tokens.motion.hover}`,
                      }}
                    >
                      <div style={{ color: cfg.textColor }}>{cfg.icon}</div>
                      {cfg.label}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{ flex: 1 }} />

          {/* Search input */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[2],
            padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
            borderRadius: tokens.borderRadius.md,
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            backgroundColor: tokens.colors.common.white,
            minWidth: 280,
            transition: `all ${tokens.motion.hover}`,
          }}>
            <Search size={16} color={tokens.colors.neutral[400]} />
            <input
              type="text"
              placeholder="Search keys by name, prefix, or creator..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[800],
                backgroundColor: 'transparent',
                flex: 1,
                padding: 0,
                fontFamily: 'inherit',
              }}
            />
            {searchQuery && (
              <X
                size={14}
                color={tokens.colors.neutral[400]}
                style={{ cursor: 'pointer' }}
                onClick={() => handleSearchChange('')}
              />
            )}
          </div>
        </div>
      );
    };

    // ─── Render: Scope Badges ───────────────────────────────────────────

    const renderScopeBadges = (scopes: ApiKeyScope[]) => (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        flexWrap: 'wrap' as const,
      }}>
        {scopes.map(scope => {
          const cfg = getScopeConfig(scope, tokens);
          return (
            <span
              key={scope}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: `1px ${tokens.spacing[2]}px`,
                borderRadius: tokens.borderRadius.full,
                fontSize: '10px',
                fontWeight: tokens.typography.fontWeight.medium,
                backgroundColor: cfg.bgColor,
                color: cfg.textColor,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${cfg.borderColor}`,
                lineHeight: '16px',
              }}
            >
              {cfg.label}
            </span>
          );
        })}
      </div>
    );

    // ─── Render: Environment Badge ──────────────────────────────────────

    const renderEnvBadge = (env: ApiKeyEnvironment) => {
      const cfg = getEnvConfig(env, tokens);
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 3,
          padding: `2px ${tokens.spacing[2]}px`,
          borderRadius: tokens.borderRadius.full,
          fontSize: '10px',
          fontWeight: tokens.typography.fontWeight.medium,
          backgroundColor: cfg.bgColor,
          color: cfg.textColor,
          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${cfg.borderColor}`,
          lineHeight: '16px',
        }}>
          {cfg.icon}
          {cfg.label}
        </span>
      );
    };

    // ─── Render: Rate Limit Bar ─────────────────────────────────────────

    const renderRateLimitBar = (apiKey: ApiKey) => {
      const percent = apiKey.rateLimit > 0
        ? Math.min(100, (apiKey.requestsToday / apiKey.rateLimit) * 100)
        : 0;

      const barColor = percent >= 90
        ? tokens.colors.errorScale[500]
        : percent >= 70
          ? tokens.colors.warningScale[500]
          : tokens.colors.successScale[500];

      const progressStyle = createProgressBarStyle(tokens, { color: barColor, percent });

      return (
        <div style={{ minWidth: 100 }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 3,
          }}>
            <span style={{
              fontSize: '10px',
              fontWeight: tokens.typography.fontWeight.medium,
              color: tokens.colors.neutral[600],
            }}>
              {apiKey.requestsToday.toLocaleString()}
            </span>
            <span style={{
              fontSize: '10px',
              color: tokens.colors.neutral[400],
            }}>
              / {apiKey.rateLimit.toLocaleString()}
            </span>
          </div>
          <div style={progressStyle.track}>
            <div style={progressStyle.fill} />
          </div>
        </div>
      );
    };

    // ─── Render: Masked Key ─────────────────────────────────────────────

    const renderMaskedKey = (apiKey: ApiKey) => {
      const isCopied = copiedKeyId === apiKey.id;

      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing[1],
        }}>
          <code style={{
            fontFamily: 'monospace',
            fontSize: tokens.typography.fontSize.xs,
            color: tokens.colors.neutral[600],
            backgroundColor: tokens.colors.neutral[50],
            padding: `2px ${tokens.spacing[2]}px`,
            borderRadius: tokens.borderRadius.sm,
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            letterSpacing: '0.02em',
          }}>
            {apiKey.prefix}{'****'}
          </code>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCopyKey(apiKey);
            }}
            title={isCopied ? 'Copied!' : 'Copy full key'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 24,
              height: 24,
              borderRadius: tokens.borderRadius.sm,
              border: 'none',
              backgroundColor: isCopied ? tokens.colors.successScale[50] : 'transparent',
              color: isCopied ? tokens.colors.successScale[600] : tokens.colors.neutral[400],
              cursor: 'pointer',
              transition: `all ${tokens.motion.hover}`,
              outline: 'none',
              padding: 0,
              flexShrink: 0,
            }}
          >
            {isCopied ? <Check size={12} /> : <Copy size={12} />}
          </button>
        </div>
      );
    };

    // ─── Render: Status Badge ───────────────────────────────────────────

    const renderStatusBadge = (status: ApiKeyStatus) => {
      const cfg = getStatusConfig(status, tokens);
      return (
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: tokens.spacing[1],
          padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
          borderRadius: tokens.borderRadius.full,
          backgroundColor: cfg.bgColor,
        }}>
          <span style={{
            ...createStatusDotStyle(tokens, cfg.dotColor),
          }} />
          <span style={{
            fontSize: tokens.typography.fontSize.xs,
            fontWeight: tokens.typography.fontWeight.medium,
            color: cfg.textColor,
          }}>
            {cfg.label}
          </span>
        </div>
      );
    };

    // ─── Render: Expiry Cell ────────────────────────────────────────────

    const renderExpiryCell = (apiKey: ApiKey) => {
      const expiry = getExpiryInfo(apiKey.expiresAt, tokens);
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing[1],
        }}>
          {expiry.isExpiringSoon && (
            <AlertTriangle
              size={12}
              color={tokens.colors.warningScale[500]}
            />
          )}
          <span style={{
            fontSize: tokens.typography.fontSize.xs,
            fontWeight: tokens.typography.fontWeight.normal,
            color: expiry.color,
          }}>
            {expiry.label}
          </span>
        </div>
      );
    };

    // ─── Render: Actions ────────────────────────────────────────────────

    const renderActions = (apiKey: ApiKey, isHovered: boolean) => (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacing[1],
        opacity: isHovered ? 1 : 0,
        transition: `opacity ${tokens.motion.hover}`,
      }}>
        {/* Copy Key */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleCopyKey(apiKey);
          }}
          title="Copy Key"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 30,
            height: 30,
            borderRadius: tokens.borderRadius.md,
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            backgroundColor: tokens.colors.common.white,
            color: copiedKeyId === apiKey.id ? tokens.colors.successScale[600] : tokens.colors.neutral[600],
            cursor: 'pointer',
            transition: `all ${tokens.motion.hover}`,
            outline: 'none',
          }}
        >
          {copiedKeyId === apiKey.id ? <Check size={14} /> : <Copy size={14} />}
        </button>

        {/* Regenerate */}
        {onRegenerate && apiKey.status === 'active' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRegenerate(apiKey.id);
            }}
            title="Regenerate Key"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 30,
              height: 30,
              borderRadius: tokens.borderRadius.md,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.warningScale[200]}`,
              backgroundColor: tokens.colors.common.white,
              color: tokens.colors.warningScale[600],
              cursor: 'pointer',
              transition: `all ${tokens.motion.hover}`,
              outline: 'none',
            }}
          >
            <RefreshCw size={14} />
          </button>
        )}

        {/* Revoke */}
        {onRevoke && apiKey.status === 'active' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRevoke(apiKey.id);
            }}
            title="Revoke Key"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 30,
              height: 30,
              borderRadius: tokens.borderRadius.md,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.errorScale[200]}`,
              backgroundColor: tokens.colors.common.white,
              color: tokens.colors.errorScale[600],
              cursor: 'pointer',
              transition: `all ${tokens.motion.hover}`,
              outline: 'none',
            }}
          >
            <Ban size={14} />
          </button>
        )}
      </div>
    );

    // ─── Render: Table Row ──────────────────────────────────────────────

    const renderTableRow = (apiKey: ApiKey, idx: number) => {
      const isHovered = hoveredKeyId === apiKey.id;

      return (
        <tr
          key={apiKey.id}
          onMouseEnter={() => setHoveredKeyId(apiKey.id)}
          onMouseLeave={() => setHoveredKeyId(null)}
          onClick={() => onKeyClick?.(apiKey.id)}
          style={{
            backgroundColor: isHovered ? tokens.colors.neutral[50] : tokens.colors.common.white,
            cursor: 'pointer',
            transition: `all ${tokens.motion.hover}`,
          }}
        >
          {/* Name + Description */}
          <td style={{
            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
            borderBottom: idx < filteredKeys.length - 1
              ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`
              : 'none',
            verticalAlign: 'middle' as const,
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[3],
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 34,
                height: 34,
                borderRadius: tokens.borderRadius.md,
                backgroundColor: tokens.colors.primaryScale[50],
                color: tokens.colors.primaryScale[600],
                flexShrink: 0,
              }}>
                <Key size={16} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[900],
                  marginBottom: 1,
                  whiteSpace: 'nowrap' as const,
                  overflow: 'hidden' as const,
                  textOverflow: 'ellipsis' as const,
                  maxWidth: 180,
                }}>
                  {apiKey.name}
                </div>
                {apiKey.description && (
                  <div style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[500],
                    whiteSpace: 'nowrap' as const,
                    overflow: 'hidden' as const,
                    textOverflow: 'ellipsis' as const,
                    maxWidth: 180,
                  }}>
                    {apiKey.description}
                  </div>
                )}
              </div>
            </div>
          </td>

          {/* Key (masked) */}
          <td style={{
            padding: `${tokens.spacing[3]}px ${tokens.spacing[3]}px`,
            borderBottom: idx < filteredKeys.length - 1
              ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`
              : 'none',
            verticalAlign: 'middle' as const,
          }}>
            {renderMaskedKey(apiKey)}
          </td>

          {/* Scopes */}
          <td style={{
            padding: `${tokens.spacing[3]}px ${tokens.spacing[3]}px`,
            borderBottom: idx < filteredKeys.length - 1
              ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`
              : 'none',
            verticalAlign: 'middle' as const,
          }}>
            {renderScopeBadges(apiKey.scopes)}
          </td>

          {/* Environment */}
          <td style={{
            padding: `${tokens.spacing[3]}px ${tokens.spacing[3]}px`,
            borderBottom: idx < filteredKeys.length - 1
              ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`
              : 'none',
            verticalAlign: 'middle' as const,
          }}>
            {renderEnvBadge(apiKey.environment)}
          </td>

          {/* Status */}
          <td style={{
            padding: `${tokens.spacing[3]}px ${tokens.spacing[3]}px`,
            borderBottom: idx < filteredKeys.length - 1
              ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`
              : 'none',
            verticalAlign: 'middle' as const,
          }}>
            {renderStatusBadge(apiKey.status)}
          </td>

          {/* Rate Limit */}
          <td style={{
            padding: `${tokens.spacing[3]}px ${tokens.spacing[3]}px`,
            borderBottom: idx < filteredKeys.length - 1
              ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`
              : 'none',
            verticalAlign: 'middle' as const,
          }}>
            {renderRateLimitBar(apiKey)}
          </td>

          {/* Last Used */}
          <td style={{
            padding: `${tokens.spacing[3]}px ${tokens.spacing[3]}px`,
            borderBottom: idx < filteredKeys.length - 1
              ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`
              : 'none',
            verticalAlign: 'middle' as const,
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.neutral[500],
            }}>
              <Clock size={12} />
              {apiKey.lastUsed
                ? formatDistanceToNow(apiKey.lastUsed, { addSuffix: true })
                : 'Never'}
            </div>
          </td>

          {/* Expires */}
          <td style={{
            padding: `${tokens.spacing[3]}px ${tokens.spacing[3]}px`,
            borderBottom: idx < filteredKeys.length - 1
              ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`
              : 'none',
            verticalAlign: 'middle' as const,
          }}>
            {renderExpiryCell(apiKey)}
          </td>

          {/* Actions */}
          <td style={{
            padding: `${tokens.spacing[3]}px ${tokens.spacing[3]}px`,
            borderBottom: idx < filteredKeys.length - 1
              ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`
              : 'none',
            verticalAlign: 'middle' as const,
            textAlign: 'right' as const,
          }}>
            {renderActions(apiKey, isHovered)}
          </td>
        </tr>
      );
    };

    // ─── Render: Table ──────────────────────────────────────────────────

    const renderTable = () => (
      <div style={{
        ...createCardStyle(tokens, { elevation: 'sm', glass: isModern, padding: 0 }),
        overflow: 'hidden' as const,
        ...(isModern ? glassCardStyle : {}),
      }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse' as const,
        }}>
          <thead>
            <tr style={{ backgroundColor: tokens.colors.neutral[50] }}>
              {[
                { label: 'Name', width: undefined },
                { label: 'Key', width: undefined },
                { label: 'Scopes', width: undefined },
                { label: 'Environment', width: undefined },
                { label: 'Status', width: undefined },
                { label: 'Rate Limit', width: 120 },
                { label: 'Last Used', width: 100 },
                { label: 'Expires', width: 90 },
                { label: '', width: 120 },
              ].map((col, idx) => (
                <th
                  key={idx}
                  style={{
                    padding: `${tokens.spacing[3]}px ${col.label === 'Name' ? tokens.spacing[4] : tokens.spacing[3]}px`,
                    textAlign: 'left' as const,
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[500],
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.05em',
                    borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                    whiteSpace: 'nowrap' as const,
                    ...(col.width ? { width: col.width } : {}),
                  }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredKeys.map((apiKey, idx) => renderTableRow(apiKey, idx))}
          </tbody>
        </table>
      </div>
    );

    // ─── Render: Empty State ────────────────────────────────────────────

    const renderEmptyState = () => (
      <div style={{
        ...createCardStyle(tokens, { elevation: 'sm', glass: isModern }),
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center',
        padding: `${tokens.spacing[12]}px ${tokens.spacing[6]}px`,
        textAlign: 'center' as const,
        ...(isModern ? glassCardStyle : {}),
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
          {searchQuery || envFilter ? emptyText : 'No API keys yet'}
        </div>
        <div style={{
          fontSize: tokens.typography.fontSize.sm,
          color: tokens.colors.neutral[500],
          marginBottom: tokens.spacing[6],
          maxWidth: 400,
          lineHeight: tokens.typography.lineHeight.relaxed,
        }}>
          {searchQuery || envFilter
            ? 'Try adjusting your filters or search query to find what you are looking for.'
            : 'Generate your first API key to start integrating with the platform.'}
        </div>
        {onCreate && !(searchQuery || envFilter) && (
          <button
            onClick={onCreate}
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
            Generate Your First Key
          </button>
        )}
      </div>
    );

    // ─── Main Render ────────────────────────────────────────────────────

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
        {renderHeader()}
        {renderStats()}
        {renderFilterBar()}
        {filteredKeys.length === 0 ? renderEmptyState() : renderTable()}
      </div>
    );
  },
});
