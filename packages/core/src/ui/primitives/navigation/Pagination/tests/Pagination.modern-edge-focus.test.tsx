import React from 'react';
import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import ModernPagination from '../engines/modern';
import { renderWithEngine } from '../../../../../tooling/testing/helpers/engine';

// Stepping to a boundary page disables the button that was just activated,
// which drops DOM focus to <body> unless the engine rescues it.
const ControlledPagination = () => {
  const [page, setPage] = React.useState(1);
  return (
    <ModernPagination current={page} total={30} pageSize={10} onChange={(next) => setPage(next)} />
  );
};

describe('Modern Pagination boundary focus rescue', () => {
  it('rescues focus when Enter on Next disables Next on the last page', async () => {
    const user = userEvent.setup();
    await act(async () => {
      renderWithEngine(<ControlledPagination />, 'modern');
    });

    const next = screen.getByRole('button', { name: 'Next' });
    await act(async () => {
      next.focus();
    });
    expect(document.activeElement).toBe(next);

    await user.keyboard('{Enter}'); // page 2
    expect(document.activeElement).toBe(next);
    await user.keyboard('{Enter}'); // page 3 -- Next becomes disabled
    await act(async () => {});

    expect(next).toBeDisabled();
    expect(document.activeElement).not.toBe(document.body);
    expect(document.activeElement).not.toBe(next);
    expect(document.activeElement).toHaveAttribute('aria-current', 'page');
    expect(document.activeElement).toHaveTextContent('3');
  });

  it('rescues focus when Space on Previous disables Previous on page one', async () => {
    const user = userEvent.setup();
    await act(async () => {
      renderWithEngine(<ControlledPagination />, 'modern');
    });

    await user.click(screen.getByRole('button', { name: '3' }));
    const previous = screen.getByRole('button', { name: 'Previous' });
    await act(async () => {
      previous.focus();
    });
    expect(document.activeElement).toBe(previous);

    await user.keyboard('{ }'); // page 2
    expect(document.activeElement).toBe(previous);
    await user.keyboard('{ }'); // page 1 -- Previous becomes disabled

    expect(previous).toBeDisabled();
    expect(document.activeElement).not.toBe(document.body);
    expect(document.activeElement).not.toBe(previous);
    expect(document.activeElement).toHaveAttribute('aria-current', 'page');
    expect(document.activeElement).toHaveTextContent('1');
  });

  it('leaves focus alone when the edge control was never focused', async () => {
    const user = userEvent.setup();
    await act(async () => {
      renderWithEngine(<ControlledPagination />, 'modern');
    });

    const jumpToLast = screen.getByRole('button', { name: '3' });
    const next = screen.getByRole('button', { name: 'Next' });
    expect(document.activeElement).not.toBe(next);

    // Reaching the last page by another control disables Next without ever
    // having focused it, so the rescue branch must not fire.
    await user.click(jumpToLast);
    expect(next).toBeDisabled();
    expect(document.activeElement).toBe(jumpToLast);
  });
});
