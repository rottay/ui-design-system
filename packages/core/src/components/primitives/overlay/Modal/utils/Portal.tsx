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

import { useEffect, useState, ReactNode } from 'react';
import { createPortal } from 'react-dom';

export interface PortalProps {
  /** Content to render in the portal */
  children: ReactNode;
  /** Container element to render into (defaults to document.body) */
  container?: Element | null;
  /** Unique key for the portal container */
  key?: string;
}

/**
 * SSR-safe portal: waits for mount, creates/finds the portal root, then
 * renders children via createPortal (preserving event bubbling and context).
 */
export function Portal({ children, container, key }: PortalProps): React.ReactPortal | null {
  const [mounted, setMounted] = useState(false);
  const [portalContainer, setPortalContainer] = useState<Element | null>(null);

  // On mount: resolve the target container (provided, or shared #rottay-portal-root)
  useEffect(() => {
    setMounted(true);

    if (container) {
      setPortalContainer(container);
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
    }

    return () => {
      setMounted(false);
    };
  }, [container]);

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
