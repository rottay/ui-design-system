import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MarketingSurface } from '..';
import type { MarketingSurfaceConfig } from '../../../../../foundation/contracts';
import { renderSurface, RESOLVED_PHONE_TEST_CONTEXT } from '../../../../../foundation/common/test-utils';

function config(): MarketingSurfaceConfig {
  return {
    visual: {},
    presentation: { title: 'Product', hero: <div>Hero preview</div>, sections: [<div key="feature">Feature content</div>] },
    behavior: {},
  };
}

describe('MarketingSurface postures', () => {
  it.each(['bottom-bar', 'floating', 'app-bar'] as const)('places %s actions in the appropriate containing block and preserves callbacks', async (placement) => {
    const value = config();
    const onClick = vi.fn();
    value.behavior.actions = [{ id: 'start', label: 'Start', onClick }, { id: 'locked', label: 'Locked action', disabled: true }];
    const { container } = renderSurface(<MarketingSurface config={value} postures={{ phone: { primaryAction: placement } }} />, { engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT });
    const action = await screen.findByRole('button', { name: 'Start' });
    const dock = action.closest('.ds-action-dock');
    if (placement === 'app-bar') {
      expect(dock).toBeNull();
      expect(action.closest('[data-surface-region="primary-action"]')?.parentElement).not.toHaveClass('ds-marketing__container');
    } else {
      expect(dock?.parentElement).toHaveClass('ds-marketing__container');
      expect(container.querySelector('.ds-marketing__container')?.lastElementChild).toBe(dock);
    }
    expect(screen.getAllByRole('button', { name: 'Start' })).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Locked action' })).toBeDisabled();
    fireEvent.click(action);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('hides loading features and collapses the configured loading hero', async () => {
    const { container } = renderSurface(<MarketingSurface config={config()} loading postures={{ phone: { regions: { hero: 'collapse', sections: 'hide' } } }} />, { engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT });
    await waitFor(() => expect(container.querySelector('.ds-marketing')).toHaveAttribute('data-loading', 'true'));
    expect(container.querySelector('[data-surface-region="hero"]')).toHaveAttribute('data-region-disposition', 'collapse');
    expect(container.querySelector('[data-surface-region="hero"]')?.childElementCount).toBe(0);
    expect(container.querySelector('[data-part="marketing-skeleton-hero"]')).toBeNull();
    expect(container.querySelector('[data-part="marketing-skeleton-feature"]')).toBeNull();
  });

  it('does not create a dock when every action is inaccessible', async () => {
    const value = config();
    value.behavior.actions = [{ id: 'start', label: 'Start', onClick: vi.fn() }];
    value.access = { mode: 'resolved', capabilities: [] };
    const { container } = renderSurface(<MarketingSurface config={value} postures={{ phone: { primaryAction: 'floating' } }} />, { engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT });
    await screen.findByText('Product');
    expect(screen.queryByRole('button', { name: 'Start' })).toBeNull();
    expect(container.querySelector('.ds-action-dock')).toBeNull();
  });
});
