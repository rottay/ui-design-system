/**
 * @fileoverview AspectRatio Types - Rottay Design System
 * @description Type definitions for the AspectRatio component.
 * Part of the Rottay Design System's layout primitives collection.
 *
 * @remarks
 * This module defines all TypeScript interfaces, types, and constants for the
 * AspectRatio component. These types are shared across all engine implementations.
 *
 * @module AspectRatioTypes
 * @category Layout
 * @package @rottay/design-system
 */

import type { EngineAwareProps } from '../../../../types';
import type { ReactNode, CSSProperties } from 'react';

export type AspectRatioPreset = '1/1' | '4/3' | '16/9' | '21/9' | '3/2' | '2/3' | '9/16';

export interface AspectRatioProps extends EngineAwareProps {
  /** Aspect ratio as a number (width / height). Default is 16/9. */
  ratio?: number;
  /** Children content to render inside the aspect ratio container */
  children?: ReactNode;
  /** Additional CSS class */
  className?: string;
  /** Inline styles applied to the outer container */
  style?: CSSProperties;
  /** Max width of the container */
  maxWidth?: string | number;
  /** Data test id */
  'data-testid'?: string;
}

export const RATIO_PRESETS: Record<AspectRatioPreset, number> = {
  '1/1': 1,
  '4/3': 4 / 3,
  '16/9': 16 / 9,
  '21/9': 21 / 9,
  '3/2': 3 / 2,
  '2/3': 2 / 3,
  '9/16': 9 / 16,
};

export const ASPECT_RATIO_DEFAULTS = {
  ratio: 16 / 9,
};
