'use client';

/**
 * @fileoverview Tour Titan Engine - Rottay Design System
 * @description Titan (Ant Design) implementation of the Tour component.
 * Wraps Ant Design's Tour with full feature parity and target resolution.
 *
 * @remarks
 * The Titan engine provides:
 * - Native Ant Design Tour styling and animations
 * - Automatic target element resolution from selectors/refs/functions
 * - Built-in spotlight mask with customizable styling
 * - Full step navigation with indicators
 * - Custom close icon support
 *
 * Implementation details:
 * - Maps target props to Ant Design's expected function format
 * - CSS selectors converted to () => document.querySelector()
 * - React refs converted to () => ref.current
 * - Getter functions passed through directly
 *
 * @example Using Titan Engine
 * ```tsx
 * import { Tour, Button } from '@rottay/design-system';
 *
 * const steps = [
 *   { target: '#intro', title: 'Welcome', description: 'Get started' },
 *   { target: buttonRef, title: 'Action', description: 'Click here' },
 * ];
 *
 * <Tour
 *   engine="titan"
 *   steps={steps}
 *   open={isOpen}
 *   type="primary"
 *   mask={{ color: 'rgba(0,0,0,0.6)' }}
 *   onFinish={() => markTourComplete()}
 * />
 * ```
 *
 * @see {@link Tour} - The main engine-aware component
 * @see {@link https://ant.design/components/tour} - Ant Design Tour docs
 * @module Tour/Engines/Titan
 * @category Overlay
 * @package @rottay/design-system
 */
import React from 'react';
import { Tour as AntTour } from 'antd';
import type { TourProps } from '../../types';

/**
 * Titan engine implementation of Tour using Ant Design.
 *
 * Features:
 * - Full Ant Design Tour feature support
 * - Automatic target element resolution
 * - Built-in spotlight and mask effects
 *
 * @component
 * @example
 * ```tsx
 * <Tour steps={steps} open={isOpen} engine="titan" />
 * ```
 *
 * @param props - Tour configuration props
 * @param ref - Forwarded ref to the container div
 * @returns Guided tour using Ant Design
 */
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
