/**
 * Component type definitions
 * Base types for all components in the design system
 *
 * Note: BaseComponentProps is defined in ./common to be the single source of truth.
 * WithChildren is also defined in ./common as WithChildren.
 * This file re-exports them for backward compatibility.
 */

import type { ReactNode } from 'react';

// Re-export from common (single source of truth)
export type { BaseComponentProps } from '../common';

/**
 * Base props for components that accept children
 * Note: Also available as `WithChildren` from './common'
 */
export interface WithChildrenProps {
  children?: ReactNode;
}
