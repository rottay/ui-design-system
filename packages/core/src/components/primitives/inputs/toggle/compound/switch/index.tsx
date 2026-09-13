'use client';

/**
 * @fileoverview Switch -- the deprecated name of `Toggle` (D-16).
 *
 * `Switch` renders the one binary switch family through the `Toggle` facade and
 * maps its legacy props; it has no engine, skin or token namespace of its own.
 *
 * @deprecated since 2026-09-12 (D-16): import `Toggle`. `checkedChildren` and
 * `unCheckedChildren` become `checkedLabel` and `uncheckedLabel`; sizes keep
 * their canonical `sm | md | lg` spelling.
 *
 * @module Switch
 * @category Inputs
 */

import React, { forwardRef } from 'react';

import type { SwitchProps, ToggleSize } from '../../contracts';
import { Toggle } from '../..';

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ size = 'default', checkedChildren, unCheckedChildren, onChange, onClick, ...rest }, ref) => (
    <Toggle
      {...rest}
      ref={ref as never}
      size={size as ToggleSize}
      checkedLabel={checkedChildren}
      uncheckedLabel={unCheckedChildren}
      onChange={
        onChange || onClick
          ? (checked, event) => {
              onClick?.(checked, event as unknown as React.MouseEvent);
              onChange?.(checked);
            }
          : undefined
      }
    />
  ),
);

Switch.displayName = 'Switch';
