/**
 * Component type definitions
 * Base types for all components in the design system
 */

import type { CSSProperties, ReactNode } from 'react';

/**
 * Base props for all components
 * Provides common styling and testing props
 */
export interface BaseComponentProps {
  className?: string;
  style?: CSSProperties;
  'data-testid'?: string;
}

/**
 * Base props for components that accept children
 */
export interface WithChildrenProps {
  children?: ReactNode;
}
