import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import RusticBadge from '../engines/rustic';

describe('Badge rustic advanced engine coverage', () => {
  it('covers standalone, closable, clickable, pulse, overflow, and positioned badge branches', () => {
    const handleClose = vi.fn();
    const handleClick = vi.fn();

    const { container } = render(
      <>
        <RusticBadge
          count={120}
          max={99}
          variant="success"
          badgeStyle="soft"
          clickable
          onClick={handleClick}
          closable
          onClose={handleClose}
          icon={<span>*</span>}
          pulse
        />

        <RusticBadge count={0} showZero dot variant="warning">
          <button type="button">Child target</button>
        </RusticBadge>

        <RusticBadge content="New" badgeStyle="outline" position="bottom-left" bordered>
          <span>Card</span>
        </RusticBadge>
      </>
    );

    const overflowBadge = screen.getByText('99+');
    fireEvent.click(overflowBadge);
    expect(handleClick).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByLabelText('Close badge'));
    expect(handleClose).toHaveBeenCalledTimes(1);

    expect(container.querySelector('style')).toHaveTextContent('@keyframes badge-pulse');
    expect(screen.getByText('Child target')).toBeInTheDocument();
  });

  it('renders the soft badgeStyle background as a clean alpha-tint token, not a var()-plus-hex-suffix concatenation', () => {
    render(<RusticBadge variant="success" badgeStyle="soft">Label</RusticBadge>);
    const el = screen.getByText('Label');

    // A var() reference cannot be hex-suffixed for alpha: substitution splices
    // the resolved token rather than concatenating text, so a trailing literal
    // like "26" would leave a stray token that fails <color> parsing and falls
    // back to transparent. The background must be a single resolvable token.
    expect(el.style.backgroundColor).toBe('var(--ds-color-alpha-success-10)');
    expect(el.style.backgroundColor).not.toContain('26');
  });

  it('defaults a labelled badge to soft while a count indicator over a real anchor stays solid', () => {
    const { rerender } = render(<RusticBadge variant="success">Ready</RusticBadge>);
    expect(screen.getByText('Ready').style.backgroundColor).toBe('var(--ds-color-alpha-success-10)');

    rerender(
      <RusticBadge count={3} variant="success">
        <span>Anchor</span>
      </RusticBadge>
    );
    expect(screen.getByText('3').style.backgroundColor).toBe('var(--ds-badge-bg)');
  });
});
