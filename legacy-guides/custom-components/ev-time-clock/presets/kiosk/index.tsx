'use client';

/**
 * EvTimeClock - Kiosk Preset
 * Large touch-friendly kiosk display with big punch button, live clock,
 * staff queue list, and today's activity feed
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createHoverStyle,
  createBadgeStyle,
  createProgressBarStyle,
  getHoverTransform,
} from '../../../helpers';
import type { EvTimeClockProps, ClockEntry, ShiftInfo } from '../../core';

const MOCK_CURRENT: ClockEntry = { id: 'e1', staffName: 'Maria S.', checkInTime: new Date('2026-02-08T17:30'), breakMinutes: 0, totalMinutes: 150, status: 'clocked-in' };
const MOCK_SHIFT: ShiftInfo = { shiftName: 'Evening Bar', role: 'Bartender', scheduledStart: new Date('2026-02-08T17:00'), scheduledEnd: new Date('2026-02-09T01:00'), location: 'Main Bar' };

const MOCK_TEAM: { name: string; role: string; status: 'clocked-in' | 'on-break' | 'clocked-out'; time: string }[] = [
  { name: 'Maria S.', role: 'Bartender', status: 'clocked-in', time: '5:30 PM' },
  { name: 'Carlos R.', role: 'Security', status: 'clocked-in', time: '4:00 PM' },
  { name: 'Ana L.', role: 'Server', status: 'on-break', time: '5:00 PM' },
  { name: 'Diego M.', role: 'Sound Tech', status: 'clocked-out', time: '—' },
  { name: 'Laura P.', role: 'Stage Mgr', status: 'clocked-in', time: '3:00 PM' },
  { name: 'Roberto G.', role: 'Event Coord', status: 'clocked-out', time: '—' },
];

export const KioskEvTimeClock = createPreset<EvTimeClockProps>({
  name: 'EvTimeClock.Kiosk',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvTimeClockProps>) => {
    const { Box, Text } = primitives;
    const { currentEntry, shiftInfo, onClockIn, onClockOut, onStartBreak, onEndBreak, className, style } = props;
    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'md', glass: isGlass }), [tokens, isGlass]);

    const current = currentEntry || MOCK_CURRENT;
    const shift = shiftInfo || MOCK_SHIFT;
    const isClockedIn = current.status === 'clocked-in' || current.status === 'on-break';
    const [now] = useState(new Date());
    const [hoveredStaff, setHoveredStaff] = useState<string | null>(null);

    const formatTime = (d: Date) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const formatMinutes = (m: number) => `${Math.floor(m / 60)}h ${m % 60}m`;

    const scheduledMinutes = (shift.scheduledEnd.getTime() - shift.scheduledStart.getTime()) / (1000 * 60);
    const shiftPct = Math.min(Math.round((current.totalMinutes / scheduledMinutes) * 100), 100);
    const progressBar = createProgressBarStyle(tokens, { percent: shiftPct, color: isClockedIn ? tokens.colors.successScale[400] : tokens.colors.neutral[400] });

    const activeCount = MOCK_TEAM.filter(t => t.status === 'clocked-in').length;
    const breakCount = MOCK_TEAM.filter(t => t.status === 'on-break').length;

    const statusColors: Record<string, string> = {
      'clocked-in': tokens.colors.successScale[500],
      'on-break': tokens.colors.warningScale[500],
      'clocked-out': tokens.colors.neutral[400],
    };

    return (
      <Box className={className} style={{ height: '100%', display: 'flex', flexDirection: 'column' as const, backgroundColor: tokens.colors.neutral[900], padding: tokens.spacing[6], ...style }}>
        {/* Top section: Clock and Punch */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: tokens.spacing[8], flex: 1 }}>
          {/* Left: Clock and Status */}
          <div style={{ textAlign: 'center' as const }}>
            <Text style={{ fontSize: '64px', fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.common.white, display: 'block', marginBottom: tokens.spacing[1], fontVariantNumeric: 'tabular-nums' }}>
              {formatTime(now)}
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.neutral[400], display: 'block', marginBottom: tokens.spacing[4] }}>
              {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </Text>

            {isClockedIn && (
              <div style={{ ...cardBase, backgroundColor: tokens.colors.neutral[800], border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[700]}`, padding: tokens.spacing[4], marginBottom: tokens.spacing[4], textAlign: 'center' as const, minWidth: 280 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[2] }}>
                  <span style={{ width: 10, height: 10, borderRadius: tokens.borderRadius.full, backgroundColor: statusColors[current.status], boxShadow: `0 0 8px ${statusColors[current.status]}60` }} />
                  <Text style={{ fontSize: tokens.typography.fontSize.lg, color: tokens.colors.common.white, fontWeight: tokens.typography.fontWeight.semibold }}>{current.staffName}</Text>
                </div>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400], display: 'block' }}>{shift.shiftName} {'·'} {shift.role}</Text>
                <Text style={{ fontSize: '36px', fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.successScale[400], display: 'block', marginTop: tokens.spacing[2] }}>
                  {formatMinutes(current.totalMinutes)}
                </Text>
                <div style={{ marginTop: tokens.spacing[2] }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Shift progress</Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{shiftPct}%</Text>
                  </div>
                  <div style={{ ...progressBar.track, backgroundColor: tokens.colors.neutral[700] }}><div style={progressBar.fill} /></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: tokens.spacing[3] }}>
                  <div>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'block' }}>Break</Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.warningScale[400], fontWeight: tokens.typography.fontWeight.semibold }}>{current.breakMinutes}m</Text>
                  </div>
                  <div>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'block' }}>Since</Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[300], fontWeight: tokens.typography.fontWeight.semibold }}>{formatTime(current.checkInTime)}</Text>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Punch Button */}
          <div style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: tokens.spacing[4] }}>
            <div
              onClick={isClockedIn ? onClockOut : onClockIn}
              style={{
                width: 180,
                height: 180,
                borderRadius: tokens.borderRadius.full,
                border: 'none',
                backgroundColor: isClockedIn ? tokens.colors.errorScale[500] : tokens.colors.successScale[500],
                color: tokens.colors.common.white,
                fontSize: tokens.typography.fontSize.xl,
                fontWeight: tokens.typography.fontWeight.bold,
                cursor: 'pointer',
                boxShadow: `0 0 40px ${isClockedIn ? tokens.colors.errorScale[400] : tokens.colors.successScale[400]}40`,
                display: 'flex',
                flexDirection: 'column' as const,
                alignItems: 'center',
                justifyContent: 'center',
                gap: tokens.spacing[1],
              }}
            >
              <span style={{ fontSize: '40px' }}>{isClockedIn ? '⏹' : '▶'}</span>
              {isClockedIn ? 'CLOCK OUT' : 'CLOCK IN'}
            </div>

            {isClockedIn && (
              <div
                onClick={current.status === 'on-break' ? onEndBreak : onStartBreak}
                style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[6]}px`, borderRadius: tokens.borderRadius.lg, border: `2px solid ${tokens.colors.warningScale[500]}`, backgroundColor: 'transparent', color: tokens.colors.warningScale[400], fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, cursor: 'pointer', textAlign: 'center' as const }}
              >
                {'☕'} {current.status === 'on-break' ? 'End Break' : 'Take Break'}
              </div>
            )}
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>
              {'📍'} {shift.location}
            </Text>
          </div>
        </div>

        {/* Bottom section: Team Status */}
        <div style={{ ...cardBase, backgroundColor: tokens.colors.neutral[800], border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[700]}`, padding: tokens.spacing[4] }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[3] }}>
            <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.common.white }}>{'👥'} Team Status</Text>
            <div style={{ display: 'flex', gap: tokens.spacing[3] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.successScale[400] }}>{'●'} {activeCount} Active</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.warningScale[400] }}>{'●'} {breakCount} Break</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{'●'} {MOCK_TEAM.length - activeCount - breakCount} Off</Text>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: tokens.spacing[2] }}>
            {MOCK_TEAM.map(t => (
              <div
                key={t.name}
                onMouseEnter={() => setHoveredStaff(t.name)}
                onMouseLeave={() => setHoveredStaff(null)}
                style={{
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                  borderRadius: tokens.borderRadius.md,
                  backgroundColor: hoveredStaff === t.name ? tokens.colors.neutral[700] : tokens.colors.neutral[800],
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[700]}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                  transition: `background-color ${tokens.motion.hover}`,
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: tokens.borderRadius.full, backgroundColor: statusColors[t.status], flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.common.white, display: 'block', whiteSpace: 'nowrap' as const, overflow: 'hidden' as const, textOverflow: 'ellipsis' as const }}>{t.name}</Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{t.role}</Text>
                </div>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{t.time}</Text>
              </div>
            ))}
          </div>
        </div>
      </Box>
    );
  },
});
