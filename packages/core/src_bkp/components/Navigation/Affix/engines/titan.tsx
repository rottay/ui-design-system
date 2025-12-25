'use client';

/**
 * Titan Affix Engine
 *
 * Ant Design implementation with unified AffixProps.
 */

import { Affix as AntAffix } from 'antd';
import type { AffixProps } from '../../../../types/components/affix';

/**
 * Titan Affix - Ant Design implementation
 */
function TitanAffix({
  children,
  offsetTop,
  offsetBottom,
  className,
  style,
  onChange,
  target,
  zIndex,
}: AffixProps) {
  return (
    <AntAffix
      offsetTop={offsetTop}
      offsetBottom={offsetBottom}
      className={className}
      style={{ ...style, ...(zIndex !== undefined && { zIndex }) }}
      onChange={onChange}
      target={target}
    >
      {children}
    </AntAffix>
  );
}

TitanAffix.displayName = 'TitanAffix';

export default TitanAffix;
