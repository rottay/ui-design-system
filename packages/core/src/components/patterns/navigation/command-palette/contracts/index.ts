/**
 * @fileoverview Type definitions for the CommandPalette pattern component.
 * Defines `CommandItem` (a single selectable action entry with optional icon,
 * keyboard shortcut, and group) and `CommandPaletteProps` controlling the
 * searchable, keyboard-navigable overlay used for quick actions and navigation.
 *
 * The command palette follows the Cmd+K / Ctrl+K pattern popularized by
 * VS Code, Slack, and Linear.
 *
 * ## Registry integration
 *
 * The palette is a **presentational pattern** — it receives items as props.
 * To connect it to the command registry, use the `useCommandPaletteItems()`
 * bridge hook exported from `@rottay/design-system`:
 *
 * ```tsx
 * const { items, onSearch } = useCommandPaletteItems();
 * <PatternCommandPalette items={items} onSearch={onSearch} ... />
 * ```
 */

import type { ReactNode } from 'react';
import type { PatternBaseProps } from '../../../../../foundation/contracts/runtime/components/patterns/core';

/**
 * Interaction state of the palette. `search` is the default command-finding
 * state; `argument` is entered by selecting an item with a `parameter` --
 * the input collects the argument behind a breadcrumb chip, Enter confirms
 * (`onSubmit(value)`), and Escape pops back to `search`. Engines expose the
 * current mode as `data-mode` on the pattern root.
 */
export type CommandPaletteMode = 'search' | 'argument';

/**
 * Argument specification for a parameterized command item. Selecting an item
 * that carries a parameter does not fire `onSelect`; the palette switches to
 * argument mode and calls `onSubmit` with the confirmed value instead.
 */
export interface CommandItemParameter {
  /** Prompt displayed while collecting the argument (e.g. "Branch name"). */
  prompt: string;

  /** Placeholder for the argument input. */
  placeholder?: string;

  /**
   * Validation run on confirm. Return an error message to reject the value
   * (the palette stays in argument mode and shows it), or null to accept.
   */
  validate?: (value: string) => string | null;
}

/**
 * Represents a single actionable entry in the command palette.
 *
 * Items are rendered as selectable rows. They can be grouped (e.g. "Navigation",
 * "Actions", "Settings") and optionally display an icon and keyboard shortcut
 * hint.
 */
export interface CommandItem {
  /** Unique identifier for this command. Used as React key. */
  id: string;

  /** Primary label displayed for this command (e.g. "Go to Dashboard"). */
  label: string;

  /**
   * Secondary description displayed below or beside the label. Useful for
   * disambiguating similarly named commands or providing context.
   */
  description?: string;

  /** Icon rendered to the left of the label. Typically a DS Icon component. */
  icon?: ReactNode;

  /**
   * Keyboard shortcut hint displayed on the right side of the row
   * (e.g. `"Cmd+D"`, `"Ctrl+Shift+P"`). This is display-only -- the parent
   * must register the actual keyboard listener separately.
   */
  shortcut?: string;

  /**
   * Group name used to visually section items in the list (e.g. "Navigation",
   * "Actions"). Items with the same `group` value are clustered together
   * under a group header.
   */
  group?: string;

  /**
   * Called when this command is selected (via click or Enter key). The
   * palette automatically closes after selection.
   */
  onSelect: () => void;

  /**
   * Whether this command is currently disabled. Disabled items are rendered
   * with reduced opacity and cannot be selected.
   * @default false
   */
  disabled?: boolean;

  /**
   * Row semantics. `command` (default) is a selectable action row. `error`
   * renders a non-selectable notice row (`data-part="error"`) -- used by the
   * registry bridge to surface a failed command source honestly inside that
   * source's section instead of leaving it silently empty.
   * @default 'command'
   */
  kind?: 'command' | 'error';

  /**
   * When set, selecting this item enters argument mode instead of firing
   * `onSelect`: the palette shows a breadcrumb chip with the item label plus
   * the parameter prompt, and confirms through `onSubmit`.
   */
  parameter?: CommandItemParameter;

  /**
   * Called with the confirmed argument value when this parameterized item is
   * submitted (Enter in argument mode, after `parameter.validate` accepts).
   * Required for items that declare `parameter`; items without a parameter
   * never receive this call.
   */
  onSubmit?: (value: string) => void;
}

/**
 * Props for the CommandPalette pattern component.
 *
 * The CommandPalette renders a modal overlay with a search input and a
 * filterable list of commands. It supports keyboard navigation (arrow keys,
 * Enter, Escape), group headings, recent items, and async search.
 *
 * @example
 * ```tsx
 * <PatternCommandPalette
 *   open={isPaletteOpen}
 *   onOpenChange={setIsPaletteOpen}
 *   items={commands}
 *   recentItems={recentCommands}
 *   placeholder="Type a command or search..."
 *   emptyMessage="No matching commands"
 *   onSearch={(query) => fetchCommands(query)}
 *   footer={<Text size="xs" color="muted">Tip: Use arrow keys to navigate</Text>}
 * />
 * ```
 */
export interface CommandPaletteProps extends PatternBaseProps {
  /**
   * Whether the command palette is currently visible. This is a controlled
   * prop -- the parent must toggle it via `onOpenChange`.
   */
  open: boolean;

  /**
   * Called when the palette should open or close (e.g. Escape key pressed,
   * backdrop clicked, or a command selected).
   *
   * @param open - The new desired open state.
   */
  onOpenChange: (open: boolean) => void;

  /**
   * Array of command items to display. Items are filtered by the search
   * query and grouped by their `group` property.
   */
  items: CommandItem[];

  /**
   * Placeholder text for the search input at the top of the palette.
   * @default "Search commands..."
   */
  placeholder?: string;

  /**
   * Message displayed when no items match the current search query.
   * @default "No results found"
   */
  emptyMessage?: string;

  /**
   * Called on every search input change. Enables async/server-side command
   * search. When omitted, the palette performs client-side label filtering.
   *
   * @param query - The current search text.
   */
  onSearch?: (query: string) => void;

  /**
   * Footer slot rendered at the bottom of the palette. Useful for keyboard
   * shortcut hints, help links, or branding.
   */
  footer?: ReactNode;

  /**
   * Recently used commands displayed in a separate "Recent" section before
   * the main items list. Provides quick access to frequently used actions.
   */
  recentItems?: CommandItem[];

  /**
   * Maximum height of the command list (excluding the search input and
   * footer). When content exceeds this value, a vertical scrollbar appears.
   * Accepts a number (pixels) or CSS string (e.g. `"50vh"`).
   * @default 400
   */
  maxHeight?: number | string;
}
