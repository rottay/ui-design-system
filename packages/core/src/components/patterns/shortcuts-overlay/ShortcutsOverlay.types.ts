/**
 * @fileoverview Type definitions for the ShortcutsOverlay pattern. Defines
 * ShortcutDisplayItem (key combo, description, category) and the overlay
 * props controlling visibility, search, and footer content.
 */

import type { ReactNode } from 'react';
import type { PatternBaseProps } from '../types';

/**
 * A grouped shortcut for overlay display.
 */
export interface ShortcutDisplayItem {
  /** Raw key combo string (e.g. 'ctrl+k') */
  key: string;
  /** Human-readable description */
  description: string;
  /** Optional category for grouping */
  category?: string;
}

/**
 * Props for the ShortcutsOverlay pattern component.
 * Renders a modal overlay listing all registered keyboard shortcuts,
 * grouped by category and searchable. Typically triggered by pressing "?".
 *
 * @example
 * ```tsx
 * <ShortcutsOverlay
 *   open={showShortcuts}
 *   onOpenChange={setShowShortcuts}
 *   shortcuts={[
 *     { key: 'ctrl+k', description: 'Open command palette', category: 'Navigation' },
 *     { key: 'ctrl+/', description: 'Toggle sidebar', category: 'Navigation' },
 *     { key: 'ctrl+s', description: 'Save changes', category: 'Editing' },
 *   ]}
 *   title="Keyboard Shortcuts"
 *   searchPlaceholder="Search shortcuts..."
 *   emptyMessage="No shortcuts match your search"
 * />
 * ```
 */
export interface ShortcutsOverlayProps extends PatternBaseProps {
  /** Whether the overlay is visible */
  open: boolean;
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void;
  /** Shortcuts to display (usually from useRegisteredShortcuts) */
  shortcuts: ShortcutDisplayItem[];
  /** Title text for the overlay */
  title?: string;
  /** Placeholder text for the search input */
  searchPlaceholder?: string;
  /** Message shown when no shortcuts match search */
  emptyMessage?: string;
  /** Optional footer content */
  footer?: ReactNode;
}
