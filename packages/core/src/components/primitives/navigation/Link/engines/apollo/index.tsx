/**
 * Link - Apollo Engine (Pure HTML/CSS)
 */

'use client';

import React from 'react';
import type { LinkProps } from '../../types';
import { LINK_DEFAULTS, LINK_TYPE_COLORS } from '../../types';

export default function ApolloLink(props: LinkProps): React.ReactElement {
  const {
    children,
    href,
    type = LINK_DEFAULTS.type,
    disabled = LINK_DEFAULTS.disabled,
    underline = LINK_DEFAULTS.underline,
    external = LINK_DEFAULTS.external,
    className,
    style,
    onClick,
    ...rest
  } = props;

  const colors = LINK_TYPE_COLORS[type];

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

  const linkStyle: React.CSSProperties = {
    color: disabled ? '#00000040' : colors.color,
    textDecoration: underline ? 'underline' : 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'color 0.2s ease-in-out',
    ...style,
  };

  return (
    <a
      href={disabled ? undefined : href}
      className={className}
      onClick={handleClick}
      aria-disabled={disabled}
      style={linkStyle}
      {...externalProps}
      {...rest}
    >
      {children}
    </a>
  );
}

ApolloLink.displayName = 'ApolloLink';
