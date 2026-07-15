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
 * - Per-surface scopes via `scope` + `ShortcutScope`/`useShortcutScope`: a
 *   scoped shortcut fires only while its scope is active (see `ShortcutScope`)
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
 * @example Scoped shortcuts (fire only while a surface is active)
 * ```tsx
 * function TaskList() {
 *   const scopeRef = useShortcutScope('task-list');
 *   useGlobalShortcut({ key: 'j', handler: selectNext, description: 'Next task', scope: 'task-list' });
 *   return <div ref={scopeRef}>...</div>;
 * }
 * ```
 *
 * @status active. Note: `ShortcutProvider` is a standalone provider -- unlike
 * `CommandRegistryProvider`, it is NOT currently mounted by
 * `runtime/bootstrap/DesignSystemProvider`, so `useGlobalShortcut(s)` and
 * `useShortcutScope` throw unless the consuming app wraps its tree in
 * `<ShortcutProvider>` itself. `useRegisteredShortcuts` is the one exception:
 * it fails open (returns `[]`) without a provider so read-only consumers
 * (e.g. a shortcuts cheatsheet) never crash on a missing provider.
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
import { arrayValueAt } from '@/_internal/utils/collections';

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
  /**
   * Optional scope id. When set, this shortcut fires ONLY while its scope is
   * active: focus is within the DOM container registered for this scope via
   * `ShortcutScope`/`useShortcutScope`, OR -- when focus is outside every
   * registered scope container -- this is the most recently mounted scope.
   * At most one scope is considered active per keydown (focus-within always
   * wins over "topmost"), so two scoped shortcuts on the same key never fire
   * together. Omit for a global shortcut, which always fires (subject to
   * `when` and editable-element suppression) regardless of scope state.
   */
  scope?: string;
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
 *
 * @param definition - The shortcut definition to parse
 * @returns A structured representation for efficient matching at runtime
 */
function parseShortcut(definition: ShortcutDefinition): ParsedShortcut {
  const parts = definition.key.split('+').map((p) => p.trim().toLowerCase());

  // Disambiguation: if any token is a known modifier, the entire shortcut
  // is a combo (single keypress with modifiers held). Otherwise multi-token
  // shortcuts are sequences (multiple keypresses in order).
  const hasModifier = parts.some((p) => MODIFIER_KEYS.has(p));

  if (hasModifier || parts.length === 1) {
    // Combo mode: extract modifier flags and a single main key.
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
  registerScope: (scopeId: string, container: HTMLElement) => void;
  unregisterScope: (scopeId: string) => void;
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
// Scope resolution
// ---------------------------------------------------------------------------

/**
 * Resolves which single scope (if any) is active for the current keydown.
 *
 * Rule: if `document.activeElement` sits inside a registered scope
 * container, that scope is the active one. Otherwise (focus is outside every
 * registered scope, e.g. on `<body>` or an unscoped element) the most
 * recently mounted scope -- the last entry of `scopeStack` -- is active.
 * Exactly one scope (or none) is ever active, so two scopes can never both
 * claim the same keydown.
 */
function resolveActiveScopeId(
  scopeContainers: Map<string, HTMLElement>,
  scopeStack: string[]
): string | null {
  const active = document.activeElement;
  if (active) {
    for (const [scopeId, container] of scopeContainers) {
      if (container.contains(active)) {
        return scopeId;
      }
    }
  }
  return scopeStack.length > 0 ? scopeStack[scopeStack.length - 1] : null;
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
  // Registry is a ref-held Map for O(1) lookup/delete and to avoid
  // re-rendering the Provider on every register/unregister.
  const registryRef = useRef<Map<string, ShortcutRegistryEntry>>(new Map());
  // Sequence buffer accumulates recent keystrokes for multi-key sequence
  // matching (e.g. pressing 'g' then 'i' within SEQUENCE_TIMEOUT).
  const sequenceBufferRef = useRef<string[]>([]);
  const sequenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Scope containers keyed by scope id, and a mount-order stack (last =
  // most recently mounted = "topmost") -- see resolveActiveScopeId.
  const scopeContainersRef = useRef<Map<string, HTMLElement>>(new Map());
  const scopeStackRef = useRef<string[]>([]);

  const register = useCallback((entry: ShortcutRegistryEntry) => {
    const existing = registryRef.current.get(entry.id);
    if (!existing) {
      // Dev-only conflict warning: helps catch accidental duplicate bindings
      // before they reach production. Two DIFFERENT, defined scopes reusing
      // the same key is not a real conflict -- they can never both be active
      // at once (resolveActiveScopeId picks at most one) -- so only warn
      // when at least one side is global, or both share the same scope.
      for (const [existingId, existingEntry] of registryRef.current.entries()) {
        const sameKey = existingEntry.parsed.definition.key === entry.parsed.definition.key;
        const existingScope = existingEntry.parsed.definition.scope;
        const newScope = entry.parsed.definition.scope;
        const distinctScopes = existingScope !== undefined && newScope !== undefined && existingScope !== newScope;

        if (sameKey && !distinctScopes) {
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

  const registerScope = useCallback((scopeId: string, container: HTMLElement) => {
    scopeContainersRef.current.set(scopeId, container);
    // Re-registering (e.g. React StrictMode double-invoke, or a remount)
    // moves the scope to the top of the mount-order stack rather than
    // duplicating it.
    scopeStackRef.current = scopeStackRef.current.filter((id) => id !== scopeId);
    scopeStackRef.current.push(scopeId);
  }, []);

  const unregisterScope = useCallback((scopeId: string) => {
    scopeContainersRef.current.delete(scopeId);
    scopeStackRef.current = scopeStackRef.current.filter((id) => id !== scopeId);
  }, []);

  const getAll = useCallback((): ShortcutDefinition[] => {
    const definitions: ShortcutDefinition[] = [];
    for (const entry of registryRef.current.values()) {
      definitions.push(entry.parsed.definition);
    }
    return definitions;
  }, []);

  // Global keydown handler -- uses capture phase (third arg = true) so it
  // runs BEFORE any bubble-phase handlers in child components, giving
  // global shortcuts first dibs on the event.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // Suppress shortcuts when typing in form fields / contentEditable.
      if (isEditableElement(event.target)) return;

      // Ignore modifier-only keypresses (e.g. pressing Ctrl alone).
      if (['Control', 'Alt', 'Shift', 'Meta'].includes(event.key)) return;

      const eventKey = normalizeKey(event.key);

      // Resolved once per keydown: at most one scope is ever "active" (see
      // resolveActiveScopeId), so a scoped entry either matches it exactly
      // or is skipped -- it can never fire "a little bit".
      const activeScopeId = resolveActiveScopeId(scopeContainersRef.current, scopeStackRef.current);
      const isEligible = (def: ShortcutDefinition) => !def.when || def.when();

      // --- Pass 1: combo shortcuts (modifier + key) ---
      // Combos are checked first because they are unambiguous: the modifier
      // state tells us immediately whether it matches. Among matches, a
      // shortcut scoped to the active scope wins over a global (scope-less)
      // shortcut bound to the same key, so a surface can safely reuse a key
      // a global command also uses without the global one shadowing it.
      const comboMatches: ParsedShortcut[] = [];
      for (const entry of registryRef.current.values()) {
        const { parsed } = entry;
        if (parsed.isSequence) continue;
        if (matchesCombo(event, parsed)) comboMatches.push(parsed);
      }

      const scopedCombo = activeScopeId
        ? comboMatches.find((p) => p.definition.scope === activeScopeId && isEligible(p.definition))
        : undefined;
      const globalCombo = comboMatches.find((p) => !p.definition.scope && isEligible(p.definition));
      const winningCombo = scopedCombo ?? globalCombo;

      if (winningCombo) {
        event.preventDefault();
        event.stopPropagation();
        winningCombo.definition.handler();
        // A combo match invalidates any in-progress sequence.
        sequenceBufferRef.current = [];
        if (sequenceTimerRef.current) {
          clearTimeout(sequenceTimerRef.current);
          sequenceTimerRef.current = null;
        }
        return;
      }

      // --- Pass 2: key sequences (e.g. g then i) ---
      // Sequences only apply when no modifier keys are held, because
      // modifier combos are already handled above.
      if (event.ctrlKey || event.altKey || event.metaKey) {
        sequenceBufferRef.current = [];
        return;
      }

      // Append the current key to the rolling buffer.
      sequenceBufferRef.current.push(eventKey);

      if (sequenceTimerRef.current) {
        clearTimeout(sequenceTimerRef.current);
      }

      // Check if the tail of the buffer matches any registered sequence.
      // Same scoped-wins-over-global priority as combos, above.
      const sequenceMatches: ParsedShortcut[] = [];
      for (const entry of registryRef.current.values()) {
        const { parsed }: ShortcutRegistryEntry = entry;
        if (!parsed.isSequence) continue;

        const { sequence } = parsed;
        const buffer = sequenceBufferRef.current;

        if (buffer.length >= sequence.length) {
          const tail = buffer.slice(buffer.length - sequence.length);
          if (tail.every((k, i) => k === sequence[i])) {
            sequenceMatches.push(parsed);
          }
        }
      }

      const scopedSequence = activeScopeId
        ? sequenceMatches.find((p) => p.definition.scope === activeScopeId && isEligible(p.definition))
        : undefined;
      const globalSequence = sequenceMatches.find((p) => !p.definition.scope && isEligible(p.definition));
      const winningSequence = scopedSequence ?? globalSequence;

      if (winningSequence) {
        event.preventDefault();
        winningSequence.definition.handler();
        sequenceBufferRef.current = [];
        if (sequenceTimerRef.current) {
          clearTimeout(sequenceTimerRef.current);
          sequenceTimerRef.current = null;
        }
        return;
      }

      // Reset the buffer after SEQUENCE_TIMEOUT if no further keys are pressed.
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
    () => ({ register, unregister, getAll, registerScope, unregisterScope }),
    [register, unregister, getAll, registerScope, unregisterScope]
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

  // Generate a stable ID on first render. The ID never changes across
  // re-renders so the registry can track this shortcut's lifecycle.
  if (!idRef.current) {
    shortcutIdCounter++;
    idRef.current = `shortcut-${shortcutIdCounter}`;
  }

  // Ref holds the latest shortcut definition so the registered handler
  // and when() always call the current version without requiring
  // re-registration on every render.
  const shortcutRef = useRef(shortcut);
  shortcutRef.current = shortcut;

  useEffect(() => {
    const id = idRef.current;
    // Wrap handler/when in closures that read from the ref, so the
    // registered definition is always up-to-date even though the effect
    // only re-runs on structural changes (key, description, category).
    const wrappedDefinition: ShortcutDefinition = {
      key: shortcutRef.current.key,
      description: shortcutRef.current.description,
      category: shortcutRef.current.category,
      scope: shortcutRef.current.scope,
      handler: () => shortcutRef.current.handler(),
      when: shortcutRef.current.when ? () => shortcutRef.current.when!() : undefined,
    };

    const parsed = parseShortcut(wrappedDefinition);
    ctx.register({ id, parsed });

    return () => {
      ctx.unregister(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx, shortcut.key, shortcut.description, shortcut.category, shortcut.scope]);
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

  // Ref holds the latest shortcuts array so registered handlers always
  // call the current version (same pattern as useGlobalShortcut).
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  useEffect(() => {
    // Lazily grow the ID array. IDs are never removed because the effect
    // cleanup unregisters by ID, and re-running the effect re-registers
    // with the same stable IDs for the same positions.
    while (idsRef.current.length < shortcutsRef.current.length) {
      shortcutIdCounter++;
      idsRef.current.push(`shortcut-${shortcutIdCounter}`);
    }

    const ids = idsRef.current;

    // Register all shortcuts. Each handler/when closure reads from the
    // ref at invocation time, not registration time.
    shortcutsRef.current.forEach((shortcut, index) => {
      const id = arrayValueAt(ids, index);
      if (!id) return;
      const wrappedDefinition: ShortcutDefinition = {
        key: shortcut.key,
        description: shortcut.description,
        category: shortcut.category,
        scope: shortcut.scope,
        handler: () => arrayValueAt(shortcutsRef.current, index)?.handler(),
        when: shortcut.when ? () => arrayValueAt(shortcutsRef.current, index)?.when?.() ?? false : undefined,
      };

      const parsed = parseShortcut(wrappedDefinition);
      ctx.register({ id, parsed });
    });

    return () => {
      ids.forEach((id) => ctx.unregister(id));
    };
    // Serialized fingerprint dep: same technique as useRegisterCommands
    // to re-register only when the set of bindings structurally changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    ctx,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    shortcuts.map((s) => `${s.key}::${s.description}::${s.category ?? ''}::${s.scope ?? ''}`).join('|'),
  ]);
}

/**
 * Get all currently registered shortcuts.
 * Used by the ShortcutsOverlay to display all available shortcuts.
 *
 * Unlike the registration hooks (`useGlobalShortcut(s)`, `useShortcutScope`),
 * this is read-only and deliberately does NOT throw without a
 * `<ShortcutProvider>` ancestor -- it returns `[]` instead. A registration
 * hook silently no-op-ing would hide a real bug (a shortcut the developer
 * expects to work), but a display hook reporting "nothing registered" when
 * there is in fact no registry is simply correct, and lets read-only
 * consumers (e.g. a shortcuts cheatsheet mounted by a component that cannot
 * guarantee a ShortcutProvider ancestor) render safely either way.
 *
 * @returns Array of all registered shortcut definitions, or `[]` if no
 *   `<ShortcutProvider>` is mounted.
 *
 * @example
 * ```tsx
 * const shortcuts = useRegisteredShortcuts();
 * const grouped = groupBy(shortcuts, s => s.category);
 * ```
 */
export function useRegisteredShortcuts(): ShortcutDefinition[] {
  const ctx = useContext(ShortcutContext);
  if (!ctx) return [];
  return ctx.getAll();
}

/**
 * Reports whether a `<ShortcutProvider>` ancestor is mounted, without
 * throwing either way. Exists so an OPT-IN consumer of shortcuts (e.g. a
 * pattern with a `collectionShortcuts` boolean prop) can decide, before
 * calling any registration hook, whether to render the small child
 * component that performs the (provider-requiring, throwing-if-absent)
 * registration at all -- letting the feature degrade to "inert" instead of
 * crashing an app that has not adopted `ShortcutProvider` yet.
 *
 * @example
 * ```tsx
 * function OptionalShortcuts({ enabled }: { enabled: boolean }) {
 *   const hasProvider = useHasShortcutProvider();
 *   if (!enabled || !hasProvider) return null;
 *   return <RegistersActualShortcuts />; // free to call useGlobalShortcut unconditionally in here
 * }
 * ```
 */
export function useHasShortcutProvider(): boolean {
  return useContext(ShortcutContext) !== null;
}

// ---------------------------------------------------------------------------
// Scopes: ShortcutScope / useShortcutScope
// ---------------------------------------------------------------------------

/**
 * Registers the DOM element it is attached to as the container for a
 * keyboard-shortcut scope. Shortcuts registered with a matching `scope` id
 * (via `useGlobalShortcut({ ..., scope })`) fire only while this scope is
 * active -- see `ShortcutDefinition.scope` for the exact activation rule.
 *
 * Attach the returned ref to an EXISTING container element (no wrapper DOM
 * node is introduced). Throws without a `<ShortcutProvider>` ancestor, same
 * as the other registration hooks -- a scope silently failing to register
 * would make its shortcuts silently fire globally-by-topmost instead, which
 * is a correctness bug worth failing fast on.
 *
 * Returns a CALLBACK ref, not a `RefObject`, on purpose: registration must
 * happen exactly when the DOM node attaches or detaches, which a `useEffect`
 * keyed on `[ctx, scopeId]` cannot detect on its own -- if the OWNING
 * component conditionally renders the container without those deps
 * changing (e.g. a collapsible panel toggling visibility), a `RefObject`'s
 * `.current` changes silently and no effect re-runs to notice it. A
 * callback ref fires on every attach/detach regardless.
 *
 * @param scopeId - Unique id for this scope. Must be stable across renders.
 *
 * @example
 * ```tsx
 * function TaskList() {
 *   const scopeRef = useShortcutScope<HTMLDivElement>('task-list');
 *   useGlobalShortcut({ key: 'j', handler: selectNext, description: 'Next task', scope: 'task-list' });
 *   return <div ref={scopeRef}>...</div>;
 * }
 * ```
 */
export function useShortcutScope<T extends HTMLElement = HTMLElement>(scopeId: string): (node: T | null) => void {
  const ctx = useShortcutContext();
  const isRegisteredRef = useRef(false);

  return useCallback(
    (node: T | null) => {
      if (node) {
        ctx.registerScope(scopeId, node);
        isRegisteredRef.current = true;
      } else if (isRegisteredRef.current) {
        ctx.unregisterScope(scopeId);
        isRegisteredRef.current = false;
      }
    },
    [ctx, scopeId]
  );
}

export interface ShortcutScopeProps {
  /** Unique id for this scope, referenced by `ShortcutDefinition.scope`. Must be stable across renders. */
  id: string;
  children: ReactNode;
}

/**
 * Convenience wrapper around `useShortcutScope` for surfaces that do not
 * already have a container ref to attach it to. Renders `display: contents`
 * so the wrapper never affects layout -- it exists purely to mark a DOM
 * region as a shortcut scope.
 *
 * Prefer `useShortcutScope` directly when the surface already has its own
 * root ref, to avoid the extra DOM node entirely.
 *
 * @example
 * ```tsx
 * <ShortcutScope id="task-list">
 *   <TaskListContent />
 * </ShortcutScope>
 * ```
 */
export function ShortcutScope({ id, children }: ShortcutScopeProps) {
  const ref = useShortcutScope<HTMLDivElement>(id);
  return createElement(
    'div',
    { ref, style: { display: 'contents' }, 'data-ds-shortcut-scope': id },
    children
  );
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
