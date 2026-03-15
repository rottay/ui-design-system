import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import RusticBadge from './engines/rustic';

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
});
