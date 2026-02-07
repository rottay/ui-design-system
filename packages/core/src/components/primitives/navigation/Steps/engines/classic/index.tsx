'use client';

/**
 * @fileoverview Steps Classic Engine - Rottay Design System
 * @description Ant Design implementation of the Steps component.
 * Leverages Ant Design's mature Steps component for full-featured
 * step navigation with animations and accessibility.
 *
 * @remarks
 * The Classic engine wraps Ant Design's Steps component, providing:
 * - Rich animations and transitions
 * - Full accessibility support (ARIA)
 * - All step types (default, navigation, inline)
 * - Progress percentage indicator
 * - Responsive behavior
 *
 * This implementation maps Rottay's unified props interface to
 * Ant Design's Steps API, ensuring consistent behavior across engines.
 *
 * @example
 * ```tsx
 * // Classic engine is used by default or can be explicitly set
 * <Steps
 *   engine="classic"
 *   items={[
 *     { title: 'Step 1', description: 'First step' },
 *     { title: 'Step 2', description: 'Second step' },
 *   ]}
 *   current={0}
 * />
 * ```
 *
 * @see {@link StepsProps} for prop documentation
 * @see {@link https://ant.design/components/steps} for Ant Design Steps docs
 *
 * @module Steps/Engines/Classic
 * @category Navigation
 * @package @rottay/design-system
 */

import React from 'react';
import { Steps as AntSteps } from 'antd';
import type { StepsProps } from '../../types';
import { STEPS_DEFAULTS } from '../../types';

// ============================================================================
// Classic Engine Component
// ============================================================================

/**
 * Steps component - Classic Engine (Ant Design)
 *
 * @description
 * Full-featured implementation using Ant Design's Steps component.
 * Provides the richest feature set including all step types,
 * progress indicators, and smooth animations.
 *
 * @remarks
 * Features supported:
 * - All direction modes (horizontal, vertical)
 * - All types (default, navigation, inline)
 * - Progress percentage within current step
 * - Custom progress dot rendering
 * - Responsive layout adaptation
 * - Full keyboard navigation
 *
 * @param props - {@link StepsProps}
 * @returns Steps component rendered with Ant Design
 */
export const Steps = React.forwardRef<HTMLDivElement, StepsProps>(
  (props, ref) => {
    // ========================================================================
    // Props Destructuring with Defaults
    // ========================================================================

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

    // ========================================================================
    // Progress Dot Adapter
    // ========================================================================

    /**
     * Adapts the Rottay progressDot function signature to Ant Design's format.
     * Ant Design passes different parameters than our unified interface.
     */
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

    // ========================================================================
    // Render
    // ========================================================================

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

// ============================================================================
// Display Name
// ============================================================================

Steps.displayName = 'Steps.Classic';

export default Steps;
