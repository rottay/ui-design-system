import React from 'react';
import { runInNewContext } from 'node:vm';
import { render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { TenantConfig } from '@/foundation/contracts';
import { outstandingRootClaims } from '@/infrastructure/runtime/foundation/root-attributes';
import { TenantProvider, useTenantContext } from '..';
import { getDefaultTenant } from '@/infrastructure/runtime/tenant/foundation/configuration/registry';
import { ReservedTenantIdentityError } from '@/foundation/tokens/ts/presentation/brand-themes';

function config(slug: string): TenantConfig {
  return {
    slug,
    name: slug,
    theme: 'base',
    plan: 'enterprise',
    features: [],
    branding: { companyName: slug },
  };
}

afterEach(() => {
  vi.restoreAllMocks();
  document.documentElement.removeAttribute('data-tenant');
});

describe('TenantProvider data-tenant ownership', () => {
  it('admits the exact deeply-frozen code-owned Rottay config', () => {
    const rottay = getDefaultTenant();
    const view = render(
      <TenantProvider config={rottay}><div data-testid="rottay-child" /></TenantProvider>,
    );
    expect(view.getByTestId('rottay-child')).toBeTruthy();
    expect(document.documentElement.getAttribute('data-tenant')).toBe('rottay');
    expect(Object.isFrozen(rottay)).toBe(true);
    expect(Object.isFrozen(rottay.brandTheme)).toBe(true);
  });

  it.each([
    ['slug', { slug: 'Rottay' }],
    ['name', { name: 'Bit-Hire' }],
    ['companyName', { branding: { companyName: 'Ｅｖｎｔｏ' } }],
  ] as const)('rejects direct reserved %s variants before stamp or child render', (_field, override) => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const child = vi.fn(() => <div />);
    const base = config('customer');
    const candidate = {
      ...base,
      ...override,
      branding: {
        ...base.branding,
        ...('branding' in override ? override.branding : {}),
      },
    };

    expect(() => render(
      <TenantProvider config={candidate}>{React.createElement(child)}</TenantProvider>,
    )).toThrow(ReservedTenantIdentityError);
    expect(child).not.toHaveBeenCalled();
    expect(document.documentElement.hasAttribute('data-tenant')).toBe(false);
  });

  it('restores the exact SSR predecessor across A -> B -> C -> unmount', () => {
    const root = document.documentElement;
    root.setAttribute('data-tenant', 'ssr-a');

    const view = render(
      <TenantProvider config={config('tenant-b')}><div /></TenantProvider>,
    );
    expect(root.getAttribute('data-tenant')).toBe('tenant-b');

    view.rerender(
      <TenantProvider config={config('tenant-c')}><div /></TenantProvider>,
    );
    expect(root.getAttribute('data-tenant')).toBe('tenant-c');

    view.unmount();
    expect(root.getAttribute('data-tenant')).toBe('ssr-a');
    expect(outstandingRootClaims(root)).toBe(0);
  });

  it('restores absence rather than leaving an empty attribute', () => {
    const root = document.documentElement;
    const view = render(
      <TenantProvider config={config('tenant-b')}><div /></TenantProvider>,
    );

    view.unmount();
    expect(root.hasAttribute('data-tenant')).toBe(false);
    expect(outstandingRootClaims(root)).toBe(0);
  });

  it('stamps the slug validated during render, not one a child layout effect wrote', () => {
    // A child layout effect runs BEFORE its parent's. Reading `config.slug`
    // inside the provider's own layout effect would therefore read the value
    // the child had just written -- validation and stamping would be looking at
    // two different objects-in-time. The provider snapshots and validates
    // during render, so the reserved identity never reaches the root.
    const candidate = config('customer') as { slug: string };

    function MutatingChild(): React.ReactElement {
      React.useLayoutEffect(() => {
        candidate.slug = 'rottay';
      }, []);
      return <div data-testid="mutating-child" />;
    }

    const view = render(
      <TenantProvider config={candidate as TenantConfig}><MutatingChild /></TenantProvider>,
    );

    expect(view.getByTestId('mutating-child')).toBeTruthy();
    expect(candidate.slug).toBe('rottay');
    expect(document.documentElement.getAttribute('data-tenant')).toBe('customer');
  });

  it('publishes a frozen snapshot that a post-mount mutation cannot reach', () => {
    const candidate = config('customer') as TenantConfig & { slug: string };
    let published: TenantConfig | null = null;

    function Probe(): React.ReactElement {
      published = useTenantContext().config;
      return <div />;
    }

    render(<TenantProvider config={candidate}><Probe /></TenantProvider>);
    expect(published).not.toBeNull();
    expect(published).not.toBe(candidate);
    expect(Object.isFrozen(published)).toBe(true);
    expect(Object.isFrozen(published!.branding)).toBe(true);

    candidate.slug = 'rottay';
    (candidate.branding as { companyName: string }).companyName = 'Rottay';
    expect(published!.slug).toBe('customer');
    expect(published!.branding.companyName).toBe('customer');
    expect(document.documentElement.getAttribute('data-tenant')).toBe('customer');
  });

  it('snapshots a cross-realm plain object but still rejects a class instance', () => {
    // `getPrototypeOf(v) === Object.prototype` is realm-IDENTITY based: an
    // object literal allocated in another realm carries that realm's
    // Object.prototype and would be refused as if it were a class instance.
    const foreign = runInNewContext('({ companyName: "Customer" })') as {
      companyName: string;
    };
    expect(Object.getPrototypeOf(foreign)).not.toBe(Object.prototype);

    const view = render(
      <TenantProvider config={{ ...config('customer'), branding: foreign }}>
        <div data-testid="foreign-child" />
      </TenantProvider>,
    );
    expect(view.getByTestId('foreign-child')).toBeTruthy();
    expect(document.documentElement.getAttribute('data-tenant')).toBe('customer');

    class Branding {
      companyName = 'Customer';
    }
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(
      <TenantProvider config={{ ...config('customer'), branding: new Branding() }}>
        <div />
      </TenantProvider>,
    )).toThrow(/data-only objects/);
  });

  it('does not let a covered identical claim restore early', () => {
    const root = document.documentElement;
    root.setAttribute('data-tenant', 'ssr-a');
    const first = render(
      <TenantProvider config={config('same')}><div /></TenantProvider>,
    );
    const second = render(
      <TenantProvider config={config('same')}><div /></TenantProvider>,
    );

    first.unmount();
    expect(root.getAttribute('data-tenant')).toBe('same');
    second.unmount();
    expect(root.getAttribute('data-tenant')).toBe('ssr-a');
  });
});
