'use client';

/**
 * @fileoverview FloatButton Modern Engine - Rottay Design System
 * @description Token-driven implementation of the FloatButton component.
 * The unlayered modern skin is the single paint owner; the engine stamps
 * anatomy and state only.
 *
 * @remarks
 * The Modern engine uses Tailwind CSS structural utilities and the unlayered
 * modern skin (`skin/float-button.css`) as the SINGLE paint owner:
 * - No DaisyUI classes (K4-C drained `btn`/`btn-circle`/`btn-primary`/
 *   `btn-ghost`/`bg-base-100`/`bg-error`): the skin now owns trigger paint,
 *   footprint geometry, badge paint+geometry, AND the hover/press scale and
 *   focus ring (transcribed verbatim from the theme.css `.btn` rules that
 *   used to own the interaction through the drained `btn` class).
 * - Logical fixed placement is skin-owned (P2-20: the pass-1 `end-6`
 *   utilities are drained — `inset-inline-end` in the skin, so the fixed
 *   Group/BackTop placement mirrors under RTL); badge offsets are
 *   `inset-inline-end` in the skin for the same reason. The Group root
 *   carries the canonical scope pair so the skin's root/panel rules match
 *   (P2-20 critical fix: they were dead paint without it).
 * - Minimal JavaScript footprint
 * - Easy customization via the `--ds-floatbutton-*` token family
 *
 * B9 pass 2:
 * - The Group trigger toggles on click in BOTH trigger modes — with
 *   `trigger='hover'` the keyboard path previously had no way to open the
 *   panel (the trigger is a `button` with `aria-expanded`, so it must
 *   operate the disclosure for every modality).
 * - The closed panel is `aria-hidden` and the skin gates `visibility` on
 *   `data-open`, so invisible child buttons leave the tab order.
 * - `FloatButton.BackTop` honors `prefers-reduced-motion` on the scroll
 *   jump (parity with the standalone BackTop engine).
 * - A badge count on an icon-only trigger is appended to its accessible
 *   name (an aria-label otherwise hides the count from AT).
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
  // matched because of the `btn` class. The skin keys trigger paint off
  // `data-part='trigger'` + `data-variant` + `data-shape`, and the Group
  // root/panel structure off `data-part='root'`/`'panel'` — the canonical
  // scope pair minted here is what makes those rules match (P2-20).
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
 * - Skin owns trigger paint, footprint, structure and interaction
 *   (hover/press/focus) — P2-20 drained the last inline layout literals
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

    // P2-20: the structural layout (inline-flex centering, position:relative,
    // cursor) moved to the skin's compound trigger rule — inline `style` is
    // reserved for runtime-measured geometry, and the unlayered skin remains
    // the single paint owner (a caller's `style` still out-ranks it).
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
    const floatClassName = getFloatButtonClassName(className);

    // Accessible name (K4-C axe remediation): `description`/`children` are
    // discernible text and name the trigger by content. Icon-only triggers
    // fall back to the string tooltip, then to the guarded generic label.
    // B9 pass 2: an aria-label REPLACES content-based naming, which made a
    // badge count unreachable to assistive technology on icon-only triggers
    // — when a count is present it is appended to the computed label
    // (locale-safe numeral, same 99+ cap as the painted badge).
    const fbLabel = useFloatButtonLabel();
    const hasDiscernibleText = description != null || children != null;
    const baseAriaLabel = hasDiscernibleText
      ? undefined
      : (typeof tooltip === 'string' ? tooltip : undefined) ??
        fbLabel('floatbutton.actionLabel', 'Floating action button');
    const ariaLabel =
      baseAriaLabel && badge?.count
        ? `${baseAriaLabel} (${badge.count > 99 ? '99+' : badge.count})`
        : baseAriaLabel;

    const buttonElement = href ? (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        target={target}
        className={floatClassName}
        style={style}
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
        style={style}
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
 * Implements the expandable button group; the skin owns positioning,
 * layout, and the open/closed motion (keyed on data-open).
 *
 * @remarks
 * - Fixed placement with the safe-area block-end gutter (skin-owned)
 * - Column-reverse stacking: trigger at the visual bottom (skin-owned)
 * - Panel open/closed values + cadence skin-owned on `data-open`
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
    // The skin owns the group's fixed placement + flex-col-reverse structure
    // (trigger at the visual bottom so items expand upward, FAB convention).
    // P2-20 CRITICAL FIX: the root now carries the canonical
    // `rottay-float-button rottay-float-button--modern` scope pair — without
    // it the skin's root/panel rules never matched (dead paint: no fixed
    // placement, no column-reverse, no panel motion). The pass-1 `end-6`
    // utility is drained; the skin owns the same logical inline-end offset.
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
        className={getFloatButtonClassName(className)}
        style={style}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onKeyDown={handleKeyDown}
        data-part="root"
        data-open={isOpen}
      >
        {/* Trigger button — footprint + structure are skin-owned via
            data-part/data-shape (K4-C; the inline layout/zIndex literals are
            drained in P2-20). onClick is wired in BOTH trigger modes (B9
            pass 2): with trigger='hover' the pointer path still opens on
            hover, but the keyboard path (Enter/Space → click) had NO way to
            open the panel at all — the trigger is a button with
            aria-expanded, so it must operate the disclosure for every input
            modality. */}
        <button
          ref={triggerRef}
          type="button"
          onClick={handleToggle}
          className={getFloatButtonClassName()}
          data-part="trigger"
          data-variant={type}
          data-shape={shape}
          data-open={isOpen}
          title={typeof tooltip === 'string' ? tooltip : undefined}
          aria-label={triggerAriaLabel}
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          {isOpen ? (closeIcon ?? <ActionCloseIcon decorative size={16} />) : icon}
        </button>

        {/* Child buttons — the open/closed opacity+translate VALUES live in
            the skin on data-open (P2-20: the pinned utility pair is drained);
            the skin also gates `visibility` on data-open (B9 pass 2) so the
            CLOSED panel's children leave the tab order (opacity:0 alone kept
            invisible buttons keyboard-focusable); aria-hidden mirrors that
            state for assistive technology. */}
        <div
          ref={panelRef}
          data-part="panel"
          data-open={isOpen}
          role="group"
          aria-hidden={!isOpen || undefined}
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
 * Implements the scroll-to-top button; the skin owns fixed placement and
 * interaction, the engine owns the visibility threshold and the
 * reduced-motion-aware scroll jump.
 *
 * @remarks
 * - Monitors scroll position via useEffect
 * - Fixed placement skin-owned (logical inline-end, safe-area block-end)
 * - Reduced-motion-aware smooth scroll behavior
 * - Automatic visibility based on threshold (unmounts when hidden)
 * - Focus return on activation (P2-20, parity with standalone BackTop)
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

    // Scroll to top handler. The motion authority gates the animation (B9
    // pass 2 — parity with the standalone BackTop engine): under reduced
    // motion the jump is instant, since 'smooth' animates regardless of the
    // OS preference.
    //
    // Focus return (P2-20 — parity with the standalone BackTop engine): the
    // trigger UNMOUNTS itself once the scroll crosses back below the
    // threshold, so a focused activation would strand focus on <body>
    // mid-journey. Hand focus to the scrolled context first (transient
    // tabindex="-1", restored on blur; preventScroll so the focus move never
    // fights the animated scroll).
    const buttonRef = React.useRef<HTMLButtonElement>(null);
    const setTriggerRefs = (node: HTMLButtonElement | null) => {
      buttonRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };
    const scrollToTop = () => {
      const container = target?.() ?? window;
      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const behavior: ScrollBehavior = prefersReducedMotion ? 'instant' : 'smooth';
      if (
        typeof document !== 'undefined' &&
        buttonRef.current !== null &&
        document.activeElement === buttonRef.current
      ) {
        const focusTarget: HTMLElement =
          container === window ? document.body : (container as HTMLElement);
        const previousTabIndex = focusTarget.getAttribute('tabindex');
        focusTarget.setAttribute('tabindex', '-1');
        focusTarget.addEventListener(
          'blur',
          () => {
            if (previousTabIndex === null) {
              focusTarget.removeAttribute('tabindex');
            } else {
              focusTarget.setAttribute('tabindex', previousTabIndex);
            }
          },
          { once: true },
        );
        focusTarget.focus({ preventScroll: true });
      }
      if (container === window) {
        window.scrollTo({ top: 0, behavior });
      } else {
        (container as HTMLElement).scrollTo({ top: 0, behavior });
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
        ref={setTriggerRefs}
        type="button"
        onClick={scrollToTop}
        // P2-20: the pass-1 `end-6` utility and the inline layout literals are
        // drained — the skin owns the fixed placement (keyed on
        // data-placement='back-top', logical inline-end mirroring under RTL)
        // and the trigger structure.
        className={getFloatButtonClassName(className)}
        data-part="trigger"
        data-placement="back-top"
        data-variant={type}
        data-shape={shape}
        style={style}
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
