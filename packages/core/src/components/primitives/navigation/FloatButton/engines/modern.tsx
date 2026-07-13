'use client';

/**
 * @fileoverview FloatButton Modern Engine - Rottay Design System
 * @description Token-driven Tailwind CSS implementation of the FloatButton component.
 * Provides utility-first styled floating action buttons.
 *
 * @remarks
 * The Modern engine uses Tailwind CSS and DS tokens for a lightweight,
 * utility-first implementation including:
 * - Tailwind utility classes for styling
 * - DS token inline styles via --ds-* CSS custom properties
 * - Minimal JavaScript footprint
 * - Easy customization via Tailwind config
 *
 * This engine is ideal for projects using Tailwind CSS where bundle
 * size and utility-first CSS are priorities.
 *
 * @example Modern FloatButton
 * ```tsx
 * import { FloatButton } from '@rottay/design-system';
 *
 * // Explicitly use Modern engine
 * <FloatButton engine="modern" icon={<PlusIcon />} type="primary" />
 * ```
 *
 * @example Modern Group
 * ```tsx
 * <FloatButton.Group engine="modern" trigger="hover">
 *   <FloatButton icon={<EditIcon />} />
 *   <FloatButton icon={<ShareIcon />} />
 * </FloatButton.Group>
 * ```
 *
 * @see {@link FloatButtonProps} for prop documentation
 * @see {@link FloatButton} for the main component
 *
 * @module FloatButton/Engines/Modern
 * @category Navigation
 * @package @rottay/design-system
 */

import React, { useState, useEffect } from 'react';
import type { FloatButtonProps, FloatButtonGroupProps, FloatButtonBackTopProps } from '../FloatButton.types';
import { FLOAT_BUTTON_DEFAULTS } from '../FloatButton.types';

function getFloatButtonClassName(
  type: FloatButtonProps['type'],
  shape: FloatButtonProps['shape'],
  className = ''
): string {
  const typeClassName = type === 'primary'
    ? 'btn-primary'
    : 'btn-ghost bg-base-100';
  const shapeClassName = shape === 'circle'
    ? 'btn-circle'
    : 'rounded-lg';

  // The DaisyUI `btn` class list is load-bearing beyond color: `theme.css`'s
  // layered `.btn:hover` / `.btn:active` rules are the ONLY source of this
  // button's hover/press SCALE — no inline style ever contested them, so the
  // interaction exists nowhere else. Removing or renaming these classes deletes
  // it silently. The scope classes are prepended alongside, never in place of.
  return [
    'rottay-float-button',
    'rottay-float-button--modern',
    'btn',
    shapeClassName,
    typeClassName,
    'shadow-lg',
    className,
  ]
    .filter(Boolean)
    .join(' ');
}

// ============================================================================
// FloatButton Modern Implementation
// ============================================================================

/**
 * FloatButton component using Tailwind CSS and DS tokens.
 *
 * @description
 * Implements floating action button with Tailwind utility classes
 * and DS token inline styles for consistent styling.
 *
 * @remarks
 * - Uses DS token inline styles for base styling
 * - Tailwind utilities for positioning and effects
 * - Badge support via badge structural class with DS token colors
 * - Supports both button and anchor rendering
 *
 * @param props - {@link FloatButtonProps}
 * @param ref - Forwarded ref to button/anchor element
 * @returns Token-styled float button element
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
      className = '',
      style,
      children,
    } = props;

    const baseStyle: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      position: 'relative',
      ...(shape === 'circle'
        ? { width: 40, height: 40 }
        : { padding: '8px 12px' }),
    };

    // Badge rendering: dot takes priority over count to avoid conflicting
    // indicators. Count is capped at 99+ to prevent badge overflow on
    // the small circular button surface.
    const content = (
      <>
        {icon}
        {description && <span className="text-xs">{description}</span>}
        {children}
        {badge?.dot && (
          <span data-part="badge" data-variant="dot" className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-error" />
        )}
        {badge?.count && (
          <span data-part="badge" data-variant="count" style={{ position: 'absolute', top: -8, right: -8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '1px 6px', fontSize: 11, lineHeight: '16px' }}>
            {badge.count > 99 ? '99+' : badge.count}
          </span>
        )}
      </>
    );

    // When href is provided, render as <a> for native link semantics and
    // accessibility; otherwise render as <button> for click-only actions
    const floatStyle: React.CSSProperties = { ...style };
    const floatClassName = getFloatButtonClassName(type, shape, className);

    const buttonElement = href ? (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        target={target}
        className={floatClassName}
        style={{ ...baseStyle, ...floatStyle }}
        title={typeof tooltip === 'string' ? tooltip : undefined}
        data-part="trigger"
        data-variant={type}
        data-shape={shape}
      >
        {content}
      </a>
    ) : (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        className={floatClassName}
        style={{ ...baseStyle, ...floatStyle }}
        title={typeof tooltip === 'string' ? tooltip : undefined}
        data-part="trigger"
        data-variant={type}
        data-shape={shape}
      >
        {content}
      </button>
    );

    return buttonElement;
  }
);
FloatButton.displayName = 'FloatButton.Modern';

// ============================================================================
// Group Modern Implementation
// ============================================================================

/**
 * FloatButton.Group component using Tailwind CSS and DS tokens.
 *
 * @description
 * Implements expandable button group with Tailwind utilities
 * for positioning, transitions, and layout.
 *
 * @remarks
 * - Fixed positioning in bottom-right corner
 * - Flex column layout for vertical stacking
 * - Tailwind transition utilities for animations
 * - Controlled and uncontrolled state support
 *
 * @param props - {@link FloatButtonGroupProps}
 * @param ref - Forwarded ref to container div
 * @returns Token-styled group container
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
      className = '',
      style,
    } = props;

    const [internalOpen, setInternalOpen] = useState(false);

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

    // flex-col-reverse places the trigger button at the visual bottom
    // so child items expand upward, matching FAB menu conventions
    return (
      <div
        ref={ref}
        className={`fixed bottom-6 right-6 flex flex-col-reverse items-center gap-2 ${className}`}
        style={style}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        data-part="root"
        data-open={isOpen}
      >
        {/* Trigger button */}
        <button
          type="button"
          onClick={trigger === 'click' ? handleToggle : undefined}
          className={getFloatButtonClassName(type, shape)}
          data-part="trigger"
          data-variant={type}
          data-shape={shape}
          data-open={isOpen}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
            ...(shape === 'circle'
              ? { width: 40, height: 40 }
              : { padding: '8px 12px' }),
          }}
          title={typeof tooltip === 'string' ? tooltip : undefined}
        >
          {isOpen ? (closeIcon ?? '×') : icon}
        </button>

        {/* Child buttons with transition */}
        <div
          className={`flex flex-col items-center gap-2 transition-all duration-200 ${
            isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
          data-part="panel"
          data-open={isOpen}
        >
          {children}
        </div>
      </div>
    );
  }
);
Group.displayName = 'FloatButton.Group.Modern';

// ============================================================================
// BackTop Modern Implementation
// ============================================================================

/**
 * FloatButton.BackTop component using Tailwind CSS and DS tokens.
 *
 * @description
 * Implements scroll-to-top button with Tailwind utilities
 * for positioning and visibility transitions.
 *
 * @remarks
 * - Monitors scroll position via useEffect
 * - Fixed positioning with Tailwind classes
 * - Smooth scroll behavior
 * - Automatic visibility based on threshold
 *
 * @param props - {@link FloatButtonBackTopProps}
 * @param ref - Forwarded ref to button element
 * @returns Token-styled back-to-top button or null
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
      className = '',
      style,
    } = props;

    const [visible, setVisible] = useState(false);

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
        className={`fixed bottom-6 right-6 transition-opacity duration-200 ${getFloatButtonClassName(type, shape, className)}`}
        data-part="trigger"
        data-variant={type}
        data-shape={shape}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          ...(shape === 'circle'
            ? { width: 40, height: 40 }
            : { padding: '8px 12px' }),
          ...style,
        }}
        title={typeof tooltip === 'string' ? tooltip : undefined}
      >
        {icon ?? '↑'}
        {description && <span className="text-xs">{description}</span>}
      </button>
    );
  }
);
BackTop.displayName = 'FloatButton.BackTop.Modern';

// ============================================================================
// Default Export
// ============================================================================

export default FloatButton;
