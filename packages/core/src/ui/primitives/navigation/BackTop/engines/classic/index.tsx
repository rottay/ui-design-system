'use client';

/**
 * @fileoverview BackTop Classic Engine - Rottay Design System
 * @description Ant Design implementation of the BackTop component.
 * Provides full-featured back-to-top functionality with Ant Design's FloatButton.BackTop.
 *
 * @remarks
 * The Classic engine leverages Ant Design's FloatButton.BackTop component for:
 * - Smooth scroll animations with configurable duration
 * - Automatic visibility toggling based on scroll position
 * - Enterprise-ready styling out of the box
 * - Seamless integration with Ant Design theme tokens
 *
 * This implementation wraps the Ant Design component while maintaining
 * compatibility with the Rottay Design System's unified API.
 *
 * @example
 * ```tsx
 * import { BackTop } from '@rottay/design-system';
 *
 * // Uses Classic engine by default
 * <BackTop visibilityHeight={300} duration={500} />
 * ```
 *
 * @example Explicit Engine Selection
 * ```tsx
 * <BackTop engine="classic" visibilityHeight={200} />
 * ```
 *
 * @see {@link BackTop} for the main component
 * @see {@link BackTopProps} for prop documentation
 * @see {@link https://ant.design/components/float-button} Ant Design FloatButton docs
 *
 * @module BackTop/Engines/Classic
 * @category Navigation
 * @package @rottay/design-system
 */

import React from 'react';
import { FloatButton } from 'antd';
import type { BackTopProps } from '../../contracts';
import { BACKTOP_DEFAULTS } from '../../contracts';

// ============================================================================
// Component
// ============================================================================

/**
 * Classic (Ant Design) implementation of BackTop.
 *
 * @description
 * Wraps Ant Design's FloatButton.BackTop component with Rottay's
 * unified prop interface. Features include:
 * - Configurable scroll animation duration
 * - Custom visibility threshold
 * - Support for custom scroll containers
 * - Full Ant Design theming support
 *
 * @remarks
 * The duration prop is only supported in the Classic engine as it's
 * an Ant Design-specific feature. Other engines use native smooth scroll.
 *
 * @param props - {@link BackTopProps}
 * @param ref - Forwarded ref to the wrapper div element
 * @returns The BackTop component rendered with Ant Design
 *
 * @example
 * ```tsx
 * <BackTop
 *   engine="classic"
 *   visibilityHeight={200}
 *   duration={300}
 *   onClick={() => console.log('Scrolled to top')}
 * />
 * ```
 */
export const BackTop = React.forwardRef<HTMLDivElement, BackTopProps>(
  (props, ref) => {
    const {
      target,
      visibilityHeight = BACKTOP_DEFAULTS.visibilityHeight,
      onClick,
      duration = BACKTOP_DEFAULTS.duration,
      children,
      className,
      style,
    } = props;

    // ========================================================================
    // Render
    // ========================================================================

    // Wrapper div receives the forwarded ref because Ant Design's
    // FloatButton.BackTop does not support ref forwarding directly.
    // This allows parent components to measure or position the button.
    return (
      <div ref={ref} className={className} style={style}>
        <FloatButton.BackTop
          target={target}
          visibilityHeight={visibilityHeight}
          onClick={onClick}
          duration={duration}
        >
          {children}
        </FloatButton.BackTop>
      </div>
    );
  }
);

BackTop.displayName = 'BackTop.Classic';

export default BackTop;
