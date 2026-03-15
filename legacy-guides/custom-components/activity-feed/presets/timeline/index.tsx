'use client';

import { createPreset, PresetContext } from '../../../factory';
import type { ActivityFeedProps } from '../../core';
import { ACTIVITY_FEED_DEFAULTS } from '../../core';
import {
  createCardStyle,
  createFilterPillStyle,
  createHoverStyle,
  createListItemStyle,
} from '../../../helpers';

export const TimelineActivityFeed = createPreset<ActivityFeedProps>({
  name: 'ActivityFeed.Timeline',
  render: ({ primitives, props, tokens, engine }: PresetContext<ActivityFeedProps>) => {
    const { Box } = primitives;
    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const {
      events,
      title = ACTIVITY_FEED_DEFAULTS.title,
      onEventClick,
      onRefresh,
      maxItems = ACTIVITY_FEED_DEFAULTS.maxItems,
      loading,
      emptyIcon,
      emptyMessage = ACTIVITY_FEED_DEFAULTS.emptyMessage,
      headerActions,
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
        style={{ ...createCardStyle(tokens, { glass: isGlass, elevation: 'md' }), overflow: 'hidden' as const, ...style }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `${tokens.spacing[4]}px ${tokens.spacing[5]}px`,
          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
        }}>
          <div style={{
            fontSize: tokens.typography.fontSize.md,
            fontWeight: tokens.typography.fontWeight.semibold,
            color: tokens.colors.neutral[900],
          }}>
            {title}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
            {headerActions}
            {onRefresh && (
              <button
                onClick={onRefresh}
                style={{
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[500],
                  backgroundColor: 'transparent',
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  borderRadius: tokens.borderRadius.md,
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  fontFamily: 'inherit',
                }}
              >
                Refresh
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: `${tokens.spacing[4]}px ${tokens.spacing[5]}px` }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[4] }}>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} style={{ display: 'flex', gap: tokens.spacing[3], alignItems: 'flex-start' }}>
                  <div style={{ width: 10, height: 10, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.neutral[200] }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 14, width: '70%', backgroundColor: tokens.colors.neutral[100], borderRadius: tokens.borderRadius.sm, marginBottom: tokens.spacing[2] }} />
                    <div style={{ height: 12, width: '40%', backgroundColor: tokens.colors.neutral[100], borderRadius: tokens.borderRadius.sm }} />
                  </div>
                </div>
              ))}
            </div>
          ) : displayEvents.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: `${tokens.spacing[8]}px 0`,
              color: tokens.colors.neutral[400],
            }}>
              {emptyIcon && <div style={{ fontSize: tokens.typography.fontSize['2xl'], marginBottom: tokens.spacing[3] }}>{emptyIcon}</div>}
              <div style={{ fontSize: tokens.typography.fontSize.sm }}>{emptyMessage}</div>
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              {/* Timeline line */}
              <div style={{
                position: 'absolute',
                left: 4,
                top: 12,
                bottom: 12,
                width: 2,
                backgroundColor: tokens.colors.neutral[100],
              }} />

              {displayEvents.map((event, i) => (
                <div
                  key={event.id}
                  onClick={() => onEventClick?.(event)}
                  style={{
                    display: 'flex',
                    gap: tokens.spacing[4],
                    padding: `${tokens.spacing[3]}px 0`,
                    cursor: onEventClick ? 'pointer' : 'default',
                    position: 'relative',
                    transition: `background-color ${tokens.transitions?.fast || tokens.motion.hover}`,
                  }}
                >
                  {/* Dot */}
                  <div style={{
                    width: 10,
                    height: 10,
                    borderRadius: tokens.borderRadius.full,
                    backgroundColor: getTypeColor(event.type),
                    flexShrink: 0,
                    marginTop: 4,
                    position: 'relative',
                    zIndex: 1,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.common.white}`,
                  }} />

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: tokens.spacing[3] }}>
                      <div style={{
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.neutral[700],
                        lineHeight: tokens.typography.lineHeight.relaxed,
                      }}>
                        {event.text}
                      </div>
                      <span style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[400],
                        flexShrink: 0,
                        whiteSpace: 'nowrap',
                      }}>
                        {event.timestamp}
                      </span>
                    </div>

                    {/* Actor + resource */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], marginTop: tokens.spacing[1] }}>
                      {event.actor && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                          {event.actor.avatar ? (
                            <img src={event.actor.avatar} alt="" style={{ width: 18, height: 18, borderRadius: tokens.borderRadius.full, objectFit: 'cover' }} />
                          ) : (
                            <div style={{
                              width: 18, height: 18, borderRadius: tokens.borderRadius.full,
                              backgroundColor: tokens.colors.primaryScale[100], color: tokens.colors.primaryScale[600],
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '9px', fontWeight: tokens.typography.fontWeight.bold,
                            }}>
                              {event.actor.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                            {event.actor.name}
                          </span>
                        </div>
                      )}
                      {event.resource && (
                        <span style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.primaryScale[600],
                          backgroundColor: tokens.colors.primaryScale[50],
                          padding: `0 ${tokens.spacing[2]}px`,
                          borderRadius: tokens.borderRadius.sm,
                        }}>
                          {event.resource.name ?? event.resource.type}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Box>
    );
  },
});
