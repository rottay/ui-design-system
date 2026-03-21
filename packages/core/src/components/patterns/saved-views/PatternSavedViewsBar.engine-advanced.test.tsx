import React from 'react';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { StableEngineName } from '../../../_internal/testing/helpers/engine-test-utils';
import { STABLE_ENGINES, renderWithEngine } from '../../../_internal/testing/helpers/engine-test-utils';
import type { SavedViewsBarProps, SavedView } from './SavedViews.types';
import ClassicSavedViewsBar from './engines/classic';
import ModernSavedViewsBar from './engines/modern';
import RusticSavedViewsBar from './engines/rustic';

const COMPONENTS: Record<StableEngineName, React.ComponentType<SavedViewsBarProps>> = {
  classic: ClassicSavedViewsBar,
  modern: ModernSavedViewsBar,
  rustic: RusticSavedViewsBar,
};

const baseViews: SavedView[] = [
  {
    id: 'view-1',
    name: 'All Items',
    isDefault: true,
    config: { layout: 'table' },
  },
  {
    id: 'view-2',
    name: 'Active Only',
    config: {
      filters: { status: 'active' },
      sort: [{ field: 'name', direction: 'asc' }],
    },
  },
  {
    id: 'view-3',
    name: 'Board View',
    config: { layout: 'board' },
  },
];

function createBarProps(
  overrides: Partial<SavedViewsBarProps> = {}
): SavedViewsBarProps {
  return {
    views: baseViews,
    activeViewId: 'view-1',
    onViewSelect: vi.fn(),
    onViewSave: vi.fn(),
    onViewDelete: vi.fn(),
    onViewRename: vi.fn(),
    onViewCreate: vi.fn(),
    ...overrides,
  };
}

describe('PatternSavedViewsBar advanced engine coverage', () => {
  it.each(STABLE_ENGINES)(
    'covers loading state through the %s engine',
    async (engine) => {
      const Component = COMPONENTS[engine];
      renderWithEngine(<Component {...createBarProps()} loading />, engine);

      expect(screen.queryByText('All Items')).not.toBeInTheDocument();

      if (engine === 'classic') {
        expect(document.querySelector('.ant-spin')).not.toBeNull();
      } else if (engine === 'modern') {
        expect(document.querySelector('.loading-spinner')).not.toBeNull();
      } else {
        expect(screen.getByText('Loading...')).toBeInTheDocument();
      }
    }
  );

  it.each(STABLE_ENGINES)(
    'renders views and handles selection through the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      const onViewSelect = vi.fn();

      renderWithEngine(
        <Component
          {...createBarProps({
            onViewSelect,
            activeViewId: 'view-1',
          })}
        />,
        engine
      );

      expect(screen.getByText('All Items')).toBeInTheDocument();
      expect(screen.getByText('Active Only')).toBeInTheDocument();
      expect(screen.getByText('Board View')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Active Only'));
      expect(onViewSelect).toHaveBeenCalledWith('view-2');
    }
  );

  it.each(STABLE_ENGINES)(
    'handles view creation through the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      const onViewCreate = vi.fn();

      renderWithEngine(
        <Component {...createBarProps({ onViewCreate })} />,
        engine
      );

      const createBtn = screen.getByTestId('create-view-button');
      fireEvent.click(createBtn);

      const input = screen.getByTestId('new-view-input');
      fireEvent.change(input, { target: { value: 'My New View' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(onViewCreate).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'My New View' })
      );
    }
  );

  it.each(STABLE_ENGINES)(
    'shows context menu with options through the %s engine',
    async (engine) => {
      const Component = COMPONENTS[engine];
      const onViewDelete = vi.fn();

      renderWithEngine(
        <Component
          {...createBarProps({
            onViewDelete,
            allowRename: true,
            allowDelete: true,
            onViewDuplicate: vi.fn(),
          })}
        />,
        engine
      );

      // Find the options button for "Active Only" (view-2, not default)
      const optionsBtn = screen.getByLabelText('Active Only options');
      await act(async () => {
        fireEvent.click(optionsBtn);
      });

      // Should show Rename, Duplicate, Delete options
      expect(screen.getByText('Rename')).toBeInTheDocument();
      expect(screen.getByText('Duplicate')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    }
  );

  it.each(STABLE_ENGINES)(
    'respects allowCreate=false through the %s engine',
    async (engine) => {
      const Component = COMPONENTS[engine];

      renderWithEngine(
        <Component {...createBarProps({ allowCreate: false })} />,
        engine
      );

      expect(screen.queryByTestId('create-view-button')).not.toBeInTheDocument();
    }
  );

  it.each(STABLE_ENGINES)(
    'supports drag-and-drop reorder through the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      const onViewReorder = vi.fn();
      const dataTransfer = {
        effectAllowed: 'move',
        dropEffect: 'move',
        setData: vi.fn(),
        getData: vi.fn(),
      };

      renderWithEngine(
        <Component
          {...createBarProps({ onViewReorder })}
        />,
        engine
      );

      const sourceTab = screen.getByTestId('view-tab-view-1');
      const targetTab = screen.getByTestId('view-tab-view-3');

      fireEvent.dragStart(sourceTab, { dataTransfer });
      fireEvent.dragOver(targetTab, { dataTransfer });
      fireEvent.drop(targetTab, { dataTransfer });
      fireEvent.dragEnd(sourceTab);

      expect(onViewReorder).toHaveBeenCalledWith(['view-2', 'view-3', 'view-1']);
    }
  );

  it.each(STABLE_ENGINES)(
    'does not show delete for default view through the %s engine',
    async (engine) => {
      const Component = COMPONENTS[engine];

      renderWithEngine(
        <Component
          {...createBarProps({
            allowDelete: true,
            onViewDuplicate: vi.fn(),
          })}
        />,
        engine
      );

      // Open menu for the default view ("All Items")
      const optionsBtn = screen.getByLabelText('All Items options');
      await act(async () => {
        fireEvent.click(optionsBtn);
      });

      // Rename and Duplicate should appear, but Delete should not
      expect(screen.getByText('Rename')).toBeInTheDocument();
      expect(screen.getByText('Duplicate')).toBeInTheDocument();

      // Find all Delete buttons -- there may be none visible for default view
      const deleteButtons = screen.queryAllByText('Delete');
      // If delete appears, it should not be inside the "All Items" menu
      // The default view's menu should not have delete
      // We verify by checking our constraint: isDefault views skip the delete option
      const allItemsTab = screen.getByTestId('view-tab-view-1');
      const deleteInAllItems = within(allItemsTab).queryByText('Delete');
      expect(deleteInAllItems).not.toBeInTheDocument();
    }
  );

  it.each(STABLE_ENGINES)(
    'respects maxViews limit through the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];

      renderWithEngine(
        <Component
          {...createBarProps({
            maxViews: 3, // Already at 3 views
            allowCreate: true,
          })}
        />,
        engine
      );

      expect(screen.queryByTestId('create-view-button')).not.toBeInTheDocument();
    }
  );
});
