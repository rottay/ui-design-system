'use client';

/**
 * Titan BackTop Engine
 *
 * Ant Design implementation with unified BackTopProps.
 */

import { FloatButton } from 'antd';
import type { BackTopProps } from '../../../../types/components/backtop';

/**
 * Titan BackTop - Ant Design implementation using FloatButton.BackTop
 */
function TitanBackTop({
  children,
  className,
  style,
  onClick,
  visibilityHeight = 400,
  target,
  duration,
}: BackTopProps) {
  return (
    <FloatButton.BackTop
      className={className}
      style={style}
      onClick={onClick}
      visibilityHeight={visibilityHeight}
      target={target}
      duration={duration}
    >
      {children}
    </FloatButton.BackTop>
  );
}

TitanBackTop.displayName = 'TitanBackTop';

export default TitanBackTop;
