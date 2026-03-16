/**
 * @fileoverview Component contracts - Rottay Design System
 * @description Backwards-compatible entry point re-exporting shared component
 * base types. The source of truth lives in `contracts/common`; this file keeps
 * older imports working during the convergence to a single home.
 *
 * @module Contracts/Components
 * @category Types
 * @package @rottay/design-system
 */

import type { ReactNode } from 'react';

// Re-export from common (single source of truth).
export type { BaseComponentProps } from '../common';

/**
 * Base props for components that accept children
 * Note: Also available as `WithChildren` from './common'
 */
export interface WithChildrenProps {
  children?: ReactNode;
}
