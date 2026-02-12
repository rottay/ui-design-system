'use client';

/**
 * BhInterviewReplay - Full Preset
 * Slite-inspired split layout: transcript player left, score overlay + evidence right,
 * with generous whitespace, warm neutrals, and clean filter pills.
 */

import { useState, useMemo } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { BhInterviewReplayProps, TranscriptEntry } from '../../core';
import { getSpeakerColors, getImpactColors, getScoreBarColor } from '../../core';
import { createCardStyle, createBadgeStyle } from '../../../helpers';
import { PlayCircle, BarChart3, Eye, EyeOff, Calendar, Clock, Bot } from 'lucide-react';

const MOCK_TRANSCRIPT: TranscriptEntry[] = [
  { id: 't-1', speaker: 'interviewer', speakerName: 'AI Interviewer', text: 'Welcome! Could you walk me through a challenging technical project you led recently?', timestamp: '00:00', confidence: 0.98 },
  { id: 't-2', speaker: 'candidate', speakerName: 'Sarah Chen', text: 'Sure. I led the migration of our monolithic API to a microservices architecture. We had about 2 million daily active users, so zero-downtime was critical.', timestamp: '00:12', confidence: 0.95, hasEvidence: true },
  { id: 't-3', speaker: 'interviewer', speakerName: 'AI Interviewer', text: 'What was the biggest technical challenge you faced during the migration?', timestamp: '00:45', confidence: 0.97 },
  { id: 't-4', speaker: 'candidate', speakerName: 'Sarah Chen', text: 'Data consistency across services was the hardest part. We implemented an event-sourcing pattern with eventual consistency, and built a reconciliation system to catch discrepancies.', timestamp: '01:02', confidence: 0.92, hasEvidence: true },
  { id: 't-5', speaker: 'interviewer', speakerName: 'AI Interviewer', text: 'How did you handle team coordination across the different service teams?', timestamp: '01:38', confidence: 0.96 },
  { id: 't-6', speaker: 'candidate', speakerName: 'Sarah Chen', text: 'I set up weekly architecture review meetings and created shared API contracts using OpenAPI specs. Each team owned their service but followed common patterns we established together.', timestamp: '01:55', confidence: 0.94, hasEvidence: true },
];

export const FullBhInterviewReplay = createPreset<BhInterviewReplayProps>({
  name: 'BhInterviewReplay.Full',
  render: ({ primitives, props, tokens }: PresetContext<BhInterviewReplayProps>) => {
    const { Box, Text } = primitives;
    const speakerColors = getSpeakerColors(tokens);
    const impactClrs = getImpactColors(tokens);

    const {
      transcript = MOCK_TRANSCRIPT, scoreOverlay = [], evidenceMarkers = [],
      persona, scoreSummary, candidateName, jobTitle,
      interviewDate, duration,
      selectedEntryId: selectedEntryIdProp, onEntrySelect,
      showScoreOverlay: showScoreOverlayProp, onToggleScoreOverlay,
      loading, className, style,
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
        <Box className={className} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: `${tokens.spacing[10]}px`, ...style,
        }}>
          <Text style={{ color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>Loading replay...</Text>
        </Box>
      );
    }

    return (
      <Box className={className} style={{
        ...createCardStyle(tokens, { elevation: 'sm', padding: 0 }),
        borderRadius: tokens.borderRadius.lg,
        border: `1px solid ${tokens.colors.neutral[100]}`,
        overflow: 'hidden', ...style,
      }}>
        {/* Header */}
        <Box style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: `${tokens.spacing[5]}px ${tokens.spacing[6]}px`,
          borderBottom: `1px solid ${tokens.colors.neutral[100]}`,
        }}>
          <Box>
            <Text style={{
              fontSize: tokens.typography.fontSize.md,
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
            }}>
              {candidateName ?? 'Interview Replay'}
            </Text>
            <Box style={{ display: 'flex', gap: tokens.spacing[3], marginTop: tokens.spacing[1] }}>
              {jobTitle && <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{jobTitle}</Text>}
              {interviewDate && (
                <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                  <Calendar size={10} color={tokens.colors.neutral[400]} />
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{interviewDate}</Text>
                </Box>
              )}
              {duration && (
                <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                  <Clock size={10} color={tokens.colors.neutral[400]} />
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{duration}</Text>
                </Box>
              )}
            </Box>
          </Box>
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
            {persona && (
              <Box style={{
                padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                borderRadius: tokens.borderRadius.full,
                background: tokens.colors.secondaryScale[50],
                border: `1px solid ${tokens.colors.secondaryScale[200]}`,
                display: 'flex', alignItems: 'center', gap: tokens.spacing[1],
              }}>
                <Bot size={10} color={tokens.colors.secondaryScale[700]} />
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.secondaryScale[700] }}>{persona.name}</Text>
              </Box>
            )}
            <Box
              onClick={toggleOverlay}
              style={{
                padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                borderRadius: tokens.borderRadius.full,
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: showOverlay ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.medium,
                backgroundColor: showOverlay ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                color: showOverlay ? tokens.colors.primaryScale[700] : tokens.colors.neutral[500],
                border: `1px solid ${showOverlay ? tokens.colors.primaryScale[200] : tokens.colors.neutral[200]}`,
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
                display: 'flex', alignItems: 'center', gap: tokens.spacing[1],
              }}
            >
              {showOverlay ? <Eye size={12} /> : <EyeOff size={12} />}
              <Text style={{ fontSize: tokens.typography.fontSize.xs }}>Scores {showOverlay ? 'ON' : 'OFF'}</Text>
            </Box>
          </Box>
        </Box>

        {/* Split Layout */}
        <Box style={{ display: 'flex', height: 520 }}>
          {/* Transcript */}
          <Box style={{ flex: 1, overflowY: 'auto' as const, padding: `${tokens.spacing[5]}px ${tokens.spacing[6]}px` }}>
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[3] }}>
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
                      padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                      borderRadius: tokens.borderRadius.lg,
                      background: isSelected ? tokens.colors.primaryScale[50] : hasEvidence ? tokens.colors.warningScale[50] : 'transparent',
                      borderLeft: hasEvidence ? `3px solid ${tokens.colors.warningScale[400]}` : '3px solid transparent',
                      cursor: 'pointer',
                      transition: `all ${tokens.motion.hover}`,
                    }}
                  >
                    <Box style={{ display: 'flex', gap: tokens.spacing[2], alignItems: 'center', marginBottom: tokens.spacing[2] }}>
                      <Box style={{
                        width: 24, height: 24, borderRadius: tokens.borderRadius.full,
                        background: sc.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: `1px solid ${sc.border}`,
                      }}>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: sc.color }}>
                          {entry.speaker === 'candidate' ? 'C' : entry.speaker === 'interviewer' ? 'I' : 'S'}
                        </Text>
                      </Box>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: sc.color }}>{entry.speakerName}</Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{entry.timestamp}</Text>
                      {entry.confidence !== undefined && (
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>({(entry.confidence * 100).toFixed(0)}%)</Text>
                      )}
                    </Box>
                    <Text style={{
                      fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[800],
                      lineHeight: tokens.typography.lineHeight.relaxed, paddingLeft: 32,
                    }}>{entry.text}</Text>
                    {/* Inline evidence markers */}
                    {entryEvidence.length > 0 && (
                      <Box style={{ display: 'flex', gap: tokens.spacing[1], flexWrap: 'wrap' as const, paddingLeft: 32, marginTop: tokens.spacing[1] }}>
                        {entryEvidence.map(em => {
                          const ic = impactClrs[em.impact];
                          return (
                            <Box key={em.id} style={{
                              padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                              borderRadius: tokens.borderRadius.full, background: ic.bgColor,
                            }}>
                              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: ic.color }}>{em.dimension} ({em.impact})</Text>
                            </Box>
                          );
                        })}
                      </Box>
                    )}
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* Score Panel */}
          {showOverlay && scoreSummary && (
            <Box style={{
              width: 300, overflowY: 'auto' as const,
              padding: `${tokens.spacing[5]}px ${tokens.spacing[4]}px`,
              background: tokens.colors.neutral[50],
              borderLeft: `1px solid ${tokens.colors.neutral[100]}`,
            }}>
              {/* Overall Score */}
              <Box style={{ textAlign: 'center' as const, marginBottom: tokens.spacing[5] }}>
                <Text style={{
                  fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.neutral[500], textTransform: 'uppercase' as const,
                  letterSpacing: '0.05em', marginBottom: tokens.spacing[2],
                }}>Overall Score</Text>
                <Text style={{
                  fontSize: tokens.typography.fontSize['4xl'], fontWeight: tokens.typography.fontWeight.bold,
                  color: getScoreBarColor(scoreSummary.overall, scoreSummary.maxScore, tokens),
                }}>
                  {scoreSummary.overall}
                </Text>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>/ {scoreSummary.maxScore}</Text>
              </Box>

              {/* Dimension Scores */}
              <Text style={{
                fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[500], textTransform: 'uppercase' as const,
                letterSpacing: '0.05em', marginBottom: tokens.spacing[3],
              }}>Dimensions</Text>
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[3] }}>
                {scoreSummary.dimensions.map(dim => {
                  const pct = dim.maxScore > 0 ? (dim.score / dim.maxScore) * 100 : 0;
                  const barColor = getScoreBarColor(dim.score, dim.maxScore, tokens);
                  return (
                    <Box key={dim.code}>
                      <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[700] }}>{dim.name}</Text>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>{dim.score}/{dim.maxScore}</Text>
                      </Box>
                      <Box style={{ height: 5, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.neutral[100], overflow: 'hidden' }}>
                        <Box style={{ height: '100%', width: `${pct}%`, borderRadius: tokens.borderRadius.full, backgroundColor: barColor, transition: 'width 0.3s ease' }} />
                      </Box>
                    </Box>
                  );
                })}
              </Box>

              {/* Strengths & Weaknesses */}
              {scoreSummary.strengths.length > 0 && (
                <Box style={{ marginTop: tokens.spacing[4] }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.successScale[700], marginBottom: tokens.spacing[2] }}>Strengths</Text>
                  <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1] }}>
                    {scoreSummary.strengths.map((s, i) => (
                      <Box key={i} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                        <Box style={{ width: 6, height: 6, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.successScale[500] }} />
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[700] }}>{s}</Text>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
              {scoreSummary.weaknesses.length > 0 && (
                <Box style={{ marginTop: tokens.spacing[3] }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.errorScale[700], marginBottom: tokens.spacing[2] }}>Weaknesses</Text>
                  <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1] }}>
                    {scoreSummary.weaknesses.map((w, i) => (
                      <Box key={i} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                        <Box style={{ width: 6, height: 6, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.errorScale[500] }} />
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[700] }}>{w}</Text>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              {/* Persona Info */}
              {persona && (
                <Box style={{
                  marginTop: tokens.spacing[4],
                  padding: `${tokens.spacing[3]}px ${tokens.spacing[3]}px`,
                  borderRadius: tokens.borderRadius.lg,
                  backgroundColor: tokens.colors.common.white,
                  border: `1px solid ${tokens.colors.neutral[100]}`,
                }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], marginBottom: tokens.spacing[1] }}>AI Persona</Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[800] }}>{persona.name}</Text>
                  <Box style={{ display: 'flex', gap: tokens.spacing[2], marginTop: tokens.spacing[2] }}>
                    <Box style={{ padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.full, background: tokens.colors.neutral[100] }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>{persona.tone}</Text>
                    </Box>
                    <Box style={{ padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.full, background: tokens.colors.neutral[100] }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>{persona.style}</Text>
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Box>
    );
  },
});
