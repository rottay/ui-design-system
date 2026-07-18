import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import ModernPopover from '../engines/modern';

describe('Popover modern engine advanced coverage', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('covers trigger arrays, placement classes, hover delays, focus, click, outside click, and overlay branches', async () => {
    vi.useFakeTimers();

    const onOpenChange = vi.fn();

    const { container, rerender } = render(
      <ModernPopover
        content="Popover body"
        title="Popover title"
        trigger={['hover', 'focus', 'click']}
        placement="rightTop"
        mouseEnterDelay={25}
        mouseLeaveDelay={25}
        onOpenChange={onOpenChange}
      >
        <button type="button">Open popover</button>
      </ModernPopover>
    );

    // Chrome moved into the modern skin: the trigger wrapper carries the scope
    // class and open state; placement rides data-placement on the surface part.
    const wrapper = container.querySelector('.rottay-popover--modern');
    expect(wrapper).not.toBeNull();
    expect(wrapper).toHaveAttribute('data-part', 'trigger');
    expect(wrapper).toHaveAttribute('data-open', 'false');

    fireEvent.mouseEnter(wrapper!);
    act(() => {
      vi.advanceTimersByTime(25);
    });
    expect(screen.getByText('Popover body')).toBeInTheDocument();
    expect(container.querySelector('[data-part="surface"]')).toHaveAttribute(
      'data-placement',
      'rightTop'
    );

    fireEvent.mouseLeave(wrapper!);
    act(() => {
      vi.advanceTimersByTime(25);
    });
    expect(screen.queryByText('Popover body')).not.toBeInTheDocument();

    fireEvent.focus(wrapper!);
    expect(screen.getByText('Popover title')).toBeInTheDocument();

    fireEvent.blur(wrapper!);
    expect(screen.queryByText('Popover title')).not.toBeInTheDocument();

    fireEvent.click(wrapper!);
    expect(screen.getByText('Popover body')).toBeInTheDocument();

    fireEvent.mouseDown(document.body);
    expect(screen.queryByText('Popover body')).not.toBeInTheDocument();

    rerender(
      <ModernPopover
        content="Controlled body"
        title="Controlled title"
        open
        arrow={false}
        overlayClassName="qa-popover"
        overlayStyle={{ minWidth: '220px' }}
      >
        <button type="button">Open popover</button>
      </ModernPopover>
    );

    expect(screen.getByText('Controlled body')).toBeInTheDocument();
    expect(container.querySelector('.qa-popover')).not.toBeNull();
    expect(container.querySelector('.qa-popover [data-part="arrow"]')).toBeNull();
    expect(onOpenChange).toHaveBeenCalled();
  });
});
