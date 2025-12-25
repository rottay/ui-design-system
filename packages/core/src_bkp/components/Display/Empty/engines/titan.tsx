/**
 * Titan Empty Engine
 *
 * Adapter that converts unified EmptyProps to Ant Design Empty.
 */

'use client';

import { Empty as AntEmpty } from 'antd';
import type { EmptyProps } from '../../../../types/components/empty';

/**
 * Titan Empty - Ant Design implementation with unified EmptyProps
 */
function TitanEmpty({
  image,
  imageStyle,
  description,
  children,
  className,
  style,
}: EmptyProps) {
  return (
    <AntEmpty
      image={image}
      imageStyle={imageStyle}
      description={description}
      className={className}
      style={style}
    >
      {children}
    </AntEmpty>
  );
}

TitanEmpty.displayName = 'TitanEmpty';

export default TitanEmpty;
