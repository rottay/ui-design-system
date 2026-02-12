'use client';

/**
 * BhEvidenceBrowser - Split Pane Preset
 * Slite-inspired full split-pane layout: transcript left, evidence sidebar right,
 * with generous whitespace, warm neutrals, and clean filter pills.
 */

import { useState, useMemo } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { BhEvidenceBrowserProps, EvidenceImpact, TranscriptSegment, EvidenceItem } from '../../core';
import { getImpactColors, getImpactLabel, getSpeakerColors } from '../../core';
import { createCardStyle, createBadgeStyle } from '../../../helpers';
import { FileSearch, Quote, CheckCircle2, Filter, MessageSquare } from 'lucide-react';

const MOCK_TRANSCRIPT: TranscriptSegment[] = [
  { id: 'ts-1', speaker: 'interviewer', speakerName: 'AI Interviewer', text: 'Can you describe your approach to system design?', timestamp: '00:00' },
  { id: 'ts-2', speaker: 'candidate', speakerName: 'Sarah Chen', text: 'I start by identifying the key requirements and constraints, then sketch out the high-level architecture focusing on scalability and reliability.', timestamp: '00:15', hasEvidence: true },
  { id: 'ts-3', speaker: 'interviewer', speakerName: 'AI Interviewer', text: 'How do you handle trade-offs between consistency and availability?', timestamp: '00:42' },
  { id: 'ts-4', speaker: 'candidate', speakerName: 'Sarah Chen', text: 'It depends on the use case. For payment systems I prioritize consistency, but for social feeds I lean toward availability with eventual consistency.', timestamp: '00:58', hasEvidence: true },
];

const MOCK_EVIDENCE: EvidenceItem[] = [
  { id: 'ev-1', quote: 'I start by identifying the key requirements and constraints', dimension: 'System Design', dimensionCode: 'SD', impact: 'positive', score: 8, transcriptSegmentId: 'ts-2', validated: true, timestamp: '00:15' },
  { id: 'ev-2', quote: 'focusing on scalability and reliability', dimension: 'Architecture', dimensionCode: 'ARCH', impact: 'strong_positive', score: 9, transcriptSegmentId: 'ts-2', validated: true, timestamp: '00:22' },
  { id: 'ev-3', quote: 'For payment systems I prioritize consistency', dimension: 'Trade-off Analysis', dimensionCode: 'TA', impact: 'positive', score: 7, transcriptSegmentId: 'ts-4', timestamp: '00:58' },
  { id: 'ev-4', quote: 'for social feeds I lean toward availability with eventual consistency', dimension: 'Trade-off Analysis', dimensionCode: 'TA', impact: 'positive', score: 8, transcriptSegmentId: 'ts-4', timestamp: '01:05' },
];

export const SplitPaneBhEvidenceBrowser = createPreset<BhEvidenceBrowserProps>({
  name: 'BhEvidenceBrowser.SplitPane',
  render: ({ primitives, props, tokens }: PresetContext<BhEvidenceBrowserProps>) => {
    const { Box, Text } = primitives;
    const impactColors = getImpactColors(tokens);
    const speakerColors = getSpeakerColors(tokens);

    const {
      transcript = MOCK_TRANSCRIPT, evidence = MOCK_EVIDENCE, dimensions = [],
      selectedEvidenceId: selectedEvidenceIdProp,
      onEvidenceSelect, onValidate, filter, onFilterChange,
      candidateName, interviewTitle, loading, className, style,
    } = props;

    const [internalSelectedId, setInternalSelectedId] = useState(selectedEvidenceIdProp ?? '');
    const [internalFilter, setInternalFilter] = useState<{ dimension?: string; impact?: EvidenceImpact }>({});

    const selectedEvidenceId = selectedEvidenceIdProp ?? internalSelectedId;
    const activeFilter = filter ?? internalFilter;

    const handleEvidenceSelect = (id: string) => {
      setInternalSelectedId(id);
      onEvidenceSelect?.(id);
    };

    const handleFilterChange = (newFilter: typeof activeFilter) => {
      setInternalFilter(newFilter);
      onFilterChange?.(newFilter as any);
    };

    const filteredEvidence = evidence.filter(e => {
      if (activeFilter.dimension && e.dimension !== activeFilter.dimension) return false;
      if (activeFilter.impact && e.impact !== activeFilter.impact) return false;
      return true;
    });

    const uniqueDimensions = dimensions.length > 0 ? dimensions : [...new Set(evidence.map(e => e.dimension))];
    const impactOptions: EvidenceImpact[] = ['strong_positive', 'positive', 'neutral', 'negative', 'strong_negative'];
    const highlightedSegmentIds = new Set(filteredEvidence.map(e => e.transcriptSegmentId).filter(Boolean));

    const pillStyle = (active: boolean) => ({
      padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
      borderRadius: tokens.borderRadius.full,
      fontSize: tokens.typography.fontSize.xs,
      fontWeight: active ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.medium,
      backgroundColor: active ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
      color: active ? tokens.colors.primaryScale[700] : tokens.colors.neutral[500],
      border: `1px solid ${active ? tokens.colors.primaryScale[200] : tokens.colors.neutral[200]}`,
      cursor: 'pointer',
      transition: `all ${tokens.motion.hover}`,
    });

    if (loading) {
      return (
        <Box className={className} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: `${tokens.spacing[10]}px`, ...style,
        }}>
          <Text style={{ color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>Loading evidence...</Text>
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
              {interviewTitle ?? 'Evidence Browser'}
            </Text>
            {candidateName && (
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], marginTop: 2 }}>{candidateName}</Text>
            )}
          </Box>
          <Box style={{
            ...createBadgeStyle(tokens, 'primary'),
            padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
          }}>
            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.primaryScale[700] }}>{filteredEvidence.length} items</Text>
          </Box>
        </Box>

        {/* Filters */}
        <Box style={{
          padding: `${tokens.spacing[3]}px ${tokens.spacing[6]}px`,
          borderBottom: `1px solid ${tokens.colors.neutral[100]}`,
          display: 'flex', gap: tokens.spacing[3], flexWrap: 'wrap' as const, alignItems: 'center',
        }}>
          <Filter size={14} color={tokens.colors.neutral[400]} />
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
            <Box onClick={() => handleFilterChange({ ...activeFilter, dimension: undefined })} style={pillStyle(!activeFilter.dimension)}>
              <Text style={{ fontSize: tokens.typography.fontSize.xs }}>All</Text>
            </Box>
            {uniqueDimensions.map(dim => (
              <Box key={dim} onClick={() => handleFilterChange({ ...activeFilter, dimension: dim })} style={pillStyle(activeFilter.dimension === dim)}>
                <Text style={{ fontSize: tokens.typography.fontSize.xs }}>{dim}</Text>
              </Box>
            ))}
          </Box>
          <Box style={{ width: 1, height: 16, backgroundColor: tokens.colors.neutral[200] }} />
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
            <Box onClick={() => handleFilterChange({ ...activeFilter, impact: undefined })} style={pillStyle(!activeFilter.impact)}>
              <Text style={{ fontSize: tokens.typography.fontSize.xs }}>All</Text>
            </Box>
            {impactOptions.map(imp => (
              <Box key={imp} onClick={() => handleFilterChange({ ...activeFilter, impact: imp })} style={{
                ...pillStyle(activeFilter.impact === imp),
                ...(activeFilter.impact === imp ? { backgroundColor: impactColors[imp].bgColor, color: impactColors[imp].color, borderColor: impactColors[imp].border } : {}),
              }}>
                <Text style={{ fontSize: tokens.typography.fontSize.xs }}>{getImpactLabel(imp)}</Text>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Split Pane */}
        <Box style={{ display: 'flex', height: 520 }}>
          {/* Transcript Panel */}
          <Box style={{
            flex: 1, overflowY: 'auto' as const,
            padding: `${tokens.spacing[5]}px ${tokens.spacing[6]}px`,
            borderRight: `1px solid ${tokens.colors.neutral[100]}`,
          }}>
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[3] }}>
              {transcript.map(seg => {
                const isHighlighted = highlightedSegmentIds.has(seg.id);
                const sc = speakerColors[seg.speaker];
                return (
                  <Box key={seg.id} style={{
                    padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                    borderRadius: tokens.borderRadius.lg,
                    background: isHighlighted ? tokens.colors.warningScale[50] : 'transparent',
                    borderLeft: isHighlighted ? `3px solid ${tokens.colors.warningScale[400]}` : '3px solid transparent',
                    transition: `all ${tokens.motion.hover}`,
                  }}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[2] }}>
                      <Box style={{
                        width: 8, height: 8, borderRadius: tokens.borderRadius.full,
                        backgroundColor: sc.color, flexShrink: 0,
                      }} />
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold, color: sc.color }}>{seg.speakerName}</Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{seg.timestamp}</Text>
                    </Box>
                    <Text style={{
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.neutral[700],
                      lineHeight: tokens.typography.lineHeight.relaxed,
                    }}>{seg.text}</Text>
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* Evidence Sidebar */}
          <Box style={{
            width: 340, overflowY: 'auto' as const,
            padding: `${tokens.spacing[4]}px ${tokens.spacing[4]}px`,
            background: tokens.colors.neutral[50],
          }}>
            <Text style={{
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[500],
              textTransform: 'uppercase' as const,
              letterSpacing: '0.05em',
              marginBottom: tokens.spacing[3],
            }}>
              Evidence ({filteredEvidence.length})
            </Text>
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[3] }}>
              {filteredEvidence.map(ev => {
                const ic = impactColors[ev.impact];
                const isSelected = selectedEvidenceId === ev.id;
                return (
                  <Box
                    key={ev.id}
                    onClick={() => handleEvidenceSelect(ev.id)}
                    style={{
                      padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                      borderRadius: tokens.borderRadius.lg,
                      backgroundColor: isSelected ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                      border: `1px solid ${isSelected ? tokens.colors.primaryScale[200] : tokens.colors.neutral[100]}`,
                      cursor: 'pointer',
                      transition: `all ${tokens.motion.hover}`,
                      boxShadow: tokens.shadows.sm,
                    }}
                  >
                    <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[2] }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[800] }}>{ev.dimensionCode}</Text>
                      <Box style={{
                        padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                        borderRadius: tokens.borderRadius.full,
                        background: ic.bgColor, border: `1px solid ${ic.border}`,
                      }}>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: ic.color, fontWeight: tokens.typography.fontWeight.semibold }}>{getImpactLabel(ev.impact)}</Text>
                      </Box>
                    </Box>
                    <Box style={{ display: 'flex', gap: tokens.spacing[2], marginBottom: tokens.spacing[2] }}>
                      <Quote size={10} color={tokens.colors.neutral[300]} style={{ flexShrink: 0, marginTop: 3 }} />
                      <Text style={{
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.neutral[600],
                        fontStyle: 'italic',
                        lineHeight: tokens.typography.lineHeight.normal,
                      }}>
                        {ev.quote.length > 120 ? `${ev.quote.slice(0, 120)}...` : ev.quote}
                      </Text>
                    </Box>
                    <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>Score: {ev.score}</Text>
                      {onValidate && (
                        <Box
                          onClick={(e: React.MouseEvent) => { e.stopPropagation(); onValidate(ev.id, !ev.validated); }}
                          style={{
                            padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                            borderRadius: tokens.borderRadius.full,
                            background: ev.validated ? tokens.colors.successScale[50] : tokens.colors.neutral[100],
                            cursor: 'pointer',
                            transition: `all ${tokens.motion.hover}`,
                          }}
                        >
                          <Text style={{
                            fontSize: tokens.typography.fontSize.xs,
                            color: ev.validated ? tokens.colors.successScale[700] : tokens.colors.neutral[500],
                            fontWeight: tokens.typography.fontWeight.medium,
                          }}>
                            {ev.validated ? 'Validated' : 'Validate'}
                          </Text>
                        </Box>
                      )}
                    </Box>
                  </Box>
                );
              })}
              {filteredEvidence.length === 0 && (
                <Box style={{
                  padding: `${tokens.spacing[6]}px ${tokens.spacing[4]}px`,
                  textAlign: 'center' as const,
                }}>
                  <FileSearch size={24} color={tokens.colors.neutral[300]} style={{ marginBottom: tokens.spacing[2] }} />
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>
                    No evidence matches the current filters
                  </Text>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    );
  },
});
