'use client';

/**
 * EvRunsheet - Display Preset
 * Backstage monitor view: current cue LARGE + next 3 cues.
 * Countdown timer to next cue. Large font for readability.
 * Dark theme (neutral[900] bg). Minimal info: time, title, department.
 */

import { useState, useEffect, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createBadgeStyle } from '../../../helpers';
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
];

export const DisplayEvRunsheet = createPreset<RunsheetProps>({
  name: 'EvRunsheet.Display',
  render: ({ primitives, props, tokens }: PresetContext<RunsheetProps>) => {
    const { Box, Text } = primitives;
    const { cues, eventName, className, style } = props;

    const data = cues?.length ? cues : MOCK_CUES;

    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentTime(new Date());
      }, 1000);
      return () => clearInterval(interval);
    }, []);

    const currentCue = useMemo(
      () => data.find((c) => c.status === 'go') || data.find((c) => c.status === 'standby'),
      [data]
    );

    const upcomingCues = useMemo(() => {
      const currentIdx = data.findIndex((c) => c.id === currentCue?.id);
      if (currentIdx === -1) return [];
      return data.slice(currentIdx + 1, currentIdx + 4);
    }, [data, currentCue]);

    const parseTime = (timeStr: string) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const d = new Date();
      d.setHours(hours, minutes, 0, 0);
      return d;
    };

    const getCountdown = () => {
      if (!currentCue) return null;
      const scheduled = parseTime(currentCue.scheduledTime);
      const diffMs = scheduled.getTime() - currentTime.getTime();
      if (diffMs < 0) return null;
      const minutes = Math.floor(diffMs / 60000);
      const seconds = Math.floor((diffMs % 60000) / 1000);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const countdown = getCountdown();

    return (
      <Box
        className={className}
        style={{
          height: '100%',
          overflow: 'hidden',
          backgroundColor: tokens.colors.neutral[900],
          padding: tokens.spacing[6],
          display: 'flex',
          flexDirection: 'column' as const,
          ...style,
        }}
      >
        {/* Header */}
        <div
          style={{
            marginBottom: tokens.spacing[6],
            textAlign: 'center' as const,
          }}
        >
          <Text
            style={{
              fontSize: tokens.typography.fontSize['2xl'],
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.common.white,
              display: 'block',
            }}
          >
            {'🎬'} {eventName || 'EVENT RUNSHEET'}
          </Text>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.lg,
              color: tokens.colors.neutral[400],
              display: 'block',
              marginTop: tokens.spacing[2],
            }}
          >
            {currentTime.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })}
          </Text>
        </div>

        {/* Current Cue (Large) */}
        {currentCue && (
          <div
            style={{
              padding: tokens.spacing[6],
              marginBottom: tokens.spacing[4],
              backgroundColor: tokens.colors.errorScale[500],
              borderRadius: tokens.borderRadius.lg,
              textAlign: 'center' as const,
              boxShadow: tokens.shadows.xl,
            }}
          >
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: 'rgba(255, 255, 255, 0.9)',
                textTransform: 'uppercase' as const,
                letterSpacing: '0.1em',
                display: 'block',
                marginBottom: tokens.spacing[2],
              }}
            >
              {'🔴'} ACTIVE CUE
            </Text>
            <Text
              style={{
                fontSize: '3rem',
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.common.white,
                display: 'block',
                marginBottom: tokens.spacing[3],
                lineHeight: 1.2,
              }}
            >
              {currentCue.title}
            </Text>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: tokens.spacing[4],
                marginBottom: tokens.spacing[3],
              }}
            >
              <div>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: 'rgba(255, 255, 255, 0.8)',
                    display: 'block',
                  }}
                >
                  Scheduled
                </Text>
                <Text
                  style={{
                    fontSize: '2.5rem',
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: tokens.colors.common.white,
                  }}
                >
                  {currentCue.scheduledTime}
                </Text>
              </div>
              {currentCue.actualTime && (
                <>
                  <Text style={{ fontSize: '2rem', color: 'rgba(255, 255, 255, 0.6)' }}>{'→'}</Text>
                  <div>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: 'rgba(255, 255, 255, 0.8)',
                        display: 'block',
                      }}
                    >
                      Actual
                    </Text>
                    <Text
                      style={{
                        fontSize: '2.5rem',
                        fontWeight: tokens.typography.fontWeight.bold,
                        color: tokens.colors.common.white,
                      }}
                    >
                      {currentCue.actualTime}
                    </Text>
                  </div>
                </>
              )}
            </div>
            <div
              style={{
                display: 'inline-block',
                padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                borderRadius: tokens.borderRadius.full,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                fontSize: tokens.typography.fontSize.lg,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.common.white,
              }}
            >
              {currentCue.department}
            </div>
            {countdown && (
              <div style={{ marginTop: tokens.spacing[4] }}>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: 'rgba(255, 255, 255, 0.8)',
                    display: 'block',
                    marginBottom: tokens.spacing[1],
                  }}
                >
                  Time to Cue
                </Text>
                <Text
                  style={{
                    fontSize: '2rem',
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: tokens.colors.common.white,
                  }}
                >
                  {countdown}
                </Text>
              </div>
            )}
          </div>
        )}

        {/* Next Cues */}
        <div
          style={{
            padding: tokens.spacing[4],
            backgroundColor: tokens.colors.neutral[800],
            borderRadius: tokens.borderRadius.lg,
            flex: 1,
          }}
        >
          <Text
            style={{
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[400],
              textTransform: 'uppercase' as const,
              letterSpacing: '0.05em',
              display: 'block',
              marginBottom: tokens.spacing[3],
            }}
          >
            Next Cues
          </Text>
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[3] }}>
            {upcomingCues.map((cue, idx) => (
              <div
                key={cue.id}
                style={{
                  padding: tokens.spacing[3],
                  backgroundColor: tokens.colors.neutral[700],
                  borderRadius: tokens.borderRadius.md,
                  borderLeft: `4px solid ${
                    cue.status === 'standby'
                      ? tokens.colors.warningScale[500]
                      : tokens.colors.neutral[500]
                  }`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[400],
                        display: 'block',
                        marginBottom: tokens.spacing[1],
                      }}
                    >
                      Cue {idx + 1}
                    </Text>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xl,
                        fontWeight: tokens.typography.fontWeight.bold,
                        color: tokens.colors.common.white,
                        display: 'block',
                        marginBottom: tokens.spacing[1],
                      }}
                    >
                      {cue.title}
                    </Text>
                    <div
                      style={{
                        display: 'inline-block',
                        padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                        borderRadius: tokens.borderRadius.full,
                        backgroundColor: tokens.colors.neutral[600],
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[200],
                      }}
                    >
                      {cue.department}
                    </div>
                  </div>
                  <Text
                    style={{
                      fontSize: '2rem',
                      fontWeight: tokens.typography.fontWeight.bold,
                      color: tokens.colors.common.white,
                    }}
                  >
                    {cue.scheduledTime}
                  </Text>
                </div>
              </div>
            ))}
            {upcomingCues.length === 0 && (
              <div
                style={{
                  padding: tokens.spacing[6],
                  textAlign: 'center' as const,
                  color: tokens.colors.neutral[500],
                }}
              >
                <Text style={{ fontSize: tokens.typography.fontSize.lg }}>No upcoming cues</Text>
              </div>
            )}
          </div>
        </div>
      </Box>
    );
  },
});
