import React from 'react';
import { screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { AdaptiveOverlay } from '..';
import { renderWithEngine } from '../../../../../tooling/testing/helpers/engine';

/**
 * The i18n provider is optional and reports 'ltr' when absent, so a page that
 * declares its direction on the document used to get a physically wrong side
 * panel: the drawer's placement is a screen side, not a logical one.
 */

async function preloadDrawer(): Promise<void> {
  await import('@/ui/primitives/feedback/Drawer/engines/modern');
}

async function drawerPlacement(testId: string): Promise<string | null> {
  const dialog = await screen.findByTestId(testId, {}, { timeout: 15000 });
  const surface = dialog.closest('[data-placement]') ?? dialog;
  return surface.getAttribute('data-placement');
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

      const { unmount } = renderWithEngine(
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
        'modern',
      );

      expect(await drawerPlacement('rtl-drawer')).toBe('left');
      unmount();
    },
    45000,
  );

  it(
    'keeps the drawer on the physical right when the document is LTR',
    async () => {
      await preloadDrawer();
      document.documentElement.dir = 'ltr';

      const { unmount } = renderWithEngine(
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
        'modern',
      );

      expect(await drawerPlacement('ltr-drawer')).toBe('right');
      unmount();
    },
    45000,
  );
});
