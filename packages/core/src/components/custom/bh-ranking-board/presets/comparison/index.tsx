'use client';

/**
 * BhRankingBoard - Comparison Preset
 * Visual comparison mode with radar charts for selected candidates,
 * side-by-side stage score breakdowns, and quick decision actions.
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, getPersonalityBadgeRadius } from '../../../helpers';
import type {
  BhRankingBoardProps, RankedCandidate, DecisionAction,
} from '../../core';
import {
  getDecisionActionColors, getScoreBarColor, getRankBadgeColors, getCandidateInitials,
} from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  ThumbsUp, ThumbsDown, Pause, Trophy, AlertTriangle, Star,
  ArrowLeftRight, ChevronLeft, ChevronRight,
} from 'lucide-react';

/* ---------------------------------------------------------------------------
 * Default Data
 * -------------------------------------------------------------------------*/

const DEFAULT_CANDIDATES: RankedCandidate[] = [
  { id: 'c-1', rank: 1, name: 'Sarah Johnson', overallScore: 92, stageScores: [{ stage: 'Technical', score: 95 }, { stage: 'Culture', score: 88 }, { stage: 'Leadership', score: 93 }, { stage: 'Experience', score: 91 }], completionPercent: 100, hasKnockout: false, decisionStatus: 'pending', strengths: ['Deep React expertise', 'Google-level experience'], weaknesses: ['Limited backend'] },
  { id: 'c-2', rank: 2, name: 'Michael Chen', overallScore: 88, stageScores: [{ stage: 'Technical', score: 90 }, { stage: 'Culture', score: 91 }, { stage: 'Leadership', score: 83 }, { stage: 'Experience', score: 88 }], completionPercent: 100, hasKnockout: false, decisionStatus: 'pending', strengths: ['Full-stack at Stripe'], weaknesses: ['Shorter tenure history'] },
];

/* ---------------------------------------------------------------------------
 * ScoreRing
 * -------------------------------------------------------------------------*/

function ScoreRing({ score, tokens: t, size = 72 }: { score: number; tokens: DesignTokens; size?: number }) {
  const color = getScoreBarColor(score, t);
  const r = (size / 2) - 5; const c = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={t.colors.neutral[100]} strokeWidth="4" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={c} strokeDashoffset={c - (score / 100) * c} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
      </svg>
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: t.typography.fontSize.xl, fontWeight: t.typography.fontWeight.bold, color, lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: 9, color: t.colors.neutral[400], marginTop: 2 }}>overall</span>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Radar Chart
 * -------------------------------------------------------------------------*/

function MiniRadar({ candidates, tokens: t }: { candidates: RankedCandidate[]; tokens: DesignTokens }) {
  if (candidates.length === 0) return null;
  const dims = candidates[0].stageScores.map(s => s.stage);
  const size = 180; const cx = size / 2; const cy = size / 2; const maxR = 70;
  const n = dims.length;
  const angles = dims.map((_, i) => (Math.PI * 2 * i) / n - Math.PI / 2);
  const getP = (a: number, v: number) => ({ x: cx + Math.cos(a) * (v / 100) * maxR, y: cy + Math.sin(a) * (v / 100) * maxR });

  const colors = [t.colors.primaryScale[500], t.colors.successScale[500], t.colors.warningScale[500]];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {[25, 50, 75, 100].map(lv => (
        <polygon key={lv} points={angles.map(a => { const p = getP(a, lv); return `${p.x},${p.y}`; }).join(' ')} fill="none" stroke={t.colors.neutral[100]} strokeWidth="1" />
      ))}
      {angles.map((a, i) => {
        const p = getP(a, 100); const lp = getP(a, 118);
        return (<g key={i}><line x1={cx} y1={cy} x2={p.x} y2={p.y} stroke={t.colors.neutral[100]} strokeWidth="1" />
          <text x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 8, fill: t.colors.neutral[500] }}>{dims[i]}</text></g>);
      })}
      {candidates.map((cand, ci) => {
        const pts = cand.stageScores.map((ss, i) => { const p = getP(angles[i], ss.score); return `${p.x},${p.y}`; }).join(' ');
        return <polygon key={cand.id} points={pts} fill={`${colors[ci % colors.length]}20`} stroke={colors[ci % colors.length]} strokeWidth="2" />;
      })}
    </svg>
  );
}

/* ---------------------------------------------------------------------------
 * Preset
 * -------------------------------------------------------------------------*/

export const ComparisonBhRankingBoard = createPreset<BhRankingBoardProps>({
  name: 'BhRankingBoard.Comparison',
  render: ({ primitives, props, tokens: t }: PresetContext<BhRankingBoardProps>) => {
    const { Box, Text } = primitives;
    const br = getPersonalityBadgeRadius(t);

    const {
      jobName = 'Senior Frontend Engineer',
      candidates = DEFAULT_CANDIDATES,
      selectedCandidates: scp, onSelectionChange,
      onDecisionChange, onCompare,
      className, style,
    } = props;

    const compared = useMemo(() => {
      if (scp && scp.length >= 2) return candidates.filter(c => scp.includes(c.id)).slice(0, 3);
      return candidates.slice(0, 2);
    }, [candidates, scp]);

    const stages = compared.length > 0 ? compared[0].stageScores.map(s => s.stage) : [];

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
              <ArrowLeftRight size={16} style={{ marginRight: t.spacing[2], verticalAlign: 'middle' }} />
              Head-to-Head Comparison
            </Text>
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], marginTop: 2 }}>{jobName} - {compared.length} candidates</Text>
          </Box>
        </Box>

        <Box style={{ flex: 1, overflow: 'auto', padding: `${t.spacing[6]}px` }}>
          {/* Radar chart centered */}
          <Box style={{ display: 'flex', justifyContent: 'center', marginBottom: t.spacing[5] }}>
            <Box style={{ textAlign: 'center' }}>
              <MiniRadar candidates={compared} tokens={t} />
              <Box style={{ display: 'flex', justifyContent: 'center', gap: t.spacing[4], marginTop: t.spacing[2] }}>
                {compared.map((c, i) => {
                  const colors = [t.colors.primaryScale[500], t.colors.successScale[500], t.colors.warningScale[500]];
                  return (
                    <Box key={c.id} style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                      <Box style={{ width: 8, height: 8, borderRadius: t.borderRadius.full, backgroundColor: colors[i % colors.length] }} />
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600] }}>{c.name}</Text>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Box>

          {/* Candidate cards side by side */}
          <Box style={{ display: 'grid', gridTemplateColumns: `repeat(${compared.length}, 1fr)`, gap: t.spacing[4], marginBottom: t.spacing[5] }}>
            {compared.map(c => {
              const rb = getRankBadgeColors(c.rank, t);
              return (
                <Box key={c.id} style={{
                  padding: `${t.spacing[5]}px`, borderRadius: t.borderRadius.xl,
                  border: `1px solid ${t.colors.neutral[100]}`, textAlign: 'center',
                }}>
                  {c.rank <= 3 && <Trophy size={16} style={{ color: t.colors.warningScale[500], marginBottom: t.spacing[2] }} />}
                  <Box style={{
                    width: 52, height: 52, borderRadius: t.borderRadius.full, margin: '0 auto',
                    backgroundColor: t.colors.primaryScale[50], color: t.colors.primaryScale[700],
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, marginBottom: t.spacing[2],
                  }}>{getCandidateInitials(c.name)}</Box>
                  <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[900] }}>{c.name}</Text>
                  <Box style={{ padding: `1px ${t.spacing[2]}px`, borderRadius: br, backgroundColor: rb.bg, color: rb.color, fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold, display: 'inline-block', marginTop: t.spacing[1] }}>
                    Rank #{c.rank}
                  </Box>
                  <Box style={{ display: 'flex', justifyContent: 'center', marginTop: t.spacing[3] }}>
                    <ScoreRing score={c.overallScore} tokens={t} />
                  </Box>
                  {c.hasKnockout && (
                    <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: t.spacing[2], color: t.colors.errorScale[600], fontSize: t.typography.fontSize.xs }}>
                      <AlertTriangle size={12} /> Knockout flag
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>

          {/* Stage-by-stage comparison */}
          <Box style={{ borderRadius: t.borderRadius.lg, border: `1px solid ${t.colors.neutral[100]}`, overflow: 'hidden', marginBottom: t.spacing[5] }}>
            {stages.map((stage, si) => {
              const scores = compared.map(c => {
                const ss = c.stageScores.find(s => s.stage === stage);
                return ss?.score ?? 0;
              });
              const maxScore = Math.max(...scores);
              return (
                <Box key={stage} style={{
                  display: 'grid', gridTemplateColumns: `120px repeat(${compared.length}, 1fr)`,
                  borderBottom: si < stages.length - 1 ? `1px solid ${t.colors.neutral[100]}` : undefined,
                }}>
                  <Box style={{ padding: `${t.spacing[3]}px ${t.spacing[4]}px`, backgroundColor: t.colors.neutral[50], fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[700], display: 'flex', alignItems: 'center' }}>
                    {stage}
                  </Box>
                  {scores.map((score, ci) => {
                    const isBest = score === maxScore;
                    return (
                      <Box key={ci} style={{ padding: `${t.spacing[3]}px ${t.spacing[4]}px`, display: 'flex', alignItems: 'center', gap: t.spacing[2], backgroundColor: isBest ? `${getScoreBarColor(score, t)}08` : t.colors.common.white }}>
                        <Box style={{ flex: 1, height: 6, borderRadius: t.borderRadius.full, backgroundColor: t.colors.neutral[100], overflow: 'hidden' }}>
                          <Box style={{ height: '100%', width: `${score}%`, backgroundColor: getScoreBarColor(score, t), borderRadius: t.borderRadius.full }} />
                        </Box>
                        <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: isBest ? t.typography.fontWeight.bold : t.typography.fontWeight.medium, color: getScoreBarColor(score, t), minWidth: 28, textAlign: 'right' }}>
                          {score}
                        </Text>
                        {isBest && <Star size={11} style={{ color: t.colors.warningScale[500] }} />}
                      </Box>
                    );
                  })}
                </Box>
              );
            })}
          </Box>

          {/* Strengths / Weaknesses */}
          <Box style={{ display: 'grid', gridTemplateColumns: `repeat(${compared.length}, 1fr)`, gap: t.spacing[4] }}>
            {compared.map(c => (
              <Box key={c.id}>
                <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[800], marginBottom: t.spacing[2] }}>{c.name}</Text>
                <Box style={{ marginBottom: t.spacing[3] }}>
                  {c.strengths.map((s, i) => (
                    <Box key={i} style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], marginBottom: 4 }}>
                      <ThumbsUp size={10} style={{ color: t.colors.successScale[500] }} />
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.successScale[700] }}>{s}</Text>
                    </Box>
                  ))}
                </Box>
                <Box>
                  {c.weaknesses.map((w, i) => (
                    <Box key={i} style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], marginBottom: 4 }}>
                      <AlertTriangle size={10} style={{ color: t.colors.errorScale[500] }} />
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.errorScale[700] }}>{w}</Text>
                    </Box>
                  ))}
                </Box>
                {/* Decision buttons */}
                <Box style={{ display: 'flex', gap: t.spacing[2], marginTop: t.spacing[3] }}>
                  {(['advance', 'hold', 'reject'] as DecisionAction[]).map(action => {
                    const ac = getDecisionActionColors(action, t);
                    const icons = { advance: <ThumbsUp size={12} />, hold: <Pause size={12} />, reject: <ThumbsDown size={12} /> };
                    return (
                      <button key={action} onClick={() => onDecisionChange?.(c.id, action)} style={{
                        display: 'flex', alignItems: 'center', gap: 3, flex: 1, justifyContent: 'center',
                        padding: `${t.spacing[2]}px`, borderRadius: br,
                        border: `1px solid ${ac.border}`, backgroundColor: ac.bg, color: ac.color,
                        fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, cursor: 'pointer',
                        textTransform: 'capitalize',
                      }}>{icons[action]} {action}</button>
                    );
                  })}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    );
  },
});
