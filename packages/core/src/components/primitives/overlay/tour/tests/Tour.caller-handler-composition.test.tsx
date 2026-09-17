/**
 * The tour's chrome buttons compose the caller's handler bag with the kernel's
 * instead of spreading one over the other. Every one of the six kernel handlers
 * must survive that composition.
 */
import React from 'react';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

afterEach(() => cleanup());

import ModernTour from '../engines/modern';

describe('the composed handler bag keeps every kernel handler', () => {
  it('routes hover, press and focus on the close button', () => {
    render(
      <div>
        <div data-testid="anchor">Anchor</div>
        <ModernTour open steps={[{ target: '[data-testid="anchor"]', title: 'Step one' }]} />
      </div>,
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
