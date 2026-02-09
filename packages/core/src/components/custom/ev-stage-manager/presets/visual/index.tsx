'use client';

/**
 * EvStageManager - Visual Preset
 * Large stage cards with name, zone, capacity gauge, current act with LIVE badge,
 * next act with time, technical specs, active/inactive toggle
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createHoverStyle,
  createBadgeStyle,
  createProgressBarStyle,
  getHoverTransform,
} from '../../../helpers';
import type { EvStageManagerProps, StageConfig, StageSchedule } from '../../core';

const MOCK_STAGES: StageConfig[] = [
  { id: 'stg1', name: 'Main Stage', zoneName: 'Zone A - Central', capacity: 3000, dimensions: '40m x 25m', technicalSpecs: 'L-Acoustics K2 | GrandMA3 | 120kW Power', isActive: true, currentAct: 'DJ Nova', nextAct: 'The Velvet Band' },
  { id: 'stg2', name: 'Side Stage', zoneName: 'Zone B - East Wing', capacity: 1000, dimensions: '20m x 15m', technicalSpecs: 'd&b V-Series | ChamSys | 60kW Power', isActive: true, currentAct: 'Aurora Beats', nextAct: 'MC Flux' },
  { id: 'stg3', name: 'DJ Booth', zoneName: 'Zone C - Lounge', capacity: 500, dimensions: '12m x 8m', technicalSpecs: 'Funktion-One | Pioneer DJ | 30kW Power', isActive: true, currentAct: 'Rhythm Collective', nextAct: 'DJ Nova' },
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

const STAGE_GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
];

const MOCK_ATTENDANCE: Record<string, number> = {
  stg1: 2340,
  stg2: 780,
  stg3: 420,
};

export const VisualEvStageManager = createPreset<EvStageManagerProps>({
  name: 'EvStageManager.Visual',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvStageManagerProps>) => {
    const { Box, Text } = primitives;
    const { stages: propStages, schedules: propSchedules, onStageClick, onEditStage, className, style } = props;

    const stages = propStages && propStages.length > 0 ? propStages : MOCK_STAGES;
    const schedules = propSchedules && propSchedules.length > 0 ? propSchedules : MOCK_SCHEDULES;

    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    const [selectedStage, setSelectedStage] = useState<string | null>(null);

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const totalCapacity = stages.reduce((s, st) => s + st.capacity, 0);
    const totalAttendance = Object.values(MOCK_ATTENDANCE).reduce((s, v) => s + v, 0);
    const activeStages = stages.filter(s => s.isActive).length;

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[6], ...style }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[5] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[1] }}>{'\uD83C\uDFAA'} Stage Manager</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>{stages.length} stages | {activeStages} active | {totalCapacity.toLocaleString()} total capacity</Text>
          </div>
          <div style={{ display: 'flex', gap: tokens.spacing[2] }}>
            <span style={createBadgeStyle(tokens, 'success')}>{'\uD83D\uDD34'} {activeStages} Live</span>
            <div style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, cursor: 'pointer', ...hoverStyle }}>+ Add Stage</div>
          </div>
        </div>

        {/* Overview stats */}
        <div style={{ ...cardBase, marginBottom: tokens.spacing[5], display: 'flex', gap: tokens.spacing[4] }}>
          {[
            { label: 'Total Stages', value: stages.length, emoji: '\uD83C\uDFAA', color: tokens.colors.primaryScale[600] },
            { label: 'Active Now', value: activeStages, emoji: '\uD83D\uDD34', color: tokens.colors.successScale[600] },
            { label: 'Total Capacity', value: totalCapacity.toLocaleString(), emoji: '\uD83D\uDC65', color: tokens.colors.infoScale[600] },
            { label: 'Current Attendance', value: totalAttendance.toLocaleString(), emoji: '\uD83D\uDCCA', color: tokens.colors.warningScale[600] },
            { label: 'Utilization', value: `${Math.round((totalAttendance / totalCapacity) * 100)}%`, emoji: '\uD83D\uDCC8', color: tokens.colors.primaryScale[600] },
          ].map((stat, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center' as const, padding: tokens.spacing[2], borderRadius: tokens.borderRadius.md, backgroundColor: tokens.colors.neutral[50] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, display: 'block' }}>{stat.emoji}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: stat.color, display: 'block' }}>{stat.value}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{stat.label}</Text>
            </div>
          ))}
        </div>

        {/* Stage cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: tokens.spacing[5] }}>
          {stages.map((stage, idx) => {
            const isHovered = hoveredCard === stage.id;
            const isSelected = selectedStage === stage.id;
            const attendance = MOCK_ATTENDANCE[stage.id] || 0;
            const capacityPct = Math.round((attendance / stage.capacity) * 100);
            const schedule = schedules.find(s => s.stageId === stage.id);
            const capacityBar = createProgressBarStyle(tokens, {
              percent: capacityPct,
              color: capacityPct > 90 ? tokens.colors.errorScale[500] : capacityPct > 70 ? tokens.colors.warningScale[500] : tokens.colors.successScale[500],
            });

            return (
              <div
                key={stage.id}
                onClick={() => { setSelectedStage(isSelected ? null : stage.id); onStageClick?.(stage.id); }}
                onMouseEnter={() => setHoveredCard(stage.id)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{ ...cardBase, padding: 0, overflow: 'hidden' as const, cursor: 'pointer', ...hoverStyle, ...(isHovered ? getHoverTransform(tokens) : {}), borderColor: isSelected ? tokens.colors.primaryScale[400] : undefined }}
              >
                {/* Top gradient bar with stage name */}
                <div style={{ height: 100, background: STAGE_GRADIENTS[idx % STAGE_GRADIENTS.length], position: 'relative' as const, display: 'flex', alignItems: 'center', padding: `0 ${tokens.spacing[5]}px` }}>
                  <div style={{ flex: 1 }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.common.white, display: 'block', marginBottom: tokens.spacing[1] }}>{stage.name}</Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, color: 'rgba(255,255,255,0.8)' }}>{'\uD83D\uDCCD'} {stage.zoneName}</Text>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'flex-end', gap: tokens.spacing[1] }}>
                    {stage.isActive && stage.currentAct && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1], padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.full, backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)' }}>
                        <div style={{ width: 8, height: 8, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.errorScale[500], animation: 'pulse 1.5s ease-in-out infinite' }} />
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.common.white }}>LIVE</Text>
                      </div>
                    )}
                    {!stage.isActive && (
                      <span style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.full, backgroundColor: 'rgba(0,0,0,0.3)', fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.common.white }}>INACTIVE</span>
                    )}
                  </div>
                </div>

                <div style={{ padding: tokens.spacing[5] }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: tokens.spacing[5] }}>
                    {/* Current & Next Act */}
                    <div>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase' as const, letterSpacing: '0.05em', display: 'block', marginBottom: tokens.spacing[2] }}>Now Playing</Text>
                      {stage.currentAct ? (
                        <div style={{ padding: tokens.spacing[3], borderRadius: tokens.borderRadius.md, backgroundColor: tokens.colors.successScale[50], border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.successScale[200]}`, marginBottom: tokens.spacing[3] }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[1] }}>
                            <div style={{ width: 8, height: 8, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.errorScale[500] }} />
                            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>{stage.currentAct}</Text>
                          </div>
                          <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.successScale[700] }}>{'\uD83C\uDFB5'} Live now</Text>
                        </div>
                      ) : (
                        <div style={{ padding: tokens.spacing[3], borderRadius: tokens.borderRadius.md, backgroundColor: tokens.colors.neutral[50] }}>
                          <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>No act currently</Text>
                        </div>
                      )}

                      <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase' as const, letterSpacing: '0.05em', display: 'block', marginBottom: tokens.spacing[2] }}>Up Next</Text>
                      {stage.nextAct ? (
                        <div style={{ padding: tokens.spacing[3], borderRadius: tokens.borderRadius.md, backgroundColor: tokens.colors.infoScale[50], border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.infoScale[200]}` }}>
                          <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block' }}>{stage.nextAct}</Text>
                          <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.infoScale[700] }}>{'\u23F0'} Coming up</Text>
                        </div>
                      ) : (
                        <div style={{ padding: tokens.spacing[3], borderRadius: tokens.borderRadius.md, backgroundColor: tokens.colors.neutral[50] }}>
                          <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>Nothing scheduled</Text>
                        </div>
                      )}
                    </div>

                    {/* Capacity gauge */}
                    <div>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase' as const, letterSpacing: '0.05em', display: 'block', marginBottom: tokens.spacing[2] }}>Capacity</Text>
                      <div style={{ textAlign: 'center' as const, marginBottom: tokens.spacing[3] }}>
                        {/* SVG circular gauge */}
                        <svg width="100" height="100" viewBox="0 0 100 100" style={{ display: 'block', margin: '0 auto' }}>
                          <circle cx="50" cy="50" r="42" fill="none" stroke={tokens.colors.neutral[100]} strokeWidth="8" />
                          <circle cx="50" cy="50" r="42" fill="none" stroke={capacityPct > 90 ? tokens.colors.errorScale[500] : capacityPct > 70 ? tokens.colors.warningScale[500] : tokens.colors.successScale[500]} strokeWidth="8" strokeDasharray={`${(capacityPct / 100) * 264} 264`} strokeLinecap="round" transform="rotate(-90 50 50)" />
                          <text x="50" y="46" textAnchor="middle" fontSize="18" fontWeight="bold" fill={tokens.colors.neutral[900]}>{capacityPct}%</text>
                          <text x="50" y="62" textAnchor="middle" fontSize="9" fill={tokens.colors.neutral[500]}>capacity</text>
                        </svg>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[2] }}>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{'\uD83D\uDC65'} {attendance.toLocaleString()}</Text>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>/ {stage.capacity.toLocaleString()}</Text>
                      </div>
                      <div style={capacityBar.track}><div style={capacityBar.fill} /></div>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], display: 'block', textAlign: 'center' as const, marginTop: tokens.spacing[1] }}>{(stage.capacity - attendance).toLocaleString()} remaining</Text>
                    </div>

                    {/* Technical specs + Schedule */}
                    <div>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase' as const, letterSpacing: '0.05em', display: 'block', marginBottom: tokens.spacing[2] }}>Technical Specs</Text>
                      <div style={{ padding: tokens.spacing[3], borderRadius: tokens.borderRadius.md, backgroundColor: tokens.colors.neutral[50], marginBottom: tokens.spacing[3] }}>
                        {stage.dimensions && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[1] }}>
                            <Text style={{ fontSize: tokens.typography.fontSize.xs }}>{'\uD83D\uDCCF'}</Text>
                            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[700] }}>{stage.dimensions}</Text>
                          </div>
                        )}
                        {stage.technicalSpecs && stage.technicalSpecs.split(' | ').map((spec, si) => (
                          <div key={si} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: si < stage.technicalSpecs!.split(' | ').length - 1 ? tokens.spacing[1] : 0 }}>
                            <Text style={{ fontSize: tokens.typography.fontSize.xs }}>{si === 0 ? '\uD83D\uDD0A' : si === 1 ? '\uD83D\uDCA1' : '\u26A1'}</Text>
                            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[700] }}>{spec}</Text>
                          </div>
                        ))}
                      </div>

                      <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase' as const, letterSpacing: '0.05em', display: 'block', marginBottom: tokens.spacing[2] }}>Schedule ({schedule?.slots.length || 0} acts)</Text>
                      {schedule?.slots.map((slot, si) => (
                        <div key={si} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], padding: `${tokens.spacing[1]}px 0`, borderBottom: si < (schedule?.slots.length || 0) - 1 ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` : 'none' }}>
                          <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[600], minWidth: 40 }}>{slot.time}</Text>
                          <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[900], flex: 1 }}>{slot.artistName}</Text>
                          <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{slot.duration}m</Text>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action bar */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: tokens.spacing[4], paddingTop: tokens.spacing[3], borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` }}>
                    <div style={{ display: 'flex', gap: tokens.spacing[3] }}>
                      <div onClick={(e) => { e.stopPropagation(); onEditStage?.(stage.id); }} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, backgroundColor: tokens.colors.neutral[100], color: tokens.colors.neutral[700], borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.xs, cursor: 'pointer', ...hoverStyle }}>{'\u270F\uFE0F'} Edit</div>
                      <div style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, backgroundColor: tokens.colors.neutral[100], color: tokens.colors.neutral[700], borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.xs, cursor: 'pointer', ...hoverStyle }}>{'\uD83D\uDCC5'} Schedule</div>
                      <div style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, backgroundColor: tokens.colors.neutral[100], color: tokens.colors.neutral[700], borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.xs, cursor: 'pointer', ...hoverStyle }}>{'\uD83D\uDD27'} Tech Specs</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{stage.isActive ? 'Active' : 'Inactive'}</Text>
                      <div style={{ width: 40, height: 22, borderRadius: tokens.borderRadius.full, backgroundColor: stage.isActive ? tokens.colors.successScale[500] : tokens.colors.neutral[300], position: 'relative' as const, cursor: 'pointer', transition: 'background-color 0.2s' }}>
                        <div style={{ position: 'absolute' as const, top: 2, left: stage.isActive ? 20 : 2, width: 18, height: 18, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.common.white, boxShadow: tokens.shadows.sm, transition: 'left 0.2s' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Box>
    );
  },
});
