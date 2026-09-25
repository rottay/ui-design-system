/**
 * The notifier's controls take a closed prop contract (part, onClick, label),
 * so no caller prop bag can collide with the kernel's handler spread. The
 * kernel therefore stays the only author of the control's state.
 */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { NotifierItem } from '..';

describe('the notifier control keeps the kernel as its only state author', () => {
  it('routes hover, press and focus on the close button', () => {
    render(
      <NotifierItem
        role="toast"
        tone="info"
        title="Saved"
        duration={0}
        closeLabel="Close"
        onDismiss={vi.fn()}
      />,
    );
    const close = screen.getByRole('button', { name: 'Close' });

    expect(close).not.toHaveAttribute('data-state');
    fireEvent.pointerEnter(close);
    expect(close).toHaveAttribute('data-state', 'hovered');
    fireEvent.pointerDown(close);
    expect(close).toHaveAttribute('data-state', 'hovered pressed');
    fireEvent.pointerUp(close);
    expect(close).toHaveAttribute('data-state', 'hovered');
    fireEvent.pointerLeave(close);
    expect(close).not.toHaveAttribute('data-state');
    fireEvent.focus(close);
    expect(close).toHaveAttribute('data-state', 'focused focus-visible');
    fireEvent.blur(close);
    expect(close).not.toHaveAttribute('data-state');
  });
});
