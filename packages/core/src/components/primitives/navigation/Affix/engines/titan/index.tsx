'use client';

/**
 * @fileoverview Affix Titan Engine - Rottay Design System
 * @description Ant Design-based implementation of the Affix component.
 * Leverages Ant Design's native Affix component for full-featured sticky behavior.
 *
 * @remarks
 * The Titan engine provides the most feature-complete implementation of the
 * Affix component, utilizing Ant Design's battle-tested Affix component
 * under the hood. This ensures:
 * - Reliable scroll detection and positioning
 * - Native resize observer support
 * - Optimized performance with built-in throttling
 * - Full target container support
 *
 * @example Titan Engine Usage
 * ```tsx
 * import { Affix } from '@rottay/design-system';
 *
 * // Uses Titan engine by default
 * function StickyHeader() {
 *   return (
 *     <Affix offsetTop={64} onChange={(affixed) => console.log(affixed)}>
 *       <header>Sticky Header</header>
 *     </Affix>
 *   );
 * }
 * ```
 *
 * @example Explicit Titan Engine
 * ```tsx
 * <Affix engine="titan" offsetTop={0}>
 *   <nav>Navigation powered by Ant Design</nav>
 * </Affix>
 * ```
 *
 * @see {@link AffixProps} for component props
 * @see {@link https://ant.design/components/affix} Ant Design Affix documentation
 *
 * @module Affix/Engines/Titan
 * @category Navigation
 * @package @rottay/design-system
 */

import React, { forwardRef, useRef, useImperativeHandle } from 'react';
import { Affix as AntAffix } from 'antd';
import type { AffixProps } from '../../types';
import { AFFIX_DEFAULTS } from '../../types';

// ============================================================================
// Titan Engine Component
// ============================================================================

/**
 * Titan engine implementation using Ant Design's Affix component.
 *
 * @description
 * Provides the most feature-complete implementation with full target and
 * onChange support. Wraps Ant Design's Affix component while maintaining
 * the Rottay Design System's API and styling conventions.
 *
 * @remarks
 * Key features of the Titan implementation:
 * - Native Ant Design Affix integration
 * - Full support for custom scroll containers
 * - Reliable onChange callback with proper boolean handling
 * - CSS variables for theme customization
 * - Consistent class naming with Rottay conventions
 *
 * @param props - {@link AffixProps}
 * @param ref - Forwarded ref to the wrapper div element
 * @returns React element with Ant Design Affix wrapped in Rottay styling
 *
 * @example
 * ```tsx
 * <TitanAffix
 *   offsetTop={80}
 *   target={() => document.getElementById('main-content')}
 *   onChange={(affixed) => setIsSticky(affixed)}
 * >
 *   <aside className="sidebar">Sidebar Content</aside>
 * </TitanAffix>
 * ```
 */
export const TitanAffix = forwardRef<HTMLDivElement, AffixProps>(
  (props, ref) => {
    const {
      offsetTop = AFFIX_DEFAULTS.offsetTop,
      offsetBottom,
      target,
      onChange,
      children,
      className = '',
      style,
      zIndex = AFFIX_DEFAULTS.zIndex,
    } = props;

    // ========================================================================
    // Refs
    // ========================================================================

    const wrapperRef = useRef<HTMLDivElement>(null);

    // Forward ref to wrapper element
    useImperativeHandle(ref, () => wrapperRef.current as HTMLDivElement);

    // ========================================================================
    // Styles
    // ========================================================================

    // Build wrapper styles with CSS variables for theming
    const wrapperStyle: React.CSSProperties = {
      '--affix-z-index': zIndex,
      '--affix-offset-top': `${offsetTop}px`,
      '--affix-offset-bottom': offsetBottom !== undefined ? `${offsetBottom}px` : 'auto',
      ...style,
    } as React.CSSProperties;

    // ========================================================================
    // Render
    // ========================================================================

    return (
      <div
        ref={wrapperRef}
        className={`rottay-affix rottay-affix--titan ${className}`}
        style={wrapperStyle}
      >
        <AntAffix
          offsetTop={offsetBottom === undefined ? offsetTop : undefined}
          offsetBottom={offsetBottom}
          target={target}
          onChange={(affixed) => onChange?.(affixed ?? false)}
          style={{ zIndex }}
        >
          <div className="rottay-affix__content">
            {children}
          </div>
        </AntAffix>
      </div>
    );
  }
);

TitanAffix.displayName = 'Affix.Titan';

export default TitanAffix;
