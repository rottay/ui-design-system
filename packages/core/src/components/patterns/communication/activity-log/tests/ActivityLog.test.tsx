import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';

import type { StableEngineName } from '../../../../../_internal/testing/helpers/engine-test-utils';
import { STABLE_ENGINES, renderWithEngine } from '../../../../../_internal/testing/helpers/engine-test-utils';
import type { ActivityLogProps } from '../ActivityLog.types';
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
});
