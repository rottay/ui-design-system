'use client';

/**
 * SecurityEventTimeline - Timeline Preset
 * Vertical timeline of security events with severity indicators
 */

import { useState } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { SecurityEventTimelineProps, SecurityEventSeverity } from '../../core';
import { getSeverityColors, getOutcomeColors, getCategoryLabel } from '../../core';
import {
  createCardStyle,
  createPanelHeaderStyle,
  createStatusDotStyle,
  createFilterPillStyle,
  createBadgeStyle,
} from '../../../helpers';
import { formatDistanceToNow } from '../../../helpers';

export const TimelineSecurityEventTimeline = createPreset<SecurityEventTimelineProps>({
  name: 'SecurityEventTimeline.Timeline',
  render: ({ primitives, props, tokens }: PresetContext<SecurityEventTimelineProps>) => {
    const { Box, Stack } = primitives;
    const severityColors = getSeverityColors(tokens);
    const outcomeColors = getOutcomeColors(tokens);

    const {
      events,
      onEventClick,
      selectedEventId,
      title = 'Security Events',
      subtitle,
      loading,
      maxEvents = 50,
      showFilters = true,
      className,
      style,
    } = props;

    const [severityFilter, setSeverityFilter] = useState<SecurityEventSeverity | null>(null);

    const filteredEvents = events
      .filter(e => !severityFilter || e.severity === severityFilter)
      .slice(0, maxEvents);

    const severities: SecurityEventSeverity[] = ['critical', 'high', 'medium', 'low', 'info'];

    return (
      <Box className={className} style={{ ...createCardStyle(tokens, { elevation: 'sm' }), ...style }}>
        <Box style={{ ...createPanelHeaderStyle(tokens), display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <h3 style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], margin: 0 }}>{title}</h3>
            {subtitle && <p style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], margin: `${tokens.spacing[1]}px 0 0` }}>{subtitle}</p>}
          </Box>
          <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
            {filteredEvents.length} events
          </span>
        </Box>

        {showFilters && (
          <Box style={{ display: 'flex', gap: tokens.spacing[1], padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderBottom: `1px solid ${tokens.colors.neutral[100]}`, flexWrap: 'wrap' }}>
            <span onClick={() => setSeverityFilter(null)} style={createFilterPillStyle(tokens, { active: severityFilter === null })}>All</span>
            {severities.map(s => (
              <span key={s} onClick={() => setSeverityFilter(s)} style={createFilterPillStyle(tokens, { active: severityFilter === s })}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </span>
            ))}
          </Box>
        )}

        {loading ? (
          <Box style={{ padding: tokens.spacing[6], textAlign: 'center', color: tokens.colors.neutral[400] }}>Loading events...</Box>
        ) : filteredEvents.length === 0 ? (
          <Box style={{ padding: tokens.spacing[6], textAlign: 'center', color: tokens.colors.neutral[400] }}>No security events</Box>
        ) : (
          <Box style={{ padding: tokens.spacing[4] }}>
            {filteredEvents.map((event, idx) => {
              const colors = severityColors[event.severity];
              const outcome = outcomeColors[event.outcome];
              const isSelected = event.id === selectedEventId;
              const isLast = idx === filteredEvents.length - 1;

              return (
                <Box key={event.id} onClick={() => onEventClick?.(event.id)} style={{
                  display: 'flex', gap: tokens.spacing[3], cursor: onEventClick ? 'pointer' : 'default',
                }}>
                  {/* Timeline */}
                  <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 24, flexShrink: 0 }}>
                    <span style={{ ...createStatusDotStyle(tokens, colors.dot), width: 10, height: 10, marginTop: tokens.spacing[1], zIndex: 1, border: isSelected ? `2px solid ${tokens.colors.primaryScale[500]}` : 'none' }} />
                    {!isLast && <Box style={{ width: 2, flex: 1, backgroundColor: tokens.colors.neutral[200], marginTop: tokens.spacing[1] }} />}
                  </Box>

                  {/* Content */}
                  <Box style={{
                    flex: 1, paddingBottom: tokens.spacing[3],
                    backgroundColor: isSelected ? tokens.colors.primaryScale[50] : 'transparent',
                    borderRadius: isSelected ? tokens.borderRadius.md : 0,
                    padding: isSelected ? tokens.spacing[2] : 0,
                  }}>
                    <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>
                        {event.title}
                      </span>
                      <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                        {formatDistanceToNow(event.timestamp, { addSuffix: true })}
                      </span>
                    </Box>

                    {event.description && (
                      <p style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600], margin: `${tokens.spacing[1]}px 0 0` }}>{event.description}</p>
                    )}

                    <Box style={{ display: 'flex', gap: tokens.spacing[2], marginTop: tokens.spacing[1], flexWrap: 'wrap' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', padding: `0 ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.full, backgroundColor: colors.bg, color: colors.color, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium }}>
                        {event.severity}
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', padding: `0 ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.full, backgroundColor: outcome.bg, color: outcome.color, fontSize: tokens.typography.fontSize.xs }}>
                        {event.outcome}
                      </span>
                      <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], padding: `0 ${tokens.spacing[1]}px`, backgroundColor: tokens.colors.neutral[100], borderRadius: tokens.borderRadius.sm }}>
                        {getCategoryLabel(event.category)}
                      </span>
                    </Box>

                    {(event.actor || event.ipAddress) && (
                      <Box style={{ marginTop: tokens.spacing[1], fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'flex', gap: tokens.spacing[3] }}>
                        {event.actor && <span>{event.actor.name}</span>}
                        {event.ipAddress && <span style={{ fontFamily: 'monospace' }}>{event.ipAddress}</span>}
                        {event.location && <span>{event.location}</span>}
                      </Box>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    );
  },
});
