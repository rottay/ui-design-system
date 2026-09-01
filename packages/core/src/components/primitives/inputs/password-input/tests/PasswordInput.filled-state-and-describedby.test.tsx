// `data-filled` must mirror the field's actual content, not `value ?? defaultValue`, and
// a FormField-cloned `aria-describedby` must be honored rather than dropped.

import React from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent } from '@testing-library/react';

import ModernPasswordInput from '../engines/modern';
import { renderWithEngine } from '@tests/support/engine';

describe('PasswordInput modern filled state + describedby', () => {
  it('tracks the filled state while typing in uncontrolled mode', () => {
    const { container } = renderWithEngine(<ModernPasswordInput />, 'modern');

    const root = container.querySelector('[data-part="root"]') as HTMLElement;
    const input = container.querySelector('input') as HTMLInputElement;
    expect(root.getAttribute('data-filled')).toBe('false');

    fireEvent.change(input, { target: { value: 'hunter2' } });
    expect(root.getAttribute('data-filled')).toBe('true');

    fireEvent.change(input, { target: { value: '' } });
    expect(root.getAttribute('data-filled')).toBe('false');
  });

  it('still tracks the filled state from a controlled value', () => {
    const { container, rerender } = renderWithEngine(
      <ModernPasswordInput value="" onChange={() => {}} />,
      'modern',
    );
    expect(container.querySelector('[data-part="root"]')?.getAttribute('data-filled')).toBe('false');

    rerender(<ModernPasswordInput value="hunter2" onChange={() => {}} />);
    expect(container.querySelector('[data-part="root"]')?.getAttribute('data-filled')).toBe('true');
  });

  it('forwards a cloned aria-describedby onto the control', () => {
    const { container } = renderWithEngine(
      // FormField clones this onto its control child.
      <ModernPasswordInput {...({ 'aria-describedby': 'field-hint' } as Record<string, string>)} />,
      'modern',
    );

    const input = container.querySelector('input') as HTMLInputElement;
    expect(input.getAttribute('aria-describedby')).toBe('field-hint');
  });

  it('merges a cloned aria-describedby with its own error message id', () => {
    const { container } = renderWithEngine(
      <ModernPasswordInput
        error
        errorMessage="Too short"
        {...({ 'aria-describedby': 'field-hint' } as Record<string, string>)}
      />,
      'modern',
    );

    const input = container.querySelector('input') as HTMLInputElement;
    const tokens = (input.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean);
    const errorNode = container.querySelector('[data-part="error-message"]') as HTMLElement;

    expect(tokens).toContain('field-hint');
    expect(tokens).toContain(errorNode.id);
  });
});
