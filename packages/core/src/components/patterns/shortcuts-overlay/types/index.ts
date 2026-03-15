import type { ReactNode } from 'react';
import type { PatternBaseProps } from '../../types';

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
 * Props for the ShortcutsOverlay pattern.
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
