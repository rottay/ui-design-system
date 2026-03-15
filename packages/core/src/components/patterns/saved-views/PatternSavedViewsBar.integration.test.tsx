import React from 'react';
import { act, fireEvent, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { StableEngineName } from '../../../testing/helpers/engine-test-utils';
import { STABLE_ENGINES, renderWithEngine } from '../../../testing/helpers/engine-test-utils';
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

describe('PatternSavedViewsBar integration', () => {
  describe('view selection', () => {
    it.each(STABLE_ENGINES)(
      'highlights the active view and switches on click through the %s engine',
      async (engine) => {
        const Component = COMPONENTS[engine];
        const onViewSelect = vi.fn();

        renderWithEngine(
          <Component
            {...createBarProps({ onViewSelect, activeViewId: 'view-1' })}
          />,
          engine
        );

        // All views should be rendered
        expect(screen.getByText('All Items')).toBeInTheDocument();
        expect(screen.getByText('Active Only')).toBeInTheDocument();
        expect(screen.getByText('Board View')).toBeInTheDocument();

        // Click a non-active view
        fireEvent.click(screen.getByText('Board View'));
        expect(onViewSelect).toHaveBeenCalledWith('view-3');
      }
    );

    it.each(STABLE_ENGINES)(
      'supports selecting each view individually through the %s engine',
      (engine) => {
        const Component = COMPONENTS[engine];
        const onViewSelect = vi.fn();

        renderWithEngine(
          <Component
            {...createBarProps({ onViewSelect, activeViewId: 'view-1' })}
          />,
          engine
        );

        fireEvent.click(screen.getByText('Active Only'));
        expect(onViewSelect).toHaveBeenCalledWith('view-2');
      }
    );
  });

  describe('create view', () => {
    it.each(STABLE_ENGINES)(
      'opens creation input and submits new view name through the %s engine',
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
        fireEvent.change(input, { target: { value: 'Custom View' } });
        fireEvent.keyDown(input, { key: 'Enter' });

        expect(onViewCreate).toHaveBeenCalledWith(
          expect.objectContaining({ name: 'Custom View' })
        );
      }
    );

    it.each(STABLE_ENGINES)(
      'does not show create button when allowCreate is false through the %s engine',
      (engine) => {
        const Component = COMPONENTS[engine];

        renderWithEngine(
          <Component {...createBarProps({ allowCreate: false })} />,
          engine
        );

        expect(screen.queryByTestId('create-view-button')).not.toBeInTheDocument();
      }
    );
  });

  describe('rename view', () => {
    it.each(STABLE_ENGINES)(
      'shows rename option in context menu through the %s engine',
      async (engine) => {
        const Component = COMPONENTS[engine];
        const onViewRename = vi.fn();

        renderWithEngine(
          <Component
            {...createBarProps({
              onViewRename,
              allowRename: true,
              allowDelete: true,
              onViewDuplicate: vi.fn(),
            })}
          />,
          engine
        );

        const optionsBtn = screen.getByLabelText('Active Only options');
        await act(async () => {
          fireEvent.click(optionsBtn);
        });

        expect(screen.getByText('Rename')).toBeInTheDocument();
      }
    );
  });

  describe('delete view', () => {
    it.each(STABLE_ENGINES)(
      'shows delete option for non-default views through the %s engine',
      async (engine) => {
        const Component = COMPONENTS[engine];
        const onViewDelete = vi.fn();

        renderWithEngine(
          <Component
            {...createBarProps({
              onViewDelete,
              allowDelete: true,
              onViewDuplicate: vi.fn(),
            })}
          />,
          engine
        );

        const optionsBtn = screen.getByLabelText('Active Only options');
        await act(async () => {
          fireEvent.click(optionsBtn);
        });

        expect(screen.getByText('Delete')).toBeInTheDocument();
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

        const optionsBtn = screen.getByLabelText('All Items options');
        await act(async () => {
          fireEvent.click(optionsBtn);
        });

        const allItemsTab = screen.getByTestId('view-tab-view-1');
        const deleteInDefault = within(allItemsTab).queryByText('Delete');
        expect(deleteInDefault).not.toBeInTheDocument();
      }
    );
  });

  describe('maxViews constraint', () => {
    it.each(STABLE_ENGINES)(
      'hides create button when at max views through the %s engine',
      (engine) => {
        const Component = COMPONENTS[engine];

        renderWithEngine(
          <Component
            {...createBarProps({ maxViews: 3, allowCreate: true })}
          />,
          engine
        );

        expect(screen.queryByTestId('create-view-button')).not.toBeInTheDocument();
      }
    );

    it.each(STABLE_ENGINES)(
      'shows create button when below max views through the %s engine',
      (engine) => {
        const Component = COMPONENTS[engine];

        renderWithEngine(
          <Component
            {...createBarProps({ maxViews: 10, allowCreate: true })}
          />,
          engine
        );

        expect(screen.getByTestId('create-view-button')).toBeInTheDocument();
      }
    );
  });

  describe('drag-and-drop reorder', () => {
    it.each(STABLE_ENGINES)(
      'calls onViewReorder with updated order through the %s engine',
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
          <Component {...createBarProps({ onViewReorder })} />,
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
  });
});
