'use client';

/**
 * EvShiftScheduler - Timeline Preset
 * Horizontal timeline per staff member with shift blocks, conflict detection,
 * search, status filters, and condensed staff-centric view
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
import type { EvShiftSchedulerProps, ShiftBlock } from '../../core';

const MOCK_SHIFTS: ShiftBlock[] = [
  { id: 's1', staffName: 'Maria S.', staffId: '1', role: 'Bartender', startTime: new Date('2026-02-09T18:00'), endTime: new Date('2026-02-10T02:00'), status: 'confirmed', color: '' },
  { id: 's2', staffName: 'Carlos R.', staffId: '2', role: 'Security', startTime: new Date('2026-02-09T16:00'), endTime: new Date('2026-02-10T00:00'), status: 'confirmed', color: '' },
  { id: 's3', staffName: 'Ana L.', staffId: '3', role: 'Server', startTime: new Date('2026-02-09T17:00'), endTime: new Date('2026-02-09T23:00'), status: 'published', color: '' },
  { id: 's4', staffName: 'Diego M.', staffId: '4', role: 'Sound Tech', startTime: new Date('2026-02-09T14:00'), endTime: new Date('2026-02-09T22:00'), status: 'draft', color: '' },
  { id: 's5', staffName: 'Laura P.', staffId: '5', role: 'Stage Mgr', startTime: new Date('2026-02-09T12:00'), endTime: new Date('2026-02-09T20:00'), status: 'confirmed', color: '' },
  { id: 's6', staffName: 'Maria S.', staffId: '1', role: 'Bartender', startTime: new Date('2026-02-09T08:00'), endTime: new Date('2026-02-09T14:00'), status: 'completed', color: '' },
  { id: 's7', staffName: 'Carlos R.', staffId: '2', role: 'Security', startTime: new Date('2026-02-09T08:00'), endTime: new Date('2026-02-09T14:00'), status: 'completed', color: '' },
  { id: 's8', staffName: 'Ana L.', staffId: '3', role: 'Server', startTime: new Date('2026-02-09T08:00'), endTime: new Date('2026-02-09T12:00'), status: 'completed', color: '' },
  { id: 's9', staffName: 'Roberto G.', staffId: '6', role: 'Event Coord', startTime: new Date('2026-02-09T10:00'), endTime: new Date('2026-02-09T18:00'), status: 'confirmed', color: '' },
  { id: 's10', staffName: 'Roberto G.', staffId: '6', role: 'Event Coord', startTime: new Date('2026-02-09T17:00'), endTime: new Date('2026-02-09T23:00'), status: 'draft', color: '' },
];

const TIMELINE_HOURS = Array.from({ length: 17 }, (_, i) => i + 8);

const STATUS_OPTIONS = ['draft', 'published', 'confirmed', 'completed'];

export const TimelineEvShiftScheduler = createPreset<EvShiftSchedulerProps>({
  name: 'EvShiftScheduler.Timeline',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvShiftSchedulerProps>) => {
    const { Box, Text } = primitives;
    const { shifts, onShiftClick, className, style } = props;
    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);

    const data = shifts?.length ? shifts : MOCK_SHIFTS;

    const [searchTerm, setSearchTerm] = useState('');
    const [activeStatus, setActiveStatus] = useState<string | null>(null);
    const [hoveredBlock, setHoveredBlock] = useState<string | null>(null);

    const roleColors: Record<string, string> = {
      Bartender: tokens.colors.primaryScale[400],
      Security: tokens.colors.errorScale[400],
      Server: tokens.colors.successScale[400],
      'Sound Tech': tokens.colors.warningScale[400],
      'Stage Mgr': tokens.colors.infoScale[400],
      'Event Coord': tokens.colors.secondaryScale[400],
    };

    const filteredData = useMemo(() => {
      return data.filter(s => {
        if (searchTerm && !s.staffName.toLowerCase().includes(searchTerm.toLowerCase()) && !s.role.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        if (activeStatus && s.status !== activeStatus) return false;
        return true;
      });
    }, [data, searchTerm, activeStatus]);

    const staffGroups = useMemo(() => {
      const map = new Map<string, ShiftBlock[]>();
      filteredData.forEach(s => {
        const list = map.get(s.staffName) || [];
        list.push(s);
        map.set(s.staffName, list);
      });
      return Array.from(map.entries());
    }, [filteredData]);

    const hasConflict = (shifts: ShiftBlock[]) => {
      for (let i = 0; i < shifts.length; i++) {
        for (let j = i + 1; j < shifts.length; j++) {
          if (shifts[i].startTime < shifts[j].endTime && shifts[j].startTime < shifts[i].endTime) return true;
        }
      }
      return false;
    };

    const getBlockStyle = (s: ShiftBlock) => {
      const startH = s.startTime.getHours();
      const endH = s.endTime.getHours() || 24;
      const left = ((startH - 8) / 16) * 100;
      const width = ((endH - startH) / 16) * 100;
      return { left: `${left}%`, width: `${Math.max(width, 3)}%` };
    };

    const getStaffHours = (shifts: ShiftBlock[]) => {
      return shifts.reduce((sum, s) => {
        const diff = (s.endTime.getTime() - s.startTime.getTime()) / (1000 * 60 * 60);
        return sum + diff;
      }, 0);
    };

    const totalConflicts = staffGroups.filter(([, s]) => hasConflict(s)).length;

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[5], ...style }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[4] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>{'⏱️'} Staff Timeline</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
              Feb 9, 2026 {'·'} {staffGroups.length} staff {'·'} {filteredData.length} shifts
              {totalConflicts > 0 && <span style={{ color: tokens.colors.errorScale[500], fontWeight: tokens.typography.fontWeight.semibold }}> {'·'} {totalConflicts} conflict{totalConflicts !== 1 ? 's' : ''}</span>}
            </Text>
          </div>
        </div>

        {/* Search & Status Filters */}
        <div style={{ ...cardBase, marginBottom: tokens.spacing[4], padding: tokens.spacing[3] }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], flexWrap: 'wrap' as const }}>
            <div style={{ flex: 1, minWidth: 180, position: 'relative' as const }}>
              <div style={{ position: 'absolute' as const, left: tokens.spacing[3], top: '50%', transform: 'translateY(-50%)', color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>{'🔍'}</div>
              <input type="text" placeholder="Search staff..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ width: '100%', padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px ${tokens.spacing[2]}px ${tokens.spacing[8]}px`, borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[900], backgroundColor: tokens.colors.common.white, outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', gap: tokens.spacing[2], flexWrap: 'wrap' as const }}>
              <div onClick={() => setActiveStatus(null)} style={createFilterPillStyle(tokens, { active: activeStatus === null })}>All</div>
              {STATUS_OPTIONS.map(st => (
                <div key={st} onClick={() => setActiveStatus(activeStatus === st ? null : st)} style={createFilterPillStyle(tokens, { active: activeStatus === st })}>
                  {st.charAt(0).toUpperCase() + st.slice(1)}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Timeline Grid */}
        <div style={{ ...cardBase, padding: 0, overflow: 'hidden' as const }}>
          {/* Hour headers */}
          <div style={{ display: 'flex', borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` }}>
            <div style={{ width: 160, flexShrink: 0, padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, backgroundColor: tokens.colors.neutral[50], fontWeight: tokens.typography.fontWeight.semibold, fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], textTransform: 'uppercase' as const }}>
              STAFF
            </div>
            <div style={{ flex: 1, display: 'flex', position: 'relative' as const }}>
              {TIMELINE_HOURS.map(h => (
                <div key={h} style={{ flex: 1, textAlign: 'center' as const, padding: `${tokens.spacing[2]}px 0`, fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], borderLeft: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`, backgroundColor: tokens.colors.neutral[50] }}>
                  {h.toString().padStart(2, '0')}:00
                </div>
              ))}
            </div>
          </div>

          {/* Staff rows */}
          {staffGroups.map(([name, staffShifts]) => {
            const conflict = hasConflict(staffShifts);
            const hours = getStaffHours(staffShifts);
            const utilPct = Math.min(Math.round((hours / 12) * 100), 100);
            const utilBar = createProgressBarStyle(tokens, { percent: utilPct, color: utilPct > 80 ? tokens.colors.warningScale[500] : tokens.colors.successScale[500] });
            return (
              <div key={name} style={{ display: 'flex', borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`, minHeight: 56, alignItems: 'center' }}>
                <div style={{ width: 160, flexShrink: 0, padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                  <div style={{ width: 30, height: 30, borderRadius: tokens.borderRadius.full, backgroundColor: conflict ? tokens.colors.errorScale[100] : tokens.colors.primaryScale[100], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: conflict ? tokens.colors.errorScale[700] : tokens.colors.primaryScale[700] }}>
                    {name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900], display: 'block', whiteSpace: 'nowrap' as const, overflow: 'hidden' as const, textOverflow: 'ellipsis' as const }}>{name}</Text>
                    <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{hours.toFixed(1)}h</Text>
                      {conflict && <span style={createBadgeStyle(tokens, 'error')}>{'⚠️'} Conflict</span>}
                    </div>
                    <div style={{ ...utilBar.track, height: 3, marginTop: 2 }}><div style={{ ...utilBar.fill, height: '100%' }} /></div>
                  </div>
                </div>
                <div style={{ flex: 1, position: 'relative' as const, height: 40 }}>
                  {TIMELINE_HOURS.map(h => (
                    <div key={h} style={{ position: 'absolute' as const, left: `${((h - 8) / 16) * 100}%`, top: 0, bottom: 0, borderLeft: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }} />
                  ))}
                  {staffShifts.map(s => {
                    const pos = getBlockStyle(s);
                    const isHovered = hoveredBlock === s.id;
                    return (
                      <div
                        key={s.id}
                        onClick={() => onShiftClick?.(s.id)}
                        onMouseEnter={() => setHoveredBlock(s.id)}
                        onMouseLeave={() => setHoveredBlock(null)}
                        style={{
                          position: 'absolute' as const,
                          top: 4,
                          bottom: 4,
                          ...pos,
                          backgroundColor: roleColors[s.role] || tokens.colors.primaryScale[300],
                          borderRadius: tokens.borderRadius.sm,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: tokens.colors.common.white,
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: tokens.typography.fontWeight.medium,
                          opacity: s.status === 'draft' ? 0.6 : s.status === 'completed' ? 0.5 : 1,
                          overflow: 'hidden' as const,
                          whiteSpace: 'nowrap' as const,
                          paddingLeft: tokens.spacing[1],
                          paddingRight: tokens.spacing[1],
                          transition: `transform ${tokens.motion.hover}`,
                          ...(isHovered ? { transform: 'scaleY(1.15)', zIndex: 2 } : {}),
                        }}
                      >
                        {s.role}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {staffGroups.length === 0 && (
          <div style={{ textAlign: 'center' as const, padding: tokens.spacing[10], color: tokens.colors.neutral[400] }}>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], display: 'block', marginBottom: tokens.spacing[2] }}>{'⏱️'}</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.neutral[500], display: 'block' }}>No staff match your filters</Text>
          </div>
        )}

        {/* Legend */}
        <div style={{ ...cardBase, marginTop: tokens.spacing[3], padding: tokens.spacing[3], display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' as const }}>
          <div style={{ display: 'flex', gap: tokens.spacing[3], flexWrap: 'wrap' as const, alignItems: 'center' }}>
            {Object.entries(roleColors).map(([role, color]) => (
              <div key={role} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: color }} />
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>{role}</Text>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: tokens.spacing[3] }}>
            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{'·'} Dimmed = Draft/Completed</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.errorScale[500] }}>{'·'} {'⚠️'} = Overlap conflict</Text>
          </div>
        </div>
      </Box>
    );
  },
});
