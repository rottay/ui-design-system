/**
 * @fileoverview Layout animation kernel -- public contracts
 *
 * The four kinds of layout motion the kernel owns, the options every kind
 * accepts and the four result shapes `useLayoutAnimation` returns. Timing is
 * never a number here: a call site names a CSS custom property CHANNEL and the
 * kernel reads its computed value, so the tenant's cadence dial and
 * `motion.character` reach every animation without a second authority.
 */

import type { CSSProperties, ReactNode } from 'react';

import type { MotionDataState } from '@/graphics/motion/foundation/contracts';

/**
 * `reflow` moves surviving keyed children inside one container; `size` grows or
 * shrinks one node; `presence` gates unmount on a node's own exit motion;
 * `shared` morphs one record across two surfaces via View Transitions.
 */
export type LayoutAnimationKind = 'reflow' | 'size' | 'presence' | 'shared';

/**
 * The kinds whose cadence the kernel itself times. `presence` is excluded
 * deliberately: its visuals are CSS-owned, so the stylesheet names the channel
 * and the kernel only waits for the transition it declared.
 */
export type TimedLayoutAnimationKind = Exclude<LayoutAnimationKind, 'presence'>;

/** Requested strategy for `kind: 'size'`. `measured` forces the FLIP fallback. */
export type SizeStrategy = 'auto' | 'measured';

/** The strategy actually in force after the `interpolate-size` support probe. */
export type ResolvedSizeStrategy = 'interpolate-size' | 'measured';

/** A duration channel and an easing channel, both custom-property NAMES. */
export interface LayoutChannelPair {
  durationVar: string;
  easingVar: string;
}

export interface LayoutAnimationOptions {
  kind: LayoutAnimationKind;
  /** Channel NAME (not a `var()` expression) supplying the duration. Defaults per kind. */
  durationVar?: string;
  /** Channel NAME supplying the easing. Defaults per kind. */
  easingVar?: string;
  /** Shared-element pairing key; required for kind `'shared'`, ignored otherwise. */
  sharedKey?: string;
  /** Forces the measured-FLIP path for kind `'size'` so the fallback is gate-reachable. */
  sizeStrategy?: SizeStrategy;
  /** Whether the node is present; kind `'presence'` only, defaults to `true`. */
  present?: boolean;
  /** Fires once after a kind `'presence'` node has stopped rendering. */
  onExitComplete?: () => void;
  /** Test-only override of the live `prefers-reduced-motion` reading. */
  reducedMotion?: boolean;
}

export interface ReflowResult<K extends string = string> {
  /** Ref callback for a keyed item. */
  register: (key: K) => (node: HTMLElement | null) => void;
  /** Snapshot every registered element. Call synchronously before the layout-changing update. */
  measure: () => void;
}

export interface SizeResult<K extends string = string> extends ReflowResult<K> {
  /** Which of the two size mechanisms this environment resolved to. */
  strategy: ResolvedSizeStrategy;
}

export interface PresenceResult {
  /** Attach to the node whose own transition/animation gates unmount. */
  ref: (node: HTMLElement | null) => void;
  /** `'open'` while present, `'closed'` from the moment exit is requested. */
  dataState: MotionDataState;
  /** Whether the caller should still render the node. */
  shouldRender: boolean;
}

export interface SharedResult {
  /** Spread onto the element representing the record on both surfaces. */
  style: CSSProperties;
}

export interface LayoutGroupProps {
  /** Scopes shared-element keys and batches sibling reflow onto one commit. */
  id: string;
  children?: ReactNode;
}
