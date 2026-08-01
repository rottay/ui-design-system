/**
 * @fileoverview IconFrame - Rottay Design System
 *
 * The canonical framed-icon medallion: headers, cards, rows, metrics and
 * states all repeat the same bounded icon container, and this primitive owns
 * it so no family rebuilds padding/shape/tone locally.
 *
 * It is the sanctioned raw-element tier (SemanticSurface/CodeBlock/ResizeHandle
 * precedent): one implementation with no per-engine siblings, because a
 * medallion's semantics do not vary by engine. Every visual axis — size,
 * shape, variant, tone, states — is painted by the canonical skin in
 * `foundation/tokens/css/presentation/components/icon-frame.css` through the
 * `data-*` attributes stamped here; the TSX fixes no pixels, radii or colors.
 *
 * The frame composes exclusively the governed semantic `Icon`, and it is
 * PRESENTATION ONLY: it never renders a control and forwards no activation
 * events. Icon-only actions are `Button.Icon` — the action primitive that
 * inherits touch floors, focus chrome, busy semantics and tenant personality
 * from `Button`.
 *
 * @example Static semantic medallion
 * ```tsx
 * <IconFrame icon="status.success" label="Completed" tone="success" />
 * ```
 *
 * @example Decorative medallion beside its own text
 * ```tsx
 * <IconFrame icon="data.gauge" decorative variant="outline" />
 * ```
 *
 * @module IconFrame
 * @category Display
 * @package @rottay/design-system
 */
'use client';

import React, { forwardRef } from 'react';

import type { IconSizeToken } from '@/graphics/icons/foundation';
import { Icon } from '@/graphics/icons/presentation/semantic-icon';

import type { IconFrameProps, IconFrameSize } from './contracts';

/** Frame sizes align 1:1 with the canonical icon scale. */
const ICON_SIZE_BY_FRAME_SIZE: Record<IconFrameSize, IconSizeToken> = {
  xs: 'xs',
  sm: 'sm',
  md: 'md',
  lg: 'lg',
  xl: 'xl',
};

export const IconFrame = forwardRef<HTMLSpanElement, IconFrameProps>(function IconFrame(
  props,
  ref
) {
  const {
    icon,
    size = 'md',
    shape = 'rounded',
    variant = 'subtle',
    tone = 'neutral',
    loading = false,
    disabled = false,
    badge,
    iconMirroring,
    className,
    style,
    id,
  } = props;

  const label = props.label;
  const decorativeOnly = props.decorative === true;

  const rootClassName = ['ds-icon-frame', className].filter(Boolean).join(' ');

  return (
    <span
      ref={ref}
      id={id}
      className={rootClassName}
      style={style}
      data-part="root"
      data-size={size}
      data-shape={shape}
      data-variant={variant}
      data-tone={tone}
      data-loading={loading ? 'true' : undefined}
      data-disabled={disabled ? 'true' : undefined}
      data-testid={props['data-testid']}
      role={decorativeOnly ? undefined : 'img'}
      aria-label={decorativeOnly ? undefined : label}
      aria-hidden={decorativeOnly && badge == null ? true : undefined}
      aria-disabled={disabled || undefined}
      aria-busy={loading || undefined}
      aria-describedby={props['aria-describedby']}
    >
      <Icon
        name={icon}
        decorative
        size={ICON_SIZE_BY_FRAME_SIZE[size]}
        mirrored={iconMirroring}
        state={loading ? 'busy' : undefined}
        data-part="icon"
      />
      {badge != null ? <span data-part="badge">{badge}</span> : null}
    </span>
  );
});

IconFrame.displayName = 'IconFrame';

export type {
  IconFrameProps,
  IconFrameShape,
  IconFrameSize,
  IconFrameTone,
  IconFrameVariant,
} from './contracts';
