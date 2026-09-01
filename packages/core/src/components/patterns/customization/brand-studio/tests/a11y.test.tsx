/**
 * BrandStudio accessibility contract (Lane B).
 *
 * Fails against the pre-change pattern: each editor section title was
 * decorative text over an unnamed Box, so assistive tech read ~40 bare fields
 * with no owning group; and the hostile-check result was inserted with no live
 * region, so a keyboard user who pressed the button was told nothing.
 */

import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DesignSystemProvider } from '../../../../../infrastructure/runtime/bootstrap';
import type { TenantConfig } from '../../../../../foundation/contracts';
import type { BrandTheme } from '../../../../../foundation/contracts/composition/tenants/themes';
import { PatternBrandStudio } from '../index';

const TEST_TENANT: TenantConfig = {
  slug: 'brand-studio-a11y',
  name: 'Brand Studio A11y',
  engine: 'rustic',
  theme: 'light',
  plan: 'enterprise',
  features: ['all'],
  branding: { companyName: 'Brand Studio A11y' },
};

const THEME: BrandTheme = { id: 'a11y', name: 'A11y', palette: { primaryColor: '#4f46e5' } };

async function renderStudio(): Promise<void> {
  render(
    <DesignSystemProvider tenantConfig={TEST_TENANT} forceEngine="rustic" skipCssLoading>
      <PatternBrandStudio value={THEME} />
    </DesignSystemProvider>
  );
  await screen.findByText('Run check');
}

describe('PatternBrandStudio editor grouping', () => {
  it('names every editor section as a group so its fields inherit that context', async () => {
    await renderStudio();

    for (const name of ['Palette', 'Typography', 'Surfaces', 'Motion', 'Chrome']) {
      expect(screen.getByRole('group', { name })).toBeInTheDocument();
    }

    // The grouping is real containment, not a floating label.
    const palette = screen.getByRole('group', { name: 'Palette' });
    expect(within(palette).getByLabelText('Primary')).toBeInTheDocument();
    expect(within(palette).queryByLabelText('Card bg')).toBeNull();
    expect(within(screen.getByRole('group', { name: 'Chrome' })).getByLabelText('Card bg')).toBeInTheDocument();
  });
});

describe('PatternBrandStudio hostile-check announcement', () => {
  it('delivers the on-demand result through a live region', async () => {
    await renderStudio();

    expect(screen.queryByRole('status')).toBeNull();

    fireEvent.click(screen.getByText('Run check'));

    const status = screen.getByRole('status');
    // Both grounds report inside the announced region, not beside it.
    expect(within(status).getAllByText(/ground contrast/i).length).toBe(2);
    expect(within(status).getAllByText('text-on-surfaceCard').length).toBeGreaterThan(0);
  });
});
