import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DesignSystemProvider } from '@/infrastructure/runtime/bootstrap';
import { useTokens } from '..';
import type { TenantConfig } from '@/foundation/contracts';
import { getKnownTenantConfig } from '@/infrastructure/runtime/tenant/foundation/configuration/registry';

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
    accentColor: '#0e7490',
    darkPrimaryColor: '#93c5fd',
    darkSecondaryColor: '#a78bfa',
    darkAccentColor: '#22d3ee',
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

function EvntoAxes({ testId }: { testId: string }): React.ReactElement {
  const tokens = useTokens();
  return (
    <pre data-testid={testId}>{JSON.stringify({
      densitySpacing: tokens.spacing,
      radius: tokens.borderRadius,
      depth: tokens.shadows,
      motion: tokens.personality.animation,
    })}</pre>
  );
}

function DensitySpacing({ testId }: { testId: string }): React.ReactElement {
  const tokens = useTokens();
  return <span data-testid={testId}>{tokens.spacing[4]}</span>;
}

describe('useTokens product profile resolution', () => {
  it('merges engine defaults, product profile, and tenant overrides in the expected order', () => {
    render(
      <DesignSystemProvider
        tenantConfig={TOKEN_TEST_TENANT}
        tenantOverrides={{
          branding: {
            companyName: 'Token Test Override',
            primaryColor: '#991b1b',
            darkPrimaryColor: '#fca5a5',
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
    expect(screen.getByTestId('primary-color')).toHaveTextContent('#991b1b');
    expect(screen.getByTestId('secondary-color')).toHaveTextContent('#7c3aed');
    expect(screen.getByTestId('card-density')).toHaveTextContent('compact');
  });

  it('resolves identical structural and motion axes for bundled and custom Evnto', () => {
    const bundled = getKnownTenantConfig('evnto');
    if (!bundled) throw new Error('Missing bundled Evnto tenant');
    const custom: TenantConfig = {
      slug: 'custom-evnto',
      name: 'Custom Evnto',
      theme: 'light',
      plan: 'starter',
      features: [],
      vertical: 'evnto',
      branding: { companyName: 'Custom Evnto' },
    };

    render(
      <>
        <DesignSystemProvider tenantConfig={bundled} vertical="evnto" skipCssLoading>
          <EvntoAxes testId="bundled-evnto-axes" />
        </DesignSystemProvider>
        <DesignSystemProvider tenantConfig={custom} vertical="evnto" skipCssLoading>
          <EvntoAxes testId="custom-evnto-axes" />
        </DesignSystemProvider>
      </>,
    );

    expect(screen.getByTestId('custom-evnto-axes').textContent)
      .toBe(screen.getByTestId('bundled-evnto-axes').textContent);
  });

  it('composes tenant structural scale with the canonical appearance factor', () => {
    render(
      <>
        <DesignSystemProvider
          tenantConfig={TOKEN_TEST_TENANT}
          tenantOverrides={{
            tokenOverrides: { densityScale: 1.2 },
            appearance: { general: { density: 'normal' } },
          }}
          forceEngine="classic"
          skipCssLoading
        >
          <DensitySpacing testId="normal-density-spacing" />
        </DesignSystemProvider>
        <DesignSystemProvider
          tenantConfig={TOKEN_TEST_TENANT}
          tenantOverrides={{
            tokenOverrides: { densityScale: 1.2 },
            appearance: { general: { density: 'compact' } },
          }}
          forceEngine="classic"
          skipCssLoading
        >
          <DensitySpacing testId="compact-density-spacing" />
        </DesignSystemProvider>
      </>,
    );

    // spacing[4] = 16px. normal: 16 * 1.2; compact: 16 * 1.2 * 0.85.
    expect(screen.getByTestId('normal-density-spacing')).toHaveTextContent('19');
    expect(screen.getByTestId('compact-density-spacing')).toHaveTextContent('16');
  });
});
