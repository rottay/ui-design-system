'use client';

/**
 * BhCandidateKanban - Swimlane Preset
 * Horizontal swimlane view grouped by source, with compact candidate rows,
 * score rings, AI badges, and stage columns. Slite-inspired warm design.
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createCardHoverStyles,
  createEntranceAnimation,
  createPersonalitySectionHeaderStyle,
  createPersonalityAccentBar,
  getPersonalityTypography,
  getPersonalityBadgeRadius,

  createDividerStyle,
  createPersonalitySkeletonStyle,
} from '../../../helpers';
import type { BhCandidateKanbanProps, KanbanCandidate, KanbanStage, AiRecommendation, KanbanFilter } from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import { Search, X, ChevronDown, ChevronRight, Calendar, MessageSquare, ThumbsDown, Clock, Sparkles, Users } from 'lucide-react';

function getScoreColor(s: number, t: DesignTokens): string { return s >= 75 ? t.colors.successScale[500] : s >= 50 ? t.colors.warningScale[500] : t.colors.errorScale[500]; }
function getAiColor(r: AiRecommendation, t: DesignTokens): string { return r === 'advance' ? t.colors.successScale[500] : r === 'hold' ? t.colors.warningScale[500] : t.colors.errorScale[500]; }
function getSourceConfig(s: string, t: DesignTokens) {
  const m: Record<string, { label: string; bg: string; text: string }> = {
    applied: { label: 'Applied', bg: t.colors.primaryScale[50], text: t.colors.primaryScale[700] },
    referral: { label: 'Referral', bg: t.colors.successScale[50], text: t.colors.successScale[700] },
    sourced: { label: 'Sourced', bg: t.colors.infoScale[50], text: t.colors.infoScale[700] },
    agency: { label: 'Agency', bg: t.colors.warningScale[50], text: t.colors.warningScale[700] },
    internal: { label: 'Internal', bg: t.colors.secondaryScale[50], text: t.colors.secondaryScale[700] },
  };
  return m[s] ?? { label: s, bg: t.colors.neutral[50], text: t.colors.neutral[700] };
}
function getInitials(n: string): string { const p = n.trim().split(/\s+/); return p.length >= 2 ? (p[0][0] + p[p.length - 1][0]).toUpperCase() : (p[0]?.[0] ?? '').toUpperCase(); }
function matchesFilters(c: KanbanCandidate, f: KanbanFilter | undefined, q: string): boolean {
  if (q) { const ql = q.toLowerCase(); if (!(c.name || '').toLowerCase().includes(ql) && !c.email?.toLowerCase().includes(ql)) return false; }
  if (!f) return true;
  if (f.source?.length && !f.source.includes(c.source)) return false;
  if (f.aiRecommendation?.length && !f.aiRecommendation.includes(c.aiRecommendation)) return false;
  return true;
}

let _Box: any;
let _Text: any;

function ScoreRing({ score, tokens: t, size = 30 }: { score: number; tokens: DesignTokens; size?: number }) {
  const color = getScoreColor(score, t); const r = (size / 2) - 3; const c = 2 * Math.PI * r;
  const B = _Box;
  const divider = useMemo(() => createDividerStyle(t), [t]);
  const skeleton = useMemo(() => createPersonalitySkeletonStyle(t), [t]);

  return (
    <B style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}
        role="img" aria-label={`Score: ${score}%`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={t.colors.neutral[100]} strokeWidth="2.5" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="2.5" strokeDasharray={c} strokeDashoffset={c - (score / 100) * c} strokeLinecap="round" />
      </svg>
      <B style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: t.typography.fontWeight.bold, color }}>{score}</B>
    </B>
  );
}

export const SwimlaneBhCandidateKanban = createPreset<BhCandidateKanbanProps>({
  name: 'BhCandidateKanban.Swimlane',
  render: ({ primitives, props, tokens: t }: PresetContext<BhCandidateKanbanProps>) => {
    const { Box, Text } = primitives;
    _Box = Box;
    _Text = Text;

    const isGlass = t.surface.useGlass;
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);

    const { jobName = '', totalCandidates = 0, stages: rawStages = [], candidates: rawCp = [], onCandidateClick, onScheduleInterview, onAddNote, onReject, filters: fp, onFilterChange, searchQuery: sqp, onSearchChange, className, style } = props;

    const stages = Array.isArray(rawStages) ? rawStages : [];
    const cp = Array.isArray(rawCp) ? rawCp : [];
    const [iSearch, setISearch] = useState('');
    const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
    const [hovered, setHovered] = useState<string | null>(null);

    const sq = sqp ?? iSearch;
    const sorted = useMemo(() => [...stages].sort((a, b) => a.order - b.order), [stages]);
    const filtered = useMemo(() => cp.filter(c => matchesFilters(c, fp, sq)), [cp, fp, sq]);
    const sources: string[] = ['applied', 'referral', 'sourced', 'agency', 'internal'];
    const bySrc = useMemo(() => { const m: Record<string, KanbanCandidate[]> = {}; sources.forEach(s => { m[s] = filtered.filter(c => c.source === s); }); return m; }, [filtered]);
    const br = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const sectionLabel = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);

    const animStyle = useMemo(() => ({
      ...entrance.animate,
      transition: entrance.transition,
    }), [entrance]);

    return (
      <Box className={className} style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: t.colors.neutral[50], ...animStyle, ...style }}>
        {accentBar && <Box style={accentBar} />}
        <Box style={{
          padding: `${t.spacing[5]}px ${t.spacing[6]}px`, backgroundColor: t.colors.common.white,
          borderBottom: `1px solid ${t.colors.neutral[100]}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          ...(isGlass && t.glass ? { backdropFilter: t.glass.blur, WebkitBackdropFilter: t.glass.blur, backgroundColor: t.glass.bg } : {}),
        }} role="toolbar" aria-label="Swimlane toolbar">
          <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
            <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: ptypo.headingWeight, color: t.colors.neutral[900], letterSpacing: ptypo.headingLetterSpacing }}>{jobName}</Text>
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>{filtered.length} of {totalCandidates} candidates - Swimlane View</Text>
          </Box>
          <Box style={{ position: 'relative', width: 260 }}>
            <Search size={16} style={{ position: 'absolute', left: t.spacing[3], top: '50%', transform: 'translateY(-50%)', color: t.colors.neutral[400], pointerEvents: 'none' }} />
            <input type="text" value={sq} onChange={e => onSearchChange ? onSearchChange(e.target.value) : setISearch(e.target.value)} placeholder="Search..."
              aria-label="Search candidates"
              style={{ width: '100%', padding: `${t.spacing[2]}px ${t.spacing[3]}px ${t.spacing[2]}px 36px`, borderRadius: t.borderRadius.lg, border: `1px solid ${t.colors.neutral[200]}`, fontSize: t.typography.fontSize.sm, color: t.colors.neutral[800], fontFamily: 'inherit', outline: 'none', transition: `border-color ${t.motion.hover}` }} />
          </Box>
        </Box>

        {/* Column headers */}
        <Box style={{ display: 'flex', padding: `${t.spacing[3]}px ${t.spacing[6]}px`, backgroundColor: t.colors.common.white, borderBottom: `1px solid ${t.colors.neutral[100]}` }} role="row" aria-label="Stage columns">
          <Box style={{ width: 200, flexShrink: 0 }} />
          {sorted.map(stage => (
            <Box key={stage.id} style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], flex: 1, minWidth: 140, textAlign: 'center' }} role="columnheader">
              <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: ptypo.headingWeight, color: t.colors.neutral[700], letterSpacing: ptypo.headingLetterSpacing }}>{stage.name}</Text>
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
              <Box key={source} style={{ marginTop: t.spacing[3] }} role="group" aria-label={`${sc.label} candidates`}>
                <Box
                  onClick={() => setCollapsed(prev => { const n = new Set(prev); n.has(source) ? n.delete(source) : n.add(source); return n; })}
                  role="button"
                  tabIndex={0}
                  aria-expanded={!isC}
                  aria-label={`${sc.label} source group, ${cands.length} candidates`}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setCollapsed(prev => { const n = new Set(prev); n.has(source) ? n.delete(source) : n.add(source); return n; }); } }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: t.spacing[2], padding: `${t.spacing[3]}px`, cursor: 'pointer', borderRadius: t.borderRadius.md, backgroundColor: sc.bg,
                    transition: `background-color ${t.motion.hover}`,
                  }}
                >
                  {isC ? <ChevronRight size={14} color={sc.text} /> : <ChevronDown size={14} color={sc.text} />}
                  <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: ptypo.headingWeight, color: sc.text, letterSpacing: ptypo.headingLetterSpacing }}>{sc.label}</Text>
                  <Box style={{ padding: `0 ${t.spacing[2]}px`, borderRadius: br, backgroundColor: sc.text, color: t.colors.common.white, fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold }}>{cands.length}</Box>
                </Box>
                {!isC && cands.map(c => {
                  const isH = hovered === c.id;
                  return (
                    <Box key={c.id}
                      role="row"
                      tabIndex={0}
                      aria-label={`${c.name}, score ${c.scorePercent}%`}
                      onMouseEnter={() => setHovered(c.id)} onMouseLeave={() => setHovered(null)}
                      onClick={() => onCandidateClick?.(c.id)}
                      onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onCandidateClick?.(c.id); } }}
                      style={{ display: 'flex', alignItems: 'center', padding: `${t.spacing[2]}px ${t.spacing[3]}px`, borderBottom: `1px solid ${t.colors.neutral[100]}`, cursor: 'pointer', backgroundColor: isH ? t.colors.neutral[50] : 'transparent', transition: `background-color ${t.motion.hover}` }}>
                      <Box style={{ width: 200, flexShrink: 0, display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                        <Box style={{ width: 28, height: 28, borderRadius: t.borderRadius.full, flexShrink: 0, backgroundColor: t.colors.primaryScale[100], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.primaryScale[700] }}>{getInitials(c.name)}</Box>
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
                              {c.tags.slice(0, 1).map(tag => (<Text key={tag} style={{ padding: `1px ${t.spacing[2]}px`, borderRadius: br, backgroundColor: t.colors.neutral[100], fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600] }}>{tag}</Text>))}
                            </Box>
                          )}
                        </Box>
                      ))}
                      {isH && (
                        <Box style={{ display: 'flex', gap: t.spacing[1], flexShrink: 0, marginLeft: t.spacing[2] }} role="toolbar" aria-label="Candidate actions">
                          {[
                            { icon: <Calendar size={12} />, color: t.colors.primaryScale[600], fn: () => onScheduleInterview?.(c.id), label: 'Schedule interview' },
                            { icon: <MessageSquare size={12} />, color: t.colors.infoScale[600], fn: () => onAddNote?.(c.id), label: 'Add note' },
                            { icon: <ThumbsDown size={12} />, color: t.colors.errorScale[600], fn: () => onReject?.(c.id), label: 'Reject candidate' },
                          ].map((a, i) => (
                            <button key={i} onClick={(e) => { e.stopPropagation(); a.fn(); }} aria-label={a.label} style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: t.borderRadius.md, border: `1px solid ${t.colors.neutral[200]}`, backgroundColor: t.colors.common.white, color: a.color, cursor: 'pointer', padding: 0, transition: `transform ${t.motion.hover}` }}>{a.icon}</button>
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
