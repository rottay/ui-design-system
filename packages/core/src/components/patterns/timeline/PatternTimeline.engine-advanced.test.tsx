import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { StableEngineName } from '../../../_internal/testing/helpers/engine-test-utils';
import { STABLE_ENGINES, renderWithEngine } from '../../../_internal/testing/helpers/engine-test-utils';
import type { TimelinePatternProps } from './Timeline.types';
import ClassicTimeline from './engines/classic';
import ModernTimeline from './engines/modern';
import RusticTimeline from './engines/rustic';

type AuditItem = { actor: string };

const COMPONENTS: Record<StableEngineName, React.ComponentType<TimelinePatternProps<AuditItem>>> = {
  classic: ClassicTimeline,
  modern: ModernTimeline,
  rustic: RusticTimeline,
};

const items = [
  {
    key: 'created',
    timestamp: new Date('2026-03-01T10:00:00Z'),
    title: 'Created',
    description: 'Record was created',
    type: 'success' as const,
    user: { name: 'Ana', avatar: 'https://example.com/a.png' },
    data: { actor: 'Ana' },
  },
  {
    key: 'failed',
    timestamp: new Date('2026-03-02T12:30:00Z'),
    title: 'Validation failed',
    description: 'The audit flagged a mismatch',
    type: 'error' as const,
    icon: <span>!</span>,
    data: { actor: 'System' },
  },
];

function createProps(overrides: Partial<TimelinePatternProps<AuditItem>> = {}): TimelinePatternProps<AuditItem> {
  return {
    items,
    header: <div>Timeline header</div>,
    footer: <div>Timeline footer</div>,
    ...overrides,
  };
}

describe('PatternTimeline advanced engine coverage', () => {
  it.each(STABLE_ENGINES)('covers loading and empty states through the %s engine', (engine) => {
    const Component = COMPONENTS[engine];
    const { rerender } = renderWithEngine(
      <Component {...createProps()} loading />,
      engine
    );

    expect(screen.queryByText('Created')).not.toBeInTheDocument();

    rerender(
      <Component
        {...createProps({
          items: [],
          emptyState: <div>Nothing happened yet</div>,
          loading: false,
        })}
      />
    );

    expect(screen.getByText('Nothing happened yet')).toBeInTheDocument();
  });

  it.each(STABLE_ENGINES)('covers grouped rendering, custom item rendering, timestamp toggles, and click flows through the %s engine', async (engine) => {
    const Component = COMPONENTS[engine];
    const onItemClick = vi.fn();
    const { rerender } = renderWithEngine(
      <Component
        {...createProps({
          groupByDate: true,
          mode: 'alternate',
          onItemClick,
          renderItem: (item, defaultRender) => (
            <div data-testid={`timeline-item-${item.key}`}>{defaultRender}</div>
          ),
        })}
      />,
      engine
    );

    expect(await screen.findByText('Timeline header')).toBeInTheDocument();
    expect(screen.getByText('Timeline footer')).toBeInTheDocument();
    expect(screen.getByTestId('timeline-item-created')).toBeInTheDocument();
    expect(screen.getByText('Validation failed')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Validation failed'));
    expect(onItemClick).toHaveBeenCalledWith(expect.objectContaining({ key: 'failed' }));

    if (engine === 'rustic') {
      const failedCard = screen.getByText('Validation failed').closest('div');
      if (failedCard instanceof HTMLElement) {
        fireEvent.mouseEnter(failedCard);
        fireEvent.mouseLeave(failedCard);
      }
    }

    rerender(
      <Component
        {...createProps({
          showTimestamp: false,
          onItemClick,
        })}
      />
    );

    expect(await screen.findByText('Created')).toBeInTheDocument();
  });
});
