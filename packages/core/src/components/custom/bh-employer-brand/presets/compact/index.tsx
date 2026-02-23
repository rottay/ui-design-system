'use client';

/**
 * BhEmployerBrand - Compact Preset
 * Dashboard widget showing employer brand health: overall score, NPS,
 * Glassdoor rating, application rate with trend, offer acceptance rate,
 * positive/negative theme tags, and review count.
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { BhEmployerBrandProps } from '../../core';
import { n } from '../../core';
import {
  createCardStyle,
  createBadgeStyle,
  createCardHoverStyles,
  createEntranceAnimation,
  createIconContainerStyle,
  createPersonalitySectionHeaderStyle,
  createEmptyStateStyle,
  createPersonalityAccentBar,
  createPersonalitySkeletonStyle,
  createProgressBarStyle,
  createStatValueStyle,
  createStatLabelStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  getAccentAwareLayout,
  ICON_SIZES,
} from '../../../helpers';
import {
  Building2,
  TrendingUp,
  TrendingDown,
  Minus,
  Star,
  ArrowRight,
  Smile,
  Meh,
  Frown,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getScoreColor(score: number, tokens: any): string {
  if (score >= 80) return tokens.colors.successScale[600];
  if (score >= 60) return tokens.colors.infoScale[600];
  if (score >= 40) return tokens.colors.warningScale[600];
  return tokens.colors.errorScale[600];
}

function getNpsSentiment(nps: number): 'happy' | 'neutral' | 'sad' {
  if (nps >= 50) return 'happy';
  if (nps >= 0) return 'neutral';
  return 'sad';
}

/* ------------------------------------------------------------------ */
/*  Preset                                                             */
/* ------------------------------------------------------------------ */

export const CompactBhEmployerBrand = createPreset<BhEmployerBrandProps>({
  name: 'BhEmployerBrand.Compact',
  render: (ctx: PresetContext<BhEmployerBrandProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;
    const isGlass = t.surface.useGlass;

    const {
      data,
      loading,
      onViewDetails,
      className,
      style,
    } = props;

    /* -- Token-based styles ------------------------------------------- */
    const personalityTypo = useMemo(() => getPersonalityTypography(t), [t]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const cardHover = useMemo(() => createCardHoverStyles(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const accentLayout = useMemo(() => getAccentAwareLayout(t), [t]);
    const entranceAnim = useMemo(() => createEntranceAnimation(t), [t]);
    const sectionHeader = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const emptyStyle = useMemo(() => createEmptyStateStyle(t), [t]);
    const skeletonStyle = useMemo(() => createPersonalitySkeletonStyle(t), [t]);

    /* -- Loading state ------------------------------------------------ */
    if (loading) {
      return (
        <Box className={className} style={{
          ...createCardStyle(t, { elevation: 'sm', glass: isGlass }),
          display: 'flex', flexDirection: 'column' as const, gap: t.spacing[3],
          padding: `${t.spacing[5]}px`,
          ...style,
        }} role="status" aria-label="Loading employer brand data">
          <Box style={{ ...skeletonStyle, height: 20, width: '60%' }} />
          <Box style={{ ...skeletonStyle, height: 48, width: '35%' }} />
          <Box style={{ ...skeletonStyle, height: 24, width: '80%' }} />
          <Box style={{ ...skeletonStyle, height: 60, width: '100%' }} />
          <Box style={{ ...skeletonStyle, height: 32, width: '100%' }} />
        </Box>
      );
    }

    /* -- Empty state -------------------------------------------------- */
    if (!data) {
      return (
        <Box className={className} style={{
          ...createCardStyle(t, { elevation: 'sm', glass: isGlass }),
          ...style,
        }}>
          <Box style={{ ...emptyStyle, padding: `${t.spacing[4]}px` }}>
            <Box style={createIconContainerStyle(t, { size: 40 })}>
              <Building2 size={ICON_SIZES.feature} color={t.colors.neutral[300]} aria-hidden="true" />
            </Box>
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              color: t.colors.neutral[400],
              marginTop: t.spacing[2],
            }}>
              No employer brand data available
            </Text>
          </Box>
        </Box>
      );
    }

    const overallColor = getScoreColor(n(data.overallScore), t);
    const npsSentiment = getNpsSentiment(n(data.npsScore));
    const SentimentIcon = npsSentiment === 'happy' ? Smile : npsSentiment === 'neutral' ? Meh : Frown;
    const sentimentColor = npsSentiment === 'happy'
      ? t.colors.successScale[500]
      : npsSentiment === 'neutral'
        ? t.colors.warningScale[500]
        : t.colors.errorScale[500];

    const TrendIcon = data.applicationRateTrend === 'up'
      ? TrendingUp
      : data.applicationRateTrend === 'down'
        ? TrendingDown
        : Minus;
    const trendColor = data.applicationRateTrend === 'up'
      ? t.colors.successScale[600]
      : data.applicationRateTrend === 'down'
        ? t.colors.errorScale[600]
        : t.colors.neutral[500];

    const acceptanceBar = createProgressBarStyle(t, {
      color: t.colors.primaryScale[500],
      percent: n(data.offerAcceptanceRate),
    });

    /* -- Render ------------------------------------------------------- */
    return (
      <div
        className={className}
        role="region"
        aria-label="Employer Brand"
        onMouseEnter={(e: any) => { Object.assign(e.currentTarget.style, cardHover.hover); }}
        onMouseLeave={(e: any) => { Object.assign(e.currentTarget.style, cardHover.base); }}
        style={{
          ...createCardStyle(t, { elevation: 'sm', padding: 0, glass: isGlass }),
          borderRadius: t.borderRadius.lg,
          overflow: 'hidden',
          ...entranceAnim.animate,
          transition: entranceAnim.transition,
          ...accentLayout.outer,
          ...style,
        }}
      >
        {/* Accent bar */}
        {accentBar && <Box style={accentBar} />}
        <Box style={{ ...accentLayout.inner, padding: `${t.spacing[5]}px` }}>

          {/* Title row */}
          <Box style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: t.spacing[4],
          }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
              <Box style={createIconContainerStyle(t, { size: 32 })}>
                <Building2 size={ICON_SIZES.section} color={t.colors.primaryScale[500]} aria-hidden="true" />
              </Box>
              <Text style={{
                fontSize: t.typography.fontSize.md,
                fontWeight: personalityTypo.headingWeight,
                letterSpacing: personalityTypo.headingLetterSpacing,
                color: t.colors.neutral[900],
              }}>
                Employer Brand
              </Text>
            </Box>
            <Box style={{
              ...createBadgeStyle(t, 'secondary'),
              borderRadius: badgeRadius,
            }}>
              <Text style={{ fontSize: t.typography.fontSize.xs }}>{data.reviewCount} reviews</Text>
            </Box>
          </Box>

          {/* Overall brand score */}
          <Box style={{
            display: 'flex', alignItems: 'center', gap: t.spacing[3],
            marginBottom: t.spacing[4],
          }}>
            <Text style={{
              ...createStatValueStyle(t, { size: '2xl' }),
              color: overallColor,
            }}>
              {Math.round(n(data.overallScore))}
            </Text>
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
              <Text style={createStatLabelStyle(t, { personality: personalityTypo })}>
                Brand Score
              </Text>
            </Box>
          </Box>

          {/* NPS score with sentiment face */}
          <Box style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
            borderRadius: t.borderRadius.md,
            backgroundColor: t.colors.neutral[50],
            border: `1px solid ${t.colors.neutral[100]}`,
            marginBottom: t.spacing[3],
          }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
              <SentimentIcon size={ICON_SIZES.section} color={sentimentColor} aria-hidden="true" />
              <Text style={{
                fontSize: t.typography.fontSize.xs,
                color: t.colors.neutral[600],
              }}>
                NPS Score
              </Text>
            </Box>
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              fontWeight: t.typography.fontWeight.semibold,
              color: sentimentColor,
            }}>
              {n(data.npsScore) > 0 ? '+' : ''}{Math.round(n(data.npsScore))}
            </Text>
          </Box>

          {/* Glassdoor rating */}
          {data.glassdoorRating !== undefined && (
            <Box style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
              borderRadius: t.borderRadius.md,
              backgroundColor: t.colors.neutral[50],
              border: `1px solid ${t.colors.neutral[100]}`,
              marginBottom: t.spacing[3],
            }}>
              <Text style={{
                fontSize: t.typography.fontSize.xs,
                color: t.colors.neutral[600],
              }}>
                Glassdoor
              </Text>
              <Box style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={ICON_SIZES.label}
                    color={star <= Math.round(n(data.glassdoorRating!))
                      ? t.colors.warningScale[500]
                      : t.colors.neutral[200]}
                    fill={star <= Math.round(n(data.glassdoorRating!))
                      ? t.colors.warningScale[500]
                      : 'none'}
                    aria-hidden="true"
                  />
                ))}
                <Text style={{
                  fontSize: t.typography.fontSize.xs,
                  fontWeight: t.typography.fontWeight.semibold,
                  color: t.colors.neutral[700],
                  marginLeft: t.spacing[1],
                }}>
                  {n(data.glassdoorRating).toFixed(1)}
                </Text>
              </Box>
            </Box>
          )}

          {/* Application rate with trend */}
          <Box style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: t.spacing[3],
          }}>
            <Text style={{
              fontSize: t.typography.fontSize.xs,
              color: t.colors.neutral[600],
            }}>
              Application Rate
            </Text>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
              <Text style={{
                fontSize: t.typography.fontSize.sm,
                fontWeight: t.typography.fontWeight.semibold,
                color: t.colors.neutral[800],
              }}>
                {n(data.applicationRate).toFixed(1)}%
              </Text>
              <TrendIcon size={ICON_SIZES.label} color={trendColor} aria-hidden="true" />
            </Box>
          </Box>

          {/* Offer acceptance rate bar */}
          <Box style={{ marginBottom: t.spacing[3] }}>
            <Box style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: t.spacing[1],
            }}>
              <Text style={{
                fontSize: t.typography.fontSize.xs,
                color: t.colors.neutral[600],
              }}>
                Offer Acceptance
              </Text>
              <Text style={{
                fontSize: t.typography.fontSize.xs,
                fontWeight: t.typography.fontWeight.semibold,
                color: t.colors.neutral[800],
              }}>
                {Math.round(n(data.offerAcceptanceRate))}%
              </Text>
            </Box>
            <Box style={acceptanceBar.track}>
              <Box style={acceptanceBar.fill} />
            </Box>
          </Box>

          {/* Theme tags */}
          <Box style={{
            display: 'flex', flexWrap: 'wrap' as const, gap: t.spacing[2],
            marginBottom: t.spacing[3],
          }}>
            {data.topPositiveThemes.slice(0, 1).map((theme) => (
              <Box key={theme} style={{
                ...createBadgeStyle(t, 'success'),
                borderRadius: badgeRadius,
              }}>
                <Text style={{ fontSize: t.typography.fontSize.xs }}>{theme}</Text>
              </Box>
            ))}
            {data.topNegativeThemes.slice(0, 1).map((theme) => (
              <Box key={theme} style={{
                ...createBadgeStyle(t, 'warning'),
                borderRadius: badgeRadius,
              }}>
                <Text style={{ fontSize: t.typography.fontSize.xs }}>{theme}</Text>
              </Box>
            ))}
          </Box>

          {/* View Brand Report link */}
          {onViewDetails && (
            <Box
              role="button"
              tabIndex={0}
              aria-label="View brand report"
              onClick={onViewDetails}
              onKeyDown={(e: React.KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onViewDetails(); }
              }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: t.spacing[1],
                marginTop: t.spacing[1],
                padding: `${t.spacing[2]}px`,
                borderRadius: t.borderRadius.md,
                cursor: 'pointer',
                transition: `all ${t.motion.hover}`,
              }}
            >
              <Text style={{
                fontSize: t.typography.fontSize.xs,
                fontWeight: t.typography.fontWeight.semibold,
                color: t.colors.primaryScale[600],
              }}>
                View Brand Report
              </Text>
              <ArrowRight size={ICON_SIZES.label} color={t.colors.primaryScale[600]} aria-hidden="true" />
            </Box>
          )}

        </Box>
      </div>
    );
  },
});
