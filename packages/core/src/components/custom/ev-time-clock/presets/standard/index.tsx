'use client';

/**
 * EvTimeClock - Standard Preset
 * Full time clock dashboard with status card, shift info, weekly summary,
 * search through recent entries, and break tracking
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createHoverStyle,
  createBadgeStyle,
  createFilterPillStyle,
  createProgressBarStyle,
  getHoverTransform,
} from '../../../helpers';
import type { EvTimeClockProps, ClockEntry, ShiftInfo } from '../../core';

const MOCK_CURRENT: ClockEntry = { id: 'e1', staffName: 'Maria S.', checkInTime: new Date('2026-02-08T17:30'), breakMinutes: 0, totalMinutes: 150, status: 'clocked-in' };
const MOCK_SHIFT: ShiftInfo = { shiftName: 'Evening Bar', role: 'Bartender', scheduledStart: new Date('2026-02-08T17:00'), scheduledEnd: new Date('2026-02-09T01:00'), location: 'Main Bar - Floor 1' };
const MOCK_ENTRIES: ClockEntry[] = [
  { id: 'e1', staffName: 'Maria S.', checkInTime: new Date('2026-02-08T17:30'), breakMinutes: 0, totalMinutes: 150, status: 'clocked-in' },
  { id: 'e2', staffName: 'Maria S.', checkInTime: new Date('2026-02-07T18:00'), checkOutTime: new Date('2026-02-08T01:30'), breakMinutes: 30, totalMinutes: 420, status: 'clocked-out' },
  { id: 'e3', staffName: 'Maria S.', checkInTime: new Date('2026-02-06T17:00'), checkOutTime: new Date('2026-02-07T00:00'), breakMinutes: 15, totalMinutes: 405, status: 'clocked-out' },
  { id: 'e4', staffName: 'Maria S.', checkInTime: new Date('2026-02-05T18:00'), checkOutTime: new Date('2026-02-06T01:00'), breakMinutes: 30, totalMinutes: 390, status: 'clocked-out' },
  { id: 'e5', staffName: 'Maria S.', checkInTime: new Date('2026-02-04T17:30'), checkOutTime: new Date('2026-02-05T00:30'), breakMinutes: 20, totalMinutes: 400, status: 'clocked-out' },
  { id: 'e6', staffName: 'Maria S.', checkInTime: new Date('2026-02-03T17:00'), checkOutTime: new Date('2026-02-03T23:00'), breakMinutes: 15, totalMinutes: 345, status: 'clocked-out' },
];

export const StandardEvTimeClock = createPreset<EvTimeClockProps>({
  name: 'EvTimeClock.Standard',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvTimeClockProps>) => {
    const { Box, Text } = primitives;
    const { currentEntry, recentEntries, shiftInfo, onClockIn, onClockOut, onStartBreak, onEndBreak, className, style } = props;
    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const current = currentEntry || MOCK_CURRENT;
    const shift = shiftInfo || MOCK_SHIFT;
    const entries = recentEntries?.length ? recentEntries : MOCK_ENTRIES;

    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState<string | null>(null);
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);

    const isClockedIn = current.status === 'clocked-in' || current.status === 'on-break';

    const formatTime = (d: Date) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const formatDate = (d: Date) => d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const formatMinutes = (m: number) => `${Math.floor(m / 60)}h ${m % 60}m`;

    const statusColor = current.status === 'clocked-in' ? tokens.colors.successScale[500] : current.status === 'on-break' ? tokens.colors.warningScale[500] : tokens.colors.neutral[400];
    const statusLabel = current.status === 'clocked-in' ? 'Clocked In' : current.status === 'on-break' ? 'On Break' : 'Clocked Out';

    const filteredEntries = useMemo(() => {
      return entries.filter(e => {
        if (searchTerm && !formatDate(e.checkInTime).toLowerCase().includes(searchTerm.toLowerCase())) return false;
        if (activeFilter && e.status !== activeFilter) return false;
        return true;
      });
    }, [entries, searchTerm, activeFilter]);

    const weeklyHours = useMemo(() => entries.reduce((s, e) => s + e.totalMinutes, 0), [entries]);
    const weeklyBreaks = useMemo(() => entries.reduce((s, e) => s + e.breakMinutes, 0), [entries]);
    const avgShiftLen = useMemo(() => entries.length ? Math.round(entries.reduce((s, e) => s + e.totalMinutes, 0) / entries.length) : 0, [entries]);

    const scheduledMinutes = (shift.scheduledEnd.getTime() - shift.scheduledStart.getTime()) / (1000 * 60);
    const shiftProgress = Math.min(Math.round((current.totalMinutes / scheduledMinutes) * 100), 100);
    const shiftBar = createProgressBarStyle(tokens, { percent: shiftProgress, color: shiftProgress >= 90 ? tokens.colors.successScale[500] : tokens.colors.primaryScale[500] });

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[5], ...style }}>
        <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[5] }}>
          {'🕐'} Time Clock
        </Text>

        {/* KPI Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: tokens.spacing[3], marginBottom: tokens.spacing[4] }}>
          {[
            { label: 'Weekly Hours', value: formatMinutes(weeklyHours), emoji: '⏱️', color: tokens.colors.primaryScale[600] },
            { label: 'Break Time', value: `${weeklyBreaks}m`, emoji: '☕', color: tokens.colors.warningScale[600] },
            { label: 'Avg Shift', value: formatMinutes(avgShiftLen), emoji: '📊', color: tokens.colors.infoScale[600] },
            { label: 'Entries', value: entries.length.toString(), emoji: '📝', color: tokens.colors.successScale[600] },
          ].map(s => (
            <div key={s.label} style={{ ...cardBase, padding: tokens.spacing[3], textAlign: 'center' as const }}>
              <Text style={{ fontSize: tokens.typography.fontSize.lg, display: 'block' }}>{s.emoji}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: s.color, display: 'block' }}>{s.value}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{s.label}</Text>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing[4], marginBottom: tokens.spacing[4] }}>
          {/* Current Status */}
          <div style={{ ...cardBase, padding: tokens.spacing[5] }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[4] }}>
              <span style={{ width: 12, height: 12, borderRadius: tokens.borderRadius.full, backgroundColor: statusColor, boxShadow: `0 0 8px ${statusColor}60` }} />
              <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>{statusLabel}</Text>
            </div>
            {isClockedIn && (
              <>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], display: 'block', marginBottom: tokens.spacing[1] }}>Since {formatTime(current.checkInTime)}</Text>
                <Text style={{ fontSize: '36px', fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[2], fontVariantNumeric: 'tabular-nums' }}>
                  {formatMinutes(current.totalMinutes)}
                </Text>
                <div style={{ marginBottom: tokens.spacing[2] }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Shift progress</Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>{shiftProgress}%</Text>
                  </div>
                  <div style={shiftBar.track}><div style={shiftBar.fill} /></div>
                </div>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], display: 'block' }}>Break: {current.breakMinutes}m</Text>
              </>
            )}
            <div style={{ display: 'flex', gap: tokens.spacing[2], marginTop: tokens.spacing[4] }}>
              {isClockedIn ? (
                <>
                  <div onClick={onClockOut} style={{ flex: 1, padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, borderRadius: tokens.borderRadius.md, backgroundColor: tokens.colors.errorScale[500], color: tokens.colors.common.white, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, cursor: 'pointer', textAlign: 'center' as const, ...hoverStyle }}>Clock Out</div>
                  <div onClick={current.status === 'on-break' ? onEndBreak : onStartBreak} style={{ flex: 1, padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.warningScale[300]}`, backgroundColor: tokens.colors.warningScale[50], color: tokens.colors.warningScale[700], fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, cursor: 'pointer', textAlign: 'center' as const, ...hoverStyle }}>
                    {current.status === 'on-break' ? 'End Break' : 'Start Break'}
                  </div>
                </>
              ) : (
                <div onClick={onClockIn} style={{ flex: 1, padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, borderRadius: tokens.borderRadius.md, backgroundColor: tokens.colors.successScale[500], color: tokens.colors.common.white, fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.bold, cursor: 'pointer', textAlign: 'center' as const, ...hoverStyle }}>Clock In</div>
              )}
            </div>
          </div>

          {/* Shift Info */}
          <div style={{ ...cardBase, padding: tokens.spacing[5] }}>
            <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[4] }}>{'📋'} Current Shift</Text>
            {[
              { label: 'Shift', value: shift.shiftName },
              { label: 'Role', value: shift.role },
              { label: 'Schedule', value: `${formatTime(shift.scheduledStart)} - ${formatTime(shift.scheduledEnd)}` },
              { label: 'Duration', value: formatMinutes(scheduledMinutes) },
              { label: 'Location', value: shift.location },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: `${tokens.spacing[2]}px 0`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>{item.label}</Text>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900] }}>{item.value}</Text>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Entries with Search */}
        <div style={{ ...cardBase, padding: 0, overflow: 'hidden' as const }}>
          <div style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, backgroundColor: tokens.colors.neutral[50], display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' as const, gap: tokens.spacing[2] }}>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>{'📝'} Recent Entries</Text>
            <div style={{ display: 'flex', gap: tokens.spacing[2], alignItems: 'center' }}>
              <input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.sm, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[900], backgroundColor: tokens.colors.common.white, outline: 'none', width: 120 }} />
              <div onClick={() => setActiveFilter(null)} style={createFilterPillStyle(tokens, { active: activeFilter === null })}>All</div>
              <div onClick={() => setActiveFilter(activeFilter === 'clocked-in' ? null : 'clocked-in')} style={createFilterPillStyle(tokens, { active: activeFilter === 'clocked-in' })}>Active</div>
              <div onClick={() => setActiveFilter(activeFilter === 'clocked-out' ? null : 'clocked-out')} style={createFilterPillStyle(tokens, { active: activeFilter === 'clocked-out' })}>Done</div>
            </div>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
            <thead>
              <tr>
                {['Date', 'Clock In', 'Clock Out', 'Break', 'Total', 'Status'].map(h => (
                  <th key={h} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, textAlign: 'left' as const, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase' as const, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map(e => (
                <tr key={e.id} onMouseEnter={() => setHoveredRow(e.id)} onMouseLeave={() => setHoveredRow(null)} style={{ backgroundColor: hoveredRow === e.id ? tokens.colors.neutral[50] : 'transparent', transition: `background-color ${tokens.motion.hover}` }}>
                  <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[900], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>{formatDate(e.checkInTime)}</td>
                  <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>{formatTime(e.checkInTime)}</td>
                  <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>{e.checkOutTime ? formatTime(e.checkOutTime) : '—'}</td>
                  <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>{e.breakMinutes}m</td>
                  <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>{formatMinutes(e.totalMinutes)}</td>
                  <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
                    <span style={createBadgeStyle(tokens, e.status === 'clocked-in' ? 'success' : e.status === 'on-break' ? 'warning' : 'secondary')}>{e.status === 'clocked-in' ? 'Active' : e.status === 'on-break' ? 'Break' : 'Done'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredEntries.length === 0 && (
            <div style={{ textAlign: 'center' as const, padding: tokens.spacing[6], color: tokens.colors.neutral[400] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.sm }}>No entries match your filters</Text>
            </div>
          )}
        </div>
      </Box>
    );
  },
});
