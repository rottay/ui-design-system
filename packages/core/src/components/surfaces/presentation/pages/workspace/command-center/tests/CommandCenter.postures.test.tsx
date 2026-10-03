import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CommandCenterSurface } from '..';
import { renderSurface, RESOLVED_PHONE_TEST_CONTEXT } from '../../../../../foundation/common/test-utils';

describe('CommandCenter loading postures', () => {
  it.each(['hide', 'collapse'] as const)('applies %s to empty-data insight, quick-action and recent-activity placeholders', async (disposition) => {
    const { container } = renderSurface(<CommandCenterSurface title="Dashboard" loading postures={{ phone: { regions: { insights: disposition, 'quick-actions': disposition, 'recent-activity': disposition } } }} />, { engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT });
    await screen.findByText('Loading…');
    await waitFor(() => expect(container.querySelector('.ds-command-center__skeleton-greeting')).not.toBeNull());
    expect(container.querySelector('.ds-command-center__skeleton-grow')).toBeNull();
    expect(container.querySelector('.ds-command-center__quick-actions-grid')).toBeNull();
    expect(container.querySelector('.ds-command-center__skeleton-heading')).toBeNull();
    for (const name of ['insights', 'quick-actions', 'recent-activity']) {
      const region = container.querySelector(`[data-surface-region="${name}"]`);
      if (disposition === 'hide') expect(region).toBeNull();
      else {
        expect(region).toHaveAttribute('data-region-disposition', 'collapse');
        expect(region?.childElementCount).toBe(0);
      }
    }
    expect(container.querySelector('[data-surface-region="stats"]')?.childElementCount).toBeGreaterThan(0);
  });

  it('preserves all empty-data loading placeholders when postures are omitted', async () => {
    const { container } = renderSurface(<CommandCenterSurface title="Dashboard" loading />, { engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT });
    await screen.findByText('Loading…');
    await waitFor(() => expect(container.querySelector('.ds-command-center__skeleton-grow')).not.toBeNull());
    expect(container.querySelector('.ds-command-center__quick-actions-grid')?.childElementCount).toBeGreaterThan(0);
    expect(container.querySelectorAll('.ds-command-center__skeleton-heading')).toHaveLength(2);
    expect(container.querySelector('[data-surface-region]')).toBeNull();
  });
});
