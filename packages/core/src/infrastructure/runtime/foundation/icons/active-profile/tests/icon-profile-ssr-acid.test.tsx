/**
 * C2c icon-seam acid: the profile must survive SSR markup generation,
 * hydration, NESTED providers with different tenants (preview-in-shell),
 * sibling isolation, and repeated renders with alternating tenants (the
 * drill that kills any module-state design). The RSC box branch is
 * build-verified (react-server has no createContext; showroom prerender);
 * every client/SSR-world law is behaviorally pinned here.
 */
import React from 'react';
import { readFileSync } from 'node:fs';
import { resolve as resolvePath } from 'node:path';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { TenantConfig } from '@/foundation/contracts/composition/tenants';
import { bithireBrandTheme } from '@/foundation/tokens/ts/presentation/brand-themes/bithire';
import { DesignSystemProvider } from '@/infrastructure/runtime/bootstrap/facade/react/provider';
import { NavigationSettingsIcon } from '@/graphics/icons/presentation/semantic/generated/roles/navigation-settings';
import {
  provideServerIconExpressiveProfile,
  resolveActiveIconExpressiveProfile,
} from '..';

function tenantConfig(overrides: Partial<TenantConfig>): TenantConfig {
  return {
    slug: 'ssr-acid-tenant',
    name: 'SSR acid tenant',
    theme: 'base',
    plan: 'enterprise',
    features: [],
    branding: { companyName: 'SSR acid tenant' },
    ...overrides,
  };
}

const DUOTONE_TENANT = tenantConfig({
  slug: 'tenant-duotone',
  brandTheme: {
    ...bithireBrandTheme,
    expressive: {
      experienceProfile: 'rottay/management-editorial@1',
      profiles: { icon: 'duotone' },
    },
  } as TenantConfig['brandTheme'],
});

// Plain bithire: technical posture, no icon axis — baseline weights.
const BASELINE_TENANT = tenantConfig({
  slug: 'tenant-baseline',
  brandTheme: bithireBrandTheme as TenantConfig['brandTheme'],
});

function NestedTree() {
  return (
    <DesignSystemProvider tenantConfig={DUOTONE_TENANT} skipCssLoading>
      <NavigationSettingsIcon decorative data-testid="outer-a" />
      <DesignSystemProvider tenantConfig={BASELINE_TENANT} skipCssLoading>
        <NavigationSettingsIcon decorative data-testid="inner-b" />
      </DesignSystemProvider>
      <NavigationSettingsIcon decorative data-testid="sibling-a" />
    </DesignSystemProvider>
  );
}

function weightsFromHtml(html: string): Record<string, string | null> {
  const host = document.createElement('div');
  host.innerHTML = html;
  const read = (id: string) =>
    host
      .querySelector(`[data-testid="${id}"]`)
      ?.getAttribute('data-icon-weight') ?? null;
  return { outerA: read('outer-a'), innerB: read('inner-b'), siblingA: read('sibling-a') };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('icon profile seam — SSR markup', () => {
  it('nests provider B inside provider A: inner reads B, outer AND the sibling after the nested subtree read A', () => {
    const weights = weightsFromHtml(renderToString(<NestedTree />));
    expect(weights.outerA).toBe('duotone');
    expect(weights.innerB).toBe('regular');
    // The sibling renders AFTER the nested provider closed — with any
    // module-state design it would inherit B; with the context it reads A.
    expect(weights.siblingA).toBe('duotone');
  });

  it('drill: alternating tenant renders never bleed into each other', () => {
    const renderFor = (config: TenantConfig) =>
      weightsFromHtml(
        renderToString(
          <DesignSystemProvider tenantConfig={config} skipCssLoading>
            <NavigationSettingsIcon decorative data-testid="outer-a" />
          </DesignSystemProvider>
        )
      ).outerA;
    expect(renderFor(DUOTONE_TENANT)).toBe('duotone');
    expect(renderFor(BASELINE_TENANT)).toBe('regular');
    expect(renderFor(DUOTONE_TENANT)).toBe('duotone');
  });
});

describe('icon profile seam — hydration', () => {
  it('hydrates the nested-provider markup without a hydration mismatch', async () => {
    const html = renderToString(<NestedTree />);
    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.appendChild(container);

    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const root = hydrateRoot(container, <NestedTree />);
    await new Promise((resolve) => setTimeout(resolve, 0));

    const hydrationComplaints = consoleError.mock.calls.filter((call) =>
      call.some(
        (argument) =>
          typeof argument === 'string' &&
          /hydrat|did not match|server rendered/i.test(argument)
      )
    );
    expect(hydrationComplaints).toEqual([]);
    expect(
      container
        .querySelector('[data-testid="inner-b"]')
        ?.getAttribute('data-icon-weight')
    ).toBe('regular');
    root.unmount();
    container.remove();
  });
});

describe('server seam — RSC contract and its harness limit', () => {
  /**
   * HARNESS LIMITATION, stated honestly: vitest/jsdom runs the DEFAULT
   * React build, where `React.cache` is a documented passthrough — the
   * react-server flavor (where cache memoizes per request and
   * createContext does not exist) cannot execute here. What this suite
   * therefore proves about the RSC branch:
   *   1. the module's world detection routes AWAY from context exactly
   *      when createContext is absent (structural pin below);
   *   2. providing in a non-RSC server world NEVER leaks into a render —
   *      the passthrough box means absence, and absence reproduces the
   *      pre-profile baseline weights EXACTLY (fail-open law, behavioral);
   *   3. two sequential simulated requests with different profiles cannot
   *      contaminate each other in this world (behavioral).
   * The per-request isolation of the REAL react-server cache is React's
   * documented contract, exercised end-to-end by the showroom RSC
   * prerender and app-bithire's layout integration (both build-verified);
   * the two-concurrent-requests browser proof is delegated to Codex.
   */
  it('fail-open: providing outside a provider tree changes nothing — baseline weights exactly', () => {
    provideServerIconExpressiveProfile('duotone');
    const first = weightsFromHtml(
      renderToString(<NavigationSettingsIcon decorative data-testid="outer-a" />)
    ).outerA;
    provideServerIconExpressiveProfile(undefined);
    const second = weightsFromHtml(
      renderToString(<NavigationSettingsIcon decorative data-testid="outer-a" />)
    ).outerA;
    // Absent profile → the pre-profile role/state tables, identical runs.
    expect(first).toBe('regular');
    expect(second).toBe('regular');
  });

  it('drill: sequential simulated requests with different provided profiles never bleed', () => {
    provideServerIconExpressiveProfile('duotone');
    const requestA = weightsFromHtml(
      renderToString(
        <DesignSystemProvider tenantConfig={BASELINE_TENANT} skipCssLoading>
          <NavigationSettingsIcon decorative data-testid="outer-a" />
        </DesignSystemProvider>
      )
    ).outerA;
    provideServerIconExpressiveProfile('solid-active');
    const requestB = weightsFromHtml(
      renderToString(
        <DesignSystemProvider tenantConfig={BASELINE_TENANT} skipCssLoading>
          <NavigationSettingsIcon decorative data-testid="outer-a" />
        </DesignSystemProvider>
      )
    ).outerA;
    // In client/SSR worlds the CONTEXT is the only authority — a provide
    // call can never override what the tree declares.
    expect(requestA).toBe('regular');
    expect(requestB).toBe('regular');
  });

  it('structural pin: the seam branches on capability, not environment guessing', () => {
    const source = readFileSync(
      resolvePath(
        process.cwd(),
        'src/infrastructure/runtime/foundation/icons/active-profile/index.ts'
      ),
      'utf8'
    );
    expect(source).toContain('cache((');
    expect(source).toContain('maybeCreateContext');
    expect(source).not.toContain('let clientProfile');
  });
});

describe('shared derivation (provider client value === server seam value)', () => {
  it('resolves the same posture the provider context carries, for both config shapes', () => {
    expect(resolveActiveIconExpressiveProfile(DUOTONE_TENANT)).toBe('duotone');
    expect(resolveActiveIconExpressiveProfile(BASELINE_TENANT)).toBeUndefined();
    expect(resolveActiveIconExpressiveProfile(undefined)).toBeUndefined();
    // DB appearance beats static brandTheme — the canon precedence.
    expect(
      resolveActiveIconExpressiveProfile({
        appearance: {
          general: { experienceProfile: 'rottay/management-editorial@1' },
          advanced: { profiles: { icon: 'solid-active' } },
        },
        brandTheme: DUOTONE_TENANT.brandTheme,
      })
    ).toBe('solid-active');
  });
});
