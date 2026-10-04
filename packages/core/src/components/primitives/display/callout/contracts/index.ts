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
import { TONE_TO_VARIANT } from '../../../../../foundation/contracts/kernel/common';

/**
 * The internal color-token key the Classic and Rustic Callout engines paint with.
 * Family-internal and not published.
 */
export type CalloutColorKey = 'info' | 'warning' | 'error' | 'success';

/**
 * The {@link Tone} values Callout accepts through the `tone` prop ('neutral' and 'primary'
 * have no Callout rendering and remain excluded).
 */
export type CalloutTone = 'info' | 'warning' | 'danger' | 'success';

/**
 * Family-internal binding of the kernel {@link TONE_TO_VARIANT} map, read by the Classic and
 * Rustic Callout engines; it is not part of the package's public surface. Every
 * {@link CalloutTone} value maps to the internal {@link CalloutColorKey}
 * ('danger' is the canonical Tone spelling; Callout's internal key has always been 'error').
 * The four keys are a subset of the literal values `TONE_TO_VARIANT` produces, so the kernel map
 * is directly assignable here too despite not sharing the generic `Variant` type.
 */
export const TONE_TO_CALLOUT_VARIANT: Record<CalloutTone, CalloutColorKey> = TONE_TO_VARIANT;

/**
 * Props for the Callout component: the contract the family publishes as `CalloutProps`.
 * A rich callout box for informational/warning/danger/success messages.
 */
export interface CalloutPublicProps extends EngineAwareProps {
  /**
   * Callout semantic color.
   * @default 'info'
   */
  tone?: CalloutTone;
  /** Callout title */
  title?: ReactNode;
  /** Callout body content */
  children: ReactNode;
  /** Custom icon (overrides the default tone icon) */
  icon?: ReactNode;
  /** Whether the callout can be closed */
  closable?: boolean;
  /** Callback when closed */
  onClose?: () => void;
  /** Action element (e.g. a button) displayed at the bottom */
  action?: ReactNode;
}

/**
 * Props the engines receive. Family-internal and not published: it adds to the public contract
 * the `variant` member the Classic and Rustic engines read when `tone` is absent; the family
 * entry publishes {@link CalloutPublicProps} as `CalloutProps`.
 */
export interface CalloutProps extends CalloutPublicProps {
  variant?: CalloutColorKey;
}

/**
 * Color configuration for each callout color key.
 */
export const CALLOUT_COLORS: Record<CalloutColorKey, {
  bg: string;
  border: string;
  text: string;
  icon: string;
}> = {
  info: {
    bg: 'var(--ds-color-info-50)',
    border: 'var(--ds-color-info-200)',
    text: 'var(--ds-color-info-800)',
    icon: 'var(--ds-color-info-500)',
  },
  warning: {
    bg: 'var(--ds-color-warning-50)',
    border: 'var(--ds-color-warning-200)',
    text: 'var(--ds-color-warning-800)',
    icon: 'var(--ds-color-warning-500)',
  },
  error: {
    bg: 'var(--ds-color-error-50)',
    border: 'var(--ds-color-error-200)',
    text: 'var(--ds-color-error-800)',
    icon: 'var(--ds-color-error-500)',
  },
  success: {
    bg: 'var(--ds-color-success-50)',
    border: 'var(--ds-color-success-200)',
    text: 'var(--ds-color-success-800)',
    icon: 'var(--ds-color-success-500)',
  },
};

/** Default glyphs per color key */
export const CALLOUT_ICONS: Record<CalloutColorKey, string> = {
  info: 'i',
  warning: '!',
  error: 'x',
  success: '~',
};

/**
 * Default values for Callout component props.
 */
export const CALLOUT_DEFAULTS = {
  variant: 'info' as CalloutColorKey,
  closable: false,
};
