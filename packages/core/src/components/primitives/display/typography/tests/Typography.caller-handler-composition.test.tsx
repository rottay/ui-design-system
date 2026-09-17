/**
 * The modern Link spreads the caller's props AFTER its own chrome, so a
 * colliding caller handler used to DROP the kernel's. Both run now, caller
 * first.
 */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ModernLink } from '../engines/modern';

/** The link's passthrough is typed as attributes only; a caller can still send a handler. */
const Link = ModernLink as unknown as React.ComponentType<Record<string, unknown>>;

describe('ModernLink composes the caller handler with the kernel', () => {
  it('runs the caller onPointerDown and still stamps the kernel press', () => {
    const onPointerDown = vi.fn();
    render(<Link href="/about" onPointerDown={onPointerDown}>About</Link>);
    const link = screen.getByRole('link', { name: 'About' });

    fireEvent.pointerDown(link);
    expect(onPointerDown).toHaveBeenCalledTimes(1);
    expect(link.getAttribute('data-state')).toContain('pressed');

    fireEvent.pointerUp(link);
    expect(link).not.toHaveAttribute('data-state');
  });

  it('runs the caller onFocus and still stamps the kernel focus', () => {
    const onFocus = vi.fn();
    render(<Link href="/about" onFocus={onFocus}>About</Link>);
    const link = screen.getByRole('link', { name: 'About' });

    fireEvent.focus(link);
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(link.getAttribute('data-state')).toContain('focused');
  });
});
