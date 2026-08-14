import React from 'react';
import { act, render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { TenantConfig } from '../../../../../../../foundation/contracts';
import { useTenantContext } from '../../../../../tenant/composition/react/provider';
import { DesignSystemProvider } from '..';
import { ReservedTenantIdentityError } from '@/foundation/tokens/ts/presentation/brand-themes';

const { resolveTenantConfigMock } = vi.hoisted(() => ({
  resolveTenantConfigMock: vi.fn(),
}));

vi.mock('@/infrastructure/runtime/tenant/runtime/store', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/infrastructure/runtime/tenant/runtime/store')>();
  return {
    ...original,
    getTenantConfig: resolveTenantConfigMock,
  };
});

function config(slug: string, companyName = slug): TenantConfig {
  return {
    slug,
    name: companyName,
    theme: 'base',
    plan: 'starter',
    features: [],
    vertical: 'bithire',
    branding: { companyName },
  };
}

function TenantProbe(): React.ReactElement {
  const { config: tenantConfig } = useTenantContext();
  return (
    <output data-testid="tenant-probe">
      {JSON.stringify({
        slug: tenantConfig.slug,
        companyName: tenantConfig.branding.companyName,
      })}
    </output>
  );
}

function readProbe(element: HTMLElement): { slug: string; companyName: string } {
  return JSON.parse(element.textContent ?? '{}') as {
    slug: string;
    companyName: string;
  };
}

class ErrorBoundary extends React.Component<
  React.PropsWithChildren,
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    return this.state.error
      ? <output data-testid="provider-error">{this.state.error.name}</output>
      : this.props.children;
  }
}

describe('DesignSystemProvider tenant-resolution boundary', () => {
  beforeEach(() => {
    resolveTenantConfigMock.mockReset();
  });

  it('discards tenant A when a late request resolves after switching to tenant B', async () => {
    let resolveTenantA!: (value: TenantConfig) => void;
    const tenantA = new Promise<TenantConfig>((resolve) => {
      resolveTenantA = resolve;
    });
    resolveTenantConfigMock.mockImplementation((slug: string) => (
      slug === 'tenant-a'
        ? tenantA
        : Promise.resolve(config('tenant-b', 'Tenant B DB'))
    ));

    const rendered = render(
      <DesignSystemProvider tenantSlug="tenant-a" vertical="bithire" skipCssLoading>
        <TenantProbe />
      </DesignSystemProvider>,
    );
    rendered.rerender(
      <DesignSystemProvider tenantSlug="tenant-b" vertical="bithire" skipCssLoading>
        <TenantProbe />
      </DesignSystemProvider>,
    );

    await waitFor(() => {
      expect(readProbe(rendered.getByTestId('tenant-probe'))).toEqual({
        slug: 'tenant-b',
        companyName: 'Tenant B DB',
      });
    });

    await act(async () => {
      resolveTenantA(config('tenant-a', 'Late Tenant A DB'));
      await tenantA;
    });

    expect(readProbe(rendered.getByTestId('tenant-probe'))).toEqual({
      slug: 'tenant-b',
      companyName: 'Tenant B DB',
    });
  });

  it('keeps the requested identity when an unexpected resolver error occurs', async () => {
    const onError = vi.fn();
    resolveTenantConfigMock.mockRejectedValue(new Error('resolver unavailable'));

    const rendered = render(
      <DesignSystemProvider
        tenantSlug="tenant-a"
        vertical="bithire"
        onError={onError}
        skipCssLoading
      >
        <TenantProbe />
      </DesignSystemProvider>,
    );

    await waitFor(() => {
      expect(readProbe(rendered.getByTestId('tenant-probe'))).toEqual({
        slug: 'tenant-a',
        companyName: 'tenant-a',
      });
    });
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({
      message: 'resolver unavailable',
    }));
  });

  it('does not convert a reserved-identity error into an unresolved fallback', async () => {
    const reserved = new ReservedTenantIdentityError({
      kind: 'reserved-identity-violation',
      field: 'slug',
      value: 'Rottay',
      reservedAs: 'rottay',
    });
    const onError = vi.fn();
    resolveTenantConfigMock.mockImplementation(async (slug: string) => {
      expect(slug).toBe('Rottay');
      throw reserved;
    });

    const rendered = render(
      <ErrorBoundary>
        <DesignSystemProvider tenantSlug="Rottay" onError={onError} skipCssLoading>
          <TenantProbe />
        </DesignSystemProvider>
      </ErrorBoundary>,
    );

    await waitFor(() => {
      expect(rendered.getByTestId('provider-error').textContent).toBe(
        'ReservedTenantIdentityError',
      );
    });
    expect(rendered.queryByTestId('tenant-probe')).toBeNull();
    expect(resolveTenantConfigMock).toHaveBeenCalledWith('Rottay');
    expect(onError).toHaveBeenCalledWith(reserved);
  });
});
