import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Rate as ModernRate } from '../engines/modern';

/**
 * Rate modern-engine ownership contract (K2-V Pass 1): the DaisyUI
 * `rating`/`rating-{size}` projection is drained; the skin owns sizing via
 * `data-size`, and the only inline hatch left on a star is the runtime
 * `--ds-rate-star-fill` color channel.
 */
describe('Rate modern engine ownership', () => {
  it('carries no DaisyUI rating classes; ds-rate scope plus legacy alias', () => {
    const { container } = render(<ModernRate defaultValue={3} />);

    const root = screen.getByTestId('rate');
    expect(root).toHaveAttribute('data-part', 'root');
    expect(root.className).toContain('ds-rate');
    expect(root.className).toContain('ds-rate--modern');
    // Legacy BEM alias preserved for consumers (no paint keys on it).
    expect(root.className).toContain('rottay-rate');
    expect(root.className).toContain('rottay-rate--modern');

    const classTokens = (container.innerHTML.match(/class="[^"]*"/g) ?? []).join(' ');
    expect(classTokens).not.toMatch(/\brating\b/);
    expect(classTokens).not.toMatch(/\brating-(xs|sm|md|lg)\b/);
  });

  it('stars carry skin anatomy (data-size channel) and only the runtime fill hatch inline', () => {
    render(<ModernRate defaultValue={3} size="lg" activeColor="#ff4d4f" />);

    const root = screen.getByTestId('rate');
    expect(root).toHaveAttribute('data-size', 'lg');
    expect(root).toHaveAttribute('data-disabled', 'false');

    const firstStar = screen.getAllByRole('radio').find((node) => node.tagName === 'SPAN');
    if (!(firstStar instanceof HTMLElement)) throw new Error('Expected visible rate stars');
    expect(firstStar).toHaveAttribute('data-part', 'star');
    expect(firstStar).toHaveAttribute('data-state', 'full');

    // The malformed `var(--ds-rate-md-size)px` hatch is gone: no width/height
    // inline; only the runtime fill custom property remains.
    expect(firstStar.style.width).toBe('');
    expect(firstStar.style.height).toBe('');
    expect(firstStar.style.getPropertyValue('--ds-rate-star-fill')).toBe('#ff4d4f');
  });

  it('stamps one stable hidden form carrier mirroring the committed value', () => {
    const { container } = render(<ModernRate defaultValue={2} count={5} />);

    // The APG composite model carries NO native radio inputs; a single
    // type="hidden" input owns native form participation.
    expect(container.querySelectorAll('input[type="radio"]')).toHaveLength(0);
    const carriers = container.querySelectorAll('input[type="hidden"]');
    expect(carriers).toHaveLength(1);
    const carrier = carriers[0] as HTMLInputElement;
    expect(carrier.getAttribute('name')).toMatch(/^rottay-rate-/);
    expect(carrier.value).toBe('2');
  });

  it('star accessible names use the English floor without a provider', () => {
    render(<ModernRate defaultValue={0} count={3} />);
    // Exactly one radio per star now (the span); no hidden native radios
    // duplicating the name.
    expect(screen.getByRole('radio', { name: '1 star' }).tagName).toBe('SPAN');
    expect(screen.getByRole('radio', { name: '2 stars' }).tagName).toBe('SPAN');
    expect(screen.getAllByRole('radio')).toHaveLength(3);
    expect(screen.getByTestId('rate')).toHaveAttribute('aria-label', 'Rating');
  });
});
