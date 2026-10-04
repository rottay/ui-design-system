import React from 'react';
import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';

import { renderWithEngine } from '@tests/support/engine';
import { LiveCursor, PresenceBar } from '..';

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

describe('LiveCursor visibility', () => {
  const cursorRoot = async (): Promise<HTMLElement> =>
    waitFor(() => {
      const root = document.querySelector<HTMLElement>('.ds-presence-live-cursor[data-part="root"]');
      if (!root?.querySelector('[data-part="cursor-badge"]')) throw new Error('LiveCursor not mounted');
      return root;
    });

  it('stamps data-visible="false" when hidden and leaves the fade to the skin', async () => {
    renderWithEngine(
      <LiveCursor user={{ name: 'Ana' }} position={{ x: 10, y: 20 }} visible={false} />,
      'modern',
    );

    const root = await cursorRoot();
    expect(root).toHaveAttribute('data-visible', 'false');
    expect(root.style.opacity).toBe('');
    expect(root.style.getPropertyValue('--ds-presence-cursor-x')).toBe('10px');
  });

  it('stamps nothing while visible', async () => {
    renderWithEngine(<LiveCursor user={{ name: 'Ana' }} position={{ x: 10, y: 20 }} />, 'modern');

    const root = await cursorRoot();
    expect(root).not.toHaveAttribute('data-visible');
    expect(root.style.opacity).toBe('');
  });
});
