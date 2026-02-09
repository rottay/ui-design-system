'use client';

/**
 * PlLoginActivity - Map Preset
 * Geographic view of login activity with location-based insights
 */

import { useState, useMemo, useCallback } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createSurfaceStyle,
  createEmptyStateStyle,
  formatDistanceToNow,
} from '../../../helpers';
import type { PlLoginActivityProps, LoginEvent } from '../../core';
import { PL_LOGIN_ACTIVITY_DEFAULTS } from '../../core';
import { MapPin, Clock, Users, AlertTriangle, TrendingUp } from 'lucide-react';

export const MapPlLoginActivity = createPreset<PlLoginActivityProps>({
  name: 'PlLoginActivity.Map',
  render: ({ primitives, props, tokens, engine }: PresetContext<PlLoginActivityProps>) => {
    const { Box, Stack } = primitives;
    const isModern = tokens.surface.useGlass;

    const {
      events,
      stats,
      onEventClick,
      emptyText = PL_LOGIN_ACTIVITY_DEFAULTS.emptyText,
      className,
      style,
    } = props;

    const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

    // Aggregate by location
    const locationData = useMemo(() => {
      const grouped: Record<string, {
        country: string;
        city: string;
        loginCount: number;
        successCount: number;
        failCount: number;
        lastLogin: Date;
        uniqueUsers: number;
        isFlagged: boolean;
        events: LoginEvent[];
      }> = {};

      events.forEach(event => {
        const key = `${event.location.city}, ${event.location.country}`;
        if (!grouped[key]) {
          grouped[key] = {
            country: event.location.country,
            city: event.location.city,
            loginCount: 0,
            successCount: 0,
            failCount: 0,
            lastLogin: event.timestamp,
            uniqueUsers: 0,
            isFlagged: false,
            events: [],
          };
        }
        grouped[key].loginCount++;
        if (event.result === 'success') grouped[key].successCount++;
        if (event.result === 'failure') grouped[key].failCount++;
        if (event.timestamp > grouped[key].lastLogin) grouped[key].lastLogin = event.timestamp;
        grouped[key].events.push(event);
        grouped[key].isFlagged = grouped[key].isFlagged || event.isSuspicious;
      });

      // Calculate unique users
      Object.keys(grouped).forEach(key => {
        const uniqueIds = new Set(grouped[key].events.map(e => e.userId));
        grouped[key].uniqueUsers = uniqueIds.size;
      });

      return Object.entries(grouped).sort((a, b) => b[1].loginCount - a[1].loginCount);
    }, [events]);

    // Top countries
    const topCountries = useMemo(() => {
      const countries: Record<string, number> = {};
      events.forEach(e => {
        countries[e.location.country] = (countries[e.location.country] || 0) + 1;
      });
      return Object.entries(countries).sort((a, b) => b[1] - a[1]).slice(0, 5);
    }, [events]);

    // Unusual locations (flagged)
    const unusualLocations = useMemo(() => {
      return locationData.filter(([_, data]) => data.isFlagged).length;
    }, [locationData]);

    const renderMapPlaceholder = () => {
      return (
        <div style={{
          ...createCardStyle(tokens, { elevation: 'sm' }),
          backgroundColor: tokens.colors.neutral[100],
          height: 400,
          position: 'relative' as const,
          overflow: 'hidden' as const,
          background: `linear-gradient(180deg, ${tokens.colors.primaryScale[50]} 0%, ${tokens.colors.neutral[100]} 100%)`,
        }}>
          {/* Decorative map dots */}
          <svg width="100%" height="100%" style={{ position: 'absolute' as const, top: 0, left: 0 }}>
            {locationData.slice(0, 10).map(([key, data], idx) => {
              const x = 10 + (idx * 90) % 90;
              const y = 20 + (idx * 40) % 60;
              const color = data.isFlagged ? tokens.colors.errorScale[500] : tokens.colors.primaryScale[500];
              return (
                <g key={key}>
                  <circle cx={`${x}%`} cy={`${y}%`} r="4" fill={color} opacity="0.3" />
                  <circle cx={`${x}%`} cy={`${y}%`} r="8" fill={color} opacity="0.15" />
                  <circle cx={`${x}%`} cy={`${y}%`} r="3" fill={color} />
                </g>
              );
            })}
          </svg>
          <div style={{
            position: 'absolute' as const,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center' as const,
          }}>
            <MapPin size={48} color={tokens.colors.primaryScale[400]} style={{ marginBottom: tokens.spacing[2] }} />
            <div style={{
              fontSize: tokens.typography.fontSize.lg,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[700],
            }}>
              Login Activity Map
            </div>
            <div style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[500],
              marginTop: tokens.spacing[1],
            }}>
              {locationData.length} locations detected
            </div>
          </div>
        </div>
      );
    };

    const renderLocationCard = ([key, data]: [string, any], idx: number) => {
      const isSelected = selectedLocation === key;
      const successRate = data.loginCount > 0 ? Math.round((data.successCount / data.loginCount) * 100) : 0;

      return (
        <div
          key={key}
          onClick={() => setSelectedLocation(isSelected ? null : key)}
          style={{
            ...createCardStyle(tokens, { elevation: 'sm', interactive: true }),
            cursor: 'pointer',
            transition: `all ${tokens.motion.hover}`,
            transform: isSelected ? tokens.motion.transform : 'none',
            border: data.isFlagged
              ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.errorScale[300]}`
              : `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            backgroundColor: isSelected ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
          }}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: tokens.spacing[3],
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: tokens.borderRadius.full,
                backgroundColor: data.isFlagged ? tokens.colors.errorScale[50] : tokens.colors.primaryScale[50],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <MapPin size={20} color={data.isFlagged ? tokens.colors.errorScale[600] : tokens.colors.primaryScale[600]} />
              </div>
              <div>
                <div style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[900],
                }}>
                  {data.city}
                </div>
                <div style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[500],
                }}>
                  {data.country}
                </div>
              </div>
            </div>
            {data.isFlagged && (
              <AlertTriangle size={16} color={tokens.colors.errorScale[600]} />
            )}
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: tokens.spacing[3],
            marginBottom: tokens.spacing[3],
          }}>
            <div>
              <div style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[500],
                marginBottom: tokens.spacing[1],
              }}>
                Logins
              </div>
              <div style={{
                fontSize: tokens.typography.fontSize.lg,
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[900],
              }}>
                {data.loginCount}
              </div>
            </div>
            <div>
              <div style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[500],
                marginBottom: tokens.spacing[1],
              }}>
                Success Rate
              </div>
              <div style={{
                fontSize: tokens.typography.fontSize.lg,
                fontWeight: tokens.typography.fontWeight.bold,
                color: successRate >= 90 ? tokens.colors.successScale[600] : successRate >= 70 ? tokens.colors.warningScale[600] : tokens.colors.errorScale[600],
              }}>
                {successRate}%
              </div>
            </div>
            <div>
              <div style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[500],
                marginBottom: tokens.spacing[1],
              }}>
                Users
              </div>
              <div style={{
                fontSize: tokens.typography.fontSize.lg,
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[900],
              }}>
                {data.uniqueUsers}
              </div>
            </div>
            <div>
              <div style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[500],
                marginBottom: tokens.spacing[1],
              }}>
                Last Login
              </div>
              <div style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[900],
              }}>
                {formatDistanceToNow(data.lastLogin, { addSuffix: true })}
              </div>
            </div>
          </div>

          {isSelected && data.events.length > 0 && (
            <div style={{
              paddingTop: tokens.spacing[3],
              borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            }}>
              <div style={{
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[600],
                marginBottom: tokens.spacing[2],
                textTransform: 'uppercase' as const,
                letterSpacing: '0.05em',
              }}>
                Recent Activity
              </div>
              {data.events.slice(0, 3).map((event: LoginEvent) => (
                <div
                  key={event.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEventClick?.(event.id);
                  }}
                  style={{
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                    borderRadius: tokens.borderRadius.md,
                    backgroundColor: tokens.colors.neutral[50],
                    marginBottom: tokens.spacing[1],
                    fontSize: tokens.typography.fontSize.xs,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: `background-color ${tokens.motion.hover}`,
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = tokens.colors.neutral[100]}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = tokens.colors.neutral[50]}
                >
                  <span style={{ color: tokens.colors.neutral[700] }}>{event.userName}</span>
                  <span style={{
                    ...createBadgeStyle(tokens,
                      event.result === 'success' ? 'success' :
                      event.result === 'failure' ? 'error' :
                      event.result === 'blocked' ? 'warning' : 'info'
                    ),
                  }}>
                    {event.result}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    };

    const renderStatsSidebar = () => {
      return (
        <div style={{
          ...createCardStyle(tokens, { elevation: 'sm' }),
          backgroundColor: tokens.colors.common.white,
          padding: tokens.spacing[4],
          height: 'fit-content',
        }}>
          <h3 style={{
            fontSize: tokens.typography.fontSize.lg,
            fontWeight: tokens.typography.fontWeight.semibold,
            color: tokens.colors.neutral[900],
            margin: 0,
            marginBottom: tokens.spacing[4],
          }}>
            Insights
          </h3>

          {/* Top Countries */}
          <div style={{ marginBottom: tokens.spacing[4] }}>
            <div style={{
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[600],
              marginBottom: tokens.spacing[2],
              textTransform: 'uppercase' as const,
              letterSpacing: '0.05em',
            }}>
              Top Countries
            </div>
            {topCountries.map(([country, count], idx) => (
              <div
                key={country}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: `${tokens.spacing[2]}px 0`,
                  borderBottom: idx < topCountries.length - 1 ? `1px solid ${tokens.colors.neutral[100]}` : 'none',
                }}
              >
                <span style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[700],
                }}>
                  {country}
                </span>
                <span style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.primaryScale[600],
                }}>
                  {count}
                </span>
              </div>
            ))}
          </div>

          {/* Stats */}
          {stats && (
            <div style={{ marginBottom: tokens.spacing[4] }}>
              <div style={{
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[600],
                marginBottom: tokens.spacing[2],
                textTransform: 'uppercase' as const,
                letterSpacing: '0.05em',
              }}>
                Statistics
              </div>
              <div style={{
                padding: `${tokens.spacing[3]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                backgroundColor: tokens.colors.neutral[50],
                marginBottom: tokens.spacing[2],
              }}>
                <div style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[500],
                  marginBottom: tokens.spacing[1],
                }}>
                  Peak Hour
                </div>
                <div style={{
                  fontSize: tokens.typography.fontSize.lg,
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.neutral[900],
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                }}>
                  <Clock size={16} color={tokens.colors.primaryScale[600]} />
                  {stats.peakHour}
                </div>
              </div>
              <div style={{
                padding: `${tokens.spacing[3]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                backgroundColor: unusualLocations > 0 ? tokens.colors.warningScale[50] : tokens.colors.neutral[50],
              }}>
                <div style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[500],
                  marginBottom: tokens.spacing[1],
                }}>
                  Unusual Locations
                </div>
                <div style={{
                  fontSize: tokens.typography.fontSize.lg,
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: unusualLocations > 0 ? tokens.colors.warningScale[700] : tokens.colors.neutral[900],
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                }}>
                  <AlertTriangle size={16} />
                  {unusualLocations}
                </div>
              </div>
            </div>
          )}
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
          <MapPin size={32} color={tokens.colors.neutral[400]} />
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
          No geographic data available
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
            Login Geography
          </h2>
          <p style={{
            fontSize: tokens.typography.fontSize.sm,
            color: tokens.colors.neutral[500],
            margin: 0,
          }}>
            Geographic distribution of authentication activity
          </p>
        </div>

        {events.length === 0 ? (
          renderEmptyState()
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 320px',
            gap: tokens.spacing[4],
          }}>
            <div>
              {renderMapPlaceholder()}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: tokens.spacing[4],
                marginTop: tokens.spacing[4],
              }}>
                {locationData.map((entry, idx) => renderLocationCard(entry, idx))}
              </div>
            </div>
            <div>
              {renderStatsSidebar()}
            </div>
          </div>
        )}
      </div>
    );
  },
});
