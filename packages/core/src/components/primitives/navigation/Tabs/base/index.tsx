/**
 * @fileoverview Base Tabs Component - Rottay Design System
 * @description Base implementation of the Tabs component using CSS variables.
 * Provides the foundation that engine-specific implementations extend.
 *
 * @remarks
 * The BaseTabs component uses CSS variables from Rottay's design tokens
 * for consistent styling across all engines. This allows tenant themes
 * to customize tab appearance through token overrides.
 *
 * This component is primarily used internally by engine implementations
 * and for cases where a minimal, unstyled tabs wrapper is needed.
 *
 * @example Direct Usage (Rare)
 * ```tsx
 * import { BaseTabs } from '@rottay/design-system';
 *
 * <BaseTabs className="my-custom-tabs">
 *   {children}
 * </BaseTabs>
 * ```
 *
 * @see {@link Tabs} for the main multi-engine component
 * @see {@link TabsProps} for prop definitions
 *
 * @module Tabs/Base
 * @category Navigation
 * @package @rottay/design-system
 */

'use client';

import { forwardRef } from 'react';
import type { TabsProps } from '../types';

// ============================================================================
// Component Implementation
// ============================================================================

/**
 * Base Tabs component using CSS variables.
 *
 * @description
 * A minimal wrapper component that provides the foundational structure
 * for tabs. Engine-specific implementations (Titan, Hermes, Apollo)
 * extend this base with their respective styling and functionality.
 *
 * @remarks
 * - Uses `rottay-tabs` CSS class for styling hooks
 * - Supports ref forwarding for DOM access
 * - Passes through className and style props
 * - Designed to be extended by engine implementations
 *
 * @param props - {@link TabsProps}
 * @param ref - Forwarded ref to the root container
 * @returns React element representing the base tabs container
 *
 * @example
 * ```tsx
 * <BaseTabs
 *   className="custom-tabs"
 *   style={{ '--tabs-gap': '1rem' }}
 * >
 *   {tabContent}
 * </BaseTabs>
 * ```
 */
export const BaseTabs = forwardRef<HTMLDivElement, TabsProps>(
  (props, ref) => {
    const { className = '', style = {}, children } = props;

    return (
      <div
        ref={ref}
        className={`rottay-tabs ${className}`}
        style={style}
      >
        {children}
      </div>
    );
  }
);

// ============================================================================
// Display Name
// ============================================================================

/**
 * Display name for React DevTools.
 * Helps identify the base component in debugging.
 */
BaseTabs.displayName = 'BaseTabs';
