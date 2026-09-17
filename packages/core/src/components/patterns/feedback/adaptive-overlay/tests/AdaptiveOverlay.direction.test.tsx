import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { I18nProvider } from '@/infrastructure/runtime/i18n';
import { AdaptiveOverlay } from '..';

/**
 * The Drawer contract's placement is a PHYSICAL screen side, so the trailing
 * side panel has to be mirrored by hand for RTL reading order. The question
 * "which way does this page read" has exactly one owner -- the active locale,
 * through `useOptionalDirection` -- and this suite pins that the overlay asks
 * it and nothing else. The document is not a second authority: it is written
 * BY the provider, so reading it back would re-derive the provider's own fact
 * from paint, unavailable during SSR and free to disagree across hydration.
 */

async function preloadDrawer(): Promise<void> {
  await import('@/components/primitives/feedback/drawer/engines/modern');
}

/**
 * The drawer mounts through a lazy engine module, so the placement is asserted
 * once the surface has settled rather than on the first paint.
 */
async function expectDrawerPlacement(testId: string, expected: string): Promise<void> {
  const dialog = await screen.findByTestId(testId, {}, { timeout: 15000 });
  await waitFor(() => {
    const surface = dialog.closest('[data-placement]') ?? dialog;
    expect(surface.getAttribute('data-placement')).toBe(expected);
  });
}

afterEach(() => {
  document.documentElement.dir = '';
});

describe('AdaptiveOverlay drawer direction', () => {
  it(
    'mirrors the drawer to the physical left when the locale reads RTL',
    async () => {
      await preloadDrawer();

      const { unmount } = render(
        <I18nProvider locale="ar" fallbackLocale="en">
          <AdaptiveOverlay
            engine="modern"
            mode="drawer"
            open
            onOpenChange={() => {}}
            title="Filters"
            data-testid="rtl-drawer"
          >
            <span>Body</span>
          </AdaptiveOverlay>
        </I18nProvider>,
      );

      await expectDrawerPlacement('rtl-drawer', 'left');
      unmount();
    },
    45000,
  );

  it(
    'keeps the drawer on the physical right when the locale reads LTR',
    async () => {
      await preloadDrawer();

      const { unmount } = render(
        <I18nProvider locale="en" fallbackLocale="en">
          <AdaptiveOverlay
            engine="modern"
            mode="drawer"
            open
            onOpenChange={() => {}}
            title="Filters"
            data-testid="ltr-drawer"
          >
            <span>Body</span>
          </AdaptiveOverlay>
        </I18nProvider>,
      );

      await expectDrawerPlacement('ltr-drawer', 'right');
      unmount();
    },
    45000,
  );

  it(
    'does not take a second direction from the document when no provider is present',
    async () => {
      await preloadDrawer();
      // A bare `dir` on the document is NOT an authority: without a provider
      // the authority answers 'ltr' and the panel stays on the trailing edge.
      // Pinning this keeps a third direction source from growing back here.
      document.documentElement.dir = 'rtl';

      const { unmount } = render(
        <AdaptiveOverlay
          engine="modern"
          mode="drawer"
          open
          onOpenChange={() => {}}
          title="Filters"
          data-testid="no-provider-drawer"
        >
          <span>Body</span>
        </AdaptiveOverlay>,
      );

      await expectDrawerPlacement('no-provider-drawer', 'right');
      unmount();
    },
    45000,
  );
});
