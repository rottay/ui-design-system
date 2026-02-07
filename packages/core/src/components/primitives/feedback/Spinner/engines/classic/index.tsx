/**
 * @fileoverview Spinner Classic Engine - Rottay Design System
 * @description Ant Design implementation of the Spinner component.
 * Uses the Spin component from Ant Design for enterprise-grade loading indicators.
 *
 * @remarks
 * The Classic engine leverages Ant Design's Spin component, providing:
 * - Native Ant Design animations and transitions
 * - Consistent sizing with Ant Design's design tokens
 * - Full integration with Ant Design's theming system
 * - Enterprise-ready accessibility features
 *
 * Size mapping from Rottay to Ant Design:
 * - `sm` -> `small`
 * - `md` -> `default`
 * - `lg` -> `large`
 * - `xl` -> `large` (Ant Design maximum)
 *
 * @example
 * ```tsx
 * import { Spinner } from '@rottay/design-system';
 *
 * // Classic engine is the default
 * <Spinner size="lg" label="Loading..." />
 *
 * // Explicit engine selection
 * <Spinner engine="classic" size="md" />
 * ```
 *
 * @see {@link https://ant.design/components/spin} Ant Design Spin documentation
 *
 * @module Spinner/Engines/Classic
 * @category Feedback
 * @package @rottay/design-system
 */

import React from 'react';
import { Spin } from 'antd';
import type { SpinnerProps } from '../../types';
import { SPINNER_DEFAULTS } from '../../types';

// ============================================================================
// Classic Engine Implementation
// ============================================================================

/**
 * Classic (Ant Design) implementation of the Spinner component.
 *
 * @description
 * Renders a spinner using Ant Design's Spin component with appropriate
 * size mapping and optional label support.
 *
 * @param props - {@link SpinnerProps} Component properties
 * @returns React element with Ant Design Spin component
 *
 * @example
 * ```tsx
 * <ClassicSpinner size="lg" label="Processing..." />
 * ```
 */
export default function ClassicSpinner(props: SpinnerProps): React.ReactElement {
  const {
    size = SPINNER_DEFAULTS.size,
    label,
    className,
    style,
  } = props;

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className={className} style={{ textAlign: 'center', ...style }}>
      <Spin size={size === 'xl' ? 'large' : size === 'sm' ? 'small' : 'default'} />
      {label && <div style={{ marginTop: '0.5rem' }}>{label}</div>}
    </div>
  );
}
