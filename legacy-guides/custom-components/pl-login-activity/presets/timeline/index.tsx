'use client';

/**
 * PlLoginActivity - Timeline Preset
 * Activity timeline grouped by date with event details and filtering
 */

import { useState, useMemo, useCallback } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createSurfaceStyle,
  createEmptyStateStyle,
  createFilterPillStyle,
  formatDistanceToNow,
} from '../../../helpers';
import type { PlLoginActivityProps, LoginEvent, LoginResult } from '../../core';
import { PL_LOGIN_ACTIVITY_DEFAULTS } from '../../core';
import {
  CheckCircle,
  XCircle,
  Shield,
  AlertTriangle,
  Flame,
  Monitor,
  Smartphone,
  Tablet,
  MapPin,
  Clock,
  Filter,
} from 'lucide-react';

export const TimelinePlLoginActivity = createPreset<PlLoginActivityProps>({
  name: 'PlLoginActivity.Timeline',
  render: ({ primitives, props, tokens, engine }: PresetContext<PlLoginActivityProps>) => {
    const { Box, Stack } = primitives;
    const isModern = tokens.surface.useGlass;

    const {
      events,
      stats,
      resultFilter: controlledResultFilter,
      onResultFilterChange,
      showSuspiciousOnly: controlledShowSuspicious,
      onSuspiciousFilterChange,
      onEventClick,
      emptyText = PL_LOGIN_ACTIVITY_DEFAULTS.emptyText,
      className,
      style,
    } = props;

    const [internalResultFilter, setInternalResultFilter] = useState<LoginResult | null>(null);
    const [internalShowSuspicious, setInternalShowSuspicious] = useState(false);
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    const resultFilter = controlledResultFilter ?? internalResultFilter;
    const showSuspicious = controlledShowSuspicious ?? internalShowSuspicious;

    const handleResultFilter = useCallback((result: LoginResult | null) => {
      if (controlledResultFilter === undefined) setInternalResultFilter(result);
      onResultFilterChange?.(result);
    }, [controlledResultFilter, onResultFilterChange]);

    const handleSuspiciousFilter = useCallback((enabled: boolean) => {
      if (controlledShowSuspicious === undefined) setInternalShowSuspicious(enabled);
      onSuspiciousFilterChange?.(enabled);
    }, [controlledShowSuspicious, onSuspiciousFilterChange]);

    // Filter events
    const filteredEvents = useMemo(() => {
      let result = [...events];
      if (resultFilter) {
        result = result.filter(e => e.result === resultFilter);
      }
      if (showSuspicious) {
        result = result.filter(e => e.isSuspicious);
      }
      return result;
    }, [events, resultFilter, showSuspicious]);

    // Group by date
    const groupedEvents = useMemo(() => {
      const groups: Record<string, LoginEvent[]> = {};
      filteredEvents.forEach(event => {
        const date = event.timestamp.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        if (!groups[date]) groups[date] = [];
        groups[date].push(event);
      });
      return Object.entries(groups).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());
    }, [filteredEvents]);

    // Result icon config
    const getResultIcon = (result: LoginResult) => {
      switch (result) {
        case 'success':
          return { Icon: CheckCircle, color: tokens.colors.successScale[600] };
        case 'failure':
          return { Icon: XCircle, color: tokens.colors.errorScale[600] };
        case 'blocked':
          return { Icon: Shield, color: tokens.colors.warningScale[600] };
        case 'challenge':
          return { Icon: AlertTriangle, color: tokens.colors.infoScale[600] };
      }
    };

    const getDeviceIcon = (type: string) => {
      switch (type) {
        case 'desktop':
          return Monitor;
        case 'mobile':
          return Smartphone;
        case 'tablet':
          return Tablet;
        default:
          return Monitor;
      }
    };

    // Sparkline for stats (simple SVG)
    const renderSparkline = () => {
      if (!stats) return null;
      const data = [12, 19, 15, 21, 18, 23, 20, 25, 22, 28, 24, 30];
      const max = Math.max(...data);
      const points = data.map((val, idx) => {
        const x = (idx / (data.length - 1)) * 100;
        const y = 100 - (val / max) * 100;
        return `${x},${y}`;
      }).join(' ');

      return (
        <svg width="100" height="30" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ display: 'block' }}>
          <polyline
            points={points}
            fill="none"
            stroke={tokens.colors.primaryScale[500]}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    };

    const renderStatsBar = () => {
      if (!stats) return null;

      return (
        <div
          style={{
            ...createSurfaceStyle(tokens, { elevation: 'sm' }),
            backgroundColor: tokens.colors.common.white,
            padding: `${tokens.spacing[4]}px ${tokens.spacing[5]}px`,
            marginBottom: tokens.spacing[4],
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[6],
            flexWrap: 'wrap' as const,
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.neutral[500],
              marginBottom: tokens.spacing[1],
              textTransform: 'uppercase' as const,
              letterSpacing: '0.05em',
              fontWeight: tokens.typography.fontWeight.medium,
            }}>
              Total Logins
            </div>
            <div style={{
              fontSize: tokens.typography.fontSize['2xl'],
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
            }}>
              {stats.totalLogins}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.neutral[500],
              marginBottom: tokens.spacing[1],
              textTransform: 'uppercase' as const,
              letterSpacing: '0.05em',
              fontWeight: tokens.typography.fontWeight.medium,
            }}>
              Success Rate
            </div>
            <div style={{
              fontSize: tokens.typography.fontSize['2xl'],
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.successScale[600],
            }}>
              {stats.successRate}%
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.neutral[500],
              marginBottom: tokens.spacing[1],
              textTransform: 'uppercase' as const,
              letterSpacing: '0.05em',
              fontWeight: tokens.typography.fontWeight.medium,
            }}>
              Failed
            </div>
            <div style={{
              fontSize: tokens.typography.fontSize['2xl'],
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.errorScale[600],
            }}>
              {stats.failedAttempts}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.neutral[500],
              marginBottom: tokens.spacing[1],
              textTransform: 'uppercase' as const,
              letterSpacing: '0.05em',
              fontWeight: tokens.typography.fontWeight.medium,
            }}>
              Blocked
            </div>
            <div style={{
              fontSize: tokens.typography.fontSize['2xl'],
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.warningScale[600],
            }}>
              {stats.blockedAttempts}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.neutral[500],
              marginBottom: tokens.spacing[1],
              textTransform: 'uppercase' as const,
              letterSpacing: '0.05em',
              fontWeight: tokens.typography.fontWeight.medium,
            }}>
              Locations
            </div>
            <div style={{
              fontSize: tokens.typography.fontSize['2xl'],
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
            }}>
              {stats.uniqueLocations}
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 120 }}>
            <div style={{
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.neutral[500],
              marginBottom: tokens.spacing[1],
              textTransform: 'uppercase' as const,
              letterSpacing: '0.05em',
              fontWeight: tokens.typography.fontWeight.medium,
            }}>
              Peak Hour
            </div>
            <div style={{
              fontSize: tokens.typography.fontSize['2xl'],
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
            }}>
              {stats.peakHour}
            </div>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            {renderSparkline()}
          </div>
        </div>
      );
    };

    const renderFilters = () => {
      const results: Array<LoginResult | null> = [null, 'success', 'failure', 'blocked', 'challenge'];
      const labels: Record<string, string> = {
        null: 'All',
        success: 'Success',
        failure: 'Failed',
        blocked: 'Blocked',
        challenge: 'Challenge',
      };

      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing[3],
          marginBottom: tokens.spacing[4],
          flexWrap: 'wrap' as const,
        }}>
          <Filter size={16} color={tokens.colors.neutral[400]} />
          {results.map(result => {
            const isActive = resultFilter === result || (result === null && !resultFilter);
            return (
              <button
                key={result ?? 'all'}
                onClick={() => handleResultFilter(result)}
                style={{
                  ...createFilterPillStyle(tokens, { active: isActive }),
                }}
              >
                {labels[result ?? 'null']}
              </button>
            );
          })}
          <div style={{ width: 1, height: 20, backgroundColor: tokens.colors.neutral[200], margin: `0 ${tokens.spacing[2]}px` }} />
          <button
            onClick={() => handleSuspiciousFilter(!showSuspicious)}
            style={{
              ...createFilterPillStyle(tokens, { active: showSuspicious }),
              gap: tokens.spacing[1],
            }}
          >
            <Flame size={12} color={showSuspicious ? tokens.colors.warningScale[600] : tokens.colors.neutral[500]} />
            Suspicious Only
          </button>
        </div>
      );
    };

    const renderEvent = (event: LoginEvent) => {
      const { Icon, color } = getResultIcon(event.result);
      const DeviceIcon = getDeviceIcon(event.device.type);
      const isHovered = hoveredId === event.id;

      return (
        <div
          key={event.id}
          onMouseEnter={() => setHoveredId(event.id)}
          onMouseLeave={() => setHoveredId(null)}
          onClick={() => onEventClick?.(event.id)}
          style={{
            display: 'flex',
            gap: tokens.spacing[3],
            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
            backgroundColor: isHovered ? tokens.colors.neutral[50] : tokens.colors.common.white,
            cursor: onEventClick ? 'pointer' : 'default',
            transition: `all ${tokens.motion.hover}`,
            borderRadius: tokens.borderRadius.md,
            position: 'relative' as const,
          }}
        >
          {/* Timeline dot */}
          <div style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center' }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: tokens.borderRadius.full,
              backgroundColor: `${color}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Icon size={20} color={color} />
            </div>
            <div style={{
              flex: 1,
              width: 2,
              backgroundColor: tokens.colors.neutral[200],
              marginTop: tokens.spacing[2],
            }} />
          </div>

          {/* Event content */}
          <div style={{ flex: 1 }}>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              marginBottom: tokens.spacing[2],
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                {event.userAvatar ? (
                  <img
                    src={event.userAvatar}
                    alt={event.userName}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: tokens.borderRadius.full,
                      objectFit: 'cover' as const,
                    }}
                  />
                ) : (
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: tokens.borderRadius.full,
                    backgroundColor: tokens.colors.primaryScale[100],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.primaryScale[600],
                  }}>
                    {event.userName.charAt(0)}
                  </div>
                )}
                <div>
                  <div style={{
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[900],
                  }}>
                    {event.userName}
                  </div>
                  <div style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[500],
                  }}>
                    {event.userEmail}
                  </div>
                </div>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
              }}>
                <Clock size={12} color={tokens.colors.neutral[400]} />
                <span style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[500],
                }}>
                  {formatDistanceToNow(event.timestamp, { addSuffix: true })}
                </span>
              </div>
            </div>

            <div style={{
              display: 'flex',
              flexWrap: 'wrap' as const,
              gap: tokens.spacing[2],
              marginBottom: tokens.spacing[2],
            }}>
              <span style={{
                ...createBadgeStyle(tokens,
                  event.result === 'success' ? 'success' :
                  event.result === 'failure' ? 'error' :
                  event.result === 'blocked' ? 'warning' : 'info'
                ),
              }}>
                {event.result}
              </span>
              <span style={{
                ...createBadgeStyle(tokens, 'secondary'),
              }}>
                {event.method}
              </span>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                borderRadius: tokens.borderRadius.full,
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.medium,
                backgroundColor: tokens.colors.neutral[100],
                color: tokens.colors.neutral[700],
              }}>
                <DeviceIcon size={12} />
                {event.device.type}
              </span>
              {event.isSuspicious && (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                  borderRadius: tokens.borderRadius.full,
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.medium,
                  backgroundColor: tokens.colors.warningScale[100],
                  color: tokens.colors.warningScale[700],
                }}>
                  <Flame size={12} />
                  Risk: {event.riskScore}%
                </span>
              )}
            </div>

            <div style={{
              display: 'flex',
              gap: tokens.spacing[4],
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.neutral[600],
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                <MapPin size={12} color={tokens.colors.neutral[400]} />
                {event.location.city}, {event.location.country}
              </span>
              <span>{event.device.os} · {event.device.browser}</span>
              <span>{event.ip}</span>
            </div>

            {event.failureReason && (
              <div style={{
                marginTop: tokens.spacing[2],
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                backgroundColor: tokens.colors.errorScale[50],
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.errorScale[700],
              }}>
                {event.failureReason}
              </div>
            )}
          </div>
        </div>
      );
    };

    const renderEmptyState = () => (
      <div style={{
        ...createEmptyStateStyle(tokens),
        ...createCardStyle(tokens, { elevation: 'sm' }),
        backgroundColor: tokens.colors.common.white,
      }}>
        <div style={{
          width: 64,
          height: 64,
          borderRadius: tokens.borderRadius.full,
          backgroundColor: tokens.colors.neutral[100],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: tokens.spacing[3],
        }}>
          <Shield size={32} color={tokens.colors.neutral[400]} />
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
        }}>
          No login events match your current filters
        </div>
      </div>
    );

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
          <h2 style={{
            fontSize: tokens.typography.fontSize['2xl'],
            fontWeight: tokens.typography.fontWeight.bold,
            color: tokens.colors.neutral[900],
            margin: 0,
            lineHeight: tokens.typography.lineHeight.tight,
            marginBottom: tokens.spacing[1],
          }}>
            Login Activity
          </h2>
          <p style={{
            fontSize: tokens.typography.fontSize.sm,
            color: tokens.colors.neutral[500],
            margin: 0,
          }}>
            Monitor authentication events with geographic and device tracking
          </p>
        </div>

        {renderStatsBar()}
        {renderFilters()}

        {filteredEvents.length === 0 ? (
          renderEmptyState()
        ) : (
          <div style={{
            ...createCardStyle(tokens, { elevation: 'sm' }),
            backgroundColor: tokens.colors.common.white,
            padding: tokens.spacing[4],
          }}>
            {groupedEvents.map(([date, dateEvents], groupIdx) => (
              <div key={date} style={{ marginBottom: groupIdx < groupedEvents.length - 1 ? tokens.spacing[6] : 0 }}>
                <div style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[700],
                  marginBottom: tokens.spacing[3],
                  paddingBottom: tokens.spacing[2],
                  borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                }}>
                  {date}
                </div>
                {dateEvents.map((event, idx) => (
                  <div key={event.id} style={{ marginBottom: idx < dateEvents.length - 1 ? 0 : 0 }}>
                    {renderEvent(event)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  },
});
