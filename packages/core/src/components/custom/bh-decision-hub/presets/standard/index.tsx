'use client';

/**
 * BhDecisionHub - Standard Preset
 * Full hiring decision workflow with candidate queue, detail panel,
 * decision form, side-by-side compare, confirmation modal, and history timeline.
 */

import { useState, useCallback, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createSurfaceStyle, createBadgeStyle, createHoverStyle, getHoverTransform } from '../../../helpers';
import type {
  BhDecisionHubProps,
  DecisionCandidate,
  DecisionAction,
  RejectCategory,
  DecisionRecord,
  CompareSlot,
  DecisionFormData,
  HistoryFilter,
} from '../../core';
import {
  BH_DECISION_HUB_DEFAULTS,
  getDecisionActionConfig,
  getRejectCategoryLabel,
  getHistoryFilterOptions,
  getCandidateInitials,
  formatScoreDisplay,
  getScoreColor,
  getScoreTrackColor,
} from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  Users,
  Award,
  ChevronRight,
  ChevronDown,
  ThumbsUp,
  ThumbsDown,
  Pause,
  X,
  Check,
  AlertTriangle,
  Clock,
  ArrowRight,
  GripVertical,
  Sparkles,
  Shield,
  Star,
  BarChart3,
  GitCompare,
  History,
  ListChecks,
  Send,
  MessageSquare,
  Calendar,
  Filter,
  Plus,
  Minus,
  Eye,
  Target,
  Zap,
  Info,
  CircleDot,
} from 'lucide-react';

// ─── Score Ring SVG Helper ──────────────────────────────────────────────────────

function ScoreRing({
  score,
  size,
  strokeWidth,
  scoreColor,
  trackColor,
  tokens,
}: {
  score: number;
  size: number;
  strokeWidth: number;
  scoreColor: string;
  trackColor: string;
  tokens: DesignTokens;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (score / 100) * circumference;
  const center = size / 2;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={trackColor}
        strokeWidth={strokeWidth}
      />
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={scoreColor}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
        transform={`rotate(-90 ${center} ${center})`}
        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
      />
      <text
        x={center}
        y={center}
        textAnchor="middle"
        dominantBaseline="central"
        fill={scoreColor}
        fontSize={tokens.typography.fontSize.xs}
        fontWeight={tokens.typography.fontWeight.bold}
      >
        {Math.round(score)}%
      </text>
    </svg>
  );
}

// ─── Mini Radar Chart ───────────────────────────────────────────────────────────

function MiniRadarChart({
  values,
  labels,
  size,
  tokens,
}: {
  values: number[];
  labels: string[];
  size: number;
  tokens: DesignTokens;
}) {
  const center = size / 2;
  const maxRadius = size / 2 - 20;
  const angleStep = (2 * Math.PI) / values.length;

  const getPoint = (index: number, value: number) => {
    const angle = angleStep * index - Math.PI / 2;
    const r = (value / 100) * maxRadius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const gridLevels = [0.25, 0.5, 0.75, 1.0];
  const dataPoints = values.map((v, i) => getPoint(i, v));
  const pathData = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Grid lines */}
      {gridLevels.map((level) => {
        const gridPoints = values.map((_, i) => {
          const angle = angleStep * i - Math.PI / 2;
          const r = level * maxRadius;
          return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) };
        });
        const gridPath = gridPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
        return (
          <path key={level} d={gridPath} fill="none" stroke={tokens.colors.neutral[200]} strokeWidth="1" />
        );
      })}
      {/* Axis lines */}
      {values.map((_, i) => {
        const angle = angleStep * i - Math.PI / 2;
        const endX = center + maxRadius * Math.cos(angle);
        const endY = center + maxRadius * Math.sin(angle);
        return (
          <line key={i} x1={center} y1={center} x2={endX} y2={endY} stroke={tokens.colors.neutral[200]} strokeWidth="1" />
        );
      })}
      {/* Data polygon */}
      <path d={pathData} fill={tokens.colors.primaryScale[100]} fillOpacity="0.5" stroke={tokens.colors.primaryScale[500]} strokeWidth="2" />
      {/* Data points */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill={tokens.colors.primaryScale[500]} />
      ))}
      {/* Labels */}
      {values.map((_, i) => {
        const angle = angleStep * i - Math.PI / 2;
        const labelR = maxRadius + 14;
        const lx = center + labelR * Math.cos(angle);
        const ly = center + labelR * Math.sin(angle);
        return (
          <text
            key={`label-${i}`}
            x={lx}
            y={ly}
            textAnchor="middle"
            dominantBaseline="central"
            fill={tokens.colors.neutral[500]}
            fontSize="9"
          >
            {labels[i] || ''}
          </text>
        );
      })}
    </svg>
  );
}

// ─── Standard Preset ────────────────────────────────────────────────────────────

export const StandardBhDecisionHub = createPreset<BhDecisionHubProps>({
  name: 'BhDecisionHub.Standard',
  render: ({ primitives, props, tokens, engine }: PresetContext<BhDecisionHubProps>) => {
    const { Box } = primitives;
    const actionConfig = getDecisionActionConfig(tokens);
    const hoverStyle = createHoverStyle(tokens);
    const hoverTransform = getHoverTransform(tokens);

    const {
      jobName,
      pendingCount,
      candidates = [],
      selectedCandidate: selectedCandidateProp,
      onCandidateSelect,
      decision: decisionProp,
      onDecisionChange,
      compareSlots: compareSlotsProp,
      onCompareSlotChange,
      showConfirmation: showConfirmationProp,
      onConfirmationToggle,
      history = [],
      historyFilter: historyFilterProp,
      onHistoryFilterChange,
      feedbackEnabled: feedbackEnabledProp,
      onFeedbackToggle,
      advanceSteps = ['Phone Screen', 'Technical Interview', 'Culture Fit', 'Final Round', 'Offer'],
      onSubmitDecision,
      className,
      style,
    } = props;

    // ─── Internal state ──────────────────────────────────────────────────
    const [internalSelected, setInternalSelected] = useState<string | null>(null);
    const [internalDecision, setInternalDecision] = useState<DecisionFormData>({});
    const [internalCompareSlots, setInternalCompareSlots] = useState<CompareSlot[]>([]);
    const [internalShowConfirm, setInternalShowConfirm] = useState(false);
    const [internalHistoryFilter, setInternalHistoryFilter] = useState<HistoryFilter>('all');
    const [internalFeedback, setInternalFeedback] = useState(true);
    const [showCompare, setShowCompare] = useState(false);
    const [showHistory, setShowHistory] = useState(false);

    const selectedCandidateId = selectedCandidateProp ?? internalSelected;
    const setSelectedCandidateId = onCandidateSelect ?? setInternalSelected;
    const decision = decisionProp ?? internalDecision;
    const setDecision = onDecisionChange ?? setInternalDecision;
    const compareSlots = compareSlotsProp ?? internalCompareSlots;
    const setCompareSlots = onCompareSlotChange ?? setInternalCompareSlots;
    const showConfirmation = showConfirmationProp ?? internalShowConfirm;
    const setShowConfirmation = onConfirmationToggle ?? setInternalShowConfirm;
    const historyFilter = historyFilterProp ?? internalHistoryFilter;
    const setHistoryFilter = onHistoryFilterChange ?? setInternalHistoryFilter;
    const feedbackEnabled = feedbackEnabledProp ?? internalFeedback;
    const setFeedbackEnabled = onFeedbackToggle ?? setInternalFeedback;

    const selectedCandidate = useMemo(
      () => candidates.find((c) => c.id === selectedCandidateId) ?? null,
      [candidates, selectedCandidateId],
    );

    const filteredHistory = useMemo(() => {
      if (historyFilter === 'all') return history;
      return history.filter((h) => h.decision === historyFilter);
    }, [history, historyFilter]);

    const compareCandidates = useMemo(
      () =>
        compareSlots
          .sort((a, b) => a.position - b.position)
          .map((slot) => candidates.find((c) => c.id === slot.candidateId))
          .filter(Boolean) as DecisionCandidate[],
      [compareSlots, candidates],
    );

    const handleAddToCompare = useCallback(
      (candidateId: string) => {
        if (compareSlots.length >= 4) return;
        if (compareSlots.some((s) => s.candidateId === candidateId)) return;
        setCompareSlots([...compareSlots, { candidateId, position: compareSlots.length }]);
      },
      [compareSlots, setCompareSlots],
    );

    const handleRemoveFromCompare = useCallback(
      (candidateId: string) => {
        const updated = compareSlots
          .filter((s) => s.candidateId !== candidateId)
          .map((s, i) => ({ ...s, position: i }));
        setCompareSlots(updated);
      },
      [compareSlots, setCompareSlots],
    );

    const handleDecisionAction = useCallback(
      (action: DecisionAction) => {
        setDecision({ ...decision, action });
      },
      [decision, setDecision],
    );

    const handleConfirmDecision = useCallback(() => {
      if (selectedCandidateId && decision.action) {
        onSubmitDecision?.(selectedCandidateId, decision);
        setShowConfirmation(false);
        setDecision({});
      }
    }, [selectedCandidateId, decision, onSubmitDecision, setShowConfirmation, setDecision]);

    const surfaceStyle = createSurfaceStyle(tokens, { elevation: 'lg', glass: engine !== 'classic' });
    const cardStyle = createCardStyle(tokens, { elevation: 'sm', glass: engine !== 'classic' });

    // ─── Ranking badges ──────────────────────────────────────────────────
    const rankCounts = useMemo(() => {
      let top = 0;
      let mid = 0;
      let low = 0;
      candidates.forEach((c) => {
        if (c.scorePercent >= 80) top++;
        else if (c.scorePercent >= 60) mid++;
        else low++;
      });
      return { top, mid, low };
    }, [candidates]);

    return (
      <Box className={className} style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: tokens.colors.neutral[50],
        fontFamily: 'inherit',
        ...style,
      }}>
        {/* ─── Top Header ──────────────────────────────────────────────── */}
        <Box style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `${tokens.spacing[4]}px ${tokens.spacing[6]}px`,
          backgroundColor: tokens.colors.common.white,
          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          ...createSurfaceStyle(tokens, { elevation: 'sm' }),
          borderRadius: 0,
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
            <Box style={{
              width: tokens.spacing[10],
              height: tokens.spacing[10],
              borderRadius: tokens.borderRadius.lg,
              backgroundColor: tokens.colors.primaryScale[50],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Target size={20} color={tokens.colors.primaryScale[600]} />
            </Box>
            <Box style={{ display: 'flex', flexDirection: 'column' }}>
              <Box style={{
                fontSize: tokens.typography.fontSize.lg,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[900],
              }}>
                {jobName}
              </Box>
              <Box style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[500],
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
              }}>
                <Users size={14} />
                {pendingCount} pending decision{pendingCount !== 1 ? 's' : ''}
              </Box>
            </Box>
          </Box>

          {/* Ranking Summary Badges */}
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
            <Box style={{
              ...createBadgeStyle(tokens, 'success'),
              gap: tokens.spacing[1],
            }}>
              <Star size={12} />
              {rankCounts.top} Top
            </Box>
            <Box style={{
              ...createBadgeStyle(tokens, 'warning'),
              gap: tokens.spacing[1],
            }}>
              <BarChart3 size={12} />
              {rankCounts.mid} Mid
            </Box>
            <Box style={{
              ...createBadgeStyle(tokens, 'error'),
              gap: tokens.spacing[1],
            }}>
              <AlertTriangle size={12} />
              {rankCounts.low} Low
            </Box>

            {/* Toggle buttons */}
            <Box style={{ marginLeft: tokens.spacing[3], display: 'flex', gap: tokens.spacing[1] }}>
              <button
                onClick={() => setShowCompare(!showCompare)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                  borderRadius: tokens.borderRadius.md,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${showCompare ? tokens.colors.primaryScale[300] : tokens.colors.neutral[300]}`,
                  backgroundColor: showCompare ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                  color: showCompare ? tokens.colors.primaryScale[700] : tokens.colors.neutral[600],
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  ...hoverStyle,
                }}
              >
                <GitCompare size={14} />
                Compare
              </button>
              <button
                onClick={() => setShowHistory(!showHistory)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                  borderRadius: tokens.borderRadius.md,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${showHistory ? tokens.colors.primaryScale[300] : tokens.colors.neutral[300]}`,
                  backgroundColor: showHistory ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                  color: showHistory ? tokens.colors.primaryScale[700] : tokens.colors.neutral[600],
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  ...hoverStyle,
                }}
              >
                <History size={14} />
                History
              </button>
            </Box>
          </Box>
        </Box>

        {/* ─── Main Content ────────────────────────────────────────────── */}
        <Box style={{
          display: 'flex',
          flex: 1,
          overflow: 'hidden',
        }}>
          {/* ─── Left: Candidate Queue ─────────────────────────────────── */}
          <Box style={{
            width: 320,
            flexShrink: 0,
            borderRight: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            backgroundColor: tokens.colors.common.white,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
            <Box style={{
              padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
              borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[700],
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[2],
            }}>
              <ListChecks size={14} />
              Candidate Queue ({candidates.length})
            </Box>

            <Box style={{ flex: 1, overflowY: 'auto', padding: tokens.spacing[2] }}>
              {candidates
                .sort((a, b) => a.rank - b.rank)
                .map((candidate) => {
                  const isSelected = candidate.id === selectedCandidateId;
                  const scoreColor = getScoreColor(tokens, candidate.scorePercent);
                  const trackColor = getScoreTrackColor(tokens);

                  return (
                    <div
                      key={candidate.id}
                      onClick={() => setSelectedCandidateId(candidate.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: tokens.spacing[3],
                        padding: `${tokens.spacing[3]}px ${tokens.spacing[3]}px`,
                        borderRadius: tokens.borderRadius.md,
                        backgroundColor: isSelected ? tokens.colors.primaryScale[50] : 'transparent',
                        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${isSelected ? tokens.colors.primaryScale[200] : 'transparent'}`,
                        cursor: 'pointer',
                        marginBottom: tokens.spacing[1],
                        ...hoverStyle,
                      }}
                    >
                      {/* Rank number */}
                      <Box style={{
                        width: tokens.spacing[6],
                        height: tokens.spacing[6],
                        borderRadius: tokens.borderRadius.full,
                        backgroundColor: isSelected ? tokens.colors.primaryScale[100] : tokens.colors.neutral[100],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: tokens.typography.fontWeight.bold,
                        color: isSelected ? tokens.colors.primaryScale[700] : tokens.colors.neutral[600],
                        flexShrink: 0,
                      }}>
                        #{candidate.rank}
                      </Box>

                      {/* Score Ring */}
                      <Box style={{ flexShrink: 0 }}>
                        <ScoreRing
                          score={candidate.scorePercent}
                          size={40}
                          strokeWidth={3}
                          scoreColor={scoreColor}
                          trackColor={trackColor}
                          tokens={tokens}
                        />
                      </Box>

                      {/* Candidate Info */}
                      <Box style={{ flex: 1, minWidth: 0 }}>
                        <Box style={{
                          fontSize: tokens.typography.fontSize.sm,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: isSelected ? tokens.colors.primaryScale[800] : tokens.colors.neutral[900],
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          {candidate.name}
                        </Box>
                        {/* Key highlights (first 2) */}
                        <Box style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.neutral[500],
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          {candidate.highlights.slice(0, 2).join(' · ')}
                        </Box>
                        {/* AI recommendation snippet */}
                        <Box style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.primaryScale[600],
                          display: 'flex',
                          alignItems: 'center',
                          gap: tokens.spacing[1],
                          marginTop: tokens.spacing[1],
                        }}>
                          <Sparkles size={10} />
                          <span style={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}>
                            {candidate.aiRecommendation.length > 40
                              ? candidate.aiRecommendation.slice(0, 40) + '...'
                              : candidate.aiRecommendation}
                          </span>
                        </Box>
                      </Box>

                      <ChevronRight size={14} color={tokens.colors.neutral[400]} style={{ flexShrink: 0 }} />
                    </div>
                  );
                })}
            </Box>
          </Box>

          {/* ─── Right: Detail Panel ───────────────────────────────────── */}
          <Box style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
            {selectedCandidate ? (
              <Box style={{ flex: 1, overflowY: 'auto', padding: tokens.spacing[5] }}>
                {/* ── Candidate Header ──────────────────────────────────── */}
                <Box style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: tokens.spacing[4],
                  marginBottom: tokens.spacing[5],
                }}>
                  {/* Avatar */}
                  {selectedCandidate.avatar ? (
                    <img
                      src={selectedCandidate.avatar}
                      alt={selectedCandidate.name}
                      style={{
                        width: tokens.spacing[14],
                        height: tokens.spacing[14],
                        borderRadius: tokens.borderRadius.full,
                        objectFit: 'cover',
                        border: `2px solid ${tokens.colors.neutral[200]}`,
                      }}
                    />
                  ) : (
                    <Box style={{
                      width: tokens.spacing[14],
                      height: tokens.spacing[14],
                      borderRadius: tokens.borderRadius.full,
                      backgroundColor: tokens.colors.primaryScale[100],
                      color: tokens.colors.primaryScale[700],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: tokens.typography.fontSize.xl,
                      fontWeight: tokens.typography.fontWeight.bold,
                      flexShrink: 0,
                    }}>
                      {getCandidateInitials(selectedCandidate.name)}
                    </Box>
                  )}
                  <Box style={{ flex: 1 }}>
                    <Box style={{
                      fontSize: tokens.typography.fontSize.xl,
                      fontWeight: tokens.typography.fontWeight.bold,
                      color: tokens.colors.neutral[900],
                      marginBottom: tokens.spacing[1],
                    }}>
                      {selectedCandidate.name}
                    </Box>
                    <Box style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[2],
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.neutral[500],
                    }}>
                      <Award size={14} />
                      Rank #{selectedCandidate.rank} · Score {formatScoreDisplay(selectedCandidate.scorePercent)}
                    </Box>
                    {/* AI Recommendation */}
                    <Box style={{
                      marginTop: tokens.spacing[2],
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                      borderRadius: tokens.borderRadius.md,
                      backgroundColor: tokens.colors.primaryScale[50],
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[200]}`,
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.primaryScale[700],
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: tokens.spacing[2],
                    }}>
                      <Sparkles size={14} style={{ flexShrink: 0, marginTop: 2 }} />
                      {selectedCandidate.aiRecommendation}
                    </Box>
                  </Box>
                  {/* Add to Compare button */}
                  <button
                    onClick={() => handleAddToCompare(selectedCandidate.id)}
                    disabled={compareSlots.length >= 4 || compareSlots.some((s) => s.candidateId === selectedCandidate.id)}
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
                      cursor: compareSlots.length >= 4 ? 'not-allowed' : 'pointer',
                      fontFamily: 'inherit',
                      opacity: (compareSlots.length >= 4 || compareSlots.some((s) => s.candidateId === selectedCandidate.id)) ? 0.5 : 1,
                      ...hoverStyle,
                    }}
                  >
                    <Plus size={12} />
                    Compare
                  </button>
                </Box>

                {/* ── Scorecard Mini Radar ──────────────────────────────── */}
                <Box style={{
                  ...cardStyle,
                  marginBottom: tokens.spacing[4],
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[5],
                }}>
                  <MiniRadarChart
                    values={[
                      selectedCandidate.scorePercent,
                      Math.min(100, selectedCandidate.scorePercent + 5),
                      Math.max(0, selectedCandidate.scorePercent - 10),
                      Math.min(100, selectedCandidate.scorePercent + 8),
                      Math.max(0, selectedCandidate.scorePercent - 5),
                    ]}
                    labels={['Overall', 'Skills', 'Culture', 'Exp.', 'Growth']}
                    size={140}
                    tokens={tokens}
                  />
                  <Box style={{ flex: 1 }}>
                    <Box style={{
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[800],
                      marginBottom: tokens.spacing[2],
                    }}>
                      Scorecard Summary
                    </Box>
                    <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
                      {selectedCandidate.highlights.map((h, i) => (
                        <Box key={i} style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.neutral[600],
                          display: 'flex',
                          alignItems: 'center',
                          gap: tokens.spacing[1],
                        }}>
                          <Check size={10} color={tokens.colors.successScale[500]} />
                          {h}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Box>

                {/* ── Pros / Cons Cards ─────────────────────────────────── */}
                <Box style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: tokens.spacing[4],
                  marginBottom: tokens.spacing[4],
                }}>
                  {/* Pros */}
                  <Box style={{
                    ...cardStyle,
                    borderLeft: `3px solid ${tokens.colors.successScale[400]}`,
                  }}>
                    <Box style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[2],
                      marginBottom: tokens.spacing[3],
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.successScale[700],
                    }}>
                      <ThumbsUp size={14} />
                      Strengths
                    </Box>
                    {selectedCandidate.pros.map((pro, i) => (
                      <Box key={i} style={{
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.neutral[700],
                        padding: `${tokens.spacing[1]}px 0`,
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: tokens.spacing[2],
                      }}>
                        <Box style={{
                          width: tokens.spacing[1],
                          height: tokens.spacing[1],
                          borderRadius: tokens.borderRadius.full,
                          backgroundColor: tokens.colors.successScale[400],
                          marginTop: 6,
                          flexShrink: 0,
                        }} />
                        {pro}
                      </Box>
                    ))}
                  </Box>

                  {/* Cons */}
                  <Box style={{
                    ...cardStyle,
                    borderLeft: `3px solid ${tokens.colors.errorScale[400]}`,
                  }}>
                    <Box style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[2],
                      marginBottom: tokens.spacing[3],
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.errorScale[700],
                    }}>
                      <ThumbsDown size={14} />
                      Concerns
                    </Box>
                    {selectedCandidate.cons.map((con, i) => (
                      <Box key={i} style={{
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.neutral[700],
                        padding: `${tokens.spacing[1]}px 0`,
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: tokens.spacing[2],
                      }}>
                        <Box style={{
                          width: tokens.spacing[1],
                          height: tokens.spacing[1],
                          borderRadius: tokens.borderRadius.full,
                          backgroundColor: tokens.colors.errorScale[400],
                          marginTop: 6,
                          flexShrink: 0,
                        }} />
                        {con}
                      </Box>
                    ))}
                  </Box>
                </Box>

                {/* ── Risk Factors ──────────────────────────────────────── */}
                {selectedCandidate.riskFactors.length > 0 && (
                  <Box style={{
                    ...cardStyle,
                    borderLeft: `3px solid ${tokens.colors.warningScale[400]}`,
                    marginBottom: tokens.spacing[4],
                  }}>
                    <Box style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[2],
                      marginBottom: tokens.spacing[3],
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.warningScale[700],
                    }}>
                      <Shield size={14} />
                      Risk Factors
                    </Box>
                    {selectedCandidate.riskFactors.map((risk, i) => (
                      <Box key={i} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: tokens.spacing[2],
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                        borderRadius: tokens.borderRadius.md,
                        backgroundColor: tokens.colors.warningScale[50],
                        marginBottom: tokens.spacing[1],
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.warningScale[800],
                      }}>
                        <AlertTriangle size={12} color={tokens.colors.warningScale[500]} />
                        {risk}
                      </Box>
                    ))}
                  </Box>
                )}

                {/* ── Decision Form ────────────────────────────────────── */}
                <Box style={{
                  ...cardStyle,
                  borderTop: `3px solid ${tokens.colors.primaryScale[400]}`,
                  marginBottom: tokens.spacing[4],
                }}>
                  <Box style={{
                    fontSize: tokens.typography.fontSize.md,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[900],
                    marginBottom: tokens.spacing[4],
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[2],
                  }}>
                    <Zap size={16} color={tokens.colors.primaryScale[500]} />
                    Make Decision
                  </Box>

                  {/* Action buttons row */}
                  <Box style={{ display: 'flex', gap: tokens.spacing[3], marginBottom: tokens.spacing[4] }}>
                    {(['advance', 'reject', 'hold'] as DecisionAction[]).map((action) => {
                      const config = actionConfig[action];
                      const isActive = decision.action === action;
                      const icons: Record<DecisionAction, React.ReactNode> = {
                        advance: <ThumbsUp size={16} />,
                        reject: <ThumbsDown size={16} />,
                        hold: <Pause size={16} />,
                      };
                      return (
                        <button
                          key={action}
                          onClick={() => handleDecisionAction(action)}
                          style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: tokens.spacing[2],
                            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                            borderRadius: tokens.borderRadius.lg,
                            border: `2px solid ${isActive ? config.borderColor : tokens.colors.neutral[200]}`,
                            backgroundColor: isActive ? config.bgColor : tokens.colors.common.white,
                            color: isActive ? config.color : tokens.colors.neutral[600],
                            fontSize: tokens.typography.fontSize.sm,
                            fontWeight: tokens.typography.fontWeight.semibold,
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            ...hoverStyle,
                          }}
                        >
                          {icons[action]}
                          {config.label}
                        </button>
                      );
                    })}
                  </Box>

                  {/* Advance: next step dropdown */}
                  {decision.action === 'advance' && (
                    <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2], marginBottom: tokens.spacing[3] }}>
                      <Box style={{
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.medium,
                        color: tokens.colors.neutral[700],
                      }}>
                        Advance to next step
                      </Box>
                      <select
                        value={decision.advanceStep ?? ''}
                        onChange={(e) => setDecision({ ...decision, advanceStep: e.target.value })}
                        style={{
                          padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                          borderRadius: tokens.borderRadius.md,
                          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                          fontSize: tokens.typography.fontSize.sm,
                          color: tokens.colors.neutral[900],
                          backgroundColor: tokens.colors.common.white,
                          fontFamily: 'inherit',
                          cursor: 'pointer',
                        }}
                      >
                        <option value="">Select next step...</option>
                        {advanceSteps.map((step) => (
                          <option key={step} value={step}>{step}</option>
                        ))}
                      </select>
                    </Box>
                  )}

                  {/* Reject: category dropdown + reason textarea */}
                  {decision.action === 'reject' && (
                    <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3], marginBottom: tokens.spacing[3] }}>
                      <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
                        <Box style={{
                          fontSize: tokens.typography.fontSize.sm,
                          fontWeight: tokens.typography.fontWeight.medium,
                          color: tokens.colors.neutral[700],
                        }}>
                          Rejection Category
                        </Box>
                        <select
                          value={decision.rejectCategory ?? ''}
                          onChange={(e) => setDecision({ ...decision, rejectCategory: e.target.value as RejectCategory })}
                          style={{
                            padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                            borderRadius: tokens.borderRadius.md,
                            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                            fontSize: tokens.typography.fontSize.sm,
                            color: tokens.colors.neutral[900],
                            backgroundColor: tokens.colors.common.white,
                            fontFamily: 'inherit',
                            cursor: 'pointer',
                          }}
                        >
                          <option value="">Select category...</option>
                          {(['not_qualified', 'culture_fit', 'compensation', 'timing', 'other'] as RejectCategory[]).map((cat) => (
                            <option key={cat} value={cat}>{getRejectCategoryLabel(cat)}</option>
                          ))}
                        </select>
                      </Box>
                      <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
                        <Box style={{
                          fontSize: tokens.typography.fontSize.sm,
                          fontWeight: tokens.typography.fontWeight.medium,
                          color: tokens.colors.neutral[700],
                        }}>
                          Reason
                        </Box>
                        <textarea
                          value={decision.rejectReason ?? ''}
                          onChange={(e) => setDecision({ ...decision, rejectReason: e.target.value })}
                          placeholder="Provide a reason for rejection..."
                          rows={3}
                          style={{
                            padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                            borderRadius: tokens.borderRadius.md,
                            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                            fontSize: tokens.typography.fontSize.sm,
                            color: tokens.colors.neutral[900],
                            backgroundColor: tokens.colors.common.white,
                            fontFamily: 'inherit',
                            resize: 'vertical',
                          }}
                        />
                      </Box>
                    </Box>
                  )}

                  {/* Hold: reason + followup date */}
                  {decision.action === 'hold' && (
                    <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3], marginBottom: tokens.spacing[3] }}>
                      <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
                        <Box style={{
                          fontSize: tokens.typography.fontSize.sm,
                          fontWeight: tokens.typography.fontWeight.medium,
                          color: tokens.colors.neutral[700],
                        }}>
                          Reason for Hold
                        </Box>
                        <textarea
                          value={decision.holdReason ?? ''}
                          onChange={(e) => setDecision({ ...decision, holdReason: e.target.value })}
                          placeholder="Why should this candidate be put on hold?"
                          rows={3}
                          style={{
                            padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                            borderRadius: tokens.borderRadius.md,
                            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                            fontSize: tokens.typography.fontSize.sm,
                            color: tokens.colors.neutral[900],
                            backgroundColor: tokens.colors.common.white,
                            fontFamily: 'inherit',
                            resize: 'vertical',
                          }}
                        />
                      </Box>
                      <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
                        <Box style={{
                          fontSize: tokens.typography.fontSize.sm,
                          fontWeight: tokens.typography.fontWeight.medium,
                          color: tokens.colors.neutral[700],
                        }}>
                          Follow-up Date
                        </Box>
                        <input
                          type="date"
                          value={decision.followupDate ?? ''}
                          onChange={(e) => setDecision({ ...decision, followupDate: e.target.value })}
                          style={{
                            padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                            borderRadius: tokens.borderRadius.md,
                            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                            fontSize: tokens.typography.fontSize.sm,
                            color: tokens.colors.neutral[900],
                            backgroundColor: tokens.colors.common.white,
                            fontFamily: 'inherit',
                          }}
                        />
                      </Box>
                    </Box>
                  )}

                  {/* Submit button */}
                  {decision.action && (
                    <button
                      onClick={() => setShowConfirmation(true)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: tokens.spacing[2],
                        padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                        borderRadius: tokens.borderRadius.md,
                        border: 'none',
                        backgroundColor: actionConfig[decision.action].color,
                        color: tokens.colors.common.white,
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        ...hoverStyle,
                      }}
                    >
                      <Send size={14} />
                      Confirm {actionConfig[decision.action].label} Decision
                    </button>
                  )}
                </Box>
              </Box>
            ) : (
              /* ── No candidate selected placeholder ───────────────────── */
              <Box style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: tokens.colors.neutral[400],
                gap: tokens.spacing[3],
              }}>
                <Target size={48} color={tokens.colors.neutral[300]} />
                <Box style={{
                  fontSize: tokens.typography.fontSize.md,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: tokens.colors.neutral[500],
                }}>
                  Select a candidate to review
                </Box>
                <Box style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[400],
                }}>
                  Choose from the queue on the left to view details and make a decision
                </Box>
              </Box>
            )}
          </Box>
        </Box>

        {/* ─── Compare Panel (bottom drawer) ───────────────────────────── */}
        {showCompare && (
          <Box style={{
            borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            backgroundColor: tokens.colors.common.white,
            padding: tokens.spacing[4],
            maxHeight: 260,
            overflowY: 'auto',
          }}>
            <Box style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: tokens.spacing[3],
            }}>
              <Box style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[800],
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
              }}>
                <GitCompare size={14} />
                Side-by-Side Comparison ({compareCandidates.length}/4)
              </Box>
              <button
                onClick={() => setShowCompare(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: tokens.spacing[6],
                  height: tokens.spacing[6],
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  color: tokens.colors.neutral[400],
                  borderRadius: tokens.borderRadius.md,
                  fontFamily: 'inherit',
                }}
              >
                <X size={14} />
              </button>
            </Box>

            {compareCandidates.length > 0 ? (
              <Box style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${compareCandidates.length}, 1fr)`,
                gap: tokens.spacing[3],
              }}>
                {compareCandidates.map((c) => (
                  <Box key={c.id} style={{
                    ...cardStyle,
                    padding: tokens.spacing[3],
                    position: 'relative',
                  }}>
                    <button
                      onClick={() => handleRemoveFromCompare(c.id)}
                      style={{
                        position: 'absolute',
                        top: tokens.spacing[1],
                        right: tokens.spacing[1],
                        width: tokens.spacing[5],
                        height: tokens.spacing[5],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: 'none',
                        backgroundColor: 'transparent',
                        cursor: 'pointer',
                        color: tokens.colors.neutral[400],
                        borderRadius: tokens.borderRadius.full,
                        fontFamily: 'inherit',
                      }}
                    >
                      <Minus size={12} />
                    </button>
                    <Box style={{
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[900],
                      marginBottom: tokens.spacing[2],
                    }}>
                      {c.name}
                    </Box>
                    <Box style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[500],
                      marginBottom: tokens.spacing[1],
                    }}>
                      Score: {formatScoreDisplay(c.scorePercent)} | Rank: #{c.rank}
                    </Box>
                    <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
                      {c.pros.slice(0, 2).map((p, i) => (
                        <Box key={i} style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.successScale[600],
                          display: 'flex',
                          alignItems: 'center',
                          gap: tokens.spacing[1],
                        }}>
                          <Check size={10} /> {p}
                        </Box>
                      ))}
                      {c.cons.slice(0, 1).map((con, i) => (
                        <Box key={`con-${i}`} style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.errorScale[600],
                          display: 'flex',
                          alignItems: 'center',
                          gap: tokens.spacing[1],
                        }}>
                          <X size={10} /> {con}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Box style={{
                padding: tokens.spacing[6],
                textAlign: 'center',
                color: tokens.colors.neutral[400],
                fontSize: tokens.typography.fontSize.sm,
              }}>
                Click &quot;+ Compare&quot; on a candidate to add them to the comparison
              </Box>
            )}
          </Box>
        )}

        {/* ─── History Timeline (bottom drawer) ────────────────────────── */}
        {showHistory && (
          <Box style={{
            borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            backgroundColor: tokens.colors.common.white,
            padding: tokens.spacing[4],
            maxHeight: 280,
            overflowY: 'auto',
          }}>
            <Box style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: tokens.spacing[3],
            }}>
              <Box style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[800],
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
              }}>
                <History size={14} />
                Decision History
              </Box>
              <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                {getHistoryFilterOptions().map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setHistoryFilter(opt.value)}
                    style={{
                      padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                      borderRadius: tokens.borderRadius.md,
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${historyFilter === opt.value ? tokens.colors.primaryScale[300] : tokens.colors.neutral[200]}`,
                      backgroundColor: historyFilter === opt.value ? tokens.colors.primaryScale[50] : 'transparent',
                      color: historyFilter === opt.value ? tokens.colors.primaryScale[700] : tokens.colors.neutral[500],
                      fontSize: tokens.typography.fontSize.xs,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
                <button
                  onClick={() => setShowHistory(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: tokens.spacing[6],
                    height: tokens.spacing[6],
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    color: tokens.colors.neutral[400],
                    borderRadius: tokens.borderRadius.md,
                    fontFamily: 'inherit',
                  }}
                >
                  <X size={14} />
                </button>
              </Box>
            </Box>

            {filteredHistory.length > 0 ? (
              <Box style={{ display: 'flex', flexDirection: 'column', position: 'relative', paddingLeft: tokens.spacing[5] }}>
                {/* Timeline line */}
                <Box style={{
                  position: 'absolute',
                  left: tokens.spacing[2],
                  top: 0,
                  bottom: 0,
                  width: 2,
                  backgroundColor: tokens.colors.neutral[200],
                }} />
                {filteredHistory.map((record, idx) => {
                  const config = actionConfig[record.decision];
                  const candidateName = candidates.find((c) => c.id === record.candidateId)?.name ?? 'Unknown';
                  return (
                    <Box key={idx} style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: tokens.spacing[3],
                      padding: `${tokens.spacing[2]}px 0`,
                      position: 'relative',
                    }}>
                      {/* Timeline dot */}
                      <Box style={{
                        position: 'absolute',
                        left: -tokens.spacing[5] + tokens.spacing[2] - 4,
                        top: tokens.spacing[2] + 4,
                        width: tokens.spacing[2] + 2,
                        height: tokens.spacing[2] + 2,
                        borderRadius: tokens.borderRadius.full,
                        backgroundColor: config.iconColor,
                        border: `2px solid ${tokens.colors.common.white}`,
                      }} />
                      <Box style={{ flex: 1 }}>
                        <Box style={{
                          fontSize: tokens.typography.fontSize.sm,
                          color: tokens.colors.neutral[800],
                          display: 'flex',
                          alignItems: 'center',
                          gap: tokens.spacing[2],
                        }}>
                          <span style={{ fontWeight: tokens.typography.fontWeight.semibold }}>{candidateName}</span>
                          <Box style={{
                            padding: `0 ${tokens.spacing[2]}px`,
                            borderRadius: tokens.borderRadius.full,
                            backgroundColor: config.bgColor,
                            color: config.color,
                            fontSize: tokens.typography.fontSize.xs,
                            fontWeight: tokens.typography.fontWeight.medium,
                          }}>
                            {config.label}
                          </Box>
                        </Box>
                        <Box style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.neutral[500],
                          display: 'flex',
                          alignItems: 'center',
                          gap: tokens.spacing[2],
                          marginTop: tokens.spacing[1],
                        }}>
                          <span>by {record.decidedBy}</span>
                          <span>{record.decidedAt}</span>
                          {record.reason && (
                            <span style={{ color: tokens.colors.neutral[400] }}>- {record.reason}</span>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            ) : (
              <Box style={{
                padding: tokens.spacing[6],
                textAlign: 'center',
                color: tokens.colors.neutral[400],
                fontSize: tokens.typography.fontSize.sm,
              }}>
                No decision history recorded yet
              </Box>
            )}
          </Box>
        )}

        {/* ─── Confirmation Modal ──────────────────────────────────────── */}
        {showConfirmation && selectedCandidate && decision.action && (
          <Box style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.4)',
            zIndex: 1000,
          }}>
            <Box style={{
              ...surfaceStyle,
              backgroundColor: tokens.colors.common.white,
              padding: tokens.spacing[6],
              width: 480,
              maxWidth: '90%',
              display: 'flex',
              flexDirection: 'column',
              gap: tokens.spacing[4],
            }}>
              <Box style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <Box style={{
                  fontSize: tokens.typography.fontSize.lg,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[900],
                }}>
                  Confirm Decision
                </Box>
                <button
                  onClick={() => setShowConfirmation(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: tokens.spacing[8],
                    height: tokens.spacing[8],
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    color: tokens.colors.neutral[400],
                    borderRadius: tokens.borderRadius.md,
                    fontFamily: 'inherit',
                  }}
                >
                  <X size={16} />
                </button>
              </Box>

              {/* Decision summary */}
              <Box style={{
                padding: tokens.spacing[4],
                borderRadius: tokens.borderRadius.md,
                backgroundColor: actionConfig[decision.action].bgColor,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${actionConfig[decision.action].borderColor}`,
              }}>
                <Box style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[600],
                  marginBottom: tokens.spacing[2],
                }}>
                  You are about to <strong style={{ color: actionConfig[decision.action].color }}>{decision.action}</strong> this candidate:
                </Box>
                <Box style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                  fontSize: tokens.typography.fontSize.md,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[900],
                }}>
                  {selectedCandidate.name}
                  <Box style={{
                    padding: `0 ${tokens.spacing[2]}px`,
                    borderRadius: tokens.borderRadius.full,
                    backgroundColor: actionConfig[decision.action].bgColor,
                    color: actionConfig[decision.action].color,
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    border: `1px solid ${actionConfig[decision.action].borderColor}`,
                  }}>
                    {actionConfig[decision.action].label}
                  </Box>
                </Box>
                {decision.action === 'advance' && decision.advanceStep && (
                  <Box style={{
                    marginTop: tokens.spacing[2],
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.neutral[600],
                  }}>
                    Next step: <strong>{decision.advanceStep}</strong>
                  </Box>
                )}
                {decision.action === 'reject' && decision.rejectCategory && (
                  <Box style={{
                    marginTop: tokens.spacing[2],
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.neutral[600],
                  }}>
                    Category: <strong>{getRejectCategoryLabel(decision.rejectCategory)}</strong>
                    {decision.rejectReason && <> - {decision.rejectReason}</>}
                  </Box>
                )}
                {decision.action === 'hold' && (
                  <Box style={{
                    marginTop: tokens.spacing[2],
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.neutral[600],
                  }}>
                    {decision.holdReason && <>Reason: {decision.holdReason}</>}
                    {decision.followupDate && <> | Follow-up: {decision.followupDate}</>}
                  </Box>
                )}
              </Box>

              {/* Feedback toggle */}
              <Box style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                borderRadius: tokens.borderRadius.md,
                backgroundColor: tokens.colors.neutral[50],
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              }}>
                <Box style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[700],
                }}>
                  <MessageSquare size={14} />
                  Send candidate feedback
                </Box>
                <button
                  onClick={() => setFeedbackEnabled(!feedbackEnabled)}
                  style={{
                    width: 40,
                    height: 22,
                    borderRadius: tokens.borderRadius.full,
                    border: 'none',
                    backgroundColor: feedbackEnabled ? tokens.colors.primaryScale[500] : tokens.colors.neutral[300],
                    cursor: 'pointer',
                    position: 'relative',
                    transition: `all ${tokens.motion.hover}`,
                    fontFamily: 'inherit',
                  }}
                >
                  <Box style={{
                    width: 18,
                    height: 18,
                    borderRadius: tokens.borderRadius.full,
                    backgroundColor: tokens.colors.common.white,
                    position: 'absolute',
                    top: 2,
                    left: feedbackEnabled ? 20 : 2,
                    transition: `all ${tokens.motion.hover}`,
                    boxShadow: tokens.shadows.sm,
                  }} />
                </button>
              </Box>

              {/* Actions */}
              <Box style={{ display: 'flex', justifyContent: 'flex-end', gap: tokens.spacing[3] }}>
                <button
                  onClick={() => setShowConfirmation(false)}
                  style={{
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[5]}px`,
                    borderRadius: tokens.borderRadius.md,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                    backgroundColor: tokens.colors.common.white,
                    color: tokens.colors.neutral[700],
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.medium,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDecision}
                  style={{
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[5]}px`,
                    borderRadius: tokens.borderRadius.md,
                    border: 'none',
                    backgroundColor: decision.action ? actionConfig[decision.action].color : tokens.colors.primaryScale[500],
                    color: tokens.colors.common.white,
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[2],
                  }}
                >
                  <Check size={14} />
                  Confirm
                </button>
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    );
  },
});
