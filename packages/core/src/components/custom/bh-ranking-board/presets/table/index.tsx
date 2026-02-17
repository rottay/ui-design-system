'use client';

/**
 * BhRankingBoard - Table Preset
 * Full ranking table with score distribution histogram, top 3 podium,
 * sortable columns, and inline decision actions. Slite-inspired warm design.
 */

import { useState, useMemo, useCallback } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  getPersonalityBadgeRadius,
  getPersonalityTypography,
  createCardHoverStyles,
  createEntranceAnimation,
} from '../../../helpers';
import type {
  BhRankingBoardProps, RankedCandidate, ScoreDistribution,
  RankingFilters, RankingSortBy, SortDirection, DecisionAction, DecisionStatus,
} from '../../core';
import {
  getDecisionColors, getDecisionActionColors, getScoreBarColor,
  getRankBadgeColors, getCandidateInitials,
} from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  Search, ChevronUp, ChevronDown, Trophy, AlertTriangle,
  ThumbsUp, ThumbsDown, Pause, Download, Filter,
  BarChart3, X, CheckCircle, Clock, ArrowUpDown,
} from 'lucide-react';

/* ---------------------------------------------------------------------------
 * Default Data
 * -------------------------------------------------------------------------*/

const DEFAULT_CANDIDATES: RankedCandidate[] = [
  { id: 'c-1', rank: 1, name: 'Sarah Johnson', overallScore: 92, stageScores: [{ stage: 'Technical', score: 95 }, { stage: 'Culture', score: 88 }, { stage: 'Leadership', score: 93 }], completionPercent: 100, hasKnockout: false, decisionStatus: 'pending', strengths: ['Deep React expertise', 'Google experience'], weaknesses: ['Limited backend'] },
  { id: 'c-2', rank: 2, name: 'Michael Chen', overallScore: 88, stageScores: [{ stage: 'Technical', score: 90 }, { stage: 'Culture', score: 91 }, { stage: 'Leadership', score: 83 }], completionPercent: 100, hasKnockout: false, decisionStatus: 'advanced', strengths: ['Full-stack'], weaknesses: ['Short tenure'] },
  { id: 'c-3', rank: 3, name: 'Emily Rodriguez', overallScore: 85, stageScores: [{ stage: 'Technical', score: 88 }, { stage: 'Culture', score: 80 }, { stage: 'Leadership', score: 87 }], completionPercent: 90, hasKnockout: false, decisionStatus: 'pending', strengths: ['Staff-level at Meta'], weaknesses: ['Salary expectations'] },
  { id: 'c-4', rank: 4, name: 'James Kim', overallScore: 72, stageScores: [{ stage: 'Technical', score: 78 }, { stage: 'Culture', score: 70 }, { stage: 'Leadership', score: 68 }], completionPercent: 85, hasKnockout: true, decisionStatus: 'hold', strengths: ['ML background'], weaknesses: ['Knockout on culture', 'Junior level'] },
  { id: 'c-5', rank: 5, name: 'Anna Kowalski', overallScore: 68, stageScores: [{ stage: 'Technical', score: 72 }, { stage: 'Culture', score: 65 }, { stage: 'Leadership', score: 67 }], completionPercent: 75, hasKnockout: false, decisionStatus: 'rejected', strengths: ['DevOps skills'], weaknesses: ['Below threshold'] },
];

const DEFAULT_DISTRIBUTION: ScoreDistribution[] = [
  { score: 60, count: 1 }, { score: 65, count: 2 }, { score: 70, count: 3 },
  { score: 75, count: 5 }, { score: 80, count: 4 }, { score: 85, count: 6 },
  { score: 90, count: 3 }, { score: 95, count: 2 },
];

/* ---------------------------------------------------------------------------
 * Preset
 * -------------------------------------------------------------------------*/

export const TableBhRankingBoard = createPreset<BhRankingBoardProps>({
  name: 'BhRankingBoard.Table',
  render: ({ primitives, props, tokens: t }: PresetContext<BhRankingBoardProps>) => {
    const { Box, Text } = primitives;
    const br = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const personalityTypo = useMemo(() => getPersonalityTypography(t), [t]);
    const isGlass = t.surface.useGlass && !!t.glass;

    const {
      jobName = '',
      candidates: rawCandidates = [],
      scoreDistribution: rawScoreDistribution = [],
      filters: fp, onFilterChange,
      selectedCandidates: scp, onSelectionChange, onCompare,
      decisions: dp, onDecisionChange,
      onBulkAdvance, onBulkReject, onExport,
      sortBy: sbp = 'rank', sortDirection: sdp = 'asc', onSortChange,
      expandedCandidate: ecp, onCandidateExpand,
      className, style,
    } = props;

    const candidates = Array.isArray(rawCandidates) ? rawCandidates : [];
    const scoreDistribution = Array.isArray(rawScoreDistribution) ? rawScoreDistribution : [];

    const [iSearch, setISearch] = useState('');
    const [iSelected, setISelected] = useState<string[]>([]);
    const [iExpanded, setIExpanded] = useState<string | null>(null);
    const [iSort, setISort] = useState<{ by: RankingSortBy; dir: SortDirection }>({ by: 'rank', dir: 'asc' });

    const selected = scp ?? iSelected;
    const expanded = ecp ?? iExpanded;
    const sortBy = sbp ?? iSort.by;
    const sortDir = sdp ?? iSort.dir;
    const search = fp?.searchQuery ?? iSearch;

    const toggleSort = useCallback((col: RankingSortBy) => {
      const newDir = sortBy === col && sortDir === 'asc' ? 'desc' : 'asc';
      onSortChange?.(col, newDir);
      setISort({ by: col, dir: newDir });
    }, [sortBy, sortDir, onSortChange]);

    const toggleSelect = useCallback((id: string) => {
      const next = selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id];
      onSelectionChange?.(next); if (!scp) setISelected(next);
    }, [selected, onSelectionChange, scp]);

    const handleExpand = useCallback((id: string | null) => {
      onCandidateExpand?.(id);
      if (ecp === undefined) setIExpanded(id);
    }, [onCandidateExpand, ecp]);

    const handleSearch = useCallback((value: string) => {
      onFilterChange?.({ ...fp, searchQuery: value });
      setISearch(value);
    }, [onFilterChange, fp]);

    const maxDist = Math.max(...scoreDistribution.map(d => d.count), 1);

    const filtered = useMemo(() => {
      let list = [...candidates];
      if (search) list = list.filter(c => (c.name || '').toLowerCase().includes(search.toLowerCase()));
      list.sort((a, b) => {
        let cmp = 0;
        if (sortBy === 'rank') cmp = a.rank - b.rank;
        else if (sortBy === 'name') cmp = a.name.localeCompare(b.name);
        else if (sortBy === 'score') cmp = a.overallScore - b.overallScore;
        else if (sortBy === 'completion') cmp = a.completionPercent - b.completionPercent;
        return sortDir === 'desc' ? -cmp : cmp;
      });
      return list;
    }, [candidates, search, sortBy, sortDir]);

    const SortIcon = ({ col }: { col: RankingSortBy }) => (
      <Box style={{ color: sortBy === col ? t.colors.primaryScale[600] : t.colors.neutral[300], display: 'inline-flex', marginLeft: 2 }}>
        {sortBy === col && sortDir === 'desc' ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
      </Box>
    );

    const cardStyle = useMemo(() => createCardStyle(t, { elevation: 'md', glass: isGlass }), [t, isGlass]);

    return (
      <Box className={className} style={{
        ...cardStyle,
        display: 'flex', flexDirection: 'column', width: '100%', height: '100%',
        backgroundColor: t.colors.common.white, overflow: 'hidden',
        ...(isGlass && t.glass ? { backdropFilter: t.glass.blur, WebkitBackdropFilter: t.glass.blur } : {}),
        ...style,
      }}>
        {/* Header */}
        <Box style={{
          padding: `${t.spacing[5]}px ${t.spacing[6]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
            <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: personalityTypo.headingWeight, color: t.colors.neutral[900], letterSpacing: personalityTypo.headingLetterSpacing }}>{jobName} - Rankings</Text>
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500]}}>{filtered.length} candidates ranked</Text>
          </Box>
          <Box style={{ display: 'flex', gap: t.spacing[2] }} role="toolbar" aria-label="Ranking actions">
            {selected.length > 0 && onCompare && (
              <Box
                role="button"
                tabIndex={0}
                aria-label={`Compare ${selected.length} selected candidates`}
                onClick={() => onCompare(selected)}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') onCompare(selected); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: `${t.spacing[2]}px ${t.spacing[3]}px`, borderRadius: t.borderRadius.lg,
                  border: `1px solid ${t.colors.primaryScale[300]}`, backgroundColor: t.colors.primaryScale[50],
                  color: t.colors.primaryScale[700], fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, cursor: 'pointer',
                  transition: `all ${t.motion.hover}`,
                }}>
                <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, color: t.colors.primaryScale[700] }}>Compare ({selected.length})</Text>
              </Box>
            )}
            {onExport && (
              <Box
                role="button"
                tabIndex={0}
                aria-label="Export rankings"
                onClick={onExport}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') onExport(); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: `${t.spacing[2]}px ${t.spacing[3]}px`, borderRadius: t.borderRadius.lg,
                  border: `1px solid ${t.colors.neutral[200]}`, backgroundColor: t.colors.common.white,
                  color: t.colors.neutral[600], fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, cursor: 'pointer',
                  transition: `all ${t.motion.hover}`,
                }}>
                <Download size={13} />
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600] }}>Export</Text>
              </Box>
            )}
          </Box>
        </Box>

        {/* Distribution chart */}
        <Box style={{ padding: `${t.spacing[4]}px ${t.spacing[6]}px`, borderBottom: `1px solid ${t.colors.neutral[100]}`, backgroundColor: t.colors.neutral[50] }} aria-label="Score distribution chart">
          <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[500], marginBottom: t.spacing[2], textTransform: personalityTypo.labelTransform, letterSpacing: personalityTypo.labelLetterSpacing }}>Score Distribution</Text>
          <Box style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 40 }} role="img" aria-label="Score distribution histogram">
            {scoreDistribution.map(d => (
              <Box key={d.score} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box style={{
                  width: '100%', height: Math.max((d.count / maxDist) * 32, 2),
                  backgroundColor: getScoreBarColor(d.score, t), borderRadius: `${t.borderRadius.sm} ${t.borderRadius.sm} 0 0`,
                  transition: `height ${t.motion.hover}`,
                }} />
              </Box>
            ))}
          </Box>
          <Box style={{ display: 'flex', justifyContent: 'space-between', marginTop: t.spacing[1] }}>
            <Text style={{ fontSize: 9, color: t.colors.neutral[400] }}>60</Text>
            <Text style={{ fontSize: 9, color: t.colors.neutral[400] }}>95</Text>
          </Box>
        </Box>

        {/* Search */}
        <Box style={{ padding: `${t.spacing[3]}px ${t.spacing[6]}px`, borderBottom: `1px solid ${t.colors.neutral[100]}` }}>
          <Box style={{ position: 'relative', maxWidth: 320 }}>
            <Search size={14} style={{ position: 'absolute', left: t.spacing[3], top: '50%', transform: 'translateY(-50%)', color: t.colors.neutral[400], pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Search candidates..."
              value={search}
              aria-label="Search candidates"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearch(e.target.value)}
              style={{
                width: '100%', padding: `${t.spacing[2]}px ${t.spacing[3]}px ${t.spacing[2]}px 32px`,
                border: `1px solid ${t.colors.neutral[200]}`, borderRadius: t.borderRadius.lg,
                fontSize: t.typography.fontSize.xs, color: t.colors.neutral[800],
                outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' as const,
                backgroundColor: t.colors.common.white,
                transition: `border-color ${t.motion.hover}`,
              } as any}
            />
          </Box>
        </Box>

        {/* Table */}
        <Box style={{ flex: 1, overflow: 'auto' }} role="table" aria-label="Candidate rankings">
          {/* Header row */}
          <Box role="row" style={{
            display: 'grid', gridTemplateColumns: '40px 50px 1fr 80px 120px 100px 120px',
            padding: `${t.spacing[2]}px ${t.spacing[6]}px`,
            borderBottom: `1px solid ${t.colors.neutral[100]}`, backgroundColor: t.colors.neutral[50],
            position: 'sticky' as const, top: 0, zIndex: 1,
          }}>
            <Box role="columnheader" />
            {[
              { label: 'Rank', col: 'rank' as RankingSortBy },
              { label: 'Candidate', col: 'name' as RankingSortBy },
              { label: 'Score', col: 'score' as RankingSortBy },
              { label: 'Stage Scores', col: undefined },
              { label: 'Progress', col: 'completion' as RankingSortBy },
              { label: 'Decision', col: 'decision' as RankingSortBy },
            ].map((h, i) => (
              <Box key={i}
                role="columnheader"
                tabIndex={h.col ? 0 : undefined}
                aria-sort={h.col && sortBy === h.col ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined}
                onClick={() => h.col && toggleSort(h.col)}
                onKeyDown={h.col ? (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') toggleSort(h.col!); } : undefined}
                style={{
                  display: 'flex', alignItems: 'center', padding: `${t.spacing[2]}px 0`,
                  fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold,
                  color: t.colors.neutral[500], cursor: h.col ? 'pointer' : 'default',
                  textTransform: personalityTypo.labelTransform, letterSpacing: personalityTypo.labelLetterSpacing, userSelect: 'none' as const,
                }}>
                <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: sortBy === h.col ? t.colors.primaryScale[600] : t.colors.neutral[500] }}>{h.label}</Text>
                {h.col && <SortIcon col={h.col} />}
              </Box>
            ))}
          </Box>

          {/* Rows */}
          {filtered.map(c => {
            const rb = getRankBadgeColors(c.rank, t);
            const dc = getDecisionColors(c.decisionStatus, t);
            const isExp = expanded === c.id;
            const isSel = selected.includes(c.id);

            return (
              <Box key={c.id}>
                <Box
                  role="row"
                  aria-label={`${c.name}, rank ${c.rank}, score ${c.overallScore}`}
                  aria-expanded={isExp}
                  style={{
                    display: 'grid', gridTemplateColumns: '40px 50px 1fr 80px 120px 100px 120px',
                    padding: `${t.spacing[3]}px ${t.spacing[6]}px`,
                    borderBottom: `1px solid ${t.colors.neutral[50]}`,
                    backgroundColor: isSel ? t.colors.primaryScale[50] : isExp ? t.colors.neutral[50] : t.colors.common.white,
                    cursor: 'pointer', transition: `background-color ${t.motion.hover}`,
                  }}
                  onClick={() => handleExpand(isExp ? null : c.id)}
                >
                  {/* Select */}
                  <Box style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                      type="checkbox"
                      checked={isSel}
                      aria-label={`Select ${c.name}`}
                      onChange={() => toggleSelect(c.id)}
                      onClick={(e: React.MouseEvent) => e.stopPropagation()}
                      style={{ width: 14, height: 14, cursor: 'pointer' }}
                    />
                  </Box>
                  {/* Rank */}
                  <Box style={{ display: 'flex', alignItems: 'center' }}>
                    <Box style={{
                      padding: `1px ${t.spacing[2]}px`, borderRadius: br,
                      backgroundColor: rb.bg, color: rb.color, border: `1px solid ${rb.border}`,
                      fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold,
                    }}>
                      <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold, color: rb.color }}>#{c.rank}</Text>
                    </Box>
                  </Box>
                  {/* Name */}
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                    <Box style={{
                      width: 30, height: 30, borderRadius: t.borderRadius.full,
                      backgroundColor: t.colors.primaryScale[50], color: t.colors.primaryScale[700],
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold, flexShrink: 0,
                    }}>
                      <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold, color: t.colors.primaryScale[700] }}>{getCandidateInitials(c.name)}</Text>
                    </Box>
                    <Box>
                      <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[900] }}>{c.name}</Text>
                      {c.hasKnockout && (
                        <Box style={{ display: 'flex', alignItems: 'center', gap: 2, marginTop: 1 }}>
                          <AlertTriangle size={10} style={{ color: t.colors.errorScale[500] }} />
                          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.errorScale[600] }}>Knockout</Text>
                        </Box>
                      )}
                    </Box>
                  </Box>
                  {/* Score */}
                  <Box style={{ display: 'flex', alignItems: 'center' }}>
                    <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, color: getScoreBarColor(c.overallScore, t) }}>{c.overallScore}%</Text>
                  </Box>
                  {/* Stage scores mini bars */}
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                    {(c.stageScores ?? []).map(ss => (
                      <Box key={ss.stage} style={{ flex: 1 }} title={`${ss.stage}: ${ss.score}`}>
                        <Box style={{ height: 4, borderRadius: t.borderRadius.full, backgroundColor: t.colors.neutral[100], overflow: 'hidden' }}>
                          <Box style={{ height: '100%', width: `${ss.score}%`, backgroundColor: getScoreBarColor(ss.score, t), borderRadius: t.borderRadius.full }} />
                        </Box>
                      </Box>
                    ))}
                  </Box>
                  {/* Completion */}
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                    <Box style={{ flex: 1, height: 4, borderRadius: t.borderRadius.full, backgroundColor: t.colors.neutral[100], overflow: 'hidden' }} role="progressbar" aria-valuenow={c.completionPercent} aria-valuemin={0} aria-valuemax={100} aria-label={`${c.completionPercent}% complete`}>
                      <Box style={{ height: '100%', width: `${c.completionPercent}%`, backgroundColor: t.colors.primaryScale[500], borderRadius: t.borderRadius.full }} />
                    </Box>
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], fontWeight: t.typography.fontWeight.medium }}>{c.completionPercent}%</Text>
                  </Box>
                  {/* Decision */}
                  <Box style={{ display: 'flex', alignItems: 'center' }}>
                    <Box style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      padding: `2px ${t.spacing[2]}px`, borderRadius: br,
                      backgroundColor: dc.bg, color: dc.color, border: `1px solid ${dc.border}`,
                      fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium,
                      textTransform: 'capitalize' as const,
                    }}>
                      {c.decisionStatus === 'advanced' && <CheckCircle size={10} />}
                      {c.decisionStatus === 'hold' && <Clock size={10} />}
                      <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, color: dc.color }}>{c.decisionStatus}</Text>
                    </Box>
                  </Box>
                </Box>

                {/* Expanded row */}
                {isExp && (
                  <Box style={{
                    padding: `${t.spacing[4]}px ${t.spacing[6]}px ${t.spacing[4]}px 90px`,
                    backgroundColor: t.colors.neutral[50], borderBottom: `1px solid ${t.colors.neutral[100]}`,
                    display: 'flex', gap: t.spacing[6],
                    ...createEntranceAnimation(t, { index: 0 }).animate,
                  }}>
                    <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], flex: 1 }}>
                      <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.successScale[600], marginBottom: t.spacing[1] }}>Strengths</Text>
                      {(c.strengths ?? []).map((s, i) => (
                        <Text key={i} style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600], marginBottom: t.spacing[1] }}>- {s}</Text>
                      ))}
                    </Box>
                    <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], flex: 1 }}>
                      <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.errorScale[600], marginBottom: t.spacing[1] }}>Weaknesses</Text>
                      {(c.weaknesses ?? []).map((w, i) => (
                        <Text key={i} style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600], marginBottom: t.spacing[1] }}>- {w}</Text>
                      ))}
                    </Box>
                    <Box style={{ display: 'flex', gap: t.spacing[2], alignItems: 'flex-start' }} role="group" aria-label="Decision actions">
                      {(['advance', 'hold', 'reject'] as DecisionAction[]).map(action => {
                        const ac = getDecisionActionColors(action, t);
                        const icons = { advance: <ThumbsUp size={12} />, hold: <Pause size={12} />, reject: <ThumbsDown size={12} /> };
                        return (
                          <Box
                            key={action}
                            role="button"
                            tabIndex={0}
                            aria-label={`${action} ${c.name}`}
                            onClick={(e: React.MouseEvent) => { e.stopPropagation(); onDecisionChange?.(c.id, action); }}
                            onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); onDecisionChange?.(c.id, action); } }}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 4,
                              padding: `${t.spacing[2]}px ${t.spacing[3]}px`, borderRadius: br,
                              border: `1px solid ${ac.border}`, backgroundColor: ac.bg,
                              color: ac.color, fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium,
                              cursor: 'pointer', textTransform: 'capitalize' as const,
                              transition: `all ${t.motion.hover}`,
                            }}>
                            {icons[action]}
                            <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, color: ac.color }}>{action}</Text>
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  },
});
