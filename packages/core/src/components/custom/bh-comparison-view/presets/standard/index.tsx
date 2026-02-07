'use client';

/**
 * BhComparisonView - Standard Preset
 * Side-by-side candidate comparison with radar chart, color-coded scoring grid,
 * strengths/weaknesses badges, and decision actions
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createSurfaceStyle, createBadgeStyle, createHoverStyle, getHoverTransform } from '../../../helpers';
import type { BhComparisonViewProps, ComparisonCandidate, CandidateDecision } from '../../core';
import {
  getRankColors,
  getDecisionColors,
  getCandidateInitials,
  getScoreColor,
  getScoreBgColor,
  getCandidateColor,
} from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  Plus,
  X,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Trophy,
  Star,
  TrendingUp,
  TrendingDown,
  Eye,
  EyeOff,
  Radar,
  CheckCircle2,
  XCircle,
  PauseCircle,
  Search,
  Users,
  BarChart3,
  Award,
  ThumbsUp,
  ThumbsDown,
  StickyNote,
} from 'lucide-react';

export const StandardBhComparisonView = createPreset<BhComparisonViewProps>({
  name: 'BhComparisonView.Standard',
  render: ({ primitives, props, tokens, engine }: PresetContext<BhComparisonViewProps>) => {
    const { Box, Stack } = primitives;
    const rankColors = getRankColors(tokens);
    const decisionColors = getDecisionColors(tokens);

    const {
      candidates: controlledCandidates = [],
      comparisonRows: controlledRows = [],
      onAddCandidate,
      onRemoveCandidate,
      onReorderCandidates,
      expandedRows: controlledExpandedRows,
      onRowToggle,
      highlightBest: controlledHighlightBest,
      onHighlightToggle,
      decisions: controlledDecisions,
      onDecisionChange,
      showRadar: controlledShowRadar,
      onRadarToggle,
      loading,
      className,
      style,
    } = props;

    const [internalCandidates, setInternalCandidates] = useState<ComparisonCandidate[]>(controlledCandidates);
    const [internalExpandedRows, setInternalExpandedRows] = useState<string[]>(controlledExpandedRows ?? []);
    const [internalHighlightBest, setInternalHighlightBest] = useState(controlledHighlightBest ?? true);
    const [internalShowRadar, setInternalShowRadar] = useState(controlledShowRadar ?? true);
    const [internalDecisions, setInternalDecisions] = useState<CandidateDecision[]>(controlledDecisions ?? []);

    const candidates = controlledCandidates.length > 0 ? controlledCandidates : internalCandidates;
    const expandedRows = controlledExpandedRows ?? internalExpandedRows;
    const highlightBest = controlledHighlightBest ?? internalHighlightBest;
    const showRadar = controlledShowRadar ?? internalShowRadar;
    const decisions = controlledDecisions ?? internalDecisions;

    const handleRowToggle = (dimension: string) => {
      if (onRowToggle) {
        onRowToggle(dimension);
      } else {
        setInternalExpandedRows((prev) =>
          prev.includes(dimension) ? prev.filter((d) => d !== dimension) : [...prev, dimension],
        );
      }
    };

    const handleHighlightToggle = () => {
      const newVal = !highlightBest;
      setInternalHighlightBest(newVal);
      onHighlightToggle?.(newVal);
    };

    const handleRadarToggle = () => {
      const newVal = !showRadar;
      setInternalShowRadar(newVal);
      onRadarToggle?.(newVal);
    };

    const handleDecisionChange = (decision: CandidateDecision) => {
      if (onDecisionChange) {
        onDecisionChange(decision);
      } else {
        setInternalDecisions((prev) => {
          const existing = prev.findIndex((d) => d.candidateId === decision.candidateId);
          if (existing >= 0) {
            const updated = [...prev];
            updated[existing] = decision;
            return updated;
          }
          return [...prev, decision];
        });
      }
    };

    const getDecisionFor = (candidateId: string): CandidateDecision | undefined => {
      return decisions.find((d) => d.candidateId === candidateId);
    };

    const comparisonRows = controlledRows.length > 0 ? controlledRows : [];

    /* Collect unique dimensions for radar */
    const dimensions = useMemo(() => {
      if (comparisonRows.length > 0) return comparisonRows.map((r) => r.dimension);
      const dimSet = new Set<string>();
      candidates.forEach((c) => c.dimensionScores.forEach((ds) => dimSet.add(ds.dimension)));
      return [...dimSet];
    }, [comparisonRows, candidates]);

    /* Find best score per row for highlighting */
    const bestScorePerDimension = useMemo(() => {
      const result: Record<string, string> = {};
      dimensions.forEach((dim) => {
        let bestId = '';
        let bestScore = -1;
        candidates.forEach((c) => {
          const ds = c.dimensionScores.find((d) => d.dimension === dim);
          if (ds && ds.score > bestScore) {
            bestScore = ds.score;
            bestId = c.id;
          }
        });
        result[dim] = bestId;
      });
      return result;
    }, [candidates, dimensions]);

    /* Find worst score per row */
    const worstScorePerDimension = useMemo(() => {
      const result: Record<string, string> = {};
      dimensions.forEach((dim) => {
        let worstId = '';
        let worstScore = 101;
        candidates.forEach((c) => {
          const ds = c.dimensionScores.find((d) => d.dimension === dim);
          if (ds && ds.score < worstScore) {
            worstScore = ds.score;
            worstId = c.id;
          }
        });
        result[dim] = worstId;
      });
      return result;
    }, [candidates, dimensions]);

    /* Radar chart math */
    const radarSize = 300;
    const radarCenter = radarSize / 2;
    const radarRadius = radarSize / 2 - 40;
    const angleStep = dimensions.length > 0 ? (2 * Math.PI) / dimensions.length : 0;

    const getRadarPoint = (dimIndex: number, score: number): { x: number; y: number } => {
      const angle = dimIndex * angleStep - Math.PI / 2;
      const r = (score / 100) * radarRadius;
      return {
        x: radarCenter + r * Math.cos(angle),
        y: radarCenter + r * Math.sin(angle),
      };
    };

    const getRadarPolygon = (candidate: ComparisonCandidate): string => {
      return dimensions
        .map((dim, i) => {
          const ds = candidate.dimensionScores.find((d) => d.dimension === dim);
          const point = getRadarPoint(i, ds?.score ?? 0);
          return `${point.x},${point.y}`;
        })
        .join(' ');
    };

    const glassStyle = engine === 'modern' && tokens.surface.useGlass && tokens.glass
      ? { backdropFilter: tokens.glass.blur, WebkitBackdropFilter: tokens.glass.blur, backgroundColor: tokens.glass.bg }
      : {};

    const surfaceStyle = createSurfaceStyle(tokens, { elevation: 'md', glass: engine === 'modern' });

    const colWidth = candidates.length > 0 ? `${Math.floor(100 / (candidates.length + 1))}%` : '25%';

    return (
      <Box className={className} style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: tokens.colors.common.white, ...surfaceStyle, ...style }}>
        {/* Header */}
        <Box style={{
          padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          ...glassStyle,
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
            <Users size={18} style={{ color: tokens.colors.primaryScale[600] }} />
            <h2 style={{
              margin: 0,
              fontSize: tokens.typography.fontSize.lg,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[900],
            }}>
              Candidate Comparison
            </h2>
            <Box style={{
              ...createBadgeStyle(tokens, 'primary'),
            }}>
              {candidates.length}/4 candidates
            </Box>
          </Box>
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
            {/* Highlight best toggle */}
            <button
              onClick={handleHighlightToggle}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                borderRadius: tokens.borderRadius.md,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${highlightBest ? tokens.colors.successScale[300] : tokens.colors.neutral[200]}`,
                backgroundColor: highlightBest ? tokens.colors.successScale[50] : tokens.colors.common.white,
                color: highlightBest ? tokens.colors.successScale[700] : tokens.colors.neutral[600],
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.medium,
                cursor: 'pointer',
                fontFamily: 'inherit',
                ...createHoverStyle(tokens),
              }}
            >
              {highlightBest ? <Eye size={12} /> : <EyeOff size={12} />}
              Highlight Best
            </button>
            {/* Radar toggle */}
            <button
              onClick={handleRadarToggle}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                borderRadius: tokens.borderRadius.md,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${showRadar ? tokens.colors.primaryScale[300] : tokens.colors.neutral[200]}`,
                backgroundColor: showRadar ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                color: showRadar ? tokens.colors.primaryScale[700] : tokens.colors.neutral[600],
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.medium,
                cursor: 'pointer',
                fontFamily: 'inherit',
                ...createHoverStyle(tokens),
              }}
            >
              <Radar size={12} />
              Radar Chart
            </button>
            {/* Add candidate */}
            {candidates.length < 4 && (
              <button
                onClick={onAddCandidate}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                  borderRadius: tokens.borderRadius.md,
                  border: 'none',
                  backgroundColor: tokens.colors.primaryScale[500],
                  color: tokens.colors.common.white,
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  ...createHoverStyle(tokens),
                }}
              >
                <Plus size={14} />
                Add Candidate
              </button>
            )}
          </Box>
        </Box>

        <Box style={{ flex: 1, overflow: 'auto' }}>
          {loading ? (
            <Box style={{ textAlign: 'center' as const, padding: tokens.spacing[8], color: tokens.colors.neutral[400] }}>Loading...</Box>
          ) : (
            <Box style={{ padding: tokens.spacing[4] }}>
              {/* Candidate header row with avatars + scores */}
              <Box style={{
                display: 'grid',
                gridTemplateColumns: `180px repeat(${candidates.length}, 1fr)`,
                gap: tokens.spacing[3],
                marginBottom: tokens.spacing[4],
              }}>
                {/* Empty corner cell */}
                <Box />

                {/* Candidate header cards */}
                {candidates.map((candidate, idx) => {
                  const rank = candidate.rank;
                  const rc = rankColors[rank] ?? rankColors[4];
                  const candColor = getCandidateColor(idx, tokens);

                  return (
                    <Box key={candidate.id} style={{
                      ...createCardStyle(tokens, { elevation: 'sm', glass: engine === 'modern' }),
                      padding: tokens.spacing[3],
                      textAlign: 'center' as const,
                      position: 'relative' as const,
                      borderTop: `3px solid ${candColor.stroke}`,
                    }}>
                      {/* Remove button */}
                      <button
                        onClick={() => onRemoveCandidate?.(candidate.id)}
                        style={{
                          position: 'absolute' as const,
                          top: tokens.spacing[1],
                          right: tokens.spacing[1],
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: tokens.colors.neutral[400],
                          padding: tokens.spacing[1],
                          display: 'flex',
                          alignItems: 'center',
                          borderRadius: tokens.borderRadius.full,
                        }}
                      >
                        <X size={12} />
                      </button>

                      {/* Drag handle */}
                      <Box style={{
                        position: 'absolute' as const,
                        top: tokens.spacing[1],
                        left: tokens.spacing[1],
                        color: tokens.colors.neutral[300],
                        cursor: 'grab',
                        padding: tokens.spacing[1],
                        display: 'flex',
                        alignItems: 'center',
                      }}>
                        <GripVertical size={12} />
                      </Box>

                      {/* Avatar */}
                      {candidate.avatar ? (
                        <img src={candidate.avatar} alt="" style={{
                          width: tokens.spacing[12] ?? 48,
                          height: tokens.spacing[12] ?? 48,
                          borderRadius: tokens.borderRadius.full,
                          objectFit: 'cover' as const,
                          margin: '0 auto',
                          display: 'block',
                          border: `3px solid ${candColor.light}`,
                        }} />
                      ) : (
                        <Box style={{
                          width: tokens.spacing[12] ?? 48,
                          height: tokens.spacing[12] ?? 48,
                          borderRadius: tokens.borderRadius.full,
                          backgroundColor: candColor.fill,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: tokens.typography.fontSize.lg,
                          color: candColor.stroke,
                          fontWeight: tokens.typography.fontWeight.bold,
                          margin: '0 auto',
                          border: `3px solid ${candColor.light}`,
                        }}>
                          {getCandidateInitials(candidate.name)}
                        </Box>
                      )}

                      {/* Name */}
                      <Box style={{
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.neutral[900],
                        marginTop: tokens.spacing[2],
                      }}>
                        {candidate.name}
                      </Box>

                      {/* Overall score */}
                      <Box style={{
                        fontSize: tokens.typography.fontSize['2xl'],
                        fontWeight: tokens.typography.fontWeight.bold,
                        color: getScoreColor(candidate.overallScore, tokens),
                        marginTop: tokens.spacing[1],
                      }}>
                        {candidate.overallScore}
                      </Box>

                      {/* Rank badge */}
                      <Box style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: tokens.spacing[1],
                        padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                        borderRadius: tokens.borderRadius.full,
                        backgroundColor: rc.bgColor,
                        color: rc.color,
                        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${rc.border}`,
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        marginTop: tokens.spacing[1],
                      }}>
                        {rank === 1 && <Trophy size={10} />}
                        {rank === 2 && <Award size={10} />}
                        {rank === 3 && <Star size={10} />}
                        #{rank}
                      </Box>
                    </Box>
                  );
                })}
              </Box>

              {/* Radar chart */}
              {showRadar && candidates.length > 0 && dimensions.length >= 3 && (
                <Box style={{
                  ...createCardStyle(tokens, { elevation: 'sm', glass: engine === 'modern' }),
                  padding: tokens.spacing[4],
                  marginBottom: tokens.spacing[4],
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}>
                  <Box style={{
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[900],
                    marginBottom: tokens.spacing[3],
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[2],
                  }}>
                    <Radar size={14} />
                    Skills Radar
                  </Box>

                  <svg
                    width={radarSize}
                    height={radarSize}
                    viewBox={`0 0 ${radarSize} ${radarSize}`}
                    style={{ overflow: 'visible' }}
                  >
                    {/* Grid rings */}
                    {[20, 40, 60, 80, 100].map((level) => {
                      const r = (level / 100) * radarRadius;
                      const points = dimensions.map((_, i) => {
                        const angle = i * angleStep - Math.PI / 2;
                        return `${radarCenter + r * Math.cos(angle)},${radarCenter + r * Math.sin(angle)}`;
                      }).join(' ');
                      return (
                        <polygon
                          key={level}
                          points={points}
                          fill="none"
                          stroke={tokens.colors.neutral[200]}
                          strokeWidth={1}
                        />
                      );
                    })}

                    {/* Axis lines */}
                    {dimensions.map((_, i) => {
                      const angle = i * angleStep - Math.PI / 2;
                      const endX = radarCenter + radarRadius * Math.cos(angle);
                      const endY = radarCenter + radarRadius * Math.sin(angle);
                      return (
                        <line
                          key={i}
                          x1={radarCenter}
                          y1={radarCenter}
                          x2={endX}
                          y2={endY}
                          stroke={tokens.colors.neutral[200]}
                          strokeWidth={1}
                        />
                      );
                    })}

                    {/* Candidate polygons */}
                    {candidates.map((candidate, idx) => {
                      const candColor = getCandidateColor(idx, tokens);
                      const polygon = getRadarPolygon(candidate);
                      return (
                        <polygon
                          key={candidate.id}
                          points={polygon}
                          fill={candColor.fill}
                          fillOpacity={0.2}
                          stroke={candColor.stroke}
                          strokeWidth={2}
                        />
                      );
                    })}

                    {/* Candidate dots */}
                    {candidates.map((candidate, idx) => {
                      const candColor = getCandidateColor(idx, tokens);
                      return dimensions.map((dim, i) => {
                        const ds = candidate.dimensionScores.find((d) => d.dimension === dim);
                        const point = getRadarPoint(i, ds?.score ?? 0);
                        return (
                          <circle
                            key={`${candidate.id}-${dim}`}
                            cx={point.x}
                            cy={point.y}
                            r={3}
                            fill={candColor.stroke}
                            stroke={tokens.colors.common.white}
                            strokeWidth={1.5}
                          />
                        );
                      });
                    })}

                    {/* Dimension labels */}
                    {dimensions.map((dim, i) => {
                      const angle = i * angleStep - Math.PI / 2;
                      const labelR = radarRadius + 20;
                      const x = radarCenter + labelR * Math.cos(angle);
                      const y = radarCenter + labelR * Math.sin(angle);
                      return (
                        <text
                          key={dim}
                          x={x}
                          y={y}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill={tokens.colors.neutral[600]}
                          fontSize={tokens.typography.fontSize.xs}
                          fontWeight={tokens.typography.fontWeight.medium}
                        >
                          {dim}
                        </text>
                      );
                    })}
                  </svg>

                  {/* Legend */}
                  <Box style={{
                    display: 'flex',
                    gap: tokens.spacing[4],
                    marginTop: tokens.spacing[3],
                    flexWrap: 'wrap' as const,
                    justifyContent: 'center',
                  }}>
                    {candidates.map((candidate, idx) => {
                      const candColor = getCandidateColor(idx, tokens);
                      return (
                        <Box key={candidate.id} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: tokens.spacing[1],
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.neutral[700],
                        }}>
                          <Box style={{
                            width: 12,
                            height: 12,
                            borderRadius: tokens.borderRadius.sm,
                            backgroundColor: candColor.stroke,
                          }} />
                          {candidate.name}
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              )}

              {/* Comparison grid */}
              {dimensions.length > 0 && candidates.length > 0 && (
                <Box style={{
                  ...createCardStyle(tokens, { elevation: 'sm', glass: engine === 'modern' }),
                  padding: 0,
                  marginBottom: tokens.spacing[4],
                  overflow: 'hidden',
                }}>
                  {/* Grid header */}
                  <Box style={{
                    display: 'grid',
                    gridTemplateColumns: `180px repeat(${candidates.length}, 1fr)`,
                    gap: 0,
                    backgroundColor: tokens.colors.neutral[50],
                    borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  }}>
                    <Box style={{
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[500],
                      textTransform: 'uppercase' as const,
                      letterSpacing: '0.05em',
                    }}>
                      Dimension
                    </Box>
                    {candidates.map((c) => (
                      <Box key={c.id} style={{
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.neutral[500],
                        textTransform: 'uppercase' as const,
                        letterSpacing: '0.05em',
                        textAlign: 'center' as const,
                        borderLeft: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                      }}>
                        {c.name}
                      </Box>
                    ))}
                  </Box>

                  {/* Grid rows */}
                  {dimensions.map((dim, dimIdx) => {
                    const isExpanded = expandedRows.includes(dim);
                    const bestId = bestScorePerDimension[dim];
                    const worstId = worstScorePerDimension[dim];

                    return (
                      <Box key={dim}>
                        <Box style={{
                          display: 'grid',
                          gridTemplateColumns: `180px repeat(${candidates.length}, 1fr)`,
                          gap: 0,
                          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                        }}>
                          {/* Dimension label */}
                          <Box
                            onClick={() => handleRowToggle(dim)}
                            style={{
                              padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                              fontSize: tokens.typography.fontSize.sm,
                              fontWeight: tokens.typography.fontWeight.medium,
                              color: tokens.colors.neutral[800],
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: tokens.spacing[1],
                              ...createHoverStyle(tokens),
                            }}
                          >
                            {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                            {dim}
                          </Box>

                          {/* Score cells */}
                          {candidates.map((candidate) => {
                            const ds = candidate.dimensionScores.find((d) => d.dimension === dim);
                            const score = ds?.score ?? 0;
                            const isBest = highlightBest && candidate.id === bestId;
                            const isWorst = highlightBest && candidate.id === worstId && candidates.length > 1;

                            return (
                              <Box key={candidate.id} style={{
                                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                                textAlign: 'center' as const,
                                borderLeft: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                                backgroundColor: isBest ? tokens.colors.successScale[50] : isWorst ? tokens.colors.errorScale[50] : 'transparent',
                              }}>
                                <Box style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: tokens.spacing[1],
                                  padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                                  borderRadius: tokens.borderRadius.md,
                                  backgroundColor: getScoreBgColor(score, tokens),
                                  color: getScoreColor(score, tokens),
                                  fontSize: tokens.typography.fontSize.sm,
                                  fontWeight: tokens.typography.fontWeight.semibold,
                                }}>
                                  {score}
                                  {isBest && <TrendingUp size={10} />}
                                  {isWorst && <TrendingDown size={10} />}
                                </Box>

                                {/* Progress bar */}
                                <Box style={{
                                  marginTop: tokens.spacing[1],
                                  height: 3,
                                  backgroundColor: tokens.colors.neutral[100],
                                  borderRadius: tokens.borderRadius.full,
                                  overflow: 'hidden',
                                }}>
                                  <Box style={{
                                    width: `${score}%`,
                                    height: '100%',
                                    backgroundColor: getScoreColor(score, tokens),
                                    borderRadius: tokens.borderRadius.full,
                                  }} />
                                </Box>
                              </Box>
                            );
                          })}
                        </Box>

                        {/* Expanded row details */}
                        {isExpanded && (
                          <Box style={{
                            display: 'grid',
                            gridTemplateColumns: `180px repeat(${candidates.length}, 1fr)`,
                            gap: 0,
                            backgroundColor: tokens.colors.neutral[50],
                            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                          }}>
                            <Box style={{
                              padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                              fontSize: tokens.typography.fontSize.xs,
                              color: tokens.colors.neutral[500],
                            }}>
                              Details
                            </Box>
                            {candidates.map((candidate) => {
                              const ds = candidate.dimensionScores.find((d) => d.dimension === dim);
                              const score = ds?.score ?? 0;
                              return (
                                <Box key={candidate.id} style={{
                                  padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                                  borderLeft: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                                  fontSize: tokens.typography.fontSize.xs,
                                  color: tokens.colors.neutral[600],
                                  textAlign: 'center' as const,
                                }}>
                                  <Box style={{ marginBottom: tokens.spacing[1] }}>
                                    Score: {score}/100
                                  </Box>
                                  <Box style={{
                                    color: score >= 70 ? tokens.colors.successScale[600] : score >= 40 ? tokens.colors.warningScale[600] : tokens.colors.errorScale[600],
                                    fontWeight: tokens.typography.fontWeight.medium,
                                  }}>
                                    {score >= 70 ? 'Strong' : score >= 40 ? 'Average' : 'Needs Improvement'}
                                  </Box>
                                </Box>
                              );
                            })}
                          </Box>
                        )}
                      </Box>
                    );
                  })}
                </Box>
              )}

              {/* Strengths & Weaknesses */}
              {candidates.length > 0 && (
                <Box style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${candidates.length}, 1fr)`,
                  gap: tokens.spacing[3],
                  marginBottom: tokens.spacing[4],
                }}>
                  {candidates.map((candidate, idx) => {
                    const candColor = getCandidateColor(idx, tokens);
                    return (
                      <Box key={candidate.id} style={{
                        ...createCardStyle(tokens, { elevation: 'sm', glass: engine === 'modern' }),
                        padding: tokens.spacing[3],
                        borderTop: `3px solid ${candColor.stroke}`,
                      }}>
                        <Box style={{
                          fontSize: tokens.typography.fontSize.sm,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: tokens.colors.neutral[800],
                          marginBottom: tokens.spacing[3],
                          textAlign: 'center' as const,
                        }}>
                          {candidate.name}
                        </Box>

                        {/* Strengths */}
                        <Box style={{ marginBottom: tokens.spacing[3] }}>
                          <Box style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: tokens.spacing[1],
                            fontSize: tokens.typography.fontSize.xs,
                            fontWeight: tokens.typography.fontWeight.semibold,
                            color: tokens.colors.successScale[700],
                            marginBottom: tokens.spacing[2],
                          }}>
                            <ThumbsUp size={10} />
                            Strengths
                          </Box>
                          <Box style={{ display: 'flex', gap: tokens.spacing[1], flexWrap: 'wrap' as const }}>
                            {candidate.strengths.map((s, i) => (
                              <Box key={i} style={{
                                padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                                borderRadius: tokens.borderRadius.full,
                                backgroundColor: tokens.colors.successScale[100],
                                color: tokens.colors.successScale[700],
                                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.successScale[200]}`,
                                fontSize: tokens.typography.fontSize.xs,
                                fontWeight: tokens.typography.fontWeight.medium,
                              }}>
                                {s}
                              </Box>
                            ))}
                            {candidate.strengths.length === 0 && (
                              <Box style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                                None identified
                              </Box>
                            )}
                          </Box>
                        </Box>

                        {/* Weaknesses */}
                        <Box>
                          <Box style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: tokens.spacing[1],
                            fontSize: tokens.typography.fontSize.xs,
                            fontWeight: tokens.typography.fontWeight.semibold,
                            color: tokens.colors.errorScale[700],
                            marginBottom: tokens.spacing[2],
                          }}>
                            <ThumbsDown size={10} />
                            Weaknesses
                          </Box>
                          <Box style={{ display: 'flex', gap: tokens.spacing[1], flexWrap: 'wrap' as const }}>
                            {candidate.weaknesses.map((w, i) => (
                              <Box key={i} style={{
                                padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                                borderRadius: tokens.borderRadius.full,
                                backgroundColor: tokens.colors.errorScale[100],
                                color: tokens.colors.errorScale[700],
                                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.errorScale[200]}`,
                                fontSize: tokens.typography.fontSize.xs,
                                fontWeight: tokens.typography.fontWeight.medium,
                              }}>
                                {w}
                              </Box>
                            ))}
                            {candidate.weaknesses.length === 0 && (
                              <Box style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                                None identified
                              </Box>
                            )}
                          </Box>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              )}

              {/* Decision actions */}
              {candidates.length > 0 && (
                <Box style={{
                  ...createCardStyle(tokens, { elevation: 'sm', glass: engine === 'modern' }),
                  padding: 0,
                  overflow: 'hidden',
                }}>
                  <Box style={{
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                    backgroundColor: tokens.colors.neutral[50],
                    borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[900],
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[2],
                  }}>
                    <CheckCircle2 size={14} />
                    Decisions
                  </Box>

                  {candidates.map((candidate, idx) => {
                    const decision = getDecisionFor(candidate.id);
                    const candColor = getCandidateColor(idx, tokens);

                    return (
                      <Box key={candidate.id} style={{
                        padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                        borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: tokens.spacing[3],
                      }}>
                        {/* Candidate info */}
                        <Box style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: tokens.spacing[2],
                          minWidth: 150,
                          flexShrink: 0,
                        }}>
                          <Box style={{
                            width: tokens.spacing[7],
                            height: tokens.spacing[7],
                            borderRadius: tokens.borderRadius.full,
                            backgroundColor: candColor.fill,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: tokens.typography.fontSize.xs,
                            color: candColor.stroke,
                            fontWeight: tokens.typography.fontWeight.bold,
                          }}>
                            {getCandidateInitials(candidate.name)}
                          </Box>
                          <Box>
                            <Box style={{
                              fontSize: tokens.typography.fontSize.sm,
                              fontWeight: tokens.typography.fontWeight.medium,
                              color: tokens.colors.neutral[800],
                            }}>
                              {candidate.name}
                            </Box>
                            <Box style={{
                              fontSize: tokens.typography.fontSize.xs,
                              color: tokens.colors.neutral[500],
                            }}>
                              Score: {candidate.overallScore}
                            </Box>
                          </Box>
                        </Box>

                        {/* Decision buttons */}
                        <Box style={{
                          display: 'flex',
                          gap: tokens.spacing[2],
                          alignItems: 'center',
                        }}>
                          {(['advance', 'hold', 'reject'] as const).map((d) => {
                            const isActive = decision?.decision === d;
                            const dc = decisionColors[d];
                            const icons = {
                              advance: <CheckCircle2 size={12} />,
                              hold: <PauseCircle size={12} />,
                              reject: <XCircle size={12} />,
                            };
                            return (
                              <button
                                key={d}
                                onClick={() => handleDecisionChange({ candidateId: candidate.id, decision: d, notes: decision?.notes })}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: tokens.spacing[1],
                                  padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                                  borderRadius: tokens.borderRadius.md,
                                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${isActive ? dc.border : tokens.colors.neutral[200]}`,
                                  backgroundColor: isActive ? dc.bgColor : tokens.colors.common.white,
                                  color: isActive ? dc.color : tokens.colors.neutral[600],
                                  fontSize: tokens.typography.fontSize.xs,
                                  fontWeight: isActive ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal,
                                  cursor: 'pointer',
                                  fontFamily: 'inherit',
                                  textTransform: 'capitalize' as const,
                                  ...createHoverStyle(tokens),
                                }}
                              >
                                {icons[d]}
                                {d}
                              </button>
                            );
                          })}
                        </Box>

                        {/* Notes textarea */}
                        <Box style={{ flex: 1 }}>
                          <textarea
                            value={decision?.notes ?? ''}
                            onChange={(e) => handleDecisionChange({
                              candidateId: candidate.id,
                              decision: decision?.decision ?? 'hold',
                              notes: e.target.value,
                            })}
                            placeholder="Add notes..."
                            style={{
                              width: '100%',
                              minHeight: 36,
                              padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                              borderRadius: tokens.borderRadius.md,
                              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                              fontSize: tokens.typography.fontSize.xs,
                              fontFamily: 'inherit',
                              outline: 'none',
                              boxSizing: 'border-box' as const,
                              color: tokens.colors.neutral[800],
                              backgroundColor: tokens.colors.common.white,
                              resize: 'vertical' as const,
                            }}
                          />
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              )}

              {/* Empty state */}
              {candidates.length === 0 && (
                <Box style={{
                  ...createCardStyle(tokens, { elevation: 'sm' }),
                  padding: tokens.spacing[8],
                  textAlign: 'center' as const,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: tokens.spacing[3],
                }}>
                  <Box style={{
                    width: tokens.spacing[12] ?? 48,
                    height: tokens.spacing[12] ?? 48,
                    borderRadius: tokens.borderRadius.full,
                    backgroundColor: tokens.colors.primaryScale[50],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: tokens.colors.primaryScale[400],
                  }}>
                    <Users size={24} />
                  </Box>
                  <Box style={{
                    fontSize: tokens.typography.fontSize.md,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[700],
                  }}>
                    No candidates to compare
                  </Box>
                  <Box style={{
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.neutral[500],
                    maxWidth: 300,
                  }}>
                    Add up to 4 candidates to compare their skills, scores, and qualifications side by side.
                  </Box>
                  <button
                    onClick={onAddCandidate}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[1],
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                      borderRadius: tokens.borderRadius.md,
                      border: 'none',
                      backgroundColor: tokens.colors.primaryScale[500],
                      color: tokens.colors.common.white,
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      ...createHoverStyle(tokens),
                    }}
                  >
                    <Plus size={14} />
                    Add Candidate
                  </button>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Box>
    );
  },
});
