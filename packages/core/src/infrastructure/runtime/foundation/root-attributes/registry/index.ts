/**
 * @fileoverview The claim registry: ownership stacks and attribute channels.
 *
 * Why ownership is tracked by IDENTITY rather than by value is the family's
 * rationale and lives on the facade at `../index.ts`. This leaf holds the one
 * `WeakMap`, the one `claimChannel`, and the attribute-shaped claims built on
 * it. `../presentation` builds style and class channels on the same stack.
 *
 * @module Runtime/Foundation/RootAttributes/Registry
 * @package @rottay/design-system
 */

/** Releases a claim. Safe to call at any time, any number of times. */
export type ReleaseRootAttribute = () => void;

/**
 * A value that was absent before the first claim. Distinguishing "absent" from
 * "present but empty" matters: `data-ds-root=""` is a real, meaningful
 * attribute, so restoring it as absent would break the artifact selector.
 */
export const ABSENT = Symbol('absent');
export type Baseline = string | typeof ABSENT;

interface ClaimRecord {
  /** Opaque identity. Two claims of the same value are still distinct. */
  readonly token: object;
  /**
   * The latest value this claim owns, kept CANONICAL: every time this claim's
   * value goes live (initial claim, `update`, or a release handing the
   * channel down to it), it is re-synced from `adapter.read()` rather than
   * left as the raw string a caller passed in. `update` moves it in place.
   */
  value: string;
}

interface ChannelState {
  baseline: Baseline;
  stack: ClaimRecord[];
  /** Snapshot that a failed transition could not roll back to; repair first. */
  recovery?: Baseline;
}

/**
 * A channel is one writable surface on one element: an attribute name, an
 * inline style property, or a class name. Prefixes keep the three namespaces
 * from colliding (a class named `dir` and the `dir` attribute are different
 * channels).
 */
export type ChannelKey = string;

const registry = new WeakMap<object, Map<ChannelKey, ChannelState>>();

const HTML_NS = 'http://www.w3.org/1999/xhtml';

/**
 * Returns the canonical attribute name for the given element's namespace.
 *
 * In the HTML namespace in an HTML document the attribute name is
 * ASCII-case-insensitive: `DATA-THEME` and `data-theme` address the same node,
 * and the DOM canonicalizes to lowercase. In all other namespaces (SVG,
 * MathML, null, XML) names are case-sensitive and must be preserved exactly as
 * written.
 *
 * `ownerDocument.createAttribute` supplies the canonical spelling; a one-off
 * `setAttribute` on a throwaway node of the same namespace validates the name
 * without touching the live element, because some engines do not reject invalid
 * names at `createAttribute` time.
 */
function canonicalAttributeName(element: Element, name: string): string {
  const attr = element.ownerDocument.createAttribute(name);
  const isHTMLDocument = element.ownerDocument.contentType === 'text/html';
  const ns = isHTMLDocument && element.namespaceURI === HTML_NS ? HTML_NS : element.namespaceURI;
  const dummy = element.ownerDocument.createElementNS(ns, 'div');
  dummy.setAttribute(name, '');
  return dummy.attributes[0]?.name ?? attr.name;
}

function makeAggregateError(errors: unknown[], message: string): Error {
  const ctor = (globalThis as Record<string, unknown>).AggregateError as
    | (new (errors: Iterable<unknown>, message?: string) => Error)
    | undefined;
  if (typeof ctor === 'function') return new ctor(errors, message);
  const err = new Error(message);
  (err as Error & { cause: unknown }).cause = errors;
  return err;
}

export interface ChannelAdapter {
  /** Current live value, or ABSENT. */
  read(): Baseline;
  /** Write a claimed value. */
  write(value: string): void;
  /** Restore the baseline captured before any claim. */
  restore(baseline: Baseline): void;
  /**
   * Refuses a value that cannot BE a claim on this channel, evaluated before
   * anything is mutated. Returns the rejection message, or null when the value
   * is claimable.
   */
  validate?(value: string): string | null;
}

/**
 * One live claim. `update` moves the claimed value without leaving the stack,
 * so a claimant that changes its mind neither loses its position to a claim
 * taken after it nor flashes the baseline between the two values.
 */
export interface ChannelClaim {
  readonly release: ReleaseRootAttribute;
  readonly update: (value: string) => void;
}

interface InternalClaim {
  readonly element: object;
  readonly key: ChannelKey;
  readonly adapter: ChannelAdapter;
  readonly record: ClaimRecord;
  released: boolean;
  update: (value: string) => void;
  release: ReleaseRootAttribute;
}

interface TransitionSuccess {
  ok: true;
  live: string;
}

interface TransitionFailure {
  ok: false;
  error: Error | null;
  /** Live snapshot the rollback could not restore to. */
  recovery?: Baseline;
}

interface RollbackFailure {
  error: Error;
  recovery: Baseline;
}

/**
 * Performs a verified rollback to `snapshot`: restore, then read back and
 * require exact identity `live === snapshot` (including ABSENT). Returns the
 * primary error when rollback succeeds, or an ordered AggregateError
 * [primary, rollbackFailure] plus the snapshot as recovery when it does not.
 */
function verifiedRollback(
  adapter: ChannelAdapter,
  snapshot: Baseline,
  primaryError: Error,
  message: string,
): { error: Error; recovery?: Baseline } {
  let rollbackError: Error;
  try {
    adapter.restore(snapshot);
    const live = adapter.read();
    if (live === snapshot) {
      return { error: primaryError };
    }
    const snapshotLabel = snapshot === ABSENT ? 'ABSENT' : String(snapshot);
    const liveLabel = live === ABSENT ? 'ABSENT' : String(live);
    rollbackError = new Error(
      `rollback verify failed: expected ${snapshotLabel}, got ${liveLabel}`,
    );
  } catch (err) {
    rollbackError = err as Error;
  }
  const aggregate = makeAggregateError([primaryError, rollbackError], message);
  return { error: aggregate, recovery: snapshot };
}

/**
 * Atomically transitions a channel to `next` and returns the canonical live
 * value. The snapshot `before` that this helper reads is restored and verified
 * on every failure, so the channel is never left in a half-written state and a
 * failed overlay never falls back to an older historical baseline. A rollback
 * that throws or silently fails carries an ordered AggregateError and
 * `recovery` set to `before`, so the caller can leave a tombstone instead of
 * silently dropping the live owner.
 */
function transition(
  adapter: ChannelAdapter,
  next: string,
): TransitionSuccess | TransitionFailure {
  let before: Baseline;
  try {
    before = adapter.read();
  } catch (readError) {
    return { ok: false, error: readError as Error };
  }

  if (before === next) {
    let live: Baseline;
    try {
      live = adapter.read();
    } catch (postReadError) {
      const rollback = verifiedRollback(
        adapter,
        before,
        postReadError as Error,
        'claim post-read failed on no-op transition and rollback failed',
      );
      return { ok: false, error: rollback.error, recovery: rollback.recovery };
    }
    if (live === before) {
      return { ok: true, live };
    }
    const drift = new Error('channel drifted on no-op transition');
    const rollback = verifiedRollback(
      adapter,
      before,
      drift,
      'claim no-op transition drifted and rollback failed',
    );
    return { ok: false, error: rollback.error, recovery: rollback.recovery };
  }

  try {
    adapter.write(next);
  } catch (writeError) {
    const rollback = verifiedRollback(
      adapter,
      before,
      writeError as Error,
      'claim write failed and rollback failed',
    );
    return { ok: false, error: rollback.error, recovery: rollback.recovery };
  }

  let live: Baseline;
  try {
    live = adapter.read();
  } catch (postReadError) {
    const rollback = verifiedRollback(
      adapter,
      before,
      postReadError as Error,
      'claim post-write read failed and rollback failed',
    );
    return { ok: false, error: rollback.error, recovery: rollback.recovery };
  }

  if (live === next) {
    return { ok: true, live };
  }

  const didNotTake = new Error('channel read did not match claimed value after write');
  const rollback = verifiedRollback(
    adapter,
    before,
    didNotTake,
    'claim write did not take and rollback failed',
  );
  return { ok: false, error: rollback.error, recovery: rollback.recovery };
}

/** Restores a channel from a recovery tombstone before it is used again. */
function repairRecovery(adapter: ChannelAdapter, state: ChannelState): void {
  const recovery = state.recovery;
  if (recovery === undefined) return;

  try {
    adapter.restore(recovery);
  } catch (restoreError) {
    throw makeAggregateError([restoreError], 'recovery restore failed');
  }

  try {
    const live = adapter.read();
    if (live !== recovery) {
      const recoveryLabel = recovery === ABSENT ? 'ABSENT' : String(recovery);
      const liveLabel = live === ABSENT ? 'ABSENT' : String(live);
      throw new Error(
        `recovery restore did not take: expected ${recoveryLabel}, got ${liveLabel}`,
      );
    }
  } catch (readError) {
    throw makeAggregateError([readError], 'recovery verify failed');
  }

  state.recovery = undefined;
}

function claimChannelInternal(
  element: object,
  key: ChannelKey,
  value: string,
  adapter: ChannelAdapter,
): InternalClaim {
  const rejection = adapter.validate?.(value);
  if (rejection) throw new Error(rejection);

  const existingChannels = registry.get(element);
  const existingState = existingChannels?.get(key);
  let baseline: Baseline;
  try {
    baseline = existingState ? existingState.baseline : adapter.read();
  } catch (error) {
    throw error;
  }

  let channels = existingChannels;
  if (!channels) {
    channels = new Map();
    registry.set(element, channels);
  }

  let state = existingState;
  if (!state) {
    state = { baseline, stack: [] };
    channels.set(key, state);
  }

  repairRecovery(adapter, state);

  const record: ClaimRecord = { token: {}, value };
  state.stack.push(record);

  const result = transition(adapter, value);
  if (!result.ok) {
    const index = state.stack.indexOf(record);
    if (index !== -1) state.stack.splice(index, 1);
    if (state.stack.length === 0) {
      if (result.recovery !== undefined) {
        state.recovery = result.recovery;
      } else {
        channels.delete(key);
        if (channels.size === 0) registry.delete(element);
      }
    } else if (result.recovery !== undefined) {
      state.recovery = result.recovery;
    }
    throw result.error ?? new Error('claim transition failed');
  }
  record.value = result.live;

  interface Located {
    channels: Map<ChannelKey, ChannelState>;
    state: ChannelState;
    index: number;
  }

  const locate = (): Located | null => {
    const currentChannels = registry.get(element);
    const current = currentChannels?.get(key);
    if (!currentChannels || !current) return null;
    const index = current.stack.findIndex((entry) => entry.token === record.token);
    return index === -1 ? null : { channels: currentChannels, state: current, index };
  };

  const drain = (located: Located): void => {
    if (located.state.stack.length > 0) return;
    located.channels.delete(key);
    if (located.channels.size === 0) registry.delete(element);
  };

  const handle: InternalClaim = {
    element,
    key,
    adapter,
    record,
    released: false,
    update: () => {},
    release: () => {},
  };

  handle.update = (next) => {
    if (handle.released) return;
    const rejected = adapter.validate?.(next);
    if (rejected) throw new Error(rejected);

    const found = locate();
    if (!found) return;

    if (found.index !== found.state.stack.length - 1) {
      record.value = next;
      return;
    }

    repairRecovery(adapter, found.state);

    const updated = transition(adapter, next);
    if (!updated.ok) {
      if (updated.recovery !== undefined) {
        found.state.recovery = updated.recovery;
      }
      throw updated.error ?? new Error('update transition failed');
    }
    record.value = updated.live;
  };

  handle.release = () => {
    const found = locate();
    if (!found) {
      handle.released = true;
      return;
    }

    const wasTop = found.index === found.state.stack.length - 1;

    if (!wasTop) {
      found.state.stack.splice(found.index, 1);
      drain(found);
      handle.released = true;
      return;
    }

    repairRecovery(adapter, found.state);

    const outgoingValue = record.value;

    let current: Baseline;
    try {
      current = adapter.read();
    } catch (readError) {
      throw readError;
    }

    if (current !== outgoingValue) {
      found.state.stack.splice(found.index, 1);
      drain(found);
      handle.released = true;
      return;
    }

    const nextRecord = found.state.stack[found.index - 1];

    if (nextRecord) {
      const handedDown = transition(adapter, nextRecord.value);
      if (handedDown.ok) {
        nextRecord.value = handedDown.live;
        found.state.stack.splice(found.index, 1);
        drain(found);
        handle.released = true;
        return;
      }
      if (handedDown.recovery !== undefined) {
        found.state.recovery = handedDown.recovery;
      }
      throw handedDown.error ?? new Error('release hand-down failed');
    }

    try {
      adapter.restore(found.state.baseline);
    } catch (restoreError) {
      const rollback = verifiedRollback(
        adapter,
        outgoingValue,
        restoreError as Error,
        'baseline restore failed and rollback failed',
      );
      if (rollback.recovery !== undefined) {
        found.state.recovery = rollback.recovery;
      }
      throw rollback.error;
    }

    let afterBaseline: Baseline;
    try {
      afterBaseline = adapter.read();
    } catch (verifyError) {
      const rollback = verifiedRollback(
        adapter,
        outgoingValue,
        verifyError as Error,
        'baseline verify failed and rollback failed',
      );
      if (rollback.recovery !== undefined) {
        found.state.recovery = rollback.recovery;
      }
      throw rollback.error;
    }

    if (afterBaseline !== found.state.baseline) {
      const didNotTake = new Error('baseline restore did not take');
      const rollback = verifiedRollback(
        adapter,
        outgoingValue,
        didNotTake,
        'baseline restore did not take and rollback failed',
      );
      if (rollback.recovery !== undefined) {
        found.state.recovery = rollback.recovery;
      }
      throw rollback.error;
    }

    found.state.stack.splice(found.index, 1);
    drain(found);
    handle.released = true;
  };

  return handle;
}

export function claimChannel(
  element: object,
  key: ChannelKey,
  value: string,
  adapter: ChannelAdapter,
): ChannelClaim {
  const handle = claimChannelInternal(element, key, value, adapter);
  return { update: handle.update, release: handle.release };
}

function attributeAdapter(element: Element, name: string): ChannelAdapter {
  return {
    read: () => (element.hasAttribute(name) ? (element.getAttribute(name) as string) : ABSENT),
    write: (next) => element.setAttribute(name, next),
    restore: (baseline) => {
      if (baseline === ABSENT) element.removeAttribute(name);
      else element.setAttribute(name, baseline);
    },
  };
}

/** Claims a root attribute. */
export function claimRootAttribute(
  element: Element,
  name: string,
  value: string,
): ReleaseRootAttribute {
  const canonicalName = canonicalAttributeName(element, name);
  return claimChannel(
    element,
    `attr:${canonicalName}`,
    value,
    attributeAdapter(element, canonicalName),
  ).release;
}

/**
 * A claim over a VARIABLE set of attributes sharing one name prefix.
 *
 * `reconcile` is the whole surface: hand it the complete map the owner wants
 * live, as often as the owner's input changes. `release` hands every key back.
 */
export interface RootAttributeSetClaim {
  /**
   * Makes `next` the live set. Keys the claim holds and `next` omits are
   * released to their own baseline; keys in both move in place; keys only in
   * `next` are claimed. Calling it again with an equal map writes nothing.
   */
  reconcile(next: Readonly<Record<string, string>>): void;
  /** Releases every key the claim still holds. */
  release: ReleaseRootAttribute;
}

interface SetJournalEntry {
  name: string;
  key: ChannelKey;
  adapter: ChannelAdapter;
  live: Baseline;
  existed: boolean;
  baseline: Baseline;
  recovery: Baseline | undefined;
  stack: { record: ClaimRecord; value: string }[];
  handle: InternalClaim | null;
}

/**
 * Claims a whole `prefix*` namespace as ONE unit.
 *
 * WHY A SET IS NOT N CLAIMS TAKEN BY HAND. Some channels are a map, not a
 * value: `data-anatomy-*` carries one attribute per chrome family the tenant
 * artifact selects, so which KEYS exist is itself data. An owner reconciling
 * that by hand has to remember the keys it stamped last time, and the only
 * place to keep that memory is another piece of DOM -- which is how a `<style>`
 * element ended up carrying an ownership token for attributes on `<html>`. When
 * a key stopped being declared, the owner deleted the attribute outright, so a
 * key the SERVER had stamped came back absent instead of coming back.
 *
 * Here each key is an ordinary claim in the same per-channel stack, so a set
 * and a single-attribute claim over the same key interoperate exactly as two
 * single claims do: identity decides, the top claim owns the live value, and a
 * release hands the key to the claim below it or to the baseline it captured.
 *
 * A key this claim never claimed is never touched. That is what lets a vertical
 * stamp a static baseline the server rendered and a tenant artifact override
 * only the families it actually declares.
 *
 * The prefix is enforced, not decorative: a set claim is an owner of one
 * namespace, and a `reconcile` that could reach `data-theme` would be a second
 * authority over a channel with a different owner.
 *
 * The whole reconcile/release is a single transaction: every requested key is
 * canonicalized and validated before any DOM write, and a failure at any point
 * rolls the DOM, the registry stacks, and the held map back to the exact
 * pre-call snapshot. A rollback that fails is aggregated with the primary error
 * and leaves recovery tombstones so a later retry repairs before acting.
 */
export function claimRootAttributeSet(
  element: Element,
  namespace: string,
  initial: Readonly<Record<string, string>> = {},
): RootAttributeSetClaim {
  if (!namespace) throw new Error('claimRootAttributeSet requires a non-empty attribute namespace');

  const canonicalNamespace = canonicalAttributeName(element, namespace);

  const held = new Map<string, InternalClaim>();
  const recovering = new Set<string>();
  let released = false;

  const channelKey = (name: string): ChannelKey => `attr:${name}`;

  const repairUnion = (names: Iterable<string>): void => {
    for (const name of names) {
      const key = channelKey(name);
      const channels = registry.get(element);
      const state = channels?.get(key);
      if (state?.recovery !== undefined) {
        const adapter = held.get(name)?.adapter ?? attributeAdapter(element, name);
        repairRecovery(adapter, state);
        recovering.delete(name);
        if (state.stack.length === 0) {
          channels?.delete(key);
          if (channels?.size === 0) registry.delete(element);
        }
      }
    }
  };

  const buildJournal = (names: Iterable<string>): SetJournalEntry[] => {
    const entries: SetJournalEntry[] = [];
    for (const name of names) {
      const key = channelKey(name);
      const adapter = attributeAdapter(element, name);
      const live = adapter.read();
      const channels = registry.get(element);
      const state = channels?.get(key);
      entries.push({
        name,
        key,
        adapter,
        live,
        existed: state !== undefined,
        baseline: state ? state.baseline : live,
        recovery: state ? state.recovery : undefined,
        stack: state ? state.stack.map((record) => ({ record, value: record.value })) : [],
        handle: held.get(name) ?? null,
      });
    }
    return entries;
  };

  const restoreSnapshot = (journal: SetJournalEntry[], primaryError: unknown): Error => {
    const rollbackErrors: Error[] = [];

    for (const entry of journal) {
      const { name, key, adapter, live, existed, baseline, recovery, stack, handle } = entry;

      let domOk = false;
      try {
        adapter.restore(live);
        const current = adapter.read();
        if (current !== live) {
          throw new Error(
            `rollback verify failed for ${name}: expected ${String(live)}, got ${String(current)}`,
          );
        }
        domOk = true;
      } catch (err) {
        rollbackErrors.push(err as Error);
      }

      let channels = registry.get(element);
      if (!channels) {
        channels = new Map();
        registry.set(element, channels);
      }

      let state = channels.get(key);
      if (!existed) {
        if (!domOk) {
          if (!state) {
            state = { baseline: live, stack: [] };
            channels.set(key, state);
          }
          state.baseline = live;
          state.stack = [];
          state.recovery = live;
        } else {
          if (state) channels.delete(key);
        }
      } else {
        if (!state) {
          state = { baseline, stack: [] };
          channels.set(key, state);
        }
        state.baseline = baseline;
        state.stack = stack.map(({ record }) => record);
        state.recovery = domOk ? recovery : live;
        for (const { record, value } of stack) record.value = value;
      }

      if (domOk) {
        recovering.delete(name);
      } else if (!handle) {
        recovering.add(name);
      }

      if (channels.size === 0) registry.delete(element);

      if (existed && handle) {
        handle.released = false;
        held.set(name, handle);
      } else {
        held.delete(name);
      }
    }

    const primary = primaryError instanceof Error ? primaryError : new Error(String(primaryError));
    if (rollbackErrors.length === 0) return primary;
    return makeAggregateError(
      [primary, ...rollbackErrors],
      'claimRootAttributeSet transition failed and rollback failed',
    );
  };

  const reconcile = (next: Readonly<Record<string, string>>): void => {
    if (released) return;

    const canonicalNext = new Map<string, string>();
    for (const [rawName, value] of Object.entries(next)) {
      const canonicalName = canonicalAttributeName(element, rawName);
      if (!canonicalName.startsWith(canonicalNamespace)) {
        throw new Error(
          `claimRootAttributeSet(${namespace}) cannot write "${rawName}" ` +
            `(canonical "${canonicalName}"): it is outside the claimed namespace`,
        );
      }
      if (canonicalNext.has(canonicalName)) {
        throw new Error(
          `claimRootAttributeSet(${namespace}) has a canonical collision: ` +
            `"${[...canonicalNext.entries()].find(([k]) => k === canonicalName)?.[1] ?? rawName}" ` +
            `and "${rawName}" both map to "${canonicalName}"`,
        );
      }
      canonicalNext.set(canonicalName, value);
    }

    const toUpdate = new Map<string, string>();
    const toRelease: string[] = [];
    for (const [name, handle] of held) {
      const nextValue = canonicalNext.get(name);
      if (nextValue === undefined) {
        toRelease.push(name);
      } else if (nextValue !== handle.record.value) {
        toUpdate.set(name, nextValue);
      }
    }

    const toClaim: string[] = [];
    for (const name of canonicalNext.keys()) {
      if (!held.has(name)) toClaim.push(name);
    }

    const union = new Set([...held.keys(), ...canonicalNext.keys(), ...recovering]);
    repairUnion(union);

    if (toClaim.length === 0 && toUpdate.size === 0 && toRelease.length === 0) return;

    const journal = buildJournal(union);

    try {
      for (const [name, value] of toUpdate) {
        held.get(name)!.update(value);
      }

      for (const name of toClaim) {
        const value = canonicalNext.get(name)!;
        const key = channelKey(name);
        const handle = claimChannelInternal(element, key, value, attributeAdapter(element, name));
        held.set(name, handle);
        recovering.delete(name);
      }

      for (const name of toRelease) {
        held.get(name)!.release();
        held.delete(name);
      }
    } catch (primary) {
      throw restoreSnapshot(journal, primary);
    }
  };

  const release = (): void => {
    if (released) return;
    if (held.size === 0 && recovering.size === 0) {
      released = true;
      return;
    }

    const union = new Set([...held.keys(), ...recovering]);
    repairUnion(union);
    const journal = buildJournal(union);

    try {
      for (const handle of [...held.values()].reverse()) {
        handle.release();
      }
      held.clear();
      recovering.clear();
      released = true;
    } catch (primary) {
      throw restoreSnapshot(journal, primary);
    }
  };

  reconcile(initial);

  return {
    reconcile,
    release,
  };
}

/** Composes several claims into one release, applied in reverse order. */
export function composeRootAttributeReleases(
  releases: readonly ReleaseRootAttribute[],
): ReleaseRootAttribute {
  return () => {
    for (let index = releases.length - 1; index >= 0; index -= 1) releases[index]();
  };
}

/** Test-only: how many claims are outstanding, to prove the registry drains. */
export function outstandingRootClaims(element: object): number {
  const channels = registry.get(element);
  if (!channels) return 0;
  let total = 0;
  for (const state of channels.values()) total += state.stack.length;
  return total;
}
