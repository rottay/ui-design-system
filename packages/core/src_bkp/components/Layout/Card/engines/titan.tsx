/**
 * Titan Card Engine
 *
 * Adapter that converts unified CardProps to Ant Design Card.
 * Maps unified props to AntD-specific props.
 */

'use client';

import { Card as AntCard } from 'antd';
import type { CardProps } from '../../../../types/components/card';

/**
 * Titan Card - Ant Design implementation with unified CardProps
 */
function TitanCard({
  title,
  children,
  className,
  onClick,
  extra,
  cover,
  bordered = true,
  hoverable,
  loading,
  size = 'medium',
  bodyStyle,
}: CardProps) {
  // Map unified size to AntD size
  const antSize = size === 'small' ? 'small' : 'default';

  return (
    <AntCard
      title={title}
      className={className}
      onClick={onClick}
      extra={extra}
      cover={cover}
      bordered={bordered}
      hoverable={hoverable}
      loading={loading}
      size={antSize}
      bodyStyle={bodyStyle}
    >
      {children}
    </AntCard>
  );
}

// Attach subcomponents from AntD for backward compatibility
TitanCard.Grid = AntCard.Grid;
TitanCard.Meta = AntCard.Meta;

TitanCard.displayName = 'TitanCard';

export default TitanCard;
