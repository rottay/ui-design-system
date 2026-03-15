'use client';

/**
 * StaffEvaluations - Summary Preset
 * Overview cards of all evaluations with scores
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createBadgeStyle, createHoverStyle, getHoverTransform } from '../../../helpers';
import type { StaffEvaluationsProps, EvaluationRecord } from '../../core';

const MOCK_EVALUATIONS: EvaluationRecord[] = [
  { id: 'e1', staffId: '1', staffName: 'Maria Santos', staffRole: 'Bartender', evaluatorName: 'John M.', date: new Date('2024-08-01'), period: 'Q2 2024', categories: [{ id: 'c1', name: 'Punctuality', score: 9, maxScore: 10 }, { id: 'c2', name: 'Quality', score: 9.5, maxScore: 10 }, { id: 'c3', name: 'Teamwork', score: 8, maxScore: 10 }], overallScore: 8.8, maxScore: 10, status: 'submitted' },
  { id: 'e2', staffId: '2', staffName: 'Carlos Rivera', staffRole: 'Security', evaluatorName: 'John M.', date: new Date('2024-08-02'), period: 'Q2 2024', categories: [{ id: 'c1', name: 'Punctuality', score: 10, maxScore: 10 }, { id: 'c2', name: 'Quality', score: 8.5, maxScore: 10 }, { id: 'c3', name: 'Teamwork', score: 7, maxScore: 10 }], overallScore: 8.3, maxScore: 10, status: 'draft' },
  { id: 'e3', staffId: '3', staffName: 'Ana Lopez', staffRole: 'Server', evaluatorName: 'Jane S.', date: new Date('2024-08-03'), period: 'Q2 2024', categories: [{ id: 'c1', name: 'Punctuality', score: 8, maxScore: 10 }, { id: 'c2', name: 'Quality', score: 9, maxScore: 10 }, { id: 'c3', name: 'Teamwork', score: 9.5, maxScore: 10 }], overallScore: 8.8, maxScore: 10, status: 'acknowledged' },
];

const STATUS_MAP: Record<string, string> = { draft: 'secondary', submitted: 'success', acknowledged: 'primary' };

export const SummaryStaffEvaluations = createPreset<StaffEvaluationsProps>({
  name: 'StaffEvaluations.Summary',
  render: ({ primitives, props, tokens }: PresetContext<StaffEvaluationsProps>) => {
    const { Box, Text } = primitives;
    const { evaluations: propEvals, onEvaluationClick, onCreateNew, className, style } = props;

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);
    const evaluations = propEvals?.length ? propEvals : MOCK_EVALUATIONS;

    const formatDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const avgScore = evaluations.length ? (evaluations.reduce((s, e) => s + e.overallScore, 0) / evaluations.length).toFixed(1) : '0';

    const scoreColor = (score: number, max: number) => {
      const pct = score / max;
      if (pct >= 0.8) return tokens.colors.successScale[500];
      if (pct >= 0.6) return tokens.colors.warningScale[500];
      return tokens.colors.errorScale[500];
    };

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[5], ...style }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[5] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>Evaluations Overview</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>{evaluations.length} evaluations | Avg: {avgScore}/10</Text>
          </div>
          <button onClick={onCreateNew} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, borderRadius: tokens.borderRadius.md, border: 'none', backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, cursor: 'pointer' }}>+ New Evaluation</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: tokens.spacing[4] }}>
          {evaluations.map(ev => (
            <div
              key={ev.id}
              onClick={() => onEvaluationClick?.(ev.id)}
              style={{ ...cardBase, ...hoverStyle, padding: tokens.spacing[4], cursor: 'pointer' }}
              onMouseEnter={e => { Object.assign(e.currentTarget.style, getHoverTransform(tokens)); e.currentTarget.style.boxShadow = tokens.shadows.md; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = tokens.shadows.sm; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: tokens.spacing[3] }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                  <div style={{ width: 40, height: 40, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.primaryScale[500], display: 'flex', alignItems: 'center', justifyContent: 'center', color: tokens.colors.common.white, fontWeight: tokens.typography.fontWeight.bold, fontSize: tokens.typography.fontSize.sm }}>
                    {ev.staffName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block' }}>{ev.staffName}</Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{ev.staffRole}</Text>
                  </div>
                </div>
                <span style={{ ...createBadgeStyle(tokens, STATUS_MAP[ev.status] as any), fontSize: tokens.typography.fontSize.xs }}>{ev.status}</span>
              </div>

              {/* Score circle */}
              <div style={{ textAlign: 'center', marginBottom: tokens.spacing[3] }}>
                <div style={{ width: 64, height: 64, borderRadius: tokens.borderRadius.full, border: `3px solid ${scoreColor(ev.overallScore, ev.maxScore)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: scoreColor(ev.overallScore, ev.maxScore) }}>{ev.overallScore}</Text>
                </div>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], marginTop: tokens.spacing[1] }}>/ {ev.maxScore}</Text>
              </div>

              {/* Mini category bars */}
              {ev.categories.slice(0, 3).map(cat => (
                <div key={cat.id} style={{ marginBottom: tokens.spacing[1] }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>{cat.name}</Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{cat.score}</Text>
                  </div>
                  <div style={{ height: 4, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.neutral[200], overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: tokens.borderRadius.full, backgroundColor: scoreColor(cat.score, cat.maxScore), width: `${(cat.score / cat.maxScore) * 100}%` }} />
                  </div>
                </div>
              ))}

              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], display: 'block', marginTop: tokens.spacing[2] }}>
                {ev.period} | {formatDate(ev.date)} | By {ev.evaluatorName}
              </Text>
            </div>
          ))}
        </div>
      </Box>
    );
  },
});
