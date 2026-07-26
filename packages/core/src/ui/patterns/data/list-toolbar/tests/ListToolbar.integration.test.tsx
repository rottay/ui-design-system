import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';

import { PatternListToolbar } from '..';
import { STABLE_ENGINES, renderWithEngine } from '../../../../../tooling/testing/helpers/engine';
import { mockMatchMedia } from '../../../../../tooling/testing/helpers/browser/match-media';

describe('PatternListToolbar integration', () => {
  afterEach(async () => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    // W4 idiom: portal locale observers re-fire when dir/lang are removed;
    // keep the teardown inside act with a drain for overlay follow-ups.
    await act(async () => {
      document.documentElement.removeAttribute('dir');
      await new Promise((resolve) => setTimeout(resolve, 500));
    });
  });

  it.each(STABLE_ENGINES)(
    'renders the compact mobile toolbar through the %s engine',
    async (engine) => {
      mockMatchMedia(390);

      renderWithEngine(
        <PatternListToolbar
          engine={engine}
          title="Events"
          totalCount={42}
          search=""
          onSearchChange={vi.fn()}
          filterPills={[
            {
              key: 'status',
              label: 'Status',
              value: 'all',
              options: [
                { label: 'All', value: 'all' },
                { label: 'Live', value: 'live' },
              ],
            },
          ]}
          viewMode="list"
          onViewModeChange={vi.fn()}
          density="comfortable"
          onDensityChange={vi.fn()}
          className="toolbar-token-contract"
          primaryAction={{
            label: 'Create event',
            onClick: vi.fn(),
          }}
        />,
        engine,
      );

      expect(await screen.findByText('Events')).toBeInTheDocument();
      expect(await screen.findByPlaceholderText('Search...')).toBeInTheDocument();
      expect(await screen.findByRole('button', { name: /create event/i })).toBeInTheDocument();
      if (engine === 'modern') {
        const filterTrigger = await screen.findByRole('button', { name: /status/i });
        expect(filterTrigger).toBeInTheDocument();
        expect(filterTrigger).toHaveClass('rottay-button');
        expect(await screen.findByRole('button', { name: /create event/i })).toHaveClass(
          'rottay-button',
        );
      } else {
        expect(await screen.findByText('All')).toBeInTheDocument();
      }
      await waitFor(() => {
        const root = document.querySelector('.toolbar-token-contract') as HTMLElement | null;
        expect(root).not.toBeNull();
        if (engine === 'modern') {
          expect(root?.getAttribute('data-part')).toBe('root');
          expect(root).toHaveAttribute('data-mobile', 'true');
          expect(root).toHaveAttribute('data-has-title', 'true');
          expect(root).toHaveAttribute('data-has-primary-action', 'true');
          expect(root?.querySelector('[data-part="mobile-layout"]')).not.toBeNull();
          expect(root?.querySelector('[data-part="mobile-header"]')).not.toBeNull();
          expect(root?.querySelector('[data-part="title-section"]')).not.toBeNull();
          expect(root?.querySelector('[data-part="mobile-actions"]')).not.toBeNull();
          expect(root?.querySelector('[data-part="search-section"]')).not.toBeNull();
          expect(root?.querySelector('[data-part="filter-rail"]')).not.toBeNull();
          expect(root?.style.boxShadow).toBe('');
        } else {
          expect(root?.getAttribute('style')).toContain('--ds-toolbar-shadow');
        }
      });
    },
    45000,
  );

  it('adapts the modern toolbar to its container instead of the viewport', async () => {
    mockMatchMedia(1280);

    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      x: 0,
      y: 0,
      top: 0,
      right: 1200,
      bottom: 64,
      left: 0,
      width: 1200,
      height: 64,
      toJSON: () => ({}),
    } as DOMRect);

    let resizeCallback: ResizeObserverCallback | undefined;
    const resizeObserver = {
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
      takeRecords: vi.fn(() => []),
    };

    class ControlledResizeObserver {
      constructor(callback: ResizeObserverCallback) {
        resizeCallback = callback;
      }

      observe = resizeObserver.observe;
      unobserve = resizeObserver.unobserve;
      disconnect = resizeObserver.disconnect;
      takeRecords = resizeObserver.takeRecords;
    }

    vi.stubGlobal(
      'ResizeObserver',
      ControlledResizeObserver as unknown as typeof ResizeObserver,
    );

    renderWithEngine(
      <PatternListToolbar
        engine="modern"
        title="Candidates"
        totalCount={18}
        search=""
        onSearchChange={vi.fn()}
        filterPills={[]}
        viewMode="list"
        onViewModeChange={vi.fn()}
        density="comfortable"
        onDensityChange={vi.fn()}
        className="container-aware-toolbar"
        primaryAction={{ label: 'Add candidate', onClick: vi.fn() }}
      />,
      'modern',
    );

    const root = document.querySelector('.container-aware-toolbar') as HTMLElement;
    expect(root).toHaveAttribute('data-container-layout', 'full');
    expect(root.querySelector('[data-part="main-row"]')).not.toBeNull();
    expect(resizeObserver.observe).toHaveBeenCalledWith(root);

    act(() => {
      resizeCallback?.(
        [{ contentRect: { width: 1024 } } as ResizeObserverEntry],
        resizeObserver as unknown as ResizeObserver,
      );
    });

    await waitFor(() => {
      expect(root).toHaveAttribute('data-container-layout', 'compact');
      expect(root).toHaveAttribute('data-mobile', 'true');
      expect(root.querySelector('[data-part="mobile-layout"]')).not.toBeNull();
    });

    act(() => {
      resizeCallback?.(
        [{ contentRect: { width: 1200 } } as ResizeObserverEntry],
        resizeObserver as unknown as ResizeObserver,
      );
    });

    await waitFor(() => {
      expect(root).toHaveAttribute('data-container-layout', 'full');
      expect(root).toHaveAttribute('data-mobile', 'false');
      expect(root.querySelector('[data-part="main-row"]')).not.toBeNull();
    });
  });

  it('keeps long localized copy operable in a 320px RTL container', async () => {
    document.documentElement.setAttribute('dir', 'rtl');
    mockMatchMedia(320);

    renderWithEngine(
      <PatternListToolbar
        engine="modern"
        title="المرشحون الذين يحتاجون إلى مراجعة عاجلة"
        totalCount={12842}
        search=""
        searchPlaceholder="ابحث بالاسم أو المهارة أو المصدر أو الحالة…"
        onSearchChange={vi.fn()}
        filterPills={[
          {
            key: 'status',
            label: 'حالة التوظيف الحالية',
            value: 'active',
            options: [
              { label: 'الكل', value: 'all' },
              { label: 'نشط ويحتاج إلى متابعة', value: 'active' },
            ],
          },
        ]}
        activeFilters={{ status: 'active' }}
        activeFilterCount={1}
        onFilterChange={vi.fn()}
        onClearFilters={vi.fn()}
        viewMode="list"
        onViewModeChange={vi.fn()}
        density="comfortable"
        onDensityChange={vi.fn()}
        messages={{
          moreOptions: 'المزيد من الخيارات',
          clearAll: 'إزالة جميع عوامل التصفية',
          active: 'عامل تصفية نشط',
        }}
        primaryAction={{
          label: 'إضافة مرشح جديد إلى القائمة',
          onClick: vi.fn(),
        }}
      />,
      'modern',
    );

    const root = document.querySelector('.ds-pattern-list-toolbar') as HTMLElement;
    expect(root).toHaveAttribute('data-container-layout', 'compact');
    expect(root.querySelector('[data-part="mobile-layout"]')).not.toBeNull();
    expect(screen.getByText('المرشحون الذين يحتاجون إلى مراجعة عاجلة')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('ابحث بالاسم أو المهارة أو المصدر أو الحالة…')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'المزيد من الخيارات' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'إضافة مرشح جديد إلى القائمة' }),
    ).toHaveClass('rottay-button');

    fireEvent.click(
      screen.getByRole('button', {
        name: 'حالة التوظيف الحالية: نشط ويحتاج إلى متابعة',
      }),
    );
    expect(await screen.findByRole('listbox', { name: 'حالة التوظيف الحالية' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'نشط ويحتاج إلى متابعة' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });
});
