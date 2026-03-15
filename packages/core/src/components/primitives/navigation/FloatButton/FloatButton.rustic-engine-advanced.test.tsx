import React, { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  BackTop as RusticBackTop,
  FloatButton as RusticFloatButton,
  Group as RusticGroup,
} from './engines/rustic';

describe('FloatButton rustic engine advanced coverage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('covers anchor, badge, hover, and forwarded ref branches on the base rustic button', () => {
    const ref = createRef<HTMLButtonElement>();
    const handleClick = vi.fn();

    const { rerender } = render(
      <RusticFloatButton
        ref={ref}
        description="Create"
        tooltip="Create record"
        badge={{ count: 120 }}
        onClick={handleClick}
        type="primary"
      >
        +
      </RusticFloatButton>
    );

    const button = screen.getByRole('button', { name: /create/i });
    fireEvent.mouseEnter(button);
    fireEvent.click(button);
    fireEvent.mouseLeave(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(button).toHaveAttribute('title', 'Create record');
    expect(screen.getByText('99+')).toBeInTheDocument();
    expect(ref.current).toBeTruthy();

    rerender(
      <RusticFloatButton
        href="/events"
        target="_blank"
        description="Open"
        badge={{ dot: true }}
      >
        Go
      </RusticFloatButton>
    );

    const link = screen.getByRole('link', { name: /open/i });
    expect(link).toHaveAttribute('href', '/events');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('covers click and hover group triggers plus controlled open changes', () => {
    const handleOpenChange = vi.fn();

    const { rerender } = render(
      <RusticGroup
        trigger="click"
        icon="+"
        closeIcon="x"
        onOpenChange={handleOpenChange}
      >
        <button type="button">Child action</button>
      </RusticGroup>
    );

    const triggerButton = screen.getByRole('button', { name: '+' });
    fireEvent.click(triggerButton);
    expect(handleOpenChange).toHaveBeenCalledWith(true);
    expect(screen.getByText('Child action').parentElement).not.toHaveStyle({ opacity: '0' });

    rerender(
      <RusticGroup
        trigger="hover"
        icon="+"
        open={false}
        onOpenChange={handleOpenChange}
      >
        <button type="button">Hover child</button>
      </RusticGroup>
    );

    const groupContainer = screen.getByRole('button', { name: '+' }).parentElement;
    if (!(groupContainer instanceof HTMLElement)) {
      throw new Error('Expected rustic group container');
    }

    fireEvent.mouseEnter(groupContainer);
    fireEvent.mouseLeave(groupContainer);

    expect(handleOpenChange).toHaveBeenCalledWith(true);
    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });

  it('covers back-to-top visibility for window and custom targets', () => {
    const windowScrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    Object.defineProperty(window, 'scrollY', { value: 300, writable: true, configurable: true });

    const handleClick = vi.fn();
    const { rerender } = render(
      <RusticBackTop visibilityHeight={200} onClick={handleClick} description="Top" />
    );

    const windowButton = screen.getByRole('button', { name: /top/i });
    fireEvent.click(windowButton);

    expect(windowScrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    expect(handleClick).toHaveBeenCalledTimes(1);

    const customTarget = document.createElement('div');
    customTarget.scrollTop = 250;
    customTarget.scrollTo = vi.fn();

    rerender(
      <RusticBackTop
        visibilityHeight={200}
        target={() => customTarget}
        description="Scroll up"
      />
    );

    customTarget.dispatchEvent(new Event('scroll'));
    const targetButton = screen.getByRole('button', { name: /scroll up/i });
    fireEvent.click(targetButton);

    expect(customTarget.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });
});
