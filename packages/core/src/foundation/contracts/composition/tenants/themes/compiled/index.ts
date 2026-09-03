/**
 * @fileoverview Compiled-theme contracts: the engine-agnostic lowering product.
 *
 * @module Contracts/Themes/Compiled
 * @category Types
 * @package @rottay/design-system
 */

import type { BrandThemeMode } from "..";
import type { PartialPersonalityTokens } from "@/foundation/contracts/kernel/tokens";
import type { TenantTokenOverrides } from "@/foundation/contracts/composition/tenants";

/** A non-default mode's compiled delta over the base block. */
export interface ThemeCompilationModeBlock {
  readonly mode: BrandThemeMode;
  readonly cssVariables: Readonly<Record<string, string>>;
  readonly colorScheme: BrandThemeMode;
}

/** The non-CSS half of a compile: what a React runtime reads without re-deriving. */
export interface ThemeCompilationRuntime {
  readonly personality: PartialPersonalityTokens;
  readonly tokenOverrides: Partial<TenantTokenOverrides>;
  readonly recipeProfile?: string;
  readonly experienceProfile?: string;
}

/**
 * The engine-agnostic lowering product.
 *
 * No `cssString` and no slug: scope belongs to emission. No engine field: the
 * lowering has no engine branch, and naming one here would make a foundation
 * contract depend on an infrastructure owner.
 */
export interface ThemeCompilation {
  readonly cssVariables: Readonly<Record<string, string>>;
  /** Always present; may be empty. Never optional, so a reader needs no guard. */
  readonly modeBlocks: readonly ThemeCompilationModeBlock[];
  readonly colorScheme?: BrandThemeMode;
  readonly runtime: ThemeCompilationRuntime;
}
