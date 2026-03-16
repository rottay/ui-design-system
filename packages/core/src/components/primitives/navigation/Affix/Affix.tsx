'use client';

/**
 * @fileoverview Affix -- sticky positioning component that fixes elements to the
 * viewport on scroll, with top/bottom offset and custom scroll container support.
 *
 * @example
 * ```tsx
 * import { Affix } from '@rottay/design-system';
 *
 * // Sticky header with state callback
 * <Affix offsetTop={0} onChange={(affixed) => console.log(affixed)}>
 *   <nav>Navigation Menu</nav>
 * </Affix>
 *
 * // Sticky footer
 * <Affix offsetBottom={0}>
 *   <footer>Fixed Footer</footer>
 * </Affix>
 * ```
 *
 * @module Affix
 * @category Navigation
 */

import { createEngineComponent } from '../../../../engines/factory';
import type { AffixProps } from './Affix.types';

export type { AffixProps, AffixState } from './Affix.types';
export { AFFIX_DEFAULTS } from './Affix.types';

import React, { forwardRef } from 'react';

/** Lightweight CSS-sticky fallback usable outside the engine system. */
export const BaseAffix = forwardRef<HTMLDivElement, AffixProps>(
  (props, ref) => {
    const {
      offsetTop = 0,
      offsetBottom,
      children,
      className = '',
      style = {},
      zIndex = 10,
    } = props;

    const stickyStyle: React.CSSProperties = {
      position: 'sticky',
      zIndex,
      ...(offsetBottom !== undefined
        ? { bottom: offsetBottom }
        : { top: offsetTop }
      ),
      ...style,
    };

    return (
      <div
        ref={ref}
        className={`rottay-affix ${className}`}
        style={stickyStyle}
      >
        {children}
      </div>
    );
  }
);

BaseAffix.displayName = 'BaseAffix';

/** Sticky positioning primitive resolved through the active engine. */
export const Affix = createEngineComponent<AffixProps>('Affix', {
  /** Ant Design implementation - full-featured with native Affix support */
  classic: () => import('./engines/classic'),
  /** DaisyUI/Tailwind implementation - utility-first styling */
  modern: () => import('./engines/modern'),
  /** Vanilla HTML/CSS implementation - zero dependencies */
  rustic: () => import('./engines/rustic'),
});

export default Affix;
