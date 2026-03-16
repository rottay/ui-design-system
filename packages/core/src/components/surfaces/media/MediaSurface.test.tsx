/** @fileoverview MediaSurface tests -- gallery rendering, selection, and preview rail. */

import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MediaSurface } from '.';
import type { MediaSurfaceConfig } from '../types';
import { renderSurface } from '../common/test-utils';

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
    permissions: undefined,
    ...overrides,
  };
}

describe('MediaSurface', () => {
  it('changes selection and routes item actions through the active media item', async () => {
    const config = buildConfig();

    renderSurface(<MediaSurface config={config} />);

    fireEvent.click(await screen.findByText('Crowd Closeup'));

    await waitFor(() => {
      expect(config.behavior.onSelectItem).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'asset-2', title: 'Crowd Closeup' })
      );
    });

    fireEvent.click(await screen.findByRole('button', { name: 'Promote asset' }));

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

    renderSurface(<MediaSurface config={controlledConfig} />);

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
});
