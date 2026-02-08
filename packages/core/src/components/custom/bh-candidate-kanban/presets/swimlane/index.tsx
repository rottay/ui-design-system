'use client';

/**
 * BhCandidateKanban - Swimlane Preset
 * Horizontal swimlane layout grouped by candidate source or score bracket,
 * with stage columns flowing left-to-right within each lane
 */

import { useState, useMemo, useCallback } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createBadgeStyle,
  createCardStyle,
  createEmptyStateStyle,
  createFilterPillStyle,
  createHoverStyle,
  createPanelHeaderStyle,
  createProgressBarStyle,
  createSectionHeaderStyle,
  createStatusDotStyle,
  createSurfaceStyle,
  getHoverTransform,
} from '../../../helpers';
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
  Search, Filter, LayoutGrid, Rows3, ChevronDown, ChevronRight,
  Calendar, MessageSquare, ThumbsDown, Pause, X, Sparkles,
  Clock, Tag, User, Users, Briefcase, Layers, BarChart3,
  CheckSquare, Square, ArrowRight,
} from 'lucide-react';

/* ---------------------------------------------------------------------------
 * Types & helpers
 * -------------------------------------------------------------------------*/

type GroupByMode = 'source' | 'score';

interface SwimlaneGroup {
  key: string;
  label: string;
  icon: React.ReactNode;
  badgeBg: string;
  badgeText: string;
  candidates: KanbanCandidate[];
  collapsed: boolean;
}

function getScoreColor(score: number, tokens: DesignTokens): string {
  if (score >= 75) return tokens.colors.successScale[500];
  if (score >= 50) return tokens.colors.warningScale[500];
  return tokens.colors.errorScale[500];
}

function getScoreTrackColor(score: number, tokens: DesignTokens): string {
  if (score >= 75) return tokens.colors.successScale[100];
  if (score >= 50) return tokens.colors.warningScale[100];
  return tokens.colors.errorScale[100];
}

function getAiColor(rec: AiRecommendation, tokens: DesignTokens): string {
  switch (rec) {
    case 'advance': return tokens.colors.successScale[500];
    case 'hold': return tokens.colors.warningScale[500];
    case 'reject': return tokens.colors.errorScale[500];
  }
}

function getAiLabel(rec: AiRecommendation): string {
  switch (rec) {
    case 'advance': return 'AI: Advance';
    case 'hold': return 'AI: Hold';
    case 'reject': return 'AI: Reject';
  }
}

function getSourceConfig(source: CandidateSource, tokens: DesignTokens): { label: string; bg: string; text: string; border: string } {
  switch (source) {
    case 'applied':
      return { label: 'Applied', bg: tokens.colors.primaryScale[100], text: tokens.colors.primaryScale[700], border: tokens.colors.primaryScale[200] };
    case 'referral':
      return { label: 'Referral', bg: tokens.colors.successScale[100], text: tokens.colors.successScale[700], border: tokens.colors.successScale[200] };
    case 'sourced':
      return { label: 'Sourced', bg: tokens.colors.infoScale[100], text: tokens.colors.infoScale[700], border: tokens.colors.infoScale[200] };
    case 'agency':
      return { label: 'Agency', bg: tokens.colors.warningScale[100], text: tokens.colors.warningScale[700], border: tokens.colors.warningScale[200] };
    case 'internal':
      return { label: 'Internal', bg: tokens.colors.secondaryScale[100], text: tokens.colors.secondaryScale[700], border: tokens.colors.secondaryScale[200] };
  }
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (parts[0]?.[0] ?? '').toUpperCase();
}

function matchesFilters(candidate: KanbanCandidate, filters: KanbanFilter | undefined, searchQuery: string): boolean {
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    const nameMatch = candidate.name.toLowerCase().includes(q);
    const emailMatch = candidate.email?.toLowerCase().includes(q);
    const tagMatch = candidate.tags.some((t) => t.toLowerCase().includes(q));
    if (!nameMatch && !emailMatch && !tagMatch) return false;
  }
  if (!filters) return true;
  if (filters.source && filters.source.length > 0 && !filters.source.includes(candidate.source)) return false;
  if (filters.aiRecommendation && filters.aiRecommendation.length > 0 && !filters.aiRecommendation.includes(candidate.aiRecommendation)) return false;
  if (filters.tags && filters.tags.length > 0 && !filters.tags.some((t) => candidate.tags.includes(t))) return false;
  if (filters.scoreMin !== undefined && candidate.scorePercent < filters.scoreMin) return false;
  if (filters.scoreMax !== undefined && candidate.scorePercent > filters.scoreMax) return false;
  return true;
}

function getScoreBracketConfig(bracket: string, tokens: DesignTokens): { label: string; bg: string; text: string; border: string } {
  switch (bracket) {
    case 'high':
      return { label: 'High (75-100)', bg: tokens.colors.successScale[100], text: tokens.colors.successScale[700], border: tokens.colors.successScale[200] };
    case 'medium':
      return { label: 'Medium (50-74)', bg: tokens.colors.warningScale[100], text: tokens.colors.warningScale[700], border: tokens.colors.warningScale[200] };
    case 'low':
    default:
      return { label: 'Low (0-49)', bg: tokens.colors.errorScale[100], text: tokens.colors.errorScale[700], border: tokens.colors.errorScale[200] };
  }
}

function getScoreBracket(score: number): string {
  if (score >= 75) return 'high';
  if (score >= 50) return 'medium';
  return 'low';
}

/* ---------------------------------------------------------------------------
 * Swimlane Preset
 * -------------------------------------------------------------------------*/

export const SwimlaneBhCandidateKanban = createPreset<BhCandidateKanbanProps>({
  name: 'BhCandidateKanban.Swimlane',
  render: ({ primitives, props, tokens, engine }: PresetContext<BhCandidateKanbanProps>) => {
    const { Box, Stack } = primitives;
    const isModern = engine === 'modern';

    const {
      jobName,
      totalCandidates,
      stages = [],
      candidates: candidatesProp = [],
      onCandidateMove,
      onCandidateClick,
      onScheduleInterview,
      onAddNote,
      onReject,
      onHold,
      filters: filtersProp,
      onFilterChange,
      searchQuery: searchQueryProp,
      onSearchChange,
      selectedCandidate: selectedCandidateProp,
      bulkSelection: bulkSelectionProp,
      onBulkSelectionChange,
      onBulkAction,
      className,
      style,
    } = props;

    /* -- State ----------------------------------------------------------- */
    const [groupBy, setGroupBy] = useState<GroupByMode>('source');
    const [collapsedLanes, setCollapsedLanes] = useState<Set<string>>(new Set());
    const [internalFilters, setInternalFilters] = useState<KanbanFilter>({});
    const [internalSearchQuery, setInternalSearchQuery] = useState('');
    const [internalSelectedCandidate, setInternalSelectedCandidate] = useState<string | null>(null);
    const [internalBulkSelection, setInternalBulkSelection] = useState<string[]>([]);
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    const [aiTooltipId, setAiTooltipId] = useState<string | null>(null);
    const [showFilterPanel, setShowFilterPanel] = useState(false);

    /* -- Controlled vs uncontrolled -------------------------------------- */
    const filters = filtersProp ?? internalFilters;
    const searchQuery = searchQueryProp ?? internalSearchQuery;
    const selectedCandidate = selectedCandidateProp ?? internalSelectedCandidate;
    const bulkSelection = bulkSelectionProp ?? internalBulkSelection;

    const handleFilterChange = useCallback((newFilters: KanbanFilter) => {
      if (onFilterChange) onFilterChange(newFilters);
      else setInternalFilters(newFilters);
    }, [onFilterChange]);

    const handleSearchChange = useCallback((query: string) => {
      if (onSearchChange) onSearchChange(query);
      else setInternalSearchQuery(query);
    }, [onSearchChange]);

    const handleSelectCandidate = useCallback((id: string) => {
      if (onCandidateClick) onCandidateClick(id);
      else setInternalSelectedCandidate((prev) => (prev === id ? null : id));
    }, [onCandidateClick]);

    const handleBulkSelectionChange = useCallback((ids: string[]) => {
      if (onBulkSelectionChange) onBulkSelectionChange(ids);
      else setInternalBulkSelection(ids);
    }, [onBulkSelectionChange]);

    const toggleLane = useCallback((key: string) => {
      setCollapsedLanes((prev) => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        return next;
      });
    }, []);

    const toggleBulkCandidate = useCallback((id: string) => {
      const next = bulkSelection.includes(id)
        ? bulkSelection.filter((x) => x !== id)
        : [...bulkSelection, id];
      handleBulkSelectionChange(next);
    }, [bulkSelection, handleBulkSelectionChange]);

    /* -- Sorted stages --------------------------------------------------- */
    const sortedStages = useMemo(() => [...stages].sort((a, b) => a.order - b.order), [stages]);

    /* -- Filtered candidates --------------------------------------------- */
    const filteredCandidates = useMemo(
      () => candidatesProp.filter((c) => matchesFilters(c, filters, searchQuery)),
      [candidatesProp, filters, searchQuery]
    );

    /* -- Build swimlane groups ------------------------------------------- */
    const swimlaneGroups = useMemo((): SwimlaneGroup[] => {
      if (groupBy === 'source') {
        const sourceOrder: CandidateSource[] = ['applied', 'referral', 'sourced', 'agency', 'internal'];
        return sourceOrder.map((src) => {
          const srcCfg = getSourceConfig(src, tokens);
          return {
            key: src,
            label: srcCfg.label,
            icon: <User size={14} />,
            badgeBg: srcCfg.bg,
            badgeText: srcCfg.text,
            candidates: filteredCandidates.filter((c) => c.source === src),
            collapsed: collapsedLanes.has(src),
          };
        }).filter((g) => g.candidates.length > 0);
      } else {
        const brackets: Array<{ key: string; order: number }> = [
          { key: 'high', order: 0 },
          { key: 'medium', order: 1 },
          { key: 'low', order: 2 },
        ];
        return brackets.map(({ key }) => {
          const bracketCfg = getScoreBracketConfig(key, tokens);
          return {
            key,
            label: bracketCfg.label,
            icon: <BarChart3 size={14} />,
            badgeBg: bracketCfg.bg,
            badgeText: bracketCfg.text,
            candidates: filteredCandidates.filter((c) => getScoreBracket(c.scorePercent) === key),
            collapsed: collapsedLanes.has(key),
          };
        }).filter((g) => g.candidates.length > 0);
      }
    }, [groupBy, filteredCandidates, collapsedLanes, tokens]);

    /* -- Styles ---------------------------------------------------------- */
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isModern }), [tokens, isModern]);
    const surfaceBase = useMemo(() => createSurfaceStyle(tokens, { elevation: 'sm', glass: isModern }), [tokens, isModern]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);
    const hoverTransform = getHoverTransform(tokens);

    const hasActiveFilters = !!(
      (filters.source && filters.source.length > 0) ||
      (filters.aiRecommendation && filters.aiRecommendation.length > 0) ||
      (filters.tags && filters.tags.length > 0) ||
      filters.scoreMin !== undefined ||
      filters.scoreMax !== undefined
    );

    /* -- Render ---------------------------------------------------------- */
    return (
      <Box
        className={className}
        style={{
          display: 'flex',
          flexDirection: 'column' as const,
          height: '100%',
          backgroundColor: tokens.colors.neutral[50],
          fontFamily: 'inherit',
          ...style,
        }}
      >
        {/* ================================================================
            HEADER
            ================================================================ */}
        <Box
          style={{
            ...surfaceBase,
            borderRadius: tokens.borderRadius.none,
            padding: `${tokens.spacing[4]}px ${tokens.spacing[5]}px`,
            backgroundColor: tokens.colors.common.white,
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: tokens.spacing[4],
            flexShrink: 0,
            ...(isModern && tokens.glass ? {
              backdropFilter: tokens.glass.blur,
              WebkitBackdropFilter: tokens.glass.blur,
              backgroundColor: tokens.glass.bg,
            } : {}),
          }}
        >
          {/* Left: job name + count */}
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], minWidth: 0 }}>
            <Briefcase size={20} style={{ color: tokens.colors.primaryScale[600], flexShrink: 0 }} />
            <Box style={{ minWidth: 0 }}>
              <Box
                style={{
                  fontSize: tokens.typography.fontSize.lg,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[900],
                  whiteSpace: 'nowrap' as const,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {jobName}
              </Box>
              <Box
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[500],
                  marginTop: 2,
                }}
              >
                {filteredCandidates.length} of {totalCandidates} candidates
              </Box>
            </Box>
          </Box>

          {/* Center: Search + filter + group-by */}
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], flex: 1, maxWidth: 560 }}>
            {/* Search input */}
            <Box style={{ position: 'relative' as const, flex: 1 }}>
              <Search
                size={16}
                style={{
                  position: 'absolute' as const,
                  left: tokens.spacing[3],
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: tokens.colors.neutral[400],
                  pointerEvents: 'none' as const,
                }}
              />
              <input
                type="text"
                placeholder="Search candidates..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px ${tokens.spacing[2]}px ${tokens.spacing[8]}px`,
                  border: `${tokens.surface.borderWidth || '1px'} ${tokens.surface.borderStyle || 'solid'} ${tokens.colors.neutral[300]}`,
                  borderRadius: tokens.borderRadius.md,
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[900],
                  backgroundColor: tokens.colors.common.white,
                  outline: 'none',
                  transition: `all ${tokens.motion.hover}`,
                  boxSizing: 'border-box' as const,
                }}
                onFocus={(e) => {
                  (e.target as HTMLInputElement).style.borderColor = tokens.colors.primaryScale[400];
                  (e.target as HTMLInputElement).style.boxShadow = `0 0 0 2px ${tokens.colors.primaryScale[100]}`;
                }}
                onBlur={(e) => {
                  (e.target as HTMLInputElement).style.borderColor = tokens.colors.neutral[300];
                  (e.target as HTMLInputElement).style.boxShadow = 'none';
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => handleSearchChange('')}
                  style={{
                    position: 'absolute' as const,
                    right: tokens.spacing[2],
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                    padding: 2,
                    color: tokens.colors.neutral[400],
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </Box>

            {/* Filter button */}
            <button
              onClick={() => setShowFilterPanel((v) => !v)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                border: `${tokens.surface.borderWidth || '1px'} ${tokens.surface.borderStyle || 'solid'} ${hasActiveFilters ? tokens.colors.primaryScale[400] : tokens.colors.neutral[300]}`,
                borderRadius: tokens.borderRadius.md,
                backgroundColor: hasActiveFilters ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                color: hasActiveFilters ? tokens.colors.primaryScale[700] : tokens.colors.neutral[600],
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
                whiteSpace: 'nowrap' as const,
              }}
            >
              <Filter size={14} />
              Filters
            </button>

            {/* Group-by selector */}
            <Box
              style={{
                display: 'flex',
                alignItems: 'center',
                borderRadius: tokens.borderRadius.md,
                border: `${tokens.surface.borderWidth || '1px'} ${tokens.surface.borderStyle || 'solid'} ${tokens.colors.neutral[300]}`,
                overflow: 'hidden',
              }}
            >
              <button
                onClick={() => setGroupBy('source')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[2]}px`,
                  border: 'none',
                  backgroundColor: groupBy === 'source' ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                  color: groupBy === 'source' ? tokens.colors.primaryScale[700] : tokens.colors.neutral[500],
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.medium,
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  whiteSpace: 'nowrap' as const,
                }}
              >
                <Layers size={12} />
                Source
              </button>
              <Box style={{ width: 1, height: 20, backgroundColor: tokens.colors.neutral[200] }} />
              <button
                onClick={() => setGroupBy('score')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[2]}px`,
                  border: 'none',
                  backgroundColor: groupBy === 'score' ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                  color: groupBy === 'score' ? tokens.colors.primaryScale[700] : tokens.colors.neutral[500],
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.medium,
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  whiteSpace: 'nowrap' as const,
                }}
              >
                <BarChart3 size={12} />
                Score
              </button>
            </Box>
          </Box>

          {/* Right: view toggle */}
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
            {bulkSelection.length > 0 && (
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                  borderRadius: tokens.borderRadius.md,
                  backgroundColor: tokens.colors.primaryScale[50],
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: tokens.colors.primaryScale[700],
                }}
              >
                {bulkSelection.length} selected
                <button
                  onClick={() => handleBulkSelectionChange([])}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                    padding: 0,
                    color: tokens.colors.primaryScale[500],
                    display: 'flex',
                  }}
                >
                  <X size={12} />
                </button>
              </Box>
            )}
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                borderRadius: tokens.borderRadius.md,
                border: `${tokens.surface.borderWidth || '1px'} ${tokens.surface.borderStyle || 'solid'} ${tokens.colors.neutral[200]}`,
                backgroundColor: tokens.colors.common.white,
                color: tokens.colors.neutral[400],
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
              }}
              title="Board view"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                borderRadius: tokens.borderRadius.md,
                border: `${tokens.surface.borderWidth || '1px'} ${tokens.surface.borderStyle || 'solid'} ${tokens.colors.primaryScale[300]}`,
                backgroundColor: tokens.colors.primaryScale[50],
                color: tokens.colors.primaryScale[600],
                cursor: 'default',
              }}
              title="Swimlane view"
            >
              <Rows3 size={16} />
            </button>
          </Box>
        </Box>

        {/* ================================================================
            FILTER PANEL
            ================================================================ */}
        {showFilterPanel && (
          <Box
            style={{
              padding: `${tokens.spacing[3]}px ${tokens.spacing[5]}px`,
              backgroundColor: tokens.colors.common.white,
              borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[4],
              flexWrap: 'wrap' as const,
              flexShrink: 0,
            }}
          >
            {/* Source filter */}
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              <Box style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[500] }}>
                Source:
              </Box>
              {(['applied', 'referral', 'sourced', 'agency', 'internal'] as CandidateSource[]).map((src) => {
                const active = filters.source?.includes(src);
                const srcConfig = getSourceConfig(src, tokens);
                return (
                  <button
                    key={src}
                    onClick={() => {
                      const current = filters.source ?? [];
                      const next = active ? current.filter((s) => s !== src) : [...current, src];
                      handleFilterChange({ ...filters, source: next.length > 0 ? next : undefined });
                    }}
                    style={{
                      padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                      borderRadius: tokens.borderRadius.full,
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.medium,
                      border: active ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${srcConfig.text}` : `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                      backgroundColor: active ? srcConfig.bg : tokens.colors.common.white,
                      color: active ? srcConfig.text : tokens.colors.neutral[500],
                      cursor: 'pointer',
                      transition: `all ${tokens.motion.hover}`,
                    }}
                  >
                    {srcConfig.label}
                  </button>
                );
              })}
            </Box>

            {/* AI filter */}
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              <Box style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[500] }}>
                AI:
              </Box>
              {(['advance', 'hold', 'reject'] as AiRecommendation[]).map((rec) => {
                const active = filters.aiRecommendation?.includes(rec);
                const aiColor = getAiColor(rec, tokens);
                return (
                  <button
                    key={rec}
                    onClick={() => {
                      const current = filters.aiRecommendation ?? [];
                      const next = active ? current.filter((r) => r !== rec) : [...current, rec];
                      handleFilterChange({ ...filters, aiRecommendation: next.length > 0 ? next : undefined });
                    }}
                    style={{
                      padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                      borderRadius: tokens.borderRadius.full,
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.medium,
                      border: active ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${aiColor}` : `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                      backgroundColor: active ? `${aiColor}15` : tokens.colors.common.white,
                      color: active ? aiColor : tokens.colors.neutral[500],
                      cursor: 'pointer',
                      transition: `all ${tokens.motion.hover}`,
                      textTransform: 'capitalize' as const,
                    }}
                  >
                    {rec}
                  </button>
                );
              })}
            </Box>

            {hasActiveFilters && (
              <button
                onClick={() => handleFilterChange({})}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                  borderRadius: tokens.borderRadius.md,
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.medium,
                  border: 'none',
                  backgroundColor: tokens.colors.errorScale[50],
                  color: tokens.colors.errorScale[600],
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                }}
              >
                <X size={12} />
                Clear all
              </button>
            )}
          </Box>
        )}

        {/* ================================================================
            STAGE HEADER ROW (sticky)
            ================================================================ */}
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
            backgroundColor: tokens.colors.common.white,
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            flexShrink: 0,
            ...(isModern && tokens.glass ? {
              backdropFilter: tokens.glass.blurSm,
              WebkitBackdropFilter: tokens.glass.blurSm,
              backgroundColor: tokens.glass.bgLight,
            } : {}),
          }}
        >
          {/* Lane label column spacer */}
          <Box
            style={{
              width: 200,
              minWidth: 200,
              flexShrink: 0,
              padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[500],
              textTransform: 'uppercase' as const,
              letterSpacing: '0.05em',
            }}
          >
            {groupBy === 'source' ? 'Source' : 'Score'}
          </Box>

          {/* Stage column headers */}
          <Box style={{ display: 'flex', flex: 1, gap: tokens.spacing[2], overflowX: 'auto' as const }}>
            {sortedStages.map((stage) => (
              <Box
                key={stage.id}
                style={{
                  flex: '1 0 140px',
                  minWidth: 140,
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[600],
                  textAlign: 'center' as const,
                  whiteSpace: 'nowrap' as const,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {stage.name}
              </Box>
            ))}
          </Box>
        </Box>

        {/* ================================================================
            SWIMLANE ROWS
            ================================================================ */}
        <Box
          style={{
            flex: 1,
            overflowY: 'auto' as const,
            overflowX: 'hidden' as const,
          }}
        >
          {swimlaneGroups.length === 0 && (
            <Box
              style={{
                display: 'flex',
                flexDirection: 'column' as const,
                alignItems: 'center',
                justifyContent: 'center',
                padding: `${tokens.spacing[8]}px ${tokens.spacing[4]}px`,
                color: tokens.colors.neutral[400],
                fontSize: tokens.typography.fontSize.sm,
                textAlign: 'center' as const,
              }}
            >
              <Users size={32} style={{ marginBottom: tokens.spacing[3], opacity: 0.5 }} />
              No candidates match the current filters
            </Box>
          )}

          {swimlaneGroups.map((group) => {
            const candidatesByStage: Record<string, KanbanCandidate[]> = {};
            for (const stage of sortedStages) {
              candidatesByStage[stage.id] = group.candidates
                .filter((c) => c.stageId === stage.id)
                .sort((a, b) => b.scorePercent - a.scorePercent);
            }

            return (
              <Box
                key={group.key}
                style={{
                  borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                }}
              >
                {/* Lane header */}
                <Box
                  onClick={() => toggleLane(group.key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                    backgroundColor: tokens.colors.neutral[50],
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                    userSelect: 'none' as const,
                  }}
                >
                  {/* Collapse arrow + label */}
                  <Box
                    style={{
                      width: 200,
                      minWidth: 200,
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[2],
                    }}
                  >
                    {group.collapsed ? (
                      <ChevronRight size={14} style={{ color: tokens.colors.neutral[400], flexShrink: 0 }} />
                    ) : (
                      <ChevronDown size={14} style={{ color: tokens.colors.neutral[400], flexShrink: 0 }} />
                    )}
                    <Box
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: tokens.spacing[1],
                      }}
                    >
                      <Box
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: tokens.spacing[1],
                          padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                          borderRadius: tokens.borderRadius.full,
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          backgroundColor: group.badgeBg,
                          color: group.badgeText,
                        }}
                      >
                        {group.icon}
                        {group.label}
                      </Box>
                      <Box
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.neutral[400],
                          fontWeight: tokens.typography.fontWeight.medium,
                        }}
                      >
                        ({group.candidates.length})
                      </Box>
                    </Box>
                  </Box>

                  {/* Stage count summaries */}
                  {!group.collapsed && (
                    <Box style={{ display: 'flex', flex: 1, gap: tokens.spacing[2] }}>
                      {sortedStages.map((stage) => {
                        const count = candidatesByStage[stage.id]?.length ?? 0;
                        return (
                          <Box
                            key={stage.id}
                            style={{
                              flex: '1 0 140px',
                              minWidth: 140,
                              textAlign: 'center' as const,
                              fontSize: tokens.typography.fontSize.xs,
                              color: count > 0 ? tokens.colors.neutral[600] : tokens.colors.neutral[300],
                              fontWeight: count > 0 ? tokens.typography.fontWeight.medium : tokens.typography.fontWeight.normal,
                            }}
                          >
                            {count}
                          </Box>
                        );
                      })}
                    </Box>
                  )}
                </Box>

                {/* Lane content */}
                {!group.collapsed && (
                  <Box
                    style={{
                      display: 'flex',
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px ${tokens.spacing[3]}px`,
                    }}
                  >
                    {/* Lane label spacer */}
                    <Box style={{ width: 200, minWidth: 200, flexShrink: 0 }} />

                    {/* Stage cells */}
                    <Box style={{ display: 'flex', flex: 1, gap: tokens.spacing[2] }}>
                      {sortedStages.map((stage) => {
                        const stageCandidates = candidatesByStage[stage.id] ?? [];
                        return (
                          <Box
                            key={stage.id}
                            style={{
                              flex: '1 0 140px',
                              minWidth: 140,
                              display: 'flex',
                              flexDirection: 'column' as const,
                              gap: tokens.spacing[2],
                              padding: tokens.spacing[1],
                              borderRadius: tokens.borderRadius.md,
                              backgroundColor: stageCandidates.length > 0 ? tokens.colors.common.white : 'transparent',
                              minHeight: 60,
                            }}
                          >
                            {stageCandidates.length === 0 && (
                              <Box
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flex: 1,
                                  fontSize: tokens.typography.fontSize.xs,
                                  color: tokens.colors.neutral[300],
                                }}
                              >
                                -
                              </Box>
                            )}

                            {stageCandidates.map((candidate) => {
                              const isSelected = selectedCandidate === candidate.id;
                              const isBulkSelected = bulkSelection.includes(candidate.id);
                              const isHovered = hoveredCard === candidate.id;
                              const sourceConfig = getSourceConfig(candidate.source, tokens);
                              const aiColor = getAiColor(candidate.aiRecommendation, tokens);
                              const scoreColor = getScoreColor(candidate.scorePercent, tokens);
                              const scoreTrack = getScoreTrackColor(candidate.scorePercent, tokens);
                              const showAiTooltip = aiTooltipId === candidate.id;

                              const circumference = 2 * Math.PI * 12;
                              const strokeOffset = circumference - (candidate.scorePercent / 100) * circumference;

                              return (
                                <Box
                                  key={candidate.id}
                                  onClick={() => handleSelectCandidate(candidate.id)}
                                  onMouseEnter={() => setHoveredCard(candidate.id)}
                                  onMouseLeave={() => { setHoveredCard(null); setAiTooltipId(null); }}
                                  style={{
                                    padding: tokens.spacing[2],
                                    borderRadius: tokens.borderRadius.md,
                                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${isSelected ? tokens.colors.primaryScale[400] : isBulkSelected ? tokens.colors.primaryScale[300] : tokens.colors.neutral[200]}`,
                                    backgroundColor: isSelected
                                      ? tokens.colors.primaryScale[50]
                                      : isBulkSelected
                                        ? tokens.colors.primaryScale[50]
                                        : tokens.colors.common.white,
                                    cursor: 'pointer',
                                    transition: `all ${tokens.motion.hover}`,
                                    position: 'relative' as const,
                                    ...(isHovered ? hoverTransform : {}),
                                    ...(isModern && tokens.glass ? {
                                      backdropFilter: tokens.glass.blurSm,
                                      WebkitBackdropFilter: tokens.glass.blurSm,
                                    } : {}),
                                  }}
                                >
                                  {/* Compact card layout */}
                                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                                    {/* Bulk checkbox */}
                                    {(bulkSelection.length > 0 || isHovered) && (
                                      <button
                                        onClick={(e) => { e.stopPropagation(); toggleBulkCandidate(candidate.id); }}
                                        style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          background: 'none',
                                          border: 'none',
                                          padding: 0,
                                          cursor: 'pointer',
                                          transition: `all ${tokens.motion.hover}`,
                                          color: isBulkSelected ? tokens.colors.primaryScale[600] : tokens.colors.neutral[400],
                                          flexShrink: 0,
                                        }}
                                      >
                                        {isBulkSelected ? <CheckSquare size={12} /> : <Square size={12} />}
                                      </button>
                                    )}

                                    {/* Avatar */}
                                    <Box
                                      style={{
                                        width: 28,
                                        height: 28,
                                        borderRadius: tokens.borderRadius.full,
                                        backgroundColor: tokens.colors.primaryScale[100],
                                        color: tokens.colors.primaryScale[700],
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: tokens.typography.fontSize.xs,
                                        fontWeight: tokens.typography.fontWeight.semibold,
                                        overflow: 'hidden',
                                        flexShrink: 0,
                                      }}
                                    >
                                      {candidate.avatar ? (
                                        <img
                                          src={candidate.avatar}
                                          alt={candidate.name}
                                          style={{ width: '100%', height: '100%', objectFit: 'cover' as const, borderRadius: tokens.borderRadius.full }}
                                        />
                                      ) : (
                                        getInitials(candidate.name)
                                      )}
                                    </Box>

                                    {/* Name + score ring */}
                                    <Box style={{ flex: 1, minWidth: 0 }}>
                                      <Box
                                        style={{
                                          fontSize: tokens.typography.fontSize.xs,
                                          fontWeight: tokens.typography.fontWeight.semibold,
                                          color: tokens.colors.neutral[900],
                                          whiteSpace: 'nowrap' as const,
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                        }}
                                      >
                                        {candidate.name}
                                      </Box>
                                    </Box>

                                    {/* Mini score ring */}
                                    <Box
                                      style={{
                                        position: 'relative' as const,
                                        width: 28,
                                        height: 28,
                                        flexShrink: 0,
                                      }}
                                    >
                                      <svg width="28" height="28" viewBox="0 0 28 28" style={{ transform: 'rotate(-90deg)' }}>
                                        <circle cx="14" cy="14" r="12" fill="none" stroke={scoreTrack} strokeWidth="2" />
                                        <circle
                                          cx="14"
                                          cy="14"
                                          r="12"
                                          fill="none"
                                          stroke={scoreColor}
                                          strokeWidth="2"
                                          strokeDasharray={circumference}
                                          strokeDashoffset={strokeOffset}
                                          strokeLinecap="round"
                                          style={{ transition: `stroke-dashoffset ${tokens.motion.hover}` }}
                                        />
                                      </svg>
                                      <Box
                                        style={{
                                          position: 'absolute' as const,
                                          top: 0,
                                          left: 0,
                                          width: '100%',
                                          height: '100%',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          fontSize: 8,
                                          fontWeight: tokens.typography.fontWeight.bold,
                                          color: scoreColor,
                                        }}
                                      >
                                        {candidate.scorePercent}
                                      </Box>
                                    </Box>
                                  </Box>

                                  {/* Bottom row: days + AI dot */}
                                  <Box
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      marginTop: tokens.spacing[1],
                                    }}
                                  >
                                    <Box
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 2,
                                        fontSize: tokens.typography.fontSize.xs,
                                        color: tokens.colors.neutral[400],
                                      }}
                                    >
                                      <Clock size={10} />
                                      {candidate.daysInStage}d
                                    </Box>

                                    {/* Tags (max 1 in compact) */}
                                    {candidate.tags.length > 0 && (
                                      <Box
                                        style={{
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          padding: `0 ${tokens.spacing[1]}px`,
                                          borderRadius: tokens.borderRadius.full,
                                          fontSize: tokens.typography.fontSize.xs,
                                          backgroundColor: tokens.colors.neutral[100],
                                          color: tokens.colors.neutral[500],
                                          maxWidth: 60,
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          whiteSpace: 'nowrap' as const,
                                        }}
                                      >
                                        {candidate.tags[0]}
                                        {candidate.tags.length > 1 && ` +${candidate.tags.length - 1}`}
                                      </Box>
                                    )}

                                    {/* AI dot */}
                                    <Box
                                      style={{ position: 'relative' as const, display: 'inline-flex' }}
                                      onMouseEnter={() => setAiTooltipId(candidate.id)}
                                      onMouseLeave={() => setAiTooltipId(null)}
                                    >
                                      <Box
                                        style={{
                                          width: 8,
                                          height: 8,
                                          borderRadius: tokens.borderRadius.full,
                                          backgroundColor: aiColor,
                                        }}
                                      />
                                      {showAiTooltip && (
                                        <Box
                                          style={{
                                            position: 'absolute' as const,
                                            bottom: '100%',
                                            right: 0,
                                            marginBottom: tokens.spacing[1],
                                            padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                                            borderRadius: tokens.borderRadius.md,
                                            backgroundColor: tokens.colors.neutral[900],
                                            color: tokens.colors.common.white,
                                            fontSize: tokens.typography.fontSize.xs,
                                            fontWeight: tokens.typography.fontWeight.medium,
                                            whiteSpace: 'nowrap' as const,
                                            zIndex: 10,
                                            boxShadow: tokens.shadows.md,
                                          }}
                                        >
                                          {getAiLabel(candidate.aiRecommendation)}
                                        </Box>
                                      )}
                                    </Box>
                                  </Box>

                                  {/* Hover actions */}
                                  {isHovered && (
                                    <Box
                                      style={{
                                        position: 'absolute' as const,
                                        top: tokens.spacing[1],
                                        right: tokens.spacing[1],
                                        display: 'flex',
                                        gap: 2,
                                        zIndex: 5,
                                      }}
                                    >
                                      <button
                                        onClick={(e) => { e.stopPropagation(); onScheduleInterview?.(candidate.id); }}
                                        title="Schedule"
                                        style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          width: 20,
                                          height: 20,
                                          borderRadius: tokens.borderRadius.sm,
                                          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                                          backgroundColor: tokens.colors.common.white,
                                          color: tokens.colors.primaryScale[600],
                                          cursor: 'pointer',
                                          transition: `all ${tokens.motion.hover}`,
                                          padding: 0,
                                        }}
                                      >
                                        <Calendar size={10} />
                                      </button>
                                      <button
                                        onClick={(e) => { e.stopPropagation(); onAddNote?.(candidate.id); }}
                                        title="Note"
                                        style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          width: 20,
                                          height: 20,
                                          borderRadius: tokens.borderRadius.sm,
                                          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                                          backgroundColor: tokens.colors.common.white,
                                          color: tokens.colors.infoScale[600],
                                          cursor: 'pointer',
                                          transition: `all ${tokens.motion.hover}`,
                                          padding: 0,
                                        }}
                                      >
                                        <MessageSquare size={10} />
                                      </button>
                                      <button
                                        onClick={(e) => { e.stopPropagation(); onReject?.(candidate.id); }}
                                        title="Reject"
                                        style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          width: 20,
                                          height: 20,
                                          borderRadius: tokens.borderRadius.sm,
                                          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                                          backgroundColor: tokens.colors.common.white,
                                          color: tokens.colors.errorScale[600],
                                          cursor: 'pointer',
                                          transition: `all ${tokens.motion.hover}`,
                                          padding: 0,
                                        }}
                                      >
                                        <ThumbsDown size={10} />
                                      </button>
                                      <button
                                        onClick={(e) => { e.stopPropagation(); onHold?.(candidate.id); }}
                                        title="Hold"
                                        style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          width: 20,
                                          height: 20,
                                          borderRadius: tokens.borderRadius.sm,
                                          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                                          backgroundColor: tokens.colors.common.white,
                                          color: tokens.colors.warningScale[600],
                                          cursor: 'pointer',
                                          transition: `all ${tokens.motion.hover}`,
                                          padding: 0,
                                        }}
                                      >
                                        <Pause size={10} />
                                      </button>
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
                )}
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  },
});
