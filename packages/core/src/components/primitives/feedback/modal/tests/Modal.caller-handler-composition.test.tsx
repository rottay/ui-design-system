/**
 * The modal's close and action buttons compose the caller's handler bag with
 * the kernel's instead of spreading one over the other. Every one of the six
 * kernel handlers must survive that composition.
 */
import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernModal from '../engines/modern';

describe('the composed handler bag keeps every kernel handler', () => {
  it('routes hover, press and focus on the close button', () => {
    render(
      <ModernModal open title="Settings" onCancel={vi.fn()}>
        Body
      </ModernModal>,
    );
    const close = document.querySelector('[data-part="close-button"]') as HTMLElement;
    expect(close).not.toBeNull();

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
