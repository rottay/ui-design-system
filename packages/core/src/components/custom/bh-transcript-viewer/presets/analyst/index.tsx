'use client';

/**
 * BhTranscriptViewer - Analyst Preset
 * Evidence-focused view with side-by-side transcript and evidence panel,
 * dimension score filters, confidence bars, and highlighted text spans.
 *
 * Design: Clean split-panel layout with color-coded dimension pills,
 * inline text highlighting, and structured evidence cards with confidence bars.
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createCardHoverStyles,
  createSectionHeaderStyle,
  createFilterPillStyle,
  createProgressBarStyle,
  createDividerStyle,
  getCardPadding,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createPersonalityAccentBar,
} from '../../../helpers';
import type { BhTranscriptViewerProps, TranscriptHighlight, TranscriptSegment, TranscriptMeta, ScoringDimension } from '../../core';
import {
  MessageSquare,
  FileSearch,
  SlidersHorizontal,
} from 'lucide-react';

const MOCK_META: TranscriptMeta = {
  interviewId: 'int-1', candidateName: 'Sarah Chen', positionTitle: 'Senior Software Engineer',
  interviewDate: '2025-01-20', interviewType: 'Technical', duration: '45 min', overallScore: 82,
};

const MOCK_SEGMENTS: TranscriptSegment[] = [
  { id: 'seg-1', speaker: 'interviewer', speakerName: 'AI Interviewer', timestamp: '00:00', text: 'Welcome Sarah. How would you design a real-time notification system at scale?' },
  { id: 'seg-2', speaker: 'candidate', speakerName: 'Sarah Chen', timestamp: '00:15', text: 'I would start by identifying the key requirements: low latency, multiple channels, and millions of concurrent users.', highlights: [{ startOffset: 0, endOffset: 50, dimensionId: 'dim-1', dimensionName: 'System Design', color: '#3B82F6', score: 8, confidence: 0.9 }] },
  { id: 'seg-3', speaker: 'interviewer', speakerName: 'AI Interviewer', timestamp: '00:45', text: 'How would you handle the real-time delivery specifically?' },
  { id: 'seg-4', speaker: 'candidate', speakerName: 'Sarah Chen', timestamp: '01:00', text: 'WebSocket connections for real-time delivery, Kafka for reliable processing, and a fan-out service for channel distribution.', highlights: [{ startOffset: 0, endOffset: 80, dimensionId: 'dim-2', dimensionName: 'Architecture', color: '#10B981', score: 9, confidence: 0.92 }] },
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
  const filtered = selectedDimension ? highlights.filter((h) => h.dimensionId === selectedDimension) : highlights;
  if (filtered.length === 0) return [text];
  const sorted = [...filtered].sort((a, b) => a.startOffset - b.startOffset);
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  sorted.forEach((hl, i) => {
    if (hl.startOffset > lastIndex) parts.push(text.slice(lastIndex, hl.startOffset));
    parts.push(
      <span
        key={i}
        style={{
          backgroundColor: hl.color + '20',
          borderBottom: `2px solid ${hl.color}`,
          padding: '2px 3px',
          borderRadius: 3,
          transition: 'background-color 0.15s ease',
        }}
        title={`${hl.dimensionName}: ${hl.score}`}
      >
        {text.slice(hl.startOffset, hl.endOffset)}
      </span>
    );
    lastIndex = hl.endOffset;
  });
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

/* ------------------------------------------------------------------ */
/*  Analyst Preset                                                     */
/* ------------------------------------------------------------------ */
export const AnalystBhTranscriptViewer = createPreset<BhTranscriptViewerProps>({
  name: 'BhTranscriptViewer.Analyst',
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
    const card = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const cardHover = useMemo(() => createCardHoverStyles(tokens), [tokens]);
    const sectionHdr = useMemo(() => createSectionHeaderStyle(tokens), [tokens]);
    const typo = useMemo(() => getPersonalityTypography(tokens), [tokens]);
    const padding = useMemo(() => getCardPadding(tokens), [tokens]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(tokens), [tokens]);
    const divider = useMemo(() => createDividerStyle(tokens), [tokens]);
    const accentBar = useMemo(() => createPersonalityAccentBar(tokens, { color: tokens.colors.primaryScale[500] }), [tokens]);

    // Collect all evidence
    const allEvidence = useMemo(() => {
      const evidence: { segmentId: string; speakerName: string; timestamp: string; highlight: TranscriptHighlight; text: string }[] = [];
      for (const seg of segments) {
        if (seg.highlights) {
          for (const hl of seg.highlights) {
            evidence.push({
              segmentId: seg.id,
              speakerName: seg.speakerName,
              timestamp: seg.timestamp,
              highlight: hl,
              text: seg.text.slice(hl.startOffset, hl.endOffset),
            });
          }
        }
      }
      return selectedDimension ? evidence.filter((e) => e.highlight.dimensionId === selectedDimension) : evidence;
    }, [segments, selectedDimension]);

    return (
      <Box
        className={className}
        style={{
          display: 'flex',
          flexDirection: 'column' as const,
          gap: tokens.spacing[6],
          padding: tokens.spacing[7],
          minHeight: '100%',
          backgroundColor: tokens.colors.neutral[50],
          fontFamily: 'inherit',
          ...style,
        }}
      >
        {/* Meta Header */}
        {meta && (
          <Box style={{ ...card, padding: padding, position: 'relative' as const, overflow: 'hidden' }}>
            <Box style={accentBar || undefined} />
            <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Text style={{
                  fontSize: tokens.typography.fontSize.lg || '1.125rem',
                  fontWeight: typo.headingWeight,
                  letterSpacing: typo.headingLetterSpacing,
                  color: tokens.colors.neutral[900],
                  display: 'block',
                  marginBottom: tokens.spacing[1],
                }}>
                  {meta.candidateName} &#8212; {meta.positionTitle}
                </Text>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                  {meta.interviewType} &#183; {meta.interviewDate} &#183; {meta.duration}
                </Text>
              </Box>
              {meta.overallScore !== undefined && (
                <Box style={{
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[5]}px`,
                  borderRadius: tokens.borderRadius.lg,
                  backgroundColor: tokens.colors.primaryScale[50],
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[200]}`,
                }}>
                  <Text style={{
                    fontSize: tokens.typography.fontSize['2xl'] || '1.5rem',
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: tokens.colors.primaryScale[600],
                  }}>
                    {meta.overallScore}
                  </Text>
                </Box>
              )}
            </Box>
          </Box>
        )}

        {/* Dimension Filter Bar */}
        <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], flexWrap: 'wrap' as const }}>
          <Box style={{ display: 'flex', alignItems: 'center', color: tokens.colors.neutral[400], marginRight: tokens.spacing[1] }}>
            <SlidersHorizontal size={14} strokeWidth={1.5} />
          </Box>
          <Box
            onClick={() => onDimensionSelect?.(null)}
            style={{
              ...createFilterPillStyle(tokens, { active: !selectedDimension }),
              borderRadius: badgeRadius,
              padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
              cursor: 'pointer',
            }}
          >
            All ({segments.reduce((s, seg) => s + (seg.highlights?.length || 0), 0)})
          </Box>
          {dimensions.map((dim) => (
            <Box
              key={dim.id}
              onClick={() => onDimensionSelect?.(selectedDimension === dim.id ? null : dim.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                borderRadius: badgeRadius,
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: selectedDimension === dim.id ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.medium,
                backgroundColor: selectedDimension === dim.id ? dim.color : tokens.colors.common.white,
                color: selectedDimension === dim.id ? tokens.colors.common.white : tokens.colors.neutral[600],
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${dim.color}`,
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
              }}
            >
              <Box style={{ width: 6, height: 6, borderRadius: tokens.borderRadius.full, backgroundColor: selectedDimension === dim.id ? tokens.colors.common.white : dim.color }} />
              <Text>{dim.name} ({dim.score}/{dim.maxScore})</Text>
            </Box>
          ))}
        </Box>

        {/* Main split view */}
        <Box style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: tokens.spacing[6] }}>
          {/* Transcript */}
          <Box style={{ ...card, padding: padding, maxHeight: 640, overflowY: 'auto' as const }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[4] }}>
              <MessageSquare size={15} strokeWidth={1.5} style={{ color: tokens.colors.primaryScale[500] }} />
              <Text style={{ ...sectionHdr, marginBottom: 0 }}>Transcript</Text>
            </Box>
            <Box style={divider} />
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[3], marginTop: tokens.spacing[3] }}>
              {segments.map((seg) => {
                const isSelected = selectedSegment === seg.id;
                const isInterviewer = seg.speaker === 'interviewer';
                return (
                  <Box
                    key={seg.id}
                    onClick={() => onSegmentSelect?.(isSelected ? null : seg.id)}
                    style={{
                      ...cardHover.base,
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                      borderRadius: tokens.borderRadius.lg,
                      backgroundColor: isSelected ? tokens.colors.primaryScale[50] : 'transparent',
                      borderLeft: `3px solid ${isInterviewer ? tokens.colors.neutral[300] : tokens.colors.primaryScale[300]}`,
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                      if (!isSelected) (e.currentTarget as HTMLDivElement).style.backgroundColor = tokens.colors.neutral[50];
                    }}
                    onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                      if (!isSelected) (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent';
                    }}
                  >
                    <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[1] }}>
                      <Text style={{
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: isInterviewer ? tokens.colors.neutral[600] : tokens.colors.primaryScale[600],
                      }}>
                        {seg.speakerName}
                      </Text>
                      {showTimestamps && (
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{seg.timestamp}</Text>
                      )}
                      {seg.highlights && seg.highlights.length > 0 && (
                        <Box style={{ display: 'flex', gap: 3 }}>
                          {[...new Set(seg.highlights.map((h) => h.color))].map((color, ci) => (
                            <Box key={ci} style={{ width: 7, height: 7, borderRadius: tokens.borderRadius.full, backgroundColor: color }} />
                          ))}
                        </Box>
                      )}
                    </Box>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[800], lineHeight: 1.7 }}>
                      {renderHighlightedText(seg.text, seg.highlights || [], selectedDimension ?? null)}
                    </Text>
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* Evidence Panel */}
          <Box style={{ ...card, padding: padding, maxHeight: 640, overflowY: 'auto' as const }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[4] }}>
              <FileSearch size={15} strokeWidth={1.5} style={{ color: tokens.colors.primaryScale[500] }} />
              <Text style={{ ...sectionHdr, marginBottom: 0 }}>
                Evidence ({allEvidence.length})
              </Text>
            </Box>
            <Box style={divider} />
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[3], marginTop: tokens.spacing[3] }}>
              {allEvidence.length > 0 ? allEvidence.map((ev, i) => {
                const bar = createProgressBarStyle(tokens, { color: ev.highlight.color, percent: ev.highlight.confidence * 100 });
                return (
                  <Box
                    key={i}
                    onClick={() => onSegmentSelect?.(ev.segmentId)}
                    style={{
                      ...cardHover.base,
                      padding: tokens.spacing[3],
                      borderRadius: tokens.borderRadius.lg,
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${ev.highlight.color}40`,
                      backgroundColor: selectedSegment === ev.segmentId ? ev.highlight.color + '08' : tokens.colors.common.white,
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => { (e.currentTarget as HTMLDivElement).style.borderColor = ev.highlight.color; }}
                    onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => { (e.currentTarget as HTMLDivElement).style.borderColor = ev.highlight.color + '40'; }}
                  >
                    <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[2] }}>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                        <Box style={{ width: 7, height: 7, borderRadius: tokens.borderRadius.full, backgroundColor: ev.highlight.color }} />
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: ev.highlight.color }}>
                          {ev.highlight.dimensionName}
                        </Text>
                      </Box>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[800] }}>
                        {ev.highlight.score}
                      </Text>
                    </Box>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[700], fontStyle: 'italic', marginBottom: tokens.spacing[2], display: 'block', lineHeight: 1.5 }}>
                      &ldquo;{ev.text}&rdquo;
                    </Text>
                    <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                        {ev.speakerName} &#183; {ev.timestamp}
                      </Text>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                        <Box style={{ ...bar.track, width: 36, height: 3 }}>
                          <Box style={bar.fill} />
                        </Box>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                          {(ev.highlight.confidence * 100).toFixed(0)}%
                        </Text>
                      </Box>
                    </Box>
                    {ev.highlight.evidenceNote && (
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginTop: tokens.spacing[2], display: 'block' }}>
                        {ev.highlight.evidenceNote}
                      </Text>
                    )}
                  </Box>
                );
              }) : (
                <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 100, color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.xs }}>
                  <Text>No evidence found</Text>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    );
  },
});
