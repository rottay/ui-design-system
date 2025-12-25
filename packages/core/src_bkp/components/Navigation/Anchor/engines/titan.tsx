'use client';

/**
 * Titan Anchor Engine
 *
 * Ant Design implementation with unified AnchorProps.
 */

import { Anchor as AntAnchor } from 'antd';
import type { AnchorProps } from '../../../../types/components/anchor';

/**
 * Titan Anchor - Ant Design implementation
 */
function TitanAnchor({
  items,
  className,
  style,
  onChange,
  onClick,
  affix = true,
  offsetTop,
  targetOffset,
  bounds,
  showInkInFixed,
  getCurrentAnchor,
  direction = 'vertical',
  replace,
  getContainer,
  children,
}: AnchorProps) {
  return (
    <AntAnchor
      items={items}
      className={className}
      style={style}
      onChange={onChange}
      onClick={onClick}
      affix={affix}
      offsetTop={offsetTop}
      targetOffset={targetOffset}
      bounds={bounds}
      showInkInFixed={showInkInFixed}
      getCurrentAnchor={getCurrentAnchor}
      direction={direction}
      replace={replace}
      getContainer={getContainer}
    >
      {children}
    </AntAnchor>
  );
}

TitanAnchor.displayName = 'TitanAnchor';

export default TitanAnchor;
