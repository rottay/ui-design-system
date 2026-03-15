import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DesignSystemProvider } from '../../../providers/root';
import { useTokens } from '..';
import type { TenantConfig } from '../../../types';

const TOKEN_TEST_TENANT: TenantConfig = {
  slug: 'token-test',
  name: 'Token Test',
  engine: 'classic',
  theme: 'light',
  plan: 'enterprise',
  features: ['all'],
  branding: {
    companyName: 'Token Test',
    primaryColor: '#111827',
    secondaryColor: '#7c3aed',
    accentColor: '#06b6d4',
  },
};

function TokenConsumer(): React.ReactElement {
  const tokens = useTokens();

  return (
    <div>
      <span data-testid="radius-md">{tokens.borderRadius.md}</span>
      <span data-testid="spacing-1">{tokens.spacing[1]}</span>
      <span data-testid="primary-color">{tokens.colors.primary}</span>
      <span data-testid="secondary-color">{tokens.colors.secondary}</span>
      <span data-testid="card-density">{tokens.personality.card.paddingDensity}</span>
    </div>
  );
}

describe('useTokens product profile resolution', () => {
  it('merges engine defaults, product profile, and tenant overrides in the expected order', () => {
    render(
      <DesignSystemProvider
        tenantConfig={TOKEN_TEST_TENANT}
        tenantOverrides={{
          branding: {
            companyName: 'Token Test Override',
            primaryColor: '#ef4444',
          },
          tokenOverrides: {
            borderRadius: {
              md: '22px',
            },
            densityScale: 1.2,
          },
          personality: {
            card: {
              paddingDensity: 'compact',
            },
          },
        }}
        productProfile="events.organizer"
        forceEngine="classic"
        skipCssLoading
      >
        <TokenConsumer />
      </DesignSystemProvider>
    );

    expect(screen.getByTestId('radius-md')).toHaveTextContent('22px');
    expect(screen.getByTestId('spacing-1')).toHaveTextContent('5');
    expect(screen.getByTestId('primary-color')).toHaveTextContent('#ef4444');
    expect(screen.getByTestId('secondary-color')).toHaveTextContent('#7c3aed');
    expect(screen.getByTestId('card-density')).toHaveTextContent('compact');
  });
});
