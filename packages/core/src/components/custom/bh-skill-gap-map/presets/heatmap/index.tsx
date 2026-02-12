'use client';

/**
 * BhSkillGapMap - Heatmap Preset
 * Visual dimension x candidate heatmap grid with color-coded scores,
 * priority filter pills, summary cards, and gap detail panel.
 * Slite-inspired warm design with generous whitespace.
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, getPersonalityBadgeRadius } from '../../../helpers';
import type { BhSkillGapMapProps, GapPriority, SkillGapItem, DimensionHeatmapCell } from '../../core';
import { getPriorityColors, getScoreColor, getScoreBgColor } from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  Grid3x3, AlertTriangle, TrendingDown, BarChart3, Info, Target,
} from 'lucide-react';

/* ---------------------------------------------------------------------------
 * Default Data
 * -------------------------------------------------------------------------*/

const DEFAULT_GAPS: SkillGapItem[] = [
  { id: 'g-1', dimension: 'System Design', dimensionCode: 'SD', currentLevel: 3, requiredLevel: 5, gapSize: 2, priority: 'critical', candidateCount: 4, recommendation: 'Focus hiring on candidates with distributed systems experience.' },
  { id: 'g-2', dimension: 'React Advanced', dimensionCode: 'RA', currentLevel: 4, requiredLevel: 5, gapSize: 1, priority: 'high', candidateCount: 3, recommendation: 'Look for server component and RSC expertise.' },
  { id: 'g-3', dimension: 'TypeScript', dimensionCode: 'TS', currentLevel: 4, requiredLevel: 5, gapSize: 1, priority: 'medium', candidateCount: 2 },
  { id: 'g-4', dimension: 'Leadership', dimensionCode: 'LD', currentLevel: 3, requiredLevel: 4, gapSize: 1, priority: 'high', candidateCount: 5, recommendation: 'Prioritize candidates with tech lead or EM experience.' },
  { id: 'g-5', dimension: 'Testing', dimensionCode: 'QA', currentLevel: 3, requiredLevel: 4, gapSize: 1, priority: 'medium', candidateCount: 3 },
  { id: 'g-6', dimension: 'Communication', dimensionCode: 'CM', currentLevel: 4, requiredLevel: 4, gapSize: 0, priority: 'low', candidateCount: 1 },
];

const DEFAULT_HEATMAP: DimensionHeatmapCell[] = [
  { dimension: 'System Design', candidate: 'Sarah Johnson', candidateId: 'c-1', score: 90, maxScore: 100, gapSize: 0 },
  { dimension: 'React Advanced', candidate: 'Sarah Johnson', candidateId: 'c-1', score: 95, maxScore: 100, gapSize: 0 },
  { dimension: 'TypeScript', candidate: 'Sarah Johnson', candidateId: 'c-1', score: 88, maxScore: 100, gapSize: 0 },
  { dimension: 'Leadership', candidate: 'Sarah Johnson', candidateId: 'c-1', score: 85, maxScore: 100, gapSize: 0 },
  { dimension: 'Testing', candidate: 'Sarah Johnson', candidateId: 'c-1', score: 72, maxScore: 100, gapSize: 1 },
  { dimension: 'Communication', candidate: 'Sarah Johnson', candidateId: 'c-1', score: 88, maxScore: 100, gapSize: 0 },
  { dimension: 'System Design', candidate: 'Michael Chen', candidateId: 'c-2', score: 78, maxScore: 100, gapSize: 1 },
  { dimension: 'React Advanced', candidate: 'Michael Chen', candidateId: 'c-2', score: 82, maxScore: 100, gapSize: 0 },
  { dimension: 'TypeScript', candidate: 'Michael Chen', candidateId: 'c-2', score: 90, maxScore: 100, gapSize: 0 },
  { dimension: 'Leadership', candidate: 'Michael Chen', candidateId: 'c-2', score: 60, maxScore: 100, gapSize: 2 },
  { dimension: 'Testing', candidate: 'Michael Chen', candidateId: 'c-2', score: 85, maxScore: 100, gapSize: 0 },
  { dimension: 'Communication', candidate: 'Michael Chen', candidateId: 'c-2', score: 91, maxScore: 100, gapSize: 0 },
  { dimension: 'System Design', candidate: 'Emily Rodriguez', candidateId: 'c-3', score: 95, maxScore: 100, gapSize: 0 },
  { dimension: 'React Advanced', candidate: 'Emily Rodriguez', candidateId: 'c-3', score: 65, maxScore: 100, gapSize: 2 },
  { dimension: 'TypeScript', candidate: 'Emily Rodriguez', candidateId: 'c-3', score: 75, maxScore: 100, gapSize: 1 },
  { dimension: 'Leadership', candidate: 'Emily Rodriguez', candidateId: 'c-3', score: 55, maxScore: 100, gapSize: 2 },
  { dimension: 'Testing', candidate: 'Emily Rodriguez', candidateId: 'c-3', score: 70, maxScore: 100, gapSize: 1 },
  { dimension: 'Communication', candidate: 'Emily Rodriguez', candidateId: 'c-3', score: 62, maxScore: 100, gapSize: 1 },
  { dimension: 'System Design', candidate: 'James Kim', candidateId: 'c-4', score: 45, maxScore: 100, gapSize: 3 },
  { dimension: 'React Advanced', candidate: 'James Kim', candidateId: 'c-4', score: 40, maxScore: 100, gapSize: 3 },
  { dimension: 'TypeScript', candidate: 'James Kim', candidateId: 'c-4', score: 70, maxScore: 100, gapSize: 1 },
  { dimension: 'Leadership', candidate: 'James Kim', candidateId: 'c-4', score: 50, maxScore: 100, gapSize: 2 },
  { dimension: 'Testing', candidate: 'James Kim', candidateId: 'c-4', score: 80, maxScore: 100, gapSize: 0 },
  { dimension: 'Communication', candidate: 'James Kim', candidateId: 'c-4', score: 75, maxScore: 100, gapSize: 1 },
];

const DEFAULT_SUMMARY = { totalGaps: 6, criticalGaps: 1, averageGapSize: 1.0, mostCommonDimension: 'Leadership' };

/* ---------------------------------------------------------------------------
 * Preset
 * -------------------------------------------------------------------------*/

export const HeatmapBhSkillGapMap = createPreset<BhSkillGapMapProps>({
  name: 'BhSkillGapMap.Heatmap',
  render: ({ primitives, props, tokens: t }: PresetContext<BhSkillGapMapProps>) => {
    const { Box, Text } = primitives;
    const br = getPersonalityBadgeRadius(t);
    const pc = getPriorityColors(t);

    const {
      gaps = DEFAULT_GAPS,
      heatmapData = DEFAULT_HEATMAP,
      summary = DEFAULT_SUMMARY,
      dimensions: dimsProp,
      candidates: candsProp,
      selectedGapId: selectedGapProp,
      onGapSelect,
      priorityFilter: priorityFilterProp,
      onPriorityFilterChange,
      loading,
      className, style,
    } = props;

    const [internalSelected, setInternalSelected] = useState<string>(selectedGapProp ?? '');
    const [internalPriority, setInternalPriority] = useState<GapPriority[]>([]);

    const selectedGapId = selectedGapProp ?? internalSelected;
    const activePriority = priorityFilterProp ?? internalPriority;

    const handleGapSelect = (id: string) => { setInternalSelected(id); onGapSelect?.(id); };
    const togglePriority = (p: GapPriority) => {
      const next = activePriority.includes(p) ? activePriority.filter(x => x !== p) : [...activePriority, p];
      setInternalPriority(next);
      onPriorityFilterChange?.(next);
    };

    const filteredGaps = activePriority.length > 0 ? gaps.filter(g => activePriority.includes(g.priority)) : gaps;
    const dims = dimsProp?.length ? dimsProp : [...new Set(heatmapData.map(c => c.dimension))];
    const cands = candsProp?.length ? candsProp : [...new Set(heatmapData.map(c => c.candidate))];
    const selectedGap = gaps.find(g => g.id === selectedGapId);

    if (loading) {
      return (
        <Box className={className} style={{ padding: t.spacing[8], textAlign: 'center', color: t.colors.neutral[500], ...style }}>
          <Text>Loading skill gap data...</Text>
        </Box>
      );
    }

    return (
      <Box className={className} style={{
        ...createCardStyle(t, { elevation: 'md' }),
        display: 'flex', flexDirection: 'column', height: '100%',
        backgroundColor: t.colors.common.white, overflow: 'hidden', ...style,
      }}>
        {/* Header */}
        <Box style={{
          padding: `${t.spacing[5]}px ${t.spacing[6]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Box>
            <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[900] }}>
              <Grid3x3 size={16} style={{ marginRight: t.spacing[2], verticalAlign: 'middle' }} />
              Skill Gap Heatmap
            </Text>
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], marginTop: 2 }}>
              {dims.length} dimensions | {cands.length} candidates | {gaps.length} gaps identified
            </Text>
          </Box>
        </Box>

        <Box style={{ flex: 1, overflow: 'auto', padding: `${t.spacing[6]}px` }}>
          {/* Summary cards */}
          {summary && (
            <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: t.spacing[4], marginBottom: t.spacing[6] }}>
              {[
                { label: 'Total Gaps', value: summary.totalGaps, icon: <BarChart3 size={16} />, color: t.colors.neutral[700], bg: t.colors.neutral[50] },
                { label: 'Critical', value: summary.criticalGaps, icon: <AlertTriangle size={16} />, color: t.colors.errorScale[600], bg: t.colors.errorScale[50] },
                { label: 'Avg Gap Size', value: summary.averageGapSize.toFixed(1), icon: <TrendingDown size={16} />, color: t.colors.warningScale[600], bg: t.colors.warningScale[50] },
                { label: 'Top Dimension', value: summary.mostCommonDimension, icon: <Target size={16} />, color: t.colors.primaryScale[600], bg: t.colors.primaryScale[50] },
              ].map(s => (
                <Box key={s.label} style={{
                  padding: `${t.spacing[4]}px`, borderRadius: t.borderRadius.xl,
                  backgroundColor: s.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: t.spacing[2],
                }}>
                  <Box style={{ color: s.color }}>{s.icon}</Box>
                  <Text style={{ fontSize: t.typography.fontSize.xl, fontWeight: t.typography.fontWeight.bold, color: s.color }}>{s.value}</Text>
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: s.color, fontWeight: t.typography.fontWeight.medium }}>{s.label}</Text>
                </Box>
              ))}
            </Box>
          )}

          {/* Priority filters */}
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[5] }}>
            <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[600], marginRight: t.spacing[1] }}>Priority:</Text>
            {(['critical', 'high', 'medium', 'low'] as GapPriority[]).map(p => {
              const colors = pc[p];
              const active = activePriority.includes(p);
              return (
                <button key={p} onClick={() => togglePriority(p)} style={{
                  padding: `${t.spacing[1]}px ${t.spacing[3]}px`, borderRadius: br,
                  border: `1px solid ${active ? colors.border : t.colors.neutral[200]}`,
                  backgroundColor: active ? colors.bgColor : t.colors.common.white,
                  color: active ? colors.color : t.colors.neutral[500],
                  fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium,
                  cursor: 'pointer', textTransform: 'capitalize',
                }}>{p}</button>
              );
            })}
          </Box>

          {/* Heatmap grid */}
          {heatmapData.length > 0 && dims.length > 0 && cands.length > 0 && (
            <Box style={{ marginBottom: t.spacing[6], overflowX: 'auto' }}>
              <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[800], marginBottom: t.spacing[3] }}>
                Dimension Heatmap
              </Text>
              <Box style={{ borderRadius: t.borderRadius.lg, border: `1px solid ${t.colors.neutral[100]}`, overflow: 'hidden' }}>
                {/* Header row */}
                <Box style={{ display: 'flex' }}>
                  <Box style={{ width: 120, minWidth: 120, padding: `${t.spacing[2]}px ${t.spacing[3]}px`, backgroundColor: t.colors.neutral[50], borderBottom: `1px solid ${t.colors.neutral[100]}` }} />
                  {dims.map(dim => (
                    <Box key={dim} style={{
                      width: 80, minWidth: 80, textAlign: 'center',
                      padding: `${t.spacing[2]}px ${t.spacing[1]}px`,
                      backgroundColor: t.colors.neutral[50],
                      borderBottom: `1px solid ${t.colors.neutral[100]}`,
                      borderLeft: `1px solid ${t.colors.neutral[100]}`,
                    }}>
                      <Text style={{ fontSize: 10, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[600] }}>{dim}</Text>
                    </Box>
                  ))}
                </Box>
                {/* Candidate rows */}
                {cands.map((cand, ci) => (
                  <Box key={cand} style={{ display: 'flex', borderBottom: ci < cands.length - 1 ? `1px solid ${t.colors.neutral[100]}` : undefined }}>
                    <Box style={{
                      width: 120, minWidth: 120, padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                      display: 'flex', alignItems: 'center',
                    }}>
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[700], fontWeight: t.typography.fontWeight.medium }}>{cand}</Text>
                    </Box>
                    {dims.map(dim => {
                      const cell = heatmapData.find(c => c.candidate === cand && c.dimension === dim);
                      const score = cell?.score ?? 0;
                      const maxScore = cell?.maxScore ?? 100;
                      return (
                        <Box key={`${cand}-${dim}`} style={{
                          width: 80, minWidth: 80, height: 36,
                          borderLeft: `1px solid ${t.colors.neutral[100]}`,
                          backgroundColor: getScoreBgColor(score, maxScore, t),
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'background-color 0.2s ease',
                        }}>
                          <Text style={{
                            fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold,
                            color: getScoreColor(score, maxScore, t),
                          }}>{score}</Text>
                        </Box>
                      );
                    })}
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* Gap list */}
          <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[800], marginBottom: t.spacing[3] }}>
            Skill Gaps ({filteredGaps.length})
          </Text>
          <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[2] }}>
            {filteredGaps.map(gap => {
              const colors = pc[gap.priority];
              const isSelected = selectedGapId === gap.id;
              const pct = gap.requiredLevel > 0 ? Math.round((gap.currentLevel / gap.requiredLevel) * 100) : 0;
              const barColor = pct >= 80 ? t.colors.successScale[500] : pct >= 50 ? t.colors.warningScale[500] : t.colors.errorScale[500];

              return (
                <Box key={gap.id} onClick={() => handleGapSelect(gap.id)} style={{
                  padding: `${t.spacing[3]}px ${t.spacing[4]}px`, borderRadius: t.borderRadius.lg,
                  border: `1px solid ${isSelected ? t.colors.primaryScale[300] : t.colors.neutral[100]}`,
                  backgroundColor: isSelected ? t.colors.primaryScale[50] : t.colors.common.white,
                  cursor: 'pointer', transition: 'all 0.15s ease',
                  borderLeft: `3px solid ${colors.color}`,
                }}>
                  <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[2] }}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                      <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[800] }}>{gap.dimension}</Text>
                      <Box style={{ padding: `0 ${t.spacing[2]}px`, borderRadius: br, backgroundColor: colors.bgColor, border: `1px solid ${colors.border}` }}>
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: colors.color, textTransform: 'capitalize' }}>{gap.priority}</Text>
                      </Box>
                    </Box>
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>{gap.candidateCount} candidates</Text>
                  </Box>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                    <Box style={{ flex: 1, height: 6, borderRadius: t.borderRadius.full, backgroundColor: t.colors.neutral[100], overflow: 'hidden' }}>
                      <Box style={{ height: '100%', width: `${pct}%`, backgroundColor: barColor, borderRadius: t.borderRadius.full, transition: 'width 0.4s ease' }} />
                    </Box>
                    <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[600], minWidth: 36, textAlign: 'right' }}>
                      {gap.currentLevel}/{gap.requiredLevel}
                    </Text>
                  </Box>
                  {isSelected && gap.recommendation && (
                    <Box style={{
                      marginTop: t.spacing[2], padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                      borderRadius: t.borderRadius.lg, backgroundColor: t.colors.infoScale[50],
                      border: `1px solid ${t.colors.infoScale[200]}`,
                      display: 'flex', alignItems: 'flex-start', gap: t.spacing[2],
                    }}>
                      <Info size={12} style={{ color: t.colors.infoScale[500], flexShrink: 0, marginTop: 2 }} />
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.infoScale[700], lineHeight: 1.5 }}>{gap.recommendation}</Text>
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    );
  },
});
