/**
 * @fileoverview HoverCard Types - Rottay Design System
 * @description Type definitions for the HoverCard component.
 * Part of the Rottay Design System's overlay primitives collection.
 *
 * @module HoverCard/Types
 * @category Overlay
 * @package @rottay/design-system
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';

/** Side where the hover card appears relative to the trigger */
export type HoverCardSide = 'top' | 'bottom' | 'left' | 'right';

/** Alignment of the hover card relative to the trigger */
export type HoverCardAlign = 'start' | 'center' | 'end';

/**
 * Props for the HoverCard component.
 * A card that appears on hover over a trigger element.
 */
export interface HoverCardProps extends EngineAwareProps {
  /** Content to display inside the hover card */
  content: ReactNode;
  /** The trigger element that activates the hover card */
  trigger: ReactNode;
  /** Delay in ms before the card opens (default: 300) */
  openDelay?: number;
  /** Delay in ms before the card closes (default: 200) */
  closeDelay?: number;
  /** Which side to place the card relative to trigger */
  side?: HoverCardSide;
  /** Alignment along the side axis */
  align?: HoverCardAlign;
  /** Whether the hover card is disabled */
  disabled?: boolean;
  /** Controlled open state */
  open?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Additional class for the card overlay */
  overlayClassName?: string;
  /** Additional styles for the card overlay */
  overlayStyle?: CSSProperties;
}

/**
 * Default values for HoverCard component props.
 */
export const HOVERCARD_DEFAULTS = {
  openDelay: 300,
  closeDelay: 200,
  side: 'bottom' as HoverCardSide,
  align: 'center' as HoverCardAlign,
  disabled: false,
};
