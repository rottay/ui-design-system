import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { ChartProjectionSpec, ChartProjectionView } from '../../../../../foundation/projection';
import { ChartFrame } from '..';

const activityProjection: ChartProjectionSpec = {
  desktop: {
    mode: 'full',
    rendererId: 'activity-calendar',
  },
  tablet: {
    mode: 'full',
    rendererId: 'activity-calendar-compact',
  },
  phone: {
    mode: 'summary',
    rendererId: 'activity-summary',
    summaryId: 'recent-activity',
  },
};

function referencedElements(
  element: Element,
  attribute: 'aria-labelledby' | 'aria-describedby',
): Element[] {
  const ids = element.getAttribute(attribute)?.split(/\s+/).filter(Boolean) ?? [];
  return ids.map((id) => {
    const target = document.getElementById(id);
    expect(target).not.toBeNull();
    return target as Element;
  });
}

describe('ChartFrame', () => {
  it('renders the complete ready anatomy and delegates only the resolved view', () => {
    const renderView = vi.fn((view: ChartProjectionView) => (
      <div data-testid="renderer">{view.rendererId}</div>
    ));

    render(
      <ChartFrame
        title="Candidate activity"
        question="When are candidates most active?"
        description="Trailing 90 days"
        insight="Tuesday is the busiest day."
        toolbar={<button type="button">Open table</button>}
        legend={<div>Activity intensity</div>}
        source={<a href="/sources/activity">Application events</a>}
        freshness={<time dateTime="2026-07-16T12:00:00Z">Updated today</time>}
        projection={activityProjection}
        deviceClass="desktop"
        renderView={renderView}
      />,
    );

    const frame = screen.getByRole('region', { name: 'Candidate activity' });
    const view = screen.getByRole('group', { name: 'Candidate activity' });

    expect(frame).toHaveAttribute('data-state', 'ready');
    expect(frame).toHaveAttribute('data-projection-mode', 'full');
    expect(frame).toHaveAttribute('data-renderer-id', 'activity-calendar');
    expect(frame).not.toHaveAttribute('aria-busy');
    expect(view).toHaveAttribute('data-projection-mode', 'full');
    expect(screen.getByTestId('renderer')).toHaveTextContent('activity-calendar');
    expect(screen.getByRole('button', { name: 'Open table' })).toBeInTheDocument();
    expect(screen.getByText('Activity intensity')).toBeInTheDocument();
    expect(screen.getByText('Tuesday is the busiest day.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Application events' })).toBeInTheDocument();
    expect(screen.getByText('Updated today')).toBeInTheDocument();
    expect(renderView).toHaveBeenCalledOnce();
    expect(renderView).toHaveBeenCalledWith(activityProjection.desktop);

    expect(referencedElements(frame, 'aria-labelledby')[0]).toHaveTextContent(
      'Candidate activity',
    );
    expect(referencedElements(frame, 'aria-describedby')).toEqual([
      screen.getByText('When are candidates most active?'),
      screen.getByText('Trailing 90 days'),
    ]);
    expect(referencedElements(view, 'aria-describedby')).toEqual(
      referencedElements(frame, 'aria-describedby'),
    );
  });

  it.each([
    {
      state: 'loading' as const,
      label: 'Loading activity',
      expectedRole: 'status',
      expectedLive: 'polite',
      busy: true,
    },
    {
      state: 'empty' as const,
      label: 'No activity yet',
      expectedRole: 'status',
      expectedLive: 'polite',
      busy: false,
    },
    {
      state: 'error' as const,
      label: 'Activity unavailable',
      expectedRole: 'alert',
      expectedLive: 'assertive',
      busy: false,
    },
  ])(
    'renders an atomic $state state without mounting stale marks',
    ({ state, label, expectedRole, expectedLive, busy }) => {
      const renderView = vi.fn(() => <svg aria-label="stale chart" />);

      const { container } = render(
        <ChartFrame
          title="Activity"
          projection={activityProjection}
          deviceClass="desktop"
          renderView={renderView}
          state={state}
          stateLabel={label}
          stateDescription="Try again shortly."
          stateAction={<button type="button">Retry</button>}
        />,
      );

      const frame = screen.getByRole('region', { name: 'Activity' });
      const feedback = container.querySelector(`[role="${expectedRole}"]`);

      expect(feedback).not.toBeNull();
      expect(feedback).toHaveAttribute('aria-live', expectedLive);
      expect(feedback).toHaveAttribute('aria-atomic', 'true');
      expect(feedback).toHaveTextContent(label);
      expect(feedback).toHaveTextContent('Try again shortly.');
      expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
      expect(frame.hasAttribute('aria-busy')).toBe(busy);
      expect(screen.queryByLabelText('stale chart')).not.toBeInTheDocument();
      expect(renderView).not.toHaveBeenCalled();
    },
  );

  it('selects a new renderer when the resolved semantic projection changes', () => {
    const renderView = vi.fn((view: ChartProjectionView) => (
      <div data-testid="selected-view">{view.mode}:{view.rendererId}</div>
    ));
    const { rerender } = render(
      <ChartFrame
        title="Activity"
        projection={activityProjection}
        deviceClass="desktop"
        renderView={renderView}
      />,
    );

    rerender(
      <ChartFrame
        title="Activity"
        projection={activityProjection}
        deviceClass="phone"
        renderView={renderView}
      />,
    );

    expect(screen.getByTestId('selected-view')).toHaveTextContent(
      'summary:activity-summary',
    );
    expect(screen.getByRole('region', { name: 'Activity' })).toHaveAttribute(
      'data-projection-mode',
      'summary',
    );
    expect(renderView).toHaveBeenLastCalledWith(activityProjection.phone);
  });

  it('uses the responsive runtime and its mobile-first SSR fallback by default', () => {
    const renderView = vi.fn((view: ChartProjectionView) => (
      <div>{view.rendererId}</div>
    ));

    render(
      <ChartFrame
        title="Activity"
        projection={activityProjection}
        renderView={renderView}
      />,
    );

    const frame = screen.getByRole('region', { name: 'Activity' });
    expect(frame).toHaveAttribute('data-device-class', 'phone');
    expect(frame).toHaveAttribute('data-projection-mode', 'summary');
    expect(screen.getByText('activity-summary')).toBeInTheDocument();
    expect(renderView).toHaveBeenCalledWith(activityProjection.phone);
  });

  it('keeps heading and description ids unique across colocated provider roots', () => {
    render(
      <>
        <ChartFrame
          title="Activity"
          description="Team one"
          projection={activityProjection}
          deviceClass="desktop"
          renderView={() => <div>First chart</div>}
        />
        <ChartFrame
          title="Activity"
          description="Team two"
          headingLevel={3}
          projection={activityProjection}
          deviceClass="desktop"
          renderView={() => <div>Second chart</div>}
        />
      </>,
    );

    const frames = screen.getAllByRole('region', { name: 'Activity' });
    expect(frames).toHaveLength(2);
    expect(frames[0]?.getAttribute('aria-labelledby')).not.toBe(
      frames[1]?.getAttribute('aria-labelledby'),
    );
    expect(frames[0]?.getAttribute('aria-describedby')).not.toBe(
      frames[1]?.getAttribute('aria-describedby'),
    );
    expect(screen.getByRole('heading', { level: 3, name: 'Activity' })).toBeInTheDocument();
  });
});
