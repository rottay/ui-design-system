import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import RusticTextarea from '../engines/rustic';

describe('RusticTextarea advanced engine coverage', () => {
  it('covers focus, showCount syncing, error state, and size fallback branches', () => {
    const handleChange = vi.fn();
    const handleFocus = vi.fn();
    const handleBlur = vi.fn();

    const { rerender } = render(
      <RusticTextarea
        size={'2xl' as any}
        status="error"
        showCount
        maxLength={20}
        value="seed"
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder="Notes"
      />
    );

    const textarea = screen.getByPlaceholderText('Notes');
    expect(textarea).toHaveAttribute('aria-invalid', 'true');
    expect(textarea).toHaveStyle({ fontSize: 'var(--ds-textarea-md-font-size)' });
    expect(screen.getByText('4 / 20')).toBeInTheDocument();

    fireEvent.focus(textarea);
    expect(handleFocus).toHaveBeenCalledTimes(1);
    expect(textarea).toHaveClass('rottay-textarea--focused');

    fireEvent.change(textarea, { target: { value: 'updated body' } });
    expect(handleChange).toHaveBeenCalledWith('updated body', expect.any(Object));
    expect(screen.getByText('12 / 20')).toBeInTheDocument();

    fireEvent.blur(textarea);
    expect(handleBlur).toHaveBeenCalledTimes(1);
    expect(textarea).not.toHaveClass('rottay-textarea--focused');

    rerender(
      <RusticTextarea
        showCount
        maxLength={20}
        value="controlled update"
        placeholder="Notes"
      />
    );

    expect(screen.getByText('17 / 20')).toBeInTheDocument();
  });

  it('covers borderless, filled, disabled, readonly, and default count branches', () => {
    const { rerender } = render(
      <RusticTextarea
        variant="borderless"
        defaultValue="Draft"
        showCount
        rows={6}
        autoComplete="off"
        name="notes"
        id="notes-id"
      />
    );

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveClass('rottay-textarea--borderless');
    expect(textarea).toHaveAttribute('rows', '6');
    expect(textarea).toHaveAttribute('autocomplete', 'off');
    expect(textarea).toHaveAttribute('name', 'notes');
    expect(textarea).toHaveAttribute('id', 'notes-id');
    expect(screen.getByText('5')).toBeInTheDocument();

    rerender(
      <RusticTextarea
        variant="filled"
        disabled
        readOnly
        defaultValue="Locked"
      />
    );

    expect(screen.getByRole('textbox')).toBeDisabled();
    expect(screen.getByRole('textbox')).toHaveAttribute('readonly');
    expect(screen.getByRole('textbox')).toHaveAttribute('data-disabled', 'true');
    expect(screen.getByRole('textbox')).toHaveStyle({ cursor: 'not-allowed' });
  });
});
