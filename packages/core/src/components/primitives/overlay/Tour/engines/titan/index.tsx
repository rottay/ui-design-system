'use client';

/**
 * Tour - Titan Engine (Ant Design)
 */
import React from 'react';
import { Tour as AntTour } from 'antd';
import type { TourProps } from '../../types';

export const Tour = React.forwardRef<HTMLDivElement, TourProps>(
  (props, ref) => {
    const {
      steps,
      current,
      open,
      onChange,
      onClose,
      onFinish,
      type,
      mask,
      arrow,
      placement,
      zIndex,
      gap,
      indicatorsRender,
      closeIcon,
      className,
    } = props;

    // Map steps to Ant Design format
    const antSteps = steps.map((step) => ({
      ...step,
      target: typeof step.target === 'string'
        ? () => document.querySelector(step.target as string)
        : typeof step.target === 'function'
        ? step.target
        : (step.target && typeof step.target === 'object' && 'current' in step.target)
        ? () => (step.target as React.RefObject<HTMLElement>).current
        : undefined,
    }));

    return (
      <div ref={ref} className={className}>
        <AntTour
          steps={antSteps as any}
          current={current}
          open={open}
          onChange={onChange}
          onClose={onClose}
          onFinish={onFinish}
          type={type}
          mask={mask}
          arrow={arrow}
          placement={placement}
          zIndex={zIndex}
          gap={gap}
          indicatorsRender={indicatorsRender}
          closeIcon={closeIcon}
        />
      </div>
    );
  }
);

Tour.displayName = 'Tour.Titan';

export default Tour;
