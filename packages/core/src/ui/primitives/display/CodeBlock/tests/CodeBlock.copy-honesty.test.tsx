/**
 * Copy honesty for CodeBlock.
 *
 * The confirmation used to fire whether or not a write happened: with no
 * clipboard API (insecure context, permissions policy, older engine) the label
 * flipped to "Copied" and the polite live region announced a copy that never
 * occurred. Success is now claimed only for a write that actually succeeded,
 * and a refused write leaves the user a real recovery path -- the source is
 * selected so the keyboard copy still works.
 */
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { CodeBlock } from '../index';

const LABELS = { copyLabel: 'Copy', copiedLabel: 'Copied' };

function setClipboard(value: unknown): void {
  Object.defineProperty(navigator, 'clipboard', { value, configurable: true });
}

afterEach(() => {
  setClipboard(undefined);
});

describe('CodeBlock -- copy confirmation follows the actual write', () => {
  it('never announces a copy when the platform has no clipboard', async () => {
    setClipboard(undefined);

    const { container } = render(<CodeBlock code={'payload'} {...LABELS} />);
    const button = screen.getByRole('button', { name: 'Copy' });
    fireEvent.click(button);

    await waitFor(() => {
      expect(button).toHaveAttribute('data-copied', 'false');
    });
    expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Copied' })).toBeNull();
    expect(container.querySelector("[data-part='copy-status']")?.textContent).toBe('');
  });

  it('never announces a copy when the write is rejected', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'));
    setClipboard({ writeText });

    const { container } = render(<CodeBlock code={'payload'} {...LABELS} />);
    const button = screen.getByRole('button', { name: 'Copy' });
    fireEvent.click(button);

    await waitFor(() => expect(writeText).toHaveBeenCalledWith('payload'));
    expect(button).toHaveAttribute('data-copied', 'false');
    expect(container.querySelector("[data-part='copy-status']")?.textContent).toBe('');
  });

  it('leaves the source selected as the recovery path when the write is refused', async () => {
    setClipboard(undefined);

    const { container } = render(<CodeBlock code={'payload'} {...LABELS} />);
    fireEvent.click(screen.getByRole('button', { name: 'Copy' }));

    const code = container.querySelector("[data-part='code']") as HTMLElement;
    await waitFor(() => {
      const selection = window.getSelection();
      expect(selection?.rangeCount).toBeGreaterThan(0);
      expect(code.contains(selection!.getRangeAt(0).commonAncestorContainer)).toBe(true);
    });
  });

  it('still confirms a write that actually succeeded', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    setClipboard({ writeText });

    const { container } = render(<CodeBlock code={'payload'} {...LABELS} />);
    fireEvent.click(screen.getByRole('button', { name: 'Copy' }));

    await waitFor(() => expect(writeText).toHaveBeenCalledWith('payload'));
    await waitFor(() =>
      expect(container.querySelector("[data-part='copy-status']")?.textContent).toBe('Copied'),
    );
    expect(screen.getByRole('button', { name: 'Copied' })).toHaveAttribute('data-copied', 'true');
  });
});
