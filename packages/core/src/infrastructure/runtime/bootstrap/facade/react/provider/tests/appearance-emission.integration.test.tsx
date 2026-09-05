/**
 * Provider-level behavioral test for TenantAppearance.
 *
 * WHAT THIS DEFENDS, AND WHAT CHANGED.
 *
 * The property has always been "an authored appearance field reaches the
 * pixels". What used to carry it was `DesignSystemProvider` compiling the
 * appearance and `ThemeProvider` stamping the result inline on `<html>`, so
 * these cases read `document.documentElement.style`.
 *
 * That carrier is gone. The provider compiles nothing and writes no visual
 * variable; a tenant's appearance is compiled once, into an artifact, and the
 * artifact is the only style owner. So each case below now asserts BOTH
 * halves of the current law on the SAME artifact the tree renders:
 *   - the channel IS produced, by `compileTenantThemeConfig`, into the artifact
 *   - the provider does NOT also stamp it inline
 * Asserting only the first would let a second emitter come back unnoticed;
 * asserting only the second would pass for an appearance that reaches
 * nothing at all.
 *
 * The provider's non-visual responsibilities — tenant context, `data-theme`
 * from `backgroundMode` — are unchanged and still asserted through the DOM.
 */

import React from 'react';
import { render, act, cleanup, screen } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import { DesignSystemProvider } from '@/infrastructure/runtime/bootstrap';
import type { TenantConfig } from '@/foundation/contracts';
import type { TenantAppearance } from '@/foundation/contracts/composition/tenants/themes';
import type { TenantThemeArtifact } from '@/foundation/contracts/composition/tenants/themes/tenant-theme';
import {
  compileTenantThemeConfig,
  getTenantThemeVerticalEnvelope,
  hydrateTenantThemeConfig,
} from '@/infrastructure/compilers/composition/tenant-theme';
import { emitTenantThemeArtifactForSsr } from '@/infrastructure/runtime/theming/foundation/visual-authority';

/**
 * A genuinely admitted tenant: one compiled artifact, carrying a real payload
 * (palette seed, dark background mode, compact density), mounted exactly as a
 * request ships it.
 *
 * WHY THIS EXISTS. Every "the provider does not restate it" case below asserts
 * an ABSENCE on the root style. An absence is satisfied for free by a provider
 * that renders nothing at all — and that is precisely what a raw `appearance`
 * on the config now produces, because the authority barrier refuses runtime
 * visual payload with no artifact behind it. Handing those cases a raw
 * appearance would leave four green tests proving nothing. They render this
 * admitted tenant instead, and `renderAdmitted` asserts the tree actually
 * mounted before reading the style.
 */
function admittedArtifact(): TenantThemeArtifact {
  return compileTenantThemeConfig(
    hydrateTenantThemeConfig(
      {
        schemaVersion: 1,
        mode: 'simple',
        appearance: {
          palette: {
            primary: '#FF5500',
            backgroundMode: 'dark',
            status: { success: '#00FF00' },
          },
          density: 'compact',
          shape: { buttonStyle: 'pill' },
          navigation: { sidebarTone: 'inverse' },
        },
      },
      {
        tenantId: 'tenant_test_appearance',
        slug: 'test-appearance',
        verticalKey: 'bithire',
        rowVersion: 1,
      },
    ),
    { verticalEnvelope: getTenantThemeVerticalEnvelope('bithire') },
  );
}

/**
 * The plane that owns a channel for THIS tenant. It declares
 * `backgroundMode: 'dark'`, so its palette compiles into the artifact's own
 * dark mode delta while mode-blind geometry and chrome stay on the flat map.
 * Naming the plane is the point: reading both and taking whichever answers
 * would let a palette channel silently move planes without failing.
 */
function darkPlaneChannel(name: string): string | undefined {
  return admittedArtifact().modeDeltas?.find((delta) => delta.mode === 'dark')
    ?.variables[name];
}

const mountedArtifacts: HTMLStyleElement[] = [];

function mountArtifact(artifact: TenantThemeArtifact): void {
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
}

/**
 * Render an admitted tenant and report what the root style holds. Every visual
 * channel must come back empty: that is the whole point of the provider having
 * no emitters — proven here against a provider that definitely rendered.
 */
async function renderAdmitted(
  overrides: Partial<TenantConfig> = {},
): Promise<CSSStyleDeclaration> {
  const artifact = admittedArtifact();
  mountArtifact(artifact);
  await act(async () => {
    render(
      <DesignSystemProvider
        tenantConfig={makeConfig({ vertical: 'bithire', ...overrides })}
        visualAuthority={{ authority: 'compiled-artifact', artifact }}
      >
        <div data-testid="child">hello</div>
      </DesignSystemProvider>,
    );
  });
  // The guard that makes every absence below load-bearing.
  expect(screen.getByTestId('child')).toBeTruthy();
  return document.documentElement.style;
}

/**
 * Render a tenant whose visual payload has NO artifact behind it. Used only by
 * the fail-closed case, which wants exactly this outcome.
 */
async function renderUnbacked(
  appearance: TenantAppearance,
): Promise<CSSStyleDeclaration> {
  await act(async () => {
    render(
      <DesignSystemProvider tenantConfig={makeConfig({ appearance })}>
        <div data-testid="child">hello</div>
      </DesignSystemProvider>,
    );
  });
  return document.documentElement.style;
}

function makeConfig(overrides: Partial<TenantConfig>): TenantConfig {
  return {
    slug: 'test-appearance',
    name: 'Test Appearance',
    engine: 'classic',
    theme: 'base', // default — backgroundMode should be able to win
    plan: 'enterprise',
    features: [],
    branding: { companyName: 'Test' },
    ...overrides,
  } as TenantConfig;
}


afterEach(() => {
  // Unmount before the artifact leaves the document: retention watches the
  // mounted element and revoking under a live provider is a state update on an
  // unmounting tree.
  cleanup();
  while (mountedArtifacts.length > 0) mountedArtifacts.pop()?.remove();
  // Clean up DOM attributes set by providers
  const root = document.documentElement;
  root.removeAttribute('data-tenant');
  root.removeAttribute('data-theme');
  root.removeAttribute('data-engine');
  root.classList.remove('dark');
  root.style.cssText = '';
});

describe('TenantAppearance via DesignSystemProvider', () => {
  it('appearance.palette.primary compiles --ds-color-primary, and the provider does not restate it', async () => {
    expect(darkPlaneChannel('--ds-color-primary')).toBe('#FF5500');

    const rootStyle = await renderAdmitted();
    expect(rootStyle.getPropertyValue('--ds-color-primary')).toBe('');
  });

  it('appearance.general.palette.backgroundMode=dark sets data-theme=dark when tenant.theme is base', async () => {
    // The mode arrives on the artifact's own normalized appearance, which is
    // the only channel the provider reads it from now. Asserting it through a
    // raw config field would assert a shape the barrier refuses.
    const artifact = admittedArtifact();
    expect(artifact.normalizedAppearance.general?.palette?.backgroundMode).toBe('dark');

    await renderAdmitted({ theme: 'base' }); // default, should NOT block backgroundMode

    const root = document.documentElement;
    expect(root.getAttribute('data-theme')).toBe('dark');
  });

  it('explicit tenant.theme=light wins over appearance.backgroundMode=dark', async () => {
    await renderAdmitted({ theme: 'light' }); // explicit — should win

    const root = document.documentElement;
    expect(root.getAttribute('data-theme')).toBe('light');
  });

  it('appearance.shape.buttonStyle=pill compiles --ds-radius-button, and the provider does not restate it', async () => {
    // The pill silhouette reaches the channel as its own product with the
    // radius dial, so a tenant scale still moves it; the authored 9999px is
    // divided by the dial the compiled block declares.
    expect(admittedArtifact().variables['--ds-radius-button']).toBe(
      'calc(9999px / 1.25 * var(--ds-radius-scale, 1))',
    );

    const rootStyle = await renderAdmitted();
    expect(rootStyle.getPropertyValue('--ds-radius-button')).toBe('');
  });

  it('appearance.navigation.sidebarTone=inverse compiles sidebar vars, and the provider does not restate them', async () => {
    expect(admittedArtifact().variables['--ds-sidebar-bg']).toBe(
      'var(--ds-color-neutral-900)',
    );

    const rootStyle = await renderAdmitted();
    expect(rootStyle.getPropertyValue('--ds-sidebar-bg')).toBe('');
  });

  it('an authored status tone compiles through, and the provider does not restate it', async () => {
    expect(darkPlaneChannel('--ds-color-success')).toBe('#00FF00');

    const rootStyle = await renderAdmitted();
    expect(rootStyle.getPropertyValue('--ds-color-success')).toBe('');
  });

  it('a tenant carrying appearance with no compiled artifact paints nothing at all', async () => {
    // The fail-closed half of the law, stated on the DOM. This tenant has a
    // real visual payload and no artifact, so there is no producer for it:
    // the honest outcome is an unpainted root, not the DS baseline wearing
    // the tenant's slug. Every channel the payload names stays empty.
    const rootStyle = await renderUnbacked({
      general: { palette: { primary: '#FF5500' } },
      advanced: { tokenOverrides: { '--ds-color-success': '#00FF00' } },
    });

    expect(rootStyle.getPropertyValue('--ds-color-primary')).toBe('');
    expect(rootStyle.getPropertyValue('--ds-color-success')).toBe('');
    expect(rootStyle.getPropertyValue('--ds-color-primary-500')).toBe('');

    // And it is refused, not merely unpainted by coincidence: the barrier
    // blocks the whole tree, which is why the four cases above cannot use this
    // shape to prove the provider stamps nothing.
    expect(screen.queryByTestId('child')).toBeNull();
    expect(document.documentElement.getAttribute('data-theme')).toBeNull();
  });

});
