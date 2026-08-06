import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import ModernMentions from '../engines/modern';

const OPTIONS = [
  { value: 'alice', label: 'Alice' },
  { value: 'backend', label: 'Backend' },
];

describe('Mentions modern - Escape scope', () => {
  it('consumes Escape while the suggestion popup is open instead of bubbling to an ancestor overlay', async () => {
    const user = userEvent.setup();
    const ancestorEscape = vi.fn();

    render(
      <div
        onKeyDown={(e) => {
          if (e.key === 'Escape') ancestorEscape();
        }}
      >
        <ModernMentions options={OPTIONS} aria-label="Comment" />
      </div>,
    );

    const textarea = screen.getByRole('textbox');
    await user.click(textarea);
    await user.type(textarea, '@a');

    expect(screen.getByRole('listbox')).toBeInTheDocument();

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(ancestorEscape).not.toHaveBeenCalled();
  });

  it('still lets Escape reach an ancestor overlay when no popup is open', async () => {
    const user = userEvent.setup();
    const ancestorEscape = vi.fn();

    render(
      <div
        onKeyDown={(e) => {
          if (e.key === 'Escape') ancestorEscape();
        }}
      >
        <ModernMentions options={OPTIONS} aria-label="Comment" />
      </div>,
    );

    const textarea = screen.getByRole('textbox');
    await user.click(textarea);
    await user.keyboard('{Escape}');

    expect(ancestorEscape).toHaveBeenCalledTimes(1);
  });
});
