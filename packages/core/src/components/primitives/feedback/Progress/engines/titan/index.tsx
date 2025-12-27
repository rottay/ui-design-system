/**
 * @fileoverview Progress Titan Engine - Rottay Design System
 * @description Ant Design implementation of the Progress component.
 * The primary, full-featured engine for enterprise applications.
 *
 * @remarks
 * **Engine Overview:**
 * Titan is the default engine in the Rottay Design System, built on
 * Ant Design. It provides the most complete feature set including:
 * - Smooth animated progress transitions
 * - Line and circle display types
 * - Status-based color schemes
 * - Gradient stroke support
 *
 * **When to Use Titan:**
 * - Enterprise applications requiring full feature set
 * - Projects already using Ant Design
 * - When bundle size is not a primary concern
 *
 * **Multi-Tenant Theming:**
 * Titan progress inherits Ant Design's theme tokens which can be
 * customized per tenant via the ConfigProvider or CSS variables.
 *
 * **Status Mapping:**
 * | Rottay Status | Ant Design Status |
 * |---------------|-------------------|
 * | normal | (none) |
 * | success | success |
 * | error | exception |
 * | active | (none, uses animation) |
 *
 * @example Basic Usage
 * ```tsx
 * import { Progress } from '@rottay/design-system';
 *
 * // Titan is the default engine
 * <Progress percent={75} type="line" />
 * ```
 *
 * @example Explicit Engine Selection
 * ```tsx
 * <Progress engine="titan" percent={50} type="circle" />
 * ```
 *
 * @example All Status Types
 * ```tsx
 * <Progress percent={30} status="normal" />
 * <Progress percent={100} status="success" />
 * <Progress percent={50} status="error" />
 * <Progress percent={60} status="active" />
 * ```
 *
 * @see {@link ProgressProps} - Component props interface
 * @see {@link HermesProgress} - DaisyUI alternative
 * @see {@link ApolloProgress} - Vanilla alternative
 * @see {@link https://ant.design/components/progress} - Ant Design Progress docs
 * @module Progress/Engines/Titan
 * @category Feedback
 * @package @rottay/design-system
 */

import React from 'react';
import { Progress as AntProgress } from 'antd';
import type { ProgressProps } from '../../types';
import { PROGRESS_DEFAULTS } from '../../types';

// ============================================================================
// Component
// ============================================================================

/**
 * Titan Engine implementation of the Progress component.
 *
 * @description
 * Wraps Ant Design's Progress component with Rottay's standardized props API.
 * Provides enterprise-grade progress indicators with full animation support.
 *
 * @remarks
 * **Key Features:**
 * - Line and circle progress types
 * - Status-based coloring (success, error)
 * - Smooth animated transitions
 * - Custom stroke colors and widths
 *
 * **Prop Mappings to Ant Design:**
 * | Rottay Prop | Ant Design Prop |
 * |-------------|-----------------|
 * | percent | percent |
 * | type | type |
 * | status | status (mapped) |
 * | showInfo | showInfo |
 * | strokeColor | strokeColor |
 * | strokeWidth | strokeWidth |
 *
 * @param props - {@link ProgressProps}
 * @returns The rendered Ant Design Progress
 *
 * @example
 * ```tsx
 * <TitanProgress
 *   percent={75}
 *   type="circle"
 *   status="success"
 *   strokeWidth={10}
 * />
 * ```
 */
export default function TitanProgress(props: ProgressProps): React.ReactElement {
  // ---------------------------------------------------------------------------
  // Props Destructuring
  // ---------------------------------------------------------------------------

  const {
    percent,
    type = PROGRESS_DEFAULTS.type,
    status = PROGRESS_DEFAULTS.status,
    showInfo = PROGRESS_DEFAULTS.showInfo,
    strokeColor,
    strokeWidth = PROGRESS_DEFAULTS.strokeWidth,
    className,
    style,
  } = props;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <AntProgress
      percent={percent}
      type={type}
      status={status === 'error' ? 'exception' : status === 'success' ? 'success' : undefined}
      showInfo={showInfo}
      strokeColor={strokeColor}
      strokeWidth={strokeWidth}
      className={className}
      style={style}
    />
  );
}
