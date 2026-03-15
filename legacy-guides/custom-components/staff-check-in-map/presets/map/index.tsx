'use client';

/**
 * StaffCheckInMap - Map Preset
 * Visual map representation of check-in/out locations
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createBadgeStyle } from '../../../helpers';
import type { StaffCheckInMapProps, CheckInRecord } from '../../core';

const MOCK_RECORDS: CheckInRecord[] = [
  { id: '1', staffId: '1', staffName: 'Maria S.', role: 'Bartender', type: 'check-in', timestamp: new Date('2024-08-05T08:02:00'), latitude: 40.7128, longitude: -74.006, locationName: 'Main Venue', isWithinGeofence: true },
  { id: '2', staffId: '2', staffName: 'Carlos R.', role: 'Security', type: 'check-in', timestamp: new Date('2024-08-05T17:55:00'), latitude: 40.7130, longitude: -74.0058, locationName: 'Gate A', isWithinGeofence: true },
  { id: '3', staffId: '3', staffName: 'Diego M.', role: 'Sound Tech', type: 'check-in', timestamp: new Date('2024-08-05T09:30:00'), latitude: 40.7150, longitude: -74.010, locationName: 'Unknown', isWithinGeofence: false, notes: 'GPS signal weak' },
  { id: '4', staffId: '1', staffName: 'Maria S.', role: 'Bartender', type: 'check-out', timestamp: new Date('2024-08-05T14:05:00'), latitude: 40.7128, longitude: -74.006, locationName: 'Main Venue', isWithinGeofence: true },
  { id: '5', staffId: '4', staffName: 'Ana L.', role: 'Server', type: 'check-in', timestamp: new Date('2024-08-05T18:58:00'), latitude: 40.7125, longitude: -74.0065, locationName: 'VIP Entrance', isWithinGeofence: true },
];

export const MapStaffCheckInMap = createPreset<StaffCheckInMapProps>({
  name: 'StaffCheckInMap.Map',
  render: ({ primitives, props, tokens }: PresetContext<StaffCheckInMapProps>) => {
    const { Box, Text } = primitives;
    const { records: propRecords, onRecordClick, onFlagAnomaly, className, style } = props;

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const records = propRecords?.length ? propRecords : MOCK_RECORDS;
    const [selected, setSelected] = useState<string | null>(null);

    const anomalies = records.filter(r => !r.isWithinGeofence);
    const checkedIn = records.filter(r => r.type === 'check-in');
    const checkedOut = records.filter(r => r.type === 'check-out');

    const formatTime = (d: Date) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[5], ...style }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[5] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>Check-In Map</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>{records.length} records today</Text>
          </div>
          {anomalies.length > 0 && (
            <span style={{ ...createBadgeStyle(tokens, 'error'), fontSize: tokens.typography.fontSize.sm }}>
              {anomalies.length} anomal{anomalies.length === 1 ? 'y' : 'ies'}
            </span>
          )}
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: tokens.spacing[3], marginBottom: tokens.spacing[5] }}>
          {[
            { label: 'Checked In', value: checkedIn.length, color: tokens.colors.successScale[500] },
            { label: 'Checked Out', value: checkedOut.length, color: tokens.colors.infoScale[500] },
            { label: 'Outside Geofence', value: anomalies.length, color: tokens.colors.errorScale[500] },
          ].map(s => (
            <div key={s.label} style={{ ...cardBase, padding: tokens.spacing[4], textAlign: 'center' }}>
              <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: s.color, display: 'block' }}>{s.value}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{s.label}</Text>
            </div>
          ))}
        </div>

        {/* Map placeholder with pins */}
        <div style={{ ...cardBase, padding: 0, marginBottom: tokens.spacing[4], position: 'relative', height: 320, backgroundColor: tokens.colors.neutral[100], borderRadius: tokens.borderRadius.md, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400], display: 'block' }}>Map View</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[300] }}>Integrate with mapping provider</Text>
          </div>
          {/* Pin indicators */}
          {records.map((r, i) => (
            <div
              key={r.id}
              onClick={() => { setSelected(r.id); onRecordClick?.(r.id); }}
              style={{
                position: 'absolute',
                top: `${20 + (i * 15) % 60}%`,
                left: `${15 + (i * 20) % 70}%`,
                width: 28, height: 28,
                borderRadius: tokens.borderRadius.full,
                backgroundColor: r.isWithinGeofence ? (r.type === 'check-in' ? tokens.colors.successScale[500] : tokens.colors.infoScale[500]) : tokens.colors.errorScale[500],
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: tokens.colors.common.white, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold,
                cursor: 'pointer', border: selected === r.id ? `3px solid ${tokens.colors.common.white}` : 'none',
                boxShadow: tokens.shadows.md,
              }}
            >
              {r.staffName[0]}
            </div>
          ))}
        </div>

        {/* Records List */}
        <div style={{ ...cardBase, padding: 0, overflow: 'hidden' }}>
          {records.map(r => (
            <div
              key={r.id}
              onClick={() => { setSelected(r.id); onRecordClick?.(r.id); }}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: tokens.spacing[3], borderBottom: `1px solid ${tokens.colors.neutral[100]}`, cursor: 'pointer', backgroundColor: selected === r.id ? tokens.colors.primaryScale[50] : 'transparent' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                <div style={{ width: 8, height: 8, borderRadius: tokens.borderRadius.full, backgroundColor: r.type === 'check-in' ? tokens.colors.successScale[500] : tokens.colors.infoScale[500] }} />
                <div>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900], display: 'block' }}>
                    {r.staffName} - {r.type === 'check-in' ? 'Checked In' : 'Checked Out'}
                  </Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{formatTime(r.timestamp)} | {r.locationName}</Text>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                {!r.isWithinGeofence && (
                  <button onClick={e => { e.stopPropagation(); onFlagAnomaly?.(r.id); }} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.sm, border: `1px solid ${tokens.colors.errorScale[300]}`, backgroundColor: 'transparent', color: tokens.colors.errorScale[600], fontSize: tokens.typography.fontSize.xs, cursor: 'pointer' }}>
                    Flag
                  </button>
                )}
                <span style={{ ...createBadgeStyle(tokens, r.isWithinGeofence ? 'success' : ('error' as any)), fontSize: tokens.typography.fontSize.xs }}>
                  {r.isWithinGeofence ? 'In Zone' : 'Outside'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Box>
    );
  },
});
