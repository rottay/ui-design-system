/**
 * Tour - Base Component
 * Uses CSS variables from design tokens for consistent styling
 */

'use client';

import React, {
  forwardRef,
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { createPortal } from 'react-dom';
import type { TourProps, TourStepProps, TourPlacement } from '../types';
import { TOUR_DEFAULTS } from '../types';

/**
 * Get target element from various formats
 */
function getTargetElement(
  target: TourStepProps['target']
): HTMLElement | null {
  if (!target) return null;

  if (typeof target === 'string') {
    return document.querySelector(target);
  }

  if (typeof target === 'function') {
    return target();
  }

  if ('current' in target) {
    return target.current;
  }

  return null;
}

/**
 * Calculate position for tour popover
 */
function calculatePosition(
  targetRect: DOMRect | null,
  popoverRect: DOMRect,
  placement: TourPlacement,
  gap: { offset?: number; radius?: number }
): { top: number; left: number; arrowPosition: { top?: number; left?: number; bottom?: number; right?: number } } {
  const offset = gap.offset ?? 8;

  // Center placement (no target)
  if (!targetRect || placement === 'center') {
    return {
      top: (window.innerHeight - popoverRect.height) / 2 + window.scrollY,
      left: (window.innerWidth - popoverRect.width) / 2 + window.scrollX,
      arrowPosition: {},
    };
  }

  let top = 0;
  let left = 0;
  let arrowPosition: { top?: number; left?: number; bottom?: number; right?: number } = {};

  switch (placement) {
    case 'top':
      top = targetRect.top - popoverRect.height - offset;
      left = targetRect.left + (targetRect.width - popoverRect.width) / 2;
      arrowPosition = { bottom: -4, left: popoverRect.width / 2 - 4 };
      break;
    case 'topLeft':
      top = targetRect.top - popoverRect.height - offset;
      left = targetRect.left;
      arrowPosition = { bottom: -4, left: 16 };
      break;
    case 'topRight':
      top = targetRect.top - popoverRect.height - offset;
      left = targetRect.right - popoverRect.width;
      arrowPosition = { bottom: -4, right: 16 };
      break;
    case 'bottom':
      top = targetRect.bottom + offset;
      left = targetRect.left + (targetRect.width - popoverRect.width) / 2;
      arrowPosition = { top: -4, left: popoverRect.width / 2 - 4 };
      break;
    case 'bottomLeft':
      top = targetRect.bottom + offset;
      left = targetRect.left;
      arrowPosition = { top: -4, left: 16 };
      break;
    case 'bottomRight':
      top = targetRect.bottom + offset;
      left = targetRect.right - popoverRect.width;
      arrowPosition = { top: -4, right: 16 };
      break;
    case 'left':
      top = targetRect.top + (targetRect.height - popoverRect.height) / 2;
      left = targetRect.left - popoverRect.width - offset;
      arrowPosition = { right: -4, top: popoverRect.height / 2 - 4 };
      break;
    case 'leftTop':
      top = targetRect.top;
      left = targetRect.left - popoverRect.width - offset;
      arrowPosition = { right: -4, top: 16 };
      break;
    case 'leftBottom':
      top = targetRect.bottom - popoverRect.height;
      left = targetRect.left - popoverRect.width - offset;
      arrowPosition = { right: -4, bottom: 16 };
      break;
    case 'right':
      top = targetRect.top + (targetRect.height - popoverRect.height) / 2;
      left = targetRect.right + offset;
      arrowPosition = { left: -4, top: popoverRect.height / 2 - 4 };
      break;
    case 'rightTop':
      top = targetRect.top;
      left = targetRect.right + offset;
      arrowPosition = { left: -4, top: 16 };
      break;
    case 'rightBottom':
      top = targetRect.bottom - popoverRect.height;
      left = targetRect.right + offset;
      arrowPosition = { left: -4, bottom: 16 };
      break;
  }

  return {
    top: top + window.scrollY,
    left: left + window.scrollX,
    arrowPosition,
  };
}

/**
 * Default close icon
 */
const CloseIcon: React.FC<{ onClick?: () => void }> = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      position: 'absolute',
      top: 8,
      right: 8,
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: 4,
      color: 'var(--tour-close-color)',
    }}
    aria-label="Close tour"
  >
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
    </svg>
  </button>
);

/**
 * Default indicators
 */
const DefaultIndicators: React.FC<{ current: number; total: number }> = ({
  current,
  total,
}) => (
  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
    {Array.from({ length: total }, (_, i) => (
      <div
        key={i}
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor:
            i === current
              ? 'var(--tour-indicator-active-color)'
              : 'var(--tour-indicator-color)',
          transition: 'background-color 0.2s',
        }}
      />
    ))}
  </div>
);

/**
 * Base Tour component using CSS variables.
 * This is extended by engine-specific implementations.
 */
export const BaseTour = forwardRef<HTMLDivElement, TourProps>((props, ref) => {
  const {
    steps,
    current: controlledCurrent,
    open = false,
    onChange,
    onClose,
    onFinish,
    type = TOUR_DEFAULTS.type!,
    mask = TOUR_DEFAULTS.mask,
    arrow = TOUR_DEFAULTS.arrow,
    placement: defaultPlacement = TOUR_DEFAULTS.placement!,
    zIndex = TOUR_DEFAULTS.zIndex!,
    gap = { offset: 8, radius: 4 },
    indicatorsRender,
    closeIcon,
    className = '',
    style = {},
  } = props;

  const [internalCurrent, setInternalCurrent] = useState(0);
  const [position, setPosition] = useState({
    top: 0,
    left: 0,
    arrowPosition: {} as { top?: number; left?: number; bottom?: number; right?: number },
  });
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const currentStep =
    controlledCurrent !== undefined ? controlledCurrent : internalCurrent;
  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;
  const isFirst = currentStep === 0;

  const stepPlacement = step?.placement || defaultPlacement;
  const showMask = step?.mask !== undefined ? step.mask : mask;
  const showArrow = step?.arrow !== undefined ? step.arrow : arrow;

  const updateCurrent = useCallback(
    (newCurrent: number) => {
      if (controlledCurrent === undefined) {
        setInternalCurrent(newCurrent);
      }
      onChange?.(newCurrent);
    },
    [controlledCurrent, onChange]
  );

  // Update target rect and position
  useEffect(() => {
    if (!open || !step) return;

    const targetEl = getTargetElement(step.target);
    const rect = targetEl?.getBoundingClientRect() || null;
    setTargetRect(rect);

    if (popoverRef.current) {
      const popoverRect = popoverRef.current.getBoundingClientRect();
      const pos = calculatePosition(rect, popoverRect, stepPlacement, gap);
      setPosition(pos);
    }

    // Scroll target into view
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [open, step, currentStep, stepPlacement, gap]);

  // Handle close
  const handleClose = () => {
    onClose?.();
  };

  // Handle next
  const handleNext = () => {
    if (isLast) {
      onFinish?.();
      handleClose();
    } else {
      step?.nextButtonProps?.onClick?.();
      updateCurrent(currentStep + 1);
    }
  };

  // Handle prev
  const handlePrev = () => {
    if (!isFirst) {
      step?.prevButtonProps?.onClick?.();
      updateCurrent(currentStep - 1);
    }
  };

  // CSS variables for tour
  const tourVars = useMemo<React.CSSProperties>(
    () =>
      ({
        '--tour-bg': type === 'primary' ? 'var(--color-primary)' : 'var(--color-bg-elevated, #fff)',
        '--tour-color': type === 'primary' ? '#fff' : 'var(--color-text-primary)',
        '--tour-border-radius': 'var(--radius-lg, 8px)',
        '--tour-shadow': 'var(--shadow-xl)',
        '--tour-padding': 'var(--spacing-4, 16px)',
        '--tour-min-width': '280px',
        '--tour-max-width': '400px',
        '--tour-title-font-size': '1rem',
        '--tour-title-font-weight': '600',
        '--tour-description-font-size': '0.875rem',
        '--tour-description-margin-top': 'var(--spacing-2, 8px)',
        '--tour-arrow-size': '8px',
        '--tour-close-color': type === 'primary' ? 'rgba(255,255,255,0.7)' : 'var(--color-text-secondary)',
        '--tour-indicator-color': type === 'primary' ? 'rgba(255,255,255,0.4)' : 'var(--color-border)',
        '--tour-indicator-active-color': type === 'primary' ? '#fff' : 'var(--color-primary)',
        '--tour-button-gap': 'var(--spacing-2, 8px)',
        '--tour-mask-color': 'rgba(0, 0, 0, 0.5)',
      }) as React.CSSProperties,
    [type]
  );

  // Button styles
  const buttonBaseStyle: React.CSSProperties = {
    padding: '6px 16px',
    fontSize: '0.875rem',
    borderRadius: 'var(--radius-md, 6px)',
    cursor: 'pointer',
    transition: 'background-color 0.2s, opacity 0.2s',
    border: 'none',
  };

  const prevButtonStyle: React.CSSProperties = {
    ...buttonBaseStyle,
    backgroundColor: type === 'primary' ? 'rgba(255,255,255,0.2)' : 'var(--color-bg-secondary)',
    color: type === 'primary' ? '#fff' : 'var(--color-text-primary)',
    border: type === 'primary' ? 'none' : '1px solid var(--color-border)',
  };

  const nextButtonStyle: React.CSSProperties = {
    ...buttonBaseStyle,
    backgroundColor: type === 'primary' ? '#fff' : 'var(--color-primary)',
    color: type === 'primary' ? 'var(--color-primary)' : '#fff',
  };

  if (!open || !step) return null;

  // Render mask with spotlight
  const renderMask = () => {
    if (!showMask) return null;

    const maskStyle =
      typeof showMask === 'object' ? showMask.style : undefined;
    const maskColor =
      typeof showMask === 'object' ? showMask.color : 'var(--tour-mask-color)';

    // Spotlight cutout if target exists
    if (targetRect) {
      const radius = gap.radius ?? 4;
      const padding = 4;
      const spotlightPath = `
        M 0 0
        H ${window.innerWidth}
        V ${window.innerHeight}
        H 0
        Z
        M ${targetRect.left - padding} ${targetRect.top - padding + radius}
        a ${radius} ${radius} 0 0 1 ${radius} ${-radius}
        h ${targetRect.width + padding * 2 - radius * 2}
        a ${radius} ${radius} 0 0 1 ${radius} ${radius}
        v ${targetRect.height + padding * 2 - radius * 2}
        a ${radius} ${radius} 0 0 1 ${-radius} ${radius}
        h ${-(targetRect.width + padding * 2 - radius * 2)}
        a ${radius} ${radius} 0 0 1 ${-radius} ${-radius}
        Z
      `;

      return (
        <svg
          style={{
            position: 'fixed',
            inset: 0,
            width: '100%',
            height: '100%',
            zIndex: zIndex - 1,
            pointerEvents: 'auto',
            ...maskStyle,
          }}
          onClick={handleClose}
        >
          <path d={spotlightPath} fill={maskColor} fillRule="evenodd" />
        </svg>
      );
    }

    // Full mask without spotlight
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: maskColor,
          zIndex: zIndex - 1,
          ...maskStyle,
        }}
        onClick={handleClose}
      />
    );
  };

  // Render tour content
  const tourContent = (
    <div
      ref={ref}
      className={`rottay-tour ${className}`}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex,
        pointerEvents: 'none',
        ...style,
      }}
    >
      {renderMask()}
      <div
        ref={popoverRef}
        className={`rottay-tour__popover ${step.className || ''}`}
        style={{
          ...tourVars,
          position: 'absolute',
          top: position.top,
          left: position.left,
          minWidth: 'var(--tour-min-width)',
          maxWidth: 'var(--tour-max-width)',
          padding: 'var(--tour-padding)',
          backgroundColor: 'var(--tour-bg)',
          color: 'var(--tour-color)',
          borderRadius: 'var(--tour-border-radius)',
          boxShadow: 'var(--tour-shadow)',
          pointerEvents: 'auto',
          ...step.style,
        }}
        role="dialog"
        aria-labelledby="tour-title"
      >
        {showArrow && stepPlacement !== 'center' && (
          <div
            className="rottay-tour__arrow"
            style={{
              position: 'absolute',
              width: 'var(--tour-arrow-size)',
              height: 'var(--tour-arrow-size)',
              backgroundColor: 'var(--tour-bg)',
              transform: 'rotate(45deg)',
              ...position.arrowPosition,
            }}
          />
        )}

        {closeIcon !== undefined ? (
          closeIcon
        ) : (
          <CloseIcon onClick={handleClose} />
        )}

        {step.cover && (
          <div
            className="rottay-tour__cover"
            style={{ marginBottom: 'var(--spacing-3, 12px)' }}
          >
            {step.cover}
          </div>
        )}

        <div
          id="tour-title"
          className="rottay-tour__title"
          style={{
            fontSize: 'var(--tour-title-font-size)',
            fontWeight: 'var(--tour-title-font-weight)' as any,
            paddingRight: 24,
          }}
        >
          {step.title}
        </div>

        {step.description && (
          <div
            className="rottay-tour__description"
            style={{
              fontSize: 'var(--tour-description-font-size)',
              marginTop: 'var(--tour-description-margin-top)',
              opacity: 0.85,
            }}
          >
            {step.description}
          </div>
        )}

        <div
          className="rottay-tour__footer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 'var(--spacing-4, 16px)',
          }}
        >
          <div className="rottay-tour__indicators">
            {indicatorsRender
              ? indicatorsRender(currentStep, steps.length)
              : (
                  <DefaultIndicators current={currentStep} total={steps.length} />
                )}
          </div>

          <div
            className="rottay-tour__buttons"
            style={{ display: 'flex', gap: 'var(--tour-button-gap)' }}
          >
            {!isFirst && (
              <button
                type="button"
                className="rottay-tour__prev-btn"
                onClick={handlePrev}
                style={prevButtonStyle}
              >
                {step.prevButtonProps?.children || 'Previous'}
              </button>
            )}
            <button
              type="button"
              className="rottay-tour__next-btn"
              onClick={handleNext}
              style={nextButtonStyle}
            >
              {step.nextButtonProps?.children || (isLast ? 'Finish' : 'Next')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (typeof document !== 'undefined') {
    return createPortal(tourContent, document.body);
  }
  return null;
});

BaseTour.displayName = 'BaseTour';
