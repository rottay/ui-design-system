import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernTextarea from '../engines/modern';

describe('Modern Textarea public anatomy', () => {
  it('paints nothing inline and stamps the skin contract', () => {
    const { container } = render(
      <ModernTextarea size="lg" status="error" defaultValue="Draft biography" />,
    );

    const root = container.querySelector('.ds-textarea--modern[data-part="root"]') as HTMLElement;
    const field = container.querySelector('.ds-textarea-field[data-part="field"]') as HTMLElement;

    expect(root).toHaveAttribute('data-size', 'lg');
    expect(root).toHaveAttribute('data-status', 'error');
    expect(root).toHaveAttribute('data-filled', 'true');
    expect(root).toHaveAttribute('aria-invalid', 'true');
    expect(root.style.cssText).toBe('');
    expect(field).toBeInTheDocument();
  });

  it('renders the character count with limit semantics', () => {
    render(<ModernTextarea showCount maxLength={10} defaultValue="1234567890" />);
    const count = screen.getByText('10/10');
    expect(count).toHaveAttribute('data-count-state', 'limit');
    expect(count).toHaveAttribute('aria-live', 'polite');
  });

  it('clears through a catalog-labeled action and restores focus', () => {
    const handleClear = vi.fn();
    const handleChange = vi.fn();
    const { container } = render(
      <ModernTextarea allowClear defaultValue="Some text" onClear={handleClear} onChange={handleChange} />,
    );

    const clearButton = screen.getByRole('button', { name: 'Clear' });
    const control = container.querySelector('textarea') as HTMLTextAreaElement;

    fireEvent.click(clearButton);
    expect(handleClear).toHaveBeenCalledOnce();
    expect(handleChange).toHaveBeenCalledWith('', expect.anything());
    expect(control).toHaveValue('');
    expect(document.activeElement).toBe(control);
  });

  it('never offers clear while disabled or read-only', () => {
    const { rerender } = render(<ModernTextarea allowClear disabled defaultValue="Locked" />);
    expect(screen.queryByRole('button')).toBeNull();

    rerender(<ModernTextarea allowClear readOnly defaultValue="Locked" />);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('keeps count and clear aligned in an Arabic RTL context', () => {
    render(
      <div dir="rtl" lang="ar">
        <ModernTextarea allowClear showCount maxLength={200} defaultValue="سيرة ذاتية طويلة" />
      </div>,
    );

    expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument();
    expect(screen.getByText(/\/200/)).toBeInTheDocument();
  });

  it('tracks uncontrolled typing for count and clear visibility', () => {
    const { container } = render(<ModernTextarea allowClear showCount />);
    const control = container.querySelector('textarea') as HTMLTextAreaElement;

    expect(screen.queryByRole('button')).toBeNull();
    fireEvent.change(control, { target: { value: 'typed' } });
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument();
  });

  it('stamps data-testid on the field wrapper, not the control', () => {
    render(<ModernTextarea data-testid="lb-textarea" />);
    const wrapper = screen.getByTestId('lb-textarea');
    expect(wrapper).toHaveAttribute('data-part', 'field');
    expect(wrapper.querySelector('textarea')).not.toBeNull();
  });
});
