/**
 * @fileoverview Proves the WO-ARC-04 loading seam in `factory.tsx`: when the
 * active engine is `custom` and the tenant's `componentPack` names a
 * registered skin pack, `EngineRouter` applies that pack's CSS/tokens to the
 * document — with no change to `createEngineComponent`'s public signature or
 * to the bespoke-component-wins resolution `custom.ts` already had. Mounts a
 * real `createEngineComponent` tree (not mocked), so this is an
 * `*.integration.test.tsx` per `vitest.config.ts`'s longer async timeout for
 * lazy-loaded engine code.
 */
import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { createEngineComponent } from '..';
import { EngineProvider } from '../../../composition/react/provider';
import { registerSkinPack, clearSkinPacks } from '../../../runtime/customization/component-registry/skin-pack';
import { clearCustomRegistry } from '../../../runtime/customization/component-registry';
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

function BespokeWidget() {
  return <div data-testid="bespoke-widget">bespoke</div>;
}

// A minimal engine component, mirroring how real DS components call
// createEngineComponent (classic/modern/rustic loaders; no explicit
// `custom` loader, so it falls back to `loaders.rustic` exactly like most
// production components do today).
// `Record<never, never>`, not `Record<string, never>`: the latter carries an
// index signature that types EVERY key as `never`, which erases the
// `engine?: EngineName` override the factory itself adds and rejects `key`.
const TestWidget = createEngineComponent<Record<never, never>>('TestWidget', {
  classic: async () => ({ default: FallbackWidget }),
  modern: async () => ({ default: FallbackWidget }),
  rustic: async () => ({ default: FallbackWidget }),
});

function resetDom(): void {
  document.head.querySelectorAll('[id^="rottay-skin-pack-"]').forEach((el) => el.remove());
  document.documentElement.removeAttribute('style');
}

describe('factory.tsx skin pack loading seam', () => {
  beforeEach(() => {
    clearSkinPacks();
    clearCustomRegistry();
    resetDom();
  });

  it('applies the pack registered for the active componentPack when the resolved engine is custom', async () => {
    registerSkinPack({
      id: 'acme-pack',
      css: "[data-part='trigger'] { color: red; }",
      tokenOverrides: { '--ds-example-seam': '3px' },
    });

    render(
      <EngineProvider defaultEngine="custom">
        <TenantContext.Provider
          value={{ config: { ...baseTenantConfig, componentPack: 'acme-pack' }, isLoading: false }}
        >
          <TestWidget />
        </TenantContext.Provider>
      </EngineProvider>
    );

    // No bespoke override is registered for 'acme-pack', so this resolves to
    // the fallback loader (loaders.rustic) — the pack skins it, it does not
    // replace it.
    await screen.findByTestId('fallback-widget');

    await waitFor(() => {
      expect(document.getElementById('rottay-skin-pack-acme-pack')).not.toBeNull();
    });
    expect(document.documentElement.style.getPropertyValue('--ds-example-seam')).toBe('3px');
  });

  it('does not apply any pack when the resolved engine is not custom', async () => {
    registerSkinPack({
      id: 'acme-pack',
      css: "[data-part='trigger'] { color: red; }",
      tokenOverrides: { '--ds-example-seam-2': '3px' },
    });

    render(
      <EngineProvider defaultEngine="rustic">
        <TenantContext.Provider
          value={{ config: { ...baseTenantConfig, componentPack: 'acme-pack' }, isLoading: false }}
        >
          <TestWidget />
        </TenantContext.Provider>
      </EngineProvider>
    );

    await screen.findByTestId('fallback-widget');

    expect(document.getElementById('rottay-skin-pack-acme-pack')).toBeNull();
    expect(document.documentElement.style.getPropertyValue('--ds-example-seam-2')).toBe('');
  });

  it('withdraws the pack when the engine moves off custom', async () => {
    // A pack's CSS targets `[data-part]`/`[data-state]`, and every engine
    // stamps those attributes. Its `tokenOverrides` land on documentElement's
    // inline style, the highest precedence the cascade offers. So a pack left
    // applied after the engine changes does not merely linger: it repaints and
    // re-tokenizes whichever engine took over.
    registerSkinPack({
      id: 'acme-pack-switch',
      css: "[data-part='trigger'] { color: red; }",
      tokenOverrides: { '--ds-example-switch': '3px' },
    });

    const tenant = { config: { ...baseTenantConfig, componentPack: 'acme-pack-switch' }, isLoading: false };

    const { rerender } = render(
      <EngineProvider defaultEngine="custom">
        <TenantContext.Provider value={tenant}>
          <TestWidget />
        </TenantContext.Provider>
      </EngineProvider>
    );

    await screen.findByTestId('fallback-widget');
    await waitFor(() => {
      expect(document.getElementById('rottay-skin-pack-acme-pack-switch')).not.toBeNull();
    });

    rerender(
      <EngineProvider defaultEngine="custom">
        <TenantContext.Provider value={tenant}>
          <TestWidget engine="rustic" />
        </TenantContext.Provider>
      </EngineProvider>
    );

    await waitFor(() => {
      expect(
        document.getElementById('rottay-skin-pack-acme-pack-switch'),
        "the custom pack's stylesheet is still painting the rustic engine"
      ).toBeNull();
    });
    expect(
      document.documentElement.style.getPropertyValue('--ds-example-switch'),
      "the custom pack's tokens still override the rustic engine's theme"
    ).toBe('');
  });

  it('keeps the pack while any component still holds it', async () => {
    // The seam effect runs once per engine-component instance. Withdrawing the
    // pack when the FIRST of them unmounts would strip the skin off every
    // sibling still on screen, so the release is reference-counted. This is the
    // test that stops that counting from being "simplified" away.
    registerSkinPack({
      id: 'acme-pack-refcount',
      css: "[data-part='trigger'] { color: red; }",
      tokenOverrides: { '--ds-example-refcount': '3px' },
    });

    const tenant = { config: { ...baseTenantConfig, componentPack: 'acme-pack-refcount' }, isLoading: false };
    const tree = (count: number) => (
      <EngineProvider defaultEngine="custom">
        <TenantContext.Provider value={tenant}>
          {Array.from({ length: count }, (_, i) => (
            <TestWidget key={i} />
          ))}
        </TenantContext.Provider>
      </EngineProvider>
    );

    const { rerender } = render(tree(3));
    await waitFor(() => {
      expect(document.getElementById('rottay-skin-pack-acme-pack-refcount')).not.toBeNull();
    });

    rerender(tree(1));
    await waitFor(() => {
      expect(screen.getAllByTestId('fallback-widget')).toHaveLength(1);
    });
    expect(
      document.getElementById('rottay-skin-pack-acme-pack-refcount'),
      'unmounting two of three consumers withdrew the pack from the one still rendering'
    ).not.toBeNull();
    expect(document.documentElement.style.getPropertyValue('--ds-example-refcount')).toBe('3px');

    rerender(tree(0));
    await waitFor(() => {
      expect(document.getElementById('rottay-skin-pack-acme-pack-refcount')).toBeNull();
    });
  });

  it('a bespoke component registered under the pack id still wins over the pack skin fallback', async () => {
    registerSkinPack({
      id: 'acme-pack-2',
      css: '',
      components: { TestWidget: BespokeWidget },
    });

    render(
      <EngineProvider defaultEngine="custom">
        <TenantContext.Provider
          value={{ config: { ...baseTenantConfig, componentPack: 'acme-pack-2' }, isLoading: false }}
        >
          <TestWidget />
        </TenantContext.Provider>
      </EngineProvider>
    );

    await screen.findByTestId('bespoke-widget');
    expect(screen.queryByTestId('fallback-widget')).toBeNull();
  });

  it('an unregistered componentPack renders the fallback with no pack applied', async () => {
    render(
      <EngineProvider defaultEngine="custom">
        <TenantContext.Provider
          value={{ config: { ...baseTenantConfig, componentPack: 'never-registered' }, isLoading: false }}
        >
          <TestWidget />
        </TenantContext.Provider>
      </EngineProvider>
    );

    await screen.findByTestId('fallback-widget');
    expect(document.getElementById('rottay-skin-pack-never-registered')).toBeNull();
  });
});
