'use client';

/**
 * SecurityEventTimeline - Feed Preset
 * Compact feed view of security events
 */

import { createPreset, PresetContext } from '../../../factory';
import type { SecurityEventTimelineProps } from '../../core';
import { getSeverityColors, getOutcomeColors, getCategoryLabel } from '../../core';
import {
  createCardStyle,
  createPanelHeaderStyle,
  createListItemStyle,
} from '../../../helpers';
import { formatDistanceToNow } from '../../../helpers';

export const FeedSecurityEventTimeline = createPreset<SecurityEventTimelineProps>({
  name: 'SecurityEventTimeline.Feed',
  render: ({ primitives, props, tokens }: PresetContext<SecurityEventTimelineProps>) => {
    const { Box } = primitives;
    const severityColors = getSeverityColors(tokens);
    const outcomeColors = getOutcomeColors(tokens);

    const {
      events,
      onEventClick,
      selectedEventId,
      title = 'Security Feed',
      loading,
      maxEvents = 50,
      className,
      style,
    } = props;

    const displayEvents = events.slice(0, maxEvents);

    return (
      <Box className={className} style={{ ...createCardStyle(tokens, { elevation: 'sm' }), ...style }}>
        <Box style={createPanelHeaderStyle(tokens)}>
          <h3 style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], margin: 0 }}>{title}</h3>
        </Box>

        {loading ? (
          <Box style={{ padding: tokens.spacing[6], textAlign: 'center', color: tokens.colors.neutral[400] }}>Loading...</Box>
        ) : displayEvents.length === 0 ? (
          <Box style={{ padding: tokens.spacing[6], textAlign: 'center', color: tokens.colors.neutral[400] }}>No events</Box>
        ) : (
          <Box>
            {displayEvents.map((event) => {
              const colors = severityColors[event.severity];
              const isSelected = event.id === selectedEventId;

              return (
                <Box key={event.id} onClick={() => onEventClick?.(event.id)} style={{
                  ...createListItemStyle(tokens, { active: isSelected }),
                  display: 'flex', alignItems: 'center', gap: tokens.spacing[2],
                  cursor: onEventClick ? 'pointer' : 'default',
                }}>
                  <span style={{ width: 8, height: 8, borderRadius: tokens.borderRadius.full, backgroundColor: colors.dot, flexShrink: 0 }} />
                  <Box style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900], overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                      {event.title}
                    </span>
                    <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                      {event.actor?.name || 'System'} · {event.action}
                    </span>
                  </Box>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], flexShrink: 0 }}>
                    <span style={{ padding: `0 ${tokens.spacing[1]}px`, borderRadius: tokens.borderRadius.sm, backgroundColor: outcomeColors[event.outcome].bg, color: outcomeColors[event.outcome].color, fontSize: tokens.typography.fontSize.xs }}>
                      {event.outcome}
                    </span>
                    <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], whiteSpace: 'nowrap' }}>
                      {formatDistanceToNow(event.timestamp, { addSuffix: true })}
                    </span>
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
