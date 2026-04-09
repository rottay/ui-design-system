/**
 * Component exports.
 *
 * This barrel aggregates the four component tiers (`primitives`, `patterns`,
 * `chrome`, `surfaces`) into a single import surface. The whole component
 * catalog is available from the package root (`@rottay/design-system`) as
 * a flat export.
 *
 * There is intentionally **no** public `@rottay/design-system/components`,
 * `@rottay/design-system/components/primitives`,
 * `@rottay/design-system/components/patterns`,
 * `@rottay/design-system/components/chrome`, or
 * `@rottay/design-system/components/surfaces` subpath. The tier folders are
 * editorial structure for the source tree, not part of the published API.
 * `package.json` only ships `.`, `./server`, `./icons`, and `./styles*`.
 */

export * from './primitives';
export * from './patterns';
export * from './chrome';
export * from './surfaces';
