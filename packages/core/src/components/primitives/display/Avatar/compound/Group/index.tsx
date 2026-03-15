/**
 * Avatar.Group - Compound Component
 * Displays multiple avatars in a group with overlap
 */

'use client';

import React from 'react';
import type { ReactNode, CSSProperties } from 'react';

export interface AvatarGroupProps {
  children: ReactNode;
  max?: number;
  maxStyle?: CSSProperties;
  className?: string;
  style?: CSSProperties;
}

export function AvatarGroup({
  children,
  max,
  maxStyle,
  className = '',
  style,
}: AvatarGroupProps): React.ReactElement {
  const childArray = React.Children.toArray(children);
  const displayChildren = max ? childArray.slice(0, max) : childArray;
  const surplus = max && childArray.length > max ? childArray.length - max : 0;

  const groupStyle: CSSProperties = {
    display: 'inline-flex',
    flexDirection: 'row-reverse',
    ...style,
  };

  const childStyle: CSSProperties = {
    marginLeft: '-8px',
    border: '2px solid var(--ds-avatar-group-border, var(--ds-color-bg-base))',
  };

  const surplusStyle: CSSProperties = {
    ...childStyle,
    backgroundColor: 'var(--ds-avatar-surplus-bg, var(--ds-color-bg-secondary))',
    color: 'var(--ds-avatar-surplus-color, var(--ds-color-text-secondary))',
    ...maxStyle,
  };

  return (
    <div className={`rottay-avatar-group ${className}`} style={groupStyle}>
      {surplus > 0 && (
        <div
          className="rottay-avatar-surplus"
          style={surplusStyle}
          title={`+${surplus} more`}
        >
          +{surplus}
        </div>
      )}
      {displayChildren.map((child, index) => (
        <div key={index} style={childStyle}>
          {child}
        </div>
      ))}
    </div>
  );
}

AvatarGroup.displayName = 'Avatar.Group';
