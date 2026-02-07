'use client';

import { createPreset, PresetContext } from '../../../factory';
import type { ActivityFeedProps } from '../../core';
import { ACTIVITY_FEED_DEFAULTS } from '../../core';

export const CompactActivityFeed = createPreset<ActivityFeedProps>({
  name: 'ActivityFeed.Compact',
  render: ({ primitives, props, tokens, engine }: PresetContext<ActivityFeedProps>) => {
    const { Box } = primitives;
    const {
      events,
      title = ACTIVITY_FEED_DEFAULTS.title,
      onEventClick,
      maxItems = 10,
      loading,
      emptyMessage = ACTIVITY_FEED_DEFAULTS.emptyMessage,
      className,
      style,
    } = props;

    const getTypeColor = (type?: string) => {
      switch (type) {
        case 'success': return tokens.colors.successScale[500];
        case 'warning': return tokens.colors.warningScale[500];
        case 'error': return tokens.colors.errorScale[500];
        case 'info': return tokens.colors.infoScale[500];
        default: return tokens.colors.primaryScale[500];
      }
    };

    const displayEvents = events.slice(0, maxItems);

    return (
      <Box
        className={className}
        style={{
          boxShadow: tokens.shadows.md,
          backgroundColor: tokens.colors.common.white,
          borderRadius: tokens.borderRadius.lg,
          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          overflow: 'hidden',
          ...style,
        }}
      >
        {/* Header */}
        <div style={{
          padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
          fontSize: tokens.typography.fontSize.sm,
          fontWeight: tokens.typography.fontWeight.semibold,
          color: tokens.colors.neutral[700],
        }}>
          {title}
        </div>

        {/* Events list */}
        <div style={{ maxHeight: 300, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ padding: tokens.spacing[4] }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ height: 12, width: `${60 + i * 10}%`, backgroundColor: tokens.colors.neutral[100], borderRadius: tokens.borderRadius.sm, marginBottom: tokens.spacing[2] }} />
              ))}
            </div>
          ) : displayEvents.length === 0 ? (
            <div style={{
              padding: `${tokens.spacing[6]}px ${tokens.spacing[4]}px`,
              textAlign: 'center',
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[400],
            }}>
              {emptyMessage}
            </div>
          ) : (
            displayEvents.map((event) => (
              <div
                key={event.id}
                onClick={() => onEventClick?.(event)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[3],
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                  borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[50]}`,
                  cursor: onEventClick ? 'pointer' : 'default',
                  transition: `background-color ${tokens.motion.hover}`,
                }}
              >
                <div style={{
                  width: 6,
                  height: 6,
                  borderRadius: tokens.borderRadius.full,
                  backgroundColor: getTypeColor(event.type),
                  flexShrink: 0,
                }} />
                <span style={{
                  flex: 1,
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[600],
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {event.text}
                </span>
                <span style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[400],
                  flexShrink: 0,
                }}>
                  {event.timestamp}
                </span>
              </div>
            ))
          )}
        </div>
      </Box>
    );
  },
});
