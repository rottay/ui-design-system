'use client';

/**
 * @fileoverview Kbd Modern Engine - Rottay Design System
 * @description DaisyUI/Tailwind implementation of the Kbd component.
 *
 * @module Kbd/Engines/Modern
 * @category Display
 * @package @rottay/design-system
 */

import React from 'react';
import type { KbdProps } from '../Kbd.types';
import { KBD_DEFAULTS } from '../Kbd.types';

const SIZE_CLASSES: Record<string, string> = {
  sm: 'kbd-sm',
  md: '',
  lg: 'kbd-lg',
};

export default function ModernKbd(props: KbdProps): React.ReactElement {
  const {
    children,
    size = KBD_DEFAULTS.size,
    className = '',
    style,
  } = props;

  const sizeClass = SIZE_CLASSES[size] || '';

  return (
    <kbd
      className={`kbd ${sizeClass} font-mono ${className}`}
      style={style}
    >
      {children}
    </kbd>
  );
}

ModernKbd.displayName = 'Kbd.Modern';
