import React, { Suspense } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { STABLE_ENGINES } from '../../../../testing/helpers/engine-test-utils';
import { DesignSystemProvider } from '../../../../core/providers';
import type { TenantConfig } from '../../../../core/types';
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
    secondaryColor: '#0f766e',
    accentColor: '#7c3aed',
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
});
