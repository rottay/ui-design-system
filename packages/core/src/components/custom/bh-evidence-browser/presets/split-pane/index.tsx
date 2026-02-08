'use client';

/**
 * BhEvidenceBrowser - Split Pane Preset
 * Full split-pane layout: transcript left, evidence sidebar right
 */

import { useState } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { BhEvidenceBrowserProps, EvidenceImpact } from '../../core';
import { getImpactColors, getImpactLabel, getSpeakerColors } from '../../core';
import {
  createCardStyle,
  createEmptyStateStyle,
  createFilterPillStyle,
  createHoverStyle,
  createInteractiveCardStyle,
  createListItemStyle,
  createPanelHeaderStyle,
  createSectionHeaderStyle,
  createStatusDotStyle,
} from '../../../helpers';

export const SplitPaneBhEvidenceBrowser = createPreset<BhEvidenceBrowserProps>({
  name: 'BhEvidenceBrowser.SplitPane',
  render: ({ primitives, props, tokens, engine }: PresetContext<BhEvidenceBrowserProps>) => {
    const { Box, Flex, Stack, Text } = primitives;
    const isGlass = engine === 'modern' && !!tokens.glass;
    const impactColors = getImpactColors(tokens);
    const speakerColors = getSpeakerColors(tokens);

    const {
      transcript,
      evidence,
      dimensions = [],
      selectedEvidenceId: selectedEvidenceIdProp,
      onEvidenceSelect,
      onValidate,
      filter,
      onFilterChange,
      candidateName,
      interviewTitle,
      loading,
      className,
      style,
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

    if (loading) {
      return (
        <Flex align="center" justify="center" style={{ padding: tokens.spacing[8], ...style }} className={className}>
          <Text style={{ color: tokens.colors.neutral[500] }}>Loading evidence...</Text>
        </Flex>
      );
    }

    return (
      <Box className={className} style={{ ...createCardStyle(tokens, { glass: isGlass, padding: 0, elevation: 'md' }), overflow: 'hidden', ...style }}>
        {/* Header */}
        <Flex align="center" justify="between" style={createPanelHeaderStyle(tokens)}>
          <Stack gap={2}>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>
              {interviewTitle ?? 'Evidence Browser'}
            </Text>
            {candidateName && (
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{candidateName}</Text>
            )}
          </Stack>
          <Flex gap={8}>
            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
              {filteredEvidence.length} evidence items
            </Text>
          </Flex>
        </Flex>

        {/* Filters */}
        <Flex gap={8} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }} wrap="wrap">
          <Flex gap={4} align="center">
            <Text style={createSectionHeaderStyle(tokens)}>Dimension:</Text>
            <Box
              onClick={() => handleFilterChange({ ...activeFilter, dimension: undefined })}
              style={createFilterPillStyle(tokens, { active: !activeFilter.dimension })}
            >
              <Text style={{ fontSize: tokens.typography.fontSize.xs }}>All</Text>
            </Box>
            {uniqueDimensions.map(dim => (
              <Box
                key={dim}
                onClick={() => handleFilterChange({ ...activeFilter, dimension: dim })}
                style={createFilterPillStyle(tokens, { active: activeFilter.dimension === dim })}
              >
                <Text style={{ fontSize: tokens.typography.fontSize.xs }}>{dim}</Text>
              </Box>
            ))}
          </Flex>
          <Flex gap={4} align="center">
            <Text style={createSectionHeaderStyle(tokens)}>Impact:</Text>
            <Box
              onClick={() => handleFilterChange({ ...activeFilter, impact: undefined })}
              style={createFilterPillStyle(tokens, { active: !activeFilter.impact })}
            >
              <Text style={{ fontSize: tokens.typography.fontSize.xs }}>All</Text>
            </Box>
            {impactOptions.map(imp => (
              <Box
                key={imp}
                onClick={() => handleFilterChange({ ...activeFilter, impact: imp })}
                style={{
                  ...createFilterPillStyle(tokens, { active: activeFilter.impact === imp }),
                  ...(activeFilter.impact === imp ? { backgroundColor: impactColors[imp].bgColor, color: impactColors[imp].color, borderColor: impactColors[imp].border } : {}),
                }}
              >
                <Text style={{ fontSize: tokens.typography.fontSize.xs }}>{getImpactLabel(imp)}</Text>
              </Box>
            ))}
          </Flex>
        </Flex>

        {/* Split Pane */}
        <Flex style={{ height: 480 }}>
          {/* Transcript Panel */}
          <Box style={{ flex: 1, overflowY: 'auto', padding: tokens.spacing[4], borderRight: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` }}>
            <Stack gap={4}>
              {transcript.map(seg => {
                const isHighlighted = highlightedSegmentIds.has(seg.id);
                const sc = speakerColors[seg.speaker];
                return (
                  <Box
                    key={seg.id}
                    style={{
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                      borderRadius: tokens.borderRadius.md,
                      background: isHighlighted ? tokens.colors.warningScale[50] : 'transparent',
                      borderLeft: isHighlighted ? `3px solid ${tokens.colors.warningScale[400]}` : '3px solid transparent',
                      transition: `all ${tokens.motion.hover}`,
                    }}
                  >
                    <Flex gap={8} align="center" style={{ marginBottom: tokens.spacing[1] }}>
                      <Box style={createStatusDotStyle(tokens, sc.color)} />
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: sc.color }}>
                        {seg.speakerName}
                      </Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{seg.timestamp}</Text>
                    </Flex>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[800], lineHeight: tokens.typography.lineHeight.relaxed }}>{seg.text}</Text>
                  </Box>
                );
              })}
            </Stack>
          </Box>

          {/* Evidence Sidebar */}
          <Box style={{ width: 320, overflowY: 'auto', padding: tokens.spacing[3], background: tokens.colors.neutral[50] }}>
            <Text style={{ ...createSectionHeaderStyle(tokens), marginBottom: tokens.spacing[2] }}>
              Evidence ({filteredEvidence.length})
            </Text>
            <Stack gap={8}>
              {filteredEvidence.map(ev => {
                const ic = impactColors[ev.impact];
                const isSelected = selectedEvidenceId === ev.id;
                return (
                  <Box
                    key={ev.id}
                    onClick={() => handleEvidenceSelect(ev.id)}
                    style={{
                      ...createInteractiveCardStyle(tokens, { active: isSelected }),
                      padding: tokens.spacing[2],
                    }}
                  >
                    <Flex justify="between" align="center" style={{ marginBottom: tokens.spacing[1] }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>
                        {ev.dimensionCode}
                      </Text>
                      <Box style={{ padding: `${tokens.spacing[0]}px ${tokens.spacing[1]}px`, borderRadius: tokens.borderRadius.full, background: ic.bgColor, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${ic.border}` }}>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: ic.color, fontWeight: tokens.typography.fontWeight.semibold }}>
                          {getImpactLabel(ev.impact)}
                        </Text>
                      </Box>
                    </Flex>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700], fontStyle: 'italic', lineHeight: tokens.typography.lineHeight.normal }}>
                      &ldquo;{ev.quote.length > 120 ? `${ev.quote.slice(0, 120)}...` : ev.quote}&rdquo;
                    </Text>
                    <Flex justify="between" align="center" style={{ marginTop: tokens.spacing[1] }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Score: {ev.score}</Text>
                      {onValidate && (
                        <Box
                          onClick={(e: React.MouseEvent) => { e.stopPropagation(); onValidate(ev.id, !ev.validated); }}
                          style={{
                            padding: `${tokens.spacing[0]}px ${tokens.spacing[1]}px`,
                            borderRadius: tokens.borderRadius.full,
                            background: ev.validated ? tokens.colors.successScale[50] : tokens.colors.neutral[100],
                            cursor: 'pointer',
                            transition: `all ${tokens.motion.hover}`,
                          }}
                        >
                          <Text style={{ fontSize: tokens.typography.fontSize.xs, color: ev.validated ? tokens.colors.successScale[700] : tokens.colors.neutral[500] }}>
                            {ev.validated ? 'Validated' : 'Validate'}
                          </Text>
                        </Box>
                      )}
                    </Flex>
                  </Box>
                );
              })}
              {filteredEvidence.length === 0 && (
                <Box style={createEmptyStateStyle(tokens)}>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>
                    No evidence matches the current filters
                  </Text>
                </Box>
              )}
            </Stack>
          </Box>
        </Flex>
      </Box>
    );
  },
});
