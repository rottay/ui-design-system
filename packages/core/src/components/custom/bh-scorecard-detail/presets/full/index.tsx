'use client';

/**
 * BhScorecardDetail - Full Preset
 * Complete scorecard detail with header, radar chart, dimension table,
 * evidence panel, knockout warnings, confidence factors, override section,
 * cohort comparison, and action buttons
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createBadgeStyle,
  createCardStyle,
  createHoverStyle,
  createPanelHeaderStyle,
  createProgressBarStyle,
  createStatusDotStyle,
  createSurfaceStyle,
  getHoverTransform,
} from '../../../helpers';
import type {
  BhScorecardDetailProps,
  ScorecardDimension,
  DimensionEvidence,
  ScorecardSortBy,
  ScorecardView,
} from '../../core';
import {
  getScoreLevelColors,
  getPassFailColors,
  getScoreGradientColor,
  getConfidenceLabel,
  getConfidenceColor,
} from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  User,
  Briefcase,
  Target,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Shield,
  BarChart3,
  MessageSquareQuote,
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
  Eye,
  Table,
  Hexagon,
  FileText,
  RotateCcw,
  ThumbsUp,
  Edit3,
  AlertOctagon,
  TrendingUp,
  Percent,
  Star,
  Zap,
  Activity,
  Hash,
  Quote,
  Bot,
  Users,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Helper: Sort dimensions                                             */
/* ------------------------------------------------------------------ */
function sortDimensions(dims: ScorecardDimension[], sortBy: ScorecardSortBy): ScorecardDimension[] {
  const sorted = [...dims];
  switch (sortBy) {
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'score':
      return sorted.sort((a, b) => b.score - a.score);
    case 'weight':
      return sorted.sort((a, b) => b.weight - a.weight);
    case 'confidence':
      return sorted.sort((a, b) => b.confidence - a.confidence);
    case 'evidence':
      return sorted.sort((a, b) => b.evidenceCount - a.evidenceCount);
    default:
      return sorted;
  }
}

/* ------------------------------------------------------------------ */
/*  Helper: Radar chart point computation                               */
/* ------------------------------------------------------------------ */
function computeRadarPoints(dimensions: ScorecardDimension[], radius: number, cx: number, cy: number): string {
  const count = dimensions.length;
  if (count === 0) return '';
  return dimensions
    .map((dim, i) => {
      const angle = (Math.PI * 2 * i) / count - Math.PI / 2;
      const r = (dim.score / 100) * radius;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      return `${x},${y}`;
    })
    .join(' ');
}

function computeIdealPoints(dimensions: ScorecardDimension[], radius: number, cx: number, cy: number): string {
  const count = dimensions.length;
  if (count === 0) return '';
  return dimensions
    .map((_, i) => {
      const angle = (Math.PI * 2 * i) / count - Math.PI / 2;
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);
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

/* ------------------------------------------------------------------ */
/*  Full Preset                                                         */
/* ------------------------------------------------------------------ */
export const FullBhScorecardDetail = createPreset<BhScorecardDetailProps>(
  'BhScorecardDetail.Full',
  ({ primitives, props, tokens, engine }: PresetContext<BhScorecardDetailProps>) => {
    const { Box } = primitives;
    const isModern = engine === 'modern';

    const {
      header,
      dimensions,
      selectedDimension: selectedDimensionProp,
      evidence = [],
      overrideInfo,
      cohortComparison,
      onDimensionSelect,
      onApprove,
      onOverride,
      onRequestRescore,
      onSubmitAppeal,
      showOverrideForm: showOverrideFormProp,
      onOverrideFormToggle,
      overrideReason: overrideReasonProp,
      onOverrideReasonChange,
      sortBy: sortByProp,
      onSortChange,
      activeView: activeViewProp,
      className,
      style,
    } = props;

    /* ---- internal state ---- */
    const [internalExpandedDim, setInternalExpandedDim] = useState<string | null>(null);
    const [internalShowOverride, setInternalShowOverride] = useState(false);
    const [internalOverrideReason, setInternalOverrideReason] = useState('');
    const [internalShowCompare, setInternalShowCompare] = useState(false);
    const [internalSelectedEvidence, setInternalSelectedEvidence] = useState<number | null>(null);
    const [internalSortBy, setInternalSortBy] = useState<ScorecardSortBy>('score');
    const [internalActiveView, setInternalActiveView] = useState<ScorecardView>('table');

    const selectedDimension = selectedDimensionProp ?? internalExpandedDim;
    const showOverride = showOverrideFormProp ?? internalShowOverride;
    const overrideReason = overrideReasonProp ?? internalOverrideReason;
    const sortBy = sortByProp ?? internalSortBy;
    const activeView = activeViewProp ?? internalActiveView;

    const handleDimensionSelect = (id: string) => {
      onDimensionSelect?.(id);
      setInternalExpandedDim(prev => (prev === id ? null : id));
    };

    const handleSortChange = (field: ScorecardSortBy) => {
      onSortChange?.(field);
      setInternalSortBy(field);
    };

    const handleOverrideToggle = (show: boolean) => {
      onOverrideFormToggle?.(show);
      setInternalShowOverride(show);
    };

    const handleOverrideReasonChange = (reason: string) => {
      onOverrideReasonChange?.(reason);
      setInternalOverrideReason(reason);
    };

    const handleViewChange = (view: ScorecardView) => {
      setInternalActiveView(view);
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

    /* ---- sorted dimensions ---- */
    const sortedDimensions = useMemo(() => sortDimensions(dimensions, sortBy), [dimensions, sortBy]);

    /* ---- knockout dimensions ---- */
    const knockoutDimensions = dimensions.filter(d => d.isKnockout && d.knockoutTriggered);
    const hasKnockout = knockoutDimensions.length > 0;

    /* ---- level/pass-fail colors ---- */
    const levelColors = getScoreLevelColors(header.overallLevel, tokens);
    const passFailColors = getPassFailColors(header.passFail, tokens);

    /* ---- radar chart config ---- */
    const radarSize = 280;
    const radarCenter = radarSize / 2;
    const radarRadius = radarSize / 2 - 40;

    /* ================================================================ */
    /*  RENDER: Score Ring SVG                                            */
    /* ================================================================ */
    const renderScoreRing = () => {
      const size = 96;
      const strokeWidth = 8;
      const radius = (size - strokeWidth) / 2;
      const circumference = 2 * Math.PI * radius;
      const progress = (header.overallScore / 100) * circumference;

      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={tokens.colors.neutral[100]}
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={levelColors.ring}
            strokeWidth={strokeWidth}
            strokeDasharray={`${progress} ${circumference - progress}`}
            strokeDashoffset={circumference / 4}
            strokeLinecap="round"
            style={{ transition: `stroke-dasharray ${tokens.motion.hover}` }}
          />
          <text
            x={size / 2}
            y={size / 2 - 6}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={tokens.colors.neutral[900]}
            fontSize={tokens.typography.fontSize['2xl']}
            fontWeight={tokens.typography.fontWeight.bold}
          >
            {header.overallScore}
          </text>
          <text
            x={size / 2}
            y={size / 2 + 14}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={tokens.colors.neutral[500]}
            fontSize={tokens.typography.fontSize.xs}
          >
            / 100
          </text>
        </svg>
      );
    };

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
        gap: tokens.spacing[5],
        flexWrap: 'wrap' as const,
      }}>
        {/* Left: Avatar + Info */}
        <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[4], flex: 1, minWidth: 0 }}>
          {/* Avatar */}
          <Box style={{
            width: 56,
            height: 56,
            borderRadius: tokens.borderRadius.full,
            backgroundColor: tokens.colors.primaryScale[100],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            flexShrink: 0,
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[200]}`,
          }}>
            {header.candidateAvatar ? (
              <img
                src={header.candidateAvatar}
                alt={header.candidateName}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <User size={24} color={tokens.colors.primaryScale[600]} />
            )}
          </Box>

          <Box style={{ minWidth: 0 }}>
            <Box style={{
              fontSize: tokens.typography.fontSize.xl,
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
              lineHeight: tokens.typography.lineHeight.tight,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap' as const,
            }}>
              {header.candidateName}
            </Box>
            <Box style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[3],
              marginTop: tokens.spacing[1],
              flexWrap: 'wrap' as const,
            }}>
              <Box style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[600],
              }}>
                <Briefcase size={14} color={tokens.colors.neutral[400]} />
                {header.jobTitle}
              </Box>
              <Box style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[600],
              }}>
                <Target size={14} color={tokens.colors.neutral[400]} />
                {header.stageName}
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Center: Score Ring */}
        <Box style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing[4],
        }}>
          {renderScoreRing()}

          <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2] }}>
            {/* Level Badge */}
            <Box style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
              borderRadius: tokens.borderRadius.full,
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.semibold,
              backgroundColor: levelColors.bg,
              color: levelColors.color,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${levelColors.border}`,
              textTransform: 'capitalize' as const,
            }}>
              <Star size={12} />
              {header.overallLevel}
            </Box>

            {/* Pass/Fail Indicator */}
            <Box style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
              borderRadius: tokens.borderRadius.full,
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.semibold,
              backgroundColor: passFailColors.bg,
              color: passFailColors.color,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${passFailColors.border}`,
              textTransform: 'uppercase' as const,
            }}>
              {header.passFail === 'pass' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
              {header.passFail}
            </Box>

            {/* Confidence Meter */}
            <Box style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[2],
            }}>
              <Box style={{
                width: 80,
                height: 6,
                backgroundColor: tokens.colors.neutral[100],
                borderRadius: tokens.borderRadius.full,
                overflow: 'hidden',
              }}>
                <Box style={{
                  width: `${header.confidence * 100}%`,
                  height: '100%',
                  backgroundColor: getConfidenceColor(header.confidence, tokens),
                  borderRadius: tokens.borderRadius.full,
                  transition: `width ${tokens.transitions?.normal || tokens.motion.hover}`,
                }} />
              </Box>
              <Box style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[500],
              }}>
                {Math.round(header.confidence * 100)}%
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    );

    /* ================================================================ */
    /*  RENDER: Radar Chart                                               */
    /* ================================================================ */
    const renderRadarChart = () => {
      const dimCount = dimensions.length;
      if (dimCount < 3) return null;

      const gridLevels = [0.25, 0.5, 0.75, 1.0];
      const actualPoints = computeRadarPoints(dimensions, radarRadius, radarCenter, radarCenter);
      const idealPoints = computeIdealPoints(dimensions, radarRadius, radarCenter, radarCenter);

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
            Score Radar
          </Box>

          <Box style={{ display: 'flex', justifyContent: 'center' }}>
            <svg width={radarSize} height={radarSize} viewBox={`0 0 ${radarSize} ${radarSize}`}>
              {/* Grid polygons */}
              {gridLevels.map((level) => (
                <polygon
                  key={level}
                  points={computeGridPoints(level, dimCount, radarRadius, radarCenter, radarCenter)}
                  fill="none"
                  stroke={tokens.colors.neutral[200]}
                  strokeWidth={1}
                />
              ))}

              {/* Axis lines */}
              {dimensions.map((_, i) => {
                const angle = (Math.PI * 2 * i) / dimCount - Math.PI / 2;
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

              {/* Ideal polygon (dashed) */}
              <polygon
                points={idealPoints}
                fill="none"
                stroke={tokens.colors.neutral[300]}
                strokeWidth={1.5}
                strokeDasharray="6,4"
              />

              {/* Actual polygon */}
              <polygon
                points={actualPoints}
                fill={`${tokens.colors.primaryScale[500]}20`}
                stroke={tokens.colors.primaryScale[500]}
                strokeWidth={2}
              />

              {/* Dimension dots */}
              {dimensions.map((dim, i) => {
                const angle = (Math.PI * 2 * i) / dimCount - Math.PI / 2;
                const r = (dim.score / 100) * radarRadius;
                const x = radarCenter + r * Math.cos(angle);
                const y = radarCenter + r * Math.sin(angle);
                return (
                  <circle
                    key={dim.id}
                    cx={x}
                    cy={y}
                    r={4}
                    fill={tokens.colors.common.white}
                    stroke={getScoreGradientColor(dim.score, tokens)}
                    strokeWidth={2}
                  />
                );
              })}

              {/* Labels */}
              {dimensions.map((dim, i) => {
                const angle = (Math.PI * 2 * i) / dimCount - Math.PI / 2;
                const labelRadius = radarRadius + 24;
                const x = radarCenter + labelRadius * Math.cos(angle);
                const y = radarCenter + labelRadius * Math.sin(angle);
                return (
                  <text
                    key={dim.id}
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={tokens.colors.neutral[600]}
                    fontSize={tokens.typography.fontSize.xs}
                    fontWeight={tokens.typography.fontWeight.medium}
                  >
                    {dim.name.length > 12 ? dim.name.slice(0, 10) + '...' : dim.name}
                  </text>
                );
              })}
            </svg>
          </Box>
        </Box>
      );
    };

    /* ================================================================ */
    /*  RENDER: View Tabs                                                 */
    /* ================================================================ */
    const renderViewTabs = () => {
      const views: { key: ScorecardView; label: string; icon: React.ReactNode }[] = [
        { key: 'table', label: 'Table', icon: <Table size={14} /> },
        { key: 'radar', label: 'Radar', icon: <Hexagon size={14} /> },
        { key: 'detail', label: 'Detail', icon: <Eye size={14} /> },
      ];

      return (
        <Box style={{
          display: 'flex',
          gap: tokens.spacing[1],
          padding: tokens.spacing[1],
          backgroundColor: tokens.colors.neutral[100],
          borderRadius: tokens.borderRadius.md,
          marginBottom: tokens.spacing[4],
        }}>
          {views.map(v => (
            <Box
              key={v.key}
              onClick={() => handleViewChange(v.key)}
              style={{
                ...hoverStyle,
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: activeView === v.key ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.medium,
                color: activeView === v.key ? tokens.colors.primaryScale[700] : tokens.colors.neutral[600],
                backgroundColor: activeView === v.key ? tokens.colors.common.white : 'transparent',
                boxShadow: activeView === v.key ? tokens.shadows.sm : 'none',
              }}
            >
              {v.icon}
              {v.label}
            </Box>
          ))}
        </Box>
      );
    };

    /* ================================================================ */
    /*  RENDER: Sort Header                                               */
    /* ================================================================ */
    const renderSortHeader = () => {
      const sortOptions: { key: ScorecardSortBy; label: string }[] = [
        { key: 'name', label: 'Name' },
        { key: 'score', label: 'Score' },
        { key: 'weight', label: 'Weight' },
        { key: 'confidence', label: 'Confidence' },
        { key: 'evidence', label: 'Evidence' },
      ];

      return (
        <Box style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing[2],
          marginBottom: tokens.spacing[3],
        }}>
          <ArrowUpDown size={14} color={tokens.colors.neutral[400]} />
          <Box style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
            Sort by:
          </Box>
          {sortOptions.map(opt => (
            <Box
              key={opt.key}
              onClick={() => handleSortChange(opt.key)}
              style={{
                ...hoverStyle,
                padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                borderRadius: tokens.borderRadius.md,
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: sortBy === opt.key ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal,
                color: sortBy === opt.key ? tokens.colors.primaryScale[700] : tokens.colors.neutral[500],
                backgroundColor: sortBy === opt.key ? tokens.colors.primaryScale[50] : 'transparent',
              }}
            >
              {opt.label}
            </Box>
          ))}
        </Box>
      );
    };

    /* ================================================================ */
    /*  RENDER: Dimension Row                                             */
    /* ================================================================ */
    const renderDimensionRow = (dim: ScorecardDimension) => {
      const isSelected = selectedDimension === dim.id;
      const scoreColor = getScoreGradientColor(dim.score, tokens);
      const confColor = getConfidenceColor(dim.confidence, tokens);

      return (
        <Box key={dim.id}>
          <Box
            onClick={() => handleDimensionSelect(dim.id)}
            style={{
              ...hoverStyle,
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[3],
              padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
              borderRadius: tokens.borderRadius.md,
              backgroundColor: isSelected ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${isSelected ? tokens.colors.primaryScale[200] : tokens.colors.neutral[100]}`,
              marginBottom: tokens.spacing[2],
            }}
          >
            {/* Expand chevron */}
            <Box style={{ flexShrink: 0, color: tokens.colors.neutral[400] }}>
              {isSelected ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </Box>

            {/* Dimension name */}
            <Box style={{
              flex: 1,
              minWidth: 0,
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
              color: tokens.colors.neutral[800],
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap' as const,
            }}>
              {dim.name}
            </Box>

            {/* Score bar */}
            <Box style={{ width: 120, display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              <Box style={{
                flex: 1,
                height: 8,
                backgroundColor: tokens.colors.neutral[100],
                borderRadius: tokens.borderRadius.full,
                overflow: 'hidden',
              }}>
                <Box style={{
                  width: `${dim.score}%`,
                  height: '100%',
                  backgroundColor: scoreColor,
                  borderRadius: tokens.borderRadius.full,
                  transition: `width ${tokens.transitions?.normal || tokens.motion.hover}`,
                }} />
              </Box>
              <Box style={{
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[700],
                minWidth: 28,
                textAlign: 'right' as const,
              }}>
                {dim.score}
              </Box>
            </Box>

            {/* Weight badge */}
            <Box style={{
              ...createBadgeStyle(tokens, 'secondary'),
              minWidth: 40,
              justifyContent: 'center',
            }}>
              {dim.weight}%
            </Box>

            {/* Confidence dot */}
            <Box style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
            }}>
              <Box style={{
                width: 8,
                height: 8,
                borderRadius: tokens.borderRadius.full,
                backgroundColor: confColor,
              }} />
              <Box style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[500],
                minWidth: 32,
              }}>
                {Math.round(dim.confidence * 100)}%
              </Box>
            </Box>

            {/* Knockout flag */}
            {dim.isKnockout && (
              <Box style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                borderRadius: tokens.borderRadius.md,
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.semibold,
                backgroundColor: dim.knockoutTriggered ? tokens.colors.errorScale[100] : tokens.colors.neutral[100],
                color: dim.knockoutTriggered ? tokens.colors.errorScale[700] : tokens.colors.neutral[500],
              }}>
                <AlertOctagon size={10} />
                KO
              </Box>
            )}

            {/* Evidence count badge */}
            <Box style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
              borderRadius: tokens.borderRadius.md,
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.neutral[500],
              backgroundColor: tokens.colors.neutral[50],
            }}>
              <MessageSquareQuote size={10} />
              {dim.evidenceCount}
            </Box>
          </Box>

          {/* Expanded detail */}
          {isSelected && renderDimensionDetail()}
        </Box>
      );
    };

    /* ================================================================ */
    /*  RENDER: Dimension Detail (Expanded)                               */
    /* ================================================================ */
    const renderDimensionDetail = () => {
      if (evidence.length === 0) {
        return (
          <Box style={{
            padding: `${tokens.spacing[3]}px ${tokens.spacing[5]}px`,
            marginBottom: tokens.spacing[2],
            fontSize: tokens.typography.fontSize.sm,
            color: tokens.colors.neutral[400],
            fontStyle: 'italic',
          }}>
            No evidence available for this dimension.
          </Box>
        );
      }

      return (
        <Box style={{
          padding: `${tokens.spacing[3]}px ${tokens.spacing[5]}px`,
          marginLeft: tokens.spacing[6],
          marginBottom: tokens.spacing[3],
          borderLeft: `3px solid ${tokens.colors.primaryScale[200]}`,
        }}>
          {evidence.map((ev, idx) => (
            <Box key={idx} style={{ marginBottom: tokens.spacing[4] }}>
              {/* Evidence quote */}
              <Box style={{
                padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                backgroundColor: tokens.colors.neutral[50],
                borderLeft: `4px solid ${tokens.colors.primaryScale[300]}`,
                borderRadius: `0 ${tokens.borderRadius.md} ${tokens.borderRadius.md} 0`,
                marginBottom: tokens.spacing[2],
              }}>
                <Box style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[700],
                  fontStyle: 'italic',
                  lineHeight: tokens.typography.lineHeight.relaxed,
                }}>
                  <Quote size={14} color={tokens.colors.neutral[300]} style={{ display: 'inline', marginRight: tokens.spacing[1] }} />
                  {ev.quote}
                </Box>
                <Box style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                  marginTop: tokens.spacing[2],
                }}>
                  <Box style={{
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.primaryScale[600],
                  }}>
                    {ev.speaker}
                  </Box>
                  <Box style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[400],
                  }}>
                    Turn {ev.turnRef}
                  </Box>
                </Box>
              </Box>

              {/* AI Reasoning */}
              <Box style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: tokens.spacing[2],
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                backgroundColor: tokens.colors.primaryScale[50],
                borderRadius: tokens.borderRadius.md,
              }}>
                <Bot size={14} color={tokens.colors.primaryScale[500]} style={{ flexShrink: 0, marginTop: 2 }} />
                <Box style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[600],
                  lineHeight: tokens.typography.lineHeight.relaxed,
                }}>
                  {ev.aiReasoning}
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      );
    };

    /* ================================================================ */
    /*  RENDER: Dimension Table                                           */
    /* ================================================================ */
    const renderDimensionTable = () => (
      <Box style={{
        ...cardBase,
        ...glassCard,
        padding: tokens.spacing[4],
        marginBottom: tokens.spacing[4],
      }}>
        <Box style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: tokens.spacing[3],
        }}>
          <Box style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[2],
            fontSize: tokens.typography.fontSize.sm,
            fontWeight: tokens.typography.fontWeight.semibold,
            color: tokens.colors.neutral[700],
          }}>
            <BarChart3 size={16} color={tokens.colors.primaryScale[500]} />
            Dimension Breakdown
          </Box>
          <Box style={{
            fontSize: tokens.typography.fontSize.xs,
            color: tokens.colors.neutral[400],
          }}>
            {dimensions.length} dimensions
          </Box>
        </Box>

        {renderSortHeader()}

        {sortedDimensions.map(dim => renderDimensionRow(dim))}
      </Box>
    );

    /* ================================================================ */
    /*  RENDER: Knockout Section                                          */
    /* ================================================================ */
    const renderKnockoutSection = () => {
      if (!hasKnockout) return null;

      return (
        <Box style={{
          padding: tokens.spacing[4],
          backgroundColor: tokens.colors.errorScale[50],
          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.errorScale[200]}`,
          borderRadius: tokens.borderRadius.lg,
          marginBottom: tokens.spacing[4],
        }}>
          <Box style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[2],
            marginBottom: tokens.spacing[3],
          }}>
            <AlertTriangle size={18} color={tokens.colors.errorScale[600]} />
            <Box style={{
              fontSize: tokens.typography.fontSize.md,
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.errorScale[800],
            }}>
              Knockout Criteria Triggered
            </Box>
          </Box>

          {knockoutDimensions.map(dim => (
            <Box key={dim.id} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
              backgroundColor: tokens.colors.common.white,
              borderRadius: tokens.borderRadius.md,
              marginBottom: tokens.spacing[2],
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.errorScale[200]}`,
            }}>
              <Box style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
              }}>
                <AlertOctagon size={16} color={tokens.colors.errorScale[500]} />
                <Box style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.errorScale[800],
                }}>
                  {dim.name}
                </Box>
              </Box>
              <Box style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[3],
              }}>
                <Box style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[500],
                }}>
                  Score: {dim.score} / Weight: {dim.weight}%
                </Box>
                <Box style={{
                  ...createBadgeStyle(tokens, 'error'),
                }}>
                  Below Threshold
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      );
    };

    /* ================================================================ */
    /*  RENDER: Confidence Factors                                        */
    /* ================================================================ */
    const renderConfidenceFactors = () => {
      const factors = [
        {
          label: 'Evidence Quality',
          value: Math.round(header.confidence * 100),
          icon: <MessageSquareQuote size={16} />,
          color: tokens.colors.primaryScale[500],
          description: 'Based on the quality and specificity of interview evidence',
        },
        {
          label: 'Response Completeness',
          value: Math.min(100, Math.round(header.confidence * 100 + 5)),
          icon: <FileText size={16} />,
          color: tokens.colors.infoScale[500],
          description: 'Coverage of all scoring dimensions with sufficient data',
        },
        {
          label: 'Consistency',
          value: Math.max(0, Math.round(header.confidence * 100 - 3)),
          icon: <Activity size={16} />,
          color: tokens.colors.successScale[500],
          description: 'Cross-dimension and cross-evidence consistency score',
        },
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
            marginBottom: tokens.spacing[3],
            fontSize: tokens.typography.fontSize.sm,
            fontWeight: tokens.typography.fontWeight.semibold,
            color: tokens.colors.neutral[700],
          }}>
            <Shield size={16} color={tokens.colors.primaryScale[500]} />
            Confidence Factors
          </Box>

          <Box style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: tokens.spacing[3],
          }}>
            {factors.map((factor) => (
              <Box key={factor.label} style={{
                padding: tokens.spacing[3],
                backgroundColor: tokens.colors.neutral[50],
                borderRadius: tokens.borderRadius.md,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
              }}>
                <Box style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: tokens.spacing[2],
                }}>
                  <Box style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[2],
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[700],
                  }}>
                    <Box style={{ color: factor.color }}>{factor.icon}</Box>
                    {factor.label}
                  </Box>
                  <Box style={{
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: tokens.colors.neutral[800],
                  }}>
                    {factor.value}%
                  </Box>
                </Box>

                <Box style={{
                  height: 4,
                  backgroundColor: tokens.colors.neutral[200],
                  borderRadius: tokens.borderRadius.full,
                  overflow: 'hidden',
                  marginBottom: tokens.spacing[2],
                }}>
                  <Box style={{
                    width: `${factor.value}%`,
                    height: '100%',
                    backgroundColor: factor.color,
                    borderRadius: tokens.borderRadius.full,
                    transition: `width ${tokens.transitions?.normal || tokens.motion.hover}`,
                  }} />
                </Box>

                <Box style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[400],
                  lineHeight: tokens.typography.lineHeight.relaxed,
                }}>
                  {factor.description}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      );
    };

    /* ================================================================ */
    /*  RENDER: Override Section                                           */
    /* ================================================================ */
    const renderOverrideSection = () => {
      if (!overrideInfo) return null;

      return (
        <Box style={{
          ...cardBase,
          ...glassCard,
          padding: tokens.spacing[4],
          marginBottom: tokens.spacing[4],
          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.warningScale[200]}`,
        }}>
          <Box style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[2],
            marginBottom: tokens.spacing[3],
          }}>
            <Edit3 size={16} color={tokens.colors.warningScale[600]} />
            <Box style={{
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.warningScale[800],
            }}>
              Score Override Applied
            </Box>
          </Box>

          <Box style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[4],
            marginBottom: tokens.spacing[3],
          }}>
            {/* Original score */}
            <Box style={{
              padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
              backgroundColor: tokens.colors.errorScale[50],
              borderRadius: tokens.borderRadius.md,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.errorScale[200]}`,
              textDecoration: 'line-through',
            }}>
              <Box style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[500],
                marginBottom: 2,
              }}>
                Original
              </Box>
              <Box style={{
                fontSize: tokens.typography.fontSize.lg,
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.errorScale[600],
              }}>
                {overrideInfo.originalScore}
              </Box>
            </Box>

            {/* Arrow */}
            <Box style={{ color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.lg }}>
              {'\u2192'}
            </Box>

            {/* Override score */}
            <Box style={{
              padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
              backgroundColor: tokens.colors.successScale[50],
              borderRadius: tokens.borderRadius.md,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.successScale[200]}`,
            }}>
              <Box style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[500],
                marginBottom: 2,
              }}>
                Override
              </Box>
              <Box style={{
                fontSize: tokens.typography.fontSize.lg,
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.successScale[700],
              }}>
                {overrideInfo.overrideScore}
              </Box>
            </Box>

            {/* Reviewer info */}
            <Box style={{ flex: 1 }}>
              <Box style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[500],
                marginBottom: tokens.spacing[1],
              }}>
                Overridden by
              </Box>
              <Box style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[800],
              }}>
                {overrideInfo.reviewerName}
              </Box>
            </Box>
          </Box>

          {/* Reasoning */}
          <Box style={{
            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
            backgroundColor: tokens.colors.neutral[50],
            borderRadius: tokens.borderRadius.md,
            fontSize: tokens.typography.fontSize.sm,
            color: tokens.colors.neutral[600],
            lineHeight: tokens.typography.lineHeight.relaxed,
            borderLeft: `3px solid ${tokens.colors.warningScale[300]}`,
          }}>
            {overrideInfo.reasoning}
          </Box>
        </Box>
      );
    };

    /* ================================================================ */
    /*  RENDER: Cohort Comparison                                         */
    /* ================================================================ */
    const renderCohortComparison = () => {
      if (!cohortComparison) return null;

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
            <Users size={16} color={tokens.colors.primaryScale[500]} />
            Cohort Comparison
          </Box>

          <Box style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[4],
            marginBottom: tokens.spacing[3],
          }}>
            <Box style={{
              fontSize: tokens.typography.fontSize['3xl'],
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.primaryScale[600],
            }}>
              P{cohortComparison.percentile}
            </Box>
            <Box style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[500],
            }}>
              out of {cohortComparison.totalInCohort} candidates
            </Box>
          </Box>

          {/* Percentile bar */}
          <Box style={{
            position: 'relative' as const,
            height: 24,
            backgroundColor: tokens.colors.neutral[100],
            borderRadius: tokens.borderRadius.full,
            overflow: 'hidden',
          }}>
            <Box style={{
              position: 'absolute' as const,
              left: 0,
              top: 0,
              height: '100%',
              width: `${cohortComparison.percentile}%`,
              background: `linear-gradient(90deg, ${tokens.colors.primaryScale[200]}, ${tokens.colors.primaryScale[500]})`,
              borderRadius: tokens.borderRadius.full,
              transition: `width ${tokens.transitions?.normal || tokens.motion.hover}`,
            }} />
            {/* Position marker */}
            <Box style={{
              position: 'absolute' as const,
              left: `${cohortComparison.percentile}%`,
              top: -4,
              transform: 'translateX(-50%)',
              width: 16,
              height: 32,
              borderRadius: tokens.borderRadius.full,
              backgroundColor: tokens.colors.primaryScale[600],
              border: `3px solid ${tokens.colors.common.white}`,
              boxShadow: tokens.shadows.md,
            }} />
          </Box>

          <Box style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: tokens.spacing[1],
          }}>
            <Box style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>0th</Box>
            <Box style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>50th</Box>
            <Box style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>100th</Box>
          </Box>
        </Box>
      );
    };

    /* ================================================================ */
    /*  RENDER: Override Form                                             */
    /* ================================================================ */
    const renderOverrideForm = () => {
      if (!showOverride) return null;

      return (
        <Box style={{
          ...cardBase,
          padding: tokens.spacing[4],
          marginBottom: tokens.spacing[4],
          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.warningScale[200]}`,
          backgroundColor: tokens.colors.warningScale[50],
        }}>
          <Box style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[2],
            marginBottom: tokens.spacing[3],
            fontSize: tokens.typography.fontSize.sm,
            fontWeight: tokens.typography.fontWeight.semibold,
            color: tokens.colors.warningScale[800],
          }}>
            <Edit3 size={16} />
            Override Score
          </Box>

          <Box style={{ marginBottom: tokens.spacing[3] }}>
            <Box style={{
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.medium,
              color: tokens.colors.neutral[600],
              marginBottom: tokens.spacing[1],
            }}>
              Reason for override
            </Box>
            <textarea
              value={overrideReason}
              onChange={(e) => handleOverrideReasonChange(e.target.value)}
              placeholder="Provide a detailed reason for overriding this score..."
              style={{
                width: '100%',
                minHeight: 80,
                padding: tokens.spacing[3],
                borderRadius: tokens.borderRadius.md,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                fontSize: tokens.typography.fontSize.sm,
                fontFamily: 'inherit',
                color: tokens.colors.neutral[700],
                backgroundColor: tokens.colors.common.white,
                resize: 'vertical' as const,
                outline: 'none',
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

          <Box style={{ display: 'flex', gap: tokens.spacing[2], justifyContent: 'flex-end' }}>
            <Box
              onClick={() => handleOverrideToggle(false)}
              style={{
                ...hoverStyle,
                padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                borderRadius: tokens.borderRadius.md,
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                color: tokens.colors.neutral[600],
                backgroundColor: tokens.colors.neutral[100],
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              }}
            >
              Cancel
            </Box>
            <Box
              onClick={() => {
                onOverride?.(header.overallScore, overrideReason);
                handleOverrideToggle(false);
              }}
              style={{
                ...hoverStyle,
                padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                borderRadius: tokens.borderRadius.md,
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.common.white,
                backgroundColor: tokens.colors.warningScale[600],
              }}
            >
              Submit Override
            </Box>
          </Box>
        </Box>
      );
    };

    /* ================================================================ */
    /*  RENDER: Action Buttons                                            */
    /* ================================================================ */
    const renderActions = () => (
      <Box style={{
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacing[3],
        padding: `${tokens.spacing[4]}px ${tokens.spacing[6]}px`,
        borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
        flexWrap: 'wrap' as const,
      }}>
        {/* Approve */}
        {onApprove && (
          <Box
            onClick={onApprove}
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
              boxShadow: tokens.shadows.sm,
            }}
          >
            <ThumbsUp size={14} />
            Approve
          </Box>
        )}

        {/* Override */}
        {onOverride && (
          <Box
            onClick={() => handleOverrideToggle(!showOverride)}
            style={{
              ...hoverStyle,
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[2],
              padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
              borderRadius: tokens.borderRadius.md,
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
              color: tokens.colors.warningScale[700],
              backgroundColor: tokens.colors.warningScale[50],
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.warningScale[200]}`,
            }}
          >
            <Edit3 size={14} />
            Override
          </Box>
        )}

        {/* Re-score */}
        {onRequestRescore && (
          <Box
            onClick={onRequestRescore}
            style={{
              ...hoverStyle,
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[2],
              padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
              borderRadius: tokens.borderRadius.md,
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
              color: tokens.colors.infoScale[700],
              backgroundColor: tokens.colors.infoScale[50],
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.infoScale[200]}`,
            }}
          >
            <RotateCcw size={14} />
            Re-score
          </Box>
        )}

        {/* Appeal */}
        {onSubmitAppeal && (
          <Box
            onClick={() => onSubmitAppeal(overrideReason)}
            style={{
              ...hoverStyle,
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[2],
              padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
              borderRadius: tokens.borderRadius.md,
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
              color: tokens.colors.warningScale[700],
              backgroundColor: tokens.colors.warningScale[50],
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.warningScale[200]}`,
            }}
          >
            <AlertTriangle size={14} />
            Appeal
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
        {renderHeader()}

        <Box style={{ padding: `${tokens.spacing[5]}px ${tokens.spacing[6]}px` }}>
          {renderViewTabs()}

          {/* Knockout warning at top if triggered */}
          {renderKnockoutSection()}

          {/* Radar chart (shown in radar + detail view) */}
          {(activeView === 'radar' || activeView === 'detail') && renderRadarChart()}

          {/* Dimension table (shown in table + detail view) */}
          {(activeView === 'table' || activeView === 'detail') && renderDimensionTable()}

          {/* Confidence factors */}
          {renderConfidenceFactors()}

          {/* Override info (if exists) */}
          {renderOverrideSection()}

          {/* Override form (if toggled) */}
          {renderOverrideForm()}

          {/* Cohort comparison */}
          {renderCohortComparison()}
        </Box>

        {renderActions()}
      </Box>
    );
  },
);
