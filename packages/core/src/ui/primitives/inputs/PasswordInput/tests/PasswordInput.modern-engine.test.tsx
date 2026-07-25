import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ModernPasswordInput from '../engines/modern';

describe('Modern PasswordInput public anatomy', () => {
  it('paints nothing inline and stamps the skin contract', () => {
    const { container } = render(
      <ModernPasswordInput size="lg" defaultValue="s3cret" error errorMessage="Too short" />,
    );

    const shell = container.querySelector('.ds-password-input--modern[data-part="root"]') as HTMLElement;
    const control = container.querySelector('.ds-password-input__control') as HTMLInputElement;

    expect(shell).toHaveAttribute('data-size', 'lg');
    expect(shell).toHaveAttribute('data-error', 'true');
    expect(shell).toHaveAttribute('data-filled', 'true');
    expect(shell.style.border).toBe('');
    expect(shell.style.background).toBe('');
    expect(shell.style.padding).toBe('');
    expect(control.style.cssText).toBe('');
    expect(control).toHaveAttribute('aria-invalid', 'true');
    expect(control).toHaveAttribute('aria-describedby', `${control.id}-error`);
    expect(screen.getByRole('alert')).toHaveTextContent('Too short');
  });

  it('reveals and conceals through a keyboard-reachable, catalog-labeled toggle', () => {
    const { container } = render(<ModernPasswordInput defaultValue="s3cret" />);
    const control = container.querySelector('.ds-password-input__control') as HTMLInputElement;
    const toggle = screen.getByRole('button', { name: 'Show password' });

    expect(control).toHaveAttribute('type', 'password');
    expect(toggle).not.toHaveAttribute('tabindex', '-1');

    fireEvent.click(toggle);
    expect(control).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: 'Hide password' })).toHaveAttribute('data-visible', 'true');
    expect(document.activeElement).toBe(control);

    fireEvent.click(screen.getByRole('button', { name: 'Hide password' }));
    expect(control).toHaveAttribute('type', 'password');
  });

  it('honors custom visibility icons and hides the toggle entirely when showToggle is false', () => {
    const { container, rerender } = render(
      <ModernPasswordInput
        defaultValue="abc"
        visibleIcon={<span data-testid="custom-visible">V</span>}
        hiddenIcon={<span data-testid="custom-hidden">H</span>}
      />,
    );

    expect(screen.getByTestId('custom-hidden')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Show password' }));
    expect(screen.getByTestId('custom-visible')).toBeInTheDocument();

    rerender(<ModernPasswordInput showToggle={false} defaultValue="abc" />);
    expect(container.querySelector('[data-part="visibility-toggle"]')).toBeNull();
  });

  it('exposes the strength meter as a progressbar without runtime paint', () => {
    const { container } = render(
      <ModernPasswordInput defaultValue="abc" strengthIndicator strengthLevel="good" />,
    );

    const track = screen.getByRole('progressbar', { name: 'Password strength' });
    const fill = container.querySelector('[data-part="strength-fill"]') as HTMLElement;

    expect(track).toHaveAttribute('data-strength', 'good');
    expect(track).toHaveAttribute('aria-valuenow', '75');
    expect(fill.style.width).toBe('');
    expect(fill.style.background).toBe('');
    expect(fill.style.backgroundColor).toBe('');
  });

  it('keeps the same anatomy in an Arabic RTL context', () => {
    const { container } = render(
      <div dir="rtl" lang="ar">
        <ModernPasswordInput defaultValue="كلمة-سر-طويلة" error errorMessage="كلمة المرور ضعيفة للغاية وتحتاج إلى مزيد من الأحرف" />
      </div>,
    );

    const shell = container.querySelector('.ds-password-input--modern[data-part="root"]');
    expect(shell).toHaveAttribute('data-error', 'true');
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('disables the toggle together with the control', () => {
    render(<ModernPasswordInput disabled defaultValue="abc" />);
    const control = screen.getByDisplayValue('abc');
    expect(control).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Show password' })).toBeDisabled();
  });
});
