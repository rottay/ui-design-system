/**
 * @fileoverview SemanticSurface - Rottay Design System (DS-A004)
 *
 * Engine-agnostic public primitive that renders one governed surface role.
 * Paint lives entirely in
 * `foundation/tokens/css/presentation/components/semantic-surface.css`,
 * keyed on the `data-*` contract stamped here; this component owns no
 * visual values. It is the sanctioned raw-element tier (CodeBlock precedent):
 * a single implementation, no per-engine siblings.
 */
'use client';

import React, { forwardRef } from 'react';

import {
  SEMANTIC_SURFACE_DEFAULTS,
  type SemanticSurfaceProps,
  type SemanticSurfaceSupportProps,
} from './contracts';

export const SemanticSurface = forwardRef<HTMLElement, SemanticSurfaceProps>(
  (props, ref) => {
    const {
      surfaceRole,
      interactive = SEMANTIC_SURFACE_DEFAULTS.interactive,
      selected = SEMANTIC_SURFACE_DEFAULTS.selected,
      disabled = SEMANTIC_SURFACE_DEFAULTS.disabled,
      loading = SEMANTIC_SURFACE_DEFAULTS.loading,
      dragging = SEMANTIC_SURFACE_DEFAULTS.dragging,
      emphasis = SEMANTIC_SURFACE_DEFAULTS.emphasis,
      as = SEMANTIC_SURFACE_DEFAULTS.as,
      type,
      className = '',
      children,
      ...rest
    } = props;

    const Component = as as React.ElementType;
    const isInteractive = interactive && !disabled;
    const isDragging = dragging && !disabled;
    const nativeButtonProps =
      as === 'button'
        ? { type: type ?? 'button', disabled }
        : { 'aria-disabled': disabled || undefined };

    // P-79: the default root part lands BEFORE the `rest` spread so an
    // explicit caller data-part wins; the skin anchors on the class +
    // data-surface-role, never on the part.
    return (
      <Component
        data-part="root"
        {...rest}
        {...nativeButtonProps}
        ref={ref}
        className={`ds-semantic-surface ${className}`.trim()}
        data-surface-role={surfaceRole}
        data-interactive={isInteractive ? 'true' : undefined}
        data-selected={selected ? 'true' : undefined}
        data-disabled={disabled ? 'true' : undefined}
        data-loading={loading ? 'true' : undefined}
        data-dragging={isDragging ? 'true' : undefined}
        data-emphasis={emphasis === 'strong' ? 'strong' : undefined}
        aria-busy={loading || undefined}
      >
        {children}
      </Component>
    );
  }
);

SemanticSurface.displayName = 'SemanticSurface';

export const SemanticSurfaceSupport = forwardRef<
  HTMLSpanElement,
  SemanticSurfaceSupportProps
>(({ className = '', children, ...rest }, ref) => (
  <span
    {...rest}
    ref={ref}
    className={`ds-semantic-surface__support ${className}`.trim()}
    data-part="support"
  >
    {children}
  </span>
));

SemanticSurfaceSupport.displayName = 'SemanticSurfaceSupport';

export { SEMANTIC_SURFACE_DEFAULTS } from './contracts';
export type {
  SemanticSurfaceElement,
  SemanticSurfaceProps,
  SemanticSurfaceSupportProps,
} from './contracts';
