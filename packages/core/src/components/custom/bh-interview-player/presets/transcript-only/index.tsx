'use client';

/**
 * BhInterviewPlayer - Transcript-Only Preset
 * Slite-inspired focused reading mode with search, collapsible scorecard,
 * transcript with evidence highlights, and action buttons.
 */

import { useState, useRef, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createBadgeStyle } from '../../../helpers';
import type {
  BhInterviewPlayerProps,
  TranscriptLine,
} from '../../core';
import {
  getLevelColors,
  formatTime,
  getDimensionScoreColor,
  getDimensionScoreGradient,
} from '../../core';
import {
  User, Bot, Clock, ChevronDown, ChevronRight, BarChart3,
  Download, Flag, CheckCircle, RefreshCw, Search, Shield,
  AlertTriangle, X,
} from 'lucide-react';

const MINI_RING_SIZE = 56;
const MINI_RING_STROKE = 5;

export const TranscriptOnlyBhInterviewPlayer = createPreset<BhInterviewPlayerProps>({
  name: 'BhInterviewPlayer.TranscriptOnly',
  render: ({ primitives, props, tokens }: PresetContext<BhInterviewPlayerProps>) => {
    const { Box, Text } = primitives;

    const {
      interviewInfo, transcript, scorecard,
      onApproveScore, onRequestRescore, onFlagForReview, onDownloadTranscript,
      className, style,
    } = props;

    const [expandedScorecard, setExpandedScorecard] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDimension, setSelectedDimension] = useState<string | null>(null);
    const [highlightedEvidence, setHighlightedEvidence] = useState<string | null>(null);
    const [hoveredLine, setHoveredLine] = useState<string | null>(null);
    const [hoveredAction, setHoveredAction] = useState<string | null>(null);

    const transcriptRef = useRef<HTMLDivElement>(null);
    const levelColors = useMemo(() => getLevelColors(tokens), [tokens]);
    const currentLevelColor = levelColors[scorecard.overallLevel];

    const filteredTranscript = useMemo(() => {
      if (!searchQuery.trim()) return transcript;
      const q = searchQuery.toLowerCase();
      return transcript.filter(l => l.text.toLowerCase().includes(q) || l.speaker.toLowerCase().includes(q));
    }, [transcript, searchQuery]);

    // Evidence highlight renderer
    const renderTranscriptText = (line: TranscriptLine) => {
      if (!line.evidenceHighlights || line.evidenceHighlights.length === 0) {
        return <Text>{line.text}</Text>;
      }
      const sorted = [...line.evidenceHighlights].sort((a, b) => a.startIdx - b.startIdx);
      const parts: React.ReactNode[] = [];
      let lastIdx = 0;

      sorted.forEach((hl, i) => {
        if (hl.startIdx > lastIdx) parts.push(<Text key={`t-${i}`}>{line.text.slice(lastIdx, hl.startIdx)}</Text>);
        const isHl = highlightedEvidence === `${line.id}-${hl.dimensionId}`;
        const isSel = selectedDimension === hl.dimensionId;
        const clr = getDimensionScoreColor(hl.scoreContribution, tokens);

        parts.push(
          <Box key={`ev-${i}`} style={{
            borderBottom: `2px solid ${clr}`,
            backgroundColor: isHl || isSel ? tokens.colors.primaryScale[50] : 'transparent',
            cursor: 'pointer', borderRadius: tokens.borderRadius.sm,
            padding: `0 ${tokens.spacing[0]}px`, transition: `all ${tokens.motion.hover}`,
            display: 'inline',
          }}
            onMouseEnter={() => setHighlightedEvidence(`${line.id}-${hl.dimensionId}`)}
            onMouseLeave={() => setHighlightedEvidence(null)}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              setSelectedDimension(hl.dimensionId);
              if (!expandedScorecard) setExpandedScorecard(true);
            }}
          >
            {line.text.slice(hl.startIdx, hl.endIdx)}
            {(isHl || isSel) && (
              <Text style={{
                display: 'inline-flex', alignItems: 'center', marginLeft: tokens.spacing[1],
                padding: `0 ${tokens.spacing[1]}px`, borderRadius: tokens.borderRadius.sm,
                fontSize: '10px', fontWeight: tokens.typography.fontWeight.semibold,
                backgroundColor: clr, color: tokens.colors.common.white,
                lineHeight: '16px', verticalAlign: 'middle',
              }}>+{hl.scoreContribution}</Text>
            )}
          </Box>,
        );
        lastIdx = hl.endIdx;
      });

      if (lastIdx < line.text.length) parts.push(<Text key="end">{line.text.slice(lastIdx)}</Text>);
      return <>{parts}</>;
    };

    const actions = [
      { key: 'approve', label: 'Approve', icon: <CheckCircle size={14} />, onClick: onApproveScore, color: 'success' },
      { key: 'rescore', label: 'Re-score', icon: <RefreshCw size={14} />, onClick: onRequestRescore, color: 'info' },
      { key: 'flag', label: 'Flag', icon: <Flag size={14} />, onClick: onFlagForReview, color: 'warning' },
      { key: 'download', label: 'Download', icon: <Download size={14} />, onClick: onDownloadTranscript, color: 'primary' },
    ];
    const hasActions = actions.some(a => !!a.onClick);

    return (
      <Box className={className} style={{
        display: 'flex', flexDirection: 'column' as const, height: '100%',
        backgroundColor: tokens.colors.neutral[50], overflow: 'hidden', ...style,
      }}>
        {/* Header */}
        <Box style={{
          display: 'flex', alignItems: 'center', gap: tokens.spacing[3],
          padding: `${tokens.spacing[3]}px ${tokens.spacing[5]}px`,
          borderBottom: `1px solid ${tokens.colors.neutral[100]}`,
          backgroundColor: tokens.colors.common.white,
        }}>
          <Box style={{
            width: 36, height: 36, borderRadius: tokens.borderRadius.full,
            backgroundColor: tokens.colors.primaryScale[100],
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', flexShrink: 0, border: `1px solid ${tokens.colors.primaryScale[200]}`,
          }}>
            {interviewInfo.candidateAvatar
              ? <img src={interviewInfo.candidateAvatar} alt={interviewInfo.candidateName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <User size={18} color={tokens.colors.primaryScale[600]} />}
          </Box>
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Text style={{
              fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[900], lineHeight: tokens.typography.lineHeight.tight,
              whiteSpace: 'nowrap' as const, overflow: 'hidden' as const, textOverflow: 'ellipsis',
            }}>{interviewInfo.candidateName}</Text>
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{interviewInfo.jobTitle}</Text>
              <Text style={{ color: tokens.colors.neutral[300], fontSize: tokens.typography.fontSize.xs }}>|</Text>
              <Text style={{ ...createBadgeStyle(tokens, 'primary'), padding: `0 ${tokens.spacing[2]}px`, fontSize: '10px', lineHeight: '18px' }}>{interviewInfo.stageName}</Text>
            </Box>
          </Box>
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
              <Clock size={12} color={tokens.colors.neutral[400]} />
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{interviewInfo.date}</Text>
            </Box>
            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{formatTime(interviewInfo.duration)}</Text>
          </Box>
        </Box>

        {/* Score Summary (collapsible) */}
        <Box style={{ borderBottom: `1px solid ${tokens.colors.neutral[100]}`, backgroundColor: tokens.colors.common.white }}>
          <Box onClick={() => setExpandedScorecard(p => !p)} style={{
            display: 'flex', alignItems: 'center', gap: tokens.spacing[3], width: '100%',
            padding: `${tokens.spacing[3]}px ${tokens.spacing[5]}px`,
            cursor: 'pointer', transition: `all ${tokens.motion.hover}`,
          }}>
            {(() => {
              const radius = (MINI_RING_SIZE - MINI_RING_STROKE) / 2;
              const circumference = 2 * Math.PI * radius;
              const dashOffset = circumference * (1 - scorecard.overallScore / 100);
              return (
                <svg width={MINI_RING_SIZE} height={MINI_RING_SIZE} viewBox={`0 0 ${MINI_RING_SIZE} ${MINI_RING_SIZE}`} style={{ flexShrink: 0 }}>
                  <circle cx={MINI_RING_SIZE / 2} cy={MINI_RING_SIZE / 2} r={radius} fill="none" stroke={tokens.colors.neutral[100]} strokeWidth={MINI_RING_STROKE} />
                  <circle cx={MINI_RING_SIZE / 2} cy={MINI_RING_SIZE / 2} r={radius} fill="none" stroke={currentLevelColor.ring} strokeWidth={MINI_RING_STROKE}
                    strokeDasharray={`${circumference}`} strokeDashoffset={dashOffset} strokeLinecap="round"
                    transform={`rotate(-90 ${MINI_RING_SIZE / 2} ${MINI_RING_SIZE / 2})`} />
                  <text x={MINI_RING_SIZE / 2} y={MINI_RING_SIZE / 2} textAnchor="middle" dominantBaseline="central"
                    style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.bold, fill: tokens.colors.neutral[900] }}>
                    {scorecard.overallScore}
                  </text>
                </svg>
              );
            })()}
            <Box style={{ flex: 1 }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>Overall Score</Text>
                <Box style={{
                  display: 'inline-flex', alignItems: 'center',
                  padding: `0 ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.full,
                  fontSize: '10px', fontWeight: tokens.typography.fontWeight.semibold,
                  backgroundColor: currentLevelColor.bg, color: currentLevelColor.text,
                  border: `1px solid ${currentLevelColor.border}`, textTransform: 'capitalize' as const, lineHeight: '18px',
                }}>
                  <Text style={{ fontSize: '10px', color: currentLevelColor.text }}>{scorecard.overallLevel}</Text>
                </Box>
              </Box>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginTop: 2 }}>
                {scorecard.dimensions.length} dimensions | Confidence: {Math.round(scorecard.confidence * 100)}%
              </Text>
            </Box>
            <Box style={{ color: tokens.colors.neutral[400] }}>
              {expandedScorecard ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </Box>
          </Box>

          {expandedScorecard && (
            <Box style={{ padding: `0 ${tokens.spacing[5]}px ${tokens.spacing[3]}px`, display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2] }}>
              {scorecard.dimensions.map(dim => {
                const gradient = getDimensionScoreGradient(dim.score, tokens);
                const isSel = selectedDimension === dim.id;
                return (
                  <Box key={dim.id} onClick={() => setSelectedDimension(isSel ? null : dim.id)} style={{
                    display: 'flex', alignItems: 'center', gap: tokens.spacing[2],
                    padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.md,
                    backgroundColor: isSel ? tokens.colors.primaryScale[50] : 'transparent',
                    cursor: 'pointer', transition: `all ${tokens.motion.hover}`,
                  }}>
                    <Text style={{
                      flex: 1, fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[700],
                      whiteSpace: 'nowrap' as const, overflow: 'hidden' as const, textOverflow: 'ellipsis',
                    }}>{dim.name}</Text>
                    {dim.isKnockout && <Shield size={10} color={dim.knockoutTriggered ? tokens.colors.errorScale[500] : tokens.colors.neutral[400]} />}
                    <Box style={{
                      width: 60, height: 4, borderRadius: tokens.borderRadius.full,
                      backgroundColor: tokens.colors.neutral[100], overflow: 'hidden', flexShrink: 0,
                    }}>
                      <Box style={{
                        height: '100%', width: `${Math.min(100, dim.score)}%`, borderRadius: tokens.borderRadius.full,
                        background: `linear-gradient(90deg, ${gradient.start}, ${gradient.end})`,
                      }} />
                    </Box>
                    <Text style={{
                      fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold,
                      color: getDimensionScoreColor(dim.score, tokens), minWidth: 22,
                      textAlign: 'right' as const, fontVariantNumeric: 'tabular-nums',
                    }}>{dim.score}</Text>
                    {dim.knockoutTriggered && <AlertTriangle size={10} color={tokens.colors.errorScale[500]} />}
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>

        {/* Search Bar */}
        <Box style={{
          padding: `${tokens.spacing[2]}px ${tokens.spacing[5]}px`,
          borderBottom: `1px solid ${tokens.colors.neutral[100]}`,
          backgroundColor: tokens.colors.common.white,
        }}>
          <Box style={{
            display: 'flex', alignItems: 'center', gap: tokens.spacing[2],
            padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
            borderRadius: tokens.borderRadius.md, backgroundColor: tokens.colors.neutral[50],
            border: `1px solid ${tokens.colors.neutral[100]}`,
          }}>
            <Search size={14} color={tokens.colors.neutral[400]} />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search transcript..."
              style={{
                flex: 1, border: 'none', background: 'transparent',
                fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[800], outline: 'none',
              }} />
            {searchQuery && (
              <Box onClick={() => setSearchQuery('')} style={{ cursor: 'pointer', display: 'flex', color: tokens.colors.neutral[400] }}>
                <X size={14} />
              </Box>
            )}
            {searchQuery && (
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{filteredTranscript.length} results</Text>
            )}
          </Box>
        </Box>

        {/* Transcript */}
        <div ref={transcriptRef} style={{
          flex: 1, overflowY: 'auto' as const,
          padding: `${tokens.spacing[3]}px ${tokens.spacing[5]}px`,
          display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2],
        }}>
          {filteredTranscript.length === 0 ? (
            <Text style={{ textAlign: 'center' as const, padding: `${tokens.spacing[8]}px ${tokens.spacing[4]}px`, color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>
              {searchQuery ? 'No matching lines found' : 'No transcript available'}
            </Text>
          ) : filteredTranscript.map(line => {
            const isCandidate = line.speaker === 'candidate';
            const isHovered = hoveredLine === line.id;
            return (
              <Box key={line.id} data-line-id={line.id}
                onMouseEnter={() => setHoveredLine(line.id)} onMouseLeave={() => setHoveredLine(null)}
                style={{
                  display: 'flex', gap: tokens.spacing[2],
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md,
                  backgroundColor: isHovered ? tokens.colors.neutral[50] : tokens.colors.common.white,
                  border: `1px solid ${isHovered ? tokens.colors.neutral[200] : tokens.colors.neutral[100]}`,
                  transition: `all ${tokens.motion.hover}`,
                }}>
                <Box style={{
                  width: 24, height: 24, borderRadius: tokens.borderRadius.full,
                  backgroundColor: isCandidate ? tokens.colors.primaryScale[100] : tokens.colors.neutral[100],
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2,
                }}>
                  {isCandidate ? <User size={12} color={tokens.colors.primaryScale[600]} /> : <Bot size={12} color={tokens.colors.neutral[600]} />}
                </Box>
                <Box style={{ flex: 1, minWidth: 0 }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: 2 }}>
                    <Text style={{
                      fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold,
                      color: isCandidate ? tokens.colors.primaryScale[600] : tokens.colors.neutral[500],
                      textTransform: 'capitalize' as const,
                    }}>{line.speaker}</Text>
                    <Text style={{ fontSize: '10px', color: tokens.colors.neutral[400], fontVariantNumeric: 'tabular-nums' }}>{formatTime(line.timestamp)}</Text>
                  </Box>
                  <Box style={{
                    fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[800],
                    lineHeight: tokens.typography.lineHeight.relaxed, wordBreak: 'break-word' as const,
                  }}>
                    {renderTranscriptText(line)}
                  </Box>
                </Box>
              </Box>
            );
          })}
        </div>

        {/* Actions */}
        {hasActions && (
          <Box style={{
            display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: tokens.spacing[2],
            padding: `${tokens.spacing[2]}px ${tokens.spacing[5]}px`,
            borderTop: `1px solid ${tokens.colors.neutral[100]}`,
            backgroundColor: tokens.colors.common.white,
          }}>
            {actions.map(action => {
              if (!action.onClick) return null;
              const scale = (tokens.colors as any)[`${action.color}Scale`];
              const isHov = hoveredAction === action.key;
              return (
                <Box key={action.key} onClick={action.onClick}
                  onMouseEnter={() => setHoveredAction(action.key)} onMouseLeave={() => setHoveredAction(null)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: tokens.spacing[1],
                    padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.md,
                    border: `1px solid ${isHov ? scale[300] : scale[200]}`,
                    backgroundColor: isHov ? scale[100] : scale[50], color: scale[700],
                    fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium,
                    cursor: 'pointer', transition: `all ${tokens.motion.hover}`,
                  }}>
                  {action.icon}
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: scale[700] }}>{action.label}</Text>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    );
  },
});
