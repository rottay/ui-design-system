'use client';

/**
 * BhRankingBoard - Comparison Preset
 * Visual comparison mode with radar charts for selected candidates,
 * side-by-side strength/weakness analysis, and score comparison bars
 */

import { useState, useMemo } from 'react';
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
  createSurfaceStyle,
  getHoverTransform,
} from '../../../helpers';
import type {
  BhRankingBoardProps,
  RankedCandidate,
  DecisionAction,
  DecisionStatus,
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
  Hexagon,
  ChevronDown,
  ChevronRight,
  CheckSquare,
  Square,
  ThumbsUp,
  ThumbsDown,
  Pause,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Check,
  X,
  Minus,
  User,
  Star,
  Target,
  Eye,
  Download,
  Flag,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Helper: Radar chart point computation                               */
/* ------------------------------------------------------------------ */
function computeRadarPoints(
  stageScores: { stage: string; score: number }[],
  radius: number,
  cx: number,
  cy: number,
): string {
  const count = stageScores.length;
  if (count === 0) return '';
  return stageScores
    .map((ss, i) => {
      const angle = (Math.PI * 2 * i) / count - Math.PI / 2;
      const r = (ss.score / 100) * radius;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      return `${x},${y}`;
    })
    .join(' ');
}

function computeGridPoints(level: number, count: number, radius: number, cx: number, cy: number): string {
  return Array.from({ length: count })
    .map((_, i) => {
      const angle = (Math.PI * 2 * i) / count - Math.PI / 2;
      const r = level * radius;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      return `${x},${y}`;
    })
    .join(' ');
}

/* ---- Candidate colors for overlay ---- */
const CANDIDATE_OVERLAY_COLORS = [
  { fill: '#3B82F620', stroke: '#3B82F6' },
  { fill: '#EF444420', stroke: '#EF4444' },
  { fill: '#10B98120', stroke: '#10B981' },
  { fill: '#F59E0B20', stroke: '#F59E0B' },
  { fill: '#8B5CF620', stroke: '#8B5CF6' },
];

/* ------------------------------------------------------------------ */
/*  Comparison Preset                                                   */
/* ------------------------------------------------------------------ */
export const ComparisonBhRankingBoard = createPreset<BhRankingBoardProps>(
  'BhRankingBoard.Comparison',
  ({ primitives, props, tokens, engine }: PresetContext<BhRankingBoardProps>) => {
    const { Box } = primitives;
    const isModern = tokens.surface.useGlass;

    const {
      jobName,
      candidates,
      selectedCandidates: selectedProp,
      onSelectionChange,
      onCompare,
      decisions: decisionsProp,
      onDecisionChange,
      onBulkAdvance,
      onBulkReject,
      onExport,
      expandedCandidate: expandedProp,
      onCandidateExpand,
      className,
      style,
    } = props;

    /* ---- internal state ---- */
    const [internalSelected, setInternalSelected] = useState<string[]>([]);
    const [internalDecisions, setInternalDecisions] = useState<Record<string, DecisionAction>>({});
    const [internalExpanded, setInternalExpanded] = useState<string | null>(null);
    const [hoveredCandidate, setHoveredCandidate] = useState<string | null>(null);

    const selected = selectedProp ?? internalSelected;
    const decisions = decisionsProp ?? internalDecisions;
    const expandedCandidate = expandedProp ?? internalExpanded;

    const handleToggleSelect = (id: string) => {
      const next = selected.includes(id)
        ? selected.filter(s => s !== id)
        : [...selected, id];
      onSelectionChange?.(next);
      setInternalSelected(next);
    };

    const handleDecisionChange = (candidateId: string, action: DecisionAction) => {
      onDecisionChange?.(candidateId, action);
      setInternalDecisions(prev => ({ ...prev, [candidateId]: action }));
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

    /* ---- compared candidates ---- */
    const comparedCandidates = useMemo(
      () => candidates.filter(c => selected.includes(c.id)),
      [candidates, selected],
    );

    /* ---- all unique stages across selected ---- */
    const allStages = useMemo(() => {
      const stageSet = new Set<string>();
      comparedCandidates.forEach(c => {
        c.stageScores.forEach(ss => stageSet.add(ss.stage));
      });
      return Array.from(stageSet);
    }, [comparedCandidates]);

    /* ---- radar chart config ---- */
    const radarSize = 320;
    const radarCenter = radarSize / 2;
    const radarRadius = radarSize / 2 - 48;

    /* ================================================================ */
    /*  RENDER: Header                                                    */
    /* ================================================================ */
    const renderHeader = () => (
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
          <Eye size={20} color={tokens.colors.primaryScale[600]} />
          <Box>
            <Box style={{
              fontSize: tokens.typography.fontSize.xl,
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
            }}>
              Candidate Comparison
            </Box>
            <Box style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[500],
              marginTop: tokens.spacing[1],
            }}>
              {jobName} &mdash; {comparedCandidates.length} candidate{comparedCandidates.length !== 1 ? 's' : ''} selected
            </Box>
          </Box>
        </Box>

        <Box style={{ display: 'flex', gap: tokens.spacing[2] }}>
          {onExport && (
            <Box
              onClick={onExport}
              style={{
                ...hoverStyle,
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
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
        </Box>
      </Box>
    );

    /* ================================================================ */
    /*  RENDER: Candidate Selector                                        */
    /* ================================================================ */
    const renderCandidateSelector = () => (
      <Box style={{
        ...cardBase,
        ...glassCard,
        padding: tokens.spacing[4],
        marginBottom: tokens.spacing[4],
      }}>
        <Box style={{
          fontSize: tokens.typography.fontSize.xs,
          fontWeight: tokens.typography.fontWeight.semibold,
          color: tokens.colors.neutral[500],
          textTransform: 'uppercase' as const,
          letterSpacing: '0.05em',
          marginBottom: tokens.spacing[3],
        }}>
          Select Candidates to Compare (max 5)
        </Box>

        <Box style={{
          display: 'flex',
          gap: tokens.spacing[2],
          flexWrap: 'wrap' as const,
        }}>
          {candidates.slice(0, 20).map((c, idx) => {
            const isSelected = selected.includes(c.id);
            const colorIdx = selected.indexOf(c.id);
            const overlayColor = colorIdx >= 0 ? CANDIDATE_OVERLAY_COLORS[colorIdx % CANDIDATE_OVERLAY_COLORS.length] : null;

            return (
              <Box
                key={c.id}
                onClick={() => {
                  if (!isSelected && selected.length >= 5) return;
                  handleToggleSelect(c.id);
                }}
                style={{
                  ...hoverStyle,
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                  borderRadius: tokens.borderRadius.md,
                  backgroundColor: isSelected ? (overlayColor ? overlayColor.fill : tokens.colors.primaryScale[50]) : tokens.colors.common.white,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${isSelected ? (overlayColor ? overlayColor.stroke : tokens.colors.primaryScale[400]) : tokens.colors.neutral[200]}`,
                  opacity: !isSelected && selected.length >= 5 ? 0.5 : 1,
                }}
              >
                <Box style={{
                  width: 24,
                  height: 24,
                  borderRadius: tokens.borderRadius.full,
                  backgroundColor: tokens.colors.primaryScale[100],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}>
                  {c.avatar ? (
                    <img src={c.avatar} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Box style={{ fontSize: '9px', fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.primaryScale[600] }}>
                      {getCandidateInitials(c.name)}
                    </Box>
                  )}
                </Box>
                <Box style={{
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: isSelected ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal,
                  color: tokens.colors.neutral[700],
                }}>
                  {c.name}
                </Box>
                <Box style={{
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.neutral[500],
                }}>
                  {c.overallScore}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    );

    /* ================================================================ */
    /*  RENDER: Radar Chart Overlay                                       */
    /* ================================================================ */
    const renderRadarComparison = () => {
      if (comparedCandidates.length === 0 || allStages.length < 3) return null;

      const gridLevels = [0.25, 0.5, 0.75, 1.0];

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
            <Hexagon size={16} color={tokens.colors.primaryScale[500]} />
            Stage Score Radar
          </Box>

          <Box style={{ display: 'flex', justifyContent: 'center' }}>
            <svg width={radarSize} height={radarSize} viewBox={`0 0 ${radarSize} ${radarSize}`}>
              {/* Grid */}
              {gridLevels.map(level => (
                <polygon
                  key={level}
                  points={computeGridPoints(level, allStages.length, radarRadius, radarCenter, radarCenter)}
                  fill="none"
                  stroke={tokens.colors.neutral[200]}
                  strokeWidth={1}
                />
              ))}

              {/* Axes */}
              {allStages.map((_, i) => {
                const angle = (Math.PI * 2 * i) / allStages.length - Math.PI / 2;
                const x = radarCenter + radarRadius * Math.cos(angle);
                const y = radarCenter + radarRadius * Math.sin(angle);
                return (
                  <line
                    key={i}
                    x1={radarCenter}
                    y1={radarCenter}
                    x2={x}
                    y2={y}
                    stroke={tokens.colors.neutral[200]}
                    strokeWidth={1}
                  />
                );
              })}

              {/* Candidate polygons */}
              {comparedCandidates.map((candidate, idx) => {
                const color = CANDIDATE_OVERLAY_COLORS[idx % CANDIDATE_OVERLAY_COLORS.length];
                const normalizedScores = allStages.map(stage => {
                  const found = candidate.stageScores.find(ss => ss.stage === stage);
                  return { stage, score: found ? found.score : 0 };
                });
                const points = computeRadarPoints(normalizedScores, radarRadius, radarCenter, radarCenter);
                const isHovered = hoveredCandidate === candidate.id;

                return (
                  <g key={candidate.id}>
                    <polygon
                      points={points}
                      fill={color.fill}
                      stroke={color.stroke}
                      strokeWidth={isHovered ? 3 : 2}
                      opacity={isHovered ? 1 : 0.8}
                      onMouseEnter={() => setHoveredCandidate(candidate.id)}
                      onMouseLeave={() => setHoveredCandidate(null)}
                      style={{ cursor: 'pointer', transition: `stroke-width 150ms ease` }}
                    />
                    {/* Dots */}
                    {normalizedScores.map((ss, i) => {
                      const angle = (Math.PI * 2 * i) / allStages.length - Math.PI / 2;
                      const r = (ss.score / 100) * radarRadius;
                      const x = radarCenter + r * Math.cos(angle);
                      const y = radarCenter + r * Math.sin(angle);
                      return (
                        <circle
                          key={`${candidate.id}-${i}`}
                          cx={x}
                          cy={y}
                          r={3}
                          fill={tokens.colors.common.white}
                          stroke={color.stroke}
                          strokeWidth={2}
                        />
                      );
                    })}
                  </g>
                );
              })}

              {/* Labels */}
              {allStages.map((stage, i) => {
                const angle = (Math.PI * 2 * i) / allStages.length - Math.PI / 2;
                const labelR = radarRadius + 28;
                const x = radarCenter + labelR * Math.cos(angle);
                const y = radarCenter + labelR * Math.sin(angle);
                return (
                  <text
                    key={stage}
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={tokens.colors.neutral[600]}
                    fontSize={tokens.typography.fontSize.xs}
                    fontWeight={tokens.typography.fontWeight.medium}
                  >
                    {stage.length > 10 ? stage.slice(0, 8) + '...' : stage}
                  </text>
                );
              })}
            </svg>
          </Box>

          {/* Legend */}
          <Box style={{
            display: 'flex',
            justifyContent: 'center',
            gap: tokens.spacing[4],
            marginTop: tokens.spacing[3],
            flexWrap: 'wrap' as const,
          }}>
            {comparedCandidates.map((c, idx) => {
              const color = CANDIDATE_OVERLAY_COLORS[idx % CANDIDATE_OVERLAY_COLORS.length];
              return (
                <Box
                  key={c.id}
                  onMouseEnter={() => setHoveredCandidate(c.id)}
                  onMouseLeave={() => setHoveredCandidate(null)}
                  style={{
                    ...hoverStyle,
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[2],
                    padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                    borderRadius: tokens.borderRadius.md,
                    backgroundColor: hoveredCandidate === c.id ? `${color.stroke}10` : 'transparent',
                    transform: hoveredCandidate === c.id ? tokens.motion.transform : 'none',
                  }}
                >
                  <Box style={{
                    width: 12,
                    height: 12,
                    borderRadius: tokens.borderRadius.full,
                    backgroundColor: color.stroke,
                  }} />
                  <Box style={{
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.medium,
                    color: tokens.colors.neutral[700],
                  }}>
                    {c.name} ({c.overallScore})
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      );
    };

    /* ================================================================ */
    /*  RENDER: Side-by-Side Cards                                        */
    /* ================================================================ */
    const renderSideBySide = () => {
      if (comparedCandidates.length === 0) return null;

      return (
        <Box style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${Math.min(comparedCandidates.length, 3)}, 1fr)`,
          gap: tokens.spacing[4],
          marginBottom: tokens.spacing[4],
        }}>
          {comparedCandidates.map((candidate, idx) => {
            const color = CANDIDATE_OVERLAY_COLORS[idx % CANDIDATE_OVERLAY_COLORS.length];
            const rankColors = getRankBadgeColors(candidate.rank, tokens);
            const decisionColors = getDecisionColors(candidate.decisionStatus, tokens);
            const candidateDecision = decisions[candidate.id];

            return (
              <Box key={candidate.id} style={{
                ...cardBase,
                ...glassCard,
                padding: tokens.spacing[4],
                borderTop: `3px solid ${color.stroke}`,
              }}>
                {/* Candidate header */}
                <Box style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[3],
                  marginBottom: tokens.spacing[3],
                }}>
                  <Box style={{
                    width: 44,
                    height: 44,
                    borderRadius: tokens.borderRadius.full,
                    backgroundColor: tokens.colors.primaryScale[100],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    flexShrink: 0,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${color.stroke}`,
                  }}>
                    {candidate.avatar ? (
                      <img src={candidate.avatar} alt={candidate.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Box style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.primaryScale[600] }}>
                        {getCandidateInitials(candidate.name)}
                      </Box>
                    )}
                  </Box>
                  <Box style={{ flex: 1, minWidth: 0 }}>
                    <Box style={{
                      fontSize: tokens.typography.fontSize.md,
                      fontWeight: tokens.typography.fontWeight.bold,
                      color: tokens.colors.neutral[900],
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap' as const,
                    }}>
                      {candidate.name}
                    </Box>
                    <Box style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[2],
                      marginTop: 2,
                    }}>
                      <Box style={{
                        ...createBadgeStyle(tokens, 'primary'),
                        padding: `0 ${tokens.spacing[2]}px`,
                      }}>
                        #{candidate.rank}
                      </Box>
                      <Box style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: tokens.spacing[1],
                        padding: `0 ${tokens.spacing[2]}px`,
                        borderRadius: tokens.borderRadius.full,
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: tokens.typography.fontWeight.medium,
                        backgroundColor: decisionColors.bg,
                        color: decisionColors.color,
                        textTransform: 'capitalize' as const,
                      }}>
                        {candidate.decisionStatus}
                      </Box>
                    </Box>
                  </Box>
                </Box>

                {/* Overall score */}
                <Box style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[3],
                  padding: tokens.spacing[3],
                  backgroundColor: tokens.colors.neutral[50],
                  borderRadius: tokens.borderRadius.md,
                  marginBottom: tokens.spacing[3],
                }}>
                  <Box style={{
                    fontSize: tokens.typography.fontSize['3xl'],
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: color.stroke,
                  }}>
                    {candidate.overallScore}
                  </Box>
                  <Box style={{ flex: 1 }}>
                    <Box style={{
                      height: 8,
                      backgroundColor: tokens.colors.neutral[200],
                      borderRadius: tokens.borderRadius.full,
                      overflow: 'hidden',
                    }}>
                      <Box style={{
                        width: `${candidate.overallScore}%`,
                        height: '100%',
                        backgroundColor: color.stroke,
                        borderRadius: tokens.borderRadius.full,
                      }} />
                    </Box>
                    <Box style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[500],
                      marginTop: 2,
                    }}>
                      {candidate.completionPercent}% complete
                      {candidate.hasKnockout && (
                        <span style={{ color: tokens.colors.errorScale[600], marginLeft: tokens.spacing[2] }}>
                          <Flag size={10} style={{ display: 'inline', verticalAlign: 'middle' }} /> KO
                        </span>
                      )}
                    </Box>
                  </Box>
                </Box>

                {/* Stage scores */}
                <Box style={{ marginBottom: tokens.spacing[3] }}>
                  <Box style={{
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[500],
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.05em',
                    marginBottom: tokens.spacing[2],
                  }}>
                    Stages
                  </Box>
                  {candidate.stageScores.map(ss => (
                    <Box key={ss.stage} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[2],
                      padding: `2px 0`,
                    }}>
                      <Box style={{
                        flex: 1,
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[600],
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap' as const,
                      }}>
                        {ss.stage}
                      </Box>
                      <Box style={{
                        width: 60,
                        height: 5,
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
                        minWidth: 24,
                        textAlign: 'right' as const,
                      }}>
                        {ss.score}
                      </Box>
                    </Box>
                  ))}
                </Box>

                {/* Strengths */}
                <Box style={{
                  padding: tokens.spacing[2],
                  backgroundColor: tokens.colors.successScale[50],
                  borderRadius: tokens.borderRadius.md,
                  marginBottom: tokens.spacing[2],
                }}>
                  <Box style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[1],
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.successScale[700],
                    marginBottom: tokens.spacing[1],
                  }}>
                    <TrendingUp size={10} />
                    Strengths
                  </Box>
                  {candidate.strengths.map((s, i) => (
                    <Box key={i} style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[600],
                      padding: `1px 0`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[1],
                    }}>
                      <Check size={8} color={tokens.colors.successScale[500]} />
                      {s}
                    </Box>
                  ))}
                </Box>

                {/* Weaknesses */}
                <Box style={{
                  padding: tokens.spacing[2],
                  backgroundColor: tokens.colors.errorScale[50],
                  borderRadius: tokens.borderRadius.md,
                  marginBottom: tokens.spacing[3],
                }}>
                  <Box style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[1],
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.errorScale[700],
                    marginBottom: tokens.spacing[1],
                  }}>
                    <TrendingDown size={10} />
                    Weaknesses
                  </Box>
                  {candidate.weaknesses.map((w, i) => (
                    <Box key={i} style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[600],
                      padding: `1px 0`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[1],
                    }}>
                      <AlertTriangle size={8} color={tokens.colors.errorScale[500]} />
                      {w}
                    </Box>
                  ))}
                </Box>

                {/* Decision actions */}
                <Box style={{
                  display: 'flex',
                  gap: tokens.spacing[2],
                  paddingTop: tokens.spacing[2],
                  borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                }}>
                  {(['advance', 'reject', 'hold'] as DecisionAction[]).map(action => {
                    const actionColors = getDecisionActionColors(action, tokens);
                    const isActive = candidateDecision === action;
                    const icons: Record<DecisionAction, React.ReactNode> = {
                      advance: <ThumbsUp size={12} />,
                      reject: <ThumbsDown size={12} />,
                      hold: <Pause size={12} />,
                    };
                    const labels: Record<DecisionAction, string> = {
                      advance: 'Advance',
                      reject: 'Reject',
                      hold: 'Hold',
                    };
                    return (
                      <Box
                        key={action}
                        onClick={() => handleDecisionChange(candidate.id, action)}
                        style={{
                          ...hoverStyle,
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: tokens.spacing[1],
                          padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                          borderRadius: tokens.borderRadius.md,
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: isActive ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.medium,
                          backgroundColor: isActive ? actionColors.bg : tokens.colors.neutral[50],
                          color: isActive ? actionColors.color : tokens.colors.neutral[500],
                          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${isActive ? actionColors.border : tokens.colors.neutral[200]}`,
                        }}
                      >
                        {icons[action]}
                        {labels[action]}
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            );
          })}
        </Box>
      );
    };

    /* ================================================================ */
    /*  RENDER: Score Comparison Bars                                      */
    /* ================================================================ */
    const renderScoreComparisonBars = () => {
      if (comparedCandidates.length === 0 || allStages.length === 0) return null;

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
            <Target size={16} color={tokens.colors.primaryScale[500]} />
            Stage-by-Stage Comparison
          </Box>

          {allStages.map(stage => (
            <Box key={stage} style={{ marginBottom: tokens.spacing[3] }}>
              <Box style={{
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[600],
                marginBottom: tokens.spacing[2],
              }}>
                {stage}
              </Box>
              {comparedCandidates.map((c, idx) => {
                const color = CANDIDATE_OVERLAY_COLORS[idx % CANDIDATE_OVERLAY_COLORS.length];
                const score = c.stageScores.find(ss => ss.stage === stage)?.score ?? 0;
                return (
                  <Box key={c.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[2],
                    marginBottom: tokens.spacing[1],
                  }}>
                    <Box style={{
                      width: 80,
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[500],
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap' as const,
                    }}>
                      {c.name}
                    </Box>
                    <Box style={{
                      flex: 1,
                      height: 8,
                      backgroundColor: tokens.colors.neutral[100],
                      borderRadius: tokens.borderRadius.full,
                      overflow: 'hidden',
                    }}>
                      <Box style={{
                        width: `${score}%`,
                        height: '100%',
                        backgroundColor: color.stroke,
                        borderRadius: tokens.borderRadius.full,
                        transition: `width ${tokens.transitions?.normal || tokens.motion.hover}`,
                      }} />
                    </Box>
                    <Box style={{
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.bold,
                      color: tokens.colors.neutral[700],
                      minWidth: 24,
                      textAlign: 'right' as const,
                    }}>
                      {score}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          ))}
        </Box>
      );
    };

    /* ================================================================ */
    /*  RENDER: Bulk Actions                                              */
    /* ================================================================ */
    const renderBulkActions = () => {
      if (comparedCandidates.length === 0) return null;

      return (
        <Box style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: tokens.spacing[3],
          padding: `${tokens.spacing[4]}px ${tokens.spacing[6]}px`,
          borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
        }}>
          {onBulkAdvance && (
            <Box
              onClick={() => onBulkAdvance(selected)}
              style={{
                ...hoverStyle,
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
                padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                borderRadius: tokens.borderRadius.md,
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.common.white,
                backgroundColor: tokens.colors.successScale[600],
              }}
            >
              <ThumbsUp size={14} />
              Advance All ({comparedCandidates.length})
            </Box>
          )}

          {onBulkReject && (
            <Box
              onClick={() => onBulkReject(selected)}
              style={{
                ...hoverStyle,
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
                padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                borderRadius: tokens.borderRadius.md,
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.common.white,
                backgroundColor: tokens.colors.errorScale[600],
              }}
            >
              <ThumbsDown size={14} />
              Reject All ({comparedCandidates.length})
            </Box>
          )}
        </Box>
      );
    };

    /* ================================================================ */
    /*  RENDER: Empty State                                               */
    /* ================================================================ */
    const renderEmptyState = () => {
      if (comparedCandidates.length > 0) return null;

      return (
        <Box style={{
          display: 'flex',
          flexDirection: 'column' as const,
          alignItems: 'center',
          justifyContent: 'center',
          padding: `${tokens.spacing[8]}px ${tokens.spacing[4]}px`,
          color: tokens.colors.neutral[400],
        }}>
          <Users size={40} color={tokens.colors.neutral[300]} />
          <Box style={{
            fontSize: tokens.typography.fontSize.md,
            fontWeight: tokens.typography.fontWeight.semibold,
            color: tokens.colors.neutral[500],
            marginTop: tokens.spacing[3],
          }}>
            Select Candidates to Compare
          </Box>
          <Box style={{
            fontSize: tokens.typography.fontSize.sm,
            color: tokens.colors.neutral[400],
            marginTop: tokens.spacing[1],
            textAlign: 'center' as const,
          }}>
            Choose 2-5 candidates from the list above to see a visual comparison
          </Box>
        </Box>
      );
    };

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
        {renderHeader()}

        <Box style={{ padding: `${tokens.spacing[5]}px ${tokens.spacing[6]}px` }}>
          {renderCandidateSelector()}
          {renderEmptyState()}
          {renderRadarComparison()}
          {renderSideBySide()}
          {renderScoreComparisonBars()}
        </Box>

        {renderBulkActions()}
      </Box>
    );
  },
);
