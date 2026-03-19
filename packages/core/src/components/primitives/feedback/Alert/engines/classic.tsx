/**
 * @fileoverview Alert Classic Engine - Rottay Design System
 * @description Ant Design implementation of the Alert component.
 * The primary, full-featured engine for enterprise applications.
 *
 * @remarks
 * **Engine Overview:**
 * Classic is the default engine in the Rottay Design System, built on
 * Ant Design. It provides the most complete feature set including:
 * - Smooth show/hide animations
 * - Native close button styling
 * - Theme token integration
 * - RTL (Right-to-Left) support
 *
 * **When to Use Classic:**
 * - Enterprise applications requiring full feature set
 * - Projects already using Ant Design
 * - When bundle size is not a primary concern
 *
 * **Multi-Tenant Theming:**
 * Classic alerts inherit Ant Design's theme tokens which can be
 * customized per tenant via the ConfigProvider or CSS variables.
 *
 * **Alert Type Mapping:**
 * | Type | Ant Design Type | Color |
 * |------|-----------------|-------|
 * | info | info | Blue |
 * | success | success | Green |
 * | warning | warning | Yellow |
 * | error | error | Red |
 *
 * @example Basic Usage
 * ```tsx
 * import { Alert } from '@rottay/design-system';
 *
 * // Classic is the default engine
 * <Alert type="success" message="Profile saved successfully!" />
 * ```
 *
 * @example Explicit Engine Selection
 * ```tsx
 * <Alert engine="classic" type="info" message="Loading your data...">
 *   <Alert.Description>
 *     This may take a few seconds.
 *   </Alert.Description>
 * </Alert>
 * ```
 *
 * @example All Alert Types
 * ```tsx
 * <Alert type="info" message="Did you know?" />
 * <Alert type="success" message="Changes saved!" />
 * <Alert type="warning" message="Please review before continuing." />
 * <Alert type="error" message="Failed to save changes." />
 * ```
 *
 * @see {@link AlertProps} - Component props interface
 * @see {@link ModernAlert} - DaisyUI alternative
 * @see {@link RusticAlert} - Vanilla alternative
 * @see {@link https://ant.design/components/alert} - Ant Design Alert docs
 * @module Alert/Engines/Classic
 * @category Feedback
 * @package @rottay/design-system
 */

import React, { useId } from 'react';
import { Alert as AntAlert } from 'antd';
import type { AlertProps } from '../Alert.types';
import { ALERT_DEFAULTS } from '../Alert.types';
import { isResponsiveValue, generateResponsiveCSS, type ResponsivePropEntry } from '../../../layout/shared/responsive-props';

// ============================================================================
// Component
// ============================================================================

/**
 * Classic Engine implementation of the Alert component.
 *
 * @description
 * Wraps Ant Design's Alert component with Rottay's standardized props API.
 * Provides enterprise-grade alert functionality with full theming support.
 *
 * @remarks
 * **Key Features:**
 * - Animated transitions (fade in/out)
 * - Built-in type-specific icons
 * - Customizable close button
 * - Banner mode for page-level alerts
 *
 * **Prop Mappings to Ant Design:**
 * | Rottay Prop | Ant Design Prop |
 * |-------------|-----------------|
 * | type | type |
 * | message | message |
 * | description | description |
 * | icon | icon |
 * | showIcon | showIcon |
 * | closable | closable |
 * | onClose | onClose |
 *
 * @param props - {@link AlertProps}
 * @returns The rendered Ant Design Alert
 *
 * @example
 * ```tsx
 * <ClassicAlert
 *   type="warning"
 *   message="Session Expiring"
 *   description="Your session will expire in 5 minutes."
 *   showIcon
 *   closable
 *   onClose={() => refreshSession()}
 * />
 * ```
 */
export default function ClassicAlert(props: AlertProps): React.ReactElement {
  // ---------------------------------------------------------------------------
  // Props Destructuring
  // ---------------------------------------------------------------------------

  const {
    // Type & Appearance
    type = ALERT_DEFAULTS.type,
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
    className,
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
      resolve: (v: boolean) => `${v ? '8px 12px' : '16px'} !important`,
    } as ResponsivePropEntry<any>);
    responsiveEntries.push({
      cssProperty: 'font-size',
      value: compactProp,
      resolve: (v: boolean) => `${v ? '0.8125rem' : '0.875rem'} !important`,
    } as ResponsivePropEntry<any>);
  }

  const needsResponsiveCSS = responsiveEntries.length > 0;
  const elementId = needsResponsiveCSS ? `alert-${reactId.replace(/:/g, '')}` : '';
  const responsive = needsResponsiveCSS
    ? generateResponsiveCSS(elementId, responsiveEntries)
    : null;

  const isCompact = !compactIsResponsive && compactProp === true;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <>
      {responsive && responsive.css && (
        <style dangerouslySetInnerHTML={{ __html: responsive.css }} />
      )}
      <AntAlert
        // Type & Appearance
        type={type}
        icon={icon}
        showIcon={showIcon}

        // Content
        message={message}
        description={description}

        // Behavior
        closable={closable}
        onClose={onClose}

        // Styling
        className={className}
        style={{
          ...(isCompact ? { padding: '8px 12px', fontSize: '0.8125rem' } : {}),
          ...style,
        }}
        {...(responsive ? responsive.attrs : {})}
      />
    </>
  );
}
