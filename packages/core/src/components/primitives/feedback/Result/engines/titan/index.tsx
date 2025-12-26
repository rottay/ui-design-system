'use client';

/**
 * Result - Titan Engine (Ant Design)
 */
import React from 'react';
import { Result as AntResult } from 'antd';
import type { ResultProps, ResultStatus } from '../../types';
import { RESULT_DEFAULTS } from '../../types';

// Map our status to Ant Design status
const statusMap: Record<ResultStatus, 'success' | 'error' | 'info' | 'warning' | '404' | '403' | '500'> = {
  success: 'success',
  error: 'error',
  info: 'info',
  warning: 'warning',
  '404': '404',
  '403': '403',
  '500': '500',
};

export const Result = React.forwardRef<HTMLDivElement, ResultProps>(
  (props, ref) => {
    const {
      status = RESULT_DEFAULTS.status,
      icon,
      title,
      subTitle,
      extra,
      children,
      className,
      style,
    } = props;

    return (
      <div ref={ref} className={className} style={style}>
        <AntResult
          status={statusMap[status!]}
          icon={icon}
          title={title}
          subTitle={subTitle}
          extra={extra}
        >
          {children}
        </AntResult>
      </div>
    );
  }
);

Result.displayName = 'Result.Titan';

export default Result;
