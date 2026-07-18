'use client';

/**
 * @fileoverview Alert Modern Engine - Rottay Design System
 * @description Token-driven Tailwind implementation of the Alert component.
 * A lightweight, utility-first alternative to the Classic engine.
 *
 * @remarks
 * **Engine Overview:**
 * Modern is the utility-first engine built on Tailwind CSS with DS token inline styles.
 * It provides a smaller bundle size compared to Classic while maintaining
 * core alert functionality.
 *
 * **Key Features:**
 * - Utility-first styling with Tailwind
 * - Smaller bundle size than Ant Design
 * - DS token inline styles via --ds-* CSS custom properties
 * - Custom dismiss state management
 *
 * **When to Use Modern:**
 * - Projects using Tailwind CSS
 * - When bundle size is a concern
 * - Landing pages and marketing sites
 * - When DS token theming is preferred
 *
 * **Multi-Tenant Theming:**
 * Modern uses DS token CSS custom properties for theming.
 * Tenant themes override:
 * - `--ds-color-info`: Info alert color
 * - `--ds-color-success`: Success alert color
 * - `--ds-color-warning`: Warning alert color
 * - `--ds-color-error`: Error alert color
 *
 * **Type to DS Token Mapping:**
 * | Type | DS Token | Icon |
 * |------|----------|------|
 * | info | --ds-color-info | bulb |
 * | success | --ds-color-success | checkmark |
 * | warning | --ds-color-warning | warning |
 * | error | --ds-color-error | x |
 *
 * @example Basic Usage
 * ```tsx
 * import { Alert } from '@rottay/design-system';
 *
 * <Alert engine="modern" type="success" message="File uploaded!" />
 * ```
 *
 * @example Global Engine Configuration
 * ```tsx
 * import { EngineProvider, Alert } from '@rottay/design-system';
 *
 * <EngineProvider engine="modern">
 *   <App>
 *     <Alert type="info" message="All alerts use Modern engine" />
 *   </App>
 * </EngineProvider>
 * ```
 *
 * @see {@link AlertProps} - Component props interface
 * @see {@link ClassicAlert} - Ant Design alternative
 * @see {@link RusticAlert} - Vanilla alternative
 * @see {@link Alert} for the main component
 * @module Alert/Engines/Modern
 * @category Feedback
 * @package @rottay/design-system
 */

import React, { useState, useId } from 'react';
import type { AlertProps, AlertType } from '../../contracts';
import { ALERT_DEFAULTS, TONE_TO_ALERT_TYPE } from '../../contracts';
import { isResponsiveValue, generateResponsiveCSS, type ResponsivePropEntry } from '@/infrastructure/runtime/responsive/runtime/style-properties';

// ============================================================================
// Constants
// ============================================================================

/**
 * Default icons for each alert type.
 * Used when `showIcon` is true and no custom `icon` is provided.
 * Using inline SVGs for consistent rendering across themes.
 *
 * @internal
 */
const TYPE_ICONS: Record<AlertType, React.ReactNode> = {
  /** Info circle icon */
  info: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  /** Checkmark circle for successful operations */
  success: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  /** Warning triangle for caution messages */
  warning: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  /** X circle for errors and failures */
  error: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

// ============================================================================
// Component
// ============================================================================

/**
 * Modern Engine implementation of the Alert component.
 *
 * @description
 * Custom alert implementation using DS token inline styles and Tailwind utilities.
 * Provides a lightweight alternative to Ant Design with smaller bundle size.
 *
 * @remarks
 * **Implementation Details:**
 * - Uses `useState` for dismiss state management
 * - DS token inline styles for alert type colors
 * - Custom close button with ghost styling
 * - Flexbox layout for icon and content alignment
 *
 * **CSS Classes Used:**
 * - `alert`: Base alert structural class
 * - DS token inline styles for type-specific colors
 * - `btn`, `btn-sm`, `btn-ghost`: Close button
 * - `font-bold`: Message text styling
 * - `text-sm`: Description text styling
 *
 * **Accessibility:**
 * - Semantic HTML structure
 * - Close button is focusable
 * - Icon provides visual context
 *
 * @param props - {@link AlertProps}
 * @returns The rendered DS token-styled Alert or null when dismissed
 *
 * @example
 * ```tsx
 * <ModernAlert
 *   type="warning"
 *   message="Low disk space"
 *   description="Consider cleaning up unused files."
 *   showIcon
 *   closable
 *   onClose={() => console.log('Alert dismissed')}
 * />
 * ```
 */
export default function ModernAlert(props: AlertProps): React.ReactElement | null {
  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------

  /**
   * Visibility state for dismiss functionality.
   * Managed internally when closable is true.
   */
  const [visible, setVisible] = useState(true);

  // ---------------------------------------------------------------------------
  // Props Destructuring
  // ---------------------------------------------------------------------------

  const {
    // Type & Appearance
    tone,
    type = ALERT_DEFAULTS.type as AlertType,
    icon,
    showIcon = ALERT_DEFAULTS.showIcon,

    // Content
    message,
    description,

    // Behavior
    compact: compactProp = ALERT_DEFAULTS.compact,
    closable = ALERT_DEFAULTS.closable,
    onClose,

    // Styling
    className = '',
    style,
  } = props;

  // Responsive compact handling
  const reactId = useId();
  const responsiveEntries: ResponsivePropEntry<any>[] = [];
  const compactIsResponsive = isResponsiveValue(compactProp);

  if (compactIsResponsive) {
    responsiveEntries.push({
      cssProperty: 'padding',
      value: compactProp,
      resolve: (v: boolean) => v ? '0.5rem 0.75rem' : '1rem',
    } as ResponsivePropEntry<any>);
    responsiveEntries.push({
      cssProperty: 'font-size',
      value: compactProp,
      resolve: (v: boolean) => v ? '0.8125rem' : '0.875rem',
    } as ResponsivePropEntry<any>);
  }

  const needsResponsiveCSS = responsiveEntries.length > 0;
  const elementId = needsResponsiveCSS ? `alert-${reactId.replace(/:/g, '')}` : '';
  const responsive = needsResponsiveCSS
    ? generateResponsiveCSS(elementId, responsiveEntries)
    : null;

  const isCompact = !compactIsResponsive && compactProp === true;

  // ---------------------------------------------------------------------------
  // Early Return
  // ---------------------------------------------------------------------------

  // Don't render if dismissed
  if (!visible) return null;

  // ---------------------------------------------------------------------------
  // Event Handlers
  // ---------------------------------------------------------------------------

  /**
   * Handle close button click.
   * Sets visibility to false and triggers onClose callback.
   */
  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  // ---------------------------------------------------------------------------
  // Derived Values
  // ---------------------------------------------------------------------------

  // `tone` takes precedence over the deprecated `type` prop when both are given.
  const alertType = tone ? TONE_TO_ALERT_TYPE[tone] : (type as AlertType);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <>
    {responsive && responsive.css && (
      <style dangerouslySetInnerHTML={{ __html: responsive.css }} />
    )}
    <div
      data-part="root"
      data-tone={alertType}
      className={`rottay-alert-shell rottay-alert-shell--modern alert ${isCompact ? 'p-2 text-sm' : ''} ${className}`}
      style={style}
      {...(responsive ? responsive.attrs : {})}
    >
      {/* Icon Section */}
      {showIcon && <span data-part="icon">{icon || TYPE_ICONS[alertType]}</span>}

      {/* Content Section */}
      <div>
        <div data-part="label" className="font-bold">{message}</div>
        {description && <div data-part="description" className="text-sm">{description}</div>}
      </div>

      {/* Close Button */}
      {closable && (
        <button data-part="action" style={{ width: 32, height: 32, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 0, fontSize: 13 }} onClick={handleClose} aria-label="Close">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
    </>
  );
}
