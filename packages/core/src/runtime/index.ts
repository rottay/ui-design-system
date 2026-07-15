/**
 * @fileoverview DS Runtime Engine
 * @description Internal runtime system for theme resolution, tenant management,
 * engine selection, personality, vertical presets, product profiles, and feature flags.
 * These modules are orchestrated by DesignSystemProvider and are NOT meant to be
 * imported directly by consuming apps - use the public API from the package root instead.
 * @module Runtime
 */
export * from './bootstrap';
export * from './engines';
export * from './theming';
export * from './tenant';
export * from './personality';
export * from './verticals';
export * from './product-profiles';
export * from './features';
export * from './responsive';
export * from './motion';
export * from './adapters/navigation';
export * from './adapters/focus-mode';
