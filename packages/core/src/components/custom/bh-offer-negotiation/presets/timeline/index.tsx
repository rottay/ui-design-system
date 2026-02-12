'use client';

/**
 * BhOfferNegotiation - Timeline Preset
 * Visual timeline of negotiation steps with compensation cards.
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createSectionHeaderStyle,
  createHoverStyle,
  createBadgeStyle,
} from '../../../helpers';
import type { BhOfferNegotiationProps, NegotiationStep, CompensationPackage, OfferNegotiation } from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';

const MOCK_NEGOTIATION: OfferNegotiation = {
  id: 'neg-1',
  candidateName: 'Sarah Chen',
  positionTitle: 'Senior Software Engineer',
  department: 'Engineering',
  currentStep: 2,
  status: 'in_progress',
  createdAt: '2025-01-10T00:00:00Z',
  steps: [
    { id: 'ns-1', type: 'initial_offer', date: '2025-01-10', initiatedBy: 'company', compensation: { baseSalary: 165000, equity: 50000, equityType: 'rsu', signingBonus: 15000, annualBonus: 20000 }, notes: 'Initial offer based on L5 band' },
    { id: 'ns-2', type: 'counter_offer', date: '2025-01-14', initiatedBy: 'candidate', compensation: { baseSalary: 185000, equity: 75000, equityType: 'rsu', signingBonus: 25000, annualBonus: 25000 }, notes: 'Candidate requested higher base and equity' },
    { id: 'ns-3', type: 'revised_offer', date: '2025-01-17', initiatedBy: 'company', compensation: { baseSalary: 178000, equity: 65000, equityType: 'rsu', signingBonus: 20000, annualBonus: 22000 }, notes: 'Revised offer with increased equity' },
  ],
};

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
}

function totalCompValue(comp: CompensationPackage): number {
  return (comp.baseSalary || 0) + (comp.signingBonus || 0) + (comp.annualBonus || 0) + (comp.equity || 0);
}

function getStepColor(type: string, tokens: DesignTokens): string {
  switch (type) {
    case 'initial_offer': return tokens.colors.primaryScale[500];
    case 'counter_offer': return tokens.colors.warningScale[500];
    case 'revised_offer': return tokens.colors.infoScale[500];
    case 'final_agreement': return tokens.colors.successScale[500];
    case 'rejected': return tokens.colors.errorScale[500];
    case 'withdrawn': return tokens.colors.neutral[400];
    default: return tokens.colors.neutral[500];
  }
}

function getStepLabel(type: string): string {
  return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
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

export const TimelineBhOfferNegotiation = createPreset<BhOfferNegotiationProps>({
  name: 'BhOfferNegotiation.Timeline',
  render: ({ primitives, props, tokens }: PresetContext<BhOfferNegotiationProps>) => {
    const { Box, Text } = primitives;

    const {
      negotiation = MOCK_NEGOTIATION,
      selectedStep,
      onStepSelect,
      onAction,
      className,
      style,
    } = props;

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const sectionHeader = useMemo(() => createSectionHeaderStyle(tokens), [tokens]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    if (!negotiation) {
      return (
        <Box className={className} style={{ ...cardBase, padding: tokens.spacing[6], textAlign: 'center' as const, ...style }}>
          <Text style={{ color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>
            No negotiation data available
          </Text>
        </Box>
      );
    }

    const steps = negotiation.steps;

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
        {/* Header */}
        <Box style={{ ...cardBase, padding: tokens.spacing[5] }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  backgroundColor: tokens.colors.primaryScale[100],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: tokens.typography.fontSize.lg || '1.125rem',
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.primaryScale[700],
                  overflow: 'hidden',
                }}
              >
                {negotiation.candidateAvatar ? (
                  <img src={negotiation.candidateAvatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' as const }} />
                ) : (
                  negotiation.candidateName.charAt(0)
                )}
              </div>
              <div>
                <Text style={{ fontSize: tokens.typography.fontSize.lg || '1.125rem', fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>
                  {negotiation.candidateName}
                </Text>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
                  {negotiation.positionTitle} - {negotiation.department}
                </Text>
              </div>
            </div>
            <div
              style={{
                padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.full,
                backgroundColor: getStatusColor(negotiation.status, tokens),
                color: tokens.colors.common.white,
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.semibold,
                textTransform: 'uppercase' as const,
              }}
            >
              {negotiation.status.replace('_', ' ')}
            </div>
          </div>
        </Box>

        {/* Timeline */}
        <Box style={{ ...cardBase, padding: tokens.spacing[5] }}>
          <Text style={{ ...sectionHeader, letterSpacing: '-0.02em' }}>Negotiation Timeline</Text>
          <div style={{ position: 'relative' as const, paddingLeft: 40 }}>
            {/* Vertical line */}
            <div
              style={{
                position: 'absolute' as const,
                left: 15,
                top: 0,
                bottom: 0,
                width: 2,
                backgroundColor: tokens.colors.neutral[100],
              }}
            />

            {steps.map((step, i) => {
              const isSelected = selectedStep === i;
              const stepColor = getStepColor(step.type, tokens);
              const comp = step.compensation;
              const prevComp = i > 0 ? steps[i - 1].compensation : null;
              const salaryDiff = prevComp ? comp.baseSalary - prevComp.baseSalary : 0;

              return (
                <div
                  key={step.id}
                  onClick={() => onStepSelect?.(isSelected ? null : i)}
                  style={{
                    ...hoverStyle,
                    position: 'relative' as const,
                    marginBottom: tokens.spacing[5],
                    padding: tokens.spacing[4],
                    borderRadius: tokens.borderRadius.md,
                    border: `1px solid ${isSelected ? stepColor : tokens.colors.neutral[100]}`,
                    backgroundColor: isSelected ? stepColor + '08' : tokens.colors.common.white,
                  }}
                >
                  {/* Timeline dot */}
                  <div
                    style={{
                      position: 'absolute' as const,
                      left: -33,
                      top: tokens.spacing[4],
                      width: 12,
                      height: 12,
                      borderRadius: tokens.borderRadius.full,
                      backgroundColor: stepColor,
                      border: `2px solid ${tokens.colors.common.white}`,
                      boxShadow: tokens.shadows.sm,
                    }}
                  />

                  {/* Step header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[3] }}>
                    <div>
                      <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: stepColor }}>
                        {getStepLabel(step.type)}
                      </Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                        {step.date} - by {step.initiatedBy === 'company' ? 'Company' : 'Candidate'}
                      </Text>
                    </div>
                    <Text style={{ fontSize: tokens.typography.fontSize.lg || '1.125rem', fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>
                      {formatCurrency(totalCompValue(comp))}
                    </Text>
                  </div>

                  {/* Compensation breakdown */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: tokens.spacing[3] }}>
                    {[
                      { label: 'Base', value: comp.baseSalary, diff: salaryDiff },
                      { label: 'Equity', value: comp.equity || 0, diff: prevComp ? (comp.equity || 0) - (prevComp.equity || 0) : 0 },
                      { label: 'Signing Bonus', value: comp.signingBonus || 0, diff: prevComp ? (comp.signingBonus || 0) - (prevComp.signingBonus || 0) : 0 },
                      { label: 'Annual Bonus', value: comp.annualBonus || 0, diff: prevComp ? (comp.annualBonus || 0) - (prevComp.annualBonus || 0) : 0 },
                    ].map((item) => (
                      <div key={item.label} style={{ textAlign: 'center' as const }}>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                          {item.label}
                        </Text>
                        <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>
                          {formatCurrency(item.value)}
                        </Text>
                        {i > 0 && item.diff !== 0 && (
                          <Text
                            style={{
                              fontSize: tokens.typography.fontSize.xs,
                              color: item.diff > 0 ? tokens.colors.successScale[500] : tokens.colors.errorScale[500],
                            }}
                          >
                            {item.diff > 0 ? '+' : ''}{formatCurrency(item.diff)}
                          </Text>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Notes */}
                  {step.notes && isSelected && (
                    <div style={{ marginTop: tokens.spacing[3], padding: tokens.spacing[3], borderRadius: tokens.borderRadius.sm, backgroundColor: tokens.colors.neutral[50] }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600], fontStyle: 'italic' }}>
                        {step.notes}
                      </Text>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Box>

        {/* Actions */}
        {negotiation.status === 'in_progress' && onAction && (
          <div style={{ display: 'flex', gap: tokens.spacing[3], justifyContent: 'flex-end' }}>
            {['approve', 'counter', 'withdraw'].map((action) => (
              <div
                key={action}
                onClick={() => onAction(action as 'approve' | 'counter' | 'withdraw', negotiation.id)}
                style={{
                  ...hoverStyle,
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                  borderRadius: tokens.borderRadius.md,
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  backgroundColor: action === 'approve' ? tokens.colors.successScale[500] : action === 'withdraw' ? tokens.colors.errorScale[500] : tokens.colors.primaryScale[500],
                  color: tokens.colors.common.white,
                  fontFamily: 'inherit',
                  textTransform: 'capitalize' as const,
                }}
              >
                {action}
              </div>
            ))}
          </div>
        )}
      </Box>
    );
  },
});
