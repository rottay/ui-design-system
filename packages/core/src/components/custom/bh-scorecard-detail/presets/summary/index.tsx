'use client';

/**
 * BhScorecardDetail - Summary Preset
 * Compact overview card version showing key scorecard data at a glance
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createSurfaceStyle, createBadgeStyle, createHoverStyle, getHoverTransform } from '../../../helpers';
import type {
  BhScorecardDetailProps,
  ScorecardDimension,
  ScorecardSortBy,
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
  Star,
  AlertOctagon,
  MessageSquareQuote,
  ThumbsUp,
  Edit3,
  RotateCcw,
  Users,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  Zap,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Summary Preset                                                      */
/* ------------------------------------------------------------------ */
export const SummaryBhScorecardDetail = createPreset<BhScorecardDetailProps>(
  'BhScorecardDetail.Summary',
  ({ primitives, props, tokens, engine }: PresetContext<BhScorecardDetailProps>) => {
    const { Box } = primitives;
    const isModern = engine === 'modern';

    const {
      header,
      dimensions,
      overrideInfo,
      cohortComparison,
      onApprove,
      onOverride,
      onRequestRescore,
      onDimensionSelect,
      className,
      style,
    } = props;

    /* ---- internal state ---- */
    const [expanded, setExpanded] = useState(false);
    const [hoveredDim, setHoveredDim] = useState<string | null>(null);

    /* ---- glass support ---- */
    const glassCard = isModern && tokens.glass
      ? {
          backdropFilter: tokens.glass.blur,
          WebkitBackdropFilter: tokens.glass.blur,
          backgroundColor: tokens.glass.bg,
          border: `1px solid ${tokens.glass.border}`,
        }
      : {};

    const cardBase = createCardStyle(tokens, { elevation: 'sm', glass: isModern });
    const hoverStyle = createHoverStyle(tokens);
    const hoverTransform = getHoverTransform(tokens);

    const levelColors = getScoreLevelColors(header.overallLevel, tokens);
    const passFailColors = getPassFailColors(header.passFail, tokens);

    /* ---- knockout check ---- */
    const knockoutDimensions = dimensions.filter(d => d.isKnockout && d.knockoutTriggered);
    const hasKnockout = knockoutDimensions.length > 0;

    /* ---- top / bottom dimensions ---- */
    const sortedByScore = useMemo(() => [...dimensions].sort((a, b) => b.score - a.score), [dimensions]);
    const topDimensions = sortedByScore.slice(0, 3);
    const bottomDimensions = sortedByScore.slice(-3).reverse();

    /* ---- Score ring (compact) ---- */
    const renderCompactRing = () => {
      const size = 64;
      const strokeWidth = 6;
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
            y={size / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={tokens.colors.neutral[900]}
            fontSize={tokens.typography.fontSize.lg}
            fontWeight={tokens.typography.fontWeight.bold}
          >
            {header.overallScore}
          </text>
        </svg>
      );
    };

    /* ---- Mini score bar ---- */
    const renderMiniBar = (dim: ScorecardDimension) => {
      const scoreColor = getScoreGradientColor(dim.score, tokens);
      const isHovered = hoveredDim === dim.id;

      return (
        <Box
          key={dim.id}
          onMouseEnter={() => setHoveredDim(dim.id)}
          onMouseLeave={() => setHoveredDim(null)}
          onClick={() => onDimensionSelect?.(dim.id)}
          style={{
            ...hoverStyle,
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[2],
            padding: `${tokens.spacing[1]}px 0`,
          }}
        >
          <Box style={{
            flex: 1,
            fontSize: tokens.typography.fontSize.xs,
            color: isHovered ? tokens.colors.primaryScale[600] : tokens.colors.neutral[600],
            fontWeight: isHovered ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap' as const,
            minWidth: 0,
            transition: `color ${tokens.motion.hover}`,
          }}>
            {dim.name}
          </Box>
          <Box style={{
            width: 80,
            height: 6,
            backgroundColor: tokens.colors.neutral[100],
            borderRadius: tokens.borderRadius.full,
            overflow: 'hidden',
            flexShrink: 0,
          }}>
            <Box style={{
              width: `${dim.score}%`,
              height: '100%',
              backgroundColor: scoreColor,
              borderRadius: tokens.borderRadius.full,
              transition: `width ${tokens.motion.hover}`,
            }} />
          </Box>
          <Box style={{
            fontSize: tokens.typography.fontSize.xs,
            fontWeight: tokens.typography.fontWeight.semibold,
            color: tokens.colors.neutral[700],
            minWidth: 24,
            textAlign: 'right' as const,
          }}>
            {dim.score}
          </Box>
        </Box>
      );
    };

    /* ================================================================ */
    /*  RENDER: Header Row                                                */
    /* ================================================================ */
    const renderHeaderRow = () => (
      <Box style={{
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacing[4],
        marginBottom: tokens.spacing[4],
      }}>
        {/* Avatar */}
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
          border: `2px solid ${tokens.colors.primaryScale[200]}`,
        }}>
          {header.candidateAvatar ? (
            <img
              src={header.candidateAvatar}
              alt={header.candidateName}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <User size={20} color={tokens.colors.primaryScale[600]} />
          )}
        </Box>

        {/* Name + meta */}
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Box style={{
            fontSize: tokens.typography.fontSize.md,
            fontWeight: tokens.typography.fontWeight.bold,
            color: tokens.colors.neutral[900],
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap' as const,
          }}>
            {header.candidateName}
          </Box>
          <Box style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[2],
            fontSize: tokens.typography.fontSize.xs,
            color: tokens.colors.neutral[500],
            marginTop: 2,
          }}>
            <Briefcase size={12} />
            {header.jobTitle}
            <Box style={{
              width: 3,
              height: 3,
              borderRadius: tokens.borderRadius.full,
              backgroundColor: tokens.colors.neutral[300],
            }} />
            <Target size={12} />
            {header.stageName}
          </Box>
        </Box>

        {/* Score ring */}
        {renderCompactRing()}
      </Box>
    );

    /* ================================================================ */
    /*  RENDER: Badge Row                                                 */
    /* ================================================================ */
    const renderBadgeRow = () => (
      <Box style={{
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacing[2],
        flexWrap: 'wrap' as const,
        marginBottom: tokens.spacing[3],
      }}>
        {/* Level badge */}
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
          <Star size={10} />
          {header.overallLevel}
        </Box>

        {/* Pass/Fail */}
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
          {header.passFail === 'pass' ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
          {header.passFail}
        </Box>

        {/* Confidence */}
        <Box style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: tokens.spacing[1],
          padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
          borderRadius: tokens.borderRadius.full,
          fontSize: tokens.typography.fontSize.xs,
          fontWeight: tokens.typography.fontWeight.medium,
          backgroundColor: tokens.colors.neutral[100],
          color: tokens.colors.neutral[600],
        }}>
          <Shield size={10} />
          {getConfidenceLabel(header.confidence)} ({Math.round(header.confidence * 100)}%)
        </Box>

        {/* Knockout warning */}
        {hasKnockout && (
          <Box style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: tokens.spacing[1],
            padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
            borderRadius: tokens.borderRadius.full,
            fontSize: tokens.typography.fontSize.xs,
            fontWeight: tokens.typography.fontWeight.semibold,
            backgroundColor: tokens.colors.errorScale[100],
            color: tokens.colors.errorScale[700],
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.errorScale[200]}`,
          }}>
            <AlertOctagon size={10} />
            {knockoutDimensions.length} Knockout{knockoutDimensions.length > 1 ? 's' : ''}
          </Box>
        )}

        {/* Override flag */}
        {overrideInfo && (
          <Box style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: tokens.spacing[1],
            padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
            borderRadius: tokens.borderRadius.full,
            fontSize: tokens.typography.fontSize.xs,
            fontWeight: tokens.typography.fontWeight.medium,
            backgroundColor: tokens.colors.warningScale[100],
            color: tokens.colors.warningScale[700],
          }}>
            <Edit3 size={10} />
            Overridden
          </Box>
        )}

        {/* Cohort percentile */}
        {cohortComparison && (
          <Box style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: tokens.spacing[1],
            padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
            borderRadius: tokens.borderRadius.full,
            fontSize: tokens.typography.fontSize.xs,
            fontWeight: tokens.typography.fontWeight.medium,
            backgroundColor: tokens.colors.primaryScale[50],
            color: tokens.colors.primaryScale[700],
          }}>
            <Users size={10} />
            P{cohortComparison.percentile}
          </Box>
        )}
      </Box>
    );

    /* ================================================================ */
    /*  RENDER: Dimensions Summary                                        */
    /* ================================================================ */
    const renderDimensionsSummary = () => {
      const displayDims = expanded ? sortedByScore : sortedByScore.slice(0, 5);

      return (
        <Box style={{ marginBottom: tokens.spacing[3] }}>
          <Box style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: tokens.spacing[2],
          }}>
            <Box style={{
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[500],
              textTransform: 'uppercase' as const,
              letterSpacing: '0.05em',
            }}>
              Dimensions ({dimensions.length})
            </Box>
          </Box>

          {displayDims.map(dim => renderMiniBar(dim))}

          {dimensions.length > 5 && (
            <Box
              onClick={() => setExpanded(!expanded)}
              style={{
                ...hoverStyle,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: tokens.spacing[1],
                padding: `${tokens.spacing[1]}px 0`,
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.primaryScale[600],
                fontWeight: tokens.typography.fontWeight.medium,
                marginTop: tokens.spacing[1],
              }}
            >
              {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              {expanded ? 'Show less' : `Show ${dimensions.length - 5} more`}
            </Box>
          )}
        </Box>
      );
    };

    /* ================================================================ */
    /*  RENDER: Quick Strengths / Weaknesses                              */
    /* ================================================================ */
    const renderTopBottom = () => (
      <Box style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: tokens.spacing[3],
        marginBottom: tokens.spacing[3],
      }}>
        {/* Strengths (top 3) */}
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
            Top Strengths
          </Box>
          {topDimensions.map(dim => (
            <Box key={dim.id} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.neutral[600],
              padding: `2px 0`,
            }}>
              <Box style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap' as const,
                flex: 1,
                minWidth: 0,
              }}>
                {dim.name}
              </Box>
              <Box style={{
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.successScale[700],
                marginLeft: tokens.spacing[2],
              }}>
                {dim.score}
              </Box>
            </Box>
          ))}
        </Box>

        {/* Weaknesses (bottom 3) */}
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
            <AlertTriangle size={12} />
            Areas to Improve
          </Box>
          {bottomDimensions.map(dim => (
            <Box key={dim.id} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.neutral[600],
              padding: `2px 0`,
            }}>
              <Box style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap' as const,
                flex: 1,
                minWidth: 0,
              }}>
                {dim.name}
              </Box>
              <Box style={{
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.errorScale[700],
                marginLeft: tokens.spacing[2],
              }}>
                {dim.score}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    );

    /* ================================================================ */
    /*  RENDER: Compact Actions                                           */
    /* ================================================================ */
    const renderCompactActions = () => (
      <Box style={{
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacing[2],
        paddingTop: tokens.spacing[3],
        borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
      }}>
        {onApprove && (
          <Box
            onClick={onApprove}
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
            Approve
          </Box>
        )}

        {onOverride && (
          <Box
            onClick={() => onOverride(header.overallScore, '')}
            style={{
              ...hoverStyle,
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
              borderRadius: tokens.borderRadius.md,
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.medium,
              color: tokens.colors.warningScale[700],
              backgroundColor: tokens.colors.warningScale[50],
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.warningScale[200]}`,
            }}
          >
            <Edit3 size={12} />
            Override
          </Box>
        )}

        {onRequestRescore && (
          <Box
            onClick={onRequestRescore}
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
            <RotateCcw size={12} />
            Re-score
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
          ...cardBase,
          ...glassCard,
          padding: tokens.spacing[4],
          ...style,
        }}
      >
        {renderHeaderRow()}
        {renderBadgeRow()}
        {renderTopBottom()}
        {renderDimensionsSummary()}
        {renderCompactActions()}
      </Box>
    );
  },
);
