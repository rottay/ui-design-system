import { cleanup, render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it } from 'vitest';

import { SvgBulletRenderer } from '../bullet';
import { SvgTreeMapRenderer } from '../treemap';
import { SvgCalendarHeatMapRenderer } from '../calendar-heat-map';
import { SvgGanttRenderer } from '../gantt';

afterEach(() => {
  cleanup();
  document.body.innerHTML = '';
});

describe('Taxonomy SVG renderers', () => {
  it('renders bullet lanes with band, value and target marks', () => {
    const { container } = render(
      <SvgBulletRenderer
        ariaLabel="KPI bullet"
        responsive={false}
        width={480}
        height={60}
        data={[{ id: 'rev', label: 'Revenue', value: 275, target: 250, ranges: [150, 200, 300] }]}
      />,
    );
    expect(screen.getByRole('img', { name: 'KPI bullet' })).toBeInTheDocument();
    expect(container.querySelectorAll('[data-part="range-band"]')).toHaveLength(3);
    expect(container.querySelector('[data-part="value-bar"]')).toBeInTheDocument();
    expect(container.querySelector('[data-part="target-marker"]')).toBeInTheDocument();
    expect(container.querySelector('[data-part="chart-renderer"]'))
      .toHaveAttribute('data-renderer-id', 'svg.bullet');
  });

  it('marks the bullet renderer empty on invalid data', () => {
    const { container } = render(
      <SvgBulletRenderer
        ariaLabel="Empty bullet"
        responsive={false}
        data={[{ id: 'x', label: 'X', value: Number.NaN, target: 4 }]}
      />,
    );
    expect(container.querySelector('[data-part="chart-renderer"]'))
      .toHaveAttribute('data-empty', 'true');
    expect(container.querySelectorAll('[data-part="range-band"]')).toHaveLength(0);
  });

  it('renders treemap tiles ordered by value', () => {
    const { container } = render(
      <SvgTreeMapRenderer
        ariaLabel="Allocation"
        responsive={false}
        width={400}
        height={300}
        data={[
          { name: 'Small', value: 10 },
          { name: 'Large', value: 60 },
        ]}
      />,
    );
    const tiles = [...container.querySelectorAll('[data-part="tile"]')];
    expect(tiles).toHaveLength(2);
    expect(tiles[0]!.querySelector('title')?.textContent).toBe('Large: 60');
    expect(container.querySelector('[data-part="tile-surface"]')).toBeInTheDocument();
  });

  it('renders one calendar cell per day with a filled state', () => {
    const { container } = render(
      <SvgCalendarHeatMapRenderer
        ariaLabel="Activity"
        responsive={false}
        startDate={new Date(2025, 0, 1)}
        endDate={new Date(2025, 0, 7)}
        values={new Map([['2025-01-03', 4]])}
      />,
    );
    expect(container.querySelectorAll('[data-part="cell"]')).toHaveLength(7);
    expect(container.querySelectorAll('[data-part="cell"][data-state="filled"]')).toHaveLength(1);
  });

  it('renders gantt duration bars and a deterministic semantic tree on the server', () => {
    const element = (
      <SvgGanttRenderer
        ariaLabel="Timeline"
        responsive={false}
        width={800}
        height={200}
        tasks={[
          { id: '1', name: 'Design', start: new Date(2026, 0, 1), end: new Date(2026, 1, 1), progress: 50 },
        ]}
      />
    );
    const html = renderToString(element);
    expect(html).toContain('data-renderer-id="svg.gantt"');

    const { container } = render(element);
    expect(container.querySelector('[data-part="task-duration"]')).toBeInTheDocument();
    expect(container.querySelector('[data-part="task-progress"]')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Timeline' })).toBeInTheDocument();
  });
});
