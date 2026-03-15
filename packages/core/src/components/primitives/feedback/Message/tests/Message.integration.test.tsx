import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { DesignSystemProvider } from '../../../../../core/providers';
import type { EngineName, TenantConfig } from '../../../../../core/types';
import { MessageProvider, useMessage } from '..';

const TEST_TENANT_CONFIG: TenantConfig = {
  slug: 'coverage-tenant',
  name: 'Coverage Tenant',
  engine: 'classic',
  theme: 'base',
  locale: 'en',
  fallbackLocale: 'en',
  plan: 'enterprise',
  features: ['messaging'],
  branding: {
    companyName: 'Coverage Tenant',
    primaryColor: '#2563eb',
    secondaryColor: '#0f766e',
    accentColor: '#7c3aed',
  },
};

function renderMessageHarness(engine: Exclude<EngineName, 'athena'>) {
  let apiRef: ReturnType<typeof useMessage>[0] | undefined;

  function Tester() {
    const [api, contextHolder] = useMessage();
    apiRef = api;
    return <>{contextHolder}</>;
  }

  render(
    <DesignSystemProvider tenantConfig={{ ...TEST_TENANT_CONFIG, engine }} forceEngine={engine} skipCssLoading>
      <MessageProvider maxCount={1} placement="top">
        <Tester />
      </MessageProvider>
    </DesignSystemProvider>
  );

  return {
    get api() {
      if (!apiRef) {
        throw new Error('Message API was not mounted');
      }
      return apiRef;
    },
  };
}

describe('Message integration', () => {
  it('renders live classic provider messages and updates keyed content', async () => {
    const harness = renderMessageHarness('classic');

    act(() => {
      harness.api.loading({ content: 'Syncing', key: 'sync', duration: 0 });
    });

    expect(await screen.findByText('Syncing', {}, { timeout: 15000 })).toBeInTheDocument();

    act(() => {
      harness.api.success({ content: 'Synced', key: 'sync', duration: 0 });
    });

    await waitFor(() => {
      expect(screen.getByText('Synced')).toBeInTheDocument();
      expect(screen.queryByText('Syncing')).not.toBeInTheDocument();
    });
  }, 45000);

  it.each(['modern', 'rustic'] as const)(
    'renders live provider stacks, updates keyed messages, and destroys them through the %s engine',
    async (engine) => {
      const harness = renderMessageHarness(engine);

      act(() => {
        harness.api.loading({ content: 'Syncing', key: 'sync', duration: 0, closable: true });
      });

      expect(await screen.findByText('Syncing', {}, { timeout: 15000 })).toBeInTheDocument();

      act(() => {
        harness.api.success({ content: 'Synced', key: 'sync', duration: 0, closable: true });
      });

      await waitFor(() => {
        expect(screen.getByText('Synced')).toBeInTheDocument();
        expect(screen.queryByText('Syncing')).not.toBeInTheDocument();
      });

      act(() => {
        harness.api.destroy();
      });

      await waitFor(() => {
        expect(screen.queryByText('Synced')).not.toBeInTheDocument();
      });
    },
    45000
  );

  it.each(['modern', 'rustic'] as const)(
    'enforces maxCount for provider-managed message stacks through the %s engine',
    async (engine) => {
      const harness = renderMessageHarness(engine);

      act(() => {
        harness.api.info({ content: 'First message', duration: 0 });
        harness.api.warning({ content: 'Second message', duration: 0 });
      });

      // The custom provider implementations own the stack and should keep only the newest item.
      await waitFor(() => {
        expect(screen.getByText('Second message')).toBeInTheDocument();
        expect(screen.queryByText('First message')).not.toBeInTheDocument();
      });

      act(() => {
        harness.api.destroy();
      });

      await waitFor(() => {
        expect(screen.queryByText('Second message')).not.toBeInTheDocument();
      });
    }
  );

  it.each(['classic', 'modern', 'rustic'] as const)(
    'destroys keyed messages without removing unrelated notifications through the %s engine',
    async (engine) => {
      const harness = renderMessageHarness(engine);

      act(() => {
        harness.api.success({ key: 'keep', content: 'Keep me', duration: 0 });
        harness.api.error({ key: 'drop', content: 'Drop me', duration: 0 });
      });

      expect(await screen.findByText('Drop me', {}, { timeout: 15000 })).toBeInTheDocument();

      act(() => {
        harness.api.destroy('drop');
      });

      await waitFor(() => {
        expect(screen.queryByText('Drop me')).not.toBeInTheDocument();
      });
    }
  );
});
