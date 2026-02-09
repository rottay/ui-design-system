'use client';

/**
 * EvRunsheet - Producer Preset
 * Sequential cue list with scheduled/actual times and GO button.
 * Each cue shows: scheduled time, actual time, title, department badge, status.
 * Active cue highlighted prominently. Accumulated delay counter.
 * Mark GO button for current cue. Department color coding.
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createHoverStyle,
  createBadgeStyle,
  createStatusDotStyle,
} from '../../../helpers';
import type { RunsheetProps, RunsheetCue } from '../../core';

const MOCK_CUES: RunsheetCue[] = [
  {
    id: 'cue1',
    scheduledTime: '18:00',
    actualTime: '18:00',
    title: 'Doors Open',
    department: 'Operations',
    status: 'done',
    delayMinutes: 0,
    notes: 'On schedule',
  },
  {
    id: 'cue2',
    scheduledTime: '18:30',
    actualTime: '18:35',
    title: 'House Music Start',
    department: 'Audio',
    status: 'done',
    delayMinutes: 5,
  },
  {
    id: 'cue3',
    scheduledTime: '19:00',
    actualTime: '19:05',
    title: 'Lighting Check',
    department: 'Production',
    status: 'done',
    delayMinutes: 5,
    notes: 'Delay from previous cue',
  },
  {
    id: 'cue4',
    scheduledTime: '19:30',
    actualTime: '19:35',
    title: 'VIP Section Open',
    department: 'Hospitality',
    status: 'done',
    delayMinutes: 5,
  },
  {
    id: 'cue5',
    scheduledTime: '20:00',
    title: 'Opening DJ Set',
    department: 'Audio',
    status: 'go',
    delayMinutes: 5,
    notes: 'DJ on stage, ready to start',
  },
  {
    id: 'cue6',
    scheduledTime: '21:00',
    title: 'Main Act Introduction',
    department: 'Production',
    status: 'standby',
    delayMinutes: 5,
  },
  {
    id: 'cue7',
    scheduledTime: '21:05',
    title: 'Main Act Begins',
    department: 'Production',
    status: 'upcoming',
    delayMinutes: 5,
  },
  {
    id: 'cue8',
    scheduledTime: '22:30',
    title: 'Intermission',
    department: 'Operations',
    status: 'upcoming',
    delayMinutes: 5,
  },
  {
    id: 'cue9',
    scheduledTime: '23:00',
    title: 'Second Set',
    department: 'Production',
    status: 'upcoming',
    delayMinutes: 5,
  },
  {
    id: 'cue10',
    scheduledTime: '00:30',
    title: 'Event Close',
    department: 'Operations',
    status: 'upcoming',
    delayMinutes: 5,
  },
];

const STATUS_CONFIG: Record<
  string,
  { color: 'success' | 'warning' | 'error' | 'primary' | 'secondary'; label: string; dotColor: string }
> = {
  upcoming: {
    color: 'secondary',
    label: 'Upcoming',
    dotColor: '#94a3b8',
  },
  standby: {
    color: 'warning',
    label: 'Standby',
    dotColor: '#f59e0b',
  },
  go: {
    color: 'error',
    label: 'GO',
    dotColor: '#ef4444',
  },
  done: {
    color: 'success',
    label: 'Done',
    dotColor: '#10b981',
  },
  skipped: {
    color: 'secondary',
    label: 'Skipped',
    dotColor: '#64748b',
  },
};


export const ProducerEvRunsheet = createPreset<RunsheetProps>({
  name: 'EvRunsheet.Producer',
  render: ({ primitives, props, tokens }: PresetContext<RunsheetProps>) => {
    const { Box, Text } = primitives;
    const { cues, eventName, onMarkGo, onAddDelay, onSkip, currentCueId, className, style } = props;

    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm' }), [tokens]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const data = cues?.length ? cues : MOCK_CUES;

    const currentCue = useMemo(
      () => data.find((c) => c.status === 'go') || data.find((c) => c.status === 'standby'),
      [data]
    );

    const totalDelay = useMemo(() => {
      return data.reduce((sum, cue) => sum + cue.delayMinutes, 0);
    }, [data]);

    const completedCount = data.filter((c) => c.status === 'done').length;

    return (
      <Box
        className={className}
        style={{
          height: '100%',
          overflow: 'auto',
          backgroundColor: tokens.colors.neutral[50],
          padding: tokens.spacing[5],
          ...style,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: tokens.spacing[4],
          }}
        >
          <div>
            <Text
              style={{
                fontSize: tokens.typography.fontSize['2xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[900],
                display: 'block',
              }}
            >
              {'🎬'} {eventName || 'Event Runsheet'}
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
              {completedCount}/{data.length} cues completed {'·'} {totalDelay}min accumulated delay
            </Text>
          </div>
        </div>

        {/* Delay Alert */}
        {totalDelay > 0 && (
          <div
            style={{
              ...cardBase,
              padding: tokens.spacing[3],
              marginBottom: tokens.spacing[4],
              backgroundColor: tokens.colors.warningScale[50],
              borderLeft: `4px solid ${tokens.colors.warningScale[500]}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              <span style={{ fontSize: tokens.typography.fontSize.xl }}>{'⚠️'}</span>
              <div>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.warningScale[800],
                    display: 'block',
                  }}
                >
                  Running {totalDelay} minutes behind schedule
                </Text>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.warningScale[700] }}>
                  All remaining cues adjusted accordingly
                </Text>
              </div>
            </div>
          </div>
        )}

        {/* Current Cue Card */}
        {currentCue && (
          <div
            style={{
              ...cardBase,
              padding: tokens.spacing[4],
              marginBottom: tokens.spacing[4],
              backgroundColor: tokens.colors.errorScale[50],
              border: `3px solid ${tokens.colors.errorScale[500]}`,
              boxShadow: tokens.shadows.lg,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.errorScale[600],
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.05em',
                    display: 'block',
                    marginBottom: tokens.spacing[1],
                  }}
                >
                  {'🔴'} Active Cue
                </Text>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize['2xl'],
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: tokens.colors.neutral[900],
                    display: 'block',
                    marginBottom: tokens.spacing[2],
                  }}
                >
                  {currentCue.title}
                </Text>
                <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], marginBottom: tokens.spacing[2] }}>
                  <div>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                      Scheduled
                    </Text>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xl,
                        fontWeight: tokens.typography.fontWeight.bold,
                        color: tokens.colors.neutral[900],
                      }}
                    >
                      {currentCue.scheduledTime}
                    </Text>
                  </div>
                  {currentCue.actualTime && (
                    <>
                      <Text style={{ fontSize: tokens.typography.fontSize.xl, color: tokens.colors.neutral[400] }}>
                        {'→'}
                      </Text>
                      <div>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                          Actual
                        </Text>
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.xl,
                            fontWeight: tokens.typography.fontWeight.bold,
                            color: tokens.colors.errorScale[600],
                          }}
                        >
                          {currentCue.actualTime}
                        </Text>
                      </div>
                    </>
                  )}
                </div>
                <span style={createBadgeStyle(tokens, 'info')}>{currentCue.department}</span>
              </div>
              <div
                onClick={() => onMarkGo?.(currentCue.id)}
                style={{
                  padding: `${tokens.spacing[3]}px ${tokens.spacing[6]}px`,
                  borderRadius: tokens.borderRadius.md,
                  backgroundColor: tokens.colors.successScale[500],
                  color: tokens.colors.common.white,
                  fontSize: tokens.typography.fontSize.lg,
                  fontWeight: tokens.typography.fontWeight.bold,
                  cursor: 'pointer',
                  ...hoverStyle,
                  boxShadow: tokens.shadows.md,
                }}
              >
                {'✓'} MARK GO
              </div>
            </div>
            {currentCue.notes && (
              <div
                style={{
                  marginTop: tokens.spacing[3],
                  padding: tokens.spacing[2],
                  backgroundColor: tokens.colors.common.white,
                  borderRadius: tokens.borderRadius.sm,
                }}
              >
                <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700] }}>
                  {'📝'} {currentCue.notes}
                </Text>
              </div>
            )}
          </div>
        )}

        {/* Cue List */}
        <div style={{ ...cardBase, overflow: 'hidden' }}>
          {data.map((cue, idx) => {
            const statusConfig = STATUS_CONFIG[cue.status];
            const isActive = cue.id === currentCue?.id;

            return (
              <div
                key={cue.id}
                style={{
                  padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                  borderBottom:
                    idx < data.length - 1
                      ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`
                      : 'none',
                  backgroundColor: isActive
                    ? tokens.colors.errorScale[50]
                    : cue.status === 'done'
                    ? tokens.colors.neutral[50]
                    : tokens.colors.common.white,
                  opacity: cue.status === 'done' ? 0.6 : 1,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
                  {/* Status Dot */}
                  <div style={createStatusDotStyle(tokens, statusConfig.dotColor)} />

                  {/* Times */}
                  <div style={{ minWidth: 120 }}>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.bold,
                        color: tokens.colors.neutral[900],
                        display: 'block',
                      }}
                    >
                      {cue.scheduledTime}
                    </Text>
                    {cue.actualTime && (
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                        Actual: {cue.actualTime}
                      </Text>
                    )}
                  </div>

                  {/* Title & Info */}
                  <div style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.neutral[900],
                        display: 'block',
                        marginBottom: tokens.spacing[1],
                      }}
                    >
                      {cue.title}
                    </Text>
                    <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                      <span style={createBadgeStyle(tokens, 'info')}>{cue.department}</span>
                      <span style={createBadgeStyle(tokens, statusConfig.color)}>{statusConfig.label}</span>
                      {cue.delayMinutes > 0 && (
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.warningScale[600] }}>
                          +{cue.delayMinutes}min delay
                        </Text>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {cue.status === 'upcoming' && (
                    <div
                      onClick={() => onSkip?.(cue.id)}
                      style={{
                        padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                        borderRadius: tokens.borderRadius.sm,
                        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[600],
                        cursor: 'pointer',
                        ...hoverStyle,
                      }}
                    >
                      Skip
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Box>
    );
  },
});
