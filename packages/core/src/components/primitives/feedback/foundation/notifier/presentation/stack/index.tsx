'use client';

/**
 * @fileoverview The notifier stack - Rottay Design System.
 *
 * The viewport column announcements of one role gather in. It carries the
 * overlay band and the caller's edge offset and gap as runtime channels; the
 * modern notifier skin places it on its logical edge and orders its surfaces.
 *
 * @module Notifier/Presentation/Stack
 * @category Feedback
 * @package @rottay/design-system
 */

import React, { forwardRef } from 'react';
import type { NotifierStackProps } from '../../contracts';

type StackElementProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'role' | 'style' | 'className'>;

// P-88: the stack stamps its own part ('stack') after the spread; a caller
// data-state is never forwarded (callers compose through className).
type CallerState = { 'data-state'?: string };

export const NotifierStack = forwardRef<HTMLDivElement, NotifierStackProps & StackElementProps & CallerState & { liveRole?: 'log' | 'region' }>(
  function NotifierStack({ role, placement, layer, offset, gap, children, className, style, liveRole, 'data-state': _callerDataState, ...rest }, ref) {
    const channels = {
      '--ds-notifier-layer': layer,
      ...(offset === undefined ? null : { '--ds-notifier-stack-offset': `${offset}px` }),
      ...(gap === undefined ? null : { '--ds-notifier-stack-gap': `${gap}px` }),
      ...style,
    } as React.CSSProperties;
    return (
      <div
        ref={ref}
        {...rest}
        role={liveRole}
        data-part="stack"
        data-variant={role}
        data-placement={placement}
        className={`ds-notifier-stack ${className ?? ''}`.trim()}
        style={channels}
      >
        {children}
      </div>
    );
  },
);
