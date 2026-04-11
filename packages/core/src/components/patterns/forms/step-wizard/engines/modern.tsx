'use client';

/**
 * @fileoverview Modern engine for the StepWizard pattern using DS token inline styles.
 * Renders clean step indicators with connecting lines, a card-like content area,
 * and a navigation bar with ghost/primary buttons. Supports horizontal and vertical
 * orientations, per-step async validation, and controlled or uncontrolled step state.
 *
 * All styling uses DS token CSS variables -- no DaisyUI or Tailwind classes.
 *
 * @example
 * <ModernStepWizard
 *   steps={[
 *     { key: 'details', title: 'Details', content: <DetailsForm /> },
 *     { key: 'confirm', title: 'Confirm', content: <ConfirmStep /> },
 *   ]}
 *   onComplete={() => submit()}
 *   orientation="vertical"
 * />
 */

import React, { useState, type CSSProperties } from 'react';
import type { StepWizardProps } from '../StepWizard.types';

/* ---------------------------------------------------------------------------
 * Inline SVG icons
 * -------------------------------------------------------------------------*/

/** Checkmark icon for completed steps */
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <path
      d="M3 8l3.5 3.5L13 5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/** Small inline SVG error icon (circle-exclamation) */
const ErrorIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
    <path d="M8 4.5v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="8" cy="11" r="0.75" fill="currentColor" />
  </svg>
);

/* ---------------------------------------------------------------------------
 * Shared style constants (DS tokens)
 * -------------------------------------------------------------------------*/

const cardStyle: CSSProperties = {
  background: 'var(--ds-surface-card)',
  boxShadow: 'var(--ds-elevation-1)',
  borderRadius: 'var(--ds-radius-lg)',
  overflow: 'hidden',
};

const contentAreaStyle: CSSProperties = {
  minHeight: 200,
  padding: '24px 0',
};

const ghostButtonBase: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: 36,
  padding: '0 16px',
  fontSize: 14,
  fontWeight: 500,
  lineHeight: '20px',
  color: 'var(--ds-color-text-primary)',
  background: 'transparent',
  border: '1px solid var(--ds-color-border)',
  borderRadius: 'var(--ds-radius-md)',
  cursor: 'pointer',
  transition: `background var(--ds-motion-fast) var(--ds-motion-ease-out),
               border-color var(--ds-motion-fast) var(--ds-motion-ease-out),
               opacity var(--ds-motion-fast) var(--ds-motion-ease-out)`,
};

const primaryButtonBase: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: 36,
  padding: '0 20px',
  fontSize: 14,
  fontWeight: 500,
  lineHeight: '20px',
  color: 'var(--ds-color-text-on-primary)',
  background: 'var(--ds-color-primary)',
  border: 'none',
  borderRadius: 'var(--ds-radius-md)',
  cursor: 'pointer',
  transition: `background var(--ds-motion-fast) var(--ds-motion-ease-out),
               opacity var(--ds-motion-fast) var(--ds-motion-ease-out)`,
};

const linkButtonBase: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: 36,
  padding: '0 12px',
  fontSize: 14,
  fontWeight: 500,
  lineHeight: '20px',
  color: 'var(--ds-color-text-muted)',
  background: 'transparent',
  border: 'none',
  borderRadius: 'var(--ds-radius-md)',
  cursor: 'pointer',
  textDecoration: 'none',
  transition: `color var(--ds-motion-fast) var(--ds-motion-ease-out),
               opacity var(--ds-motion-fast) var(--ds-motion-ease-out)`,
};

const disabledOverride: CSSProperties = {
  opacity: 0.45,
  cursor: 'not-allowed',
  pointerEvents: 'none' as const,
};

/* ---------------------------------------------------------------------------
 * ModernStepWizard
 * -------------------------------------------------------------------------*/

/**
 * Modern engine for the StepWizard pattern using DS token inline styles.
 *
 * Renders a card with step indicators (numbered dots with connecting lines),
 * a content area, and navigation buttons. The progress bar uses DS token CSS
 * variables for colors and transitions smoothly via CSS.
 *
 * @param props - {@link StepWizardProps}
 * @returns A card containing the step wizard.
 */
export default function ModernStepWizard(props: StepWizardProps) {
  const {
    steps,
    currentStep: controlledStep,
    onStepChange,
    onComplete,
    actionsDisabled = false,
    completeDisabled = false,
    showCompleteAction = true,
    allowSkip = false,
    showProgress = true,
    orientation = 'horizontal',
    nextLabel = 'Next',
    prevLabel = 'Back',
    completeLabel = 'Complete',
    skipLabel = 'Skip',
    footer,
    loading,
    className,
    style,
  } = props;

  // Controlled/uncontrolled step index
  const [internalStep, setInternalStep] = useState(0);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const current = controlledStep ?? internalStep;

  // Clear stale validation messages whenever the step changes
  const setCurrent = (step: number) => {
    if (controlledStep == null) setInternalStep(step);
    onStepChange?.(step);
    setValidationMessage(null);
  };

  const isLast = current === steps.length - 1;
  const currentDef = steps[current];
  // Progress percentage: 1-based so step 1 of 3 shows 33%, not 0%.
  const progress = Math.round(((current + 1) / steps.length) * 100);

  /**
   * Runs the active step's async `validate` function (if defined).
   * Returns `true` when valid, `false` when validation fails.
   */
  const validateCurrentStep = async (): Promise<boolean> => {
    if (!currentDef?.validate) {
      setValidationMessage(null);
      return true;
    }

    setIsValidating(true);

    try {
      const result = await currentDef.validate();

      if (result === true || result === undefined) {
        setValidationMessage(null);
        return true;
      }

      setValidationMessage(
        typeof result === 'string'
          ? result
          : 'Please complete this step before continuing.'
      );

      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const handleAdvance = async () => {
    const isValid = await validateCurrentStep();
    if (!isValid) return;
    setCurrent(current + 1);
  };

  const handleComplete = async () => {
    const isValid = await validateCurrentStep();
    if (!isValid) return;
    await onComplete?.();
  };

  /* -- Loading skeleton --------------------------------------------------- */

  if (loading) {
    return (
      <div
        className={className ?? ''}
        style={{ ...cardStyle, ...style }}
      >
        <div style={{ padding: 24 }}>
          {/* Shimmer bar for step indicators */}
          <div
            style={{
              height: 8,
              borderRadius: 'var(--ds-radius-full)',
              background: 'var(--ds-surface-panel)',
              marginBottom: 24,
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }}
          />
          {/* Shimmer block for content */}
          <div
            style={{
              height: 200,
              borderRadius: 'var(--ds-radius-md)',
              background: 'var(--ds-surface-panel)',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }}
          />
          <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
        </div>
      </div>
    );
  }

  /* -- Step indicator rendering ------------------------------------------ */

  const isVertical = orientation === 'vertical';

  const renderStepIndicator = (index: number) => {
    const stepDef = steps[index];
    const isActive = index === current;
    const isCompleted = index < current;

    const indicatorSize = 32;

    // Determine indicator colors
    const indicatorBg = isActive
      ? 'var(--ds-color-primary)'
      : isCompleted
        ? 'var(--ds-color-primary)'
        : 'var(--ds-surface-panel)';
    const indicatorColor = isActive || isCompleted
      ? 'var(--ds-color-text-on-primary)'
      : 'var(--ds-color-text-muted)';
    const indicatorBorder = isActive || isCompleted
      ? 'none'
      : '2px solid var(--ds-color-border-secondary)';

    return (
      <div
        key={stepDef.key}
        style={{
          display: 'flex',
          flexDirection: isVertical ? 'row' : 'column',
          alignItems: 'center',
          gap: 8,
          minWidth: isVertical ? undefined : 0,
          flex: isVertical ? undefined : 1,
        }}
      >
        {/* Indicator circle */}
        <div
          style={{
            width: indicatorSize,
            height: indicatorSize,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            fontWeight: 600,
            background: indicatorBg,
            color: indicatorColor,
            border: indicatorBorder,
            flexShrink: 0,
            transition: `all var(--ds-motion-normal) var(--ds-motion-ease-out)`,
            boxShadow: isActive ? '0 0 0 4px color-mix(in srgb, var(--ds-color-primary) 20%, transparent)' : 'none',
          }}
        >
          {isCompleted ? <CheckIcon /> : index + 1}
        </div>

        {/* Label area */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: isVertical ? 'flex-start' : 'center',
            gap: 2,
            minWidth: 0,
          }}
        >
          <span
            style={{
              fontSize: 13,
              fontWeight: isActive ? 600 : 400,
              color: isActive
                ? 'var(--ds-color-text-primary)'
                : isCompleted
                  ? 'var(--ds-color-text-secondary)'
                  : 'var(--ds-color-text-muted)',
              lineHeight: '18px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: isVertical ? 160 : '100%',
              transition: `color var(--ds-motion-fast) var(--ds-motion-ease-out)`,
            }}
          >
            {stepDef.title}
          </span>
          {stepDef.description && (
            <span
              style={{
                fontSize: 11,
                color: 'var(--ds-color-text-muted)',
                lineHeight: '14px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: isVertical ? 160 : '100%',
              }}
            >
              {stepDef.description}
            </span>
          )}
        </div>
      </div>
    );
  };

  /** Connecting line between step indicators */
  const renderConnector = (index: number) => {
    const isCompleted = index < current;

    if (isVertical) {
      return (
        <div
          key={`connector-${index}`}
          style={{
            width: 2,
            flex: 1,
            minHeight: 24,
            marginLeft: 15, // center on 32px indicator
            background: isCompleted
              ? 'var(--ds-color-primary)'
              : 'var(--ds-color-border-secondary)',
            transition: `background var(--ds-motion-normal) var(--ds-motion-ease-out)`,
          }}
        />
      );
    }

    return (
      <div
        key={`connector-${index}`}
        style={{
          flex: 1,
          height: 2,
          minWidth: 16,
          background: isCompleted
            ? 'var(--ds-color-primary)'
            : 'var(--ds-color-border-secondary)',
          transition: `background var(--ds-motion-normal) var(--ds-motion-ease-out)`,
          marginTop: isVertical ? 0 : 16, // align with center of 32px indicator
        }}
      />
    );
  };

  /* -- Build step rail ---------------------------------------------------- */

  const stepRailItems: React.ReactNode[] = [];
  steps.forEach((_, i) => {
    if (i > 0) stepRailItems.push(renderConnector(i));
    stepRailItems.push(renderStepIndicator(i));
  });

  /* -- Error display ------------------------------------------------------ */

  const errorDisplay = validationMessage ? (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        padding: '12px 16px',
        marginTop: 16,
        background: 'color-mix(in srgb, var(--ds-color-error) 8%, transparent)',
        border: '1px solid color-mix(in srgb, var(--ds-color-error) 25%, transparent)',
        borderRadius: 'var(--ds-radius-md)',
        color: 'var(--ds-color-error)',
        fontSize: 14,
        lineHeight: '20px',
      }}
    >
      <ErrorIcon />
      <span>{validationMessage}</span>
    </div>
  ) : null;

  /* -- Navigation buttons ------------------------------------------------- */

  const navDisabled = isValidating || actionsDisabled;

  const navigationBar = (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 24,
        paddingTop: 20,
        borderTop: '1px solid var(--ds-color-border)',
      }}
    >
      {/* Left side: Previous */}
      <div>
        {current > 0 && (
          <button
            type="button"
            disabled={navDisabled}
            onClick={() => setCurrent(current - 1)}
            style={{
              ...ghostButtonBase,
              ...(navDisabled ? disabledOverride : {}),
            }}
          >
            {prevLabel}
          </button>
        )}
      </div>

      {/* Right side: Footer + Skip + Next/Complete */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {footer}

        {/* Skip: shown for optional steps that are not the final step */}
        {allowSkip && currentDef?.optional && !isLast && (
          <button
            type="button"
            disabled={navDisabled}
            onClick={() => setCurrent(current + 1)}
            style={{
              ...linkButtonBase,
              ...(navDisabled ? disabledOverride : {}),
            }}
          >
            {skipLabel}
          </button>
        )}

        {isLast ? (
          showCompleteAction ? (
            <button
              type="button"
              disabled={navDisabled || completeDisabled}
              onClick={handleComplete}
              style={{
                ...primaryButtonBase,
                ...(navDisabled || completeDisabled ? disabledOverride : {}),
              }}
            >
              {completeLabel}
            </button>
          ) : null
        ) : (
          <button
            type="button"
            disabled={navDisabled}
            onClick={handleAdvance}
            style={{
              ...primaryButtonBase,
              ...(navDisabled ? disabledOverride : {}),
            }}
          >
            {nextLabel}
          </button>
        )}
      </div>
    </div>
  );

  /* -- Render ------------------------------------------------------------- */

  return (
    <div
      className={className ?? ''}
      style={{ ...cardStyle, ...style }}
    >
      <div style={{ padding: 24 }}>
        {/* Progress bar (subtle, at the very top) */}
        {showProgress && (
          <div
            style={{
              width: '100%',
              height: 4,
              borderRadius: 'var(--ds-radius-full)',
              background: 'var(--ds-surface-panel)',
              marginBottom: 24,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                borderRadius: 'var(--ds-radius-full)',
                background: 'var(--ds-color-primary)',
                width: `${progress}%`,
                transition: `width var(--ds-motion-normal) var(--ds-motion-ease-out)`,
              }}
            />
          </div>
        )}

        {/* Step indicators */}
        {showProgress && !isVertical && (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              marginBottom: 28,
            }}
          >
            {stepRailItems}
          </div>
        )}

        {/* Vertical layout: indicators alongside content */}
        {showProgress && isVertical ? (
          <div style={{ display: 'flex', gap: 32 }}>
            {/* Vertical step rail */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                flexShrink: 0,
                width: 180,
              }}
            >
              {stepRailItems}
            </div>

            {/* Content area */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={contentAreaStyle}>{currentDef?.content}</div>
              {errorDisplay}
              {navigationBar}
            </div>
          </div>
        ) : (
          <>
            {/* Horizontal: content below the step indicators */}
            <div style={contentAreaStyle}>{currentDef?.content}</div>
            {errorDisplay}
            {navigationBar}
          </>
        )}
      </div>
    </div>
  );
}
