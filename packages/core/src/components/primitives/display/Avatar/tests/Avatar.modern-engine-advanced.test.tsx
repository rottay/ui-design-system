import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernAvatar from '../engines/modern';

describe('Avatar modern advanced coverage', () => {
  it('covers modern initials, gradient variants, bordered rings, statuses, and click branches', () => {
    const handleClick = vi.fn();

    render(
      <ModernAvatar
        name="Jane Doe"
        status="busy"
        bordered
        shape="square"
        variant="gradient"
        onClick={handleClick}
        className="avatar-shell"
      />
    );

    const avatarRoot = screen.getByText('JD').closest('.avatar') as HTMLDivElement;
    const inner = avatarRoot.querySelector('.mask') as HTMLDivElement;
    const status = avatarRoot.querySelector('span') as HTMLSpanElement;

    expect(avatarRoot).toHaveClass('avatar-shell');
    expect(avatarRoot).toHaveStyle({ cursor: 'pointer' });
    expect(inner.className).toContain('mask-squircle');
    expect(inner.className).toContain('ring-primary');
    expect(screen.getByText('JD').className).toContain('bg-gradient-to-br');
    expect(screen.getByText('JD').className).toContain('text-white');
    expect(status.className).toContain('bg-error');

    fireEvent.click(avatarRoot);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('switches from image mode to fallback mode on error and resets when src changes', () => {
    const handleError = vi.fn();
    const handleLoad = vi.fn();

    const { rerender } = render(
      <ModernAvatar
        src="/broken-avatar.png"
        alt="Jane Doe"
        name="Jane Doe"
        onError={handleError}
        onLoad={handleLoad}
      />
    );

    fireEvent.error(screen.getByRole('img', { name: /jane doe/i }));
    expect(handleError).toHaveBeenCalledTimes(1);
    expect(screen.getByText('JD')).toBeInTheDocument();

    rerender(
      <ModernAvatar
        src="/valid-avatar.png"
        alt="Jane Doe"
        name="Jane Doe"
        onError={handleError}
        onLoad={handleLoad}
      />
    );

    const img = screen.getByRole('img', { name: /jane doe/i });
    fireEvent.load(img);
    expect(handleLoad).toHaveBeenCalledTimes(1);
  });
});
