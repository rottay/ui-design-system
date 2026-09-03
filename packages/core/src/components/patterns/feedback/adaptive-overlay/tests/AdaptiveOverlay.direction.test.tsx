import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { AdaptiveOverlay } from '..';
/**
 * Rendered WITHOUT the DS provider, on purpose and per this suite's own title.
 * The provider owns the document direction and writes `dir` on <html> from its
 * locale, so mounting it here would overwrite the very floor under test: the
 * overlay's fallback to `document.documentElement.dir` when no i18n provider is
 * present. `renderWithEngine` mounts that provider, which is why the direction
 * this suite set was `ltr` again by the time the overlay read it; the engine is
 * passed as a prop instead, which is the seam the component already exposes.
 */

/**
 * The i18n provider is optional and reports 'ltr' when absent, so a page that
 * declares its direction on the document used to get a physically wrong side
 * panel: the drawer's placement is a screen side, not a logical one.
 */

async function preloadDrawer(): Promise<void> {
  await import('@/components/primitives/feedback/drawer/engines/modern');
}

/**
 * The overlay reads `document.documentElement.dir` in an EFFECT, so SSR and
 * hydration agree on `right` and the mirror lands on the commit after mount.
 * Reading the attribute on the first paint therefore measures the pre-effect
 * value, not the contract. `expected` is what the placement must SETTLE on.
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

describe('AdaptiveOverlay drawer direction (no i18n provider)', () => {
  it(
    'mirrors the drawer to the physical left when the document is RTL',
    async () => {
      await preloadDrawer();
      document.documentElement.dir = 'rtl';

      const { unmount } = render(
        <AdaptiveOverlay
          engine="modern"
          mode="drawer"
          open
          onOpenChange={() => {}}
          title="Filters"
          data-testid="rtl-drawer"
        >
          <span>Body</span>
        </AdaptiveOverlay>,
      );

      await expectDrawerPlacement('rtl-drawer', 'left');
      unmount();
    },
    45000,
  );

  it(
    'keeps the drawer on the physical right when the document is LTR',
    async () => {
      await preloadDrawer();
      document.documentElement.dir = 'ltr';

      const { unmount } = render(
        <AdaptiveOverlay
          engine="modern"
          mode="drawer"
          open
          onOpenChange={() => {}}
          title="Filters"
          data-testid="ltr-drawer"
        >
          <span>Body</span>
        </AdaptiveOverlay>,
      );

      await expectDrawerPlacement('ltr-drawer', 'right');
      unmount();
    },
    45000,
  );
});
