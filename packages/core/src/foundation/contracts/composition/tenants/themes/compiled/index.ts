/**
 * @fileoverview Compiled-theme contracts: the engine-agnostic lowering product.
 *
 * @module Contracts/Themes/Compiled
 * @category Types
 * @package @rottay/design-system
 */

import type { FlatThemeMode } from "..";
import type { PartialPersonalityTokens } from "@/foundation/contracts/kernel/tokens";
import type { TenantTokenOverrides } from "@/foundation/contracts/composition/tenants";

/** A non-default mode's compiled delta over the base block. */
export interface ThemeCompilationModeBlock {
  readonly mode: FlatThemeMode;
  readonly cssVariables: Readonly<Record<string, string>>;
  readonly colorScheme: FlatThemeMode;
}

/** What `prefers-contrast: more` moves: the compile re-lowered at high posture, as a delta. */
export interface ThemeCompilationContrastBlock {
  /** Absent for the base block; otherwise the mode rule this delta sits over. */
  readonly mode?: FlatThemeMode;
  readonly cssVariables: Readonly<Record<string, string>>;
}

/** What every `[data-density]:not(:root)` boundary re-declares, at final values its local factor re-resolves. */
export interface ThemeCompilationDensityScopeBlock {
  readonly cssVariables: Readonly<Record<string, string>>;
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
  /** Present only when the high contrast posture moves a channel. */
  readonly contrastBlocks?: readonly ThemeCompilationContrastBlock[];
  /** Present only when a family claiming the density scope derives a scope-varying channel. */
  readonly densityScopeBlock?: ThemeCompilationDensityScopeBlock;
  readonly colorScheme?: FlatThemeMode;
  readonly runtime: ThemeCompilationRuntime;
}
