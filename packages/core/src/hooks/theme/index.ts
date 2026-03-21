/**
 * @fileoverview Theme Hook Compatibility Shim - Rottay Design System
 * @description Re-exports theme hooks from their canonical location at
 * `theming/useTheme`. Kept for backward compatibility while consumers
 * migrate to `import { useTheme } from '@rottay/design-system'`.
 *
 * The canonical source lives in `src/theming/useTheme.ts`. This shim exists
 * because older consumers imported theme hooks via `hooks/theme` and removing
 * this path would be a breaking change. New code should import directly from
 * the top-level `@rottay/design-system` package.
 *
 * @deprecated Import `useTheme` / `useThemeContext` from `@rottay/design-system` directly.
 *
 * @example Preferred import (new code)
 * ```tsx
 * import { useTheme } from '@rottay/design-system';
 * const { theme, setTheme } = useTheme();
 * ```
 *
 * @module System/Hooks/Theme
 * @category System
 * @package @rottay/design-system
 */

// Re-export from canonical location to maintain backwards compatibility.
export { useTheme, useThemeContext } from '../../runtime/theming/useTheme';
