/**
 * Link - Titan Engine (Ant Design)
 */

'use client';

import React from 'react';
import { Typography } from 'antd';
import type { LinkProps } from '../../types';
import { LINK_DEFAULTS } from '../../types';

const { Link: AntLink } = Typography;

export default function TitanLink(props: LinkProps): React.ReactElement {
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

  const typeColorMap: Record<string, string> = {
    default: '#1890ff',
    primary: '#1677ff',
    secondary: '#722ed1',
    success: '#52c41a',
    warning: '#faad14',
    danger: '#ff4d4f',
  };

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    onClick?.(e as any);
  };

  const externalProps = external
    ? { target: '_blank', rel: 'noopener noreferrer' }
    : {};

  return (
    <AntLink
      href={disabled ? undefined : href}
      disabled={disabled}
      underline={underline}
      onClick={handleClick}
      className={className}
      style={{
        color: disabled ? undefined : typeColorMap[type],
        ...style,
      }}
      {...externalProps}
      {...rest}
    >
      {children}
    </AntLink>
  );
}

TitanLink.displayName = 'TitanLink';
