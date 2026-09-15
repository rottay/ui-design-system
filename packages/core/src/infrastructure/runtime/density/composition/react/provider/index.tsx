'use client';

/**
 * @fileoverview The tenant-root density mount.
 *
 * WHY IT IS NOT FILED WITH THE REST OF THE DENSITY RUNTIME.
 * `runtime/foundation/density` owns the density vocabulary, the scoped
 * boundary and the JS read model; it is a substrate, and substrates do not
 * reach sideways for a claim registry that is their own architectural peer.
 * This provider is the only part of density that writes the DOCUMENT ROOT, so
 * it sits one level up, beside `runtime/motion`'s provider, where consuming
 * both `foundation/density` and `foundation/root-attributes` is a downward
 * edge rather than sibling debt. The previous arrangement kept the write here
 * and the registry out of reach, which is how the root density channel ended
 * up with a second ownership discipline.
 *
 * @module Runtime/Density/Composition/React/Provider
 * @category Runtime
 * @package @rottay/design-system
 */

import { createElement, useEffect, type ReactNode } from 'react';

import {
  DensityContext,
  DENSITY_DEFAULT_SCOPE,
  type DensityPosture,
  type DensityScopeValue,
} from '@/infrastructure/runtime/foundation/density';
import { claimRootAttribute } from '@/infrastructure/runtime/foundation/root-attributes';

export interface RootDensityProviderProps {
  readonly posture: DensityPosture;
  readonly children?: ReactNode;
}

/**
 * Tenant-root density mount: publishes the semantic posture to JS consumers
 * and claims it on the document element beside the tenant attributes.
 *
 * The root attribute is not a second multiplier. `foundation/base/density/index.css`
 * routes it to `--ds-density-mode-factor`, the same semantic channel the
 * Appearance and FlatTheme compilers write, and applies the separate local
 * factor only to non-root boundaries. Two writers of one channel resolve by
 * cascade to a single value, so a compiled tenant posture and this attribute
 * agree instead of composing; nested boundaries use `DensityScope`, whose
 * factor stays relative to whatever the global plane resolved to.
 *
 * The claim is what makes that one channel have one owner. A bare
 * setAttribute/restore decides ownership by VALUE, so unmounting this provider
 * while another owner holds `data-density` restored the value this provider
 * happened to find -- overwriting a live claim. Through the registry the
 * release either hands the channel to the claim below it or restores the
 * baseline the SSR projection stamped, and never touches the DOM when this
 * provider is not the top claim.
 */
export function RootDensityProvider({
  posture,
  children,
}: RootDensityProviderProps) {
  useEffect(
    () => claimRootAttribute(document.documentElement, 'data-density', posture),
    [posture],
  );

  const value: DensityScopeValue =
    posture === 'comfortable' ? DENSITY_DEFAULT_SCOPE : { posture };
  return createElement(DensityContext.Provider, { value }, children);
}
