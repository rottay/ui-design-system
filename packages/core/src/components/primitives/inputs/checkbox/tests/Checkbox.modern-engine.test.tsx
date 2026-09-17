import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernCheckbox from '../engines/modern';

describe('Modern Checkbox public anatomy', () => {
  it('paints nothing inline and stamps the skin contract', () => {
    const { container } = render(
      <ModernCheckbox label="Agree to terms" size="lg" color="success" radius="md" defaultChecked />,
    );

    const root = container.querySelector('.ds-checkbox--modern[data-part="root"]') as HTMLElement;
    const box = container.querySelector('[data-part="box"]') as HTMLElement;
    const label = container.querySelector('[data-part="label"]') as HTMLElement;

    expect(root).toHaveAttribute('data-size', 'lg');
    expect(root).toHaveAttribute('data-color', 'success');
    expect(root).toHaveAttribute('data-radius', 'md');
    expect(root).toHaveAttribute('data-checked', 'true');
    expect(root).toHaveAttribute('data-active', 'true');
    for (const el of [root, box, label]) {
      expect(el.style.background).toBe('');
      expect(el.style.border).toBe('');
      expect(el.style.color).toBe('');
    }
    expect(box.style.width).toBe('');
  });

  it('exposes indeterminate semantics on the native input', () => {
    const { container } = render(<ModernCheckbox label="Select all" indeterminate />);
    const input = container.querySelector('input[type="checkbox"]') as HTMLInputElement;

    expect(input.indeterminate).toBe(true);
    // A native checkbox exposes its tri-state through the `indeterminate` DOM
    // property; `aria-checked` has no content attribute that could agree with it.
    expect(input).not.toHaveAttribute('aria-checked');
    expect(container.querySelector('[data-part="root"]')).toHaveAttribute('data-indeterminate', 'true');
  });

  it('renders description anatomy and label placement without inline paint', () => {
    const { container } = render(
      <ModernCheckbox
        label="Share profile"
        description="Recruiters with an active mandate can view this candidate."
        labelPlacement="start"
      />,
    );

    const root = container.querySelector('[data-part="root"]') as HTMLElement;
    expect(root).toHaveAttribute('data-label-placement', 'start');
    expect(root.style.flexDirection).toBe('');
    expect(screen.getByText(/active mandate/)).toHaveAttribute('data-part', 'description');
  });

  it('marks error and required on the control, not only on paint', () => {
    const { container } = render(<ModernCheckbox label="Consent" error required />);
    const input = container.querySelector('input[type="checkbox"]') as HTMLInputElement;

    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toBeRequired();
    expect(container.querySelector('[data-part="root"]')).toHaveAttribute('data-error', 'true');
  });

  it('keeps label, box, and long copy intact in an Arabic RTL context', () => {
    const { container } = render(
      <div dir="rtl" lang="ar">
        <ModernCheckbox
          label="أوافق على مشاركة ملفي الشخصي مع جهات التوظيف المعتمدة لفترات طويلة جداً دون اقتطاع"
          defaultChecked
        />
      </div>,
    );

    expect(container.querySelector('[data-part="root"]')).toHaveAttribute('data-checked', 'true');
    expect(screen.getByText(/أوافق/)).toHaveAttribute('data-part', 'label');
  });

  it('toggles uncontrolled state through the native input', () => {
    const handleChange = vi.fn();
    const { container } = render(<ModernCheckbox label="Toggle me" onChange={handleChange} />);
    const input = container.querySelector('input[type="checkbox"]') as HTMLInputElement;

    fireEvent.click(input);
    expect(handleChange).toHaveBeenCalledWith(true, expect.anything());
    expect(container.querySelector('[data-part="root"]')).toHaveAttribute('data-checked', 'true');
  });
});

describe('Modern Checkbox press lifecycle', () => {
  const parts = (container: HTMLElement) => ({
    root: container.querySelector('[data-part="root"]') as HTMLElement,
    input: container.querySelector('input[type="checkbox"]') as HTMLInputElement,
  });

  it('cancels a Space press when focus leaves before the keyup', () => {
    const { container } = render(<ModernCheckbox label="Agree" />);
    const { root, input } = parts(container);

    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: ' ' });
    expect(root.getAttribute('data-state')).toContain('pressed');

    fireEvent.blur(input);
    expect(root.getAttribute('data-state') ?? '').not.toContain('pressed');
  });

  it('changes value exactly once when the interrupted press is retried', () => {
    const handleChange = vi.fn();
    const { container } = render(<ModernCheckbox label="Agree" onChange={handleChange} />);
    const { root, input } = parts(container);

    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: ' ' });
    fireEvent.blur(input);
    expect(handleChange).not.toHaveBeenCalled();

    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: ' ' });
    fireEvent.click(input);
    fireEvent.keyUp(input, { key: ' ' });

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith(true, expect.anything());
    expect(root.getAttribute('data-state') ?? '').not.toContain('pressed');
  });

  it('cancels the press when the pointer is cancelled mid-gesture', () => {
    const { container } = render(<ModernCheckbox label="Agree" />);
    const { root } = parts(container);

    fireEvent.pointerDown(root);
    expect(root.getAttribute('data-state')).toContain('pressed');

    fireEvent.pointerCancel(root);
    expect(root.getAttribute('data-state') ?? '').not.toContain('pressed');
  });

  it('does not resurrect a press interrupted by disabling the control', () => {
    const { container, rerender } = render(<ModernCheckbox label="Agree" />);
    const { root } = parts(container);

    fireEvent.pointerDown(root);
    rerender(<ModernCheckbox label="Agree" disabled />);
    rerender(<ModernCheckbox label="Agree" />);

    expect(root.getAttribute('data-state') ?? '').not.toContain('pressed');
  });
});
