import React from 'react';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { TenantAppearance, TenantConfig } from '@/foundation/contracts';
import type { TenantThemeArtifact } from '@/foundation/contracts/composition/tenants/themes/tenant-theme';
import {
  compileTenantThemeConfig,
  getTenantThemeVerticalEnvelope,
  hydrateTenantThemeConfig,
} from '@/infrastructure/compilers/composition/tenant-theme';
import { useTenantContext } from '@/infrastructure/runtime/tenant/composition/react/provider';
import {
  TENANT_THEME_ARTIFACT_DIGEST_ATTRIBUTE,
  TENANT_THEME_ARTIFACT_SLUG_ATTRIBUTE,
  TENANT_THEME_ARTIFACT_VERTICAL_ATTRIBUTE,
  resetVisualAuthorityDiagnostics,
} from '@/infrastructure/runtime/theming';
import { DesignSystemProvider } from '..';

const ARTIFACT = compileTenantThemeConfig(
  hydrateTenantThemeConfig({
    schemaVersion: 1,
    mode: 'simple',
    appearance: {
      palette: { primary: '#2F6B9A', backgroundMode: 'dark' },
      density: 'compact',
      motion: { intensity: 0.4, durationScale: 0.9, ambient: 'off' },
    },
  }, {
    tenantId: 'tenant_themanagement',
    slug: 'themanagement',
    verticalKey: 'bithire',
    rowVersion: 7,
  }),
  { verticalEnvelope: getTenantThemeVerticalEnvelope('bithire') },
);

function mountArtifact(artifact: TenantThemeArtifact = ARTIFACT): HTMLStyleElement {
  const style = document.createElement('style');
  style.id = 'test-tenant-theme-artifact';
  style.setAttribute(TENANT_THEME_ARTIFACT_DIGEST_ATTRIBUTE, artifact.digest);
  style.setAttribute(TENANT_THEME_ARTIFACT_SLUG_ATTRIBUTE, artifact.slug);
  style.setAttribute(TENANT_THEME_ARTIFACT_VERTICAL_ATTRIBUTE, artifact.verticalKey);
  style.textContent = artifact.css;
  document.head.appendChild(style);
  return style;
}

function tenantConfig(overrides: Partial<TenantConfig> = {}): TenantConfig {
  return {
    slug: ARTIFACT.slug,
    name: 'The Management',
    vertical: ARTIFACT.verticalKey,
    theme: 'dark',
    locale: 'en',
    plan: 'enterprise',
    features: ['feature-a'],
    branding: {
      companyName: 'The Management',
      logo: '/logo.svg',
      logoMark: '/mark.svg',
      favicon: '/favicon.ico',
    },
    appearance: ARTIFACT.normalizedAppearance as TenantAppearance,
    ...overrides,
  } as TenantConfig;
}

function ConfigProbe(): React.ReactElement {
  const { config } = useTenantContext();
  return <output data-testid="resolved-config">{JSON.stringify(config)}</output>;
}

function renderProvider(
  config: TenantConfig,
  artifact: TenantThemeArtifact = ARTIFACT,
) {
  return render(
    <DesignSystemProvider
      tenantConfig={config}
      vertical="bithire"
      forceEngine="modern"
      visualAuthority={{ authority: 'compiled-artifact', artifact }}
    >
      <ConfigProbe />
    </DesignSystemProvider>,
  );
}

describe('DesignSystemProvider visual authority barrier', () => {
  beforeEach(() => {
    resetVisualAuthorityDiagnostics();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Unmount BEFORE tearing the artifact out of the document. Vitest runs
    // afterEach in reverse registration order, so this hook would otherwise
    // remove the mounted element while a live provider is still holding a
    // retained proof of it -- which correctly revokes, from a teardown.
    cleanup();
    vi.restoreAllMocks();
    resetVisualAuthorityDiagnostics();
    document.getElementById('test-tenant-theme-artifact')?.remove();
    const root = document.documentElement;
    root.removeAttribute('data-tenant');
    root.removeAttribute('data-theme');
    root.removeAttribute('data-engine');
    root.removeAttribute('data-density');
    root.removeAttribute('data-vertical');
    root.classList.remove('dark');
    root.style.cssText = '';
  });

  it('boots the exact code-owned Rottay default without a provider painter or artifact declaration', async () => {
    render(
      <DesignSystemProvider>
        <ConfigProbe />
      </DesignSystemProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('resolved-config')).toBeTruthy());
    const resolved = JSON.parse(screen.getByTestId('resolved-config').textContent ?? '{}') as TenantConfig;
    // No `engine` key on the config, by the registry's own rule: `resolveEngine`
    // reads the vertical preset before the tenant, and every first-party preset
    // declares `modern`, so a tenant `engine` would be a second authority over a
    // decision the vertical already owns. The engine is asserted where it is
    // decided instead -- on the root the provider stamps.
    expect(resolved).toMatchObject({
      slug: 'rottay',
      vertical: 'rottay',
      branding: { companyName: 'Rottay' },
    });
    expect(resolved).not.toHaveProperty('engine');
    expect(document.documentElement).toHaveAttribute('data-engine', 'modern');
    expect(resolved).not.toHaveProperty('brandTheme');
    expect(resolved).not.toHaveProperty('personality');
    expect(resolved).not.toHaveProperty('tokenOverrides');
    expect(document.documentElement.getAttribute('data-tenant')).toBe('rottay');
    expect(document.querySelector('style[data-tenant-css]')).toBeNull();
  });

  it('admits a verified mounted artifact and exposes one sanitized runtime config', () => {
    mountArtifact();
    renderProvider(tenantConfig());

    const resolved = JSON.parse(screen.getByTestId('resolved-config').textContent ?? '{}') as TenantConfig;
    expect(resolved.slug).toBe(ARTIFACT.slug);
    expect(resolved.features).toEqual(['feature-a']);
    expect(resolved.locale).toBe('en');
    expect(resolved.branding).toEqual({
      companyName: 'The Management',
      logo: '/logo.svg',
      logoMark: '/mark.svg',
      favicon: '/favicon.ico',
    });
    expect(resolved.appearance).toEqual(ARTIFACT.normalizedAppearance);
    expect(resolved).not.toHaveProperty('tokenOverrides');
    expect(resolved).not.toHaveProperty('personality');
    expect(resolved).not.toHaveProperty('brandTheme');
    expect(document.querySelector('link[id^="tenant-theme-"]')).toBeNull();
    expect(document.getElementById('rottay-emergency-tokens')).toBeNull();
  });

  it('blocks children before downstream providers when the artifact is not mounted', () => {
    renderProvider(tenantConfig());
    expect(screen.queryByTestId('resolved-config')).toBeNull();
    expect(document.documentElement.hasAttribute('data-tenant')).toBe(false);
  });

  it('blocks a tampered artifact even when its claimed element is mounted', () => {
    const tampered = { ...ARTIFACT, css: `${ARTIFACT.css}\n/* tampered */` };
    mountArtifact(tampered);
    renderProvider(tenantConfig(), tampered);
    expect(screen.queryByTestId('resolved-config')).toBeNull();
    expect(document.documentElement.hasAttribute('data-tenant')).toBe(false);
  });

  it('blocks uncompiled visual payload instead of rendering children under a baseline', () => {
    render(
      <DesignSystemProvider
        tenantConfig={tenantConfig({
          appearance: undefined,
          branding: { companyName: 'The Management', primaryColor: '#B3001B' },
        })}
        vertical="bithire"
        forceEngine="modern"
      >
        <ConfigProbe />
      </DesignSystemProvider>,
    );
    expect(screen.queryByTestId('resolved-config')).toBeNull();
    expect(document.documentElement.hasAttribute('data-tenant')).toBe(false);
  });

  it('blocks a raw appearance that differs from the compiled artifact', () => {
    mountArtifact();
    renderProvider(tenantConfig({
      appearance: {
        ...(ARTIFACT.normalizedAppearance as TenantAppearance),
        general: {
          ...ARTIFACT.normalizedAppearance.general,
          density: 'spacious',
        },
      },
    }));
    expect(screen.queryByTestId('resolved-config')).toBeNull();
  });
});

/**
 * Admission is one observation; the tree then renders for the life of the app.
 * These drills act AFTER children are on screen, which is the whole point: the
 * barrier must close again, not merely have been closed once.
 *
 * The declaration is a stable module constant here, as a real application's
 * would be. An inline object literal is a new prop on every render, which
 * re-runs the resolver -- so a removal or a byte rewrite would be caught by
 * re-admission and these drills would pass without any retention at all.
 */
const STABLE_DECLARATION = {
  authority: 'compiled-artifact',
  artifact: ARTIFACT,
} as const;

function renderRetained(config: TenantConfig = tenantConfig()) {
  return render(
    <DesignSystemProvider
      tenantConfig={config}
      vertical="bithire"
      forceEngine="modern"
      visualAuthority={STABLE_DECLARATION}
    >
      <ConfigProbe />
    </DesignSystemProvider>,
  );
}

describe('DesignSystemProvider retained mount proof', () => {
  beforeEach(() => {
    resetVisualAuthorityDiagnostics();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    resetVisualAuthorityDiagnostics();
    document.querySelectorAll('#test-tenant-theme-artifact').forEach((node) => node.remove());
    const root = document.documentElement;
    root.removeAttribute('data-tenant');
    root.removeAttribute('data-theme');
    root.removeAttribute('data-engine');
    root.removeAttribute('data-density');
    root.removeAttribute('data-vertical');
    root.classList.remove('dark');
    root.style.cssText = '';
  });

  it('keeps children mounted while the admitted artifact is untouched', async () => {
    mountArtifact();
    renderRetained();
    expect(screen.getByTestId('resolved-config')).toBeTruthy();

    await act(async () => {
      document.head.appendChild(document.createElement('style'));
      document.body.appendChild(document.createElement('div'));
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(screen.queryByTestId('resolved-config')).not.toBeNull();
    expect(document.documentElement.getAttribute('data-tenant')).toBe(ARTIFACT.slug);
  });

  it.each([
    ['removal', (style: HTMLStyleElement) => style.remove()],
    ['byte rewrite', (style: HTMLStyleElement) => {
      style.textContent = `${ARTIFACT.css}\n:root{--ds-color-primary:#ff0000}\n`;
    }],
    ['scope relabel', (style: HTMLStyleElement) => {
      style.setAttribute(TENANT_THEME_ARTIFACT_DIGEST_ATTRIBUTE, `sha256-${'0'.repeat(64)}`);
    }],
    ['duplicate scope', () => {
      mountArtifact({ ...ARTIFACT, digest: `sha256-${'0'.repeat(64)}` });
    }],
    ['takeover by a byte-identical node', (style: HTMLStyleElement) => {
      style.remove();
      mountArtifact();
    }],
  ] as const)('revokes and blocks children on client %s after admission', async (_label, tamper) => {
    const style = mountArtifact();
    renderRetained();
    expect(screen.getByTestId('resolved-config')).toBeTruthy();

    tamper(style);

    await waitFor(() => expect(screen.queryByTestId('resolved-config')).toBeNull());
    expect(document.documentElement.hasAttribute('data-tenant')).toBe(false);
  });

  it('reports the revocation as a visual authority conflict', async () => {
    const reported: unknown[] = [];
    vi.spyOn(console, 'error').mockImplementation((...args) => { reported.push(args[0]); });
    const style = mountArtifact();
    renderRetained();
    style.remove();

    await waitFor(() => expect(screen.queryByTestId('resolved-config')).toBeNull());
    expect(reported.some((message) =>
      typeof message === 'string' &&
      message.includes(`Tenant "${ARTIFACT.slug}"`) &&
      message.includes('revoked'),
    )).toBe(true);
  });

  /**
   * A re-declaration is not a re-proof of the thing that failed.
   *
   * This drill used to assert the opposite -- that a fresh declaration
   * re-admits, on the reasoning that a new declaration is a new complete
   * proof. It is not. Re-admission re-runs exactly the observation a takeover
   * already satisfies: one byte-exact element carrying the right scope
   * attributes. The evidence that separates the admitted element from an
   * identical impostor is node identity, and once that is broken no later
   * observation restores it. So the verdict outlives the admission, and the
   * way back is a recompiled artifact, which is admitted on its own digest.
   * The full treatment is in retained-artifact-gate.integration.test.tsx.
   */
  it('stays revoked under a fresh declaration once the artifact has been removed', async () => {
    const style = mountArtifact();
    const view = renderRetained();
    style.remove();
    await waitFor(() => expect(screen.queryByTestId('resolved-config')).toBeNull());

    await act(async () => { mountArtifact(); });
    view.rerender(
      <DesignSystemProvider
        tenantConfig={tenantConfig()}
        vertical="bithire"
        forceEngine="modern"
        visualAuthority={{ authority: 'compiled-artifact', artifact: { ...ARTIFACT } }}
      >
        <ConfigProbe />
      </DesignSystemProvider>,
    );
    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 0)); });

    expect(screen.queryByTestId('resolved-config')).toBeNull();
    expect(document.documentElement.hasAttribute('data-tenant')).toBe(false);
  });
});
