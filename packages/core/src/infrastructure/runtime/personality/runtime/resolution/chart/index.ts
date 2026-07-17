/**
 * @fileoverview Pure chart-personality resolution.
 *
 * Charts are allowed to know the resolved visual posture, never tenant names,
 * hostnames, or storage details. Keeping the precedence here prevents chart
 * renderers and the token hook from implementing subtly different merge
 * chains.
 */

import type { ChartPersonalityTokens } from '../../../../../../foundation/contracts/kernel/tokens/personality';
import type { BrandTheme } from '../../../../../../foundation/contracts/composition/tenants/themes';
import { DEFAULT_PERSONALITY } from '../../../foundation/defaults';

type PartialChartPersonality = Partial<ChartPersonalityTokens>;

/** The inputs that can contribute to the resolved chart posture. */
export interface ChartPersonalityResolutionInput {
  /** Active tenant configuration, including the premium or legacy visual path. */
  tenantConfig?: Readonly<{
    brandTheme?: Pick<BrandTheme, 'charts'> | null;
    personality?: Readonly<{ chart?: PartialChartPersonality }> | null;
  }> | null;
  /** Active vertical baseline, when a vertical has been resolved. */
  vertical?: Readonly<{
    personality: Readonly<{ chart?: PartialChartPersonality }>;
  }> | null;
  /** Active legacy profile. Ignored whenever a BrandTheme is present. */
  productProfile?: Readonly<{
    personality?: Readonly<{ chart?: PartialChartPersonality }> | null;
  }> | null;
}

/**
 * Resolve chart personality with the canonical visual precedence:
 *
 * `DEFAULT -> vertical -> (BrandTheme.charts | ProductProfile.chart) -> tenant`
 *
 * BrandTheme presence selects the premium path even when `charts` is absent;
 * in that case product-profile chart values must not leak through. A fresh
 * result is returned on every call and no input object is mutated.
 */
export function resolveChartPersonality({
  tenantConfig,
  vertical,
  productProfile,
}: ChartPersonalityResolutionInput = {}): ChartPersonalityTokens {
  const authoredChart = tenantConfig?.brandTheme
    ? tenantConfig.brandTheme.charts
    : productProfile?.personality?.chart;

  return {
    ...DEFAULT_PERSONALITY.chart,
    ...vertical?.personality.chart,
    ...authoredChart,
    ...tenantConfig?.personality?.chart,
  };
}
