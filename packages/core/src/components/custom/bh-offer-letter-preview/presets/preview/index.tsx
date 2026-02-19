'use client';

/**
 * BhOfferLetterPreview - Preview Preset
 * Full A4 letter preview with variable highlighting and toolbar.
 * Personality-driven, glass-aware.
 */

import { useMemo } from 'react';
import {
  FileText, Download, Printer, Eye, Sparkles,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createEntranceAnimation,
  createIconContainerStyle,
  createPersonalityAccentBar,
  getAccentAwareLayout,
  getPersonalityTypography,
  getPersonalityBadgeRadius,

  createCardHoverStyles,
  createDividerStyle,
  createPersonalitySectionHeaderStyle,
  createEmptyStateStyle,
  createPersonalitySkeletonStyle,
  formatAbbreviated,
} from '../../../helpers';
import type { BhOfferLetterPreviewProps, OfferLetterData } from '../../core';
import { offerToLetterData } from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Variable highlight component                                       */
/* ------------------------------------------------------------------ */

function highlightText(text: string, highlight: boolean, t: DesignTokens): { text: string; highlighted: boolean }[] {
  if (!highlight) return [{ text, highlighted: false }];
  return [{ text, highlighted: true }];
}

/* ================================================================== */
/*  Preview Preset                                                     */
/* ================================================================== */

export const PreviewBhOfferLetterPreview = createPreset<BhOfferLetterPreviewProps>({
  name: 'BhOfferLetterPreview.Preview',
  render: (ctx: PresetContext<BhOfferLetterPreviewProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);

    const {
      offer,
      candidateName: candidateNameProp,
      letterData: letterDataProp,
      companyName = '',
      currency = '$',
      highlightVariables = true,
      onDownload,
      onPrint,
      className,
      style,
    } = props;

    const letterData = letterDataProp
      ?? (offer ? offerToLetterData(offer, candidateNameProp) : { candidateName: '', position: '', salary: 0, startDate: '', benefits: [] });

    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const accentLayout = useMemo(() => getAccentAwareLayout(t), [t]);

    const varStyle = useMemo(() => ({
      backgroundColor: highlightVariables ? t.colors.warningScale[100] : 'transparent',
      padding: highlightVariables ? `1px ${t.spacing[1]}px` : 0,
      borderRadius: t.borderRadius.sm,
      fontWeight: t.typography.fontWeight.semibold,
      transition: `background-color ${t.motion.hover}`,
    }), [highlightVariables, t]);

    const animStyle = useMemo(() => ({
      ...entrance.animate,
      transition: entrance.transition,
    }), [entrance]);

    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);

    const divider = useMemo(() => createDividerStyle(t), [t]);

    const sectionHdr = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);

    const skeleton = useMemo(() => createPersonalitySkeletonStyle(t), [t]);

    return (
      <Box
        className={className}
        onMouseEnter={(e: any) => { Object.assign(e.currentTarget.style, hoverStyles.hover); }}
        onMouseLeave={(e: any) => { Object.assign(e.currentTarget.style, hoverStyles.base); }}
        style={{
          ...card,
          padding: 0,
          overflow: 'hidden',
          ...animStyle,
          ...(accentBar ? accentLayout.outer : {}),
          ...style,
        }}
      >
        {accentBar && <Box style={accentBar} />}

        <Box style={accentBar ? accentLayout.inner : {}}>
        {/* Toolbar */}
        <Box style={{
          padding: `${t.spacing[3]}px ${t.spacing[6]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: t.colors.neutral[50],
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
            <Box style={createIconContainerStyle(t, { size: 36, color: t.colors.primaryScale[50] })}>
              <FileText size={18} color={t.colors.primaryScale[600]} />
            </Box>
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
              <Text style={{
                fontSize: t.typography.fontSize.sm,
                fontWeight: ptypo.headingWeight,
                color: t.colors.neutral[900],
              }}>
                Offer Letter Preview
              </Text>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                {letterData.position} - {letterData.candidateName}
              </Text>
            </Box>
          </Box>
          <Box style={{ display: 'flex', gap: t.spacing[2] }}>
            <Box
              tabIndex={0}
              role="button"
              aria-label="Download letter"
              onClick={() => onDownload?.()}
              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onDownload?.(); } }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: t.spacing[1],
                padding: `${t.spacing[1]}px ${t.spacing[3]}px`,
                borderRadius: t.borderRadius.md,
                border: `1px solid ${t.colors.neutral[200]}`,
                backgroundColor: t.colors.common.white,
                cursor: 'pointer',
                transition: `all ${t.motion.hover}`,
              }}
            >
              <Download size={14} color={t.colors.neutral[600]} />
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[700] }}>Download</Text>
            </Box>
            <Box
              tabIndex={0}
              role="button"
              aria-label="Print letter"
              onClick={() => onPrint?.()}
              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPrint?.(); } }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: t.spacing[1],
                padding: `${t.spacing[1]}px ${t.spacing[3]}px`,
                borderRadius: t.borderRadius.md,
                border: `1px solid ${t.colors.neutral[200]}`,
                backgroundColor: t.colors.common.white,
                cursor: 'pointer',
                transition: `all ${t.motion.hover}`,
              }}
            >
              <Printer size={14} color={t.colors.neutral[600]} />
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[700] }}>Print</Text>
            </Box>
          </Box>
        </Box>

        {/* A4 Letter body */}
        <Box style={{
          padding: t.spacing[6],
          display: 'flex',
          justifyContent: 'center',
          backgroundColor: t.colors.neutral[100],
        }}>
          <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1],
            width: '100%',
            maxWidth: 640,
            backgroundColor: t.colors.common.white,
            borderRadius: t.borderRadius.lg,
            boxShadow: t.shadows.lg,
            padding: `${t.spacing[8]}px ${t.spacing[7]}px`,
          }} role="document" aria-label="Offer letter document">
            {/* Company header */}
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], marginBottom: t.spacing[6], borderBottom: `2px solid ${t.colors.primaryScale[500]}`, paddingBottom: t.spacing[4] }}>
              <Text style={{
                fontSize: t.typography.fontSize['2xl'],
                fontWeight: t.typography.fontWeight.bold,
                color: t.colors.primaryScale[700],
                letterSpacing: ptypo.headingLetterSpacing,
              }}>
                {companyName}
              </Text>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500]}}>
                Official Offer Letter
              </Text>
            </Box>

            {/* Date */}
            <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[600], marginBottom: t.spacing[5] }}>
              Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </Text>

            {/* Greeting */}
            <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[800], marginBottom: t.spacing[4], lineHeight: 1.7 }}>
              Dear <Text style={varStyle}>{letterData.candidateName}</Text>,
            </Text>

            {/* Body paragraph */}
            <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700], marginBottom: t.spacing[4], lineHeight: 1.7 }}>
              We are delighted to extend an offer of employment for the position of{' '}
              <Text style={varStyle}>{letterData.position}</Text>{' '}
              at {companyName}. After a thorough evaluation process, we believe your skills and experience make you an excellent fit for our team.
            </Text>

            {/* Compensation */}
            <Text style={{
              fontSize: t.typography.fontSize.md,
              fontWeight: t.typography.fontWeight.semibold,
              color: t.colors.neutral[900],
              marginBottom: t.spacing[3],
            }}>
              Compensation
            </Text>
            <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700], marginBottom: t.spacing[2], lineHeight: 1.7 }}>
              Your annual base salary will be{' '}
              <Text style={varStyle}>{currency}{(letterData.salary ?? 0).toLocaleString()}</Text>,{' '}
              payable on a bi-weekly basis. Your anticipated start date is{' '}
              <Text style={varStyle}>{letterData.startDate}</Text>.
            </Text>

            {/* Custom fields */}
            {letterData.customFields && Object.keys(letterData.customFields).length > 0 && (
              <Box style={{
                marginTop: t.spacing[3],
                marginBottom: t.spacing[4],
                padding: t.spacing[3],
                borderRadius: t.borderRadius.md,
                backgroundColor: t.colors.neutral[50],
                border: `1px solid ${t.colors.neutral[100]}`,
              }}>
                {Object.entries(letterData.customFields).map(([key, value]) => (
                  <Box key={key} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: `${t.spacing[1]}px 0`,
                    borderBottom: `1px solid ${t.colors.neutral[50]}`,
                  }}>
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600] }}>{key}</Text>
                    <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[800] }}>
                      <Text style={varStyle}>{value}</Text>
                    </Text>
                  </Box>
                ))}
              </Box>
            )}

            {/* Benefits */}
            <Text style={{
              fontSize: t.typography.fontSize.md,
              fontWeight: t.typography.fontWeight.semibold,
              color: t.colors.neutral[900],
              marginBottom: t.spacing[3],
              marginTop: t.spacing[4],
            }}>
              Benefits
            </Text>
            <Box style={{ marginBottom: t.spacing[4] }}>
              {letterData.benefits.map((benefit, i) => (
                <Box key={i} style={{ display: 'flex', flexDirection: 'row' as const, alignItems: 'baseline', gap: t.spacing[2], marginBottom: t.spacing[1] }}>
                  <Text style={{ color: t.colors.primaryScale[500], fontSize: t.typography.fontSize.xs, flexShrink: 0 }}>--</Text>
                  <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700], lineHeight: 1.6 }}>
                    {benefit}
                  </Text>
                </Box>
              ))}
            </Box>

            {/* Closing */}
            <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700], marginBottom: t.spacing[5], lineHeight: 1.7 }}>
              We are excited about the possibility of you joining our team. Please sign and return this letter by{' '}
              <Text style={varStyle}>{letterData.startDate}</Text>{' '}
              to confirm your acceptance.
            </Text>

            <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700], marginBottom: t.spacing[1] }}>
              Sincerely,
            </Text>
            <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[800] }}>
              The {companyName} Team
            </Text>
          </Box>
        </Box>
        </Box>
      </Box>
    );
  },
});
