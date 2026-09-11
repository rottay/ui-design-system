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
   * mounted artifact. It goes LAST, and a compiled layer that states no `chart`
   * leaves the layer underneath it standing -- the choice turns on what was
   * decided, never on whether a declaration object exists.
   */
  compiled?: Readonly<{ chart?: PartialChartPersonality }> | null;
  /** Active vertical baseline, when a vertical has been resolved. */
  vertical?: Readonly<{
    personality: Readonly<{ chart?: PartialChartPersonality }>;
  }> | null;
  /** Active profile, layered under the compiled tenant decision. */
  productProfile?: Readonly<{
    personality?: Readonly<{ chart?: PartialChartPersonality }> | null;
  }> | null;
}

/**
 * Resolve chart personality with the canonical visual precedence:
 *
 * `DEFAULT -> vertical -> ProductProfile.chart -> compiled.chart`
 *
 * A fresh result is returned on every call and no input object is mutated.
 */
export function resolveChartPersonality({
  compiled,
  vertical,
  productProfile,
}: ChartPersonalityResolutionInput = {}): ChartPersonalityTokens {
  return {
    ...DEFAULT_PERSONALITY.chart,
    ...vertical?.personality.chart,
    ...productProfile?.personality?.chart,
    ...compiled?.chart,
  };
}
