/** @fileoverview MediaSurface tests -- gallery rendering, selection, and preview rail. */

import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MediaSurface } from '..';
import type { MediaSurfaceConfig } from '../../../../../foundation/contracts';
import {
  renderSurface,
  RESOLVED_PHONE_TEST_CONTEXT,
} from '../../../../../foundation/common/test-utils';

function buildConfig(overrides?: Partial<MediaSurfaceConfig>): MediaSurfaceConfig {
  return {
    visual: {
      layout: 'detail',
      columns: 2,
    },
    presentation: {
      chrome: {
        title: 'Media Library',
      },
      renderDetails: (item) => <div>Details for {item.title}</div>,
    },
    behavior: {
      items: [
        {
          id: 'asset-1',
          src: 'https://example.com/a.jpg',
          title: 'Main Stage Hero',
          description: 'Wide shot',
        },
        {
          id: 'asset-2',
          src: 'https://example.com/b.jpg',
          title: 'Crowd Closeup',
          description: 'Audience energy',
        },
      ],
      itemActions: [
        {
          id: 'promote',
          label: 'Promote asset',
          variant: 'primary',
          onClick: vi.fn(),
        },
      ],
      onSelectItem: vi.fn(),
    },
    access: undefined,
    ...overrides,
  };
}

describe('MediaSurface', () => {
  it('keeps an explicit app-bar action in its existing chrome', async () => {
    const config = buildConfig();
    const callback = vi.fn();
    config.behavior.actions = [{ id: 'continue', label: 'Chrome operation', variant: 'primary', onClick: callback }];
    const { container } = renderSurface(
      <MediaSurface config={config} postures={{ phone: { primaryAction: 'app-bar' } }} />,
      { engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT },
    );
    const action = await screen.findByRole('button', { name: 'Chrome operation' });
    expect(action.closest('[data-part="header"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="action-dock"]')).toBeNull();
    expect(action.closest('[data-surface-region="primary-action"]')).not.toBeNull();
    fireEvent.click(action);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it.each(['hide', 'collapse'] as const)('honors primary-action %s without leaving a dock', async (disposition) => {
    const config = buildConfig();
    const callback = vi.fn();
    config.behavior.actions = [{ id: 'continue', label: 'Hidden operation', variant: 'primary', onClick: callback }];
    const { container } = renderSurface(
      <MediaSurface config={config} postures={{ phone: { primaryAction: 'floating', regions: { 'primary-action': disposition } } }} />,
      { engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT },
    );
    await screen.findByText('Media Library');
    expect(screen.queryByRole('button', { name: 'Hidden operation' })).toBeNull();
    expect(container.querySelector('[data-testid="action-dock"]')).toBeNull();
    const region = container.querySelector('[data-surface-region="primary-action"]');
    if (disposition === 'hide') expect(region).toBeNull();
    else {
      expect(region).toHaveAttribute('data-region-disposition', 'collapse');
      expect(region).toBeEmptyDOMElement();
    }
    expect(callback).not.toHaveBeenCalled();
  });

  it.each([
      { placement: 'bottom-bar', error: undefined },
      { placement: 'floating', error: undefined },
      { placement: 'bottom-bar', error: new Error('Payload failure') },
      { placement: 'floating', error: new Error('Payload failure') },
    ] as const)('places $placement actions after the body with error=$error', async ({ placement, error }) => {
    const config = buildConfig();
    const callback = vi.fn();
    config.behavior.actions = [{ id: 'continue', label: 'Continue operation', variant: 'primary', onClick: callback }];
    const { container } = renderSurface(
      <MediaSurface config={config} error={error} postures={{ phone: { primaryAction: placement } }} />,
      { engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT },
    );
    const action = await screen.findByRole('button', { name: 'Continue operation' });
    const dock = action.closest('[data-testid="action-dock"]');
    expect(dock).toHaveAttribute('data-mode', placement === 'bottom-bar' ? 'sticky' : 'fixed');
    expect(action.closest('[data-part="header"], .ds-auth__form-panel')).toBeNull();
    expect(dock?.parentElement).toHaveClass('ds-page-shell-surface');
    expect(dock?.parentElement).toHaveAttribute('data-part', 'body');
    expect(dock?.parentElement?.lastElementChild).toBe(dock);
    expect(container.querySelectorAll('[data-testid="action-dock"]')).toHaveLength(1);
    expect(screen.getAllByRole('button', { name: 'Continue operation' })).toHaveLength(1);
    fireEvent.click(action);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it.each(['absent', 'denied'] as const)('creates no dock when its actions are %s', async (state) => {
    const config = buildConfig();
    const callback = vi.fn();
    config.behavior.actions = state === 'absent' ? undefined : [
      { id: 'denied', label: 'Restricted operation', variant: 'primary', onClick: callback },
    ];
    config.access = { mode: 'resolved', capabilities: [{ kind: 'action', id: 'denied', visible: false }] };
    const { container } = renderSurface(<MediaSurface config={config} postures={{ phone: { primaryAction: 'floating' } }} />, {
      engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT,
    });
    expect(await screen.findByText('Media Library')).toBeInTheDocument();
    expect(container.querySelector('[data-testid="action-dock"], [data-surface-region="primary-action"]')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Restricted operation' })).toBeNull();
    expect(callback).not.toHaveBeenCalled();
  });

  it('uses resolved disabled rows without duplicate controls or predicate re-evaluation', async () => {
    const config = buildConfig();
    const visible = vi.fn(() => true);
    const blocked = vi.fn();
    const allowed = vi.fn();
    config.behavior.actions = [
      { id: 'disabled', label: 'Disabled operation', variant: 'primary', visible, onClick: blocked },
      { id: 'allowed', label: 'Allowed operation', onClick: allowed },
    ];
    config.access = { mode: 'resolved', capabilities: [
      { kind: 'action', id: 'disabled', visible: true, disabled: true },
      { kind: 'action', id: 'allowed', visible: true },
    ] };
    const postures = { phone: { primaryAction: 'bottom-bar' as const } };
    const { rerender } = renderSurface(<MediaSurface config={config} postures={postures} />, {
      engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT,
    });
    const disabled = await screen.findByRole('button', { name: 'Disabled operation' });
    expect(disabled).toBeDisabled();
    expect(screen.getAllByRole('button', { name: 'Disabled operation' })).toHaveLength(1);
    expect(config.behavior.actions[0].disabled).toBeUndefined();
    fireEvent.click(disabled);
    fireEvent.click(screen.getByRole('button', { name: 'Allowed operation' }));
    expect(blocked).not.toHaveBeenCalled();
    expect(allowed).toHaveBeenCalledTimes(1);
    visible.mockClear();
    rerender(<MediaSurface config={config} postures={postures} />);
    expect(visible).toHaveBeenCalledTimes(1);
  });

  it('keeps omitted postures on the existing action row without a dock', async () => {
    const config = buildConfig();
    const callback = vi.fn();
    config.behavior.actions = [{ id: 'continue', label: 'Existing operation', onClick: callback }];
    const { container } = renderSurface(<MediaSurface config={config} />, {
      engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT,
    });
    const action = await screen.findByRole('button', { name: 'Existing operation' });
    expect(action.closest('[data-part="header"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="action-dock"], [data-surface-region]')).toBeNull();
    fireEvent.click(action);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('changes selection and routes item actions through the active media item', async () => {
    const config = buildConfig();

    renderSurface(<MediaSurface config={config} />, { engine: 'modern' });

    fireEvent.click(await screen.findByText('Crowd Closeup'));

    await waitFor(() => {
      expect(config.behavior.onSelectItem).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'asset-2', title: 'Crowd Closeup' })
      );
    });

    const promoteButton = await screen.findByText('Promote asset').then((node) => node.closest('button'));
    if (!promoteButton) throw new Error('Promote asset button not found');
    fireEvent.click(promoteButton);

    expect(config.behavior.itemActions?.[0]?.onClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'asset-2', title: 'Crowd Closeup' })
    );
    expect(screen.getByText('Details for Crowd Closeup')).toBeInTheDocument();
  });

  it('keeps controlled selection stable and renders empty states through defaults and overrides', async () => {
    const controlledConfig = buildConfig({
      behavior: {
        items: [
          {
            id: 'asset-1',
            src: 'https://example.com/a.jpg',
            title: 'Main Stage Hero',
            description: 'Wide shot',
          },
          {
            id: 'asset-2',
            src: 'https://example.com/b.jpg',
            title: 'Crowd Closeup',
            description: 'Audience energy',
          },
        ],
        selectedItemId: 'asset-1',
        itemActions: [],
        onSelectItem: vi.fn(),
      },
    });

    renderSurface(<MediaSurface config={controlledConfig} />, { engine: 'modern' });

    fireEvent.click(await screen.findByText('Crowd Closeup'));

    await waitFor(() => {
      expect(controlledConfig.behavior.onSelectItem).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'asset-2' })
      );
    });

    expect(screen.getByText('Details for Main Stage Hero')).toBeInTheDocument();

    const localizedEmpty = buildConfig({
      behavior: {
        items: [],
        itemActions: [],
      },
      presentation: {
        chrome: {
          title: 'Media Library',
        },
      },
    });

    const localized = renderSurface(<MediaSurface config={localizedEmpty} />, {
      tenantOverrides: { locale: 'es' },
    });

    expect(screen.queryByText('No media items')).not.toBeInTheDocument();
    expect(await screen.findByText('No hay elementos multimedia')).toBeInTheDocument();
    expect(
      await screen.findByText('Agrega uno o mas elementos para renderizar la galeria.')
    ).toBeInTheDocument();
    localized.unmount();

    renderSurface(
      <MediaSurface
        config={buildConfig({
          behavior: {
            items: [],
            itemActions: [],
          },
          presentation: {
            chrome: {
              title: 'Media Library',
            },
            emptyState: <div>Bring your own media state</div>,
          },
        })}
      />
    );

    expect(await screen.findByText('Bring your own media state')).toBeInTheDocument();
  });

  it('honors the bounded mobile gallery column projection', async () => {
    renderSurface(
      <MediaSurface
        config={buildConfig({
          visual: {
            layout: 'gallery',
            columns: 4,
            mobileColumnsLimit: 2,
          },
        })}
      />,
      { engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT }
    );

    expect(screen.getAllByText('Main Stage Hero').length).toBeGreaterThanOrEqual(1);
    expect(document.querySelector('.ds-media')).toHaveAttribute('data-mobile-columns', '2');
  });
});
