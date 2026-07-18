/**
 * @fileoverview Progress Classic Engine - Rottay Design System
 * @description Ant Design implementation of the Progress component.
 * The primary, full-featured engine for enterprise applications.
 *
 * @remarks
 * **Engine Overview:**
 * Classic is the default engine in the Rottay Design System, built on
 * Ant Design. It provides the most complete feature set including:
 * - Smooth animated progress transitions
 * - Line and circle display types
 * - Status-based color schemes
 * - Gradient stroke support
 *
 * **When to Use Classic:**
 * - Enterprise applications requiring full feature set
 * - Projects already using Ant Design
 * - When bundle size is not a primary concern
 *
 * **Multi-Tenant Theming:**
 * Classic progress inherits Ant Design's theme tokens which can be
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
 * // Classic is the default engine
 * <Progress percent={75} type="line" />
 * ```
 *
 * @example Explicit Engine Selection
 * ```tsx
 * <Progress engine="classic" percent={50} type="circle" />
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
 * @see {@link ModernProgress} - DaisyUI alternative
 * @see {@link RusticProgress} - Vanilla alternative
 * @see {@link https://ant.design/components/progress} - Ant Design Progress docs
 * @module Progress/Engines/Classic
 * @category Feedback
 * @package @rottay/design-system
 */

import React from 'react';
import { Progress as AntProgress } from 'antd';
import type { ProgressProps } from '../../contracts';
import { PROGRESS_DEFAULTS, TONE_TO_PROGRESS_STATUS } from '../../contracts';

// ============================================================================
// Component
// ============================================================================

/**
 * Classic Engine implementation of the Progress component.
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
 * | strokeWidth | size |
 *
 * @param props - {@link ProgressProps}
 * @returns The rendered Ant Design Progress
 *
 * @example
 * ```tsx
 * <ClassicProgress
 *   percent={75}
 *   type="circle"
 *   status="success"
 *   strokeWidth={10}
 * />
 * ```
 */
export default function ClassicProgress(props: ProgressProps): React.ReactElement {
  // ---------------------------------------------------------------------------
  // Props Destructuring
  // ---------------------------------------------------------------------------

  const {
    percent,
    type = PROGRESS_DEFAULTS.type,
    status = PROGRESS_DEFAULTS.status,
    tone,
    showInfo = PROGRESS_DEFAULTS.showInfo,
    strokeColor,
    strokeWidth = PROGRESS_DEFAULTS.strokeWidth,
    className,
    style,
  } = props;

  // `tone` takes precedence over `status`'s color implication when both are given.
  const resolvedStatus = tone ? TONE_TO_PROGRESS_STATUS[tone] : status;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  // Status mapping bridges Rottay's "error" to Ant Design's "exception"
  // terminology. Passing undefined for normal/active lets Ant Design use
  // its default styling. strokeWidth maps to Ant's "size" prop because
  // Ant Design v5 unified the progress bar thickness under the size API.
  return (
    <AntProgress
      percent={percent}
      type={type}
      status={resolvedStatus === 'error' ? 'exception' : resolvedStatus === 'success' ? 'success' : undefined}
      showInfo={showInfo}
      strokeColor={strokeColor}
      size={strokeWidth}
      className={className}
      style={style}
    />
  );
}
