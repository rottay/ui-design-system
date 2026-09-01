import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';

import RusticTooltip from '../engines/rustic';

describe('Tooltip rustic engine advanced coverage', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('honors hover and focus delays while toggling aria-hidden', () => {
    render(
      <RusticTooltip
        content="Delayed tooltip"
        trigger={['hover', 'focus']}
        showDelay={150}
        hideDelay={50}
      >
        <button type="button">Inspect</button>
      </RusticTooltip>
    );

    const trigger = screen.getByRole('button', { name: 'Inspect' });

    fireEvent.mouseEnter(trigger);
    act(() => {
      vi.advanceTimersByTime(149);
    });
    expect(screen.queryByRole('tooltip')).toBeNull();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.getByRole('tooltip', { hidden: true })).toHaveAttribute('aria-hidden', 'false');

    fireEvent.mouseLeave(trigger);
    act(() => {
      vi.advanceTimersByTime(49);
    });
    expect(screen.getByRole('tooltip', { hidden: true })).toHaveAttribute('aria-hidden', 'false');

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.getByRole('tooltip', { hidden: true })).toHaveAttribute('aria-hidden', 'true');

    fireEvent.focus(trigger);
    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(screen.getByRole('tooltip', { hidden: true })).toHaveAttribute('aria-hidden', 'false');

    fireEvent.blur(trigger);
    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(screen.getByRole('tooltip', { hidden: true })).toHaveAttribute('aria-hidden', 'true');
  });

  it('supports controlled visibility, click toggles, placement styles, and disabled short-circuits', () => {
    const handleVisibleChange = vi.fn();
    const { rerender } = render(
      <RusticTooltip
        content="Pinned tooltip"
        trigger="click"
        visible
        placement="left-end"
        arrow={false}
        color="warning"
        maxWidth={160}
        zIndex={1200}
        onVisibleChange={handleVisibleChange}
      >
        <button type="button">Pin</button>
      </RusticTooltip>
    );

    const trigger = screen.getByRole('button', { name: 'Pin' });
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toHaveStyle({
      right: '100%',
      bottom: '0px',
      maxWidth: '160px',
      zIndex: '1200',
      visibility: 'visible',
    });

    fireEvent.click(trigger);
    act(() => {
      vi.advanceTimersByTime(0);
    });
    expect(handleVisibleChange).toHaveBeenCalledWith(false);

    rerender(
      <RusticTooltip content="Disabled tooltip" trigger="click" disabled defaultVisible={false}>
        <button type="button">Disabled trigger</button>
      </RusticTooltip>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Disabled trigger' }));
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(screen.getByRole('tooltip', { hidden: true })).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders formatted key chips alongside content when shortcut is set', () => {
    render(
      <RusticTooltip content="Open command palette" shortcut="ctrl+k" visible>
        <button type="button">Open</button>
      </RusticTooltip>
    );

    const tooltip = screen.getByRole('tooltip', { hidden: true });
    expect(tooltip).toHaveTextContent('Open command palette');
    expect(tooltip.querySelectorAll('kbd')).toHaveLength(2);
    expect(tooltip).toHaveTextContent('K');
  });

  it('renders no kbd chips when shortcut is omitted', () => {
    render(
      <RusticTooltip content="Plain tooltip" visible>
        <button type="button">Action</button>
      </RusticTooltip>
    );

    const tooltip = screen.getByRole('tooltip', { hidden: true });
    expect(tooltip.querySelectorAll('kbd')).toHaveLength(0);
  });
});
