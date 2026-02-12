'use client';

/**
 * PlSecurityEventLog - Timeline Preset
 * Compose PatternTimeline<SecurityEvent> with severity indicators
 */

import { createPreset, type PresetContext } from '../../../factory';
import type { PlSecurityEventLogProps, SecurityEvent } from '../../core';
import {
  PatternTimeline,
  PatternPageShell,
  PatternEmptyState,
} from '../../../../patterns';
import type { TimelineItem } from '../../../../patterns';

export const TimelinePlSecurityEventLog = createPreset<PlSecurityEventLogProps>({
  name: 'PlSecurityEventLog.Timeline',
  render: ({ primitives, props, tokens, engine }: PresetContext<PlSecurityEventLogProps>) => {
    const { Spinner } = primitives;
    const { loading, className, style, events, onEventClick, emptyText } = props;

    if (loading) {
      return (
        <div className={className} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100%', ...style }}>
          <Spinner size="lg" />
        </div>
      );
    }

    const timelineItems: TimelineItem<SecurityEvent>[] = events.map((event) => ({
      key: event.id,
      timestamp: event.timestamp instanceof Date ? event.timestamp.toISOString() : String(event.timestamp),
      title: event.type.replace(/_/g, ' '),
      description: `${event.actor.name} from ${event.ip} (${event.location})`,
      data: event,
      user: { name: event.actor.name, avatar: event.actor.avatar },
      type: event.severity === 'critical' || event.severity === 'error' ? 'error'
        : event.severity === 'warning' ? 'warning'
        : 'info',
    }));

    return (
      <PatternPageShell
        title="Security Event Log"
        subtitle="Security event logging and monitoring with timeline and table views"
        className={className}
        style={style}
        engine={engine}
      >
        <PatternTimeline
          items={timelineItems}
          onItemClick={(item) => onEventClick?.(item.data?.id ?? item.key)}
          showTimestamp
          groupByDate
          emptyState={
            <PatternEmptyState
              title={emptyText ?? 'No security events found'}
              description="Security events will be logged here."
              engine={engine}
            />
          }
          engine={engine}
        />
      </PatternPageShell>
    );
  },
});
