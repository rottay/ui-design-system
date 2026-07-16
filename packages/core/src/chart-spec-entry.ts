/**
 * Server-safe, JSON-only visualization contracts.
 *
 * This boundary intentionally contains no React, browser, D3, tenant, or
 * renderer dependency so an RSC can declare and validate chart semantics.
 */
export * from './components/patterns/visualization/charts/kernel/spec';
