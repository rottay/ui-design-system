'use client';

/**
 * @fileoverview Top-layer host -- shared runtime/overlay owner that keeps a
 * portaled overlay inside the top-layer subtree of the dialog it belongs to.
 *
 * A native `<dialog>` opened with `showModal()` is promoted into the browser
 * TOP LAYER. The top layer paints above every normal-flow node regardless of
 * `z-index`, so an overlay that portals to the shared `#rottay-portal-root`
 * (a plain `document.body` child) while nested inside an open modal renders
 * as a SIBLING of the dialog and is occluded by it. Raising `z-index` cannot
 * fix this -- the top layer sits outside the z-index model.
 *
 * `runtime/overlay/positioning` already states the chain invariant: "an
 * overlay instance is fully top-layer OR fully portal -- never mixed within
 * one open chain", and `OverlayPortalBoundary` enforces the portal-parent ->
 * child direction (a child under a portal-rendered parent must not promote).
 * This owner supplies the missing half: a TOP-LAYER parent keeps its
 * portaled descendants inside its own top-layer subtree.
 *
 * The host travels by React context rather than an anchor prop. Context
 * follows the REACT tree, which portaled children still belong to even after
 * they leave the DOM lineage -- so every nested overlay resolves the right
 * host with no per-component plumbing and no duplicated logic.
 *
 * @internal Shared overlay substrate; consumed by `runtime/overlay/portal`
 * and published by the dialog-shaped primitives. Not part of the public
 * component contract.
 */

import React, { createContext, useContext, type ReactNode } from 'react';

/**
 * The element portaled descendants must render into, or `null` when the
 * subtree is not inside an active top-layer dialog.
 */
const TopLayerHostContext = createContext<Element | null>(null);

/**
 * Resolves the active top-layer host for the current React subtree.
 * Returns `null` outside any open top-layer dialog, in which case portals
 * fall back to the shared tenant-scoped portal root.
 */
export function useTopLayerHost(): Element | null {
  return useContext(TopLayerHostContext);
}

export interface TopLayerHostProviderProps {
  /**
   * The top-layer element (or a dedicated child of it) that descendant
   * portals must render into. Pass `null` while the dialog is closed so
   * descendants fall back to the shared portal root.
   */
  host: Element | null;
  children: ReactNode;
}

/**
 * Publishes a top-layer host to every descendant portal.
 *
 * Nesting is handled by ordinary context shadowing: an inner dialog
 * overrides the outer one, so a chain of nested dialogs always resolves to
 * the innermost open dialog -- which is exactly the top-layer stacking order
 * the browser applies.
 */
export function TopLayerHostProvider({
  host,
  children,
}: TopLayerHostProviderProps): React.ReactElement {
  return (
    <TopLayerHostContext.Provider value={host}>
      {children}
    </TopLayerHostContext.Provider>
  );
}

TopLayerHostProvider.displayName = 'TopLayerHostProvider';
