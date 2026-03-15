'use client';

/**
 * SecurityEventTimeline - Table Preset
 * Tabular view of security events with sortable columns
 */

import { useState } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { SecurityEventTimelineProps, SecurityEventSeverity } from '../../core';
import { getSeverityColors, getOutcomeColors, getCategoryLabel } from '../../core';
import {
  createCardStyle,
  createPanelHeaderStyle,
  createFilterPillStyle,
} from '../../../helpers';
import { formatDistanceToNow } from '../../../helpers';

export const TableSecurityEventTimeline = createPreset<SecurityEventTimelineProps>({
  name: 'SecurityEventTimeline.Table',
  render: ({ primitives, props, tokens }: PresetContext<SecurityEventTimelineProps>) => {
    const { Box } = primitives;
    const severityColors = getSeverityColors(tokens);
    const outcomeColors = getOutcomeColors(tokens);

    const {
      events,
      onEventClick,
      selectedEventId,
      title = 'Security Events',
      loading,
      maxEvents = 50,
      showFilters = true,
      className,
      style,
    } = props;

    const [severityFilter, setSeverityFilter] = useState<SecurityEventSeverity | null>(null);

    const filtered = events
      .filter(e => !severityFilter || e.severity === severityFilter)
      .slice(0, maxEvents);

    const severities: SecurityEventSeverity[] = ['critical', 'high', 'medium', 'low', 'info'];

    return (
      <Box className={className} style={{ ...createCardStyle(tokens, { elevation: 'sm' }), ...style }}>
        <Box style={{ ...createPanelHeaderStyle(tokens), display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], margin: 0 }}>{title}</h3>
          {showFilters && (
            <Box style={{ display: 'flex', gap: tokens.spacing[1] }}>
              <span onClick={() => setSeverityFilter(null)} style={createFilterPillStyle(tokens, { active: !severityFilter })}>All</span>
              {severities.map(s => (
                <span key={s} onClick={() => setSeverityFilter(s)} style={createFilterPillStyle(tokens, { active: severityFilter === s })}>{s.charAt(0).toUpperCase() + s.slice(1)}</span>
              ))}
            </Box>
          )}
        </Box>

        {loading ? (
          <Box style={{ padding: tokens.spacing[6], textAlign: 'center', color: tokens.colors.neutral[400] }}>Loading...</Box>
        ) : (
          <Box style={{ overflow: 'auto' }}>
            <Box style={{
              display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
              gap: tokens.spacing[2], padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
              borderBottom: `1px solid ${tokens.colors.neutral[200]}`, backgroundColor: tokens.colors.neutral[50],
            }}>
              {['Event', 'Severity', 'Category', 'Outcome', 'Actor', 'Time'].map(h => (
                <span key={h} style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase' as const }}>{h}</span>
              ))}
            </Box>

            {filtered.map((event) => {
              const colors = severityColors[event.severity];
              const outcome = outcomeColors[event.outcome];
              const isSelected = event.id === selectedEventId;

              return (
                <Box key={event.id} onClick={() => onEventClick?.(event.id)} style={{
                  display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
                  gap: tokens.spacing[2], padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                  borderBottom: `1px solid ${tokens.colors.neutral[100]}`,
                  backgroundColor: isSelected ? tokens.colors.primaryScale[50] : 'transparent',
                  cursor: onEventClick ? 'pointer' : 'default',
                  transition: `background-color ${tokens.motion.hover}`,
                  alignItems: 'center',
                }}>
                  <Box>
                    <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900], display: 'block' }}>{event.title}</span>
                    {event.resource && <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{event.resource}</span>}
                  </Box>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1], padding: `0 ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.full, backgroundColor: colors.bg, color: colors.color, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, width: 'fit-content' }}>
                    <span style={{ width: 6, height: 6, borderRadius: tokens.borderRadius.full, backgroundColor: colors.dot, display: 'inline-block' }} />
                    {event.severity}
                  </span>
                  <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>{getCategoryLabel(event.category)}</span>
                  <span style={{ display: 'inline-flex', padding: `0 ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.sm, backgroundColor: outcome.bg, color: outcome.color, fontSize: tokens.typography.fontSize.xs, width: 'fit-content' }}>{event.outcome}</span>
                  <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>{event.actor?.name || 'System'}</span>
                  <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{formatDistanceToNow(event.timestamp, { addSuffix: true })}</span>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    );
  },
});
