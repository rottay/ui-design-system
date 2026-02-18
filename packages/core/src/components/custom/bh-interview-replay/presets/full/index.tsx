'use client';

/**
 * BhInterviewReplay - Full Preset
 * Split layout: transcript player left, score overlay + evidence right.
 * Personality-driven, glass-aware, accessible.
 */

import { useState, useMemo, useCallback } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { BhInterviewReplayProps, TranscriptEntry } from '../../core';
import { getSpeakerColors, getImpactColors, getScoreBarColor } from '../../core';
import {
  createCardStyle,
  createBadgeStyle,
  createCardHoverStyles,
  createEntranceAnimation,
  createStaggerDelay,
  createIconContainerStyle,
  createPersonalitySectionHeaderStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createPersonalityAccentBar,
  createEmptyStateStyle,
  getAccentAwareLayout,
  ICON_SIZES,
} from '../../../helpers';
import { PlayCircle, BarChart3, Eye, EyeOff, Calendar, Clock, Bot, AlertTriangle, Coins } from 'lucide-react';
import type { DesignTokens } from '../../../../../types';

export const FullBhInterviewReplay = createPreset<BhInterviewReplayProps>({
  name: 'BhInterviewReplay.Full',
  render: ({ primitives, props, tokens }: PresetContext<BhInterviewReplayProps>) => {
    const { Box, Text } = primitives;
    const speakerColors = useMemo(() => getSpeakerColors(tokens), [tokens]);
    const impactClrs = useMemo(() => getImpactColors(tokens), [tokens]);
    const personalityTypo = useMemo(() => getPersonalityTypography(tokens), [tokens]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(tokens), [tokens]);
    const sectionHeaderStyle = useMemo(() => createPersonalitySectionHeaderStyle(tokens), [tokens]);
    const cardHover = useMemo(() => createCardHoverStyles(tokens), [tokens]);
    const entranceAnim = useMemo(() => createEntranceAnimation(tokens, { index: 0 }), [tokens]);
    const accentBar = useMemo(() => createPersonalityAccentBar(tokens), [tokens]);
    const accentLayout = useMemo(() => getAccentAwareLayout(tokens), [tokens]);

    const isGlass = tokens.surface.useGlass && !!tokens.glass;

    const {
      transcript: rawTranscript = [], scoreOverlay: rawScoreOverlay = [], evidenceMarkers: rawEvidenceMarkers = [],
      persona, scoreSummary, candidateName, jobTitle,
      interviewDate, duration,
      interview: interviewProp,
      proctoringFlags: rawProctoringFlags = [],
      tokenBreakdown: tokenBreakdownProp,
      selectedEntryId: selectedEntryIdProp, onEntrySelect,
      showScoreOverlay: showScoreOverlayProp, onToggleScoreOverlay,
      loading, className, style,
    } = props;

    const transcript = Array.isArray(rawTranscript) ? rawTranscript : [];
    const scoreOverlay = Array.isArray(rawScoreOverlay) ? rawScoreOverlay : [];
    const evidenceMarkers = Array.isArray(rawEvidenceMarkers) ? rawEvidenceMarkers : [];
    const proctoringFlags = Array.isArray(rawProctoringFlags) ? rawProctoringFlags : [];
    const tokenBreakdown = tokenBreakdownProp ?? {};
    const interview = interviewProp ?? undefined;

    const [internalSelectedId, setInternalSelectedId] = useState(selectedEntryIdProp ?? '');
    const [internalShowOverlay, setInternalShowOverlay] = useState(showScoreOverlayProp ?? true);

    const selectedEntryId = selectedEntryIdProp ?? internalSelectedId;
    const showOverlay = showScoreOverlayProp ?? internalShowOverlay;

    const handleEntrySelect = useCallback((id: string) => {
      setInternalSelectedId(id);
      onEntrySelect?.(id);
    }, [onEntrySelect]);

    const toggleOverlay = useCallback(() => {
      const next = !showOverlay;
      setInternalShowOverlay(next);
      onToggleScoreOverlay?.(next);
    }, [showOverlay, onToggleScoreOverlay]);

    const handleOverlayKeyDown = useCallback((e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleOverlay();
      }
    }, [toggleOverlay]);

    const evidenceByEntry = useMemo(() => {
      const map = new Map<string, typeof evidenceMarkers>();
      evidenceMarkers.forEach(em => {
        const existing = map.get(em.transcriptEntryId) ?? [];
        existing.push(em);
        map.set(em.transcriptEntryId, existing);
      });
      return map;
    }, [evidenceMarkers]);

    const cardStyle = useMemo(() => ({
      ...createCardStyle(tokens, { elevation: 'sm' as const, padding: 0, glass: isGlass }),
      borderRadius: tokens.borderRadius.lg,
      overflow: 'hidden' as const,
      ...entranceAnim.animate,
      transition: entranceAnim.transition,
    }), [tokens, isGlass, entranceAnim]);

    const headerIconStyle = useMemo(
      () => createIconContainerStyle(tokens, { size: 32, color: tokens.colors.primaryScale[50] }),
      [tokens],
    );

    if (loading) {
      return (
        <Box className={className} style={{
          ...createEmptyStateStyle(tokens),
          ...style,
        }}>
          <Text style={{ color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>Loading replay...</Text>
        </Box>
      );
    }

    return (
      <Box className={className} style={{ ...cardStyle, ...style }}>
        {/* Accent bar */}
        {accentBar && <Box style={accentBar} />}

        <Box style={accentLayout.inner}>

        {/* Header */}
        <Box style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: `${tokens.spacing[5]}px ${tokens.spacing[6]}px`,
          borderBottom: `1px solid ${tokens.colors.neutral[100]}`,
          backgroundColor: tokens.colors.neutral[50],
        }}>
          <Box style={{ display: 'flex', flexDirection: 'column' as const }}>
            <Text style={{
              fontSize: tokens.typography.fontSize.md,
              fontWeight: personalityTypo.headingWeight,
              color: tokens.colors.neutral[900],
              letterSpacing: personalityTypo.headingLetterSpacing,
            }}>
              {candidateName ?? 'Interview Replay'}
            </Text>
            <Box style={{ display: 'flex', gap: tokens.spacing[3], marginTop: tokens.spacing[1] }}>
              {jobTitle && <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{jobTitle}</Text>}
              {interviewDate && (
                <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                  <Calendar size={ICON_SIZES.inline} color={tokens.colors.neutral[400]} />
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{interviewDate}</Text>
                </Box>
              )}
              {duration && (
                <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                  <Clock size={ICON_SIZES.inline} color={tokens.colors.neutral[400]} />
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{duration}</Text>
                </Box>
              )}
              {props.recordingDurationSeconds != null && (
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                  Rec: {Math.floor(props.recordingDurationSeconds / 60)}m {props.recordingDurationSeconds % 60}s
                </Text>
              )}
            </Box>
          </Box>
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
            {persona && (
              <Box style={{
                padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                borderRadius: badgeRadius,
                background: tokens.colors.secondaryScale[50],
                border: `1px solid ${tokens.colors.secondaryScale[200]}`,
                display: 'flex', alignItems: 'center', gap: tokens.spacing[1],
              }}>
                <Bot size={ICON_SIZES.inline} color={tokens.colors.secondaryScale[700]} />
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.secondaryScale[700] }}>{persona.name}</Text>
              </Box>
            )}
            {props.billingMode && (
              <Box style={{
                padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                borderRadius: badgeRadius,
                background: tokens.colors.infoScale[50],
                border: `1px solid ${tokens.colors.infoScale[200]}`,
              }}>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.infoScale[700] }}>{props.billingMode.replace(/_/g, ' ')}</Text>
              </Box>
            )}
            {props.proctoringScore != null && (
              <Box style={{
                padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                borderRadius: badgeRadius,
                background: props.proctoringScore >= 80 ? tokens.colors.successScale[50] : props.proctoringScore >= 50 ? tokens.colors.warningScale[50] : tokens.colors.errorScale[50],
                border: `1px solid ${props.proctoringScore >= 80 ? tokens.colors.successScale[200] : props.proctoringScore >= 50 ? tokens.colors.warningScale[200] : tokens.colors.errorScale[200]}`,
              }}>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: props.proctoringScore >= 80 ? tokens.colors.successScale[700] : props.proctoringScore >= 50 ? tokens.colors.warningScale[700] : tokens.colors.errorScale[700] }}>
                  Proctor: {props.proctoringScore}%
                </Text>
              </Box>
            )}
            {props.candidateRating != null && (
              <Box style={{
                padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                borderRadius: badgeRadius,
                background: tokens.colors.warningScale[50],
                border: `1px solid ${tokens.colors.warningScale[200]}`,
              }}>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.warningScale[700] }}>
                  Rating: {props.candidateRating}/5
                </Text>
              </Box>
            )}
            <Box
              role="button"
              tabIndex={0}
              aria-label={showOverlay ? 'Hide score overlay' : 'Show score overlay'}
              aria-pressed={showOverlay}
              onClick={toggleOverlay}
              onKeyDown={handleOverlayKeyDown}
              style={{
                padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                borderRadius: badgeRadius,
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
              {showOverlay ? <Eye size={ICON_SIZES.label} /> : <EyeOff size={ICON_SIZES.label} />}
              <Text style={{ fontSize: tokens.typography.fontSize.xs }}>Scores {showOverlay ? 'ON' : 'OFF'}</Text>
            </Box>
          </Box>
        </Box>

        {/* Split Layout */}
        <Box style={{ display: 'flex', height: 520 }}>
          {/* Transcript */}
          <Box style={{ flex: 1, minWidth: 0, overflowY: 'auto' as const, padding: `${tokens.spacing[5]}px ${tokens.spacing[6]}px` }}>
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[3] }}>
              {transcript.map((entry, idx) => {
                const sc = speakerColors[entry.speaker];
                const isSelected = selectedEntryId === entry.id;
                const entryEvidence = evidenceByEntry.get(entry.id) ?? [];
                const hasEvidence = entryEvidence.length > 0 || entry.hasEvidence;
                const staggerDelay = createStaggerDelay(tokens, idx);
                const entryAnim = createEntranceAnimation(tokens, { index: idx });

                return (
                  <Box
                    key={entry.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`${entry.speakerName} at ${entry.timestamp}: ${entry.text.substring(0, 60)}...`}
                    aria-selected={isSelected}
                    onClick={() => handleEntrySelect(entry.id)}
                    onKeyDown={(e: React.KeyboardEvent) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleEntrySelect(entry.id);
                      }
                    }}
                    style={{
                      padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                      borderRadius: tokens.borderRadius.lg,
                      background: isSelected ? tokens.colors.primaryScale[50] : hasEvidence ? tokens.colors.warningScale[50] : 'transparent',
                      borderLeft: hasEvidence ? `3px solid ${tokens.colors.warningScale[400]}` : '3px solid transparent',
                      cursor: 'pointer',
                      transition: `all ${tokens.motion.hover}`,
                      ...entryAnim.animate,
                    }}
                  >
                    <Box style={{ display: 'flex', gap: tokens.spacing[2], alignItems: 'center', marginBottom: tokens.spacing[2] }}>
                      <Box style={createIconContainerStyle(tokens, { size: 24, color: sc.bgColor })}>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: sc.color }}>
                          {entry.speaker === 'candidate' ? 'C' : entry.speaker === 'interviewer' ? 'I' : 'S'}
                        </Text>
                      </Box>
                      <Text style={{
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: personalityTypo.headingWeight,
                        color: sc.color,
                        letterSpacing: personalityTypo.labelLetterSpacing,
                        textTransform: personalityTypo.labelTransform,
                      }}>{entry.speakerName}</Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{entry.timestamp}</Text>
                      {entry.confidence !== undefined && (
                        <Box style={{
                          ...createBadgeStyle(tokens, (entry.confidence ?? 0) >= 0.7 ? 'success' : (entry.confidence ?? 0) >= 0.4 ? 'warning' : 'error'),
                          borderRadius: badgeRadius,
                          padding: `0 ${tokens.spacing[1]}px`,
                        }}>
                          <Text style={{ fontSize: tokens.typography.fontSize.xs }}>{((entry.confidence ?? 0) * 100).toFixed(0)}%</Text>
                        </Box>
                      )}
                    </Box>
                    <Text style={{
                      fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[800],
                      lineHeight: tokens.typography.lineHeight.relaxed, paddingLeft: 32,
                      wordBreak: 'break-word' as const,
                    }}>{entry.text}</Text>
                    {/* Inline evidence markers */}
                    {entryEvidence.length > 0 && (
                      <Box style={{ display: 'flex', gap: tokens.spacing[1], flexWrap: 'wrap' as const, paddingLeft: 32, marginTop: tokens.spacing[1] }}>
                        {entryEvidence.map(em => {
                          const ic = impactClrs[em.impact];
                          return (
                            <Box key={em.id} style={{
                              padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                              borderRadius: badgeRadius, background: ic.bgColor,
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
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1], textAlign: 'center' as const, marginBottom: tokens.spacing[5] }}>
                <Text style={sectionHeaderStyle}>Overall Score</Text>
                <Text style={{
                  fontSize: tokens.typography.fontSize['4xl'],
                  fontWeight: personalityTypo.headingWeight,
                  color: getScoreBarColor(scoreSummary.overall, scoreSummary.maxScore, tokens),
                }}>
                  {scoreSummary.overall}
                </Text>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>/ {scoreSummary.maxScore}</Text>
              </Box>

              {/* Dimension Scores */}
              <Text style={{ ...sectionHeaderStyle, marginBottom: tokens.spacing[3] }}>Dimensions</Text>
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
                        <Box style={{ height: '100%', width: `${pct}%`, borderRadius: tokens.borderRadius.full, backgroundColor: barColor, transition: `width ${tokens.motion.hover}` }} />
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

              {/* Interview Details */}
              {interview && (
                <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1],
                  marginTop: tokens.spacing[4],
                  padding: `${tokens.spacing[3]}px ${tokens.spacing[3]}px`,
                  borderRadius: tokens.borderRadius.lg,
                  backgroundColor: tokens.colors.common.white,
                  border: `1px solid ${tokens.colors.neutral[100]}`,
                }}>
                  <Text style={{ ...sectionHeaderStyle, marginBottom: tokens.spacing[1] }}>Interview</Text>
                  {(interview as any).type && <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>Type: {(interview as any).type}</Text>}
                  {(interview as any).status && <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>Status: {(interview as any).status}</Text>}
                  {(interview as any).scheduledAt && <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Scheduled: {new Date((interview as any).scheduledAt).toLocaleDateString()}</Text>}
                </Box>
              )}

              {/* Proctoring Flags */}
              {proctoringFlags.length > 0 && (
                <Box style={{ marginTop: tokens.spacing[4] }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1], marginBottom: tokens.spacing[2] }}>
                    <AlertTriangle size={ICON_SIZES.label} color={tokens.colors.errorScale[500]} />
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.errorScale[700] }}>Proctoring Flags</Text>
                  </Box>
                  <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1] }}>
                    {proctoringFlags.map((flag, i) => (
                      <Box key={i} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                        <Box style={{ width: 6, height: 6, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.errorScale[400] }} />
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[700] }}>{flag}</Text>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              {/* Token Breakdown */}
              {Object.keys(tokenBreakdown).length > 0 && (
                <Box style={{ marginTop: tokens.spacing[4] }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1], marginBottom: tokens.spacing[2] }}>
                    <Coins size={ICON_SIZES.label} color={tokens.colors.warningScale[500]} />
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.warningScale[700] }}>Token Usage</Text>
                  </Box>
                  <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1] }}>
                    {Object.entries(tokenBreakdown).map(([key, val]) => (
                      <Box key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600], textTransform: 'capitalize' as const }}>{key.replace(/_/g, ' ')}</Text>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>{(val as number).toLocaleString()}</Text>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              {/* Persona Info */}
              {persona && (
                <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1],
                  marginTop: tokens.spacing[4],
                  padding: `${tokens.spacing[3]}px ${tokens.spacing[3]}px`,
                  borderRadius: tokens.borderRadius.lg,
                  backgroundColor: tokens.colors.common.white,
                  border: `1px solid ${tokens.colors.neutral[100]}`,
                }}>
                  <Text style={{ ...sectionHeaderStyle, marginBottom: tokens.spacing[1] }}>AI Persona</Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[800] }}>{persona.name}</Text>
                  <Box style={{ display: 'flex', gap: tokens.spacing[2], marginTop: tokens.spacing[2] }}>
                    <Box style={{ padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`, borderRadius: badgeRadius, background: tokens.colors.neutral[100] }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>{persona.tone}</Text>
                    </Box>
                    <Box style={{ padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`, borderRadius: badgeRadius, background: tokens.colors.neutral[100] }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>{persona.style}</Text>
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </Box>
        </Box>
      </Box>
    );
  },
});
