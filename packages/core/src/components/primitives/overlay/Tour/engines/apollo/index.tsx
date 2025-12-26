'use client';

/**
 * Tour - Apollo Engine (Vanilla HTML/CSS)
 */
import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { TourProps, TourStepProps } from '../../types';
import { TOUR_DEFAULTS } from '../../types';

const getTargetElement = (target: TourStepProps['target']): HTMLElement | null => {
  if (!target) return null;
  if (typeof target === 'string') return document.querySelector(target);
  if (typeof target === 'function') return target();
  if ('current' in target) return target.current;
  return null;
};

export const Tour = React.forwardRef<HTMLDivElement, TourProps>(
  (props, ref) => {
    const {
      steps,
      current: controlledCurrent,
      open,
      onChange,
      onClose,
      onFinish,
      type = TOUR_DEFAULTS.type,
      mask = TOUR_DEFAULTS.mask,
      zIndex = TOUR_DEFAULTS.zIndex,
      className,
      style,
    } = props;

    const [internalCurrent, setInternalCurrent] = useState(0);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

    const currentStep = controlledCurrent ?? internalCurrent;
    const step = steps[currentStep];

    const handleChange = useCallback((newCurrent: number) => {
      setInternalCurrent(newCurrent);
      onChange?.(newCurrent);
    }, [onChange]);

    const handleNext = () => {
      if (currentStep < steps.length - 1) {
        handleChange(currentStep + 1);
      } else {
        onFinish?.();
        onClose?.();
      }
    };

    const handlePrev = () => {
      if (currentStep > 0) {
        handleChange(currentStep - 1);
      }
    };

    // Update target position
    useEffect(() => {
      if (open && step) {
        const element = getTargetElement(step.target);
        if (element) {
          setTargetRect(element.getBoundingClientRect());
        } else {
          setTargetRect(null);
        }
      }
    }, [open, step, currentStep]);

    // Handle escape key
    useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && open) {
          onClose?.();
        }
      };
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }, [open, onClose]);

    if (!open || typeof document === 'undefined') {
      return <div ref={ref} className={className} style={style} />;
    }

    const padding = 8;
    const maskColor = typeof mask === 'object' ? mask.color : 'rgba(0, 0, 0, 0.5)';
    const isPrimary = type === 'primary';

    return createPortal(
      <div ref={ref} className={className} style={{ ...style, position: 'relative', zIndex }}>
        {/* Mask */}
        {mask && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: maskColor,
            }}
            onClick={onClose}
          />
        )}

        {/* Spotlight */}
        {targetRect && (
          <div
            style={{
              position: 'fixed',
              top: targetRect.top - padding,
              left: targetRect.left - padding,
              width: targetRect.width + padding * 2,
              height: targetRect.height + padding * 2,
              borderRadius: '8px',
              boxShadow: `0 0 0 9999px ${maskColor}`,
              pointerEvents: 'none',
              zIndex: zIndex! + 1,
            }}
          />
        )}

        {/* Popover */}
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            top: targetRect ? targetRect.bottom + padding + 8 : '50%',
            left: targetRect ? targetRect.left + targetRect.width / 2 : '50%',
            transform: targetRect ? 'translateX(-50%)' : 'translate(-50%, -50%)',
            backgroundColor: '#fff',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
            padding: '20px',
            maxWidth: '360px',
            minWidth: '280px',
            border: isPrimary ? '2px solid #3b82f6' : 'none',
            zIndex: zIndex! + 2,
          }}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            style={{
              position: 'absolute',
              right: '12px',
              top: '12px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              fontSize: '16px',
              color: '#9ca3af',
            }}
          >
            ✕
          </button>

          {/* Content */}
          {step?.cover && <div style={{ marginBottom: '12px' }}>{step.cover}</div>}
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#111827' }}>
            {step?.title}
          </h3>
          {step?.description && (
            <p style={{ margin: '8px 0 0', fontSize: '14px', color: '#6b7280' }}>
              {step.description}
            </p>
          )}

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '20px',
            }}
          >
            {/* Indicators */}
            <div style={{ display: 'flex', gap: '6px' }}>
              {steps.map((_, index) => (
                <div
                  key={index}
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: index === currentStep ? '#3b82f6' : '#e5e7eb',
                  }}
                />
              ))}
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    backgroundColor: '#fff',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 500,
                  }}
                >
                  Previous
                </button>
              )}
              <button
                type="button"
                onClick={handleNext}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: isPrimary ? '#3b82f6' : '#374151',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                }}
              >
                {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>,
      document.body
    );
  }
);

Tour.displayName = 'Tour.Apollo';

export default Tour;
