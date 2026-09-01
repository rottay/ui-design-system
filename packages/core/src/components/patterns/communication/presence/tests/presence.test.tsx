import React from 'react';
import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';

import { renderWithEngine } from '@tests/support/engine';
import { PresenceBar } from '..';

const USERS = [
  { id: 'u1', name: 'Alice Moreau' },
  { id: 'u2', name: 'Bob Nakamura' },
];

describe('PresenceBar accessible identity', () => {
  it('names every roster entry even when the hover tooltip is suppressed', async () => {
    renderWithEngine(<PresenceBar users={USERS} showNames={false} />, 'modern');

    // `showNames` governs the VISUAL tooltip only. With it off the avatars
    // fall back to initials ("AM"/"BN"), which identify nobody, so the
    // listitem must still carry the person's name for AT.
    const roster = await screen.findByRole('list');
    expect(roster).toBeInTheDocument();
    expect(screen.getByRole('listitem', { name: 'Alice Moreau' })).toBeInTheDocument();
    expect(screen.getByRole('listitem', { name: 'Bob Nakamura' })).toBeInTheDocument();
    // The suppressed tooltip stays suppressed -- the fix adds a name, it does
    // not resurrect the visual affordance.
    expect(
      screen.getByRole('listitem', { name: 'Alice Moreau' }),
    ).not.toHaveAttribute('title');
  });

  it('keeps the tooltip and the accessible name together when names are shown', async () => {
    renderWithEngine(<PresenceBar users={USERS} showNames />, 'modern');

    const first = await screen.findByRole('listitem', { name: 'Alice Moreau' });
    expect(first).toHaveAttribute('title', 'Alice Moreau');
  });
});
