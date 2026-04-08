/**
 * Internal tokens module.
 *
 * The token *value objects* (`colors`, `spacing`, `buttonTokens`, ...) live
 * here. They are NOT re-exported from the package root and there is no
 * public `@rottay/design-system/tokens` subpath in `package.json`.
 * Consumers should reach tokens through:
 *   - the CSS variable layer shipped via `@rottay/design-system/styles*`
 *   - the `useTokens()` React hook re-exported from the package root
 *
 * This file exists only as a stable internal entry point for code inside
 * the package.
 */

export * from './tokens/index';
