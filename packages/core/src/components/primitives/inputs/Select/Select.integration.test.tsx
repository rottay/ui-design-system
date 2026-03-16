import React, { Suspense, createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';

import { STABLE_ENGINES } from '../../../../testing/helpers/engine-test-utils';
import { renderWithEngine } from '../../../../testing/helpers/engine-test-utils';
import type { TenantConfig } from '../../../../contracts';

const OPTIONS = [
  { label: 'Alpha', value: 'alpha' },
  { label: 'Beta', value: 'beta' },
];

const TEST_TENANT_CONFIG: TenantConfig = {
  slug: 'test-tenant',
  name: 'Test Tenant',
  engine: 'classic',
  theme: 'base',
  locale: 'en',
  fallbackLocale: 'en',
  plan: 'enterprise',
  features: ['testing'],
  branding: {
    companyName: 'Test Tenant',
    primaryColor: '#2563eb',
    secondaryColor: '#0f766e',
    accentColor: '#7c3aed',
  },
};

describe('Select integration', () => {
  it.each(STABLE_ENGINES)('renders the live component with the %s engine', async (engine) => {
    const { Select } = await import('.');
    const { DesignSystemProvider } = await import('../../../../bootstrap');
    render(
      <DesignSystemProvider
        tenantConfig={{ ...TEST_TENANT_CONFIG, engine }}
        forceEngine={engine}
        skipCssLoading
      >
        <Suspense fallback={<div data-testid="loading">Loading...</div>}>
          <Select engine={engine} options={OPTIONS} placeholder="Select a record" />
        </Suspense>
      </DesignSystemProvider>
    );

    expect(await screen.findByRole('combobox', undefined, { timeout: 30000 })).toBeInTheDocument();
  }, 45000);

  it.each(STABLE_ENGINES)('forwards refs through the factory with the %s engine', async (engine) => {
    const { Select } = await import('.');
    const { DesignSystemProvider } = await import('../../../../bootstrap');
    const ref = createRef<any>();

    render(
      <DesignSystemProvider
        tenantConfig={{ ...TEST_TENANT_CONFIG, engine }}
        forceEngine={engine}
        skipCssLoading
      >
        <Suspense fallback={<div data-testid="loading">Loading...</div>}>
          <Select
            ref={ref}
            engine={engine}
            options={OPTIONS}
            placeholder="Forward select ref"
          />
        </Suspense>
      </DesignSystemProvider>
    );

    await screen.findByRole('combobox', undefined, { timeout: 30000 });
    expect(ref.current).toBeTruthy();
  });

  it.each(['modern', 'rustic'] as const)(
    'supports custom dropdown flows in the live %s engine',
    async (engine) => {
      const { Select } = await import('.');
      const handleChange = vi.fn();
      const handleSearch = vi.fn();

      const { container } = renderWithEngine(
        <Suspense fallback={<div data-testid="loading">Loading...</div>}>
          <Select
            engine={engine}
            options={OPTIONS}
            searchable
            multiple
            clearable
            name="records"
            placeholder="Search records"
            onChange={handleChange}
            onSearch={handleSearch}
          />
        </Suspense>,
        engine
      );

      fireEvent.click(await screen.findByText('Search records'));

      const searchInput =
        container.querySelector('input[type="text"]') ??
        screen.getByPlaceholderText('Search records');

      if (!(searchInput instanceof HTMLInputElement)) {
        throw new Error('Expected live search input for custom select');
      }

      fireEvent.change(searchInput, { target: { value: 'alp' } });
      expect(handleSearch).toHaveBeenCalledWith('alp');

      fireEvent.click(await screen.findByText('Alpha'));

      await waitFor(() => {
        expect(handleChange).toHaveBeenCalled();
      });

      const hiddenInput = container.querySelector('input[type="hidden"][name="records"]');
      expect(hiddenInput).toHaveAttribute('value', 'alpha');
      expect(screen.getByText('Alpha')).toBeInTheDocument();
    }
  );

  it.each(['modern', 'rustic'] as const)(
    'shows the empty search state in the live %s engine',
    async (engine) => {
      const { Select } = await import('.');
      const { container } = renderWithEngine(
        <Suspense fallback={<div data-testid="loading">Loading...</div>}>
          <Select
            engine={engine}
            options={OPTIONS}
            searchable
            placeholder="Search records"
          />
        </Suspense>,
        engine
      );

      fireEvent.click(await screen.findByText('Search records'));

      const searchInput =
        container.querySelector('input[type="text"]') ??
        screen.getByPlaceholderText('Search records');

      if (!(searchInput instanceof HTMLInputElement)) {
        throw new Error('Expected live search input for empty state test');
      }

      fireEvent.change(searchInput, { target: { value: 'zzz' } });

      expect(await screen.findByText(/No options (available)?/i)).toBeInTheDocument();
    }
  );

  it.each(['modern', 'rustic'] as const)(
    'supports native single-select changes in the live %s engine',
    async (engine) => {
      const { Select } = await import('.');
      const handleChange = vi.fn();

      renderWithEngine(
        <Suspense fallback={<div data-testid="loading">Loading...</div>}>
          <Select
            engine={engine}
            options={OPTIONS}
            placeholder="Pick one"
            onChange={handleChange}
          />
        </Suspense>,
        engine
      );

      if (engine === 'rustic') {
        fireEvent.click(await screen.findByRole('combobox'));
        fireEvent.click(await screen.findByText('Beta'));
      } else {
        const combobox = await screen.findByRole('combobox');
        fireEvent.change(combobox, { target: { value: 'beta' } });
      }

      await waitFor(() => {
        expect(handleChange).toHaveBeenCalledWith(
          'beta',
          expect.objectContaining({ value: 'beta' })
        );
      });
    }
  );
});
