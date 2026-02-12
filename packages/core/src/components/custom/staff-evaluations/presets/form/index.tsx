'use client';

/**
 * StaffEvaluations - Form Preset
 * Evaluation form with radar chart and category ratings
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createBadgeStyle } from '../../../helpers';
import type { StaffEvaluationsProps, EvaluationRecord } from '../../core';

const MOCK_EVALUATIONS: EvaluationRecord[] = [
  {
    id: 'e1', staffId: '1', staffName: 'Maria Santos', staffRole: 'Bartender', evaluatorName: 'John Manager', date: new Date('2024-08-01'), period: 'Q2 2024',
    categories: [
      { id: 'c1', name: 'Punctuality', score: 9, maxScore: 10, weight: 0.15 },
      { id: 'c2', name: 'Quality of Work', score: 9.5, maxScore: 10, weight: 0.25 },
      { id: 'c3', name: 'Teamwork', score: 8, maxScore: 10, weight: 0.2 },
      { id: 'c4', name: 'Communication', score: 8.5, maxScore: 10, weight: 0.15 },
      { id: 'c5', name: 'Initiative', score: 7.5, maxScore: 10, weight: 0.15 },
      { id: 'c6', name: 'Customer Service', score: 9.5, maxScore: 10, weight: 0.1 },
    ],
    overallScore: 8.8, maxScore: 10, strengths: 'Excellent cocktail skills and customer rapport.', improvements: 'Could take more initiative during slow periods.', comments: 'Strong performer, recommend for lead bartender role.', status: 'submitted',
  },
  {
    id: 'e2', staffId: '2', staffName: 'Carlos Rivera', staffRole: 'Security', evaluatorName: 'John Manager', date: new Date('2024-08-02'), period: 'Q2 2024',
    categories: [
      { id: 'c1', name: 'Punctuality', score: 10, maxScore: 10 },
      { id: 'c2', name: 'Quality of Work', score: 8.5, maxScore: 10 },
      { id: 'c3', name: 'Teamwork', score: 7, maxScore: 10 },
      { id: 'c4', name: 'Communication', score: 7.5, maxScore: 10 },
      { id: 'c5', name: 'Initiative', score: 8, maxScore: 10 },
      { id: 'c6', name: 'Situation Awareness', score: 9, maxScore: 10 },
    ],
    overallScore: 8.3, maxScore: 10, status: 'draft',
  },
];

const STATUS_MAP: Record<string, string> = { draft: 'secondary', submitted: 'success', acknowledged: 'primary' };

export const FormStaffEvaluations = createPreset<StaffEvaluationsProps>({
  name: 'StaffEvaluations.Form',
  render: ({ primitives, props, tokens }: PresetContext<StaffEvaluationsProps>) => {
    const { Box, Text } = primitives;
    const { evaluations: propEvals, currentEvaluation, onEvaluationClick, onCreateNew, className, style } = props;

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const evaluations = propEvals?.length ? propEvals : MOCK_EVALUATIONS;
    const [selectedId, setSelectedId] = useState<string>(currentEvaluation?.id || evaluations[0]?.id || '');
    const selected = evaluations.find(e => e.id === selectedId) || evaluations[0];

    const formatDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    // Radar chart SVG
    const radarSize = 200;
    const radarCenter = radarSize / 2;
    const radarRadius = 75;

    const renderRadar = (ev: EvaluationRecord) => {
      const cats = ev.categories;
      const n = cats.length;
      const angleStep = (Math.PI * 2) / n;

      const getPoint = (i: number, value: number, max: number) => {
        const angle = angleStep * i - Math.PI / 2;
        const r = (value / max) * radarRadius;
        return { x: radarCenter + r * Math.cos(angle), y: radarCenter + r * Math.sin(angle) };
      };

      const gridLevels = [0.25, 0.5, 0.75, 1];
      const dataPoints = cats.map((c, i) => getPoint(i, c.score, c.maxScore));
      const dataPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

      return (
        <svg width={radarSize} height={radarSize} style={{ display: 'block', margin: '0 auto' }}>
          {/* Grid */}
          {gridLevels.map(level => {
            const points = cats.map((_, i) => getPoint(i, level * 10, 10));
            const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
            return <path key={level} d={path} fill="none" stroke={tokens.colors.neutral[200]} strokeWidth={1} />;
          })}
          {/* Axes */}
          {cats.map((_, i) => {
            const p = getPoint(i, 10, 10);
            return <line key={i} x1={radarCenter} y1={radarCenter} x2={p.x} y2={p.y} stroke={tokens.colors.neutral[200]} strokeWidth={1} />;
          })}
          {/* Data */}
          <path d={dataPath} fill={`${tokens.colors.primaryScale[500]}33`} stroke={tokens.colors.primaryScale[500]} strokeWidth={2} />
          {dataPoints.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={3} fill={tokens.colors.primaryScale[500]} />
          ))}
          {/* Labels */}
          {cats.map((c, i) => {
            const p = getPoint(i, 12, 10);
            return (
              <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fontSize={9} fill={tokens.colors.neutral[600]}>{c.name.split(' ')[0]}</text>
            );
          })}
        </svg>
      );
    };

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[5], ...style }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[5] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>Staff Evaluations</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>{evaluations.length} evaluations</Text>
          </div>
          <button onClick={onCreateNew} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, borderRadius: tokens.borderRadius.md, border: 'none', backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, cursor: 'pointer' }}>+ New Evaluation</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: tokens.spacing[4] }}>
          {/* List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
            {evaluations.map(ev => (
              <div
                key={ev.id}
                onClick={() => { setSelectedId(ev.id); onEvaluationClick?.(ev.id); }}
                style={{ ...cardBase, padding: tokens.spacing[3], cursor: 'pointer', borderLeft: selectedId === ev.id ? `3px solid ${tokens.colors.primaryScale[500]}` : '3px solid transparent' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[1] }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>{ev.staffName}</Text>
                  <span style={{ ...createBadgeStyle(tokens, STATUS_MAP[ev.status] as any), fontSize: tokens.typography.fontSize.xs }}>{ev.status}</span>
                </div>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'block' }}>{ev.staffRole} | {ev.period}</Text>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.primaryScale[600], fontWeight: tokens.typography.fontWeight.semibold }}>{ev.overallScore}/{ev.maxScore}</Text>
              </div>
            ))}
          </div>

          {/* Detail */}
          {selected && (
            <div style={{ ...cardBase, padding: tokens.spacing[5] }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[4] }}>
                <div>
                  <Text style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>{selected.staffName}</Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>{selected.staffRole} | {selected.period} | By {selected.evaluatorName}</Text>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.primaryScale[600], display: 'block' }}>{selected.overallScore}</Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>/ {selected.maxScore}</Text>
                </div>
              </div>

              {/* Radar Chart */}
              <div style={{ marginBottom: tokens.spacing[4] }}>
                {renderRadar(selected)}
              </div>

              {/* Category Scores */}
              <div style={{ marginBottom: tokens.spacing[4] }}>
                <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[3] }}>Category Scores</Text>
                {selected.categories.map(cat => (
                  <div key={cat.id} style={{ marginBottom: tokens.spacing[2] }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[1] }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700] }}>{cat.name}</Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>{cat.score}/{cat.maxScore}</Text>
                    </div>
                    <div style={{ height: 6, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.neutral[200], overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: tokens.borderRadius.full, backgroundColor: cat.score / cat.maxScore >= 0.8 ? tokens.colors.successScale[500] : cat.score / cat.maxScore >= 0.6 ? tokens.colors.warningScale[500] : tokens.colors.errorScale[500], width: `${(cat.score / cat.maxScore) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Comments */}
              {selected.strengths && (
                <div style={{ marginBottom: tokens.spacing[3] }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.successScale[700], display: 'block', marginBottom: tokens.spacing[1] }}>Strengths</Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>{selected.strengths}</Text>
                </div>
              )}
              {selected.improvements && (
                <div style={{ marginBottom: tokens.spacing[3] }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.warningScale[700], display: 'block', marginBottom: tokens.spacing[1] }}>Areas for Improvement</Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>{selected.improvements}</Text>
                </div>
              )}
              {selected.comments && (
                <div>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700], display: 'block', marginBottom: tokens.spacing[1] }}>General Comments</Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600], fontStyle: 'italic' }}>"{selected.comments}"</Text>
                </div>
              )}
            </div>
          )}
        </div>
      </Box>
    );
  },
});
