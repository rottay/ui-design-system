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
  readonly value: string;
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

function claimChannel(
  element: object,
  key: ChannelKey,
  value: string,
  adapter: ChannelAdapter,
): ReleaseRootAttribute {
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
  adapter.write(value);

  let released = false;
  return () => {
    if (released) return;
    released = true;

    const channels_ = registry.get(element);
    const current = channels_?.get(key);
    if (!channels_ || !current) return;

    const index = current.stack.findIndex((entry) => entry.token === record.token);
    if (index === -1) return;

    const wasTop = index === current.stack.length - 1;
    current.stack.splice(index, 1);

    // Releasing a claim that something else has since covered must not touch
    // the DOM. Only the top claim owns the live value.
    if (!wasTop) return;

    // An external writer (an app effect, a devtool) may have taken over. If the
    // live value is not what this claim wrote, we are no longer the owner and
    // must leave it alone.
    if (adapter.read() !== record.value) {
      if (current.stack.length === 0) {
        channels_.delete(key);
        if (channels_.size === 0) registry.delete(element);
      }
      return;
    }

    const next = current.stack[current.stack.length - 1];
    if (next) {
      adapter.write(next.value);
      return;
    }

    adapter.restore(current.baseline);
    channels_.delete(key);
    if (channels_.size === 0) registry.delete(element);
  };
}

/** Claims a root attribute. */
export function claimRootAttribute(
  element: Element,
  name: string,
  value: string,
): ReleaseRootAttribute {
  return claimChannel(element, `attr:${name}`, value, {
    read: () => (element.hasAttribute(name) ? (element.getAttribute(name) as string) : ABSENT),
    write: (next) => element.setAttribute(name, next),
    restore: (baseline) => {
      if (baseline === ABSENT) element.removeAttribute(name);
      else element.setAttribute(name, baseline);
    },
  });
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
  });
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
  });
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
