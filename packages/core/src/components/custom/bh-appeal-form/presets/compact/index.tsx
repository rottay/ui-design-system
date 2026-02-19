'use client';

/**
 * BhAppealForm - Compact Preset
 * Condensed appeal submission form for inline or sidebar use.
 */

import { useMemo, useCallback} from 'react';
import {
  Scale, Send, X, User, Briefcase,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createEntranceAnimation,
  getPersonalityTypography,
  getPersonalityBadgeRadius,

  createPersonalityAccentBar,
  createCardHoverStyles,
  createDividerStyle,
  createPersonalitySectionHeaderStyle,
  createPersonalitySkeletonStyle,
} from '../../../helpers';
import type { BhAppealFormProps } from '../../core';

/* ================================================================== */
/*  Compact Preset                                                     */
/* ================================================================== */

export const CompactBhAppealForm = createPreset<BhAppealFormProps>({
  name: 'BhAppealForm.Compact',
  render: (ctx: PresetContext<BhAppealFormProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);

    const {
      candidateName = 'John Smith',
      positionTitle = 'Senior Software Engineer',
      originalDecision = 'Rejected',
      reason = '',
      evidence = '',
      onSubmit,
      onCancel,
      className,
      style,
    } = props;


    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);

    const handleSubmit = useCallback(() => {
      onSubmit?.();
    }, [onSubmit]);

    const handleCancel = useCallback(() => {
      onCancel?.();
    }, [onCancel]);

    const animStyle = useMemo(() => ({
      ...entrance.animate,
      transition: entrance.transition,
    }), [entrance]);

    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);

    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);

    const divider = useMemo(() => createDividerStyle(t), [t]);

    const sectionHdr = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);

    const skeleton = useMemo(() => createPersonalitySkeletonStyle(t), [t]);


    return (
      <Box
        className={className}
        onMouseEnter={(e: React.MouseEvent<HTMLElement>) => { Object.assign(e.currentTarget.style, hoverStyles.hover); }}
        onMouseLeave={(e: React.MouseEvent<HTMLElement>) => { Object.assign(e.currentTarget.style, hoverStyles.base); }}
        style={{
          ...card,
          width: '100%',
          padding: 0,
          overflow: 'hidden',
          ...animStyle,
          ...style,
        }}
      >
        {/* Header */}
        <Box style={{
          padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
          backgroundColor: t.colors.neutral[50],
          display: 'flex',
          alignItems: 'center',
          gap: t.spacing[2],
        }}>
          <Scale size={16} color={t.colors.warningScale[500]} />
          <Text style={{
            fontSize: t.typography.fontSize.sm,
            fontWeight: ptypo.headingWeight,
            color: t.colors.neutral[800],
          }}>
            Appeal
          </Text>
        </Box>

        {/* Context */}
        <Box style={{
          padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[1] }}>
            <User size={12} color={t.colors.neutral[400]} />
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[700] }}>{candidateName}</Text>
          </Box>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
            <Briefcase size={12} color={t.colors.neutral[400]} />
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>{positionTitle}</Text>
            <Box style={{
              ...createBadgeStyle(t, 'error'),
              borderRadius: badgeRadius,
              padding: `0px ${t.spacing[1]}px`,
            }}>
              <Text style={{ fontSize: t.typography.fontSize.xs }}>{originalDecision}</Text>
            </Box>
          </Box>
        </Box>

        {/* Reason */}
        <Box style={{ padding: `${t.spacing[3]}px ${t.spacing[4]}px` }}>
          <Box
            role="textbox"
            aria-label="Appeal reason"
            tabIndex={0}
            style={{
              width: '100%',
              minHeight: 60,
              padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
              border: `1px solid ${t.colors.neutral[200]}`,
              borderRadius: t.borderRadius.md,
              marginBottom: t.spacing[3],
            }}
          >
            <Text style={{ fontSize: t.typography.fontSize.xs, color: reason ? t.colors.neutral[900] : t.colors.neutral[400] }}>
              {reason || 'Reason for appeal...'}
            </Text>
          </Box>

          {/* Actions */}
          <Box style={{ display: 'flex', justifyContent: 'flex-end', gap: t.spacing[2] }}>
            <Box
              role="button"
              tabIndex={0}
              aria-label="Cancel"
              onClick={handleCancel}
              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCancel(); } }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: t.spacing[1],
                padding: `${t.spacing[1]}px ${t.spacing[3]}px`,
                border: `1px solid ${t.colors.neutral[200]}`,
                borderRadius: t.borderRadius.md,
                cursor: 'pointer',
                fontSize: t.typography.fontSize.xs,
                color: t.colors.neutral[600],
                backgroundColor: t.colors.common.white,
                transition: `background-color ${t.motion.hover}`,
              }}
            >
              <X size={12} />
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600] }}>Cancel</Text>
            </Box>
            <Box
              role="button"
              tabIndex={0}
              aria-label="Submit appeal"
              onClick={handleSubmit}
              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSubmit(); } }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: t.spacing[1],
                padding: `${t.spacing[1]}px ${t.spacing[3]}px`,
                backgroundColor: t.colors.primaryScale[600],
                color: t.colors.common.white,
                borderRadius: t.borderRadius.md,
                cursor: 'pointer',
                fontSize: t.typography.fontSize.xs,
                fontWeight: t.typography.fontWeight.medium,
                transition: `background-color ${t.motion.hover}`,
              }}
            >
              <Send size={12} />
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.common.white }}>Submit</Text>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  },
});
