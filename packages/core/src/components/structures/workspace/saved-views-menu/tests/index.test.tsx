/**
 * @fileoverview F-56 closure for SavedViewsMenu: the share snapshot's link is
 * supplied by the app, never read off the document.
 *
 * The retired line built the link from the document location's origin and
 * pathname, which assumes the menu is mounted on the page the view belongs to. In a modal, an iframe, a preview or a server render that assumption is
 * simply wrong, and the DS had no way to know it.
 */

import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';

import { SavedViewsMenu, type SavedViewsMenuEntry } from '..';
import { renderWithEngine } from '@tests/support/engine';

const VIEWS: SavedViewsMenuEntry[] = [
  {
    key: 'mine',
    label: 'Mine',
    kind: 'custom',
    state: { scope: 'assigned', query: 'alice' },
  },
];

function clipboardWrites(): string[] {
  return (navigator.clipboard.writeText as unknown as { mock: { calls: string[][] } })
    .mock.calls.map((call) => call[0]);
}

beforeEach(() => {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText: vi.fn().mockResolvedValue(undefined) },
  });
});

async function openAndShare(node: React.ReactElement) {
  renderWithEngine(node, 'modern');
  fireEvent.click(await screen.findByRole('button', { name: /views?/i }));
  fireEvent.click(await screen.findByRole('button', { name: /share/i }));
  await waitFor(() => expect(clipboardWrites().length).toBe(1));
  return clipboardWrites()[0];
}

describe('SavedViewsMenu share snapshot', () => {
  it('uses the app-supplied base for the absolute link', async () => {
    const snapshot = await openAndShare(
      <SavedViewsMenu
        views={VIEWS}
        activeViewKey="mine"
        onViewSelect={() => {}}
        shareBaseUrl="https://app.example.com/candidates"
      />,
    );

    expect(snapshot).toContain('https://app.example.com/candidates?');
    expect(snapshot).toContain('view=mine');
    expect(snapshot).toContain('scope=assigned');
    expect(snapshot).toContain('query=alice');
  });

  it('falls back to a relative link rather than to the document location', async () => {
    const snapshot = await openAndShare(
      <SavedViewsMenu views={VIEWS} activeViewKey="mine" onViewSelect={() => {}} />,
    );

    // jsdom serves this suite from `localhost`; the retired implementation
    // would have pasted that host into a customer's shared link.
    expect(snapshot).not.toContain('localhost');
    expect(snapshot).not.toContain('http');
    expect(snapshot).toContain('?view=mine');
  });
});
