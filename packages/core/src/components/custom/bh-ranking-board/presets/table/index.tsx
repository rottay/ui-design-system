'use client';

/**
 * BhRankingBoard - Table Preset
 * Full ranking table with score distribution histogram, top 3 podium,
 * filter bar, multi-select comparison, bulk actions, and decision column
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createBadgeStyle,
  createCardStyle,
  createEmptyStateStyle,
  createHoverStyle,
  createPanelHeaderStyle,
  createProgressBarStyle,
  createSectionHeaderStyle,
  createSurfaceStyle,
  getHoverTransform,
} from '../../../helpers';
import type {
  BhRankingBoardProps,
  RankedCandidate,
  DecisionAction,
  DecisionStatus,
  ScoreDistribution,
  RankingSortBy,
  SortDirection,
  RankingFilters,
} from '../../core';
import {
  getDecisionColors,
  getDecisionActionColors,
  getScoreBarColor,
  getRankBadgeColors,
  getCandidateInitials,
} from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  Trophy,
  Users,
  BarChart3,
  Filter,
  Search,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  CheckSquare,
  Square,
  ArrowUpDown,
  Download,
  ThumbsUp,
  ThumbsDown,
  Pause,
  AlertTriangle,
  Flag,
  Star,
  TrendingUp,
  TrendingDown,
  Eye,
  MoreVertical,
  X,
  Check,
  Minus,
  User,
  Medal,
  Zap,
  Target,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Helper: Sort candidates                                             */
/* ------------------------------------------------------------------ */
function sortCandidates(
  candidates: RankedCandidate[],
  sortBy: RankingSortBy,
  direction: SortDirection,
): RankedCandidate[] {
  const sorted = [...candidates];
  const mult = direction === 'asc' ? 1 : -1;

  switch (sortBy) {
    case 'rank':
      return sorted.sort((a, b) => (a.rank - b.rank) * mult);
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name) * mult);
    case 'score':
      return sorted.sort((a, b) => (a.overallScore - b.overallScore) * mult);
    case 'completion':
      return sorted.sort((a, b) => (a.completionPercent - b.completionPercent) * mult);
    case 'decision':
      return sorted.sort((a, b) => a.decisionStatus.localeCompare(b.decisionStatus) * mult);
    default:
      return sorted;
  }
}

function filterCandidates(candidates: RankedCandidate[], filters: RankingFilters, scoreRange: [number, number]): RankedCandidate[] {
  let result = candidates;

  if (filters.knockoutOnly) {
    result = result.filter(c => c.hasKnockout);
  }

  if (filters.decisionStatus && filters.decisionStatus.length > 0) {
    result = result.filter(c => filters.decisionStatus!.includes(c.decisionStatus));
  }

  if (filters.searchQuery) {
    const q = filters.searchQuery.toLowerCase();
    result = result.filter(c => c.name.toLowerCase().includes(q));
  }

  result = result.filter(c => c.overallScore >= scoreRange[0] && c.overallScore <= scoreRange[1]);

  return result;
}

/* ------------------------------------------------------------------ */
/*  Helper: Gaussian curve                                              */
/* ------------------------------------------------------------------ */
function computeGaussianPoints(distribution: ScoreDistribution[], width: number, height: number): string {
  if (distribution.length === 0) return '';
  const maxCount = Math.max(...distribution.map(d => d.count));
  if (maxCount === 0) return '';

  const points: string[] = [];
  const step = width / Math.max(distribution.length - 1, 1);

  for (let i = 0; i < distribution.length; i++) {
    const x = i * step;
    const y = height - (distribution[i].count / maxCount) * (height - 10);
    points.push(`${x},${y}`);
  }

  return points.join(' ');
}

/* ------------------------------------------------------------------ */
/*  Table Preset                                                        */
/* ------------------------------------------------------------------ */
export const TableBhRankingBoard = createPreset<BhRankingBoardProps>(
  'BhRankingBoard.Table',
  ({ primitives, props, tokens, engine }: PresetContext<BhRankingBoardProps>) => {
    const { Box } = primitives;
    const isModern = tokens.surface.useGlass;

    const {
      jobName,
      candidates,
      scoreDistribution = [],
      filters: filtersProp,
      onFilterChange,
      selectedCandidates: selectedProp,
      onSelectionChange,
      onCompare,
      decisions: decisionsProp,
      onDecisionChange,
      onBulkAdvance,
      onBulkReject,
      onExport,
      sortBy: sortByProp,
      sortDirection: sortDirProp,
      onSortChange,
      scoreRange: scoreRangeProp,
      onScoreRangeChange,
      expandedCandidate: expandedProp,
      onCandidateExpand,
      className,
      style,
    } = props;

    /* ---- internal state ---- */
    const [internalSortBy, setInternalSortBy] = useState<RankingSortBy>('rank');
    const [internalSortDir, setInternalSortDir] = useState<SortDirection>('asc');
    const [internalFilters, setInternalFilters] = useState<RankingFilters>({});
    const [internalSelected, setInternalSelected] = useState<string[]>([]);
    const [internalDecisions, setInternalDecisions] = useState<Record<string, DecisionAction>>({});
    const [internalScoreRange, setInternalScoreRange] = useState<[number, number]>([0, 100]);
    const [internalExpanded, setInternalExpanded] = useState<string | null>(null);

    const sortBy = sortByProp ?? internalSortBy;
    const sortDir = sortDirProp ?? internalSortDir;
    const filters = filtersProp ?? internalFilters;
    const selected = selectedProp ?? internalSelected;
    const decisions = decisionsProp ?? internalDecisions;
    const scoreRange = scoreRangeProp ?? internalScoreRange;
    const expandedCandidate = expandedProp ?? internalExpanded;

    const handleSortChange = (field: RankingSortBy) => {
      const newDir = sortBy === field && sortDir === 'asc' ? 'desc' : 'asc';
      onSortChange?.(field, newDir);
      setInternalSortBy(field);
      setInternalSortDir(newDir);
    };

    const handleFilterChange = (newFilters: RankingFilters) => {
      onFilterChange?.(newFilters);
      setInternalFilters(newFilters);
    };

    const handleToggleSelect = (id: string) => {
      const next = selected.includes(id)
        ? selected.filter(s => s !== id)
        : [...selected, id];
      onSelectionChange?.(next);
      setInternalSelected(next);
    };

    const handleSelectAll = () => {
      const allIds = filteredCandidates.map(c => c.id);
      const allSelected = allIds.every(id => selected.includes(id));
      const next = allSelected ? [] : allIds;
      onSelectionChange?.(next);
      setInternalSelected(next);
    };

    const handleDecisionChange = (candidateId: string, action: DecisionAction) => {
      onDecisionChange?.(candidateId, action);
      setInternalDecisions(prev => ({ ...prev, [candidateId]: action }));
    };

    const handleScoreRangeChange = (range: [number, number]) => {
      onScoreRangeChange?.(range);
      setInternalScoreRange(range);
    };

    const handleExpand = (id: string | null) => {
      onCandidateExpand?.(id);
      setInternalExpanded(id);
    };

    /* ---- glass support ---- */
    const glassCard = isModern && tokens.glass
      ? {
          backdropFilter: tokens.glass.blur,
          WebkitBackdropFilter: tokens.glass.blur,
          backgroundColor: tokens.glass.bg,
          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.glass.border}`,
        }
      : {};

    const surfaceStyle = useMemo(() => createSurfaceStyle(tokens, { elevation: 'md', glass: isModern }), [tokens, isModern]);
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isModern }), [tokens, isModern]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);
    const hoverTransform = getHoverTransform(tokens);

    /* ---- filtered + sorted candidates ---- */
    const filteredCandidates = useMemo(
      () => filterCandidates(candidates, filters, scoreRange),
      [candidates, filters, scoreRange],
    );
    const sortedCandidates = useMemo(
      () => sortCandidates(filteredCandidates, sortBy, sortDir),
      [filteredCandidates, sortBy, sortDir],
    );

    /* ---- pipeline summary ---- */
    const pipelineSummary = useMemo(() => {
      const summary: Record<DecisionStatus, number> = { pending: 0, advanced: 0, rejected: 0, hold: 0 };
      candidates.forEach(c => { summary[c.decisionStatus]++; });
      return summary;
    }, [candidates]);

    /* ---- top 3 for podium ---- */
    const top3 = useMemo(() => {
      return [...candidates].sort((a, b) => a.rank - b.rank).slice(0, 3);
    }, [candidates]);

    const hasSelection = selected.length > 0;
    const allSelected = filteredCandidates.length > 0 && filteredCandidates.every(c => selected.includes(c.id));

    /* ================================================================ */
    /*  RENDER: Job Header                                                */
    /* ================================================================ */
    const renderJobHeader = () => (
      <Box style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: `${tokens.spacing[5]}px ${tokens.spacing[6]}px`,
        borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
        flexWrap: 'wrap' as const,
        gap: tokens.spacing[3],
      }}>
        <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
          <Trophy size={20} color={tokens.colors.primaryScale[600]} />
          <Box>
            <Box style={{
              fontSize: tokens.typography.fontSize.xl,
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
              lineHeight: tokens.typography.lineHeight.tight,
            }}>
              {jobName}
            </Box>
            <Box style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[500],
              marginTop: tokens.spacing[1],
            }}>
              {candidates.length} ranked candidate{candidates.length !== 1 ? 's' : ''}
            </Box>
          </Box>
        </Box>

        {/* Pipeline summary badges */}
        <Box style={{ display: 'flex', gap: tokens.spacing[2], flexWrap: 'wrap' as const }}>
          {(Object.entries(pipelineSummary) as [DecisionStatus, number][]).map(([status, count]) => {
            const colors = getDecisionColors(status, tokens);
            return (
              <Box key={status} style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                borderRadius: tokens.borderRadius.full,
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.medium,
                backgroundColor: colors.bg,
                color: colors.color,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${colors.border}`,
                textTransform: 'capitalize' as const,
              }}>
                {status}: {count}
              </Box>
            );
          })}
        </Box>
      </Box>
    );

    /* ================================================================ */
    /*  RENDER: Top 3 Podium                                              */
    /* ================================================================ */
    const renderPodium = () => {
      if (top3.length < 3) return null;

      const podiumOrder = [top3[1], top3[0], top3[2]]; // silver, gold, bronze
      const heights = [100, 140, 80];
      const podiumColors = [
        { bg: tokens.colors.neutral[200], accent: tokens.colors.neutral[500], label: '2nd' },
        { bg: tokens.colors.warningScale[100], accent: tokens.colors.warningScale[600], label: '1st' },
        { bg: tokens.colors.warningScale[50], accent: tokens.colors.warningScale[400], label: '3rd' },
      ];

      return (
        <Box style={{
          ...cardBase,
          ...glassCard,
          padding: tokens.spacing[4],
          marginBottom: tokens.spacing[4],
        }}>
          <Box style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[2],
            marginBottom: tokens.spacing[4],
            fontSize: tokens.typography.fontSize.sm,
            fontWeight: tokens.typography.fontWeight.semibold,
            color: tokens.colors.neutral[700],
          }}>
            <Medal size={16} color={tokens.colors.warningScale[600]} />
            Top Candidates
          </Box>

          <Box style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            gap: tokens.spacing[3],
          }}>
            {podiumOrder.map((candidate, idx) => {
              if (!candidate) return null;
              const podiumColor = podiumColors[idx];
              const podiumHeight = heights[idx];

              return (
                <Box key={candidate.id} style={{
                  display: 'flex',
                  flexDirection: 'column' as const,
                  alignItems: 'center',
                  width: 120,
                }}>
                  {/* Avatar */}
                  <Box style={{
                    width: idx === 1 ? 56 : 44,
                    height: idx === 1 ? 56 : 44,
                    borderRadius: tokens.borderRadius.full,
                    backgroundColor: tokens.colors.primaryScale[100],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    marginBottom: tokens.spacing[2],
                    border: `3px solid ${podiumColor.accent}`,
                    boxShadow: idx === 1 ? tokens.shadows.md : tokens.shadows.sm,
                  }}>
                    {candidate.avatar ? (
                      <img
                        src={candidate.avatar}
                        alt={candidate.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <Box style={{
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.bold,
                        color: tokens.colors.primaryScale[600],
                      }}>
                        {getCandidateInitials(candidate.name)}
                      </Box>
                    )}
                  </Box>

                  {/* Name */}
                  <Box style={{
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[800],
                    textAlign: 'center' as const,
                    marginBottom: tokens.spacing[1],
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap' as const,
                    maxWidth: '100%',
                  }}>
                    {candidate.name}
                  </Box>

                  {/* Score */}
                  <Box style={{
                    fontSize: tokens.typography.fontSize.lg,
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: podiumColor.accent,
                    marginBottom: tokens.spacing[2],
                  }}>
                    {candidate.overallScore}
                  </Box>

                  {/* Top strengths */}
                  <Box style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[500],
                    textAlign: 'center' as const,
                    marginBottom: tokens.spacing[2],
                    lineHeight: tokens.typography.lineHeight.relaxed,
                  }}>
                    {candidate.strengths.slice(0, 2).join(', ')}
                  </Box>

                  {/* Podium block */}
                  <Box style={{
                    width: '100%',
                    height: podiumHeight,
                    backgroundColor: podiumColor.bg,
                    borderRadius: `${tokens.borderRadius.md} ${tokens.borderRadius.md} 0 0`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Box style={{
                      fontSize: tokens.typography.fontSize.lg,
                      fontWeight: tokens.typography.fontWeight.bold,
                      color: podiumColor.accent,
                    }}>
                      {podiumColor.label}
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      );
    };

    /* ================================================================ */
    /*  RENDER: Score Distribution Histogram                              */
    /* ================================================================ */
    const renderScoreDistribution = () => {
      if (scoreDistribution.length === 0) return null;

      const histWidth = 400;
      const histHeight = 120;
      const maxCount = Math.max(...scoreDistribution.map(d => d.count), 1);
      const barWidth = Math.max(4, (histWidth / scoreDistribution.length) - 2);
      const gaussPoints = computeGaussianPoints(scoreDistribution, histWidth, histHeight);

      return (
        <Box style={{
          ...cardBase,
          ...glassCard,
          padding: tokens.spacing[4],
          marginBottom: tokens.spacing[4],
        }}>
          <Box style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[2],
            marginBottom: tokens.spacing[3],
            fontSize: tokens.typography.fontSize.sm,
            fontWeight: tokens.typography.fontWeight.semibold,
            color: tokens.colors.neutral[700],
          }}>
            <BarChart3 size={16} color={tokens.colors.primaryScale[500]} />
            Score Distribution
          </Box>

          <Box style={{ display: 'flex', justifyContent: 'center' }}>
            <svg width={histWidth} height={histHeight} viewBox={`0 0 ${histWidth} ${histHeight}`}>
              {/* Bars */}
              {scoreDistribution.map((d, i) => {
                const barHeight = (d.count / maxCount) * (histHeight - 20);
                const x = (i / scoreDistribution.length) * histWidth + 1;
                const y = histHeight - barHeight;
                const barColor = getScoreBarColor(d.score, tokens);

                return (
                  <rect
                    key={d.score}
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    fill={barColor}
                    opacity={0.6}
                    rx={2}
                  />
                );
              })}

              {/* Gaussian curve overlay */}
              {gaussPoints && (
                <polyline
                  points={gaussPoints}
                  fill="none"
                  stroke={tokens.colors.primaryScale[400]}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </svg>
          </Box>

          <Box style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: tokens.spacing[1],
          }}>
            <Box style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>0</Box>
            <Box style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>50</Box>
            <Box style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>100</Box>
          </Box>
        </Box>
      );
    };

    /* ================================================================ */
    /*  RENDER: Filter Bar                                                */
    /* ================================================================ */
    const renderFilterBar = () => {
      const decisionStatuses: DecisionStatus[] = ['pending', 'advanced', 'rejected', 'hold'];

      return (
        <Box style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing[3],
          padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
          backgroundColor: tokens.colors.neutral[50],
          borderRadius: tokens.borderRadius.md,
          marginBottom: tokens.spacing[4],
          flexWrap: 'wrap' as const,
        }}>
          <Filter size={14} color={tokens.colors.neutral[400]} />

          {/* Search */}
          <Box style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[1],
            padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
            backgroundColor: tokens.colors.common.white,
            borderRadius: tokens.borderRadius.md,
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            flex: '0 1 200px',
          }}>
            <Search size={12} color={tokens.colors.neutral[400]} />
            <input
              type="text"
              placeholder="Search candidates..."
              value={filters.searchQuery ?? ''}
              onChange={(e) => handleFilterChange({ ...filters, searchQuery: e.target.value })}
              style={{
                border: 'none',
                outline: 'none',
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[700],
                backgroundColor: 'transparent',
                width: '100%',
              }}
            
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = `0 0 0 2px ${tokens.colors.primaryScale[100]}`;
                e.currentTarget.style.borderColor = tokens.colors.primaryScale[400];
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = tokens.colors.neutral[300];
              }}
            />
          </Box>

          {/* Score range */}
          <Box style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[1],
            fontSize: tokens.typography.fontSize.xs,
            color: tokens.colors.neutral[600],
          }}>
            Score: {scoreRange[0]} - {scoreRange[1]}
            <input
              type="range"
              min={0}
              max={100}
              value={scoreRange[0]}
              onChange={(e) => handleScoreRangeChange([Number(e.target.value), scoreRange[1]])}
              style={{ width: 60, accentColor: tokens.colors.primaryScale[500] }}
            />
            <input
              type="range"
              min={0}
              max={100}
              value={scoreRange[1]}
              onChange={(e) => handleScoreRangeChange([scoreRange[0], Number(e.target.value)])}
              style={{ width: 60, accentColor: tokens.colors.primaryScale[500] }}
            />
          </Box>

          {/* Knockout toggle */}
          <Box
            onClick={() => handleFilterChange({ ...filters, knockoutOnly: !filters.knockoutOnly })}
            style={{
              ...hoverStyle,
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
              borderRadius: tokens.borderRadius.md,
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.medium,
              backgroundColor: filters.knockoutOnly ? tokens.colors.errorScale[100] : tokens.colors.common.white,
              color: filters.knockoutOnly ? tokens.colors.errorScale[700] : tokens.colors.neutral[500],
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${filters.knockoutOnly ? tokens.colors.errorScale[200] : tokens.colors.neutral[200]}`,
            }}
          >
            <Flag size={10} />
            Knockouts
          </Box>

          {/* Decision status chips */}
          {decisionStatuses.map(status => {
            const isActive = filters.decisionStatus?.includes(status);
            const colors = getDecisionColors(status, tokens);
            return (
              <Box
                key={status}
                onClick={() => {
                  const current = filters.decisionStatus ?? [];
                  const next = isActive
                    ? current.filter(s => s !== status)
                    : [...current, status];
                  handleFilterChange({ ...filters, decisionStatus: next });
                }}
                style={{
                  ...hoverStyle,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                  borderRadius: tokens.borderRadius.full,
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.medium,
                  backgroundColor: isActive ? colors.bg : tokens.colors.common.white,
                  color: isActive ? colors.color : tokens.colors.neutral[500],
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${isActive ? colors.border : tokens.colors.neutral[200]}`,
                  textTransform: 'capitalize' as const,
                }}
              >
                {status}
              </Box>
            );
          })}
        </Box>
      );
    };

    /* ================================================================ */
    /*  RENDER: Bulk Actions Bar                                          */
    /* ================================================================ */
    const renderBulkActions = () => {
      if (!hasSelection) return null;

      return (
        <Box style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing[3],
          padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
          backgroundColor: tokens.colors.primaryScale[50],
          borderRadius: tokens.borderRadius.md,
          marginBottom: tokens.spacing[4],
          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[200]}`,
        }}>
          <Box style={{
            fontSize: tokens.typography.fontSize.sm,
            fontWeight: tokens.typography.fontWeight.semibold,
            color: tokens.colors.primaryScale[700],
          }}>
            {selected.length} selected
          </Box>

          {/* Compare */}
          {onCompare && selected.length >= 2 && (
            <Box
              onClick={() => onCompare(selected)}
              style={{
                ...hoverStyle,
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.medium,
                color: tokens.colors.primaryScale[700],
                backgroundColor: tokens.colors.common.white,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[200]}`,
              }}
            >
              <Eye size={12} />
              Compare
            </Box>
          )}

          {/* Advance selected */}
          {onBulkAdvance && (
            <Box
              onClick={() => onBulkAdvance(selected)}
              style={{
                ...hoverStyle,
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.common.white,
                backgroundColor: tokens.colors.successScale[600],
              }}
            >
              <ThumbsUp size={12} />
              Advance ({selected.length})
            </Box>
          )}

          {/* Reject selected */}
          {onBulkReject && (
            <Box
              onClick={() => onBulkReject(selected)}
              style={{
                ...hoverStyle,
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.common.white,
                backgroundColor: tokens.colors.errorScale[600],
              }}
            >
              <ThumbsDown size={12} />
              Reject ({selected.length})
            </Box>
          )}

          {/* Export */}
          {onExport && (
            <Box
              onClick={onExport}
              style={{
                ...hoverStyle,
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.medium,
                color: tokens.colors.infoScale[700],
                backgroundColor: tokens.colors.infoScale[50],
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.infoScale[200]}`,
              }}
            >
              <Download size={12} />
              Export
            </Box>
          )}

          {/* Clear selection */}
          <Box
            onClick={() => { onSelectionChange?.([]); setInternalSelected([]); }}
            style={{
              ...hoverStyle,
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
              borderRadius: tokens.borderRadius.md,
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.neutral[500],
            }}
          >
            <X size={12} />
            Clear
          </Box>
        </Box>
      );
    };

    /* ================================================================ */
    /*  RENDER: Table Header                                              */
    /* ================================================================ */
    const renderTableHeader = () => {
      const columns: { key: RankingSortBy; label: string; width?: string | number; align?: string }[] = [
        { key: 'rank', label: '#', width: 50 },
        { key: 'name', label: 'Candidate' },
        { key: 'score', label: 'Score', width: 160 },
        { key: 'completion', label: 'Completion', width: 100 },
        { key: 'decision', label: 'Decision', width: 140 },
      ];

      return (
        <Box style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing[3],
          padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
          backgroundColor: tokens.colors.neutral[50],
          borderRadius: `${tokens.borderRadius.md} ${tokens.borderRadius.md} 0 0`,
          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
        }}>
          {/* Select all checkbox */}
          <Box
            onClick={handleSelectAll}
            style={{
              ...hoverStyle,
              width: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {allSelected ? (
              <CheckSquare size={16} color={tokens.colors.primaryScale[600]} />
            ) : selected.length > 0 ? (
              <Minus size={16} color={tokens.colors.primaryScale[400]} />
            ) : (
              <Square size={16} color={tokens.colors.neutral[300]} />
            )}
          </Box>

          {columns.map(col => (
            <Box
              key={col.key}
              onClick={() => handleSortChange(col.key)}
              style={{
                ...hoverStyle,
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: sortBy === col.key ? tokens.colors.primaryScale[700] : tokens.colors.neutral[500],
                textTransform: 'uppercase' as const,
                letterSpacing: '0.05em',
                flex: col.width ? `0 0 ${typeof col.width === 'number' ? col.width + 'px' : col.width}` : 1,
                minWidth: 0,
              }}
            >
              {col.label}
              {sortBy === col.key && (
                sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
              )}
            </Box>
          ))}

          {/* KO column */}
          <Box style={{
            width: 40,
            fontSize: tokens.typography.fontSize.xs,
            fontWeight: tokens.typography.fontWeight.semibold,
            color: tokens.colors.neutral[500],
            textAlign: 'center' as const,
          }}>
            KO
          </Box>

          {/* Stages column header */}
          <Box style={{
            width: 140,
            fontSize: tokens.typography.fontSize.xs,
            fontWeight: tokens.typography.fontWeight.semibold,
            color: tokens.colors.neutral[500],
          }}>
            Stages
          </Box>

          {/* Actions */}
          <Box style={{ width: 100 }} />
        </Box>
      );
    };

    /* ================================================================ */
    /*  RENDER: Candidate Row                                             */
    /* ================================================================ */
    const renderCandidateRow = (candidate: RankedCandidate) => {
      const isSelected = selected.includes(candidate.id);
      const isExpanded = expandedCandidate === candidate.id;
      const rankColors = getRankBadgeColors(candidate.rank, tokens);
      const scoreColor = getScoreBarColor(candidate.overallScore, tokens);
      const decisionStatus = candidate.decisionStatus;
      const decisionColors = getDecisionColors(decisionStatus, tokens);
      const candidateDecision = decisions[candidate.id];

      /* Completion ring SVG */
      const ringSize = 32;
      const ringStroke = 3;
      const ringRadius = (ringSize - ringStroke) / 2;
      const ringCircumference = 2 * Math.PI * ringRadius;
      const ringProgress = (candidate.completionPercent / 100) * ringCircumference;

      return (
        <Box key={candidate.id}>
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[3],
              padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
              backgroundColor: isSelected ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
              borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
              transition: `background-color ${tokens.transitions?.fast || tokens.motion.hover}`,
            }}
          >
            {/* Checkbox */}
            <Box
              onClick={() => handleToggleSelect(candidate.id)}
              style={{
                ...hoverStyle,
                width: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {isSelected ? (
                <CheckSquare size={16} color={tokens.colors.primaryScale[600]} />
              ) : (
                <Square size={16} color={tokens.colors.neutral[300]} />
              )}
            </Box>

            {/* Rank */}
            <Box style={{
              width: 50,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Box style={{
                width: 28,
                height: 28,
                borderRadius: tokens.borderRadius.full,
                backgroundColor: rankColors.bg,
                color: rankColors.color,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${rankColors.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.bold,
              }}>
                {candidate.rank}
              </Box>
            </Box>

            {/* Candidate (avatar + name) */}
            <Box
              onClick={() => handleExpand(isExpanded ? null : candidate.id)}
              style={{
                ...hoverStyle,
                flex: 1,
                minWidth: 0,
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
              }}
            >
              <Box style={{
                width: 32,
                height: 32,
                borderRadius: tokens.borderRadius.full,
                backgroundColor: tokens.colors.primaryScale[100],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                flexShrink: 0,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[200]}`,
              }}>
                {candidate.avatar ? (
                  <img
                    src={candidate.avatar}
                    alt={candidate.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <Box style={{
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: tokens.colors.primaryScale[600],
                  }}>
                    {getCandidateInitials(candidate.name)}
                  </Box>
                )}
              </Box>
              <Box style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                color: tokens.colors.neutral[800],
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap' as const,
              }}>
                {candidate.name}
              </Box>
              {isExpanded ? (
                <ChevronDown size={14} color={tokens.colors.neutral[400]} />
              ) : (
                <ChevronRight size={14} color={tokens.colors.neutral[400]} />
              )}
            </Box>

            {/* Overall Score (colored bar) */}
            <Box style={{
              width: 160,
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[2],
              flexShrink: 0,
            }}>
              <Box style={{
                flex: 1,
                height: 10,
                backgroundColor: tokens.colors.neutral[100],
                borderRadius: tokens.borderRadius.full,
                overflow: 'hidden',
              }}>
                <Box style={{
                  width: `${candidate.overallScore}%`,
                  height: '100%',
                  backgroundColor: scoreColor,
                  borderRadius: tokens.borderRadius.full,
                  transition: `width ${tokens.transitions?.normal || tokens.motion.hover}`,
                }} />
              </Box>
              <Box style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[800],
                minWidth: 30,
                textAlign: 'right' as const,
              }}>
                {candidate.overallScore}
              </Box>
            </Box>

            {/* Completion (progress ring) */}
            <Box style={{
              width: 100,
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              flexShrink: 0,
            }}>
              <svg width={ringSize} height={ringSize} viewBox={`0 0 ${ringSize} ${ringSize}`}>
                <circle
                  cx={ringSize / 2}
                  cy={ringSize / 2}
                  r={ringRadius}
                  fill="none"
                  stroke={tokens.colors.neutral[100]}
                  strokeWidth={ringStroke}
                />
                <circle
                  cx={ringSize / 2}
                  cy={ringSize / 2}
                  r={ringRadius}
                  fill="none"
                  stroke={candidate.completionPercent >= 100 ? tokens.colors.successScale[500] : tokens.colors.primaryScale[500]}
                  strokeWidth={ringStroke}
                  strokeDasharray={`${ringProgress} ${ringCircumference - ringProgress}`}
                  strokeDashoffset={ringCircumference / 4}
                  strokeLinecap="round"
                />
                <text
                  x={ringSize / 2}
                  y={ringSize / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="9"
                  fontWeight={tokens.typography.fontWeight.semibold}
                  fill={tokens.colors.neutral[700]}
                >
                  {candidate.completionPercent}%
                </text>
              </svg>
            </Box>

            {/* Decision badge */}
            <Box style={{
              width: 140,
              flexShrink: 0,
            }}>
              <Box style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                borderRadius: tokens.borderRadius.full,
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.semibold,
                backgroundColor: decisionColors.bg,
                color: decisionColors.color,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${decisionColors.border}`,
                textTransform: 'capitalize' as const,
              }}>
                {decisionStatus === 'advanced' && <Check size={10} />}
                {decisionStatus === 'rejected' && <X size={10} />}
                {decisionStatus === 'hold' && <Pause size={10} />}
                {decisionStatus === 'pending' && <Minus size={10} />}
                {decisionStatus}
              </Box>
            </Box>

            {/* Knockout flag */}
            <Box style={{
              width: 40,
              display: 'flex',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              {candidate.hasKnockout && (
                <Flag size={14} color={tokens.colors.errorScale[500]} />
              )}
            </Box>

            {/* Per-stage mini bars */}
            <Box style={{
              width: 140,
              display: 'flex',
              flexDirection: 'column' as const,
              gap: 2,
              flexShrink: 0,
            }}>
              {candidate.stageScores.slice(0, 4).map((ss) => (
                <Box key={ss.stage} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                }}>
                  <Box style={{
                    fontSize: '9px',
                    color: tokens.colors.neutral[400],
                    width: 40,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap' as const,
                  }}>
                    {ss.stage}
                  </Box>
                  <Box style={{
                    flex: 1,
                    height: 4,
                    backgroundColor: tokens.colors.neutral[100],
                    borderRadius: tokens.borderRadius.full,
                    overflow: 'hidden',
                  }}>
                    <Box style={{
                      width: `${ss.score}%`,
                      height: '100%',
                      backgroundColor: getScoreBarColor(ss.score, tokens),
                      borderRadius: tokens.borderRadius.full,
                    }} />
                  </Box>
                </Box>
              ))}
            </Box>

            {/* Action dropdown */}
            <Box style={{
              width: 100,
              display: 'flex',
              gap: tokens.spacing[1],
              flexShrink: 0,
            }}>
              {(['advance', 'reject', 'hold'] as DecisionAction[]).map(action => {
                const colors = getDecisionActionColors(action, tokens);
                const isActive = candidateDecision === action;
                const icons: Record<DecisionAction, React.ReactNode> = {
                  advance: <ThumbsUp size={12} />,
                  reject: <ThumbsDown size={12} />,
                  hold: <Pause size={12} />,
                };
                return (
                  <Box
                    key={action}
                    onClick={() => handleDecisionChange(candidate.id, action)}
                    style={{
                      ...hoverStyle,
                      width: 28,
                      height: 28,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: tokens.borderRadius.md,
                      backgroundColor: isActive ? colors.bg : tokens.colors.neutral[50],
                      color: isActive ? colors.color : tokens.colors.neutral[400],
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${isActive ? colors.border : tokens.colors.neutral[200]}`,
                    }}
                  >
                    {icons[action]}
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* Expanded detail */}
          {isExpanded && renderExpandedDetail(candidate)}
        </Box>
      );
    };

    /* ================================================================ */
    /*  RENDER: Expanded Candidate Detail                                 */
    /* ================================================================ */
    const renderExpandedDetail = (candidate: RankedCandidate) => (
      <Box style={{
        padding: `${tokens.spacing[4]}px ${tokens.spacing[6]}px`,
        backgroundColor: tokens.colors.neutral[50],
        borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
      }}>
        <Box style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: tokens.spacing[4],
        }}>
          {/* Strengths */}
          <Box style={{
            padding: tokens.spacing[3],
            backgroundColor: tokens.colors.successScale[50],
            borderRadius: tokens.borderRadius.md,
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.successScale[100]}`,
          }}>
            <Box style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.successScale[700],
              marginBottom: tokens.spacing[2],
            }}>
              <TrendingUp size={12} />
              Strengths
            </Box>
            {candidate.strengths.map((s, i) => (
              <Box key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[600],
                padding: `2px 0`,
              }}>
                <Check size={10} color={tokens.colors.successScale[500]} />
                {s}
              </Box>
            ))}
          </Box>

          {/* Weaknesses */}
          <Box style={{
            padding: tokens.spacing[3],
            backgroundColor: tokens.colors.errorScale[50],
            borderRadius: tokens.borderRadius.md,
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.errorScale[100]}`,
          }}>
            <Box style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.errorScale[700],
              marginBottom: tokens.spacing[2],
            }}>
              <TrendingDown size={12} />
              Weaknesses
            </Box>
            {candidate.weaknesses.map((w, i) => (
              <Box key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[600],
                padding: `2px 0`,
              }}>
                <AlertTriangle size={10} color={tokens.colors.errorScale[500]} />
                {w}
              </Box>
            ))}
          </Box>
        </Box>

        {/* Full stage scores */}
        <Box style={{ marginTop: tokens.spacing[3] }}>
          <Box style={{
            fontSize: tokens.typography.fontSize.xs,
            fontWeight: tokens.typography.fontWeight.semibold,
            color: tokens.colors.neutral[500],
            textTransform: 'uppercase' as const,
            letterSpacing: '0.05em',
            marginBottom: tokens.spacing[2],
          }}>
            Stage Scores
          </Box>
          <Box style={{
            display: 'flex',
            gap: tokens.spacing[2],
            flexWrap: 'wrap' as const,
          }}>
            {candidate.stageScores.map(ss => (
              <Box key={ss.stage} style={{
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                backgroundColor: tokens.colors.common.white,
                borderRadius: tokens.borderRadius.md,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
              }}>
                <Box style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[600],
                }}>
                  {ss.stage}
                </Box>
                <Box style={{
                  width: 60,
                  height: 6,
                  backgroundColor: tokens.colors.neutral[100],
                  borderRadius: tokens.borderRadius.full,
                  overflow: 'hidden',
                }}>
                  <Box style={{
                    width: `${ss.score}%`,
                    height: '100%',
                    backgroundColor: getScoreBarColor(ss.score, tokens),
                    borderRadius: tokens.borderRadius.full,
                  }} />
                </Box>
                <Box style={{
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[700],
                }}>
                  {ss.score}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    );

    /* ================================================================ */
    /*  RENDER: Export & Secondary Actions                                 */
    /* ================================================================ */
    const renderSecondaryActions = () => (
      <Box style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
        borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
      }}>
        <Box style={{
          fontSize: tokens.typography.fontSize.sm,
          color: tokens.colors.neutral[500],
        }}>
          Showing {sortedCandidates.length} of {candidates.length} candidates
        </Box>

        {onExport && !hasSelection && (
          <Box
            onClick={onExport}
            style={{
              ...hoverStyle,
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
              borderRadius: tokens.borderRadius.md,
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.medium,
              color: tokens.colors.infoScale[700],
              backgroundColor: tokens.colors.infoScale[50],
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.infoScale[200]}`,
            }}
          >
            <Download size={12} />
            Export Rankings
          </Box>
        )}
      </Box>
    );

    /* ================================================================ */
    /*  MAIN RENDER                                                       */
    /* ================================================================ */
    return (
      <Box
        className={className}
        style={{
          ...surfaceStyle,
          backgroundColor: tokens.colors.common.white,
          overflow: 'hidden',
          ...glassCard,
          ...style,
        }}
      >
        {renderJobHeader()}

        <Box style={{ padding: `${tokens.spacing[5]}px ${tokens.spacing[6]}px` }}>
          {renderPodium()}
          {renderScoreDistribution()}
          {renderFilterBar()}
          {renderBulkActions()}
        </Box>

        {renderSecondaryActions()}
        {renderTableHeader()}

        {sortedCandidates.map(candidate => renderCandidateRow(candidate))}

        {sortedCandidates.length === 0 && (
          <Box style={{
            display: 'flex',
            flexDirection: 'column' as const,
            alignItems: 'center',
            justifyContent: 'center',
            padding: `${tokens.spacing[8]}px ${tokens.spacing[4]}px`,
            color: tokens.colors.neutral[400],
          }}>
            <Users size={32} color={tokens.colors.neutral[300]} />
            <Box style={{
              fontSize: tokens.typography.fontSize.sm,
              marginTop: tokens.spacing[2],
            }}>
              No candidates match the current filters
            </Box>
          </Box>
        )}
      </Box>
    );
  },
);
