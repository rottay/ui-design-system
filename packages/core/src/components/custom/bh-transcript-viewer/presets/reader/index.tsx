'use client';

/**
 * BhTranscriptViewer - Reader Preset
 * Clean transcript reading view with inline highlights and dimension sidebar.
 *
 * Design: Comfortable reading layout with speaker columns, dimension
 * score cards in sidebar, and personality-driven typography.
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createSectionHeaderStyle,
  createHoverStyle,
  createDividerStyle,
  createPersonalityAccentBar,
  getCardPadding,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
} from '../../../helpers';
import type { BhTranscriptViewerProps, TranscriptHighlight, TranscriptSegment, TranscriptMeta, ScoringDimension } from '../../core';
import {
  BookOpen,
  BarChart3,
  Clock,
  Award,
} from 'lucide-react';

const MOCK_META: TranscriptMeta = {
  interviewId: 'int-1', candidateName: 'Sarah Chen', positionTitle: 'Senior Software Engineer',
  interviewDate: '2025-01-20', interviewType: 'Technical', duration: '45 min', overallScore: 82,
};

const MOCK_SEGMENTS: TranscriptSegment[] = [
  { id: 'seg-1', speaker: 'interviewer', speakerName: 'AI Interviewer', timestamp: '00:00', text: 'Welcome Sarah. Let us start with a system design question. How would you design a real-time notification system for a large-scale application?' },
  { id: 'seg-2', speaker: 'candidate', speakerName: 'Sarah Chen', timestamp: '00:15', text: 'I would start by identifying the key requirements: low latency delivery, support for multiple channels like push, email, and in-app, and the ability to handle millions of concurrent users.', highlights: [{ startOffset: 0, endOffset: 50, dimensionId: 'dim-1', dimensionName: 'System Design', color: '#3B82F6', score: 8, confidence: 0.9 }] },
  { id: 'seg-3', speaker: 'interviewer', speakerName: 'AI Interviewer', timestamp: '00:45', text: 'How would you handle the real-time aspect specifically?' },
  { id: 'seg-4', speaker: 'candidate', speakerName: 'Sarah Chen', timestamp: '01:00', text: 'I would use WebSocket connections for real-time delivery, with a message queue like Kafka for reliable processing. A fan-out service would distribute notifications to the appropriate channels based on user preferences.', highlights: [{ startOffset: 0, endOffset: 80, dimensionId: 'dim-2', dimensionName: 'Architecture', color: '#10B981', score: 9, confidence: 0.92 }] },
];

const MOCK_DIMENSIONS: ScoringDimension[] = [
  { id: 'dim-1', name: 'System Design', color: '#3B82F6', score: 8, maxScore: 10, confidence: 0.9, evidenceCount: 3 },
  { id: 'dim-2', name: 'Architecture', color: '#10B981', score: 9, maxScore: 10, confidence: 0.92, evidenceCount: 2 },
  { id: 'dim-3', name: 'Communication', color: '#F59E0B', score: 7, maxScore: 10, confidence: 0.85, evidenceCount: 4 },
];

/* ------------------------------------------------------------------ */
/*  Highlight Helper                                                   */
/* ------------------------------------------------------------------ */
function renderHighlightedText(
  text: string,
  highlights: TranscriptHighlight[],
  selectedDimension: string | null
): React.ReactNode[] {
  if (!highlights || highlights.length === 0) return [text];

  const filtered = selectedDimension
    ? highlights.filter((h) => h.dimensionId === selectedDimension)
    : highlights;

  if (filtered.length === 0) return [text];

  const sorted = [...filtered].sort((a, b) => a.startOffset - b.startOffset);
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  sorted.forEach((hl, i) => {
    if (hl.startOffset > lastIndex) {
      parts.push(text.slice(lastIndex, hl.startOffset));
    }
    parts.push(
      <span
        key={i}
        style={{
          backgroundColor: hl.color + '30',
          borderBottom: `2px solid ${hl.color}`,
          padding: '1px 2px',
          borderRadius: 2,
        }}
        title={`${hl.dimensionName}: ${hl.score} (${(hl.confidence * 100).toFixed(0)}% confidence)`}
      >
        {text.slice(hl.startOffset, hl.endOffset)}
      </span>
    );
    lastIndex = hl.endOffset;
  });

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

/* ------------------------------------------------------------------ */
/*  Reader Preset                                                      */
/* ------------------------------------------------------------------ */
export const ReaderBhTranscriptViewer = createPreset<BhTranscriptViewerProps>({
  name: 'BhTranscriptViewer.Reader',
  render: ({ primitives, props, tokens }: PresetContext<BhTranscriptViewerProps>) => {
    const { Box, Text } = primitives;

    const {
      meta = MOCK_META,
      segments = MOCK_SEGMENTS,
      dimensions = MOCK_DIMENSIONS,
      selectedDimension,
      onDimensionSelect,
      selectedSegment,
      onSegmentSelect,
      showTimestamps = true,
      className,
      style,
    } = props;

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const sectionHeader = useMemo(() => createSectionHeaderStyle(tokens), [tokens]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);
    const typo = useMemo(() => getPersonalityTypography(tokens), [tokens]);
    const padding = useMemo(() => getCardPadding(tokens), [tokens]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(tokens), [tokens]);
    const divider = useMemo(() => createDividerStyle(tokens), [tokens]);
    const accentBar = useMemo(() => createPersonalityAccentBar(tokens, { color: tokens.colors.primaryScale[500] }), [tokens]);

    return (
      <Box
        className={className}
        style={{
          display: 'flex',
          flexDirection: 'column' as const,
          gap: tokens.spacing[6],
          padding: tokens.spacing[6],
          minHeight: '100%',
          backgroundColor: tokens.colors.neutral[50],
          fontFamily: 'inherit',
          ...style,
        }}
      >
        {/* Meta Header */}
        {meta && (
          <Box style={{ ...cardBase, padding: padding, position: 'relative' as const, overflow: 'hidden' }}>
            <Box style={accentBar || undefined} />
            <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Text style={{
                  fontSize: tokens.typography.fontSize.xl || '1.25rem',
                  fontWeight: typo.headingWeight,
                  letterSpacing: typo.headingLetterSpacing,
                  color: tokens.colors.neutral[900],
                  display: 'block',
                }}>
                  {meta.candidateName}
                </Text>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
                  {meta.positionTitle} - {meta.interviewType} - {meta.interviewDate}
                </Text>
              </Box>
              <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[4] }}>
                <Box style={{ textAlign: 'center' as const }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1], color: tokens.colors.neutral[400], marginBottom: 2 }}>
                    <Clock size={12} strokeWidth={1.5} />
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>Duration</Text>
                  </Box>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>{meta.duration}</Text>
                </Box>
                {meta.overallScore !== undefined && (
                  <Box style={{ textAlign: 'center' as const }}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1], color: tokens.colors.neutral[400], marginBottom: 2 }}>
                      <Award size={12} strokeWidth={1.5} />
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>Score</Text>
                    </Box>
                    <Text style={{ fontSize: tokens.typography.fontSize.lg || '1.125rem', fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.primaryScale[600] }}>{meta.overallScore}</Text>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        )}

        <Box style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: tokens.spacing[6] }}>
          {/* Transcript */}
          <Box style={{ ...cardBase, padding: padding }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              <BookOpen size={15} strokeWidth={1.5} style={{ color: tokens.colors.primaryScale[500] }} />
              <Text style={{ ...sectionHeader, marginBottom: 0 }}>Transcript</Text>
            </Box>
            <Box style={{ ...divider, marginTop: tokens.spacing[3], marginBottom: tokens.spacing[3] }} />
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[4] }}>
              {segments.length > 0 ? segments.map((seg) => {
                const isSelected = selectedSegment === seg.id;
                const isInterviewer = seg.speaker === 'interviewer';

                return (
                  <Box
                    key={seg.id}
                    onClick={() => onSegmentSelect?.(isSelected ? null : seg.id)}
                    style={{
                      ...hoverStyle,
                      display: 'flex',
                      gap: tokens.spacing[3],
                      padding: tokens.spacing[3],
                      borderRadius: tokens.borderRadius.md,
                      backgroundColor: isSelected ? tokens.colors.primaryScale[50] : 'transparent',
                      borderLeft: `3px solid ${isInterviewer ? tokens.colors.neutral[300] : tokens.colors.primaryScale[300]}`,
                      cursor: 'pointer',
                    }}
                  >
                    <Box style={{ flexShrink: 0, width: 80 }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: isInterviewer ? tokens.colors.neutral[600] : tokens.colors.primaryScale[600], display: 'block' }}>
                        {seg.speakerName}
                      </Text>
                      {showTimestamps && (
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                          {seg.timestamp}
                        </Text>
                      )}
                    </Box>
                    <Box style={{ flex: 1 }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[800], lineHeight: 1.6 }}>
                        {renderHighlightedText(seg.text, seg.highlights || [], selectedDimension ?? null)}
                      </Text>
                    </Box>
                  </Box>
                );
              }) : (
                <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120, color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>
                  <Text>No transcript data</Text>
                </Box>
              )}
            </Box>
          </Box>

          {/* Dimensions Sidebar */}
          <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[4] }}>
            <Box style={{ ...cardBase, padding: tokens.spacing[4] }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                <BarChart3 size={15} strokeWidth={1.5} style={{ color: tokens.colors.primaryScale[500] }} />
                <Text style={{ ...sectionHeader, fontSize: tokens.typography.fontSize.sm, marginBottom: 0 }}>Scoring Dimensions</Text>
              </Box>
              <Box style={{ ...divider, marginTop: tokens.spacing[3], marginBottom: tokens.spacing[3] }} />
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2] }}>
                {/* All filter */}
                <Box
                  onClick={() => onDimensionSelect?.(null)}
                  style={{
                    ...hoverStyle,
                    padding: tokens.spacing[2],
                    borderRadius: badgeRadius,
                    backgroundColor: !selectedDimension ? tokens.colors.primaryScale[50] : 'transparent',
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${!selectedDimension ? tokens.colors.primaryScale[200] : 'transparent'}`,
                    cursor: 'pointer',
                  }}
                >
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[700] }}>
                    All Dimensions
                  </Text>
                </Box>

                {dimensions.map((dim) => {
                  const isActive = selectedDimension === dim.id;
                  return (
                    <Box
                      key={dim.id}
                      onClick={() => onDimensionSelect?.(isActive ? null : dim.id)}
                      style={{
                        ...hoverStyle,
                        padding: tokens.spacing[2],
                        borderRadius: badgeRadius,
                        backgroundColor: isActive ? dim.color + '10' : 'transparent',
                        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${isActive ? dim.color : 'transparent'}`,
                        cursor: 'pointer',
                      }}
                    >
                      <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                          <Box style={{ width: 8, height: 8, borderRadius: tokens.borderRadius.full, backgroundColor: dim.color }} />
                          <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[700] }}>
                            {dim.name}
                          </Text>
                        </Box>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold, color: dim.color }}>
                          {dim.score}/{dim.maxScore}
                        </Text>
                      </Box>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginTop: tokens.spacing[1] }}>
                        <Box style={{ flex: 1, height: 4, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.neutral[100], overflow: 'hidden' }}>
                          <Box style={{ width: `${(dim.score / dim.maxScore) * 100}%`, height: '100%', borderRadius: tokens.borderRadius.full, backgroundColor: dim.color }} />
                        </Box>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                          {dim.evidenceCount} ev.
                        </Text>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  },
});
