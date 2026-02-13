'use client';

/**
 * BhDecisionHub - Standard Preset
 * Full hiring decision workflow with candidate queue, detail panel,
 * decision form, and history timeline. Slite-inspired warm design.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createCardHoverStyles,
  createEntranceAnimation,
  createStaggerDelay,
  createIconContainerStyle,
  createPersonalitySectionHeaderStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createPersonalityAccentBar,
  createEmptyStateStyle,
} from '../../../helpers';
import type {
  BhDecisionHubProps, DecisionCandidate, DecisionFormData,
  DecisionAction, RejectCategory, DecisionRecord, HistoryFilter,
} from '../../core';
import {
  getDecisionActionConfig, getRejectCategoryLabel, getHistoryFilterOptions,
  getCandidateInitials, getScoreColor, getScoreTrackColor,
} from '../../core';
import type { DesignTokens } from '../../../../../types';
import {
  ThumbsUp, ThumbsDown, Pause, CheckCircle, Clock, X,
  Sparkles, ChevronRight, AlertTriangle, FileText, User,
  MessageSquare, Calendar,
} from 'lucide-react';

/* ---------------------------------------------------------------------------
 * Default Data
 * -------------------------------------------------------------------------*/

const DEFAULT_CANDIDATES: DecisionCandidate[] = [
  { id: 'c-1', name: 'Sarah Johnson', rank: 1, scorePercent: 92, highlights: ['Google experience', 'React expert'], aiRecommendation: 'Strong Advance - top 5% match', pros: ['Deep technical skills', 'Strong leadership potential', 'Cultural alignment'], cons: ['Limited backend'], riskFactors: [] },
  { id: 'c-2', name: 'Michael Chen', rank: 2, scorePercent: 88, highlights: ['Stripe full-stack', 'Go expertise'], aiRecommendation: 'Advance - solid match', pros: ['Full-stack capability', 'Startup mindset'], cons: ['Short tenure', 'Needs mentoring'], riskFactors: ['Flight risk - has competing offers'] },
  { id: 'c-3', name: 'Emily Rodriguez', rank: 3, scorePercent: 85, highlights: ['Staff at Meta', 'System design'], aiRecommendation: 'Advance with caution', pros: ['Staff-level experience'], cons: ['High salary expectations', 'Culture concerns'], riskFactors: ['May not accept at our range'] },
];

const DEFAULT_HISTORY: DecisionRecord[] = [
  { candidateId: 'c-4', decision: 'advance', reason: 'Strong technical skills', decidedBy: 'Jane Doe', decidedAt: '2025-01-15T10:00:00Z' },
  { candidateId: 'c-5', decision: 'reject', rejectCategory: 'not_qualified', reason: 'Below technical threshold', decidedBy: 'Jane Doe', decidedAt: '2025-01-14T15:30:00Z' },
  { candidateId: 'c-6', decision: 'hold', reason: 'Waiting for references', decidedBy: 'John Smith', decidedAt: '2025-01-14T09:00:00Z' },
];

/* ---------------------------------------------------------------------------
 * ScoreRing
 * -------------------------------------------------------------------------*/

/* Module-level refs for sub-components */
let _Box: any;
let _Text: any;

function ScoreRing({ score, tokens: t, size = 56 }: { score: number; tokens: DesignTokens; size?: number }) {
  const color = getScoreColor(t, score);
  const r = (size / 2) - 4; const c = 2 * Math.PI * r;
  const Box = _Box;
  const Text = _Text;
  return (
    <Box style={{ position: 'relative' as const, width: size, height: size, flexShrink: 0 }} role="img" aria-label={`Score: ${score}%`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={getScoreTrackColor(t)} strokeWidth="3" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={c} strokeDashoffset={c - (score / 100) * c} strokeLinecap="round"
          style={{ transition: `stroke-dashoffset ${t.motion.hover}` }} />
      </svg>
      <Box style={{ position: 'absolute' as const, top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color, lineHeight: 1 }}>{score}</Text>
      </Box>
    </Box>
  );
}

/* ---------------------------------------------------------------------------
 * Preset
 * -------------------------------------------------------------------------*/

export const StandardBhDecisionHub = createPreset<BhDecisionHubProps>({
  name: 'BhDecisionHub.Standard',
  render: ({ primitives, props, tokens: t }: PresetContext<BhDecisionHubProps>) => {
    const { Box, Text } = primitives;
    _Box = Box;
    _Text = Text;
    const isGlass = t.surface.useGlass;
    const br = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);
    const dac = useMemo(() => getDecisionActionConfig(t), [t]);
    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const sectionHeaderStyle = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);

    const {
      jobName = 'Senior Frontend Engineer', pendingCount = 3,
      candidates = DEFAULT_CANDIDATES,
      selectedCandidate: scp, onCandidateSelect,
      decision: dp, onDecisionChange,
      history = DEFAULT_HISTORY, historyFilter: hfp, onHistoryFilterChange,
      advanceSteps = ['Technical Interview', 'Culture Interview', 'Final Round', 'Offer'],
      onSubmitDecision,
      className, style,
    } = props;

    const [iSelected, setISelected] = useState<string | null>(candidates[0]?.id ?? null);
    const [iDecision, setIDecision] = useState<DecisionFormData>({});
    const [iHistFilter, setIHistFilter] = useState<HistoryFilter>('all');

    const selected = scp ?? iSelected;
    const decision = dp ?? iDecision;
    const histFilter = hfp ?? iHistFilter;

    const activeCand = candidates.find(c => c.id === selected);

    const setDecision = (d: DecisionFormData) => { onDecisionChange?.(d); if (!dp) setIDecision(d); };

    const filteredHistory = useMemo(() => {
      if (histFilter === 'all') return history;
      return history.filter(h => h.decision === histFilter);
    }, [history, histFilter]);

    return (
      <Box className={className} style={{
        ...createCardStyle(t, { elevation: 'md', glass: isGlass }),
        display: 'flex', height: '100%', backgroundColor: t.colors.common.white, overflow: 'hidden', ...style,
      }}>
        {/* Left: Candidate queue */}
        <Box style={{
          width: 280, flexShrink: 0, borderRight: `1px solid ${t.colors.neutral[100]}`,
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], padding: `${t.spacing[5]}px`, borderBottom: `1px solid ${t.colors.neutral[100]}` }}>
            <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[900] }}>Decision Queue</Text>
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500]}}>{pendingCount} pending decisions</Text>
          </Box>
          <Box style={{ flex: 1, overflow: 'auto' }}>
            {candidates.map(c => {
              const active = selected === c.id;
              return (
                <Box key={c.id} onClick={() => { onCandidateSelect?.(c.id); if (!scp) setISelected(c.id); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: t.spacing[3],
                    padding: `${t.spacing[3]}px ${t.spacing[4]}px`, cursor: 'pointer',
                    backgroundColor: active ? t.colors.primaryScale[50] : 'transparent',
                    borderLeft: active ? `3px solid ${t.colors.primaryScale[500]}` : '3px solid transparent',
                    borderBottom: `1px solid ${t.colors.neutral[50]}`,
                    transition: `all ${t.motion.hover}`,
                  }}>
                  <Box style={{
                    width: 36, height: 36, borderRadius: t.borderRadius.full,
                    backgroundColor: t.colors.primaryScale[50], color: t.colors.primaryScale[700],
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold, flexShrink: 0,
                  }}>{getCandidateInitials(c.name)}</Box>
                  <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], flex: 1, minWidth: 0 }}>
                    <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[900] }}>{c.name}</Text>
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>Rank #{c.rank} - {c.scorePercent}%</Text>
                  </Box>
                  <ChevronRight size={14} style={{ color: t.colors.neutral[300] }} />
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Center: Decision panel */}
        <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {activeCand ? (
            <>
              {/* Candidate header */}
              <Box style={{ padding: `${t.spacing[5]}px ${t.spacing[6]}px`, borderBottom: `1px solid ${t.colors.neutral[100]}` }}>
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[4] }}>
                  <Box style={{
                    width: 52, height: 52, borderRadius: t.borderRadius.full,
                    backgroundColor: t.colors.primaryScale[50], color: t.colors.primaryScale[700],
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, flexShrink: 0,
                  }}>{getCandidateInitials(activeCand.name)}</Box>
                  <Box style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                    <Text style={{ fontSize: t.typography.fontSize.xl, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[900] }}>{activeCand.name}</Text>
                    <Box style={{ display: 'flex', gap: t.spacing[2] }}>
                      {activeCand.highlights.map((h, i) => (
                        <Box key={i} style={{ padding: `1px ${t.spacing[2]}px`, borderRadius: br, backgroundColor: t.colors.neutral[50], fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600] }}>{h}</Box>
                      ))}
                    </Box>
                  </Box>
                  <ScoreRing score={activeCand.scorePercent} tokens={t} />
                </Box>
              </Box>

              <Box style={{ flex: 1, overflow: 'auto', padding: `${t.spacing[6]}px` }}>
                {/* AI Recommendation */}
                <Box style={{
                  display: 'flex', alignItems: 'center', gap: t.spacing[3],
                  padding: `${t.spacing[4]}px`, borderRadius: t.borderRadius.lg,
                  backgroundColor: t.colors.primaryScale[50], border: `1px solid ${t.colors.primaryScale[200]}`,
                  marginBottom: t.spacing[5],
                }}>
                  <Sparkles size={18} style={{ color: t.colors.primaryScale[600] }} />
                  <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                    <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.primaryScale[700] }}>AI Recommendation</Text>
                    <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.primaryScale[800] }}>{activeCand.aiRecommendation}</Text>
                  </Box>
                </Box>

                {/* Pros / Cons / Risks */}
                <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: t.spacing[4], marginBottom: t.spacing[5] }}>
                  <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                    <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.successScale[600], textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: t.spacing[1] }}>Pros</Text>
                    {activeCand.pros.map((p, i) => (
                      <Box key={i} style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                        <ThumbsUp size={10} style={{ color: t.colors.successScale[500], flexShrink: 0 }} />
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[700] }}>{p}</Text>
                      </Box>
                    ))}
                  </Box>
                  <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                    <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.errorScale[600], textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: t.spacing[1] }}>Cons</Text>
                    {activeCand.cons.map((c, i) => (
                      <Box key={i} style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                        <ThumbsDown size={10} style={{ color: t.colors.errorScale[500], flexShrink: 0 }} />
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[700] }}>{c}</Text>
                      </Box>
                    ))}
                  </Box>
                  <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                    <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.warningScale[600], textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: t.spacing[1] }}>Risk Factors</Text>
                    {activeCand.riskFactors.length > 0 ? activeCand.riskFactors.map((r, i) => (
                      <Box key={i} style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                        <AlertTriangle size={10} style={{ color: t.colors.warningScale[500], flexShrink: 0 }} />
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[700] }}>{r}</Text>
                      </Box>
                    )) : (
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>No risk factors identified</Text>
                    )}
                  </Box>
                </Box>

                {/* Decision actions */}
                <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[3], marginBottom: t.spacing[5] }}>
                  <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[500], textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Decision</Text>
                  <Box style={{ display: 'flex', gap: t.spacing[3] }}>
                    {(['advance', 'hold', 'reject'] as DecisionAction[]).map(action => {
                      const cfg = dac[action];
                      const active = decision.action === action;
                      const icons = { advance: <ThumbsUp size={16} />, hold: <Pause size={16} />, reject: <ThumbsDown size={16} /> };
                      return (
                        <Box key={action} onClick={() => setDecision({ ...decision, action })} role="button" tabIndex={0} aria-label={`${cfg.label} candidate`} aria-pressed={active} onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setDecision({ ...decision, action }); } }} style={{
                          flex: 1, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: t.spacing[2],
                          padding: `${t.spacing[4]}px`, borderRadius: t.borderRadius.xl,
                          border: `2px solid ${active ? cfg.borderColor : t.colors.neutral[100]}`,
                          backgroundColor: active ? cfg.bgColor : t.colors.common.white,
                          color: active ? cfg.color : t.colors.neutral[500], cursor: 'pointer',
                          transition: `all ${t.motion.hover}`,
                        }}>
                          {icons[action]}
                          <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold }}>{cfg.label}</Text>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>

                {/* Advance: next step selection */}
                {decision.action === 'advance' && (
                  <Box style={{ marginBottom: t.spacing[4] }}>
                    <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[500], marginBottom: t.spacing[2] }}>Next Step</Text>
                    <Box style={{ display: 'flex', gap: t.spacing[2], flexWrap: 'wrap' }}>
                      {advanceSteps.map(step => (
                        <Box key={step} onClick={() => setDecision({ ...decision, advanceStep: step })} role="button" tabIndex={0} aria-label={`Select step: ${step}`} aria-pressed={decision.advanceStep === step} onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setDecision({ ...decision, advanceStep: step }); } }} style={{
                          padding: `${t.spacing[2]}px ${t.spacing[3]}px`, borderRadius: br,
                          border: `1px solid ${decision.advanceStep === step ? t.colors.successScale[300] : t.colors.neutral[200]}`,
                          backgroundColor: decision.advanceStep === step ? t.colors.successScale[50] : t.colors.common.white,
                          color: decision.advanceStep === step ? t.colors.successScale[700] : t.colors.neutral[600],
                          fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, cursor: 'pointer',
                          transition: `all ${t.motion.hover}`,
                        }}>
                          <Text style={{ fontSize: t.typography.fontSize.xs }}>{step}</Text>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Reject: category selection */}
                {decision.action === 'reject' && (
                  <Box style={{ marginBottom: t.spacing[4] }}>
                    <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[500], marginBottom: t.spacing[2] }}>Rejection Reason</Text>
                    <Box style={{ display: 'flex', gap: t.spacing[2], flexWrap: 'wrap' }}>
                      {(['not_qualified', 'culture_fit', 'compensation', 'timing', 'other'] as RejectCategory[]).map(cat => (
                        <Box key={cat} onClick={() => setDecision({ ...decision, rejectCategory: cat })} role="button" tabIndex={0} aria-label={`Reject reason: ${getRejectCategoryLabel(cat)}`} aria-pressed={decision.rejectCategory === cat} onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setDecision({ ...decision, rejectCategory: cat }); } }} style={{
                          padding: `${t.spacing[2]}px ${t.spacing[3]}px`, borderRadius: br,
                          border: `1px solid ${decision.rejectCategory === cat ? t.colors.errorScale[300] : t.colors.neutral[200]}`,
                          backgroundColor: decision.rejectCategory === cat ? t.colors.errorScale[50] : t.colors.common.white,
                          color: decision.rejectCategory === cat ? t.colors.errorScale[700] : t.colors.neutral[600],
                          fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, cursor: 'pointer',
                          transition: `all ${t.motion.hover}`,
                        }}>
                          <Text style={{ fontSize: t.typography.fontSize.xs }}>{getRejectCategoryLabel(cat)}</Text>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Submit */}
                {decision.action && (
                  <Box onClick={() => onSubmitDecision?.(activeCand.id, decision)} role="button" tabIndex={0} aria-label="Submit decision" onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSubmitDecision?.(activeCand.id, decision); } }} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: t.spacing[2],
                    padding: `${t.spacing[3]}px ${t.spacing[6]}px`, borderRadius: t.borderRadius.lg,
                    backgroundColor: dac[decision.action!].color, color: t.colors.common.white,
                    fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, cursor: 'pointer', width: '100%',
                    transition: `all ${t.motion.hover}`,
                  }}>
                    <CheckCircle size={16} />
                    <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.common.white }}>Submit Decision</Text>
                  </Box>
                )}
              </Box>
            </>
          ) : (
            <Box style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.colors.neutral[400] }}>
              <Text style={{ fontSize: t.typography.fontSize.sm }}>Select a candidate to begin</Text>
            </Box>
          )}
        </Box>

        {/* Right: History */}
        <Box style={{
          width: 260, flexShrink: 0, borderLeft: `1px solid ${t.colors.neutral[100]}`,
          display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: t.colors.neutral[50],
        }}>
          <Box style={{ padding: `${t.spacing[4]}px`, borderBottom: `1px solid ${t.colors.neutral[100]}` }}>
            <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[500], textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: t.spacing[2] }}>History</Text>
            <Box style={{ display: 'flex', gap: t.spacing[1] }}>
              {getHistoryFilterOptions().map(opt => {
                const active = histFilter === opt.value;
                return (
                  <Box key={opt.value} onClick={() => { onHistoryFilterChange?.(opt.value); if (!hfp) setIHistFilter(opt.value); }} role="button" tabIndex={0} aria-label={`Filter: ${opt.label}`} aria-pressed={active} onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onHistoryFilterChange?.(opt.value); if (!hfp) setIHistFilter(opt.value); } }}
                    style={{
                      padding: `1px ${t.spacing[2]}px`, borderRadius: br,
                      backgroundColor: active ? t.colors.primaryScale[50] : 'transparent',
                      color: active ? t.colors.primaryScale[700] : t.colors.neutral[500],
                      fontSize: t.typography.fontSize.xs, fontWeight: active ? t.typography.fontWeight.semibold : t.typography.fontWeight.medium, cursor: 'pointer',
                      transition: `all ${t.motion.hover}`,
                    }}>
                    <Text style={{ fontSize: t.typography.fontSize.xs }}>{opt.label}</Text>
                  </Box>
                );
              })}
            </Box>
          </Box>
          <Box style={{ flex: 1, overflow: 'auto', padding: `${t.spacing[3]}px` }}>
            {filteredHistory.map((h, i) => {
              const cfg = dac[h.decision];
              return (
                <Box key={i} style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1],
                  padding: `${t.spacing[3]}px`, borderRadius: t.borderRadius.lg,
                  backgroundColor: t.colors.common.white, border: `1px solid ${t.colors.neutral[100]}`,
                  marginBottom: t.spacing[2],
                }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], marginBottom: t.spacing[1] }}>
                    <Box style={{
                      padding: `1px ${t.spacing[2]}px`, borderRadius: br,
                      backgroundColor: cfg.bgColor, color: cfg.color,
                      fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold, textTransform: 'capitalize',
                    }}>{h.decision}</Box>
                  </Box>
                  {h.reason && <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600], marginBottom: t.spacing[1] }}>{h.reason}</Text>}
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>by {h.decidedBy} - {new Date(h.decidedAt).toLocaleDateString()}</Text>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    );
  },
});
