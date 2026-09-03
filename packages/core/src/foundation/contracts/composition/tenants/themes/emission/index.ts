/**
 * @fileoverview Emission-scope contract: the only owner of selector text.
 *
 * @module Contracts/Themes/Emission
 * @category Types
 * @package @rottay/design-system
 */

import type { BrandThemeMode } from "..";

/** A named CSS scope. The only owner of selector text in the target chain. */
export interface EmissionScope {
  readonly baseSelector: string;
  modeSelector(mode: BrandThemeMode): string;
}
