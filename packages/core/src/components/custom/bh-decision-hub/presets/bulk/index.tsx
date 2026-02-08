'use client';

/**
 * BhDecisionHub - Bulk Preset
 * Rapid decisions with checklist view, batch actions, and bulk submit.
 * Optimized for quick decision-making across many candidates.
 */

import { useState, useCallback, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createBadgeStyle,
  createCardStyle,
  createEmptyStateStyle,
  createFilterPillStyle,
  createHoverStyle,
  createListItemStyle,
  createPanelHeaderStyle,
  createSurfaceStyle,
  getHoverTransform,
} from '../../../helpers';
import type {
  BhDecisionHubProps,
  DecisionCandidate,
  DecisionAction,
  RejectCategory,
  BulkDecisionEntry,
  DecisionFormData,
} from '../../core';
import {
  BH_DECISION_HUB_DEFAULTS,
  getDecisionActionConfig,
  getRejectCategoryLabel,
  getCandidateInitials,
  formatScoreDisplay,
  getScoreColor,
  getScoreTrackColor,
} from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  Target,
  Users,
  ListChecks,
  ThumbsUp,
  ThumbsDown,
  Pause,
  Send,
  CheckSquare,
  Square,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Sparkles,
  AlertTriangle,
  Star,
  BarChart3,
  Filter,
  RotateCcw,
  Zap,
  Info,
} from 'lucide-react';

// ─── Bulk Preset ─────────────────────────────────────────────────────────────

export const BulkBhDecisionHub = createPreset<BhDecisionHubProps>({
  name: 'BhDecisionHub.Bulk',
  render: ({ primitives, props, tokens, engine }: PresetContext<BhDecisionHubProps>) => {
    const { Box } = primitives;
    const actionConfig = getDecisionActionConfig(tokens);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);
    const cardStyle = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: engine !== 'classic' }), [tokens, engine]);

    const {
      jobName,
      pendingCount,
      candidates = [],
      bulkDecisions: bulkDecisionsProp,
      onBulkDecisionChange,
      onBulkSubmit,
      advanceSteps = ['Phone Screen', 'Technical Interview', 'Culture Fit', 'Final Round', 'Offer'],
      className,
      style,
    } = props;

    // ─── Internal state ──────────────────────────────────────────────────
    const [internalBulkDecisions, setInternalBulkDecisions] = useState<BulkDecisionEntry[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [batchAction, setBatchAction] = useState<DecisionAction | null>(null);
    const [batchRejectCategory, setBatchRejectCategory] = useState<RejectCategory | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<'rank' | 'score' | 'name'>('rank');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

    const bulkDecisions = bulkDecisionsProp ?? internalBulkDecisions;
    const setBulkDecisions = onBulkDecisionChange ?? setInternalBulkDecisions;

    const getDecisionForCandidate = useCallback(
      (candidateId: string) => bulkDecisions.find((d) => d.candidateId === candidateId),
      [bulkDecisions],
    );

    const setDecisionForCandidate = useCallback(
      (candidateId: string, decision: DecisionAction, category?: RejectCategory) => {
        const existing = bulkDecisions.filter((d) => d.candidateId !== candidateId);
        const entry: BulkDecisionEntry = { candidateId, decision };
        if (category) entry.rejectCategory = category;
        setBulkDecisions([...existing, entry]);
      },
      [bulkDecisions, setBulkDecisions],
    );

    const removeDecisionForCandidate = useCallback(
      (candidateId: string) => {
        setBulkDecisions(bulkDecisions.filter((d) => d.candidateId !== candidateId));
      },
      [bulkDecisions, setBulkDecisions],
    );

    const toggleSelect = useCallback((candidateId: string) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(candidateId)) {
          next.delete(candidateId);
        } else {
          next.add(candidateId);
        }
        return next;
      });
    }, []);

    const toggleSelectAll = useCallback(() => {
      if (selectedIds.size === candidates.length) {
        setSelectedIds(new Set());
      } else {
        setSelectedIds(new Set(candidates.map((c) => c.id)));
      }
    }, [selectedIds, candidates]);

    const applyBatchAction = useCallback(() => {
      if (!batchAction || selectedIds.size === 0) return;
      const existing = bulkDecisions.filter((d) => !selectedIds.has(d.candidateId));
      const newEntries: BulkDecisionEntry[] = Array.from(selectedIds).map((id) => {
        const entry: BulkDecisionEntry = { candidateId: id, decision: batchAction };
        if (batchAction === 'reject' && batchRejectCategory) {
          entry.rejectCategory = batchRejectCategory;
        }
        return entry;
      });
      setBulkDecisions([...existing, ...newEntries]);
      setSelectedIds(new Set());
      setBatchAction(null);
      setBatchRejectCategory(null);
    }, [batchAction, batchRejectCategory, selectedIds, bulkDecisions, setBulkDecisions]);

    const resetAll = useCallback(() => {
      setBulkDecisions([]);
      setSelectedIds(new Set());
      setBatchAction(null);
    }, [setBulkDecisions]);

    const sortedCandidates = useMemo(() => {
      const sorted = [...candidates].sort((a, b) => {
        let cmp = 0;
        if (sortBy === 'rank') cmp = a.rank - b.rank;
        else if (sortBy === 'score') cmp = a.scorePercent - b.scorePercent;
        else cmp = a.name.localeCompare(b.name);
        return sortDir === 'asc' ? cmp : -cmp;
      });
      return sorted;
    }, [candidates, sortBy, sortDir]);

    const stats = useMemo(() => {
      let advance = 0;
      let reject = 0;
      let hold = 0;
      bulkDecisions.forEach((d) => {
        if (d.decision === 'advance') advance++;
        else if (d.decision === 'reject') reject++;
        else hold++;
      });
      return { advance, reject, hold, undecided: candidates.length - bulkDecisions.length };
    }, [bulkDecisions, candidates]);

    const allSelected = selectedIds.size === candidates.length && candidates.length > 0;

    return (
      <Box className={className} style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: tokens.colors.neutral[50],
        fontFamily: 'inherit',
        ...style,
      }}>
        {/* ─── Header ──────────────────────────────────────────────────── */}
        <Box style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `${tokens.spacing[4]}px ${tokens.spacing[6]}px`,
          backgroundColor: tokens.colors.common.white,
          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          ...createSurfaceStyle(tokens, { elevation: 'sm' }),
          borderRadius: tokens.borderRadius.none,
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
            <Box style={{
              width: tokens.spacing[10],
              height: tokens.spacing[10],
              borderRadius: tokens.borderRadius.lg,
              backgroundColor: tokens.colors.warningScale[50],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Zap size={20} color={tokens.colors.warningScale[600]} />
            </Box>
            <Box style={{ display: 'flex', flexDirection: 'column' }}>
              <Box style={{
                fontSize: tokens.typography.fontSize.lg,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[900],
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
              }}>
                {jobName}
                <Box style={{
                  ...createBadgeStyle(tokens, 'warning'),
                  fontSize: tokens.typography.fontSize.xs,
                }}>
                  Bulk Mode
                </Box>
              </Box>
              <Box style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[500],
              }}>
                {pendingCount} candidates · {bulkDecisions.length} decided · {stats.undecided} remaining
              </Box>
            </Box>
          </Box>

          {/* Summary badges */}
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
            <Box style={{
              ...createBadgeStyle(tokens, 'success'),
              gap: tokens.spacing[1],
            }}>
              <ThumbsUp size={12} /> {stats.advance}
            </Box>
            <Box style={{
              ...createBadgeStyle(tokens, 'error'),
              gap: tokens.spacing[1],
            }}>
              <ThumbsDown size={12} /> {stats.reject}
            </Box>
            <Box style={{
              ...createBadgeStyle(tokens, 'warning'),
              gap: tokens.spacing[1],
            }}>
              <Pause size={12} /> {stats.hold}
            </Box>
            <button
              onClick={resetAll}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                backgroundColor: tokens.colors.common.white,
                color: tokens.colors.neutral[600],
                fontSize: tokens.typography.fontSize.xs,
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
                fontFamily: 'inherit',
                marginLeft: tokens.spacing[2],
                ...hoverStyle,
              }}
            >
              <RotateCcw size={12} />
              Reset
            </button>
          </Box>
        </Box>

        {/* ─── Batch Action Bar ────────────────────────────────────────── */}
        {selectedIds.size > 0 && (
          <Box style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[3],
            padding: `${tokens.spacing[3]}px ${tokens.spacing[6]}px`,
            backgroundColor: tokens.colors.primaryScale[50],
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[200]}`,
          }}>
            <Box style={{
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
              color: tokens.colors.primaryScale[700],
            }}>
              {selectedIds.size} selected
            </Box>
            <Box style={{ display: 'flex', gap: tokens.spacing[2] }}>
              {(['advance', 'reject', 'hold'] as DecisionAction[]).map((action) => {
                const config = actionConfig[action];
                const isActive = batchAction === action;
                return (
                  <button
                    key={action}
                    onClick={() => setBatchAction(isActive ? null : action)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[1],
                      padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                      borderRadius: tokens.borderRadius.md,
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${isActive ? config.borderColor : tokens.colors.neutral[300]}`,
                      backgroundColor: isActive ? config.bgColor : tokens.colors.common.white,
                      color: isActive ? config.color : tokens.colors.neutral[600],
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.medium,
                      cursor: 'pointer',
                      transition: `all ${tokens.motion.hover}`,
                      fontFamily: 'inherit',
                      ...hoverStyle,
                    }}
                  >
                    {config.label}
                  </button>
                );
              })}
            </Box>
            {batchAction === 'reject' && (
              <select
                value={batchRejectCategory ?? ''}
                onChange={(e) => setBatchRejectCategory(e.target.value as RejectCategory)}
                style={{
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                  borderRadius: tokens.borderRadius.md,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[700],
                  backgroundColor: tokens.colors.common.white,
                  fontFamily: 'inherit',
                }}
              >
                <option value="">Category...</option>
                {(['not_qualified', 'culture_fit', 'compensation', 'timing', 'other'] as RejectCategory[]).map((cat) => (
                  <option key={cat} value={cat}>{getRejectCategoryLabel(cat)}</option>
                ))}
              </select>
            )}
            {batchAction && (
              <button
                onClick={applyBatchAction}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                  borderRadius: tokens.borderRadius.md,
                  border: 'none',
                  backgroundColor: tokens.colors.primaryScale[500],
                  color: tokens.colors.common.white,
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  fontFamily: 'inherit',
                  ...hoverStyle,
                }}
              >
                <Check size={12} />
                Apply to {selectedIds.size}
              </button>
            )}
          </Box>
        )}

        {/* ─── Sort Bar ────────────────────────────────────────────────── */}
        <Box style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing[3],
          padding: `${tokens.spacing[2]}px ${tokens.spacing[6]}px`,
          backgroundColor: tokens.colors.common.white,
          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
            <button
              onClick={toggleSelectAll}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: tokens.spacing[5],
                height: tokens.spacing[5],
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                borderRadius: tokens.borderRadius.sm,
                backgroundColor: allSelected ? tokens.colors.primaryScale[500] : tokens.colors.common.white,
                color: allSelected ? tokens.colors.common.white : 'transparent',
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
                fontFamily: 'inherit',
                padding: 0,
              }}
            >
              {allSelected && <Check size={12} />}
            </button>
          </Box>
          <Box style={{ flex: 1, display: 'flex', gap: tokens.spacing[2] }}>
            {(['rank', 'score', 'name'] as const).map((field) => (
              <button
                key={field}
                onClick={() => {
                  if (sortBy === field) {
                    setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
                  } else {
                    setSortBy(field);
                    setSortDir('asc');
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                  borderRadius: tokens.borderRadius.md,
                  border: 'none',
                  backgroundColor: sortBy === field ? tokens.colors.neutral[100] : 'transparent',
                  color: sortBy === field ? tokens.colors.neutral[800] : tokens.colors.neutral[500],
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: sortBy === field ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal,
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  fontFamily: 'inherit',
                }}
              >
                {field.charAt(0).toUpperCase() + field.slice(1)}
                {sortBy === field && (
                  sortDir === 'asc' ? <ChevronUp size={10} /> : <ChevronDown size={10} />
                )}
              </button>
            ))}
          </Box>
          <Box style={{
            fontSize: tokens.typography.fontSize.xs,
            color: tokens.colors.neutral[500],
          }}>
            {candidates.length} candidates
          </Box>
        </Box>

        {/* ─── Candidate Checklist ─────────────────────────────────────── */}
        <Box style={{ flex: 1, overflowY: 'auto', padding: `0 ${tokens.spacing[6]}px` }}>
          {sortedCandidates.map((candidate) => {
            const isSelected = selectedIds.has(candidate.id);
            const existingDecision = getDecisionForCandidate(candidate.id);
            const isExpanded = expandedId === candidate.id;
            const scoreColor = getScoreColor(tokens, candidate.scorePercent);

            return (
              <div
                key={candidate.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[3],
                    padding: `${tokens.spacing[3]}px 0`,
                  }}
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleSelect(candidate.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: tokens.spacing[5],
                      height: tokens.spacing[5],
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${isSelected ? tokens.colors.primaryScale[500] : tokens.colors.neutral[300]}`,
                      borderRadius: tokens.borderRadius.sm,
                      backgroundColor: isSelected ? tokens.colors.primaryScale[500] : tokens.colors.common.white,
                      color: isSelected ? tokens.colors.common.white : 'transparent',
                      cursor: 'pointer',
                      transition: `all ${tokens.motion.hover}`,
                      fontFamily: 'inherit',
                      padding: 0,
                      flexShrink: 0,
                    }}
                  >
                    {isSelected && <Check size={12} />}
                  </button>

                  {/* Rank badge */}
                  <Box style={{
                    width: tokens.spacing[7],
                    textAlign: 'center',
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: tokens.colors.neutral[500],
                    flexShrink: 0,
                  }}>
                    #{candidate.rank}
                  </Box>

                  {/* Avatar */}
                  {candidate.avatar ? (
                    <img
                      src={candidate.avatar}
                      alt={candidate.name}
                      style={{
                        width: tokens.spacing[8],
                        height: tokens.spacing[8],
                        borderRadius: tokens.borderRadius.full,
                        objectFit: 'cover',
                        flexShrink: 0,
                      }}
                    />
                  ) : (
                    <Box style={{
                      width: tokens.spacing[8],
                      height: tokens.spacing[8],
                      borderRadius: tokens.borderRadius.full,
                      backgroundColor: tokens.colors.primaryScale[100],
                      color: tokens.colors.primaryScale[700],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.bold,
                      flexShrink: 0,
                    }}>
                      {getCandidateInitials(candidate.name)}
                    </Box>
                  )}

                  {/* Name + highlights */}
                  <Box style={{ flex: 1, minWidth: 0 }}>
                    <Box style={{
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[900],
                    }}>
                      {candidate.name}
                    </Box>
                    <Box style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[500],
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {candidate.highlights.slice(0, 3).join(' · ')}
                    </Box>
                  </Box>

                  {/* Score */}
                  <Box style={{
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: scoreColor,
                    flexShrink: 0,
                    width: tokens.spacing[10],
                    textAlign: 'center',
                  }}>
                    {formatScoreDisplay(candidate.scorePercent)}
                  </Box>

                  {/* Quick decision buttons */}
                  <Box style={{ display: 'flex', gap: tokens.spacing[1], flexShrink: 0 }}>
                    {(['advance', 'reject', 'hold'] as DecisionAction[]).map((action) => {
                      const config = actionConfig[action];
                      const isActive = existingDecision?.decision === action;
                      const icons: Record<DecisionAction, React.ReactNode> = {
                        advance: <ThumbsUp size={12} />,
                        reject: <ThumbsDown size={12} />,
                        hold: <Pause size={12} />,
                      };
                      return (
                        <button
                          key={action}
                          onClick={() => {
                            if (isActive) {
                              removeDecisionForCandidate(candidate.id);
                            } else {
                              setDecisionForCandidate(candidate.id, action);
                            }
                          }}
                          title={config.label}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: tokens.spacing[7],
                            height: tokens.spacing[7],
                            borderRadius: tokens.borderRadius.md,
                            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${isActive ? config.borderColor : tokens.colors.neutral[200]}`,
                            backgroundColor: isActive ? config.bgColor : tokens.colors.common.white,
                            color: isActive ? config.color : tokens.colors.neutral[400],
                            cursor: 'pointer',
                            transition: `all ${tokens.motion.hover}`,
                            fontFamily: 'inherit',
                            padding: 0,
                            ...hoverStyle,
                          }}
                        >
                          {icons[action]}
                        </button>
                      );
                    })}
                  </Box>

                  {/* Current decision badge */}
                  {existingDecision && (
                    <Box style={{
                      padding: `0 ${tokens.spacing[2]}px`,
                      borderRadius: tokens.borderRadius.full,
                      backgroundColor: actionConfig[existingDecision.decision].bgColor,
                      color: actionConfig[existingDecision.decision].color,
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      flexShrink: 0,
                    }}>
                      {actionConfig[existingDecision.decision].label}
                    </Box>
                  )}

                  {/* Expand toggle */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : candidate.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: tokens.spacing[6],
                      height: tokens.spacing[6],
                      border: 'none',
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                      transition: `all ${tokens.motion.hover}`,
                      color: tokens.colors.neutral[400],
                      borderRadius: tokens.borderRadius.md,
                      fontFamily: 'inherit',
                      padding: 0,
                      flexShrink: 0,
                    }}
                  >
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <Box style={{
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px ${tokens.spacing[4]}px ${tokens.spacing[10]}px`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: tokens.spacing[3],
                  }}>
                    {/* AI Recommendation */}
                    <Box style={{
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                      borderRadius: tokens.borderRadius.md,
                      backgroundColor: tokens.colors.primaryScale[50],
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[200]}`,
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.primaryScale[700],
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: tokens.spacing[2],
                    }}>
                      <Sparkles size={12} style={{ flexShrink: 0, marginTop: 2 }} />
                      {candidate.aiRecommendation}
                    </Box>

                    {/* Pros/Cons inline */}
                    <Box style={{ display: 'flex', gap: tokens.spacing[4] }}>
                      <Box style={{ flex: 1 }}>
                        <Box style={{
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: tokens.colors.successScale[700],
                          marginBottom: tokens.spacing[1],
                          display: 'flex',
                          alignItems: 'center',
                          gap: tokens.spacing[1],
                        }}>
                          <ThumbsUp size={10} /> Strengths
                        </Box>
                        {candidate.pros.map((p, i) => (
                          <Box key={i} style={{
                            fontSize: tokens.typography.fontSize.xs,
                            color: tokens.colors.neutral[600],
                            display: 'flex',
                            alignItems: 'center',
                            gap: tokens.spacing[1],
                            marginBottom: 2,
                          }}>
                            <Check size={10} color={tokens.colors.successScale[500]} /> {p}
                          </Box>
                        ))}
                      </Box>
                      <Box style={{ flex: 1 }}>
                        <Box style={{
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: tokens.colors.errorScale[700],
                          marginBottom: tokens.spacing[1],
                          display: 'flex',
                          alignItems: 'center',
                          gap: tokens.spacing[1],
                        }}>
                          <ThumbsDown size={10} /> Concerns
                        </Box>
                        {candidate.cons.map((c, i) => (
                          <Box key={i} style={{
                            fontSize: tokens.typography.fontSize.xs,
                            color: tokens.colors.neutral[600],
                            display: 'flex',
                            alignItems: 'center',
                            gap: tokens.spacing[1],
                            marginBottom: 2,
                          }}>
                            <X size={10} color={tokens.colors.errorScale[500]} /> {c}
                          </Box>
                        ))}
                      </Box>
                    </Box>

                    {/* Risk Factors */}
                    {candidate.riskFactors.length > 0 && (
                      <Box style={{ display: 'flex', flexWrap: 'wrap', gap: tokens.spacing[1] }}>
                        {candidate.riskFactors.map((risk, i) => (
                          <Box key={i} style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: tokens.spacing[1],
                            padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                            borderRadius: tokens.borderRadius.md,
                            backgroundColor: tokens.colors.warningScale[50],
                            fontSize: tokens.typography.fontSize.xs,
                            color: tokens.colors.warningScale[700],
                          }}>
                            <AlertTriangle size={10} /> {risk}
                          </Box>
                        ))}
                      </Box>
                    )}

                    {/* Reject category for this candidate */}
                    {existingDecision?.decision === 'reject' && (
                      <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                        <Box style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.neutral[500],
                        }}>
                          Reject category:
                        </Box>
                        <select
                          value={existingDecision.rejectCategory ?? ''}
                          onChange={(e) => setDecisionForCandidate(candidate.id, 'reject', e.target.value as RejectCategory)}
                          style={{
                            padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                            borderRadius: tokens.borderRadius.md,
                            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                            fontSize: tokens.typography.fontSize.xs,
                            color: tokens.colors.neutral[700],
                            backgroundColor: tokens.colors.common.white,
                            fontFamily: 'inherit',
                          }}
                        >
                          <option value="">Select...</option>
                          {(['not_qualified', 'culture_fit', 'compensation', 'timing', 'other'] as RejectCategory[]).map((cat) => (
                            <option key={cat} value={cat}>{getRejectCategoryLabel(cat)}</option>
                          ))}
                        </select>
                      </Box>
                    )}
                  </Box>
                )}
              </div>
            );
          })}
        </Box>

        {/* ─── Submit Footer ───────────────────────────────────────────── */}
        <Box style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `${tokens.spacing[4]}px ${tokens.spacing[6]}px`,
          backgroundColor: tokens.colors.common.white,
          borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          ...createSurfaceStyle(tokens, { elevation: 'sm' }),
          borderRadius: tokens.borderRadius.none,
        }}>
          <Box style={{
            fontSize: tokens.typography.fontSize.sm,
            color: tokens.colors.neutral[600],
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[3],
          }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
              <Box style={{
                width: tokens.spacing[2],
                height: tokens.spacing[2],
                borderRadius: tokens.borderRadius.full,
                backgroundColor: tokens.colors.successScale[500],
              }} />
              {stats.advance} advancing
            </Box>
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
              <Box style={{
                width: tokens.spacing[2],
                height: tokens.spacing[2],
                borderRadius: tokens.borderRadius.full,
                backgroundColor: tokens.colors.errorScale[500],
              }} />
              {stats.reject} rejecting
            </Box>
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
              <Box style={{
                width: tokens.spacing[2],
                height: tokens.spacing[2],
                borderRadius: tokens.borderRadius.full,
                backgroundColor: tokens.colors.warningScale[500],
              }} />
              {stats.hold} on hold
            </Box>
            {stats.undecided > 0 && (
              <Box style={{
                color: tokens.colors.warningScale[600],
                fontWeight: tokens.typography.fontWeight.medium,
              }}>
                ({stats.undecided} undecided)
              </Box>
            )}
          </Box>
          <button
            onClick={onBulkSubmit}
            disabled={bulkDecisions.length === 0}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[2],
              padding: `${tokens.spacing[2]}px ${tokens.spacing[6]}px`,
              borderRadius: tokens.borderRadius.md,
              border: 'none',
              backgroundColor: bulkDecisions.length > 0 ? tokens.colors.primaryScale[500] : tokens.colors.neutral[300],
              color: tokens.colors.common.white,
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.semibold,
              cursor: bulkDecisions.length > 0 ? 'pointer' : 'not-allowed',
              fontFamily: 'inherit',
              ...hoverStyle,
            }}
          >
            <Send size={14} />
            Submit All Decisions ({bulkDecisions.length})
          </button>
        </Box>
      </Box>
    );
  },
});
