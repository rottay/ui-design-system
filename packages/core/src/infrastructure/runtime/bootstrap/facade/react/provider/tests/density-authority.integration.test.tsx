/**
 * DS-A006 production-provider proof.
 *
 * Structural brand density and semantic tenant density are independent axes:
 * the former is compiler/token owned, while the root runtime posture mirrors
 * only Appearance.general.density. The root attribute is observable state and
 * is excluded from the local multiplier by foundation/base/density.css.
 */
import React from 'react';
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import type { TenantConfig } from '@/foundation/contracts/composition/tenants';
import { useDensity } from '@/infrastructure/runtime/foundation/density';
import { DesignSystemProvider } from '..';

afterEach(() => {
  cleanup();
  document.documentElement.removeAttribute('data-density');
});

function tenantConfig(
  overrides: Partial<TenantConfig> = {},
): TenantConfig {
  return {
    slug: 'density-authority-proof',
    name: 'Density authority proof',
    theme: 'base',
    plan: 'enterprise',
    features: [],
    branding: { companyName: 'Density authority proof' },
    ...overrides,
  };
}

function DensityProbe() {
  const { posture } = useDensity();
  return <output data-testid="density-posture">{posture}</output>;
}

function renderConfig(config: TenantConfig) {
  return render(
    <DesignSystemProvider tenantConfig={config} skipCssLoading>
      <DensityProbe />
    </DesignSystemProvider>,
  );
}

describe('DesignSystemProvider density authority', () => {
  it('does not reinterpret a static structural scale as semantic posture', async () => {
    const view = renderConfig(
      tenantConfig({
        brandTheme: {
          id: 'structurally-spacious',
          name: 'Structurally spacious',
          surfaces: { densityScale: 1.15 },
        },
      }),
    );

    expect(await view.findByTestId('density-posture')).toHaveTextContent(
      'comfortable'
    );
    expect(document.documentElement).toHaveAttribute(
      'data-density',
      'comfortable'
    );
  });

  it('lets DB Appearance own the semantic posture independently of static scale', async () => {
    const view = renderConfig(
      tenantConfig({
        brandTheme: {
          id: 'structurally-spacious',
          name: 'Structurally spacious',
          surfaces: { densityScale: 1.15 },
        },
        appearance: {
          general: { density: 'compact' },
        },
      }),
    );

    expect(await view.findByTestId('density-posture')).toHaveTextContent(
      'compact'
    );
    expect(document.documentElement).toHaveAttribute('data-density', 'compact');
    expect(
      document.documentElement.style.getPropertyValue(
        '--ds-density-mode-factor'
      )
    ).toBe('0.85');
  });
});
