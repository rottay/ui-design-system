import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import RusticInput from './engines/rustic';

describe('RusticInput engine', () => {
  it('covers clearable, affix, counter, and error rendering branches', async () => {
    const handleChange = vi.fn();
    const handleClear = vi.fn();

    render(
      <RusticInput
        defaultValue="Ada"
        clearable
        maxLength={10}
        showCount
        error
        errorMessage="Bad input"
        prefix={<span data-testid="input-prefix">@</span>}
        suffix={<span data-testid="input-suffix">ok</span>}
        onChange={handleChange}
        onClear={handleClear}
        aria-label="Profile name"
      />
    );

    const input = screen.getByRole('textbox', { name: 'Profile name' });

    expect(screen.getByTestId('input-prefix')).toBeInTheDocument();
    expect(screen.getByTestId('input-suffix')).toBeInTheDocument();
    expect(screen.getByText('3/10')).toBeInTheDocument();
    expect(screen.getByText('Bad input')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /clear input/i }));

    await waitFor(() => {
      expect(input).toHaveValue('');
    });

    expect(handleClear).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith('', expect.any(Object));
    expect(input).toHaveFocus();
  });

  it('covers focus, variants, enter handling, readonly, and disabled branches', () => {
    const handleFocus = vi.fn();
    const handleBlur = vi.fn();
    const handleEnter = vi.fn();

    const { rerender } = render(
      <RusticInput
        variant="filled"
        status="warning"
        onFocus={handleFocus}
        onBlur={handleBlur}
        onPressEnter={handleEnter}
        aria-label="Warning input"
      />
    );

    const input = screen.getByRole('textbox', { name: 'Warning input' });
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: 'Enter' });
    fireEvent.blur(input);

    expect(handleFocus).toHaveBeenCalledTimes(1);
    expect(handleBlur).toHaveBeenCalledTimes(1);
    expect(handleEnter).toHaveBeenCalledTimes(1);

    rerender(
      <RusticInput
        value="Read only"
        clearable
        readOnly
        variant="unstyled"
        aria-label="Readonly input"
      />
    );

    expect(screen.queryByRole('button', { name: /clear input/i })).not.toBeInTheDocument();

    rerender(
      <RusticInput
        value="Disabled"
        clearable
        disabled
        variant="flushed"
        aria-label="Disabled input"
      />
    );

    expect(screen.queryByRole('button', { name: /clear input/i })).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Disabled input' })).toBeDisabled();
  });
});
