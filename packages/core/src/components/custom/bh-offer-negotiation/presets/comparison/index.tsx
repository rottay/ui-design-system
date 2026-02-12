'use client';

/**
 * BhOfferNegotiation - Comparison Preset
 * Side-by-side comparison of multiple negotiations or offer versions.
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createSectionHeaderStyle,
  createHoverStyle,
} from '../../../helpers';
import type { BhOfferNegotiationProps, OfferNegotiation, CompensationPackage } from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';

const MOCK_NEGOTIATIONS: OfferNegotiation[] = [
  {
    id: 'neg-1', candidateName: 'Sarah Chen', positionTitle: 'Senior Engineer', department: 'Engineering',
    currentStep: 2, status: 'in_progress', createdAt: '2025-01-10T00:00:00Z',
    steps: [
      { id: 'ns-1', type: 'initial_offer', date: '2025-01-10', initiatedBy: 'company', compensation: { baseSalary: 165000, equity: 50000, equityType: 'rsu', signingBonus: 15000 } },
      { id: 'ns-2', type: 'counter_offer', date: '2025-01-14', initiatedBy: 'candidate', compensation: { baseSalary: 185000, equity: 75000, equityType: 'rsu', signingBonus: 25000 } },
    ],
  },
  {
    id: 'neg-2', candidateName: 'Alex Rivera', positionTitle: 'Staff Engineer', department: 'Platform',
    currentStep: 1, status: 'accepted', createdAt: '2025-01-08T00:00:00Z',
    steps: [
      { id: 'ns-3', type: 'initial_offer', date: '2025-01-08', initiatedBy: 'company', compensation: { baseSalary: 195000, equity: 80000, equityType: 'rsu', signingBonus: 20000 } },
      { id: 'ns-4', type: 'final_agreement', date: '2025-01-12', initiatedBy: 'candidate', compensation: { baseSalary: 195000, equity: 80000, equityType: 'rsu', signingBonus: 20000 } },
    ],
  },
];

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
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
      negotiations = MOCK_NEGOTIATIONS,
      negotiation,
      onAction,
      className,
      style,
    } = props;

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const sectionHeader = useMemo(() => createSectionHeaderStyle(tokens), [tokens]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const items = negotiations.length > 0 ? negotiations : negotiation ? [negotiation] : [];

    if (items.length === 0) {
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
          ...style,
        }}
      >
        <Text style={{ ...sectionHeader }}>Offer Comparison</Text>

        {/* Comparison Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${items.length}, 1fr)`, gap: tokens.spacing[4] }}>
          {items.map((neg) => {
            const latestStep = neg.steps[neg.steps.length - 1];
            const firstStep = neg.steps[0];
            const comp = latestStep?.compensation;
            const initialComp = firstStep?.compensation;

            return (
              <Box key={neg.id} style={{ ...cardBase, padding: tokens.spacing[5], display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[4] }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: tokens.borderRadius.full,
                      backgroundColor: tokens.colors.primaryScale[100],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.bold,
                      color: tokens.colors.primaryScale[700],
                    }}
                  >
                    {neg.candidateName.charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[800] }}>
                      {neg.candidateName}
                    </Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                      {neg.positionTitle}
                    </Text>
                  </div>
                  <div
                    style={{
                      padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                      borderRadius: tokens.borderRadius.sm,
                      backgroundColor: getStatusColor(neg.status, tokens),
                      color: tokens.colors.common.white,
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.semibold,
                    }}
                  >
                    {neg.status.replace('_', ' ')}
                  </div>
                </div>

                {/* Total */}
                {comp && (
                  <div style={{ textAlign: 'center' as const, padding: tokens.spacing[3], borderRadius: tokens.borderRadius.md, backgroundColor: tokens.colors.primaryScale[50] }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Total Package</Text>
                    <Text style={{ fontSize: tokens.typography.fontSize['2xl'] || '1.5rem', fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.primaryScale[700] }}>
                      {formatCurrency(totalCompValue(comp))}
                    </Text>
                    {initialComp && (
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                        Initial: {formatCurrency(totalCompValue(initialComp))}
                      </Text>
                    )}
                  </div>
                )}

                {/* Field breakdown */}
                {comp && (
                  <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2] }}>
                    {compFields.map((field) => {
                      const val = (comp[field.key] as number) || 0;
                      const initialVal = initialComp ? ((initialComp[field.key] as number) || 0) : 0;
                      const diff = val - initialVal;
                      return (
                        <div key={field.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                            {field.label}
                          </Text>
                          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>
                              {formatCurrency(val)}
                            </Text>
                            {initialComp && diff !== 0 && (
                              <Text
                                style={{
                                  fontSize: tokens.typography.fontSize.xs,
                                  color: diff > 0 ? tokens.colors.successScale[500] : tokens.colors.errorScale[500],
                                }}
                              >
                                {diff > 0 ? '+' : ''}{formatCurrency(diff)}
                              </Text>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Steps count */}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: `${tokens.spacing[2]}px 0`, borderTop: `1px solid ${tokens.colors.neutral[100]}` }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                    {neg.steps.length} steps
                  </Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                    Started {neg.createdAt}
                  </Text>
                </div>
              </Box>
            );
          })}
        </div>
      </Box>
    );
  },
});
