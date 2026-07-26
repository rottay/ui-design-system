/**
 * @fileoverview Portal - renders children outside the parent DOM hierarchy via createPortal.
 * Creates a shared `#rottay-portal-root` div on first use (SSR-safe).
 * Also exports a `usePortalContainer` hook for imperative container management.
 *
 * @example
 * ```tsx
 * <Portal>
 *   <OverlayContent />  {/* Rendered into #rottay-portal-root *\/}
 * </Portal>
 * ```
 */

'use client';

import { useEffect, useLayoutEffect, useState, ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { useTopLayerHost } from '../top-layer-host';

/**
 * The container is a DOM lookup, not a paint-dependent measurement, so it
 * resolves in the layout phase: the portaled content mounts BEFORE the first
 * paint, exactly as a direct `createPortal` would have. Consumers that
 * measure their portaled surface in their own `useLayoutEffect` (Dropdown's
 * `updatePortalPosition`, the pickers' fixed-position panels) would otherwise
 * run one frame before the surface exists and position against nothing.
 *
 * `useLayoutEffect` does not run during SSR and React warns when it is used
 * in a server render, so the server path falls back to `useEffect` -- which
 * also does not run there, but warns about nothing.
 */
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export interface PortalProps {
  /** Content to render in the portal */
  children: ReactNode;
  /**
   * Explicit container to render into. Honored only when it is a real,
   * attached element; anything else falls through to the next precedence
   * level. Callers that resolve a host asynchronously (`getPopupContainer`)
   * can therefore pass their unresolved `null` without special-casing.
   */
  container?: Element | null;
  /**
   * Unique key for the portal container.
   *
   * @deprecated Inert. `key` is reserved by React and stripped from props, so
   * this field can never reach the component and is always `undefined` here.
   * Kept only to preserve the published `PortalProps` shape.
   */
  key?: string;
}

/**
 * An explicit container is honored only when it is a real, attached element.
 * A detached node (a ref captured before mount, or one already removed from
 * the document) would silently swallow the overlay -- React renders into it
 * happily and nothing ever paints. Falling through to the top-layer host or
 * the shared root keeps the overlay visible instead of invisibly correct.
 *
 * Duck-typed rather than `instanceof Element`: a container handed over from
 * another realm (iframe, portal-into-popup) is a legitimate target but fails
 * the cross-realm prototype check.
 */
function isAttachedElement(container: Element | null | undefined): container is Element {
  return Boolean(container && container.nodeType === 1 && container.isConnected);
}

/**
 * SSR-safe portal: waits for mount, resolves the target container, then
 * renders children via createPortal (preserving event bubbling and context).
 *
 * Container precedence is the single canonical rule for every DS overlay:
 *   1. an explicit, valid (attached) `container`
 *   2. the active top-layer host (see `../top-layer-host`)
 *   3. the shared `#rottay-portal-root`
 */
export function Portal({ children, container, key }: PortalProps): React.ReactPortal | null {
  const [mounted, setMounted] = useState(false);
  const [portalContainer, setPortalContainer] = useState<Element | null>(null);
  // A dialog promoted by `showModal()` lives in the browser top layer, which
  // paints above every normal-flow node regardless of z-index. Portaling to
  // the shared root would make this overlay a SIBLING of that dialog, and so
  // occluded by it. The host travels by React context, which portaled
  // children still belong to, so no anchor plumbing is needed here.
  const topLayerHost = useTopLayerHost();

  // On mount: resolve the target container. Precedence is explicit VALID
  // container > active top-layer host > shared `#rottay-portal-root`.
  useIsomorphicLayoutEffect(() => {
    setMounted(true);

    if (isAttachedElement(container)) {
      setPortalContainer(container);
    } else if (topLayerHost) {
      setPortalContainer(topLayerHost);
    } else if (typeof document !== 'undefined') {
      // Look for existing portal root or use body
      let root = document.getElementById('rottay-portal-root');
      if (!root) {
        root = document.createElement('div');
        root.id = 'rottay-portal-root';
        root.setAttribute('data-rottay-portal', 'true');
        document.body.appendChild(root);
      }
      setPortalContainer(root);
    } else {
      setPortalContainer(null);
    }

    return () => {
      setMounted(false);
      // Drop the resolved target too: on a host switch the effect body
      // re-resolves in the same commit (both updates batch, so there is no
      // intermediate unmount), and on a real unmount this releases the
      // reference instead of parking a detached node in state.
      setPortalContainer(null);
    };
  }, [container, topLayerHost]);

  // SSR guard -- createPortal requires a real DOM node
  if (!mounted || !portalContainer) {
    return null;
  }

  return createPortal(children, portalContainer, key);
}

Portal.displayName = 'Portal';

/** Hook that lazily creates (or finds) a portal container by ID. SSR-safe. */
export function usePortalContainer(containerId?: string): Element | null {
  const [container, setContainer] = useState<Element | null>(null);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const id = containerId || 'rottay-portal-root';
    let root = document.getElementById(id);

    if (!root) {
      root = document.createElement('div');
      root.id = id;
      root.setAttribute('data-rottay-portal', 'true');
      document.body.appendChild(root);
    }

    setContainer(root);
  }, [containerId]);

  return container;
}
