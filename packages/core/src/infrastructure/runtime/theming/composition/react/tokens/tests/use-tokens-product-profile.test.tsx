/**
 * Token layer precedence, expressed in the shape the runtime actually accepts.
 *
 * WHAT CHANGED AND WHY. These cases used to hand `DesignSystemProvider` a
 * tenant carrying raw brand colours, raw `tokenOverrides` and raw
 * `personality`, and then assert those values landed in `useTokens`. That is
 * the two-painter shape: runtime visual payload with no verified mounted
 * artifact behind it. The authority barrier now refuses it and the provider
 * renders nothing, so the old assertions could only ever have been repaired by
 * weakening the barrier.
 *
 * They are re-expressed against the layers that survive:
 *
 *   engine defaults -> vertical -> product profile -> compiled artifact
 *
 * The tenant's own colours, radii and personality reach the page through the
 * compiled CSS artifact, not through JS tokens — `buildResolvedRuntimeConfig`
 * strips every one of those fields before anything downstream sees the config.
 * The final drill keeps the deleted expectation as a proven refusal rather than
 * dropping it silently.
 */

import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { DesignSystemProvider } from '@/infrastructure/runtime/bootstrap';
import { useTokens } from '..';
import type { TenantConfig } from '@/foundation/contracts';
import type { TenantThemeArtifact } from '@/foundation/contracts/composition/tenants/themes/tenant-theme';
import { getKnownTenantConfig } from '@/infrastructure/runtime/tenant/foundation/configuration/registry';
import { getProductProfile } from '@/infrastructure/runtime/product-profiles';
import { resolveEffectiveDensityScale } from '@/foundation/tokens/ts/foundation/base/density';
import { resolveAdapter } from '@/infrastructure/compilers/runtime/theme/presentation/adapters/facade/registry';
import {
  compileTenantThemeConfig,
  getTenantThemeVerticalEnvelope,
  hydrateTenantThemeConfig,
} from '@/infrastructure/compilers/composition/tenant-theme';
import {
  censusRuntimeVisualPayload,
  emitTenantThemeArtifactForSsr,
} from '@/infrastructure/runtime/theming/foundation/visual-authority';
import { stampTenantThemeScope } from '@/infrastructure/runtime/theming/foundation/visual-authority/tests/mount-fixture';

/**
 * Identity only. Every visual field this fixture used to carry is now either
 * refused outright or stripped before `useTokens` runs.
 */
function tokenTestTenant(slug: string): TenantConfig {
  return {
    slug,
    name: 'Token Test',
    theme: 'light',
    plan: 'enterprise',
    features: ['all'],
    vertical: 'bithire',
    branding: { companyName: 'Token Test' },
  };
}

function tokenTestArtifact(
  slug: string,
  density: 'normal' | 'compact',
): TenantThemeArtifact {
  return compileTenantThemeConfig(
    hydrateTenantThemeConfig(
      {
        schemaVersion: 1,
        mode: 'simple',
        appearance: { palette: { primary: '#991b1b' }, density },
      },
      {
        tenantId: `tenant_${slug}`,
        slug,
        verticalKey: 'bithire',
        rowVersion: 1,
      },
    ),
    { verticalEnvelope: getTenantThemeVerticalEnvelope('bithire') },
  );
}

const mountedArtifacts: HTMLStyleElement[] = [];

/**
 * Mount exactly what the runtime emits. Two artifacts may never share a slug in
 * one document — a second element in the same tenant scope is precisely what
 * the mount proof rejects — so the density pair below uses two slugs.
 */
function mountArtifact(artifact: TenantThemeArtifact): HTMLStyleElement {
  const { attributes, css } = emitTenantThemeArtifactForSsr(artifact, {
    slug: artifact.slug,
    verticalKey: artifact.verticalKey,
  });
  const style = document.createElement('style');
  for (const [name, value] of Object.entries(attributes)) {
    style.setAttribute(name, value);
  }
  style.textContent = css;
  document.head.appendChild(style);
  stampTenantThemeScope(artifact);
  mountedArtifacts.push(style);
  return style;
}

afterEach(() => {
  // Unmount first: retention watches these elements and revokes when one
  // disappears, which would be a state update on a still-mounted provider.
  cleanup();
  while (mountedArtifacts.length > 0) mountedArtifacts.pop()?.remove();
});

function TokenConsumer(): React.ReactElement {
  const tokens = useTokens();

  return (
    <div>
      <span data-testid="radius-md">{tokens.borderRadius.md}</span>
      <span data-testid="spacing-1">{tokens.spacing[1]}</span>
      <span data-testid="primary-color">{tokens.colors.primary}</span>
      <span data-testid="card-density">{tokens.personality.card.paddingDensity}</span>
      <span data-testid="animation-intensity">{tokens.personality.animation.intensity}</span>
    </div>
  );
}

function EvntoAxes({ testId }: { testId: string }): React.ReactElement {
  const tokens = useTokens();
  return (
    <pre data-testid={testId}>{JSON.stringify({
      densitySpacing: tokens.spacing,
      radius: tokens.borderRadius,
      depth: tokens.shadows,
      motion: tokens.personality.animation,
    })}</pre>
  );
}

function SurfaceAxis({ testId }: { testId: string }): React.ReactElement {
  return <pre data-testid={testId}>{JSON.stringify(useTokens().surface)}</pre>;
}

function DensitySpacing({ testId }: { testId: string }): React.ReactElement {
  const tokens = useTokens();
  return <span data-testid={testId}>{tokens.spacing[4]}</span>;
}

describe('useTokens product profile resolution', () => {
  it('layers engine defaults, product profile, and the artifact compile in that order', () => {
    // The artifact publishes the non-CSS half of its own compile, so the
    // tenant's published decision is the TOP JS layer and the preset stands
    // only where that compile is silent. Every expectation below is read off
    // the artifact rather than pinned, so it states the ORDER and not a value.
    const artifact = tokenTestArtifact('token-test', 'compact');
    const compiled = artifact.runtime?.runtime;
    if (!compiled) throw new Error('the compiled artifact published no runtime half');
    mountArtifact(artifact);

    render(
      <DesignSystemProvider
        tenantConfig={tokenTestTenant('token-test')}
        visualAuthority={{ authority: 'compiled-artifact', artifact }}
        productProfile="events.organizer"
        forceEngine="modern"
        skipCssLoading
      >
        <TokenConsumer />
      </DesignSystemProvider>
    );

    // D6-2c-ii (2026-09-15): tenant-document compiles over neutral + preset;
    // the tenant delta over a bithire baseline that authors no radius, no card
    // chrome and no density scale publishes NONE of those in its JS half
    // (measured: tokenOverrides.borderRadius {}, densityScale undefined,
    // personality.card {}). The order is therefore read on the channel this
    // compile does state -- the vertical's motion dial -- while the three it
    // leaves silent prove the other direction, that the preset underneath
    // stands. Both legs are still read off the artifact, never pinned.
    const profile = getProductProfile('events.organizer');

    // The compile states this channel, so it outranks the preset...
    expect(compiled.personality.animation?.intensity).toBeDefined();
    expect(compiled.personality.animation?.intensity)
      .not.toBe(profile?.personality?.animation?.intensity);
    expect(screen.getByTestId('animation-intensity'))
      .toHaveTextContent(String(compiled.personality.animation?.intensity));

    // ...and where it states nothing, the preset underneath it stands.
    expect(compiled.tokenOverrides.borderRadius?.md).toBeUndefined();
    expect(screen.getByTestId('radius-md'))
      .toHaveTextContent(String(profile?.tokenOverrides?.borderRadius?.md));
    expect(compiled.personality.card?.paddingDensity).toBeUndefined();
    expect(screen.getByTestId('card-density'))
      .toHaveTextContent(String(profile?.personality?.card?.paddingDensity));

    // Density composes the structural scale that survives -- the preset's,
    // since the compile publishes none -- with the artifact's own posture.
    expect(compiled.tokenOverrides.densityScale).toBeUndefined();
    const expectedScale = resolveEffectiveDensityScale(
      profile?.tokenOverrides?.densityScale,
      'compact',
    );
    expect(screen.getByTestId('spacing-1'))
      .toHaveTextContent(String(Math.round(4 * expectedScale)));

    // And the one that deliberately does NOT. The tenant's palette rides the
    // compiled CSS artifact; a JS token echoing it would be the second painter
    // this whole seam exists to prevent.
    expect(screen.getByTestId('primary-color')).not.toHaveTextContent('#991b1b');
  });

  it('leaves the preset standing on a channel the compile states nothing about', () => {
    // The other half of "layering rather than switching": a mounted artifact
    // is not a switch that discards everything under it. `surface` is the
    // channel this compile publishes empty, so the engine baseline below it
    // survives intact.
    const artifact = tokenTestArtifact('token-test-surface', 'normal');
    expect(artifact.runtime?.runtime.tokenOverrides.surface).toEqual({});
    mountArtifact(artifact);

    render(
      <DesignSystemProvider
        tenantConfig={tokenTestTenant('token-test-surface')}
        visualAuthority={{ authority: 'compiled-artifact', artifact }}
        productProfile="events.organizer"
        forceEngine="modern"
        skipCssLoading
      >
        <SurfaceAxis testId="surface-under-artifact" />
      </DesignSystemProvider>
    );

    expect(screen.getByTestId('surface-under-artifact').textContent).toBe(
      JSON.stringify(resolveAdapter('modern').tokenBaseline.surface),
    );
  });

  it('resolves identical structural and motion axes for bundled and custom Evnto', () => {
    const bundled = getKnownTenantConfig('evnto');
    if (!bundled) throw new Error('Missing bundled Evnto tenant');
    const custom: TenantConfig = {
      slug: 'custom-evnto',
      name: 'Custom Evnto',
      theme: 'light',
      plan: 'starter',
      features: [],
      vertical: 'evnto',
      branding: { companyName: 'Custom Evnto' },
    };

    render(
      <>
        <DesignSystemProvider tenantConfig={bundled} vertical="evnto" skipCssLoading>
          <EvntoAxes testId="bundled-evnto-axes" />
        </DesignSystemProvider>
        <DesignSystemProvider tenantConfig={custom} vertical="evnto" skipCssLoading>
          <EvntoAxes testId="custom-evnto-axes" />
        </DesignSystemProvider>
      </>,
    );

    expect(screen.getByTestId('custom-evnto-axes').textContent)
      .toBe(screen.getByTestId('bundled-evnto-axes').textContent);
  });

  it('composes the product-profile structural scale with the artifact density factor', () => {
    // ONE DOCUMENT, ONE TENANT SCOPE. Both trees used to render side by side,
    // which no browser can reproduce: `<html>` carries a single `data-tenant`,
    // so at most one of two artifacts is ever in scope. The two postures are
    // therefore measured in two renders of the same document.
    const measure = (slug: string, density: 'normal' | 'compact'): string => {
      const artifact = tokenTestArtifact(slug, density);
      mountArtifact(artifact);
      render(
        <DesignSystemProvider
          tenantConfig={tokenTestTenant(slug)}
          visualAuthority={{ authority: 'compiled-artifact', artifact }}
          productProfile="events.organizer"
          forceEngine="modern"
          skipCssLoading
        >
          <DensitySpacing testId={`${density}-density-spacing`} />
        </DesignSystemProvider>,
      );
      const text = screen.getByTestId(`${density}-density-spacing`).textContent ?? '';
      cleanup();
      return text;
    };

    const normal = measure('token-test-normal', 'normal');
    const compact = measure('token-test-compact', 'compact');

    // spacing[4] = round(16 * effectiveScale).
    // D6-2c-ii (2026-09-15): tenant-document compiles over neutral + preset;
    // the artifact publishes no structural scale of its own any more, so the
    // factor this composes with the mode posture is the PRODUCT PROFILE's --
    // which is what this case is named for. Only the mode factor differs
    // between the two trees, and both numbers are still derived, not pinned.
    expect(
      tokenTestArtifact('token-test-normal', 'normal').runtime?.runtime.tokenOverrides
        .densityScale,
    ).toBeUndefined();
    const base = getProductProfile('events.organizer')?.tokenOverrides?.densityScale;
    expect(normal).toBe(String(Math.round(16 * resolveEffectiveDensityScale(base, 'normal'))));
    expect(compact).toBe(String(Math.round(16 * resolveEffectiveDensityScale(base, 'compact'))));
    // The composition must actually move the value, or the assertions above
    // would both pass on a resolver that ignored the appearance entirely.
    expect(compact).not.toBe(normal);
  });

  it('DRILL: the old raw-override shape is refused, not silently applied', () => {
    // `TenantConfig` has no `tokenOverrides` or `personality` to write; the
    // branding seeds are the one raw channel a transport can hand the runtime,
    // and they must not reach `useTokens` -- the failure mode must be a blocked
    // tree, not a tree that renders with the raw values quietly folded in.
    const rawOverrides = {
      branding: {
        companyName: 'Token Test Override',
        primaryColor: '#991b1b',
        darkPrimaryColor: '#fca5a5',
      },
    };

    render(
      <DesignSystemProvider
        tenantConfig={tokenTestTenant('token-test')}
        tenantOverrides={rawOverrides}
        productProfile="events.organizer"
        forceEngine="modern"
        skipCssLoading
      >
        <TokenConsumer />
      </DesignSystemProvider>
    );

    expect(screen.queryByTestId('radius-md')).toBeNull();

    // Named, so a future change that blocks for some unrelated reason cannot
    // keep this drill green: the raw channel must be what is seen.
    const census = censusRuntimeVisualPayload({
      ...tokenTestTenant('token-test'),
      ...rawOverrides,
    } as TenantConfig);
    expect(census).toEqual({ visualBranding: true });
  });
});
