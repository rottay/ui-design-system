'use client';

/**
 * StaffShiftScheduler - Calendar Preset
 * Weekly calendar grid view for shift management
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createBadgeStyle } from '../../../helpers';
import type { StaffShiftSchedulerProps, StaffShift } from '../../core';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const MOCK_SHIFTS: StaffShift[] = [
  { id: 's1', title: 'Morning Bar', date: '2024-08-05', startTime: '08:00', endTime: '14:00', location: 'Main Hall', requiredStaff: 3, assignments: [{ id: 'a1', staffId: '1', staffName: 'Maria S.', role: 'Bartender', color: '#4F46E5' }, { id: 'a2', staffId: '2', staffName: 'Carlos R.', role: 'Bartender', color: '#059669' }], status: 'published' },
  { id: 's2', title: 'Evening Security', date: '2024-08-05', startTime: '18:00', endTime: '02:00', location: 'Gate A', requiredStaff: 4, assignments: [{ id: 'a3', staffId: '3', staffName: 'Diego M.', role: 'Security', color: '#D97706' }], status: 'published' },
  { id: 's3', title: 'Sound Check', date: '2024-08-06', startTime: '10:00', endTime: '13:00', location: 'Stage 1', requiredStaff: 2, assignments: [{ id: 'a4', staffId: '4', staffName: 'Laura P.', role: 'Sound Tech', color: '#DC2626' }], status: 'draft' },
  { id: 's4', title: 'VIP Service', date: '2024-08-07', startTime: '19:00', endTime: '23:00', location: 'VIP Lounge', requiredStaff: 2, assignments: [{ id: 'a5', staffId: '5', staffName: 'Ana L.', role: 'Server', color: '#7C3AED' }, { id: 'a6', staffId: '1', staffName: 'Maria S.', role: 'Bartender', color: '#4F46E5' }], status: 'published' },
  { id: 's5', title: 'Cleanup Crew', date: '2024-08-08', startTime: '06:00', endTime: '10:00', requiredStaff: 5, assignments: [], status: 'draft' },
];

export const CalendarStaffShiftScheduler = createPreset<StaffShiftSchedulerProps>({
  name: 'StaffShiftScheduler.Calendar',
  render: ({ primitives, props, tokens }: PresetContext<StaffShiftSchedulerProps>) => {
    const { Box, Text } = primitives;
    const { shifts: propShifts, onShiftClick, onCreateShift, onWeekChange, className, style } = props;

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);

    const shifts = propShifts?.length ? propShifts : MOCK_SHIFTS;

    const statusColor = (s: StaffShift['status']) => {
      const map = { draft: 'secondary', published: 'success', 'in-progress': 'info', completed: 'primary' } as const;
      return map[s] || 'secondary';
    };

    // Group shifts by day index (0=Mon)
    const shiftsByDay = useMemo(() => {
      const map: Record<number, StaffShift[]> = {};
      shifts.forEach(s => {
        const d = new Date(s.date);
        const day = (d.getDay() + 6) % 7; // Mon=0
        if (!map[day]) map[day] = [];
        map[day].push(s);
      });
      return map;
    }, [shifts]);

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[5], ...style }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[5] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>Shift Scheduler</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>{shifts.length} shifts this week</Text>
          </div>
          <div style={{ display: 'flex', gap: tokens.spacing[2] }}>
            <button onClick={() => onWeekChange?.(new Date())} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md, border: `1px solid ${tokens.colors.neutral[200]}`, backgroundColor: tokens.colors.common.white, fontSize: tokens.typography.fontSize.sm, cursor: 'pointer', color: tokens.colors.neutral[700] }}>Today</button>
            <button onClick={() => onCreateShift?.('')} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, borderRadius: tokens.borderRadius.md, border: 'none', backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, cursor: 'pointer' }}>+ New Shift</button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, backgroundColor: tokens.colors.neutral[200], borderRadius: tokens.borderRadius.md, overflow: 'hidden' }}>
          {/* Day Headers */}
          {DAYS.map(day => (
            <div key={day} style={{ padding: tokens.spacing[2], backgroundColor: tokens.colors.neutral[100], textAlign: 'center' }}>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[600], textTransform: 'uppercase' }}>{day}</Text>
            </div>
          ))}

          {/* Day Cells */}
          {DAYS.map((_, dayIdx) => (
            <div key={dayIdx} onClick={() => onCreateShift?.(`day-${dayIdx}`)} style={{ backgroundColor: tokens.colors.common.white, padding: tokens.spacing[2], minHeight: 140, cursor: 'pointer' }}>
              {(shiftsByDay[dayIdx] || []).map(shift => (
                <div
                  key={shift.id}
                  onClick={e => { e.stopPropagation(); onShiftClick?.(shift.id); }}
                  style={{ ...cardBase, padding: tokens.spacing[2], marginBottom: tokens.spacing[1], borderLeft: `3px solid ${shift.status === 'draft' ? tokens.colors.neutral[400] : tokens.colors.primaryScale[500]}`, cursor: 'pointer' }}
                >
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block' }}>{shift.title}</Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'block' }}>{shift.startTime} - {shift.endTime}</Text>
                  <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1], marginTop: tokens.spacing[1] }}>
                    {shift.assignments.slice(0, 3).map(a => (
                      <div key={a.id} style={{ width: 18, height: 18, borderRadius: tokens.borderRadius.full, backgroundColor: a.color || tokens.colors.primaryScale[500], display: 'flex', alignItems: 'center', justifyContent: 'center', color: tokens.colors.common.white, fontSize: 8, fontWeight: tokens.typography.fontWeight.bold }}>
                        {a.staffName[0]}
                      </div>
                    ))}
                    {shift.assignments.length < shift.requiredStaff && (
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.warningScale[600] }}>+{shift.requiredStaff - shift.assignments.length} needed</Text>
                    )}
                  </div>
                  <span style={{ ...createBadgeStyle(tokens, statusColor(shift.status) as any), fontSize: 9, padding: `0 ${tokens.spacing[1]}px`, marginTop: tokens.spacing[1], display: 'inline-block' }}>{shift.status}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </Box>
    );
  },
});
