/**
 * @fileoverview Result Modern Engine - Rottay Design System
 * @description Token-driven implementation of the Result component.
 * All paint lives in the unlayered modern skin
 * (`foundation/tokens/css/runtime/engines/modern/skin/result.css`); the raw
 * utility layout that used to render here was drained in the K1 Lane C pass.
 *
 * @remarks
 * **Engine Overview:**
 * Modern renders Result as an open, centered completion/error composition --
 * deliberately differentiated from Empty's framed placeholder surface:
 * a large tone-tinted status glyph, a heading-level title, relaxed guidance
 * copy, then the action row. Bounded rhythm comes from governed tokens, never
 * a giant blank box.
 *
 * **Multi-Tenant Theming:**
 * Status color resolves through governed tokens (--ds-color-success,
 * --ds-color-error, --ds-color-info, --ds-color-warning, --ds-color-primary),
 * and the built-in glyphs use the semantic icon roles so every tenant
 * inherits the configured icon language (same supplier as Alert/Callout/Message).
 *
 * @example Basic Usage
 * ```tsx
 * import { Result } from '@rottay/design-system';
 *
 * <Result engine="modern" status="success" title="Done!">
 *   <p>Your changes have been saved.</p>
 * </Result>
 * ```
 *
 * @example HTTP Status Pages
 * ```tsx
 * <Result
 *   engine="modern"
 *   status="404"
 *   title="Page Not Found"
 *   subTitle="The page you're looking for doesn't exist."
 *   extra={<Button variant="primary">Go Home</Button>}
 * />
 * ```
 *
 * @see {@link ResultProps} - Component props interface
 * @see {@link ClassicResult} - Ant Design alternative
 * @see {@link RusticResult} - Vanilla alternative
 * @see {@link Result} for the main component
 * @module Result/Engines/Modern
 * @category Feedback
 * @package @rottay/design-system
 */

'use client';

import React from 'react';
import type { ResultProps, ResultStatus } from '../../contracts';
import { RESULT_DEFAULTS } from '../../contracts';
import { StatusInfoIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-info';
import { StatusSuccessIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-success';
import { StatusWarningIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-warning';
import { StatusErrorIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-error';

// ============================================================================
// Status Icons
// ============================================================================

/**
 * Built-in glyphs for each result status. Semantic roles keep every tenant on
 * the configured icon language (tone paint arrives through the icon's own
 * `data-icon-tone` plus the skin's tone-tinted well); HTTP statuses render a
 * large display status code instead of a glyph.
 *
 * @internal
 */
const statusIcons: Record<ResultStatus, React.ReactNode> = {
  // `data-part='status-icon'` marks the BUILT-IN glyph so the skin's
  // tone-tinted well cannot repaint a consumer-supplied `icon` in the slot.
  success: <span data-part="status-icon"><StatusSuccessIcon decorative size={56} /></span>,
  error: <span data-part="status-icon"><StatusErrorIcon decorative size={56} /></span>,
  info: <span data-part="status-icon"><StatusInfoIcon decorative size={56} /></span>,
  warning: <span data-part="status-icon"><StatusWarningIcon decorative size={56} /></span>,
  /** HTTP statuses - large display status codes, skin-sized via clamp() */
  '404': <div data-part="status-code">404</div>,
  '403': <div data-part="status-code">403</div>,
  '500': <div data-part="status-code">500</div>,
};

// ============================================================================
// Component
// ============================================================================

/**
 * Modern Engine implementation of the Result component.
 *
 * @description
 * Token-driven result display: the skin owns layout, typography hierarchy,
 * the status glyph well and the action row; the engine only stamps
 * `data-part`/`data-tone` structure.
 *
 * @remarks
 * **Layout Structure (skin-owned):**
 * ```
 * Container (centered column, token rhythm, bounded min-height)
 * ├── Icon well (tone-tinted disc) / status code
 * ├── Title (heading family, semibold)
 * ├── Subtitle (secondary, balanced wrap)
 * ├── Extra (action row, wraps)
 * └── Children (bounded max-width)
 * ```
 *
 * @param props - {@link ResultProps}
 * @returns The rendered token-driven result display
 *
 * @example
 * ```tsx
 * <ModernResult
 *   status="success"
 *   title="Payment Successful"
 *   subTitle="Your order has been confirmed."
 *   extra={<Button variant="primary">View Order</Button>}
 * />
 * ```
 */
export const Result = React.forwardRef<HTMLDivElement, ResultProps>(
  (props, ref) => {
    // -------------------------------------------------------------------------
    // Props Destructuring
    // -------------------------------------------------------------------------

    const {
      status = RESULT_DEFAULTS.status,
      icon,
      title,
      subTitle,
      extra,
      children,
      className = '',
      style,
    } = props;

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------

    return (
      <div
        ref={ref}
        data-part="root"
        data-tone={status}
        className={`rottay-result--modern ${className}`}
        style={style}
      >
        {/* Custom icon takes precedence over the built-in status glyph,
            allowing consumers to completely replace the visual indicator;
            the skin's well paint targets only the built-in status-icon part. */}
        <div data-part="icon">
          {icon || statusIcons[status!]}
        </div>

        {/* Title Section */}
        {title && (
          <h2 data-part="title">
            {title}
          </h2>
        )}

        {/* Subtitle uses the text-secondary token for visual hierarchy */}
        {subTitle && (
          <p data-part="description">
            {subTitle}
          </p>
        )}

        {/* Extra Section (Buttons) */}
        {extra && (
          <div data-part="extra">
            {extra}
          </div>
        )}

        {/* Children Section */}
        {children && (
          <div data-part="content">
            {children}
          </div>
        )}
      </div>
    );
  }
);

// Set display name for React DevTools debugging
Result.displayName = 'Result.Modern';

export default Result;
