/**
 * @fileoverview Integration tests verifying personality tokens propagate to
 * runtime CSS variables and inline styles for Button, Card, Badge, Tag,
 * Skeleton, Divider, Statistic, and Typography across all engines, and that
 * switching product profile and tenant moves the resolved personality.
 *
 * WHY THE TENANT FIXTURES CARRY NO COLORS. They used to, and the four tests
 * here went red as a result -- not because personality broke, but because a
 * tenant config carrying `primaryColor` is now a REFUSED config. Visual
 * authority admission (`theming/foundation/visual-authority/foundation/
 * admission`) treats runtime visual branding with no verified mounted artifact
 * as fail-closed: it blocks, announces `carries runtime visual payload but no
 * verified mounted artifact`, and the subtree renders NOTHING. The old fixture
 * was asking the provider to paint `--ds-color-primary: #c2410c` onto
 * `<html>`, which is exactly the second paint authority the compiled-artifact
 * model exists to remove.
 *
 * So the tenants below carry identity only. The refusal is not skirted, it is
 * pinned: the last describe hands the provider the old illegal payload and
 * proves both halves of the outcome -- no paint AND no tree. Losing the tree is
 * the part worth stating out loud, because a tenant whose colors cannot be
 * trusted renders as nothing rather than as something subtly wrong.
 *
 * WHAT THE PROFILE SWITCH NOW PROVES. The old switch test moved tenant AND
 * profile at once and then checked a branding color, so a personality
 * regression could hide behind the color assertion. With colors gone the two
 * fixtures differ only in identity, which means every difference below is
 * attributable to the product profile alone -- and it is checked across five
 * channels (elevation, label case, hover motion, entrance, skeleton timing)
 * rather than one.
 */

import React, { Suspense } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { DesignSystemProvider } from '../../../src/infrastructure/runtime/bootstrap';
import { firstPartyEngineVisual } from '@/infrastructure/compilers/runtime/theme';
import type { EngineName, ProductProfileKey, TenantConfig } from '../../../src/foundation/contracts';
import {
  PERSONALITY_CANONICAL_PROJECTION,
  resolvePersonalityBridgeCssVariables,
} from '../../../src/foundation/tokens/ts/runtime/personality';
import { useTokens } from '@/infrastructure/runtime/theming/composition/react/tokens';
import {
  Badge,
  Button,
  Card,
  Divider,
  Skeleton,
  Statistic,
  Tag,
  Typography,
} from '../../../src/components/primitives';

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

/**
 * Identity only, no visual payload. `companyName` is the whole of what a tenant
 * may carry through the runtime config without a verified mounted artifact
 * standing behind it; a color here would make the config refusable and this
 * whole file would measure a blocked provider instead of a personality bridge.
 */
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
  },
};

/**
 * The fixture as it used to be written, kept as the operand of the refusal
 * drill at the bottom of this file rather than deleted. A single color is
 * enough: admission asks whether visual payload is present, not how much.
 */
const EVNTO_TENANT_WITH_UNCOMPILED_COLORS: TenantConfig = {
  ...EVNTO_TENANT,
  branding: {
    companyName: 'Evnto Test',
    primaryColor: '#c2410c',
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
      engineVisual={firstPartyEngineVisual('rottay', engine)}
      productProfile={productProfile}
      skipCssLoading
    >
      <PersonalityProbe />
      <Suspense fallback={<div data-testid="loading">Loading...</div>}>{ui}</Suspense>
    </DesignSystemProvider>
  );
}

/**
 * Reads the personality input the mounted provider stack resolves.
 *
 * This used to read the `:root` rule a runtime bridge wrote into the document.
 * WO-CAN-04 deleted that writer -- a JS painter beside the compiled artifact on
 * the same channel -- so the namespaced inputs now travel as compiled data and
 * `runtime/personality/index.css` projects them onto public component channels.
 *
 * The measurement is unchanged in strength and in subject: the SAME namespaced
 * names, resolved from the SAME live provider stack (engine, vertical, product
 * profile and tenant, through `useTokens`), asserted against the SAME expected
 * values. What is gone is only the DOM write, and its absence is asserted
 * separately below rather than assumed.
 */
let resolvedPersonalityInputs: Record<string, string> = {};

function PersonalityProbe(): null {
  resolvedPersonalityInputs = resolvePersonalityBridgeCssVariables(useTokens()) as Record<string, string>;
  return null;
}

function personalityToken(name: string): string {
  const projectedName =
    PERSONALITY_CANONICAL_PROJECTION[
      name as keyof typeof PERSONALITY_CANONICAL_PROJECTION
    ] ?? name;
  return resolvedPersonalityInputs[projectedName] ?? '';
}

/**
 * Reads an inline custom property off `<html>`.
 *
 * Used only for NEGATIVES now. Nothing is entitled to write here: an inline
 * declaration carries the highest specificity CSS offers, so a value on the
 * root element outranks the tenant artifact, the personality layer and every
 * engine sheet at once. Personality is deliberately published into a stylesheet
 * instead, and tenant paint arrives as a compiled artifact rather than from the
 * provider -- which is why the branding assertions this helper used to serve
 * are gone rather than relocated.
 */
function inlineToken(name: string): string {
  return document.documentElement.style.getPropertyValue(name);
}

describe('primitive personality integration', () => {
  beforeAll(async () => {
    await Promise.all([
      import('../../../src/components/primitives/inputs/button/engines/classic'),
      import('../../../src/components/primitives/inputs/button/engines/modern'),
      import('../../../src/components/primitives/inputs/button/engines/rustic'),
      import('../../../src/components/primitives/display/card/engines/classic'),
      import('../../../src/components/primitives/display/card/engines/modern'),
      import('../../../src/components/primitives/display/card/engines/rustic'),
      import('../../../src/components/primitives/display/badge/engines/classic'),
      import('../../../src/components/primitives/display/badge/engines/modern'),
      import('../../../src/components/primitives/display/badge/engines/rustic'),
      import('../../../src/components/primitives/display/tag/engines/classic'),
      import('../../../src/components/primitives/display/tag/engines/modern'),
      import('../../../src/components/primitives/display/tag/engines/rustic'),
      import('../../../src/components/primitives/feedback/skeleton/engines/classic'),
      import('../../../src/components/primitives/feedback/skeleton/engines/modern'),
      import('../../../src/components/primitives/feedback/skeleton/engines/rustic'),
      import('../../../src/components/primitives/layout/divider/engines/classic'),
      import('../../../src/components/primitives/layout/divider/engines/modern'),
      import('../../../src/components/primitives/layout/divider/engines/rustic'),
      import('../../../src/components/primitives/display/statistic/engines/classic'),
      import('../../../src/components/primitives/display/statistic/engines/modern'),
      import('../../../src/components/primitives/display/statistic/engines/rustic'),
      import('../../../src/components/primitives/display/typography/engines/classic'),
      import('../../../src/components/primitives/display/typography/engines/modern'),
      import('../../../src/components/primitives/display/typography/engines/rustic'),
    ]);
  });

  beforeEach(() => {
    vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.each(['classic', 'modern', 'rustic'] as const)(
    'resolves personality onto the component channels for %s, and paints nothing at runtime',
    async (engine) => {
      const buttonView = renderWithProfile(
        <Button>Primary action</Button>,
        engine,
        EVNTO_TENANT,
        'events.organizer'
      );

      const button = await screen.findByRole('button', { name: /primary action/i }, { timeout: 15000 });

      expect(personalityToken('--ds-card-shadow')).toBe('var(--ds-shadow-md)');
      expect(personalityToken('--ds-badge-radius')).toBe('var(--ds-radius-full)');
      expect(personalityToken('--ds-typography-label-transform')).toBe('capitalize');
      expect(personalityToken('--ds-personality-animation-entrance')).toBe('slideUp');

      // The invariant, not an incidental: a personality token on the inline
      // style attribute would outrank every tenant-scoped rule in the cascade.
      expect(inlineToken('--ds-card-shadow')).toBe('');
      expect(inlineToken('--ds-badge-radius')).toBe('');
      // And no runtime stylesheet either. The provider used to mount a bridge
      // that wrote these very names into a `:root` rule on every render, which
      // is the second painter WO-CAN-04 removed; the singleton it owned must
      // never appear again for ANY tenant, not only for a refused one.
      expect(document.getElementById('ds-personality-tokens')).toBeNull();
      expect(
        [...document.querySelectorAll('style')]
          .filter((node) => (node.textContent ?? '').includes('--ds-personality-')),
      ).toEqual([]);
      // And the provider paints no tenant channel there either, which is the
      // other half of the same rule. This tenant authors no color at all, so a
      // value appearing here could only have been invented by the runtime.
      expect(inlineToken('--ds-color-primary')).toBe('');

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
      expect(personalityToken('--ds-card-shadow')).toBe('var(--ds-shadow-md)');
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
      expect(personalityToken('--ds-badge-radius')).toBe('var(--ds-radius-full)');
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
      expect(personalityToken('--ds-typography-label-transform')).toBe('capitalize');
      typographyView.unmount();
    }
  );

  it('changes the resolved personality when switching product profile and tenant', () => {
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

    // Five channels, spanning elevation, label case, hover motion, entrance and
    // skeleton timing. One channel would let a profile that had stopped
    // resolving anything at all pass on a coincidence; a profile that moves
    // must move a spread of them.
    expect(personalityToken('--ds-card-shadow')).toBe('var(--ds-shadow-md)');
    expect(personalityToken('--ds-typography-label-transform')).toBe('capitalize');
    expect(personalityToken('--ds-button-hover-transform')).toBe('translateY(-4px) scale(1.03)');
    expect(personalityToken('--ds-personality-animation-entrance')).toBe('slideUp');
    expect(personalityToken('--ds-skeleton-animation-duration')).toBe('1.1s');

    rerender(
      <DesignSystemProvider
        tenantConfig={{ ...BITHIRE_TENANT, engine: 'rustic' }}
        forceEngine="rustic"
        productProfile="recruiting.operator"
        skipCssLoading
      >
        <PersonalityProbe />
        <div>
          <Button>Primary action</Button>
          <Card>
            <Card.Body>Card content</Card.Body>
          </Card>
          <Typography.Text as="label">Display name</Typography.Text>
        </div>
      </DesignSystemProvider>
    );

    expect(personalityToken('--ds-card-shadow')).toBe('var(--ds-shadow-sm)');
    expect(personalityToken('--ds-typography-label-transform')).toBe('none');
    expect(personalityToken('--ds-button-hover-transform')).toBe('translateY(0) scale(1)');
    expect(personalityToken('--ds-personality-animation-entrance')).toBe('fade');
    expect(personalityToken('--ds-skeleton-animation-duration')).toBe('1.9s');

    // Still nothing painted. A profile switch is a personality event, and it
    // must not become a paint event on the way through -- not inline, and not
    // as a runtime stylesheet.
    expect(inlineToken('--ds-card-shadow')).toBe('');
    expect(inlineToken('--ds-color-primary')).toBe('');
    expect(document.getElementById('ds-personality-tokens')).toBeNull();
  });

  it('refuses a tenant whose colors have no compiled artifact behind them', async () => {
    // The fixture every test above used to run on. It is not merely ignored --
    // the whole subtree is withheld, which is the outcome worth pinning: a
    // tenant whose visual payload cannot be trusted renders as nothing, rather
    // than as a page painted from an unverified source.
    const announcements: string[] = [];
    const originalError = console.error;
    console.error = (...args: unknown[]) => {
      announcements.push(args.map(String).join(' '));
    };

    try {
      const view = renderWithProfile(
        <Button>Primary action</Button>,
        'rustic',
        EVNTO_TENANT_WITH_UNCOMPILED_COLORS,
        'events.organizer'
      );

      await waitFor(() => {
        expect(
          announcements.some((message) =>
            /carries runtime visual payload but no verified mounted artifact/.test(message)
          )
        ).toBe(true);
      });

      // No tree.
      expect(view.container.querySelector('button')).toBeNull();
      expect(view.container.innerHTML).toBe('');
      // No paint, by either route: nothing inline on the root, and the
      // personality channel is never even claimed for a blocked tenant.
      expect(inlineToken('--ds-color-primary')).toBe('');
      expect(document.getElementById('ds-personality-tokens')).toBeNull();

      view.unmount();
    } finally {
      console.error = originalError;
    }
  });
});
