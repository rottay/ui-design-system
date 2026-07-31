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
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { StatusInfoIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-info';
import { StatusSuccessIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-success';
import { StatusWarningIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-warning';
import { StatusErrorIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-error';
import { ActionCloseIcon } from '@/graphics/icons/presentation/semantic/generated/roles/action-close';

// ============================================================================
// Constants
// ============================================================================

/**
 * Default icons for each alert type.
 * Used when `showIcon` is true and no custom `icon` is provided.
 * Uses semantic roles so every tenant inherits the configured icon language.
 *
 * @internal
 */
const TYPE_ICONS: Record<AlertType, React.ReactNode> = {
  info: <StatusInfoIcon decorative size={20} />,
  success: <StatusSuccessIcon decorative size={20} />,
  warning: <StatusWarningIcon decorative size={20} />,
  error: <StatusErrorIcon decorative size={20} />,
};

// ============================================================================
// Component
// ============================================================================

/**
 * Modern Engine implementation of the Alert component.
 *
 * @description
 * Custom alert implementation whose paint is fully owned by the token-driven
 * modern skin (`skin/alert.css`). Provides a lightweight alternative to
 * Ant Design with no DaisyUI or AntD CSS dependency.
 *
 * @remarks
 * **Implementation Details:**
 * - Uses `useState` for dismiss state management
 * - All paint lives in the unlayered modern skin
 *   (`foundation/tokens/css/runtime/engines/modern/skin/alert.css`), keyed on
 *   `rottay-alert-shell--modern` + `data-part`/`data-tone`; no DaisyUI classes
 *   remain on this tree (the `alert` structural class was drained in the
 *   K1 Lane C pass, decrementing `daisy.classConsumers`).
 * - Custom close button with governed token styling
 * - Flexbox layout for icon and content alignment
 *
 * **Accessibility:**
 * - `role="alert"` announces the message assertively on mount
 * - Close button is focusable with a governed focus ring
 * - Icon provides visual context (decorative, screen-reader hidden)
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
  // Optional provider + English floor (Spinner/Input idiom): bare compositions
  // must not crash without an I18nProvider.
  const i18n = useOptionalTranslation('common');
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
    // One channel, no physical literals: the skin's root padding chain prefers
    // `--ds-alert-responsive-padding`. A bare `[data-responsive-id]`
    // declaration (0,1,0) would lose to the skin's compact rule (0,4,0) —
    // which is also why the old literal padding/font-size entries were dead.
    responsiveEntries.push({
      cssProperty: '--ds-alert-responsive-padding',
      value: compactProp,
      resolve: (v: boolean) =>
        v
          ? 'var(--ds-alert-compact-padding, var(--ds-spacing-sm) var(--ds-spacing-md))'
          : 'var(--ds-alert-padding)',
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
      data-compact={compactIsResponsive ? 'responsive' : isCompact}
      data-has-icon={showIcon}
      data-has-description={Boolean(description)}
      data-closable={closable}
      className={`rottay-alert-shell rottay-alert-shell--modern ${className}`}
      style={style}
      role="alert"
      {...(responsive ? responsive.attrs : {})}
    >
      {/* Icon Section */}
      {showIcon && <span className="rottay-alert-shell__icon" data-part="icon">{icon || TYPE_ICONS[alertType]}</span>}

      {/* Content Section */}
      <div className="rottay-alert-shell__content" data-part="content">
        <div data-part="label">{message}</div>
        {description && <div data-part="description">{description}</div>}
      </div>

      {/* Close Button */}
      {closable && (
        <button
          type="button"
          data-part="action"
          onClick={handleClose}
          aria-label={i18n?.t('close') ?? 'Close'}
        >
          <ActionCloseIcon decorative size={16} />
        </button>
      )}
    </div>
    </>
  );
}
