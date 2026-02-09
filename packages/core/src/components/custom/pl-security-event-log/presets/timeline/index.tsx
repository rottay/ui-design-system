'use client';

/**
 * PlSecurityEventLog - Timeline Preset
 * Vertical timeline view of security events with severity indicators and expandable details
 */

import { useState, useCallback, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createSurfaceStyle,
  createEmptyStateStyle,
  createFilterPillStyle,
  formatDistanceToNow,
} from '../../../helpers';
import type { PlSecurityEventLogProps, SecurityEvent, EventSeverity, EventType } from '../../core';
import { PL_SECURITY_EVENT_LOG_DEFAULTS } from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  LogIn,
  LogOut,
  Shield,
  Key,
  AlertTriangle,
  Lock,
  UserX,
  Settings,
  FileText,
  Activity,
  Search,
  ChevronDown,
  ChevronUp,
  MapPin,
  Monitor,
} from 'lucide-react';

// ─── Event Type Config ────────────────────────────────────────────────────────

function getEventTypeConfig(type: EventType): { icon: any; label: string } {
  const configs: Record<EventType, { icon: any; label: string }> = {
    login_success: { icon: LogIn, label: 'Login Success' },
    login_failure: { icon: AlertTriangle, label: 'Login Failed' },
    password_change: { icon: Key, label: 'Password Changed' },
    mfa_enabled: { icon: Shield, label: 'MFA Enabled' },
    mfa_disabled: { icon: Shield, label: 'MFA Disabled' },
    role_change: { icon: Settings, label: 'Role Changed' },
    permission_change: { icon: Settings, label: 'Permission Changed' },
    session_revoked: { icon: LogOut, label: 'Session Revoked' },
    account_locked: { icon: Lock, label: 'Account Locked' },
    suspicious_activity: { icon: AlertTriangle, label: 'Suspicious Activity' },
    api_key_created: { icon: Key, label: 'API Key Created' },
    data_export: { icon: FileText, label: 'Data Export' },
  };
  return configs[type];
}

// ─── Severity Config ──────────────────────────────────────────────────────────

function getSeverityConfig(severity: EventSeverity, tokens: DesignTokens): {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
} {
  const configs: Record<EventSeverity, { label: string; scale: keyof typeof tokens.colors }> = {
    info: { label: 'Info', scale: 'infoScale' },
    warning: { label: 'Warning', scale: 'warningScale' },
    error: { label: 'Error', scale: 'errorScale' },
    critical: { label: 'Critical', scale: 'errorScale' },
  };
  const cfg = configs[severity];
  const scale = tokens.colors[cfg.scale as keyof typeof tokens.colors] as any;
  return {
    label: cfg.label,
    color: severity === 'critical' ? tokens.colors.errorScale[900] : scale[700],
    bgColor: severity === 'critical' ? tokens.colors.errorScale[100] : scale[50],
    borderColor: severity === 'critical' ? tokens.colors.errorScale[500] : scale[200],
  };
}

// ─── Timeline Preset ──────────────────────────────────────────────────────────

export const TimelinePlSecurityEventLog = createPreset<PlSecurityEventLogProps>({
  name: 'PlSecurityEventLog.Timeline',
  render: ({ primitives, props, tokens, engine }: PresetContext<PlSecurityEventLogProps>) => {
    const { Box } = primitives;
    const isModern = tokens.surface.useGlass;

    const {
      events,
      stats,
      filters: controlledFilters,
      onFilterChange,
      onEventClick,
      searchQuery: controlledSearchQuery,
      onSearchChange,
      emptyText = PL_SECURITY_EVENT_LOG_DEFAULTS.emptyText,
      className,
      style,
    } = props;

    // ─── Internal State ─────────────────────────────────────────────────────

    const [internalFilters, setInternalFilters] = useState<any>({});
    const [internalSearchQuery, setInternalSearchQuery] = useState('');
    const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

    const filters = controlledFilters ?? internalFilters;
    const searchQuery = controlledSearchQuery ?? internalSearchQuery;

    // ─── Handlers ───────────────────────────────────────────────────────────

    const handleFilterChange = useCallback((newFilters: any) => {
      if (controlledFilters === undefined) setInternalFilters(newFilters);
      onFilterChange?.(newFilters);
    }, [controlledFilters, onFilterChange]);

    const handleSearchChange = useCallback((query: string) => {
      if (controlledSearchQuery === undefined) setInternalSearchQuery(query);
      onSearchChange?.(query);
    }, [controlledSearchQuery, onSearchChange]);

    const handleSeverityFilter = useCallback((severity: EventSeverity | null) => {
      handleFilterChange({ ...filters, severity });
    }, [filters, handleFilterChange]);

    const toggleEventDetails = useCallback((eventId: string) => {
      setExpandedEventId(prev => prev === eventId ? null : eventId);
    }, []);

    // ─── Filtered Events ────────────────────────────────────────────────────

    const filteredEvents = useMemo(() => {
      let result = [...events];

      if (filters.severity) {
        result = result.filter(e => e.severity === filters.severity);
      }
      if (filters.type) {
        result = result.filter(e => e.type === filters.type);
      }
      if (searchQuery) {
        const lower = searchQuery.toLowerCase();
        result = result.filter(e =>
          e.actor.name.toLowerCase().includes(lower) ||
          e.actor.email.toLowerCase().includes(lower) ||
          e.type.toLowerCase().includes(lower) ||
          e.ip.includes(lower) ||
          e.location.toLowerCase().includes(lower)
        );
      }

      return result;
    }, [events, filters, searchQuery]);

    // ─── Group Events by Day ────────────────────────────────────────────────

    const groupedEvents = useMemo(() => {
      const groups: Record<string, SecurityEvent[]> = {};
      filteredEvents.forEach(event => {
        const date = new Date(event.timestamp);
        const dateKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        if (!groups[dateKey]) groups[dateKey] = [];
        groups[dateKey].push(event);
      });
      return groups;
    }, [filteredEvents]);

    // ─── Glass Style ────────────────────────────────────────────────────────

    const glassSurfaceStyle = isModern && tokens.glass ? {
      backdropFilter: tokens.glass.blurSm,
      WebkitBackdropFilter: tokens.glass.blurSm,
      backgroundColor: tokens.glass.bgLight,
      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.glass.borderLight}`,
    } : {};

    // ─── Render: Stats Ribbon ───────────────────────────────────────────────

    const renderStatsRibbon = () => {
      if (!stats) return null;

      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing[4],
          padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
          ...createSurfaceStyle(tokens, { elevation: 'sm' }),
          backgroundColor: tokens.colors.common.white,
          marginBottom: tokens.spacing[4],
          ...glassSurfaceStyle,
        }}>
          <Activity size={18} color={tokens.colors.neutral[500]} />
          <span style={{
            fontSize: tokens.typography.fontSize.sm,
            fontWeight: tokens.typography.fontWeight.semibold,
            color: tokens.colors.neutral[700],
          }}>
            Security Events
          </span>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[1],
            padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
            borderRadius: tokens.borderRadius.full,
            backgroundColor: tokens.colors.primaryScale[50],
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[200]}`,
          }}>
            <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>Total</span>
            <span style={{
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.primaryScale[700],
            }}>
              {stats.total}
            </span>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[1],
            padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
            borderRadius: tokens.borderRadius.full,
            backgroundColor: tokens.colors.errorScale[50],
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.errorScale[200]}`,
          }}>
            <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>Critical</span>
            <span style={{
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.errorScale[700],
            }}>
              {stats.critical}
            </span>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[1],
            padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
            borderRadius: tokens.borderRadius.full,
            backgroundColor: tokens.colors.warningScale[50],
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.warningScale[200]}`,
          }}>
            <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>Warnings</span>
            <span style={{
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.warningScale[700],
            }}>
              {stats.warnings}
            </span>
          </div>
        </div>
      );
    };

    // ─── Render: Filter Bar ─────────────────────────────────────────────────

    const renderFilterBar = () => {
      const severities: (EventSeverity | null)[] = [null, 'info', 'warning', 'error', 'critical'];

      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing[3],
          marginBottom: tokens.spacing[4],
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
            {severities.map(sev => {
              const isActive = filters.severity === sev || (sev === null && !filters.severity);
              const label = sev === null ? 'All' : getSeverityConfig(sev, tokens).label;
              return (
                <button
                  key={sev ?? 'all'}
                  onClick={() => handleSeverityFilter(sev)}
                  style={{
                    ...createFilterPillStyle(tokens, { active: isActive }),
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <div style={{ flex: 1 }} />
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[2],
            padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
            borderRadius: tokens.borderRadius.md,
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            backgroundColor: tokens.colors.common.white,
            minWidth: 240,
          }}>
            <Search size={14} color={tokens.colors.neutral[400]} />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={e => handleSearchChange(e.target.value)}
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
          </div>
        </div>
      );
    };

    // ─── Render: Event Card ─────────────────────────────────────────────────

    const renderEvent = (event: SecurityEvent) => {
      const typeCfg = getEventTypeConfig(event.type);
      const severityCfg = getSeverityConfig(event.severity, tokens);
      const Icon = typeCfg.icon;
      const isExpanded = expandedEventId === event.id;

      return (
        <div
          key={event.id}
          style={{
            position: 'relative' as const,
            paddingLeft: tokens.spacing[8],
            paddingBottom: tokens.spacing[4],
          }}
        >
          {/* Timeline dot + line */}
          <div style={{
            position: 'absolute' as const,
            left: 0,
            top: 0,
            bottom: 0,
            width: 2,
            backgroundColor: tokens.colors.neutral[200],
          }} />
          <div style={{
            position: 'absolute' as const,
            left: -4,
            top: 6,
            width: 10,
            height: 10,
            borderRadius: tokens.borderRadius.full,
            backgroundColor: severityCfg.color,
            border: `2px solid ${tokens.colors.common.white}`,
            boxShadow: tokens.shadows.sm,
          }} />

          {/* Event card */}
          <div style={{
            ...createCardStyle(tokens, { elevation: 'sm', glass: isModern }),
            padding: tokens.spacing[3],
            borderLeft: `3px solid ${severityCfg.borderColor}`,
            cursor: 'pointer',
          }}
            onClick={() => onEventClick?.(event.id)}
          >
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              marginBottom: tokens.spacing[2],
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: tokens.spacing[2], flex: 1 }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: tokens.borderRadius.md,
                  backgroundColor: severityCfg.bgColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: severityCfg.color,
                  flexShrink: 0,
                }}>
                  <Icon size={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[900],
                    marginBottom: tokens.spacing[1],
                  }}>
                    {typeCfg.label}
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[2],
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[600],
                  }}>
                    {event.actor.avatar ? (
                      <img
                        src={event.actor.avatar}
                        alt={event.actor.name}
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: tokens.borderRadius.full,
                          objectFit: 'cover' as const,
                        }}
                      />
                    ) : (
                      <div style={{
                        width: 20,
                        height: 20,
                        borderRadius: tokens.borderRadius.full,
                        backgroundColor: tokens.colors.primaryScale[100],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.primaryScale[600],
                      }}>
                        {event.actor.name.charAt(0)}
                      </div>
                    )}
                    <span style={{ fontWeight: tokens.typography.fontWeight.medium }}>{event.actor.name}</span>
                    {event.target && (
                      <>
                        <span style={{ color: tokens.colors.neutral[400] }}>&rarr;</span>
                        <span>{event.target.name}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <span style={{
                ...createBadgeStyle(tokens, event.severity === 'critical' || event.severity === 'error' ? 'error' : event.severity === 'warning' ? 'warning' : 'info'),
              }}>
                {severityCfg.label}
              </span>
            </div>

            {/* IP + Location */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[3],
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.neutral[500],
              marginBottom: tokens.spacing[2],
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                <Monitor size={12} />
                <span>{event.ip}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                <MapPin size={12} />
                <span>{event.location}</span>
              </div>
              <span style={{ color: tokens.colors.neutral[300] }}>&middot;</span>
              <span>{formatDistanceToNow(event.timestamp, { addSuffix: true })}</span>
            </div>

            {/* Expand toggle */}
            {event.details && Object.keys(event.details).length > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); toggleEventDetails(event.id); }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: tokens.colors.primaryScale[600],
                  backgroundColor: tokens.colors.primaryScale[50],
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[200]}`,
                  borderRadius: tokens.borderRadius.md,
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  outline: 'none',
                }}
              >
                {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                {isExpanded ? 'Hide' : 'Show'} Details
              </button>
            )}

            {/* Expanded details */}
            {isExpanded && event.details && (
              <div style={{
                marginTop: tokens.spacing[2],
                padding: tokens.spacing[2],
                backgroundColor: tokens.colors.neutral[50],
                borderRadius: tokens.borderRadius.md,
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[700],
              }}>
                {Object.entries(event.details).map(([key, value]) => (
                  <div key={key} style={{ display: 'flex', gap: tokens.spacing[2], marginBottom: tokens.spacing[1] }}>
                    <span style={{ fontWeight: tokens.typography.fontWeight.semibold }}>{key}:</span>
                    <span>{JSON.stringify(value)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    };

    // ─── Render: Empty State ────────────────────────────────────────────────

    const renderEmptyState = () => (
      <div style={{
        ...createCardStyle(tokens, { elevation: 'sm', glass: isModern }),
        ...createEmptyStateStyle(tokens),
      }}>
        <Shield size={48} color={tokens.colors.neutral[300]} style={{ marginBottom: tokens.spacing[3] }} />
        <div style={{
          fontSize: tokens.typography.fontSize.lg,
          fontWeight: tokens.typography.fontWeight.semibold,
          color: tokens.colors.neutral[700],
          marginBottom: tokens.spacing[2],
        }}>
          {emptyText}
        </div>
        <div style={{
          fontSize: tokens.typography.fontSize.sm,
          color: tokens.colors.neutral[500],
          maxWidth: 360,
        }}>
          Security events will appear here when actions are performed.
        </div>
      </div>
    );

    // ─── Main Render ────────────────────────────────────────────────────────

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
        <div style={{ marginBottom: tokens.spacing[4] }}>
          <h1 style={{
            fontSize: tokens.typography.fontSize['2xl'],
            fontWeight: tokens.typography.fontWeight.bold,
            color: tokens.colors.neutral[900],
            margin: 0,
            lineHeight: tokens.typography.lineHeight.tight,
          }}>
            Security Event Log
          </h1>
          <p style={{
            fontSize: tokens.typography.fontSize.sm,
            color: tokens.colors.neutral[500],
            margin: 0,
            marginTop: tokens.spacing[1],
          }}>
            Monitor login attempts, permission changes, and security alerts
          </p>
        </div>

        {renderStatsRibbon()}
        {renderFilterBar()}

        {filteredEvents.length === 0 ? renderEmptyState() : (
          <div>
            {Object.entries(groupedEvents).map(([date, dayEvents]) => (
              <div key={date} style={{ marginBottom: tokens.spacing[6] }}>
                <div style={{
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[500],
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.05em',
                  marginBottom: tokens.spacing[3],
                  paddingLeft: tokens.spacing[8],
                }}>
                  {date}
                </div>
                {dayEvents.map(renderEvent)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  },
});
