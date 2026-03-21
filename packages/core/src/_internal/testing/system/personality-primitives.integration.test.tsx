/**
 * @fileoverview Integration tests verifying personality tokens propagate to
 * runtime CSS variables and inline styles for Button, Card, Badge, Tag,
 * Skeleton, Divider, Statistic, and Typography across all engines. Also
 * validates that switching product profiles and tenants updates resolved tokens.
 */

import React, { Suspense } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { DesignSystemProvider } from '../../bootstrap';
import type { EngineName, ProductProfileKey, TenantConfig } from '../../contracts';
import {
  Badge,
  Button,
  Card,
  Divider,
  Skeleton,
  Statistic,
  Tag,
  Typography,
} from '../../components/primitives';

class IntersectionObserverMock {
  constructor(private readonly callback: IntersectionObserverCallback) {}

  observe = vi.fn((element: Element) => {
    this.callback(
      [
        {
          isIntersecting: true,
          intersectionRatio: 1,
          target: element,
        } as IntersectionObserverEntry,
      ],
      this as unknown as IntersectionObserver
    );
  });

  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);
}

const EVNTO_TENANT: TenantConfig = {
  slug: 'evnto-test',
  name: 'Evnto Test',
  engine: 'classic',
  theme: 'base',
  locale: 'en',
  fallbackLocale: 'en',
  plan: 'enterprise',
  features: ['events'],
  branding: {
    companyName: 'Evnto Test',
    primaryColor: '#f97316',
    secondaryColor: '#0f766e',
    accentColor: '#8b5cf6',
  },
};

const BITHIRE_TENANT: TenantConfig = {
  slug: 'bithire-test',
  name: 'BitHire Test',
  engine: 'classic',
  theme: 'base',
  locale: 'en',
  fallbackLocale: 'en',
  plan: 'enterprise',
  features: ['recruiting'],
  branding: {
    companyName: 'BitHire Test',
    primaryColor: '#0a66c2',
    secondaryColor: '#22c55e',
    accentColor: '#7c3aed',
  },
};

function renderWithProfile(
  ui: React.ReactNode,
  engine: EngineName,
  tenantConfig: TenantConfig,
  productProfile: ProductProfileKey
) {
  return render(
    <DesignSystemProvider
      tenantConfig={{ ...tenantConfig, engine }}
      forceEngine={engine}
      productProfile={productProfile}
      skipCssLoading
    >
      <Suspense fallback={<div data-testid="loading">Loading...</div>}>{ui}</Suspense>
    </DesignSystemProvider>
  );
}

describe('primitive personality integration', () => {
  beforeAll(async () => {
    await Promise.all([
      import('../../components/primitives/inputs/Button/engines/classic'),
      import('../../components/primitives/inputs/Button/engines/modern'),
      import('../../components/primitives/inputs/Button/engines/rustic'),
      import('../../components/primitives/display/Card/engines/classic'),
      import('../../components/primitives/display/Card/engines/modern'),
      import('../../components/primitives/display/Card/engines/rustic'),
      import('../../components/primitives/display/Badge/engines/classic'),
      import('../../components/primitives/display/Badge/engines/modern'),
      import('../../components/primitives/display/Badge/engines/rustic'),
      import('../../components/primitives/display/Tag/engines/classic'),
      import('../../components/primitives/display/Tag/engines/modern'),
      import('../../components/primitives/display/Tag/engines/rustic'),
      import('../../components/primitives/feedback/Skeleton/engines/classic'),
      import('../../components/primitives/feedback/Skeleton/engines/modern'),
      import('../../components/primitives/feedback/Skeleton/engines/rustic'),
      import('../../components/primitives/layout/Divider/engines/classic'),
      import('../../components/primitives/layout/Divider/engines/modern'),
      import('../../components/primitives/layout/Divider/engines/rustic'),
      import('../../components/primitives/display/Statistic/engines/classic'),
      import('../../components/primitives/display/Statistic/engines/modern'),
      import('../../components/primitives/display/Statistic/engines/rustic'),
      import('../../components/primitives/display/Typography/engines/classic'),
      import('../../components/primitives/display/Typography/engines/modern'),
      import('../../components/primitives/display/Typography/engines/rustic'),
    ]);
  });

  beforeEach(() => {
    vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.each(['classic', 'modern', 'rustic'] as const)(
    'bridges personality and tenant branding into runtime styles for %s',
    async (engine) => {
      const buttonView = renderWithProfile(
        <Button>Primary action</Button>,
        engine,
        EVNTO_TENANT,
        'events.organizer'
      );

      const button = await screen.findByRole('button', { name: /primary action/i }, { timeout: 15000 });

      expect(document.documentElement.style.getPropertyValue('--ds-color-primary')).toBe('#f97316');
      expect(document.documentElement.style.getPropertyValue('--ds-card-shadow')).toBe('var(--ds-shadow-md)');
      expect(document.documentElement.style.getPropertyValue('--ds-badge-radius')).toBe('var(--ds-radius-full)');
      expect(document.documentElement.style.getPropertyValue('--ds-typography-label-transform')).toBe('capitalize');
      expect(document.documentElement.style.getPropertyValue('--ds-personality-animation-entrance')).toBe('slideUp');
      expect(button.getAttribute('style') ?? '').toContain('--ds-button-hover-transform');

      buttonView.unmount();

      const cardView = renderWithProfile(
        <Card data-testid="card">
          <Card.Body>Card content</Card.Body>
        </Card>,
        engine,
        EVNTO_TENANT,
        'events.organizer'
      );
      expect(await screen.findByText('Card content', undefined, { timeout: 15000 })).toBeInTheDocument();
      expect(document.documentElement.style.getPropertyValue('--ds-card-shadow')).toBe('var(--ds-shadow-md)');
      cardView.unmount();

      const badgeView = renderWithProfile(
        <div>
          <Badge content="3" />
          <Tag>Live</Tag>
        </div>,
        engine,
        EVNTO_TENANT,
        'events.organizer'
      );
      expect(await screen.findByText('3', undefined, { timeout: 15000 })).toBeInTheDocument();
      expect(screen.getByText('Live')).toBeInTheDocument();
      expect(document.documentElement.style.getPropertyValue('--ds-badge-radius')).toBe('var(--ds-radius-full)');
      badgeView.unmount();

      const skeletonView = renderWithProfile(
        <Skeleton data-testid="skeleton" active />,
        engine,
        EVNTO_TENANT,
        'events.organizer'
      );
      await waitFor(() => {
        expect(
          skeletonView.container.querySelector('[style*="--ds-skeleton-animation-duration"]')
        ).toBeTruthy();
      });
      const skeleton = skeletonView.container.querySelector(
        '[style*="--ds-skeleton-animation-duration"]'
      ) as HTMLElement | null;
      if (!skeleton) {
        throw new Error(`Skeleton root did not render for ${engine}`);
      }
      expect(skeleton.getAttribute('style') ?? '').toContain('--ds-skeleton-animation-duration');
      skeletonView.unmount();

      const dividerView = renderWithProfile(
        <Divider data-testid="divider">Section</Divider>,
        engine,
        EVNTO_TENANT,
        'events.organizer'
      );
      const divider = await screen.findByTestId('divider', undefined, { timeout: 15000 });
      expect(divider.getAttribute('style') ?? '').toContain('--ds-divider-style');
      dividerView.unmount();

      const statisticView = renderWithProfile(
        <Statistic data-testid="statistic" title="Bookings" value={42} animateValue={false} />,
        engine,
        EVNTO_TENANT,
        'events.organizer'
      );
      await waitFor(() => {
        expect(
          statisticView.container.querySelector('[style*="--ds-statistic-count-up-enabled"]')
        ).toBeTruthy();
      });
      const statistic = statisticView.container.querySelector(
        '[style*="--ds-statistic-count-up-enabled"]'
      ) as HTMLElement | null;
      if (!statistic) {
        throw new Error(`Statistic root did not render for ${engine}`);
      }
      expect(statistic.getAttribute('style') ?? '').toContain('--ds-statistic-count-up-enabled');
      statisticView.unmount();

      const typographyView = renderWithProfile(
        <Typography.Text as="label">Display name</Typography.Text>,
        engine,
        EVNTO_TENANT,
        'events.organizer'
      );
      expect(await screen.findByText('Display name', undefined, { timeout: 15000 })).toBeInTheDocument();
      expect(document.documentElement.style.getPropertyValue('--ds-typography-label-transform')).toBe('capitalize');
      typographyView.unmount();
    }
  );

  it('changes the resolved personality and branding when switching product profile and tenant', () => {
    const { rerender } = renderWithProfile(
      <div>
        <Button>Primary action</Button>
        <Card>
          <Card.Body>Card content</Card.Body>
        </Card>
        <Typography.Text as="label">Display name</Typography.Text>
      </div>,
      'rustic',
      EVNTO_TENANT,
      'events.organizer'
    );

    expect(document.documentElement.style.getPropertyValue('--ds-card-shadow')).toBe('var(--ds-shadow-md)');
    expect(document.documentElement.style.getPropertyValue('--ds-typography-label-transform')).toBe('capitalize');
    expect(document.documentElement.style.getPropertyValue('--ds-color-primary')).toBe('#f97316');

    rerender(
      <DesignSystemProvider
        tenantConfig={{ ...BITHIRE_TENANT, engine: 'rustic' }}
        forceEngine="rustic"
        productProfile="recruiting.operator"
        skipCssLoading
      >
        <div>
          <Button>Primary action</Button>
          <Card>
            <Card.Body>Card content</Card.Body>
          </Card>
          <Typography.Text as="label">Display name</Typography.Text>
        </div>
      </DesignSystemProvider>
    );

    expect(document.documentElement.style.getPropertyValue('--ds-card-shadow')).toBe('var(--ds-shadow-sm)');
    expect(document.documentElement.style.getPropertyValue('--ds-typography-label-transform')).toBe('uppercase');
    expect(document.documentElement.style.getPropertyValue('--ds-color-primary')).toBe('#0a66c2');
  });
});
