/** @fileoverview SearchSurface tests -- query state, filters, results, and preview. */

import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import { SearchSurface, type SearchSurfaceProps } from '..';
import type { SurfacePostures } from '../../../../../foundation/contracts/postures';
import { DensityScope, useDensity } from '@/infrastructure/runtime/foundation/density';
import type { SearchSurfaceConfig } from '../../../../../foundation/contracts';
import { renderSurface, RESOLVED_PHONE_TEST_CONTEXT } from '../../../../../foundation/common/test-utils';

function DensityProbe() {
  return <output data-testid="search-density">{useDensity().posture}</output>;
}

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
    access: undefined,
    ...overrides,
  };
}

describe('SearchSurface', () => {
  it('owns the canonical optional posture prop', () => {
    expectTypeOf<SearchSurfaceProps['postures']>().toEqualTypeOf<SurfacePostures | undefined>();
  });

  it('preserves disabled semantics when the app primary action is moved', async () => {
    const config = buildConfig();
    const onClick = vi.fn();
    config.behavior.actions = [{ id: 'create', label: 'Create entry', variant: 'primary', disabled: true, onClick }];
    const { container } = renderSurface(
      <SearchSurface config={config} postures={{ phone: { primaryAction: 'floating' } }} />,
      { engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT },
    );
    const action = await screen.findByRole('button', { name: 'Create entry' });
    expect(action).toBeDisabled();
    expect(screen.getAllByRole('button', { name: 'Create entry' })).toHaveLength(1);
    expect(action.closest('[data-surface-region="floating"]')).not.toBeNull();
    expect(container.querySelector('[data-surface-action="create"]')).toBe(action);
    fireEvent.click(action);
    expect(onClick).not.toHaveBeenCalled();
  });

  it.each(['hide', 'collapse'] as const)('%s removes the real preview and its actions while results remain selectable', async (disposition) => {
    const config = buildConfig();
    const { container } = renderSurface(
      <SearchSurface config={config} postures={{ phone: { regions: { 'preview-rail': disposition, filters: 'hide' } } }} />,
      { engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT },
    );
    fireEvent.click(await screen.findByText('Andre Silva'));
    expect(config.behavior.onSelectResult).toHaveBeenCalledWith(expect.objectContaining({ id: '2' }));
    expect(screen.queryByText('Preview: Andre Silva')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Open profile' })).toBeNull();
    expect(container.querySelector('[data-surface-region="filters"]')).toBeNull();
    const preview = container.querySelector('[data-surface-region="preview-rail"]');
    if (disposition === 'hide') expect(preview).toBeNull();
    else {
      expect(preview).toHaveAttribute('data-region-disposition', 'collapse');
      expect(preview?.textContent).toBe('');
    }
  });

  it.each([undefined, 'spacious'] as const)('inherits ambient density unless a posture declares %s', async (density) => {
    const config = buildConfig();
    config.presentation.renderResult = () => <DensityProbe />;
    const { container } = renderSurface(
      <DensityScope posture="compact">
        <SearchSurface config={config} postures={density ? { phone: { density } } : undefined} />
      </DensityScope>,
      { engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT },
    );
    await waitFor(() => expect(container.querySelector('[data-testid="search-density"]')?.textContent).toBe(density ?? 'compact'));
    if (!density) expect(container.querySelector('[data-surface-region]')).toBeNull();
  });

  it('propagates query changes through the surface input', async () => {
    const config = buildConfig();

    renderSurface(<SearchSurface config={config} />);

    const input = await screen.findByPlaceholderText('Search candidates');
    fireEvent.change(input, { target: { value: 'andre' } });

    expect(config.behavior.onQueryChange).toHaveBeenCalledWith('andre');
  });

  it('selects a result and routes result actions through the selected item', async () => {
    const config = buildConfig();

    renderSurface(<SearchSurface config={config} />, { engine: 'modern' });

    fireEvent.click(await screen.findByText('Andre Silva'));

    await waitFor(() => {
      expect(config.behavior.onSelectResult).toHaveBeenCalledWith(
        expect.objectContaining({ id: '2', title: 'Andre Silva' })
      );
    });

    const openProfileButton = await screen.findByText('Open profile').then((node) => node.closest('button'));
    if (!openProfileButton) throw new Error('Open profile button not found');
    fireEvent.click(openProfileButton);

    expect(config.behavior.resultActions?.[0]?.onClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: '2', title: 'Andre Silva' })
    );
  });

  it('filters header actions through final presentation decisions', async () => {
    const config = buildConfig();
    config.behavior.actions = [
      {
        id: 'manage-search',
        label: 'Manage search',
        variant: 'primary',
        onClick: vi.fn(),
      },
    ];
    config.access = {
      mode: 'resolved',
      capabilities: [{ kind: 'action', id: 'manage-search', visible: false }],
    };

    renderSurface(<SearchSurface config={config} />);

    expect(screen.queryByText('Manage search')).not.toBeInTheDocument();
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
