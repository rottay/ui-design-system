'use client';

/**
 * @fileoverview State Hooks - Rottay Design System
 * @description React hooks for advanced state management patterns including
 * undo/redo history and persistent layout preferences.
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
 * @module System/Hooks/State
 * @category System
 * @package @rottay/design-system
 */

export { useUndoRedo } from './undo-redo';
export type {
  UseUndoRedoOptions,
  UseUndoRedoReturn,
} from './undo-redo';

export { useLayoutPreference } from './layout-preference';
export type {
  ColumnPreference,
  LayoutPreference,
  UseLayoutPreferenceOptions,
  UseLayoutPreferenceReturn,
} from './layout-preference';
