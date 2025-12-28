'use client';

/**
 * @fileoverview FloatButton Base Component - Rottay Design System
 * @description Vanilla HTML/CSS implementation of the FloatButton component.
 * Serves as the foundational implementation and Apollo engine fallback.
 *
 * @remarks
 * This base component provides a zero-dependency implementation using
 * native HTML elements and inline styles. It serves as:
 * - The Apollo engine implementation
 * - A reference implementation for other engines
 * - A fallback when external libraries are unavailable
 *
 * @example Base FloatButton usage
 * ```tsx
 * import { BaseFloatButton } from './base';
 *
 * <BaseFloatButton
 *   icon={<PlusIcon />}
 *   type="primary"
 *   shape="circle"
 *   onClick={handleClick}
 * />
 * ```
 *
 * @example Base Group usage
 * ```tsx
 * import { BaseGroup } from './base';
 *
 * <BaseGroup trigger="click" icon={<MenuIcon />}>
 *   <BaseFloatButton icon={<EditIcon />} />
 *   <BaseFloatButton icon={<ShareIcon />} />
 * </BaseGroup>
 * ```
 *
 * @example Base BackTop usage
 * ```tsx
 * import { BaseBackTop } from './base';
 *
 * <BaseBackTop visibilityHeight={200} type="primary" />
 * ```
 *
 * @see {@link FloatButtonProps} for prop documentation
 * @see {@link FloatButtonGroupProps} for group props
 * @see {@link FloatButtonBackTopProps} for back-to-top props
 *
 * @module FloatButton/Base
 * @category Navigation
 * @package @rottay/design-system
 */

import React, { useState, useEffect } from 'react';
import type { FloatButtonProps, FloatButtonGroupProps, FloatButtonBackTopProps } from '../types';
import { FLOAT_BUTTON_DEFAULTS } from '../types';

// ============================================================================
// Styles
// ============================================================================

/**
 * Inline styles for the base FloatButton components.
 * Uses CSS-in-JS pattern for zero-dependency styling.
 * @internal
 */
const styles = {
  /** Base button styles - shared across all button types */
  button: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    transition: 'all 0.2s',
    position: 'relative',
  } as React.CSSProperties,

  /** Circle shape styles */
  buttonCircle: {
    width: 48,
    height: 48,
    borderRadius: '50%',
  } as React.CSSProperties,

  /** Square shape styles with rounded corners */
  buttonSquare: {
    width: 48,
    height: 48,
    borderRadius: 8,
  } as React.CSSProperties,

  /** Default type color scheme */
  buttonDefault: {
    backgroundColor: '#fff',
    color: '#595959',
  } as React.CSSProperties,

  /** Primary type color scheme */
  buttonPrimary: {
    backgroundColor: '#1890ff',
    color: '#fff',
  } as React.CSSProperties,

  /** Hover state transformation */
  buttonHover: {
    transform: 'scale(1.05)',
  } as React.CSSProperties,

  /** Fixed positioning for floating behavior */
  fixed: {
    position: 'fixed',
    bottom: 24,
    right: 24,
    zIndex: 1000,
  } as React.CSSProperties,

  /** Group container styles */
  group: {
    display: 'flex',
    flexDirection: 'column-reverse',
    alignItems: 'center',
    gap: 8,
  } as React.CSSProperties,

  /** Group items container */
  groupItems: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    transition: 'all 0.2s',
  } as React.CSSProperties,

  /** Hidden state for collapsed group items */
  groupItemsHidden: {
    opacity: 0,
    transform: 'translateY(16px)',
    pointerEvents: 'none',
  } as React.CSSProperties,

  /** Badge base styles */
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    padding: '0 4px',
    fontSize: 12,
    lineHeight: '18px',
    textAlign: 'center',
    backgroundColor: '#ff4d4f',
    color: '#fff',
    borderRadius: 9,
  } as React.CSSProperties,

  /** Dot badge variant */
  badgeDot: {
    width: 8,
    height: 8,
    padding: 0,
    minWidth: 8,
  } as React.CSSProperties,

  /** Description text styles */
  description: {
    fontSize: 12,
    marginTop: 2,
  } as React.CSSProperties,
};

// ============================================================================
// BaseFloatButton Component
// ============================================================================

/**
 * Base FloatButton component using vanilla HTML/CSS.
 *
 * @description
 * A floating action button with support for icons, badges, and tooltips.
 * Can render as a button or anchor element based on props.
 *
 * @remarks
 * - Uses forwardRef for ref forwarding support
 * - Handles both button and link rendering
 * - Includes hover state management
 * - Supports badge indicators (count and dot)
 *
 * @param props - {@link FloatButtonProps}
 * @param ref - Forwarded ref to the button/anchor element
 * @returns Rendered float button element
 */
export const BaseFloatButton = React.forwardRef<HTMLButtonElement, FloatButtonProps>(
  (props, ref) => {
    const {
      icon,
      description,
      tooltip,
      type = FLOAT_BUTTON_DEFAULTS.type,
      shape = FLOAT_BUTTON_DEFAULTS.shape,
      onClick,
      href,
      target,
      badge,
      className,
      style,
      children,
    } = props;

    const [isHovered, setIsHovered] = useState(false);

    // Compose button styles based on props and state
    const buttonStyle = {
      ...styles.button,
      ...(shape === 'circle' ? styles.buttonCircle : styles.buttonSquare),
      ...(type === 'primary' ? styles.buttonPrimary : styles.buttonDefault),
      ...(isHovered ? styles.buttonHover : {}),
      ...style,
    };

    // Button content with icon, description, and badge
    const content = (
      <>
        {icon}
        {description && <span style={styles.description}>{description}</span>}
        {children}
        {badge?.dot && (
          <span style={{ ...styles.badge, ...styles.badgeDot }} />
        )}
        {badge?.count && (
          <span style={styles.badge}>
            {badge.count > 99 ? '99+' : badge.count}
          </span>
        )}
      </>
    );

    // Common props for both button and anchor elements
    const commonProps = {
      className,
      style: buttonStyle,
      title: typeof tooltip === 'string' ? tooltip : undefined,
      onMouseEnter: () => setIsHovered(true),
      onMouseLeave: () => setIsHovered(false),
    };

    // Render as anchor if href is provided
    if (href) {
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          target={target}
          {...commonProps}
        >
          {content}
        </a>
      );
    }

    // Render as button by default
    return (
      <button ref={ref} type="button" onClick={onClick} {...commonProps}>
        {content}
      </button>
    );
  }
);
BaseFloatButton.displayName = 'BaseFloatButton';

// ============================================================================
// BaseGroup Component
// ============================================================================

/**
 * Base FloatButton.Group component using vanilla HTML/CSS.
 *
 * @description
 * A container for grouping multiple float buttons with expandable behavior.
 * Supports both click and hover triggers for showing/hiding child buttons.
 *
 * @remarks
 * - Supports controlled and uncontrolled modes
 * - Click or hover trigger for expansion
 * - Fixed positioning in bottom-right corner
 * - Smooth animation for show/hide transitions
 *
 * @param props - {@link FloatButtonGroupProps}
 * @param ref - Forwarded ref to the container div
 * @returns Rendered group container with trigger and children
 */
export const BaseGroup = React.forwardRef<HTMLDivElement, FloatButtonGroupProps>(
  (props, ref) => {
    const {
      trigger = 'click',
      open: controlledOpen,
      onOpenChange,
      icon,
      closeIcon,
      shape = FLOAT_BUTTON_DEFAULTS.shape,
      type = FLOAT_BUTTON_DEFAULTS.type,
      tooltip,
      children,
      className,
      style,
    } = props;

    const [internalOpen, setInternalOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    // Support controlled and uncontrolled modes
    const isOpen = controlledOpen ?? internalOpen;

    // Toggle handler for click trigger
    const handleToggle = () => {
      const newOpen = !isOpen;
      if (controlledOpen === undefined) {
        setInternalOpen(newOpen);
      }
      onOpenChange?.(newOpen);
    };

    // Mouse enter handler for hover trigger
    const handleMouseEnter = () => {
      if (trigger === 'hover') {
        if (controlledOpen === undefined) {
          setInternalOpen(true);
        }
        onOpenChange?.(true);
      }
    };

    // Mouse leave handler for hover trigger
    const handleMouseLeave = () => {
      if (trigger === 'hover') {
        if (controlledOpen === undefined) {
          setInternalOpen(false);
        }
        onOpenChange?.(false);
      }
    };

    return (
      <div
        ref={ref}
        className={className}
        style={{
          ...styles.fixed,
          ...styles.group,
          ...style,
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Trigger button */}
        <button
          type="button"
          onClick={trigger === 'click' ? handleToggle : undefined}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          title={typeof tooltip === 'string' ? tooltip : undefined}
          style={{
            ...styles.button,
            ...(shape === 'circle' ? styles.buttonCircle : styles.buttonSquare),
            ...(type === 'primary' ? styles.buttonPrimary : styles.buttonDefault),
            ...(isHovered ? styles.buttonHover : {}),
            zIndex: 10,
          }}
        >
          {isOpen ? (closeIcon ?? '×') : icon}
        </button>

        {/* Child buttons container */}
        <div
          style={{
            ...styles.groupItems,
            ...(isOpen ? {} : styles.groupItemsHidden),
          }}
        >
          {children}
        </div>
      </div>
    );
  }
);
BaseGroup.displayName = 'BaseFloatButton.Group';

// ============================================================================
// BaseBackTop Component
// ============================================================================

/**
 * Base FloatButton.BackTop component using vanilla HTML/CSS.
 *
 * @description
 * A floating button that appears when the user scrolls down and scrolls
 * back to the top when clicked. Automatically manages visibility based
 * on scroll position.
 *
 * @remarks
 * - Monitors scroll position on window or custom target
 * - Shows/hides based on visibilityHeight threshold
 * - Smooth scroll animation to top
 * - Supports custom scroll target element
 *
 * @param props - {@link FloatButtonBackTopProps}
 * @param ref - Forwarded ref to the button element
 * @returns Rendered back-to-top button or null when hidden
 */
export const BaseBackTop = React.forwardRef<HTMLButtonElement, FloatButtonBackTopProps>(
  (props, ref) => {
    const {
      visibilityHeight = FLOAT_BUTTON_DEFAULTS.visibilityHeight,
      target,
      onClick,
      icon,
      description,
      type = FLOAT_BUTTON_DEFAULTS.type,
      shape = FLOAT_BUTTON_DEFAULTS.shape,
      tooltip,
      className,
      style,
    } = props;

    const [visible, setVisible] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    // Monitor scroll position and update visibility
    useEffect(() => {
      const container = target?.() ?? window;

      const handleScroll = () => {
        const scrollTop = container === window
          ? window.scrollY
          : (container as HTMLElement).scrollTop;
        setVisible(scrollTop >= visibilityHeight);
      };

      container.addEventListener('scroll', handleScroll);
      handleScroll(); // Check initial scroll position

      return () => {
        container.removeEventListener('scroll', handleScroll);
      };
    }, [target, visibilityHeight]);

    // Scroll to top handler
    const scrollToTop = () => {
      const container = target?.() ?? window;
      if (container === window) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        (container as HTMLElement).scrollTo({ top: 0, behavior: 'smooth' });
      }
      onClick?.();
    };

    // Don't render when not visible
    if (!visible) return null;

    return (
      <button
        ref={ref}
        type="button"
        onClick={scrollToTop}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={className}
        style={{
          ...styles.button,
          ...styles.fixed,
          ...(shape === 'circle' ? styles.buttonCircle : styles.buttonSquare),
          ...(type === 'primary' ? styles.buttonPrimary : styles.buttonDefault),
          ...(isHovered ? styles.buttonHover : {}),
          ...style,
        }}
        title={typeof tooltip === 'string' ? tooltip : undefined}
      >
        {icon ?? '↑'}
        {description && <span style={styles.description}>{description}</span>}
      </button>
    );
  }
);
BaseBackTop.displayName = 'BaseFloatButton.BackTop';

// ============================================================================
// Default Export
// ============================================================================

export default BaseFloatButton;
