'use client';

/**
 * Tour - Hermes Engine (DaisyUI/Tailwind)
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
      placement: _placement = TOUR_DEFAULTS.placement,
      zIndex = TOUR_DEFAULTS.zIndex,
      className,
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

    if (!open || typeof document === 'undefined') return <div ref={ref} className={className} />;

    const padding = 8;
    const maskStyle = typeof mask === 'object' ? mask.style : {};
    const maskColor = typeof mask === 'object' ? mask.color : 'rgba(0, 0, 0, 0.5)';

    return createPortal(
      <div ref={ref} className={className} style={{ zIndex }}>
        {/* Mask */}
        {mask && (
          <div
            className="fixed inset-0"
            style={{
              backgroundColor: maskColor,
              ...maskStyle,
            }}
            onClick={onClose}
          />
        )}

        {/* Spotlight */}
        {targetRect && (
          <div
            className="fixed rounded-lg pointer-events-none"
            style={{
              top: targetRect.top - padding,
              left: targetRect.left - padding,
              width: targetRect.width + padding * 2,
              height: targetRect.height + padding * 2,
              boxShadow: `0 0 0 9999px ${maskColor}`,
              zIndex: zIndex! + 1,
            }}
          />
        )}

        {/* Popover */}
        <div
          className={`fixed card bg-base-100 shadow-xl p-4 max-w-sm ${type === 'primary' ? 'border-2 border-primary' : ''}`}
          style={{
            top: targetRect ? targetRect.bottom + padding + 8 : '50%',
            left: targetRect ? targetRect.left + targetRect.width / 2 : '50%',
            transform: targetRect ? 'translateX(-50%)' : 'translate(-50%, -50%)',
            zIndex: zIndex! + 2,
          }}
        >
          {/* Close button */}
          <button
            type="button"
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={onClose}
          >
            ✕
          </button>

          {/* Content */}
          {step?.cover && <div className="mb-3">{step.cover}</div>}
          <h3 className="font-bold text-lg">{step?.title}</h3>
          {step?.description && (
            <p className="text-base-content/70 mt-2">{step.description}</p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-4">
            {/* Indicators */}
            <div className="flex gap-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentStep ? 'bg-primary' : 'bg-base-300'
                  }`}
                />
              ))}
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              {currentStep > 0 && (
                <button
                  type="button"
                  className="btn btn-sm btn-ghost"
                  onClick={handlePrev}
                >
                  Previous
                </button>
              )}
              <button
                type="button"
                className={`btn btn-sm ${type === 'primary' ? 'btn-primary' : 'btn-neutral'}`}
                onClick={handleNext}
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

Tour.displayName = 'Tour.Hermes';

export default Tour;
