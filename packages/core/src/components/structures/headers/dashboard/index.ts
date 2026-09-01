'use client';

/**
 * @fileoverview DashboardHeader — structures-tier dashboard/overview page
 * header.
 *
 * Engine-agnostic: the structure composes engine-resolved primitives and
 * carries the `.ds-structure.ds-dashboard-header` scope class, so divergence
 * is the skin's job, not a per-engine TSX fork.
 *
 * @module Structures/Headers/DashboardHeader
 * @category Structure
 * @package @rottay/design-system
 */

export type {
  DashboardHeaderProps,
  DashboardMetric,
  DashboardAction,
  DashboardStatusState,
} from './contracts';

export { default as DashboardHeader } from './runtime/rendering';
