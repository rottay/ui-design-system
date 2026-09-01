import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Rate as ModernRate } from '../engines/modern';

const states = () =>
  screen.getAllByRole('radio').map((star) => star.getAttribute('data-state'));

describe('Rate modern engine - clearing a rating by re-click', () => {
  it('drops the hover preview so the cleared value is what the user sees', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ModernRate defaultValue={3} allowClear onChange={onChange} />);

    const third = screen.getAllByRole('radio')[2];
    await user.hover(third);
    await user.click(third);

    expect(onChange).toHaveBeenLastCalledWith(0);
    expect(states()).toEqual(['empty', 'empty', 'empty', 'empty', 'empty']);
    expect(screen.getByTestId('rate')).not.toHaveAttribute('data-previewing');
  });

  it('keeps the live preview for an ordinary selection', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ModernRate defaultValue={3} allowClear onChange={onChange} />);

    const fifth = screen.getAllByRole('radio')[4];
    await user.hover(fifth);
    await user.click(fifth);

    expect(onChange).toHaveBeenLastCalledWith(5);
    expect(states()).toEqual(['full', 'full', 'full', 'full', 'full']);
  });
});
