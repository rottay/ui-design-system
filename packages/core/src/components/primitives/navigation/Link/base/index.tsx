'use client';

import React, { forwardRef } from 'react';
import type { LinkProps } from '../types';
import { LINK_DEFAULTS, LINK_TYPE_COLORS } from '../types';


export const BaseLink = forwardRef<HTMLAnchorElement, LinkProps>(
  (props, ref) => {
    const {
      children,
      href,
      type = LINK_DEFAULTS.type,
      disabled = LINK_DEFAULTS.disabled,
      underline = LINK_DEFAULTS.underline,
      external = LINK_DEFAULTS.external,
      className = '',
      style = {},
      onClick,
      ...rest
    } = props;

    const colors = LINK_TYPE_COLORS[type];

    const linkStyle: React.CSSProperties = {
      color: disabled ? '#00000040' : colors.color,
      textDecoration: underline ? 'underline' : 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'color 0.2s ease-in-out',
      ...style,
    };

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (disabled) {
        e.preventDefault();
        return;
      }
      onClick?.(e);
    };

    const externalProps = external
      ? { target: '_blank', rel: 'noopener noreferrer' }
      : {};

    return (
      <a
        ref={ref}
        href={disabled ? undefined : href}
        className={`rottay-link rottay-link--${type} ${disabled ? 'rottay-link--disabled' : ''} ${className}`}
        style={linkStyle}
        onClick={handleClick}
        aria-disabled={disabled}
        {...externalProps}
        {...rest}
      >
        {children}
      </a>
    );
  }
);

BaseLink.displayName = 'BaseLink';
