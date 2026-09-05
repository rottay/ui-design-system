/**
 * @fileoverview A published compile must belong to the tenant that renders.
 *
 * `engineVisual` is the compiled projection an engine library seeds itself
 * from. Two halves of one compile cannot disagree with the tenant they are
 * mounted against, so the provider refuses a foreign declaration instead of
 * letting an engine paint another theme's numbers.
 */

import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { firstPartyEngineVisual } from '@/infrastructure/compilers/runtime/theme';
import { assertEngineVisualBelongs } from '@/infrastructure/runtime/foundation/engine-visual';
import { DesignSystemProvider } from '..';
import { getKnownTenantConfig } from '../../../../../tenant/foundation/configuration/registry';

afterEach(() => {
  document.documentElement.removeAttribute('data-engine');
  vi.restoreAllMocks();
});

/** React logs the thrown render error; the assertion is on the throw itself. */
function silenced<T>(run: () => T): T {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  return run();
}

describe('the published compile is admitted only for the engine that renders', () => {
  it('admits a declaration compiled for the vertical engine', async () => {
    render(
      <DesignSystemProvider
        vertical="bithire"
        tenantConfig={getKnownTenantConfig('bithire')}
        engineVisual={firstPartyEngineVisual('bithire', 'modern')}
        skipCssLoading
      >
        <div>rendered</div>
      </DesignSystemProvider>
    );
    await waitFor(() =>
      expect(document.documentElement.getAttribute('data-engine')).toBe('modern')
    );
  });

  it('refuses a declaration compiled for a different engine', () => {
    expect(() =>
      silenced(() =>
        render(
          <DesignSystemProvider
            vertical="bithire"
            tenantConfig={getKnownTenantConfig('bithire')}
            engineVisual={firstPartyEngineVisual('bithire', 'classic')}
            skipCssLoading
          >
            <div>rendered</div>
          </DesignSystemProvider>
        )
      )
    ).toThrow(/compiled for "classic" but "modern" renders/);
  });

  it('refuses a declaration whose governed profiles contradict the tenant', () => {
    const declaration = firstPartyEngineVisual('bithire', 'modern');
    expect(() =>
      assertEngineVisualBelongs(
        {
          ...declaration,
          runtime: { ...declaration.runtime, recipeProfile: 'rottay/not-this-one@1' },
        },
        'modern',
        { recipeProfile: 'rottay/management-editorial@1' }
      )
    ).toThrow(/The declaration belongs to another compile/);
  });

  it('refuses a declaration whose experience profile contradicts the tenant', () => {
    const declaration = firstPartyEngineVisual('bithire', 'modern');
    expect(() =>
      assertEngineVisualBelongs(
        {
          ...declaration,
          runtime: { ...declaration.runtime, experienceProfile: 'rottay/other@1' },
        },
        'modern',
        { general: { experienceProfile: 'rottay/management-editorial@1' } }
      )
    ).toThrow(/The declaration belongs to another compile/);
  });

  it('admits a declaration the tenant does not contradict', () => {
    expect(() =>
      assertEngineVisualBelongs(
        firstPartyEngineVisual('bithire', 'modern'),
        'modern',
        undefined
      )
    ).not.toThrow();
  });
});
