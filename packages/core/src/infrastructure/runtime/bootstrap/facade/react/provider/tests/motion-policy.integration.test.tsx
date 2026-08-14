import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import type { TenantConfig, TenantMotionDial } from '../../../../../../../foundation/contracts';
import type { TenantThemeArtifact } from '@/foundation/contracts/composition/tenants/themes/tenant-theme';
import {
  compileTenantThemeConfig,
  getTenantThemeVerticalEnvelope,
  hydrateTenantThemeConfig,
} from '@/infrastructure/compilers/composition/tenant-theme';
import {
  TENANT_THEME_ARTIFACT_DIGEST_ATTRIBUTE,
  TENANT_THEME_ARTIFACT_SLUG_ATTRIBUTE,
  TENANT_THEME_ARTIFACT_VERTICAL_ATTRIBUTE,
} from '@/infrastructure/runtime/theming';
import { useMotionPolicy } from '../../../../../motion';
import { DesignSystemProvider } from '..';

function artifact(slug: string, verticalKey: 'evnto' | 'rottay', motion: TenantMotionDial) {
  return compileTenantThemeConfig(
    hydrateTenantThemeConfig({
      schemaVersion: 1,
      mode: 'simple',
      appearance: { motion },
    }, {
      tenantId: `tenant_${slug}`,
      slug,
      verticalKey,
      rowVersion: 1,
    }),
    { verticalEnvelope: getTenantThemeVerticalEnvelope(verticalKey) },
  );
}

function config(value: TenantThemeArtifact): TenantConfig {
  return {
    slug: value.slug,
    name: value.slug,
    engine: 'modern',
    theme: 'base',
    plan: 'enterprise',
    features: [],
    branding: { companyName: value.slug },
    appearance: value.normalizedAppearance,
  } as TenantConfig;
}

function mountArtifact(value: TenantThemeArtifact): HTMLStyleElement {
  const style = document.createElement('style');
  style.id = `motion-artifact-${value.slug}`;
  style.setAttribute(TENANT_THEME_ARTIFACT_DIGEST_ATTRIBUTE, value.digest);
  style.setAttribute(TENANT_THEME_ARTIFACT_SLUG_ATTRIBUTE, value.slug);
  style.setAttribute(TENANT_THEME_ARTIFACT_VERTICAL_ATTRIBUTE, value.verticalKey);
  style.textContent = value.css;
  document.head.appendChild(style);
  return style;
}

function MotionPolicyProbe(): React.ReactElement {
  const policy = useMotionPolicy();
  return <output data-testid="motion-policy">{JSON.stringify(policy)}</output>;
}

function renderArtifact(value: TenantThemeArtifact) {
  mountArtifact(value);
  return render(
    <DesignSystemProvider
      vertical={value.verticalKey as 'evnto' | 'rottay'}
      tenantConfig={config(value)}
      visualAuthority={{ authority: 'compiled-artifact', artifact: value }}
    >
      <MotionPolicyProbe />
    </DesignSystemProvider>,
  );
}

afterEach(() => {
  cleanup();
  document.querySelectorAll('[id^="motion-artifact-"]').forEach((node) => node.remove());
});

describe('DesignSystemProvider motion policy ownership', () => {
  it('combines the vertical profile with the verified artifact dial', () => {
    const value = artifact('motion-evnto', 'evnto', {
      intensity: 0.62,
      durationScale: 1.3,
      ambient: 'off',
    });
    renderArtifact(value);
    expect(JSON.parse(screen.getByTestId('motion-policy').textContent ?? '{}')).toMatchObject({
      profile: 'expressive',
      intensity: 0.62,
      durationScale: 1.3,
      ambient: 'off',
    });
  });

  it('is invariant to tenant identity for the same vertical and compiled dial', () => {
    const dial: TenantMotionDial = {
      intensity: 0.4,
      durationScale: 0.75,
      ambient: 'subtle',
    };
    const first = renderArtifact(artifact('motion-a', 'rottay', dial));
    const firstPolicy = screen.getByTestId('motion-policy').textContent;
    first.unmount();
    document.getElementById('motion-artifact-motion-a')?.remove();
    renderArtifact(artifact('motion-b', 'rottay', dial));
    expect(screen.getByTestId('motion-policy').textContent).toBe(firstPolicy);
  });
});
