import React, { useState, useCallback } from 'react';
import { Tour, theme } from 'antd';
import type { TourProps, TourStepProps } from 'antd';

export interface GuidedTourStep extends Omit<TourStepProps, 'target'> {
  target?: (() => HTMLElement | null) | (() => HTMLElement) | HTMLElement | null;
  title: React.ReactNode;
  description?: React.ReactNode;
}

export interface GuidedTourProps extends Omit<TourProps, 'steps'> {
  steps: GuidedTourStep[];
  autoStart?: boolean;
  onComplete?: () => void;
  onSkip?: () => void;
  showProgress?: boolean;
  allowSkip?: boolean;
  skipText?: string;
  finishText?: string;
  nextText?: string;
  prevText?: string;
}

export const GuidedTour: React.FC<GuidedTourProps> = ({
  steps,
  autoStart = false,
  onComplete,
  onSkip,
  showProgress = true,
  allowSkip = true,
  skipText = 'Skip Tour',
  finishText = 'Finish',
  nextText = 'Next',
  prevText = 'Previous',
  open: controlledOpen,
  onChange,
  ...tourProps
}) => {
  const { token } = theme.useToken();
  const [internalOpen, setInternalOpen] = useState(autoStart);
  const [_current, setCurrent] = useState(0);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const handleChange = useCallback(
    (currentStep: number) => {
      setCurrent(currentStep);
      onChange?.(currentStep);
    },
    [onChange]
  );

  const handleFinish = useCallback(() => {
    if (!isControlled) {
      setInternalOpen(false);
    }
    setCurrent(0);
    onComplete?.();
  }, [isControlled, onComplete]);

  const enhancedSteps: TourStepProps[] = steps.map((step, index) => {
    const isLast = index === steps.length - 1;
    const isFirst = index === 0;

    const { target, ...restStep } = step;
    const validTarget = target instanceof HTMLElement || target === null || target === undefined
      ? target
      : typeof target === 'function'
        ? () => {
            const result = target();
            return result || null;
          }
        : null;

    return {
      ...restStep,
      target: validTarget as HTMLElement | (() => HTMLElement) | (() => null) | null | undefined,
      title: showProgress ? (
        <div>
          <div style={{ fontSize: '12px', color: token.colorTextSecondary, marginBottom: '4px' }}>
            Step {index + 1} of {steps.length}
          </div>
          {step.title}
        </div>
      ) : (
        step.title
      ),
      nextButtonProps: isLast
        ? {
            children: finishText,
            onClick: handleFinish,
          }
        : {
            children: nextText,
          },
      prevButtonProps: isFirst
        ? undefined
        : {
            children: prevText,
          },
    };
  });

  return (
    <Tour
      open={open}
      onChange={handleChange}
      steps={enhancedSteps}
      {...tourProps}
    />
  );
};

GuidedTour.displayName = 'GuidedTour';

// Hook to control GuidedTour
export const useGuidedTour = () => {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(0);

  const start = useCallback(() => {
    setOpen(true);
    setCurrent(0);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setCurrent(0);
  }, []);

  const next = useCallback(() => {
    setCurrent((prev) => prev + 1);
  }, []);

  const prev = useCallback(() => {
    setCurrent((prev) => Math.max(0, prev - 1));
  }, []);

  const goTo = useCallback((step: number) => {
    setCurrent(step);
  }, []);

  return {
    open,
    current,
    start,
    close,
    next,
    prev,
    goTo,
    setOpen,
    setCurrent,
  };
};
