'use client';

/**
 * BhEvidenceBrowser - Compact Preset
 * Single-column evidence list without transcript panel
 */

import { useState } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { BhEvidenceBrowserProps } from '../../core';
import { getImpactColors, getImpactLabel } from '../../core';
import {
  createCardStyle,
  createPanelHeaderStyle,
  createListItemStyle,
  createHoverStyle,
  createSectionHeaderStyle,
  createStatusDotStyle,
} from '../../../helpers';

export const CompactBhEvidenceBrowser = createPreset<BhEvidenceBrowserProps>({
  name: 'BhEvidenceBrowser.Compact',
  render: ({ primitives, props, tokens, engine }: PresetContext<BhEvidenceBrowserProps>) => {
    const { Box, Flex, Stack, Text } = primitives;
    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const impactColors = getImpactColors(tokens);

    const {
      evidence,
      selectedEvidenceId: selectedEvidenceIdProp,
      onEvidenceSelect,
      onValidate,
      candidateName,
      interviewTitle,
      loading,
      className,
      style,
    } = props;

    const [internalSelectedId, setInternalSelectedId] = useState(selectedEvidenceIdProp ?? '');
    const selectedEvidenceId = selectedEvidenceIdProp ?? internalSelectedId;

    const handleSelect = (id: string) => {
      setInternalSelectedId(id);
      onEvidenceSelect?.(id);
    };

    if (loading) {
      return (
        <Flex align="center" justify="center" style={{ padding: tokens.spacing[8], ...style }} className={className}>
          <Text style={{ color: tokens.colors.neutral[500], fontSize: tokens.typography.fontSize.sm }}>Loading...</Text>
        </Flex>
      );
    }

    return (
      <Box className={className} style={{ ...createCardStyle(tokens, { glass: isGlass, padding: 0 }), overflow: 'hidden', ...style }}>
        <Flex align="center" justify="between" style={createPanelHeaderStyle(tokens)}>
          <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>
            {interviewTitle ?? 'Evidence'} {candidateName ? `- ${candidateName}` : ''}
          </Text>
          <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{evidence.length} items</Text>
        </Flex>
        <Stack gap={0} style={{ maxHeight: 360, overflowY: 'auto' }}>
          {evidence.map(ev => {
            const ic = impactColors[ev.impact];
            const isSelected = selectedEvidenceId === ev.id;
            return (
              <Box
                key={ev.id}
                onClick={() => handleSelect(ev.id)}
                style={{
                  ...createListItemStyle(tokens, { active: isSelected, interactive: true }),
                }}
              >
                <Flex justify="between" align="center" style={{ marginBottom: tokens.spacing[1] }}>
                  <Flex gap={6} align="center">
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>
                      {ev.dimensionCode}
                    </Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{ev.dimension}</Text>
                  </Flex>
                  <Box style={{ padding: `${tokens.spacing[0]}px ${tokens.spacing[1]}px`, borderRadius: tokens.borderRadius.full, background: ic.bgColor, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${ic.border}` }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: ic.color, fontWeight: tokens.typography.fontWeight.medium }}>{getImpactLabel(ev.impact)}</Text>
                  </Box>
                </Flex>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700], fontStyle: 'italic' }}>
                  &ldquo;{ev.quote.length > 100 ? `${ev.quote.slice(0, 100)}...` : ev.quote}&rdquo;
                </Text>
                <Flex justify="between" align="center" style={{ marginTop: tokens.spacing[1] }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Score: {ev.score}</Text>
                  {ev.validated !== undefined && (
                    <Flex gap={4} align="center">
                      <Box style={createStatusDotStyle(tokens, ev.validated ? tokens.colors.successScale[500] : tokens.colors.neutral[300])} />
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: ev.validated ? tokens.colors.successScale[600] : tokens.colors.neutral[400] }}>
                        {ev.validated ? 'Validated' : 'Pending'}
                      </Text>
                    </Flex>
                  )}
                </Flex>
              </Box>
            );
          })}
        </Stack>
      </Box>
    );
  },
});
