/**
 * Titan Divider Engine
 *
 * Adapter that converts unified DividerProps to Ant Design Divider.
 */

'use client';

import { Divider as AntDivider } from 'antd';
import type { DividerProps } from '../../../../types/components/divider';

/**
 * Titan Divider - Ant Design implementation with unified DividerProps
 */
function TitanDivider({
  children,
  className,
  style,
  type = 'horizontal',
  dashed,
  orientation = 'center',
  orientationMargin,
  plain,
}: DividerProps) {
  return (
    <AntDivider
      type={type}
      dashed={dashed}
      orientation={orientation}
      orientationMargin={orientationMargin}
      plain={plain}
      className={className}
      style={style}
    >
      {children}
    </AntDivider>
  );
}

TitanDivider.displayName = 'TitanDivider';

export default TitanDivider;
