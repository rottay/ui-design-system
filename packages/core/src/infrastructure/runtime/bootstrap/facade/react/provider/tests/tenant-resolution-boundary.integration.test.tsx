import React, { Suspense } from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { TenantConfig } from '../../../../../../../foundation/contracts';
import { useTenantContext } from '../../../../../tenant/composition/react/provider';
import { DesignSystemProvider, isCommittedTenantRequest } from '..';
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

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

let suspensePromise: Promise<void> | null = null;

const suspenseWitness = {
  renders: 0,
  throws: 0,
  commits: 0,
};

function resetSuspense(): void {
  suspensePromise = null;
}

function resetSuspenseWitness(): void {
  suspenseWitness.renders = 0;
  suspenseWitness.throws = 0;
  suspenseWitness.commits = 0;
}

function SuspenseSibling({ suspend }: { suspend: boolean }): React.ReactElement {
  suspenseWitness.renders += 1;
  React.useLayoutEffect(() => {
    suspenseWitness.commits += 1;
  });
  if (suspend) {
    suspenseWitness.throws += 1;
    if (!suspensePromise) {
      suspensePromise = new Promise<void>(() => {});
    }
    throw suspensePromise;
  }
  return <output data-testid="suspense-sibling">sibling</output>;
}

/**
 * Resolves a stale deferred tenant from a sibling/child layout effect. Used to
 * settle a pending request in the window between a new key committing and the
 * old effect's passive cleanup running.
 */
function StaleResolver({ trigger }: { trigger: () => void }): null {
  React.useLayoutEffect(() => {
    trigger();
  }, []);
  return null;
}

describe('DesignSystemProvider tenant-resolution boundary', () => {
  beforeEach(() => {
    resolveTenantConfigMock.mockReset();
    resetSuspense();
    resetSuspenseWitness();
  });

  it('committed-key predicate rejects stale requests regardless of React timing', () => {
    // Causal canary: the key comparison is load-bearing. A mutant that drops it
    // and only checks `!cancelled` would pass timing-dependent integration
    // drills because RTL rerender/act can run passive cleanup before the async
    // continuation. These direct assertions fail if the comparison is removed.
    expect(isCommittedTenantRequest(false, 'request-key', 'other-key')).toBe(false);
    expect(isCommittedTenantRequest(false, 'request-key', 'request-key')).toBe(true);
    expect(isCommittedTenantRequest(true, 'request-key', 'request-key')).toBe(false);
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

  /**
   * Abandoned concurrent renders must not pollute committed state. The provider
   * used to write request and callback refs during render, so a discarded render
   * could overwrite the state the running async effect belonged to. These drills
   * use a Suspense sibling after the provider plus startTransition to force the
   * provider to render while ensuring the boundary never commits; the cleanup
   * then verifies that only the committed tree's request, override and callback
   * ran.
   */

  it('D1: abandoned slug B does not stop A from resolving/publishing and only the committed callback runs', async () => {
    const tenantA = deferred<TenantConfig>();
    const tenantB = deferred<TenantConfig>();
    resolveTenantConfigMock.mockImplementation((slug: string) => {
      if (slug === 'tenant-a') return tenantA.promise;
      if (slug === 'tenant-b') return tenantB.promise;
      return Promise.reject(new Error('unknown'));
    });

    const onTenantResolved = vi.fn();

    const rendered = render(
      <Suspense fallback={<output data-testid="suspense-fallback">loading</output>}>
        <DesignSystemProvider
          tenantSlug="tenant-a"
          vertical="bithire"
          skipCssLoading
          onTenantResolved={onTenantResolved}
        >
          <TenantProbe />
        </DesignSystemProvider>
        <SuspenseSibling suspend={false} />
      </Suspense>,
    );

    await waitFor(() => {
      expect(resolveTenantConfigMock).toHaveBeenCalledWith('tenant-a');
    });

    // Start a transition to tenant-b while the Suspense sibling suspends. The
    // provider renders with B but the boundary does not commit, so B never
    // starts a request and the running A effect is never cancelled.
    act(() => {
      React.startTransition(() => {
        rendered.rerender(
          <Suspense fallback={<output data-testid="suspense-fallback">loading</output>}>
            <DesignSystemProvider
              tenantSlug="tenant-b"
              vertical="bithire"
              skipCssLoading
              onTenantResolved={onTenantResolved}
            >
              <TenantProbe />
            </DesignSystemProvider>
            <SuspenseSibling suspend />
          </Suspense>,
        );
      });
    });

    // The sibling rendered and threw, proving the candidate update reached it,
    // but it never committed (no layout-effect marker) and React kept the prior
    // tree. The candidate request therefore never started.
    expect(suspenseWitness.throws).toBeGreaterThan(0);
    expect(suspenseWitness.commits).toBe(1);
    expect(resolveTenantConfigMock).not.toHaveBeenCalledWith('tenant-b');

    // Resolve A while B is still abandoned. A's effect was never cancelled.
    await act(async () => {
      tenantA.resolve(config('tenant-a', 'Tenant A DB'));
      await tenantA.promise;
    });

    // The committed tenant (A) called back and published; the abandoned B
    // transition never started a request, never committed a fallback, and never
    // called back.
    await waitFor(() => {
      expect(onTenantResolved).toHaveBeenCalledTimes(1);
    });
    expect(onTenantResolved).toHaveBeenCalledWith(
      expect.objectContaining({ slug: 'tenant-a' }),
    );
    expect(resolveTenantConfigMock).not.toHaveBeenCalledWith('tenant-b');

    // The DOM that committed is A (resolved), not B.
    expect(screen.queryByTestId('suspense-fallback')).toBeNull();
    expect(readProbe(screen.getByTestId('tenant-probe'))).toEqual({
      slug: 'tenant-a',
      companyName: 'Tenant A DB',
    });
    expect(resolveTenantConfigMock).not.toHaveBeenCalledWith('tenant-b');
  });

  it('D2: abandoned override/callback alternates for the same slug are ignored', async () => {
    const tenantA = deferred<TenantConfig>();
    resolveTenantConfigMock.mockImplementation((slug: string) => {
      if (slug === 'tenant-a') return tenantA.promise;
      return Promise.reject(new Error('unknown'));
    });

    const committedCallback = vi.fn();
    const abandonedCallback = vi.fn();

    const committedOverride = {
      branding: { companyName: 'Committed Override' },
    };
    const abandonedOverride = {
      branding: { companyName: 'Abandoned Override' },
    };

    const rendered = render(
      <Suspense fallback={<output data-testid="suspense-fallback">loading</output>}>
        <DesignSystemProvider
          tenantSlug="tenant-a"
          vertical="bithire"
          skipCssLoading
          tenantOverrides={committedOverride}
          onTenantResolved={committedCallback}
        >
          <TenantProbe />
        </DesignSystemProvider>
        <SuspenseSibling suspend={false} />
      </Suspense>,
    );

    await waitFor(() => {
      expect(resolveTenantConfigMock).toHaveBeenCalledWith('tenant-a');
    });

    act(() => {
      React.startTransition(() => {
        rendered.rerender(
          <Suspense fallback={<output data-testid="suspense-fallback">loading</output>}>
            <DesignSystemProvider
              tenantSlug="tenant-a"
              vertical="bithire"
              skipCssLoading
              tenantOverrides={abandonedOverride}
              onTenantResolved={abandonedCallback}
            >
              <TenantProbe />
            </DesignSystemProvider>
            <SuspenseSibling suspend />
          </Suspense>,
        );
      });
    });

    // The sibling rendered and threw, but never committed.
    expect(suspenseWitness.throws).toBeGreaterThan(0);
    expect(suspenseWitness.commits).toBe(1);
    expect(resolveTenantConfigMock).toHaveBeenCalledTimes(1);
    expect(resolveTenantConfigMock).toHaveBeenLastCalledWith('tenant-a');

    await act(async () => {
      tenantA.resolve(config('tenant-a', 'Tenant A DB'));
      await tenantA.promise;
    });

    // Only the committed callback ran, using the committed override.
    await waitFor(() => {
      expect(committedCallback).toHaveBeenCalledTimes(1);
    });
    expect(committedCallback).toHaveBeenCalledWith(
      expect.objectContaining({
        slug: 'tenant-a',
        branding: expect.objectContaining({ companyName: 'Committed Override' }),
      }),
    );
    expect(abandonedCallback).not.toHaveBeenCalled();

    // The DOM that committed is A with the committed override.
    expect(screen.queryByTestId('suspense-fallback')).toBeNull();
    expect(readProbe(screen.getByTestId('tenant-probe'))).toEqual({
      slug: 'tenant-a',
      companyName: 'Committed Override',
    });
  });

  it('D3: abandoned onError alternate for the same slug only calls the committed handler', async () => {
    const tenantA = deferred<TenantConfig>();
    resolveTenantConfigMock.mockImplementation((slug: string) => {
      if (slug === 'tenant-a') return tenantA.promise;
      return Promise.reject(new Error('unknown'));
    });

    const committedError = vi.fn();
    const abandonedError = vi.fn();

    const rendered = render(
      <Suspense fallback={<output data-testid="suspense-fallback">loading</output>}>
        <DesignSystemProvider
          tenantSlug="tenant-a"
          vertical="bithire"
          skipCssLoading
          onError={committedError}
        >
          <TenantProbe />
        </DesignSystemProvider>
        <SuspenseSibling suspend={false} />
      </Suspense>,
    );

    await waitFor(() => {
      expect(resolveTenantConfigMock).toHaveBeenCalledWith('tenant-a');
    });

    act(() => {
      React.startTransition(() => {
        rendered.rerender(
          <Suspense fallback={<output data-testid="suspense-fallback">loading</output>}>
            <DesignSystemProvider
              tenantSlug="tenant-a"
              vertical="bithire"
              skipCssLoading
              onError={abandonedError}
            >
              <TenantProbe />
            </DesignSystemProvider>
            <SuspenseSibling suspend />
          </Suspense>,
        );
      });
    });

    // The sibling rendered and threw, but never committed.
    expect(suspenseWitness.throws).toBeGreaterThan(0);
    expect(suspenseWitness.commits).toBe(1);
    expect(resolveTenantConfigMock).toHaveBeenCalledTimes(1);
    expect(resolveTenantConfigMock).toHaveBeenLastCalledWith('tenant-a');

    await act(async () => {
      tenantA.reject(new Error('resolver failure'));
      await expect(tenantA.promise).rejects.toThrow('resolver failure');
    });

    // Only the committed error handler received the rejection.
    await waitFor(() => {
      expect(committedError).toHaveBeenCalledTimes(1);
    });
    expect(committedError).toHaveBeenCalledWith(expect.objectContaining({
      message: 'resolver failure',
    }));
    expect(abandonedError).not.toHaveBeenCalled();

    // The committed tree fell back to the unresolved config for A; the alternate
    // onError never replaced the committed one.
    expect(screen.queryByTestId('suspense-fallback')).toBeNull();
    expect(readProbe(screen.getByTestId('tenant-probe'))).toEqual({
      slug: 'tenant-a',
      companyName: 'tenant-a',
    });
  });

  /**
   * Committed-key guards: a stale request must not publish state or call
   * callbacks for the new tree even if its passive cleanup has not run yet.
   * These drills settle the old request from a sibling/child layout effect
   * during the commit that switches to a new tenant, so the only protection is
   * the committed-key ref updated in the provider's own layout effect.
   */

  it('A: stale success during commit switch is discarded and B is the only published/called-back request', async () => {
    const tenantA = deferred<TenantConfig>();
    const tenantB = deferred<TenantConfig>();
    resolveTenantConfigMock.mockImplementation((slug: string) => {
      if (slug === 'tenant-a') return tenantA.promise;
      if (slug === 'tenant-b') return tenantB.promise;
      return Promise.reject(new Error('unknown'));
    });

    const onTenantResolved = vi.fn();
    const onError = vi.fn();

    const rendered = render(
      <DesignSystemProvider
        tenantSlug="tenant-a"
        vertical="bithire"
        skipCssLoading
        onTenantResolved={onTenantResolved}
        onError={onError}
      >
        <TenantProbe />
      </DesignSystemProvider>,
    );

    await waitFor(() => {
      expect(resolveTenantConfigMock).toHaveBeenCalledWith('tenant-a');
    });

    // Switch to B. A sibling layout effect resolves the still-pending A request
    // while B is committing, before A's passive cleanup can run.
    rendered.rerender(
      <>
        <DesignSystemProvider
          tenantSlug="tenant-b"
          vertical="bithire"
          skipCssLoading
          onTenantResolved={onTenantResolved}
          onError={onError}
        >
          <TenantProbe />
        </DesignSystemProvider>
        <StaleResolver trigger={() => tenantA.resolve(config('tenant-a', 'Stale A DB'))} />
      </>,
    );

    // Drain the microtask queue so A's async continuation runs while its passive
    // cleanup is still pending. The committed-key guard must discard it.
    await act(async () => {
      await Promise.resolve();
    });

    // A must not have published or called back on the B tree.
    expect(onTenantResolved).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
    expect(rendered.queryByTestId('tenant-probe')).toBeNull();

    // B completes normally and is the only published/called-back request.
    await act(async () => {
      tenantB.resolve(config('tenant-b', 'Tenant B DB'));
      await tenantB.promise;
    });

    await waitFor(() => {
      expect(onTenantResolved).toHaveBeenCalledTimes(1);
    });
    expect(onTenantResolved).toHaveBeenCalledWith(
      expect.objectContaining({ slug: 'tenant-b' }),
    );
    expect(readProbe(rendered.getByTestId('tenant-probe'))).toEqual({
      slug: 'tenant-b',
      companyName: 'Tenant B DB',
    });
  });

  it('B: stale reject during commit switch is discarded and B resolves normally', async () => {
    const tenantA = deferred<TenantConfig>();
    const tenantB = deferred<TenantConfig>();
    resolveTenantConfigMock.mockImplementation((slug: string) => {
      if (slug === 'tenant-a') return tenantA.promise;
      if (slug === 'tenant-b') return tenantB.promise;
      return Promise.reject(new Error('unknown'));
    });

    const onTenantResolved = vi.fn();
    const onError = vi.fn();

    const rendered = render(
      <DesignSystemProvider
        tenantSlug="tenant-a"
        vertical="bithire"
        skipCssLoading
        onTenantResolved={onTenantResolved}
        onError={onError}
      >
        <TenantProbe />
      </DesignSystemProvider>,
    );

    await waitFor(() => {
      expect(resolveTenantConfigMock).toHaveBeenCalledWith('tenant-a');
    });

    // Switch to B. A sibling layout effect rejects the still-pending A request
    // while B is committing, before A's passive cleanup can run.
    rendered.rerender(
      <>
        <DesignSystemProvider
          tenantSlug="tenant-b"
          vertical="bithire"
          skipCssLoading
          onTenantResolved={onTenantResolved}
          onError={onError}
        >
          <TenantProbe />
        </DesignSystemProvider>
        <StaleResolver trigger={() => tenantA.reject(new Error('stale A reject'))} />
      </>,
    );

    await act(async () => {
      await Promise.resolve();
    });

    // A's rejection must not call onError or onTenantResolved on the B tree.
    expect(onError).not.toHaveBeenCalled();
    expect(onTenantResolved).not.toHaveBeenCalled();

    // B resolves normally and remains the only published/called-back request.
    await act(async () => {
      tenantB.resolve(config('tenant-b', 'Tenant B DB'));
      await tenantB.promise;
    });

    await waitFor(() => {
      expect(onTenantResolved).toHaveBeenCalledTimes(1);
    });
    expect(onTenantResolved).toHaveBeenCalledWith(
      expect.objectContaining({ slug: 'tenant-b' }),
    );
    expect(onError).not.toHaveBeenCalled();
    expect(readProbe(rendered.getByTestId('tenant-probe'))).toEqual({
      slug: 'tenant-b',
      companyName: 'Tenant B DB',
    });
  });

  it('C: late reject after switch/unmount does not call back', async () => {
    const tenantA = deferred<TenantConfig>();
    const tenantB = deferred<TenantConfig>();
    resolveTenantConfigMock.mockImplementation((slug: string) => {
      if (slug === 'tenant-a') return tenantA.promise;
      if (slug === 'tenant-b') return tenantB.promise;
      return Promise.reject(new Error('unknown'));
    });

    const onTenantResolved = vi.fn();
    const onError = vi.fn();

    const rendered = render(
      <DesignSystemProvider
        tenantSlug="tenant-a"
        vertical="bithire"
        skipCssLoading
        onTenantResolved={onTenantResolved}
        onError={onError}
      >
        <TenantProbe />
      </DesignSystemProvider>,
    );

    await waitFor(() => {
      expect(resolveTenantConfigMock).toHaveBeenCalledWith('tenant-a');
    });

    // Switch to B and let it resolve fully.
    rendered.rerender(
      <DesignSystemProvider
        tenantSlug="tenant-b"
        vertical="bithire"
        skipCssLoading
        onTenantResolved={onTenantResolved}
        onError={onError}
      >
        <TenantProbe />
      </DesignSystemProvider>,
    );

    await act(async () => {
      tenantB.resolve(config('tenant-b', 'Tenant B DB'));
      await tenantB.promise;
    });

    await waitFor(() => {
      expect(onTenantResolved).toHaveBeenCalledTimes(1);
    });
    expect(readProbe(rendered.getByTestId('tenant-probe'))).toEqual({
      slug: 'tenant-b',
      companyName: 'Tenant B DB',
    });

    // A rejects after B is already committed and resolved.
    await act(async () => {
      tenantA.reject(new Error('late A reject'));
      await expect(tenantA.promise).rejects.toThrow('late A reject');
    });

    expect(onError).not.toHaveBeenCalled();
    expect(onTenantResolved).toHaveBeenCalledTimes(1);
  });
});
