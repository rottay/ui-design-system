import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AvatarBadge } from '../compound/Badge';
import { AvatarGroup } from '../compound/Group';

describe('Avatar.Group compound contract', () => {
  it('keeps the visually-first avatar flush with the container start edge', () => {
    render(
      <AvatarGroup>
        <span data-testid="a1" />
        <span data-testid="a2" />
        <span data-testid="a3" />
      </AvatarGroup>
    );

    const items = document.querySelectorAll('[data-part="item"]');
    expect(items).toHaveLength(3);
    // With row-reverse the LAST DOM item renders as the visually first (top-most)
    // avatar; it is the one stamped as the stack lead.
    const leads = document.querySelectorAll('[data-stack-lead="true"]');
    expect(leads).toHaveLength(1);
    expect(leads[0]).toBe(items[items.length - 1]);
    // The lead alone carries no overlap margin, so the stack starts on the
    // container's content edge instead of overshooting it by the overlap.
    expect((leads[0] as HTMLDivElement).style.marginLeft).toBe('');
    // Inter-item overlap travels on the tenant-tunable spacing channel
    // (`--ds-avatar-group-overlap`, compact-spacing fallback) via inline styles,
    // which real browsers honor; jsdom's CSSOM silently drops `var()` longhands,
    // so the margin itself is asserted structurally, not by value.
  });

  it('renders a surplus tile with a deterministic English fallback title', () => {
    render(
      <AvatarGroup max={2}>
        <span />
        <span />
        <span />
        <span />
      </AvatarGroup>
    );

    const surplus = screen.getByText('+2');
    // Without an i18n provider the documented English accessibility fallback applies.
    expect(surplus).toHaveAttribute('title', '+2 more');
    expect(surplus).toHaveAttribute('data-part', 'surplus');
    // Two avatars shown, two hidden behind the surplus tile.
    expect(document.querySelectorAll('[data-part="item"]')).toHaveLength(2);
  });
});

describe('Avatar.Badge compound contract', () => {
  it('positions the dot with logical properties (no physical bottom/right)', () => {
    render(
      <AvatarBadge status="online">
        <span data-testid="anchor-child" />
      </AvatarBadge>
    );

    const dot = document.querySelector('[data-part="dot"]') as HTMLSpanElement;
    expect(dot.style.insetBlockEnd).toBe('0');
    expect(dot.style.insetInlineEnd).toBe('0');
    expect(dot.style.bottom).toBe('');
    expect(dot.style.right).toBe('');
    expect(dot).toHaveAttribute('data-status', 'online');
  });

  it('exposes a status label with a deterministic English fallback', () => {
    render(
      <AvatarBadge status="busy">
        <span />
      </AvatarBadge>
    );

    expect(screen.getByLabelText('Status: busy')).toBeInTheDocument();
  });
});
