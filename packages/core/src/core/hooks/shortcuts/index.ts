'use client';

/**
 * @fileoverview Global Keyboard Shortcuts - Rottay Design System
 * @description React hooks and context for registering and managing global keyboard shortcuts.
 * Supports single keys, modifier combos, and key sequences (Linear/Figma pattern).
 *
 * @remarks
 * Features:
 * - Single keys: `e`, `c`, `?`, `escape`
 * - Modifier combos: `ctrl+k`, `cmd+shift+p`, `alt+n`
 * - Key sequences: `g+i` (press g, then i within 1s)
 * - Auto-suppression when typing in inputs/textareas/contenteditable
 * - Conflict detection with console warnings
 * - Conditional activation via `when` callback
 * - Category grouping for overlay display
 *
 * @example Register a shortcut
 * ```tsx
 * useGlobalShortcut({
 *   key: 'ctrl+k',
 *   handler: () => openCommandPalette(),
 *   description: 'Open command palette',
 *   category: 'Global',
 * });
 * ```
 *
 * @example Register multiple shortcuts
 * ```tsx
 * useGlobalShortcuts([
 *   { key: 'g+i', handler: () => navigate('/inbox'), description: 'Go to inbox', category: 'Navigation' },
 *   { key: 'c', handler: () => createNew(), description: 'Create new item', category: 'Actions' },
 * ]);
 * ```
 *
 * @module System/Hooks/Shortcuts
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
  type ReactNode,
} from 'react';
import { createElement } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Definition of a keyboard shortcut.
 */
export interface ShortcutDefinition {
  /** Key combo string, e.g. 'g+i', 'ctrl+k', 'shift+?', 'escape' */
  key: string;
  /** Handler invoked when the shortcut fires */
  handler: () => void;
  /** Human-readable description for the overlay */
  description: string;
  /** Category for grouping in the overlay display */
  category?: string;
  /** Conditional activation: shortcut only fires when this returns true */
  when?: () => boolean;
}

/**
 * Internal representation of a parsed shortcut.
 */
interface ParsedShortcut {
  /** Original definition */
  definition: ShortcutDefinition;
  /** Whether this is a sequence (e.g. g then i) vs a combo (e.g. ctrl+k) */
  isSequence: boolean;
  /** For combos: modifier flags */
  modifiers: {
    ctrl: boolean;
    alt: boolean;
    shift: boolean;
    meta: boolean;
  };
  /** For combos: the final key (lowercase) */
  key: string;
  /** For sequences: the ordered keys */
  sequence: string[];
}

// ---------------------------------------------------------------------------
// Utility: parse shortcut string
// ---------------------------------------------------------------------------

const MODIFIER_KEYS = new Set(['ctrl', 'control', 'alt', 'option', 'shift', 'meta', 'cmd', 'command', 'mod']);

/**
 * Normalize a key name for comparison.
 */
function normalizeKey(raw: string): string {
  const k = raw.toLowerCase().trim();
  switch (k) {
    case 'esc': return 'escape';
    case 'del': return 'delete';
    case 'return': return 'enter';
    case ' ': return 'space';
    case 'cmd':
    case 'command':
      return 'meta';
    case 'option':
      return 'alt';
    case 'control':
      return 'ctrl';
    default:
      return k;
  }
}

/**
 * Detect if the platform is macOS (for mod key resolution).
 */
function isMac(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /mac|iphone|ipad|ipod/i.test(navigator.userAgent);
}

/**
 * Parse a shortcut key string into structured form.
 *
 * Heuristic for sequence vs combo:
 * - If any part is a modifier key, it's a combo: `ctrl+k`
 * - If all parts are non-modifier single chars, it's a sequence: `g+i`
 * - Single keys are treated as combos with no modifiers: `escape`, `?`
 */
function parseShortcut(definition: ShortcutDefinition): ParsedShortcut {
  const parts = definition.key.split('+').map((p) => p.trim().toLowerCase());

  // Check if any part is a known modifier
  const hasModifier = parts.some((p) => MODIFIER_KEYS.has(p));

  if (hasModifier || parts.length === 1) {
    // Combo mode (including single key like 'escape')
    const modifiers = { ctrl: false, alt: false, shift: false, meta: false };
    let mainKey = '';

    for (const part of parts) {
      const normalized = normalizeKey(part);
      switch (normalized) {
        case 'ctrl':
          modifiers.ctrl = true;
          break;
        case 'alt':
          modifiers.alt = true;
          break;
        case 'shift':
          modifiers.shift = true;
          break;
        case 'meta':
          modifiers.meta = true;
          break;
        case 'mod':
          // mod = meta on Mac, ctrl elsewhere
          if (isMac()) {
            modifiers.meta = true;
          } else {
            modifiers.ctrl = true;
          }
          break;
        default:
          mainKey = normalized;
      }
    }

    return {
      definition,
      isSequence: false,
      modifiers,
      key: mainKey || parts[parts.length - 1],
      sequence: [],
    };
  }

  // Sequence mode: e.g. 'g+i' -> press g, then i
  return {
    definition,
    isSequence: true,
    modifiers: { ctrl: false, alt: false, shift: false, meta: false },
    key: '',
    sequence: parts.map(normalizeKey),
  };
}

/**
 * Check if a keyboard event matches a combo shortcut.
 */
function matchesCombo(event: KeyboardEvent, parsed: ParsedShortcut): boolean {
  if (parsed.isSequence) return false;

  const eventKey = normalizeKey(event.key);

  // Special handling for '?' which requires shift
  if (parsed.key === '?' && eventKey === '?') {
    if (parsed.modifiers.ctrl !== event.ctrlKey) return false;
    if (parsed.modifiers.alt !== event.altKey) return false;
    if (parsed.modifiers.meta !== event.metaKey) return false;
    // Don't check shift for '?' since it inherently requires shift
    return true;
  }

  if (eventKey !== parsed.key) return false;

  if (parsed.modifiers.ctrl !== event.ctrlKey) return false;
  if (parsed.modifiers.alt !== event.altKey) return false;
  if (parsed.modifiers.shift !== event.shiftKey) return false;
  if (parsed.modifiers.meta !== event.metaKey) return false;

  return true;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface ShortcutRegistryEntry {
  id: string;
  parsed: ParsedShortcut;
}

interface ShortcutContextValue {
  register: (entry: ShortcutRegistryEntry) => void;
  unregister: (id: string) => void;
  getAll: () => ShortcutDefinition[];
}

const ShortcutContext = createContext<ShortcutContextValue | null>(null);

function useShortcutContext(): ShortcutContextValue {
  const ctx = useContext(ShortcutContext);
  if (!ctx) {
    throw new Error(
      '[Rottay DS] useGlobalShortcut must be used within a <ShortcutProvider>. ' +
      'Wrap your app with <ShortcutProvider> to enable keyboard shortcuts.'
    );
  }
  return ctx;
}

// ---------------------------------------------------------------------------
// Check if the event target is an input element
// ---------------------------------------------------------------------------

function isEditableElement(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;

  const tagName = target.tagName.toLowerCase();
  if (tagName === 'input' || tagName === 'textarea' || tagName === 'select') {
    return true;
  }

  if (target.isContentEditable) return true;

  // Also check role="textbox"
  if (target.getAttribute('role') === 'textbox') return true;

  return false;
}

// ---------------------------------------------------------------------------
// ShortcutProvider
// ---------------------------------------------------------------------------

/**
 * Sequence timeout in milliseconds.
 * After pressing the first key of a sequence, the second key must be
 * pressed within this window.
 */
const SEQUENCE_TIMEOUT = 1000;

export interface ShortcutProviderProps {
  children: ReactNode;
}

/**
 * Provider that manages the global shortcut registry and keyboard listener.
 * Must wrap your application to enable `useGlobalShortcut` and `useGlobalShortcuts`.
 *
 * @example
 * ```tsx
 * <ShortcutProvider>
 *   <App />
 * </ShortcutProvider>
 * ```
 */
export function ShortcutProvider({ children }: ShortcutProviderProps) {
  const registryRef = useRef<Map<string, ShortcutRegistryEntry>>(new Map());
  const sequenceBufferRef = useRef<string[]>([]);
  const sequenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const register = useCallback((entry: ShortcutRegistryEntry) => {
    const existing = registryRef.current.get(entry.id);
    if (!existing) {
      // Check for conflicts
      for (const [existingId, existingEntry] of registryRef.current.entries()) {
        if (existingEntry.parsed.definition.key === entry.parsed.definition.key) {
          if (process.env.NODE_ENV !== 'production') {
            console.warn(
              `[Rottay DS] Shortcut conflict: "${entry.parsed.definition.key}" is already registered ` +
              `by "${existingEntry.parsed.definition.description}". ` +
              `New registration: "${entry.parsed.definition.description}".`
            );
          }
        }
      }
    }
    registryRef.current.set(entry.id, entry);
  }, []);

  const unregister = useCallback((id: string) => {
    registryRef.current.delete(id);
  }, []);

  const getAll = useCallback((): ShortcutDefinition[] => {
    const definitions: ShortcutDefinition[] = [];
    for (const entry of registryRef.current.values()) {
      definitions.push(entry.parsed.definition);
    }
    return definitions;
  }, []);

  // Global keydown handler
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // Skip if user is typing in an input
      if (isEditableElement(event.target)) return;

      // Skip modifier-only keypresses
      if (['Control', 'Alt', 'Shift', 'Meta'].includes(event.key)) return;

      const eventKey = normalizeKey(event.key);

      // First: check combo shortcuts
      for (const entry of registryRef.current.values()) {
        const { parsed } = entry;
        if (parsed.isSequence) continue;

        if (matchesCombo(event, parsed)) {
          // Check conditional
          if (parsed.definition.when && !parsed.definition.when()) continue;

          event.preventDefault();
          event.stopPropagation();
          parsed.definition.handler();
          // Clear any pending sequence
          sequenceBufferRef.current = [];
          if (sequenceTimerRef.current) {
            clearTimeout(sequenceTimerRef.current);
            sequenceTimerRef.current = null;
          }
          return;
        }
      }

      // Second: handle sequences
      // Only process sequences when no modifiers are held (except shift for chars)
      if (event.ctrlKey || event.altKey || event.metaKey) {
        sequenceBufferRef.current = [];
        return;
      }

      // Add to sequence buffer
      sequenceBufferRef.current.push(eventKey);

      // Clear previous timer
      if (sequenceTimerRef.current) {
        clearTimeout(sequenceTimerRef.current);
      }

      // Check if any sequence matches
      for (const entry of registryRef.current.values()) {
        const { parsed } = entry;
        if (!parsed.isSequence) continue;

        const { sequence } = parsed;
        const buffer = sequenceBufferRef.current;

        // Check if buffer ends with the sequence
        if (buffer.length >= sequence.length) {
          const tail = buffer.slice(buffer.length - sequence.length);
          const matches = tail.every((k, i) => k === sequence[i]);

          if (matches) {
            // Check conditional
            if (parsed.definition.when && !parsed.definition.when()) continue;

            event.preventDefault();
            parsed.definition.handler();
            sequenceBufferRef.current = [];
            if (sequenceTimerRef.current) {
              clearTimeout(sequenceTimerRef.current);
              sequenceTimerRef.current = null;
            }
            return;
          }
        }
      }

      // Set timeout to clear sequence buffer
      sequenceTimerRef.current = setTimeout(() => {
        sequenceBufferRef.current = [];
        sequenceTimerRef.current = null;
      }, SEQUENCE_TIMEOUT);
    }

    document.addEventListener('keydown', handleKeyDown, true);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      if (sequenceTimerRef.current) {
        clearTimeout(sequenceTimerRef.current);
      }
    };
  }, []);

  const value = useMemo<ShortcutContextValue>(
    () => ({ register, unregister, getAll }),
    [register, unregister, getAll]
  );

  return createElement(ShortcutContext.Provider, { value }, children);
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

let shortcutIdCounter = 0;

/**
 * Register a single global keyboard shortcut.
 * The shortcut is automatically unregistered when the component unmounts.
 *
 * @param shortcut - Shortcut definition
 *
 * @example
 * ```tsx
 * useGlobalShortcut({
 *   key: 'ctrl+k',
 *   handler: () => setCommandPaletteOpen(true),
 *   description: 'Open command palette',
 *   category: 'Global',
 * });
 * ```
 */
export function useGlobalShortcut(shortcut: ShortcutDefinition): void {
  const ctx = useShortcutContext();
  const idRef = useRef<string>('');

  // Stable id across renders
  if (!idRef.current) {
    shortcutIdCounter++;
    idRef.current = `shortcut-${shortcutIdCounter}`;
  }

  // Use a ref to always have latest handler/when without re-registering
  const shortcutRef = useRef(shortcut);
  shortcutRef.current = shortcut;

  useEffect(() => {
    const id = idRef.current;
    const wrappedDefinition: ShortcutDefinition = {
      key: shortcutRef.current.key,
      description: shortcutRef.current.description,
      category: shortcutRef.current.category,
      handler: () => shortcutRef.current.handler(),
      when: shortcutRef.current.when ? () => shortcutRef.current.when!() : undefined,
    };

    const parsed = parseShortcut(wrappedDefinition);
    ctx.register({ id, parsed });

    return () => {
      ctx.unregister(id);
    };
    // Only re-register when the key or description changes (structural changes)
    // Handler/when changes are picked up via ref
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx, shortcut.key, shortcut.description, shortcut.category]);
}

/**
 * Register multiple global keyboard shortcuts at once.
 *
 * @param shortcuts - Array of shortcut definitions
 *
 * @example
 * ```tsx
 * useGlobalShortcuts([
 *   { key: 'g+i', handler: () => navigate('/inbox'), description: 'Go to Inbox', category: 'Navigation' },
 *   { key: 'g+p', handler: () => navigate('/projects'), description: 'Go to Projects', category: 'Navigation' },
 *   { key: 'c', handler: () => createItem(), description: 'Create new item', category: 'Actions' },
 * ]);
 * ```
 */
export function useGlobalShortcuts(shortcuts: ShortcutDefinition[]): void {
  const ctx = useShortcutContext();
  const idsRef = useRef<string[]>([]);

  // Use a ref to always have latest handlers
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  useEffect(() => {
    // Generate ids if needed
    while (idsRef.current.length < shortcutsRef.current.length) {
      shortcutIdCounter++;
      idsRef.current.push(`shortcut-${shortcutIdCounter}`);
    }

    const ids = idsRef.current;

    // Register all
    shortcutsRef.current.forEach((shortcut, index) => {
      const id = ids[index];
      const wrappedDefinition: ShortcutDefinition = {
        key: shortcut.key,
        description: shortcut.description,
        category: shortcut.category,
        handler: () => shortcutsRef.current[index]?.handler(),
        when: shortcut.when ? () => shortcutsRef.current[index]?.when?.() ?? false : undefined,
      };

      const parsed = parseShortcut(wrappedDefinition);
      ctx.register({ id, parsed });
    });

    return () => {
      ids.forEach((id) => ctx.unregister(id));
    };
    // Serialize the key/description array to detect structural changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    ctx,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    shortcuts.map((s) => `${s.key}::${s.description}::${s.category ?? ''}`).join('|'),
  ]);
}

/**
 * Get all currently registered shortcuts.
 * Used by the ShortcutsOverlay to display all available shortcuts.
 *
 * @returns Array of all registered shortcut definitions
 *
 * @example
 * ```tsx
 * const shortcuts = useRegisteredShortcuts();
 * const grouped = groupBy(shortcuts, s => s.category);
 * ```
 */
export function useRegisteredShortcuts(): ShortcutDefinition[] {
  const ctx = useShortcutContext();
  return ctx.getAll();
}

// ---------------------------------------------------------------------------
// Utility: format shortcut key for display
// ---------------------------------------------------------------------------

/**
 * Format a shortcut key string for human-readable display.
 * Converts modifier names to platform-appropriate symbols.
 *
 * @param key - Raw shortcut key string (e.g. 'ctrl+k', 'g+i')
 * @returns Array of key segments for display
 *
 * @example
 * ```ts
 * formatShortcutKey('ctrl+k') // ['Ctrl', 'K'] or ['Cmd', 'K'] on Mac
 * formatShortcutKey('g+i') // ['G', 'I']
 * formatShortcutKey('escape') // ['Esc']
 * ```
 */
export function formatShortcutKey(key: string): string[] {
  const mac = isMac();
  const parts = key.split('+').map((p) => p.trim().toLowerCase());

  return parts.map((part) => {
    switch (part) {
      case 'ctrl':
      case 'control':
        return mac ? '\u2303' : 'Ctrl';
      case 'alt':
      case 'option':
        return mac ? '\u2325' : 'Alt';
      case 'shift':
        return mac ? '\u21E7' : 'Shift';
      case 'meta':
      case 'cmd':
      case 'command':
        return mac ? '\u2318' : 'Win';
      case 'mod':
        return mac ? '\u2318' : 'Ctrl';
      case 'enter':
      case 'return':
        return mac ? '\u21A9' : 'Enter';
      case 'escape':
      case 'esc':
        return 'Esc';
      case 'backspace':
        return mac ? '\u232B' : 'Backspace';
      case 'delete':
      case 'del':
        return mac ? '\u2326' : 'Del';
      case 'tab':
        return mac ? '\u21E5' : 'Tab';
      case 'space':
        return 'Space';
      case 'arrowup':
        return '\u2191';
      case 'arrowdown':
        return '\u2193';
      case 'arrowleft':
        return '\u2190';
      case 'arrowright':
        return '\u2192';
      default:
        return part.length === 1 ? part.toUpperCase() : part.charAt(0).toUpperCase() + part.slice(1);
    }
  });
}
