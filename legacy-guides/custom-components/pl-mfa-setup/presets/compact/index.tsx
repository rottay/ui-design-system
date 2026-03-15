'use client';

/**
 * PlMfaSetup - Compact Preset
 * Dashboard-style compact view of configured MFA methods with management,
 * security scoring, recovery options, and quick actions
 */

import { useState, useMemo, useCallback } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createSurfaceStyle,
  createProgressBarStyle,
  createStatusDotStyle,
  createListItemStyle,
  createAccentBarStyle,
  createSectionHeaderStyle,
  formatDistanceToNow,
} from '../../../helpers';
import type { PlMfaSetupProps, MfaMethod, MfaMethodType, MfaMethodStatus } from '../../core';
import { PL_MFA_SETUP_DEFAULTS } from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  Smartphone,
  Mail,
  Key,
  Fingerprint,
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldOff,
  Plus,
  CheckCircle,
  Star,
  Trash2,
  AlertCircle,
  AlertTriangle,
  Clock,
  ToggleLeft,
  ToggleRight,
  MoreVertical,
  Settings,
  Download,
  RefreshCw,
  TrendingUp,
  Lock,
  Zap,
  Check,
  X,
  ChevronRight,
  Eye,
} from 'lucide-react';

// ─── Method Icons & Config ────────────────────────────────────────────────

interface MethodTypeConfig {
  icon: React.ComponentType<{ size?: number; color?: string; style?: React.CSSProperties }>;
  label: string;
  description: string;
  securityWeight: number;
}

function getMethodTypeConfig(): Record<MfaMethodType, MethodTypeConfig> {
  return {
    totp: {
      icon: Smartphone,
      label: 'Authenticator App',
      description: 'Time-based one-time password',
      securityWeight: 40,
    },
    sms: {
      icon: Smartphone,
      label: 'SMS',
      description: 'Text message verification',
      securityWeight: 15,
    },
    email: {
      icon: Mail,
      label: 'Email',
      description: 'Email verification code',
      securityWeight: 10,
    },
    webauthn: {
      icon: Fingerprint,
      label: 'Biometric / Security Key',
      description: 'Hardware-based authentication',
      securityWeight: 45,
    },
    backup_codes: {
      icon: Shield,
      label: 'Backup Codes',
      description: 'One-time recovery codes',
      securityWeight: 20,
    },
  };
}

// ─── Status Config ────────────────────────────────────────────────────────

function getStatusConfig(status: MfaMethodStatus, tokens: DesignTokens): {
  label: string;
  dotColor: string;
  bgColor: string;
  textColor: string;
  badgeType: 'success' | 'warning' | 'error';
} {
  switch (status) {
    case 'active':
      return {
        label: 'Active',
        dotColor: tokens.colors.successScale[500],
        bgColor: tokens.colors.successScale[50],
        textColor: tokens.colors.successScale[700],
        badgeType: 'success',
      };
    case 'pending':
      return {
        label: 'Pending',
        dotColor: tokens.colors.warningScale[500],
        bgColor: tokens.colors.warningScale[50],
        textColor: tokens.colors.warningScale[700],
        badgeType: 'warning',
      };
    case 'inactive':
    default:
      return {
        label: 'Inactive',
        dotColor: tokens.colors.neutral[400],
        bgColor: tokens.colors.neutral[50],
        textColor: tokens.colors.neutral[600],
        badgeType: 'error',
      };
  }
}

// ─── Security Score ───────────────────────────────────────────────────────

function getSecurityScoreColor(score: number, tokens: DesignTokens): {
  text: string;
  fill: string;
  bg: string;
  label: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
} {
  if (score >= 80) {
    return {
      text: tokens.colors.successScale[700],
      fill: tokens.colors.successScale[500],
      bg: tokens.colors.successScale[50],
      label: 'Excellent',
      icon: ShieldCheck,
    };
  } else if (score >= 50) {
    return {
      text: tokens.colors.warningScale[700],
      fill: tokens.colors.warningScale[500],
      bg: tokens.colors.warningScale[50],
      label: 'Good',
      icon: Shield,
    };
  } else if (score >= 25) {
    return {
      text: tokens.colors.warningScale[700],
      fill: tokens.colors.warningScale[500],
      bg: tokens.colors.warningScale[50],
      label: 'Fair',
      icon: ShieldAlert,
    };
  }
  return {
    text: tokens.colors.errorScale[700],
    fill: tokens.colors.errorScale[500],
    bg: tokens.colors.errorScale[50],
    label: 'Weak',
    icon: ShieldOff,
  };
}

// ─── Compact Preset ───────────────────────────────────────────────────────

export const CompactPlMfaSetup = createPreset<PlMfaSetupProps>({
  name: 'PlMfaSetup.Compact',
  render: ({ primitives, props, tokens, engine }: PresetContext<PlMfaSetupProps>) => {
    const { Box, Stack } = primitives;
    const isModern = tokens.surface.useGlass;

    const {
      methods,
      setupState,
      onSetDefault,
      onRemoveMethod,
      onAddMethod,
      onMethodSelect,
      className,
      style,
    } = props;

    // ─── Internal State ─────────────────────────────────────────────────

    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [actionMenuId, setActionMenuId] = useState<string | null>(null);

    const methodTypeConfig = useMemo(() => getMethodTypeConfig(), []);

    // ─── Glass Style ────────────────────────────────────────────────────

    const glassCardStyle = isModern && tokens.glass ? {
      backdropFilter: tokens.glass.blur,
      WebkitBackdropFilter: tokens.glass.blur,
      backgroundColor: tokens.glass.bg,
      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.glass.border}`,
    } : {};

    // ─── Computed Values ────────────────────────────────────────────────

    const mfaEnabled = methods.some(m => m.status === 'active');
    const activeMethodsCount = methods.filter(m => m.status === 'active').length;
    const defaultMethod = methods.find(m => m.isDefault);
    const backupCodesMethod = methods.find(m => m.type === 'backup_codes');
    const backupCodesRemaining = setupState?.backupCodes?.length || 0;

    // Calculate security score
    const securityScore = useMemo(() => {
      let score = 0;
      methods.forEach(m => {
        if (m.status === 'active') {
          score += methodTypeConfig[m.type].securityWeight;
        }
      });
      return Math.min(100, score);
    }, [methods, methodTypeConfig]);

    const scoreConfig = useMemo(
      () => getSecurityScoreColor(securityScore, tokens),
      [securityScore, tokens]
    );

    // ─── Handlers ───────────────────────────────────────────────────────

    const handleToggleActions = useCallback((id: string) => {
      setActionMenuId(prev => prev === id ? null : id);
    }, []);

    const handleSetDefault = useCallback((id: string) => {
      onSetDefault?.(id);
      setActionMenuId(null);
    }, [onSetDefault]);

    const handleRemove = useCallback((id: string) => {
      onRemoveMethod?.(id);
      setActionMenuId(null);
    }, [onRemoveMethod]);

    // ─── Render: Header ─────────────────────────────────────────────────

    const renderHeader = () => (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: tokens.spacing[5],
      }}>
        <div>
          <h2 style={{
            fontSize: tokens.typography.fontSize['2xl'],
            fontWeight: tokens.typography.fontWeight.bold,
            color: tokens.colors.neutral[900],
            margin: 0,
            lineHeight: tokens.typography.lineHeight.tight,
            marginBottom: tokens.spacing[1],
          }}>
            Multi-Factor Authentication
          </h2>
          <p style={{
            fontSize: tokens.typography.fontSize.sm,
            color: tokens.colors.neutral[500],
            margin: 0,
          }}>
            Manage your authentication methods and recovery options
          </p>
        </div>
        {onAddMethod && (
          <button
            onClick={onAddMethod}
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
            Add Method
          </button>
        )}
      </div>
    );

    // ─── Render: Security Score Card ────────────────────────────────────

    const renderSecurityScore = () => {
      const ScoreIcon = scoreConfig.icon;
      const progressStyles = createProgressBarStyle(tokens, {
        percent: securityScore,
        color: scoreConfig.fill,
      });

      return (
        <div style={{
          ...createCardStyle(tokens, { elevation: 'sm' }),
          backgroundColor: tokens.colors.common.white,
          padding: 0,
          overflow: 'hidden' as const,
          marginBottom: tokens.spacing[4],
          ...(isModern ? glassCardStyle : {}),
        }}>
          {/* Accent bar */}
          <div style={createAccentBarStyle(tokens, { position: 'top', color: scoreConfig.fill })} />

          <div style={{ padding: tokens.spacing[5] }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[4],
            }}>
              {/* Score circle */}
              <div style={{
                width: 72,
                height: 72,
                borderRadius: tokens.borderRadius.full,
                backgroundColor: scoreConfig.bg,
                display: 'flex',
                flexDirection: 'column' as const,
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                border: `3px solid ${scoreConfig.fill}`,
              }}>
                <span style={{
                  fontSize: tokens.typography.fontSize['2xl'],
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: scoreConfig.text,
                  lineHeight: 1,
                }}>
                  {securityScore}
                </span>
                <span style={{
                  fontSize: '9px',
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: scoreConfig.text,
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.05em',
                }}>
                  Score
                </span>
              </div>

              {/* Score details */}
              <div style={{ flex: 1 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                  marginBottom: tokens.spacing[2],
                }}>
                  <ScoreIcon size={18} color={scoreConfig.fill} />
                  <span style={{
                    fontSize: tokens.typography.fontSize.md,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[900],
                  }}>
                    Security Level: {scoreConfig.label}
                  </span>
                </div>

                {/* Progress bar */}
                <div style={{ marginBottom: tokens.spacing[2] }}>
                  <div style={{
                    ...progressStyles.track,
                    height: 8,
                    borderRadius: tokens.borderRadius.full,
                  }}>
                    <div style={{
                      ...progressStyles.fill,
                      borderRadius: tokens.borderRadius.full,
                    }} />
                  </div>
                </div>

                {/* Stats row */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[4],
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[1],
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[500],
                  }}>
                    <CheckCircle size={12} color={tokens.colors.successScale[500]} />
                    {activeMethodsCount} active method{activeMethodsCount !== 1 ? 's' : ''}
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[1],
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[500],
                  }}>
                    <Shield size={12} color={tokens.colors.neutral[400]} />
                    {methods.length} total registered
                  </div>
                </div>
              </div>
            </div>

            {/* Improvement tip */}
            {securityScore < 80 && (
              <div style={{
                marginTop: tokens.spacing[4],
                padding: tokens.spacing[3],
                borderRadius: tokens.borderRadius.md,
                backgroundColor: tokens.colors.infoScale[50],
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.infoScale[200]}`,
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
              }}>
                <TrendingUp size={16} color={tokens.colors.infoScale[600]} style={{ flexShrink: 0 }} />
                <span style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.infoScale[700],
                  lineHeight: tokens.typography.lineHeight.relaxed,
                }}>
                  {securityScore < 25
                    ? 'Add an authenticator app or security key to significantly improve your security.'
                    : securityScore < 50
                      ? 'Add a second authentication method for better account protection.'
                      : 'Add backup codes to ensure you can always access your account.'}
                </span>
              </div>
            )}
          </div>
        </div>
      );
    };

    // ─── Render: Status Banner ──────────────────────────────────────────

    const renderStatusBanner = () => (
      <div style={{
        ...createSurfaceStyle(tokens, { elevation: 'sm' }),
        backgroundColor: mfaEnabled ? tokens.colors.successScale[50] : tokens.colors.warningScale[50],
        borderLeft: `4px solid ${mfaEnabled ? tokens.colors.successScale[500] : tokens.colors.warningScale[500]}`,
        padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
        marginBottom: tokens.spacing[4],
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacing[3],
      }}>
        {mfaEnabled ? (
          <CheckCircle size={20} color={tokens.colors.successScale[600]} />
        ) : (
          <AlertCircle size={20} color={tokens.colors.warningScale[600]} />
        )}
        <div style={{ flex: 1 }}>
          <span style={{
            fontSize: tokens.typography.fontSize.sm,
            fontWeight: tokens.typography.fontWeight.semibold,
            color: mfaEnabled ? tokens.colors.successScale[800] : tokens.colors.warningScale[800],
          }}>
            {mfaEnabled ? 'MFA is enabled' : 'MFA is not configured'}
          </span>
          <span style={{
            fontSize: tokens.typography.fontSize.sm,
            color: mfaEnabled ? tokens.colors.successScale[600] : tokens.colors.warningScale[600],
            marginLeft: tokens.spacing[2],
          }}>
            {mfaEnabled
              ? `${activeMethodsCount} method${activeMethodsCount !== 1 ? 's' : ''} protecting your account`
              : 'Your account is at risk. Add an MFA method now.'}
          </span>
        </div>
        {!mfaEnabled && onAddMethod && (
          <button
            onClick={onAddMethod}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
              borderRadius: tokens.borderRadius.md,
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.semibold,
              backgroundColor: tokens.colors.warningScale[600],
              color: tokens.colors.common.white,
              border: 'none',
              cursor: 'pointer',
              transition: `all ${tokens.motion.hover}`,
              outline: 'none',
            }}
          >
            <Zap size={12} />
            Enable Now
          </button>
        )}
      </div>
    );

    // ─── Render: Method Row ─────────────────────────────────────────────

    const renderMethodRow = (method: MfaMethod) => {
      const typeConfig = methodTypeConfig[method.type];
      const statusConfig = getStatusConfig(method.status, tokens);
      const Icon = typeConfig.icon;
      const isHovered = hoveredId === method.id;
      const isExpanded = expandedId === method.id;
      const showActions = actionMenuId === method.id;
      const isActive = method.status === 'active';

      return (
        <div
          key={method.id}
          onMouseEnter={() => setHoveredId(method.id)}
          onMouseLeave={() => { setHoveredId(null); setActionMenuId(null); }}
          style={{
            display: 'flex',
            flexDirection: 'column' as const,
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
            transition: `background-color ${tokens.motion.hover}`,
            backgroundColor: isHovered ? tokens.colors.neutral[50] : 'transparent',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[3],
              padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
              cursor: 'pointer',
            }}
            onClick={() => setExpandedId(prev => prev === method.id ? null : method.id)}
          >
            {/* Icon */}
            <div style={{
              width: 44,
              height: 44,
              borderRadius: tokens.borderRadius.md,
              backgroundColor: isActive ? tokens.colors.primaryScale[50] : tokens.colors.neutral[100],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: `all ${tokens.motion.hover}`,
            }}>
              <Icon size={22} color={isActive ? tokens.colors.primaryScale[600] : tokens.colors.neutral[400]} />
            </div>

            {/* Method info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
                marginBottom: 2,
              }}>
                <span style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[900],
                }}>
                  {method.name}
                </span>
                {method.isDefault && (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 3,
                    padding: `1px ${tokens.spacing[2]}px`,
                    borderRadius: tokens.borderRadius.full,
                    fontSize: '10px',
                    fontWeight: tokens.typography.fontWeight.semibold,
                    backgroundColor: tokens.colors.primaryScale[50],
                    color: tokens.colors.primaryScale[700],
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[200]}`,
                  }}>
                    <Star size={9} fill={tokens.colors.primaryScale[600]} color={tokens.colors.primaryScale[600]} />
                    Default
                  </span>
                )}
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
              }}>
                {/* Type badge */}
                <span style={{
                  ...createBadgeStyle(tokens, 'info'),
                  padding: `1px ${tokens.spacing[2]}px`,
                  fontSize: '10px',
                  border: 'none',
                }}>
                  {typeConfig.label}
                </span>

                {/* Device name */}
                {method.deviceName && (
                  <span style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[500],
                  }}>
                    {method.deviceName}
                  </span>
                )}
              </div>
            </div>

            {/* Status */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
              borderRadius: tokens.borderRadius.full,
              backgroundColor: statusConfig.bgColor,
              flexShrink: 0,
            }}>
              <span style={createStatusDotStyle(tokens, statusConfig.dotColor)} />
              <span style={{
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.medium,
                color: statusConfig.textColor,
              }}>
                {statusConfig.label}
              </span>
            </div>

            {/* Last used */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.neutral[500],
              minWidth: 80,
              flexShrink: 0,
            }}>
              <Clock size={12} />
              {method.lastUsed
                ? formatDistanceToNow(method.lastUsed, { addSuffix: true })
                : 'Never'}
            </div>

            {/* Actions */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              opacity: isHovered ? 1 : 0,
              transition: `opacity ${tokens.motion.hover}`,
              position: 'relative' as const,
            }}>
              {/* Toggle switch */}
              <button
                onClick={(e) => { e.stopPropagation(); }}
                title={isActive ? 'Disable method' : 'Enable method'}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: isActive ? 'flex-end' : 'flex-start',
                  width: 36,
                  height: 20,
                  padding: 2,
                  borderRadius: tokens.borderRadius.full,
                  backgroundColor: isActive ? tokens.colors.successScale[500] : tokens.colors.neutral[300],
                  border: 'none',
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  outline: 'none',
                  flexShrink: 0,
                }}
              >
                <div style={{
                  width: 16,
                  height: 16,
                  borderRadius: tokens.borderRadius.full,
                  backgroundColor: tokens.colors.common.white,
                  boxShadow: tokens.shadows.sm,
                  transition: `all ${tokens.motion.hover}`,
                }} />
              </button>

              {/* More actions button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleActions(method.id);
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
                  flexShrink: 0,
                }}
              >
                <MoreVertical size={14} />
              </button>

              {/* Action dropdown */}
              {showActions && (
                <div style={{
                  position: 'absolute' as const,
                  top: '100%',
                  right: 0,
                  marginTop: tokens.spacing[1],
                  minWidth: 180,
                  backgroundColor: tokens.colors.common.white,
                  borderRadius: tokens.borderRadius.lg,
                  boxShadow: tokens.shadows.lg,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  zIndex: 50,
                  padding: `${tokens.spacing[1]}px 0`,
                  overflow: 'hidden' as const,
                }}>
                  {!method.isDefault && isActive && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetDefault(method.id);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: tokens.spacing[2],
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.neutral[700],
                        cursor: 'pointer',
                        transition: `background-color ${tokens.motion.hover}`,
                      }}
                    >
                      <Star size={14} color={tokens.colors.primaryScale[500]} />
                      Set as Default
                    </div>
                  )}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(method.id);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[2],
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.errorScale[600],
                      cursor: 'pointer',
                      transition: `background-color ${tokens.motion.hover}`,
                    }}
                  >
                    <Trash2 size={14} />
                    Remove Method
                  </div>
                </div>
              )}
            </div>

            {/* Expand chevron */}
            <ChevronRight
              size={16}
              color={tokens.colors.neutral[400]}
              style={{
                transition: `transform ${tokens.motion.hover}`,
                transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                flexShrink: 0,
              }}
            />
          </div>

          {/* Expanded details */}
          {isExpanded && (
            <div style={{
              padding: `0 ${tokens.spacing[4]}px ${tokens.spacing[4]}px`,
              paddingLeft: `calc(${tokens.spacing[4]}px + 44px + ${tokens.spacing[3]}px)`,
            }}>
              <div style={{
                padding: tokens.spacing[3],
                borderRadius: tokens.borderRadius.md,
                backgroundColor: tokens.colors.neutral[50],
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: tokens.spacing[3],
                }}>
                  <div>
                    <div style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[500],
                      marginBottom: tokens.spacing[1],
                    }}>
                      Type
                    </div>
                    <div style={{
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.medium,
                      color: tokens.colors.neutral[800],
                    }}>
                      {typeConfig.description}
                    </div>
                  </div>
                  <div>
                    <div style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[500],
                      marginBottom: tokens.spacing[1],
                    }}>
                      Registered
                    </div>
                    <div style={{
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.medium,
                      color: tokens.colors.neutral[800],
                    }}>
                      {method.registeredAt
                        ? formatDistanceToNow(method.registeredAt, { addSuffix: true })
                        : 'Unknown'}
                    </div>
                  </div>
                  <div>
                    <div style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[500],
                      marginBottom: tokens.spacing[1],
                    }}>
                      Device
                    </div>
                    <div style={{
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.medium,
                      color: tokens.colors.neutral[800],
                    }}>
                      {method.deviceName || 'Not specified'}
                    </div>
                  </div>
                </div>

                {/* Quick actions in expanded */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                  marginTop: tokens.spacing[3],
                  paddingTop: tokens.spacing[3],
                  borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                }}>
                  {!method.isDefault && isActive && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSetDefault?.(method.id);
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: tokens.spacing[1],
                        padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                        borderRadius: tokens.borderRadius.md,
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: tokens.typography.fontWeight.medium,
                        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[300]}`,
                        backgroundColor: tokens.colors.primaryScale[50],
                        color: tokens.colors.primaryScale[700],
                        cursor: 'pointer',
                        transition: `all ${tokens.motion.hover}`,
                        outline: 'none',
                      }}
                    >
                      <Star size={12} />
                      Set as Default
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveMethod?.(method.id);
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: tokens.spacing[1],
                      padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                      borderRadius: tokens.borderRadius.md,
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.medium,
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.errorScale[300]}`,
                      backgroundColor: tokens.colors.common.white,
                      color: tokens.colors.errorScale[600],
                      cursor: 'pointer',
                      transition: `all ${tokens.motion.hover}`,
                      outline: 'none',
                    }}
                  >
                    <Trash2 size={12} />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    };

    // ─── Render: Methods List ───────────────────────────────────────────

    const renderMethodsList = () => (
      <div style={{
        ...createCardStyle(tokens, { elevation: 'sm', padding: 0 }),
        backgroundColor: tokens.colors.common.white,
        overflow: 'hidden' as const,
        marginBottom: tokens.spacing[4],
        ...(isModern ? glassCardStyle : {}),
      }}>
        {/* List header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
          backgroundColor: tokens.colors.neutral[50],
          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[2],
          }}>
            <Lock size={16} color={tokens.colors.neutral[600]} />
            <span style={{
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[800],
            }}>
              Registered Methods
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
              {methods.length}
            </span>
          </div>
          {defaultMethod && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.neutral[500],
            }}>
              <Star size={12} color={tokens.colors.primaryScale[500]} fill={tokens.colors.primaryScale[500]} />
              Default: {defaultMethod.name}
            </div>
          )}
        </div>

        {/* Methods */}
        {methods.length === 0 ? (
          <div style={{
            padding: `${tokens.spacing[8]}px ${tokens.spacing[4]}px`,
            textAlign: 'center' as const,
          }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: tokens.borderRadius.full,
              backgroundColor: tokens.colors.neutral[100],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              marginBottom: tokens.spacing[3],
            }}>
              <ShieldOff size={28} color={tokens.colors.neutral[400]} />
            </div>
            <div style={{
              fontSize: tokens.typography.fontSize.md,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[700],
              marginBottom: tokens.spacing[1],
            }}>
              No MFA methods configured
            </div>
            <div style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[500],
              marginBottom: tokens.spacing[4],
              lineHeight: tokens.typography.lineHeight.relaxed,
            }}>
              Add your first authentication method to secure your account
            </div>
            {onAddMethod && (
              <button
                onClick={onAddMethod}
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
                  outline: 'none',
                }}
              >
                <Plus size={16} />
                Add First Method
              </button>
            )}
          </div>
        ) : (
          <div>
            {methods.filter(m => m.type !== 'backup_codes').map(method => renderMethodRow(method))}
          </div>
        )}

        {/* Add method footer */}
        {methods.length > 0 && onAddMethod && (
          <div
            onClick={onAddMethod}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: tokens.spacing[2],
              padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
              cursor: 'pointer',
              transition: `background-color ${tokens.motion.hover}`,
              color: tokens.colors.primaryScale[600],
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
              borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
            }}
          >
            <Plus size={16} />
            Add another method
          </div>
        )}
      </div>
    );

    // ─── Render: Recovery Options ───────────────────────────────────────

    const renderRecoveryOptions = () => {
      const hasBackupCodes = methods.some(m => m.type === 'backup_codes' && m.status === 'active');
      const codesLow = backupCodesRemaining > 0 && backupCodesRemaining <= 3;

      return (
        <div style={{
          ...createCardStyle(tokens, { elevation: 'sm', padding: 0 }),
          backgroundColor: tokens.colors.common.white,
          overflow: 'hidden' as const,
          ...(isModern ? glassCardStyle : {}),
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[2],
            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
            backgroundColor: tokens.colors.neutral[50],
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          }}>
            <Shield size={16} color={tokens.colors.neutral[600]} />
            <span style={{
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[800],
            }}>
              Recovery Options
            </span>
          </div>

          <div style={{
            padding: tokens.spacing[4],
            display: 'flex',
            flexDirection: 'column' as const,
            gap: tokens.spacing[3],
          }}>
            {/* Backup codes row */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: tokens.spacing[3],
              borderRadius: tokens.borderRadius.md,
              backgroundColor: hasBackupCodes
                ? codesLow
                  ? tokens.colors.warningScale[50]
                  : tokens.colors.successScale[50]
                : tokens.colors.neutral[50],
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${
                hasBackupCodes
                  ? codesLow
                    ? tokens.colors.warningScale[200]
                    : tokens.colors.successScale[200]
                  : tokens.colors.neutral[200]
              }`,
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
              }}>
                <Shield size={18} color={
                  hasBackupCodes
                    ? codesLow
                      ? tokens.colors.warningScale[600]
                      : tokens.colors.successScale[600]
                    : tokens.colors.neutral[500]
                } />
                <div>
                  <div style={{
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.medium,
                    color: tokens.colors.neutral[800],
                  }}>
                    Backup Codes
                  </div>
                  <div style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[500],
                  }}>
                    {hasBackupCodes
                      ? `${backupCodesRemaining} codes remaining`
                      : 'Not configured'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                {codesLow && (
                  <span style={{
                    ...createBadgeStyle(tokens, 'warning'),
                    padding: `1px ${tokens.spacing[2]}px`,
                    fontSize: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                  }}>
                    <AlertTriangle size={10} />
                    Low
                  </span>
                )}
                {hasBackupCodes ? (
                  <button
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: tokens.spacing[1],
                      padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                      borderRadius: tokens.borderRadius.md,
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.medium,
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                      backgroundColor: tokens.colors.common.white,
                      color: tokens.colors.neutral[600],
                      cursor: 'pointer',
                      transition: `all ${tokens.motion.hover}`,
                      outline: 'none',
                    }}
                  >
                    <RefreshCw size={12} />
                    Regenerate
                  </button>
                ) : (
                  <button
                    onClick={() => onMethodSelect?.('backup_codes')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: tokens.spacing[1],
                      padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                      borderRadius: tokens.borderRadius.md,
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.medium,
                      backgroundColor: tokens.colors.primaryScale[600],
                      color: tokens.colors.common.white,
                      border: 'none',
                      cursor: 'pointer',
                      transition: `all ${tokens.motion.hover}`,
                      outline: 'none',
                    }}
                  >
                    <Plus size={12} />
                    Generate
                  </button>
                )}
              </div>
            </div>

            {/* Recovery email row */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: tokens.spacing[3],
              borderRadius: tokens.borderRadius.md,
              backgroundColor: setupState?.recoveryEmail
                ? tokens.colors.successScale[50]
                : tokens.colors.neutral[50],
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${
                setupState?.recoveryEmail
                  ? tokens.colors.successScale[200]
                  : tokens.colors.neutral[200]
              }`,
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
              }}>
                <Mail size={18} color={
                  setupState?.recoveryEmail
                    ? tokens.colors.successScale[600]
                    : tokens.colors.neutral[500]
                } />
                <div>
                  <div style={{
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.medium,
                    color: tokens.colors.neutral[800],
                  }}>
                    Recovery Email
                  </div>
                  <div style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[500],
                  }}>
                    {setupState?.recoveryEmail || 'Not set'}
                  </div>
                </div>
              </div>
              {setupState?.recoveryEmail ? (
                <CheckCircle size={16} color={tokens.colors.successScale[500]} />
              ) : (
                <button
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: tokens.spacing[1],
                    padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                    borderRadius: tokens.borderRadius.md,
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.medium,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                    backgroundColor: tokens.colors.common.white,
                    color: tokens.colors.neutral[600],
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                    outline: 'none',
                  }}
                >
                  <Settings size={12} />
                  Configure
                </button>
              )}
            </div>

            {/* Warning if no recovery */}
            {!hasBackupCodes && !setupState?.recoveryEmail && (
              <div style={{
                padding: tokens.spacing[3],
                borderRadius: tokens.borderRadius.md,
                backgroundColor: tokens.colors.errorScale[50],
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.errorScale[200]}`,
                display: 'flex',
                alignItems: 'flex-start',
                gap: tokens.spacing[2],
              }}>
                <AlertTriangle size={16} color={tokens.colors.errorScale[600]} style={{ flexShrink: 0, marginTop: 2 }} />
                <div style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.errorScale[700],
                  lineHeight: tokens.typography.lineHeight.relaxed,
                }}>
                  <strong>No recovery options configured.</strong> If you lose access to your MFA method,
                  you may permanently lose access to your account. Set up backup codes or a recovery email.
                </div>
              </div>
            )}
          </div>
        </div>
      );
    };

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
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          {renderHeader()}
          {renderStatusBanner()}

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 320px',
            gap: tokens.spacing[4],
            alignItems: 'start',
          }}>
            {/* Left column: Methods + Security Score */}
            <div>
              {renderSecurityScore()}
              {renderMethodsList()}
            </div>

            {/* Right column: Recovery */}
            <div>
              {renderRecoveryOptions()}
            </div>
          </div>
        </div>
      </div>
    );
  },
});
