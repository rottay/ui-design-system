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
export * from './common';

// Component base types (WithChildrenProps, BaseComponentProps)
export * from './components';

// Engine types
export * from './engine';

// Theme types
export * from './themes';

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
} from './motion';

// Tenant types
export * from './tenants';

// Product profile types
export * from './product-profiles';

// Token types
export * from './tokens';

// Extension types (Universal Extension System)
export * from './extensions';

// Vertical manifest types
export * from './verticals';

// Primitive props are intentionally not re-exported from here. The component
// folder remains the canonical owner for those contracts.
