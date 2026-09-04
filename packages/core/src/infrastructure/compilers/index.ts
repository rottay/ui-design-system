/**
 * Canonical compiler entrypoint: the two compiler owners, and nothing else.
 *
 * `composition/tenant-theme` validates and compiles a TenantThemeConfig;
 * `runtime/theme` owns the resolve -> compile -> emit path for a Theme.
 */

export * from './composition/tenant-theme';
export * from './runtime/theme';
