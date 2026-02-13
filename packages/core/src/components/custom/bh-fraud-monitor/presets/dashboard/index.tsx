'use client';

/**
 * BhFraudMonitor - Dashboard Preset
 * Slite-inspired full fraud overview with stats grid, severity filters,
 * event timeline, detail panel, and similarity checks.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { BhFraudMonitorProps, EventSeverity, ReviewStatus, ProctoringEvent } from '../../core';
import { getSeverityColors, getReviewStatusColors, getEventTypeLabel } from '../../core';
import {
  createCardStyle, createBadgeStyle, createCardHoverStyles, createEntranceAnimation,
  createStaggerDelay, createIconContainerStyle, createPersonalitySectionHeaderStyle,
  getPersonalityTypography, getPersonalityBadgeRadius, createPersonalityAccentBar,
  createEmptyStateStyle,
} from '../../../helpers';
import type { DesignTokens } from '../../../../../types';
import { ShieldAlert, AlertTriangle, Filter, BarChart3, Users, Activity } from 'lucide-react';

const MOCK_EVENTS: ProctoringEvent[] = [
  { id: 'fe-1', type: 'tab_switch', severity: 'high', timestamp: '2025-01-20T10:15:00Z', description: 'Candidate switched to external browser tab during coding challenge', scorableId: 'sc-1', candidateName: 'John Doe', reviewStatus: 'pending' },
  { id: 'fe-2', type: 'copy_paste', severity: 'critical', timestamp: '2025-01-20T10:18:00Z', description: 'Large code block pasted from clipboard during technical assessment', scorableId: 'sc-1', candidateName: 'John Doe', reviewStatus: 'flagged' },
  { id: 'fe-3', type: 'focus_loss', severity: 'medium', timestamp: '2025-01-20T10:22:00Z', description: 'Browser window lost focus for 45 seconds', scorableId: 'sc-2', candidateName: 'Jane Smith', reviewStatus: 'pending' },
  { id: 'fe-4', type: 'suspicious_timing', severity: 'low', timestamp: '2025-01-20T10:30:00Z', description: 'Answer submitted unusually fast for question complexity', scorableId: 'sc-3', candidateName: 'Alex Johnson', reviewStatus: 'dismissed' },
  { id: 'fe-5', type: 'similarity_flag', severity: 'high', timestamp: '2025-01-20T11:00:00Z', description: '87% similarity detected with another candidate submission', scorableId: 'sc-4', candidateName: 'Sam Wilson', reviewStatus: 'escalated' },
];

export const DashboardBhFraudMonitor = createPreset<BhFraudMonitorProps>({
  name: 'BhFraudMonitor.Dashboard',
  render: ({ primitives, props, tokens }: PresetContext<BhFraudMonitorProps>) => {
    const { Box, Text } = primitives;
    const isGlass = tokens.surface.useGlass;
    const sevColors = useMemo(() => getSeverityColors(tokens), [tokens]);
    const reviewColors = useMemo(() => getReviewStatusColors(tokens), [tokens]);
    const ptypo = useMemo(() => getPersonalityTypography(tokens), [tokens]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(tokens), [tokens]);
    const hoverStyles = useMemo(() => createCardHoverStyles(tokens), [tokens]);
    const entrance = useMemo(() => createEntranceAnimation(tokens), [tokens]);
    const sectionLabel = useMemo(() => createPersonalitySectionHeaderStyle(tokens), [tokens]);

    const {
      events = MOCK_EVENTS, similarityChecks = [], stats,
      selectedEventId: selectedEventIdProp, onEventSelect, onReviewAction,
      severityFilter: severityFilterProp, onSeverityFilterChange,
      loading, className, style,
    } = props;

    const [internalSelectedId, setInternalSelectedId] = useState(selectedEventIdProp ?? '');
    const [internalSeverityFilter, setInternalSeverityFilter] = useState<EventSeverity[]>([]);

    const selectedEventId = selectedEventIdProp ?? internalSelectedId;
    const activeSeverityFilter = severityFilterProp ?? internalSeverityFilter;

    const handleEventSelect = useCallback((id: string) => {
      setInternalSelectedId(id);
      onEventSelect?.(id);
    }, [onEventSelect]);

    const toggleSeverity = useCallback((sev: EventSeverity) => {
      const next = activeSeverityFilter.includes(sev)
        ? activeSeverityFilter.filter(s => s !== sev)
        : [...activeSeverityFilter, sev];
      setInternalSeverityFilter(next);
      onSeverityFilterChange?.(next);
    }, [activeSeverityFilter, onSeverityFilterChange]);

    const filteredEvents = useMemo(() => activeSeverityFilter.length > 0
      ? events.filter(e => activeSeverityFilter.includes(e.severity))
      : events, [events, activeSeverityFilter]);

    const selectedEvent = useMemo(() => events.find(e => e.id === selectedEventId), [events, selectedEventId]);

    const computedStats = useMemo(() => stats ?? {
      totalEvents: events.length,
      criticalCount: events.filter(e => e.severity === 'critical').length,
      pendingReview: events.filter(e => e.reviewStatus === 'pending').length,
      flaggedScorables: new Set(events.filter(e => e.reviewStatus === 'flagged').map(e => e.scorableId)).size,
    }, [stats, events]);

    const severityOptions: EventSeverity[] = useMemo(() => ['critical', 'high', 'medium', 'low'], []);

    if (loading) {
      return (
        <Box className={className} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: `${tokens.spacing[10]}px`, ...style,
        }}>
          <Text style={{ color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>Loading fraud data...</Text>
        </Box>
      );
    }

    const statCardStyle = (accentColor: string) => ({
      ...createCardStyle(tokens, { elevation: 'sm', padding: 0, glass: isGlass }),
      borderRadius: tokens.borderRadius.lg,
      border: `1px solid ${tokens.colors.neutral[100]}`,
      overflow: 'hidden' as const,
    });

    return (
      <Box className={className} style={{ ...style }}>
        {/* Stats Grid */}
        <Box style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: tokens.spacing[4], marginBottom: tokens.spacing[6],
        }}>
          {[
            { label: 'Total Events', value: computedStats.totalEvents, color: tokens.colors.neutral[700], icon: <Activity size={16} /> },
            { label: 'Critical', value: computedStats.criticalCount, color: tokens.colors.errorScale[600], icon: <AlertTriangle size={16} /> },
            { label: 'Pending Review', value: computedStats.pendingReview, color: tokens.colors.warningScale[600], icon: <ShieldAlert size={16} /> },
            { label: 'Flagged Scorables', value: computedStats.flaggedScorables, color: tokens.colors.errorScale[700], icon: <Users size={16} /> },
          ].map(stat => (
            <Box key={stat.label} style={statCardStyle(stat.color)}>
              <Box style={{ height: 3, backgroundColor: stat.color, borderRadius: `${tokens.borderRadius.lg} ${tokens.borderRadius.lg} 0 0` }} />
              <Box style={{ padding: `${tokens.spacing[5]}px ${tokens.spacing[5]}px` }}>
                <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[2] }}>
                  <Box style={{ color: tokens.colors.neutral[400] }}>{stat.icon}</Box>
                  <Text style={{
                    fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold,
                    color: tokens.colors.neutral[500], textTransform: 'uppercase' as const, letterSpacing: '0.05em',
                  }}>{stat.label}</Text>
                </Box>
                <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>
                  {stat.value}
                </Text>
              </Box>
            </Box>
          ))}
        </Box>

        {/* Severity Filters */}
        <Box style={{
          display: 'flex', alignItems: 'center', gap: tokens.spacing[2],
          marginBottom: tokens.spacing[4], flexWrap: 'wrap' as const,
        }}>
          <Filter size={14} color={tokens.colors.neutral[400]} />
          <Text style={{
            fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold,
            color: tokens.colors.neutral[500], textTransform: 'uppercase' as const, letterSpacing: '0.05em',
          }}>Severity:</Text>
          {severityOptions.map(sev => {
            const sc = sevColors[sev];
            const isActive = activeSeverityFilter.includes(sev);
            return (
              <Box
                key={sev}
                onClick={() => toggleSeverity(sev)}
                role="button"
                tabIndex={0}
                aria-label={`Filter by ${sev} severity`}
                aria-pressed={isActive}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSeverity(sev); } }}
                style={{
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                  borderRadius: badgeRadius,
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: isActive ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.medium,
                  backgroundColor: isActive ? sc.bgColor : tokens.colors.common.white,
                  color: isActive ? sc.color : tokens.colors.neutral[500],
                  border: `1px solid ${isActive ? sc.border : tokens.colors.neutral[200]}`,
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  display: 'flex', alignItems: 'center', gap: tokens.spacing[1],
                }}
              >
                <Box style={{ width: 6, height: 6, borderRadius: tokens.borderRadius.full, backgroundColor: sc.dot }} />
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: isActive ? sc.color : tokens.colors.neutral[600], textTransform: 'capitalize' as const }}>{sev}</Text>
              </Box>
            );
          })}
        </Box>

        {/* Event Timeline + Detail */}
        <Box style={{ display: 'flex', gap: tokens.spacing[5] }}>
          {/* Event List */}
          <Box style={{
            flex: 1,
            ...createCardStyle(tokens, { elevation: 'sm', padding: 0, glass: isGlass }),
            borderRadius: tokens.borderRadius.lg,
            border: `1px solid ${tokens.colors.neutral[100]}`,
            overflow: 'hidden',
          }}>
            <Box style={{
              padding: `${tokens.spacing[4]}px ${tokens.spacing[5]}px`,
              borderBottom: `1px solid ${tokens.colors.neutral[100]}`,
              display: 'flex', alignItems: 'center', gap: tokens.spacing[2],
            }}>
              <BarChart3 size={16} color={tokens.colors.neutral[500]} />
              <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>
                Events ({filteredEvents.length})
              </Text>
            </Box>
            <Box style={{ maxHeight: 400, overflowY: 'auto' as const }}>
              {filteredEvents.map(ev => {
                const sc = sevColors[ev.severity];
                const rc = reviewColors[ev.reviewStatus];
                const isSelected = selectedEventId === ev.id;
                return (
                  <Box
                    key={ev.id}
                    onClick={() => handleEventSelect(ev.id)}
                    style={{
                      padding: `${tokens.spacing[3]}px ${tokens.spacing[5]}px`,
                      borderBottom: `1px solid ${tokens.colors.neutral[100]}`,
                      borderLeft: `3px solid ${sc.dot}`,
                      backgroundColor: isSelected ? tokens.colors.primaryScale[50] : 'transparent',
                      cursor: 'pointer',
                      transition: `all ${tokens.motion.hover}`,
                    }}
                  >
                    <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[1] }}>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                        <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>
                          {getEventTypeLabel(ev.type)}
                        </Text>
                        <Box style={{ padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.full, background: sc.bgColor }}>
                          <Text style={{ fontSize: tokens.typography.fontSize.xs, color: sc.color, textTransform: 'capitalize' as const }}>{ev.severity}</Text>
                        </Box>
                      </Box>
                      <Box style={{ padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.full, background: rc.bgColor }}>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: rc.color, textTransform: 'capitalize' as const }}>{ev.reviewStatus}</Text>
                      </Box>
                    </Box>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>{ev.description}</Text>
                    <Box style={{ display: 'flex', justifyContent: 'space-between', marginTop: tokens.spacing[1] }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{ev.timestamp}</Text>
                      {ev.candidateName && <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{ev.candidateName}</Text>}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* Detail Panel */}
          {selectedEvent && (
            <Box style={{
              width: 300,
              ...createCardStyle(tokens, { elevation: 'sm', glass: isGlass }),
              borderRadius: tokens.borderRadius.lg,
              border: `1px solid ${tokens.colors.neutral[100]}`,
              padding: `${tokens.spacing[5]}px ${tokens.spacing[5]}px`,
            }}>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], marginBottom: tokens.spacing[4] }}>
                Event Detail
              </Text>
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[3] }}>
                <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1] }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginBottom: tokens.spacing[1] }}>Type</Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[800] }}>{getEventTypeLabel(selectedEvent.type)}</Text>
                </Box>
                <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1] }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginBottom: tokens.spacing[1] }}>Description</Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[800] }}>{selectedEvent.description}</Text>
                </Box>
                <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1] }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginBottom: tokens.spacing[1] }}>Timestamp</Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[800] }}>{selectedEvent.timestamp}</Text>
                </Box>
                {selectedEvent.metadata && Object.entries(selectedEvent.metadata).map(([key, val]) => (
                  <Box key={key}>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginBottom: tokens.spacing[1] }}>{key}</Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[800] }}>{String(val)}</Text>
                  </Box>
                ))}
                {onReviewAction && selectedEvent.reviewStatus === 'pending' && (
                  <Box style={{ display: 'flex', gap: tokens.spacing[2], marginTop: tokens.spacing[2] }}>
                    <Box
                      onClick={() => onReviewAction(selectedEvent.id, 'dismissed')}
                      role="button" tabIndex={0} aria-label="Dismiss event"
                      onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onReviewAction(selectedEvent.id, 'dismissed'); } }}
                      style={{
                        flex: 1, padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                        borderRadius: tokens.borderRadius.md, background: tokens.colors.neutral[100],
                        textAlign: 'center' as const, cursor: 'pointer', transition: `all ${tokens.motion.hover}`,
                      }}
                    >
                      <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700] }}>Dismiss</Text>
                    </Box>
                    <Box
                      onClick={() => onReviewAction(selectedEvent.id, 'flagged')}
                      role="button" tabIndex={0} aria-label="Flag event"
                      onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onReviewAction(selectedEvent.id, 'flagged'); } }}
                      style={{
                        flex: 1, padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                        borderRadius: tokens.borderRadius.md, background: tokens.colors.errorScale[50],
                        textAlign: 'center' as const, cursor: 'pointer', transition: `all ${tokens.motion.hover}`,
                        border: `1px solid ${tokens.colors.errorScale[200]}`,
                      }}
                    >
                      <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.errorScale[700] }}>Flag</Text>
                    </Box>
                    <Box
                      onClick={() => onReviewAction(selectedEvent.id, 'escalated')}
                      role="button" tabIndex={0} aria-label="Escalate event"
                      onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onReviewAction(selectedEvent.id, 'escalated'); } }}
                      style={{
                        flex: 1, padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                        borderRadius: tokens.borderRadius.md, background: tokens.colors.errorScale[100],
                        textAlign: 'center' as const, cursor: 'pointer', transition: `all ${tokens.motion.hover}`,
                        border: `1px solid ${tokens.colors.errorScale[300]}`,
                      }}
                    >
                      <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.errorScale[800] }}>Escalate</Text>
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </Box>

        {/* Similarity Checks */}
        {similarityChecks.length > 0 && (
          <Box style={{
            marginTop: tokens.spacing[5],
            ...createCardStyle(tokens, { elevation: 'sm', padding: 0, glass: isGlass }),
            borderRadius: tokens.borderRadius.lg,
            border: `1px solid ${tokens.colors.neutral[100]}`,
            overflow: 'hidden',
          }}>
            <Box style={{
              padding: `${tokens.spacing[4]}px ${tokens.spacing[5]}px`,
              borderBottom: `1px solid ${tokens.colors.neutral[100]}`,
              display: 'flex', alignItems: 'center', gap: tokens.spacing[2],
            }}>
              <Users size={16} color={tokens.colors.neutral[500]} />
              <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>
                Similarity Checks ({similarityChecks.length})
              </Text>
            </Box>
            <Box style={{ display: 'flex', flexDirection: 'column' as const }}>
              {similarityChecks.map(check => (
                <Box key={check.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: `${tokens.spacing[3]}px ${tokens.spacing[5]}px`,
                  borderBottom: `1px solid ${tokens.colors.neutral[100]}`,
                }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[800] }}>{check.candidateName}</Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>vs {check.comparedWith}</Text>
                  </Box>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                    <Text style={{
                      fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold,
                      color: check.flagged ? tokens.colors.errorScale[600] : tokens.colors.neutral[600],
                    }}>
                      {(check.similarityScore * 100).toFixed(0)}%
                    </Text>
                    {check.flagged && (
                      <Box style={{
                        padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                        borderRadius: tokens.borderRadius.full,
                        background: tokens.colors.errorScale[50],
                        border: `1px solid ${tokens.colors.errorScale[200]}`,
                      }}>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.errorScale[700] }}>Flagged</Text>
                      </Box>
                    )}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    );
  },
});
