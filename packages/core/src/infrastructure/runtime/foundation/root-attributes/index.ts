/**
 * @fileoverview Ownership-aware root attribute claims, tracked by IDENTITY.
 *
 * WHY THIS EXISTS. Root attributes have three writers in sequence -- the server
 * render, the pre-paint script, and a client provider effect -- and the provider
 * effect used to clean up with a bare `removeAttribute`. That deletes a value it
 * never created: the server stamps `data-theme` into the HTML, the pre-paint
 * script may refine it, and then the provider's cleanup strips it entirely on
 * every dependency change, on unmount, and twice per mount under StrictMode.
 *
 * WHY IDENTITY AND NOT VALUE. The first implementation decided ownership by
 * comparing the live value against the value it had written. That is wrong
 * whenever two claims carry the SAME value, which is the common case during a
 * remount:
 *
 *     SSR = light;  A claims dark;  B claims dark;  release(A)
 *     value-based  -> live 'dark' equals A's 'dark', so A restores 'light'
 *                     while B is still mounted. The document goes light.
 *     identity     -> A is not the top of the stack, so releasing it touches
 *                     no DOM at all. The document stays dark. CORRECT.
 *
 * So each claim gets an opaque identity and joins a per-element, per-channel
 * STACK. Releasing a non-top claim removes it from the stack and nothing else;
 * releasing the top re-applies the next claim down, or restores the baseline
 * captured when the stack was first created -- which is the SSR stamp.
 *
 * The registry is a `WeakMap` keyed by element, and a channel's entry is
 * deleted as soon as its stack empties, so nothing is retained after the last
 * release.
 *
 * A channel is usually one attribute, but some are a MAP whose key set is
 * itself data (`data-anatomy-*`). `claimRootAttributeSet` claims such a
 * namespace as one unit while each key remains an ordinary claim in the same
 * stack, so set and single claimants over the same key resolve by identity like
 * any other pair.
 *
 * @module Runtime/Foundation/RootAttributes
 * @package @rottay/design-system
 */

/** Releases a claim. Safe to call at any time, any number of times. */
export type ReleaseRootAttribute = () => void;

/**
 * A value that was absent before the first claim. Distinguishing "absent" from
 * "present but empty" matters: `data-ds-root=""` is a real, meaningful
 * attribute, so restoring it as absent would break the artifact selector.
 */
const ABSENT = Symbol('absent');
type Baseline = string | typeof ABSENT;

interface ClaimRecord {
  /** Opaque identity. Two claims of the same value are still distinct. */
  readonly token: object;
  /** The latest value this claim asserted; `update` moves it in place. */
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
type ChannelKey = string;

const registry = new WeakMap<object, Map<ChannelKey, ChannelState>>();

interface ChannelAdapter {
  /** Current live value, or ABSENT. */
  read(): Baseline;
  /** Write a claimed value. */
  write(value: string): void;
  /** Restore the baseline captured before any claim. */
  restore(baseline: Baseline): void;
}

/**
 * One live claim. `update` moves the claimed value without leaving the stack,
 * so a claimant that changes its mind neither loses its position to a claim
 * taken after it nor flashes the baseline between the two values.
 */
interface ChannelClaim {
  readonly release: ReleaseRootAttribute;
  readonly update: (value: string) => void;
}

function claimChannel(
  element: object,
  key: ChannelKey,
  value: string,
  adapter: ChannelAdapter,
): ChannelClaim {
  let channels = registry.get(element);
  if (!channels) {
    channels = new Map();
    registry.set(element, channels);
  }

  let state = channels.get(key);
  if (!state) {
    // First claim on this channel: whatever is there now is the baseline, and
    // that is precisely the SSR stamp we must be able to hand back.
    state = { baseline: adapter.read(), stack: [] };
    channels.set(key, state);
  }

  const record: ClaimRecord = { token: {}, value };
  state.stack.push(record);
  // Claiming a channel that already carries the claimed value -- the ordinary
  // shape of hydration over an SSR stamp -- must not mutate the DOM. A
  // redundant write is observable: it wakes every MutationObserver watching
  // the root and re-runs whatever they recompute.
  if (adapter.read() !== value) adapter.write(value);

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
      const found = locate();
      if (!found) return;

      record.value = next;

      // Only the top claim owns the live value; a covered claim just records
      // what it will re-apply if the claim above it is released.
      if (found.index !== found.state.stack.length - 1) return;
      if (adapter.read() !== next) adapter.write(next);
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
      // must leave it alone.
      if (adapter.read() !== record.value) {
        drain();
        return;
      }

      // Handing down and handing back share the claim-time guard: a value that
      // is already live is not rewritten.
      const next = found.state.stack[found.state.stack.length - 1];
      if (next) {
        if (adapter.read() !== next.value) adapter.write(next.value);
        return;
      }

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

/**
 * Claims an inline root style property (e.g. `color-scheme`).
 *
 * Inline styles outrank every stylesheet, so a stale rollback here is more
 * damaging than for an attribute: it would silently re-apply a previous
 * theme's scheme over the live one.
 */
export function claimRootStyleProperty(
  element: HTMLElement,
  property: string,
  value: string,
): ReleaseRootAttribute {
  return claimChannel(element, `style:${property}`, value, {
    read: () => {
      const current = element.style.getPropertyValue(property);
      return current === '' ? ABSENT : current;
    },
    write: (next) => element.style.setProperty(property, next),
    restore: (baseline) => {
      if (baseline === ABSENT) element.style.removeProperty(property);
      else element.style.setProperty(property, baseline);
    },
  }).release;
}

/**
 * Claims presence/absence of a class name.
 *
 * `classList.remove` on cleanup has the same defect as `removeAttribute`: the
 * server may have emitted `class="dark"` itself, and a provider that did not add
 * it must not take it away. Presence is encoded as a value so it shares the one
 * stack implementation.
 */
export function claimRootClass(
  element: Element,
  className: string,
  present: boolean,
): ReleaseRootAttribute {
  const encode = (flag: boolean) => (flag ? 'present' : 'absent');
  return claimChannel(element, `class:${className}`, encode(present), {
    read: () => encode(element.classList.contains(className)),
    write: (next) => element.classList.toggle(className, next === 'present'),
    restore: (baseline) => {
      // A class channel always has a concrete baseline: it is either there or
      // it is not, so ABSENT is unreachable and treated as "not present".
      element.classList.toggle(className, baseline === 'present');
    },
  }).release;
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
