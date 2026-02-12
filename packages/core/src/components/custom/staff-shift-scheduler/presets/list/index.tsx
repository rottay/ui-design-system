'use client';

/**
 * StaffShiftScheduler - List Preset
 * Flat list of shifts with assignment details
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createBadgeStyle } from '../../../helpers';
import type { StaffShiftSchedulerProps, StaffShift } from '../../core';

const MOCK_SHIFTS: StaffShift[] = [
  { id: 's1', title: 'Morning Bar', date: '2024-08-05', startTime: '08:00', endTime: '14:00', location: 'Main Hall', requiredStaff: 3, assignments: [{ id: 'a1', staffId: '1', staffName: 'Maria S.', role: 'Bartender' }, { id: 'a2', staffId: '2', staffName: 'Carlos R.', role: 'Bartender' }], status: 'published' },
  { id: 's2', title: 'Evening Security', date: '2024-08-05', startTime: '18:00', endTime: '02:00', location: 'Gate A', requiredStaff: 4, assignments: [{ id: 'a3', staffId: '3', staffName: 'Diego M.', role: 'Security' }], status: 'published' },
  { id: 's3', title: 'Sound Check', date: '2024-08-06', startTime: '10:00', endTime: '13:00', location: 'Stage 1', requiredStaff: 2, assignments: [], status: 'draft' },
];

export const ListStaffShiftScheduler = createPreset<StaffShiftSchedulerProps>({
  name: 'StaffShiftScheduler.List',
  render: ({ primitives, props, tokens }: PresetContext<StaffShiftSchedulerProps>) => {
    const { Box, Text } = primitives;
    const { shifts: propShifts, onShiftClick, onCreateShift, className, style } = props;

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const shifts = propShifts?.length ? propShifts : MOCK_SHIFTS;
    const [statusFilter, setStatusFilter] = useState('all');

    const filtered = useMemo(() => statusFilter === 'all' ? shifts : shifts.filter(s => s.status === statusFilter), [shifts, statusFilter]);

    const statusColorMap = { draft: 'secondary', published: 'success', 'in-progress': 'info', completed: 'primary' } as const;

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[5], ...style }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[4] }}>
          <Text style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>Shift Schedule</Text>
          <button onClick={() => onCreateShift?.('')} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, borderRadius: tokens.borderRadius.md, border: 'none', backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, cursor: 'pointer' }}>+ New Shift</button>
        </div>

        <div style={{ display: 'flex', gap: tokens.spacing[2], marginBottom: tokens.spacing[4] }}>
          {['all', 'draft', 'published', 'in-progress', 'completed'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.full, border: statusFilter === s ? 'none' : `1px solid ${tokens.colors.neutral[200]}`, backgroundColor: statusFilter === s ? tokens.colors.primaryScale[600] : tokens.colors.common.white, color: statusFilter === s ? tokens.colors.common.white : tokens.colors.neutral[600], fontSize: tokens.typography.fontSize.xs, cursor: 'pointer', textTransform: 'capitalize' }}>
              {s}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3] }}>
          {filtered.map(shift => (
            <div key={shift.id} onClick={() => onShiftClick?.(shift.id)} style={{ ...cardBase, padding: tokens.spacing[4], cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[1] }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>{shift.title}</Text>
                  <span style={{ ...createBadgeStyle(tokens, statusColorMap[shift.status] as any), fontSize: tokens.typography.fontSize.xs }}>{shift.status}</span>
                </div>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], display: 'block' }}>
                  {shift.date} | {shift.startTime} - {shift.endTime} {shift.location ? `| ${shift.location}` : ''}
                </Text>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ display: 'flex', gap: tokens.spacing[1], marginBottom: tokens.spacing[1] }}>
                  {shift.assignments.map(a => (
                    <div key={a.id} style={{ width: 24, height: 24, borderRadius: tokens.borderRadius.full, backgroundColor: a.color || tokens.colors.primaryScale[500], display: 'flex', alignItems: 'center', justifyContent: 'center', color: tokens.colors.common.white, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold }}>
                      {a.staffName[0]}
                    </div>
                  ))}
                </div>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: shift.assignments.length < shift.requiredStaff ? tokens.colors.warningScale[600] : tokens.colors.successScale[600] }}>
                  {shift.assignments.length}/{shift.requiredStaff} assigned
                </Text>
              </div>
            </div>
          ))}
        </div>
      </Box>
    );
  },
});
