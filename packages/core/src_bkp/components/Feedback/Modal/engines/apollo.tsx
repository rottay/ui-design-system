/**
 * Apollo Modal Engine
 *
 * Native HTML + Tailwind CSS modal implementation.
 * Uses React Portal for proper modal rendering.
 * Implements unified ModalProps interface.
 */

'use client';

import { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { ModalProps } from '../../../../types/components/modal';
import { cn } from '../../../../utils/cn';

/**
 * Map unified size to width
 */
function getModalWidth(size?: ModalProps['size'], width?: string | number): string {
  if (width) {
    return typeof width === 'number' ? `${width}px` : width;
  }

  switch (size) {
    case 'small':
      return '400px';
    case 'large':
      return '800px';
    case 'fullscreen':
      return '100vw';
    default:
      return '520px';
  }
}

/**
 * Apollo Modal - Native HTML + Tailwind implementation with unified ModalProps
 */
function ApolloModal({
  open = false,
  onClose,
  title,
  children,
  footer,
  className,
  size,
  closable = true,
  maskClosable = true,
  centered = false,
  width,
  bodyStyle,
  onOk,
  onCancel,
  okText = 'OK',
  cancelText = 'Cancel',
  confirmLoading = false,
  afterClose,
}: ModalProps) {
  // Handle cancel
  const handleCancel = useCallback(() => {
    onCancel?.();
    onClose?.();
  }, [onCancel, onClose]);

  // Handle escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        handleCancel();
      }
    },
    [open, handleCancel]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      afterClose?.();
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open, afterClose]);

  if (!open) return null;

  const modalWidth = getModalWidth(size, width);

  const defaultFooter = (
    <div className="flex justify-end gap-2">
      <button
        type="button"
        onClick={handleCancel}
        className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
      >
        {cancelText}
      </button>
      <button
        type="button"
        onClick={onOk}
        disabled={confirmLoading}
        className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
      >
        {confirmLoading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {okText}
      </button>
    </div>
  );

  const modal = (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={maskClosable ? handleCancel : undefined}
      />

      {/* Modal container */}
      <div
        className={cn(
          'flex min-h-full p-4',
          centered ? 'items-center justify-center' : 'items-start justify-center pt-20'
        )}
      >
        {/* Modal content */}
        <div
          className={cn(
            'relative bg-white rounded-lg shadow-xl transform transition-all',
            className
          )}
          style={{ width: modalWidth, maxWidth: '90vw' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {(title || closable) && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              {title && (
                <h3 className="text-lg font-medium text-gray-900">{title}</h3>
              )}
              {closable && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* Body */}
          <div className="px-6 py-4" style={bodyStyle}>{children}</div>

          {/* Footer */}
          {footer !== null && (
            <div className="px-6 py-4 border-t border-gray-200">
              {footer === undefined ? defaultFooter : footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Render in portal
  if (typeof document !== 'undefined') {
    return createPortal(modal, document.body);
  }

  return null;
}

ApolloModal.displayName = 'ApolloModal';

export default ApolloModal;
