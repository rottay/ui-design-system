import React from 'react';
import { act, fireEvent, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { StableEngineName } from '../../../../../_internal/testing/helpers/engine-test-utils';
import { STABLE_ENGINES, renderWithEngine } from '../../../../../_internal/testing/helpers/engine-test-utils';
import type { StatsGridProps } from '../StatsGrid.types';
import ClassicStatsGrid from '../engines/classic';
import ModernStatsGrid from '../engines/modern';
import RusticStatsGrid from '../engines/rustic';

const COMPONENTS: Record<StableEngineName, React.ComponentType<StatsGridProps>> = {
  classic: ClassicStatsGrid,
  modern: ModernStatsGrid,
  rustic: RusticStatsGrid,
};

const stats = [
  {
    key: 'revenue',
    label: 'Revenue',
    value: 4200,
    prefix: '$',
    change: 12,
    changeType: 'increase' as const,
    description: 'Monthly recurring revenue',
    sparklineData: [12, 18, 22, 28, 34],
    color: '#2563eb',
  },
  {
    key: 'churn',
    label: 'Churn',
    value: '2.1%',
    change: -1.4,
    changeType: 'decrease' as const,
    description: 'Customer churn rate',
  },
  {
    key: 'latency',
    label: 'Latency',
    value: 182,
    suffix: 'ms',
    icon: <span>⚡</span>,
  },
];

function createProps(overrides: Partial<StatsGridProps> = {}): StatsGridProps {
  return {
    stats,
    columns: 3,
    animate: false,
    ...overrides,
  };
}

describe('PatternStatsGrid advanced engine coverage', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it.each(STABLE_ENGINES)('covers loading states through the %s engine', (engine) => {
    const Component = COMPONENTS[engine];
    const { container } = renderWithEngine(
      <Component {...createProps()} loading />,
      engine
    );

    expect(screen.queryByText('Revenue')).not.toBeInTheDocument();

    if (engine === 'classic') {
      expect(container.querySelector('.ant-card-loading')).not.toBeNull();
    } else if (engine === 'modern') {
      expect(container.querySelector('.ds-stats-grid-skeleton')).not.toBeNull();
    } else {
      expect(container.querySelector('style')).not.toBeNull();
    }
  });

  it.each(STABLE_ENGINES)('covers variants, sparklines, render overrides, click handling and animation branches through the %s engine', async (engine) => {
    const Component = COMPONENTS[engine];
    const onStatClick = vi.fn();
    const nowSpy = vi.spyOn(performance, 'now').mockReturnValue(0);
    const requestAnimationFrameSpy = vi
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((callback: FrameRequestCallback) => {
        callback(1000);
        return 1;
      });

    const { rerender, container } = renderWithEngine(
      <Component
        {...createProps({
          animate: true,
          sparkline: true,
          variant: 'outlined',
          onStatClick,
          renderStat: (stat, defaultRender) =>
            stat.key === 'revenue' ? <div data-testid="custom-stat">{defaultRender}</div> : defaultRender,
        })}
      />,
      engine
    );

    expect(await screen.findByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('Churn')).toBeInTheDocument();
    expect(screen.getByTestId('custom-stat')).toBeInTheDocument();
    expect(container.querySelector('polyline')).not.toBeNull();

    fireEvent.click(screen.getByText('Revenue'));
    expect(onStatClick).toHaveBeenCalledWith(expect.objectContaining({ key: 'revenue' }));

    const keyboardTargets = screen.queryAllByRole('button');
    if (keyboardTargets[0]) {
      fireEvent.keyDown(keyboardTargets[0], { key: 'Enter' });
      expect(onStatClick).toHaveBeenCalled();
    }

    act(() => {
      rerender(
        <Component {...createProps({ animate: true, variant: 'filled', onStatClick })} />
      );
    });
    expect(await screen.findByText('Latency')).toBeInTheDocument();

    act(() => {
      rerender(
        <Component {...createProps({ animate: true, variant: 'glass', onStatClick })} />
      );
    });
    expect(await screen.findByText('Monthly recurring revenue')).toBeInTheDocument();

    expect(requestAnimationFrameSpy).toHaveBeenCalled();

    requestAnimationFrameSpy.mockRestore();
    nowSpy.mockRestore();
  });
});
