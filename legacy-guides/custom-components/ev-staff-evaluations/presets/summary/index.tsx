'use client';

/**
 * EvStaffEvaluations - Summary Preset
 * Staff evaluation summary with search, event filter pills, score distribution bars,
 * top performers podium, comparison table with hover, and KPI stat cards
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
import type { EvStaffEvaluationsProps, EvaluationRecord } from '../../core';

const MOCK_EVALS: EvaluationRecord[] = [
  { id: 'ev1', staffName: 'Maria S.', eventName: 'Neon Nights', date: new Date('2026-02-01'), punctualityScore: 5, professionalismScore: 5, overallScore: 4.8, comments: 'Outstanding performance' },
  { id: 'ev2', staffName: 'Carlos R.', eventName: 'Neon Nights', date: new Date('2026-02-01'), punctualityScore: 4, professionalismScore: 4, overallScore: 4.2, comments: 'Very reliable' },
  { id: 'ev3', staffName: 'Ana L.', eventName: 'Sunset Festival', date: new Date('2026-01-25'), punctualityScore: 5, professionalismScore: 5, overallScore: 4.9, comments: 'Best server we have' },
  { id: 'ev4', staffName: 'Diego M.', eventName: 'Neon Nights', date: new Date('2026-02-01'), punctualityScore: 3, professionalismScore: 4, overallScore: 3.5, comments: 'Needs improvement on timing' },
  { id: 'ev5', staffName: 'Laura P.', eventName: 'Sunset Festival', date: new Date('2026-01-25'), punctualityScore: 5, professionalismScore: 4, overallScore: 4.5, comments: 'Great coordination' },
  { id: 'ev6', staffName: 'Roberto G.', eventName: 'Neon Nights', date: new Date('2026-02-01'), punctualityScore: 4, professionalismScore: 3, overallScore: 3.8, comments: 'Good but can improve' },
  { id: 'ev7', staffName: 'Sofia T.', eventName: 'Sunset Festival', date: new Date('2026-01-25'), punctualityScore: 4, professionalismScore: 4, overallScore: 4.3, comments: 'Consistent performer' },
  { id: 'ev8', staffName: 'Pedro K.', eventName: 'Neon Nights', date: new Date('2026-02-01'), punctualityScore: 3, professionalismScore: 3, overallScore: 3.2, comments: 'Still learning' },
];

const EVENT_OPTIONS = ['all', 'Neon Nights', 'Sunset Festival'];

export const SummaryEvStaffEvaluations = createPreset<EvStaffEvaluationsProps>({
  name: 'EvStaffEvaluations.Summary',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvStaffEvaluationsProps>) => {
    const { Box, Text } = primitives;
    const { evaluations, onEvaluationClick, className, style } = props;
    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const data = evaluations?.length ? evaluations : MOCK_EVALS;

    const [searchTerm, setSearchTerm] = useState('');
    const [eventFilter, setEventFilter] = useState<string>('all');
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);

    const filteredData = useMemo(() => {
      return data.filter(e => {
        if (searchTerm && !e.staffName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        if (eventFilter !== 'all' && e.eventName !== eventFilter) return false;
        return true;
      });
    }, [data, searchTerm, eventFilter]);

    const sorted = useMemo(() => [...filteredData].sort((a, b) => b.overallScore - a.overallScore), [filteredData]);
    const avgAll = filteredData.length > 0 ? filteredData.reduce((s, e) => s + e.overallScore, 0) / filteredData.length : 0;
    const topPerformers = sorted.slice(0, 3);
    const avgPunctuality = filteredData.length > 0 ? filteredData.reduce((s, e) => s + e.punctualityScore, 0) / filteredData.length : 0;
    const avgProfessionalism = filteredData.length > 0 ? filteredData.reduce((s, e) => s + e.professionalismScore, 0) / filteredData.length : 0;

    const scoreDistribution = [
      { range: '4.5-5.0', count: filteredData.filter(e => e.overallScore >= 4.5).length, color: tokens.colors.successScale[500] },
      { range: '4.0-4.4', count: filteredData.filter(e => e.overallScore >= 4.0 && e.overallScore < 4.5).length, color: tokens.colors.successScale[300] },
      { range: '3.5-3.9', count: filteredData.filter(e => e.overallScore >= 3.5 && e.overallScore < 4.0).length, color: tokens.colors.warningScale[500] },
      { range: '3.0-3.4', count: filteredData.filter(e => e.overallScore >= 3.0 && e.overallScore < 3.5).length, color: tokens.colors.warningScale[300] },
      { range: 'Below 3', count: filteredData.filter(e => e.overallScore < 3.0).length, color: tokens.colors.errorScale[500] },
    ];
    const maxCount = Math.max(...scoreDistribution.map(s => s.count), 1);

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[5], ...style }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[4] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[1] }}>
              {'📊'} Evaluation Summary
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
              {filteredData.length} evaluations {'·'} Avg: {avgAll.toFixed(1)}/5.0
            </Text>
          </div>
        </div>

        {/* KPI Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: tokens.spacing[3], marginBottom: tokens.spacing[4] }}>
          {[
            { label: 'Avg Score', value: avgAll.toFixed(1), color: avgAll >= 4 ? tokens.colors.successScale[600] : tokens.colors.warningScale[600] },
            { label: 'Total Reviews', value: filteredData.length, color: tokens.colors.primaryScale[600] },
            { label: 'Avg Punctuality', value: avgPunctuality.toFixed(1), color: tokens.colors.infoScale[600] },
            { label: 'Avg Professionalism', value: avgProfessionalism.toFixed(1), color: tokens.colors.secondaryScale[600] },
          ].map(s => (
            <div key={s.label} style={{ ...cardBase, padding: tokens.spacing[3], textAlign: 'center' as const }}>
              <Text style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: s.color, display: 'block' }}>{s.value}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{s.label}</Text>
            </div>
          ))}
        </div>

        {/* Search & Filter */}
        <div style={{ ...cardBase, padding: tokens.spacing[3], marginBottom: tokens.spacing[4] }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], flexWrap: 'wrap' as const }}>
            <div style={{ flex: 1, minWidth: 200, position: 'relative' as const }}>
              <div style={{ position: 'absolute' as const, left: tokens.spacing[3], top: '50%', transform: 'translateY(-50%)', color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>{'🔍'}</div>
              <input type="text" placeholder="Search staff..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ width: '100%', padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px ${tokens.spacing[2]}px ${tokens.spacing[8]}px`, borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[900], backgroundColor: tokens.colors.common.white, outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', gap: tokens.spacing[1] }}>
              {EVENT_OPTIONS.map(ev => (
                <div key={ev} onClick={() => setEventFilter(ev)} style={createFilterPillStyle(tokens, { active: eventFilter === ev })}>
                  {ev === 'all' ? 'All Events' : ev}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing[4], marginBottom: tokens.spacing[4] }}>
          {/* Score Distribution */}
          <div style={{ ...cardBase, padding: tokens.spacing[4] }}>
            <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[4] }}>Score Distribution</Text>
            {scoreDistribution.map(s => {
              const barPct = (s.count / maxCount) * 100;
              return (
                <div key={s.range} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[2] }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600], width: 60, textAlign: 'right' as const }}>{s.range}</Text>
                  <div style={{ flex: 1, height: 20, borderRadius: tokens.borderRadius.sm, backgroundColor: tokens.colors.neutral[100], overflow: 'hidden' as const }}>
                    <div style={{ height: '100%', width: `${barPct}%`, backgroundColor: s.color, borderRadius: tokens.borderRadius.sm, transition: `width ${tokens.motion.hover}` }} />
                  </div>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700], width: 20 }}>{s.count}</Text>
                </div>
              );
            })}
          </div>

          {/* Top Performers */}
          <div style={{ ...cardBase, padding: tokens.spacing[4] }}>
            <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[4] }}>{'🏆'} Top Performers</Text>
            {topPerformers.map((e, i) => (
              <div key={e.id} onClick={() => onEvaluationClick?.(e.id)} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], padding: `${tokens.spacing[3]}px 0`, borderBottom: i < topPerformers.length - 1 ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` : 'none', cursor: 'pointer' }}>
                <div style={{ width: 32, height: 32, borderRadius: tokens.borderRadius.full, backgroundColor: i === 0 ? tokens.colors.warningScale[400] : i === 1 ? tokens.colors.neutral[300] : tokens.colors.warningScale[600], display: 'flex', alignItems: 'center', justifyContent: 'center', color: tokens.colors.common.white, fontWeight: tokens.typography.fontWeight.bold, fontSize: tokens.typography.fontSize.sm }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block' }}>{e.staffName}</Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{e.eventName}</Text>
                </div>
                <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.successScale[600] }}>{e.overallScore.toFixed(1)}</Text>
              </div>
            ))}
            {topPerformers.length === 0 && (
              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>No evaluations match filters</Text>
            )}
          </div>
        </div>

        {/* Comparison Table */}
        <div style={{ ...cardBase, padding: 0, overflow: 'hidden' as const }}>
          <div style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, backgroundColor: tokens.colors.neutral[50] }}>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>All Evaluations</Text>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
            <thead>
              <tr>
                {['Staff', 'Event', 'Punctuality', 'Professionalism', 'Overall', 'Date'].map(h => (
                  <th key={h} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, textAlign: 'left' as const, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase' as const, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map(e => {
                const isHovered = hoveredRow === e.id;
                return (
                  <tr
                    key={e.id}
                    onClick={() => onEvaluationClick?.(e.id)}
                    onMouseEnter={() => setHoveredRow(e.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{ cursor: 'pointer', backgroundColor: isHovered ? tokens.colors.neutral[50] : 'transparent', transition: `background-color ${tokens.motion.hover}` }}
                  >
                    <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>{e.staffName}</td>
                    <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>{e.eventName}</td>
                    <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>{e.punctualityScore}/5</td>
                    <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>{e.professionalismScore}/5</td>
                    <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
                      <span style={createBadgeStyle(tokens, e.overallScore >= 4.5 ? 'success' : e.overallScore >= 3.5 ? 'warning' : 'error')}>{e.overallScore.toFixed(1)}</span>
                    </td>
                    <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>{e.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {sorted.length === 0 && (
            <div style={{ textAlign: 'center' as const, padding: tokens.spacing[8], color: tokens.colors.neutral[400] }}>
              <Text style={{ fontSize: tokens.typography.fontSize['2xl'], display: 'block', marginBottom: tokens.spacing[2] }}>{'📊'}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>No evaluations match your filters</Text>
            </div>
          )}
        </div>
      </Box>
    );
  },
});
