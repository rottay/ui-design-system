import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';

import { Countdown, Statistic } from '../engines/modern';

describe('Statistic modern advanced engine coverage', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('covers loading, formatter, invalid values, prefixes, suffixes, and fallback value colors', () => {
    const { rerender, container } = render(<Statistic title="Revenue" loading />);

    // K3-A Pass 1: the skeleton pulse moved from an inline animation to the
    // modern skin, keyed on data-loading -- the DOM carries the hook only.
    expect(container.firstElementChild).toHaveAttribute('data-loading', 'true');
    expect((container.firstElementChild as HTMLElement).style.animationDuration).toBe('');

    rerender(
      <Statistic
        title="Revenue"
        value="not-a-number"
        prefix="$"
        suffix="USD"
        valueType={'unexpected' as never}
      />
    );

    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('not-a-number')).toBeInTheDocument();
    expect(screen.getByText('$')).toBeInTheDocument();
    expect(screen.getByText('USD')).toBeInTheDocument();
    expect(container.querySelector('[data-part="title"]')).toHaveTextContent('Revenue');
    expect(container.querySelector('[data-part="value"]')).toHaveTextContent('$not-a-numberUSD');
    expect(container.firstElementChild).toHaveAttribute('data-has-title', 'true');
    expect(container.firstElementChild).toHaveAttribute('data-has-prefix', 'true');
    expect(container.firstElementChild).toHaveAttribute('data-has-suffix', 'true');
    expect(container.firstElementChild).toHaveAttribute('data-countdown', 'false');
    expect(container.querySelector('[data-part="number"]')).toHaveTextContent('not-a-number');

    rerender(
      <Statistic
        title="Orders"
        value={42.378}
        precision={1}
        formatter={(value) => `≈${value}`}
        valueType="positive"
      />
    );

    expect(screen.getByText('≈42.378')).toBeInTheDocument();
    expect(container.querySelector('[data-part="title"]')).toHaveTextContent('Orders');
    expect(container.querySelector('[data-part="value"]')).toHaveTextContent('≈42.378');
  });

  it('covers countdown updates, completion, numeric targets, and reset-on-rerender branches', async () => {
    const handleChange = vi.fn();
    const handleFinish = vi.fn();
    const now = new Date('2026-03-14T00:00:00.000Z');
    vi.setSystemTime(now);

    const { rerender } = render(
      <Countdown
        title="Launch"
        value={now.getTime() + 2000}
        format="mm:ss"
        prefix="T-"
        suffix=" left"
        valueType="warning"
        onChange={handleChange}
        onFinish={handleFinish}
      />
    );

    expect(screen.getByText('Launch')).toBeInTheDocument();
    expect(screen.getByText(/T-/)).toBeInTheDocument();
    expect(document.querySelector('[data-part="title"]')).toHaveTextContent('Launch');
    expect(document.querySelector('[data-part="value"]')).toHaveTextContent(/T-/);
    expect(document.querySelector('.rottay-statistic--modern')).toHaveAttribute('data-countdown', 'true');
    expect(document.querySelector('[data-part="number"]')).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(2100);
    });

    expect(handleChange).toHaveBeenCalled();
    expect(handleFinish).toHaveBeenCalledTimes(1);
    expect(screen.getByText('00:00')).toBeInTheDocument();

    rerender(
      <Countdown
        value={new Date(now.getTime() + 1000).toISOString()}
        format="ss"
        onFinish={handleFinish}
      />
    );

    await act(async () => {
      vi.advanceTimersByTime(1100);
    });

    expect(screen.getByText('00')).toBeInTheDocument();
  });
});
