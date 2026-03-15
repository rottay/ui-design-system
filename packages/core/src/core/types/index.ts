/**
 * Design System Rottay - TypeScript Types
 *
 * Sistema completo de tipos TypeScript para el Design System Rottay.
 * Incluye tipos comunes, engine-aware, y tipos de sistema.
 *
 * Note: Primitive component types (ButtonProps, InputProps, etc.) are exported
 * directly from their component files in ./components/primitives to avoid duplicates.
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

// NOTE: Primitive component types are NOT exported here to avoid duplicates.
// They are already exported from ./components/primitives/*/
// If you need primitive types, import them from the component:
//   import type { ButtonProps } from './components/primitives/inputs/Button';
// or from the main package:
//   import type { ButtonProps } from '@rottay/design-system';
