'use client';

/**
 * EvStaffEvaluations - Form Preset
 * Staff evaluation form with staff selector, rating buttons per criterion,
 * score visualization bars, comments textarea, and submit button
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
import type { EvStaffEvaluationsProps } from '../../core';

const STAFF_OPTIONS = [
  { id: '1', name: 'Maria S.', role: 'Bartender', rating: 4.8 },
  { id: '2', name: 'Carlos R.', role: 'Security', rating: 4.2 },
  { id: '3', name: 'Ana L.', role: 'Server', rating: 4.9 },
  { id: '4', name: 'Diego M.', role: 'Sound Tech', rating: 3.5 },
  { id: '5', name: 'Laura P.', role: 'Stage Manager', rating: 4.5 },
  { id: '6', name: 'Roberto G.', role: 'Event Coord', rating: 3.8 },
];

const CRITERIA = ['Punctuality', 'Professionalism', 'Teamwork', 'Quality'];

export const FormEvStaffEvaluations = createPreset<EvStaffEvaluationsProps>({
  name: 'EvStaffEvaluations.Form',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvStaffEvaluationsProps>) => {
    const { Box, Text } = primitives;
    const { onSubmitEvaluation, className, style } = props;
    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const [selectedStaff, setSelectedStaff] = useState('1');
    const [scores, setScores] = useState<Record<string, number>>({ Punctuality: 4, Professionalism: 3, Teamwork: 5, Quality: 4 });
    const [comments, setComments] = useState('');
    const [hoveredStaff, setHoveredStaff] = useState<string | null>(null);

    const avgScore = Object.values(scores).reduce((s, v) => s + v, 0) / CRITERIA.length;
    const currentStaff = STAFF_OPTIONS.find(s => s.id === selectedStaff);

    const handleSubmit = () => {
      onSubmitEvaluation?.({
        staffId: selectedStaff,
        eventId: 'ev-001',
        punctuality: scores.Punctuality,
        professionalism: scores.Professionalism,
        teamwork: scores.Teamwork,
        quality: scores.Quality,
        comments,
      });
    };

    const getScoreColor = (score: number) => {
      if (score >= 4) return tokens.colors.successScale[500];
      if (score >= 3) return tokens.colors.warningScale[500];
      return tokens.colors.errorScale[500];
    };

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[5], ...style }}>
        {/* Header */}
        <div style={{ marginBottom: tokens.spacing[4] }}>
          <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[1] }}>
            {'📝'} Staff Evaluation
          </Text>
          <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
            Rate staff performance for the current event
          </Text>
        </div>

        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          {/* Staff Selector */}
          <div style={{ ...cardBase, padding: tokens.spacing[4], marginBottom: tokens.spacing[4] }}>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700], display: 'block', marginBottom: tokens.spacing[3] }}>Select Staff Member</Text>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: tokens.spacing[2] }}>
              {STAFF_OPTIONS.map(s => {
                const isSelected = selectedStaff === s.id;
                const isHovered = hoveredStaff === s.id;
                return (
                  <div
                    key={s.id}
                    onClick={() => setSelectedStaff(s.id)}
                    onMouseEnter={() => setHoveredStaff(s.id)}
                    onMouseLeave={() => setHoveredStaff(null)}
                    style={{
                      padding: tokens.spacing[3],
                      borderRadius: tokens.borderRadius.md,
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${isSelected ? tokens.colors.primaryScale[300] : tokens.colors.neutral[200]}`,
                      backgroundColor: isSelected ? tokens.colors.primaryScale[50] : isHovered ? tokens.colors.neutral[50] : tokens.colors.common.white,
                      cursor: 'pointer',
                      transition: `all ${tokens.motion.hover}`,
                      display: 'flex', alignItems: 'center', gap: tokens.spacing[2],
                    }}
                  >
                    <div style={{ width: 28, height: 28, borderRadius: tokens.borderRadius.full, backgroundColor: isSelected ? tokens.colors.primaryScale[500] : tokens.colors.neutral[200], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold, color: isSelected ? tokens.colors.common.white : tokens.colors.neutral[500] }}>
                      {s.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: isSelected ? tokens.colors.primaryScale[700] : tokens.colors.neutral[900], display: 'block' }}>{s.name}</Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{s.role}</Text>
                    </div>
                  </div>
                );
              })}
            </div>
            {currentStaff && (
              <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginTop: tokens.spacing[3], padding: tokens.spacing[2], borderRadius: tokens.borderRadius.sm, backgroundColor: tokens.colors.neutral[50] }}>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Previous rating:</Text>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.warningScale[500] }}>{'★'} {currentStaff.rating}</Text>
              </div>
            )}
          </div>

          {/* Rating Sliders */}
          <div style={{ ...cardBase, padding: tokens.spacing[4], marginBottom: tokens.spacing[4] }}>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700], display: 'block', marginBottom: tokens.spacing[4] }}>Performance Ratings</Text>
            {CRITERIA.map(criterion => {
              const barPct = (scores[criterion] / 5) * 100;
              const progressBar = createProgressBarStyle(tokens, { percent: barPct, color: getScoreColor(scores[criterion]) });
              return (
                <div key={criterion} style={{ marginBottom: tokens.spacing[4] }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[2] }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700] }}>{criterion}</Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: getScoreColor(scores[criterion]) }}>{scores[criterion]}/5</Text>
                  </div>
                  <div style={{ display: 'flex', gap: tokens.spacing[1] }}>
                    {[1, 2, 3, 4, 5].map(v => (
                      <div key={v} onClick={() => setScores(p => ({ ...p, [criterion]: v }))} style={{ flex: 1, padding: `${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${v <= scores[criterion] ? tokens.colors.primaryScale[300] : tokens.colors.neutral[200]}`, backgroundColor: v <= scores[criterion] ? tokens.colors.primaryScale[50] : tokens.colors.common.white, color: v <= scores[criterion] ? tokens.colors.primaryScale[700] : tokens.colors.neutral[400], fontWeight: tokens.typography.fontWeight.semibold, fontSize: tokens.typography.fontSize.sm, cursor: 'pointer', textAlign: 'center' as const, transition: `all ${tokens.motion.hover}` }}>
                        {v}
                      </div>
                    ))}
                  </div>
                  <div style={{ ...progressBar.track, height: 4, marginTop: tokens.spacing[1] }}><div style={{ ...progressBar.fill, height: '100%' }} /></div>
                </div>
              );
            })}

            {/* Average */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: `${tokens.spacing[3]}px 0`, borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, marginTop: tokens.spacing[2] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>Average Score</Text>
              <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                <span style={createBadgeStyle(tokens, avgScore >= 4 ? 'success' : avgScore >= 3 ? 'warning' : 'error')}>{avgScore >= 4 ? 'Excellent' : avgScore >= 3 ? 'Good' : 'Needs Improvement'}</span>
                <Text style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: getScoreColor(avgScore) }}>{avgScore.toFixed(1)}</Text>
              </div>
            </div>
          </div>

          {/* Comments */}
          <div style={{ ...cardBase, padding: tokens.spacing[4], marginBottom: tokens.spacing[4] }}>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700], display: 'block', marginBottom: tokens.spacing[2] }}>Comments</Text>
            <textarea value={comments} onChange={e => setComments(e.target.value)} placeholder="Add your notes about this staff member's performance..." rows={4} style={{ width: '100%', padding: tokens.spacing[3], borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[900], resize: 'vertical' as const, fontFamily: 'inherit', outline: 'none', backgroundColor: tokens.colors.common.white }} />
          </div>

          {/* Submit */}
          <div onClick={handleSubmit} style={{ width: '100%', padding: `${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md, backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.bold, cursor: 'pointer', textAlign: 'center' as const, ...hoverStyle }}>
            Submit Evaluation
          </div>
        </div>
      </Box>
    );
  },
});
