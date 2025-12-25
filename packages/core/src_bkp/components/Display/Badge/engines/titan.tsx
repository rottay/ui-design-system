/**
 * Titan Badge Engine
 *
 * Adapter that converts unified BadgeProps to Ant Design Badge.
 */

'use client';

import { Badge as AntBadge } from 'antd';
import type { BadgeProps } from '../../../../types/components/badge';

/**
 * Titan Badge - Ant Design implementation with unified BadgeProps
 */
function TitanBadge({
  children,
  text,
  className,
  style,
  color,
  status,
  count,
  showZero,
  overflowCount,
  dot,
  size,
  offset,
  title,
}: BadgeProps) {
  return (
    <AntBadge
      count={count}
      showZero={showZero}
      overflowCount={overflowCount}
      dot={dot}
      status={status}
      color={color}
      text={text}
      size={size}
      offset={offset}
      title={title}
      className={className}
      style={style}
    >
      {children}
    </AntBadge>
  );
}

TitanBadge.displayName = 'TitanBadge';

export default TitanBadge;
