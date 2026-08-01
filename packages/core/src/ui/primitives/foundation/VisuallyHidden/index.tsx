import React, { forwardRef } from 'react';
import type { VisuallyHiddenProps } from './contracts';

/**
 * VisuallyHidden — engine-independent screen-reader-only primitive.
 *
 * @description Renders children inside the canonical `.ds-visually-hidden`
 * rule (single CSS owner in
 * `foundation/tokens/css/presentation/components/visually-hidden.css`).
 * Use it for accessible names on icon-only controls, sr-only landing hooks
 * and live-region announcements. Static content stays clipped permanently;
 * interactive content is only legal behind `focusable`, which reveals the
 * subtree while it (or a descendant) holds keyboard focus — the skip-link
 * pattern.
 *
 * @example
 * ```tsx
 * <VisuallyHidden>Opens in a new tab</VisuallyHidden>
 * <VisuallyHidden role="status" aria-live="polite">{message}</VisuallyHidden>
 * <VisuallyHidden focusable as="div">
 *   <a href="#main">Skip to content</a>
 * </VisuallyHidden>
 * ```
 */
export const VisuallyHidden = forwardRef<HTMLElement, VisuallyHiddenProps>(
  function VisuallyHidden({ as: Tag = 'span', focusable = false, className, children, ...rest }, ref) {
    const classes = [
      'ds-visually-hidden',
      focusable ? 'ds-visually-hidden--focusable' : undefined,
      className,
    ]
      .filter(Boolean)
      .join(' ');
    return (
      <Tag ref={ref as React.Ref<never>} className={classes} {...rest}>
        {children}
      </Tag>
    );
  }
);

VisuallyHidden.displayName = 'VisuallyHidden';

export type { VisuallyHiddenProps } from './contracts';
