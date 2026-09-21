/**
 * @fileoverview The form-surface adaptation: whether the surface's tracks stack
 * into one column, where its section navigation goes, where the action bar sits
 * and whether the header runs compact, per posture.
 *
 * One contract for the four form page recipes (`FormSurface`,
 * `DetailFormSurface`, `GuidedDraftFormSurface`, `WizardSurface`): they answer
 * the same question about the same space, so they answer it in the same words.
 * Each recipe reads the subset it owns.
 *
 * @module Contracts/Kernel/Adaptation/Families/FormSurface
 * @category Types
 * @package @rottay/design-system
 */

import type { Adapt } from '../../../foundation';

/** Where the section navigation of a multi-section form goes. */
export const FORM_SURFACE_SECTION_LAYOUTS = [
  'sidebar-nav',
  'pill-nav',
  'dropdown-nav',
  'stacked',
] as const;

export type FormSurfaceSectionLayout = (typeof FORM_SURFACE_SECTION_LAYOUTS)[number];

/** Where the surface's action bar sits. */
export const FORM_SURFACE_ACTION_BARS = ['inline', 'sticky-bottom', 'floating'] as const;

export type FormSurfaceActionBar = (typeof FORM_SURFACE_ACTION_BARS)[number];

export interface FormSurfaceAdaptation {
  /** The surface's tracks collapse into a single column. */
  readonly stacked?: boolean;
  readonly sectionLayout?: FormSurfaceSectionLayout;
  readonly actionBar?: FormSurfaceActionBar;
  /** The header drops its supporting copy. */
  readonly compactHeader?: boolean;
}

export interface ResolvedFormSurfaceAdaptation {
  readonly stacked: boolean;
  readonly sectionLayout: FormSurfaceSectionLayout;
  readonly actionBar: FormSurfaceActionBar;
  readonly compactHeader: boolean;
}

/**
 * The family narrows and never widens: a compact box stacks its tracks and
 * moves the section navigation into the dropdown, whatever the viewport says.
 * Every wider posture keeps the surface's own resolution, so a recipe that
 * declares nothing renders exactly as it did before it adopted the slot.
 */
export const FORM_SURFACE_ADAPT_DEFAULTS: Adapt<FormSurfaceAdaptation> = Object.freeze({
  compact: Object.freeze({ stacked: true, sectionLayout: 'dropdown-nav' }),
});
