/**
 * Titan Tag Engine
 *
 * Adapter that converts unified TagProps to Ant Design Tag.
 */

'use client';

import { Tag as AntTag } from 'antd';
import type { TagProps } from '../../../../types/components/tag';

/**
 * Titan Tag - Ant Design implementation with unified TagProps
 */
function TitanTag({
  children,
  className,
  style,
  color,
  closable,
  onClose,
  icon,
  bordered = true,
  closeIcon,
  id,
  'aria-label': ariaLabel,
}: TagProps) {
  return (
    <AntTag
      id={id}
      className={className}
      style={style}
      color={color}
      closable={closable}
      onClose={onClose}
      icon={icon}
      bordered={bordered}
      closeIcon={closeIcon}
      aria-label={ariaLabel}
    >
      {children}
    </AntTag>
  );
}

TitanTag.displayName = 'TitanTag';

export default TitanTag;
