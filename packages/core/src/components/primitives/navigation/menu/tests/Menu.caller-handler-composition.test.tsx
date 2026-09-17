/**
 * The kernel's handler bag does not chain: a JSX spread REPLACES a colliding
 * prop. MenuItem forwards the caller's props to the item element, so a caller
 * that also listens for a pointer press must keep its handler AND the kernel's
 * press state.
 */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { MenuItem } from '../compound/item';

/** The item's passthrough is typed as attributes only; a caller can still send a handler. */
const Item = MenuItem as unknown as React.ComponentType<Record<string, unknown>>;

describe('MenuItem composes the caller handler with the kernel', () => {
  it('runs the caller onPointerDown and still stamps the kernel press', () => {
    const onPointerDown = vi.fn();
    render(
      <ul>
        <Item itemKey="one" onPointerDown={onPointerDown}>One</Item>
      </ul>,
    );
    const item = screen.getByRole('menuitem');

    fireEvent.pointerDown(item);
    expect(onPointerDown).toHaveBeenCalledTimes(1);
    expect(item.getAttribute('data-state')).toContain('pressed');

    fireEvent.pointerUp(item);
    expect(item).not.toHaveAttribute('data-state');
  });

  it('lets the caller opt out of the kernel reaction with preventDefault', () => {
    const onPointerDown = vi.fn((event: React.PointerEvent) => event.preventDefault());
    render(
      <ul>
        <Item itemKey="one" onPointerDown={onPointerDown}>One</Item>
      </ul>,
    );
    const item = screen.getByRole('menuitem');

    fireEvent.pointerDown(item);
    expect(onPointerDown).toHaveBeenCalledTimes(1);
    expect(item).not.toHaveAttribute('data-state');
  });
});
