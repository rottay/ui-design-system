import React from 'react';
import { describe, expect, it } from 'vitest';

import { GanttChart } from '..';
import { resolveChartSeriesPaint } from '../../../runtime/chart-engine/foundation/grammar/palette';
import { CHART_CATEGORICAL_SIZE } from '../../../runtime/theming/composition/foundation/paint';
import { renderSurface } from '../../../../../../surfaces/foundation/common/test-utils';

const PALETTE = resolveChartSeriesPaint('accessible');

const TASKS = Array.from({ length: 13 }, (_, index) => ({
  id: `task-${index}`,
  name: `Task ${index}`,
  start: `2026-07-${String(index + 1).padStart(2, '0')}`,
  end: `2026-07-${String(index + 4).padStart(2, '0')}`,
}));

const LONG_OVERRIDE = Array.from(
  { length: 13 },
  (_, index) => `#${String(index + 10).repeat(3)}`,
);

function fillsOf(container: HTMLElement): (string | null)[] {
  return [...container.querySelectorAll('[data-part="task-duration"]')]
    .map((mark) => mark.getAttribute('fill'));
}

describe('GanttChart categorical paint', () => {
  it('cycles the resolved palette in task order and wraps at the categorical size', () => {
    const { container } = renderSurface(
      <GanttChart
        tasks={TASKS}
        width={640}
        height={480}
        responsive={false}
        animate={false}
        showToday={false}
      />,
    );

    expect(fillsOf(container)).toEqual(
      TASKS.map((_, index) => PALETTE[index % CHART_CATEGORICAL_SIZE]),
    );
  });

  it('lets a declared task colour win over the cycle', () => {
    const tasks = TASKS.map((task, index) => (
      index === 2 ? { ...task, color: '#abcdef' } : task
    ));
    const { container } = renderSurface(
      <GanttChart
        tasks={tasks}
        width={640}
        height={480}
        responsive={false}
        animate={false}
        showToday={false}
      />,
    );

    expect(fillsOf(container)[2]).toBe('#abcdef');
    expect(fillsOf(container)[3]).toBe(PALETTE[3]);
  });

  // A caller palette cycles at its own length, so an override longer than the
  // categorical size paints more than CHART_CATEGORICAL_SIZE distinct tasks.
  it('honours a caller palette longer than the categorical size', () => {
    const { container } = renderSurface(
      <GanttChart
        tasks={TASKS}
        colors={[...LONG_OVERRIDE]}
        width={640}
        height={480}
        responsive={false}
        animate={false}
        showToday={false}
      />,
    );

    expect(fillsOf(container)).toEqual(LONG_OVERRIDE);
    expect(new Set(fillsOf(container)).size).toBeGreaterThan(CHART_CATEGORICAL_SIZE);
  });
});
