import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernOTPInput from '../engines/modern';

describe('Modern OTPInput under an IME', () => {
  it('commits nothing while a candidate is composing, then commits the confirmed character', () => {
    const onChange = vi.fn();
    const onComplete = vi.fn();
    render(<ModernOTPInput length={2} onChange={onChange} onComplete={onComplete} />);
    const first = screen.getByLabelText('Digit 1 of 2');

    fireEvent.compositionStart(first);
    fireEvent.change(first, { target: { value: '１' } });
    fireEvent.keyDown(first, { key: 'Backspace', isComposing: true });
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.compositionEnd(first, { data: '１' });
    expect(onChange).toHaveBeenCalledWith('1');
    expect(document.activeElement).toBe(screen.getByLabelText('Digit 2 of 2'));
    expect(onComplete).not.toHaveBeenCalled();
  });

  /**
   * Ordering assumption, stated because the exact OS/IME sequence is not
   * universally proven: a browser may deliver the confirmed character as
   * `compositionend` followed by a terminal non-composing `input`, or as an
   * `input` still flagged `isComposing` followed by `compositionend`. Either
   * order must produce exactly one commit.
   */
  it('commits once when a terminal non-composing input follows compositionend', () => {
    const onChange = vi.fn();
    const onComplete = vi.fn();
    render(<ModernOTPInput length={2} onChange={onChange} onComplete={onComplete} />);
    const first = screen.getByLabelText('Digit 1 of 2');

    fireEvent.compositionStart(first);
    fireEvent.change(first, { target: { value: '\uff11' } });
    fireEvent.compositionEnd(first, { data: '\uff11' });
    fireEvent.input(first, {
      target: { value: '\uff11' },
      data: '\uff11',
      inputType: 'insertCompositionText',
      isComposing: false,
    });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('1');
    expect(onComplete).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(screen.getByLabelText('Digit 2 of 2'));
  });

  it('still commits a corrected character typed into the slot the composition left', () => {
    const onChange = vi.fn();
    render(<ModernOTPInput length={2} onChange={onChange} />);
    const first = screen.getByLabelText('Digit 1 of 2');

    fireEvent.compositionStart(first);
    fireEvent.change(first, { target: { value: '\uff11' } });
    fireEvent.compositionEnd(first, { data: '\uff11' });
    expect(onChange).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(first, { key: '9' });
    fireEvent.change(first, { target: { value: '9' } });

    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenLastCalledWith('9');
  });

  it('still distributes a multi-character autofill delivered after a composition', () => {
    const onChange = vi.fn();
    const onComplete = vi.fn();
    render(<ModernOTPInput length={2} onChange={onChange} onComplete={onComplete} />);
    const first = screen.getByLabelText('Digit 1 of 2');

    fireEvent.compositionStart(first);
    fireEvent.change(first, { target: { value: '\uff11' } });
    fireEvent.compositionEnd(first, { data: '\uff11' });
    fireEvent.change(first, { target: { value: '12' } });

    expect(onChange).toHaveBeenLastCalledWith('12');
    expect(onComplete).toHaveBeenCalledWith('12');
  });

  it('never completes the code from a half-composed character', () => {
    const onComplete = vi.fn();
    render(<ModernOTPInput length={2} type="alphanumeric" value="a" onComplete={onComplete} onChange={() => {}} />);
    const last = screen.getByLabelText('Digit 2 of 2');
    fireEvent.compositionStart(last);
    fireEvent.change(last, { target: { value: 'n' } });
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('ignores navigation keys the IME is still consuming', () => {
    render(<ModernOTPInput length={3} />);
    const second = screen.getByLabelText('Digit 2 of 3');
    second.focus();
    fireEvent.keyDown(second, { key: 'ArrowLeft', keyCode: 229 });
    expect(document.activeElement).toBe(second);
    fireEvent.keyDown(second, { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(screen.getByLabelText('Digit 1 of 3'));
  });

  it('keeps ArrowRight on the visually next slot inside a right-to-left page', () => {
    const { container } = render(
      <div dir="rtl">
        <ModernOTPInput length={3} />
      </div>,
    );
    expect(container.querySelector('[data-part="root"]')).toHaveAttribute('dir', 'ltr');
    const first = screen.getByLabelText('Digit 1 of 3');
    first.focus();
    fireEvent.keyDown(first, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(screen.getByLabelText('Digit 2 of 3'));
  });

  it('stamps slot hover and focus through the interaction kernel', () => {
    render(<ModernOTPInput length={2} />);
    const first = screen.getByLabelText('Digit 1 of 2');
    fireEvent.pointerEnter(first);
    expect(first.getAttribute('data-state')).toContain('hovered');
    fireEvent.focus(first);
    expect(first.getAttribute('data-state')).toContain('focused');
  });
});
