import React, { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { VisuallyHidden } from '..';

describe('VisuallyHidden', () => {
  it('renders its content in the accessibility tree under the canonical class', () => {
    render(<VisuallyHidden>Opens in a new tab</VisuallyHidden>);
    const node = screen.getByText('Opens in a new tab');
    expect(node.tagName).toBe('SPAN');
    expect(node.classList.contains('ds-visually-hidden')).toBe(true);
    expect(node.classList.contains('ds-visually-hidden--focusable')).toBe(false);
  });

  it('supports the block form through `as`', () => {
    render(<VisuallyHidden as="div">Block content</VisuallyHidden>);
    expect(screen.getByText('Block content').tagName).toBe('DIV');
  });

  it('stamps the reveal-on-focus modifier only behind `focusable`', () => {
    render(
      <VisuallyHidden focusable as="div">
        <a href="#main">Skip to content</a>
      </VisuallyHidden>
    );
    const wrapper = screen.getByText('Skip to content').parentElement as HTMLElement;
    expect(wrapper.classList.contains('ds-visually-hidden--focusable')).toBe(true);
  });

  it('forwards its ref to the rendered element', () => {
    const ref = createRef<HTMLElement>();
    render(<VisuallyHidden ref={ref}>Named</VisuallyHidden>);
    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe('SPAN');
    expect(ref.current?.classList.contains('ds-visually-hidden')).toBe(true);
  });

  it('passes through host attributes for live-region composition', () => {
    render(
      <VisuallyHidden role="status" aria-live="polite">
        Saved
      </VisuallyHidden>
    );
    const region = screen.getByRole('status');
    expect(region).toHaveTextContent('Saved');
    expect(region.getAttribute('aria-live')).toBe('polite');
  });
});
