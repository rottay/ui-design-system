import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import type { TenantConfig } from '@/foundation/contracts/composition/tenants';
import type { TenantThemeArtifact } from '@/foundation/contracts/composition/tenants/themes/tenant-theme';
import {
  compileTenantThemeConfig,
  getTenantThemeVerticalEnvelope,
  hydrateTenantThemeConfig,
} from '@/infrastructure/compilers/composition/tenant-theme';
import { useDensity } from '@/infrastructure/runtime/foundation/density';
import {
  TENANT_THEME_ARTIFACT_DIGEST_ATTRIBUTE,
  TENANT_THEME_ARTIFACT_SLUG_ATTRIBUTE,
  TENANT_THEME_ARTIFACT_VERTICAL_ATTRIBUTE,
} from '@/infrastructure/runtime/theming';
import { DesignSystemProvider } from '..';

const ARTIFACT = compileTenantThemeConfig(
  hydrateTenantThemeConfig({
    schemaVersion: 1,
    mode: 'simple',
    appearance: { density: 'compact' },
  }, {
    tenantId: 'tenant_density',
    slug: 'density-authority-proof',
    verticalKey: 'rottay',
    rowVersion: 1,
  }),
  { verticalEnvelope: getTenantThemeVerticalEnvelope('rottay') },
);

function tenantConfig(artifact?: TenantThemeArtifact): TenantConfig {
  return {
    slug: artifact?.slug ?? 'density-no-visual',
    name: 'Density authority proof',
    theme: 'base',
    plan: 'enterprise',
    features: [],
    branding: { companyName: 'Density authority proof' },
    ...(artifact ? { appearance: artifact.normalizedAppearance } : {}),
  } as TenantConfig;
}

function mountArtifact(artifact: TenantThemeArtifact): void {
  const style = document.createElement('style');
  style.id = 'density-artifact';
  style.setAttribute(TENANT_THEME_ARTIFACT_DIGEST_ATTRIBUTE, artifact.digest);
  style.setAttribute(TENANT_THEME_ARTIFACT_SLUG_ATTRIBUTE, artifact.slug);
  style.setAttribute(TENANT_THEME_ARTIFACT_VERTICAL_ATTRIBUTE, artifact.verticalKey);
  style.textContent = artifact.css;
  document.head.appendChild(style);
}

function DensityProbe() {
  const { posture } = useDensity();
  return <output data-testid="density-posture">{posture}</output>;
}

afterEach(() => {
  cleanup();
  document.getElementById('density-artifact')?.remove();
  document.documentElement.removeAttribute('data-density');
});

describe('DesignSystemProvider density authority', () => {
  it('defaults context posture when no compiled semantic density exists', () => {
    render(
      <DesignSystemProvider tenantConfig={tenantConfig()}>
        <DensityProbe />
      </DesignSystemProvider>,
    );
    expect(screen.getByTestId('density-posture')).toHaveTextContent('comfortable');
  });

  it('reads semantic posture from the verified artifact without inline token paint', () => {
    mountArtifact(ARTIFACT);
    render(
      <DesignSystemProvider
        tenantConfig={tenantConfig(ARTIFACT)}
        vertical="rottay"
        visualAuthority={{ authority: 'compiled-artifact', artifact: ARTIFACT }}
      >
        <DensityProbe />
      </DesignSystemProvider>,
    );
    expect(screen.getByTestId('density-posture')).toHaveTextContent('compact');
    expect(document.documentElement).toHaveAttribute('data-density', 'compact');
    expect(document.documentElement.style.getPropertyValue('--ds-density-mode-factor')).toBe('');
  });
});
