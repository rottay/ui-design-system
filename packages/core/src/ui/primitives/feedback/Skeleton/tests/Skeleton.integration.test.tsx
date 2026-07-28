import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Skeleton } from '..';
import { renderSurface } from '../../../../surfaces/foundation/common/test-utils';
import { renderWithEngine, STABLE_ENGINES } from '../../../../../tooling/testing/helpers/engine';

describe('Skeleton integration', () => {
  it.each(STABLE_ENGINES)('renders the live skeleton through the %s engine', async (engine) => {
    renderWithEngine(
      <Skeleton engine={engine} active avatar avatarSize={40} title paragraph={{ rows: 3 }} />,
      engine
    );

    if (engine === 'classic') {
      await waitFor(() => {
        expect(document.querySelector('.ant-skeleton')).toBeTruthy();
        expect(document.querySelector('.ant-skeleton-avatar')).toBeTruthy();
      });
      return;
    }

    await waitFor(() => {
      expect(document.querySelectorAll('.skeleton, .rottay-skeleton-wrapper').length).toBeGreaterThan(0);
    });
  }, 45000);

  it.each(STABLE_ENGINES)(
    'renders non-text variants through the %s engine',
    async (engine) => {
      renderWithEngine(
        <div>
          <Skeleton engine={engine} variant="circular" width={48} height={48} />
          <Skeleton engine={engine} variant="rounded" width={160} height={32} />
        </div>,
        engine
      );

      if (engine === 'classic') {
        await waitFor(() => {
          expect(document.querySelectorAll('.ant-skeleton-button').length).toBeGreaterThanOrEqual(2);
        });
        return;
      }

      await waitFor(() => {
        expect(document.querySelectorAll('.skeleton, .rottay-skeleton').length).toBeGreaterThanOrEqual(2);
      });
    },
    45000
  );

  it('renders the live rustic skeleton with title, avatar, and paragraph rows', async () => {
    const { container } = renderSurface(
      <Skeleton engine="rustic" active avatar avatarSize={40} title paragraph={{ rows: 3 }} />
    );

    await waitFor(() => {
      expect(container.querySelector('.rottay-skeleton-wrapper')).toBeTruthy();
      expect(container.querySelectorAll('.rottay-skeleton-wrapper div').length).toBeGreaterThan(3);
    });
  });

  it('marks the modern placeholder anatomy as decorative (aria-hidden)', async () => {
    renderWithEngine(
      <div>
        <Skeleton engine="modern" active avatar title paragraph={{ rows: 2 }} />
        <Skeleton engine="modern" variant="circular" width={48} height={48} />
      </div>,
      'modern'
    );

    // APG: placeholder blocks are pure decoration; the owning region
    // announces busy/loading. Both roots hide from the accessibility tree.
    await waitFor(() => {
      const roots = document.querySelectorAll(
        '.rottay-skeleton-wrapper.rottay-skeleton--modern[data-part="root"], .rottay-skeleton.rottay-skeleton--modern[data-part="root"]'
      );
      expect(roots.length).toBe(2);
      roots.forEach((root) => expect(root).toHaveAttribute('aria-hidden', 'true'));
    });
  });

  it('renders compound skeleton pieces using shared skeleton tokens', () => {
    const { container } = renderSurface(
      <div>
        <Skeleton.Avatar size="lg" />
        <Skeleton.Text lines={2} />
        <Skeleton.Button shape="round" />
      </div>
    );

    // The shimmer gradient (--ds-skeleton-wave-gradient) paints from
    // skeleton-compounds.css hooked on the class + data-part pair below; only
    // the shared canon ds-skeleton-shimmer animation reference stays inline.
    const avatar = container.querySelector('.rottay-skeleton-avatar[data-part="root"]');
    const button = container.querySelector('.rottay-skeleton-button[data-part="root"]');

    expect(avatar).toBeTruthy();
    expect(button).toBeTruthy();
    expect(avatar?.getAttribute('style') ?? '').toContain(
      'ds-skeleton-shimmer var(--ds-skeleton-animation-duration'
    );
    expect(button?.getAttribute('style') ?? '').toContain(
      'ds-skeleton-shimmer var(--ds-skeleton-animation-duration'
    );
  });
});
