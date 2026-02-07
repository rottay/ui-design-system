'use client';

/**
 * BhInterviewPlayer - Transcript-Only Preset
 * Focused reading mode with header, transcript, and basic scorecard summary
 */

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createSurfaceStyle,
  createBadgeStyle,
  createHoverStyle,
  getHoverTransform,
} from '../../../helpers';
import type {
  BhInterviewPlayerProps,
  TranscriptLine,
  EvidenceHighlight,
  ScorecardDimension,
} from '../../core';
import {
  BH_INTERVIEW_PLAYER_DEFAULTS,
  getLevelColors,
  getInsightCategoryColors,
  formatTime,
  getDimensionScoreColor,
  getDimensionScoreGradient,
} from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  User,
  Bot,
  Clock,
  ChevronDown,
  ChevronRight,
  BarChart3,
  Download,
  Flag,
  CheckCircle,
  RefreshCw,
  Search,
  Shield,
  AlertTriangle,
  X,
} from 'lucide-react';

// ============================================================================
// Score Ring Constants
// ============================================================================

const MINI_RING_SIZE = 56;
const MINI_RING_STROKE = 5;

export const TranscriptOnlyBhInterviewPlayer = createPreset<BhInterviewPlayerProps>({
  name: 'BhInterviewPlayer.TranscriptOnly',
  render: ({ primitives, props, tokens, engine }: PresetContext<BhInterviewPlayerProps>) => {
    const { Box } = primitives;

    const {
      interviewInfo,
      transcript,
      scorecard,
      notes,
      insights,
      audioDuration,
      onApproveScore,
      onRequestRescore,
      onFlagForReview,
      onDownloadTranscript,
      className,
      style,
    } = props;

    // ==================================================================
    // State
    // ==================================================================

    const [expandedScorecard, setExpandedScorecard] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDimension, setSelectedDimension] = useState<string | null>(null);
    const [highlightedEvidence, setHighlightedEvidence] = useState<string | null>(null);
    const [hoveredLine, setHoveredLine] = useState<string | null>(null);
    const [hoveredAction, setHoveredAction] = useState<string | null>(null);

    const transcriptRef = useRef<HTMLDivElement>(null);

    // ==================================================================
    // Derived
    // ==================================================================

    const levelColors = useMemo(() => getLevelColors(tokens), [tokens]);
    const currentLevelColor = levelColors[scorecard.overallLevel];

    const glassEnabled = tokens.surface.useGlass && !!tokens.glass;

    // Filter transcript by search
    const filteredTranscript = useMemo(() => {
      if (!searchQuery.trim()) return transcript;
      const query = searchQuery.toLowerCase();
      return transcript.filter(
        (line) =>
          line.text.toLowerCase().includes(query) ||
          line.speaker.toLowerCase().includes(query),
      );
    }, [transcript, searchQuery]);

    // ==================================================================
    // Styles
    // ==================================================================

    const containerStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: tokens.colors.neutral[50],
      fontFamily: 'inherit',
      overflow: 'hidden',
      ...createSurfaceStyle(tokens, { elevation: 'md', glass: glassEnabled }),
      ...style,
    };

    // ==================================================================
    // Render: Compact Header
    // ==================================================================

    const renderHeader = () => (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing[3],
          padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          backgroundColor: tokens.colors.common.white,
        }}
      >
        {/* Candidate Avatar */}
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: tokens.borderRadius.full,
            backgroundColor: tokens.colors.primaryScale[100],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            flexShrink: 0,
            border: `2px solid ${tokens.colors.primaryScale[200]}`,
          }}
        >
          {interviewInfo.candidateAvatar ? (
            <img
              src={interviewInfo.candidateAvatar}
              alt={interviewInfo.candidateName}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <User size={18} color={tokens.colors.primaryScale[600]} />
          )}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: tokens.typography.fontSize.md,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[900],
              lineHeight: tokens.typography.lineHeight.tight,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {interviewInfo.candidateName}
          </div>
          <div
            style={{
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.neutral[500],
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[2],
            }}
          >
            <span>{interviewInfo.jobTitle}</span>
            <span style={{ color: tokens.colors.neutral[300] }}>|</span>
            <span
              style={{
                ...createBadgeStyle(tokens, 'primary'),
                padding: `0 ${tokens.spacing[2]}px`,
                fontSize: '10px',
                lineHeight: '18px',
              }}
            >
              {interviewInfo.stageName}
            </span>
          </div>
        </div>

        {/* Date + Duration */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[3],
            fontSize: tokens.typography.fontSize.xs,
            color: tokens.colors.neutral[500],
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
            <Clock size={12} color={tokens.colors.neutral[400]} />
            {interviewInfo.date}
          </div>
          <span>{formatTime(interviewInfo.duration)}</span>
        </div>
      </div>
    );

    // ==================================================================
    // Render: Score Summary (collapsible)
    // ==================================================================

    const renderScoreSummary = () => {
      const radius = (MINI_RING_SIZE - MINI_RING_STROKE) / 2;
      const circumference = 2 * Math.PI * radius;
      const scorePercent = scorecard.overallScore / 100;
      const dashOffset = circumference * (1 - scorePercent);

      return (
        <div
          style={{
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            backgroundColor: tokens.colors.common.white,
          }}
        >
          {/* Collapsible header */}
          <button
            onClick={() => setExpandedScorecard((prev) => !prev)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[3],
              width: '100%',
              padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            {/* Mini score ring */}
            <svg
              width={MINI_RING_SIZE}
              height={MINI_RING_SIZE}
              viewBox={`0 0 ${MINI_RING_SIZE} ${MINI_RING_SIZE}`}
              style={{ flexShrink: 0 }}
            >
              <circle
                cx={MINI_RING_SIZE / 2}
                cy={MINI_RING_SIZE / 2}
                r={radius}
                fill="none"
                stroke={tokens.colors.neutral[100]}
                strokeWidth={MINI_RING_STROKE}
              />
              <circle
                cx={MINI_RING_SIZE / 2}
                cy={MINI_RING_SIZE / 2}
                r={radius}
                fill="none"
                stroke={currentLevelColor.ring}
                strokeWidth={MINI_RING_STROKE}
                strokeDasharray={`${circumference}`}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                transform={`rotate(-90 ${MINI_RING_SIZE / 2} ${MINI_RING_SIZE / 2})`}
              />
              <text
                x={MINI_RING_SIZE / 2}
                y={MINI_RING_SIZE / 2}
                textAnchor="middle"
                dominantBaseline="central"
                style={{
                  fontSize: tokens.typography.fontSize.md,
                  fontWeight: tokens.typography.fontWeight.bold,
                  fill: tokens.colors.neutral[900],
                }}
              >
                {scorecard.overallScore}
              </text>
            </svg>

            {/* Score info */}
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                }}
              >
                <span
                  style={{
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[800],
                  }}
                >
                  Overall Score
                </span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: `0 ${tokens.spacing[2]}px`,
                    borderRadius: tokens.borderRadius.full,
                    fontSize: '10px',
                    fontWeight: tokens.typography.fontWeight.semibold,
                    backgroundColor: currentLevelColor.bg,
                    color: currentLevelColor.text,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${currentLevelColor.border}`,
                    textTransform: 'capitalize' as const,
                    lineHeight: '18px',
                  }}
                >
                  {scorecard.overallLevel}
                </span>
              </div>
              <div
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[500],
                  marginTop: 2,
                }}
              >
                {scorecard.dimensions.length} dimensions | Confidence:{' '}
                {Math.round(scorecard.confidence * 100)}%
              </div>
            </div>

            {/* Expand chevron */}
            <div style={{ color: tokens.colors.neutral[400] }}>
              {expandedScorecard ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </div>
          </button>

          {/* Expanded dimensions */}
          {expandedScorecard && (
            <div
              style={{
                padding: `0 ${tokens.spacing[4]}px ${tokens.spacing[3]}px`,
                display: 'flex',
                flexDirection: 'column',
                gap: tokens.spacing[2],
              }}
            >
              {scorecard.dimensions.map((dim) => {
                const gradient = getDimensionScoreGradient(dim.score, tokens);
                const isSelected = selectedDimension === dim.id;

                return (
                  <div
                    key={dim.id}
                    onClick={() => setSelectedDimension(isSelected ? null : dim.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[2],
                      padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                      borderRadius: tokens.borderRadius.md,
                      backgroundColor: isSelected
                        ? tokens.colors.primaryScale[50]
                        : 'transparent',
                      cursor: 'pointer',
                      transition: `all ${tokens.motion.hover}`,
                    }}
                  >
                    {/* Name */}
                    <span
                      style={{
                        flex: 1,
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[700],
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {dim.name}
                    </span>

                    {/* Knockout */}
                    {dim.isKnockout && (
                      <Shield
                        size={10}
                        color={
                          dim.knockoutTriggered
                            ? tokens.colors.errorScale[500]
                            : tokens.colors.neutral[400]
                        }
                      />
                    )}

                    {/* Score bar mini */}
                    <div
                      style={{
                        width: 60,
                        height: 4,
                        borderRadius: tokens.borderRadius.full,
                        backgroundColor: tokens.colors.neutral[100],
                        overflow: 'hidden',
                        flexShrink: 0,
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${Math.min(100, dim.score)}%`,
                          borderRadius: tokens.borderRadius.full,
                          background: `linear-gradient(90deg, ${gradient.start}, ${gradient.end})`,
                        }}
                      />
                    </div>

                    {/* Score value */}
                    <span
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: getDimensionScoreColor(dim.score, tokens),
                        minWidth: 22,
                        textAlign: 'right',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {dim.score}
                    </span>

                    {/* Knockout triggered */}
                    {dim.knockoutTriggered && (
                      <AlertTriangle size={10} color={tokens.colors.errorScale[500]} />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    };

    // ==================================================================
    // Render: Search Bar
    // ==================================================================

    const renderSearchBar = () => (
      <div
        style={{
          padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          backgroundColor: tokens.colors.common.white,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[2],
            padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
            borderRadius: tokens.borderRadius.md,
            backgroundColor: tokens.colors.neutral[50],
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          }}
        >
          <Search size={14} color={tokens.colors.neutral[400]} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search transcript..."
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[800],
              outline: 'none',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: tokens.colors.neutral[400],
                display: 'flex',
                padding: 0,
              }}
            >
              <X size={14} />
            </button>
          )}
          {searchQuery && (
            <span
              style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[400],
              }}
            >
              {filteredTranscript.length} results
            </span>
          )}
        </div>
      </div>
    );

    // ==================================================================
    // Render: Transcript Line with Evidence Highlights
    // ==================================================================

    const renderTranscriptText = (line: TranscriptLine) => {
      if (!line.evidenceHighlights || line.evidenceHighlights.length === 0) {
        return <span>{line.text}</span>;
      }

      const sorted = [...line.evidenceHighlights].sort((a, b) => a.startIdx - b.startIdx);
      const parts: React.ReactNode[] = [];
      let lastIdx = 0;

      sorted.forEach((highlight, i) => {
        if (highlight.startIdx > lastIdx) {
          parts.push(
            <span key={`text-${i}`}>{line.text.slice(lastIdx, highlight.startIdx)}</span>,
          );
        }

        const isHighlighted = highlightedEvidence === `${line.id}-${highlight.dimensionId}`;
        const isSelectedDim = selectedDimension === highlight.dimensionId;
        const dimScoreColor = getDimensionScoreColor(highlight.scoreContribution, tokens);

        parts.push(
          <span
            key={`ev-${i}`}
            style={{
              borderBottom: `2px solid ${dimScoreColor}`,
              backgroundColor:
                isHighlighted || isSelectedDim
                  ? tokens.colors.primaryScale[50]
                  : 'transparent',
              cursor: 'pointer',
              borderRadius: tokens.borderRadius.sm,
              padding: `0 ${tokens.spacing[0]}px`,
              transition: `all ${tokens.motion.hover}`,
            }}
            onMouseEnter={() =>
              setHighlightedEvidence(`${line.id}-${highlight.dimensionId}`)
            }
            onMouseLeave={() => setHighlightedEvidence(null)}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedDimension(highlight.dimensionId);
              if (!expandedScorecard) setExpandedScorecard(true);
            }}
          >
            {line.text.slice(highlight.startIdx, highlight.endIdx)}
            {(isHighlighted || isSelectedDim) && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  marginLeft: tokens.spacing[1],
                  padding: `0 ${tokens.spacing[1]}px`,
                  borderRadius: tokens.borderRadius.sm,
                  fontSize: '10px',
                  fontWeight: tokens.typography.fontWeight.semibold,
                  backgroundColor: dimScoreColor,
                  color: tokens.colors.common.white,
                  lineHeight: '16px',
                  verticalAlign: 'middle',
                }}
              >
                +{highlight.scoreContribution}
              </span>
            )}
          </span>,
        );

        lastIdx = highlight.endIdx;
      });

      if (lastIdx < line.text.length) {
        parts.push(<span key="text-end">{line.text.slice(lastIdx)}</span>);
      }

      return <>{parts}</>;
    };

    // ==================================================================
    // Render: Transcript
    // ==================================================================

    const renderTranscript = () => (
      <div
        ref={transcriptRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
          display: 'flex',
          flexDirection: 'column',
          gap: tokens.spacing[2],
        }}
      >
        {filteredTranscript.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: `${tokens.spacing[8]}px ${tokens.spacing[4]}px`,
              color: tokens.colors.neutral[400],
              fontSize: tokens.typography.fontSize.sm,
            }}
          >
            {searchQuery ? 'No matching lines found' : 'No transcript available'}
          </div>
        ) : (
          filteredTranscript.map((line) => {
            const isCandidate = line.speaker === 'candidate';
            const isHovered = hoveredLine === line.id;

            return (
              <div
                key={line.id}
                data-line-id={line.id}
                onMouseEnter={() => setHoveredLine(line.id)}
                onMouseLeave={() => setHoveredLine(null)}
                style={{
                  display: 'flex',
                  gap: tokens.spacing[2],
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                  borderRadius: tokens.borderRadius.md,
                  backgroundColor: isHovered
                    ? tokens.colors.neutral[50]
                    : tokens.colors.common.white,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${
                    isHovered ? tokens.colors.neutral[200] : tokens.colors.neutral[100]
                  }`,
                  transition: `all ${tokens.motion.hover}`,
                }}
              >
                {/* Speaker icon */}
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: tokens.borderRadius.full,
                    backgroundColor: isCandidate
                      ? tokens.colors.primaryScale[100]
                      : tokens.colors.neutral[100],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  {isCandidate ? (
                    <User size={12} color={tokens.colors.primaryScale[600]} />
                  ) : (
                    <Bot size={12} color={tokens.colors.neutral[600]} />
                  )}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[2],
                      marginBottom: 2,
                    }}
                  >
                    <span
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: isCandidate
                          ? tokens.colors.primaryScale[600]
                          : tokens.colors.neutral[500],
                        textTransform: 'capitalize' as const,
                      }}
                    >
                      {line.speaker}
                    </span>
                    <span
                      style={{
                        fontSize: '10px',
                        color: tokens.colors.neutral[400],
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {formatTime(line.timestamp)}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.neutral[800],
                      lineHeight: tokens.typography.lineHeight.relaxed,
                      wordBreak: 'break-word' as const,
                    }}
                  >
                    {renderTranscriptText(line)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    );

    // ==================================================================
    // Render: Simple Actions
    // ==================================================================

    const renderActions = () => {
      const actions = [
        {
          key: 'approve',
          label: 'Approve',
          icon: <CheckCircle size={14} />,
          onClick: onApproveScore,
          color: 'success' as const,
        },
        {
          key: 'rescore',
          label: 'Re-score',
          icon: <RefreshCw size={14} />,
          onClick: onRequestRescore,
          color: 'info' as const,
        },
        {
          key: 'flag',
          label: 'Flag',
          icon: <Flag size={14} />,
          onClick: onFlagForReview,
          color: 'warning' as const,
        },
        {
          key: 'download',
          label: 'Download',
          icon: <Download size={14} />,
          onClick: onDownloadTranscript,
          color: 'primary' as const,
        },
      ];

      const hasActions = actions.some((a) => !!a.onClick);
      if (!hasActions) return null;

      return (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: tokens.spacing[2],
            padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
            borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            backgroundColor: tokens.colors.common.white,
          }}
        >
          {actions.map((action) => {
            if (!action.onClick) return null;

            const scaleKey = `${action.color}Scale` as const;
            const scale = (tokens.colors as any)[scaleKey];
            const isHovered = hoveredAction === action.key;

            return (
              <button
                key={action.key}
                onClick={action.onClick}
                onMouseEnter={() => setHoveredAction(action.key)}
                onMouseLeave={() => setHoveredAction(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                  borderRadius: tokens.borderRadius.md,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${
                    isHovered ? scale[300] : scale[200]
                  }`,
                  backgroundColor: isHovered ? scale[100] : scale[50],
                  color: scale[700],
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.medium,
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                }}
              >
                {action.icon}
                {action.label}
              </button>
            );
          })}
        </div>
      );
    };

    // ==================================================================
    // Main Layout
    // ==================================================================

    return (
      <Box className={className} style={containerStyle}>
        {renderHeader()}
        {renderScoreSummary()}
        {renderSearchBar()}
        {renderTranscript()}
        {renderActions()}
      </Box>
    );
  },
});
