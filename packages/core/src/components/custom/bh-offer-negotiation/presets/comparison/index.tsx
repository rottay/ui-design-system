'use client';

/**
 * BhOfferNegotiation - Comparison Preset
 * Side-by-side comparison of multiple negotiations or offer versions.
 */

import { useMemo, useCallback, useState } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createHoverStyle,
  createEntranceAnimation,
  createStaggerDelay,
  createCardHoverStyles,
  createPersonalitySectionHeaderStyle,
  createIconContainerStyle,
  createDividerStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  getCardPadding,

  createPersonalityAccentBar,
  createPersonalitySkeletonStyle,
} from '../../../helpers';
import type { BhOfferNegotiationProps, OfferNegotiation, CompensationPackage } from '../../core';
import { offerToNegotiation } from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import { Users, TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react';

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${(value || 0).toLocaleString()}`;
}

function totalCompValue(comp: CompensationPackage): number {
return (comp.baseSalary || 0) + (comp.signingBonus || 0) + (comp.annualBonus || 0) + (comp.equity || 0);
}

function getStatusColor(status: string, tokens: DesignTokens): string {
  switch (status) {
    case 'accepted': return tokens.colors.successScale[500];
    case 'rejected': return tokens.colors.errorScale[500];
    case 'expired': return tokens.colors.warningScale[500];
    case 'withdrawn': return tokens.colors.neutral[400];
    default: return tokens.colors.primaryScale[500];
  }
}

export const ComparisonBhOfferNegotiation = createPreset<BhOfferNegotiationProps>({
  name: 'BhOfferNegotiation.Comparison',
  render: ({ primitives, props, tokens }: PresetContext<BhOfferNegotiationProps>) => {
    const { Box, Text } = primitives;

    const {
      offer,
      offers: offersProp,
      candidateName: candidateNameProp,
      negotiations: negotiationsProp,
      negotiation,
      onAction,
      className,
      style,
    } = props;

    const negotiations = negotiationsProp
      ?? (offersProp && offersProp.length > 0
        ? offersProp.map((o) => offerToNegotiation(o, candidateNameProp))
        : []);

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);
    const sectionHeader = useMemo(() => createPersonalitySectionHeaderStyle(tokens), [tokens]);
    const cardHover = useMemo(() => createCardHoverStyles(tokens), [tokens]);
    const entrance = useMemo(() => createEntranceAnimation(tokens), [tokens]);
    const typo = useMemo(() => getPersonalityTypography(tokens), [tokens]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(tokens), [tokens]);
    const cardPadding = useMemo(() => getCardPadding(tokens), [tokens]);
    const divider = useMemo(() => createDividerStyle(tokens), [tokens]);
    const iconContainer = useMemo(() => createIconContainerStyle(tokens, { size: 36 }), [tokens]);

    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    const handleCardEnter = useCallback((id: string) => setHoveredCard(id), []);
    const handleCardLeave = useCallback(() => setHoveredCard(null), []);

    const items = negotiations.length > 0 ? negotiations : negotiation ? [negotiation] : [];

    if (items.length === 0) {
    const sectionHdr = useMemo(() => createPersonalitySectionHeaderStyle(tokens), [tokens]);
    const skeleton = useMemo(() => createPersonalitySkeletonStyle(tokens), [tokens]);
    const accentBar = useMemo(() => createPersonalityAccentBar(tokens), [tokens]);
    const ptypo = useMemo(() => getPersonalityTypography(tokens), [tokens]);

      return (
        <Box className={className} style={{ ...cardBase, padding: tokens.spacing[6], textAlign: 'center' as const, ...style }}>
          <Text style={{ color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>
            No negotiations to compare
          </Text>
        </Box>
      );
    }

    const compFields: { label: string; key: keyof CompensationPackage }[] = [
      { label: 'Base Salary', key: 'baseSalary' },
      { label: 'Equity', key: 'equity' },
      { label: 'Signing Bonus', key: 'signingBonus' },
      { label: 'Annual Bonus', key: 'annualBonus' },
      { label: 'Relocation', key: 'relocation' },
    ];

    return (
      <Box
        className={className}
        style={{
          display: 'flex',
          flexDirection: 'column' as const,
          gap: tokens.spacing[6],
          padding: tokens.spacing[6],
          minHeight: '100%',
          backgroundColor: tokens.colors.neutral[50],
          fontFamily: 'inherit',
          ...entrance.animate,
          transition: entrance.transition,
          ...style,
        }}
      >
        {/* Header */}
        <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
          <Box style={createIconContainerStyle(tokens, { size: 32, color: tokens.colors.primaryScale[100] })}>
            <Users size={16} color={tokens.colors.primaryScale[600]} />
          </Box>
          <Text style={{
            fontSize: tokens.typography.fontSize.lg || '1.125rem',
            fontWeight: typo.headingWeight,
            letterSpacing: typo.headingLetterSpacing,
            color: tokens.colors.neutral[900],
          }}>
            Offer Comparison
          </Text>
        </Box>

        {/* Comparison Grid */}
        <Box style={{ display: 'grid', gridTemplateColumns: `repeat(${items.length}, 1fr)`, gap: tokens.spacing[4] }}>
          {items.map((neg, negIdx) => {
            const latestStep = neg.steps[neg.steps.length - 1];
            const firstStep = neg.steps[0];
            const comp = latestStep?.compensation;
            const initialComp = firstStep?.compensation;
            const stagger = createStaggerDelay(tokens, negIdx);
            const itemEntrance = createEntranceAnimation(tokens, { index: negIdx });
            const isHovered = hoveredCard === neg.id;

            return (
              <Box
                key={neg.id}
                style={{
                  ...cardBase,
                  padding: cardPadding,
                  display: 'flex',
                  flexDirection: 'column' as const,
                  gap: tokens.spacing[4],
                  ...cardHover.base,
                  ...(isHovered ? cardHover.hover : {}),
                  ...itemEntrance.animate,
                  transition: itemEntrance.transition,
                }}
                onMouseEnter={() => handleCardEnter(neg.id)}
                onMouseLeave={handleCardLeave}
              >
                {/* Header */}
                <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                  <Box
                    style={{
                      ...iconContainer,
                      backgroundColor: tokens.colors.primaryScale[100],
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.bold,
                      color: tokens.colors.primaryScale[700],
                    }}
                  >
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.primaryScale[700] }}>
                      {(neg.candidateName || '').charAt(0)}
                    </Text>
                  </Box>
                  <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1], flex: 1 }}>
                    <Text style={{
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: typo.headingWeight,
                      letterSpacing: typo.headingLetterSpacing,
                      color: tokens.colors.neutral[800],
                    }}>
                      {neg.candidateName}
                    </Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                      {neg.positionTitle}
                    </Text>
                  </Box>
                  <Box
                    style={{
                      padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                      borderRadius: badgeRadius,
                      backgroundColor: getStatusColor(neg.status, tokens),
                      color: tokens.colors.common.white,
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      display: 'inline-flex',
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.common.white,
                      textTransform: typo.labelTransform,
                      letterSpacing: typo.labelLetterSpacing,
                    }}>
                      {neg.status.replace('_', ' ')}
                    </Text>
                  </Box>
                </Box>

                {/* Total */}
                {comp && (
                  <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1],
                    textAlign: 'center' as const,
                    padding: tokens.spacing[3],
                    borderRadius: tokens.borderRadius.md,
                    backgroundColor: tokens.colors.primaryScale[50],
                  }}>
                    <Text style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[500],
                      textTransform: typo.labelTransform,
                      letterSpacing: typo.labelLetterSpacing,
                    }}>
                      Total Package
                    </Text>
                    <Text style={{
                      fontSize: tokens.typography.fontSize['2xl'] || '1.5rem',
                      fontWeight: typo.headingWeight,
                      letterSpacing: typo.headingLetterSpacing,
                      color: tokens.colors.primaryScale[700],
                    }}>
                      {formatCurrency(totalCompValue(comp))}
                    </Text>
                    {initialComp && (
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                        Initial: {formatCurrency(totalCompValue(initialComp))}
                      </Text>
                    )}
                  </Box>
                )}

                {/* Field breakdown */}
                {comp && (
                  <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2] }}>
                    {compFields.map((field) => {
                      const val = (comp[field.key] as number) || 0;
                      const initialVal = initialComp ? ((initialComp[field.key] as number) || 0) : 0;
                      const diff = val - initialVal;

                      return (
                        <Box key={field.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text style={{
                            fontSize: tokens.typography.fontSize.xs,
                            color: tokens.colors.neutral[500],
                            textTransform: typo.labelTransform,
                            letterSpacing: typo.labelLetterSpacing,
                          }}>
                            {field.label}
                          </Text>
                          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>
                              {formatCurrency(val)}
                            </Text>
                            {initialComp && diff !== 0 && (
                              <Box style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                                {diff > 0 ? (
                                  <TrendingUp size={10} color={tokens.colors.successScale[500]} />
                                ) : (
                                  <TrendingDown size={10} color={tokens.colors.errorScale[500]} />
                                )}
                                <Text
                                  style={{
                                    fontSize: tokens.typography.fontSize.xs,
                                    color: diff > 0 ? tokens.colors.successScale[500] : tokens.colors.errorScale[500],
                                  }}
                                >
                                  {diff > 0 ? '+' : ''}{formatCurrency(diff)}
                                </Text>
                              </Box>
                            )}
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                )}

                {/* Steps count */}
                <Box style={{ ...divider }} />
                <Box style={{ display: 'flex', justifyContent: 'space-between', paddingTop: tokens.spacing[1] }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                    {neg.steps.length} steps
                  </Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                    Started {neg.createdAt}
                  </Text>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  },
});
