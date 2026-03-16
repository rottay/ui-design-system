/**
 * @fileoverview Contracts - Rottay Design System Public Type Hub
 * @description Aggregates all system-level type contracts (engine, theme, tenant,
 * tokens, extensions, product profiles) into a single import surface.
 *
 * @remarks
 * This barrel intentionally re-exports system-level contracts only. Primitive
 * component props (Button, Avatar, Modal, etc.) live next to their components
 * to avoid duplicate type hierarchies and drift between runtime code and
 * public APIs. Import those from `contracts/primitives/*` directly.
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

// Tenant types
export * from './tenants';

// Product profile types
export * from './product-profiles';

// Token types
export * from './tokens';

// Extension types (Universal Extension System)
export * from './extensions';

// Primitive props are intentionally not re-exported from here. The component
// folder remains the canonical owner for those contracts.
