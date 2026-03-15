import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SearchSurface } from '../search';
import type { SearchSurfaceConfig } from '../types';
import { renderSurface } from './test-utils';

function buildConfig(overrides?: Partial<SearchSurfaceConfig>): SearchSurfaceConfig {
  return {
    visual: {
      layout: 'split',
      minQueryLength: 2,
    },
    presentation: {
      chrome: {
        title: 'Global Search',
      },
      placeholder: 'Search candidates',
      resultPreview: (result) => <div>Preview: {result.title}</div>,
    },
    behavior: {
      query: 'an',
      onQueryChange: vi.fn(),
      results: [
        {
          id: '1',
          title: 'Ana Gomez',
          description: 'Senior recruiter',
        },
        {
          id: '2',
          title: 'Andre Silva',
          description: 'Hiring manager',
        },
      ],
      onSelectResult: vi.fn(),
      resultActions: [
        {
          id: 'open-profile',
          label: 'Open profile',
          variant: 'primary',
          onClick: vi.fn(),
        },
      ],
      filters: [
        {
          key: 'status',
          label: 'Status',
          type: 'select',
          options: [
            { label: 'Active', value: 'active' },
            { label: 'Archived', value: 'archived' },
          ],
        },
      ],
      filterValues: {},
      onFilterChange: vi.fn(),
    },
    permissions: undefined,
    ...overrides,
  };
}

describe('SearchSurface', () => {
  it('propagates query changes through the surface input', async () => {
    const config = buildConfig();

    renderSurface(<SearchSurface config={config} />);

    const input = await screen.findByPlaceholderText('Search candidates');
    fireEvent.change(input, { target: { value: 'andre' } });

    expect(config.behavior.onQueryChange).toHaveBeenCalledWith('andre');
  });

  it('selects a result and routes result actions through the selected item', async () => {
    const config = buildConfig();

    renderSurface(<SearchSurface config={config} />);

    fireEvent.click(await screen.findByText('Andre Silva'));

    await waitFor(() => {
      expect(config.behavior.onSelectResult).toHaveBeenCalledWith(
        expect.objectContaining({ id: '2', title: 'Andre Silva' })
      );
    });

    fireEvent.click(await screen.findByRole('button', { name: 'Open profile' }));

    expect(config.behavior.resultActions?.[0]?.onClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: '2', title: 'Andre Silva' })
    );
  });

  it('filters header actions through the shared permission contract', async () => {
    const config = buildConfig();
    config.behavior.actions = [
      {
        id: 'manage-search',
        label: 'Manage search',
        variant: 'primary',
        onClick: vi.fn(),
      },
    ];
    config.permissions = {
      granted: [],
      actions: {
        'manage-search': {
          permission: 'search:manage',
        },
      },
    };

    renderSurface(<SearchSurface config={config} />);

    expect(screen.queryByRole('button', { name: 'Manage search' })).not.toBeInTheDocument();
  });

  it('localizes default empty states through the root design system provider', async () => {
    const config = buildConfig({
      presentation: {
        chrome: {
          title: 'Busqueda global',
        },
      },
      behavior: {
        query: '',
        onQueryChange: vi.fn(),
        results: [],
      },
    } as Partial<SearchSurfaceConfig>);

    renderSurface(<SearchSurface config={config} />, {
      tenantOverrides: {
        locale: 'es',
      },
    });

    expect(await screen.findByText('Empieza a escribir para buscar')).toBeInTheDocument();
  });

  it('covers the singular empty-query branch and honors a custom empty query state override', async () => {
    const config = buildConfig({
      visual: {
        layout: 'split',
        minQueryLength: 1,
      },
      presentation: {
        chrome: {
          title: 'Search',
        },
        emptyQueryState: <div>Bring a query</div>,
      },
      behavior: {
        query: '',
        onQueryChange: vi.fn(),
        results: [],
      },
    } as Partial<SearchSurfaceConfig>);

    renderSurface(<SearchSurface config={config} />);

    expect(await screen.findByText('Bring a query')).toBeInTheDocument();
    expect(screen.queryByText('Start typing to search')).not.toBeInTheDocument();
  });

  it('covers stack layout, default selection, and custom empty results state without rendering preview', async () => {
    const config = buildConfig({
      visual: {
        layout: 'stack',
      },
      presentation: {
        chrome: {
          title: 'Search',
        },
        emptyResultsState: <div>No matches override</div>,
      },
      behavior: {
        query: 'ana',
        onQueryChange: vi.fn(),
        results: [],
      },
    } as Partial<SearchSurfaceConfig>);

    const firstRender = renderSurface(<SearchSurface config={config} />);
    expect(await screen.findByText('No matches override')).toBeInTheDocument();

    firstRender.unmount();

    renderSurface(
      <SearchSurface
        config={buildConfig({
          visual: {
            layout: 'stack',
          },
          behavior: {
            query: 'ana',
            onQueryChange: vi.fn(),
            results: [
              { id: '1', title: 'Ana Gomez' },
              { id: '2', title: 'Andre Silva' },
            ],
          },
        } as Partial<SearchSurfaceConfig>)}
      />
    );

    expect(await screen.findByText('Ana Gomez')).toBeInTheDocument();
    expect(screen.queryByText('Preview')).not.toBeInTheDocument();
  });
});
