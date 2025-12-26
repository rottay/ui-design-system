/**
 * Portal - Utility Component
 * Renders children into a DOM node that exists outside the DOM hierarchy of the parent component
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
 * Portal component that renders children into a DOM node outside the parent hierarchy.
 * Uses React's createPortal for proper event bubbling and context propagation.
 */
export function Portal({ children, container, key }: PortalProps): React.ReactPortal | null {
  const [mounted, setMounted] = useState(false);
  const [portalContainer, setPortalContainer] = useState<Element | null>(null);

  useEffect(() => {
    setMounted(true);

    // Use provided container or create/find default container
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

  // Don't render on server side
  if (!mounted || !portalContainer) {
    return null;
  }

  return createPortal(children, portalContainer, key);
}

Portal.displayName = 'Portal';

/**
 * Hook to get or create a portal container
 */
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
