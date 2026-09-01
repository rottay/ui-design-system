import React from 'react';
import { describe, expect, it } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import Popconfirm from '../engines/modern';
import { useOverlayLayer } from '../../../runtime/overlay/layer-stack';

/** A blocking layer above the popconfirm, registered through the same shared
 *  stack the rest of the overlay family joins. */
function TopLayer(): React.ReactElement {
  const { layerProps } = useOverlayLayer({ kind: 'modal', active: true, modal: true });
  return <div {...layerProps} data-testid="top-layer" />;
}

describe('Modern Popconfirm disclosure relations', () => {
  it('wires the trigger to the panel it opens', async () => {
    render(
      <Popconfirm title="Remove item?">
        <button type="button">Remove</button>
      </Popconfirm>,
    );

    const trigger = screen.getByRole('button', { name: 'Remove' });
    // Every sibling (Popover, HoverCard, ContextMenu, Dropdown) clones disclosure semantics
    // onto the trigger ELEMENT; without them the panel is an orphan dialog.
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).not.toHaveAttribute('aria-controls');

    fireEvent.click(trigger);

    const panel = await screen.findByRole('dialog');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger).toHaveAttribute('aria-controls', panel.id);
  });

  it('lets the trigger dismiss the panel it opened', async () => {
    render(
      <Popconfirm title="Remove item?">
        <button type="button">Remove</button>
      </Popconfirm>,
    );

    const trigger = screen.getByRole('button', { name: 'Remove' });
    fireEvent.click(trigger);
    await screen.findByRole('dialog');

    // A disclosure that cannot un-disclose is a trap: the outside-click guard
    // treats the trigger as inside the anchor, so re-pressing it did nothing.
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});

describe('Modern Popconfirm escape routing', () => {
  it('leaves Escape to a layer that opened above it', async () => {
    const { rerender } = render(
      <>
        <Popconfirm title="Remove item?">
          <button type="button">Remove</button>
        </Popconfirm>
        {null}
      </>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Remove' }));
    await screen.findByRole('dialog');

    // A blocking layer opens ON TOP of the still-open panel.
    rerender(
      <>
        <Popconfirm title="Remove item?">
          <button type="button">Remove</button>
        </Popconfirm>
        <TopLayer />
      </>,
    );

    // Only the top-most blocking layer may consume Escape: a raw document listener made
    // every open Popconfirm answer the same key press.
    fireEvent.keyDown(document, { key: 'Escape' });

    await act(async () => {});
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Once that layer leaves, the panel owns the key again.
    rerender(
      <>
        <Popconfirm title="Remove item?">
          <button type="button">Remove</button>
        </Popconfirm>
        {null}
      </>,
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('returns focus to the trigger when Escape dismisses it', async () => {
    render(
      <Popconfirm title="Remove item?">
        <button type="button">Remove</button>
      </Popconfirm>,
    );

    const trigger = screen.getByRole('button', { name: 'Remove' });
    await act(async () => {
      trigger.focus();
    });
    fireEvent.click(trigger);
    await screen.findByRole('dialog');

    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(trigger).toHaveFocus();
  });
});
