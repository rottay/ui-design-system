import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ColorPicker as ModernColorPicker } from '../engines/modern';

/** A controlled close must discard any uncommitted hex draft. */
describe('ColorPicker modern hex draft reset on controlled close', () => {
  it('does not resurrect a stale invalid draft when reopened after a controlled close', () => {
    const { rerender } = render(<ModernColorPicker open defaultValue="#123456" />);

    const hexInput = screen.getByPlaceholderText('#000000');
    fireEvent.change(hexInput, { target: { value: '#12' } });
    expect(hexInput).toHaveValue('#12');
    expect(hexInput).toHaveAttribute('aria-invalid', 'true');

    // Parent forces the panel closed without the draft ever committing or
    // reverting through Escape/click-outside/blur.
    rerender(<ModernColorPicker open={false} defaultValue="#123456" />);
    rerender(<ModernColorPicker open defaultValue="#123456" />);

    const reopened = screen.getByPlaceholderText('#000000');
    expect(reopened).toHaveValue('#123456');
    expect(reopened).not.toHaveAttribute('aria-invalid');
  });

  it('still lets an in-progress draft render while the panel stays open', () => {
    render(<ModernColorPicker open defaultValue="#123456" />);

    const hexInput = screen.getByPlaceholderText('#000000');
    fireEvent.change(hexInput, { target: { value: '#abc' } });

    // A 3-digit draft is valid grammar (HEX_DRAFT_RE) but has not committed
    // yet -- it must still render as typed while the panel stays open.
    expect(hexInput).toHaveValue('#abc');
  });
});
