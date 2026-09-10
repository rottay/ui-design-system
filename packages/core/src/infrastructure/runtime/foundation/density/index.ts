/**
 * Density runtime (DS-A006) — the ONE public scoped contract for visual
 * density. The CSS cascade in `foundation/base/density/index.css` remains the value
 * authority (`--ds-density-effective-scale` clamp math); this runtime only
 * (a) stamps a scoped `data-density` posture boundary and (b) exposes that
 * same posture to JS consumers.
 *
 * The DOCUMENT-ROOT mount is not here. It writes `<html>`, which is the claim
 * registry's surface, and that registry is this owner's architectural peer;
 * `runtime/density` owns it one level up, where the edge runs downward.
 *
 * Visual density is NOT a layout-view preference: table card/list view
 * vocabulary stays in application state; this contract governs coordinated
 * geometry (heights, padding, gap, type scale) only. The 44px coarse-pointer
 * touch floor is deliberately outside this scale and never shrinks with it: it
 * is enforced by the shared unlayered rule in `facade/entrypoints/base/index.css`
 * plus per-component `min-*-size` floors where the role sits on an indicator.
 */
'use client';

import {
  createContext,
  createElement,
  useContext,
  type ReactNode,
} from 'react';

export const DENSITY_POSTURES = ['compact', 'comfortable', 'spacious'] as const;

export type DensityPosture = (typeof DENSITY_POSTURES)[number];

export interface DensityScopeValue {
  readonly posture: DensityPosture;
}

/**
 * The value every consumer outside any boundary reads.
 *
 * Exported because the ROOT mount is a separate owner: it publishes the same
 * context and must publish this exact identity for `comfortable`, so a root
 * mount at the default posture is indistinguishable from no mount at all.
 */
export const DENSITY_DEFAULT_SCOPE: DensityScopeValue = Object.freeze({
  posture: 'comfortable',
});

/**
 * The one density carrier. Exported for `runtime/density`'s root provider,
 * which owns the document-root claim and therefore cannot live here; every
 * other consumer reads it through `useDensity`.
 */
export const DensityContext = createContext<DensityScopeValue>(DENSITY_DEFAULT_SCOPE);

export interface DensityScopeProps {
  readonly posture: DensityPosture;
  /** Structural element carrying the scoped `data-density` boundary. */
  readonly as?: 'div' | 'section';
  readonly className?: string;
  readonly children?: ReactNode;
}

/**
 * Scoped density boundary. Stamps `data-density` for the CSS cascade and
 * publishes the same local posture to JS consumers inside this boundary.
 *
 * This does not claim ownership of tenant-global structural density or the
 * DB appearance factor. Those remain compiler-owned until the root provider
 * integration and legacy writer migration are completed.
 */
export function DensityScope({
  posture,
  as = 'div',
  className,
  children,
}: DensityScopeProps) {
  const value: DensityScopeValue =
    posture === DENSITY_DEFAULT_SCOPE.posture ? DENSITY_DEFAULT_SCOPE : { posture };
  return createElement(
    DensityContext.Provider,
    { value },
    createElement(as, { 'data-density': posture, className }, children)
  );
}

/** Active scoped density posture; `comfortable` outside any scope. */
export function useDensity(): DensityScopeValue {
  return useContext(DensityContext);
}

/**
 * Normalize the tenant-facing semantic preference into the runtime posture.
 *
 * Structural `--ds-density-scale` values must never enter this function:
 * they are an independent brand axis already composed by the CSS/token graph.
 * Turning that scale into a posture would apply density twice.
 */
export function deriveDensityPosture(
  preference: unknown
): DensityPosture {
  if (preference === 'compact') return 'compact';
  if (preference === 'spacious') return 'spacious';
  return 'comfortable';
}

/**
 * The ONE attribute vocabulary for density boundaries. Components that own
 * their host element spread this instead of hand-writing `data-density`, so
 * the attribute name and value domain have a single source.
 */
export function densityScopeAttributes(
  posture: DensityPosture
): Readonly<Record<'data-density', DensityPosture>> {
  return { 'data-density': posture };
}
