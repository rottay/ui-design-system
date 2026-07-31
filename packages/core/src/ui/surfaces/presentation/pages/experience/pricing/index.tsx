'use client';

/**
 * @fileoverview PricingSurface -- full-page pricing/plans comparison.
 * @description Owns the public pricing page chrome (via PageShellSurface),
 * the pinned intro copy hook, the labeled plan-comparison region and the
 * state choreography, while delegating the comparison grid itself to the
 * PatternPricingTable pattern.
 *
 * @remarks
 * Composition: the comparison TABLE is the pattern's anatomy end to end --
 * plan cards, price hierarchy, tri-state feature cells, the opt-in billing
 * toggle (certified Checkbox; its role and labels are documented pattern
 * pins), the composed Empty for zero plans, and the narrow-container scroll
 * with a sticky feature column. The recommended-plan emphasis (frame +
 * badge, never an accent rail or glow) is likewise pattern-owned. The
 * surface composes all of it and rebuilds none of it.
 *
 * States: `loading` renders a surface-owned mirror skeleton INSIDE the same
 * comparison region (toggle pill when a cycle handler is configured, a
 * three-card plan grid and feature rows) while the page chrome, intro and
 * footer stay live -- they are config, not payload -- so the swap to real
 * content is paint-only, never a layout shift. The shell stays mounted
 * (`loading={false}`): forwarding the flag to PageShellSurface would
 * early-return the whole page, chrome included (chat/notification/media/
 * editor idiom). `error`/`onRetry` (component props, dashboard/SU16/SU18
 * precedent -- the contract declares no error axis, gap registered) swap
 * ONLY the comparison region for the shared error kit. Zero plans is the
 * pattern's own composed Empty, already catalogued. Async plan selection is
 * caller-owned: the contract declares no surface-level pending axis, so the
 * per-plan CTA simply forwards to `onSelectPlan` (gap registered).
 *
 * Accessibility: the page's single h1 lives in the page-shell chrome; the
 * comparison grid is a labeled region (`<section aria-label>`, SU16 idiom)
 * so screen-reader users can jump straight to the plans; the billing toggle
 * semantics (labels + checkbox role) are the pattern's documented pin; the
 * skeleton is `aria-hidden` while the surface root carries `aria-busy`. No
 * live-region semantics are inferred.
 */

import React from 'react';
import { Box, Stack, Text } from '../../../../../primitives';
import { PatternPricingTable } from '../../../../../patterns';
import { FadeIn } from '@/graphics/motion';
import { useBreakpoints } from '@/infrastructure/runtime/responsive/composition/react/provider/breakpoint-state';
import type { PricingSurfaceConfig } from '../../../../foundation/contracts';
import { PageShellSurface } from '../../../../composition/layout/page-shell';
import { SurfaceActionBar } from '../../../../runtime/helpers/rendering';
import { SurfaceErrorState } from '../../../../runtime/helpers/states';
import { useSurfaceTranslations } from '../../../../runtime/helpers/states/i18n';
import { useSurfaceProfileDefaultsWithOverrides } from '../../../../runtime/profile-defaults/overrides';
import { resolveStackSpacing } from '../../../../runtime/profile-defaults/personality';

export interface PricingSurfaceProps {
  config: PricingSurfaceConfig;
  /** Payload pending; renders the mirror skeleton inside the live comparison region. */
  loading?: boolean;
  /** Load failure of the page payload; swaps the comparison region for the shared error kit. */
  error?: unknown;
  /** Retry handler wired to the error state's retry action. */
  onRetry?: () => void | Promise<void>;
}

export function PricingSurface({
  config,
  loading = false,
  error,
  onRetry,
}: PricingSurfaceProps): React.ReactElement {
  const { tSurfaceOr } = useSurfaceTranslations();
  const profileDefaults = useSurfaceProfileDefaultsWithOverrides(
    config.visual?.profileOverrides
  );
  const { isMobile } = useBreakpoints();
  const sectionSpacing = resolveStackSpacing(profileDefaults.sectionSpacing);
  // In error the payload never resolved, so no skeleton runs under it
  // (marketing idiom: error wins over loading).
  const showSkeleton = loading && !error;

  const actionsNode = <SurfaceActionBar actions={config.behavior.actions} access={config.access} />;

  // Plans and features are re-mapped to strip surface-level metadata before
  // reaching the pricing pattern. This keeps the pattern API stable even if
  // the surface config adds fields (e.g. analytics tags, final access decisions).
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

  const tableNode = (
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
  );

  return (
    <PageShellSurface
      chrome={{ ...config.presentation.chrome, maxWidth: config.visual.maxWidth }}
      actions={actionsNode}
      loading={false}
    >
      <Stack
        className="ds-surface ds-pricing"
        data-part="root"
        data-loading={loading ? 'true' : 'false'}
        data-mobile={isMobile ? 'true' : 'false'}
        aria-busy={loading ? 'true' : undefined}
        spacing={sectionSpacing}
      >
        {config.presentation.intro && (
          /* Pinned hook (`muted-text[data-part='root']`); the muted ink
             travels through Typography's `color` channel (SU22 idiom) and
             the editorial measure lives in the pricing skin. */
          <Text className="ds-pricing__muted-text" color="muted">
            {config.presentation.intro}
          </Text>
        )}

        {/* The comparison grid is a labeled region (SU16 idiom) so
            screen-reader users can jump straight to the plans; the region
            stays mounted across loading/error so the swap is paint-only. */}
        <Box
          as="section"
          aria-label={tSurfaceOr('pricing.table_region_label', 'Plan comparison')}
        >
          {error ? (
            <SurfaceErrorState error={error} onRetry={onRetry} />
          ) : showSkeleton ? (
            /* Mirror skeleton: the opt-in billing toggle as a centered pill
               (only stamped when a cycle handler is configured, mirroring the
               pattern's own opt-in), the plan columns as a three-card grid,
               and the feature rows as full-width lines. Blocks are decorative
               (`aria-hidden`) while the surface root carries `aria-busy`;
               geometry and pulse live in the pricing skin. */
            <Stack spacing="md" aria-hidden="true">
              {config.behavior.onBillingCycleChange && (
                <Box data-part="pricing-skeleton-toggle" />
              )}
              <Box data-part="pricing-skeleton-plans">
                <Box data-part="pricing-skeleton-plan" />
                <Box data-part="pricing-skeleton-plan" />
                <Box data-part="pricing-skeleton-plan" />
              </Box>
              <Box data-part="pricing-skeleton-row" />
              <Box data-part="pricing-skeleton-row" />
              <Box data-part="pricing-skeleton-row" />
              <Box data-part="pricing-skeleton-row" />
            </Stack>
          ) : /* Entrance motion rides the product personality; reduced/calm
               contexts render the final state by FadeIn's own contract. */
          profileDefaults.animateEntrance ? (
            <FadeIn durationMs={profileDefaults.entranceDuration}>{tableNode}</FadeIn>
          ) : (
            tableNode
          )}
        </Box>

        {config.presentation.footer}
      </Stack>
    </PageShellSurface>
  );
}
