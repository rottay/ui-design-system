'use client';

/**
 * BhEvidenceBrowser - Compact Preset
 * Slite-inspired single-column evidence list with generous whitespace,
 * warm neutrals, impact badges, and clean selection states.
 */

import { useState, useMemo } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { BhEvidenceBrowserProps, EvidenceItem } from '../../core';
import { getImpactColors, getImpactLabel } from '../../core';
import { createCardStyle, createBadgeStyle } from '../../../helpers';
import { FileSearch, Quote, CheckCircle, Clock } from 'lucide-react';

const MOCK_EVIDENCE: EvidenceItem[] = [
  { id: 'ev-1', quote: 'I start by identifying the key requirements and constraints', dimension: 'System Design', dimensionCode: 'SD', impact: 'positive', score: 8, validated: true, timestamp: '00:15' },
  { id: 'ev-2', quote: 'focusing on scalability and reliability', dimension: 'Architecture', dimensionCode: 'ARCH', impact: 'strong_positive', score: 9, validated: true, timestamp: '00:22' },
  { id: 'ev-3', quote: 'For payment systems I prioritize consistency', dimension: 'Trade-off Analysis', dimensionCode: 'TA', impact: 'positive', score: 7, timestamp: '00:58' },
  { id: 'ev-4', quote: 'lean toward availability with eventual consistency', dimension: 'Trade-off Analysis', dimensionCode: 'TA', impact: 'positive', score: 8, timestamp: '01:05' },
];

export const CompactBhEvidenceBrowser = createPreset<BhEvidenceBrowserProps>({
  name: 'BhEvidenceBrowser.Compact',
  render: ({ primitives, props, tokens }: PresetContext<BhEvidenceBrowserProps>) => {
    const { Box, Text } = primitives;
    const impactColors = getImpactColors(tokens);

    const {
      evidence = MOCK_EVIDENCE, selectedEvidenceId: selectedEvidenceIdProp,
      onEvidenceSelect, onValidate, candidateName,
      interviewTitle, loading, className, style,
    } = props;

    const [internalSelectedId, setInternalSelectedId] = useState(selectedEvidenceIdProp ?? '');
    const selectedEvidenceId = selectedEvidenceIdProp ?? internalSelectedId;

    const handleSelect = (id: string) => {
      setInternalSelectedId(id);
      onEvidenceSelect?.(id);
    };

    if (loading) {
      return (
        <Box className={className} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: `${tokens.spacing[10]}px`, ...style,
        }}>
          <Text style={{ color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>Loading...</Text>
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
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
            <Box style={{
              width: 32, height: 32, borderRadius: tokens.borderRadius.lg,
              backgroundColor: tokens.colors.primaryScale[50],
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FileSearch size={16} color={tokens.colors.primaryScale[500]} />
            </Box>
            <Text style={{
              fontSize: tokens.typography.fontSize.md,
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
            }}>
              {interviewTitle ?? 'Evidence'} {candidateName ? `- ${candidateName}` : ''}
            </Text>
          </Box>
          <Box style={{
            ...createBadgeStyle(tokens, 'primary'),
            padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
          }}>
            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.primaryScale[700] }}>{evidence.length} items</Text>
          </Box>
        </Box>

        {/* Evidence list */}
        <Box style={{ maxHeight: 420, overflowY: 'auto' as const }}>
          {evidence.map(ev => {
            const ic = impactColors[ev.impact];
            const isSelected = selectedEvidenceId === ev.id;
            return (
              <Box
                key={ev.id}
                onClick={() => handleSelect(ev.id)}
                style={{
                  padding: `${tokens.spacing[4]}px ${tokens.spacing[6]}px`,
                  borderBottom: `1px solid ${tokens.colors.neutral[100]}`,
                  backgroundColor: isSelected ? tokens.colors.primaryScale[50] : 'transparent',
                  borderLeft: isSelected ? `3px solid ${tokens.colors.primaryScale[400]}` : '3px solid transparent',
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                }}
              >
                {/* Top: dimension code, dimension name, impact badge */}
                <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[2] }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                    <Text style={{
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.bold,
                      color: tokens.colors.neutral[800],
                    }}>{ev.dimensionCode}</Text>
                    <Text style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[400],
                    }}>{ev.dimension}</Text>
                  </Box>
                  <Box style={{
                    padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                    borderRadius: tokens.borderRadius.full,
                    background: ic.bgColor,
                    border: `1px solid ${ic.border}`,
                  }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: ic.color, fontWeight: tokens.typography.fontWeight.medium }}>{getImpactLabel(ev.impact)}</Text>
                  </Box>
                </Box>

                {/* Quote */}
                <Box style={{ display: 'flex', gap: tokens.spacing[2], marginBottom: tokens.spacing[2] }}>
                  <Quote size={12} color={tokens.colors.neutral[300]} style={{ flexShrink: 0, marginTop: 3 }} />
                  <Text style={{
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.neutral[600],
                    fontStyle: 'italic',
                    lineHeight: tokens.typography.lineHeight.relaxed,
                  }}>
                    {ev.quote.length > 120 ? `${ev.quote.slice(0, 120)}...` : ev.quote}
                  </Text>
                </Box>

                {/* Bottom: score + validation */}
                <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>Score: {ev.score}</Text>
                  {ev.validated !== undefined && (
                    <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                      {ev.validated ? (
                        <CheckCircle size={12} color={tokens.colors.successScale[500]} />
                      ) : (
                        <Clock size={12} color={tokens.colors.neutral[300]} />
                      )}
                      <Text style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: ev.validated ? tokens.colors.successScale[600] : tokens.colors.neutral[400],
                        fontWeight: tokens.typography.fontWeight.medium,
                      }}>
                        {ev.validated ? 'Validated' : 'Pending'}
                      </Text>
                    </Box>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  },
});
