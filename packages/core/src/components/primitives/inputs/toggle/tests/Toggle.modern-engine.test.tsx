import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernToggle from '../engines/modern';

describe('Modern Toggle public anatomy', () => {
  it('paints nothing inline and stamps the skin contract', () => {
    const { container } = render(
      <ModernToggle label="Enable notifications" size="lg" color="success" defaultChecked />,
    );

    const root = container.querySelector('.ds-toggle--modern[data-part="root"]') as HTMLElement;
    const track = container.querySelector('[data-part="track"]') as HTMLElement;
    const thumb = container.querySelector('[data-part="thumb"]') as HTMLElement;
    const label = container.querySelector('[data-part="label"]') as HTMLElement;

    expect(root).toHaveAttribute('data-size', 'lg');
    expect(root).toHaveAttribute('data-color', 'success');
    expect(root).toHaveAttribute('data-checked', 'true');
    for (const el of [root, track, thumb, label]) {
      expect(el.style.background).toBe('');
      expect(el.style.backgroundColor).toBe('');
      expect(el.style.border).toBe('');
      expect(el.style.color).toBe('');
    }
    expect(track.style.width).toBe('');
    expect(thumb.style.transform).toBe('');
  });

  it('uses the full xl track geometry from the canonical channel', () => {
    const { container } = render(<ModernToggle label="XL" size="xl" />);
    expect(container.querySelector('[data-part="root"]')).toHaveAttribute('data-size', 'xl');
  });

  it('renders state labels and description anatomy', () => {
    render(
      <ModernToggle
        label="Availability"
        checkedLabel="Online"
        uncheckedLabel="Offline"
        description="Visible to recruiters when online."
        checked={false}
      />,
    );

    expect(screen.getByText('Offline')).toHaveAttribute('data-part', 'state-label');
    expect(screen.getByText(/Visible to recruiters/)).toHaveAttribute('data-part', 'description');
  });

  it('wires the error message through aria-describedby and role=alert', () => {
    const { container } = render(
      <ModernToggle label="Terms" error errorMessage="You must accept the terms to continue" />,
    );

    const input = container.querySelector('input[role="switch"]') as HTMLInputElement;
    const alert = screen.getByRole('alert');

    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', alert.id);
    expect(container.querySelector('[data-part="root"]')).toHaveAttribute('data-error', 'true');
  });

  it('renders helper text when there is no error', () => {
    render(<ModernToggle label="Updates" helperText="You can change this later in settings." />);
    const input = screen.getByRole('switch');

    expect(screen.getByText(/change this later/)).toHaveAttribute('data-part', 'helper-text');
    expect(input).toHaveAttribute('aria-describedby', expect.stringContaining('helper'));
  });

  it('stays a tab stop while loading and commits no value', () => {
    const handleChange = vi.fn();
    const { container } = render(<ModernToggle label="Sync" loading onChange={handleChange} />);
    const input = container.querySelector('input[role="switch"]') as HTMLInputElement;

    expect(input).not.toBeDisabled();
    expect(input).toHaveAttribute('aria-disabled', 'true');
    expect(input).toHaveAttribute('aria-busy', 'true');
    expect(container.querySelector('[data-part="loading-indicator"]')).toBeInTheDocument();

    fireEvent.click(input);
    expect(handleChange).not.toHaveBeenCalled();
    expect(input).not.toBeChecked();
  });

  it('keeps identical markup in an Arabic RTL context (travel flips in the skin)', () => {
    const { container } = render(
      <div dir="rtl" lang="ar">
        <ModernToggle label="تفعيل الإشعارات الفورية لكل تحديثات الملف الشخصي الطويلة" defaultChecked />
      </div>,
    );

    expect(container.querySelector('[data-part="root"]')).toHaveAttribute('data-checked', 'true');
    expect(screen.getByText(/تفعيل/)).toHaveAttribute('data-part', 'label');
  });

  it('toggles uncontrolled state through the native input', () => {
    const handleChange = vi.fn();
    const { container } = render(<ModernToggle label="Toggle" onChange={handleChange} />);
    const input = container.querySelector('input[role="switch"]') as HTMLInputElement;

    fireEvent.click(input);
    expect(handleChange).toHaveBeenCalledWith(true, expect.anything());
    expect(container.querySelector('[data-part="root"]')).toHaveAttribute('data-checked', 'true');
  });
});

describe('Modern Toggle press lifecycle', () => {
  const parts = (container: HTMLElement) => ({
    root: container.querySelector('[data-part="root"]') as HTMLElement,
    input: container.querySelector('input[role="switch"]') as HTMLInputElement,
  });

  it('cancels a Space press when focus leaves before the keyup', () => {
    const { container } = render(<ModernToggle label="Notifications" />);
    const { root, input } = parts(container);

    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: ' ' });
    expect(root.getAttribute('data-state')).toContain('pressed');

    fireEvent.blur(input);
    expect(root.getAttribute('data-state') ?? '').not.toContain('pressed');
  });

  it('changes value exactly once when the interrupted press is retried', () => {
    const handleChange = vi.fn();
    const { container } = render(<ModernToggle label="Notifications" onChange={handleChange} />);
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
    const { container } = render(<ModernToggle label="Notifications" />);
    const { root } = parts(container);

    fireEvent.pointerDown(root);
    expect(root.getAttribute('data-state')).toContain('pressed');

    fireEvent.pointerCancel(root);
    expect(root.getAttribute('data-state') ?? '').not.toContain('pressed');
  });

  it('does not resurrect a press interrupted by the loading state', () => {
    const { container, rerender } = render(<ModernToggle label="Notifications" />);
    const { root } = parts(container);

    fireEvent.pointerDown(root);
    rerender(<ModernToggle label="Notifications" loading />);
    rerender(<ModernToggle label="Notifications" />);

    expect(root.getAttribute('data-state') ?? '').not.toContain('pressed');
  });
});
