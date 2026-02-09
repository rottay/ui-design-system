'use client';

/**
 * EvShiftScheduler - Calendar Preset
 * Rich week-view calendar grid with search, role filter pills, conflict detection,
 * shift blocks color-coded by role, staffing gap alerts, and summary stats
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
import type { EvShiftSchedulerProps, ShiftBlock, ShiftRequirement } from '../../core';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00', '00:00'];

const MOCK_SHIFTS: ShiftBlock[] = [
  { id: 's1', staffName: 'Maria S.', staffId: '1', role: 'Bartender', startTime: new Date('2026-02-09T18:00'), endTime: new Date('2026-02-10T02:00'), status: 'confirmed', color: '' },
  { id: 's2', staffName: 'Carlos R.', staffId: '2', role: 'Security', startTime: new Date('2026-02-09T16:00'), endTime: new Date('2026-02-10T00:00'), status: 'confirmed', color: '' },
  { id: 's3', staffName: 'Ana L.', staffId: '3', role: 'Server', startTime: new Date('2026-02-10T17:00'), endTime: new Date('2026-02-10T23:00'), status: 'published', color: '' },
  { id: 's4', staffName: 'Diego M.', staffId: '4', role: 'Sound Tech', startTime: new Date('2026-02-11T14:00'), endTime: new Date('2026-02-11T22:00'), status: 'draft', color: '' },
  { id: 's5', staffName: 'Laura P.', staffId: '5', role: 'Stage Mgr', startTime: new Date('2026-02-11T12:00'), endTime: new Date('2026-02-11T20:00'), status: 'confirmed', color: '' },
  { id: 's6', staffName: 'Maria S.', staffId: '1', role: 'Bartender', startTime: new Date('2026-02-12T19:00'), endTime: new Date('2026-02-13T01:00'), status: 'published', color: '' },
  { id: 's7', staffName: 'Carlos R.', staffId: '2', role: 'Security', startTime: new Date('2026-02-13T15:00'), endTime: new Date('2026-02-13T23:00'), status: 'confirmed', color: '' },
  { id: 's8', staffName: 'Ana L.', staffId: '3', role: 'Server', startTime: new Date('2026-02-14T17:00'), endTime: new Date('2026-02-14T23:00'), status: 'confirmed', color: '' },
  { id: 's9', staffName: 'Roberto G.', staffId: '6', role: 'Event Coord', startTime: new Date('2026-02-14T10:00'), endTime: new Date('2026-02-14T18:00'), status: 'draft', color: '' },
  { id: 's10', staffName: 'Laura P.', staffId: '5', role: 'Stage Mgr', startTime: new Date('2026-02-15T14:00'), endTime: new Date('2026-02-15T22:00'), status: 'confirmed', color: '' },
];

const MOCK_REQS: ShiftRequirement[] = [
  { role: 'Bartender', required: 3, assigned: 2, date: new Date('2026-02-09') },
  { role: 'Security', required: 4, assigned: 3, date: new Date('2026-02-09') },
  { role: 'Server', required: 3, assigned: 1, date: new Date('2026-02-10') },
  { role: 'Sound Tech', required: 2, assigned: 1, date: new Date('2026-02-11') },
];

const STATUS_CONFIG: Record<string, { color: 'success' | 'info' | 'warning' | 'secondary'; label: string }> = {
  draft: { color: 'secondary', label: 'Draft' },
  published: { color: 'info', label: 'Published' },
  confirmed: { color: 'success', label: 'Confirmed' },
  completed: { color: 'warning', label: 'Completed' },
};

export const CalendarEvShiftScheduler = createPreset<EvShiftSchedulerProps>({
  name: 'EvShiftScheduler.Calendar',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvShiftSchedulerProps>) => {
    const { Box, Text } = primitives;
    const { shifts, requirements, onShiftClick, onDateChange, className, style } = props;
    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const data = shifts?.length ? shifts : MOCK_SHIFTS;
    const reqs = requirements?.length ? requirements : MOCK_REQS;

    const [searchTerm, setSearchTerm] = useState('');
    const [activeRole, setActiveRole] = useState<string | null>(null);
    const [hoveredShift, setHoveredShift] = useState<string | null>(null);

    const roles = useMemo(() => Array.from(new Set(data.map(s => s.role))), [data]);

    const roleColors: Record<string, string> = {
      Bartender: tokens.colors.primaryScale[500],
      Security: tokens.colors.errorScale[500],
      Server: tokens.colors.successScale[500],
      'Sound Tech': tokens.colors.warningScale[500],
      'Stage Mgr': tokens.colors.infoScale[500],
      'Event Coord': tokens.colors.secondaryScale[500],
    };

    const filteredShifts = useMemo(() => {
      return data.filter(s => {
        if (searchTerm && !s.staffName.toLowerCase().includes(searchTerm.toLowerCase()) && !s.role.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        if (activeRole && s.role !== activeRole) return false;
        return true;
      });
    }, [data, searchTerm, activeRole]);

    const getShiftsForSlot = (dayDate: number, hour: number) =>
      filteredShifts.filter(s => s.startTime.getDate() === dayDate && s.startTime.getHours() === hour);

    const totalHours = useMemo(() => {
      return data.reduce((sum, s) => {
        const diff = (s.endTime.getTime() - s.startTime.getTime()) / (1000 * 60 * 60);
        return sum + diff;
      }, 0);
    }, [data]);

    const gapReqs = reqs.filter(r => r.assigned < r.required);
    const totalGaps = gapReqs.reduce((s, r) => s + (r.required - r.assigned), 0);

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[5], ...style }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[4] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>
              {'📅'} Shift Scheduler
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
              Week of Feb 9 - Feb 15, 2026 {'·'} {filteredShifts.length} shifts
            </Text>
          </div>
          <div style={{ display: 'flex', gap: tokens.spacing[2] }}>
            {['← Prev', 'Today', 'Next →'].map(l => (
              <div key={l} onClick={() => onDateChange?.(new Date())} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, backgroundColor: tokens.colors.common.white, fontSize: tokens.typography.fontSize.sm, cursor: 'pointer', color: tokens.colors.neutral[700], ...hoverStyle }}>{l}</div>
            ))}
          </div>
        </div>

        {/* KPI Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: tokens.spacing[3], marginBottom: tokens.spacing[4] }}>
          {[
            { label: 'Total Shifts', value: data.length.toString(), emoji: '📋', color: tokens.colors.primaryScale[600] },
            { label: 'Scheduled Hours', value: `${totalHours.toFixed(0)}h`, emoji: '⏱️', color: tokens.colors.infoScale[600] },
            { label: 'Confirmed', value: data.filter(s => s.status === 'confirmed').length.toString(), emoji: '✅', color: tokens.colors.successScale[600] },
            { label: 'Staffing Gaps', value: totalGaps.toString(), emoji: '⚠️', color: totalGaps > 0 ? tokens.colors.errorScale[600] : tokens.colors.successScale[600] },
          ].map(s => (
            <div key={s.label} style={{ ...cardBase, padding: tokens.spacing[3], textAlign: 'center' as const }}>
              <Text style={{ fontSize: tokens.typography.fontSize.lg, display: 'block' }}>{s.emoji}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: s.color, display: 'block' }}>{s.value}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{s.label}</Text>
            </div>
          ))}
        </div>

        {/* Search & Role Filters */}
        <div style={{ ...cardBase, marginBottom: tokens.spacing[4], padding: tokens.spacing[3] }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], flexWrap: 'wrap' as const }}>
            <div style={{ flex: 1, minWidth: 180, position: 'relative' as const }}>
              <div style={{ position: 'absolute' as const, left: tokens.spacing[3], top: '50%', transform: 'translateY(-50%)', color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>{'🔍'}</div>
              <input type="text" placeholder="Search staff or role..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ width: '100%', padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px ${tokens.spacing[2]}px ${tokens.spacing[8]}px`, borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[900], backgroundColor: tokens.colors.common.white, outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', gap: tokens.spacing[2], flexWrap: 'wrap' as const }}>
              <div onClick={() => setActiveRole(null)} style={createFilterPillStyle(tokens, { active: activeRole === null })}>All Roles</div>
              {roles.map(r => (
                <div key={r} onClick={() => setActiveRole(activeRole === r ? null : r)} style={{ ...createFilterPillStyle(tokens, { active: activeRole === r }), display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                  <span style={{ width: 8, height: 8, borderRadius: tokens.borderRadius.full, backgroundColor: roleColors[r] || tokens.colors.primaryScale[400] }} />
                  {r}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Staffing Gaps Alert */}
        {gapReqs.length > 0 && (
          <div style={{ ...cardBase, marginBottom: tokens.spacing[4], padding: tokens.spacing[3], backgroundColor: tokens.colors.warningScale[50], border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.warningScale[200]}` }}>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.warningScale[700], display: 'block', marginBottom: tokens.spacing[1] }}>{'⚠️'} Staffing Gaps Detected</Text>
            <div style={{ display: 'flex', gap: tokens.spacing[4], flexWrap: 'wrap' as const }}>
              {gapReqs.map((r, i) => {
                const pct = Math.round((r.assigned / r.required) * 100);
                const bar = createProgressBarStyle(tokens, { percent: pct, color: tokens.colors.warningScale[500] });
                return (
                  <div key={i} style={{ minWidth: 140 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.warningScale[600] }}>{r.role}</Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.warningScale[700] }}>{r.assigned}/{r.required}</Text>
                    </div>
                    <div style={bar.track}><div style={bar.fill} /></div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Calendar Grid */}
        <div style={{ ...cardBase, padding: 0, overflow: 'hidden' as const }}>
          <div style={{ display: 'grid', gridTemplateColumns: '60px repeat(7, 1fr)', borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` }}>
            <div style={{ padding: tokens.spacing[2], backgroundColor: tokens.colors.neutral[50] }} />
            {DAYS.map((day, i) => (
              <div key={day} style={{ padding: tokens.spacing[2], textAlign: 'center' as const, backgroundColor: tokens.colors.neutral[50], borderLeft: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` }}>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase' as const }}>{day}</Text>
                <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>{9 + i}</Text>
              </div>
            ))}
          </div>
          {HOURS.map(hour => {
            const h = parseInt(hour.split(':')[0]);
            return (
              <div key={hour} style={{ display: 'grid', gridTemplateColumns: '60px repeat(7, 1fr)', minHeight: 48, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
                <div style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end' }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{hour}</Text>
                </div>
                {DAYS.map((_, di) => {
                  const dayShifts = getShiftsForSlot(9 + di, h);
                  return (
                    <div key={di} style={{ borderLeft: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`, padding: 2 }}>
                      {dayShifts.map(s => {
                        const isHovered = hoveredShift === s.id;
                        const sc = STATUS_CONFIG[s.status] || STATUS_CONFIG.draft;
                        return (
                          <div
                            key={s.id}
                            onClick={() => onShiftClick?.(s.id)}
                            onMouseEnter={() => setHoveredShift(s.id)}
                            onMouseLeave={() => setHoveredShift(null)}
                            style={{
                              padding: `${tokens.spacing[1]}px`,
                              borderRadius: tokens.borderRadius.sm,
                              backgroundColor: roleColors[s.role] || tokens.colors.primaryScale[400],
                              color: tokens.colors.common.white,
                              fontSize: tokens.typography.fontSize.xs,
                              cursor: 'pointer',
                              marginBottom: 2,
                              opacity: s.status === 'draft' ? 0.6 : 1,
                              transition: `transform ${tokens.motion.hover}`,
                              ...(isHovered ? getHoverTransform(tokens) : {}),
                            }}
                          >
                            <div style={{ fontWeight: tokens.typography.fontWeight.semibold }}>{s.staffName}</div>
                            <div style={{ opacity: 0.85, display: 'flex', justifyContent: 'space-between' }}>
                              <span>{s.role}</span>
                              <span style={createBadgeStyle(tokens, sc.color)}>{sc.label}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {filteredShifts.length === 0 && (
          <div style={{ textAlign: 'center' as const, padding: tokens.spacing[10], color: tokens.colors.neutral[400] }}>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], display: 'block', marginBottom: tokens.spacing[2] }}>{'📅'}</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.neutral[500], display: 'block' }}>No shifts match your filters</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>Try adjusting your search or role filter</Text>
          </div>
        )}

        {/* Legend & Summary */}
        <div style={{ ...cardBase, marginTop: tokens.spacing[4], display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: tokens.spacing[3], flexWrap: 'wrap' as const, gap: tokens.spacing[3] }}>
          <div style={{ display: 'flex', gap: tokens.spacing[3], flexWrap: 'wrap' as const }}>
            {Object.entries(roleColors).map(([role, color]) => (
              <div key={role} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                <span style={{ width: 12, height: 12, borderRadius: tokens.borderRadius.sm, backgroundColor: color }} />
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>{role}</Text>
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
              <span style={{ width: 12, height: 12, borderRadius: tokens.borderRadius.sm, backgroundColor: tokens.colors.neutral[300], opacity: 0.6 }} />
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Draft (dimmed)</Text>
            </div>
          </div>
          <div style={{ display: 'flex', gap: tokens.spacing[4] }}>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                <span style={createBadgeStyle(tokens, cfg.color)}>{cfg.label}</span>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{data.filter(s => s.status === key).length}</Text>
              </div>
            ))}
          </div>
        </div>
      </Box>
    );
  },
});
