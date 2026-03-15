'use client';

/**
 * StaffCheckInMap - List Preset
 * Timeline list of check-in/out records
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createBadgeStyle } from '../../../helpers';
import type { StaffCheckInMapProps, CheckInRecord } from '../../core';

const MOCK_RECORDS: CheckInRecord[] = [
  { id: '1', staffId: '1', staffName: 'Maria S.', role: 'Bartender', type: 'check-in', timestamp: new Date('2024-08-05T08:02:00'), latitude: 40.7128, longitude: -74.006, locationName: 'Main Venue', isWithinGeofence: true },
  { id: '2', staffId: '2', staffName: 'Carlos R.', role: 'Security', type: 'check-in', timestamp: new Date('2024-08-05T17:55:00'), latitude: 40.7130, longitude: -74.0058, locationName: 'Gate A', isWithinGeofence: true },
  { id: '3', staffId: '3', staffName: 'Diego M.', role: 'Sound Tech', type: 'check-in', timestamp: new Date('2024-08-05T09:30:00'), latitude: 40.7150, longitude: -74.010, locationName: 'Unknown', isWithinGeofence: false },
];

export const ListStaffCheckInMap = createPreset<StaffCheckInMapProps>({
  name: 'StaffCheckInMap.List',
  render: ({ primitives, props, tokens }: PresetContext<StaffCheckInMapProps>) => {
    const { Box, Text } = primitives;
    const { records: propRecords, onRecordClick, onFlagAnomaly, className, style } = props;

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const records = propRecords?.length ? propRecords : MOCK_RECORDS;

    const sorted = useMemo(() => [...records].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()), [records]);
    const formatTime = (d: Date) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const formatDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[5], ...style }}>
        <Text style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[4] }}>Check-In Records</Text>

        <div style={{ position: 'relative', paddingLeft: tokens.spacing[6] }}>
          {/* Timeline line */}
          <div style={{ position: 'absolute', left: 11, top: 0, bottom: 0, width: 2, backgroundColor: tokens.colors.neutral[200] }} />

          {sorted.map(r => (
            <div key={r.id} onClick={() => onRecordClick?.(r.id)} style={{ position: 'relative', marginBottom: tokens.spacing[3], cursor: 'pointer' }}>
              {/* Timeline dot */}
              <div style={{ position: 'absolute', left: -tokens.spacing[6] + 3, top: tokens.spacing[3], width: 16, height: 16, borderRadius: tokens.borderRadius.full, backgroundColor: r.type === 'check-in' ? tokens.colors.successScale[500] : tokens.colors.infoScale[500], border: `2px solid ${tokens.colors.common.white}` }} />

              <div style={{ ...cardBase, padding: tokens.spacing[3] }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block' }}>
                      {r.staffName} ({r.role})
                    </Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                      {r.type === 'check-in' ? 'Checked In' : 'Checked Out'} at {formatTime(r.timestamp)} | {formatDate(r.timestamp)} | {r.locationName}
                    </Text>
                  </div>
                  <div style={{ display: 'flex', gap: tokens.spacing[1] }}>
                    {!r.isWithinGeofence && (
                      <button onClick={e => { e.stopPropagation(); onFlagAnomaly?.(r.id); }} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.sm, border: `1px solid ${tokens.colors.errorScale[300]}`, backgroundColor: 'transparent', color: tokens.colors.errorScale[600], fontSize: tokens.typography.fontSize.xs, cursor: 'pointer' }}>Flag</button>
                    )}
                    <span style={{ ...createBadgeStyle(tokens, r.isWithinGeofence ? 'success' : ('error' as any)), fontSize: tokens.typography.fontSize.xs }}>
                      {r.isWithinGeofence ? 'In Zone' : 'Outside'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Box>
    );
  },
});
