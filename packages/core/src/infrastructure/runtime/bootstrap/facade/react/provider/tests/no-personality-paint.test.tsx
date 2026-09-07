/**
 * @fileoverview F-17 closure (bridge portion): the provider paints nothing.
 *
 * `SystemCssVariablesBridge` was mounted unconditionally inside
 * `DesignSystemProvider` and published ~60 `--ds-personality-*` custom
 * properties into a `:root` rule on every render. That made the documented
 * claim "the provider does not paint under `compiled-artifact`" false, and it
 * put a JS writer beside the compiled artifact on the same channel.
 *
 * WO-CAN-04 deleted the writer. Personality reaches CSS through the compiled
 * artifact and the static projection in
 * `foundation/tokens/css/runtime/personality/index.css`, whose chained
 * fallbacks are what render when a tenant declares nothing.
 */

import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { DesignSystemProvider } from '..';
import type { TenantConfig } from '@/foundation/contracts';

const IDENTITY_ONLY_TENANT: TenantConfig = {
  slug: 'personality-paint-probe',
  name: 'Personality Paint Probe',
  engine: 'modern',
  theme: 'light',
  plan: 'enterprise',
  features: ['all'],
  branding: { companyName: 'Personality Paint Probe' },
};

describe('DesignSystemProvider personality paint', () => {
  it('mounts no personality style singleton and writes no personality custom property', async () => {
    render(
      <DesignSystemProvider tenantConfig={IDENTITY_ONLY_TENANT} forceEngine="modern" skipCssLoading>
        <output data-testid="child">mounted</output>
      </DesignSystemProvider>,
    );

    await screen.findByTestId('child');

    expect(document.getElementById('ds-personality-tokens')).toBeNull();

    const emitted = [...document.querySelectorAll('style')]
      .map((node) => node.textContent ?? '')
      .filter((text) => text.includes('--ds-personality-'));
    expect(emitted).toEqual([]);

    const rootInline = document.documentElement.getAttribute('style') ?? '';
    expect(rootInline).not.toContain('--ds-personality-');
  });
});
