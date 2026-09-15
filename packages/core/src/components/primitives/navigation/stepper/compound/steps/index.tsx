'use client';

/**
 * @fileoverview Steps -- the deprecated name of `Stepper` (WO-FAM-05, the D-16 idiom).
 *
 * `Steps` renders the one step-progress family through the `Stepper` facade
 * and maps its legacy props; it has no engine, skin or token namespace of its
 * own.
 *
 * @deprecated since 2026-09-15: import `Stepper`. `size` `'small' | 'default'`
 * becomes `'sm' | 'md'`, `onChange` alone makes the steps clickable, `initial`
 * becomes `defaultCurrent`, the render-function `progressDot` receives
 * `(dot, info)`, and `type` is dropped.
 *
 * @module Steps
 * @category Navigation
 */

import React, { forwardRef } from 'react';

import type { StepsProps } from '../../contracts';
import { Stepper } from '../..';

export const Steps = forwardRef<HTMLElement, StepsProps>(
  ({ size = 'default', onChange, initial, type: _type, progressDot, ...rest }, ref) => (
    <Stepper
      {...rest}
      ref={ref as never}
      size={size === 'small' ? 'sm' : 'md'}
      clickable={Boolean(onChange)}
      onChange={onChange}
      defaultCurrent={initial}
      progressDot={typeof progressDot === 'function' ? (_dot, info) => progressDot(info) : progressDot}
    />
  ),
);

Steps.displayName = 'Steps';
