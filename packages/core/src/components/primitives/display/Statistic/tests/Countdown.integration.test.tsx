import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Countdown } from '../compound/Countdown';
import { Countdown as ClassicCountdown } from '../engines/classic';

describe('Countdown integration', () => {
  it('formats future values, emits change events, and calls onFinish once the timer reaches zero', async () => {
    const handleChange = vi.fn();
    const handleFinish = vi.fn();
    const target = Date.now() + 1100;

    render(
      <Countdown
        title="Launch"
        value={target}
        format="ss"
        onChange={handleChange}
        onFinish={handleFinish}
      />
    );

    expect(screen.getByText('Launch')).toBeInTheDocument();
    expect(screen.getByText('01')).toBeInTheDocument();

    await waitFor(() => {
      expect(handleChange).toHaveBeenCalled();
      expect(handleFinish).toHaveBeenCalledTimes(1);
      expect(screen.getByText('00')).toBeInTheDocument();
    }, { timeout: 3000 });

    expect(screen.getByText('00')).toBeInTheDocument();
  });

  it('accepts ISO string targets and resolves immediately when the target date is already in the past', async () => {
    const handleFinish = vi.fn();

    render(
      <Countdown
        value="2026-03-13T11:59:59.000Z"
        format="mm:ss"
        suffix="remaining"
        onFinish={handleFinish}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('00:00')).toBeInTheDocument();
      expect(screen.getByText('remaining')).toBeInTheDocument();
      expect(handleFinish).toHaveBeenCalledTimes(1);
    }, { timeout: 1000 });
  });

  it('renders the classic engine countdown without Ant Design deprecation warnings', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    render(
      <ClassicCountdown
        title="Doors close"
        value={Date.now() + 60_000}
        format="mm:ss"
      />
    );

    const consoleMessages = consoleErrorSpy.mock.calls.flat().join(' ');

    expect(screen.getByText('Doors close')).toBeInTheDocument();
    expect(consoleMessages).not.toContain('<Statistic.Countdown />');

    consoleErrorSpy.mockRestore();
  });
});
