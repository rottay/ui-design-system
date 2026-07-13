'use client';

/**
 * @fileoverview FloatButton Rustic Engine - Rottay Design System
 * @description Vanilla HTML/CSS implementation of the FloatButton component.
 * Provides zero-dependency floating action buttons with maximum accessibility.
 *
 * @remarks
 * The Rustic engine uses pure HTML and inline CSS for a lightweight,
 * dependency-free implementation including:
 * - No external library dependencies
 * - Maximum accessibility compliance
 * - Full control over styling
 * - Predictable behavior across environments
 *
 * This engine is ideal for projects requiring minimal dependencies,
 * maximum accessibility, or custom styling requirements.
 *
 * @example Rustic FloatButton
 * ```tsx
 * import { FloatButton } from '@rottay/design-system';
 *
 * // Explicitly use Rustic engine
 * <FloatButton engine="rustic" icon={<PlusIcon />} type="primary" />
 * ```
 *
 * @example Rustic Group
 * ```tsx
 * <FloatButton.Group engine="rustic" trigger="click" icon={<MenuIcon />}>
 *   <FloatButton icon={<EditIcon />} />
 *   <FloatButton icon={<ShareIcon />} />
 * </FloatButton.Group>
 * ```
 *
 * @see {@link FloatButtonProps} for prop documentation
 * @see {@link BaseFloatButton} for base implementation details
 *
 * @module FloatButton/Engines/Rustic
 * @category Navigation
 * @package @rottay/design-system
 */

import React, { useState, useEffect } from 'react';
import type { FloatButtonProps, FloatButtonGroupProps, FloatButtonBackTopProps } from '../FloatButton.types';
import { FLOAT_BUTTON_DEFAULTS } from '../FloatButton.types';

// ============================================================================
// Styles
// ============================================================================

/**
 * Inline styles for Rustic FloatButton components.
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
    boxShadow: 'var(--ds-floatbutton-shadow, var(--ds-shadow-dialog))',
    transition: 'all 0.2s',
    position: 'relative',
  } as React.CSSProperties,

  /** Circle shape styles */
  buttonCircle: {
    width: 'var(--ds-floatbutton-size, 48px)',
    height: 'var(--ds-floatbutton-size, 48px)',
    borderRadius: '50%',
  } as React.CSSProperties,

  /** Square shape styles with rounded corners */
  buttonSquare: {
    width: 'var(--ds-floatbutton-size, 48px)',
    height: 'var(--ds-floatbutton-size, 48px)',
    borderRadius: 'var(--ds-floatbutton-square-radius, 8px)',
  } as React.CSSProperties,

  /** Default type color scheme */
  buttonDefault: {
    backgroundColor: 'var(--ds-floatbutton-default-bg, var(--ds-color-bg-elevated))',
    color: 'var(--ds-floatbutton-default-color, var(--ds-color-text-secondary))',
  } as React.CSSProperties,

  /** Primary type color scheme */
  buttonPrimary: {
    backgroundColor: 'var(--ds-floatbutton-primary-bg, var(--ds-color-primary))',
    color: 'var(--ds-floatbutton-primary-color, var(--ds-color-text-on-primary))',
  } as React.CSSProperties,

  /** Hover state transformation */
  buttonHover: {
    transform: 'scale(1.05)',
    boxShadow: 'var(--ds-floatbutton-hover-shadow, var(--ds-shadow-lg))',
  } as React.CSSProperties,

  /** Fixed positioning for floating behavior */
  fixed: {
    position: 'fixed',
    bottom: 'var(--ds-floatbutton-bottom, 24px)',
    right: 'var(--ds-floatbutton-right, 24px)',
    zIndex: 'var(--ds-floatbutton-z-index, 1000)' as unknown as number,
  } as React.CSSProperties,

  /** Group container styles */
  group: {
    display: 'flex',
    flexDirection: 'column-reverse',
    alignItems: 'center',
    gap: 'var(--ds-floatbutton-gap, 8px)',
  } as React.CSSProperties,

  /** Group items container */
  groupItems: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--ds-floatbutton-gap, 8px)',
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
    backgroundColor: 'var(--ds-floatbutton-badge-bg, var(--ds-color-error))',
    color: 'var(--ds-floatbutton-badge-color, var(--ds-color-text-on-primary))',
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
    color: 'var(--ds-floatbutton-description-color, var(--ds-color-text-secondary))',
  } as React.CSSProperties,
};

// ============================================================================
// FloatButton Rustic Implementation
// ============================================================================

/**
 * FloatButton component using vanilla HTML/CSS.
 *
 * @description
 * Implements floating action button with pure HTML elements and
 * inline styles for zero external dependencies.
 *
 * @remarks
 * - No external library dependencies
 * - Uses forwardRef for ref forwarding
 * - Handles button and anchor rendering
 * - Includes hover state management
 * - Full badge support (count and dot)
 *
 * @param props - {@link FloatButtonProps}
 * @param ref - Forwarded ref to button/anchor element
 * @returns Vanilla HTML float button element
 */
export const FloatButton = React.forwardRef<HTMLButtonElement, FloatButtonProps>(
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

    // Style composition follows a specificity chain: base -> shape -> color -> hover -> consumer.
    // Each layer only overrides what it needs, keeping the rest from previous layers.
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
          <span data-part="badge" style={{ ...styles.badge, ...styles.badgeDot }} />
        )}
        {badge?.count && (
          <span data-part="badge" style={styles.badge}>
            {badge.count > 99 ? '99+' : badge.count}
          </span>
        )}
      </>
    );

    // Shared props extracted to avoid duplication between <a> and <button>
    // rendering paths; keeps behavior consistent regardless of element type
    const commonProps = {
      className,
      style: buttonStyle,
      title: typeof tooltip === 'string' ? tooltip : undefined,
      onMouseEnter: () => setIsHovered(true),
      onMouseLeave: () => setIsHovered(false),
      'data-part': 'trigger',
      'data-variant': type,
      'data-shape': shape,
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
FloatButton.displayName = 'FloatButton.Rustic';

// ============================================================================
// Group Rustic Implementation
// ============================================================================

/**
 * FloatButton.Group component using vanilla HTML/CSS.
 *
 * @description
 * Implements expandable button group with pure HTML and inline
 * styles for positioning, transitions, and layout.
 *
 * @remarks
 * - Fixed positioning in bottom-right corner
 * - Flex column layout for vertical stacking
 * - CSS transition for animations
 * - Controlled and uncontrolled state support
 *
 * @param props - {@link FloatButtonGroupProps}
 * @param ref - Forwarded ref to container div
 * @returns Vanilla HTML group container
 */
export const Group = React.forwardRef<HTMLDivElement, FloatButtonGroupProps>(
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
        data-part="root"
        data-open={isOpen}
      >
        {/* Trigger button */}
        <button
          type="button"
          onClick={trigger === 'click' ? handleToggle : undefined}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          title={typeof tooltip === 'string' ? tooltip : undefined}
          data-part="trigger"
          data-variant={type}
          data-shape={shape}
          data-open={isOpen}
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
          data-part="panel"
          data-open={isOpen}
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
Group.displayName = 'FloatButton.Group.Rustic';

// ============================================================================
// BackTop Rustic Implementation
// ============================================================================

/**
 * FloatButton.BackTop component using vanilla HTML/CSS.
 *
 * @description
 * Implements scroll-to-top button with pure HTML and inline
 * styles for positioning and visibility.
 *
 * @remarks
 * - Monitors scroll position via useEffect
 * - Fixed positioning with inline styles
 * - Smooth scroll behavior
 * - Automatic visibility based on threshold
 *
 * @param props - {@link FloatButtonBackTopProps}
 * @param ref - Forwarded ref to button element
 * @returns Vanilla HTML back-to-top button or null
 */
export const BackTop = React.forwardRef<HTMLButtonElement, FloatButtonBackTopProps>(
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
    // Hover state managed in JS because inline styles cannot use :hover;
    // this is the trade-off for zero-dependency styling in Rustic engine
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
        data-part="trigger"
        data-variant={type}
        data-shape={shape}
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
BackTop.displayName = 'FloatButton.BackTop.Rustic';

// ============================================================================
// Default Export
// ============================================================================

export default FloatButton;
