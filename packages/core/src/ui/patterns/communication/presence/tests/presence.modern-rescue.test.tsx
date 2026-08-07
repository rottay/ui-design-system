import React from 'react';
import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';

import { renderWithEngine } from '../../../../../tooling/testing/helpers/engine';
import { PresenceBar } from '..';

const USERS = [
  { id: 'u1', name: 'Alice Moreau', avatar: '/alice.jpg' },
  { id: 'u2', name: 'Bob Nakamura' },
];

describe('PresenceBar composes the Avatar primitive', () => {
  it('renders every face through the Avatar primitive instead of a hand-rolled img/initials pair', async () => {
    const { container } = renderWithEngine(<PresenceBar users={USERS} />, 'modern');
    await screen.findByRole('list');

    const faces = container.querySelectorAll('.rottay-avatar');
    expect(faces.length).toBe(2);

    // The photo case is the primitive's own image anatomy.
    const image = container.querySelector('[data-part="img"]') as HTMLImageElement;
    expect(image).not.toBeNull();
    expect(image.getAttribute('src')).toBe('/alice.jpg');
    expect(image.closest('.rottay-avatar')).not.toBeNull();

    // The no-photo case is the primitive's derived initials, not a pattern-owned
    // Text node with an inline font size.
    const fallback = container.querySelector('[data-part="fallback"]') as HTMLElement;
    expect(fallback).not.toBeNull();
    expect(fallback.textContent).toBe('BN');
    expect(container.querySelector('[data-part="avatar-initials"]')).toBeNull();
  });

  it('takes its face geometry from the governed avatar size token, not a pattern pixel table', async () => {
    const { container } = renderWithEngine(<PresenceBar users={USERS} size="sm" />, 'modern');
    await screen.findByRole('list');

    const face = container.querySelector('.rottay-avatar') as HTMLElement;
    expect(face).toHaveAttribute('data-size', 'sm');
    expect(face.style.width).toBe('var(--ds-avatar-sm-size)');

    const slot = container.querySelector('[data-part="avatar"]') as HTMLElement;
    // The slot is the face token plus the pattern-owned ring — no raw 28/36px.
    expect(slot.style.inlineSize).toBe('calc(var(--ds-avatar-sm-size) + 4px)');
  });

  it('derives the stack overlap and the overflow slot from the same size token', async () => {
    const { container } = renderWithEngine(
      <PresenceBar users={USERS} maxVisible={1} size="md" />,
      'modern',
    );
    await screen.findByRole('list');

    const badge = container.querySelector('[data-part="overflow-badge"]') as HTMLElement;
    expect(badge.style.inlineSize).toBe('calc(var(--ds-avatar-md-size) + 4px)');
    expect(badge.style.marginInlineStart).toBe('calc(var(--ds-avatar-md-size) * -0.3)');
  });
});
