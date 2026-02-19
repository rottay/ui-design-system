'use client';

/**
 * BhCandidateMerge - Compact Preset
 * Condensed duplicate alert card with quick merge action.
 */

import { useMemo} from 'react';
import { GitMerge, AlertTriangle } from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createEntranceAnimation,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createEmptyStateStyle,

  createPersonalityAccentBar,
  createCardHoverStyles,
  createPersonalitySectionHeaderStyle,
  createPersonalitySkeletonStyle,

  createDividerStyle,
} from '../../../helpers';
import type { BhCandidateMergeProps, MergeField } from '../../core';
import { getCandidateFullName } from '../../core';
import type { DesignTokens } from '../../../../../types';
import type { DBCandidate } from '@rottay/recruiter';

export const CompactBhCandidateMerge = createPreset<BhCandidateMergeProps>({
  name: 'BhCandidateMerge.Compact',
  render: (ctx: PresetContext<BhCandidateMergeProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);

    const {
      candidates: rawCandidates = [],
      mergeFields: rawMergeFields = [],
      onMerge,
      confidenceScore = 0,
      className,
      style,
    } = props;

    const candidates = Array.isArray(rawCandidates) ? rawCandidates : [];
    const mergeFields = Array.isArray(rawMergeFields) ? rawMergeFields : [];

    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);

    const conflictCount = useMemo(
      () => mergeFields.filter(f => !f.values.every(v => v === f.values[0])).length,
      [mergeFields],
    );

    const animStyle = useMemo(() => ({
      ...entrance.animate,
      transition: entrance.transition,
    }), [entrance]);

    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);

    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);

    const sectionHdr = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);

    const skeleton = useMemo(() => createPersonalitySkeletonStyle(t), [t]);


    const divider = useMemo(() => createDividerStyle(t), [t]);



    return (
      <Box
        className={className}
        onMouseEnter={(e: React.MouseEvent<HTMLElement>) => { Object.assign(e.currentTarget.style, hoverStyles.hover); }}
        onMouseLeave={(e: React.MouseEvent<HTMLElement>) => { Object.assign(e.currentTarget.style, hoverStyles.base); }}
        style={{
          ...card,
          padding: 0,
          overflow: 'hidden',
          ...animStyle,
          ...style,
        }}
      >
        <Box style={{
          padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
          backgroundColor: t.colors.warningScale[50],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
            <AlertTriangle size={14} color={t.colors.warningScale[600]} />
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              fontWeight: ptypo.headingWeight,
              color: t.colors.warningScale[800],
            }}>
              Duplicate Found
            </Text>
          </Box>
          <Box style={{
            ...createBadgeStyle(t, confidenceScore >= 80 ? 'success' : 'warning'),
            borderRadius: badgeRadius,
            padding: `1px ${t.spacing[2]}px`,
          }}>
            <Text style={{ fontSize: t.typography.fontSize.xs }}>{confidenceScore}%</Text>
          </Box>
        </Box>

        <Box style={{ padding: `${t.spacing[3]}px ${t.spacing[4]}px` }}>
          {candidates.map((c, i) => {
            const fullName = getCandidateFullName(c);
            return (
            <Box key={c.id} style={{
              display: 'flex',
              alignItems: 'center',
              gap: t.spacing[2],
              padding: `${t.spacing[1]}px 0`,
              borderBottom: i < candidates.length - 1 ? `1px solid ${t.colors.neutral[50]}` : 'none',
            }}>
              <Box style={{
                width: 24,
                height: 24,
                borderRadius: t.borderRadius.full,
                backgroundColor: i === 0 ? t.colors.primaryScale[100] : t.colors.warningScale[100],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold, color: i === 0 ? t.colors.primaryScale[700] : t.colors.warningScale[700] }}>
                  {fullName.charAt(0)}
                </Text>
              </Box>
              <Box style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                <Text style={{
                  fontSize: t.typography.fontSize.xs,
                  fontWeight: t.typography.fontWeight.medium,
                  color: t.colors.neutral[800],
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {fullName}
                </Text>
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                  {c.email ?? ''}
                </Text>
              </Box>
            </Box>
            );
          })}

          {conflictCount > 0 && (
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.warningScale[600], marginTop: t.spacing[2] }}>
              {conflictCount} field{conflictCount > 1 ? 's' : ''} differ
            </Text>
          )}
        </Box>

        <Box style={{
          padding: `${t.spacing[2]}px ${t.spacing[4]}px`,
          borderTop: `1px solid ${t.colors.neutral[100]}`,
          backgroundColor: t.colors.neutral[50],
          display: 'flex',
          justifyContent: 'flex-end',
        }}>
          <Box
            tabIndex={0}
            role="button"
            aria-label="Merge records"
            onClick={() => onMerge?.()}
            onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onMerge?.(); } }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: t.spacing[1],
              padding: `${t.spacing[1]}px ${t.spacing[3]}px`,
              borderRadius: t.borderRadius.md,
              backgroundColor: t.colors.primaryScale[600],
              cursor: 'pointer',
              transition: `all ${t.motion.hover}`,
            }}
          >
            <GitMerge size={12} color={t.colors.common.white} />
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.common.white }}>Merge</Text>
          </Box>
        </Box>
      </Box>
    );
  },
});
