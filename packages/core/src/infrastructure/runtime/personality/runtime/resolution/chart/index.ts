/**
 * @fileoverview Pure chart-personality resolution.
 *
 * Charts are allowed to know the resolved visual posture, never tenant names,
 * hostnames, or storage details. Keeping the precedence here prevents chart
 * renderers and the token hook from implementing subtly different merge
 * chains.
 */

import type { ChartPersonalityTokens } from '../../../../../../foundation/contracts/kernel/tokens/personality';
import { DEFAULT_PERSONALITY } from '../../../foundation/defaults';

type PartialChartPersonality = Partial<ChartPersonalityTokens>;

/** The inputs that can contribute to the resolved chart posture. */
export interface ChartPersonalityResolutionInput {
  /**
   * The compiled tenant layer: `ThemeCompilation.runtime.personality` of the
   * mounted artifact.
   *
   * Its PRESENCE is the signal that this tenant published a compile of its own,
   * so a compiled layer that carries no `chart` at all is a resolvable input
   * this function is documented to handle — and one that must still suppress
   * the product profile's chart posture.
   */
  compiled?: Readonly<{ chart?: PartialChartPersonality }> | null;
  /** Active vertical baseline, when a vertical has been resolved. */
  vertical?: Readonly<{
    personality: Readonly<{ chart?: PartialChartPersonality }>;
  }> | null;
  /** Active profile. Ignored whenever a compiled tenant layer is present. */
  productProfile?: Readonly<{
    personality?: Readonly<{ chart?: PartialChartPersonality }> | null;
  }> | null;
}

/**
 * Resolve chart personality with the canonical visual precedence:
 *
 * `DEFAULT -> vertical -> (compiled.chart | ProductProfile.chart)`
 *
 * A compiled layer selects the tenant path even when `chart` is absent; in that
 * case product-profile chart values must not leak through. A fresh result is
 * returned on every call and no input object is mutated.
 */
export function resolveChartPersonality({
  compiled,
  vertical,
  productProfile,
}: ChartPersonalityResolutionInput = {}): ChartPersonalityTokens {
  return {
    ...DEFAULT_PERSONALITY.chart,
    ...vertical?.personality.chart,
    ...(compiled ? compiled.chart : productProfile?.personality?.chart),
  };
}
