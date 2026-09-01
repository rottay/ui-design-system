'use client';

/**
 * @fileoverview Bridge hook: Command registry -> CommandPalette items.
 *
 * Converts `Command[]` from `useCommands()` into `CommandItem[]` that
 * `PatternCommandPalette` accepts as its `items` prop, and provides the
 * `onSearch` callback that drives both the registry's fuzzy search and every
 * registered async command source.
 *
 * This hook is the command-palette-owned adapter between the command registry
 * system (`infrastructure/runtime/application/commands`) and the command palette UI (`patterns/navigation/
 * command-palette`). Responsibilities:
 *
 * - Static commands: fuzzy-searched through the registry, emitted in
 *   contiguous section blocks (so the palette's visual grouping matches the
 *   keyboard order).
 * - Command sources (`useRegisterCommandSource`): searched per keystroke with
 *   per-source debounce and minimum query length; every keystroke aborts the
 *   superseded request via AbortSignal. Each source renders as its own
 *   section (source label). A failed source renders an honest error row in
 *   its section (`kind: 'error'`) -- never a silent empty.
 * - Frecency: `recordCommandUse(id)` persists usage through the existing
 *   `useLayoutPreference` state mechanism (storage key
 *   `ds-layout-<usageKey>`), and items rank by recency-decayed frecency
 *   (14-day half-life) descending within their section. Selection and
 *   argument submission record automatically.
 *
 * @example
 * ```tsx
 * function App() {
 *   const [open, setOpen] = useState(false);
 *   const { items, onSearch } = useCommandPaletteItems();
 *
 *   return (
 *     <PatternCommandPalette
 *       open={open}
 *       onOpenChange={setOpen}
 *       items={items}
 *       onSearch={onSearch}
 *     />
 *   );
 * }
 * ```
 */

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  useCommands,
  useCommandSources,
  type Command,
  type CommandSourceItem,
} from '@/infrastructure/runtime/application/commands/runtime/registry';
import { useLayoutPreference, type LayoutPreference } from '@/infrastructure/runtime/application/state';
import { rankByFrecency, recordUse, type CommandUsageMap } from '../../foundation/frecency';
import type { CommandItem } from '../../contracts';

/** Debounce applied to a source that does not declare its own `debounceMs`. */
const DEFAULT_SOURCE_DEBOUNCE_MS = 200;

/** Module-stable defaults: a fresh object per render would re-trigger the
 * layout-preference hydration effect on every render. */
const USAGE_PREFERENCE_DEFAULTS: LayoutPreference = { commandUsage: {} };

const defaultClock = (): number => Date.now();

interface SourceResultState {
  status: 'loading' | 'ready' | 'error';
  items: CommandSourceItem[];
  errorMessage?: string;
}

/**
 * Options for `useCommandPaletteItems`.
 */
export interface UseCommandPaletteItemsOptions {
  /**
   * Storage key for persisted command usage (frecency), namespaced by the
   * layout-preference mechanism as `ds-layout-<usageKey>`. Override when an
   * app hosts multiple independent palettes on one origin.
   * @default 'command-palette'
   */
  usageKey?: string;
  /**
   * Time source for frecency. Only invoked from event handlers and effects,
   * never during render, so rendering stays deterministic.
   * @default Date.now
   */
  clock?: () => number;
}

/**
 * Return type for `useCommandPaletteItems`.
 */
export interface UseCommandPaletteItemsReturn {
  /** Command items ready to pass to `PatternCommandPalette.items`. */
  items: CommandItem[];
  /** Search callback ready to pass to `PatternCommandPalette.onSearch`. */
  onSearch: (query: string) => void;
  /**
   * Record one use of a command id for frecency ranking. Selection and
   * argument submission through the emitted items already record
   * automatically; call this only for out-of-palette invocations (e.g. a
   * keyboard shortcut executing the same command).
   */
  recordCommandUse: (commandId: string) => void;
}

/** Group items into contiguous section blocks (first-seen section order),
 * ranking each block by decayed frecency when a clock reading exists. */
function rankSections(
  items: CommandItem[],
  usage: CommandUsageMap,
  now: number,
): CommandItem[] {
  const order: string[] = [];
  const buckets = new Map<string, CommandItem[]>();
  for (const item of items) {
    const group = item.group ?? '';
    let bucket = buckets.get(group);
    if (!bucket) {
      bucket = [];
      buckets.set(group, bucket);
      order.push(group);
    }
    bucket.push(item);
  }
  const out: CommandItem[] = [];
  for (const group of order) {
    const bucket = buckets.get(group) as CommandItem[];
    out.push(...(now > 0 ? rankByFrecency(bucket, (item) => item.id, usage, now) : bucket));
  }
  return out;
}

/**
 * Bridge hook that converts the command registry into CommandPalette props.
 *
 * Reads all registered commands via `useCommands()` and every async source
 * via `useCommandSources()`, merges them into sectioned `CommandItem[]`
 * (source sections appear after static sections, in registration order), and
 * exposes a search handler that drives both.
 *
 * Requires `CommandRegistryProvider` in the component tree (included in
 * `DesignSystemProvider` by default).
 */
export function useCommandPaletteItems(
  options: UseCommandPaletteItemsOptions = {},
): UseCommandPaletteItemsReturn {
  const { usageKey = 'command-palette', clock = defaultClock } = options;

  const { commands, search } = useCommands();
  const sources = useCommandSources();
  const [query, setQuery] = useState('');
  const [sourceResults, setSourceResults] = useState<Map<string, SourceResultState>>(
    () => new Map(),
  );

  const clockRef = useRef(clock);
  clockRef.current = clock;

  // Frecency persistence rides the existing layout-preference mechanism
  // (debounced localStorage writes, SSR-safe hydration) -- no palette-owned
  // storage.
  const { preference, setPreference } = useLayoutPreference({
    key: usageKey,
    defaults: USAGE_PREFERENCE_DEFAULTS,
  });

  const usage = useMemo<CommandUsageMap>(() => {
    const raw = preference.commandUsage;
    if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
      return raw as CommandUsageMap;
    }
    return {};
  }, [preference.commandUsage]);

  // Mirror of the latest usage map so rapid successive records in one render
  // cycle compound instead of overwriting each other.
  const usageRef = useRef(usage);
  useEffect(() => {
    usageRef.current = usage;
  }, [usage]);

  // Clock reading used by render-time ranking. 0 until the mount effect runs
  // (SSR renders rank-neutral); refreshed by handlers, never during render.
  const [now, setNow] = useState(0);
  useEffect(() => {
    setNow(clockRef.current());
  }, []);

  const recordCommandUse = useCallback(
    (commandId: string) => {
      const timestamp = clockRef.current();
      const next = recordUse(usageRef.current, commandId, timestamp);
      usageRef.current = next;
      setPreference({ commandUsage: next });
      setNow(timestamp);
    },
    [setPreference],
  );

  // Async source search: one debounced, abortable request per source per
  // keystroke. The effect cleanup aborts every in-flight request the moment
  // the query (or the source set) changes.
  useEffect(() => {
    const trimmed = query.trim();
    const active = sources.filter(
      (source) => trimmed.length >= Math.max(1, source.minQuery ?? 1),
    );

    // Prune sections whose source unregistered or fell below its minimum
    // query length; keep previous items visible while a replacement request
    // is in flight to avoid flicker.
    setSourceResults((prev) => {
      const next = new Map<string, SourceResultState>();
      for (const source of active) {
        const existing = prev.get(source.id);
        next.set(
          source.id,
          existing
            ? { ...existing, status: 'loading' }
            : { status: 'loading', items: [] },
        );
      }
      return next;
    });

    if (active.length === 0) return undefined;

    const cleanups: Array<() => void> = [];
    for (const source of active) {
      const controller = new AbortController();
      const timer = setTimeout(() => {
        void (async () => {
          try {
            const results = await source.search(trimmed, controller.signal);
            if (controller.signal.aborted) return;
            setSourceResults((prev) => {
              const next = new Map(prev);
              next.set(source.id, { status: 'ready', items: results });
              return next;
            });
          } catch (error) {
            if (controller.signal.aborted) return;
            const message = error instanceof Error ? error.message : String(error);
            setSourceResults((prev) => {
              const next = new Map(prev);
              next.set(source.id, { status: 'error', items: [], errorMessage: message });
              return next;
            });
          }
        })();
      }, source.debounceMs ?? DEFAULT_SOURCE_DEBOUNCE_MS);
      cleanups.push(() => {
        clearTimeout(timer);
        controller.abort();
      });
    }

    return () => {
      for (const cleanup of cleanups) cleanup();
    };
  }, [query, sources]);

  const sourceCommands = query ? search(query) : commands;

  const mapCommand = useCallback(
    (cmd: Command): CommandItem => ({
      id: cmd.id,
      label: cmd.label,
      description: cmd.description,
      icon: cmd.icon,
      shortcut: cmd.shortcut,
      group: cmd.category,
      parameter: cmd.parameter,
      onSelect: () => {
        recordCommandUse(cmd.id);
        cmd.action();
      },
      onSubmit: cmd.parameter
        ? (value: string) => {
            recordCommandUse(cmd.id);
            cmd.action(value);
          }
        : undefined,
      disabled: cmd.when ? !cmd.when() : false,
    }),
    [recordCommandUse],
  );

  const items = useMemo<CommandItem[]>(() => {
    const staticItems = rankSections(sourceCommands.map(mapCommand), usage, now);

    const sourceItems: CommandItem[] = [];
    for (const source of sources) {
      const state = sourceResults.get(source.id);
      if (!state) continue;
      if (state.status === 'error') {
        sourceItems.push({
          id: `ds-command-source-error-${source.id}`,
          label: `Couldn't search ${source.label}`,
          description: state.errorMessage,
          group: source.label,
          kind: 'error',
          disabled: true,
          onSelect: () => undefined,
        });
        continue;
      }
      const mapped = state.items.map<CommandItem>((row) => ({
        id: row.id,
        label: row.label,
        description: row.description,
        icon: row.icon,
        shortcut: row.shortcut,
        group: source.label,
        parameter: row.parameter,
        onSelect: () => {
          recordCommandUse(row.id);
          row.action();
        },
        onSubmit: row.parameter
          ? (value: string) => {
              recordCommandUse(row.id);
              row.action(value);
            }
          : undefined,
      }));
      sourceItems.push(
        ...(now > 0 ? rankByFrecency(mapped, (item) => item.id, usage, now) : mapped),
      );
    }

    return [...staticItems, ...sourceItems];
  }, [sourceCommands, mapCommand, usage, now, sources, sourceResults, recordCommandUse]);

  const onSearch = useCallback((q: string) => {
    setQuery(q);
    setNow(clockRef.current());
  }, []);

  return { items, onSearch, recordCommandUse };
}
