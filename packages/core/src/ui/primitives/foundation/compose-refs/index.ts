/**
 * @fileoverview Cross-version callback-ref composition. Shared DS utility.
 * @module Primitives/Foundation/ComposeRefs
 * @category Foundation
 * @package @rottay/design-system
 *
 * @remarks
 * ONE utility, shared. It was first written inside the Segmented family, and
 * that was wrong: ref composition is not a family concern, and a per-family
 * copy would mean each family re-deciding the cross-version question below and
 * getting it differently wrong. Adjudicated to live here; no local forks.
 *
 * WHY THIS IS A UNIT INSTEAD OF A CLOSURE IN A COMPONENT.
 *
 * The package peer range is `react: ^18.0.0 || ^19.0.0`, and the two majors
 * disagree about what a callback ref may RETURN. React 19 treats a returned
 * function as the detach cleanup and calls it instead of re-invoking the
 * callback with `null`. React 18.3 CONSOLE.ERRORS on any returned function.
 *
 * A wrapper that always returns a cleanup therefore logs an error under every
 * React 18 consumer — including consumers that forward no ref at all. That
 * exact defect shipped in the first version of the Segmented ref wrapper, which
 * is what prompted this utility.
 *
 * The invariant that prevents it is one line long — THE COMPOSED CALLBACK MUST
 * RETURN NOTHING — and it is impossible to assert from a test running on a
 * single React version, because React owns the call site and swallows the
 * return value. Extracting the composition makes the invariant directly
 * observable: a test can call the composed function and assert what it returns,
 * on whatever React happens to be installed. That is the whole reason this file
 * exists; it is not decomposition for its own sake.
 *
 * The consumer's own React 19 cleanup is still honoured. It is held between
 * attach and detach and invoked on detach in place of the null call — so the
 * half of the protocol the majors agree on carries the whole contract.
 */

/** A minimal mutable cell. Structural so a `React.useRef` result satisfies it. */
export interface RefCell<T> {
  current: T;
}

/** The two cells the composed callback owns across an attach/detach pair. */
export interface ComposedRefBinding<T> {
  /** The consumer's own handle on the node. */
  own: RefCell<T | null>;
  /** Parking slot for a forwarded React 19 cleanup between attach and detach. */
  forwardedCleanup: RefCell<(() => void) | undefined>;
}

/**
 * A forwarded ref as `React.forwardRef` hands it over, without importing React.
 *
 * The callback arm is typed as returning `unknown` on purpose: a React 19
 * consumer legitimately returns a cleanup here, and narrowing it to `void`
 * would force a cast at the one call site that most needs to inspect it.
 */
export type ForwardedRef<T> =
  | ((instance: T | null) => unknown)
  | RefCell<T | null>
  | null
  | undefined;

/**
 * Compose a forwarded ref with the family's own ref cell.
 *
 * @returns A callback ref that ALWAYS returns `undefined`, on every React
 *   version, so it can never trip React 18's returned-function error.
 *
 * @remarks
 * Detach is driven entirely by the null call, which both majors still make for
 * a callback that returns nothing. On detach the forwarded consumer is released
 * through whichever protocol IT chose: its own cleanup when it supplied one, a
 * `null` call when it did not, and a nulled `.current` when it is an object ref.
 */
export function composeRefs<T>(
  forwarded: ForwardedRef<T>,
  binding: ComposedRefBinding<T>
): (node: T | null) => void {
  return (node: T | null): void => {
    if (node === null) {
      binding.own.current = null;

      const forwardedCleanup = binding.forwardedCleanup.current;
      binding.forwardedCleanup.current = undefined;

      if (forwardedCleanup) forwardedCleanup();
      else if (typeof forwarded === "function") forwarded(null);
      else if (forwarded) forwarded.current = null;
      return;
    }

    binding.own.current = node;

    if (typeof forwarded === "function") {
      const returned = forwarded(node);
      binding.forwardedCleanup.current =
        typeof returned === "function" ? (returned as () => void) : undefined;
      return;
    }

    if (forwarded) forwarded.current = node;
    binding.forwardedCleanup.current = undefined;
  };
}
