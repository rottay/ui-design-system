'use client';

/**
 * @fileoverview PricingSurface -- full-page pricing/plans comparison.
 * @description Wraps PatternPricingTable inside PageShellSurface. Owns page chrome,
 * intro copy, billing cycle toggle, and footer while delegating the comparison
 * grid to the underlying pattern.
 */

import React from 'react';
import { Stack, Text } from '../../../../primitives';
import { PatternPricingTable } from '../../../../patterns';
import type { PricingSurfaceConfig } from '../../../foundation/types';
import { PageShellSurface } from '../../../layout/page-shell';
import { SurfaceActionBar } from '../../../foundation/shared';

export interface PricingSurfaceProps {
  config: PricingSurfaceConfig;
  loading?: boolean;
}

export function PricingSurface({
  config,
  loading = false,
}: PricingSurfaceProps): React.ReactElement {
  const actionsNode = <SurfaceActionBar actions={config.behavior.actions} permissions={config.permissions} />;

  // Plans and features are re-mapped to strip surface-level metadata before
  // reaching the pricing pattern. This keeps the pattern API stable even if
  // the surface config adds fields (e.g. analytics tags, permission gates).
  const plans = config.behavior.plans.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    description: p.description,
    features: p.features,
    cta: p.cta,
    popular: p.popular,
    priceNote: p.priceNote,
  }));

  const features = config.behavior.features.map((f) => ({
    key: f.key,
    label: f.label,
    description: f.description,
    category: f.category,
  }));

  return (
    <PageShellSurface
      chrome={{ ...config.presentation.chrome, maxWidth: config.visual.maxWidth }}
      actions={actionsNode}
      loading={loading}
    >
      <Stack
        className="ds-surface ds-pricing"
        data-part="root"
        data-loading={loading ? 'true' : 'false'}
        spacing="lg"
      >
        {config.presentation.intro && (
          <Text className="ds-pricing__muted-text" data-part="muted-text" style={{ color: 'var(--ds-color-text-muted)' }}>
            {config.presentation.intro}
          </Text>
        )}

        <PatternPricingTable
          plans={plans}
          features={features}
          highlightedPlan={config.behavior.currentPlan}
          onSelectPlan={config.behavior.onSelectPlan}
          billingCycle={config.behavior.billingCycle}
          onBillingCycleChange={config.behavior.onBillingCycleChange}
          currency={config.behavior.currency}
          renderPlanHeader={
            config.presentation.renderPlanHeader
              ? (plan) => config.presentation.renderPlanHeader!(plan as any)
              : undefined
          }
        />

        {config.presentation.footer}
      </Stack>
    </PageShellSurface>
  );
}
