/**
 * @fileoverview Contracts - Rottay Design System Public Type Hub
 * @description Aggregates all system-level type contracts (engine, theme, tenant,
 * tokens, extensions, product profiles) into a single import surface.
 *
 * @remarks
 * This barrel intentionally re-exports system-level contracts only. Primitive
 * component props (Button, Avatar, Modal, etc.) live next to their components
 * to avoid duplicate type hierarchies and drift between runtime code and
 * public APIs.
 *
 * @module Contracts
 * @category Types
 * @package @rottay/design-system
 */

// Common types
export * from './kernel/common';

// Component base types (WithChildrenProps, BaseComponentProps)
export * from './composition/components';

// Runtime-facing component and pattern contracts
export * from './runtime/components';

// Runtime error taxonomy and transport-safe error shapes
export * from './runtime/errors';

// Engine types
export * from './runtime/engine';

// Theme types
export * from './composition/tenants/themes';

// Supplier-neutral motion policy and recipe types. Runtime constants live only
// in the focused `@rottay/design-system/motion` entry so the package root does
// not grow a second value surface for this optional capability.
export type {
  AmbientMotion,
  MotionCompositorProperty,
  MotionCurve,
  MotionPointer,
  MotionPolicy,
  MotionPolicyInput,
  MotionPower,
  MotionRecipeName,
  MotionRecipeResolveOptions,
  NormalizedTenantMotionDial,
  ResolvedMotionRecipe,
  TenantMotionDial,
} from './runtime/motion';

// Tenant types
export * from './composition/tenants';

// Versioned, server-safe tenant theme persistence contract
export * from './composition/tenants/themes/tenant-theme';

// Product profile types
export * from './composition/tenants/product-profiles';

// Token types
export * from './kernel/tokens';

// Extension types (Universal Extension System)
export * from './kernel/tokens/extensions';

// Vertical manifest types
export * from './kernel/verticals';

// Primitive props are intentionally not re-exported from here. The component
// folder remains the canonical owner for those contracts.
