'use client';

/**
 * EvLineupBuilder - Timeline Preset
 * Visual timeline grid showing artist slots across stages with time axis, conflict warnings, summary stats
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

const MOCK_CONFLICTS = [
  { slotAId: 'sl6', slotBId: 'sl9', message: 'Bass Horizon and Neon Pulse overlap on Side Stage' },
];

const TIME_HOURS = [18, 19, 20, 21, 22, 23, 0, 1];

export const TimelineEvLineupBuilder = createPreset<EvLineupBuilderProps>({
  name: 'EvLineupBuilder.Timeline',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvLineupBuilderProps>) => {
    const { Box, Text } = primitives;
    const { slots: propSlots, stages: propStages, conflicts: propConflicts, onSlotClick, className, style } = props;

    const slots = propSlots?.length ? propSlots : MOCK_SLOTS;
    const stages = propStages?.length ? propStages : MOCK_STAGES;
    const conflicts = propConflicts?.length ? propConflicts : MOCK_CONFLICTS;

    const [selectedStage, setSelectedStage] = useState<string | null>(null);
    const [hoveredSlot, setHoveredSlot] = useState<string | null>(null);

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const filteredSlots = useMemo(() => {
      if (!selectedStage) return slots;
      return slots.filter(s => s.stageId === selectedStage);
    }, [slots, selectedStage]);

    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
      confirmed: { bg: tokens.colors.successScale[100], text: tokens.colors.successScale[700], label: 'Confirmed' },
      pending: { bg: tokens.colors.warningScale[100], text: tokens.colors.warningScale[700], label: 'Pending' },
      cancelled: { bg: tokens.colors.errorScale[100], text: tokens.colors.errorScale[700], label: 'Cancelled' },
    };

    const getSlotPosition = (slot: ArtistSlot) => {
      const startHour = slot.startTime.getHours() + slot.startTime.getMinutes() / 60;
      const endHour = slot.endTime.getHours() + slot.endTime.getMinutes() / 60;
      const adjustedStart = startHour >= 18 ? startHour - 18 : startHour + 6;
      const adjustedEnd = endHour >= 18 ? endHour - 18 : endHour + 6;
      const totalHours = 8;
      return { left: `${(adjustedStart / totalHours) * 100}%`, width: `${((adjustedEnd - adjustedStart) / totalHours) * 100}%` };
    };

    const confirmedCount = slots.filter(s => s.status === 'confirmed').length;
    const pendingCount = slots.filter(s => s.status === 'pending').length;
    const cancelledCount = slots.filter(s => s.status === 'cancelled').length;
    const totalMinutes = slots.filter(s => s.status !== 'cancelled').reduce((sum, s) => {
      return sum + (s.endTime.getTime() - s.startTime.getTime()) / 60000;
    }, 0);

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[6], ...style }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[5] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[1] }}>
              Lineup Timeline
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
              {slots.length} artist slots across {stages.length} stages
            </Text>
          </div>
          <div style={{ display: 'flex', gap: tokens.spacing[2] }}>
            <div onClick={() => setSelectedStage(null)} style={createFilterPillStyle(tokens, { active: selectedStage === null })}>All Stages</div>
            {stages.map(st => (
              <div key={st.id} onClick={() => setSelectedStage(selectedStage === st.id ? null : st.id)} style={{ ...createFilterPillStyle(tokens, { active: selectedStage === st.id }), display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                <span style={{ width: 8, height: 8, borderRadius: tokens.borderRadius.full, backgroundColor: st.color }} />
                {st.name}
              </div>
            ))}
          </div>
        </div>

        {/* Conflict Warnings */}
        {conflicts.length > 0 && (
          <div style={{ ...cardBase, marginBottom: tokens.spacing[4], padding: tokens.spacing[3], backgroundColor: tokens.colors.errorScale[50], borderLeft: `3px solid ${tokens.colors.errorScale[500]}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.sm }}>⚠️</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.errorScale[700] }}>
                {conflicts.length} conflict{conflicts.length !== 1 ? 's' : ''} detected
              </Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.errorScale[600] }}>
                - {conflicts[0].message}
              </Text>
            </div>
          </div>
        )}

        {/* Timeline Grid */}
        <div style={{ ...cardBase, marginBottom: tokens.spacing[5], padding: 0, overflow: 'hidden' as const }}>
          {/* Time header */}
          <div style={{ display: 'flex', borderBottom: `1px solid ${tokens.colors.neutral[200]}` }}>
            <div style={{ width: 120, flexShrink: 0, padding: tokens.spacing[3], borderRight: `1px solid ${tokens.colors.neutral[200]}`, backgroundColor: tokens.colors.neutral[50] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase' as const }}>Stage</Text>
            </div>
            <div style={{ flex: 1, display: 'flex' }}>
              {TIME_HOURS.map((h, i) => (
                <div key={i} style={{ flex: 1, padding: `${tokens.spacing[2]}px 0`, textAlign: 'center' as const, borderRight: i < TIME_HOURS.length - 1 ? `1px solid ${tokens.colors.neutral[100]}` : 'none', backgroundColor: tokens.colors.neutral[50] }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500] }}>
                    {h === 0 ? '12AM' : h > 12 ? `${h - 12}PM` : `${h}AM`}
                  </Text>
                </div>
              ))}
            </div>
          </div>

          {/* Stage rows */}
          {stages.filter(st => !selectedStage || st.id === selectedStage).map((stage, stIdx) => {
            const stageSlots = filteredSlots.filter(s => s.stageId === stage.id);
            return (
              <div key={stage.id} style={{ display: 'flex', borderBottom: stIdx < stages.length - 1 ? `1px solid ${tokens.colors.neutral[200]}` : 'none', minHeight: 72 }}>
                {/* Stage label */}
                <div style={{ width: 120, flexShrink: 0, padding: tokens.spacing[3], borderRight: `1px solid ${tokens.colors.neutral[200]}`, display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                  <span style={{ width: 10, height: 10, borderRadius: tokens.borderRadius.full, backgroundColor: stage.color, flexShrink: 0 }} />
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>{stage.name}</Text>
                </div>
                {/* Slots area */}
                <div style={{ flex: 1, position: 'relative' as const, padding: `${tokens.spacing[2]}px 0` }}>
                  {/* Grid lines */}
                  {TIME_HOURS.map((_, i) => (
                    <div key={i} style={{ position: 'absolute' as const, left: `${(i / TIME_HOURS.length) * 100}%`, top: 0, bottom: 0, width: 1, backgroundColor: tokens.colors.neutral[100] }} />
                  ))}
                  {/* Slot blocks */}
                  {stageSlots.map((slot) => {
                    const pos = getSlotPosition(slot);
                    const isHovered = hoveredSlot === slot.id;
                    const isCancelled = slot.status === 'cancelled';
                    return (
                      <div key={slot.id} onClick={() => onSlotClick?.(slot.id)} onMouseEnter={() => setHoveredSlot(slot.id)} onMouseLeave={() => setHoveredSlot(null)}
                        style={{
                          position: 'absolute' as const, left: pos.left, width: pos.width,
                          top: tokens.spacing[1], bottom: tokens.spacing[1],
                          backgroundColor: isCancelled ? tokens.colors.neutral[100] : `${stage.color}20`,
                          border: `1px solid ${isCancelled ? tokens.colors.neutral[300] : stage.color}`,
                          borderRadius: tokens.borderRadius.md, cursor: 'pointer',
                          padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                          opacity: isCancelled ? 0.5 : 1,
                          transform: isHovered ? 'scale(1.02)' : 'scale(1)',
                          transition: `transform ${tokens.motion.hover}`, zIndex: isHovered ? 5 : 1,
                          overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center',
                          textDecoration: isCancelled ? 'line-through' : 'none',
                        }}
                      >
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{slot.artistName}</Text>
                        <Text style={{ fontSize: 10, color: tokens.colors.neutral[500], overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{slot.genre}</Text>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Stats */}
        <div style={{ ...cardBase, display: 'flex', justifyContent: 'space-around', padding: tokens.spacing[3] }}>
          {[
            { label: 'Total Slots', value: slots.length.toString(), icon: '🎤' },
            { label: 'Confirmed', value: confirmedCount.toString(), icon: '✅' },
            { label: 'Pending', value: pendingCount.toString(), icon: '⏳' },
            { label: 'Cancelled', value: cancelledCount.toString(), icon: '❌' },
            { label: 'Total Hours', value: `${Math.round(totalMinutes / 60)}h`, icon: '⏱️' },
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: 'center' as const }}>
              <Text style={{ fontSize: tokens.typography.fontSize.lg, display: 'block' }}>{stat.icon}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>{stat.value}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{stat.label}</Text>
            </div>
          ))}
        </div>
      </Box>
    );
  },
});
