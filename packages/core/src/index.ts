'use client';

/**
 * Rottay Design System
 * Multi-tenant, multi-engine UI component library
 *
 * @packageDocumentation
 */

// ============================================
// CORE (Types, Providers, Hooks, Engines, Errors)
// ============================================
export * from './core';

// ============================================
// THEME (Tenants, Presets, Tokens)
// ============================================
export * from './theme';

// ============================================
// SHARED (Utils, Icons)
// ============================================
export * from './shared';

// ============================================
// ANIMATIONS
// ============================================
export * from './animations';

// ============================================
// COMPONENTS
// ============================================
export * from './components/primitives';
export * from './components/patterns';
export * from './components/custom';

// ============================================
// ANTD COMPATIBILITY (Temporary exports for migration)
// These are re-exports from antd for backward compatibility.
// Applications should migrate to DS primitives over time.
// ============================================
export { Row, Col } from 'antd';
export type { ColumnsType, TableProps } from 'antd/es/table';
export type { DataNode, TreeProps as AntTreeProps } from 'antd/es/tree';

// Alias for backward compatibility
export { Spinner as Spin } from './components/primitives/feedback/Spinner';
