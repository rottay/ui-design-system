import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';

import { AdaptiveOverlay } from '..';
import {
  renderWithEngine,
  STABLE_ENGINES,
  type StableEngineName,
} from '../../../../../tooling/testing/helpers/engine';
import type { AdaptiveOverlayMode } from '../contracts';

const MODES = ['modal', 'drawer', 'sheet'] as const satisfies readonly AdaptiveOverlayMode[];
const CASES = STABLE_ENGINES.flatMap((engine) =>
  MODES.map((mode) => [engine, mode] as const),
);

async function preloadOverlayEngine(engine: StableEngineName): Promise<void> {
  switch (engine) {
    case 'classic':
      await Promise.all([
        import('@/ui/primitives/overlay/Modal/engines/classic'),
        import('@/ui/primitives/feedback/Drawer/engines/classic'),
        import('@/ui/primitives/overlay/Sheet/engines/classic'),
      ]);
      return;
    case 'modern':
      await Promise.all([
        import('@/ui/primitives/overlay/Modal/engines/modern'),
        import('@/ui/primitives/feedback/Drawer/engines/modern'),
        import('@/ui/primitives/overlay/Sheet/engines/modern'),
      ]);
      return;
    case 'rustic':
      await Promise.all([
        import('@/ui/primitives/overlay/Modal/engines/rustic'),
        import('@/ui/primitives/feedback/Drawer/engines/rustic'),
        import('@/ui/primitives/overlay/Sheet/engines/rustic'),
      ]);
  }
}

afterEach(() => {
  document.body.style.overflow = '';
});

describe('AdaptiveOverlay real engines', () => {
  it.each(CASES)(
    'forwards dialog identity and ARIA through %s/%s',
    async (engine, mode) => {
      await preloadOverlayEngine(engine);
      const dialogId = `${engine}-${mode}-dialog`;
      const testId = `${engine}-${mode}-test`;
      const descriptionId = `${engine}-${mode}-description`;

      const { unmount } = renderWithEngine(
        <AdaptiveOverlay
          engine={engine}
          mode={mode}
          open
          onOpenChange={() => {}}
          title={<span>Rich {mode} title</span>}
          id={dialogId}
          data-testid={testId}
          aria-label={`Explicit ${mode} label`}
          aria-describedby={descriptionId}
        >
          <span id={descriptionId}>Dialog description</span>
        </AdaptiveOverlay>,
        engine,
      );

      const dialog = await screen.findByTestId(testId, {}, { timeout: 15000 });
      expect(dialog.matches('dialog, [role="dialog"]')).toBe(true);
      expect(dialog).toHaveAttribute('id', dialogId);
      expect(document.querySelectorAll(`#${dialogId}`)).toHaveLength(1);
      expect(dialog).toHaveAttribute('aria-label', `Explicit ${mode} label`);
      expect(dialog).not.toHaveAttribute('aria-labelledby');
      expect(dialog).toHaveAccessibleName(`Explicit ${mode} label`);
      expect(dialog).toHaveAttribute('aria-describedby', descriptionId);
      unmount();
    },
    45000,
  );

  it.each(CASES)(
    'names a %s/%s dialog from a ReactNode title',
    async (engine, mode) => {
      await preloadOverlayEngine(engine);
      const testId = `${engine}-${mode}-title-test`;
      const titleText = `${engine} ${mode} rich title`;

      const { unmount } = renderWithEngine(
        <AdaptiveOverlay
          engine={engine}
          mode={mode}
          open
          onOpenChange={() => {}}
          data-testid={testId}
          title={<span>{titleText}</span>}
        >
          Dialog body
        </AdaptiveOverlay>,
        engine,
      );

      const dialog = await screen.findByTestId(testId, {}, { timeout: 15000 });
      expect(dialog.getAttribute('aria-labelledby')).toBeTruthy();
      expect(dialog).toHaveAccessibleName(titleText);
      unmount();
    },
    45000,
  );
});
