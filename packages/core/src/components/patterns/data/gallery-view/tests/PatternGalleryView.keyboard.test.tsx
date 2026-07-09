import React from 'react';
import { screen, act, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PatternGalleryView } from '../PatternGalleryView';
import { ShortcutProvider, ShortcutScope } from '../../../../../hooks/shortcuts';
import { renderWithEngine } from '../../../../../_internal/testing/helpers/engine-test-utils';

interface Photo {
  id: string;
  url: string;
  title: string;
}

const PHOTOS: Photo[] = [
  { id: 'a', url: '', title: 'Photo A' },
  { id: 'b', url: '', title: 'Photo B' },
  { id: 'c', url: '', title: 'Photo C' },
];

// Box/Flex/Stack/Checkbox/Pagination are themselves engine-switched and
// lazy-load their implementation, so every render must go through
// renderWithEngine (which supplies DesignSystemProvider + Suspense) and the
// first query per test must be an async findBy* to let the lazy chunk
// resolve. The keyboard wiring under test lives entirely in
// PatternGalleryView/useGalleryKeyboardNav, not in any engine, so a single
// engine ('modern') is sufficient -- this is not an engine-parity test.
function renderGallery(ui: React.ReactElement) {
  return renderWithEngine(ui, 'modern');
}

function dispatchKey(target: Element | Document, key: string) {
  target.dispatchEvent(
    Object.assign(new (window as any).KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }), {})
  );
}

// ---------------------------------------------------------------------------
// Roving tabindex (unconditional whenever cards are focusable)
// ---------------------------------------------------------------------------

describe('PatternGalleryView roving tabindex', () => {
  it('makes only the first card tabbable, and every other card -1, when onItemClick is set', async () => {
    renderGallery(
      <PatternGalleryView data={PHOTOS} imageField="url" captionField="title" rowKey="id" onItemClick={() => {}} />
    );

    const cards = await screen.findAllByRole('button');
    expect(cards).toHaveLength(3);
    expect(cards[0]).toHaveAttribute('tabindex', '0');
    expect(cards[1]).toHaveAttribute('tabindex', '-1');
    expect(cards[2]).toHaveAttribute('tabindex', '-1');
  });

  it('ArrowDown moves DOM focus between cards and flips which one is tabIndex 0', async () => {
    renderGallery(
      <PatternGalleryView data={PHOTOS} imageField="url" captionField="title" rowKey="id" onItemClick={() => {}} />
    );
    const cards = await screen.findAllByRole('button');

    act(() => {
      cards[0].focus();
    });
    act(() => {
      dispatchKey(cards[0], 'ArrowDown');
    });

    expect(document.activeElement).toBe(cards[1]);
    expect(cards[0]).toHaveAttribute('tabindex', '-1');
    expect(cards[1]).toHaveAttribute('tabindex', '0');
  });

  it('Enter on a focused card calls onItemClick exactly once (not twice)', async () => {
    const onItemClick = vi.fn();
    renderGallery(
      <PatternGalleryView data={PHOTOS} imageField="url" captionField="title" rowKey="id" onItemClick={onItemClick} />
    );
    const cards = await screen.findAllByRole('button');

    act(() => {
      cards[0].focus();
    });
    act(() => {
      dispatchKey(cards[0], 'Enter');
    });

    // Regression guard: the card used to have its OWN Enter/Space handler
    // AND was inside the roving-tabindex group's handleKeyDown -- both
    // firing would double-invoke onItemClick.
    expect(onItemClick).toHaveBeenCalledTimes(1);
    expect(onItemClick).toHaveBeenCalledWith(PHOTOS[0], 0);
  });

  it('cards are also focusable when selectable is true without onItemClick (widened gate)', async () => {
    renderGallery(
      <PatternGalleryView data={PHOTOS} imageField="url" captionField="title" rowKey="id" selectable />
    );

    // No onItemClick -> no role="button", but the card should still be
    // reachable via roving tabindex since selection needs an active item.
    const card = await screen.findByText('Photo A');
    expect(card.closest('[tabindex]')).toHaveAttribute('tabindex', '0');
  });

  it('cards are not focusable at all when neither onItemClick nor selectable is set', async () => {
    renderGallery(
      <PatternGalleryView data={PHOTOS} imageField="url" captionField="title" rowKey="id" />
    );
    const card = await screen.findByText('Photo A');
    expect(card.closest('.ds-gallery-card')).not.toHaveAttribute('tabindex');
  });
});

// ---------------------------------------------------------------------------
// collectionShortcuts (opt-in j/k/x/enter)
// ---------------------------------------------------------------------------

describe('PatternGalleryView collectionShortcuts (opt-in)', () => {
  it('is OFF by default -- pressing j does nothing even with a ShortcutProvider mounted', async () => {
    renderGallery(
      <ShortcutProvider>
        <PatternGalleryView data={PHOTOS} imageField="url" captionField="title" rowKey="id" onItemClick={() => {}} selectable />
      </ShortcutProvider>
    );
    const cards = await screen.findAllByRole('button');

    act(() => {
      cards[0].focus();
    });
    act(() => {
      dispatchKey(document, 'j');
    });

    // Still on card 0 -- "j" did nothing because collectionShortcuts was
    // never turned on.
    expect(document.activeElement).toBe(cards[0]);
  });

  it('does not crash without a ShortcutProvider ancestor, and j is silently inert', async () => {
    renderGallery(
      <PatternGalleryView
        data={PHOTOS}
        imageField="url"
        captionField="title"
        rowKey="id"
        onItemClick={() => {}}
        collectionShortcuts
      />
    );

    const cards = await screen.findAllByRole('button');
    act(() => {
      cards[0].focus();
    });
    act(() => {
      dispatchKey(document, 'j');
    });
    expect(document.activeElement).toBe(cards[0]); // unchanged -- no provider, so inert
  });

  it('j moves the active card forward and k moves it back, scoped to this gallery', async () => {
    renderGallery(
      <ShortcutProvider>
        <PatternGalleryView
          data={PHOTOS}
          imageField="url"
          captionField="title"
          rowKey="id"
          onItemClick={() => {}}
          collectionShortcuts
        />
      </ShortcutProvider>
    );
    const cards = await screen.findAllByRole('button');

    act(() => {
      cards[0].focus();
    });
    act(() => {
      dispatchKey(document, 'j');
    });
    expect(document.activeElement).toBe(cards[1]);

    act(() => {
      dispatchKey(document, 'j');
    });
    expect(document.activeElement).toBe(cards[2]);

    act(() => {
      dispatchKey(document, 'k');
    });
    expect(document.activeElement).toBe(cards[1]);
  });

  it('does NOT fire while a different scope is focused (proves j/k/x/enter are scope-gated, not global)', async () => {
    // A lone mounted scope is topmost-active by default whenever focus is
    // elsewhere on the page (see hooks/shortcuts), so merely focusing an
    // UNSCOPED sibling would not actually prove exclusion -- the gallery's
    // scope would still win by the topmost fallback. Wrapping "outside" in
    // its own ShortcutScope gives it a genuinely COMPETING, registered
    // scope, so focusing it is the only way to prove the gallery's j/k/x/
    // enter do not leak outside their own scope.
    renderGallery(
      <ShortcutProvider>
        <ShortcutScope id="outside-scope">
          <button data-testid="outside-focus-target">outside</button>
        </ShortcutScope>
        <PatternGalleryView
          data={PHOTOS}
          imageField="url"
          captionField="title"
          rowKey="id"
          onItemClick={() => {}}
          collectionShortcuts
        />
      </ShortcutProvider>
    );
    const cards = await screen.findAllByRole('button', { name: /photo/i });

    act(() => {
      screen.getByTestId('outside-focus-target').focus();
    });
    act(() => {
      dispatchKey(document, 'j');
    });

    // Focus is inside a DIFFERENT, competing scope -- j must not move
    // gallery focus.
    expect(cards.includes(document.activeElement as HTMLElement)).toBe(false);
  });

  it('x toggles selection of the active card', async () => {
    const onSelectionChange = vi.fn();
    renderGallery(
      <ShortcutProvider>
        <PatternGalleryView
          data={PHOTOS}
          imageField="url"
          captionField="title"
          rowKey="id"
          selectable
          onSelectionChange={onSelectionChange}
          collectionShortcuts
        />
      </ShortcutProvider>
    );

    // Nothing explicitly focused yet -- x should act on the default active
    // item (index 0), matching the documented "immediately actionable"
    // choice for x/enter via shortcut mode.
    await screen.findByText('Photo A');
    act(() => {
      dispatchKey(document, 'x');
    });

    expect(onSelectionChange).toHaveBeenCalledWith(['a'], [PHOTOS[0]]);
  });

  it('enter opens the active card even before any card has been explicitly focused', async () => {
    const onItemClick = vi.fn();
    renderGallery(
      <ShortcutProvider>
        <PatternGalleryView
          data={PHOTOS}
          imageField="url"
          captionField="title"
          rowKey="id"
          onItemClick={onItemClick}
          collectionShortcuts
        />
      </ShortcutProvider>
    );

    await screen.findByText('Photo A');
    act(() => {
      dispatchKey(document, 'Enter');
    });

    expect(onItemClick).toHaveBeenCalledWith(PHOTOS[0], 0);
  });

  it('does not fire while typing in an unrelated input on the page (editable-element suppression)', async () => {
    renderGallery(
      <ShortcutProvider>
        <input data-testid="text-input" />
        <PatternGalleryView
          data={PHOTOS}
          imageField="url"
          captionField="title"
          rowKey="id"
          onItemClick={() => {}}
          collectionShortcuts
        />
      </ShortcutProvider>
    );
    const cards = await screen.findAllByRole('button');
    const input = screen.getByTestId('text-input');

    act(() => {
      cards[0].focus();
    });
    act(() => {
      input.focus();
    });
    act(() => {
      fireEvent.keyDown(input, { key: 'j' });
    });

    // Focus stays on the input, and the gallery's active card never moved.
    expect(document.activeElement).toBe(input);
    expect(cards[0]).toHaveAttribute('tabindex', '0');
  });
});
