"use client";

/**
 * @fileoverview ActiveFiltersBar public entry point.
 *
 * Engine-agnostic: the family composes DS primitives (Box/Flex/Tag/Button),
 * which resolve through the engine system themselves, so there is one
 * implementation and no per-engine fork.
 *
 * @module Structures/Workspace/ActiveFiltersBar
 * @category Structure
 * @package @rottay/design-system
 */

export { ActiveFiltersBar } from "./runtime/rendering";
export type { ActiveFilter, ActiveFiltersBarProps } from "./contracts";

// Pre-existing compatibility aliases for pre-Checkpoint-D names. Zero
// consumers in the repository; deletion candidate, not this lane's call.
export { ActiveFiltersBar as WorkspaceFilterRail } from "./runtime/rendering";
export type {
  ActiveFiltersBarProps as WorkspaceFilterRailProps,
  ActiveFilter as WorkspaceActiveFilter,
} from "./contracts";
