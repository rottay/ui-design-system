'use client';

/**
 * @fileoverview The adaptation runtime: the postures in force for one family
 * instance, and the adaptation its `adapt` slot resolves to at them.
 *
 * The viewport posture is the one responsive snapshot, so a server render
 * answers the request's viewport hint and hydration agrees with it. The
 * container posture comes from the family's own box.
 *
 * @module Infrastructure/Runtime/Adaptation
 * @category Runtime
 * @package @rottay/design-system
 */

import { useMemo } from 'react';
import type { RefObject } from 'react';

import {
  postureAttribute,
  resolveAdaptation,
  type Adapt,
  type ResolvedPosture,
} from '@/foundation/contracts/kernel/adaptation';
import { useResponsive } from '@/infrastructure/runtime/responsive';

import { useContainerPosture } from '../../runtime/container-posture';

export interface UseAdaptationOptions<A extends object> {
  /** The family's adaptation when nothing is declared. */
  readonly base: A;
  /** The family's own per-posture defaults, applied beneath the app's `adapt`. */
  readonly defaults?: Adapt<Partial<A>>;
  /** The family's box. Omit it and only the viewport posture is resolved. */
  readonly containerRef?: RefObject<HTMLElement | null>;
}

export interface AdaptationResult<A extends object> {
  readonly posture: ResolvedPosture;
  readonly adaptation: A;
  /** The value to stamp as `data-posture`. */
  readonly postureAttribute: string;
}

const UNOBSERVED: RefObject<HTMLElement | null> = { current: null };

/** Resolve a family's `adapt` slot at the postures in force. */
export function useAdaptation<A extends object>(
  adapt: Adapt<Partial<A>> | undefined,
  { base, defaults, containerRef }: UseAdaptationOptions<A>,
): AdaptationResult<A> {
  const { deviceClass } = useResponsive();
  const container = useContainerPosture(containerRef ?? UNOBSERVED, null);
  return useMemo(() => {
    const posture: ResolvedPosture = { viewport: deviceClass, container };
    return {
      posture,
      adaptation: resolveAdaptation(base, posture, adapt, defaults),
      postureAttribute: postureAttribute(posture),
    };
  }, [adapt, base, container, defaults, deviceClass]);
}
