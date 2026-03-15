/**
 * Input.Group - Compound Component
 * Groups inputs with addons together
 */

'use client';

import React from 'react';
import type { CSSProperties } from 'react';
import type { InputGroupProps } from '../../Input.types';

export function InputGroup({
  children,
  size = 'md',
  compact = true,
  className = '',
  style,
}: InputGroupProps): React.ReactElement {
  const groupStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'stretch',
    width: '100%',
    ...style,
  };

  // Clone children to pass down size prop and handle border radius
  const childArray = React.Children.toArray(children);

  const enhancedChildren = childArray.map((child, index) => {
    if (!React.isValidElement<{ style?: CSSProperties; size?: string }>(child)) return child;

    const isFirst = index === 0;
    const isLast = index === childArray.length - 1;

    const childStyle: CSSProperties = {
      ...(child.props.style || {}),
    };

    // Handle border radius for compact mode
    if (compact) {
      if (!isFirst && !isLast) {
        childStyle.borderTopLeftRadius = 0;
        childStyle.borderTopRightRadius = 0;
        childStyle.borderBottomRightRadius = 0;
        childStyle.borderBottomLeftRadius = 0;
      } else if (isFirst && !isLast) {
        childStyle.borderTopRightRadius = 0;
        childStyle.borderBottomRightRadius = 0;
      } else if (isLast && !isFirst) {
        childStyle.borderTopLeftRadius = 0;
        childStyle.borderBottomLeftRadius = 0;
      }

      // Remove left border for non-first items to avoid double borders
      if (!isFirst) {
        childStyle.marginLeft = -1;
      }
    } else {
      // Add gap between items
      if (!isFirst) {
        childStyle.marginLeft = 8;
      }
    }

    return React.cloneElement(child, {
      size: child.props.size || size,
      style: childStyle,
    });
  });

  return (
    <div
      className={`rottay-input-group ${className}`}
      style={groupStyle}
    >
      {enhancedChildren}
    </div>
  );
}

InputGroup.displayName = 'Input.Group';
