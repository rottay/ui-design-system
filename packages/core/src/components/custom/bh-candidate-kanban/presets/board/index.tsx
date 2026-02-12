'use client';

/**
 * BhCandidateKanban - Board Preset
 * Classic kanban board composed from PatternKanbanBoard with domain-specific
 * candidate cards, SLA indicators, AI recommendation dots, and score rings.
 * Slite-inspired warm design with generous whitespace and soft surfaces.
 */

import { useState, useMemo, useCallback } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createSurfaceStyle,
  createHoverStyle,
  getHoverTransform,
  getPersonalityBadgeRadius,
} from '../../../helpers';
import {
  PatternKanbanBoard,
  useKanban,
} from '../../../../patterns';
import type { KanbanColumnDef } from '../../../../patterns';
import type {
  BhCandidateKanbanProps,
  KanbanCandidate,
  KanbanStage,
  CandidateSource,
  AiRecommendation,
  SlaStatus,
  KanbanFilter,
} from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  Search, Filter, LayoutGrid, Rows3,
  Calendar, MessageSquare, ThumbsDown, Pause, CheckSquare, Square,
  X, Sparkles, Clock, Tag, Users, Briefcase,
} from 'lucide-react';

/* ---------------------------------------------------------------------------
 * Helpers
 * -------------------------------------------------------------------------*/

function getScoreColor(score: number, t: DesignTokens): string {
  if (score >= 75) return t.colors.successScale[500];
  if (score >= 50) return t.colors.warningScale[500];
  return t.colors.errorScale[500];
}

function getScoreTrackColor(score: number, t: DesignTokens): string {
  if (score >= 75) return t.colors.successScale[100];
  if (score >= 50) return t.colors.warningScale[100];
  return t.colors.errorScale[100];
}

function getAiColor(rec: AiRecommendation, t: DesignTokens): string {
  switch (rec) {
    case 'advance': return t.colors.successScale[500];
    case 'hold': return t.colors.warningScale[500];
    case 'reject': return t.colors.errorScale[500];
  }
}

function getAiLabel(rec: AiRecommendation): string {
  switch (rec) {
    case 'advance': return 'AI: Advance';
    case 'hold': return 'AI: Hold';
    case 'reject': return 'AI: Reject';
  }
}

function getSourceConfig(source: CandidateSource, t: DesignTokens) {
  const m: Record<CandidateSource, { label: string; bg: string; text: string }> = {
    applied: { label: 'Applied', bg: t.colors.primaryScale[50], text: t.colors.primaryScale[700] },
    referral: { label: 'Referral', bg: t.colors.successScale[50], text: t.colors.successScale[700] },
    sourced: { label: 'Sourced', bg: t.colors.infoScale[50], text: t.colors.infoScale[700] },
    agency: { label: 'Agency', bg: t.colors.warningScale[50], text: t.colors.warningScale[700] },
    internal: { label: 'Internal', bg: t.colors.secondaryScale[50], text: t.colors.secondaryScale[700] },
  };
  return m[source];
}

function getSlaStatus(c: KanbanCandidate, stage: KanbanStage): SlaStatus {
  const ratio = (c.daysInStage * 24) / stage.slaHours;
  if (ratio < 0.5) return 'green';
  if (ratio < 0.85) return 'yellow';
  return 'red';
}

function getStageSlaStatus(candidates: KanbanCandidate[], stage: KanbanStage): SlaStatus {
  if (candidates.length === 0) return 'green';
  const statuses = candidates.map(c => getSlaStatus(c, stage));
  if (statuses.some(s => s === 'red')) return 'red';
  if (statuses.some(s => s === 'yellow')) return 'yellow';
  return 'green';
}

function getSlaBarColor(status: SlaStatus, t: DesignTokens): string {
  switch (status) {
    case 'green': return t.colors.successScale[500];
    case 'yellow': return t.colors.warningScale[500];
    case 'red': return t.colors.errorScale[500];
  }
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (parts[0]?.[0] ?? '').toUpperCase();
}

function matchesFilters(c: KanbanCandidate, f: KanbanFilter | undefined, q: string): boolean {
  if (q) {
    const ql = q.toLowerCase();
    if (!c.name.toLowerCase().includes(ql) && !c.email?.toLowerCase().includes(ql) && !c.tags.some(t => t.toLowerCase().includes(ql))) return false;
  }
  if (!f) return true;
  if (f.source?.length && !f.source.includes(c.source)) return false;
  if (f.aiRecommendation?.length && !f.aiRecommendation.includes(c.aiRecommendation)) return false;
  if (f.tags?.length && !f.tags.some(t => c.tags.includes(t))) return false;
  if (f.scoreMin !== undefined && c.scorePercent < f.scoreMin) return false;
  if (f.scoreMax !== undefined && c.scorePercent > f.scoreMax) return false;
  return true;
}

/* ---------------------------------------------------------------------------
 * ScoreRing
 * -------------------------------------------------------------------------*/

function ScoreRing({ score, tokens: t, size = 40 }: { score: number; tokens: DesignTokens; size?: number }) {
  const r = (size / 2) - 4;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  const color = getScoreColor(score, t);

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={getScoreTrackColor(score, t)} strokeWidth="3" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
      </svg>
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size <= 30 ? 8 : t.typography.fontSize.xs,
        fontWeight: t.typography.fontWeight.bold, color,
      }}>
        {score}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Default Data
 * -------------------------------------------------------------------------*/

const DEFAULT_STAGES: KanbanStage[] = [
  { id: 's-1', name: 'Applied', order: 1, slaHours: 48, candidateCount: 6 },
  { id: 's-2', name: 'Screening', order: 2, slaHours: 72, candidateCount: 4 },
  { id: 's-3', name: 'Interview', order: 3, slaHours: 96, candidateCount: 3 },
  { id: 's-4', name: 'Assessment', order: 4, slaHours: 72, candidateCount: 2 },
  { id: 's-5', name: 'Offer', order: 5, slaHours: 48, candidateCount: 1 },
];

const DEFAULT_CANDIDATES: KanbanCandidate[] = [
  { id: 'c-1', name: 'Sarah Johnson', scorePercent: 95, daysInStage: 1, source: 'applied', tags: ['React', 'Senior'], aiRecommendation: 'advance', stageId: 's-3', email: 'sarah@google.com' },
  { id: 'c-2', name: 'Michael Chen', scorePercent: 88, daysInStage: 2, source: 'referral', tags: ['Full Stack', 'Go'], aiRecommendation: 'advance', stageId: 's-3', email: 'mchen@stripe.com' },
  { id: 'c-3', name: 'Emily Rodriguez', scorePercent: 92, daysInStage: 0, source: 'sourced', tags: ['Staff', 'System Design'], aiRecommendation: 'advance', stageId: 's-4', email: 'emily@meta.com' },
  { id: 'c-4', name: 'James Kim', scorePercent: 72, daysInStage: 3, source: 'applied', tags: ['ML', 'Python'], aiRecommendation: 'hold', stageId: 's-2', email: 'jkim@anthropic.com' },
  { id: 'c-5', name: 'Anna Kowalski', scorePercent: 78, daysInStage: 5, source: 'agency', tags: ['DevOps'], aiRecommendation: 'hold', stageId: 's-1', email: 'anna@vercel.com' },
  { id: 'c-6', name: 'David Thompson', scorePercent: 91, daysInStage: 1, source: 'referral', tags: ['VP Eng'], aiRecommendation: 'advance', stageId: 's-5', email: 'david@linear.app' },
  { id: 'c-7', name: 'Lisa Park', scorePercent: 65, daysInStage: 4, source: 'applied', tags: ['Junior', 'React'], aiRecommendation: 'reject', stageId: 's-1', email: 'lisa@figma.com' },
  { id: 'c-8', name: 'Robert Wilson', scorePercent: 83, daysInStage: 1, source: 'sourced', tags: ['Backend', 'Rust'], aiRecommendation: 'advance', stageId: 's-2', email: 'rwilson@cloudflare.com' },
];

/* ---------------------------------------------------------------------------
 * Board Preset
 * -------------------------------------------------------------------------*/

export const BoardBhCandidateKanban = createPreset<BhCandidateKanbanProps>({
  name: 'BhCandidateKanban.Board',
  render: ({ primitives, props, tokens: t, engine }: PresetContext<BhCandidateKanbanProps>) => {
    const { Box, Text } = primitives;
    const isGlass = t.surface.useGlass;
    const br = getPersonalityBadgeRadius(t);

    const {
      jobName = 'Senior Frontend Engineer', totalCandidates = 16,
      stages = DEFAULT_STAGES, candidates: cp = DEFAULT_CANDIDATES,
      onCandidateMove, onCandidateClick, onScheduleInterview, onAddNote, onReject, onHold,
      filters: fp, onFilterChange, searchQuery: sqp, onSearchChange,
      selectedCandidate: selp, bulkSelection: bsp, onBulkSelectionChange, onBulkAction,
      className, style,
    } = props;

    const [iFilters, setIFilters] = useState<KanbanFilter>({});
    const [iSearch, setISearch] = useState('');
    const [iSelected, setISelected] = useState<string | null>(null);
    const [iBulk, setIBulk] = useState<string[]>([]);
    const [showFilter, setShowFilter] = useState(false);
    const [hovered, setHovered] = useState<string | null>(null);
    const [aiTip, setAiTip] = useState<string | null>(null);
    const [confirmRejectId, setConfirmRejectId] = useState<string | null>(null);

    const filters = fp ?? iFilters;
    const sq = sqp ?? iSearch;
    const selected = selp ?? iSelected;
    const bulk = bsp ?? iBulk;

    const setFilters = useCallback((f: KanbanFilter) => { onFilterChange ? onFilterChange(f) : setIFilters(f); }, [onFilterChange]);
    const setSearch = useCallback((q: string) => { onSearchChange ? onSearchChange(q) : setISearch(q); }, [onSearchChange]);
    const setSelected = useCallback((id: string) => { onCandidateClick ? onCandidateClick(id) : setISelected(prev => prev === id ? null : id); }, [onCandidateClick]);
    const setBulk = useCallback((ids: string[]) => { onBulkSelectionChange ? onBulkSelectionChange(ids) : setIBulk(ids); }, [onBulkSelectionChange]);
    const toggleBulk = useCallback((id: string) => { setBulk(bulk.includes(id) ? bulk.filter(x => x !== id) : [...bulk, id]); }, [bulk, setBulk]);

    const sorted = useMemo(() => [...stages].sort((a, b) => a.order - b.order), [stages]);

    const columns = useMemo((): KanbanColumnDef<KanbanCandidate>[] =>
      sorted.map(stage => ({
        id: stage.id,
        title: stage.name,
        items: cp.filter(c => c.stageId === stage.id && matchesFilters(c, filters, sq)).sort((a, b) => b.scorePercent - a.scorePercent),
      })),
    [cp, sorted, filters, sq]);

    const totalFiltered = columns.reduce((s, c) => s + c.items.length, 0);
    const hasFilters = !!((filters.source?.length) || (filters.aiRecommendation?.length) || (filters.tags?.length) || filters.scoreMin !== undefined || filters.scoreMax !== undefined);

    const cardBase = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const surfaceBase = useMemo(() => createSurfaceStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const hoverTransform = getHoverTransform(t);

    const handleMove = useCallback((itemId: string, from: string, to: string, _pos: number) => {
      if (from !== to) onCandidateMove?.(itemId, from, to);
    }, [onCandidateMove]);

    /* Column header */
    const renderColumnHeader = useCallback((col: KanbanColumnDef<KanbanCandidate>, count: number) => {
      const stage = sorted.find(s => s.id === col.id);
      if (!stage) return null;
      const sla = getStageSlaStatus(col.items, stage);

      return (
        <div style={{ marginBottom: t.spacing[1] }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[2] }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
              <span style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[800] }}>{stage.name}</span>
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 22, height: 22,
                borderRadius: t.borderRadius.full, backgroundColor: t.colors.neutral[100], color: t.colors.neutral[600],
                fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold, padding: `0 ${t.spacing[2]}px`,
              }}>{count}</span>
            </div>
          </div>
          <div style={{ height: 3, borderRadius: t.borderRadius.full, backgroundColor: t.colors.neutral[100], overflow: 'hidden' }}>
            <div style={{ height: '100%', width: count > 0 ? '100%' : '0%', backgroundColor: getSlaBarColor(sla, t), borderRadius: t.borderRadius.full, transition: 'width 0.4s ease' }} />
          </div>
        </div>
      );
    }, [sorted, t]);

    /* Card renderer */
    const renderCard = useCallback((c: KanbanCandidate, _colId: string) => {
      const isSel = selected === c.id;
      const isBulk = bulk.includes(c.id);
      const isH = hovered === c.id;
      const src = getSourceConfig(c.source, t);
      const aiC = getAiColor(c.aiRecommendation, t);
      const showTip = aiTip === c.id;

      return (
        <div
          onClick={() => setSelected(c.id)}
          onMouseEnter={() => setHovered(c.id)}
          onMouseLeave={() => { setHovered(null); setAiTip(null); }}
          style={{
            ...cardBase,
            padding: `${t.spacing[4]}px`,
            cursor: 'grab',
            borderColor: isSel ? t.colors.primaryScale[400] : isBulk ? t.colors.primaryScale[200] : t.colors.neutral[100],
            backgroundColor: isSel ? t.colors.primaryScale[50] : isBulk ? t.colors.primaryScale[50] ?? t.colors.common.white : t.colors.common.white,
            position: 'relative',
            transition: `all 0.2s ease`,
            ...(isH ? { ...hoverTransform, boxShadow: t.shadows.md } : {}),
          }}
        >
          {/* Bulk checkbox */}
          {(bulk.length > 0 || isH) && (
            <button onClick={e => { e.stopPropagation(); toggleBulk(c.id); }}
              style={{ position: 'absolute', top: t.spacing[2], left: t.spacing[2], width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: isBulk ? t.colors.primaryScale[600] : t.colors.neutral[300], zIndex: 2 }}>
              {isBulk ? <CheckSquare size={14} /> : <Square size={14} />}
            </button>
          )}

          {/* Avatar + Name + Score */}
          <div style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3], marginBottom: t.spacing[3] }}>
            <div style={{
              width: 38, height: 38, borderRadius: t.borderRadius.full,
              backgroundColor: t.colors.primaryScale[50], color: t.colors.primaryScale[700],
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold,
              overflow: 'hidden', flexShrink: 0, border: `2px solid ${t.colors.common.white}`, boxShadow: `0 0 0 1px ${t.colors.neutral[100]}`,
            }}>
              {c.avatar
                ? <img src={c.avatar} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: t.borderRadius.full }} />
                : getInitials(c.name)
              }
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[900], whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
              {c.email && <div style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400], whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.email}</div>}
            </div>
            <ScoreRing score={c.scorePercent} tokens={t} />
          </div>

          {/* Metadata row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[3], flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: t.typography.fontSize.xs, color: c.daysInStage >= 3 ? t.colors.warningScale[600] : t.colors.neutral[500] }}>
              <Clock size={11} />{c.daysInStage}d
            </span>
            <span style={{ display: 'inline-flex', padding: `1px ${t.spacing[2]}px`, borderRadius: br, fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, backgroundColor: src.bg, color: src.text }}>
              {src.label}
            </span>
            <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
              onMouseEnter={() => setAiTip(c.id)} onMouseLeave={() => setAiTip(null)}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Sparkles size={11} style={{ color: aiC }} />
                <span style={{ width: 7, height: 7, borderRadius: t.borderRadius.full, backgroundColor: aiC }} />
              </span>
              {showTip && (
                <span style={{
                  position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
                  marginBottom: 4, padding: `3px ${t.spacing[2]}px`, borderRadius: t.borderRadius.md,
                  backgroundColor: t.colors.neutral[900], color: t.colors.common.white,
                  fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium,
                  whiteSpace: 'nowrap', zIndex: 10, boxShadow: t.shadows.lg,
                }}>
                  {getAiLabel(c.aiRecommendation)}
                </span>
              )}
            </span>
          </div>

          {/* Tags */}
          {c.tags.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], flexWrap: 'wrap' }}>
              {c.tags.slice(0, 2).map((tag, i) => (
                <span key={i} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 3,
                  padding: `1px ${t.spacing[2]}px`, borderRadius: br,
                  fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium,
                  backgroundColor: t.colors.neutral[50], color: t.colors.neutral[600],
                  border: `1px solid ${t.colors.neutral[100]}`,
                }}>
                  <Tag size={9} />{tag}
                </span>
              ))}
              {c.tags.length > 2 && (
                <span style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>+{c.tags.length - 2}</span>
              )}
            </div>
          )}

          {/* Hover actions */}
          {isH && (
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: t.spacing[1],
              padding: `${t.spacing[3]}px 0 ${t.spacing[2]}px`,
              background: `linear-gradient(transparent, ${t.colors.common.white} 40%)`,
              borderRadius: `0 0 ${t.borderRadius.lg} ${t.borderRadius.lg}`,
            }}>
              {[
                { icon: <Calendar size={13} />, color: t.colors.primaryScale[600], fn: () => onScheduleInterview?.(c.id) },
                { icon: <MessageSquare size={13} />, color: t.colors.infoScale[600], fn: () => onAddNote?.(c.id) },
                { icon: <ThumbsDown size={13} />, color: t.colors.errorScale[600], fn: () => setConfirmRejectId(c.id) },
                { icon: <Pause size={13} />, color: t.colors.warningScale[600], fn: () => onHold?.(c.id) },
              ].map((a, i) => (
                <button key={i} onClick={e => { e.stopPropagation(); a.fn(); }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28,
                    borderRadius: t.borderRadius.md, border: `1px solid ${t.colors.neutral[200] ?? t.colors.neutral[200]}`,
                    backgroundColor: t.colors.common.white, color: a.color, cursor: 'pointer', padding: 0,
                    boxShadow: t.shadows.sm, transition: `transform ${t.motion.hover}`,
                  }}>
                  {a.icon}
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }, [selected, bulk, hovered, aiTip, t, cardBase, hoverTransform, br, setSelected, toggleBulk, onScheduleInterview, onAddNote, onHold]);

    /* Toolbar */
    const toolbar = (
      <div style={{
        padding: `${t.spacing[5]}px ${t.spacing[6]}px`,
        backgroundColor: t.colors.common.white,
        borderBottom: `1px solid ${t.colors.neutral[100]}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: t.spacing[4],
        ...(isGlass && t.glass ? { backdropFilter: t.glass.blur, WebkitBackdropFilter: t.glass.blur, backgroundColor: t.glass.bg } : {}),
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3], minWidth: 0 }}>
          <div style={{
            width: 36, height: 36, borderRadius: t.borderRadius.lg, backgroundColor: t.colors.primaryScale[50],
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Briefcase size={18} style={{ color: t.colors.primaryScale[600] }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[900], whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {jobName}
            </div>
            <div style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], marginTop: 2 }}>
              {totalFiltered} of {totalCandidates} candidates
              {hasFilters && <span style={{ color: t.colors.primaryScale[600], marginLeft: t.spacing[1] }}>(filtered)</span>}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], flex: 1, maxWidth: 440 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={15} style={{ position: 'absolute', left: t.spacing[3], top: '50%', transform: 'translateY(-50%)', color: t.colors.neutral[400], pointerEvents: 'none' }} />
            <input type="text" placeholder="Search candidates..." value={sq}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', padding: `${t.spacing[2]}px ${t.spacing[3]}px ${t.spacing[2]}px 36px`,
                border: `1px solid ${t.colors.neutral[200]}`, borderRadius: t.borderRadius.lg,
                fontSize: t.typography.fontSize.sm, color: t.colors.neutral[800],
                backgroundColor: t.colors.neutral[50], outline: 'none', fontFamily: 'inherit',
                transition: `border-color ${t.motion.hover}`, boxSizing: 'border-box',
              }} />
            {sq && (
              <button onClick={() => setSearch('')}
                style={{ position: 'absolute', right: t.spacing[2], top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: t.colors.neutral[400], display: 'flex' }}>
                <X size={14} />
              </button>
            )}
          </div>
          <button onClick={() => setShowFilter(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: t.spacing[1],
              padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
              border: `1px solid ${hasFilters ? t.colors.primaryScale[300] : t.colors.neutral[200]}`,
              borderRadius: t.borderRadius.lg,
              backgroundColor: hasFilters ? t.colors.primaryScale[50] : t.colors.common.white,
              color: hasFilters ? t.colors.primaryScale[700] : t.colors.neutral[600],
              fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium,
              cursor: 'pointer', whiteSpace: 'nowrap',
            }}>
            <Filter size={14} /> Filters
            {hasFilters && <span style={{ width: 6, height: 6, borderRadius: t.borderRadius.full, backgroundColor: t.colors.primaryScale[500] }} />}
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
          {bulk.length > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: t.spacing[2],
              padding: `${t.spacing[1]}px ${t.spacing[3]}px`, borderRadius: t.borderRadius.lg,
              backgroundColor: t.colors.primaryScale[50], fontSize: t.typography.fontSize.xs,
              fontWeight: t.typography.fontWeight.medium, color: t.colors.primaryScale[700],
            }}>
              {bulk.length} selected
              <button onClick={() => setBulk([])}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: t.colors.primaryScale[500], display: 'flex' }}>
                <X size={12} />
              </button>
            </div>
          )}
          <button style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32,
            borderRadius: t.borderRadius.lg, border: `1px solid ${t.colors.primaryScale[200]}`,
            backgroundColor: t.colors.primaryScale[50], color: t.colors.primaryScale[600], cursor: 'default',
          }} title="Board view"><LayoutGrid size={15} /></button>
          <button style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32,
            borderRadius: t.borderRadius.lg, border: `1px solid ${t.colors.neutral[200]}`,
            backgroundColor: t.colors.common.white, color: t.colors.neutral[400], cursor: 'pointer',
          }} title="Swimlane view"><Rows3 size={15} /></button>
        </div>
      </div>
    );

    return (
      <Box className={className} style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: t.colors.neutral[50], fontFamily: 'inherit', ...style }}>
        {toolbar}

        {/* Filter panel */}
        {showFilter && (
          <div style={{
            padding: `${t.spacing[3]}px ${t.spacing[6]}px`,
            backgroundColor: t.colors.common.white, borderBottom: `1px solid ${t.colors.neutral[100]}`,
            display: 'flex', alignItems: 'center', gap: t.spacing[4], flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
              <span style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[500], textTransform: 'uppercase', letterSpacing: '0.05em' }}>Source</span>
              {(['applied', 'referral', 'sourced', 'agency', 'internal'] as CandidateSource[]).map(src => {
                const active = filters.source?.includes(src);
                const sc = getSourceConfig(src, t);
                return (
                  <button key={src} onClick={() => {
                    const cur = filters.source ?? [];
                    const next = active ? cur.filter(s => s !== src) : [...cur, src];
                    setFilters({ ...filters, source: next.length > 0 ? next : undefined });
                  }} style={{
                    padding: `2px ${t.spacing[2]}px`, borderRadius: br, fontSize: t.typography.fontSize.xs,
                    fontWeight: t.typography.fontWeight.medium,
                    border: `1px solid ${active ? sc.text : t.colors.neutral[200]}`,
                    backgroundColor: active ? sc.bg : t.colors.common.white,
                    color: active ? sc.text : t.colors.neutral[500], cursor: 'pointer',
                  }}>{sc.label}</button>
                );
              })}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
              <span style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[500], textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI</span>
              {(['advance', 'hold', 'reject'] as AiRecommendation[]).map(rec => {
                const active = filters.aiRecommendation?.includes(rec);
                const ac = getAiColor(rec, t);
                return (
                  <button key={rec} onClick={() => {
                    const cur = filters.aiRecommendation ?? [];
                    const next = active ? cur.filter(r => r !== rec) : [...cur, rec];
                    setFilters({ ...filters, aiRecommendation: next.length > 0 ? next : undefined });
                  }} style={{
                    padding: `2px ${t.spacing[2]}px`, borderRadius: br, fontSize: t.typography.fontSize.xs,
                    fontWeight: t.typography.fontWeight.medium, textTransform: 'capitalize',
                    border: `1px solid ${active ? ac : t.colors.neutral[200]}`,
                    backgroundColor: active ? `${ac}12` : t.colors.common.white,
                    color: active ? ac : t.colors.neutral[500], cursor: 'pointer',
                  }}>{rec}</button>
                );
              })}
            </div>
            {hasFilters && (
              <button onClick={() => setFilters({})} style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: `2px ${t.spacing[2]}px`, borderRadius: br, fontSize: t.typography.fontSize.xs,
                fontWeight: t.typography.fontWeight.medium, border: 'none',
                backgroundColor: t.colors.errorScale[50], color: t.colors.errorScale[600], cursor: 'pointer',
              }}><X size={11} /> Clear all</button>
            )}
          </div>
        )}

        {/* Kanban */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <PatternKanbanBoard
            columns={columns}
            renderCard={renderCard}
            renderColumnHeader={renderColumnHeader}
            onItemMove={handleMove}
            onItemClick={item => setSelected(item.id)}
            itemKey={c => c.id}
            columnMinWidth={280}
            columnGap={t.spacing[3]}
            emptyColumn={
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: `${t.spacing[8]}px ${t.spacing[4]}px`, color: t.colors.neutral[300],
                fontSize: t.typography.fontSize.sm, textAlign: 'center',
              }}>
                <Users size={28} style={{ marginBottom: t.spacing[2], opacity: 0.4 }} />
                No candidates in this stage
              </div>
            }
            engine={engine}
          />
        </div>

        {/* Confirm reject modal */}
        {confirmRejectId && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: t.overlay?.light, zIndex: 1000,
          }} onClick={() => setConfirmRejectId(null)}>
            <div onClick={(e: React.MouseEvent) => e.stopPropagation()} style={{
              ...cardBase, padding: `${t.spacing[6]}px`, maxWidth: 380, width: '90%',
              backgroundColor: t.colors.common.white, boxShadow: t.shadows.xl,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3], marginBottom: t.spacing[4] }}>
                <div style={{
                  width: 40, height: 40, borderRadius: t.borderRadius.full,
                  backgroundColor: t.colors.errorScale[50], color: t.colors.errorScale[600],
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <ThumbsDown size={18} />
                </div>
                <span style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[900] }}>Confirm Rejection</span>
              </div>
              <div style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[600], marginBottom: t.spacing[5], lineHeight: t.typography.lineHeight.relaxed }}>
                Are you sure you want to reject this candidate? They will be moved to the rejected pool and notified.
              </div>
              <div style={{ display: 'flex', gap: t.spacing[3], justifyContent: 'flex-end' }}>
                <button onClick={() => setConfirmRejectId(null)} style={{
                  padding: `${t.spacing[2]}px ${t.spacing[4]}px`, borderRadius: t.borderRadius.lg,
                  border: `1px solid ${t.colors.neutral[200]}`, backgroundColor: t.colors.common.white,
                  color: t.colors.neutral[700], fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, cursor: 'pointer',
                }}>Cancel</button>
                <button onClick={() => { onReject?.(confirmRejectId); setConfirmRejectId(null); }} style={{
                  padding: `${t.spacing[2]}px ${t.spacing[4]}px`, borderRadius: t.borderRadius.lg,
                  border: 'none', backgroundColor: t.colors.errorScale[600], color: t.colors.common.white,
                  fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, cursor: 'pointer',
                }}>Reject Candidate</button>
              </div>
            </div>
          </div>
        )}
      </Box>
    );
  },
});
