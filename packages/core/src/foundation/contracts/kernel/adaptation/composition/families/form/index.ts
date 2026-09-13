/**
 * @fileoverview The form adaptation: how fields and labels lay out, per posture.
 *
 * @module Contracts/Kernel/Adaptation/Families/Form
 * @category Types
 * @package @rottay/design-system
 */

export const FORM_ADAPTATION_LAYOUTS = ['horizontal', 'vertical', 'inline'] as const;

export type FormAdaptationLayout = (typeof FORM_ADAPTATION_LAYOUTS)[number];

export interface FormAdaptation {
  readonly layout?: FormAdaptationLayout;
}

export interface ResolvedFormAdaptation {
  readonly layout: FormAdaptationLayout;
}
