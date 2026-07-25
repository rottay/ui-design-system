/**
 * SemanticSurface contracts (DS-A004).
 *
 * The public, cross-product owner of the semantic surface-role system. The
 * historic `--ds-material-<role>-*` channel prefix remains an internal
 * compatibility detail; no external Material library is involved.
 */
import type { HTMLAttributes, ReactNode } from 'react';

import type { SemanticSurfaceRole } from '@/foundation/contracts/kernel/tokens/materials';

export type SemanticSurfaceElement =
  | 'div'
  | 'section'
  | 'aside'
  | 'article'
  | 'button';

export interface SemanticSurfaceProps extends HTMLAttributes<HTMLElement> {
  /** Selects the governed surface-role channel family. */
  surfaceRole: SemanticSurfaceRole;
  /**
   * Enables hover/pressed paint only. It never fabricates an ARIA role,
   * tab stop or keyboard behavior. Use `as="button"` for button behavior, or
   * provide an explicit native role and complete keyboard contract.
   */
  interactive?: boolean;
  /** Persistent selection; paints the `-selected` channels. */
  selected?: boolean;
  /** Disabled posture; maps to native `disabled` when rendered as a button. */
  disabled?: boolean;
  /** Loading posture; mutes content through the `foreground-muted` channel. */
  loading?: boolean;
  /** Drag-in-progress posture; paints the active depth channels. */
  dragging?: boolean;
  /** Emphasized edge; paints `border-strong` instead of the resting border. */
  emphasis?: 'default' | 'strong';
  /** Rendered element. `button` receives a safe default `type="button"`. */
  as?: SemanticSurfaceElement;
  /** Native button type; emitted only when `as="button"`. */
  type?: 'button' | 'submit' | 'reset';
  children?: ReactNode;
}

export interface SemanticSurfaceSupportProps
  extends HTMLAttributes<HTMLSpanElement> {
  children?: ReactNode;
}

export const SEMANTIC_SURFACE_DEFAULTS = {
  interactive: false,
  selected: false,
  disabled: false,
  loading: false,
  dragging: false,
  emphasis: 'default',
  as: 'div',
} as const satisfies Partial<SemanticSurfaceProps>;
