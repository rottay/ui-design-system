import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Countdown as RusticCountdown, Statistic as RusticStatistic } from './engines/rustic';

describe('Statistic rustic engine advanced coverage', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-13T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('renders loading states and then semantic formatted values', () => {
    const { rerender } = render(<RusticStatistic loading title="Revenue" />);

    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    rerender(
      <RusticStatistic
        title="Revenue"
        value={12345.678}
        precision={1}
        prefix="$"
        suffix="ARR"
        valueType="positive"
      />
    );

    const value = screen.getByText('12,345.7').parentElement as HTMLDivElement;
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('$')).toBeInTheDocument();
    expect(screen.getByText('ARR')).toBeInTheDocument();
    expect(value.style.color).toContain('--ds-statistic-positive-color');
  });

  it('prefers custom formatter output and preserves invalid string values', () => {
    render(
      <>
        <RusticStatistic value="not-a-number" />
        <RusticStatistic value={42} formatter={(value) => `#${String(value)}`} valueType="warning" />
      </>
    );

    expect(screen.getByText('not-a-number')).toBeInTheDocument();
    expect(screen.getByText('#42')).toBeInTheDocument();
  });

  it('runs rustic countdown intervals, announces progress, and resets when the target changes', async () => {
    const handleChange = vi.fn();
    const handleFinish = vi.fn();

    const { rerender } = render(
      <RusticCountdown
        title="Launch"
        value={Date.now() + 2500}
        format="ss"
        prefix="T-"
        suffix="left"
        valueType="negative"
        onChange={handleChange}
        onFinish={handleFinish}
      />
    );

    expect(screen.getByRole('timer')).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByText('Launch')).toBeInTheDocument();
    expect(screen.getByText('T-')).toBeInTheDocument();
    expect(screen.getByText('left')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(handleChange).toHaveBeenCalled();
    expect(handleFinish).toHaveBeenCalledTimes(1);
    expect(screen.getByText('00')).toBeInTheDocument();

    rerender(
      <RusticCountdown
        title="Launch"
        value={Date.now() + 1500}
        format="ss"
        onChange={handleChange}
        onFinish={handleFinish}
      />
    );

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(handleFinish).toHaveBeenCalledTimes(2);
    expect(screen.getByText('00')).toBeInTheDocument();
  }, 10000);
});
