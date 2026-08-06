import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import ModernInput from '../engines/modern';

afterEach(() => cleanup());

describe('Input modern engine — Enter during IME composition', () => {
  it('does not fire onPressEnter while an IME candidate is being confirmed', () => {
    const onPressEnter = vi.fn();
    render(<ModernInput aria-label="Search" onPressEnter={onPressEnter} />);
    const input = screen.getByRole('textbox', { name: 'Search' });

    fireEvent.compositionStart(input);
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true });

    expect(onPressEnter).not.toHaveBeenCalled();
  });

  it('fires onPressEnter for a real Enter once composition has ended', () => {
    const onPressEnter = vi.fn();
    render(<ModernInput aria-label="Search" onPressEnter={onPressEnter} />);
    const input = screen.getByRole('textbox', { name: 'Search' });

    fireEvent.compositionStart(input);
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true });
    fireEvent.compositionEnd(input);
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onPressEnter).toHaveBeenCalledTimes(1);
  });

  it('still forwards every keydown to onKeyDown, composing or not', () => {
    const onKeyDown = vi.fn();
    render(<ModernInput aria-label="Search" onKeyDown={onKeyDown} />);
    const input = screen.getByRole('textbox', { name: 'Search' });

    fireEvent.keyDown(input, { key: 'Enter', isComposing: true });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onKeyDown).toHaveBeenCalledTimes(2);
  });
});
