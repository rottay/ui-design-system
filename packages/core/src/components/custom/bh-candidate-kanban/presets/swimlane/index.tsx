'use client';

/**
 * BhCandidateKanban - Swimlane Preset
 * Horizontal swimlane view grouped by source, with compact candidate rows,
 * score rings, AI badges, and stage columns. Slite-inspired warm design.
 */

import { useState, useMemo, useCallback } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createCardHoverStyles, getPersonalityBadgeRadius } from '../../../helpers';
import type { BhCandidateKanbanProps, KanbanCandidate, KanbanStage, CandidateSource, AiRecommendation, KanbanFilter } from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import { Search, X, ChevronDown, ChevronRight, Calendar, MessageSquare, ThumbsDown, Clock, Sparkles, Users } from 'lucide-react';

function getScoreColor(s: number, t: DesignTokens): string { return s >= 75 ? t.colors.successScale[500] : s >= 50 ? t.colors.warningScale[500] : t.colors.errorScale[500]; }
function getAiColor(r: AiRecommendation, t: DesignTokens): string { return r === 'advance' ? t.colors.successScale[500] : r === 'hold' ? t.colors.warningScale[500] : t.colors.errorScale[500]; }
function getSourceConfig(s: CandidateSource, t: DesignTokens) {
  const m: Record<CandidateSource, { label: string; bg: string; text: string }> = {
    applied: { label: 'Applied', bg: t.colors.primaryScale[50], text: t.colors.primaryScale[700] },
    referral: { label: 'Referral', bg: t.colors.successScale[50], text: t.colors.successScale[700] },
    sourced: { label: 'Sourced', bg: t.colors.infoScale[50], text: t.colors.infoScale[700] },
    agency: { label: 'Agency', bg: t.colors.warningScale[50], text: t.colors.warningScale[700] },
    internal: { label: 'Internal', bg: t.colors.secondaryScale[50], text: t.colors.secondaryScale[700] },
  };
  return m[s];
}
function getInitials(n: string): string { const p = n.trim().split(/\s+/); return p.length >= 2 ? (p[0][0] + p[p.length - 1][0]).toUpperCase() : (p[0]?.[0] ?? '').toUpperCase(); }
function matchesFilters(c: KanbanCandidate, f: KanbanFilter | undefined, q: string): boolean {
  if (q) { const ql = q.toLowerCase(); if (!c.name.toLowerCase().includes(ql) && !c.email?.toLowerCase().includes(ql)) return false; }
  if (!f) return true;
  if (f.source?.length && !f.source.includes(c.source)) return false;
  if (f.aiRecommendation?.length && !f.aiRecommendation.includes(c.aiRecommendation)) return false;
  return true;
}

function ScoreRing({ score, tokens: t, size = 30 }: { score: number; tokens: DesignTokens; size?: number }) {
  const color = getScoreColor(score, t); const r = (size / 2) - 3; const c = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={t.colors.neutral[100]} strokeWidth="2.5" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="2.5" strokeDasharray={c} strokeDashoffset={c - (score / 100) * c} strokeLinecap="round" />
      </svg>
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: t.typography.fontWeight.bold, color }}>{score}</div>
    </div>
  );
}

const DEFAULT_STAGES: KanbanStage[] = [
  { id: 's-1', name: 'Screening', order: 1, slaHours: 48, candidateCount: 8 },
  { id: 's-2', name: 'Interview', order: 2, slaHours: 72, candidateCount: 5 },
  { id: 's-3', name: 'Assessment', order: 3, slaHours: 96, candidateCount: 3 },
  { id: 's-4', name: 'Offer', order: 4, slaHours: 48, candidateCount: 2 },
];

const DEFAULT_CANDIDATES: KanbanCandidate[] = [
  { id: 'c-1', name: 'Sarah Johnson', scorePercent: 95, daysInStage: 1, source: 'applied', tags: ['React', 'Senior'], aiRecommendation: 'advance', stageId: 's-2', email: 'sarah@google.com' },
  { id: 'c-2', name: 'Michael Chen', scorePercent: 88, daysInStage: 2, source: 'referral', tags: ['Full Stack'], aiRecommendation: 'advance', stageId: 's-2', email: 'mchen@stripe.com' },
  { id: 'c-3', name: 'Emily Rodriguez', scorePercent: 92, daysInStage: 0, source: 'sourced', tags: ['Staff', 'Go'], aiRecommendation: 'advance', stageId: 's-3', email: 'emily@meta.com' },
  { id: 'c-4', name: 'James Kim', scorePercent: 85, daysInStage: 3, source: 'applied', tags: ['ML'], aiRecommendation: 'hold', stageId: 's-1', email: 'jkim@anthropic.com' },
  { id: 'c-5', name: 'Anna Kowalski', scorePercent: 78, daysInStage: 5, source: 'agency', tags: ['DevOps'], aiRecommendation: 'hold', stageId: 's-1', email: 'anna@vercel.com' },
  { id: 'c-6', name: 'David Thompson', scorePercent: 91, daysInStage: 1, source: 'referral', tags: ['VP'], aiRecommendation: 'advance', stageId: 's-4', email: 'david@linear.app' },
];

export const SwimlaneBhCandidateKanban = createPreset<BhCandidateKanbanProps>({
  name: 'BhCandidateKanban.Swimlane',
  render: ({ primitives, props, tokens: t }: PresetContext<BhCandidateKanbanProps>) => {
    const { Box, Text } = primitives;
    const { jobName = 'Senior Frontend Engineer', totalCandidates = 18, stages = DEFAULT_STAGES, candidates: cp = DEFAULT_CANDIDATES, onCandidateClick, onScheduleInterview, onAddNote, onReject, filters: fp, onFilterChange, searchQuery: sqp, onSearchChange, className, style } = props;
    const [iSearch, setISearch] = useState('');
    const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
    const [hovered, setHovered] = useState<string | null>(null);
    const sq = sqp ?? iSearch;
    const sorted = useMemo(() => [...stages].sort((a, b) => a.order - b.order), [stages]);
    const filtered = useMemo(() => cp.filter(c => matchesFilters(c, fp, sq)), [cp, fp, sq]);
    const sources: CandidateSource[] = ['applied', 'referral', 'sourced', 'agency', 'internal'];
    const bySrc = useMemo(() => { const m: Record<string, KanbanCandidate[]> = {}; sources.forEach(s => { m[s] = filtered.filter(c => c.source === s); }); return m; }, [filtered]);
    const br = getPersonalityBadgeRadius(t);

    return (
      <Box className={className} style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: t.colors.neutral[50], ...style }}>
        <Box style={{ padding: `${t.spacing[5]}px ${t.spacing[6]}px`, backgroundColor: t.colors.common.white, borderBottom: `1px solid ${t.colors.neutral[100]}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[900] }}>{jobName}</Text>
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], marginTop: 2 }}>{filtered.length} of {totalCandidates} candidates - Swimlane View</Text>
          </Box>
          <Box style={{ position: 'relative', width: 260 }}>
            <Search size={16} style={{ position: 'absolute', left: t.spacing[3], top: '50%', transform: 'translateY(-50%)', color: t.colors.neutral[400], pointerEvents: 'none' }} />
            <input type="text" value={sq} onChange={e => onSearchChange ? onSearchChange(e.target.value) : setISearch(e.target.value)} placeholder="Search..."
              style={{ width: '100%', padding: `${t.spacing[2]}px ${t.spacing[3]}px ${t.spacing[2]}px 36px`, borderRadius: t.borderRadius.lg, border: `1px solid ${t.colors.neutral[200]}`, fontSize: t.typography.fontSize.sm, color: t.colors.neutral[800], fontFamily: 'inherit', outline: 'none' }} />
          </Box>
        </Box>

        {/* Column headers */}
        <Box style={{ display: 'flex', padding: `${t.spacing[3]}px ${t.spacing[6]}px`, backgroundColor: t.colors.common.white, borderBottom: `1px solid ${t.colors.neutral[100]}` }}>
          <Box style={{ width: 200, flexShrink: 0 }} />
          {sorted.map(stage => (
            <Box key={stage.id} style={{ flex: 1, minWidth: 140, textAlign: 'center' }}>
              <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[700] }}>{stage.name}</Text>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>{filtered.filter(c => c.stageId === stage.id).length}</Text>
            </Box>
          ))}
        </Box>

        <Box style={{ flex: 1, overflow: 'auto', padding: `0 ${t.spacing[6]}px ${t.spacing[4]}px` }}>
          {sources.map(source => {
            const sc = getSourceConfig(source, t);
            const cands = bySrc[source] || [];
            if (cands.length === 0) return null;
            const isC = collapsed.has(source);
            return (
              <Box key={source} style={{ marginTop: t.spacing[3] }}>
                <Box onClick={() => setCollapsed(prev => { const n = new Set(prev); n.has(source) ? n.delete(source) : n.add(source); return n; })} style={{
                  display: 'flex', alignItems: 'center', gap: t.spacing[2], padding: `${t.spacing[3]}px`, cursor: 'pointer', borderRadius: t.borderRadius.md, backgroundColor: sc.bg,
                }}>
                  {isC ? <ChevronRight size={14} color={sc.text} /> : <ChevronDown size={14} color={sc.text} />}
                  <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: sc.text }}>{sc.label}</Text>
                  <Box style={{ padding: `0 ${t.spacing[2]}px`, borderRadius: br, backgroundColor: sc.text, color: t.colors.common.white, fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold }}>{cands.length}</Box>
                </Box>
                {!isC && cands.map(c => {
                  const isH = hovered === c.id;
                  return (
                    <Box key={c.id} onMouseEnter={() => setHovered(c.id)} onMouseLeave={() => setHovered(null)} onClick={() => onCandidateClick?.(c.id)}
                      style={{ display: 'flex', alignItems: 'center', padding: `${t.spacing[2]}px ${t.spacing[3]}px`, borderBottom: `1px solid ${t.colors.neutral[100]}`, cursor: 'pointer', backgroundColor: isH ? t.colors.neutral[50] : 'transparent', transition: `background-color ${t.motion.hover}` }}>
                      <Box style={{ width: 200, flexShrink: 0, display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                        <Box style={{ width: 28, height: 28, borderRadius: t.borderRadius.full, flexShrink: 0, backgroundColor: t.colors.primaryScale[100], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: t.typography.fontWeight.semibold, color: t.colors.primaryScale[700] }}>{getInitials(c.name)}</Box>
                        <Box style={{ minWidth: 0 }}>
                          <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[800], whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</Text>
                          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                            <Clock size={10} color={t.colors.neutral[400]} /><Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>{c.daysInStage}d</Text>
                            <Sparkles size={10} color={getAiColor(c.aiRecommendation, t)} />
                          </Box>
                        </Box>
                      </Box>
                      {sorted.map(stage => (
                        <Box key={stage.id} style={{ flex: 1, minWidth: 140, display: 'flex', justifyContent: 'center' }}>
                          {c.stageId === stage.id && (
                            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                              <ScoreRing score={c.scorePercent} tokens={t} />
                              {c.tags.slice(0, 1).map(tag => (<Box key={tag} style={{ padding: `1px ${t.spacing[2]}px`, borderRadius: br, backgroundColor: t.colors.neutral[100], fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600] }}>{tag}</Box>))}
                            </Box>
                          )}
                        </Box>
                      ))}
                      {isH && (
                        <Box style={{ display: 'flex', gap: t.spacing[1], flexShrink: 0, marginLeft: t.spacing[2] }}>
                          {[{ icon: <Calendar size={12} />, color: t.colors.primaryScale[600], fn: () => onScheduleInterview?.(c.id) }, { icon: <MessageSquare size={12} />, color: t.colors.infoScale[600], fn: () => onAddNote?.(c.id) }, { icon: <ThumbsDown size={12} />, color: t.colors.errorScale[600], fn: () => onReject?.(c.id) }].map((a, i) => (
                            <button key={i} onClick={(e) => { e.stopPropagation(); a.fn(); }} style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: t.borderRadius.md, border: `1px solid ${t.colors.neutral[200]}`, backgroundColor: t.colors.common.white, color: a.color, cursor: 'pointer', padding: 0 }}>{a.icon}</button>
                          ))}
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  },
});
