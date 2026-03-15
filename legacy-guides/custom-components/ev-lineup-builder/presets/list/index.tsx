'use client';

/**
 * EvLineupBuilder - List Preset
 * Sortable artist list grouped by stage, with search, filter pills, status badges, schedule details
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
import type { EvLineupBuilderProps, ArtistSlot, StageTrack } from '../../core';

const MOCK_STAGES: StageTrack[] = [
  { id: 's1', name: 'Main Stage', color: '#667eea' },
  { id: 's2', name: 'Side Stage', color: '#43e97b' },
  { id: 's3', name: 'Lounge', color: '#fa709a' },
];

const MOCK_SLOTS: ArtistSlot[] = [
  { id: 'sl1', artistName: 'DJ Nova', genre: 'Electronic', startTime: new Date('2026-03-15T18:00'), endTime: new Date('2026-03-15T20:00'), stageId: 's1', stageName: 'Main Stage', status: 'confirmed' },
  { id: 'sl2', artistName: 'Aurora Beats', genre: 'House', startTime: new Date('2026-03-15T20:00'), endTime: new Date('2026-03-15T22:00'), stageId: 's1', stageName: 'Main Stage', status: 'confirmed' },
  { id: 'sl3', artistName: 'The Velvet Band', genre: 'Indie', startTime: new Date('2026-03-15T22:00'), endTime: new Date('2026-03-16T00:00'), stageId: 's1', stageName: 'Main Stage', status: 'pending' },
  { id: 'sl4', artistName: 'Sonic Drift', genre: 'Techno', startTime: new Date('2026-03-15T18:00'), endTime: new Date('2026-03-15T19:30'), stageId: 's2', stageName: 'Side Stage', status: 'confirmed' },
  { id: 'sl5', artistName: 'Luna Wave', genre: 'Ambient', startTime: new Date('2026-03-15T19:30'), endTime: new Date('2026-03-15T21:00'), stageId: 's2', stageName: 'Side Stage', status: 'confirmed' },
  { id: 'sl6', artistName: 'Bass Horizon', genre: 'Drum & Bass', startTime: new Date('2026-03-15T21:00'), endTime: new Date('2026-03-15T23:00'), stageId: 's2', stageName: 'Side Stage', status: 'pending' },
  { id: 'sl7', artistName: 'Mellow Keys', genre: 'Jazz', startTime: new Date('2026-03-15T18:00'), endTime: new Date('2026-03-15T20:30'), stageId: 's3', stageName: 'Lounge', status: 'confirmed' },
  { id: 'sl8', artistName: 'Vinyl Dreams', genre: 'Lo-fi', startTime: new Date('2026-03-15T20:30'), endTime: new Date('2026-03-15T23:00'), stageId: 's3', stageName: 'Lounge', status: 'cancelled' },
  { id: 'sl9', artistName: 'Neon Pulse', genre: 'Synthwave', startTime: new Date('2026-03-15T23:00'), endTime: new Date('2026-03-16T01:00'), stageId: 's2', stageName: 'Side Stage', status: 'confirmed' },
];

export const ListEvLineupBuilder = createPreset<EvLineupBuilderProps>({
  name: 'EvLineupBuilder.List',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvLineupBuilderProps>) => {
    const { Box, Text } = primitives;
    const { slots: propSlots, stages: propStages, onSlotClick, className, style } = props;

    const slots = propSlots?.length ? propSlots : MOCK_SLOTS;
    const stages = propStages?.length ? propStages : MOCK_STAGES;

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [hoveredSlot, setHoveredSlot] = useState<string | null>(null);

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const filteredSlots = useMemo(() => {
      return slots.filter(s => {
        if (searchTerm && !s.artistName.toLowerCase().includes(searchTerm.toLowerCase()) && !s.genre.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        if (statusFilter && s.status !== statusFilter) return false;
        return true;
      }).sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    }, [slots, searchTerm, statusFilter]);

    const statusConfig: Record<string, { color: 'success' | 'warning' | 'error'; label: string; icon: string }> = {
      confirmed: { color: 'success', label: 'Confirmed', icon: '✅' },
      pending: { color: 'warning', label: 'Pending', icon: '⏳' },
      cancelled: { color: 'error', label: 'Cancelled', icon: '❌' },
    };

    const formatTime = (d: Date) => {
      const h = d.getHours();
      const m = d.getMinutes();
      const ampm = h >= 12 ? 'PM' : 'AM';
      const hr = h > 12 ? h - 12 : h === 0 ? 12 : h;
      return `${hr}:${m.toString().padStart(2, '0')} ${ampm}`;
    };

    const getDuration = (start: Date, end: Date) => {
      const mins = (end.getTime() - start.getTime()) / 60000;
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return h > 0 ? `${h}h ${m > 0 ? `${m}m` : ''}` : `${m}m`;
    };

    const groupedByStage = useMemo(() => {
      const groups: Record<string, ArtistSlot[]> = {};
      stages.forEach(st => { groups[st.id] = []; });
      filteredSlots.forEach(s => {
        if (groups[s.stageId]) groups[s.stageId].push(s);
      });
      return groups;
    }, [filteredSlots, stages]);

    const statuses = ['confirmed', 'pending', 'cancelled'];

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[5], ...style }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[5] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[1] }}>
              Lineup List
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
              {filteredSlots.length} artist{filteredSlots.length !== 1 ? 's' : ''} scheduled
            </Text>
          </div>
          <div style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, cursor: 'pointer', ...hoverStyle }}>+ Add Artist</div>
        </div>

        {/* Search & Filters */}
        <div style={{ ...cardBase, marginBottom: tokens.spacing[5], padding: tokens.spacing[4] }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[4], flexWrap: 'wrap' as const }}>
            <div style={{ flex: 1, minWidth: 200, position: 'relative' as const }}>
              <div style={{ position: 'absolute' as const, left: tokens.spacing[3], top: '50%', transform: 'translateY(-50%)', fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>🔍</div>
              <input type="text" placeholder="Search artist or genre..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px ${tokens.spacing[2]}px ${tokens.spacing[8]}px`, borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[900], backgroundColor: tokens.colors.common.white, outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', gap: tokens.spacing[2], flexWrap: 'wrap' as const }}>
              <div onClick={() => setStatusFilter(null)} style={createFilterPillStyle(tokens, { active: statusFilter === null })}>All</div>
              {statuses.map(st => (
                <div key={st} onClick={() => setStatusFilter(statusFilter === st ? null : st)} style={createFilterPillStyle(tokens, { active: statusFilter === st })}>
                  {statusConfig[st].icon} {statusConfig[st].label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Grouped by Stage */}
        {stages.map((stage) => {
          const stageSlots = groupedByStage[stage.id] || [];
          if (stageSlots.length === 0 && (searchTerm || statusFilter)) return null;
          return (
            <div key={stage.id} style={{ marginBottom: tokens.spacing[5] }}>
              {/* Stage header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[3] }}>
                <span style={{ width: 12, height: 12, borderRadius: tokens.borderRadius.full, backgroundColor: stage.color }} />
                <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>{stage.name}</Text>
                <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>({stageSlots.length} acts)</span>
              </div>

              {/* Slot list */}
              <div style={cardBase}>
                {stageSlots.length === 0 ? (
                  <div style={{ padding: tokens.spacing[4], textAlign: 'center' as const }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>No acts scheduled</Text>
                  </div>
                ) : stageSlots.map((slot, idx) => {
                  const sc = statusConfig[slot.status];
                  const isHovered = hoveredSlot === slot.id;
                  return (
                    <div key={slot.id} onClick={() => onSlotClick?.(slot.id)} onMouseEnter={() => setHoveredSlot(slot.id)} onMouseLeave={() => setHoveredSlot(null)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: tokens.spacing[3],
                        padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                        borderBottom: idx < stageSlots.length - 1 ? `1px solid ${tokens.colors.neutral[100]}` : 'none',
                        backgroundColor: isHovered ? tokens.colors.primaryScale[50] : 'transparent',
                        cursor: 'pointer', transition: `background ${tokens.motion.hover}`,
                      }}
                    >
                      {/* Time block */}
                      <div style={{ width: 80, flexShrink: 0, textAlign: 'center' as const }}>
                        <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.primaryScale[700], display: 'block' }}>{formatTime(slot.startTime)}</Text>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{formatTime(slot.endTime)}</Text>
                      </div>
                      {/* Divider */}
                      <div style={{ width: 2, height: 36, backgroundColor: stage.color, borderRadius: tokens.borderRadius.full, flexShrink: 0 }} />
                      {/* Artist info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block' }}>{slot.artistName}</Text>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{slot.genre} | {getDuration(slot.startTime, slot.endTime)}</Text>
                      </div>
                      {/* Status badge */}
                      <span style={createBadgeStyle(tokens, sc.color)}>{sc.icon} {sc.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Empty state */}
        {filteredSlots.length === 0 && (
          <div style={{ textAlign: 'center' as const, padding: tokens.spacing[10], color: tokens.colors.neutral[400] }}>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], display: 'block', marginBottom: tokens.spacing[2] }}>🎤</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.neutral[500], display: 'block' }}>No artists match your filters</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>Try adjusting your search or filter criteria</Text>
          </div>
        )}

        {/* Summary bar */}
        <div style={{ ...cardBase, marginTop: tokens.spacing[5], display: 'flex', justifyContent: 'space-around', padding: tokens.spacing[3] }}>
          {stages.map((st) => {
            const count = slots.filter(s => s.stageId === st.id && s.status !== 'cancelled').length;
            return (
              <div key={st.id} style={{ textAlign: 'center' as const }}>
                <span style={{ width: 10, height: 10, borderRadius: tokens.borderRadius.full, backgroundColor: st.color, display: 'inline-block', marginBottom: tokens.spacing[1] }} />
                <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>{count}</Text>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{st.name}</Text>
              </div>
            );
          })}
        </div>
      </Box>
    );
  },
});
