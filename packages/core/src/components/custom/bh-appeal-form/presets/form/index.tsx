'use client';

/**
 * BhAppealForm - Form Preset
 * Full appeal submission form with candidate info, reason,
 * evidence fields, and action buttons. Personality-driven, glass-aware.
 */

import { useMemo, useCallback} from 'react';
import {
  FileText, User, Briefcase, AlertCircle,
  Send, X, Scale,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createEntranceAnimation,
  createIconContainerStyle,
  createPersonalitySectionHeaderStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createPersonalityAccentBar,
  getAccentAwareLayout,

  createCardHoverStyles,
  createDividerStyle,
} from '../../../helpers';
import type { BhAppealFormProps } from '../../core';

/* ================================================================== */
/*  Form Preset                                                        */
/* ================================================================== */

export const FormBhAppealForm = createPreset<BhAppealFormProps>({
  name: 'BhAppealForm.Form',
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
      onReasonChange,
      onEvidenceChange,
      onSubmit,
      onCancel,
      loading,
      className,
      style,
    } = props;


    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const sectionLabel = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const accentLayout = useMemo(() => getAccentAwareLayout(t), [t]);

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

    const textAreaStyle = useMemo((): React.CSSProperties => ({
      width: '100%',
      minHeight: 100,
      padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
      border: `1px solid ${t.colors.neutral[200]}`,
      borderRadius: t.borderRadius.md,
      fontSize: t.typography.fontSize.sm,
      fontFamily: 'inherit',
      color: t.colors.neutral[900],
      backgroundColor: t.colors.common.white,
      resize: 'vertical' as const,
      outline: 'none',
      transition: `border-color ${t.motion.hover}`,
    }), [t]);

    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);

    const divider = useMemo(() => createDividerStyle(t), [t]);


    return (
      <Box
        className={className}
        onMouseEnter={(e: React.MouseEvent<HTMLElement>) => { Object.assign(e.currentTarget.style, hoverStyles.hover); }}
        onMouseLeave={(e: React.MouseEvent<HTMLElement>) => { Object.assign(e.currentTarget.style, hoverStyles.base); }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          backgroundColor: t.colors.neutral[50],
          fontFamily: 'inherit',
          overflow: 'auto',
          ...style,
        }}
      >
        {/* Header */}
        <Box style={{
          padding: `${t.spacing[6]}px ${t.spacing[7]}px`,
          backgroundColor: t.colors.common.white,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
          ...(isGlass && t.glass ? { backdropFilter: t.glass.blur, WebkitBackdropFilter: t.glass.blur, backgroundColor: t.glass.bg } : {}),
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[4] }}>
            <Box style={createIconContainerStyle(t, { size: 44, color: t.colors.warningScale[50] })}>
              <Scale size={22} color={t.colors.warningScale[600]} />
            </Box>
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
              <Text style={{
                fontSize: t.typography.fontSize.xl,
                fontWeight: ptypo.headingWeight,
                color: t.colors.neutral[900],
                letterSpacing: ptypo.headingLetterSpacing,
              }}>
                Submit Appeal
              </Text>
              <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500] }}>
                Request a review of the hiring decision
              </Text>
            </Box>
          </Box>
        </Box>

        {/* Content */}
        <Box style={{ padding: t.spacing[7], flex: 1 }}>
          <Box style={{ ...card, ...animStyle, ...accentLayout.outer }}>
            {accentBar && <Box style={accentBar} />}
            <Box style={accentLayout.inner}>

            {/* Context Info */}
            <Box style={{ marginBottom: t.spacing[6] }}>
              <Text style={{ ...sectionLabel, marginBottom: t.spacing[3] }}>Appeal Context</Text>
              <Box style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: t.spacing[4],
              }}>
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
                  <User size={16} color={t.colors.neutral[400]} />
                  <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>Candidate</Text>
                    <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[900] }}>
                      {candidateName}
                    </Text>
                  </Box>
                </Box>
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
                  <Briefcase size={16} color={t.colors.neutral[400]} />
                  <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>Position</Text>
                    <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[900] }}>
                      {positionTitle}
                    </Text>
                  </Box>
                </Box>
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
                  <AlertCircle size={16} color={t.colors.neutral[400]} />
                  <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>Original Decision</Text>
                    <Box style={{
                      ...createBadgeStyle(t, 'error'),
                      borderRadius: badgeRadius,
                      marginTop: t.spacing[1],
                    }}>
                      <Text style={{ fontSize: t.typography.fontSize.xs }}>{originalDecision}</Text>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Reason Field */}
            <Box style={{ marginBottom: t.spacing[5] }}>
              <Text style={{ ...sectionLabel, marginBottom: t.spacing[2] }}>
                Reason for Appeal
              </Text>
              <Box
                role="textbox"
                aria-label="Appeal reason"
                tabIndex={0}
                style={{
                  ...textAreaStyle,
                  minHeight: 120,
                }}
              >
                <Text style={{ fontSize: t.typography.fontSize.sm, color: reason ? t.colors.neutral[900] : t.colors.neutral[400] }}>
                  {reason || 'Describe the reason for this appeal...'}
                </Text>
              </Box>
            </Box>

            {/* Evidence Field */}
            <Box style={{ marginBottom: t.spacing[6] }}>
              <Text style={{ ...sectionLabel, marginBottom: t.spacing[2] }}>
                Supporting Evidence
              </Text>
              <Box
                role="textbox"
                aria-label="Supporting evidence"
                tabIndex={0}
                style={{
                  ...textAreaStyle,
                  minHeight: 100,
                }}
              >
                <Text style={{ fontSize: t.typography.fontSize.sm, color: evidence ? t.colors.neutral[900] : t.colors.neutral[400] }}>
                  {evidence || 'Provide any supporting evidence or documentation...'}
                </Text>
              </Box>
            </Box>

            {/* Actions */}
            <Box style={{ display: 'flex', justifyContent: 'flex-end', gap: t.spacing[3] }}>
              <Box
                role="button"
                tabIndex={0}
                aria-label="Cancel appeal"
                onClick={handleCancel}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCancel(); } }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: t.spacing[2],
                  padding: `${t.spacing[2]}px ${t.spacing[4]}px`,
                  backgroundColor: t.colors.common.white,
                  color: t.colors.neutral[600],
                  border: `1px solid ${t.colors.neutral[200]}`,
                  borderRadius: t.borderRadius.md,
                  cursor: 'pointer',
                  fontSize: t.typography.fontSize.sm,
                  transition: `background-color ${t.motion.hover}`,
                }}
              >
                <X size={16} />
                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[600] }}>Cancel</Text>
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
                  gap: t.spacing[2],
                  padding: `${t.spacing[2]}px ${t.spacing[4]}px`,
                  backgroundColor: t.colors.primaryScale[600],
                  color: t.colors.common.white,
                  borderRadius: t.borderRadius.md,
                  cursor: 'pointer',
                  fontSize: t.typography.fontSize.sm,
                  fontWeight: t.typography.fontWeight.medium,
                  transition: `background-color ${t.motion.hover}`,
                }}
              >
                <Send size={16} />
                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.common.white }}>Submit Appeal</Text>
              </Box>
            </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  },
});
