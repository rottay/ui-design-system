/**
 * Box - Apollo Engine (Pure HTML/CSS)
 * Provides Box component using vanilla HTML and CSS
 */

'use client';

import React, { forwardRef, type ElementType, type Ref } from 'react';
import type { BoxProps } from '../../types';
import { BOX_DEFAULTS } from '../../types';
import { buildBoxStyles, filterBoxProps } from '../../base';

/**
 * Apollo Box component.
 * Uses pure HTML and inline CSS styles for maximum compatibility
 * and accessibility without external dependencies.
 */
const ApolloBox = forwardRef<HTMLElement, BoxProps>((props, ref) => {
  const {
    as: Component = BOX_DEFAULTS.as,
    className = '',
    children,
  } = props;

  const computedStyle = buildBoxStyles(props);
  const filteredProps = filterBoxProps(props);

  // Build class names with Apollo-specific prefixes
  const classNames = [
    'rottay-box',
    'rottay-box--apollo',
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

ApolloBox.displayName = 'ApolloBox';

export default ApolloBox;
