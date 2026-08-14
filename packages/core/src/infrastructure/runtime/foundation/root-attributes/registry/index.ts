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
   * left as the raw string a caller passed in. See `canonicalizeAfterLive` in
   * `claimChannel`. `update` moves it in place.
   */
  value: string;
}

interface ChannelState {
  baseline: Baseline;
  stack: ClaimRecord[];
}

/**
 * A channel is one writable surface on one element: an attribute name, an
 * inline style property, or a class name. Prefixes keep the three namespaces
 * from colliding (a class named `dir` and the `dir` attribute are different
 * channels).
 */
export type ChannelKey = string;

const registry = new WeakMap<object, Map<ChannelKey, ChannelState>>();

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
   *
   * The motivating case is `claimRootStyleProperty`: in CSSOM an empty
   * declaration is not a value, it is `removeProperty()`. A claim of `''`
   * would therefore DELETE the baseline it was supposed to be able to hand
   * back. A removal is not something a claim can own, so the channel refuses
   * it rather than performing it.
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

export function claimChannel(
  element: object,
  key: ChannelKey,
  value: string,
  adapter: ChannelAdapter,
): ChannelClaim {
  /**
   * Makes `next` the live value of this channel and re-syncs `target.value`
   * from what the channel ACTUALLY holds afterwards. Returns whether the value
   * went live.
   *
   * WHY RE-SYNC. The browser is free to canonicalize a declaration on write --
   * trim whitespace, reserialize a custom property, normalize a shorthand --
   * so the RAW string a caller handed to `claimChannel`/`update` is not
   * necessarily the string a later `adapter.read()` returns. Every comparison
   * below (`update`'s redundant-write guard, `release`'s "did an external
   * writer take over" check, and its hand-back to the claim underneath) diffs
   * a FRESH `adapter.read()` against a STORED value. If that stored value is
   * the pre-write raw string instead of the canonical one, the comparison is
   * live-canonical-vs-raw and can go wrong in both directions: a spurious
   * mismatch forces a redundant write (each one wakes every MutationObserver
   * on the root), or -- worse -- `release` reads the mismatch as external
   * interference and abandons the hand-back entirely, leaking the outgoing
   * value forever instead of restoring the claim below.
   *
   * WHY A FAILED WRITE IS UNDONE RATHER THAN RECORDED. If the read-back comes
   * back ABSENT the write did not take, and the channel may now be WORSE than
   * it was: in CSSOM `setProperty(prop, '')` IS `removeProperty(prop)`, so an
   * empty declaration deletes whatever was there. The earlier implementation
   * returned at this point and left `target.value` as the string it had failed
   * to write, which made `release` diff ABSENT against that string, classify
   * it as external interference, and skip the baseline restore -- destroying
   * the SSR stamp this module exists to protect. So a failed write is rolled
   * back to the value observed immediately before it, and reported, never
   * recorded as live. `claimRootStyleProperty` also refuses the empty
   * declaration up front, which makes this path defence in depth for values
   * the ENGINE rejects: an invalid value for a standard property is a silent
   * CSSOM no-op.
   */
  const goLive = (target: ClaimRecord, next: string): boolean => {
    // Writing a value the channel already carries -- the ordinary shape of
    // hydration over an SSR stamp -- must not mutate the DOM. A redundant
    // write is observable: it wakes every MutationObserver watching the root
    // and re-runs whatever they recompute.
    const before = adapter.read();
    if (before !== next) adapter.write(next);

    const live = adapter.read();
    if (live === ABSENT) {
      if (before !== ABSENT) adapter.restore(before);
      return false;
    }

    target.value = live;
    return true;
  };

  // Refuse an unclaimable value BEFORE the registry or the DOM is touched, so
  // a rejected claim cannot leave a half-built stack entry or a mutated
  // channel behind.
  const rejection = adapter.validate?.(value);
  if (rejection) throw new Error(rejection);

  let channels = registry.get(element);
  if (!channels) {
    channels = new Map();
    registry.set(element, channels);
  }

  let state = channels.get(key);
  if (!state) {
    // First claim on this channel: whatever is there now is the baseline, and
    // that is precisely the SSR stamp we must be able to hand back. This read
    // happens before the write just below, so it can never be canonicalized
    // output from THIS claim.
    state = { baseline: adapter.read(), stack: [] };
    channels.set(key, state);
  }

  const record: ClaimRecord = { token: {}, value };
  state.stack.push(record);

  // A claim whose value never went live owns nothing, so it must not stay on
  // the stack: leaving it there would make a later release hand the channel
  // down to a value the channel never held. It is popped again and the caller
  // gets an inert handle, so `release` on it is a no-op rather than a second
  // chance to disturb a channel it does not own.
  if (!goLive(record, value)) {
    const index = state.stack.indexOf(record);
    if (index !== -1) state.stack.splice(index, 1);
    if (state.stack.length === 0) {
      channels.delete(key);
      if (channels.size === 0) registry.delete(element);
    }
    return { release: () => {}, update: () => {} };
  }

  let released = false;

  interface Located {
    channels: Map<ChannelKey, ChannelState>;
    state: ChannelState;
    index: number;
  }

  /** Locates this claim in the live stack, or null once it is gone. */
  const locate = (): Located | null => {
    const currentChannels = registry.get(element);
    const current = currentChannels?.get(key);
    if (!currentChannels || !current) return null;
    const index = current.stack.findIndex((entry) => entry.token === record.token);
    return index === -1 ? null : { channels: currentChannels, state: current, index };
  };

  return {
    update: (next) => {
      if (released) return;
      // Same fail-closed boundary as the initial claim: an unclaimable value
      // is refused before it can reach the DOM.
      const rejected = adapter.validate?.(next);
      if (rejected) throw new Error(rejected);

      const found = locate();
      if (!found) return;

      const previous = record.value;
      record.value = next;

      // Only the top claim owns the live value; a covered claim just records
      // what it will re-apply if the claim above it is released.
      if (found.index !== found.state.stack.length - 1) return;
      // A write the engine refused leaves the channel on `previous`. Recording
      // `next` regardless would make `release` diff live-against-stored, read
      // the difference as external interference, and skip the hand-back.
      if (!goLive(record, next)) record.value = previous;
    },
    release: () => {
      if (released) return;
      released = true;

      const found = locate();
      if (!found) return;

      const wasTop = found.index === found.state.stack.length - 1;
      found.state.stack.splice(found.index, 1);

      const drain = () => {
        if (found.state.stack.length > 0) return;
        found.channels.delete(key);
        if (found.channels.size === 0) registry.delete(element);
      };

      // Releasing a claim that something else has since covered must not touch
      // the DOM. Only the top claim owns the live value.
      if (!wasTop) return;

      // An external writer (an app effect, a devtool) may have taken over. If the
      // live value is not what this claim wrote, we are no longer the owner and
      // must leave it alone. `record.value` is kept canonical (see
      // `canonicalizeAfterLive` above) every time this claim was top, so a
      // mismatch here is genuine external interference, not stale
      // whitespace/priority formatting left over from the claim-time raw string.
      if (adapter.read() !== record.value) {
        drain();
        return;
      }

      // Handing down and handing back share the claim-time guard: a value that
      // is already live is not rewritten. `goLive` also re-syncs the incoming
      // claim's stored value the same way the initial claim and `update` do,
      // so if IT is later released (or handed down further), its comparisons
      // are canonical-against-live rather than against whatever raw string it
      // happened to be created or last updated with.
      const next = found.state.stack[found.state.stack.length - 1];
      if (next && goLive(next, next.value)) return;

      // Either nothing is left underneath, or handing down did not take. Both
      // resolve to the baseline: the one value this channel is always entitled
      // to fall back to, rather than leaving the outgoing claim's value live.
      if (adapter.read() !== found.state.baseline) adapter.restore(found.state.baseline);
      drain();
    },
  };
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
  return claimChannel(element, `attr:${name}`, value, attributeAdapter(element, name)).release;
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
 */
export function claimRootAttributeSet(
  element: Element,
  namespace: string,
  initial: Readonly<Record<string, string>> = {},
): RootAttributeSetClaim {
  if (!namespace) throw new Error('claimRootAttributeSet requires a non-empty attribute namespace');

  const held = new Map<string, ChannelClaim>();
  let released = false;

  const reconcile = (next: Readonly<Record<string, string>>): void => {
    if (released) return;

    for (const name of Object.keys(next)) {
      if (name.startsWith(namespace)) continue;
      throw new Error(
        `claimRootAttributeSet(${namespace}) cannot write "${name}": it is outside the claimed namespace`,
      );
    }

    // Keys that disappeared go back to their own baseline first, so a
    // reconciliation never leaves a key the owner no longer declares.
    for (const [name, claim] of [...held]) {
      if (name in next) continue;
      claim.release();
      held.delete(name);
    }

    for (const [name, value] of Object.entries(next)) {
      const existing = held.get(name);
      if (existing) {
        existing.update(value);
        continue;
      }
      held.set(name, claimChannel(element, `attr:${name}`, value, attributeAdapter(element, name)));
    }
  };

  reconcile(initial);

  return {
    reconcile,
    release: () => {
      if (released) return;
      released = true;
      // Reverse order mirrors composeRootAttributeReleases: the last claim
      // taken is the first handed back.
      for (const claim of [...held.values()].reverse()) claim.release();
      held.clear();
    },
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
