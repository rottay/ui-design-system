/**
 * Box - Hermes Engine (DaisyUI)
 */

import React from 'react';
import type { BoxProps } from '../types';
import { BOX_DEFAULTS, SPACING_MAP, RADIUS_MAP } from '../types';

export default function HermesBox(props: BoxProps): React.ReactElement {
  const {
    as: Component = BOX_DEFAULTS.as!,
    children,
    padding = BOX_DEFAULTS.padding,
    margin = BOX_DEFAULTS.margin,
    display,
    position,
    width,
    height,
    background,
    borderRadius,
    className = '',
    style,
  } = props;

  const combinedStyle: React.CSSProperties = {
    padding: SPACING_MAP[padding!],
    margin: SPACING_MAP[margin!],
    display,
    position,
    width,
    height,
    background,
    borderRadius: borderRadius ? RADIUS_MAP[borderRadius] : undefined,
    ...style,
  };

  return React.createElement(Component, { className, style: combinedStyle }, children);
}
