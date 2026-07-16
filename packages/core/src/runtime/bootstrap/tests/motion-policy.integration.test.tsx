import React from 'react';
import { render, waitFor, type RenderResult } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { TenantConfig, TenantMotionDial } from '../../../contracts';
import { useMotionPolicy } from '../../motion';
import { DesignSystemProvider } from '../DesignSystemProvider';

interface MotionPolicyProjection {
  profile: string;
  intensity: number;
  durationScale: number;
  ambient: string;
}

function tenantConfig(slug: string, motion: TenantMotionDial): TenantConfig {
  return {
    slug,
    name: slug,
    engine: 'modern',
    theme: 'base',
    plan: 'enterprise',
    features: [],
    branding: { companyName: slug },
    appearance: { general: { motion } },
  };
}

function MotionPolicyProbe(): React.ReactElement {
  const policy = useMotionPolicy();
  const projection: MotionPolicyProjection = {
    profile: policy.profile,
    intensity: policy.intensity,
    durationScale: policy.durationScale,
    ambient: policy.ambient,
  };

  return <output data-testid="motion-policy">{JSON.stringify(projection)}</output>;
}

async function readPolicy(rendered: RenderResult): Promise<MotionPolicyProjection> {
  const output = await waitFor(() => {
    const element = rendered.getByTestId('motion-policy');
    expect(element.textContent).toBeTruthy();
    return element;
  });

  return JSON.parse(output.textContent ?? '{}') as MotionPolicyProjection;
}

describe('DesignSystemProvider motion policy ownership', () => {
  it('derives the semantic profile from the vertical and the bounded dial from appearance', async () => {
    const rendered = render(
      <DesignSystemProvider
        vertical="evnto"
        tenantConfig={tenantConfig('any-db-tenant', {
          intensity: 0.62,
          durationScale: 1.3,
          ambient: 'off',
        })}
        skipCssLoading
      >
        <MotionPolicyProbe />
      </DesignSystemProvider>,
    );

    await expect(readPolicy(rendered)).resolves.toEqual({
      profile: 'expressive',
      intensity: 0.62,
      durationScale: 1.3,
      ambient: 'off',
    });
  });

  it('is invariant to tenant identity when vertical and DB dial are identical', async () => {
    const dial: TenantMotionDial = {
      intensity: 0.4,
      durationScale: 0.75,
      ambient: 'subtle',
    };
    const first = render(
      <DesignSystemProvider
        vertical="platform"
        tenantConfig={tenantConfig('bithire', dial)}
        skipCssLoading
      >
        <MotionPolicyProbe />
      </DesignSystemProvider>,
    );
    const firstPolicy = await readPolicy(first);
    first.unmount();

    const second = render(
      <DesignSystemProvider
        vertical="platform"
        tenantConfig={tenantConfig('themanagementmiami', dial)}
        skipCssLoading
      >
        <MotionPolicyProbe />
      </DesignSystemProvider>,
    );

    expect(await readPolicy(second)).toEqual(firstPolicy);
    expect(firstPolicy).toEqual({
      profile: 'precise',
      intensity: 0.4,
      durationScale: 0.75,
      ambient: 'subtle',
    });
  });
});
