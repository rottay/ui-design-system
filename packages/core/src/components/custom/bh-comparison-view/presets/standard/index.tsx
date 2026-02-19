'use client';

/**
 * BhComparisonView - Standard Preset
 * Side-by-side candidate comparison with radar chart, color-coded scoring grid,
 * strengths/weaknesses, and decision actions.
 * 10/10 quality: zero raw HTML, personality-driven, glass-aware, ARIA.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  getPersonalityBadgeRadius,
  getPersonalityTypography,
  createEntranceAnimation,
  createStaggerDelay,
  createIconContainerStyle,
  createPersonalitySectionHeaderStyle,
  createBadgeStyle,
  createProgressBarStyle,
  createCardHoverStyles,
  createPersonalityAccentBar,
} from '../../../helpers';
import type {
  BhComparisonViewProps, ComparisonCandidate, ComparisonRow, CandidateDecision,
} from '../../core';
import {
  getScoreColor, getScoreBgColor, getCandidateInitials,
  getDecisionColors, getCandidateColor,
} from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  Plus, X, ChevronUp, ChevronDown, ThumbsUp, ThumbsDown,
  Pause, Eye, Trophy, AlertTriangle, Star, Radar,
} from 'lucide-react';

/* ---------------------------------------------------------------------------
 * ScoreRing - uses Box/Text from parent, passed via closure
 * -------------------------------------------------------------------------*/

function ScoreRingInner({ score, t, size = 56, Box, Text }: {
  score: number; t: DesignTokens; size?: number;
  Box: any; Text: any;
}) {
  const color = getScoreColor(score, t);
  const r = (size / 2) - 4;
  const c = 2 * Math.PI * r;
  return (
    <Box style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={t.colors.neutral[100]} strokeWidth="3" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={c} strokeDashoffset={c - (score / 100) * c} strokeLinecap="round"
          style={{ transition: `stroke-dashoffset ${t.motion.hover}` }} />
      </svg>
      <Box style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color, lineHeight: 1 }}>{score}</Text>
        <Text style={{ fontSize: 8, color: t.colors.neutral[400], marginTop: 1 }}>score</Text>
      </Box>
    </Box>
  );
}

/* ---------------------------------------------------------------------------
 * Radar Chart (SVG) - svg/path/line/text allowed
 * -------------------------------------------------------------------------*/

function RadarChart({ candidates, dimensions, tokens: t }: { candidates: ComparisonCandidate[]; dimensions: string[]; tokens: DesignTokens }) {
  const size = 200; const cx = size / 2; const cy = size / 2; const maxR = 80;
  const n = dimensions.length;
  const angles = dimensions.map((_, i) => (Math.PI * 2 * i) / n - Math.PI / 2);

  const getPoint = (angle: number, value: number) => ({
    x: cx + Math.cos(angle) * (value / 100) * maxR,
    y: cy + Math.sin(angle) * (value / 100) * maxR,
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Radar chart comparing candidates">
      {/* Grid rings */}
      {[25, 50, 75, 100].map(level => (
        <polygon key={level} points={angles.map(a => { const p = getPoint(a, level); return `${p.x},${p.y}`; }).join(' ')}
          fill="none" stroke={t.colors.neutral[100]} strokeWidth="1" />
      ))}
      {/* Axis lines + labels */}
      {angles.map((a, i) => {
        const p = getPoint(a, 100);
        const lp = getPoint(a, 115);
        return (
          <g key={i}>
            <line x1={cx} y1={cy} x2={p.x} y2={p.y} stroke={t.colors.neutral[100]} strokeWidth="1" />
            <text x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="middle"
              style={{ fontSize: 9, fill: t.colors.neutral[500], fontWeight: 500 }}>{dimensions[i]}</text>
          </g>
        );
      })}
      {/* Candidate polygons */}
      {candidates.map((cand, ci) => {
        const cc = getCandidateColor(ci, t);
        const points = cand.dimensionScores.map((ds, i) => {
          const p = getPoint(angles[i], ds.score);
          return `${p.x},${p.y}`;
        }).join(' ');
        return (
          <polygon key={cand.id} points={points}
            fill={cc.light} fillOpacity={0.3} stroke={cc.stroke} strokeWidth="2" />
        );
      })}
    </svg>
  );
}

/* ---------------------------------------------------------------------------
 * Preset
 * -------------------------------------------------------------------------*/

export const StandardBhComparisonView = createPreset<BhComparisonViewProps>({
  name: 'BhComparisonView.Standard',
  render: ({ primitives, props, tokens: t, ext }: PresetContext<BhComparisonViewProps>) => {
    const { Box, Text } = primitives;
    const br = getPersonalityBadgeRadius(t);
    const dc = useMemo(() => getDecisionColors(t), [t]);
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);

    const glassCardBg = useMemo(() => {
      if (t.surface.useGlass && t.glass) {
        return { backdropFilter: t.glass.blur, WebkitBackdropFilter: t.glass.blur, backgroundColor: t.glass.bg };
      }
      return { backgroundColor: t.colors.common.white };
    }, [t]);

    const {
      candidates: rawCandidates = [], comparisonRows: rawComparisonRows = [],
      onAddCandidate, onRemoveCandidate, highlightBest: hbp = true,
      onHighlightToggle, decisions: dp, onDecisionChange,
      showRadar: srp = true, onRadarToggle,
      className, style,
    } = props;

    const candidates = Array.isArray(rawCandidates) ? rawCandidates : [];
    const comparisonRows = Array.isArray(rawComparisonRows) ? rawComparisonRows : [];

    // Extension helpers
    const extA11y = ext.a11yConfig();

    const expandedRowsProp = props.expandedRows;
    const onRowToggle = props.onRowToggle;

    const [highlightBest, setHighlightBest] = useState(hbp);
    const [showRadar, setShowRadar] = useState(srp);
    const [expanded, setExpanded] = useState<Set<string>>(new Set(expandedRowsProp ?? []));
    const [iDecisions, setIDecisions] = useState<CandidateDecision[]>([]);
    const decisions = dp ?? iDecisions;

    // Sync expanded from prop
    useEffect(() => {
      if (expandedRowsProp) setExpanded(new Set(expandedRowsProp));
    }, [expandedRowsProp]);

    const handleRowToggle = useCallback((dimension: string) => {
      setExpanded(prev => {
        const next = new Set(prev);
        if (next.has(dimension)) next.delete(dimension);
        else next.add(dimension);
        return next;
      });
      onRowToggle?.(dimension);
    }, [onRowToggle]);

    const dimensions = useMemo(() => comparisonRows.map(r => r.dimension), [comparisonRows]);
    const cardBase = useMemo(() => createCardStyle(t, { elevation: 'md' }), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);

    const getDecision = useCallback((id: string) => decisions.find(d => d.candidateId === id), [decisions]);

    const handleToggleRadar = useCallback(() => {
      setShowRadar(prev => !prev);
      onRadarToggle?.(!showRadar);
    }, [showRadar, onRadarToggle]);

    const handleAddCandidate = useCallback(() => { onAddCandidate?.(); }, [onAddCandidate]);

    const handleRemoveCandidate = useCallback((id: string) => {
      onRemoveCandidate?.(id);
    }, [onRemoveCandidate]);

    const handleDecisionChange = useCallback((candidateId: string, action: 'advance' | 'hold' | 'reject') => {
      const newDec = { candidateId, decision: action };
      onDecisionChange?.(newDec);
      if (!dp) setIDecisions(prev => [...prev.filter(d => d.candidateId !== candidateId), newDec]);
    }, [dp, onDecisionChange]);

    return (
      <Box className={className} style={{
        ...cardBase,
        display: 'flex', flexDirection: 'column', width: '100%', height: '100%',
        ...glassCardBg, overflow: 'hidden', ...style,
      }}
        {...(extA11y.ariaLabel ? { 'aria-label': extA11y.ariaLabel } : {})}>
        {accentBar && <Box style={accentBar} />}
        {ext.slot('header:start')}
        {/* Header */}
        <Box style={{
          padding: `${t.spacing[5]}px ${t.spacing[6]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          backgroundColor: t.colors.neutral[50],
        }}>
          <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
            <Text style={{
              fontSize: t.typography.fontSize.lg,
              fontWeight: ptypo.headingWeight,
              letterSpacing: ptypo.headingLetterSpacing,
              color: t.colors.neutral[900],
            }}>Candidate Comparison</Text>
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500]}}>{candidates.length} candidates side by side</Text>
          </Box>
          <Box style={{ display: 'flex', gap: t.spacing[2] }}>
            <Box
              role="button"
              tabIndex={0}
              aria-label="Toggle radar chart"
              aria-pressed={showRadar}
              onClick={handleToggleRadar}
              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleToggleRadar(); } }}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: `${t.spacing[2]}px ${t.spacing[3]}px`, borderRadius: t.borderRadius.lg,
                border: `1px solid ${showRadar ? t.colors.primaryScale[300] : t.colors.neutral[200]}`,
                backgroundColor: showRadar ? t.colors.primaryScale[50] : t.colors.common.white,
                color: showRadar ? t.colors.primaryScale[700] : t.colors.neutral[600],
                fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium,
                cursor: 'pointer', transition: `all ${t.motion.hover}`,
              }}
            ><Radar size={13} /> Radar</Box>
            {onAddCandidate && (
              <Box
                role="button"
                tabIndex={0}
                aria-label="Add candidate"
                onClick={handleAddCandidate}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleAddCandidate(); } }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: `${t.spacing[2]}px ${t.spacing[3]}px`, borderRadius: t.borderRadius.lg,
                  border: 'none', backgroundColor: t.colors.primaryScale[600], color: t.colors.common.white,
                  fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium,
                  cursor: 'pointer', transition: `all ${t.motion.hover}`,
                }}
              ><Plus size={13} /> Add Candidate</Box>
            )}
          </Box>
        </Box>

        <Box style={{ flex: 1, overflow: 'auto', padding: `${t.spacing[6]}px` }}>
          {/* Radar chart */}
          {showRadar && (
            <Box style={{ display: 'flex', justifyContent: 'center', marginBottom: t.spacing[6], ...entrance.animate, transition: entrance.transition }}>
              <Box style={{ textAlign: 'center' }}>
                <RadarChart candidates={candidates} dimensions={dimensions} tokens={t} />
                <Box style={{ display: 'flex', justifyContent: 'center', gap: t.spacing[4], marginTop: t.spacing[3] }}>
                  {candidates.map((c, i) => {
                    const cc = getCandidateColor(i, t);
                    return (
                      <Box key={c.id} style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                        <Box style={{ width: 10, height: 10, borderRadius: t.borderRadius.full, backgroundColor: cc.stroke }} />
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600] }}>{c.name}</Text>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            </Box>
          )}

          {/* Candidate headers */}
          <Box style={{ display: 'grid', gridTemplateColumns: `160px repeat(${candidates.length}, 1fr)`, gap: t.spacing[3], marginBottom: t.spacing[4] }}>
            <Box />
            {candidates.map((c, i) => {
              const cc = getCandidateColor(i, t);
              const dec = getDecision(c.id);
              return (
                <Box key={c.id} style={{
                  padding: `${t.spacing[4]}px`, borderRadius: t.borderRadius.xl,
                  backgroundColor: t.colors.common.white, border: `1px solid ${t.colors.neutral[100]}`,
                  textAlign: 'center', position: 'relative',
                  ...entrance.animate,
                  transitionDelay: `${createStaggerDelay(t, i)}ms`,
                  transition: entrance.transition,
                }}>
                  {onRemoveCandidate && (
                    <Box
                      role="button"
                      tabIndex={0}
                      aria-label={`Remove ${c.name}`}
                      onClick={() => handleRemoveCandidate(c.id)}
                      onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleRemoveCandidate(c.id); } }}
                      style={{
                        position: 'absolute', top: t.spacing[2], right: t.spacing[2],
                        width: 20, height: 20, borderRadius: t.borderRadius.full,
                        border: 'none', backgroundColor: t.colors.neutral[100], color: t.colors.neutral[500],
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', padding: 0, transition: `all ${t.motion.hover}`,
                      }}
                    ><X size={10} /></Box>
                  )}
                  {c.rank === 1 && <Trophy size={14} style={{ color: t.colors.warningScale[500], marginBottom: t.spacing[1] }} />}
                  <Box style={{
                    width: 48, height: 48, borderRadius: t.borderRadius.full, margin: '0 auto',
                    backgroundColor: cc.light, color: cc.stroke, border: `2px solid ${cc.stroke}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, marginBottom: t.spacing[2],
                  }}>{getCandidateInitials(c.name)}</Box>
                  <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[900] }}>{c.name}</Text>
                  <Box style={{ display: 'flex', justifyContent: 'center', marginTop: t.spacing[2] }}>
                    <ScoreRingInner score={c.overallScore} t={t} size={48} Box={Box} Text={Text} />
                  </Box>
                  <Box style={{
                    padding: `1px ${t.spacing[2]}px`, borderRadius: br, marginTop: t.spacing[2],
                    backgroundColor: t.colors.neutral[50], fontSize: t.typography.fontSize.xs,
                    fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[600], display: 'inline-block',
                  }}>Rank #{c.rank}</Box>

                  {/* Decision buttons */}
                  <Box role="radiogroup" aria-label={`Decision for ${c.name}`} style={{ display: 'flex', gap: t.spacing[1], justifyContent: 'center', marginTop: t.spacing[3] }}>
                    {(['advance', 'hold', 'reject'] as const).map(action => {
                      const active = dec?.decision === action;
                      const dcc = dc[action];
                      const icons = { advance: <ThumbsUp size={12} />, hold: <Pause size={12} />, reject: <ThumbsDown size={12} /> };
                      return (
                        <Box
                          key={action}
                          role="radio"
                          aria-checked={active}
                          aria-label={action}
                          tabIndex={0}
                          onClick={() => handleDecisionChange(c.id, action)}
                          onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleDecisionChange(c.id, action); } }}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: 28, height: 28, borderRadius: t.borderRadius.md,
                            border: `1px solid ${active ? dcc.border : t.colors.neutral[200]}`,
                            backgroundColor: active ? dcc.bgColor : t.colors.common.white,
                            color: active ? dcc.color : t.colors.neutral[400],
                            cursor: 'pointer', padding: 0, transition: `all ${t.motion.hover}`,
                          }}
                        >{icons[action]}</Box>
                      );
                    })}
                  </Box>
                </Box>
              );
            })}
          </Box>

          {/* Score grid */}
          <Box role="table" aria-label="Score comparison" style={{ borderRadius: t.borderRadius.lg, border: `1px solid ${t.colors.neutral[100]}`, overflow: 'hidden' }}>
            {comparisonRows.map((row, ri) => {
              const maxScore = Math.max(...row.scores.map(s => s.score));
              const isExpanded = expanded.has(row.dimension);
              return (
                <Box key={row.dimension} role="row" style={{
                  display: 'grid', gridTemplateColumns: `160px repeat(${candidates.length}, 1fr)`,
                  borderBottom: ri < comparisonRows.length - 1 ? `1px solid ${t.colors.neutral[100]}` : undefined,
                }}>
                  <Box
                    role="rowheader"
                    tabIndex={0}
                    aria-expanded={isExpanded}
                    onClick={() => handleRowToggle(row.dimension)}
                    onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleRowToggle(row.dimension); } }}
                    style={{
                    padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
                    fontSize: t.typography.fontSize.sm, fontWeight: isExpanded ? t.typography.fontWeight.bold : t.typography.fontWeight.medium,
                    color: t.colors.neutral[700], display: 'flex', alignItems: 'center', gap: t.spacing[1],
                    backgroundColor: isExpanded ? t.colors.primaryScale[50] : t.colors.neutral[50],
                    cursor: 'pointer', transition: `all ${t.motion.hover}`,
                  }}>
                    {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    {row.dimension}
                  </Box>
                  {row.scores.map(s => {
                    const isBest = highlightBest && s.score === maxScore;
                    const bar = createProgressBarStyle(t, { percent: s.score, color: getScoreColor(s.score, t) });
                    return (
                      <Box key={s.candidateId} role="cell" style={{
                        padding: isExpanded ? `${t.spacing[4]}px ${t.spacing[4]}px` : `${t.spacing[3]}px ${t.spacing[4]}px`,
                        display: 'flex', flexDirection: isExpanded ? 'column' as const : 'row' as const,
                        alignItems: isExpanded ? 'stretch' : 'center', justifyContent: isExpanded ? 'flex-start' : 'center', gap: t.spacing[2],
                        backgroundColor: isBest ? getScoreBgColor(s.score, t) : t.colors.common.white,
                        transition: `padding ${t.motion.hover}`,
                      }}>
                        <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                          <Box style={{ flex: 1, ...bar.track }}>
                            <Box style={bar.fill} />
                          </Box>
                          <Text style={{
                            fontSize: t.typography.fontSize.sm, fontWeight: isBest ? t.typography.fontWeight.bold : t.typography.fontWeight.medium,
                            color: getScoreColor(s.score, t), minWidth: 28, textAlign: 'right',
                          }}>{s.score}</Text>
                          {isBest && <Star size={12} style={{ color: t.colors.warningScale[500] }} />}
                        </Box>
                        {isExpanded && (
                          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: t.spacing[1] }}>
                            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                              {s.score >= 80 ? 'Excellent' : s.score >= 60 ? 'Good' : s.score >= 40 ? 'Average' : 'Needs improvement'}
                            </Text>
                            <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: getScoreColor(s.score, t) }}>
                              {s.score}/100
                            </Text>
                          </Box>
                        )}
                      </Box>
                    );
                  })}
                </Box>
              );
            })}
          </Box>

          {/* Strengths & Weaknesses */}
          <Box style={{ display: 'grid', gridTemplateColumns: `160px repeat(${candidates.length}, 1fr)`, gap: t.spacing[3], marginTop: t.spacing[5] }}>
            <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[4], paddingTop: t.spacing[2] }}>
              <Text style={{
                fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold,
                color: t.colors.successScale[600],
                textTransform: ptypo.labelTransform,
                letterSpacing: ptypo.labelLetterSpacing,
              }}>Strengths</Text>
            </Box>
            {candidates.map(c => (
              <Box key={c.id} role="list" aria-label={`Strengths for ${c.name}`} style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[1] }}>
                {c.strengths.map((s, i) => (
                  <Box key={i} role="listitem" style={{
                    display: 'flex', alignItems: 'flex-start', gap: t.spacing[1],
                    padding: `${t.spacing[2]}px`, borderRadius: t.borderRadius.md,
                    backgroundColor: t.colors.successScale[50],
                  }}>
                    <ThumbsUp size={11} style={{ color: t.colors.successScale[500], flexShrink: 0, marginTop: t.spacing[1] }} />
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.successScale[700] }}>{s}</Text>
                  </Box>
                ))}
              </Box>
            ))}
          </Box>

          <Box style={{ display: 'grid', gridTemplateColumns: `160px repeat(${candidates.length}, 1fr)`, gap: t.spacing[3], marginTop: t.spacing[3] }}>
            <Box style={{ paddingTop: t.spacing[2] }}>
              <Text style={{
                fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold,
                color: t.colors.errorScale[600],
                textTransform: ptypo.labelTransform,
                letterSpacing: ptypo.labelLetterSpacing,
              }}>Weaknesses</Text>
            </Box>
            {candidates.map(c => (
              <Box key={c.id} role="list" aria-label={`Weaknesses for ${c.name}`} style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[1] }}>
                {c.weaknesses.map((w, i) => (
                  <Box key={i} role="listitem" style={{
                    display: 'flex', alignItems: 'flex-start', gap: t.spacing[1],
                    padding: `${t.spacing[2]}px`, borderRadius: t.borderRadius.md,
                    backgroundColor: t.colors.errorScale[50],
                  }}>
                    <AlertTriangle size={11} style={{ color: t.colors.errorScale[500], flexShrink: 0, marginTop: t.spacing[1] }} />
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.errorScale[700] }}>{w}</Text>
                  </Box>
                ))}
              </Box>
            ))}
          </Box>

          {ext.slot('detail')}
        </Box>
        {ext.slot('footer')}
      </Box>
    );
  },
});
