/**
 * @fileoverview Portal top-layer host contract.
 *
 * A native `<dialog>` opened with `showModal()` is promoted into the browser
 * TOP LAYER, which paints above every normal-flow node regardless of
 * `z-index`. The shared `#rottay-portal-root` is a plain `document.body`
 * child, so an overlay that portals there while nested inside an open modal
 * renders as a SIBLING of the dialog and is occluded by it. `z-index` cannot
 * fix this: the top layer sits outside the z-index model entirely.
 *
 * `OverlayPortalBoundary` already declares the chain invariant -- "an overlay
 * instance is fully top-layer OR fully portal, never mixed within one open
 * chain" -- but it only enforces the portal-parent -> child direction. These
 * tests pin the missing half: a TOP-LAYER parent must keep its portaled
 * descendants inside its own top-layer subtree.
 *
 * The host is published through React context rather than an anchor prop:
 * context follows the React tree, which portaled children still belong to,
 * so nested overlays resolve the correct host without any per-component
 * plumbing.
 */

import { describe, expect, it, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';

import { Portal } from '../index';
import { TopLayerHostProvider } from '../../top-layer-host';

afterEach(() => {
  cleanup();
  document.getElementById('rottay-portal-root')?.remove();
});

describe('Portal -- top-layer host contract', () => {
  it('falls back to the shared portal root when no top-layer host is active', () => {
    render(
      <Portal>
        <div data-testid="content" />
      </Portal>,
    );

    const content = document.querySelector('[data-testid="content"]');
    const root = document.getElementById('rottay-portal-root');

    expect(root).not.toBeNull();
    expect(root?.contains(content as Node)).toBe(true);
  });

  it('renders into the active top-layer host instead of the shared portal root', () => {
    const host = document.createElement('div');
    host.setAttribute('data-testid', 'top-layer-host');
    document.body.appendChild(host);

    render(
      <TopLayerHostProvider host={host}>
        <Portal>
          <div data-testid="content" />
        </Portal>
      </TopLayerHostProvider>,
    );

    const content = document.querySelector('[data-testid="content"]');

    expect(host.contains(content as Node)).toBe(true);
    // The shared root must not capture it -- that is the occlusion bug.
    const root = document.getElementById('rottay-portal-root');
    expect(root?.contains(content as Node) ?? false).toBe(false);

    host.remove();
  });

  it('keeps a nested portal INSIDE an open dialog rather than beside it', () => {
    // Mirrors the real failure: Modal renders <dialog> through Portal, calls
    // showModal(), and a nested Select portals separately. Without the host
    // the listbox becomes a sibling of the dialog and is occluded.
    const dialog = document.createElement('dialog');
    document.body.appendChild(dialog);
    // happy-dom/jsdom do not implement the real top layer; `open` is the
    // observable part of the contract we can assert deterministically.
    dialog.setAttribute('open', '');

    render(
      <TopLayerHostProvider host={dialog}>
        <Portal>
          <div data-testid="nested-overlay" />
        </Portal>
      </TopLayerHostProvider>,
    );

    const nested = document.querySelector('[data-testid="nested-overlay"]');

    expect(dialog.contains(nested as Node)).toBe(true);
    expect(nested?.parentElement === document.body).toBe(false);

    dialog.remove();
  });

  it('lets an explicit container prop win over the top-layer host', () => {
    const host = document.createElement('div');
    const explicit = document.createElement('div');
    explicit.setAttribute('data-testid', 'explicit');
    document.body.append(host, explicit);

    render(
      <TopLayerHostProvider host={host}>
        <Portal container={explicit}>
          <div data-testid="content" />
        </Portal>
      </TopLayerHostProvider>,
    );

    const content = document.querySelector('[data-testid="content"]');
    expect(explicit.contains(content as Node)).toBe(true);
    expect(host.contains(content as Node)).toBe(false);

    host.remove();
    explicit.remove();
  });

  it('restores the shared portal root once the top-layer host is withdrawn', () => {
    const host = document.createElement('div');
    document.body.appendChild(host);

    const { rerender } = render(
      <TopLayerHostProvider host={host}>
        <Portal>
          <div data-testid="content" />
        </Portal>
      </TopLayerHostProvider>,
    );

    expect(host.contains(document.querySelector('[data-testid="content"]'))).toBe(true);

    rerender(
      <TopLayerHostProvider host={null}>
        <Portal>
          <div data-testid="content" />
        </Portal>
      </TopLayerHostProvider>,
    );

    const content = document.querySelector('[data-testid="content"]');
    expect(document.getElementById('rottay-portal-root')?.contains(content as Node)).toBe(true);
    expect(host.contains(content as Node)).toBe(false);

    host.remove();
  });
});
