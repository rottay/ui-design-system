'use client';

/**
 * @fileoverview useLayoutAnimation -- the one layout-motion door
 *
 * Five unrelated mechanisms could move layout in this package. This is the entry
 * point that names them: `reflow` (FLIP over surviving keyed children), `size`
 * (keyword interpolation or a measured invert), `presence` (unmount gated on a
 * node's own exit motion) and `shared` (a record morphing across two surfaces
 * through View Transitions). The return type is discriminated on `kind`, so a
 * call site gets exactly the members its kind owns.
 *
 * Under `prefers-reduced-motion: reduce` the kernel creates NO animation and the
 * final state is committed on the same frame. Cadence is never a number here: a
 * call site names a channel, the kernel reads its computed value, and the
 * tenant's dial and `motion.character` arrive with it.
 *
 * @example
 * ```tsx
 * const { register, measure } = useLayoutAnimation({ kind: 'reflow' });
 * const { style } = useLayoutAnimation({ kind: 'shared', sharedKey: row.id });
 * ```
 */

import { useMemo } from 'react';

import type {
  LayoutAnimationOptions,
  LayoutChannelPair,
  PresenceResult,
  ReflowResult,
  SharedResult,
  SizeResult,
  TimedLayoutAnimationKind,
} from '../contracts';
import { LAYOUT_CHANNEL_DEFAULTS } from '../kernel/channels';
import { useFlipLayout } from '../runtime/reflow';
import { useSharedElementKey } from '../runtime/shared-element';
import { useSizeAnimation } from '../runtime/size';
import { usePresence } from '../../presence';
import { recordMorphStyle } from '../../view-transition';

/** Compile-time floor: every timed kind carries a channel pair, or this fails. */
const CHANNELS: Record<TimedLayoutAnimationKind, LayoutChannelPair> = LAYOUT_CHANNEL_DEFAULTS;

export function useLayoutAnimation<K extends string = string>(
  options: LayoutAnimationOptions & { kind: 'reflow' },
): ReflowResult<K>;
export function useLayoutAnimation<K extends string = string>(
  options: LayoutAnimationOptions & { kind: 'size' },
): SizeResult<K>;
export function useLayoutAnimation(
  options: LayoutAnimationOptions & { kind: 'presence' },
): PresenceResult;
export function useLayoutAnimation(
  options: LayoutAnimationOptions & { kind: 'shared' },
): SharedResult;
export function useLayoutAnimation(
  options: LayoutAnimationOptions,
): ReflowResult | SizeResult | PresenceResult | SharedResult {
  const { kind, durationVar, easingVar, reducedMotion, sizeStrategy, onExitComplete } = options;

  // Every arm's hooks run on every render: the returned SHAPE is discriminated,
  // the hook order is not, so a call site may switch kinds without breaking it.
  const reflow = useFlipLayout({
    durationVar: durationVar ?? CHANNELS.reflow.durationVar,
    easingVar: easingVar ?? CHANNELS.reflow.easingVar,
    reducedMotion,
  });
  const size = useSizeAnimation({
    durationVar: durationVar ?? CHANNELS.size.durationVar,
    easingVar: easingVar ?? CHANNELS.size.easingVar,
    sizeStrategy,
    reducedMotion,
  });
  const presence = usePresence(options.present ?? true, { reducedMotion, onExitComplete });
  const sharedKey = useSharedElementKey(kind === 'shared' ? options.sharedKey : undefined);
  const shared = useMemo<SharedResult>(
    () => ({ style: sharedKey === undefined ? {} : recordMorphStyle(sharedKey) }),
    [sharedKey],
  );

  if (kind === 'size') return size;
  if (kind === 'presence') return presence;
  if (kind === 'shared') return shared;
  return reflow;
}
