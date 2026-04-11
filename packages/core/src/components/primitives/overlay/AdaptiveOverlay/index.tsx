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
 * @module AdaptiveOverlay
 * @category Overlay
 * @package @rottay/design-system
 */

import React from 'react';
import { useResponsive } from '../../../../runtime/responsive';
import { Modal } from '../Modal';
import { Drawer } from '../../feedback/Drawer';
import { Sheet } from '../Sheet';
import type {
  AdaptiveOverlayProps,
  ResolvedOverlayMode,
} from './AdaptiveOverlay.types';
import { ADAPTIVE_OVERLAY_DEFAULTS } from './AdaptiveOverlay.types';

// Re-export types
export type {
  AdaptiveOverlayProps,
  AdaptiveOverlayMode,
  ResolvedOverlayMode,
} from './AdaptiveOverlay.types';
export { ADAPTIVE_OVERLAY_DEFAULTS } from './AdaptiveOverlay.types';

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
  title,
  children,
  mode = ADAPTIVE_OVERLAY_DEFAULTS.mode,
  width = ADAPTIVE_OVERLAY_DEFAULTS.width,
  footer,
  className,
  style,
  id,
  'data-testid': dataTestId,
  'aria-label': ariaLabel,
}: AdaptiveOverlayProps): React.ReactElement | null {
  const resolvedMode = useResolvedMode(mode);

  const testId = dataTestId ?? 'adaptive-overlay';

  // -------------------------------------------------------------------------
  // Modal (desktop)
  // -------------------------------------------------------------------------
  if (resolvedMode === 'modal') {
    return (
      <Modal
        open={open}
        onClose={onClose}
        title={title}
        footer={footer}
        className={className}
        style={style}
        id={id}
        data-testid={testId}
        aria-label={ariaLabel}
        closeOnBackdropClick
        closeOnEscape
      >
        <Modal.Body>{children}</Modal.Body>
      </Modal>
    );
  }

  // -------------------------------------------------------------------------
  // Drawer (tablet - right side)
  // -------------------------------------------------------------------------
  if (resolvedMode === 'drawer') {
    return (
      <Drawer
        open={open}
        onClose={onClose}
        title={title}
        footer={footer}
        placement="right"
        width={width}
        className={className}
        style={style}
        id={id}
        data-testid={testId}
        aria-label={ariaLabel}
        closeOnOverlayClick
        closeOnEscape
      >
        {children}
      </Drawer>
    );
  }

  // -------------------------------------------------------------------------
  // Sheet (phone - bottom)
  // -------------------------------------------------------------------------
  return (
    <Sheet
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
      title={title}
      side="bottom"
      showHandle
      showOverlay
      closeOnEscape
      closeOnOverlayClick
      panelClassName={className}
      panelStyle={style}
    >
      {children}
      {footer != null && (
        <div
          style={{
            padding: 'var(--ds-spacing-4, 16px)',
            borderTop: '1px solid var(--ds-color-border, #e5e7eb)',
          }}
        >
          {footer}
        </div>
      )}
    </Sheet>
  );
}

AdaptiveOverlay.displayName = 'AdaptiveOverlay';
