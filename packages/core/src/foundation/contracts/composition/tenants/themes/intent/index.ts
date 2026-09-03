/**
 * @fileoverview Pre-resolution theme intent contract.
 * @description The single shape both ingresses normalize to before resolution.
 *
 * @module Contracts/Themes/Intent
 * @category Types
 * @package @rottay/design-system
 */

import type { ThemePatch } from "../iso";

/**
 * Which transport authored this intent. Transport only; never a visual input.
 *
 * `static-vertical`  the vertical's own code-owned baseline layer. It may
 *                    change the resolved `Theme`, but it is NOT tenant
 *                    authorship: it creates no tenant floor and no tenant
 *                    status-seed authorship.
 * `tenant-document`  a persisted tenant customization.
 * `preview`          an unsaved TENANT CUSTOMIZATION preview. It is not a
 *                    preview of a static vertical baseline, so it resolves
 *                    with tenant authorship exactly like `tenant-document`.
 */
export type ThemeIntentOrigin = "static-vertical" | "tenant-document" | "preview";

/** The origins that resolve as a tenant-authored overlay. */
export const TENANT_AUTHORED_ORIGINS = Object.freeze([
  "tenant-document",
  "preview",
]) as readonly ThemeIntentOrigin[];

export function isTenantAuthoredOrigin(origin: ThemeIntentOrigin): boolean {
  return TENANT_AUTHORED_ORIGINS.includes(origin);
}

/**
 * The single pre-resolution form. Both ingresses normalize to this before
 * resolution, so the resolver sees two values of one type and cannot acquire a
 * second, differently-shaped authoring path.
 */
export interface ThemeIntent {
  readonly origin: ThemeIntentOrigin;
  readonly patch: ThemePatch;
}
