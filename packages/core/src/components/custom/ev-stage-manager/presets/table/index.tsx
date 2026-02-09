'use client';

/**
 * EvStageManager - Table Preset
 * Data table with all stage info, capacity progress bars, schedule slots per stage,
 * status toggles, technical specs, and action buttons
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createHoverStyle,
  createBadgeStyle,
  createFilterPillStyle,
  createProgressBarStyle,
} from '../../../helpers';
import type { EvStageManagerProps, StageConfig, StageSchedule } from '../../core';

const MOCK_STAGES: StageConfig[] = [
  { id: 'stg1', name: 'Main Stage', zoneName: 'Zone A - Central', capacity: 3000, dimensions: '40m x 25m', technicalSpecs: 'L-Acoustics K2 | GrandMA3 | 120kW', isActive: true, currentAct: 'DJ Nova', nextAct: 'The Velvet Band' },
  { id: 'stg2', name: 'Side Stage', zoneName: 'Zone B - East Wing', capacity: 1000, dimensions: '20m x 15m', technicalSpecs: 'd&b V-Series | ChamSys | 60kW', isActive: true, currentAct: 'Aurora Beats', nextAct: 'MC Flux' },
  { id: 'stg3', name: 'DJ Booth', zoneName: 'Zone C - Lounge', capacity: 500, dimensions: '12m x 8m', technicalSpecs: 'Funktion-One | Pioneer DJ | 30kW', isActive: true, currentAct: 'Rhythm Collective', nextAct: 'DJ Nova' },
];

const MOCK_SCHEDULES: StageSchedule[] = [
  { stageId: 'stg1', slots: [
    { time: '18:00', artistName: 'DJ Nova', duration: 90 },
    { time: '19:30', artistName: 'The Velvet Band', duration: 90 },
    { time: '21:00', artistName: 'Soulfire', duration: 120 },
  ]},
  { stageId: 'stg2', slots: [
    { time: '18:00', artistName: 'Aurora Beats', duration: 120 },
    { time: '20:00', artistName: 'MC Flux', duration: 90 },
    { time: '21:30', artistName: 'Guest DJ', duration: 90 },
  ]},
  { stageId: 'stg3', slots: [
    { time: '18:00', artistName: 'Rhythm Collective', duration: 120 },
    { time: '21:00', artistName: 'DJ Nova', duration: 120 },
  ]},
];

const MOCK_ATTENDANCE: Record<string, number> = {
  stg1: 2340,
  stg2: 780,
  stg3: 420,
};

type SortKey = 'name' | 'zoneName' | 'capacity' | 'attendance';

export const TableEvStageManager = createPreset<EvStageManagerProps>({
  name: 'EvStageManager.Table',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvStageManagerProps>) => {
    const { Box, Text } = primitives;
    const { stages: propStages, schedules: propSchedules, onStageClick, onEditStage, className, style } = props;

    const stages = propStages && propStages.length > 0 ? propStages : MOCK_STAGES;
    const schedules = propSchedules && propSchedules.length > 0 ? propSchedules : MOCK_SCHEDULES;

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [sortKey, setSortKey] = useState<SortKey>('name');
    const [sortAsc, setSortAsc] = useState(true);
    const [expandedStage, setExpandedStage] = useState<string | null>(null);
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const filtered = useMemo(() => {
      let result = stages.filter(s => {
        if (searchTerm && !s.name.toLowerCase().includes(searchTerm.toLowerCase()) && !s.zoneName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        if (statusFilter === 'active' && !s.isActive) return false;
        if (statusFilter === 'inactive' && s.isActive) return false;
        return true;
      });
      result.sort((a, b) => {
        let cmp = 0;
        if (sortKey === 'name') cmp = a.name.localeCompare(b.name);
        else if (sortKey === 'zoneName') cmp = a.zoneName.localeCompare(b.zoneName);
        else if (sortKey === 'capacity') cmp = a.capacity - b.capacity;
        else if (sortKey === 'attendance') cmp = (MOCK_ATTENDANCE[a.id] || 0) - (MOCK_ATTENDANCE[b.id] || 0);
        return sortAsc ? cmp : -cmp;
      });
      return result;
    }, [stages, searchTerm, statusFilter, sortKey, sortAsc]);

    const handleSort = (key: SortKey) => {
      if (sortKey === key) setSortAsc(!sortAsc);
      else { setSortKey(key); setSortAsc(true); }
    };

    const sortIcon = (key: SortKey) => sortKey === key ? (sortAsc ? ' \u25B2' : ' \u25BC') : '';

    const totalCapacity = stages.reduce((s, st) => s + st.capacity, 0);
    const totalAttendance = Object.values(MOCK_ATTENDANCE).reduce((s, v) => s + v, 0);
    const activeStages = stages.filter(s => s.isActive).length;
    const totalSlots = schedules.reduce((s, sc) => s + sc.slots.length, 0);

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[6], ...style }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[5] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[1] }}>{'\uD83C\uDFAA'} Stage Manager</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>{filtered.length} of {stages.length} stages | {totalSlots} scheduled acts</Text>
          </div>
          <div style={{ display: 'flex', gap: tokens.spacing[2] }}>
            <span style={createBadgeStyle(tokens, 'success')}>{'\uD83D\uDD34'} {activeStages} Live</span>
            <div style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, cursor: 'pointer', ...hoverStyle }}>+ Add Stage</div>
          </div>
        </div>

        {/* Stats bar */}
        <div style={{ ...cardBase, marginBottom: tokens.spacing[4], display: 'flex', gap: tokens.spacing[4] }}>
          {[
            { label: 'Total Stages', value: stages.length, emoji: '\uD83C\uDFAA', color: tokens.colors.primaryScale[600] },
            { label: 'Active', value: activeStages, emoji: '\u2705', color: tokens.colors.successScale[600] },
            { label: 'Capacity', value: totalCapacity.toLocaleString(), emoji: '\uD83D\uDC65', color: tokens.colors.infoScale[600] },
            { label: 'Attendance', value: totalAttendance.toLocaleString(), emoji: '\uD83D\uDCCA', color: tokens.colors.warningScale[600] },
            { label: 'Scheduled Acts', value: totalSlots, emoji: '\uD83C\uDFB5', color: tokens.colors.primaryScale[600] },
          ].map((stat, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center' as const, padding: tokens.spacing[2], borderRadius: tokens.borderRadius.md, backgroundColor: tokens.colors.neutral[50] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, display: 'block' }}>{stat.emoji}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: stat.color, display: 'block' }}>{stat.value}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{stat.label}</Text>
            </div>
          ))}
        </div>

        {/* Search and filters */}
        <div style={{ ...cardBase, marginBottom: tokens.spacing[4], padding: tokens.spacing[4] }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[4], flexWrap: 'wrap' as const }}>
            <div style={{ flex: 1, minWidth: 200, position: 'relative' as const }}>
              <div style={{ position: 'absolute' as const, left: tokens.spacing[3], top: '50%', transform: 'translateY(-50%)', fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>{'\uD83D\uDD0D'}</div>
              <input type="text" placeholder="Search stages or zones..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px ${tokens.spacing[2]}px ${tokens.spacing[8]}px`, borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[900], backgroundColor: tokens.colors.common.white, outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', gap: tokens.spacing[2] }}>
              {[
                { key: 'all' as const, label: 'All Stages' },
                { key: 'active' as const, label: '\u2705 Active' },
                { key: 'inactive' as const, label: '\u23F8\uFE0F Inactive' },
              ].map(f => (
                <div key={f.key} onClick={() => setStatusFilter(f.key)} style={createFilterPillStyle(tokens, { active: statusFilter === f.key })}>{f.label}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div style={{ ...cardBase, padding: 0, overflow: 'hidden' as const }}>
          {/* Table header */}
          <div style={{ display: 'flex', alignItems: 'center', padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, backgroundColor: tokens.colors.neutral[50], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` }}>
            <div style={{ width: 30 }} />
            <div onClick={() => handleSort('name')} style={{ flex: 2, cursor: 'pointer', ...hoverStyle }}>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>Stage{sortIcon('name')}</Text>
            </div>
            <div onClick={() => handleSort('zoneName')} style={{ flex: 1.5, cursor: 'pointer', ...hoverStyle }}>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>Zone{sortIcon('zoneName')}</Text>
            </div>
            <div onClick={() => handleSort('capacity')} style={{ width: 160, cursor: 'pointer', ...hoverStyle }}>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>Capacity{sortIcon('capacity')}</Text>
            </div>
            <div onClick={() => handleSort('attendance')} style={{ width: 100, cursor: 'pointer', textAlign: 'center' as const, ...hoverStyle }}>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>Attend.{sortIcon('attendance')}</Text>
            </div>
            <div style={{ width: 110, textAlign: 'center' as const }}>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>Now Playing</Text>
            </div>
            <div style={{ width: 80, textAlign: 'center' as const }}>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>Status</Text>
            </div>
            <div style={{ width: 100, textAlign: 'center' as const }}>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>Actions</Text>
            </div>
          </div>

          {/* Table rows */}
          {filtered.map((stage, idx) => {
            const isHovered = hoveredRow === stage.id;
            const isExpanded = expandedStage === stage.id;
            const attendance = MOCK_ATTENDANCE[stage.id] || 0;
            const capPct = Math.round((attendance / stage.capacity) * 100);
            const schedule = schedules.find(s => s.stageId === stage.id);
            const bar = createProgressBarStyle(tokens, {
              percent: capPct,
              color: capPct > 90 ? tokens.colors.errorScale[500] : capPct > 70 ? tokens.colors.warningScale[500] : tokens.colors.successScale[500],
            });

            return (
              <div key={stage.id}>
                <div
                  onClick={() => { setExpandedStage(isExpanded ? null : stage.id); onStageClick?.(stage.id); }}
                  onMouseEnter={() => setHoveredRow(stage.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                    borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                    backgroundColor: isExpanded ? tokens.colors.primaryScale[50] : isHovered ? tokens.colors.neutral[50] : tokens.colors.common.white,
                    cursor: 'pointer',
                    transition: 'background-color 0.15s',
                  }}
                >
                  {/* Expand icon */}
                  <div style={{ width: 30 }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s', display: 'inline-block' }}>{'\u25B6'}</Text>
                  </div>

                  {/* Stage name */}
                  <div style={{ flex: 2 }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>{stage.name}</Text>
                  </div>

                  {/* Zone */}
                  <div style={{ flex: 1.5 }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>{'\uD83D\uDCCD'} {stage.zoneName}</Text>
                  </div>

                  {/* Capacity with progress bar */}
                  <div style={{ width: 160 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>{attendance.toLocaleString()}/{stage.capacity.toLocaleString()}</Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: capPct > 90 ? tokens.colors.errorScale[600] : capPct > 70 ? tokens.colors.warningScale[600] : tokens.colors.successScale[600] }}>{capPct}%</Text>
                    </div>
                    <div style={bar.track}><div style={bar.fill} /></div>
                  </div>

                  {/* Attendance */}
                  <div style={{ width: 100, textAlign: 'center' as const }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>{attendance.toLocaleString()}</Text>
                  </div>

                  {/* Now Playing */}
                  <div style={{ width: 110, textAlign: 'center' as const }}>
                    {stage.currentAct ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: tokens.spacing[1] }}>
                        <div style={{ width: 6, height: 6, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.errorScale[500] }} />
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900] }}>{stage.currentAct}</Text>
                      </div>
                    ) : (
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>--</Text>
                    )}
                  </div>

                  {/* Status */}
                  <div style={{ width: 80, textAlign: 'center' as const }}>
                    <span style={createBadgeStyle(tokens, stage.isActive ? 'success' : 'secondary')}>{stage.isActive ? '\u2705 Active' : '\u23F8\uFE0F Off'}</span>
                  </div>

                  {/* Actions */}
                  <div style={{ width: 100, textAlign: 'center' as const, display: 'flex', gap: tokens.spacing[1], justifyContent: 'center' }}>
                    <div onClick={(e) => { e.stopPropagation(); onEditStage?.(stage.id); }} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, backgroundColor: tokens.colors.neutral[100], color: tokens.colors.neutral[700], borderRadius: tokens.borderRadius.sm, fontSize: tokens.typography.fontSize.xs, cursor: 'pointer', ...hoverStyle }}>{'\u270F\uFE0F'}</div>
                    <div onClick={(e) => { e.stopPropagation(); }} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, backgroundColor: tokens.colors.neutral[100], color: tokens.colors.neutral[700], borderRadius: tokens.borderRadius.sm, fontSize: tokens.typography.fontSize.xs, cursor: 'pointer', ...hoverStyle }}>{'\uD83D\uDCC5'}</div>
                  </div>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div style={{ padding: `${tokens.spacing[4]}px ${tokens.spacing[6]}px`, backgroundColor: tokens.colors.neutral[50], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: tokens.spacing[5] }}>
                      {/* Technical specs */}
                      <div>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase' as const, letterSpacing: '0.05em', display: 'block', marginBottom: tokens.spacing[2] }}>{'\uD83D\uDD27'} Technical Specs</Text>
                        <div style={{ ...cardBase, padding: tokens.spacing[3] }}>
                          {stage.dimensions && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[1] }}>
                              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Dimensions</Text>
                              <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900] }}>{stage.dimensions}</Text>
                            </div>
                          )}
                          {stage.technicalSpecs && stage.technicalSpecs.split(' | ').map((spec, si) => (
                            <div key={si} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: si < stage.technicalSpecs!.split(' | ').length - 1 ? tokens.spacing[1] : 0 }}>
                              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{si === 0 ? 'Sound' : si === 1 ? 'Lighting' : 'Power'}</Text>
                              <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900] }}>{spec}</Text>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Schedule */}
                      <div>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase' as const, letterSpacing: '0.05em', display: 'block', marginBottom: tokens.spacing[2] }}>{'\uD83D\uDCC5'} Schedule ({schedule?.slots.length || 0} acts)</Text>
                        <div style={{ ...cardBase, padding: 0, overflow: 'hidden' as const }}>
                          {schedule?.slots.map((slot, si) => {
                            const isCurrent = stage.currentAct === slot.artistName;
                            return (
                              <div key={si} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderBottom: si < (schedule?.slots.length || 0) - 1 ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` : 'none', backgroundColor: isCurrent ? tokens.colors.successScale[50] : tokens.colors.common.white }}>
                                <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[600], minWidth: 45 }}>{slot.time}</Text>
                                <div style={{ flex: 1 }}>
                                  <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900] }}>{slot.artistName}</Text>
                                </div>
                                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{slot.duration}m</Text>
                                {isCurrent && (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <div style={{ width: 6, height: 6, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.errorScale[500] }} />
                                    <Text style={{ fontSize: 10, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.successScale[700] }}>LIVE</Text>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Quick info */}
                      <div>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase' as const, letterSpacing: '0.05em', display: 'block', marginBottom: tokens.spacing[2] }}>{'\uD83D\uDCCA'} Quick Info</Text>
                        <div style={{ ...cardBase, padding: tokens.spacing[3] }}>
                          {[
                            { label: 'Next Up', value: stage.nextAct || 'N/A', emoji: '\u23ED\uFE0F' },
                            { label: 'Remaining Capacity', value: `${(stage.capacity - attendance).toLocaleString()} seats`, emoji: '\uD83D\uDC65' },
                            { label: 'Utilization', value: `${capPct}%`, emoji: '\uD83D\uDCC8' },
                            { label: 'Total Acts Today', value: `${schedule?.slots.length || 0}`, emoji: '\uD83C\uDFB5' },
                          ].map((item, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: i < 3 ? tokens.spacing[2] : 0, paddingBottom: i < 3 ? tokens.spacing[2] : 0, borderBottom: i < 3 ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` : 'none' }}>
                              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{item.emoji} {item.label}</Text>
                              <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>{item.value}</Text>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Summary footer */}
          <div style={{ display: 'flex', alignItems: 'center', padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, backgroundColor: tokens.colors.neutral[50], borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` }}>
            <div style={{ width: 30 }} />
            <div style={{ flex: 2 }}>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[600] }}>{filtered.length} stage{filtered.length !== 1 ? 's' : ''}</Text>
            </div>
            <div style={{ flex: 1.5 }} />
            <div style={{ width: 160 }}>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Total: {totalCapacity.toLocaleString()}</Text>
            </div>
            <div style={{ width: 100, textAlign: 'center' as const }}>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[600] }}>{totalAttendance.toLocaleString()}</Text>
            </div>
            <div style={{ width: 110 }} />
            <div style={{ width: 80 }} />
            <div style={{ width: 100 }} />
          </div>
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center' as const, padding: tokens.spacing[10], color: tokens.colors.neutral[400] }}>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], display: 'block', marginBottom: tokens.spacing[2] }}>{'\uD83C\uDFAA'}</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.neutral[500], display: 'block' }}>No stages match your criteria</Text>
          </div>
        )}
      </Box>
    );
  },
});
