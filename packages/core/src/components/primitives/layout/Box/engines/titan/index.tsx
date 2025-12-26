/**
 * Box - Titan Engine (Ant Design)
 * Provides Box component using Ant Design styling conventions
 */

'use client';

import React, { forwardRef, type ElementType, type Ref } from 'react';
import type { BoxProps } from '../../types';
import { BOX_DEFAULTS } from '../../types';
import { buildBoxStyles, filterBoxProps } from '../../base';

/**
 * Titan Box component.
 * Uses Ant Design's styling conventions while maintaining
 * compatibility with the Box API.
 */
const TitanBox = forwardRef<HTMLElement, BoxProps>((props, ref) => {
  const {
    as: Component = BOX_DEFAULTS.as,
    className = '',
    children,
  } = props;

  const computedStyle = buildBoxStyles(props);
  const filteredProps = filterBoxProps(props);

  // Build class names with Titan-specific prefixes
  const classNames = [
    'rottay-box',
    'rottay-box--titan',
    className,
  ].filter(Boolean).join(' ');

  const ElementType = Component as ElementType;

  return React.createElement(
    ElementType,
    {
      ref: ref as Ref<HTMLElement>,
      className: classNames,
      style: computedStyle,
      ...filteredProps,
    },
    children
  );
});

TitanBox.displayName = 'TitanBox';

export default TitanBox;
