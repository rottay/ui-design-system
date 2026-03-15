/**
 * @fileoverview Callout Types - Rottay Design System
 * @description Type definitions for the Callout component.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @module Callout/Types
 * @category Display
 * @package @rottay/design-system
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';

/** Variant types for Callout */
export type CalloutVariant = 'info' | 'warning' | 'error' | 'success';

/**
 * Props for the Callout component.
 * A rich callout box for informational/warning/error/success messages.
 */
export interface CalloutProps extends EngineAwareProps {
  /** Visual variant */
  variant?: CalloutVariant;
  /** Callout title */
  title?: ReactNode;
  /** Callout body content */
  children: ReactNode;
  /** Custom icon (overrides default variant icon) */
  icon?: ReactNode;
  /** Whether the callout can be closed */
  closable?: boolean;
  /** Callback when closed */
  onClose?: () => void;
  /** Action element (e.g. a button) displayed at the bottom */
  action?: ReactNode;
}

/**
 * Color configuration for each callout variant.
 */
export const CALLOUT_COLORS: Record<CalloutVariant, {
  bg: string;
  border: string;
  text: string;
  icon: string;
}> = {
  info: {
    bg: 'var(--ds-color-info-50, #eff6ff)',
    border: 'var(--ds-color-info-200, #bfdbfe)',
    text: 'var(--ds-color-info-800, #1e40af)',
    icon: 'var(--ds-color-info-500, #3b82f6)',
  },
  warning: {
    bg: 'var(--ds-color-warning-50, #fffbeb)',
    border: 'var(--ds-color-warning-200, #fde68a)',
    text: 'var(--ds-color-warning-800, #92400e)',
    icon: 'var(--ds-color-warning-500, #f59e0b)',
  },
  error: {
    bg: 'var(--ds-color-error-50, #fef2f2)',
    border: 'var(--ds-color-error-200, #fecaca)',
    text: 'var(--ds-color-error-800, #991b1b)',
    icon: 'var(--ds-color-error-500, #ef4444)',
  },
  success: {
    bg: 'var(--ds-color-success-50, #f0fdf4)',
    border: 'var(--ds-color-success-200, #bbf7d0)',
    text: 'var(--ds-color-success-800, #166534)',
    icon: 'var(--ds-color-success-500, #22c55e)',
  },
};

/** Default SVG icons per variant */
export const CALLOUT_ICONS: Record<CalloutVariant, string> = {
  info: 'i',
  warning: '!',
  error: 'x',
  success: '~',
};

/**
 * Default values for Callout component props.
 */
export const CALLOUT_DEFAULTS = {
  variant: 'info' as CalloutVariant,
  closable: false,
};
