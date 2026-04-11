'use client';

/**
 * @fileoverview State Hooks - Rottay Design System
 * @description React hooks for advanced state management patterns including
 * undo/redo history and persistent layout preferences. Use these hooks when
 * component state needs time-travel capabilities or cross-session persistence.
 *
 * @remarks
 * State hooks provide reusable state patterns:
 *
 * **useUndoRedo** - Full undo/redo with bounded history:
 * - Configurable max history depth
 * - Custom equality checks to prevent duplicates
 * - Keyboard handler integration for Ctrl+Z / Ctrl+Shift+Z
 *
 * **useLayoutPreference** - Persisted layout preferences:
 * - SSR-safe localStorage/sessionStorage persistence
 * - Debounced writes for performance during resize operations
 * - Column management (visibility, width, reorder)
 * - ListSurface integration via ready-made props
 *
 * @example Undo/redo in a form editor
 * ```tsx
 * const { state, set, undo, redo, canUndo } = useUndoRedo(initialFormData, { maxHistory: 50 });
 * ```
 *
 * @status app-facing
 * @module System/Hooks/State
 * @category System
 * @package @rottay/design-system
 */

// -- Undo/Redo --
// Time-travel state management with bounded history stack.
// Ideal for editors, form builders, and canvas-style interactions.
export { useUndoRedo } from './undo-redo';
export type {
  UseUndoRedoOptions,
  UseUndoRedoReturn,
} from './undo-redo';

// -- Layout Preference --
// Persisted user layout settings (column visibility, widths, sidebar state).
// Writes are debounced to avoid excessive localStorage churn during resize.
export { useLayoutPreference } from './layout-preference';
export type {
  ColumnPreference,
  LayoutPreference,
  UseLayoutPreferenceOptions,
  UseLayoutPreferenceReturn,
} from './layout-preference';
