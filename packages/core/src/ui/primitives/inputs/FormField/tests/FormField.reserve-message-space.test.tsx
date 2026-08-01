import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ModernFormField from '../engines/modern';
import ModernInput from '../../Input/engines/modern';

/**
 * New-contract coverage for `reserveMessageSpace` (default false). Non-
 * regression for the rest of the family lives in
 * `FormField.modern-engine.test.tsx` (untouched).
 */
describe('Modern FormField reserveMessageSpace', () => {
  it('mounts a message region with the default one-line variable when set to true', () => {
    const { container } = render(
      <ModernFormField label="Email" name="email" reserveMessageSpace>
        <ModernInput />
      </ModernFormField>
    );

    const region = container.querySelector('[data-part="message-region"]') as HTMLElement;
    expect(region).toHaveAttribute('data-reserve-message', 'true');
    expect(region.style.getPropertyValue('--_ds-form-field-message-lines')).toBe('1');
  });

  it('stamps the numeric line count when reserveMessageSpace is a number', () => {
    const { container } = render(
      <ModernFormField label="Bio" name="bio" reserveMessageSpace={2}>
        <ModernInput />
      </ModernFormField>
    );

    const region = container.querySelector('[data-part="message-region"]') as HTMLElement;
    expect(region.style.getPropertyValue('--_ds-form-field-message-lines')).toBe('2');
  });

  it('keeps the reserved region mounted while toggling the error, and the help/error swap is unchanged', () => {
    const { container, rerender } = render(
      <ModernFormField label="Email" name="email" reserveMessageSpace help="We will not share it.">
        <ModernInput />
      </ModernFormField>
    );

    expect(container.querySelector('[data-part="message-region"]')).toBeInTheDocument();
    expect(screen.getByText('We will not share it.')).toBeInTheDocument();

    rerender(
      <ModernFormField
        label="Email"
        name="email"
        reserveMessageSpace
        error="Required"
        help="We will not share it."
      >
        <ModernInput />
      </ModernFormField>
    );

    // The region itself never unmounts on the error toggle...
    expect(container.querySelector('[data-part="message-region"]')).toBeInTheDocument();
    // ...but the swap is the same as always: error replaces help.
    expect(screen.getByRole('alert')).toHaveTextContent('Required');
    expect(screen.queryByText('We will not share it.')).toBeNull();
  });

  it('does not mount the region when absent (default false), matching current behavior', () => {
    const { container } = render(
      <ModernFormField label="Email" name="email" help="Optional help">
        <ModernInput />
      </ModernFormField>
    );

    expect(container.querySelector('[data-part="message-region"]')).toBeNull();
    expect(screen.getByText('Optional help')).toBeInTheDocument();
  });
});
