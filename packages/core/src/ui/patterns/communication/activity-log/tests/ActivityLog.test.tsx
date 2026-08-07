import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';

import type { StableEngineName } from '../../../../../tooling/testing/helpers/engine';
import { STABLE_ENGINES, renderWithEngine } from '../../../../../tooling/testing/helpers/engine';
import type { ActivityLogProps } from '../contracts';
import ClassicActivityLog from '../engines/classic';
import ModernActivityLog from '../engines/modern';
import RusticActivityLog from '../engines/rustic';

const COMPONENTS: Record<StableEngineName, React.ComponentType<ActivityLogProps>> = {
  classic: ClassicActivityLog,
  modern: ModernActivityLog,
  rustic: RusticActivityLog,
};

function createProps(overrides: Partial<ActivityLogProps> = {}): ActivityLogProps {
  return {
    activities: [
      {
        id: 'a1',
        user: { name: 'Alice' },
        action: 'created',
        timestamp: new Date().toISOString(),
        entityType: 'Task',
        entityId: '42',
      },
      {
        id: 'a2',
        user: { name: 'Bob' },
        action: 'updated',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        entityType: 'Task',
        entityId: '42',
        diff: { status: { from: 'open', to: 'closed' } },
      },
    ],
    ...overrides,
  };
}

describe('PatternActivityLog', () => {
  it.each(STABLE_ENGINES)(
    'renders activities with the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      renderWithEngine(<Component {...createProps()} />, engine);

      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
      expect(screen.getByText('created')).toBeInTheDocument();
      expect(screen.getByText('updated')).toBeInTheDocument();
    },
  );

  it.each(STABLE_ENGINES)(
    'shows empty message when no activities in the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      renderWithEngine(
        <Component {...createProps({ activities: [], emptyMessage: 'No activity yet' })} />,
        engine,
      );

      expect(screen.getByText('No activity yet')).toBeInTheDocument();
    },
  );

  it.each(STABLE_ENGINES)(
    'renders entity type and id in the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      renderWithEngine(<Component {...createProps()} />, engine);

      expect(screen.getAllByText(/Task/).length).toBeGreaterThan(0);
    },
  );

  it.each(STABLE_ENGINES)(
    'fires onActivityClick when activity is clicked in the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      const onClick = vi.fn();
      renderWithEngine(
        <Component {...createProps({ onActivityClick: onClick })} />,
        engine,
      );

      fireEvent.click(screen.getByText('Alice'));
      expect(onClick).toHaveBeenCalled();
    },
  );

  it.each(STABLE_ENGINES)(
    'renders diff changes in the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      renderWithEngine(<Component {...createProps()} />, engine);

      expect(screen.getByText(/status/)).toBeInTheDocument();
      expect(screen.getByText(/open/)).toBeInTheDocument();
      expect(screen.getByText(/closed/)).toBeInTheDocument();
    },
  );

  describe('modern names the feed and its filters', () => {
    it('gives each filter control an accessible name a placeholder cannot provide', async () => {
      renderWithEngine(
        <ModernActivityLog
          {...createProps({
            onFilterChange: vi.fn(),
            actionTypes: ['created', 'updated'],
            users: [{ id: 'u1', name: 'Alice' }],
          })}
        />,
        'modern',
      );

      // A placeholder disappears the moment a value is picked, so it is not a
      // name: both combobox filters were previously anonymous to AT.
      // The Select primitive resolves lazily through Suspense.
      expect(await screen.findByRole('combobox', { name: 'Filter by action' })).toBeInTheDocument();
      expect(screen.getByRole('combobox', { name: 'Filter by user' })).toBeInTheDocument();
    });

    it('labels the composed timeline so the feed is not an anonymous list', () => {
      renderWithEngine(<ModernActivityLog {...createProps()} />, 'modern');

      expect(screen.getByRole('list', { name: 'Activity feed' })).toBeInTheDocument();
    });
  });
});
