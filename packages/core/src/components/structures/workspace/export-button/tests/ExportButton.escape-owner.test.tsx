/**
 * Escape reaches ExportButton through the overlay layer stack: the panel closes,
 * focus returns to the trigger, and the router consumes the key. Opened inside
 * an enclosing modal layer, the panel closes first and the modal second.
 */

import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';

import { useOverlayLayer } from '../../../../primitives/runtime/overlay/layer-stack';
import { renderWithEngine } from '@tests/support/engine';
import { ExportButton } from '../index';

function EnclosingModal({ onEscape }: { onEscape: () => void }) {
  useOverlayLayer({ kind: 'modal', modal: true, lockScroll: false, restoreFocus: false, onEscape });
  return null;
}

function pressEscape(): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
  (document.activeElement ?? document.body).dispatchEvent(event);
  return event;
}

const isPanelOpen = (): boolean => document.querySelector('.ds-export-button-panel') !== null;

async function openPanel(): Promise<HTMLElement> {
  const part = await waitFor(() => {
    const node = document.querySelector('[data-part="trigger"]') as HTMLElement | null;
    expect(node).not.toBeNull();
    return node as HTMLElement;
  });
  const trigger = (part.querySelector('button') ?? part) as HTMLElement;
  fireEvent.click(trigger);
  await waitFor(() => expect(isPanelOpen()).toBe(true));
  return trigger;
}

describe('ExportButton: Escape through the layer stack', () => {
  it('closes the panel, refocuses the trigger and consumes the key', async () => {
    renderWithEngine(<ExportButton data={[{ name: "a" }]} columns={[{ key: "name", header: "Name" }]} formats={["csv", "json"]} />, 'modern');
    const trigger = await openPanel();
    const event = pressEscape();
    await waitFor(() => expect(isPanelOpen()).toBe(false));
    expect(document.activeElement).toBe(trigger);
    expect(event.defaultPrevented).toBe(true);
  });

  it('closes before an enclosing modal layer', async () => {
    const modalEscape = vi.fn();
    renderWithEngine(<><EnclosingModal onEscape={modalEscape} /><ExportButton data={[{ name: "a" }]} columns={[{ key: "name", header: "Name" }]} formats={["csv", "json"]} /></>, 'modern');
    await openPanel();
    pressEscape();
    await waitFor(() => expect(isPanelOpen()).toBe(false));
    expect(modalEscape).not.toHaveBeenCalled();
    pressEscape();
    expect(modalEscape).toHaveBeenCalledTimes(1);
  });
});
