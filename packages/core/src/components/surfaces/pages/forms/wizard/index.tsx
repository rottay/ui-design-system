'use client';

/**
 * @fileoverview WizardSurface -- multi-step guided flow page shell.
 * @description Distinct from FormSurface (single-page form): WizardSurface handles
 * ordered step progression, step validation gating, and back/next navigation.
 * The app owns step content, fields, and domain-specific validation.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Card, Flex, Grid, Stack, Text } from '../../../../primitives';
import { PatternFormBuilder, PatternStepWizard } from '../../../../patterns';
import { FadeIn, SlideIn } from '../../../../../motion';
import { useUnsavedChangesGuard } from '../../../../../hooks/form';
import { filterSurfaceFields, resolveSurfaceAction, resolveSurfaceButtonVariant } from '../../../foundation/helpers';
import { useSurfaceTranslations } from '../../../foundation/i18n';
import { useSurfaceProfileDefaults } from '../../../foundation/profile-defaults';
import { resolveStackSpacing, SurfaceAccentBarWrapper } from '../../../foundation/personality-helpers';
import type {
  WizardSurfaceConfig,
  WizardSurfaceStepConfig,
  WizardSurfaceStepRenderContext,
} from '../../../foundation/types';
import { PageShellSurface } from '../../../layout/page-shell';
import { useSurfaceResponsiveLayout } from '../../../foundation/responsive';
import { SurfaceEmptyState, SurfaceErrorState } from '../../../foundation/states';

function readWizardStepErrors(
  errors: Record<string, Record<string, string>>,
  stepKey: string
): Record<string, string> | undefined {
  return Reflect.get(errors, stepKey) as Record<string, string> | undefined;
}

function renderWizardStepContent(
  step: WizardSurfaceStepConfig,
  context: WizardSurfaceStepRenderContext,
  config: WizardSurfaceConfig,
  onValidationChange: (errors: Record<string, string>) => void,
  tSurface: (key: string, params?: Record<string, string | number>) => string,
  options: {
    cardVariant: 'outlined' | 'elevated' | 'filled' | 'ghost';
    animateEntrance: boolean;
    entranceDuration: number;
  }
): React.ReactNode {
  const contentNode = typeof step.content === 'function' ? step.content(context) : step.content;

  const visibleFields = filterSurfaceFields(step.fields ?? [], config.access ?? config.permissions);

  /**
   * A wizard step can be:
   * - custom content only
   * - fields only
   * - both
   *
   * We intentionally support all three so product teams do not have to fork
   * the wizard surface as soon as one step needs richer layout.
   */
  if (!contentNode && visibleFields.length === 0) {
    return (
      <SurfaceEmptyState
        title={tSurface('wizard.empty_step_title')}
        description={tSurface('wizard.empty_step_description')}
      />
    );
  }

  const stepContent = (
    <Stack spacing="lg">
      {contentNode}

      {visibleFields.length > 0 && (
        <Card variant={options.cardVariant}>
          <Card.Body>
            <PatternFormBuilder
              fields={visibleFields}
              layout={step.layout ?? 'vertical'}
              columns={step.columns}
              autoAdaptive
              renderField={config.presentation.renderField}
              onSubmit={() => undefined}
              onValidationChange={onValidationChange}
              onChange={context.setValues}
              values={context.values}
              disabled={config.behavior.disabled}
              readOnly={config.behavior.readOnly}
              showLabels={config.behavior.showLabels}
              showRequired={config.behavior.showRequired}
            />
          </Card.Body>
        </Card>
      )}
    </Stack>
  );

  if (options.animateEntrance) {
    return (
      <SlideIn direction="up" distance={16} durationMs={options.entranceDuration}>
        {stepContent}
      </SlideIn>
    );
  }

  return stepContent;
}

export interface WizardSurfaceProps {
  config: WizardSurfaceConfig;
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void | Promise<void>;
}

export function WizardSurface({ config, loading = false, error, onRetry }: WizardSurfaceProps): React.ReactElement {
  const { tSurface } = useSurfaceTranslations();
  const profileDefaults = useSurfaceProfileDefaults();
  const { shouldStack, isMobile, hasResolvedViewport } = useSurfaceResponsiveLayout(config.visual);
  const resolvedMobile = hasResolvedViewport && isMobile;
  const dirtyState = config.behavior.dirtyState;
  const { requestDiscard } = useUnsavedChangesGuard({
    isDirty: dirtyState?.isDirty ?? false,
    message: dirtyState?.message ?? tSurface('wizard.discard_changes'),
    confirmDiscard: dirtyState?.confirmDiscard,
    onDiscard: dirtyState?.onDiscard,
    onBlocked: dirtyState?.onBlocked,
  });
  const sectionSpacing = resolveStackSpacing(profileDefaults.sectionSpacing);
  // The wizard supports both controlled (app owns values + step) and
  // uncontrolled (surface manages them) modes. Controlled mode is common
  // when the wizard integrates with external state management (e.g. Zustand).
  const [internalValues, setInternalValues] = useState<Record<string, unknown>>(config.behavior.initialValues ?? {});
  const [internalStep, setInternalStep] = useState(config.behavior.currentStep ?? 0);
  // Step errors are keyed by step.key so validation state persists when
  // navigating between steps. This lets users fix errors on a previous step
  // without losing validation feedback.
  const [stepErrors, setStepErrors] = useState<Record<string, Record<string, string>>>({});

  const isControlledValues = config.behavior.values !== undefined;
  const resolvedValues = isControlledValues ? config.behavior.values ?? {} : internalValues;
  const currentStep = config.behavior.currentStep ?? internalStep;

  useEffect(() => {
    if (!isControlledValues) {
      setInternalValues(config.behavior.initialValues ?? {});
    }
  }, [config.behavior.initialValues, isControlledValues]);

  useEffect(() => {
    if (config.behavior.currentStep !== undefined) {
      setInternalStep(config.behavior.currentStep);
    }
  }, [config.behavior.currentStep]);

  const setValues = useCallback(
    (values: Record<string, unknown>) => {
      if (!isControlledValues) {
        setInternalValues(values);
      }

      config.behavior.onChange?.(values);
    },
    [config.behavior, isControlledValues]
  );

  const goToStep = useCallback(
    (step: number) => {
      if (config.behavior.currentStep === undefined) {
        setInternalStep(step);
      }

      config.behavior.onStepChange?.(step);
    },
    [config.behavior]
  );

  const visibleSteps = useMemo(() => {
    return config.behavior.steps.map((step, stepIndex) => {
      const context: WizardSurfaceStepRenderContext = {
        values: resolvedValues,
        currentStep,
        stepIndex,
        isLastStep: stepIndex === config.behavior.steps.length - 1,
        setValues,
        goToStep,
      };

      return {
        ...step,
        renderedContent: renderWizardStepContent(
          step,
          context,
          config,
          (errors: Record<string, string>) => {
            setStepErrors((previous) => ({
              ...previous,
              [step.key]: errors,
            }));

            config.behavior.onValidationChange?.(errors);
          },
          tSurface,
          {
            cardVariant: profileDefaults.cardVariant,
            animateEntrance: profileDefaults.animateEntrance,
            entranceDuration: profileDefaults.entranceDuration,
          }
        ),
      };
    });
  }, [
    config,
    currentStep,
    goToStep,
    resolvedValues,
    setValues,
    tSurface,
    profileDefaults.cardVariant,
    profileDefaults.animateEntrance,
    profileDefaults.entranceDuration,
  ]);

  const activeContext: WizardSurfaceStepRenderContext = {
    values: resolvedValues,
    currentStep,
    stepIndex: currentStep,
    isLastStep: currentStep === visibleSteps.length - 1,
    setValues,
    goToStep,
  };

  // Footer can be a static ReactNode or a function that receives the
  // current wizard context (values, step index), enabling dynamic content
  // like "Step 2 of 5" or conditional help text.
  const footerNode =
    typeof config.presentation.footer === 'function'
      ? config.presentation.footer(activeContext)
      : config.presentation.footer;

  const cancelAction = resolveSurfaceAction(config.behavior.cancelAction, config.access ?? config.permissions);
  const saveDraftAction = resolveSurfaceAction(config.behavior.saveDraftAction, config.access ?? config.permissions);
  const submitAction = resolveSurfaceAction(config.behavior.submitAction, config.access ?? config.permissions);

  const wizardFooter = (
    <Flex gap={8} wrap="wrap" justify="end">
      {cancelAction && (
        <Button
          variant={resolveSurfaceButtonVariant(cancelAction.variant)}
          disabled={cancelAction.disabled}
          loading={cancelAction.loading}
          onClick={() => {
            if (requestDiscard('cancel')) {
              cancelAction.onClick?.(undefined as void);
            }
          }}
        >
          {cancelAction.icon}
          <Text style={{ marginLeft: cancelAction.icon ? 8 : 0 }}>{cancelAction.label}</Text>
        </Button>
      )}

      {saveDraftAction && (
        <Button
          variant={resolveSurfaceButtonVariant(saveDraftAction.variant)}
          disabled={config.behavior.disabled || saveDraftAction.disabled}
          loading={saveDraftAction.loading}
          onClick={() => saveDraftAction.onClick?.(resolvedValues)}
        >
          {saveDraftAction.icon}
          <Text style={{ marginLeft: saveDraftAction.icon ? 8 : 0 }}>{saveDraftAction.label}</Text>
        </Button>
      )}

      {footerNode}
    </Flex>
  );

  const chrome = {
    ...config.presentation.chrome,
    maxWidth: config.visual.maxWidth ?? config.presentation.chrome.maxWidth,
  };

  if (error) {
    return (
      <PageShellSurface chrome={chrome} loading={false}>
        <SurfaceErrorState error={error} onRetry={onRetry} />
      </PageShellSurface>
    );
  }

  if (visibleSteps.length === 0) {
    return (
      <PageShellSurface chrome={chrome} loading={loading}>
        {config.presentation.emptyState ?? (
          <SurfaceEmptyState
            title={tSurface('wizard.empty_title')}
            description={tSurface('wizard.empty_description')}
          />
        )}
      </PageShellSurface>
    );
  }

  // Aside, like footer, supports both static and context-aware rendering.
  // Context-aware asides are useful for showing step-specific help or
  // progress summaries that update as the user advances.
  const asideNode =
    typeof config.presentation.aside === 'function'
      ? config.presentation.aside(activeContext)
      : config.presentation.aside;

  const wizardContent = (
    <Grid className="ds-surface ds-wizard" columns={asideNode && !shouldStack ? 12 : 1} gap={sectionSpacing}>
      <Grid.Item span={asideNode && !shouldStack ? 8 : undefined}>
        <Stack spacing={sectionSpacing}>
          {config.presentation.description && <Text data-part="description">{config.presentation.description}</Text>}

          {config.presentation.error && (
            <Card className="ds-wizard__error-card" variant={profileDefaults.cardVariant}>
              <Card.Body>{config.presentation.error}</Card.Body>
            </Card>
          )}

          <PatternStepWizard
            steps={visibleSteps.map((step) => {
              const validationErrors = readWizardStepErrors(stepErrors, step.key);

              return {
                key: step.key,
                title: step.title,
                description: step.description,
                icon: step.icon,
                optional: step.optional,
                content: step.renderedContent,
                // Validation is two-phase: first check form-level field errors
                // from the PatternFormBuilder, then run the step's custom validate
                // function. The first field error message is surfaced to the
                // StepWizard pattern which displays it inline.
                validate: async () => {
                  if (validationErrors && Object.keys(validationErrors).length > 0) {
                    return Object.values(validationErrors)[0] ?? tSurface('wizard.step_error_fallback');
                  }

                  const result = await step.validate?.();

                  return result ?? true;
                },
              };
            })}
            currentStep={currentStep}
            onStepChange={goToStep}
            onComplete={() => submitAction?.onClick?.(resolvedValues)}
            allowSkip={config.visual.allowSkip}
            showProgress={config.visual.showProgress}
            orientation={resolvedMobile ? 'horizontal' : config.visual.orientation}
            progressPosture={resolvedMobile && config.visual.compactStepsOnMobile ? 'counter' : 'rail'}
            formatProgressLabel={({ current, total, title }) =>
              tSurface('wizard.step_counter', { current, total, title })
            }
            actionPosture={resolvedMobile && config.visual.mobileActionsSticky ? 'sticky-bottom' : 'inline'}
            nextLabel={config.behavior.nextLabel}
            prevLabel={config.behavior.prevLabel}
            completeLabel={submitAction?.label ?? tSurface('wizard.complete')}
            skipLabel={config.behavior.skipLabel}
            actionsDisabled={config.behavior.disabled}
            completeDisabled={submitAction?.disabled || submitAction?.loading}
            showCompleteAction={!!submitAction}
            footer={wizardFooter}
            loading={loading}
          />
        </Stack>
      </Grid.Item>

      {asideNode && (
        <Grid.Item span={!shouldStack ? 4 : undefined}>
          <Card className="ds-wizard__aside-card" variant={profileDefaults.cardVariant}>
            <Card.Body>{asideNode}</Card.Body>
          </Card>
        </Grid.Item>
      )}
    </Grid>
  );

  return (
    <PageShellSurface chrome={chrome} loading={loading}>
      <SurfaceAccentBarWrapper defaults={profileDefaults}>
        {profileDefaults.animateEntrance ? (
          <FadeIn durationMs={profileDefaults.entranceDuration}>{wizardContent}</FadeIn>
        ) : (
          wizardContent
        )}
      </SurfaceAccentBarWrapper>
    </PageShellSurface>
  );
}
