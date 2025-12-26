'use client';

/**
 * Steps - Titan Engine (Ant Design)
 */
import React from 'react';
import { Steps as AntSteps } from 'antd';
import type { StepsProps } from '../../types';
import { STEPS_DEFAULTS } from '../../types';

export const Steps = React.forwardRef<HTMLDivElement, StepsProps>(
  (props, ref) => {
    const {
      current = STEPS_DEFAULTS.current,
      direction = STEPS_DEFAULTS.direction,
      initial = STEPS_DEFAULTS.initial,
      labelPlacement = STEPS_DEFAULTS.labelPlacement,
      percent,
      progressDot,
      responsive = STEPS_DEFAULTS.responsive,
      size = STEPS_DEFAULTS.size,
      status = STEPS_DEFAULTS.status,
      type = STEPS_DEFAULTS.type,
      onChange,
      items,
      className,
      style,
    } = props;

    const antProgressDot = typeof progressDot === 'function'
      ? (_iconDot: React.ReactNode, { index, status: stepStatus, title, description }: {
          index: number;
          status: string;
          title: React.ReactNode;
          description: React.ReactNode;
        }) => progressDot({
          index,
          status: stepStatus as 'wait' | 'process' | 'finish' | 'error',
          title,
          description
        })
      : progressDot;

    return (
      <div ref={ref} className={className} style={style}>
        <AntSteps
          current={current}
          direction={direction}
          initial={initial}
          labelPlacement={labelPlacement}
          percent={percent}
          progressDot={antProgressDot}
          responsive={responsive}
          size={size}
          status={status}
          type={type}
          onChange={onChange}
          items={items.map((item) => ({
            title: item.title,
            subTitle: item.subTitle,
            description: item.description,
            icon: item.icon,
            status: item.status,
            disabled: item.disabled,
          }))}
        />
      </div>
    );
  }
);

Steps.displayName = 'Steps.Titan';

export default Steps;
