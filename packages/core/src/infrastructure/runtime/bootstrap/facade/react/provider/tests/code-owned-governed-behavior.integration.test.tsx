import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import type { TenantConfig } from '@/foundation/contracts';
import { useTenantContext } from '@/infrastructure/runtime/tenant/composition/react/provider';
import {
  getCodeOwnedGovernedBehavior,
  getCodeOwnedRuntimeConfig,
  getKnownTenantConfig,
} from '@/infrastructure/runtime/tenant/foundation/configuration/registry';
import { MOTION_PROFILE_DEFAULTS } from '@/infrastructure/runtime/foundation/motion/policy';
import { deriveDensityPosture, useDensity } from '@/infrastructure/runtime/foundation/density';
import {
  resolveExpressiveAxes,
  sanitizeExpressiveOverrides,
} from '@/foundation/tokens/ts/presentation/expressive-profiles';
import { useMotionPolicy } from '../../../../../motion';
import {
  resolveActiveIconExpressiveProfile,
  useActiveIconExpressiveProfile,
} from '@/infrastructure/runtime/foundation/icons/active-profile';
import { DesignSystemProvider } from '..';

function Probe(): React.ReactElement {
  const { config } = useTenantContext();
  const policy = useMotionPolicy();
  const iconProfile = useActiveIconExpressiveProfile();
  const density = useDensity();
  return (
    <output data-testid="probe">
      {JSON.stringify({
        publishedKeys: Object.keys(config).sort(),
        intensity: policy.intensity,
        durationScale: policy.durationScale,
        ambient: policy.ambient,
        profile: policy.profile,
        iconProfile: iconProfile ?? null,
        density: density.posture,
      })}
    </output>
  );
}

function renderVertical(slug: 'bithire' | 'evnto' | 'rottay') {
  const config = getKnownTenantConfig(slug);
  if (!config) throw new Error(`missing code-owned tenant ${slug}`);
  return render(
    <DesignSystemProvider vertical={slug} tenantConfig={config}>
      <Probe />
    </DesignSystemProvider>,
  );
}

function probe() {
  return JSON.parse(screen.getByTestId('probe').textContent ?? '{}');
}

afterEach(() => {
  cleanup();
  document.documentElement.removeAttribute('data-density');
  document.documentElement.removeAttribute('data-tenant');
});

describe('code-owned governed behavior survives the runtime projection', () => {
  it('keeps bithire on its authored 0.55 dial instead of the calm envelope default', () => {
    // The projection strips `brandTheme` so static CSS stays the sole visual
    // emitter. Before the governed slice existed, that strip also deleted the
    // authored motion dial, and every first-party vertical silently fell back
    // to its motion-profile envelope -- calm's 0.3 for bithire.
    expect(MOTION_PROFILE_DEFAULTS.calm.intensity).toBe(0.3);
    renderVertical('bithire');
    const result = probe();
    expect(result.profile).toBe('calm');
    expect(result.intensity).toBe(0.55);
    expect(result.intensity).not.toBe(MOTION_PROFILE_DEFAULTS.calm.intensity);
    // entranceDuration 200ms over calm's 200ms base is exactly 1.0.
    expect(result.durationScale).toBe(1);
  });

  it('publishes identity and behavior only -- no raw visual field reaches consumers', () => {
    renderVertical('bithire');
    const keys: string[] = probe().publishedKeys;
    expect(keys).not.toContain('brandTheme');
    expect(keys).not.toContain('appearance');
    expect(keys).not.toContain('personality');
    expect(keys).not.toContain('tokenOverrides');
    expect(keys).toContain('slug');
    expect(keys).toContain('branding');
  });

  it('carries the whole expressive selection the density and icon resolvers need', () => {
    // DISCRIMINATION NOTE. Density and icon are the other two channels the
    // strip destroyed, but neither is END-TO-END observable today: bithire's
    // composition resolves `density: 'normal'` (posture `comfortable`, which
    // is also the no-selection default) and authors no `icon` axis at all
    // (the axis is still declared but closed). A rendered assertion on either value
    // therefore passes with the seam UNWIRED -- a false green.
    //
    // So the payload is proven here, at the slice, where the assertion does
    // discriminate: feeding the governed slice to the real resolvers must
    // produce exactly what the un-stripped source produces. The provider's
    // end-to-end wiring is proven by the motion drill above; all three
    // channels read the one `governedBehavior` value, so the seam is covered
    // even though two of its channels currently carry default-valued axes.
    const source = getKnownTenantConfig('bithire')!;
    const behavior = getCodeOwnedGovernedBehavior(source)!;
    expect(behavior.expressive?.experienceProfile).toBe('rottay/bithire-technical@1');
    expect(behavior.expressive).toBe(source.brandTheme!.expressive);

    const axesFromSlice = resolveExpressiveAxes(
      behavior.expressive!.experienceProfile,
      sanitizeExpressiveOverrides(behavior.expressive!.profiles),
      behavior.expressive!.schemaVersion,
    );
    const axesFromSource = resolveExpressiveAxes(
      source.brandTheme!.expressive!.experienceProfile,
      sanitizeExpressiveOverrides(source.brandTheme!.expressive!.profiles),
      source.brandTheme!.expressive!.schemaVersion,
    );
    expect(axesFromSlice).toEqual(axesFromSource);
    // Not vacuous: the selection resolves real axes, including the two the
    // theme overrides on top of its experience profile.
    expect(axesFromSlice).toMatchObject({ type: 'humanist', geometry: 'rounded' });

    expect(resolveActiveIconExpressiveProfile({ brandTheme: behavior }))
      .toBe(resolveActiveIconExpressiveProfile(source));
    expect(deriveDensityPosture(axesFromSlice.density))
      .toBe(deriveDensityPosture(axesFromSource.density));
  });

  it('keeps the rendered density and icon posture equal to the pre-strip resolution', () => {
    const source = getKnownTenantConfig('bithire')!;
    renderVertical('bithire');
    const result = probe();
    const axes = resolveExpressiveAxes(
      source.brandTheme!.expressive!.experienceProfile,
      sanitizeExpressiveOverrides(source.brandTheme!.expressive!.profiles),
      source.brandTheme!.expressive!.schemaVersion,
    );
    expect(result.density).toBe(deriveDensityPosture(axes.density));
    expect(result.iconProfile).toBe(resolveActiveIconExpressiveProfile(source) ?? null);
  });

  it.each(['bithire', 'evnto', 'rottay'] as const)(
    'exposes the same governed slice through %s config and its projection',
    (slug) => {
      const source = getKnownTenantConfig(slug)!;
      const projection = getCodeOwnedRuntimeConfig(source);
      const fromSource = getCodeOwnedGovernedBehavior(source);
      const fromProjection = getCodeOwnedGovernedBehavior(projection);
      expect(fromProjection).toBe(fromSource);
      expect(projection.brandTheme).toBeUndefined();
      expect(fromSource).toBeDefined();
    },
  );

  it('is bounded to the dial and the selection, never to visual personality', () => {
    const behavior = getCodeOwnedGovernedBehavior(getKnownTenantConfig('bithire')!)!;
    expect(Object.keys(behavior).sort()).toEqual(['expressive', 'motion']);
    expect(Object.keys(behavior.motion!).sort()).toEqual(['entranceDuration', 'intensity']);
    expect(Object.isFrozen(behavior)).toBe(true);
    expect(Object.isFrozen(behavior.motion)).toBe(true);
  });

  it('cannot be claimed by a caller-built config that copies a reserved identity', () => {
    const source = getKnownTenantConfig('bithire')!;
    // Structurally identical, including every field of the real brandTheme --
    // and still not the object this registry projected.
    const forged = { ...source } as TenantConfig;
    expect(getCodeOwnedGovernedBehavior(forged)).toBeUndefined();
    expect(getCodeOwnedGovernedBehavior({ slug: 'bithire' })).toBeUndefined();
    expect(getCodeOwnedGovernedBehavior(null)).toBeUndefined();
  });
});
