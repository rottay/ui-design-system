'use client';

/**
 * BhDecisionHub - Bulk Preset
 * Rapid bulk decision-making with checklist view, batch actions, inline
 * AI recommendations, expandable candidate details, and a summary footer.
 * Slite-inspired warm design with generous whitespace.
 */

import { useState, useCallback, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, getPersonalityBadgeRadius } from '../../../helpers';
import type {
  BhDecisionHubProps, DecisionCandidate, DecisionAction,
  RejectCategory, BulkDecisionEntry,
} from '../../core';
import {
  getDecisionActionConfig, getRejectCategoryLabel,
  getCandidateInitials, formatScoreDisplay, getScoreColor,
} from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  Zap, ThumbsUp, ThumbsDown, Pause, Send, Check, X,
  ChevronDown, ChevronUp, Sparkles, AlertTriangle, RotateCcw,
} from 'lucide-react';

/* ---------------------------------------------------------------------------
 * Default Data
 * -------------------------------------------------------------------------*/

const DEFAULT_CANDIDATES: DecisionCandidate[] = [
  { id: 'dc-1', name: 'Sarah Johnson', rank: 1, scorePercent: 92, highlights: ['Deep React expertise', '6 yrs at Google', 'System design lead'], aiRecommendation: 'Strong advance. Top-tier technical skills with proven leadership at scale. Rare profile.', pros: ['Expert-level React & TypeScript', 'Led 40-person engineering org', 'Published speaker'], cons: ['Above budget by 12%', 'Notice period: 3 months'], riskFactors: ['Compensation gap'] },
  { id: 'dc-2', name: 'Michael Chen', rank: 2, scorePercent: 88, highlights: ['Full-stack at Stripe', 'Y Combinator alum', 'Open source contributor'], aiRecommendation: 'Advance recommended. Exceptional full-stack depth and startup resilience. Culture fit is strong.', pros: ['Stripe payments infrastructure', 'Founded YC startup', 'Strong culture alignment'], cons: ['Shorter tenure history (avg 1.5yr)', 'No direct management exp'], riskFactors: ['Tenure pattern'] },
  { id: 'dc-3', name: 'Emily Rodriguez', rank: 3, scorePercent: 85, highlights: ['Meta infra team', 'Distributed systems', 'PhD CS Stanford'], aiRecommendation: 'Consider advance. Deep technical background but interview performance was mixed on behavioral.', pros: ['PhD-level distributed systems', 'Meta scale experience'], cons: ['Behavioral interview below threshold', 'Prefers IC track only'], riskFactors: ['Behavioral score', 'IC-only preference'] },
  { id: 'dc-4', name: 'James Kim', rank: 4, scorePercent: 79, highlights: ['Anthropic ML engineer', 'AI safety research', 'Berkeley CS'], aiRecommendation: 'Hold recommended. Strong technical but role mismatch -- better fit for ML-focused position.', pros: ['Cutting-edge AI/ML skills', 'Published research'], cons: ['Role mismatch (ML vs frontend)', 'Limited web development'], riskFactors: ['Role alignment'] },
  { id: 'dc-5', name: 'Anna Kowalski', rank: 5, scorePercent: 74, highlights: ['Vercel DX team', 'Next.js contributor', 'Design systems'], aiRecommendation: 'Advance with reservations. Good DX skills but seniority level may be below target.', pros: ['Next.js core knowledge', 'Design system experience'], cons: ['3 years total experience', 'No team lead history'], riskFactors: ['Seniority gap'] },
  { id: 'dc-6', name: 'David Thompson', rank: 6, scorePercent: 67, highlights: ['Linear frontend', 'Product sense', 'CSS architecture'], aiRecommendation: 'Reject recommended. While product skills are good, technical depth insufficient for senior role.', pros: ['Strong product instincts', 'Clean CSS architecture'], cons: ['Technical depth below bar', 'Algorithm struggles', 'No system design experience'], riskFactors: ['Technical depth', 'Seniority'] },
];

/* ---------------------------------------------------------------------------
 * ScoreRing (mini)
 * -------------------------------------------------------------------------*/

function ScoreRing({ score, t }: { score: number; t: DesignTokens }) {
  const color = getScoreColor(t, score);
  const size = 36; const r = 13; const c = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={t.colors.neutral[100]} strokeWidth="3" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={c} strokeDashoffset={c - (score / 100) * c} strokeLinecap="round" />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 10, fontWeight: 700, color }}>{score}</span>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Preset
 * -------------------------------------------------------------------------*/

export const BulkBhDecisionHub = createPreset<BhDecisionHubProps>({
  name: 'BhDecisionHub.Bulk',
  render: ({ primitives, props, tokens: t }: PresetContext<BhDecisionHubProps>) => {
    const { Box, Text } = primitives;
    const br = getPersonalityBadgeRadius(t);
    const actionConfig = getDecisionActionConfig(t);

    const {
      jobName = 'Senior Frontend Engineer',
      pendingCount = 6,
      candidates = DEFAULT_CANDIDATES,
      bulkDecisions: bulkDecisionsProp,
      onBulkDecisionChange,
      onBulkSubmit,
      className, style,
    } = props;

    /* -- state ---------------------------------------------------------- */
    const [internalBulk, setInternalBulk] = useState<BulkDecisionEntry[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [batchAction, setBatchAction] = useState<DecisionAction | null>(null);
    const [batchRejectCat, setBatchRejectCat] = useState<RejectCategory | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<'rank' | 'score' | 'name'>('rank');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

    const bulkDecisions = bulkDecisionsProp ?? internalBulk;
    const setBulkDecisions = onBulkDecisionChange ?? setInternalBulk;

    const getDecision = useCallback((cid: string) => bulkDecisions.find(d => d.candidateId === cid), [bulkDecisions]);

    const setDecision = useCallback((cid: string, action: DecisionAction, cat?: RejectCategory) => {
      const rest = bulkDecisions.filter(d => d.candidateId !== cid);
      const entry: BulkDecisionEntry = { candidateId: cid, decision: action };
      if (cat) entry.rejectCategory = cat;
      setBulkDecisions([...rest, entry]);
    }, [bulkDecisions, setBulkDecisions]);

    const removeDecision = useCallback((cid: string) => {
      setBulkDecisions(bulkDecisions.filter(d => d.candidateId !== cid));
    }, [bulkDecisions, setBulkDecisions]);

    const toggleSelect = useCallback((cid: string) => {
      setSelectedIds(prev => { const n = new Set(prev); n.has(cid) ? n.delete(cid) : n.add(cid); return n; });
    }, []);

    const toggleAll = useCallback(() => {
      setSelectedIds(prev => prev.size === candidates.length ? new Set() : new Set(candidates.map(c => c.id)));
    }, [candidates]);

    const applyBatch = useCallback(() => {
      if (!batchAction || selectedIds.size === 0) return;
      const rest = bulkDecisions.filter(d => !selectedIds.has(d.candidateId));
      const entries: BulkDecisionEntry[] = Array.from(selectedIds).map(id => {
        const e: BulkDecisionEntry = { candidateId: id, decision: batchAction };
        if (batchAction === 'reject' && batchRejectCat) e.rejectCategory = batchRejectCat;
        return e;
      });
      setBulkDecisions([...rest, ...entries]);
      setSelectedIds(new Set());
      setBatchAction(null);
      setBatchRejectCat(null);
    }, [batchAction, batchRejectCat, selectedIds, bulkDecisions, setBulkDecisions]);

    const resetAll = useCallback(() => { setBulkDecisions([]); setSelectedIds(new Set()); setBatchAction(null); }, [setBulkDecisions]);

    const sorted = useMemo(() => {
      const arr = [...candidates].sort((a, b) => {
        let cmp = 0;
        if (sortBy === 'rank') cmp = a.rank - b.rank;
        else if (sortBy === 'score') cmp = a.scorePercent - b.scorePercent;
        else cmp = a.name.localeCompare(b.name);
        return sortDir === 'asc' ? cmp : -cmp;
      });
      return arr;
    }, [candidates, sortBy, sortDir]);

    const stats = useMemo(() => {
      let advance = 0, reject = 0, hold = 0;
      bulkDecisions.forEach(d => { if (d.decision === 'advance') advance++; else if (d.decision === 'reject') reject++; else hold++; });
      return { advance, reject, hold, undecided: candidates.length - bulkDecisions.length };
    }, [bulkDecisions, candidates]);

    const allSelected = selectedIds.size === candidates.length && candidates.length > 0;

    const decisionIcons: Record<DecisionAction, React.ReactNode> = {
      advance: <ThumbsUp size={12} />, reject: <ThumbsDown size={12} />, hold: <Pause size={12} />,
    };

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
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
            <Box style={{
              width: 36, height: 36, borderRadius: t.borderRadius.lg,
              backgroundColor: t.colors.warningScale[50], display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Zap size={18} style={{ color: t.colors.warningScale[600] }} />
            </Box>
            <Box>
              <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[900] }}>
                {jobName}
                <span style={{ marginLeft: t.spacing[2], padding: `1px ${t.spacing[2]}px`, borderRadius: br, backgroundColor: t.colors.warningScale[50], color: t.colors.warningScale[700], fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold }}>Bulk Mode</span>
              </Text>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], marginTop: 2 }}>
                {pendingCount} candidates | {bulkDecisions.length} decided | {stats.undecided} remaining
              </Text>
            </Box>
          </Box>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
            {([['advance', stats.advance, t.colors.successScale], ['reject', stats.reject, t.colors.errorScale], ['hold', stats.hold, t.colors.warningScale]] as const).map(([key, val, scale]) => (
              <Box key={key} style={{ padding: `1px ${t.spacing[2]}px`, borderRadius: br, backgroundColor: (scale as any)[50], color: (scale as any)[700], fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                {decisionIcons[key as DecisionAction]} {val}
              </Box>
            ))}
            <button onClick={resetAll} style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: `${t.spacing[1]}px ${t.spacing[3]}px`, borderRadius: br,
              border: `1px solid ${t.colors.neutral[200]}`, backgroundColor: t.colors.common.white,
              color: t.colors.neutral[600], fontSize: t.typography.fontSize.xs, cursor: 'pointer',
            }}><RotateCcw size={11} /> Reset</button>
          </Box>
        </Box>

        {/* Batch action bar */}
        {selectedIds.size > 0 && (
          <Box style={{
            display: 'flex', alignItems: 'center', gap: t.spacing[3],
            padding: `${t.spacing[3]}px ${t.spacing[6]}px`,
            backgroundColor: t.colors.primaryScale[50],
            borderBottom: `1px solid ${t.colors.primaryScale[200]}`,
          }}>
            <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.primaryScale[700] }}>
              {selectedIds.size} selected
            </Text>
            <Box style={{ display: 'flex', gap: t.spacing[2] }}>
              {(['advance', 'reject', 'hold'] as DecisionAction[]).map(action => {
                const cfg = actionConfig[action];
                const active = batchAction === action;
                return (
                  <button key={action} onClick={() => setBatchAction(active ? null : action)} style={{
                    display: 'flex', alignItems: 'center', gap: 3,
                    padding: `${t.spacing[1]}px ${t.spacing[3]}px`, borderRadius: br,
                    border: `1px solid ${active ? cfg.borderColor : t.colors.neutral[200]}`,
                    backgroundColor: active ? cfg.bgColor : t.colors.common.white,
                    color: active ? cfg.color : t.colors.neutral[600],
                    fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, cursor: 'pointer',
                  }}>{cfg.label}</button>
                );
              })}
            </Box>
            {batchAction === 'reject' && (
              <select value={batchRejectCat ?? ''} onChange={e => setBatchRejectCat(e.target.value as RejectCategory)} style={{
                padding: `${t.spacing[1]}px ${t.spacing[3]}px`, borderRadius: br,
                border: `1px solid ${t.colors.neutral[200]}`, fontSize: t.typography.fontSize.xs,
                color: t.colors.neutral[700], backgroundColor: t.colors.common.white,
              }}>
                <option value="">Category...</option>
                {(['not_qualified', 'culture_fit', 'compensation', 'timing', 'other'] as RejectCategory[]).map(cat => (
                  <option key={cat} value={cat}>{getRejectCategoryLabel(cat)}</option>
                ))}
              </select>
            )}
            {batchAction && (
              <button onClick={applyBatch} style={{
                display: 'flex', alignItems: 'center', gap: 3,
                padding: `${t.spacing[1]}px ${t.spacing[3]}px`, borderRadius: br,
                border: 'none', backgroundColor: t.colors.primaryScale[500], color: t.colors.common.white,
                fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, cursor: 'pointer',
              }}><Check size={11} /> Apply to {selectedIds.size}</button>
            )}
          </Box>
        )}

        {/* Sort bar */}
        <Box style={{
          display: 'flex', alignItems: 'center', gap: t.spacing[3],
          padding: `${t.spacing[2]}px ${t.spacing[6]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
        }}>
          <button onClick={toggleAll} style={{
            width: 18, height: 18, borderRadius: 4,
            border: `1px solid ${allSelected ? t.colors.primaryScale[500] : t.colors.neutral[300]}`,
            backgroundColor: allSelected ? t.colors.primaryScale[500] : t.colors.common.white,
            color: allSelected ? t.colors.common.white : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0,
          }}>{allSelected && <Check size={11} />}</button>
          <Box style={{ flex: 1, display: 'flex', gap: t.spacing[2] }}>
            {(['rank', 'score', 'name'] as const).map(field => (
              <button key={field} onClick={() => { sortBy === field ? setSortDir(d => d === 'asc' ? 'desc' : 'asc') : (setSortBy(field), setSortDir('asc')); }} style={{
                padding: `${t.spacing[1]}px ${t.spacing[2]}px`, borderRadius: br, border: 'none',
                backgroundColor: sortBy === field ? t.colors.neutral[100] : 'transparent',
                color: sortBy === field ? t.colors.neutral[800] : t.colors.neutral[500],
                fontSize: t.typography.fontSize.xs, fontWeight: sortBy === field ? 600 : 400, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 2,
              }}>
                {field.charAt(0).toUpperCase() + field.slice(1)}
                {sortBy === field && (sortDir === 'asc' ? <ChevronUp size={10} /> : <ChevronDown size={10} />)}
              </button>
            ))}
          </Box>
          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>{candidates.length} candidates</Text>
        </Box>

        {/* Candidate checklist */}
        <Box style={{ flex: 1, overflowY: 'auto' }}>
          {sorted.map(candidate => {
            const isSelected = selectedIds.has(candidate.id);
            const existing = getDecision(candidate.id);
            const isExpanded = expandedId === candidate.id;
            const scoreColor = getScoreColor(t, candidate.scorePercent);

            return (
              <Box key={candidate.id} style={{ borderBottom: `1px solid ${t.colors.neutral[50]}` }}>
                {/* Row */}
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3], padding: `${t.spacing[3]}px ${t.spacing[6]}px` }}>
                  <button onClick={() => toggleSelect(candidate.id)} style={{
                    width: 18, height: 18, borderRadius: 4, padding: 0,
                    border: `1px solid ${isSelected ? t.colors.primaryScale[500] : t.colors.neutral[300]}`,
                    backgroundColor: isSelected ? t.colors.primaryScale[500] : t.colors.common.white,
                    color: isSelected ? t.colors.common.white : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
                  }}>{isSelected && <Check size={11} />}</button>

                  <Text style={{ width: 28, textAlign: 'center', fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[400], flexShrink: 0 }}>
                    #{candidate.rank}
                  </Text>

                  <Box style={{
                    width: 32, height: 32, borderRadius: t.borderRadius.full, flexShrink: 0,
                    backgroundColor: t.colors.primaryScale[50], color: t.colors.primaryScale[700],
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: t.typography.fontWeight.bold,
                  }}>{getCandidateInitials(candidate.name)}</Box>

                  <Box style={{ flex: 1, minWidth: 0 }}>
                    <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[900] }}>{candidate.name}</Text>
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {candidate.highlights.slice(0, 3).join(' | ')}
                    </Text>
                  </Box>

                  <ScoreRing score={candidate.scorePercent} t={t} />

                  <Box style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                    {(['advance', 'reject', 'hold'] as DecisionAction[]).map(action => {
                      const cfg = actionConfig[action];
                      const isActive = existing?.decision === action;
                      return (
                        <button key={action} onClick={() => isActive ? removeDecision(candidate.id) : setDecision(candidate.id, action)} title={cfg.label} style={{
                          width: 28, height: 28, borderRadius: br, padding: 0,
                          border: `1px solid ${isActive ? cfg.borderColor : t.colors.neutral[200]}`,
                          backgroundColor: isActive ? cfg.bgColor : t.colors.common.white,
                          color: isActive ? cfg.color : t.colors.neutral[400],
                          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                        }}>{decisionIcons[action]}</button>
                      );
                    })}
                  </Box>

                  {existing && (
                    <Box style={{
                      padding: `0 ${t.spacing[2]}px`, borderRadius: br,
                      backgroundColor: actionConfig[existing.decision].bgColor,
                      color: actionConfig[existing.decision].color,
                      fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold,
                    }}>{actionConfig[existing.decision].label}</Box>
                  )}

                  <button onClick={() => setExpandedId(isExpanded ? null : candidate.id)} style={{
                    width: 24, height: 24, borderRadius: br, border: 'none',
                    backgroundColor: 'transparent', color: t.colors.neutral[400], cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, flexShrink: 0,
                  }}>{isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</button>
                </Box>

                {/* Expanded detail */}
                {isExpanded && (
                  <Box style={{ padding: `${t.spacing[2]}px ${t.spacing[6]}px ${t.spacing[4]}px`, paddingLeft: t.spacing[10] }}>
                    {/* AI recommendation */}
                    <Box style={{
                      padding: `${t.spacing[3]}px`, borderRadius: t.borderRadius.lg, marginBottom: t.spacing[3],
                      backgroundColor: t.colors.primaryScale[50], border: `1px solid ${t.colors.primaryScale[200]}`,
                      display: 'flex', alignItems: 'flex-start', gap: t.spacing[2],
                    }}>
                      <Sparkles size={13} style={{ color: t.colors.primaryScale[500], flexShrink: 0, marginTop: 2 }} />
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.primaryScale[700], lineHeight: 1.5 }}>{candidate.aiRecommendation}</Text>
                    </Box>

                    {/* Pros / Cons */}
                    <Box style={{ display: 'flex', gap: t.spacing[4], marginBottom: t.spacing[3] }}>
                      <Box style={{ flex: 1 }}>
                        <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.successScale[700], marginBottom: t.spacing[1], display: 'flex', alignItems: 'center', gap: 4 }}>
                          <ThumbsUp size={10} /> Strengths
                        </Text>
                        {candidate.pros.map((p, i) => (
                          <Box key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3 }}>
                            <Check size={10} style={{ color: t.colors.successScale[500] }} />
                            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600] }}>{p}</Text>
                          </Box>
                        ))}
                      </Box>
                      <Box style={{ flex: 1 }}>
                        <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.errorScale[700], marginBottom: t.spacing[1], display: 'flex', alignItems: 'center', gap: 4 }}>
                          <ThumbsDown size={10} /> Concerns
                        </Text>
                        {candidate.cons.map((c, i) => (
                          <Box key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3 }}>
                            <X size={10} style={{ color: t.colors.errorScale[500] }} />
                            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600] }}>{c}</Text>
                          </Box>
                        ))}
                      </Box>
                    </Box>

                    {/* Risk factors */}
                    {candidate.riskFactors.length > 0 && (
                      <Box style={{ display: 'flex', flexWrap: 'wrap', gap: t.spacing[1] }}>
                        {candidate.riskFactors.map((risk, i) => (
                          <Box key={i} style={{
                            display: 'inline-flex', alignItems: 'center', gap: 3,
                            padding: `${t.spacing[1]}px ${t.spacing[2]}px`, borderRadius: br,
                            backgroundColor: t.colors.warningScale[50], fontSize: t.typography.fontSize.xs, color: t.colors.warningScale[700],
                          }}><AlertTriangle size={10} /> {risk}</Box>
                        ))}
                      </Box>
                    )}

                    {/* Reject category selector */}
                    {existing?.decision === 'reject' && (
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginTop: t.spacing[3] }}>
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>Reject category:</Text>
                        <select value={existing.rejectCategory ?? ''} onChange={e => setDecision(candidate.id, 'reject', e.target.value as RejectCategory)} style={{
                          padding: `${t.spacing[1]}px ${t.spacing[2]}px`, borderRadius: br,
                          border: `1px solid ${t.colors.neutral[200]}`, fontSize: t.typography.fontSize.xs,
                          color: t.colors.neutral[700], backgroundColor: t.colors.common.white,
                        }}>
                          <option value="">Select...</option>
                          {(['not_qualified', 'culture_fit', 'compensation', 'timing', 'other'] as RejectCategory[]).map(cat => (
                            <option key={cat} value={cat}>{getRejectCategoryLabel(cat)}</option>
                          ))}
                        </select>
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>

        {/* Submit footer */}
        <Box style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: `${t.spacing[4]}px ${t.spacing[6]}px`,
          borderTop: `1px solid ${t.colors.neutral[100]}`, backgroundColor: t.colors.neutral[50],
        }}>
          <Box style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[600], display: 'flex', alignItems: 'center', gap: t.spacing[4] }}>
            {([
              { label: 'advancing', count: stats.advance, color: t.colors.successScale[500] },
              { label: 'rejecting', count: stats.reject, color: t.colors.errorScale[500] },
              { label: 'on hold', count: stats.hold, color: t.colors.warningScale[500] },
            ] as const).map(s => (
              <Box key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Box style={{ width: 6, height: 6, borderRadius: t.borderRadius.full, backgroundColor: s.color }} />
                <Text style={{ fontSize: t.typography.fontSize.xs }}>{s.count} {s.label}</Text>
              </Box>
            ))}
            {stats.undecided > 0 && (
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.warningScale[600], fontWeight: t.typography.fontWeight.medium }}>
                ({stats.undecided} undecided)
              </Text>
            )}
          </Box>
          <button onClick={onBulkSubmit} disabled={bulkDecisions.length === 0} style={{
            display: 'flex', alignItems: 'center', gap: t.spacing[2],
            padding: `${t.spacing[2]}px ${t.spacing[6]}px`, borderRadius: br, border: 'none',
            backgroundColor: bulkDecisions.length > 0 ? t.colors.primaryScale[500] : t.colors.neutral[300],
            color: t.colors.common.white, fontSize: t.typography.fontSize.sm,
            fontWeight: t.typography.fontWeight.semibold,
            cursor: bulkDecisions.length > 0 ? 'pointer' : 'not-allowed',
          }}><Send size={14} /> Submit All Decisions ({bulkDecisions.length})</button>
        </Box>
      </Box>
    );
  },
});
