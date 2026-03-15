'use client';

/**
 * Rottay Design System
 * Multi-tenant, multi-engine UI component library
 *
 * @packageDocumentation
 */

// ============================================
// CORE (Engines, Providers, Types, Errors)
// ============================================
export * from './engines';
export * from './core/providers';
export * from './core/types';
export * from './errors';

// ============================================
// HOOKS (promoted from core/hooks/)
// ============================================
export * from './hooks';

// ============================================
// UTILS (merged from core/utils + shared/utils)
// ============================================
export * from './utils';

// ============================================
// ICONS (promoted from shared/icons/)
// ============================================
export * from './icons';

// ============================================
// TENANCY (schema, registry, resolver, storage, CSS generation)
// ============================================
export * from './tenancy';

// ============================================
// PRODUCT PROFILES (registry, provider, hooks)
// ============================================
export * from './product-profiles';

// ============================================
// I18N (locales, provider, hooks)
// ============================================
export * from './i18n';

// ============================================
// MOTION (animations, effects, hooks)
// ============================================
export * from './motion';

// ============================================
// COMPONENTS
// ============================================
export * from './components/primitives';
export * from './components/patterns';
export * from './components/surfaces';
