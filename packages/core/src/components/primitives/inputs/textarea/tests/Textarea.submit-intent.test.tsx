import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernTextarea from '../engines/modern';

describe('Modern Textarea onPressEnter', () => {
  it('fires on a plain Enter', () => {
    const onPressEnter = vi.fn();
    render(<ModernTextarea aria-label="Notes" onPressEnter={onPressEnter} />);
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' });
    expect(onPressEnter).toHaveBeenCalledOnce();
  });

  it('keeps Shift+Enter for a new line', () => {
    const onPressEnter = vi.fn();
    render(<ModernTextarea aria-label="Notes" onPressEnter={onPressEnter} />);
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter', shiftKey: true });
    expect(onPressEnter).not.toHaveBeenCalled();
  });

  it('never fires while an IME is composing', () => {
    const onPressEnter = vi.fn();
    render(<ModernTextarea aria-label="Notes" onPressEnter={onPressEnter} />);
    const control = screen.getByRole('textbox');
    fireEvent.keyDown(control, { key: 'Enter', isComposing: true });
    fireEvent.keyDown(control, { key: 'Enter', keyCode: 229 });
    expect(onPressEnter).not.toHaveBeenCalled();
  });

  it('ignores every other key', () => {
    const onPressEnter = vi.fn();
    render(<ModernTextarea aria-label="Notes" onPressEnter={onPressEnter} />);
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'a' });
    expect(onPressEnter).not.toHaveBeenCalled();
  });

  it('decides hover and focus through the interaction kernel', () => {
    render(<ModernTextarea aria-label="Notes" />);
    const control = screen.getByRole('textbox');
    fireEvent.pointerEnter(control);
    expect(control.getAttribute('data-state')).toContain('hovered');
    fireEvent.focus(control);
    expect(control.getAttribute('data-state')).toContain('focused');
  });
});
