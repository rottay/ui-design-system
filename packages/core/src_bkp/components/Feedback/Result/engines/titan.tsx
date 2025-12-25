/**
 * Titan Result Engine
 *
 * Adapter that converts unified ResultProps to Ant Design Result.
 */

'use client';

import { Result as AntResult } from 'antd';
import type { ResultProps } from '../../../../types/components/result';

/**
 * Titan Result - Ant Design implementation with unified ResultProps
 */
function TitanResult({
  status,
  title,
  subTitle,
  icon,
  extra,
  children,
  className,
  style,
}: ResultProps) {
  // Note: AntD Result doesn't support 'id' prop, so we omit it
  return (
    <AntResult
      status={status}
      title={title}
      subTitle={subTitle}
      icon={icon}
      extra={extra}
      className={className}
      style={style}
    >
      {children}
    </AntResult>
  );
}

TitanResult.displayName = 'TitanResult';

export default TitanResult;
