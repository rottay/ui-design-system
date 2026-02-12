'use client';

/**
 * StaffAvailabilityGrid - Compact Preset
 * Summary view showing daily availability counts
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle } from '../../../helpers';
import type { StaffAvailabilityGridProps, StaffAvailabilityEntry } from '../../core';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const MOCK_ENTRIES: StaffAvailabilityEntry[] = [
  { id: '1', staffId: '1', staffName: 'Maria S.', role: 'Bartender', slots: [
    { day: 'monday', startTime: '08:00', endTime: '16:00', type: 'available' },
    { day: 'wednesday', startTime: '12:00', endTime: '20:00', type: 'preferred' },
    { day: 'saturday', startTime: '10:00', endTime: '22:00', type: 'preferred' },
  ]},
  { id: '2', staffId: '2', staffName: 'Carlos R.', role: 'Security', slots: [
    { day: 'monday', startTime: '18:00', endTime: '22:00', type: 'available' },
    { day: 'friday', startTime: '18:00', endTime: '22:00', type: 'preferred' },
    { day: 'saturday', startTime: '14:00', endTime: '22:00', type: 'preferred' },
  ]},
];

export const CompactStaffAvailabilityGrid = createPreset<StaffAvailabilityGridProps>({
  name: 'StaffAvailabilityGrid.Compact',
  render: ({ primitives, props, tokens }: PresetContext<StaffAvailabilityGridProps>) => {
    const { Box, Text } = primitives;
    const { entries: propEntries, onSlotClick, className, style } = props;

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const entries = propEntries?.length ? propEntries : MOCK_ENTRIES;

    const availableByDay = useMemo(() => {
      return DAYS.map(day => {
        const count = entries.filter(e => e.slots.some(s => s.day === day)).length;
        return count;
      });
    }, [entries]);

    const hasDay = (entry: StaffAvailabilityEntry, day: typeof DAYS[number]) =>
      entry.slots.some(s => s.day === day);

    const dayType = (entry: StaffAvailabilityEntry, day: typeof DAYS[number]) => {
      const slot = entry.slots.find(s => s.day === day);
      return slot?.type ?? null;
    };

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[4], ...style }}>
        <Text style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[4] }}>Availability Overview</Text>

        {/* Day summary bar */}
        <div style={{ ...cardBase, padding: tokens.spacing[3], marginBottom: tokens.spacing[4], display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: tokens.spacing[2] }}>
          {DAY_LABELS.map((label, i) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'block' }}>{label}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: availableByDay[i] > 0 ? tokens.colors.successScale[600] : tokens.colors.neutral[300], display: 'block' }}>{availableByDay[i]}</Text>
            </div>
          ))}
        </div>

        {/* Staff rows */}
        <div style={{ ...cardBase, padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: tokens.colors.neutral[50] }}>
                <th style={{ padding: tokens.spacing[3], textAlign: 'left', fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], borderBottom: `1px solid ${tokens.colors.neutral[200]}` }}>Staff</th>
                {DAY_LABELS.map(d => (
                  <th key={d} style={{ padding: tokens.spacing[2], textAlign: 'center', fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], borderBottom: `1px solid ${tokens.colors.neutral[200]}` }}>{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.map(entry => (
                <tr key={entry.id}>
                  <td style={{ padding: tokens.spacing[3], borderBottom: `1px solid ${tokens.colors.neutral[100]}`, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[800] }}>{entry.staffName}</td>
                  {DAYS.map((day, di) => {
                    const type = dayType(entry, day);
                    const bg = type === 'preferred' ? tokens.colors.successScale[400] : type === 'available' ? tokens.colors.successScale[200] : tokens.colors.neutral[50];
                    return (
                      <td key={day} onClick={() => onSlotClick?.(entry.staffId, day, 0)} style={{ padding: tokens.spacing[1], borderBottom: `1px solid ${tokens.colors.neutral[100]}`, textAlign: 'center', cursor: 'pointer' }}>
                        <div style={{ width: 24, height: 24, borderRadius: tokens.borderRadius.sm, backgroundColor: bg, margin: '0 auto', border: `1px solid ${tokens.colors.neutral[200]}` }} />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Box>
    );
  },
});
