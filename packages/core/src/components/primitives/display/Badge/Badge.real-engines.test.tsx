import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import ClassicBadge from './engines/classic';
import ModernBadge from './engines/modern';

describe('Badge real engine coverage', () => {
  it('covers the classic engine with standalone and indicator variants', () => {
    render(
      <>
        <ClassicBadge count={12} variant="success" />
        <ClassicBadge count={0} showZero position="bottom-left">
          <button type="button">Inbox</button>
        </ClassicBadge>
      </>,
    );

    expect(document.querySelector('sup[title="12"]')).not.toBeNull();
    expect(screen.getByText('Inbox')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('covers modern standalone, overflow, hide/show, close, and dot indicator branches', () => {
    const handleClick = vi.fn();
    const handleClose = vi.fn();

    const { rerender } = render(
      <ModernBadge
        count={120}
        max={99}
        variant="primary"
        badgeStyle="outline"
        bordered
        pulse
        clickable
        onClick={handleClick}
        closable
        onClose={handleClose}
        icon={<span data-testid="modern-badge-icon">*</span>}
      />
    );

    fireEvent.click(screen.getByText('99+'));
    fireEvent.click(screen.getByLabelText('Close badge'));

    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(handleClose).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('modern-badge-icon')).toBeInTheDocument();

    rerender(
      <ModernBadge count={0}>
        <span>Child content</span>
      </ModernBadge>
    );

    expect(screen.getByText('Child content')).toBeInTheDocument();
    expect(screen.queryByText('0')).not.toBeInTheDocument();

    rerender(
      <ModernBadge count={0} showZero position="bottom-left">
        <span>Child content</span>
      </ModernBadge>
    );

    expect(screen.getByText('0')).toBeInTheDocument();

    rerender(
      <ModernBadge dot position="top-left" variant="warning">
        <span>Child content</span>
      </ModernBadge>
    );

    expect(screen.queryByText('0')).not.toBeInTheDocument();
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });
});
