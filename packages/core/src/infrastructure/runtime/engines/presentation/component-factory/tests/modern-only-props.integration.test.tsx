/**
 * `modernOnlyProps` -- a family names the props only its Modern implementation honors, and the router
 * drops them before any other engine renders: the frozen engines and every registered custom pack.
 */
import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { createEngineComponent } from '..';
import { EngineProvider } from '../../../composition/react/provider';
import { clearCustomRegistry, registerCustomComponents } from '../../../selection/customization/component-registry';
import { TenantContext } from '../../../../tenant/composition/react/provider';
import type { TenantConfig } from '../../../../../../foundation/contracts/composition/tenants';

interface WidgetProps {
  chrome?: 'standard' | 'none';
  label?: string;
}

function Widget(props: WidgetProps) {
  return <div data-testid="widget" data-props={JSON.stringify(props)} />;
}

const loader = () => Promise.resolve({ default: Widget });
const ChromeWidget = createEngineComponent<WidgetProps>(
  'ChromeWidget',
  { classic: loader, modern: loader, rustic: loader },
  { modernOnlyProps: ['chrome'] },
);
const received = async () => JSON.parse((await screen.findByTestId('widget')).getAttribute('data-props')!);

const tenant: TenantConfig = {
  slug: 'acme',
  name: 'Acme',
  theme: 'light',
  plan: 'enterprise',
  features: [],
  branding: { companyName: 'Acme' },
  componentPack: 'acme-pack',
};

beforeEach(() => clearCustomRegistry());
afterEach(() => cleanup());

describe('modernOnlyProps', () => {
  it('reaches the Modern implementation', async () => {
    render(<ChromeWidget engine="modern" chrome="none" label="kept" />);
    expect(await received()).toMatchObject({ chrome: 'none', label: 'kept' });
  });

  it.each(['classic', 'rustic'] as const)('is dropped before the frozen %s implementation renders', async (engine) => {
    render(<ChromeWidget engine={engine} chrome="none" label="kept" />);
    const props = await received();
    expect(props).not.toHaveProperty('chrome');
    expect(props.label).toBe('kept');
  });

  it('is dropped before a registered custom pack renders', async () => {
    registerCustomComponents({ ChromeWidget: Widget as React.ComponentType<unknown> }, 'acme-pack');
    render(
      <EngineProvider defaultEngine="custom">
        <TenantContext.Provider value={{ config: tenant, isLoading: false }}>
          <ChromeWidget chrome="none" label="kept" />
        </TenantContext.Provider>
      </EngineProvider>,
    );
    const props = await received();
    expect(props).not.toHaveProperty('chrome');
    expect(props.label).toBe('kept');
  });
});
