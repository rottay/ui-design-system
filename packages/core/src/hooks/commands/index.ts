'use client';

/**
 * @fileoverview Command Registry Hook - Rottay Design System
 * @description React context, provider, and hooks for a global action registry that
 * integrates with CommandPalette and keyboard shortcuts. Commands auto-register on
 * mount and auto-unregister on unmount.
 *
 * @remarks
 * Features:
 * - Global command registry via React context
 * - Auto-register on mount, auto-unregister on unmount
 * - Category grouping for palette display
 * - Fuzzy search over label + description
 * - Shortcut integration (auto-registers with `useGlobalShortcut` when shortcut is provided)
 * - Priority-based sorting
 * - Conditional availability via `when()` callback
 *
 * @example Provider setup
 * ```tsx
 * <CommandRegistryProvider>
 *   <App />
 * </CommandRegistryProvider>
 * ```
 *
 * @example Registering commands
 * ```tsx
 * useRegisterCommands([
 *   {
 *     id: 'create-ticket',
 *     label: 'Create Ticket',
 *     description: 'Open the new ticket form',
 *     category: 'Actions',
 *     shortcut: 'ctrl+n',
 *     action: () => openNewTicketModal(),
 *     priority: 10,
 *   },
 *   {
 *     id: 'go-inbox',
 *     label: 'Go to Inbox',
 *     category: 'Navigation',
 *     shortcut: 'g+i',
 *     action: () => navigate('/inbox'),
 *   },
 * ]);
 * ```
 *
 * @example Consuming commands (for CommandPalette)
 * ```tsx
 * const { commands, execute, search } = useCommands();
 * const filtered = search(query);
 * ```
 *
 * @module System/Hooks/Commands
 * @category System
 * @package @rottay/design-system
 */

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useRef,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { createElement } from 'react';

// ============================================================================
// Types
// ============================================================================

/**
 * Definition of a command that can be registered in the registry.
 */
export interface Command {
  /** Unique identifier for this command. */
  id: string;
  /** Display label shown in the command palette. */
  label: string;
  /** Optional longer description for search and display. */
  description?: string;
  /** Category for grouping in the palette (e.g. 'Navigation', 'Actions'). */
  category?: string;
  /** Optional icon element rendered next to the label. */
  icon?: ReactNode;
  /** Keyboard shortcut string (e.g. 'ctrl+n', 'g+i'). Auto-registers with ShortcutProvider. */
  shortcut?: string;
  /** Action to execute when the command is invoked. */
  action: () => void | Promise<void>;
  /** Conditional availability: command only appears/executes when this returns true. */
  when?: () => boolean;
  /** Sort priority in the command palette. Higher numbers appear first. */
  priority?: number;
}

/**
 * Return type of the `useCommands` hook.
 */
export interface UseCommandsReturn {
  /** All currently registered and available commands, sorted by priority. */
  commands: Command[];
  /** Execute a command by its ID. Throws if the command is not found. */
  execute: (commandId: string) => Promise<void>;
  /** Fuzzy search over command labels and descriptions. Returns matches sorted by relevance. */
  search: (query: string) => Command[];
}

// ============================================================================
// Context
// ============================================================================

interface CommandRegistryContextValue {
  register: (commands: Command[]) => void;
  unregister: (commandIds: string[]) => void;
  getAll: () => Command[];
  execute: (commandId: string) => Promise<void>;
  /** Incremented on every register/unregister to trigger re-renders in consumers. */
  version: number;
}

const CommandRegistryContext = createContext<CommandRegistryContextValue | null>(null);

function useCommandRegistryContext(): CommandRegistryContextValue {
  const ctx = useContext(CommandRegistryContext);
  if (!ctx) {
    throw new Error(
      '[Rottay DS] useRegisterCommands/useCommands/useExecuteCommand must be used within ' +
      'a <CommandRegistryProvider>. Wrap your app with <CommandRegistryProvider> to enable the command registry.',
    );
  }
  return ctx;
}

// ============================================================================
// Fuzzy Search
// ============================================================================

/**
 * Simple fuzzy match: checks if all characters of the query appear in order
 * within the target string. Returns a score (lower is better) or -1 for no match.
 */
function fuzzyMatch(query: string, target: string): number {
  const q = query.toLowerCase();
  const t = target.toLowerCase();

  // Fast path: exact substring match gets the best possible score.
  // The score equals the position of the match, so "abc" at index 0
  // scores 0 (best), at index 5 scores 5 (slightly worse).
  const substringIndex = t.indexOf(q);
  if (substringIndex !== -1) {
    return substringIndex;
  }

  // Slow path: character-by-character fuzzy match. Each query character
  // must appear in order within the target, but gaps are allowed.
  let qi = 0;
  let score = 0;
  let lastMatchIndex = -1;

  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      // Penalize gaps between consecutive matched characters -- larger
      // gaps indicate a weaker match (e.g. "gp" matching "go to projects"
      // has a large gap vs "gp" matching "gps").
      if (lastMatchIndex !== -1) {
        score += (ti - lastMatchIndex - 1);
      }
      lastMatchIndex = ti;
      qi++;
    }
  }

  if (qi === q.length) {
    // Offset by 100 so that ANY fuzzy match scores worse than ANY
    // substring match, keeping substring results above fuzzy ones.
    return 100 + score;
  }

  return -1; // No match -- not all query characters were found in order
}

/**
 * Score a command against a search query.
 * Searches across label and description. Returns the best score or -1.
 */
/**
 * Score a command against a search query by searching both label and
 * description. Description matches are penalized by +50 so label matches
 * always rank higher for the same fuzzy distance.
 */
function scoreCommand(command: Command, query: string): number {
  const labelScore = fuzzyMatch(query, command.label);
  const descScore = command.description
    ? fuzzyMatch(query, command.description)
    : -1;

  if (labelScore === -1 && descScore === -1) return -1;

  // When both match, take the better score but penalize description
  // to prefer label-based matches in the final ranking.
  if (labelScore !== -1 && descScore !== -1) {
    return Math.min(labelScore, descScore + 50);
  }

  return labelScore !== -1 ? labelScore : descScore + 50;
}

// ============================================================================
// Provider
// ============================================================================

export interface CommandRegistryProviderProps {
  children: ReactNode;
}

/**
 * Provider that holds the global command registry.
 * Must wrap your application (or relevant section) to enable command hooks.
 *
 * @example
 * ```tsx
 * <CommandRegistryProvider>
 *   <App />
 * </CommandRegistryProvider>
 * ```
 */
export function CommandRegistryProvider({ children }: CommandRegistryProviderProps) {
  // The registry is stored in a ref (not state) so that register/unregister
  // calls don't trigger a re-render of the Provider itself. Only the
  // version counter is state, and it only bumps when the set of IDs
  // actually changes, minimizing downstream re-renders.
  const registryRef = useRef<Map<string, Command>>(new Map());
  const [version, setVersion] = useState(0);

  const register = useCallback((commands: Command[]) => {
    let changed = false;
    for (const cmd of commands) {
      // Only flag as changed when a genuinely new ID appears. Overwriting
      // an existing ID (e.g. due to a re-render with updated action) is
      // silent to avoid unnecessary version bumps.
      if (!registryRef.current.has(cmd.id)) {
        changed = true;
      }
      registryRef.current.set(cmd.id, cmd);
    }
    if (changed) {
      setVersion((v) => v + 1);
    }
  }, []);

  const unregister = useCallback((commandIds: string[]) => {
    let changed = false;
    for (const id of commandIds) {
      if (registryRef.current.delete(id)) {
        changed = true;
      }
    }
    if (changed) {
      setVersion((v) => v + 1);
    }
  }, []);

  const getAll = useCallback((): Command[] => {
    const commands: Command[] = [];
    for (const cmd of registryRef.current.values()) {
      // Filter by conditional availability
      if (cmd.when && !cmd.when()) continue;
      commands.push(cmd);
    }
    // Sort by priority (higher first), then alphabetically by label
    commands.sort((a, b) => {
      const pa = a.priority ?? 0;
      const pb = b.priority ?? 0;
      if (pb !== pa) return pb - pa;
      return a.label.localeCompare(b.label);
    });
    return commands;
  }, []);

  const execute = useCallback(async (commandId: string): Promise<void> => {
    const cmd = registryRef.current.get(commandId);
    if (!cmd) {
      throw new Error(`[Rottay DS] Command "${commandId}" not found in registry.`);
    }
    if (cmd.when && !cmd.when()) {
      throw new Error(`[Rottay DS] Command "${commandId}" is not available (when() returned false).`);
    }
    await cmd.action();
  }, []);

  const value = useMemo<CommandRegistryContextValue>(
    () => ({ register, unregister, getAll, execute, version }),
    [register, unregister, getAll, execute, version],
  );

  return createElement(CommandRegistryContext.Provider, { value }, children);
}

// ============================================================================
// useRegisterCommands
// ============================================================================

/**
 * Register commands in the global registry.
 * Commands are automatically unregistered when the component unmounts.
 *
 * When a command has a `shortcut` property, it is automatically registered
 * as a global keyboard shortcut via the ShortcutProvider (if available).
 * Note: The ShortcutProvider must also wrap your app for shortcuts to work.
 *
 * @param commands - Array of command definitions to register
 *
 * @example
 * ```tsx
 * useRegisterCommands([
 *   { id: 'save', label: 'Save', shortcut: 'ctrl+s', action: () => save() },
 *   { id: 'undo', label: 'Undo', shortcut: 'ctrl+z', action: () => undo() },
 * ]);
 * ```
 */
export function useRegisterCommands(commands: Command[]): void {
  const ctx = useCommandRegistryContext();

  // Ref keeps the latest commands array without adding it to the effect
  // dependency array, so the effect only re-runs when the structural
  // fingerprint (ids, labels, shortcuts, categories) changes.
  const commandsRef = useRef(commands);
  commandsRef.current = commands;

  // Capture register/unregister in a ref so the effect never depends on
  // the context object. Including `ctx` in the deps causes an infinite
  // loop: register -> version bump -> new ctx -> cleanup (unregister) ->
  // version bump -> new ctx -> register (IDs are "new" again) -> repeat.
  const ctxRef = useRef(ctx);
  ctxRef.current = ctx;

  useEffect(() => {
    const cmds = commandsRef.current;
    ctxRef.current.register(cmds);

    const ids = cmds.map((c) => c.id);

    return () => {
      ctxRef.current.unregister(ids);
    };
    // The dependency is a serialized fingerprint of the commands array
    // structure. This lets us re-register when IDs/labels/shortcuts change
    // without re-running on every render (which would happen if the
    // commands array were a direct dependency, since it's usually a new
    // array reference each render).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // eslint-disable-next-line react-hooks/exhaustive-deps
    commands.map((c) => `${c.id}::${c.label}::${c.shortcut ?? ''}::${c.category ?? ''}`).join('|'),
  ]);

  // Wire up keyboard shortcuts for commands that declare a shortcut string.
  useShortcutIntegration(commands);
}

/**
 * Internal hook that registers keyboard shortcuts for commands with shortcut strings.
 * Uses the ShortcutProvider if available, falls back to native keydown listeners.
 */
/**
 * Internal hook that registers native keydown listeners for commands with
 * shortcut strings. Uses bubble-phase listeners (not capture) so that the
 * ShortcutProvider's capture-phase handler always takes priority, preventing
 * double-firing when both systems are active.
 */
function useShortcutIntegration(commands: Command[]): void {
  const commandsRef = useRef(commands);
  commandsRef.current = commands;

  const shortcutCommands = commands.filter((c) => c.shortcut);

  useEffect(() => {
    if (shortcutCommands.length === 0) return;

    function handleKeyDown(event: KeyboardEvent) {
      // Suppress shortcuts when the user is typing in form elements or
      // contentEditable regions to avoid intercepting normal text input.
      const target = event.target;
      if (target && target instanceof HTMLElement) {
        const tagName = target.tagName.toLowerCase();
        if (
          tagName === 'input' ||
          tagName === 'textarea' ||
          tagName === 'select' ||
          target.isContentEditable ||
          target.getAttribute('role') === 'textbox'
        ) {
          return;
        }
      }

      // Iterate through commands with shortcuts; first match wins.
      for (const cmd of commandsRef.current) {
        if (!cmd.shortcut) continue;
        if (cmd.when && !cmd.when()) continue;

        if (matchesShortcut(event, cmd.shortcut)) {
          event.preventDefault();
          event.stopPropagation();
          cmd.action();
          return;
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
    // Fingerprint-based dep: re-register only when the set of shortcut
    // bindings structurally changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shortcutCommands.map((c) => `${c.id}::${c.shortcut}`).join('|')]);
}

/**
 * Match a keyboard event against a combo-style shortcut string (e.g. 'ctrl+n').
 * Sequence shortcuts (e.g. 'g+i') are intentionally skipped here because they
 * require multi-keystroke buffering that the ShortcutProvider handles.
 *
 * @param event - The native keyboard event to test
 * @param shortcut - The shortcut string to match against
 * @returns `true` if the event matches the shortcut
 */
function matchesShortcut(event: KeyboardEvent, shortcut: string): boolean {
  const parts = shortcut.split('+').map((p) => p.trim().toLowerCase());

  const MODIFIERS = new Set(['ctrl', 'control', 'alt', 'option', 'shift', 'meta', 'cmd', 'command', 'mod']);
  const hasModifier = parts.some((p) => MODIFIERS.has(p));

  // Multi-part shortcuts without a modifier are sequences (e.g. 'g+i').
  // We deliberately return false to let the ShortcutProvider handle them.
  if (!hasModifier && parts.length > 1) {
    return false;
  }

  const expected = { ctrl: false, alt: false, shift: false, meta: false };
  let mainKey = '';

  for (const part of parts) {
    switch (part) {
      case 'ctrl':
      case 'control':
        expected.ctrl = true;
        break;
      case 'alt':
      case 'option':
        expected.alt = true;
        break;
      case 'shift':
        expected.shift = true;
        break;
      case 'meta':
      case 'cmd':
      case 'command':
        expected.meta = true;
        break;
      case 'mod':
        // mod = meta on Mac, ctrl elsewhere
        if (typeof navigator !== 'undefined' && /mac|iphone|ipad|ipod/i.test(navigator.userAgent)) {
          expected.meta = true;
        } else {
          expected.ctrl = true;
        }
        break;
      default:
        mainKey = part;
    }
  }

  const eventKey = event.key.toLowerCase();

  if (eventKey !== mainKey) return false;
  if (expected.ctrl !== event.ctrlKey) return false;
  if (expected.alt !== event.altKey) return false;
  if (expected.shift !== event.shiftKey) return false;
  if (expected.meta !== event.metaKey) return false;

  return true;
}

// ============================================================================
// useCommands
// ============================================================================

/**
 * Get all registered commands with search and execute capabilities.
 * Used by CommandPalette and similar UI components.
 *
 * @returns Object with commands array, execute function, and search function
 *
 * @example
 * ```tsx
 * const { commands, execute, search } = useCommands();
 *
 * // Show all commands
 * commands.map(cmd => <CommandItem key={cmd.id} command={cmd} />);
 *
 * // Search commands
 * const results = search('create');
 *
 * // Execute by id
 * await execute('create-ticket');
 * ```
 */
export function useCommands(): UseCommandsReturn {
  const ctx = useCommandRegistryContext();

  // Re-derive the filtered and sorted command list on every render.
  // Memoizing by version is insufficient because `when()` conditions on
  // individual commands can change independently of the registry.
  const commands = ctx.getAll();

  const search = useCallback(
    (query: string): Command[] => {
      if (!query.trim()) return commands;

      const scored: Array<{ command: Command; score: number }> = [];

      for (const cmd of commands) {
        const score = scoreCommand(cmd, query);
        if (score !== -1) {
          scored.push({ command: cmd, score });
        }
      }

      // Sort by search score (lower = better match), then by priority
      scored.sort((a, b) => {
        if (a.score !== b.score) return a.score - b.score;
        const pa = a.command.priority ?? 0;
        const pb = b.command.priority ?? 0;
        return pb - pa;
      });

      return scored.map((s) => s.command);
    },
    [commands],
  );

  const execute = useCallback(
    async (commandId: string): Promise<void> => {
      await ctx.execute(commandId);
    },
    [ctx],
  );

  return { commands, execute, search };
}

// ============================================================================
// useExecuteCommand
// ============================================================================

/**
 * Get a function to execute a command by its ID.
 * Lightweight alternative to `useCommands` when you only need execution.
 *
 * @returns Function that takes a command ID and executes the command
 *
 * @example
 * ```tsx
 * const executeCommand = useExecuteCommand();
 * await executeCommand('save-draft');
 * ```
 */
export function useExecuteCommand(): (commandId: string) => Promise<void> {
  const ctx = useCommandRegistryContext();
  return useCallback(
    async (commandId: string) => {
      await ctx.execute(commandId);
    },
    [ctx],
  );
}
