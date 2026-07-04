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

    const initials = screen.getByText('JD') as HTMLDivElement;
    const avatarRoot = initials.closest('.avatar') as HTMLDivElement;
    const inner = avatarRoot.querySelector('.mask') as HTMLDivElement;
    const status = avatarRoot.querySelector('span') as HTMLSpanElement;

    expect(avatarRoot).toHaveClass('avatar-shell');
    expect(avatarRoot).toHaveStyle({ cursor: 'pointer' });
    // Non-circular shapes clip via the DaisyUI squircle mask; bordered adds the ring utility.
    expect(inner.className).toContain('mask-squircle');
    expect(inner.className).toContain('ring');
    // The gradient variant paints its background token and a legibility text-shadow inline.
    expect(initials.style.background).toContain('linear-gradient');
    expect(initials.style.textShadow).not.toBe('');
    // Status renders a themed corner dot.
    expect(status).toBeInTheDocument();

    fireEvent.click(avatarRoot);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('honors explicit backgroundColor/textColor on the initials fallback (entity tint tones)', () => {
    render(
      <ModernAvatar
        name="Jane Doe"
        shape="circle"
        backgroundColor="var(--ds-tint-8)"
        textColor="var(--ds-color-primary)"
      />
    );

    const initials = screen.getByText('JD') as HTMLDivElement;
    expect(initials.style.background).toBe('var(--ds-tint-8)');
    expect(initials.style.color).toBe('var(--ds-color-primary)');
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
