'use client';

/**
 * @fileoverview Affix Classic Engine - Rottay Design System
 * @description Ant Design-based implementation of the Affix component.
 * Leverages Ant Design's native Affix component for full-featured sticky behavior.
 *
 * @remarks
 * The Classic engine provides the most feature-complete implementation of the
 * Affix component, utilizing Ant Design's battle-tested Affix component
 * under the hood. This ensures:
 * - Reliable scroll detection and positioning
 * - Native resize observer support
 * - Optimized performance with built-in throttling
 * - Full target container support
 *
 * @example Classic Engine Usage
 * ```tsx
 * import { Affix } from '@rottay/design-system';
 *
 * // Uses Classic engine by default
 * function StickyHeader() {
 *   return (
 *     <Affix offsetTop={64} onChange={(affixed) => console.log(affixed)}>
 *       <header>Sticky Header</header>
 *     </Affix>
 *   );
 * }
 * ```
 *
 * @example Explicit Classic Engine
 * ```tsx
 * <Affix engine="classic" offsetTop={0}>
 *   <nav>Navigation powered by Ant Design</nav>
 * </Affix>
 * ```
 *
 * @see {@link AffixProps} for component props
 * @see {@link https://ant.design/components/affix} Ant Design Affix documentation
 *
 * @module Affix/Engines/Classic
 * @category Navigation
 * @package @rottay/design-system
 */

import React, { forwardRef, useRef, useImperativeHandle } from 'react';
import { Affix as AntAffix } from 'antd';
import type { AffixProps } from '../Affix.types';
import { AFFIX_DEFAULTS } from '../Affix.types';

// ============================================================================
// Classic Engine Component
// ============================================================================

/**
 * Classic engine implementation using Ant Design's Affix component.
 *
 * @description
 * Provides the most feature-complete implementation with full target and
 * onChange support. Wraps Ant Design's Affix component while maintaining
 * the Rottay Design System's API and styling conventions.
 *
 * @remarks
 * Key features of the Classic implementation:
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
 * <ClassicAffix
 *   offsetTop={80}
 *   target={() => document.getElementById('main-content')}
 *   onChange={(affixed) => setIsSticky(affixed)}
 * >
 *   <aside className="sidebar">Sidebar Content</aside>
 * </ClassicAffix>
 * ```
 */
export const ClassicAffix = forwardRef<HTMLDivElement, AffixProps>(
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

    // Expose offset values as CSS variables so tenant themes can read them
    // without needing JavaScript access (e.g. for coordinating layout shifts)
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
        className={`rottay-affix rottay-affix--classic ${className}`}
        style={wrapperStyle}
      >
        {/* AntAffix only accepts one offset direction at a time; passing both
            causes conflicting positioning. We prioritize offsetBottom when set,
            since bottom-affixed elements are less common and thus more intentional.
            Ant Design may pass undefined to onChange; we coerce to boolean for a
            stable consumer API. */}
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

ClassicAffix.displayName = 'Affix.Classic';

export default ClassicAffix;
