/**
 * Density runtime (DS-A006) — the ONE public scoped contract for visual
 * density. The CSS cascade in `foundation/base/density.css` remains the value
 * authority (`--ds-density-effective-scale` clamp math); this runtime only
 * (a) stamps a scoped `data-density` posture boundary and (b) exposes that
 * same posture to JS consumers.
 *
 * Visual density is NOT a layout-view preference: table card/list view
 * vocabulary stays in application state; this contract governs coordinated
 * geometry (heights, padding, gap, type scale) only. The 44px coarse-pointer
 * touch floor is enforced in the skins with `min-*-size` and is deliberately
 * outside this scale.
 */
'use client';

import {
  createContext,
  createElement,
  useContext,
  useEffect,
  type ReactNode,
} from 'react';

export const DENSITY_POSTURES = ['compact', 'comfortable', 'spacious'] as const;

export type DensityPosture = (typeof DENSITY_POSTURES)[number];

export interface DensityScopeValue {
  readonly posture: DensityPosture;
}

const DEFAULT_SCOPE: DensityScopeValue = Object.freeze({
  posture: 'comfortable',
});

const DensityContext = createContext<DensityScopeValue>(DEFAULT_SCOPE);

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
    posture === DEFAULT_SCOPE.posture ? DEFAULT_SCOPE : { posture };
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

export interface RootDensityProviderProps {
  readonly posture: DensityPosture;
  readonly children?: ReactNode;
}

/**
 * Tenant-root density mount: publishes the semantic posture to JS consumers
 * and stamps it on the document element beside the tenant attributes.
 *
 * The root attribute is state metadata, not another scale multiplier:
 * `foundation/base/density.css` deliberately applies its local factor only to
 * non-root boundaries. Global visual density is already compiler-owned through
 * `--ds-density-mode-factor`; nested boundaries use `DensityScope` and apply
 * their own relative factor.
 */
export function RootDensityProvider({
  posture,
  children,
}: RootDensityProviderProps) {
  useEffect(() => {
    const element = document.documentElement;
    const previous = element.getAttribute('data-density');
    element.setAttribute('data-density', posture);
    return () => {
      if (previous === null) element.removeAttribute('data-density');
      else element.setAttribute('data-density', previous);
    };
  }, [posture]);

  const value: DensityScopeValue =
    posture === 'comfortable' ? DEFAULT_SCOPE : { posture };
  return createElement(DensityContext.Provider, { value }, children);
}
