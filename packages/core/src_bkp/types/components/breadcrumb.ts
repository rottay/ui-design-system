/**
 * Breadcrumb Component Types
 *
 * Unified type definitions for Breadcrumb component across all engines.
 * Compatible with: titan (AntD), hermes (DaisyUI), apollo (Native HTML + Tailwind)
 */

import type { CSSProperties, ReactNode, MouseEvent } from 'react';

/**
 * Individual breadcrumb item configuration
 */
export interface BreadcrumbItem {
  // Display content
  title: ReactNode;

  // Navigation
  href?: string;

  // Icon (left side of title)
  icon?: ReactNode;

  // Click handler (alternative to href for custom navigation)
  onClick?: (event: MouseEvent<HTMLElement>) => void;

  // Custom className for this specific item
  className?: string;

  // Dropdown menu items (for complex breadcrumbs)
  menu?: BreadcrumbMenuItem[];
}

/**
 * Breadcrumb dropdown menu item
 */
export interface BreadcrumbMenuItem {
  title: ReactNode;
  href?: string;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  icon?: ReactNode;
}

/**
 * Base props that ALL engines must support.
 * These are the core properties available regardless of the rendering engine.
 */
export interface BreadcrumbBaseProps {
  // Items array - primary way to define breadcrumb structure
  items: BreadcrumbItem[];

  // Separator between items
  separator?: ReactNode;

  // Styling
  className?: string;
  style?: CSSProperties;

  // Accessibility
  'aria-label'?: string;
}

/**
 * Extended props with engine-specific features.
 * Not all engines may support all these properties.
 */
export interface BreadcrumbProps extends BreadcrumbBaseProps {
  // Maximum number of items to display before collapsing
  maxItems?: number;

  // Custom separator for collapsed items (titan support)
  itemRender?: (
    item: BreadcrumbItem,
    params: {
      index: number;
      items: BreadcrumbItem[];
      separator: ReactNode;
    }
  ) => ReactNode;
}
