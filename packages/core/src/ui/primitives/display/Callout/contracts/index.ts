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
import type { EngineAwareProps } from '../../../../../foundation/contracts';
import type { Tone } from '../../../../../foundation/contracts/kernel/common';

/**
 * @deprecated Use {@link Tone} via the `tone` prop instead. Retained for one release so
 * existing values keep compiling.
 */
export type CalloutVariant = 'info' | 'warning' | 'error' | 'success';

/**
 * The {@link Tone} values Callout accepts through the `tone` prop ('neutral' and 'primary'
 * have no Callout rendering and remain excluded, matching the deprecated `variant`'s vocabulary).
 */
export type CalloutTone = 'info' | 'warning' | 'danger' | 'success';

/**
 * Every {@link CalloutTone} value mapped to the internal color-token key `variant` has always
 * used ('danger' is the canonical Tone spelling; Callout's internal key has always been 'error').
 */
export const TONE_TO_CALLOUT_VARIANT: Record<CalloutTone, CalloutVariant> = {
  info: 'info',
  warning: 'warning',
  danger: 'error',
  success: 'success',
};

/**
 * Props for the Callout component.
 * A rich callout box for informational/warning/error/success messages.
 */
export interface CalloutProps extends EngineAwareProps {
  /**
   * Callout semantic color. Takes precedence over the deprecated `variant` prop when both
   * are given.
   * @default 'info'
   */
  tone?: CalloutTone;
  /**
   * @deprecated Use `tone` instead. Visual variant.
   */
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
