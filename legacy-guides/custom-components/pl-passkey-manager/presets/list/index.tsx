'use client';

/**
 * PlPasskeyManager - List Preset
 * Detailed list view of registered WebAuthn passkeys with stats ribbon,
 * search, transport indicators, backup status, and inline actions.
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
  PlPasskeyManagerProps,
  Passkey,
  PasskeyStatus,
  PasskeyTransport,
  AuthenticatorType,
} from '../../core';
import { PL_PASSKEY_MANAGER_DEFAULTS } from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  Fingerprint,
  Usb,
  Bluetooth,
  Wifi,
  Smartphone,
  Monitor,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Search,
  Plus,
  Trash2,
  Edit3,
  X,
  Clock,
  Hash,
  Key,
  KeyRound,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  ChevronRight,
  Laptop,
  Globe,
} from 'lucide-react';

// ─── Transport Config ────────────────────────────────────────────────────────

interface TransportConfig {
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

function getTransportConfig(transport: PasskeyTransport, tokens: DesignTokens, iconSize = 14): TransportConfig {
  switch (transport) {
    case 'internal':
      return {
        label: 'Built-in',
        icon: <Fingerprint size={iconSize} />,
        color: tokens.colors.successScale[600],
        bgColor: tokens.colors.successScale[50],
      };
    case 'usb':
      return {
        label: 'USB',
        icon: <Usb size={iconSize} />,
        color: tokens.colors.infoScale[600],
        bgColor: tokens.colors.infoScale[50],
      };
    case 'ble':
      return {
        label: 'Bluetooth',
        icon: <Bluetooth size={iconSize} />,
        color: tokens.colors.primaryScale[600],
        bgColor: tokens.colors.primaryScale[50],
      };
    case 'nfc':
      return {
        label: 'NFC',
        icon: <Wifi size={iconSize} />,
        color: tokens.colors.warningScale[600],
        bgColor: tokens.colors.warningScale[50],
      };
    case 'hybrid':
      return {
        label: 'Hybrid',
        icon: <RefreshCw size={iconSize} />,
        color: tokens.colors.secondaryScale[600],
        bgColor: tokens.colors.secondaryScale[50],
      };
  }
}

// ─── Status Config ───────────────────────────────────────────────────────────

interface StatusConfig {
  label: string;
  dotColor: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
}

function getStatusConfig(status: PasskeyStatus, tokens: DesignTokens): StatusConfig {
  switch (status) {
    case 'active':
      return {
        label: 'Active',
        dotColor: tokens.colors.successScale[500],
        bgColor: tokens.colors.successScale[50],
        textColor: tokens.colors.successScale[700],
        borderColor: tokens.colors.successScale[200],
      };
    case 'revoked':
      return {
        label: 'Revoked',
        dotColor: tokens.colors.errorScale[500],
        bgColor: tokens.colors.errorScale[50],
        textColor: tokens.colors.errorScale[700],
        borderColor: tokens.colors.errorScale[200],
      };
    case 'expired':
      return {
        label: 'Expired',
        dotColor: tokens.colors.warningScale[500],
        bgColor: tokens.colors.warningScale[50],
        textColor: tokens.colors.warningScale[700],
        borderColor: tokens.colors.warningScale[200],
      };
  }
}

// ─── Authenticator Type Config ───────────────────────────────────────────────

function getAuthenticatorConfig(type: AuthenticatorType, tokens: DesignTokens): {
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
} {
  switch (type) {
    case 'platform':
      return {
        label: 'Platform',
        icon: <Smartphone size={12} />,
        color: tokens.colors.primaryScale[700],
        bgColor: tokens.colors.primaryScale[100],
      };
    case 'cross-platform':
      return {
        label: 'Security Key',
        icon: <Key size={12} />,
        color: tokens.colors.secondaryScale[700],
        bgColor: tokens.colors.secondaryScale[100],
      };
  }
}

// ─── Device Icon Helper ──────────────────────────────────────────────────────

function getDeviceIcon(passkey: Passkey, tokens: DesignTokens): React.ReactNode {
  const iconSize = 20;
  // Prioritize transport for icon selection
  if (passkey.transport.includes('internal')) {
    return <Fingerprint size={iconSize} />;
  }
  if (passkey.transport.includes('usb')) {
    return <Usb size={iconSize} />;
  }
  if (passkey.transport.includes('ble')) {
    return <Bluetooth size={iconSize} />;
  }
  if (passkey.transport.includes('nfc')) {
    return <Wifi size={iconSize} />;
  }
  if (passkey.transport.includes('hybrid')) {
    return <Smartphone size={iconSize} />;
  }
  // Fallback based on authenticator type
  if (passkey.authenticatorType === 'platform') {
    return <Laptop size={iconSize} />;
  }
  return <KeyRound size={iconSize} />;
}

function getDeviceIconColor(passkey: Passkey, tokens: DesignTokens): { color: string; bg: string } {
  if (passkey.transport.includes('internal')) {
    return { color: tokens.colors.successScale[600], bg: tokens.colors.successScale[100] };
  }
  if (passkey.transport.includes('usb')) {
    return { color: tokens.colors.infoScale[600], bg: tokens.colors.infoScale[100] };
  }
  if (passkey.transport.includes('ble')) {
    return { color: tokens.colors.primaryScale[600], bg: tokens.colors.primaryScale[100] };
  }
  if (passkey.transport.includes('nfc')) {
    return { color: tokens.colors.warningScale[600], bg: tokens.colors.warningScale[100] };
  }
  if (passkey.transport.includes('hybrid')) {
    return { color: tokens.colors.secondaryScale[600], bg: tokens.colors.secondaryScale[100] };
  }
  return { color: tokens.colors.neutral[600], bg: tokens.colors.neutral[100] };
}

// ─── Format Date Helper ──────────────────────────────────────────────────────

function formatDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// ─── List Preset ─────────────────────────────────────────────────────────────

export const ListPlPasskeyManager = createPreset<PlPasskeyManagerProps>({
  name: 'PlPasskeyManager.List',
  render: ({ primitives, props, tokens, engine }: PresetContext<PlPasskeyManagerProps>) => {
    const { Box, Stack, Spinner } = primitives;
    const isModern = tokens.surface.useGlass;

    const {
      passkeys,
      onPasskeyClick,
      onRegister,
      onRevoke,
      onRename,
      onDelete,
      loading = false,
      emptyText = PL_PASSKEY_MANAGER_DEFAULTS.emptyText,
      className,
      style,
    } = props;

    // ─── Internal State ──────────────────────────────────────────────────

    const [searchQuery, setSearchQuery] = useState('');
    const [hoveredPasskeyId, setHoveredPasskeyId] = useState<string | null>(null);
    const [renamingId, setRenamingId] = useState<string | null>(null);
    const [renameValue, setRenameValue] = useState('');

    // ─── Handlers ────────────────────────────────────────────────────────

    const handleSearchChange = useCallback((query: string) => {
      setSearchQuery(query);
    }, []);

    const handleStartRename = useCallback((passkey: Passkey) => {
      setRenamingId(passkey.id);
      setRenameValue(passkey.name);
    }, []);

    const handleConfirmRename = useCallback((passkeyId: string) => {
      if (renameValue.trim()) {
        onRename?.(passkeyId, renameValue.trim());
      }
      setRenamingId(null);
      setRenameValue('');
    }, [renameValue, onRename]);

    const handleCancelRename = useCallback(() => {
      setRenamingId(null);
      setRenameValue('');
    }, []);

    // ─── Filtered Passkeys ───────────────────────────────────────────────

    const filteredPasskeys = useMemo(() => {
      if (!searchQuery) return passkeys;
      const lower = searchQuery.toLowerCase();
      return passkeys.filter(p =>
        p.name.toLowerCase().includes(lower) ||
        p.deviceName.toLowerCase().includes(lower) ||
        p.os?.toLowerCase().includes(lower) ||
        p.browser?.toLowerCase().includes(lower) ||
        p.credentialId.toLowerCase().includes(lower)
      );
    }, [passkeys, searchQuery]);

    // ─── Stats ───────────────────────────────────────────────────────────

    const stats = useMemo(() => {
      const total = passkeys.length;
      const active = passkeys.filter(p => p.status === 'active').length;
      const platform = passkeys.filter(p => p.authenticatorType === 'platform').length;
      const crossPlatform = passkeys.filter(p => p.authenticatorType === 'cross-platform').length;
      const backedUp = passkeys.filter(p => p.isBackedUp).length;
      return { total, active, platform, crossPlatform, backedUp };
    }, [passkeys]);

    // ─── Glass Style ─────────────────────────────────────────────────────

    const glassCardStyle = isModern && tokens.glass ? {
      backdropFilter: tokens.glass.blur,
      WebkitBackdropFilter: tokens.glass.blur,
      backgroundColor: tokens.glass.bg,
      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.glass.border}`,
    } : {};

    // ─── Loading State ───────────────────────────────────────────────────

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

    // ─── Render: Header ──────────────────────────────────────────────────

    const renderHeader = () => (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: tokens.spacing[5],
      }}>
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[2],
            marginBottom: tokens.spacing[1],
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              borderRadius: tokens.borderRadius.lg,
              backgroundColor: tokens.colors.primaryScale[100],
              color: tokens.colors.primaryScale[600],
            }}>
              <KeyRound size={20} />
            </div>
            <h1 style={{
              fontSize: tokens.typography.fontSize['2xl'],
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
              margin: 0,
              lineHeight: tokens.typography.lineHeight.tight,
            }}>
              Passkey Manager
            </h1>
          </div>
          <p style={{
            fontSize: tokens.typography.fontSize.sm,
            color: tokens.colors.neutral[500],
            margin: 0,
            marginLeft: 44,
          }}>
            Manage your registered WebAuthn passkeys for passwordless authentication
          </p>
        </div>
        {onRegister && (
          <button
            onClick={onRegister}
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
            Register Passkey
          </button>
        )}
      </div>
    );

    // ─── Render: Stats Ribbon ────────────────────────────────────────────

    const renderStatsRibbon = () => {
      const statItems = [
        {
          label: 'Total Passkeys',
          value: stats.total,
          icon: <KeyRound size={16} />,
          color: tokens.colors.primaryScale[600],
          bgColor: tokens.colors.primaryScale[50],
        },
        {
          label: 'Active',
          value: stats.active,
          icon: <CheckCircle size={16} />,
          color: tokens.colors.successScale[600],
          bgColor: tokens.colors.successScale[50],
        },
        {
          label: 'Platform',
          value: stats.platform,
          icon: <Smartphone size={16} />,
          color: tokens.colors.infoScale[600],
          bgColor: tokens.colors.infoScale[50],
        },
        {
          label: 'Security Keys',
          value: stats.crossPlatform,
          icon: <Key size={16} />,
          color: tokens.colors.secondaryScale[600],
          bgColor: tokens.colors.secondaryScale[50],
        },
        {
          label: 'Backed Up',
          value: stats.backedUp,
          icon: <ShieldCheck size={16} />,
          color: tokens.colors.successScale[600],
          bgColor: tokens.colors.successScale[50],
        },
      ];

      return (
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${statItems.length}, 1fr)`,
          gap: tokens.spacing[3],
          marginBottom: tokens.spacing[5],
        }}>
          {statItems.map((stat) => (
            <div
              key={stat.label}
              style={{
                ...createCardStyle(tokens, { elevation: 'sm', glass: isModern }),
                padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[3],
                ...(isModern ? glassCardStyle : {}),
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 36,
                height: 36,
                borderRadius: tokens.borderRadius.md,
                backgroundColor: stat.bgColor,
                color: stat.color,
                flexShrink: 0,
              }}>
                {stat.icon}
              </div>
              <div>
                <div style={{
                  fontSize: tokens.typography.fontSize['xl'],
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.neutral[900],
                  lineHeight: tokens.typography.lineHeight.tight,
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[500],
                  fontWeight: tokens.typography.fontWeight.medium,
                }}>
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    };

    // ─── Render: Search Bar ──────────────────────────────────────────────

    const renderSearchBar = () => (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacing[3],
        marginBottom: tokens.spacing[4],
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing[2],
          padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
          borderRadius: tokens.borderRadius.md,
          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          backgroundColor: tokens.colors.common.white,
          flex: 1,
          transition: `all ${tokens.motion.hover}`,
        }}>
          <Search size={16} color={tokens.colors.neutral[400]} />
          <input
            type="text"
            placeholder="Search passkeys by name, device, OS, or browser..."
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
              style={{ cursor: 'pointer', flexShrink: 0 }}
              onClick={() => handleSearchChange('')}
            />
          )}
        </div>
        <div style={{
          fontSize: tokens.typography.fontSize.sm,
          color: tokens.colors.neutral[500],
          whiteSpace: 'nowrap' as const,
        }}>
          {filteredPasskeys.length} of {passkeys.length} passkeys
        </div>
      </div>
    );

    // ─── Render: Transport Icons Row ─────────────────────────────────────

    const renderTransportIcons = (transports: PasskeyTransport[]) => (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacing[1],
      }}>
        {transports.map((transport) => {
          const cfg = getTransportConfig(transport, tokens, 12);
          return (
            <div
              key={transport}
              title={cfg.label}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 24,
                height: 24,
                borderRadius: tokens.borderRadius.sm,
                backgroundColor: cfg.bgColor,
                color: cfg.color,
                transition: `all ${tokens.motion.hover}`,
              }}
            >
              {cfg.icon}
            </div>
          );
        })}
      </div>
    );

    // ─── Render: Backup Status Indicator ─────────────────────────────────

    const renderBackupStatus = (passkey: Passkey) => {
      if (!passkey.isBackupEligible) {
        return (
          <div
            title="Backup not supported"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              padding: `2px ${tokens.spacing[2]}px`,
              borderRadius: tokens.borderRadius.full,
              fontSize: '10px',
              fontWeight: tokens.typography.fontWeight.medium,
              backgroundColor: tokens.colors.neutral[100],
              color: tokens.colors.neutral[500],
            }}
          >
            <ShieldAlert size={10} />
            No Backup
          </div>
        );
      }

      if (passkey.isBackedUp) {
        return (
          <div
            title="Credential is backed up and synced"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              padding: `2px ${tokens.spacing[2]}px`,
              borderRadius: tokens.borderRadius.full,
              fontSize: '10px',
              fontWeight: tokens.typography.fontWeight.medium,
              backgroundColor: tokens.colors.successScale[50],
              color: tokens.colors.successScale[700],
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.successScale[200]}`,
            }}
          >
            <ShieldCheck size={10} />
            Synced
          </div>
        );
      }

      return (
        <div
          title="Backup eligible but not yet synced"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: tokens.spacing[1],
            padding: `2px ${tokens.spacing[2]}px`,
            borderRadius: tokens.borderRadius.full,
            fontSize: '10px',
            fontWeight: tokens.typography.fontWeight.medium,
            backgroundColor: tokens.colors.warningScale[50],
            color: tokens.colors.warningScale[700],
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.warningScale[200]}`,
          }}
        >
          <Shield size={10} />
          Eligible
        </div>
      );
    };

    // ─── Render: Passkey Row ─────────────────────────────────────────────

    const renderPasskeyRow = (passkey: Passkey, index: number) => {
      const statusCfg = getStatusConfig(passkey.status, tokens);
      const authCfg = getAuthenticatorConfig(passkey.authenticatorType, tokens);
      const iconColors = getDeviceIconColor(passkey, tokens);
      const isHovered = hoveredPasskeyId === passkey.id;
      const isRenaming = renamingId === passkey.id;
      const isLastItem = index === filteredPasskeys.length - 1;

      return (
        <div
          key={passkey.id}
          style={{
            display: 'flex',
            alignItems: 'stretch',
            borderBottom: !isLastItem
              ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`
              : 'none',
            backgroundColor: isHovered ? tokens.colors.neutral[50] : 'transparent',
            transition: `all ${tokens.motion.hover}`,
          }}
          onMouseEnter={() => setHoveredPasskeyId(passkey.id)}
          onMouseLeave={() => setHoveredPasskeyId(null)}
        >
          {/* Left color accent for status */}
          <div style={{
            width: 3,
            backgroundColor: statusCfg.dotColor,
            borderRadius: index === 0 ? `${tokens.borderRadius.lg} 0 0 0` : isLastItem ? `0 0 0 ${tokens.borderRadius.lg}` : 0,
            flexShrink: 0,
            opacity: passkey.status === 'active' ? 1 : 0.5,
          }} />

          {/* Main content area */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[4],
              padding: `${tokens.spacing[4]}px ${tokens.spacing[5]}px`,
              flex: 1,
              cursor: onPasskeyClick ? 'pointer' : 'default',
            }}
            onClick={() => onPasskeyClick?.(passkey.id)}
          >
            {/* Device icon */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: tokens.borderRadius.lg,
              backgroundColor: iconColors.bg,
              color: iconColors.color,
              flexShrink: 0,
              transition: `all ${tokens.motion.hover}`,
              transform: isHovered ? tokens.motion.transform : 'none',
            }}>
              {getDeviceIcon(passkey, tokens)}
            </div>

            {/* Passkey info block */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Row 1: Name + badges */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
                marginBottom: tokens.spacing[1],
                flexWrap: 'wrap' as const,
              }}>
                {isRenaming ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[1],
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="text"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleConfirmRename(passkey.id);
                        if (e.key === 'Escape') handleCancelRename();
                      }}
                      autoFocus
                      style={{
                        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[300]}`,
                        borderRadius: tokens.borderRadius.sm,
                        padding: `2px ${tokens.spacing[2]}px`,
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.neutral[900],
                        backgroundColor: tokens.colors.common.white,
                        outline: 'none',
                        fontFamily: 'inherit',
                        width: 180,
                      }}
                    />
                    <button
                      onClick={() => handleConfirmRename(passkey.id)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 24,
                        height: 24,
                        borderRadius: tokens.borderRadius.sm,
                        border: 'none',
                        backgroundColor: tokens.colors.successScale[500],
                        color: tokens.colors.common.white,
                        cursor: 'pointer',
                        outline: 'none',
                      }}
                    >
                      <CheckCircle size={12} />
                    </button>
                    <button
                      onClick={handleCancelRename}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 24,
                        height: 24,
                        borderRadius: tokens.borderRadius.sm,
                        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                        backgroundColor: tokens.colors.common.white,
                        color: tokens.colors.neutral[500],
                        cursor: 'pointer',
                        outline: 'none',
                      }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <span style={{
                    fontSize: tokens.typography.fontSize.md,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[900],
                  }}>
                    {passkey.name}
                  </span>
                )}

                {/* Status badge */}
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3,
                  padding: `2px ${tokens.spacing[2]}px`,
                  borderRadius: tokens.borderRadius.full,
                  fontSize: '10px',
                  fontWeight: tokens.typography.fontWeight.medium,
                  backgroundColor: statusCfg.bgColor,
                  color: statusCfg.textColor,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${statusCfg.borderColor}`,
                }}>
                  <span style={createStatusDotStyle(tokens, statusCfg.dotColor)} />
                  {statusCfg.label}
                </span>

                {/* Authenticator type badge */}
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3,
                  padding: `2px ${tokens.spacing[2]}px`,
                  borderRadius: tokens.borderRadius.full,
                  fontSize: '10px',
                  fontWeight: tokens.typography.fontWeight.medium,
                  backgroundColor: authCfg.bgColor,
                  color: authCfg.color,
                }}>
                  {authCfg.icon}
                  {authCfg.label}
                </span>

                {/* Backup status */}
                {renderBackupStatus(passkey)}
              </div>

              {/* Row 2: Device details */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[500],
                marginBottom: tokens.spacing[2],
                flexWrap: 'wrap' as const,
              }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3,
                }}>
                  <Monitor size={11} />
                  {passkey.deviceName}
                </span>
                {passkey.os && (
                  <>
                    <span style={{ color: tokens.colors.neutral[300] }}>|</span>
                    <span>{passkey.os}</span>
                  </>
                )}
                {passkey.browser && (
                  <>
                    <span style={{ color: tokens.colors.neutral[300] }}>|</span>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 3,
                    }}>
                      <Globe size={11} />
                      {passkey.browser}
                    </span>
                  </>
                )}
                <span style={{ color: tokens.colors.neutral[300] }}>|</span>
                <span style={{
                  fontFamily: 'monospace',
                  fontSize: '10px',
                  color: tokens.colors.neutral[400],
                  backgroundColor: tokens.colors.neutral[100],
                  padding: `0 ${tokens.spacing[1]}px`,
                  borderRadius: tokens.borderRadius.sm,
                }}>
                  {passkey.credentialId}
                </span>
              </div>

              {/* Row 3: Transport icons + metadata */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[3],
                flexWrap: 'wrap' as const,
              }}>
                {/* Transport icons */}
                {renderTransportIcons(passkey.transport)}

                <span style={{
                  width: 1,
                  height: 16,
                  backgroundColor: tokens.colors.neutral[200],
                  flexShrink: 0,
                }} />

                {/* Last used */}
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[500],
                }}>
                  <Clock size={11} />
                  {passkey.lastUsed
                    ? `Used ${formatDistanceToNow(passkey.lastUsed, { addSuffix: true })}`
                    : 'Never used'}
                </div>

                {/* Sign count */}
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[500],
                }}>
                  <Hash size={11} />
                  {passkey.signCount.toLocaleString()} sign-ins
                </div>

                {/* Created date */}
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[400],
                }}>
                  Registered {formatDate(passkey.createdAt)}
                </div>
              </div>
            </div>

            {/* Actions column */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[2],
              opacity: isHovered ? 1 : 0,
              transition: `opacity ${tokens.motion.hover}`,
              flexShrink: 0,
            }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Rename button */}
              {onRename && passkey.status === 'active' && (
                <button
                  onClick={() => handleStartRename(passkey)}
                  title="Rename passkey"
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
                  <Edit3 size={14} />
                </button>
              )}

              {/* Revoke button */}
              {onRevoke && passkey.status === 'active' && (
                <button
                  onClick={() => onRevoke(passkey.id)}
                  title="Revoke passkey"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 32,
                    height: 32,
                    borderRadius: tokens.borderRadius.md,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.warningScale[200]}`,
                    backgroundColor: tokens.colors.common.white,
                    color: tokens.colors.warningScale[600],
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                    outline: 'none',
                  }}
                >
                  <XCircle size={14} />
                </button>
              )}

              {/* Delete button */}
              {onDelete && (
                <button
                  onClick={() => onDelete(passkey.id)}
                  title="Delete passkey"
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

              {/* Chevron */}
              {onPasskeyClick && (
                <ChevronRight
                  size={16}
                  color={tokens.colors.neutral[400]}
                  style={{ marginLeft: tokens.spacing[1] }}
                />
              )}
            </div>
          </div>
        </div>
      );
    };

    // ─── Render: Passkey List ────────────────────────────────────────────

    const renderPasskeyList = () => (
      <div style={{
        ...createCardStyle(tokens, { elevation: 'sm', glass: isModern, padding: 0 }),
        overflow: 'hidden' as const,
        ...(isModern ? glassCardStyle : {}),
      }}>
        {/* List header bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `${tokens.spacing[3]}px ${tokens.spacing[5]}px`,
          backgroundColor: tokens.colors.neutral[50],
          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[2],
          }}>
            <KeyRound size={14} color={tokens.colors.neutral[600]} />
            <span style={{
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[700],
            }}>
              Registered Passkeys
            </span>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 20,
              height: 20,
              padding: `0 ${tokens.spacing[1]}px`,
              borderRadius: tokens.borderRadius.full,
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.semibold,
              backgroundColor: tokens.colors.neutral[200],
              color: tokens.colors.neutral[700],
            }}>
              {filteredPasskeys.length}
            </span>
          </div>
          <div style={{
            fontSize: tokens.typography.fontSize.xs,
            color: tokens.colors.neutral[400],
          }}>
            Sorted by most recently used
          </div>
        </div>

        {/* Passkey rows */}
        {filteredPasskeys.map((passkey, idx) => renderPasskeyRow(passkey, idx))}
      </div>
    );

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
        ...(isModern ? glassCardStyle : {}),
      }}>
        <div style={{
          width: 72,
          height: 72,
          borderRadius: tokens.borderRadius.full,
          backgroundColor: tokens.colors.primaryScale[50],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: tokens.spacing[4],
        }}>
          <Fingerprint size={32} color={tokens.colors.primaryScale[400]} />
        </div>
        <div style={{
          fontSize: tokens.typography.fontSize.lg,
          fontWeight: tokens.typography.fontWeight.semibold,
          color: tokens.colors.neutral[800],
          marginBottom: tokens.spacing[2],
        }}>
          {searchQuery ? 'No passkeys match your search' : emptyText}
        </div>
        <div style={{
          fontSize: tokens.typography.fontSize.sm,
          color: tokens.colors.neutral[500],
          marginBottom: tokens.spacing[6],
          maxWidth: 440,
          lineHeight: tokens.typography.lineHeight.relaxed,
        }}>
          {searchQuery
            ? 'Try adjusting your search terms to find the passkey you are looking for.'
            : 'No passkeys registered. Register your first passkey for passwordless login.'}
        </div>
        {onRegister && !searchQuery && (
          <button
            onClick={onRegister}
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
            Register Your First Passkey
          </button>
        )}

        {/* Security note */}
        {!searchQuery && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[2],
            marginTop: tokens.spacing[6],
            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
            borderRadius: tokens.borderRadius.md,
            backgroundColor: tokens.colors.infoScale[50],
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.infoScale[200]}`,
            maxWidth: 480,
          }}>
            <ShieldCheck size={16} color={tokens.colors.infoScale[600]} style={{ flexShrink: 0 }} />
            <span style={{
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.infoScale[700],
              lineHeight: tokens.typography.lineHeight.relaxed,
            }}>
              Passkeys are more secure than passwords. They use biometric authentication or hardware security keys and are resistant to phishing attacks.
            </span>
          </div>
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
        {passkeys.length > 0 && renderStatsRibbon()}
        {renderSearchBar()}
        {filteredPasskeys.length === 0 ? renderEmptyState() : renderPasskeyList()}
      </div>
    );
  },
});
