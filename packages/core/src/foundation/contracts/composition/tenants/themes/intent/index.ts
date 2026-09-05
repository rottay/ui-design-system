/**
 * @fileoverview Pre-resolution theme intent contract.
 * @description The single shape both ingresses normalize to before resolution.
 *
 * @module Contracts/Themes/Intent
 * @category Types
 * @package @rottay/design-system
 */

import type { FirstPartyVerticalId } from "../../../../kernel/verticals";
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
 * The single pre-resolution form, and the ONLY input the resolver accepts.
 *
 * It names the baseline instead of carrying one. A caller used to hand in a
 * `Theme` it had assembled itself — `{ ...FIRST_PARTY_THEMES[slug], id: tenant }`
 * at five sites — which made every call site an authority on three separate
 * questions: which product's baseline this compile is against, what scope the
 * result is written for, and which engine renders it. Naming the vertical moves
 * all three into one place: the roster row answers the baseline and the engine,
 * and `slug` answers the scope.
 *
 * `vertical` is a first-party roster id because that is the only thing a
 * baseline can be. A customer tenant is not a fourth baseline: it is a patch
 * over the vertical it belongs to, which is exactly what `patch` carries.
 * `slug` is the tenant the compile is FOR, and equals `vertical` only for the
 * vertical's own static compile.
 */
export interface ThemeIntent {
  readonly vertical: FirstPartyVerticalId;
  readonly slug: string;
  readonly origin: ThemeIntentOrigin;
  readonly patch: ThemePatch;
}
