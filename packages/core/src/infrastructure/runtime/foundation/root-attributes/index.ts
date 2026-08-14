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

// This index is the family's front door only: the ownership stack lives in
// `./registry` (the one WeakMap, the one claimChannel) and the style/class
// channels in `./presentation`. It re-exports their bindings -- it never
// copies, wraps, or widens them.
export {
  claimRootAttribute,
  claimRootAttributeSet,
  composeRootAttributeReleases,
  outstandingRootClaims,
} from './registry';
export type { ReleaseRootAttribute, RootAttributeSetClaim } from './registry';
export { claimRootClass, claimRootStyleProperty } from './presentation';
