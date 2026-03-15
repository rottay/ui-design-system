/**
 * @fileoverview Kbd Types - Rottay Design System
 * @description Type definitions for the Kbd component.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @module Kbd/Types
 * @category Display
 * @package @rottay/design-system
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../contracts';

/** Size variants for Kbd */
export type KbdSize = 'sm' | 'md' | 'lg';

/**
 * Props for the Kbd component.
 * A styled keyboard key display element.
 */
export interface KbdProps extends EngineAwareProps {
  /** Key name to display */
  children: ReactNode;
  /** Size variant */
  size?: KbdSize;
}

/**
 * Default values for Kbd component props.
 */
export const KBD_DEFAULTS = {
  size: 'md' as KbdSize,
};
