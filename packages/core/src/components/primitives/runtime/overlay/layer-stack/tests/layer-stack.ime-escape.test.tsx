/**
 * Escape during IME composition belongs to the IME, not to the overlay.
 *
 * The shared capture-phase Escape router dismissed the top blocking layer on
 * any Escape keydown. While an IME owns the keystroke that is the wrong owner:
 * the user is cancelling a candidate inside a field, and the router closed the
 * surface holding that field out from under them -- worst inside a select whose
 * filter sits in a popover, where the candidate and the layer die together.
 *
 * The guard is the same composition authority the field families already use
 * (`isComposingKey`: the `isComposing` flag, or the legacy keyCode 229 Safari
 * reports on the confirming keydown). A composed Escape leaves the stack alone
 * AND stays unswallowed, so the IME still receives it; the next plain Escape
 * closes normally.
 */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useOverlayLayer } from '..';

/** The keydown a browser dispatches while an IME owns the key. */
const COMPOSING = { isComposing: true, keyCode: 229 } as const;
/** Safari reports only the legacy keyCode on the confirming keydown. */
const LEGACY_COMPOSING = { keyCode: 229 } as const;

function Layer({
  kind,
  onEscape,
  children,
}: {
  kind: 'modal' | 'dropdown' | 'popover';
  onEscape: () => void;
  children?: React.ReactNode;
}) {
  const layer = useOverlayLayer({ kind, modal: true, lockScroll: false, onEscape, restoreFocus: false });
  return (
    <div {...layer.layerProps} data-testid={`layer-${kind}`}>
      {children}
    </div>
  );
}

afterEach(() => {
  document.body.style.overflow = '';
});

describe('the Escape router yields the keystroke to a live composition', () => {
  it('does not dismiss a modal while a composition is live', () => {
    const onEscape = vi.fn();
    render(<Layer kind="modal" onEscape={onEscape} />);

    fireEvent.keyDown(document, { key: 'Escape', ...COMPOSING });

    expect(onEscape).not.toHaveBeenCalled();
  });

  it('reads the legacy 229 keydown as composition even without the isComposing flag', () => {
    const onEscape = vi.fn();
    render(<Layer kind="modal" onEscape={onEscape} />);

    fireEvent.keyDown(document, { key: 'Escape', ...LEGACY_COMPOSING });

    expect(onEscape).not.toHaveBeenCalled();
  });

  it('dismisses on the plain Escape that follows the composition', () => {
    const onEscape = vi.fn();
    render(<Layer kind="modal" onEscape={onEscape} />);

    fireEvent.keyDown(document, { key: 'Escape', ...COMPOSING });
    expect(onEscape).not.toHaveBeenCalled();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onEscape).toHaveBeenCalledTimes(1);
  });

  it('dismisses after compositionend settles the candidate', () => {
    const onEscape = vi.fn();
    render(
      <Layer kind="popover" onEscape={onEscape}>
        <input data-testid="filter" />
      </Layer>,
    );
    const filter = screen.getByTestId('filter');

    fireEvent.compositionStart(filter);
    fireEvent.keyDown(document, { key: 'Escape', ...COMPOSING });
    expect(onEscape).not.toHaveBeenCalled();

    fireEvent.compositionEnd(filter);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onEscape).toHaveBeenCalledTimes(1);
  });

  it('leaves a composed Escape unswallowed for the IME to consume', () => {
    const onEscape = vi.fn();
    const seenByPage = vi.fn();
    render(<Layer kind="modal" onEscape={onEscape} />);
    document.addEventListener('keydown', seenByPage);

    try {
      fireEvent.keyDown(document, { key: 'Escape', ...COMPOSING });
      expect(onEscape).not.toHaveBeenCalled();
      expect(seenByPage).toHaveBeenCalledTimes(1);

      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onEscape).toHaveBeenCalledTimes(1);
      // The real Escape is claimed by the top layer and stops there.
      expect(seenByPage).toHaveBeenCalledTimes(1);
    } finally {
      document.removeEventListener('keydown', seenByPage);
    }
  });

  it('holds the whole stack, not just the top layer, while composing', () => {
    const outer = vi.fn();
    const inner = vi.fn();
    render(
      <>
        <Layer kind="dropdown" onEscape={outer} />
        <Layer kind="modal" onEscape={inner} />
      </>,
    );

    fireEvent.keyDown(document, { key: 'Escape', ...COMPOSING });
    expect(outer).not.toHaveBeenCalled();
    expect(inner).not.toHaveBeenCalled();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(inner).toHaveBeenCalledTimes(1);
    expect(outer).not.toHaveBeenCalled();
  });
});
