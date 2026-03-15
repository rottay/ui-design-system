'use client';

/**
 * PlAuthMethodManager - List Preset
 * Detailed list view of authentication methods with grouping by type
 */

import { useState, useCallback, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createBadgeStyle,
  createCardStyle,
  createEmptyStateStyle,
  createHoverStyle,
  createListItemStyle,
  createSectionHeaderStyle,
  createStatusDotStyle,
  createSurfaceStyle,
  formatDistanceToNow,
} from '../../../helpers';
import type {
  PlAuthMethodManagerProps,
  AuthMethod,
  AuthMethodType,
  AuthMethodStatus,
  SecurityLevel,
} from '../../core';
import { PL_AUTH_METHOD_MANAGER_DEFAULTS } from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  Key,
  Shield,
  Lock,
  Fingerprint,
  Mail,
  ShieldCheck,
  Search,
  Plus,
  Settings,
  Trash2,
  Check,
  X,
  Star,
  Users,
  Clock,
  AlertTriangle,
  ChevronDown,
  TrendingUp,
  Zap,
  Github,
  Chrome,
  Facebook,
  Twitter,
} from 'lucide-react';

// ─── Type Config ──────────────────────────────────────────────────────────

interface TypeConfig {
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  description: string;
}

function getTypeConfig(type: AuthMethodType, tokens: DesignTokens): TypeConfig {
  const iconSize = 16;
  switch (type) {
    case 'password':
      return {
        label: 'Password',
        icon: <Key size={iconSize} />,
        color: tokens.colors.neutral[700],
        bgColor: tokens.colors.neutral[100],
        description: 'Traditional username and password authentication',
      };
    case 'sso':
      return {
        label: 'SSO',
        icon: <Shield size={iconSize} />,
        color: tokens.colors.primaryScale[700],
        bgColor: tokens.colors.primaryScale[100],
        description: 'Enterprise single sign-on',
      };
    case 'oauth':
      return {
        label: 'Social Login',
        icon: <Chrome size={iconSize} />,
        color: tokens.colors.infoScale[700],
        bgColor: tokens.colors.infoScale[100],
        description: 'OAuth social authentication',
      };
    case 'passkey':
      return {
        label: 'Passkey',
        icon: <Fingerprint size={iconSize} />,
        color: tokens.colors.successScale[700],
        bgColor: tokens.colors.successScale[100],
        description: 'Passwordless biometric authentication',
      };
    case 'magic-link':
      return {
        label: 'Magic Link',
        icon: <Mail size={iconSize} />,
        color: tokens.colors.secondaryScale[700],
        bgColor: tokens.colors.secondaryScale[100],
        description: 'Email-based passwordless login',
      };
    case 'mfa':
      return {
        label: 'MFA',
        icon: <ShieldCheck size={iconSize} />,
        color: tokens.colors.warningScale[700],
        bgColor: tokens.colors.warningScale[100],
        description: 'Multi-factor authentication',
      };
  }
}

// ─── Status Config ────────────────────────────────────────────────────────

interface StatusConfig {
  label: string;
  dotColor: string;
  bgColor: string;
  textColor: string;
}

function getStatusConfig(status: AuthMethodStatus, tokens: DesignTokens): StatusConfig {
  switch (status) {
    case 'active':
      return {
        label: 'Active',
        dotColor: tokens.colors.successScale[500],
        bgColor: tokens.colors.successScale[50],
        textColor: tokens.colors.successScale[700],
      };
    case 'inactive':
      return {
        label: 'Inactive',
        dotColor: tokens.colors.neutral[400],
        bgColor: tokens.colors.neutral[50],
        textColor: tokens.colors.neutral[600],
      };
    case 'configuring':
      return {
        label: 'Configuring',
        dotColor: tokens.colors.warningScale[500],
        bgColor: tokens.colors.warningScale[50],
        textColor: tokens.colors.warningScale[700],
      };
  }
}

// ─── Security Level Config ────────────────────────────────────────────────

function getSecurityLevelConfig(level: SecurityLevel, tokens: DesignTokens): { bars: number; color: string; label: string } {
  switch (level) {
    case 'low':
      return { bars: 1, color: tokens.colors.errorScale[500], label: 'Low' };
    case 'medium':
      return { bars: 2, color: tokens.colors.warningScale[500], label: 'Medium' };
    case 'high':
      return { bars: 3, color: tokens.colors.infoScale[500], label: 'High' };
    case 'critical':
      return { bars: 4, color: tokens.colors.successScale[500], label: 'Critical' };
  }
}

// ─── List Preset ──────────────────────────────────────────────────────────

export const ListPlAuthMethodManager = createPreset<PlAuthMethodManagerProps>({
  name: 'PlAuthMethodManager.List',
  render: ({ primitives, props, tokens, engine }: PresetContext<PlAuthMethodManagerProps>) => {
    const { Box, Stack } = primitives;
    const isModern = tokens.surface.useGlass;

    const {
      methods,
      onToggle,
      onConfigure,
      onDelete,
      onAddMethod,
      onMethodClick,
      onSetDefault,
      searchQuery: controlledSearchQuery,
      onSearchChange,
      filterType: controlledFilterType,
      onFilterChange,
      loading = false,
      emptyText = PL_AUTH_METHOD_MANAGER_DEFAULTS.emptyText,
      className,
      style,
    } = props;

    // ─── Internal State ─────────────────────────────────────────────────

    const [internalSearchQuery, setInternalSearchQuery] = useState('');
    const [internalFilterType, setInternalFilterType] = useState<AuthMethodType | null>(null);
    const [hoveredMethodId, setHoveredMethodId] = useState<string | null>(null);
    const [showTypeDropdown, setShowTypeDropdown] = useState(false);

    const searchQuery = controlledSearchQuery ?? internalSearchQuery;
    const filterType = controlledFilterType ?? internalFilterType;

    // ─── Handlers ───────────────────────────────────────────────────────

    const handleSearchChange = useCallback((query: string) => {
      if (controlledSearchQuery === undefined) setInternalSearchQuery(query);
      onSearchChange?.(query);
    }, [controlledSearchQuery, onSearchChange]);

    const handleFilterChange = useCallback((type: AuthMethodType | null) => {
      if (controlledFilterType === undefined) setInternalFilterType(type);
      onFilterChange?.(type);
      setShowTypeDropdown(false);
    }, [controlledFilterType, onFilterChange]);

    const handleToggle = useCallback((methodId: string, currentStatus: AuthMethodStatus) => {
      const newEnabled = currentStatus !== 'active';
      onToggle?.(methodId, newEnabled);
    }, [onToggle]);

    // ─── Filtered Methods ───────────────────────────────────────────────

    const filteredMethods = useMemo(() => {
      let result = [...methods];

      if (filterType) {
        result = result.filter(m => m.type === filterType);
      }

      if (searchQuery) {
        const lower = searchQuery.toLowerCase();
        result = result.filter(m =>
          m.name.toLowerCase().includes(lower) ||
          m.provider?.toLowerCase().includes(lower) ||
          m.description?.toLowerCase().includes(lower)
        );
      }

      return result;
    }, [methods, filterType, searchQuery]);

    // ─── Group by Type ──────────────────────────────────────────────────

    const groupedMethods = useMemo(() => {
      const groups = new Map<AuthMethodType, AuthMethod[]>();

      filteredMethods.forEach(method => {
        const existing = groups.get(method.type) || [];
        groups.set(method.type, [...existing, method]);
      });

      const typeOrder: AuthMethodType[] = ['password', 'sso', 'oauth', 'passkey', 'magic-link', 'mfa'];
      const result: Array<{ type: AuthMethodType; methods: AuthMethod[] }> = [];

      typeOrder.forEach(type => {
        const methodsForType = groups.get(type);
        if (methodsForType && methodsForType.length > 0) {
          result.push({ type, methods: methodsForType });
        }
      });

      return result;
    }, [filteredMethods]);

    // ─── Glass Style ────────────────────────────────────────────────────

    const glassCardStyle = isModern && tokens.glass ? {
      backdropFilter: tokens.glass.blur,
      WebkitBackdropFilter: tokens.glass.blur,
      backgroundColor: tokens.glass.bg,
      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.glass.border}`,
    } : {};

    // ─── Render: Header ─────────────────────────────────────────────────

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
            Authentication Methods
          </h1>
          <p style={{
            fontSize: tokens.typography.fontSize.sm,
            color: tokens.colors.neutral[500],
            margin: 0,
            marginTop: tokens.spacing[1],
          }}>
            Manage how users sign in to your application
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

    // ─── Render: Filter Bar ─────────────────────────────────────────────

    const renderFilterBar = () => {
      const allTypes: AuthMethodType[] = ['password', 'sso', 'oauth', 'passkey', 'magic-link', 'mfa'];

      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing[3],
          marginBottom: tokens.spacing[4],
          flexWrap: 'wrap' as const,
        }}>
          {/* Type filter dropdown */}
          <div style={{ position: 'relative' as const }}>
            <button
              onClick={() => setShowTypeDropdown(!showTypeDropdown)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${filterType ? tokens.colors.primaryScale[300] : tokens.colors.neutral[200]}`,
                backgroundColor: filterType ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                color: filterType ? tokens.colors.primaryScale[600] : tokens.colors.neutral[600],
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
                outline: 'none',
              }}
            >
              {filterType ? getTypeConfig(filterType, tokens).label : 'All Types'}
              <ChevronDown size={14} />
            </button>
            {showTypeDropdown && (
              <div style={{
                position: 'absolute' as const,
                top: '100%',
                left: 0,
                marginTop: tokens.spacing[1],
                minWidth: 220,
                backgroundColor: tokens.colors.common.white,
                borderRadius: tokens.borderRadius.lg,
                boxShadow: tokens.shadows.lg,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                zIndex: 50,
                padding: `${tokens.spacing[1]}px 0`,
              }}>
                <div
                  onClick={() => handleFilterChange(null)}
                  style={{
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                    fontSize: tokens.typography.fontSize.sm,
                    color: !filterType ? tokens.colors.primaryScale[600] : tokens.colors.neutral[700],
                    backgroundColor: !filterType ? tokens.colors.primaryScale[50] : 'transparent',
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                  }}
                >
                  All Types
                </div>
                {allTypes.map(type => {
                  const cfg = getTypeConfig(type, tokens);
                  return (
                    <div
                      key={type}
                      onClick={() => handleFilterChange(type)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: tokens.spacing[2],
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                        fontSize: tokens.typography.fontSize.sm,
                        color: filterType === type ? tokens.colors.primaryScale[600] : tokens.colors.neutral[700],
                        backgroundColor: filterType === type ? tokens.colors.primaryScale[50] : 'transparent',
                        cursor: 'pointer',
                        transition: `all ${tokens.motion.hover}`,
                      }}
                    >
                      <div style={{ color: cfg.color }}>{cfg.icon}</div>
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
            minWidth: 260,
            transition: `all ${tokens.motion.hover}`,
          }}>
            <Search size={16} color={tokens.colors.neutral[400]} />
            <input
              type="text"
              placeholder="Search methods..."
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

    // ─── Render: Security Level Bars ────────────────────────────────────

    const renderSecurityBars = (level: SecurityLevel) => {
      const cfg = getSecurityLevelConfig(level, tokens);
      return (
        <div
          title={`Security Level: ${cfg.label}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          {[1, 2, 3, 4].map(bar => (
            <div
              key={bar}
              style={{
                width: 3,
                height: bar <= cfg.bars ? 12 : 8,
                borderRadius: tokens.borderRadius.sm,
                backgroundColor: bar <= cfg.bars ? cfg.color : tokens.colors.neutral[200],
                transition: `all ${tokens.motion.hover}`,
              }}
            />
          ))}
        </div>
      );
    };

    // ─── Render: Method Row ─────────────────────────────────────────────

    const renderMethodRow = (method: AuthMethod) => {
      const typeCfg = getTypeConfig(method.type, tokens);
      const statusCfg = getStatusConfig(method.status, tokens);
      const isHovered = hoveredMethodId === method.id;

      return (
        <div
          key={method.id}
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
          onMouseEnter={() => setHoveredMethodId(method.id)}
          onMouseLeave={() => setHoveredMethodId(null)}
          onClick={() => onMethodClick?.(method.id)}
        >
          {/* Icon */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
            borderRadius: tokens.borderRadius.md,
            backgroundColor: typeCfg.bgColor,
            color: typeCfg.color,
            flexShrink: 0,
          }}>
            {typeCfg.icon}
          </div>

          {/* Method info */}
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
              }}>
                {method.name}
              </span>
              {method.isDefault && (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3,
                  padding: `2px ${tokens.spacing[2]}px`,
                  borderRadius: tokens.borderRadius.full,
                  fontSize: '10px',
                  fontWeight: tokens.typography.fontWeight.medium,
                  backgroundColor: tokens.colors.warningScale[100],
                  color: tokens.colors.warningScale[700],
                }}>
                  <Star size={10} />
                  Default
                </span>
              )}
              {method.provider && (
                <span style={{
                  ...createBadgeStyle(tokens, 'info'),
                  padding: `2px ${tokens.spacing[2]}px`,
                  fontSize: '10px',
                }}>
                  {method.provider}
                </span>
              )}
              {method.protocol && (
                <span style={{
                  padding: `2px ${tokens.spacing[2]}px`,
                  borderRadius: tokens.borderRadius.full,
                  fontSize: '10px',
                  fontWeight: tokens.typography.fontWeight.medium,
                  backgroundColor: tokens.colors.neutral[100],
                  color: tokens.colors.neutral[600],
                }}>
                  {method.protocol}
                </span>
              )}
            </div>
            <div style={{
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.neutral[500],
            }}>
              {method.description || typeCfg.description}
            </div>
          </div>

          {/* Status indicator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[1],
            padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
            borderRadius: tokens.borderRadius.full,
            backgroundColor: statusCfg.bgColor,
            flexShrink: 0,
          }}>
            <span style={{
              ...createStatusDotStyle(tokens, statusCfg.dotColor),
            }} />
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
            minWidth: 70,
          }}>
            <Users size={14} />
            <span>{method.usersCount.toLocaleString()}</span>
          </div>

          {/* Last used */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[1],
            fontSize: tokens.typography.fontSize.xs,
            color: tokens.colors.neutral[500],
            minWidth: 90,
          }}>
            <Clock size={12} />
            {method.lastUsed ? formatDistanceToNow(method.lastUsed, { addSuffix: true }) : 'Never'}
          </div>

          {/* Security level */}
          <div style={{ flexShrink: 0 }}>
            {renderSecurityBars(method.securityLevel)}
          </div>

          {/* Actions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[1],
            opacity: isHovered ? 1 : 0,
            transition: `opacity ${tokens.motion.hover}`,
          }}>
            {/* Toggle switch */}
            {method.canDisable && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggle(method.id, method.status);
                }}
                title={method.status === 'active' ? 'Disable' : 'Enable'}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: method.status === 'active' ? 'flex-end' : 'flex-start',
                  width: 40,
                  height: 22,
                  padding: 2,
                  borderRadius: tokens.borderRadius.full,
                  backgroundColor: method.status === 'active' ? tokens.colors.successScale[500] : tokens.colors.neutral[300],
                  border: 'none',
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  outline: 'none',
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

            {/* Configure button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onConfigure?.(method.id);
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

            {/* Delete button */}
            {method.canDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(method.id);
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

    // ─── Render: Group ──────────────────────────────────────────────────

    const renderGroup = (group: { type: AuthMethodType; methods: AuthMethod[] }) => {
      const typeCfg = getTypeConfig(group.type, tokens);

      return (
        <div
          key={group.type}
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
            backgroundColor: tokens.colors.neutral[50],
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          }}>
            <div style={{ color: typeCfg.color }}>{typeCfg.icon}</div>
            <span style={{
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[900],
            }}>
              {typeCfg.label}
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
              {group.methods.length}
            </span>
          </div>

          {/* Group methods */}
          {group.methods.map(method => renderMethodRow(method))}
        </div>
      );
    };

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
          {searchQuery || filterType ? emptyText : 'No authentication methods configured'}
        </div>
        <div style={{
          fontSize: tokens.typography.fontSize.sm,
          color: tokens.colors.neutral[500],
          marginBottom: tokens.spacing[6],
          maxWidth: 400,
          lineHeight: tokens.typography.lineHeight.relaxed,
        }}>
          {searchQuery || filterType
            ? 'Try adjusting your filters or search query to find what you are looking for.'
            : 'Add authentication methods to allow users to sign in to your application.'}
        </div>
        {onAddMethod && !(searchQuery || filterType) && (
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
              boxShadow: tokens.shadows.sm,
              outline: 'none',
            }}
          >
            <Plus size={16} />
            Add Your First Method
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
        {renderFilterBar()}
        {groupedMethods.length === 0 ? renderEmptyState() : groupedMethods.map(renderGroup)}
      </div>
    );
  },
});
