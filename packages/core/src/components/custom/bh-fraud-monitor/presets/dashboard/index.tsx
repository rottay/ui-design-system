'use client';

/**
 * BhFraudMonitor - Dashboard Preset
 * Stats grid + event timeline + review workflow
 */

import { useState } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { BhFraudMonitorProps, EventSeverity, ReviewStatus } from '../../core';
import { getSeverityColors, getReviewStatusColors, getEventTypeLabel } from '../../core';
import {
  createAccentBarStyle,
  createCardStyle,
  createFilterPillStyle,
  createHoverStyle,
  createListItemStyle,
  createPanelHeaderStyle,
  createSectionHeaderStyle,
  createStatusDotStyle,
} from '../../../helpers';

export const DashboardBhFraudMonitor = createPreset<BhFraudMonitorProps>({
  name: 'BhFraudMonitor.Dashboard',
  render: ({ primitives, props, tokens, engine }: PresetContext<BhFraudMonitorProps>) => {
    const { Box, Flex, Stack, Text, Grid } = primitives;
    const isGlass = engine === 'modern' && !!tokens.glass;
    const sevColors = getSeverityColors(tokens);
    const reviewColors = getReviewStatusColors(tokens);

    const {
      events,
      similarityChecks = [],
      stats,
      selectedEventId: selectedEventIdProp,
      onEventSelect,
      onReviewAction,
      severityFilter: severityFilterProp,
      onSeverityFilterChange,
      loading,
      className,
      style,
    } = props;

    const [internalSelectedId, setInternalSelectedId] = useState(selectedEventIdProp ?? '');
    const [internalSeverityFilter, setInternalSeverityFilter] = useState<EventSeverity[]>([]);

    const selectedEventId = selectedEventIdProp ?? internalSelectedId;
    const activeSeverityFilter = severityFilterProp ?? internalSeverityFilter;

    const handleEventSelect = (id: string) => {
      setInternalSelectedId(id);
      onEventSelect?.(id);
    };

    const toggleSeverity = (sev: EventSeverity) => {
      const next = activeSeverityFilter.includes(sev)
        ? activeSeverityFilter.filter(s => s !== sev)
        : [...activeSeverityFilter, sev];
      setInternalSeverityFilter(next);
      onSeverityFilterChange?.(next);
    };

    const filteredEvents = activeSeverityFilter.length > 0
      ? events.filter(e => activeSeverityFilter.includes(e.severity))
      : events;

    const selectedEvent = events.find(e => e.id === selectedEventId);

    const computedStats = stats ?? {
      totalEvents: events.length,
      criticalCount: events.filter(e => e.severity === 'critical').length,
      pendingReview: events.filter(e => e.reviewStatus === 'pending').length,
      flaggedScorables: new Set(events.filter(e => e.reviewStatus === 'flagged').map(e => e.scorableId)).size,
    };

    const severityOptions: EventSeverity[] = ['critical', 'high', 'medium', 'low'];

    if (loading) {
      return (
        <Flex align="center" justify="center" style={{ padding: tokens.spacing[8], ...style }} className={className}>
          <Text style={{ color: tokens.colors.neutral[500] }}>Loading fraud data...</Text>
        </Flex>
      );
    }

    return (
      <Box className={className} style={{ ...style }}>
        {/* Stats Grid */}
        <Grid columns={{ xs: 2, sm: 4 }} gap={12} style={{ marginBottom: tokens.spacing[4] }}>
          {[
            { label: 'Total Events', value: computedStats.totalEvents, color: tokens.colors.neutral[700] },
            { label: 'Critical', value: computedStats.criticalCount, color: tokens.colors.errorScale[600] },
            { label: 'Pending Review', value: computedStats.pendingReview, color: tokens.colors.warningScale[600] },
            { label: 'Flagged Scorables', value: computedStats.flaggedScorables, color: tokens.colors.errorScale[700] },
          ].map(stat => (
            <Box key={stat.label} style={{ ...createCardStyle(tokens), overflow: 'hidden', position: 'relative' as const }}>
              <div style={createAccentBarStyle(tokens, { position: 'top', color: stat.color })} />
              <Text style={createSectionHeaderStyle(tokens)}>{stat.label}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.semibold, color: stat.color }}>{stat.value}</Text>
            </Box>
          ))}
        </Grid>

        {/* Severity Filters */}
        <Flex gap={6} style={{ marginBottom: tokens.spacing[3] }} wrap="wrap">
          <Text style={{ ...createSectionHeaderStyle(tokens), alignSelf: 'center', marginBottom: 0 }}>Severity:</Text>
          {severityOptions.map(sev => {
            const sc = sevColors[sev];
            const isActive = activeSeverityFilter.includes(sev);
            return (
              <Box
                key={sev}
                onClick={() => toggleSeverity(sev)}
                style={{
                  ...createFilterPillStyle(tokens, { active: isActive }),
                  ...(isActive ? { backgroundColor: sc.bgColor, borderColor: sc.border, color: sc.color } : {}),
                }}
              >
                <Flex gap={4} align="center">
                  <Box style={createStatusDotStyle(tokens, sc.dot)} />
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: isActive ? sc.color : tokens.colors.neutral[600], textTransform: 'capitalize' as const }}>{sev}</Text>
                </Flex>
              </Box>
            );
          })}
        </Flex>

        {/* Event Timeline + Detail */}
        <Flex gap={16}>
          {/* Event List */}
          <Box style={{ flex: 1, ...createCardStyle(tokens, { glass: isGlass, padding: 0 }), overflow: 'hidden' }}>
            <Box style={createPanelHeaderStyle(tokens)}>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>
                Events ({filteredEvents.length})
              </Text>
            </Box>
            <Stack gap={0} style={{ maxHeight: 400, overflowY: 'auto' }}>
              {filteredEvents.map(ev => {
                const sc = sevColors[ev.severity];
                const rc = reviewColors[ev.reviewStatus];
                const isSelected = selectedEventId === ev.id;
                return (
                  <Box
                    key={ev.id}
                    onClick={() => handleEventSelect(ev.id)}
                    style={{
                      ...createListItemStyle(tokens, { active: isSelected, interactive: true }),
                      borderLeft: `3px solid ${sc.dot}`,
                    }}
                  >
                    <Flex justify="between" align="center" style={{ marginBottom: tokens.spacing[1] }}>
                      <Flex gap={6} align="center">
                        <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>
                          {getEventTypeLabel(ev.type)}
                        </Text>
                        <Box style={{ padding: `${tokens.spacing[0]}px ${tokens.spacing[1]}px`, borderRadius: tokens.borderRadius.full, background: sc.bgColor }}>
                          <Text style={{ fontSize: tokens.typography.fontSize.xs, color: sc.color, textTransform: 'capitalize' as const }}>{ev.severity}</Text>
                        </Box>
                      </Flex>
                      <Box style={{ padding: `${tokens.spacing[0]}px ${tokens.spacing[1]}px`, borderRadius: tokens.borderRadius.full, background: rc.bgColor }}>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: rc.color, textTransform: 'capitalize' as const }}>{ev.reviewStatus}</Text>
                      </Box>
                    </Flex>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>{ev.description}</Text>
                    <Flex justify="between" style={{ marginTop: tokens.spacing[1] }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{ev.timestamp}</Text>
                      {ev.candidateName && <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{ev.candidateName}</Text>}
                    </Flex>
                  </Box>
                );
              })}
            </Stack>
          </Box>

          {/* Detail Panel */}
          {selectedEvent && (
            <Box style={{ width: 300, ...createCardStyle(tokens) }}>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800], marginBottom: tokens.spacing[3] }}>
                Event Detail
              </Text>
              <Stack gap={8}>
                <Box>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Type</Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[800] }}>{getEventTypeLabel(selectedEvent.type)}</Text>
                </Box>
                <Box>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Description</Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[800] }}>{selectedEvent.description}</Text>
                </Box>
                <Box>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Timestamp</Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[800] }}>{selectedEvent.timestamp}</Text>
                </Box>
                {selectedEvent.metadata && Object.entries(selectedEvent.metadata).map(([key, val]) => (
                  <Box key={key}>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{key}</Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[800] }}>{String(val)}</Text>
                  </Box>
                ))}
                {onReviewAction && selectedEvent.reviewStatus === 'pending' && (
                  <Flex gap={8} style={{ marginTop: tokens.spacing[2] }}>
                    <Box
                      onClick={() => onReviewAction(selectedEvent.id, 'dismissed')}
                      style={{ flex: 1, padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md, background: tokens.colors.neutral[100], textAlign: 'center' as const, cursor: 'pointer', transition: `all ${tokens.motion.hover}` }}
                    >
                      <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700] }}>Dismiss</Text>
                    </Box>
                    <Box
                      onClick={() => onReviewAction(selectedEvent.id, 'flagged')}
                      style={{ flex: 1, padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md, background: tokens.colors.errorScale[50], textAlign: 'center' as const, cursor: 'pointer', transition: `all ${tokens.motion.hover}`, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.errorScale[200]}` }}
                    >
                      <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.errorScale[700] }}>Flag</Text>
                    </Box>
                    <Box
                      onClick={() => onReviewAction(selectedEvent.id, 'escalated')}
                      style={{ flex: 1, padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md, background: tokens.colors.errorScale[100], textAlign: 'center' as const, cursor: 'pointer', transition: `all ${tokens.motion.hover}`, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.errorScale[300]}` }}
                    >
                      <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.errorScale[800] }}>Escalate</Text>
                    </Box>
                  </Flex>
                )}
              </Stack>
            </Box>
          )}
        </Flex>

        {/* Similarity Checks */}
        {similarityChecks.length > 0 && (
          <Box style={{ marginTop: tokens.spacing[4], ...createCardStyle(tokens, { glass: isGlass, padding: 0 }), overflow: 'hidden' }}>
            <Box style={createPanelHeaderStyle(tokens)}>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>
                Similarity Checks ({similarityChecks.length})
              </Text>
            </Box>
            <Stack gap={0}>
              {similarityChecks.map(check => (
                <Flex key={check.id} justify="between" align="center" style={createListItemStyle(tokens, { interactive: false })}>
                  <Flex gap={8} align="center">
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[800] }}>{check.candidateName}</Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>vs {check.comparedWith}</Text>
                  </Flex>
                  <Flex gap={8} align="center">
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: check.flagged ? tokens.colors.errorScale[600] : tokens.colors.neutral[600] }}>
                      {(check.similarityScore * 100).toFixed(0)}%
                    </Text>
                    {check.flagged && (
                      <Box style={{ padding: `${tokens.spacing[0]}px ${tokens.spacing[1]}px`, borderRadius: tokens.borderRadius.full, background: tokens.colors.errorScale[50], border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.errorScale[200]}` }}>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.errorScale[700] }}>Flagged</Text>
                      </Box>
                    )}
                  </Flex>
                </Flex>
              ))}
            </Stack>
          </Box>
        )}
      </Box>
    );
  },
});
