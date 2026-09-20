import React from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';

import { renderWithEngine } from '@tests/support/engine';
import type { PricingTableProps } from '../contracts';
import ModernPricingTable from '../engines/modern';

function createProps(overrides: Partial<PricingTableProps> = {}): PricingTableProps {
  return {
    plans: [
      { id: 'starter', name: 'Starter', price: 0, cta: 'Start', features: { sso: false } },
      { id: 'pro', name: 'Pro', price: 29, cta: 'Upgrade', features: { sso: true } },
    ],
    features: [
      { key: 'sso', label: 'SSO', description: 'Single sign-on through SAML or OIDC' },
    ],
    ...overrides,
  };
}

describe('ModernPricingTable - described feature label', () => {
  it('carries the tooltip description while the label is stamped', async () => {
    renderWithEngine(<ModernPricingTable {...createProps()} />, 'modern');

    const table = await screen.findByRole('table', { name: 'Plan comparison' });
    const label = table.querySelector('[data-part="feature-label"]') as HTMLElement;
    expect(label).not.toBeNull();

    // Tooltip decorates its child through `cloneElement`; a label component
    // that swallowed those props would keep the bubble and lose the relation.
    expect(label).not.toHaveAttribute('aria-describedby');
    expect(label).not.toHaveAttribute('data-state');

    fireEvent.focus(label);

    const bubble = await screen.findByRole('tooltip');
    expect(bubble).toHaveTextContent('Single sign-on through SAML or OIDC');
    expect(label).toHaveAttribute('aria-describedby', bubble.id);
    // The stamp and the injected description occupy the same element.
    expect(label.getAttribute('data-state')?.split(' ')).toContain('focus-visible');
  });

  it('keeps an undescribed label out of the description relation', async () => {
    renderWithEngine(
      <ModernPricingTable
        {...createProps({ features: [{ key: 'sso', label: 'SSO' }] })}
      />,
      'modern',
    );

    const table = await screen.findByRole('table', { name: 'Plan comparison' });
    expect(table.querySelector('[data-part="feature-label"]')).toBeNull();
    expect(screen.queryByRole('tooltip')).toBeNull();
  });
});
