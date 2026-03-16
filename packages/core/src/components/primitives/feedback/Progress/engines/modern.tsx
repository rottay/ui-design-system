/**
 * @fileoverview Progress Modern Engine - Rottay Design System
 * @description DaisyUI/Tailwind implementation of the Progress component.
 * A lightweight, utility-first alternative to the Classic engine.
 *
 * @remarks
 * **Engine Overview:**
 * Modern is the utility-first engine built on DaisyUI and Tailwind CSS.
 * It provides a smaller bundle size compared to Classic while maintaining
 * core progress functionality.
 *
 * **Key Features:**
 * - Utility-first styling with Tailwind
 * - Smaller bundle size than Ant Design
 * - DaisyUI component tokens
 * - Native progress element for line type
 * - Radial-progress for circle type
 *
 * **When to Use Modern:**
 * - Projects using Tailwind CSS
 * - When bundle size is a concern
 * - Landing pages and marketing sites
 * - When DaisyUI theme is preferred
 *
 * **Multi-Tenant Theming:**
 * Modern uses DaisyUI's color system with CSS custom properties.
 * Tenant themes can override standard DaisyUI tokens.
 *
 * **Status Classes:**
 * | Status | DaisyUI Class |
 * |--------|---------------|
 * | normal | progress-primary |
 * | success | progress-success |
 * | error | progress-error |
 * | active | progress-primary |
 *
 * @example Basic Usage
 * ```tsx
 * import { Progress } from '@rottay/design-system';
 *
 * <Progress engine="modern" percent={50} />
 * ```
 *
 * @example Global Engine Configuration
 * ```tsx
 * import { EngineProvider, Progress } from '@rottay/design-system';
 *
 * <EngineProvider engine="modern">
 *   <App>
 *     <Progress percent={75} />
 *   </App>
 * </EngineProvider>
 * ```
 *
 * @example Circle Type
 * ```tsx
 * <Progress engine="modern" percent={60} type="circle" />
 * ```
 *
 * @see {@link ProgressProps} - Component props interface
 * @see {@link ClassicProgress} - Ant Design alternative
 * @see {@link RusticProgress} - Vanilla alternative
 * @see {@link https://daisyui.com/components/progress} - DaisyUI Progress docs
 * @module Progress/Engines/Modern
 * @category Feedback
 * @package @rottay/design-system
 */

import React from 'react';
import type { ProgressProps, ProgressStatus } from '../Progress.types';
import { PROGRESS_DEFAULTS } from '../Progress.types';

// ============================================================================
// Constants
// ============================================================================

/**
 * Status to DaisyUI class mappings.
 * Maps Rottay status values to DaisyUI progress classes.
 *
 * @internal
 */
const STATUS_CLASSES: Record<ProgressStatus, string> = {
  /** Normal state - primary color */
  normal: 'progress-primary',
  /** Success state - green color */
  success: 'progress-success',
  /** Error state - red color */
  error: 'progress-error',
  /** Active state - primary with animation potential */
  active: 'progress-primary',
};

// ============================================================================
// Component
// ============================================================================

/**
 * Modern Engine implementation of the Progress component.
 *
 * @description
 * Custom progress implementation using DaisyUI classes and Tailwind utilities.
 * Provides a lightweight alternative to Ant Design with smaller bundle size.
 *
 * @remarks
 * **Implementation Details:**
 * - Uses native `<progress>` element for line type
 * - Uses DaisyUI `radial-progress` for circle type
 * - Status mapped to DaisyUI color classes
 * - Custom stroke color via inline styles
 *
 * **Circle Type:**
 * Uses DaisyUI's radial-progress component which requires
 * special CSS variable handling for the progress value.
 *
 * **Line Type:**
 * Uses the native HTML progress element with DaisyUI styling,
 * providing semantic HTML and accessibility benefits.
 *
 * @param props - {@link ProgressProps}
 * @returns The rendered DaisyUI Progress
 *
 * @example
 * ```tsx
 * <ModernProgress
 *   percent={75}
 *   type="line"
 *   status="success"
 * />
 * ```
 */
export default function ModernProgress(props: ProgressProps): React.ReactElement {
  // ---------------------------------------------------------------------------
  // Props Destructuring
  // ---------------------------------------------------------------------------

  const {
    percent,
    type = PROGRESS_DEFAULTS.type,
    status = PROGRESS_DEFAULTS.status,
    showInfo = PROGRESS_DEFAULTS.showInfo,
    strokeColor,
    className = '',
    style,
  } = props;

  // ---------------------------------------------------------------------------
  // Circle Type Rendering
  // ---------------------------------------------------------------------------

  // DaisyUI's radial-progress component uses CSS custom properties (--value,
  // --size) to drive the circular indicator via a conic-gradient technique.
  // This avoids SVG entirely, keeping bundle size minimal, but limits
  // customization compared to Rustic's SVG approach.
  if (type === 'circle') {
    const circleStyle: React.CSSProperties = {
      ...style,
      ...(strokeColor ? { '--value': percent, '--size': '6rem', color: strokeColor } as React.CSSProperties : {}),
    };

    // role="progressbar" provides semantic accessibility information.
    // DaisyUI radial-progress renders as a styled div with conic-gradient,
    // so the ARIA role is necessary for screen readers to interpret it
    // as a progress indicator rather than generic content.
    return (
      <div
        className={`radial-progress ${STATUS_CLASSES[status!]} ${className}`}
        style={circleStyle}
        role="progressbar"
      >
        {showInfo && `${percent}%`}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Line Type Rendering
  // ---------------------------------------------------------------------------

  const progressStyle: React.CSSProperties = {
    ...style,
    ...(strokeColor ? { backgroundColor: strokeColor } as React.CSSProperties : {}),
  };

  return (
    <div className="w-full">
      {/* Native <progress> element provides built-in accessibility (no ARIA
          needed) and works with browser defaults when CSS fails to load.
          DaisyUI progress classes override the native appearance while
          preserving the semantic meaning for assistive technologies. */}
      <progress
        className={`progress ${STATUS_CLASSES[status!]} w-full ${className}`}
        value={percent}
        max="100"
        style={progressStyle}
      />

      {/* Percentage info display */}
      {showInfo && (
        <div className="text-sm text-center mt-1">{percent}%</div>
      )}
    </div>
  );
}
