import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Skeleton } from '.';
import { renderSurface } from '../../../surfaces/tests/test-utils';
import { renderWithEngine, STABLE_ENGINES } from '../../../../testing/helpers/engine-test-utils';

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

  it('renders compound skeleton pieces using shared skeleton tokens', () => {
    const { container } = renderSurface(
      <div>
        <Skeleton.Avatar size="lg" />
        <Skeleton.Text lines={2} />
        <Skeleton.Button shape="round" />
      </div>
    );

    const avatar = container.querySelector('.rottay-skeleton-avatar');
    const button = container.querySelector('.rottay-skeleton-button');

    expect(avatar?.getAttribute('style') ?? '').toContain('var(--ds-skeleton-wave-gradient');
    expect(button?.getAttribute('style') ?? '').toContain('var(--ds-skeleton-wave-gradient');
  });
});
