/**
 * @fileoverview The vertical's engine is the engine that renders (WO-ENG-17).
 *
 * `resolution.test.ts` pins the ordering in isolation. This pins it end to end:
 * through DesignSystemProvider, onto `<html data-engine>`, which is what CSS
 * selectors like `[data-engine='modern']` key off. A unit test on the resolver
 * would pass even if the provider stopped calling it.
 *
 * BEFORE this work order, `app-evnto` rendered `classic`: it passes no
 * `forceEngine`, its vertical declared `modern`, its tenant record carried a
 * stale `engine: 'classic'`, and the tenant outranked the vertical. Verified at
 * the pre-change commit by running this same assertion, which produced
 * 'classic'. Sixteen modern-engine work orders were invisible in that product.
 */

import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { DesignSystemProvider } from '../DesignSystemProvider';
import { getKnownTenantConfig } from '../../tenant/registry';

function activeEngine(): string | null {
  return document.documentElement.getAttribute('data-engine');
}

afterEach(() => {
  document.documentElement.removeAttribute('data-engine');
});

describe('the vertical owns the engine, end to end', () => {
  it.each([
    ['evnto', 'modern'],
    ['bithire', 'modern'],
    ['platform', 'modern'],
  ] as const)('renders %s with its vertical engine (%s), no forceEngine', async (vertical, expected) => {
    const tenantConfig = getKnownTenantConfig(vertical === 'platform' ? 'rottay' : vertical);
    expect(tenantConfig).toBeDefined();

    render(
      <DesignSystemProvider vertical={vertical} tenantConfig={tenantConfig} skipCssLoading>
        <div>rendered</div>
      </DesignSystemProvider>
    );

    await waitFor(() => expect(activeEngine()).toBe(expected), { timeout: 15000 });
  });

  it('an explicit forceEngine still wins, so capture routes keep working', async () => {
    render(
      <DesignSystemProvider
        vertical="evnto"
        tenantConfig={getKnownTenantConfig('evnto')}
        forceEngine="rustic"
        skipCssLoading
      >
        <div>rendered</div>
      </DesignSystemProvider>
    );

    await waitFor(() => expect(activeEngine()).toBe('rustic'), { timeout: 15000 });
  });

  it('no vertical and no tenant opinion falls back to classic', async () => {
    render(
      <DesignSystemProvider
        tenantConfig={{
          slug: 'acme-from-the-database',
          name: 'ACME',
          theme: 'base',
          plan: 'starter',
          features: [],
          branding: { companyName: 'ACME' },
        }}
        skipCssLoading
      >
        <div>rendered</div>
      </DesignSystemProvider>
    );

    await waitFor(() => expect(activeEngine()).toBe('classic'), { timeout: 15000 });
  });
});
