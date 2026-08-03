'use client';

/**
 * @fileoverview Modern engine for the StepWizard pattern using the token-driven skin.
 * Renders clean step indicators with connecting lines, a card-like content area,
 * and a navigation bar with ghost/primary buttons. Supports horizontal and vertical
 * orientations, per-step async validation, and controlled or uncontrolled step state.
 *
 * Paint and interaction states live in the unlayered modern skin; remaining
 * inline values are structural or instance-dependent.
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

import React, { useState } from 'react';
import { StickyWizardActions } from '../../runtime/sticky-actions';
import type { StepWizardProps } from '../../contracts';
import ModernButton from '../../../../../primitives/inputs/Button/engines/modern';
import ModernProgress from '../../../../../primitives/feedback/Progress/engines/modern';
import ModernSteps from '../../../../../primitives/navigation/Steps/engines/modern';
import { VisuallyHidden } from '../../../../../primitives/foundation/VisuallyHidden';
import { StatusErrorIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-error';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';

/* ---------------------------------------------------------------------------
 * Shared constants
 * -------------------------------------------------------------------------*/

const ROOT_CLASS_NAME = 'ds-pattern-step-wizard ds-engine-modern';

/** Hook-local `tOr`: catalogue value with an English floor, never a raw key. */
function useStepWizardTranslation() {
  const i18n = useOptionalTranslation('components');
  const tOr = (key: string, fallback: string, params?: Record<string, string | number>): string => {
    const resolved = i18n?.t(key, params);
    if (!resolved || resolved === key || resolved === `components.${key}`) return fallback;
    return resolved;
  };
  return { tOr };
}

/* ---------------------------------------------------------------------------
 * ModernStepWizard
 * -------------------------------------------------------------------------*/

/**
 * Modern engine for the StepWizard pattern using the token-driven modern skin.
 *
 * Renders a card with step indicators (numbered dots with connecting lines),
 * a content area, and navigation buttons. The progress bar uses DS token CSS
 * variables for colors and transitions smoothly via CSS.
 *
 * @param props - {@link StepWizardProps}
 * @returns A card containing the step wizard.
 */
export default function ModernStepWizard(props: StepWizardProps) {
  const { tOr } = useStepWizardTranslation();
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
    progressPosture = 'rail',
    formatProgressLabel,
    actionPosture = 'inline',
    nextLabel: nextLabelProp,
    prevLabel: prevLabelProp,
    completeLabel: completeLabelProp,
    skipLabel: skipLabelProp,
    footer,
    loading,
    className,
    style,
  } = props;

  // Copy defaults: explicit props win; otherwise localized labels with the
  // historical English defaults as the floor (tests are pinned to them).
  const nextLabel = nextLabelProp ?? tOr('step_wizard.next', 'Next');
  const prevLabel = prevLabelProp ?? tOr('step_wizard.prev', 'Back');
  const completeLabel = completeLabelProp ?? tOr('step_wizard.complete', 'Complete');
  const skipLabel = skipLabelProp ?? tOr('step_wizard.skip', 'Skip');

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
  const stickyActions = actionPosture === 'sticky-bottom';
  const progressLabel =
    formatProgressLabel?.({
      current: current + 1,
      total: steps.length,
      title: currentDef?.title ?? '',
    }) ?? tOr('step_wizard.progress', 'Step {current} of {total}: {title}', {
      current: current + 1,
      total: steps.length,
      title: currentDef?.title ?? '',
    });
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

      setValidationMessage(typeof result === 'string' ? result : tOr('step_wizard.validation_default', 'Please complete this step before continuing.'));

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
        data-part="root"
        data-loading="true"
        className={[ROOT_CLASS_NAME, 'ds-step-wizard-skeleton', className].filter(Boolean).join(' ')}
        style={style}
        role="status"
        aria-busy="true"
      >
        {/* The shimmer is paint-only; the live region needs real text to
            announce (EmptyState's loading-label precedent). */}
        <VisuallyHidden>
          {tOr('step_wizard.loading', 'Loading wizard…')}
        </VisuallyHidden>
        <div data-part="body">
          {/* Shimmer bar for step indicators -- animation and geometry are
              skin-owned so reduced-motion and density govern (inline would
              win over both). */}
          <div
            data-part="skeleton-progress"
            className="ds-step-wizard-skeleton__progress"
          />
          {/* Shimmer block for content */}
          <div
            data-part="skeleton-content"
            className="ds-step-wizard-skeleton__content"
          />
        </div>
      </div>
    );
  }

  /* -- Step rail ----------------------------------------------------------
   * The rail is the public Steps navigation primitive (single paint owner,
   * keyboard-reachable anatomy, skin-owned connectors). Display-only here:
   * wizard navigation happens through the nav buttons, so no onChange is
   * passed and steps render non-clickable, matching the previous divs.
   * ---------------------------------------------------------------------- */

  const isVertical = orientation === 'vertical';

  /* -- Error display ------------------------------------------------------ */

  const errorDisplay = validationMessage ? (
    /* role=alert: the message appears on a failed advance, so the assertive
       announcement fires exactly when the user needs it. */
    <div data-part="error-panel" role="alert">
      <StatusErrorIcon decorative size={14} />
      <span>{validationMessage}</span>
    </div>
  ) : null;

  /* -- Navigation buttons ------------------------------------------------- */

  const navDisabled = isValidating || actionsDisabled;

  const navigationContent = (
    <div data-part="nav-bar">
      {/* Left side: Previous -- always rendered, disabled on the first step
          (honest affordance: the control never appears/disappears between
          steps, so the nav bar keeps its geometry). */}
      <div>
        <ModernButton
          data-part="prev-button"
          variant="outline"
          size="md"
          disabled={current === 0 || navDisabled}
          onClick={() => setCurrent(current - 1)}
        >
          {prevLabel}
        </ModernButton>
      </div>

      {/* Right side: Footer + Skip + Next/Complete */}
      <div data-part="nav-actions">
        {footer}

        {/* Skip: shown for optional steps that are not the final step */}
        {allowSkip && currentDef?.optional && !isLast && (
          <ModernButton
            data-part="skip-button"
            variant="text"
            size="md"
            disabled={navDisabled}
            onClick={() => setCurrent(current + 1)}
          >
            {skipLabel}
          </ModernButton>
        )}

        {isLast ? (
          showCompleteAction ? (
            <ModernButton
              data-part="complete-button"
              variant="primary"
              size="md"
              disabled={navDisabled || completeDisabled}
              loading={isValidating}
              onClick={handleComplete}
            >
              {completeLabel}
            </ModernButton>
          ) : null
        ) : (
          <ModernButton
            data-part="next-button"
            variant="primary"
            size="md"
            disabled={navDisabled}
            loading={isValidating}
            onClick={handleAdvance}
          >
            {nextLabel}
          </ModernButton>
        )}
      </div>
    </div>
  );

  const navigationBar = stickyActions ? (
    <StickyWizardActions>
      {navigationContent}
    </StickyWizardActions>
  ) : (
    navigationContent
  );

  /* -- Render ------------------------------------------------------------- */

  return (
    <div
      data-part="root"
      data-action-posture={actionPosture}
      data-progress-posture={progressPosture}
      className={[ROOT_CLASS_NAME, className].filter(Boolean).join(' ')}
      style={style}
    >
      <div data-part="body">
        {/* Compact posture retains a live, named progress status. */}
        {showProgress && progressPosture === 'counter' && (
          <div data-part="step-counter" role="status" aria-live="polite" aria-label={progressLabel}>
            {progressLabel}
          </div>
        )}

        {/* Progress bar (subtle, at the very top): compose the canonical
            meter primitive instead of recreating progressbar semantics. */}
        {showProgress && progressPosture === 'rail' && (
          <ModernProgress
            percent={progress}
            showInfo={false}
            className="ds-step-wizard__progress"
            aria-label={progressLabel}
          />
        )}

        {/* Step rail: the public Steps primitive (display-only -- wizard
            navigation happens through the nav buttons, so no onChange). */}
        {showProgress && progressPosture === 'rail' && !isVertical && (
          <div data-part="step-rail" data-orientation="horizontal">
            <ModernSteps
              items={steps.map((s) => ({ title: s.title, description: s.description }))}
              current={current}
              direction="horizontal"
              size="small"
              responsive
            />
          </div>
        )}

        {/* Vertical layout: indicators alongside content */}
        {showProgress && progressPosture === 'rail' && isVertical ? (
          <div data-part="wizard-split">
            {/* Vertical step rail */}
            <div data-part="step-rail" data-orientation="vertical">
              <ModernSteps
                items={steps.map((s) => ({ title: s.title, description: s.description }))}
                current={current}
                direction="vertical"
                size="small"
              />
            </div>

            {/* Content area -- keyed per step so the skin's enter cadence
                replays on every transition (geometry preserved: the slot
                keeps its min-block-size). */}
            <div data-part="main">
              <div data-part="content" key={currentDef?.key}>
                {currentDef?.content}
              </div>
              {errorDisplay}
              {navigationBar}
            </div>
          </div>
        ) : (
          <>
            {/* Horizontal: content below the step indicators (same keyed
                enter cadence as the vertical split). */}
            <div data-part="content" key={currentDef?.key}>
              {currentDef?.content}
            </div>
            {errorDisplay}
            {navigationBar}
          </>
        )}
      </div>
    </div>
  );
}
