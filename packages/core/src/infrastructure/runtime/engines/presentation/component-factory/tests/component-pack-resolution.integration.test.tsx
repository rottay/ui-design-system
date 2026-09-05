/**
 * @fileoverview Proves what `TenantConfig.componentPack` is, and what it is
 * not.
 *
 * IS: a selector over the canonical `component-registry`. When the active
 * engine is `custom`, `EngineRouter` resolves each component name against the
 * pack named by the tenant, so two tenants can render different bespoke
 * components in one runtime, and a name with no entry in that pack falls
 * through to the fallback engine.
 *
 * IS NOT: a visual layer. The pack API that once carried `css`,
 * `tokenOverrides` and a `brandTheme` — applying all three to the document
 * through a refcounted seam in this factory — was deleted. Customer styling is
 * compiled on the server and embedded for SSR; the client hydrates that exact
 * artifact under `visualAuthority="compiled-artifact"`, and the provider must
 * not emit a competing visual layer. The non-paint assertions below are the
 * executable form of that rule: registering, activating, switching and
 * unmounting a pack must leave the document's style surface bit-identical.
 *
 * Mounts a real `createEngineComponent` tree (not mocked), so this is an
 * `*.integration.test.tsx` per `vitest.config.ts`'s longer async timeout for
 * lazy-loaded engine code.
 */
import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { createEngineComponent } from '..';
import { EngineProvider } from '../../../composition/react/provider';
import {
  clearCustomRegistry,
  registerCustomComponents,
} from '../../../runtime/customization/component-registry';
import { TenantContext } from '../../../../tenant/composition/react/provider';
import type { TenantConfig } from '../../../../../../foundation/contracts/composition/tenants';

const baseTenantConfig: TenantConfig = {
  slug: 'acme',
  name: 'Acme',
  theme: 'light',
  plan: 'enterprise',
  features: [],
  branding: { companyName: 'Acme' },
};

function FallbackWidget() {
  return <div data-testid="fallback-widget">fallback</div>;
}

function AcmeWidget() {
  return <div data-testid="acme-widget">acme</div>;
}

function GlobexWidget() {
  return <div data-testid="globex-widget">globex</div>;
}

// A minimal engine component, mirroring how real DS components call
// createEngineComponent (classic/modern/rustic loaders; no explicit `custom`
// loader, so it falls back to `loaders.rustic` exactly like most production
// components do today).
// `Record<never, never>`, not `Record<string, never>`: the latter carries an
// index signature that types EVERY key as `never`, which erases the
// `engine?: EngineName` override the factory itself adds and rejects `key`.
const TestWidget = createEngineComponent<Record<never, never>>('TestWidget', {
  classic: async () => ({ default: FallbackWidget }),
  modern: async () => ({ default: FallbackWidget }),
  rustic: async () => ({ default: FallbackWidget }),
});

// A second name, deliberately left unregistered in every pack, to prove that a
// partial pack refuses by name rather than borrowing another engine.
const UnpackedWidget = createEngineComponent<Record<never, never>>('UnpackedWidget', {
  classic: async () => ({ default: FallbackWidget }),
  modern: async () => ({ default: FallbackWidget }),
  rustic: async () => ({ default: FallbackWidget }),
});

function renderWithPack(componentPack: string | undefined, children: React.ReactNode) {
  return (
    <EngineProvider defaultEngine="custom">
      <TenantContext.Provider
        value={{
          config: componentPack ? { ...baseTenantConfig, componentPack } : baseTenantConfig,
          isLoading: false,
        }}
      >
        {children}
      </TenantContext.Provider>
    </EngineProvider>
  );
}

/**
 * A fingerprint of every surface a pack could paint through if it still had
 * visual authority: injected stylesheets, inline custom properties on the
 * document element, and constructed stylesheets. Compared verbatim, so any new
 * paint seam — not just the ones that existed — fails this test.
 */
function styleSurfaceFingerprint(): string {
  const el = document.documentElement;
  const inline = el.getAttribute('style') ?? '';
  const customProps = Array.from({ length: el.style.length }, (_, i) => el.style.item(i))
    .filter((name) => name.startsWith('--'))
    .sort();
  const adopted = (document as unknown as { adoptedStyleSheets?: unknown[] }).adoptedStyleSheets;

  return JSON.stringify({
    headStyleEls: document.head.querySelectorAll('style').length,
    headLinkEls: document.head.querySelectorAll('link[rel="stylesheet"]').length,
    bodyStyleEls: document.body.querySelectorAll('style').length,
    documentElementInlineStyle: inline,
    documentElementCustomProps: customProps,
    adoptedStyleSheets: Array.isArray(adopted) ? adopted.length : 'unsupported',
  });
}

describe('componentPack resolution (custom engine)', () => {
  beforeEach(() => {
    clearCustomRegistry();
    document.documentElement.removeAttribute('style');
  });

  it('resolves the bespoke component registered under the tenant-named pack', async () => {
    registerCustomComponents({ TestWidget: AcmeWidget }, 'acme-pack');

    render(renderWithPack('acme-pack', <TestWidget />));

    expect(await screen.findByTestId('acme-widget')).toBeInTheDocument();
    expect(screen.queryByTestId('fallback-widget')).toBeNull();
  });

  it('switches components when componentPack switches, without cross-contamination', async () => {
    registerCustomComponents({ TestWidget: AcmeWidget }, 'acme-pack');
    registerCustomComponents({ TestWidget: GlobexWidget }, 'globex-pack');

    const { rerender } = render(renderWithPack('acme-pack', <TestWidget />));
    expect(await screen.findByTestId('acme-widget')).toBeInTheDocument();

    rerender(renderWithPack('globex-pack', <TestWidget />));
    await waitFor(() => expect(screen.getByTestId('globex-widget')).toBeInTheDocument());
    expect(screen.queryByTestId('acme-widget')).toBeNull();

    // And back — pack resolution is a pure lookup, so it is reversible.
    rerender(renderWithPack('acme-pack', <TestWidget />));
    await waitFor(() => expect(screen.getByTestId('acme-widget')).toBeInTheDocument());
    expect(screen.queryByTestId('globex-widget')).toBeNull();
  });

  it('refuses a name the pack does not register instead of rendering another engine', async () => {
    registerCustomComponents({ TestWidget: AcmeWidget }, 'acme-pack');

    render(renderWithPack('acme-pack', <UnpackedWidget />));

    const boundary = await screen.findByText(/Engine Error:/);
    expect(boundary).toBeInTheDocument();
    expect(
      await screen.findByText(/No custom implementation registered for "UnpackedWidget"/)
    ).toBeInTheDocument();
    expect(screen.queryByTestId('fallback-widget')).toBeNull();
  });

  it('refuses an engine the component declares no implementation for', async () => {
    const ModernOnlyWidget = createEngineComponent<Record<never, never>>('ModernOnlyWidget', {
      classic: async () => ({ default: FallbackWidget }),
      modern: async () => ({ default: FallbackWidget }),
      rustic: null,
    });

    render(
      <EngineProvider defaultEngine="rustic">
        <ModernOnlyWidget />
      </EngineProvider>
    );

    expect(
      await screen.findByText(/ModernOnlyWidget has no rustic implementation/)
    ).toBeInTheDocument();
    expect(screen.queryByTestId('fallback-widget')).toBeNull();
  });

  it('paints nothing: registering, activating, switching and unmounting a pack leaves the style surface identical', async () => {
    const before = styleSurfaceFingerprint();

    registerCustomComponents({ TestWidget: AcmeWidget }, 'acme-pack');
    registerCustomComponents({ TestWidget: GlobexWidget }, 'globex-pack');
    expect(styleSurfaceFingerprint()).toBe(before);

    const { rerender, unmount } = render(renderWithPack('acme-pack', <TestWidget />));
    expect(await screen.findByTestId('acme-widget')).toBeInTheDocument();
    expect(styleSurfaceFingerprint()).toBe(before);

    rerender(renderWithPack('globex-pack', <TestWidget />));
    await waitFor(() => expect(screen.getByTestId('globex-widget')).toBeInTheDocument());
    expect(styleSurfaceFingerprint()).toBe(before);

    unmount();
    expect(styleSurfaceFingerprint()).toBe(before);
  });

  it('writes no --ds-* custom property to the document element under any pack', async () => {
    registerCustomComponents({ TestWidget: AcmeWidget }, 'acme-pack');

    render(renderWithPack('acme-pack', <TestWidget />));
    expect(await screen.findByTestId('acme-widget')).toBeInTheDocument();

    const el = document.documentElement;
    const dsProps = Array.from({ length: el.style.length }, (_, i) => el.style.item(i)).filter(
      (name) => name.startsWith('--ds-')
    );

    expect(dsProps).toEqual([]);
    // The inline style attribute is the one surface that outranks the compiled
    // artifact unconditionally, so it must not exist at all.
    expect(el.getAttribute('style')).toBeNull();
  });

  it('ignores componentPack when the active engine is not custom', async () => {
    registerCustomComponents({ TestWidget: AcmeWidget }, 'acme-pack');

    render(
      <EngineProvider defaultEngine="modern">
        <TenantContext.Provider
          value={{
            config: { ...baseTenantConfig, componentPack: 'acme-pack' },
            isLoading: false,
          }}
        >
          <TestWidget />
        </TenantContext.Provider>
      </EngineProvider>
    );

    expect(await screen.findByTestId('fallback-widget')).toBeInTheDocument();
    expect(screen.queryByTestId('acme-widget')).toBeNull();
  });
});
