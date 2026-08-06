import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernAnchor, { Link as ModernAnchorLink } from '../engines/modern';

function clickAndCapture(node: HTMLElement): MouseEvent {
  const event = new MouseEvent('click', { bubbles: true, cancelable: true });
  node.dispatchEvent(event);
  return event;
}

describe('Modern Anchor.Link — non-fragment hrefs', () => {
  it('leaves an external target="_blank" link free to navigate', () => {
    render(
      <ModernAnchor>
        <ModernAnchorLink href="https://example.com" title="External Resource" target="_blank" />
      </ModernAnchor>
    );

    const link = screen.getByRole('link', { name: 'External Resource' });
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');

    const event = clickAndCapture(link);
    expect(event.defaultPrevented).toBe(false);
  });

  it('never feeds a non-fragment href to the selector engine', () => {
    const spy = vi.spyOn(document, 'querySelector');

    try {
      render(
        <ModernAnchor>
          <ModernAnchorLink href="https://example.com/docs?a=1" title="External Resource" />
          <ModernAnchorLink href="#section-2" title="Section 2" />
        </ModernAnchor>
      );

      expect(spy.mock.calls.map(([selector]) => selector)).not.toContain(
        'https://example.com/docs?a=1'
      );
    } finally {
      spy.mockRestore();
    }
  });

  it('still intercepts and scrolls an in-page fragment', () => {
    const section = document.createElement('div');
    section.id = 'section-1';
    let scrolled = false;
    section.scrollIntoView = () => {
      scrolled = true;
    };
    document.body.appendChild(section);

    try {
      render(
        <ModernAnchor>
          <ModernAnchorLink href="#section-1" title="Section 1" />
        </ModernAnchor>
      );

      const link = screen.getByRole('link', { name: 'Section 1' });
      const event = clickAndCapture(link);
      expect(event.defaultPrevented).toBe(true);
      expect(scrolled).toBe(true);
    } finally {
      section.remove();
    }
  });
});
