/** @fileoverview OperationalSurface tests -- live feed, stats, and queue panels. */

import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { OperationalSurface } from '..';
import type { OperationalSurfaceConfig } from '../../../../../foundation/contracts';
import { renderSurface, RESOLVED_PHONE_TEST_CONTEXT } from '../../../../../foundation/common/test-utils';
import { mockMatchMedia } from '@tests/support/browser/match-media';

function buildConfig(
  overrides?: Partial<OperationalSurfaceConfig<{ key: string; title: string }>>
): OperationalSurfaceConfig<{ key: string; title: string }> {
  return {
    visual: {},
    presentation: {
      chrome: { title: 'Operational Center' },
      primaryPanel: <div>Primary operator panel</div>,
      queue: <div>Queue module</div>,
    },
    behavior: {
      stats: [{ key: 'alerts', label: 'Alerts', value: 4 }],
      feed: {
        items: [{ key: 'feed-1', title: 'Scanner spike detected' }],
        renderItem: (item) => <div>{item.title}</div>,
      },
    },
    ...overrides,
  };
}

describe('OperationalSurface', () => {
  it.each(['bottom-bar', 'floating', 'app-bar'] as const)('places %s actions outside the header when docked and preserves action state', async (placement) => {
    const value = buildConfig();
    const onRefresh = vi.fn();
    value.behavior.refreshAction = { id: 'refresh', label: 'Refresh', onClick: onRefresh };
    value.behavior.actions = [{ id: 'locked', label: 'Locked action', disabled: true }, { id: 'pending', label: 'Pending action', loading: true }];
    const { container } = renderSurface(<OperationalSurface config={value} loading postures={{ phone: { primaryAction: placement } }} />, { engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT });
    const action = await screen.findByRole('button', { name: 'Refresh' });
    const dock = action.closest('.ds-action-dock');
    if (placement === 'app-bar') {
      expect(dock).toBeNull();
      expect(action.closest('[data-part="header"]')).not.toBeNull();
    } else {
      expect(action.closest('[data-part="header"]')).toBeNull();
      expect(dock?.parentElement).toHaveClass('ds-page-shell-surface');
      expect(container.querySelector('.ds-page-shell-surface')?.lastElementChild).toBe(dock);
    }
    expect(screen.getAllByRole('button', { name: 'Refresh' })).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Locked action' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Pending action' })).toBeDisabled();
    fireEvent.click(action);
    expect(onRefresh).toHaveBeenCalledOnce();
  });

  it('uses hidden and collapsed module dispositions for the loading anatomy', async () => {
    const { container } = renderSurface(<OperationalSurface config={buildConfig()} loading postures={{ phone: { regions: { queue: 'hide', feed: 'hide', stats: 'collapse', 'primary-panel': 'collapse' } } }} />, { engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT });
    await screen.findByText('Operational Center');
    expect(container.querySelector('[data-surface-region="queue"]')).toBeNull();
    expect(container.querySelector('[data-surface-region="feed"]')).toBeNull();
    expect(container.querySelector('[data-surface-region="stats"]')?.childElementCount).toBe(0);
    expect(container.querySelector('[data-surface-region="primary-panel"]')?.childElementCount).toBe(0);
    expect(container.querySelector('[data-part="operational-skeleton-block"][data-size="rail"]')).toBeNull();
    expect(screen.queryByText('Primary operator panel')).toBeNull();
  });

  it('lets explicit module render override legacy mobile masks', async () => {
    const value = buildConfig();
    value.visual = { mobileQueuePosition: 'hidden', mobileFeedPosition: 'hidden', hideSecondaryPanelOnMobile: true };
    value.presentation.secondaryPanel = <div>Secondary operator panel</div>;
    const { container } = renderSurface(<OperationalSurface config={value} postures={{ phone: { regions: { queue: 'render', feed: 'render', 'secondary-panel': 'render' } } }} />, { engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT });
    expect(await screen.findByText('Queue module')).toBeInTheDocument();
    expect(await screen.findByText('Scanner spike detected')).toBeInTheDocument();
    expect(screen.getByText('Secondary operator panel')).toBeInTheDocument();
    expect(container.querySelectorAll('[data-surface-region="queue"]')).toHaveLength(1);
    expect(container.querySelector('.ds-action-dock')).toBeNull();
  });

  it('does not manufacture a module requested for rendering when its content is absent', async () => {
    const value = buildConfig({ presentation: { chrome: { title: 'Operational Center' } }, behavior: {} });
    const { container } = renderSurface(<OperationalSurface config={value} postures={{ phone: { regions: { queue: 'render', feed: 'render', 'secondary-panel': 'render' } } }} />, { engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT });
    await screen.findByText('Operational Center');
    expect(container.querySelector('[data-surface-region="queue"]')).toBeNull();
    expect(container.querySelector('[data-surface-region="feed"]')).toBeNull();
    expect(container.querySelector('[data-surface-region="secondary-panel"]')).toBeNull();
  });

  it('localizes the empty state when no operational modules are configured', async () => {
    renderSurface(
      <OperationalSurface
        config={buildConfig({
          presentation: {
            chrome: { title: 'Centro Operativo' },
          },
          behavior: {},
        })}
      />,
      {
        tenantOverrides: {
          locale: 'es',
        },
      }
    );

    expect(await screen.findByText('No hay modulos operativos configurados')).toBeInTheDocument();
  });

  it('keeps queue and live feed visible when the layout stacks on mobile', async () => {
    mockMatchMedia(375);

    renderSurface(<OperationalSurface config={buildConfig()} />);

    expect(await screen.findByText('Queue')).toBeInTheDocument();
    expect(await screen.findByText('Live feed')).toBeInTheDocument();
    expect(await screen.findByText('Queue module')).toBeInTheDocument();
    expect(await screen.findByText('Scanner spike detected')).toBeInTheDocument();
  });

  it('repositions feed and queue while hiding the secondary panel on mobile', async () => {
    mockMatchMedia(390);

    renderSurface(
      <OperationalSurface
        config={buildConfig({
          visual: {
            mobileQueuePosition: 'top',
            mobileFeedPosition: 'bottom',
            hideSecondaryPanelOnMobile: true,
          },
          presentation: {
            chrome: { title: 'Operational Center' },
            primaryPanel: <div>Primary operator panel</div>,
            secondaryPanel: <div>Secondary operator panel</div>,
            queue: <div>Queue module</div>,
          },
          behavior: {
            stats: [{ key: 'alerts', label: 'Alerts', value: 4 }],
            feed: {
              items: [{ key: 'feed-1', title: 'Scanner spike detected' }],
              renderItem: (item) => <div>{item.title}</div>,
            },
          },
        })}
      />
    );

    expect(await screen.findByText('Queue module')).toBeInTheDocument();
    expect(await screen.findByText('Scanner spike detected')).toBeInTheDocument();
    expect(screen.queryByText('Secondary operator panel')).not.toBeInTheDocument();
  });
});
