'use client';

/**
 * PlSsoConnectionManager - List Preset
 * Rich list view of SSO connections with stats ribbon, search, protocol filtering,
 * grouping by protocol, connection cards with actions, and certificate warnings
 */

import { useState, useCallback, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createBadgeStyle,
  createCardStyle,
  createEmptyStateStyle,
  createHoverStyle,
  createStatusDotStyle,
  createSurfaceStyle,
  formatDistanceToNow,
} from '../../../helpers';
import type {
  PlSsoConnectionManagerProps,
  SsoConnection,
  SsoProtocol,
  ConnectionStatus,
  SsoProvider,
} from '../../core';
import { PL_SSO_CONNECTION_MANAGER_DEFAULTS } from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Search,
  Plus,
  Play,
  Settings,
  RefreshCw,
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Users,
  Clock,
  Globe,
  Key,
  Lock,
  Server,
  Database,
  ChevronDown,
  X,
  Zap,
  ToggleLeft,
  ToggleRight,
  FileKey,
  Loader2,
} from 'lucide-react';

// ─── Protocol Config ─────────────────────────────────────────────────────────

interface ProtocolConfig {
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
}

function getProtocolConfig(protocol: SsoProtocol, tokens: DesignTokens): ProtocolConfig {
  const iconSize = 16;
  switch (protocol) {
    case 'SAML':
      return {
        label: 'SAML',
        icon: <Shield size={iconSize} />,
        color: tokens.colors.primaryScale[700],
        bgColor: tokens.colors.primaryScale[50],
        borderColor: tokens.colors.primaryScale[200],
        description: 'Security Assertion Markup Language',
      };
    case 'OIDC':
      return {
        label: 'OIDC',
        icon: <Key size={iconSize} />,
        color: tokens.colors.infoScale[700],
        bgColor: tokens.colors.infoScale[50],
        borderColor: tokens.colors.infoScale[200],
        description: 'OpenID Connect',
      };
    case 'OAuth2':
      return {
        label: 'OAuth2',
        icon: <Lock size={iconSize} />,
        color: tokens.colors.secondaryScale[700],
        bgColor: tokens.colors.secondaryScale[50],
        borderColor: tokens.colors.secondaryScale[200],
        description: 'OAuth 2.0 Authorization',
      };
    case 'LDAP':
      return {
        label: 'LDAP',
        icon: <Database size={iconSize} />,
        color: tokens.colors.warningScale[700],
        bgColor: tokens.colors.warningScale[50],
        borderColor: tokens.colors.warningScale[200],
        description: 'Lightweight Directory Access Protocol',
      };
  }
}

// ─── Provider Config ─────────────────────────────────────────────────────────

interface ProviderConfig {
  label: string;
  bgColor: string;
  textColor: string;
  initial: string;
}

function getProviderConfig(provider: SsoProvider, tokens: DesignTokens): ProviderConfig {
  const configs: Record<SsoProvider, { label: string; scaleKey: string }> = {
    google: { label: 'Google Workspace', scaleKey: 'errorScale' },
    microsoft: { label: 'Microsoft Entra', scaleKey: 'infoScale' },
    okta: { label: 'Okta', scaleKey: 'primaryScale' },
    auth0: { label: 'Auth0', scaleKey: 'warningScale' },
    onelogin: { label: 'OneLogin', scaleKey: 'successScale' },
    ping: { label: 'PingIdentity', scaleKey: 'secondaryScale' },
    jumpcloud: { label: 'JumpCloud', scaleKey: 'infoScale' },
    custom: { label: 'Custom Provider', scaleKey: 'neutral' },
  };
  const cfg = configs[provider];
  const scale = (tokens.colors as any)[cfg.scaleKey];
  return {
    label: cfg.label,
    bgColor: provider === 'custom' ? tokens.colors.neutral[100] : scale[50],
    textColor: provider === 'custom' ? tokens.colors.neutral[600] : scale[600],
    initial: cfg.label.charAt(0),
  };
}

// ─── Status Config ───────────────────────────────────────────────────────────

interface StatusConfig {
  label: string;
  dotColor: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  badgeVariant: 'success' | 'warning' | 'error' | 'info' | 'secondary' | 'primary';
}

function getStatusConfig(status: ConnectionStatus, tokens: DesignTokens): StatusConfig {
  switch (status) {
    case 'active':
      return {
        label: 'Active',
        dotColor: tokens.colors.successScale[500],
        bgColor: tokens.colors.successScale[50],
        textColor: tokens.colors.successScale[700],
        borderColor: tokens.colors.successScale[200],
        badgeVariant: 'success',
      };
    case 'inactive':
      return {
        label: 'Inactive',
        dotColor: tokens.colors.neutral[400],
        bgColor: tokens.colors.neutral[50],
        textColor: tokens.colors.neutral[600],
        borderColor: tokens.colors.neutral[200],
        badgeVariant: 'secondary',
      };
    case 'error':
      return {
        label: 'Error',
        dotColor: tokens.colors.errorScale[500],
        bgColor: tokens.colors.errorScale[50],
        textColor: tokens.colors.errorScale[700],
        borderColor: tokens.colors.errorScale[200],
        badgeVariant: 'error',
      };
    case 'configuring':
      return {
        label: 'Configuring',
        dotColor: tokens.colors.warningScale[500],
        bgColor: tokens.colors.warningScale[50],
        textColor: tokens.colors.warningScale[700],
        borderColor: tokens.colors.warningScale[200],
        badgeVariant: 'warning',
      };
  }
}

// ─── Cert Expiry Helpers ─────────────────────────────────────────────────────

function isCertExpiringSoon(connection: SsoConnection): boolean {
  const certDate = connection.certExpiresAt ?? connection.certificate?.expiry;
  if (!certDate) return false;
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;
  const diff = certDate.getTime() - Date.now();
  return diff > 0 && diff < thirtyDays;
}

function isCertExpired(connection: SsoConnection): boolean {
  if (connection.certificate?.isExpired) return true;
  const certDate = connection.certExpiresAt ?? connection.certificate?.expiry;
  if (!certDate) return false;
  return certDate.getTime() < Date.now();
}

// ─── List Preset ─────────────────────────────────────────────────────────────

export const ListPlSsoConnectionManager = createPreset<PlSsoConnectionManagerProps>({
  name: 'PlSsoConnectionManager.List',
  render: ({ primitives, props, tokens, engine }: PresetContext<PlSsoConnectionManagerProps>) => {
    const { Box } = primitives;
    const isModern = tokens.surface.useGlass;

    const {
      connections,
      stats,
      onConnectionClick,
      onAddConnection,
      onTestConnection,
      onEditConnection,
      onSyncConnection,
      onToggleConnection,
      onDeleteConnection,
      searchQuery: controlledSearchQuery,
      onSearchChange,
      filterProtocol: controlledFilterProtocol,
      onFilterChange,
      loading = false,
      emptyText = PL_SSO_CONNECTION_MANAGER_DEFAULTS.emptyText,
      className,
      style,
    } = props;

    // ─── Internal State ──────────────────────────────────────────────────

    const [internalSearchQuery, setInternalSearchQuery] = useState('');
    const [internalFilterProtocol, setInternalFilterProtocol] = useState<SsoProtocol | null>(null);
    const [hoveredConnectionId, setHoveredConnectionId] = useState<string | null>(null);
    const [showProtocolDropdown, setShowProtocolDropdown] = useState(false);

    const searchQuery = controlledSearchQuery ?? internalSearchQuery;
    const filterProtocol = controlledFilterProtocol ?? internalFilterProtocol;

    // ─── Handlers ────────────────────────────────────────────────────────

    const handleSearchChange = useCallback((query: string) => {
      if (controlledSearchQuery === undefined) setInternalSearchQuery(query);
      onSearchChange?.(query);
    }, [controlledSearchQuery, onSearchChange]);

    const handleFilterChange = useCallback((protocol: SsoProtocol | null) => {
      if (controlledFilterProtocol === undefined) setInternalFilterProtocol(protocol);
      onFilterChange?.(protocol);
      setShowProtocolDropdown(false);
    }, [controlledFilterProtocol, onFilterChange]);

    const handleToggle = useCallback((connectionId: string, currentStatus: ConnectionStatus) => {
      const newEnabled = currentStatus !== 'active';
      onToggleConnection?.(connectionId, newEnabled);
    }, [onToggleConnection]);

    // ─── Filtered Connections ────────────────────────────────────────────

    const filteredConnections = useMemo(() => {
      let result = [...connections];

      if (filterProtocol) {
        result = result.filter(c => c.protocol === filterProtocol);
      }

      if (searchQuery) {
        const lower = searchQuery.toLowerCase();
        result = result.filter(c =>
          c.name.toLowerCase().includes(lower) ||
          c.domain.toLowerCase().includes(lower) ||
          c.provider.toLowerCase().includes(lower)
        );
      }

      return result;
    }, [connections, filterProtocol, searchQuery]);

    // ─── Group by Protocol ───────────────────────────────────────────────

    const groupedConnections = useMemo(() => {
      const groups = new Map<SsoProtocol, SsoConnection[]>();

      filteredConnections.forEach(conn => {
        const existing = groups.get(conn.protocol) || [];
        groups.set(conn.protocol, [...existing, conn]);
      });

      const protocolOrder: SsoProtocol[] = ['SAML', 'OIDC', 'OAuth2', 'LDAP'];
      const result: Array<{ protocol: SsoProtocol; connections: SsoConnection[] }> = [];

      protocolOrder.forEach(protocol => {
        const conns = groups.get(protocol);
        if (conns && conns.length > 0) {
          result.push({ protocol, connections: conns });
        }
      });

      return result;
    }, [filteredConnections]);

    // ─── Glass Style ─────────────────────────────────────────────────────

    const glassCardStyle = isModern && tokens.glass ? {
      backdropFilter: tokens.glass.blur,
      WebkitBackdropFilter: tokens.glass.blur,
      backgroundColor: tokens.glass.bg,
      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.glass.border}`,
    } : {};

    // ─── Render: Loading ─────────────────────────────────────────────────

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
            flexDirection: 'column' as const,
            alignItems: 'center',
            justifyContent: 'center',
            gap: tokens.spacing[3],
            ...style,
          }}
        >
          <Loader2
            size={32}
            color={tokens.colors.primaryScale[500]}
            style={{ animation: 'spin 1s linear infinite' }}
          />
          <span style={{
            fontSize: tokens.typography.fontSize.sm,
            color: tokens.colors.neutral[500],
          }}>
            Loading connections...
          </span>
        </div>
      );
    }

    // ─── Render: Header ──────────────────────────────────────────────────

    const renderHeader = () => (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: tokens.spacing[4],
      }}>
        <div>
          <h1 style={{
            fontSize: tokens.typography.fontSize['2xl'],
            fontWeight: tokens.typography.fontWeight.bold,
            color: tokens.colors.neutral[900],
            margin: 0,
            lineHeight: tokens.typography.lineHeight.tight,
          }}>
            SSO Connections
          </h1>
          <p style={{
            fontSize: tokens.typography.fontSize.sm,
            color: tokens.colors.neutral[500],
            margin: 0,
            marginTop: tokens.spacing[1],
          }}>
            Manage single sign-on provider connections for your organization
          </p>
        </div>
        {onAddConnection && (
          <button
            onClick={onAddConnection}
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
            Add Connection
          </button>
        )}
      </div>
    );

    // ─── Render: Stats Ribbon ────────────────────────────────────────────

    const renderStatsRibbon = () => {
      if (!stats) return null;

      const statItems = [
        {
          label: 'Total',
          value: stats.total,
          icon: <Shield size={14} />,
          color: tokens.colors.primaryScale[700],
          bgColor: tokens.colors.primaryScale[50],
          borderColor: tokens.colors.primaryScale[200],
        },
        {
          label: 'Active',
          value: stats.active,
          icon: <CheckCircle size={14} />,
          color: tokens.colors.successScale[700],
          bgColor: tokens.colors.successScale[50],
          borderColor: tokens.colors.successScale[200],
        },
        {
          label: 'Errors',
          value: stats.errors,
          icon: <XCircle size={14} />,
          color: tokens.colors.errorScale[700],
          bgColor: tokens.colors.errorScale[50],
          borderColor: tokens.colors.errorScale[200],
        },
        {
          label: 'Users',
          value: stats.totalUsers,
          icon: <Users size={14} />,
          color: tokens.colors.infoScale[700],
          bgColor: tokens.colors.infoScale[50],
          borderColor: tokens.colors.infoScale[200],
        },
      ];

      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing[3],
          padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
          marginBottom: tokens.spacing[4],
          ...createSurfaceStyle(tokens, { elevation: 'sm' }),
          backgroundColor: tokens.colors.common.white,
          ...(isModern ? glassCardStyle : {}),
        }}>
          {statItems.map(item => (
            <div
              key={item.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
                padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.full,
                backgroundColor: item.bgColor,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${item.borderColor}`,
              }}
            >
              <span style={{ color: item.color, display: 'flex', alignItems: 'center' }}>
                {item.icon}
              </span>
              <span style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[600],
              }}>
                {item.label}
              </span>
              <span style={{
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.bold,
                color: item.color,
              }}>
                {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
              </span>
            </div>
          ))}

          {stats.certificatesExpiring != null && stats.certificatesExpiring > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[2],
              padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
              borderRadius: tokens.borderRadius.full,
              backgroundColor: tokens.colors.warningScale[50],
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.warningScale[200]}`,
            }}>
              <AlertTriangle size={14} color={tokens.colors.warningScale[600]} />
              <span style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[600],
              }}>
                Certs Expiring
              </span>
              <span style={{
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.warningScale[700],
              }}>
                {stats.certificatesExpiring}
              </span>
            </div>
          )}
        </div>
      );
    };

    // ─── Render: Filter Bar ──────────────────────────────────────────────

    const renderFilterBar = () => {
      const allProtocols: SsoProtocol[] = ['SAML', 'OIDC', 'OAuth2', 'LDAP'];

      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing[3],
          marginBottom: tokens.spacing[4],
          flexWrap: 'wrap' as const,
        }}>
          {/* Protocol filter dropdown */}
          <div style={{ position: 'relative' as const }}>
            <button
              onClick={() => setShowProtocolDropdown(!showProtocolDropdown)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${filterProtocol ? tokens.colors.primaryScale[300] : tokens.colors.neutral[200]}`,
                backgroundColor: filterProtocol ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                color: filterProtocol ? tokens.colors.primaryScale[600] : tokens.colors.neutral[600],
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
                outline: 'none',
              }}
            >
              {filterProtocol ? (
                <>
                  <span style={{ display: 'flex', alignItems: 'center', color: getProtocolConfig(filterProtocol, tokens).color }}>
                    {getProtocolConfig(filterProtocol, tokens).icon}
                  </span>
                  {filterProtocol}
                </>
              ) : (
                'All Protocols'
              )}
              <ChevronDown size={14} />
            </button>
            {showProtocolDropdown && (
              <div style={{
                position: 'absolute' as const,
                top: '100%',
                left: 0,
                marginTop: tokens.spacing[1],
                minWidth: 240,
                backgroundColor: tokens.colors.common.white,
                borderRadius: tokens.borderRadius.lg,
                boxShadow: tokens.shadows.lg,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                zIndex: 50,
                padding: `${tokens.spacing[1]}px 0`,
                overflow: 'hidden' as const,
              }}>
                <div
                  onClick={() => handleFilterChange(null)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[2],
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                    fontSize: tokens.typography.fontSize.sm,
                    color: !filterProtocol ? tokens.colors.primaryScale[600] : tokens.colors.neutral[700],
                    backgroundColor: !filterProtocol ? tokens.colors.primaryScale[50] : 'transparent',
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                    fontWeight: !filterProtocol ? tokens.typography.fontWeight.medium : tokens.typography.fontWeight.normal,
                  }}
                >
                  All Protocols
                </div>
                {allProtocols.map(protocol => {
                  const cfg = getProtocolConfig(protocol, tokens);
                  const count = connections.filter(c => c.protocol === protocol).length;
                  return (
                    <div
                      key={protocol}
                      onClick={() => handleFilterChange(protocol)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: tokens.spacing[2],
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                        fontSize: tokens.typography.fontSize.sm,
                        color: filterProtocol === protocol ? tokens.colors.primaryScale[600] : tokens.colors.neutral[700],
                        backgroundColor: filterProtocol === protocol ? tokens.colors.primaryScale[50] : 'transparent',
                        cursor: 'pointer',
                        transition: `all ${tokens.motion.hover}`,
                        fontWeight: filterProtocol === protocol ? tokens.typography.fontWeight.medium : tokens.typography.fontWeight.normal,
                      }}
                    >
                      <span style={{ color: cfg.color, display: 'flex', alignItems: 'center' }}>
                        {cfg.icon}
                      </span>
                      <span style={{ flex: 1 }}>{cfg.label}</span>
                      <span style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[400],
                        fontWeight: tokens.typography.fontWeight.medium,
                      }}>
                        {count}
                      </span>
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
              placeholder="Search connections..."
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

    // ─── Render: Connection Row ──────────────────────────────────────────

    const renderConnectionRow = (connection: SsoConnection) => {
      const providerCfg = getProviderConfig(connection.provider, tokens);
      const statusCfg = getStatusConfig(connection.status, tokens);
      const isHovered = hoveredConnectionId === connection.id;
      const certExpiring = isCertExpiringSoon(connection);
      const certExpired = isCertExpired(connection);
      const certDate = connection.certExpiresAt ?? connection.certificate?.expiry;

      return (
        <div
          key={connection.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[3],
            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
            backgroundColor: isHovered ? tokens.colors.neutral[50] : 'transparent',
            cursor: 'pointer',
            transition: `all ${tokens.motion.hover}`,
          }}
          onMouseEnter={() => setHoveredConnectionId(connection.id)}
          onMouseLeave={() => setHoveredConnectionId(null)}
          onClick={() => onConnectionClick?.(connection.id)}
        >
          {/* Provider icon */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 44,
            height: 44,
            borderRadius: tokens.borderRadius.lg,
            backgroundColor: providerCfg.bgColor,
            color: providerCfg.textColor,
            flexShrink: 0,
            fontSize: tokens.typography.fontSize.lg,
            fontWeight: tokens.typography.fontWeight.bold,
          }}>
            {providerCfg.initial}
          </div>

          {/* Connection info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[2],
              marginBottom: tokens.spacing[1],
            }}>
              <span style={{
                fontSize: tokens.typography.fontSize.md,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[900],
                overflow: 'hidden' as const,
                textOverflow: 'ellipsis' as const,
                whiteSpace: 'nowrap' as const,
              }}>
                {connection.name}
              </span>
              {connection.autoProvision && (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3,
                  padding: `2px ${tokens.spacing[2]}px`,
                  borderRadius: tokens.borderRadius.full,
                  fontSize: '10px',
                  fontWeight: tokens.typography.fontWeight.medium,
                  backgroundColor: tokens.colors.infoScale[100],
                  color: tokens.colors.infoScale[700],
                }}>
                  <Zap size={10} />
                  Auto-provision
                </span>
              )}
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[2],
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.neutral[500],
            }}>
              <Globe size={12} />
              <span>{connection.domain}</span>
              <span style={{ color: tokens.colors.neutral[300] }}>&middot;</span>
              <span style={{
                padding: `0 ${tokens.spacing[2]}px`,
                borderRadius: tokens.borderRadius.full,
                backgroundColor: tokens.colors.neutral[100],
                color: tokens.colors.neutral[600],
                fontWeight: tokens.typography.fontWeight.medium,
                fontSize: '10px',
              }}>
                {providerCfg.label}
              </span>
            </div>
          </div>

          {/* Status badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[1],
            padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
            borderRadius: tokens.borderRadius.full,
            backgroundColor: statusCfg.bgColor,
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${statusCfg.borderColor}`,
            flexShrink: 0,
          }}>
            <span style={createStatusDotStyle(tokens, statusCfg.dotColor)} />
            <span style={{
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.medium,
              color: statusCfg.textColor,
            }}>
              {statusCfg.label}
            </span>
          </div>

          {/* Users count */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[1],
            fontSize: tokens.typography.fontSize.sm,
            color: tokens.colors.neutral[600],
            minWidth: 75,
            flexShrink: 0,
          }}>
            <Users size={14} color={tokens.colors.neutral[400]} />
            <span>{connection.usersCount.toLocaleString()}</span>
          </div>

          {/* Last sync */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[1],
            fontSize: tokens.typography.fontSize.xs,
            color: tokens.colors.neutral[500],
            minWidth: 100,
            flexShrink: 0,
          }}>
            {connection.lastSync ? (
              <>
                {connection.syncStatus === 'success' && <CheckCircle size={12} color={tokens.colors.successScale[500]} />}
                {connection.syncStatus === 'failed' && <XCircle size={12} color={tokens.colors.errorScale[500]} />}
                {connection.syncStatus === 'pending' && <RefreshCw size={12} color={tokens.colors.warningScale[500]} />}
                {!connection.syncStatus && <Clock size={12} color={tokens.colors.neutral[400]} />}
                <span>{formatDistanceToNow(connection.lastSync, { addSuffix: true })}</span>
              </>
            ) : (
              <>
                <Clock size={12} color={tokens.colors.neutral[300]} />
                <span style={{ color: tokens.colors.neutral[400] }}>Never synced</span>
              </>
            )}
          </div>

          {/* Cert expiry warning */}
          <div style={{
            minWidth: 28,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {certExpired && (
              <div title="Certificate expired">
                <ShieldX size={16} color={tokens.colors.errorScale[500]} />
              </div>
            )}
            {certExpiring && !certExpired && (
              <div title={`Certificate expires ${certDate ? formatDistanceToNow(certDate, { addSuffix: true }) : 'soon'}`}>
                <ShieldAlert size={16} color={tokens.colors.warningScale[500]} />
              </div>
            )}
            {!certExpired && !certExpiring && certDate && (
              <div title="Certificate valid">
                <ShieldCheck size={16} color={tokens.colors.successScale[400]} />
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[1],
            opacity: isHovered ? 1 : 0,
            transition: `opacity ${tokens.motion.hover}`,
            flexShrink: 0,
          }}>
            {/* Toggle switch */}
            {onToggleConnection && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggle(connection.id, connection.status);
                }}
                title={connection.status === 'active' ? 'Disable' : 'Enable'}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: connection.status === 'active' ? 'flex-end' : 'flex-start',
                  width: 40,
                  height: 22,
                  padding: 2,
                  borderRadius: tokens.borderRadius.full,
                  backgroundColor: connection.status === 'active' ? tokens.colors.successScale[500] : tokens.colors.neutral[300],
                  border: 'none',
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  outline: 'none',
                  flexShrink: 0,
                }}
              >
                <div style={{
                  width: 18,
                  height: 18,
                  borderRadius: tokens.borderRadius.full,
                  backgroundColor: tokens.colors.common.white,
                  boxShadow: tokens.shadows.sm,
                }} />
              </button>
            )}

            {/* Test button */}
            {onTestConnection && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTestConnection(connection.id);
                }}
                title="Test Connection"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 32,
                  height: 32,
                  borderRadius: tokens.borderRadius.md,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  backgroundColor: tokens.colors.common.white,
                  color: tokens.colors.neutral[600],
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  outline: 'none',
                }}
              >
                <Play size={14} />
              </button>
            )}

            {/* Sync button */}
            {onSyncConnection && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSyncConnection(connection.id);
                }}
                title="Sync Users"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 32,
                  height: 32,
                  borderRadius: tokens.borderRadius.md,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  backgroundColor: tokens.colors.common.white,
                  color: tokens.colors.neutral[600],
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  outline: 'none',
                }}
              >
                <RefreshCw size={14} />
              </button>
            )}

            {/* Configure button */}
            {onEditConnection && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditConnection(connection.id);
                }}
                title="Configure"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 32,
                  height: 32,
                  borderRadius: tokens.borderRadius.md,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  backgroundColor: tokens.colors.common.white,
                  color: tokens.colors.neutral[600],
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  outline: 'none',
                }}
              >
                <Settings size={14} />
              </button>
            )}

            {/* Delete button */}
            {onDeleteConnection && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteConnection(connection.id);
                }}
                title="Delete"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 32,
                  height: 32,
                  borderRadius: tokens.borderRadius.md,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.errorScale[200]}`,
                  backgroundColor: tokens.colors.common.white,
                  color: tokens.colors.errorScale[600],
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  outline: 'none',
                }}
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>
      );
    };

    // ─── Render: Error Banner ────────────────────────────────────────────

    const renderErrorBanner = (connection: SsoConnection) => {
      if (!connection.errorMessage) return null;
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing[2],
          padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
          backgroundColor: tokens.colors.errorScale[50],
          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.errorScale[100]}`,
          fontSize: tokens.typography.fontSize.xs,
          color: tokens.colors.errorScale[700],
        }}>
          <AlertTriangle size={12} color={tokens.colors.errorScale[500]} />
          <span>{connection.errorMessage}</span>
        </div>
      );
    };

    // ─── Render: Cert Warning ────────────────────────────────────────────

    const renderCertWarning = (connection: SsoConnection) => {
      const certDate = connection.certExpiresAt ?? connection.certificate?.expiry;
      if (!certDate) return null;
      const expired = isCertExpired(connection);
      const expiring = isCertExpiringSoon(connection);

      if (!expired && !expiring) return null;

      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing[2],
          padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
          backgroundColor: expired ? tokens.colors.errorScale[50] : tokens.colors.warningScale[50],
          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${expired ? tokens.colors.errorScale[100] : tokens.colors.warningScale[100]}`,
          fontSize: tokens.typography.fontSize.xs,
          color: expired ? tokens.colors.errorScale[700] : tokens.colors.warningScale[700],
        }}>
          <FileKey size={12} />
          <span>
            {expired
              ? 'Certificate expired — connection may fail'
              : `Certificate expires ${formatDistanceToNow(certDate, { addSuffix: true })}`}
          </span>
        </div>
      );
    };

    // ─── Render: Protocol Group ──────────────────────────────────────────

    const renderGroup = (group: { protocol: SsoProtocol; connections: SsoConnection[] }) => {
      const protocolCfg = getProtocolConfig(group.protocol, tokens);

      return (
        <div
          key={group.protocol}
          style={{
            ...createCardStyle(tokens, { elevation: 'sm', glass: isModern, padding: 0 }),
            marginBottom: tokens.spacing[4],
            overflow: 'hidden' as const,
            ...(isModern ? glassCardStyle : {}),
          }}
        >
          {/* Group header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[2],
            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
            backgroundColor: protocolCfg.bgColor,
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${protocolCfg.borderColor}`,
          }}>
            <span style={{ color: protocolCfg.color, display: 'flex', alignItems: 'center' }}>
              {protocolCfg.icon}
            </span>
            <span style={{
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[900],
            }}>
              {protocolCfg.label}
            </span>
            <span style={{
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.neutral[500],
              fontWeight: tokens.typography.fontWeight.normal,
            }}>
              {protocolCfg.description}
            </span>
            <div style={{ flex: 1 }} />
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 22,
              height: 22,
              padding: `0 ${tokens.spacing[2]}px`,
              borderRadius: tokens.borderRadius.full,
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.semibold,
              backgroundColor: tokens.colors.neutral[200],
              color: tokens.colors.neutral[700],
            }}>
              {group.connections.length}
            </span>
          </div>

          {/* Connection rows */}
          {group.connections.map(conn => (
            <div key={conn.id}>
              {renderErrorBanner(conn)}
              {renderCertWarning(conn)}
              {renderConnectionRow(conn)}
            </div>
          ))}
        </div>
      );
    };

    // ─── Render: Empty State ─────────────────────────────────────────────

    const renderEmptyState = () => (
      <div style={{
        ...createCardStyle(tokens, { elevation: 'sm', glass: isModern }),
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center',
        padding: `${tokens.spacing[12]}px ${tokens.spacing[6]}px`,
        textAlign: 'center' as const,
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
          <Shield size={28} color={tokens.colors.primaryScale[400]} />
        </div>
        <div style={{
          fontSize: tokens.typography.fontSize.lg,
          fontWeight: tokens.typography.fontWeight.semibold,
          color: tokens.colors.neutral[800],
          marginBottom: tokens.spacing[2],
        }}>
          {searchQuery || filterProtocol ? emptyText : 'No SSO connections configured'}
        </div>
        <div style={{
          fontSize: tokens.typography.fontSize.sm,
          color: tokens.colors.neutral[500],
          marginBottom: tokens.spacing[6],
          maxWidth: 420,
          lineHeight: tokens.typography.lineHeight.relaxed,
        }}>
          {searchQuery || filterProtocol
            ? 'Try adjusting your filters or search query to find what you are looking for.'
            : 'Set up SSO connections to allow users to authenticate with their organization identity provider.'}
        </div>
        {onAddConnection && !(searchQuery || filterProtocol) && (
          <button
            onClick={onAddConnection}
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
            Add Your First Connection
          </button>
        )}
      </div>
    );

    // ─── Main Render ─────────────────────────────────────────────────────

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
        {renderStatsRibbon()}
        {renderFilterBar()}
        {groupedConnections.length === 0
          ? renderEmptyState()
          : groupedConnections.map(renderGroup)}
      </div>
    );
  },
});
