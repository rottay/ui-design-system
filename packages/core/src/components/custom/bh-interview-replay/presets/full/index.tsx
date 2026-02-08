'use client';

/**
 * BhInterviewReplay - Full Preset
 * Split layout: transcript player left, score overlay + evidence right
 */

import { useState, useMemo} from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { BhInterviewReplayProps } from '../../core';
import { getSpeakerColors, getImpactColors, getScoreBarColor } from '../../core';
import {
  createCardStyle,
  createEmptyStateStyle,
  createFilterPillStyle,
  createHoverStyle,
  createPanelHeaderStyle,
  createProgressBarStyle,
  createSectionHeaderStyle,
  createStatusDotStyle,
} from '../../../helpers';

export const FullBhInterviewReplay = createPreset<BhInterviewReplayProps>({
  name: 'BhInterviewReplay.Full',
  render: ({ primitives, props, tokens, engine }: PresetContext<BhInterviewReplayProps>) => {
    const { Box, Flex, Stack, Text } = primitives;
    const isGlass = engine === 'modern' && !!tokens.glass;
    const speakerColors = getSpeakerColors(tokens);
    const impactClrs = getImpactColors(tokens);

    const {
      transcript,
      scoreOverlay = [],
      evidenceMarkers = [],
      persona,
      scoreSummary,
      candidateName,
      jobTitle,
      interviewDate,
      duration,
      selectedEntryId: selectedEntryIdProp,
      onEntrySelect,
      showScoreOverlay: showScoreOverlayProp,
      onToggleScoreOverlay,
      loading,
      className,
      style,
    } = props;

    const [internalSelectedId, setInternalSelectedId] = useState(selectedEntryIdProp ?? '');
    const [internalShowOverlay, setInternalShowOverlay] = useState(showScoreOverlayProp ?? true);

    const selectedEntryId = selectedEntryIdProp ?? internalSelectedId;
    const showOverlay = showScoreOverlayProp ?? internalShowOverlay;

    const handleEntrySelect = (id: string) => {
      setInternalSelectedId(id);
      onEntrySelect?.(id);
    };

    const toggleOverlay = () => {
      const next = !showOverlay;
      setInternalShowOverlay(next);
      onToggleScoreOverlay?.(next);
    };

    const evidenceByEntry = new Map<string, typeof evidenceMarkers>();
    evidenceMarkers.forEach(em => {
      const existing = evidenceByEntry.get(em.transcriptEntryId) ?? [];
      existing.push(em);
      evidenceByEntry.set(em.transcriptEntryId, existing);
    });

    if (loading) {
      return (
        <Flex align="center" justify="center" style={{ padding: tokens.spacing[8], ...style }} className={className}>
          <Text style={{ color: tokens.colors.neutral[500] }}>Loading replay...</Text>
        </Flex>
      );
    }

    return (
      <Box className={className} style={{ ...createCardStyle(tokens, { glass: isGlass, padding: 0, elevation: 'md' }), overflow: 'hidden', ...style }}>
        {/* Header */}
        <Flex align="center" justify="between" style={createPanelHeaderStyle(tokens)}>
          <Stack gap={2}>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>
              {candidateName ?? 'Interview Replay'}
            </Text>
            <Flex gap={8}>
              {jobTitle && <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{jobTitle}</Text>}
              {interviewDate && <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{interviewDate}</Text>}
              {duration && <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{duration}</Text>}
            </Flex>
          </Stack>
          <Flex gap={8} align="center">
            {persona && (
              <Box style={{ padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.full, background: tokens.colors.secondaryScale[50], border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.secondaryScale[200]}` }}>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.secondaryScale[700] }}>AI: {persona.name}</Text>
              </Box>
            )}
            <Box
              onClick={toggleOverlay}
              style={createFilterPillStyle(tokens, { active: showOverlay })}
            >
              <Text style={{ fontSize: tokens.typography.fontSize.xs }}>
                Scores {showOverlay ? 'ON' : 'OFF'}
              </Text>
            </Box>
          </Flex>
        </Flex>

        {/* Split Layout */}
        <Flex style={{ height: 500 }}>
          {/* Transcript */}
          <Box style={{ flex: 1, overflowY: 'auto', padding: tokens.spacing[4] }}>
            <Stack gap={6}>
              {transcript.map(entry => {
                const sc = speakerColors[entry.speaker];
                const isSelected = selectedEntryId === entry.id;
                const entryEvidence = evidenceByEntry.get(entry.id) ?? [];
                const hasEvidence = entryEvidence.length > 0 || entry.hasEvidence;
                return (
                  <Box
                    key={entry.id}
                    onClick={() => handleEntrySelect(entry.id)}
                    style={{
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                      borderRadius: tokens.borderRadius.md,
                      background: isSelected ? tokens.colors.primaryScale[50] : hasEvidence ? tokens.colors.warningScale[50] : 'transparent',
                      borderLeft: `3px solid ${hasEvidence ? tokens.colors.warningScale[400] : 'transparent'}`,
                      cursor: 'pointer',
                      transition: `all ${tokens.motion.hover}`,
                    }}
                  >
                    <Flex gap={8} align="center" style={{ marginBottom: tokens.spacing[1] }}>
                      <Box style={{ width: 24, height: 24, borderRadius: tokens.borderRadius.full, background: sc.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${sc.border}` }}>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: sc.color }}>
                          {entry.speaker === 'candidate' ? 'C' : entry.speaker === 'interviewer' ? 'I' : 'S'}
                        </Text>
                      </Box>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: sc.color }}>{entry.speakerName}</Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{entry.timestamp}</Text>
                      {entry.confidence !== undefined && (
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>({(entry.confidence * 100).toFixed(0)}%)</Text>
                      )}
                    </Flex>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[800], lineHeight: tokens.typography.lineHeight.relaxed, paddingLeft: 32 }}>{entry.text}</Text>
                    {/* Inline evidence markers */}
                    {entryEvidence.length > 0 && (
                      <Flex gap={4} wrap="wrap" style={{ paddingLeft: 32, marginTop: tokens.spacing[1] }}>
                        {entryEvidence.map(em => {
                          const ic = impactClrs[em.impact];
                          return (
                            <Box key={em.id} style={{ padding: `${tokens.spacing[0]}px ${tokens.spacing[1]}px`, borderRadius: tokens.borderRadius.full, background: ic.bgColor }}>
                              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: ic.color }}>{em.dimension} ({em.impact})</Text>
                            </Box>
                          );
                        })}
                      </Flex>
                    )}
                  </Box>
                );
              })}
            </Stack>
          </Box>

          {/* Score Panel */}
          {showOverlay && scoreSummary && (
            <Box style={{ width: 280, overflowY: 'auto', padding: tokens.spacing[3], background: tokens.colors.neutral[50], borderLeft: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` }}>
              {/* Overall Score */}
              <Box style={{ textAlign: 'center' as const, marginBottom: tokens.spacing[4] }}>
                <Text style={createSectionHeaderStyle(tokens)}>Overall Score</Text>
                <Text style={{ fontSize: tokens.typography.fontSize['4xl'], fontWeight: tokens.typography.fontWeight.semibold, color: getScoreBarColor(scoreSummary.overall, scoreSummary.maxScore, tokens) }}>
                  {scoreSummary.overall}
                </Text>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>/ {scoreSummary.maxScore}</Text>
              </Box>

              {/* Dimension Scores */}
              <Text style={{ ...createSectionHeaderStyle(tokens), marginBottom: tokens.spacing[2] }}>Dimensions</Text>
              <Stack gap={8}>
                {scoreSummary.dimensions.map(dim => {
                  const pct = dim.maxScore > 0 ? (dim.score / dim.maxScore) * 100 : 0;
                  const progressStyles = createProgressBarStyle(tokens, { color: getScoreBarColor(dim.score, dim.maxScore, tokens), percent: pct });
                  return (
                    <Box key={dim.code}>
                      <Flex justify="between" style={{ marginBottom: 3 }}>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[700] }}>{dim.name}</Text>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>{dim.score}/{dim.maxScore}</Text>
                      </Flex>
                      <Box style={{ ...progressStyles.track, height: 5 }}>
                        <div style={progressStyles.fill} />
                      </Box>
                    </Box>
                  );
                })}
              </Stack>

              {/* Strengths & Weaknesses */}
              {scoreSummary.strengths.length > 0 && (
                <Box style={{ marginTop: tokens.spacing[3] }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.successScale[700], marginBottom: tokens.spacing[1] }}>Strengths</Text>
                  <Stack gap={3}>
                    {scoreSummary.strengths.map((s, i) => (
                      <Flex key={i} gap={4} align="center">
                        <Box style={createStatusDotStyle(tokens, tokens.colors.successScale[500])} />
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[700] }}>{s}</Text>
                      </Flex>
                    ))}
                  </Stack>
                </Box>
              )}
              {scoreSummary.weaknesses.length > 0 && (
                <Box style={{ marginTop: tokens.spacing[2] }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.errorScale[700], marginBottom: tokens.spacing[1] }}>Weaknesses</Text>
                  <Stack gap={3}>
                    {scoreSummary.weaknesses.map((w, i) => (
                      <Flex key={i} gap={4} align="center">
                        <Box style={createStatusDotStyle(tokens, tokens.colors.errorScale[500])} />
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[700] }}>{w}</Text>
                      </Flex>
                    ))}
                  </Stack>
                </Box>
              )}

              {/* Persona Info */}
              {persona && (
                <Box style={{ marginTop: tokens.spacing[3], ...createCardStyle(tokens, { glass: isGlass, padding: tokens.spacing[2] }) }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], marginBottom: tokens.spacing[1] }}>AI Persona</Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[800] }}>{persona.name}</Text>
                  <Flex gap={6} style={{ marginTop: tokens.spacing[1] }}>
                    <Box style={{ padding: `${tokens.spacing[0]}px ${tokens.spacing[1]}px`, borderRadius: tokens.borderRadius.full, background: tokens.colors.neutral[100] }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>{persona.tone}</Text>
                    </Box>
                    <Box style={{ padding: `${tokens.spacing[0]}px ${tokens.spacing[1]}px`, borderRadius: tokens.borderRadius.full, background: tokens.colors.neutral[100] }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>{persona.style}</Text>
                    </Box>
                  </Flex>
                </Box>
              )}
            </Box>
          )}
        </Flex>
      </Box>
    );
  },
});
