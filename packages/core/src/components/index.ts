/**
 * UI exports.
 *
 * This barrel aggregates the dependency-ordered UI concepts:
 * `primitives`, `patterns`, `structures`, and `surfaces`. The whole catalog remains available from the package root
 * (`@rottay/design-system`) as a flat export.
 *
 * There is intentionally **no** public `@rottay/design-system/ui`,
 * `@rottay/design-system/ui/primitives`,
 * `@rottay/design-system/ui/patterns`,
 * `@rottay/design-system/ui/structures`, or
 * `@rottay/design-system/ui/surfaces` subpath. These folders describe the
 * source architecture, not part of the published API.
 * Public entrypoints remain governed by `package.json`.
 */

export * from './primitives';
export * from './patterns';
export * from './structures';
export * from './surfaces';
