/**
 * @fileoverview The overlay adaptation: whether a blocking overlay floats over
 * the page or takes the whole dynamic viewport, per posture.
 *
 * @module Contracts/Kernel/Adaptation/Families/Overlay
 * @category Types
 * @package @rottay/design-system
 */

import type { Adapt } from '../../../foundation';

export const OVERLAY_PRESENTATIONS = ['floating', 'fullscreen'] as const;

export type OverlayPresentation = (typeof OVERLAY_PRESENTATIONS)[number];

export interface OverlayAdaptation {
  readonly presentation?: OverlayPresentation;
}

export interface ResolvedOverlayAdaptation {
  readonly presentation: OverlayPresentation;
}

/** A blocking overlay owns the whole dynamic viewport on a phone unless the app says otherwise. */
export const OVERLAY_ADAPTATION_DEFAULTS: Adapt<OverlayAdaptation> = Object.freeze({
  phone: Object.freeze({ presentation: 'fullscreen' }),
});
