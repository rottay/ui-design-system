import React, { Suspense } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { STABLE_ENGINES } from '../../../../../_internal/testing/helpers/engine-test-utils';
import { mockMatchMedia } from '../../../../../_internal/testing/helpers/match-media';
import { DesignSystemProvider } from '../../../../../runtime/bootstrap';
import type { TenantConfig } from '../../../../../contracts';
import { PatternDataTable } from '..';

const rows = [
  { id: 'evt-1', name: 'Spring Summit', venue: 'Brooklyn Hall', attendance: 1240 },
  { id: 'evt-2', name: 'Night Market', venue: 'Pier 3', attendance: 860 },
];

const TEST_TENANT_CONFIG: TenantConfig = {
  slug: 'pattern-test',
  name: 'Pattern Test Tenant',
  engine: 'classic',
  theme: 'base',
  locale: 'en',
  fallbackLocale: 'en',
  plan: 'enterprise',
  features: ['testing'],
  branding: {
    companyName: 'Pattern Test Tenant',
    primaryColor: '#2563eb',
    darkPrimaryColor: '#60a5fa',
    secondaryColor: '#0f766e',
    darkSecondaryColor: '#5eead4',
    accentColor: '#7c3aed',
    darkAccentColor: '#c4b5fd',
  },
};

describe('PatternDataTable integration', () => {
  it.each(STABLE_ENGINES)('renders the live pattern with the %s engine', async (engine) => {
    render(
      <DesignSystemProvider
        tenantConfig={{ ...TEST_TENANT_CONFIG, engine }}
        forceEngine={engine}
        skipCssLoading
      >
        <Suspense fallback={<div data-testid="loading">Loading...</div>}>
          <PatternDataTable
            engine={engine}
            data={rows}
            rowKey="id"
            columns={[
              { key: 'name', header: 'Event', accessorKey: 'name' },
              { key: 'venue', header: 'Venue', accessorKey: 'venue' },
              {
                key: 'attendance',
                header: 'Attendance',
                accessorKey: 'attendance',
                align: 'right',
              },
            ]}
            bordered
            hoverable
          />
        </Suspense>
      </DesignSystemProvider>
    );

    expect(await screen.findByText('Event', undefined, { timeout: 30000 })).toBeInTheDocument();
    expect(await screen.findByText('Spring Summit', undefined, { timeout: 30000 })).toBeInTheDocument();
    expect(await screen.findByText('Night Market', undefined, { timeout: 30000 })).toBeInTheDocument();
  }, 45000);

  it.each(STABLE_ENGINES)('falls back to mobile cards with the %s engine', async (engine) => {
    mockMatchMedia(390);

    render(
      <DesignSystemProvider
        tenantConfig={{ ...TEST_TENANT_CONFIG, engine }}
        forceEngine={engine}
        skipCssLoading
      >
        <Suspense fallback={<div data-testid="loading">Loading...</div>}>
          <PatternDataTable
            engine={engine}
            data={rows}
            rowKey="id"
            columns={[
              { key: 'name', header: 'Event', accessorKey: 'name' },
              { key: 'venue', header: 'Venue', accessorKey: 'venue' },
              {
                key: 'attendance',
                header: 'Attendance',
                accessorKey: 'attendance',
                align: 'right',
              },
            ]}
          />
        </Suspense>
      </DesignSystemProvider>
    );

    expect(await screen.findByText('Spring Summit', undefined, { timeout: 30000 })).toBeInTheDocument();
    expect(await screen.findByText('Brooklyn Hall', undefined, { timeout: 30000 })).toBeInTheDocument();
    expect(screen.queryByText('Event')).not.toBeInTheDocument();
  }, 45000);
});
