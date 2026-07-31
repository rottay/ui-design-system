'use client';

/**
 * @fileoverview FloatButton Modern Engine - Rottay Design System
 * @description Token-driven Tailwind CSS implementation of the FloatButton component.
 * Provides utility-first styled floating action buttons.
 *
 * @remarks
 * The Modern engine uses Tailwind CSS structural utilities and the unlayered
 * modern skin (`skin/float-button.css`) as the SINGLE paint owner:
 * - No DaisyUI classes (K4-C drained `btn`/`btn-circle`/`btn-primary`/
 *   `btn-ghost`/`bg-base-100`/`bg-error`): the skin now owns trigger paint,
 *   footprint geometry, badge paint+geometry, AND the hover/press scale and
 *   focus ring (transcribed verbatim from the theme.css `.btn` rules that
 *   used to own the interaction through the drained `btn` class).
 * - Logical placement utilities (`end-6`, never a physical `right-6`) so the
 *   fixed Group/BackTop placement mirrors under RTL; badge offsets are
 *   `inset-inline-end` in the skin for the same reason.
 * - Minimal JavaScript footprint
 * - Easy customization via the `--ds-floatbutton-*` token family
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
import type { FloatButtonProps, FloatButtonGroupProps, FloatButtonBackTopProps } from '../../contracts';
import { FLOAT_BUTTON_DEFAULTS } from '../../contracts';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { ActionCloseIcon } from '@/graphics/icons/presentation/semantic/generated/roles/action-close';
import { NavigationCollapseIcon } from '@/graphics/icons/presentation/semantic/generated/roles/navigation-collapse';

/**
 * Accessible-name channel for icon-only triggers (K4-C axe remediation,
 * `button-name` critical): translated when an I18nProvider is mounted, with
 * the documented English fallbacks otherwise (a missing catalog key echoes
 * the raw key back, which the endsWith guard detects). Shared by all three
 * modern render sites.
 */
function useFloatButtonLabel(): (key: string, fallback: string) => string {
  const i18n = useOptionalTranslation('components');
  return (key: string, fallback: string): string => {
    const translated = i18n?.t(key);
    return translated && !translated.endsWith(key) ? translated : fallback;
  };
}

function getFloatButtonClassName(className = ''): string {
  // K4-C Pass 1: the DaisyUI class list (`btn`, `btn-circle`, `btn-primary`,
  // `btn-ghost`, `bg-base-100`, `bg-error`, `shadow-lg`) is DRAINED. The
  // unlayered modern skin (`skin/float-button.css`) is now the single paint
  // owner for the trigger — including the hover/press scale and focus ring,
  // transcribed verbatim from the theme.css `.btn` rules that previously only
  // matched because of the `btn` class. The skin keys everything off
  // `data-part='trigger'` + `data-variant` + `data-shape`, which the three
  // render sites stamp below.
  return ['rottay-float-button', 'rottay-float-button--modern', className]
    .filter(Boolean)
    .join(' ');
}

// ============================================================================
// FloatButton Modern Implementation
// ============================================================================

/**
 * FloatButton component using Tailwind CSS structural utilities and the
 * modern skin as single paint owner.
 *
 * @description
 * Implements floating action button with Tailwind structural utilities;
 * all paint, footprint geometry and interaction states live in the skin.
 *
 * @remarks
 * - Skin owns trigger paint, footprint, interaction (hover/press/focus)
 * - Tailwind logical utilities for fixed placement
 * - Badge support via data-part hooks painted+positioned by the skin
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

    // Structural layout stays inline; the footprint (circle 40px / square
    // padding) is skin-owned via data-shape (K4-C single paint owner).
    const baseStyle: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      position: 'relative',
    };

    // Badge rendering: dot takes priority over count to avoid conflicting
    // indicators. Count is capped at 99+ to prevent badge overflow on
    // the small circular button surface. Both badges are painted AND
    // positioned by the skin (`inset-inline-end`, so they mirror in RTL);
    // no classes or inline geometry remain here (K4-C).
    const content = (
      <>
        {icon}
        {description && <span data-part="description">{description}</span>}
        {children}
        {badge?.dot && (
          <span data-part="badge" data-variant="dot" />
        )}
        {badge?.count && (
          <span data-part="badge" data-variant="count">
            {badge.count > 99 ? '99+' : badge.count}
          </span>
        )}
      </>
    );

    // When href is provided, render as <a> for native link semantics and
    // accessibility; otherwise render as <button> for click-only actions
    const floatStyle: React.CSSProperties = { ...style };
    const floatClassName = getFloatButtonClassName(className);

    // Accessible name (K4-C axe remediation): `description`/`children` are
    // discernible text and name the trigger by content. Icon-only triggers
    // fall back to the string tooltip, then to the guarded generic label.
    const fbLabel = useFloatButtonLabel();
    const hasDiscernibleText = description != null || children != null;
    const ariaLabel = hasDiscernibleText
      ? undefined
      : (typeof tooltip === 'string' ? tooltip : undefined) ??
        fbLabel('floatbutton.actionLabel', 'Floating action button');

    const buttonElement = href ? (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        target={target}
        className={floatClassName}
        style={{ ...baseStyle, ...floatStyle }}
        title={typeof tooltip === 'string' ? tooltip : undefined}
        aria-label={ariaLabel}
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
        aria-label={ariaLabel}
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
    // so child items expand upward, matching FAB menu conventions.
    // `end-6` is LOGICAL (inset-inline-end) and stays: the quality contract
    // pins it verbatim (and forbids the physical `right-6`); every other
    // fixed-placement property is skin-owned (`float-button.css`).
    //
    // Accessible name (K4-C axe remediation): the trigger is icon-only by
    // design. A string tooltip names it; otherwise the guarded state-aware
    // label applies. A custom `closeIcon` node owns the open-state name.
    const fbLabel = useFloatButtonLabel();
    const tooltipText = typeof tooltip === 'string' ? tooltip : undefined;
    const triggerAriaLabel = isOpen
      ? closeIcon != null
        ? tooltipText
        : tooltipText ?? fbLabel('floatbutton.closeGroup', 'Close action group')
      : tooltipText ?? fbLabel('floatbutton.openGroup', 'Open action group');

    // APG disclosure keyboard contract: Escape closes and returns focus to
    // the trigger; ArrowUp/ArrowDown cycle focus across the panel's buttons.
    const panelRef = React.useRef<HTMLDivElement>(null);
    const triggerRef = React.useRef<HTMLButtonElement>(null);
    const closeAndFocusTrigger = () => {
      if (controlledOpen === undefined) {
        setInternalOpen(false);
      }
      onOpenChange?.(false);
      triggerRef.current?.focus();
    };
    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Escape' && isOpen) {
        event.preventDefault();
        closeAndFocusTrigger();
        return;
      }
      if (!isOpen || (event.key !== 'ArrowUp' && event.key !== 'ArrowDown')) return;
      const buttons = Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>('button, a') ?? []
      );
      if (buttons.length === 0) return;
      event.preventDefault();
      const currentIndex = buttons.indexOf(document.activeElement as HTMLElement);
      const delta = event.key === 'ArrowDown' ? 1 : -1;
      const nextIndex = currentIndex < 0
        ? (delta > 0 ? 0 : buttons.length - 1)
        : (currentIndex + delta + buttons.length) % buttons.length;
      buttons[nextIndex]?.focus();
    };
    return (
      <div
        ref={ref}
        className={`end-6 ${className}`}
        style={style}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onKeyDown={handleKeyDown}
        data-part="root"
        data-open={isOpen}
      >
        {/* Trigger button — footprint is skin-owned via data-shape (K4-C) */}
        <button
          ref={triggerRef}
          type="button"
          onClick={trigger === 'click' ? handleToggle : undefined}
          className={getFloatButtonClassName()}
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
          }}
          title={typeof tooltip === 'string' ? tooltip : undefined}
          aria-label={triggerAriaLabel}
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          {isOpen ? (closeIcon ?? <ActionCloseIcon decorative size={16} />) : icon}
        </button>

        {/* Child buttons with transition — the open/closed opacity+translate
            class pair stays (pinned by the quality contract); the transition
            itself is skin-owned on data-open. */}
        <div
          ref={panelRef}
          className={`${
            isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
          data-part="panel"
          data-open={isOpen}
          role="group"
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

    // Accessible name (K4-C axe remediation): `description` names the trigger
    // by content; otherwise a string tooltip, then the guarded "Back to top"
    // label — the default `↑` glyph alone is not a meaningful name. The hook
    // stays above the visibility early-return (hooks must be unconditional).
    const fbLabel = useFloatButtonLabel();
    const backTopAriaLabel = description != null
      ? undefined
      : (typeof tooltip === 'string' ? tooltip : undefined) ??
        fbLabel('floatbutton.backTop', 'Back to top');

    // Don't render when not visible
    if (!visible) return null;

    return (
      <button
        ref={ref}
        type="button"
        onClick={scrollToTop}
        // `end-6` is LOGICAL (inset-inline-end) and stays pinned; the fixed
        // placement itself is skin-owned, keyed on data-placement='back-top'.
        className={`end-6 ${getFloatButtonClassName(className)}`}
        data-part="trigger"
        data-placement="back-top"
        data-variant={type}
        data-shape={shape}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          ...style,
        }}
        title={typeof tooltip === 'string' ? tooltip : undefined}
        aria-label={backTopAriaLabel}
      >
        {icon ?? <NavigationCollapseIcon decorative size={16} />}
        {description && <span data-part="description">{description}</span>}
      </button>
    );
  }
);
BackTop.displayName = 'FloatButton.BackTop.Modern';

// ============================================================================
// Default Export
// ============================================================================

export default FloatButton;
