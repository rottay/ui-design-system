/**
 * @fileoverview Bridge from the surface posture contract to a shell-shaped
 * `adapt` delta: the resolved navigation mode per viewport band, in the shape
 * the shell family's `adapt` slot accepts.
 *
 * Structural typing only. The returned shape mirrors the shell's navigation
 * adaptation contract, and the surface tier never imports the structures
 * tier — the union members match by construction, and the consumer fixture
 * assigning the result to the shell's `adapt` prop is the compile proof.
 */

import type { ViewportPosture } from '@/foundation/contracts/kernel/adaptation/foundation';
import { VIEWPORT_POSTURES } from '@/foundation/contracts/kernel/adaptation/foundation';
import {
  resolveSurfacePostures,
  type SurfaceFamily,
  type SurfaceNavigationMode,
  type SurfacePostures,
} from '../../../foundation/contracts/postures';

/**
 * The shell `adapt` navigation delta per viewport band. Bands whose resolved
 * posture carries no navigation mode are omitted, so an omitted band leaves
 * the shell family's own default in force there.
 */
export type SurfaceShellNavigationAdapt = Partial<
  Record<ViewportPosture, { readonly navigation: SurfaceNavigationMode }>
>;

/**
 * Map app-declared surface postures onto the shell's per-posture navigation
 * adaptation. Each band resolves through the family's defaults, so the family
 * delta applies where the app declared nothing and the app delta wins where
 * it did.
 */
export function surfacePosturesToShellAdapt(
  postures: SurfacePostures | undefined,
  family: SurfaceFamily = 'list',
): SurfaceShellNavigationAdapt {
  const adapt: { [K in ViewportPosture]?: { readonly navigation: SurfaceNavigationMode } } = {};
  for (const viewport of VIEWPORT_POSTURES) {
    const navigation = resolveSurfacePostures(postures, viewport, family).navigation;
    if (navigation !== undefined) {
      adapt[viewport] = { navigation };
    }
  }
  return adapt;
}
