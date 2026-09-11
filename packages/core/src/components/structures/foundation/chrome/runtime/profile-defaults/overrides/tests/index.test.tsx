/**
 * @fileoverview The precedence law of instance visual selections (F-18).
 *
 * The defect these tests pin: `useSurfaceProfileDefaultsWithOverrides` applied
 * a surface config's `visual.profileOverrides` with the HIGHEST precedence in
 * the chain and with no validation, so an app could contradict the tenant's
 * theme from its own source and could feed values the DS never modelled.
 */

import React, { type ReactElement, type ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { EngineProvider } from '@/infrastructure/runtime/engines';
import { ProductProfileProvider } from '@/infrastructure/runtime/product-profiles';
import { TenantContext } from '@/infrastructure/runtime/tenant/foundation/context';
import type { TenantConfig } from '@/foundation/contracts';
import { getKnownTenantConfig } from '@/infrastructure/runtime/tenant/foundation/configuration/registry';

import type { SurfaceVisualOverrides } from '../../../../contracts';
import {
  SURFACE_VISUAL_OVERRIDE_CATALOG,
  SURFACE_VISUAL_OVERRIDE_FIELDS,
  SURFACE_VISUAL_OVERRIDE_TENANT_CHANNELS,
  adjudicateInstanceOverrides,
  isAdmittedOverrideValue,
  resolveTenantDecidedChannels,
  useSurfaceProfileDefaultsWithOverrides,
  useSurfaceVisualOverrideVerdicts,
} from '..';

const BASE_TENANT: TenantConfig = {
  slug: 'override-law',
  name: 'Override Law Tenant',
  theme: 'light',
  plan: 'enterprise',
  features: ['all'],
  branding: { companyName: 'Override Law Tenant' },
};

/** What the two decision routes look like from a test's side. */
interface MountedTenant {
  /** A code-owned vertical whose authored theme decided its channels. */
  codeOwned?: 'bithire';
  /** The semantic density posture a published tenant's artifact compiled. */
  density?: string;
}

/**
 * The contexts `useSurfaceProfileDefaults` actually reads, mounted directly.
 *
 * `DesignSystemProvider` is deliberately NOT used here: it refuses to mount a
 * tenant that carries runtime visual payload without a verified compiled
 * artifact, which is exactly the fixture every case below needs. The subject
 * under test is the merge precedence, not the admission barrier, and the
 * admission barrier has its own suites.
 */
function renderWithTenant(ui: ReactElement, mounted: MountedTenant = {}) {
  // The registry's OWN object for the code-owned arm: the decided channels are
  // keyed off identity, so a literal that copies its fields decides nothing.
  const config = mounted.codeOwned
    ? getKnownTenantConfig(mounted.codeOwned) ?? BASE_TENANT
    : BASE_TENANT;

  function Wrapper({ children }: { children: ReactNode }): ReactElement {
    return (
      <EngineProvider defaultEngine="modern">
        <ProductProfileProvider profile="generic.default">
          <TenantContext.Provider
            value={{
              config,
              isLoading: false,
              vertical: undefined,
              ...(mounted.density === undefined
                ? {}
                : { appearance: { general: { density: mounted.density } } }),
            } as never}
          >
            {children}
          </TenantContext.Provider>
        </ProductProfileProvider>
      </EngineProvider>
    );
  }
  return render(ui, { wrapper: Wrapper });
}

function Probe({ overrides }: { overrides?: SurfaceVisualOverrides }) {
  const resolved = useSurfaceProfileDefaultsWithOverrides(overrides);
  const verdicts = useSurfaceVisualOverrideVerdicts(overrides);
  return (
    <>
      <span data-testid="badgeShape">{resolved.badgeShape}</span>
      <span data-testid="density">{resolved.density}</span>
      <span data-testid="sectionSpacing">{resolved.sectionSpacing}</span>
      <span data-testid="entranceDuration">{String(resolved.entranceDuration)}</span>
      <span data-testid="verdicts">
        {verdicts
          .map((verdict) => `${verdict.field}:${verdict.admitted ? 'admitted' : verdict.refusedBecause}`)
          .join('|')}
      </span>
    </>
  );
}

describe('an instance selection cannot contradict a tenant decision', () => {
  it('applies a catalog value on a channel the tenant left open', () => {
    renderWithTenant(<Probe overrides={{ badgeShape: 'pill' }} />);

    expect(screen.getByTestId('badgeShape')).toHaveTextContent('pill');
    expect(screen.getByTestId('verdicts')).toHaveTextContent('badgeShape:admitted');
  });

  it('refuses the same selection once the tenant decides that channel', () => {
    renderWithTenant(
      <Probe overrides={{ badgeShape: 'pill' }} />,
      { codeOwned: 'bithire' },
    );

    // The instance value does not land, and the refusal is named rather than
    // silent. What DOES land is the resolution chain's own answer -- the
    // tenant's paint rides its compiled artifact, not this policy.
    expect(screen.getByTestId('badgeShape')).not.toHaveTextContent('pill');
    expect(screen.getByTestId('verdicts')).toHaveTextContent('badgeShape:tenant-decided');
  });

  it('refuses a density selection decided through the appearance document', () => {
    renderWithTenant(
      <Probe overrides={{ density: 'spacious' }} />,
      { density: 'compact' },
    );

    expect(screen.getByTestId('density')).not.toHaveTextContent('spacious');
    expect(screen.getByTestId('verdicts')).toHaveTextContent('density:tenant-decided');
  });

  it('closes the derived back door: a tenant-decided density also refuses sectionSpacing', () => {
    renderWithTenant(
      <Probe overrides={{ sectionSpacing: 'lg' }} />,
      { codeOwned: 'bithire' },
    );

    expect(screen.getByTestId('sectionSpacing')).not.toHaveTextContent('lg');
    expect(screen.getByTestId('verdicts')).toHaveTextContent('sectionSpacing:tenant-decided');
  });

  it('refuses a value the catalog does not model even on an open channel', () => {
    renderWithTenant(
      <Probe overrides={{ density: 'ultra' as never, entranceDuration: 99_000 }} />,
    );

    expect(screen.getByTestId('density')).toHaveTextContent('comfortable');
    expect(screen.getByTestId('entranceDuration')).not.toHaveTextContent('99000');
    expect(screen.getByTestId('verdicts')).toHaveTextContent('density:not-in-catalog');
    expect(screen.getByTestId('verdicts')).toHaveTextContent('entranceDuration:not-in-catalog');
  });
});

describe('the catalog is complete and subordination has no gap', () => {
  it('models a domain and a tenant channel for every declared field', () => {
    expect(Object.keys(SURFACE_VISUAL_OVERRIDE_TENANT_CHANNELS).sort())
      .toEqual([...SURFACE_VISUAL_OVERRIDE_FIELDS].sort());
    for (const field of SURFACE_VISUAL_OVERRIDE_FIELDS) {
      expect(SURFACE_VISUAL_OVERRIDE_CATALOG[field]).toBeDefined();
      expect(SURFACE_VISUAL_OVERRIDE_TENANT_CHANNELS[field].length).toBeGreaterThan(0);
    }
  });

  it('refuses a value outside every enumerated domain and outside the duration bounds', () => {
    expect(isAdmittedOverrideValue('pulseSpeed', 'turbo')).toBe(false);
    expect(isAdmittedOverrideValue('pulseSpeed', 'slow')).toBe(true);
    expect(isAdmittedOverrideValue('staggerDelay', -1)).toBe(false);
    expect(isAdmittedOverrideValue('staggerDelay', 40)).toBe(true);
    expect(isAdmittedOverrideValue('animateEntrance', 'yes')).toBe(false);
  });

  it('reads a code-owned vertical\'s authored decisions and the artifact density', () => {
    const decided = resolveTenantDecidedChannels(
      getKnownTenantConfig('bithire')!,
      { density: 'compact' },
    );

    expect(decided.has('accent.badgeShape')).toBe(true);
    expect(decided.has('card.paddingDensity')).toBe(true);

    expect(adjudicateInstanceOverrides({ badgeShape: 'pill', density: 'spacious' }, decided))
      .toEqual([
        { field: 'density', value: 'spacious', admitted: false, refusedBecause: 'tenant-decided' },
        { field: 'badgeShape', value: 'pill', admitted: false, refusedBecause: 'tenant-decided' },
      ]);
  });

  it('decides nothing for a tenant that authored nothing', () => {
    // The EFFECTIVE personality of any tenant is fully populated, so authorship
    // cannot be read from it. A config that is not code-owned and whose
    // artifact compiled no density posture has decided no channel at all.
    expect([...resolveTenantDecidedChannels(BASE_TENANT)]).toEqual([]);
    expect([...resolveTenantDecidedChannels(undefined)]).toEqual([]);
  });
});
