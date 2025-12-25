/**
 * Badge - Titan Engine (Ant Design)
 */

import React from 'react';
import { Badge as AntBadge } from 'antd';
import type { BadgeProps } from '../types';
import { BADGE_DEFAULTS, VARIANT_COLOR_MAP } from '../types';

export default function TitanBadge(props: BadgeProps): React.ReactElement {
  const {
    children,
    count,
    dot,
    variant = BADGE_DEFAULTS.variant,
    size = BADGE_DEFAULTS.size,
    showZero = BADGE_DEFAULTS.showZero,
    maxCount = BADGE_DEFAULTS.maxCount,
    className,
    style,
  } = props;

  const color = VARIANT_COLOR_MAP[variant!];
  const badgeSize = size === 'sm' ? 'small' : size === 'lg' ? 'default' : 'default';

  return (
    <AntBadge
      count={count}
      dot={dot}
      color={color}
      size={badgeSize}
      showZero={showZero}
      overflowCount={maxCount}
      className={className}
      style={style}
    >
      {children}
    </AntBadge>
  );
}
