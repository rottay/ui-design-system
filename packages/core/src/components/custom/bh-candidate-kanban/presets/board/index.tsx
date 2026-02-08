'use client';

/**
 * BhCandidateKanban - Board Preset
 * Classic kanban board with draggable candidate cards, stage columns,
 * SLA indicators, AI recommendation dots, score rings, and quick actions
 */

import { useState, useMemo, useCallback, useRef } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createBadgeStyle,
  createCardStyle,
  createEmptyStateStyle,
  createFilterPillStyle,
  createHoverStyle,
  createPanelHeaderStyle,
  createProgressBarStyle,
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
  Search, Filter, LayoutGrid, Rows3, GripVertical,
  Calendar, MessageSquare, ThumbsDown, Pause, CheckSquare, Square,
  ChevronDown, X, User, Sparkles, Clock, Tag, Mail,
  ArrowRight, Trash2, MoreHorizontal, Users, Briefcase,
} from 'lucide-react';

/* ---------------------------------------------------------------------------
 * Helper utilities
 * -------------------------------------------------------------------------*/

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

function getAiBgColor(rec: AiRecommendation, tokens: DesignTokens): string {
  switch (rec) {
    case 'advance': return tokens.colors.successScale[50];
    case 'hold': return tokens.colors.warningScale[50];
    case 'reject': return tokens.colors.errorScale[50];
  }
}

function getSourceConfig(source: CandidateSource, tokens: DesignTokens): { label: string; bg: string; text: string } {
  switch (source) {
    case 'applied':
      return { label: 'Applied', bg: tokens.colors.primaryScale[100], text: tokens.colors.primaryScale[700] };
    case 'referral':
      return { label: 'Referral', bg: tokens.colors.successScale[100], text: tokens.colors.successScale[700] };
    case 'sourced':
      return { label: 'Sourced', bg: tokens.colors.infoScale[100], text: tokens.colors.infoScale[700] };
    case 'agency':
      return { label: 'Agency', bg: tokens.colors.warningScale[100], text: tokens.colors.warningScale[700] };
    case 'internal':
      return { label: 'Internal', bg: tokens.colors.secondaryScale[100], text: tokens.colors.secondaryScale[700] };
  }
}

function getSlaStatus(candidate: KanbanCandidate, stage: KanbanStage): SlaStatus {
  const hoursInStage = candidate.daysInStage * 24;
  const ratio = hoursInStage / stage.slaHours;
  if (ratio < 0.5) return 'green';
  if (ratio < 0.85) return 'yellow';
  return 'red';
}

function getStageSlaStatus(candidates: KanbanCandidate[], stage: KanbanStage): SlaStatus {
  if (candidates.length === 0) return 'green';
  const statuses = candidates.map((c) => getSlaStatus(c, stage));
  if (statuses.some((s) => s === 'red')) return 'red';
  if (statuses.some((s) => s === 'yellow')) return 'yellow';
  return 'green';
}

function getSlaBarColor(status: SlaStatus, tokens: DesignTokens): string {
  switch (status) {
    case 'green': return tokens.colors.successScale[500];
    case 'yellow': return tokens.colors.warningScale[500];
    case 'red': return tokens.colors.errorScale[500];
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

/* ---------------------------------------------------------------------------
 * Drag state interface
 * -------------------------------------------------------------------------*/

interface DragState {
  candidateId: string;
  fromStageId: string;
}

/* ---------------------------------------------------------------------------
 * Board Preset
 * -------------------------------------------------------------------------*/

export const BoardBhCandidateKanban = createPreset<BhCandidateKanbanProps>({
  name: 'BhCandidateKanban.Board',
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

    /* -- Internal state -------------------------------------------------- */
    const [internalCandidates, setInternalCandidates] = useState<KanbanCandidate[]>(candidatesProp);
    const [dragState, setDragState] = useState<DragState | null>(null);
    const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
    const [internalFilters, setInternalFilters] = useState<KanbanFilter>({});
    const [internalSearchQuery, setInternalSearchQuery] = useState('');
    const [internalSelectedCandidate, setInternalSelectedCandidate] = useState<string | null>(null);
    const [showConfirmReject, setShowConfirmReject] = useState<string | null>(null);
    const [internalBulkSelection, setInternalBulkSelection] = useState<string[]>([]);
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    const [aiTooltipId, setAiTooltipId] = useState<string | null>(null);
    const [dropZoneActive, setDropZoneActive] = useState<'reject' | 'hold' | null>(null);

    const scrollContainerRef = useRef<HTMLDivElement>(null);

    /* -- Resolve controlled vs uncontrolled ------------------------------ */
    const candidates = candidatesProp.length > 0 ? candidatesProp : internalCandidates;
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

    /* -- Sorted stages --------------------------------------------------- */
    const sortedStages = useMemo(() => [...stages].sort((a, b) => a.order - b.order), [stages]);

    /* -- Filtered candidates per stage ----------------------------------- */
    const candidatesByStage = useMemo(() => {
      const map: Record<string, KanbanCandidate[]> = {};
      for (const stage of sortedStages) {
        map[stage.id] = candidates
          .filter((c) => c.stageId === stage.id && matchesFilters(c, filters, searchQuery))
          .sort((a, b) => b.scorePercent - a.scorePercent);
      }
      return map;
    }, [candidates, sortedStages, filters, searchQuery]);

    /* -- Drag handlers --------------------------------------------------- */
    const handleDragStart = useCallback((candidateId: string, stageId: string) => {
      setDragState({ candidateId, fromStageId: stageId });
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent, stageId: string) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      setDragOverColumn(stageId);
    }, []);

    const handleDragLeave = useCallback(() => {
      setDragOverColumn(null);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent, toStageId: string) => {
      e.preventDefault();
      if (!dragState) return;
      const { candidateId, fromStageId } = dragState;
      if (fromStageId !== toStageId) {
        if (onCandidateMove) {
          onCandidateMove(candidateId, fromStageId, toStageId);
        } else {
          setInternalCandidates((prev) =>
            prev.map((c) => (c.id === candidateId ? { ...c, stageId: toStageId, daysInStage: 0 } : c))
          );
        }
      }
      setDragState(null);
      setDragOverColumn(null);
      setDropZoneActive(null);
    }, [dragState, onCandidateMove]);

    const handleDropZoneDragOver = useCallback((e: React.DragEvent, zone: 'reject' | 'hold') => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      setDropZoneActive(zone);
    }, []);

    const handleDropZoneDragLeave = useCallback(() => {
      setDropZoneActive(null);
    }, []);

    const handleDropZoneDrop = useCallback((e: React.DragEvent, zone: 'reject' | 'hold') => {
      e.preventDefault();
      if (!dragState) return;
      const { candidateId } = dragState;
      if (zone === 'reject') {
        setShowConfirmReject(candidateId);
      } else if (zone === 'hold') {
        onHold?.(candidateId);
      }
      setDragState(null);
      setDragOverColumn(null);
      setDropZoneActive(null);
    }, [dragState, onHold]);

    const handleDragEnd = useCallback(() => {
      setDragState(null);
      setDragOverColumn(null);
      setDropZoneActive(null);
    }, []);

    /* -- Bulk helpers ----------------------------------------------------- */
    const toggleBulkCandidate = useCallback((id: string) => {
      const next = bulkSelection.includes(id)
        ? bulkSelection.filter((x) => x !== id)
        : [...bulkSelection, id];
      handleBulkSelectionChange(next);
    }, [bulkSelection, handleBulkSelectionChange]);

    const toggleBulkStage = useCallback((stageId: string) => {
      const stageCandidateIds = (candidatesByStage[stageId] ?? []).map((c) => c.id);
      const allSelected = stageCandidateIds.every((id) => bulkSelection.includes(id));
      if (allSelected) {
        handleBulkSelectionChange(bulkSelection.filter((id) => !stageCandidateIds.includes(id)));
      } else {
        const combined = new Set([...bulkSelection, ...stageCandidateIds]);
        handleBulkSelectionChange(Array.from(combined));
      }
    }, [candidatesByStage, bulkSelection, handleBulkSelectionChange]);

    /* -- Confirm reject -------------------------------------------------- */
    const confirmReject = useCallback(() => {
      if (showConfirmReject) {
        onReject?.(showConfirmReject);
        setShowConfirmReject(null);
      }
    }, [showConfirmReject, onReject]);

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

    const totalFiltered = Object.values(candidatesByStage).reduce((sum, arr) => sum + arr.length, 0);

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
                {totalFiltered} of {totalCandidates} candidates
                {hasActiveFilters && (
                  <span style={{ color: tokens.colors.primaryScale[600], marginLeft: tokens.spacing[1] }}>
                    (filtered)
                  </span>
                )}
              </Box>
            </Box>
          </Box>

          {/* Center: Search + filter */}
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], flex: 1, maxWidth: 480 }}>
            {/* Search input */}
            <Box
              style={{
                position: 'relative' as const,
                flex: 1,
              }}
            >
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
              {hasActiveFilters && (
                <Box
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: tokens.borderRadius.full,
                    backgroundColor: tokens.colors.primaryScale[500],
                  }}
                />
              )}
            </button>
          </Box>

          {/* Right: bulk count + view toggle */}
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
                border: `${tokens.surface.borderWidth || '1px'} ${tokens.surface.borderStyle || 'solid'} ${tokens.colors.primaryScale[300]}`,
                backgroundColor: tokens.colors.primaryScale[50],
                color: tokens.colors.primaryScale[600],
                cursor: 'default',
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
                border: `${tokens.surface.borderWidth || '1px'} ${tokens.surface.borderStyle || 'solid'} ${tokens.colors.neutral[200]}`,
                backgroundColor: tokens.colors.common.white,
                color: tokens.colors.neutral[400],
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
              }}
              title="Swimlane view"
            >
              <Rows3 size={16} />
            </button>
          </Box>
        </Box>

        {/* ================================================================
            FILTER PANEL (collapsible)
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

            {/* AI Recommendation filter */}
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              <Box style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[500] }}>
                AI:
              </Box>
              {(['advance', 'hold', 'reject'] as AiRecommendation[]).map((rec) => {
                const active = filters.aiRecommendation?.includes(rec);
                const aiColor = getAiColor(rec, tokens);
                const aiBg = getAiBgColor(rec, tokens);
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
                      backgroundColor: active ? aiBg : tokens.colors.common.white,
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

            {/* Clear filters */}
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
            KANBAN COLUMNS CONTAINER
            ================================================================ */}
        <div
          ref={scrollContainerRef}
          style={{
            flex: 1,
            display: 'flex',
            gap: tokens.spacing[3],
            padding: tokens.spacing[4],
            overflowX: 'auto' as const,
            overflowY: 'hidden' as const,
            minHeight: 0,
          }}
        >
          {sortedStages.map((stage) => {
            const stageCandidates = candidatesByStage[stage.id] ?? [];
            const slaStatus = getStageSlaStatus(stageCandidates, stage);
            const isDragOver = dragOverColumn === stage.id && dragState && dragState.fromStageId !== stage.id;
            const allStageSelected = stageCandidates.length > 0 && stageCandidates.every((c) => bulkSelection.includes(c.id));
            const someStageSelected = stageCandidates.some((c) => bulkSelection.includes(c.id));

            return (
              <Box
                key={stage.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column' as const,
                  minWidth: 280,
                  maxWidth: 320,
                  flex: '0 0 300px',
                  height: '100%',
                  borderRadius: tokens.borderRadius.lg,
                  backgroundColor: isDragOver ? tokens.colors.primaryScale[50] : tokens.colors.neutral[100],
                  border: isDragOver
                    ? `2px dashed ${tokens.colors.primaryScale[400]}`
                    : `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  transition: `all ${tokens.motion.hover}`,
                  overflow: 'hidden',
                }}
                onDragOver={(e: React.DragEvent) => handleDragOver(e, stage.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e: React.DragEvent) => handleDrop(e, stage.id)}
              >
                {/* Column Header */}
                <Box
                  style={{
                    padding: `${tokens.spacing[3]}px ${tokens.spacing[3]}px ${tokens.spacing[2]}px`,
                    borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                    backgroundColor: tokens.colors.common.white,
                    ...(isModern && tokens.glass ? {
                      backdropFilter: tokens.glass.blurSm,
                      WebkitBackdropFilter: tokens.glass.blurSm,
                      backgroundColor: tokens.glass.bgLight,
                    } : {}),
                  }}
                >
                  <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[2] }}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                      <Box
                        style={{
                          fontSize: tokens.typography.fontSize.sm,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: tokens.colors.neutral[800],
                        }}
                      >
                        {stage.name}
                      </Box>
                      <Box
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minWidth: 22,
                          height: 22,
                          borderRadius: tokens.borderRadius.full,
                          backgroundColor: tokens.colors.neutral[200],
                          color: tokens.colors.neutral[700],
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          padding: `0 ${tokens.spacing[1]}px`,
                        }}
                      >
                        {stageCandidates.length}
                      </Box>
                    </Box>

                    {/* Bulk select button */}
                    <button
                      onClick={() => toggleBulkStage(stage.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 24,
                        height: 24,
                        borderRadius: tokens.borderRadius.sm,
                        border: 'none',
                        backgroundColor: 'transparent',
                        color: allStageSelected
                          ? tokens.colors.primaryScale[600]
                          : someStageSelected
                            ? tokens.colors.primaryScale[400]
                            : tokens.colors.neutral[400],
                        cursor: 'pointer',
                        transition: `all ${tokens.motion.hover}`,
                      }}
                      title={allStageSelected ? 'Deselect all in stage' : 'Select all in stage'}
                    >
                      {allStageSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                    </button>
                  </Box>

                  {/* SLA indicator bar */}
                  <svg width="100%" height="4" style={{ display: 'block', borderRadius: tokens.borderRadius.full }}>
                    <rect
                      x="0"
                      y="0"
                      width="100%"
                      height="4"
                      rx="2"
                      ry="2"
                      fill={tokens.colors.neutral[200]}
                    />
                    <rect
                      x="0"
                      y="0"
                      width={stageCandidates.length > 0 ? '100%' : '0%'}
                      height="4"
                      rx="2"
                      ry="2"
                      fill={getSlaBarColor(slaStatus, tokens)}
                      style={{ transition: `all ${tokens.motion.hover}` }}
                    />
                  </svg>
                </Box>

                {/* Scrollable card container */}
                <Box
                  style={{
                    flex: 1,
                    overflowY: 'auto' as const,
                    padding: tokens.spacing[2],
                    display: 'flex',
                    flexDirection: 'column' as const,
                    gap: tokens.spacing[2],
                  }}
                >
                  {stageCandidates.length === 0 && (
                    <Box
                      style={{
                        display: 'flex',
                        flexDirection: 'column' as const,
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: `${tokens.spacing[6]}px ${tokens.spacing[3]}px`,
                        color: tokens.colors.neutral[400],
                        fontSize: tokens.typography.fontSize.xs,
                        textAlign: 'center' as const,
                      }}
                    >
                      <Users size={24} style={{ marginBottom: tokens.spacing[2], opacity: 0.5 }} />
                      No candidates
                    </Box>
                  )}

                  {stageCandidates.map((candidate) => {
                    const isSelected = selectedCandidate === candidate.id;
                    const isBulkSelected = bulkSelection.includes(candidate.id);
                    const isDragging = dragState?.candidateId === candidate.id;
                    const isHovered = hoveredCard === candidate.id;
                    const sourceConfig = getSourceConfig(candidate.source, tokens);
                    const aiColor = getAiColor(candidate.aiRecommendation, tokens);
                    const scoreColor = getScoreColor(candidate.scorePercent, tokens);
                    const scoreTrack = getScoreTrackColor(candidate.scorePercent, tokens);
                    const showAiTooltip = aiTooltipId === candidate.id;

                    const circumference = 2 * Math.PI * 16;
                    const strokeOffset = circumference - (candidate.scorePercent / 100) * circumference;

                    return (
                      <Box
                        key={candidate.id}
                        draggable
                        onDragStart={() => handleDragStart(candidate.id, stage.id)}
                        onDragEnd={handleDragEnd}
                        onClick={() => handleSelectCandidate(candidate.id)}
                        onMouseEnter={() => setHoveredCard(candidate.id)}
                        onMouseLeave={() => { setHoveredCard(null); setAiTooltipId(null); }}
                        style={{
                          ...cardBase,
                          padding: tokens.spacing[3],
                          cursor: isDragging ? 'grabbing' : 'grab',
                          opacity: isDragging ? 0.5 : 1,
                          borderColor: isSelected
                            ? tokens.colors.primaryScale[500]
                            : isBulkSelected
                              ? tokens.colors.primaryScale[300]
                              : (cardBase.border ? undefined : tokens.colors.neutral[200]),
                          backgroundColor: isSelected
                            ? tokens.colors.primaryScale[50]
                            : isBulkSelected
                              ? tokens.colors.primaryScale[50]
                              : tokens.colors.common.white,
                          position: 'relative' as const,
                          transition: `all ${tokens.motion.hover}`,
                          ...(isModern && tokens.glass ? {
                            backdropFilter: tokens.glass.blurSm,
                            WebkitBackdropFilter: tokens.glass.blurSm,
                          } : {}),
                          ...(isHovered && !isDragging ? hoverTransform : {}),
                        }}
                      >
                        {/* Bulk checkbox */}
                        {(bulkSelection.length > 0 || isHovered) && (
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleBulkCandidate(candidate.id); }}
                            style={{
                              position: 'absolute' as const,
                              top: tokens.spacing[2],
                              left: tokens.spacing[2],
                              width: 18,
                              height: 18,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: 'none',
                              border: 'none',
                              padding: 0,
                              cursor: 'pointer',
                              transition: `all ${tokens.motion.hover}`,
                              color: isBulkSelected ? tokens.colors.primaryScale[600] : tokens.colors.neutral[400],
                              zIndex: 2,
                            }}
                          >
                            {isBulkSelected ? <CheckSquare size={14} /> : <Square size={14} />}
                          </button>
                        )}

                        {/* Card top row: avatar + name + score ring */}
                        <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[2] }}>
                          {/* Avatar */}
                          <Box
                            style={{
                              width: 36,
                              height: 36,
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

                          {/* Name + email */}
                          <Box style={{ flex: 1, minWidth: 0 }}>
                            <Box
                              style={{
                                fontSize: tokens.typography.fontSize.sm,
                                fontWeight: tokens.typography.fontWeight.semibold,
                                color: tokens.colors.neutral[900],
                                whiteSpace: 'nowrap' as const,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {candidate.name}
                            </Box>
                            {candidate.email && (
                              <Box
                                style={{
                                  fontSize: tokens.typography.fontSize.xs,
                                  color: tokens.colors.neutral[400],
                                  whiteSpace: 'nowrap' as const,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {candidate.email}
                              </Box>
                            )}
                          </Box>

                          {/* Score ring */}
                          <Box
                            style={{
                              position: 'relative' as const,
                              width: 40,
                              height: 40,
                              flexShrink: 0,
                            }}
                          >
                            <svg width="40" height="40" viewBox="0 0 40 40" style={{ transform: 'rotate(-90deg)' }}>
                              <circle
                                cx="20"
                                cy="20"
                                r="16"
                                fill="none"
                                stroke={scoreTrack}
                                strokeWidth="3"
                              />
                              <circle
                                cx="20"
                                cy="20"
                                r="16"
                                fill="none"
                                stroke={scoreColor}
                                strokeWidth="3"
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
                                fontSize: tokens.typography.fontSize.xs,
                                fontWeight: tokens.typography.fontWeight.bold,
                                color: scoreColor,
                              }}
                            >
                              {candidate.scorePercent}
                            </Box>
                          </Box>
                        </Box>

                        {/* Middle row: days in stage + source + AI dot */}
                        <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[2], flexWrap: 'wrap' as const }}>
                          {/* Days in stage */}
                          <Box
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: tokens.spacing[1],
                              fontSize: tokens.typography.fontSize.xs,
                              color: tokens.colors.neutral[500],
                            }}
                          >
                            <Clock size={12} />
                            {candidate.daysInStage}d
                          </Box>

                          {/* Source badge */}
                          <Box
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: `1px ${tokens.spacing[2]}px`,
                              borderRadius: tokens.borderRadius.full,
                              fontSize: tokens.typography.fontSize.xs,
                              fontWeight: tokens.typography.fontWeight.medium,
                              backgroundColor: sourceConfig.bg,
                              color: sourceConfig.text,
                            }}
                          >
                            {sourceConfig.label}
                          </Box>

                          {/* AI recommendation dot */}
                          <Box
                            style={{ position: 'relative' as const, display: 'inline-flex', alignItems: 'center' }}
                            onMouseEnter={() => setAiTooltipId(candidate.id)}
                            onMouseLeave={() => setAiTooltipId(null)}
                          >
                            <Box
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: tokens.spacing[1],
                                padding: `1px ${tokens.spacing[1]}px`,
                                borderRadius: tokens.borderRadius.full,
                                cursor: 'default',
                              }}
                            >
                              <Sparkles size={12} style={{ color: aiColor }} />
                              <Box
                                style={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: tokens.borderRadius.full,
                                  backgroundColor: aiColor,
                                }}
                              />
                            </Box>
                            {/* Tooltip */}
                            {showAiTooltip && (
                              <Box
                                style={{
                                  position: 'absolute' as const,
                                  bottom: '100%',
                                  left: '50%',
                                  transform: 'translateX(-50%)',
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

                        {/* Tags row */}
                        {candidate.tags.length > 0 && (
                          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1], flexWrap: 'wrap' as const }}>
                            {candidate.tags.slice(0, 2).map((tag, i) => (
                              <Box
                                key={i}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: tokens.spacing[1],
                                  padding: `1px ${tokens.spacing[2]}px`,
                                  borderRadius: tokens.borderRadius.full,
                                  fontSize: tokens.typography.fontSize.xs,
                                  fontWeight: tokens.typography.fontWeight.medium,
                                  backgroundColor: tokens.colors.neutral[100],
                                  color: tokens.colors.neutral[600],
                                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                                }}
                              >
                                <Tag size={10} />
                                {tag}
                              </Box>
                            ))}
                            {candidate.tags.length > 2 && (
                              <Box
                                style={{
                                  fontSize: tokens.typography.fontSize.xs,
                                  color: tokens.colors.neutral[400],
                                  fontWeight: tokens.typography.fontWeight.medium,
                                }}
                              >
                                +{candidate.tags.length - 2} more
                              </Box>
                            )}
                          </Box>
                        )}

                        {/* Quick actions overlay on hover */}
                        {isHovered && !isDragging && (
                          <Box
                            style={{
                              position: 'absolute' as const,
                              bottom: 0,
                              left: 0,
                              right: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: tokens.spacing[1],
                              padding: `${tokens.spacing[2]}px 0`,
                              background: `linear-gradient(transparent, ${tokens.colors.common.white} 30%)`,
                              borderRadius: `0 0 ${tokens.borderRadius.lg} ${tokens.borderRadius.lg}`,
                            }}
                          >
                            {/* Schedule */}
                            <button
                              onClick={(e) => { e.stopPropagation(); onScheduleInterview?.(candidate.id); }}
                              title="Schedule interview"
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 28,
                                height: 28,
                                borderRadius: tokens.borderRadius.md,
                                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                                backgroundColor: tokens.colors.common.white,
                                color: tokens.colors.primaryScale[600],
                                cursor: 'pointer',
                                transition: `all ${tokens.motion.hover}`,
                                boxShadow: tokens.shadows.sm,
                              }}
                            >
                              <Calendar size={14} />
                            </button>

                            {/* Add Note */}
                            <button
                              onClick={(e) => { e.stopPropagation(); onAddNote?.(candidate.id); }}
                              title="Add note"
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 28,
                                height: 28,
                                borderRadius: tokens.borderRadius.md,
                                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                                backgroundColor: tokens.colors.common.white,
                                color: tokens.colors.infoScale[600],
                                cursor: 'pointer',
                                transition: `all ${tokens.motion.hover}`,
                                boxShadow: tokens.shadows.sm,
                              }}
                            >
                              <MessageSquare size={14} />
                            </button>

                            {/* Reject */}
                            <button
                              onClick={(e) => { e.stopPropagation(); setShowConfirmReject(candidate.id); }}
                              title="Reject"
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 28,
                                height: 28,
                                borderRadius: tokens.borderRadius.md,
                                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                                backgroundColor: tokens.colors.common.white,
                                color: tokens.colors.errorScale[600],
                                cursor: 'pointer',
                                transition: `all ${tokens.motion.hover}`,
                                boxShadow: tokens.shadows.sm,
                              }}
                            >
                              <ThumbsDown size={14} />
                            </button>

                            {/* Hold */}
                            <button
                              onClick={(e) => { e.stopPropagation(); onHold?.(candidate.id); }}
                              title="Put on hold"
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 28,
                                height: 28,
                                borderRadius: tokens.borderRadius.md,
                                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                                backgroundColor: tokens.colors.common.white,
                                color: tokens.colors.warningScale[600],
                                cursor: 'pointer',
                                transition: `all ${tokens.motion.hover}`,
                                boxShadow: tokens.shadows.sm,
                              }}
                            >
                              <Pause size={14} />
                            </button>
                          </Box>
                        )}
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            );
          })}
        </div>

        {/* ================================================================
            BOTTOM DROP ZONES (Reject / Hold)
            ================================================================ */}
        {dragState && (
          <Box
            style={{
              display: 'flex',
              gap: tokens.spacing[3],
              padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px ${tokens.spacing[4]}px`,
              flexShrink: 0,
            }}
          >
            {/* Reject drop zone */}
            <div
              onDragOver={(e) => handleDropZoneDragOver(e, 'reject')}
              onDragLeave={handleDropZoneDragLeave}
              onDrop={(e) => handleDropZoneDrop(e, 'reject')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: tokens.spacing[2],
                padding: `${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.lg,
                border: `2px dashed ${dropZoneActive === 'reject' ? tokens.colors.errorScale[500] : tokens.colors.errorScale[300]}`,
                backgroundColor: dropZoneActive === 'reject' ? tokens.colors.errorScale[100] : tokens.colors.errorScale[50],
                color: dropZoneActive === 'reject' ? tokens.colors.errorScale[700] : tokens.colors.errorScale[500],
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                transition: `all ${tokens.motion.hover}`,
              }}
            >
              <ThumbsDown size={18} />
              Drop to reject
            </div>

            {/* Hold drop zone */}
            <div
              onDragOver={(e) => handleDropZoneDragOver(e, 'hold')}
              onDragLeave={handleDropZoneDragLeave}
              onDrop={(e) => handleDropZoneDrop(e, 'hold')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: tokens.spacing[2],
                padding: `${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.lg,
                border: `2px dashed ${dropZoneActive === 'hold' ? tokens.colors.warningScale[500] : tokens.colors.warningScale[300]}`,
                backgroundColor: dropZoneActive === 'hold' ? tokens.colors.warningScale[100] : tokens.colors.warningScale[50],
                color: dropZoneActive === 'hold' ? tokens.colors.warningScale[700] : tokens.colors.warningScale[500],
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                transition: `all ${tokens.motion.hover}`,
              }}
            >
              <Pause size={18} />
              Drop to hold
            </div>
          </Box>
        )}

        {/* ================================================================
            CONFIRM REJECT MODAL
            ================================================================ */}
        {showConfirmReject && (
          <Box
            style={{
              position: 'fixed' as const,
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: tokens.overlay?.light,
              zIndex: 1000,
            }}
            onClick={() => setShowConfirmReject(null)}
          >
            <Box
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              style={{
                ...cardBase,
                padding: tokens.spacing[5],
                maxWidth: 360,
                width: '90%',
                backgroundColor: tokens.colors.common.white,
                boxShadow: tokens.shadows.xl,
              }}
            >
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                  marginBottom: tokens.spacing[3],
                }}
              >
                <Box
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: tokens.borderRadius.full,
                    backgroundColor: tokens.colors.errorScale[100],
                    color: tokens.colors.errorScale[600],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ThumbsDown size={18} />
                </Box>
                <Box
                  style={{
                    fontSize: tokens.typography.fontSize.lg,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[900],
                  }}
                >
                  Confirm Rejection
                </Box>
              </Box>
              <Box
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[600],
                  marginBottom: tokens.spacing[4],
                  lineHeight: tokens.typography.lineHeight.relaxed,
                }}
              >
                Are you sure you want to reject this candidate? This action will move them to the rejected pool.
              </Box>
              <Box style={{ display: 'flex', gap: tokens.spacing[2], justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowConfirmReject(null)}
                  style={{
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                    borderRadius: tokens.borderRadius.md,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                    backgroundColor: tokens.colors.common.white,
                    color: tokens.colors.neutral[700],
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.medium,
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmReject}
                  style={{
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                    borderRadius: tokens.borderRadius.md,
                    border: 'none',
                    backgroundColor: tokens.colors.errorScale[600],
                    color: tokens.colors.common.white,
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.medium,
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                  }}
                >
                  Reject
                </button>
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    );
  },
});
