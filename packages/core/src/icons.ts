/**
 * Optional curated icon set — NOT a required DS surface.
 *
 * This is the public entry for `@rottay/design-system/icons`.
 * It exposes a small set of SVG icon primitives (BaseIcon, UserIcon,
 * SearchIcon, etc.) for apps that want a lightweight, DS-token-aware
 * icon layer.
 *
 * ## Status: optional catalog
 *
 * DS components do NOT depend on this set internally — they import
 * directly from `lucide-react` or `@ant-design/icons` as needed.
 * This catalog is provided as an app convenience, not as the
 * canonical icon foundation. Apps are free to use `lucide-react`,
 * `@ant-design/icons`, or any other icon library directly.
 */
export * from './icons/index';
