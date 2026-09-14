/**
 * @fileoverview Notifier contracts - Rottay Design System.
 *
 * One transient announcement surface with three roles: a `toast` confirms an
 * action the user just took, a `notification` delivers something that arrived
 * on its own and may carry actions, and a `message` is a single-line status
 * line. Toast, Notification and Message are the public entry points of these
 * roles; the Modern engine renders every one of them through this owner.
 *
 * @module Notifier/Contracts
 * @category Feedback
 * @package @rottay/design-system
 */

import type { CSSProperties, ReactNode } from 'react';

export const NOTIFIER_ROLES = ['toast', 'notification', 'message'] as const;

/** Which announcement the surface is; it decides layout, motion and stacking. */
export type NotifierRole = (typeof NOTIFIER_ROLES)[number];

export const NOTIFIER_TONES = [
  'neutral',
  'primary',
  'secondary',
  'gradient',
  'info',
  'success',
  'warning',
  'error',
  'loading',
] as const;

/** The accent the surface, its icon well and its lifetime bar are painted from. */
export type NotifierTone = (typeof NOTIFIER_TONES)[number];

export const NOTIFIER_PLACEMENTS = ['top', 'top-start', 'top-end', 'bottom', 'bottom-start', 'bottom-end'] as const;

/** Viewport edge and inline alignment of a stack, in logical terms. */
export type NotifierPlacement = (typeof NOTIFIER_PLACEMENTS)[number];

export type NotifierRadius = 'none' | 'sm' | 'md' | 'lg';

export interface NotifierAction {
  label: ReactNode;
  onClick: () => void;
  /** Dismisses the surface after the action runs. @default true */
  closeOnClick?: boolean;
}

export interface NotifierItemProps {
  role: NotifierRole;
  tone: NotifierTone;
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  /** `null` renders no icon; `undefined` renders the tone's glyph. */
  icon?: ReactNode | null;
  closable?: boolean;
  closeIcon?: ReactNode;
  closeLabel: string;
  /** One inline control beside the dismiss. */
  action?: NotifierAction;
  /** Caller-owned controls under the copy. */
  actions?: ReactNode;
  /** Lifetime in milliseconds; 0 keeps the surface until it is dismissed. */
  duration: number;
  showProgress?: boolean;
  /** The pointer holds the lifetime; keyboard focus holds it either way. @default true */
  pauseOnHover?: boolean;
  /** `false` plays the exit and then reports `onExited`. @default true */
  open?: boolean;
  /** The user or the lifetime asked the surface to leave. */
  onDismiss?: () => void;
  /** The exit finished; the surface can leave the tree. */
  onExited?: () => void;
  /** Makes the whole surface one activatable control. */
  onActivate?: () => void;
  /** Escape dismisses a closable surface while focus is inside it. @default true */
  dismissOnEscape?: boolean;
  announce?: 'alert' | 'status';
  live?: 'polite' | 'assertive' | 'off';
  radius?: NotifierRadius;
  elevated?: boolean;
  id?: string;
  className?: string;
  style?: CSSProperties;
  'data-testid'?: string;
  /** Identity a stack owner reads to find the surface holding focus. */
  itemKey?: string;
  /** Increases when a keyed update refreshes the surface in place: a pending exit is cancelled and the lifetime restarts in full. */
  revision?: number;
}

export interface NotifierStackProps {
  role: NotifierRole;
  placement: NotifierPlacement;
  /** The overlay band the stack sits on. */
  layer: string;
  /** Distance from the stack's viewport edge, in px. */
  offset?: number;
  /** Space between stacked surfaces, in px. */
  gap?: number;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}
