/**
 * Link - Hermes Engine (DaisyUI)
 */

'use client';

import React from 'react';
import type { LinkProps } from '../../types';
import { LINK_DEFAULTS } from '../../types';

export default function HermesLink(props: LinkProps): React.ReactElement {
  const {
    children,
    href,
    type = LINK_DEFAULTS.type,
    disabled = LINK_DEFAULTS.disabled,
    underline = LINK_DEFAULTS.underline,
    external = LINK_DEFAULTS.external,
    className = '',
    style,
    onClick,
    ...rest
  } = props;

  const typeClassMap: Record<string, string> = {
    default: 'link-info',
    primary: 'link-primary',
    secondary: 'link-secondary',
    success: 'link-success',
    warning: 'link-warning',
    danger: 'link-error',
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

  const linkClasses = [
    'link',
    typeClassMap[type],
    underline ? '' : 'no-underline',
    disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <a
      href={disabled ? undefined : href}
      className={linkClasses}
      onClick={handleClick}
      aria-disabled={disabled}
      style={style}
      {...externalProps}
      {...rest}
    >
      {children}
    </a>
  );
}

HermesLink.displayName = 'HermesLink';
