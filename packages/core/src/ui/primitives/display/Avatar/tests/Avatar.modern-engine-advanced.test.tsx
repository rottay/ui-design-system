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
    const avatarRoot = initials.closest('[data-part="root"]') as HTMLDivElement;
    const inner = avatarRoot.querySelector('[data-part="mask"]') as HTMLDivElement;
    const status = avatarRoot.querySelector('[data-part="status-dot"]') as HTMLSpanElement;

    expect(avatarRoot).toHaveClass('rottay-avatar', 'rottay-avatar--modern', 'avatar-shell');
    expect(avatarRoot).toHaveStyle({ cursor: 'pointer' });
    // Corner grammar, clipping and the ring are owned by the modern skin keyed on
    // the data contract -- the engine stamps no DaisyUI mask/avatar classes and
    // no Tailwind utilities, so identical markup renders identically in apps
    // that compile different utility sets.
    expect(avatarRoot.className).not.toMatch(/(^|\s)(avatar|online|mask)(\s|$)/);
    expect(inner.className).not.toMatch(/mask-squircle|mask-circle|(^|\s)ring(\s|$)/);
    expect(avatarRoot).toHaveAttribute('data-shape', 'square');
    expect(avatarRoot).toHaveAttribute('data-ring', 'true');
    // The gradient variant paints its background token and a legibility text-shadow inline.
    // The initials gradient is the skin's; the engine stamps the part it keys on.
    expect(initials.getAttribute('data-part')).toBe('fallback');
    // The legibility text-shadow moved into the skin with the gradient it protects;
    // the skin keys both on the ROOT's variant stamp.
    expect(initials.closest('[data-variant]')?.getAttribute('data-variant')).toBe('gradient');
    // Status renders a themed corner dot stamped for the skin.
    expect(status).toBeInTheDocument();
    expect(status).toHaveAttribute('data-status', 'busy');

    fireEvent.click(avatarRoot);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('exposes interactive avatars to keyboards as buttons (Enter/Space activate)', () => {
    const handleClick = vi.fn();
    render(<ModernAvatar name="Jane Doe" clickable onClick={handleClick} />);

    const avatarRoot = screen.getByText('JD').closest('[data-part="root"]') as HTMLDivElement;
    expect(avatarRoot).toHaveAttribute('role', 'button');
    expect(avatarRoot).toHaveAttribute('tabindex', '0');
    expect(avatarRoot).toHaveAttribute('data-interactive', 'true');

    fireEvent.keyDown(avatarRoot, { key: 'Enter' });
    fireEvent.keyDown(avatarRoot, { key: ' ' });
    fireEvent.keyDown(avatarRoot, { key: 'Escape' });
    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  it('keeps passive avatars out of the tab order', () => {
    render(<ModernAvatar name="Jane Doe" />);

    const avatarRoot = screen.getByText('JD').closest('[data-part="root"]') as HTMLDivElement;
    expect(avatarRoot).not.toHaveAttribute('role');
    expect(avatarRoot).not.toHaveAttribute('tabindex');
    expect(avatarRoot).not.toHaveAttribute('data-interactive');
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
    // A caller's backgroundColor rides the `--ds-avatar-custom-bg` hatch, which the
    // skin consumes -- the caller's value still wins, byte for byte.
    expect(initials.style.getPropertyValue('--ds-avatar-custom-bg')).toBe('var(--ds-tint-8)');
    expect(initials.style.color).toBe('var(--ds-color-primary)');
  });

  it('stamps an owned ring contract and preserves a caller ring color', () => {
    render(
      <ModernAvatar
        name="Jane Doe"
        shape="circle"
        ring
        ringColor="var(--ds-color-success)"
      />
    );

    const root = screen.getByText('JD').closest('[data-part="root"]') as HTMLDivElement;
    const mask = root.querySelector('[data-part="mask"]') as HTMLDivElement;

    expect(root).toHaveAttribute('data-ring', 'true');
    expect(mask.style.getPropertyValue('--ds-avatar-ring-color')).toBe('var(--ds-color-success)');
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

  it('derives single initials for one-word and arabic names, two for multi-word names', () => {
    const { rerender } = render(<ModernAvatar name="فاطمة الزهراء" />);
    expect(screen.getByText('فا')).toBeInTheDocument();

    rerender(<ModernAvatar name="Madonna" />);
    expect(screen.getByText('M')).toBeInTheDocument();

    rerender(<ModernAvatar name="John Michael Doe" />);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });
});
