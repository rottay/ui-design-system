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
import { EVNTO_CANONICAL_SURFACES } from '@/foundation/presets/policy/experience-baselines/evnto';
import { resolveEffectiveDensityScale } from '@/foundation/tokens/ts/foundation/base/density';
import {
  compileTenantThemeConfig,
  getTenantThemeVerticalEnvelope,
  hydrateTenantThemeConfig,
} from '@/infrastructure/compilers/composition/tenant-theme';
import {
  censusRuntimeVisualPayload,
  emitTenantThemeArtifactForSsr,
} from '@/infrastructure/runtime/theming/foundation/visual-authority';

/**
 * Identity only. Every visual field this fixture used to carry is now either
 * refused outright or stripped before `useTokens` runs.
 */
function tokenTestTenant(slug: string): TenantConfig {
  return {
    slug,
    name: 'Token Test',
    engine: 'classic',
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

function DensitySpacing({ testId }: { testId: string }): React.ReactElement {
  const tokens = useTokens();
  return <span data-testid={testId}>{tokens.spacing[4]}</span>;
}

describe('useTokens product profile resolution', () => {
  it('layers engine defaults, product profile, and the compiled artifact in that order', () => {
    const artifact = tokenTestArtifact('token-test', 'compact');
    mountArtifact(artifact);

    render(
      <DesignSystemProvider
        tenantConfig={tokenTestTenant('token-test')}
        visualAuthority={{ authority: 'compiled-artifact', artifact }}
        productProfile="events.organizer"
        forceEngine="classic"
        skipCssLoading
      >
        <TokenConsumer />
      </DesignSystemProvider>
    );

    // Product-profile structural layer, intact and concrete.
    expect(screen.getByTestId('radius-md'))
      .toHaveTextContent(EVNTO_CANONICAL_SURFACES.borderRadius.md);

    // Product-profile personality survives; the tenant's own `personality` no
    // longer exists as a runtime layer at all.
    expect(screen.getByTestId('card-density')).toHaveTextContent('spacious');

    // The one tenant-authored value that legitimately reaches JS tokens: the
    // artifact's density, composed over the profile's structural scale.
    const expectedScale = resolveEffectiveDensityScale(
      EVNTO_CANONICAL_SURFACES.densityScale,
      'compact',
    );
    expect(screen.getByTestId('spacing-1'))
      .toHaveTextContent(String(Math.round(4 * expectedScale)));

    // And the one that deliberately does NOT. The tenant's palette rides the
    // compiled CSS artifact; a JS token echoing it would be the second painter
    // this whole seam exists to prevent.
    expect(screen.getByTestId('primary-color')).not.toHaveTextContent('#991b1b');
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
    // Two slugs, because two artifacts cannot share one tenant scope.
    const normalArtifact = tokenTestArtifact('token-test-normal', 'normal');
    const compactArtifact = tokenTestArtifact('token-test-compact', 'compact');
    mountArtifact(normalArtifact);
    mountArtifact(compactArtifact);

    render(
      <>
        <DesignSystemProvider
          tenantConfig={tokenTestTenant('token-test-normal')}
          visualAuthority={{ authority: 'compiled-artifact', artifact: normalArtifact }}
          productProfile="events.organizer"
          forceEngine="classic"
          skipCssLoading
        >
          <DensitySpacing testId="normal-density-spacing" />
        </DesignSystemProvider>
        <DesignSystemProvider
          tenantConfig={tokenTestTenant('token-test-compact')}
          visualAuthority={{ authority: 'compiled-artifact', artifact: compactArtifact }}
          productProfile="events.organizer"
          forceEngine="classic"
          skipCssLoading
        >
          <DensitySpacing testId="compact-density-spacing" />
        </DesignSystemProvider>
      </>,
    );

    // spacing[4] = round(16 * effectiveScale). The structural factor comes from
    // the profile; only the mode factor differs between the two trees.
    const base = EVNTO_CANONICAL_SURFACES.densityScale;
    expect(screen.getByTestId('normal-density-spacing')).toHaveTextContent(
      String(Math.round(16 * resolveEffectiveDensityScale(base, 'normal'))),
    );
    expect(screen.getByTestId('compact-density-spacing')).toHaveTextContent(
      String(Math.round(16 * resolveEffectiveDensityScale(base, 'compact'))),
    );
    // The composition must actually move the value, or the assertions above
    // would both pass on a resolver that ignored the appearance entirely.
    expect(screen.getByTestId('compact-density-spacing').textContent)
      .not.toBe(screen.getByTestId('normal-density-spacing').textContent);
  });

  it('DRILL: the old raw-override shape is refused, not silently applied', () => {
    // Verbatim the payload these tests used to assert on. It must not reach
    // `useTokens` -- and the failure mode must be a blocked tree, not a tree
    // that renders with the raw values quietly folded in.
    const rawOverrides = {
      branding: {
        companyName: 'Token Test Override',
        primaryColor: '#991b1b',
        darkPrimaryColor: '#fca5a5',
      },
      tokenOverrides: { borderRadius: { md: '22px' }, densityScale: 1.2 },
      personality: { card: { paddingDensity: 'compact' as const } },
    };

    render(
      <DesignSystemProvider
        tenantConfig={tokenTestTenant('token-test')}
        tenantOverrides={rawOverrides}
        productProfile="events.organizer"
        forceEngine="classic"
        skipCssLoading
      >
        <TokenConsumer />
      </DesignSystemProvider>
    );

    expect(screen.queryByTestId('radius-md')).toBeNull();

    // Named, so a future change that blocks for some unrelated reason cannot
    // keep this drill green: all three raw channels must be what is seen.
    const census = censusRuntimeVisualPayload({
      ...tokenTestTenant('token-test'),
      ...rawOverrides,
    } as TenantConfig);
    expect(census.visualBranding).toBe(true);
    expect(census.tokenOverrides).toBe(true);
    expect(census.personality).toBe(true);
  });
});
