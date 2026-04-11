import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import RusticAvatar from '../engines/rustic';

describe('Avatar rustic engine advanced coverage', () => {
  it('falls back to generated initials, click handlers, and decorative styles', () => {
    const handleClick = vi.fn();

    render(
      <RusticAvatar
        name="Jane Doe"
        status="online"
        ring
        bordered
        ringColor="#123456"
        onClick={handleClick}
        className="avatar-shell"
      />
    );

    const avatar = screen.getByText('JD').parentElement as HTMLDivElement;
    const spans = avatar.querySelectorAll('span');

    expect(avatar).toHaveClass('avatar-shell');
    expect(avatar).toHaveStyle({ cursor: 'pointer' });
    expect(avatar.style.outline).toContain('#123456');
    expect(spans).toHaveLength(2);
    fireEvent.click(avatar);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('switches from image mode to fallback mode on error and resets when src changes', () => {
    const handleError = vi.fn();
    const handleLoad = vi.fn();

    const { rerender } = render(
      <RusticAvatar
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
      <RusticAvatar
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

  it('prefers explicit initials and children when names are unavailable', () => {
    render(
      <>
        <RusticAvatar initials="ZX" />
        <RusticAvatar>
          <span>Icon fallback</span>
        </RusticAvatar>
      </>
    );

    expect(screen.getByText('ZX')).toBeInTheDocument();
    expect(screen.getByText('Icon fallback')).toBeInTheDocument();
  });
});
