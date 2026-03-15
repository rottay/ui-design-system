'use client';

/**
 * StaffAvailabilityGrid - Grid Preset
 * Full weekly availability heatmap grid
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle } from '../../../helpers';
import type { StaffAvailabilityGridProps, StaffAvailabilityEntry } from '../../core';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = Array.from({ length: 16 }, (_, i) => i + 6); // 6am to 9pm

const MOCK_ENTRIES: StaffAvailabilityEntry[] = [
  { id: '1', staffId: '1', staffName: 'Maria S.', role: 'Bartender', slots: [
    { day: 'monday', startTime: '08:00', endTime: '16:00', type: 'available' },
    { day: 'tuesday', startTime: '08:00', endTime: '16:00', type: 'preferred' },
    { day: 'wednesday', startTime: '12:00', endTime: '20:00', type: 'available' },
    { day: 'friday', startTime: '18:00', endTime: '22:00', type: 'preferred' },
    { day: 'saturday', startTime: '10:00', endTime: '22:00', type: 'preferred' },
  ]},
  { id: '2', staffId: '2', staffName: 'Carlos R.', role: 'Security', slots: [
    { day: 'monday', startTime: '18:00', endTime: '22:00', type: 'available' },
    { day: 'tuesday', startTime: '18:00', endTime: '22:00', type: 'available' },
    { day: 'wednesday', startTime: '18:00', endTime: '22:00', type: 'preferred' },
    { day: 'thursday', startTime: '18:00', endTime: '22:00', type: 'available' },
    { day: 'friday', startTime: '18:00', endTime: '22:00', type: 'preferred' },
    { day: 'saturday', startTime: '14:00', endTime: '22:00', type: 'preferred' },
  ]},
  { id: '3', staffId: '3', staffName: 'Ana L.', role: 'Server', slots: [
    { day: 'monday', startTime: '06:00', endTime: '14:00', type: 'preferred' },
    { day: 'wednesday', startTime: '06:00', endTime: '14:00', type: 'preferred' },
    { day: 'thursday', startTime: '06:00', endTime: '14:00', type: 'available' },
    { day: 'sunday', startTime: '10:00', endTime: '18:00', type: 'available' },
  ]},
];

export const GridStaffAvailabilityGrid = createPreset<StaffAvailabilityGridProps>({
  name: 'StaffAvailabilityGrid.Grid',
  render: ({ primitives, props, tokens }: PresetContext<StaffAvailabilityGridProps>) => {
    const { Box, Text } = primitives;
    const { entries: propEntries, onSlotClick, className, style } = props;

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const entries = propEntries?.length ? propEntries : MOCK_ENTRIES;

    const getSlotType = (entry: StaffAvailabilityEntry, day: typeof DAYS[number], hour: number) => {
      const hourStr = `${hour.toString().padStart(2, '0')}:00`;
      const slot = entry.slots.find(s => s.day === day && s.startTime <= hourStr && s.endTime > hourStr);
      return slot?.type ?? null;
    };

    const slotColor = (type: string | null) => {
      if (type === 'preferred') return tokens.colors.successScale[400];
      if (type === 'available') return tokens.colors.successScale[200];
      return 'transparent';
    };

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[5], ...style }}>
        <div style={{ marginBottom: tokens.spacing[5] }}>
          <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>Staff Availability</Text>
          <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>{entries.length} staff members</Text>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: tokens.spacing[4], marginBottom: tokens.spacing[4] }}>
          {[{ label: 'Preferred', color: tokens.colors.successScale[400] }, { label: 'Available', color: tokens.colors.successScale[200] }, { label: 'Unavailable', color: tokens.colors.neutral[100] }].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
              <span style={{ width: 12, height: 12, borderRadius: tokens.borderRadius.sm, backgroundColor: l.color, border: `1px solid ${tokens.colors.neutral[200]}` }} />
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>{l.label}</Text>
            </div>
          ))}
        </div>

        {/* Per-staff grid */}
        {entries.map(entry => (
          <div key={entry.id} style={{ ...cardBase, padding: tokens.spacing[4], marginBottom: tokens.spacing[4] }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[3] }}>
              <div style={{ width: 32, height: 32, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.primaryScale[500], display: 'flex', alignItems: 'center', justifyContent: 'center', color: tokens.colors.common.white, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold }}>
                {entry.staffName[0]}
              </div>
              <div>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block' }}>{entry.staffName}</Text>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{entry.role}</Text>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                <thead>
                  <tr>
                    <th style={{ width: 40, padding: tokens.spacing[1] }} />
                    {HOURS.map(h => (
                      <th key={h} style={{ padding: tokens.spacing[1], fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], fontWeight: tokens.typography.fontWeight.normal, textAlign: 'center', minWidth: 28 }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DAYS.map((day, di) => (
                    <tr key={day}>
                      <td style={{ padding: tokens.spacing[1], fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600], fontWeight: tokens.typography.fontWeight.medium }}>{DAY_LABELS[di]}</td>
                      {HOURS.map(h => {
                        const type = getSlotType(entry, day, h);
                        return (
                          <td
                            key={h}
                            onClick={() => onSlotClick?.(entry.staffId, day, h)}
                            style={{ padding: 1, cursor: 'pointer' }}
                          >
                            <div style={{ width: '100%', height: 20, borderRadius: 2, backgroundColor: slotColor(type), border: `1px solid ${tokens.colors.neutral[100]}` }} />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </Box>
    );
  },
});
