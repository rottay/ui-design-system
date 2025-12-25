/**
 * Titan Spin Engine
 *
 * Adapter that converts unified SpinProps to Ant Design Spin.
 */

'use client';

import { Spin as AntSpin } from 'antd';
import type { SpinProps } from '../../../../types/components/spin';

/**
 * Titan Spin - Ant Design implementation with unified SpinProps
 */
function TitanSpin({
  spinning = true,
  size = 'default',
  tip,
  delay,
  indicator,
  children,
  className,
  style,
  fullscreen,
  wrapperClassName,
}: SpinProps) {
  return (
    <AntSpin
      spinning={spinning}
      size={size}
      tip={tip}
      delay={delay}
      indicator={indicator}
      className={className}
      style={style}
      fullscreen={fullscreen}
      wrapperClassName={wrapperClassName}
    >
      {children}
    </AntSpin>
  );
}

TitanSpin.displayName = 'TitanSpin';

export default TitanSpin;
