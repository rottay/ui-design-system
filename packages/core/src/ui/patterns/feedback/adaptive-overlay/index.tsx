'use client';

/**
 * @fileoverview AdaptiveOverlay - Rottay Design System
 * @description A responsive overlay component that renders different containers
 * based on the current device class:
 * - **Desktop**: Centered Modal dialog
 * - **Tablet**: Right-side Drawer panel
 * - **Phone**: Bottom Sheet with drag handle
 *
 * Uses `useResponsive()` from the ResponsiveProvider when available, falling
 * back to SSR-safe defaults (phone/sheet) when no provider exists.
 *
 * @remarks
 * The `mode` prop allows forcing a specific overlay type regardless of the
 * detected device class. When set to `'auto'` (default), the component
 * automatically selects the appropriate overlay based on viewport width.
 *
 * @example Basic usage (auto mode)
 * ```tsx
 * import { AdaptiveOverlay, Button } from '@rottay/design-system';
 *
 * function Example() {
 *   const [open, setOpen] = useState(false);
 *   return (
 *     <>
 *       <Button onClick={() => setOpen(true)}>Open</Button>
 *       <AdaptiveOverlay
 *         open={open}
 *         onClose={() => setOpen(false)}
 *         title="Edit Item"
 *         footer={<Button onClick={() => setOpen(false)}>Done</Button>}
 *       >
 *         <p>Content adapts to device type.</p>
 *       </AdaptiveOverlay>
 *     </>
 *   );
 * }
 * ```
 *
 * @example Forced mode
 * ```tsx
 * <AdaptiveOverlay mode="drawer" open={open} onClose={close} title="Settings">
 *   <SettingsForm />
 * </AdaptiveOverlay>
 * ```
 *
 * @module Patterns/Feedback/AdaptiveOverlay
 * @category Pattern
 * @package @rottay/design-system
 */

import React, { useCallback } from 'react';
import { useResponsive } from '../../../../infrastructure/runtime/responsive';
import { Modal } from '@/ui/primitives/feedback/Modal';
import { Drawer } from '@/ui/primitives/feedback/Drawer';
import { Sheet } from '@/ui/primitives/overlay/Sheet';
import type {
  AdaptiveOverlayProps,
  ResolvedOverlayMode,
} from './contracts';
import { ADAPTIVE_OVERLAY_DEFAULTS } from './contracts';

// Re-export types
export type {
  AdaptiveOverlayProps,
  AdaptiveOverlayMode,
  ResolvedOverlayMode,
} from './contracts';
export { ADAPTIVE_OVERLAY_DEFAULTS } from './contracts';

// ---------------------------------------------------------------------------
// Internal: resolve the concrete overlay mode from props + device class
// ---------------------------------------------------------------------------

/**
 * Resolves the overlay mode from the `mode` prop and the current device class.
 * When `mode` is `'auto'`, maps device class to the appropriate overlay:
 * - desktop  -> modal
 * - tablet   -> drawer
 * - phone    -> sheet
 */
function useResolvedMode(mode: AdaptiveOverlayProps['mode']): ResolvedOverlayMode {
  const { deviceClass } = useResponsive();

  if (mode && mode !== 'auto') {
    return mode;
  }

  switch (deviceClass) {
    case 'desktop':
      return 'modal';
    case 'tablet':
      return 'drawer';
    case 'phone':
    default:
      return 'sheet';
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * AdaptiveOverlay renders a Modal, Drawer, or Sheet depending on the device.
 *
 * - **Desktop** (>= 1024px): Centered Modal with backdrop
 * - **Tablet** (640-1023px): Right-side Drawer panel
 * - **Phone** (< 640px): Bottom Sheet with drag handle
 *
 * Use the `mode` prop to override automatic detection.
 */
export function AdaptiveOverlay({
  open,
  onClose,
  onOpenChange,
  title,
  children,
  engine,
  mode = ADAPTIVE_OVERLAY_DEFAULTS.mode,
  width = ADAPTIVE_OVERLAY_DEFAULTS.width,
  footer,
  className,
  style,
  surfaceClassName,
  surfaceStyle,
  bodyClassName,
  bodyStyle,
  footerClassName,
  footerStyle,
  id,
  'data-testid': dataTestId,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
}: AdaptiveOverlayProps): React.ReactElement | null {
  const resolvedMode = useResolvedMode(mode);
  const { isPhone } = useResponsive();

  const testId = dataTestId ?? 'adaptive-overlay';
  const resolvedSurfaceClassName = [className, surfaceClassName]
    .filter(Boolean)
    .join(' ') || undefined;
  const resolvedSurfaceStyle = { ...style, ...surfaceStyle };
  const normalizedWidth = typeof width === 'number' ? `${width}px` : width;
  const modalSurfaceStyle = {
    ...(!isPhone && normalizedWidth ? { width: normalizedWidth } : {}),
    ...resolvedSurfaceStyle,
  };
  const resolvedFooter = footer != null ? (
    <div className={footerClassName} style={footerStyle}>
      {footer}
    </div>
  ) : undefined;
  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      onOpenChange?.(nextOpen);
      if (!nextOpen) onClose?.();
    },
    [onClose, onOpenChange],
  );

  // -------------------------------------------------------------------------
  // Modal (desktop)
  // -------------------------------------------------------------------------
  if (resolvedMode === 'modal') {
    return (
      <Modal
        engine={engine}
        open={open}
        onClose={() => handleOpenChange(false)}
        title={title}
        footer={resolvedFooter}
        className={resolvedSurfaceClassName}
        style={modalSurfaceStyle}
        id={id}
        data-testid={testId}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        closeOnBackdropClick
        closeOnEscape
      >
        <Modal.Body className={bodyClassName} style={bodyStyle}>
          {children}
        </Modal.Body>
      </Modal>
    );
  }

  // -------------------------------------------------------------------------
  // Drawer (tablet - right side)
  // -------------------------------------------------------------------------
  if (resolvedMode === 'drawer') {
    return (
      <Drawer
        engine={engine}
        open={open}
        onClose={() => handleOpenChange(false)}
        title={title}
        footer={resolvedFooter}
        placement="right"
        width={width}
        className={resolvedSurfaceClassName}
        style={resolvedSurfaceStyle}
        id={id}
        data-testid={testId}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        closeOnOverlayClick
        closeOnEscape
      >
        <div className={bodyClassName} style={bodyStyle}>
          {children}
        </div>
      </Drawer>
    );
  }

  // -------------------------------------------------------------------------
  // Sheet (phone - bottom)
  // -------------------------------------------------------------------------
  return (
    <Sheet
      engine={engine}
      open={open}
      onOpenChange={handleOpenChange}
      title={title}
      footer={footer}
      side="bottom"
      showHandle
      showOverlay
      closeOnEscape
      closeOnOverlayClick
      surfaceClassName={resolvedSurfaceClassName}
      surfaceStyle={resolvedSurfaceStyle}
      bodyClassName={bodyClassName}
      bodyStyle={bodyStyle}
      footerClassName={[
        'rottay-adaptive-overlay-footer',
        footerClassName,
      ].filter(Boolean).join(' ')}
      footerStyle={{
        padding: 'var(--ds-spacing-4, 16px)',
        ...footerStyle,
      }}
      id={id}
      data-testid={testId}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
    >
      {children}
    </Sheet>
  );
}

AdaptiveOverlay.displayName = 'AdaptiveOverlay';
