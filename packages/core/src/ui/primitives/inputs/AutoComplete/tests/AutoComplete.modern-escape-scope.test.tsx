import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import ModernAutoComplete from '../engines/modern';

const OPTIONS = [
  { value: 'Alpha', label: 'Alpha result' },
  { value: 'Charlie', label: 'Charlie result' },
];

describe('AutoComplete modern - Escape scope', () => {
  it('consumes Escape while the dropdown is open instead of bubbling to an ancestor overlay', async () => {
    const user = userEvent.setup();
    const ancestorEscape = vi.fn();

    render(
      <div
        onKeyDown={(e) => {
          if (e.key === 'Escape') ancestorEscape();
        }}
      >
        <ModernAutoComplete options={OPTIONS} aria-label="Search" />
      </div>,
    );

    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.keyboard('{ArrowDown}');

    expect(screen.getByRole('listbox')).toBeInTheDocument();

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(ancestorEscape).not.toHaveBeenCalled();
  });

  it('still lets Escape reach an ancestor overlay when the dropdown is closed', async () => {
    const user = userEvent.setup();
    const ancestorEscape = vi.fn();

    render(
      <div
        onKeyDown={(e) => {
          if (e.key === 'Escape') ancestorEscape();
        }}
      >
        <ModernAutoComplete options={OPTIONS} aria-label="Search" />
      </div>,
    );

    await user.click(screen.getByRole('combobox'));
    await user.keyboard('{ArrowDown}');

    // First Escape is consumed by the open dropdown; the second finds it closed.
    await user.keyboard('{Escape}');
    expect(ancestorEscape).not.toHaveBeenCalled();

    await user.keyboard('{Escape}');
    expect(ancestorEscape).toHaveBeenCalledTimes(1);
  });
});
