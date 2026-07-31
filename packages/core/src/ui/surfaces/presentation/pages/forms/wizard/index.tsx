'use client';

/**
 * @fileoverview WizardSurface -- multi-step guided flow page shell.
 * @description Distinct from FormSurface (single-page form): WizardSurface handles
 * ordered step progression, step validation gating, and back/next navigation.
 * The app owns step content, fields, and domain-specific validation.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Button, Card, Flex, Grid, Stack, Text } from '../../../../../primitives';
import { PatternFormBuilder, PatternStepWizard } from '../../../../../patterns';
import { FadeIn, SlideIn } from '@/graphics/motion';
import { useUnsavedChangesGuard } from '../../../../../../infrastructure/runtime/application/forms';
import { filterSurfaceFields, resolveSurfaceAction, resolveSurfaceButtonVariant } from '../../../../runtime/helpers';
import { useSurfaceTranslations } from '../../../../runtime/helpers/states/i18n';
import { useSurfaceProfileDefaultsWithOverrides } from '../../../../runtime/profile-defaults/overrides';
import { resolveStackSpacing, SurfaceAccentBarWrapper } from '../../../../runtime/profile-defaults/personality';
import type {
  WizardSurfaceConfig,
  WizardSurfaceStepConfig,
  WizardSurfaceStepRenderContext,
} from '../../../../foundation/contracts';
import { PageShellSurface } from '../../../../composition/layout/page-shell';
import { useSurfaceResponsiveLayout } from '../../../../runtime/responsive';
import { SurfaceEmptyState, SurfaceErrorState } from '../../../../runtime/helpers/states';

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
  tSurfaceOr: (key: string, fallback: string, params?: Record<string, string | number>) => string,
  options: {
    cardVariant: 'outlined' | 'elevated' | 'filled' | 'ghost';
    animateEntrance: boolean;
    entranceDuration: number;
  }
): React.ReactNode {
  const contentNode = typeof step.content === 'function' ? step.content(context) : step.content;

  const visibleFields = filterSurfaceFields(step.fields ?? [], config.access);

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
        title={tSurfaceOr('wizard.empty_step_title', 'Empty wizard step')}
        description={tSurfaceOr('wizard.empty_step_description', 'This step does not expose any visible content.')}
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
  const { tSurfaceOr } = useSurfaceTranslations();
  const profileDefaults = useSurfaceProfileDefaultsWithOverrides(config.visual?.profileOverrides);
  const { shouldStack, isMobile, hasResolvedViewport } = useSurfaceResponsiveLayout(config.visual);
  const resolvedMobile = hasResolvedViewport && isMobile;
  const dirtyState = config.behavior.dirtyState;
  const { requestDiscard } = useUnsavedChangesGuard({
    isDirty: dirtyState?.isDirty ?? false,
    message: dirtyState?.message ?? tSurfaceOr('wizard.discard_changes', 'Discard unsaved wizard changes?'),
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
          tSurfaceOr,
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
    tSurfaceOr,
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

  const cancelAction = resolveSurfaceAction(config.behavior.cancelAction, config.access);
  const saveDraftAction = resolveSurfaceAction(config.behavior.saveDraftAction, config.access);
  const submitAction = resolveSurfaceAction(config.behavior.submitAction, config.access);

  // Draft/cancel actions ride the Button primitive's own icon slot: the engine
  // owns the icon-label gap (logical, density-scaled), so no inline geometry
  // and no physical margins live here.
  const wizardFooter = (
    <Flex gap={8} wrap="wrap" justify="end">
      {cancelAction && (
        <Button
          variant={resolveSurfaceButtonVariant(cancelAction.variant)}
          icon={cancelAction.icon}
          disabled={cancelAction.disabled}
          loading={cancelAction.loading}
          onClick={() => {
            if (requestDiscard('cancel')) {
              cancelAction.onClick?.(undefined as void);
            }
          }}
        >
          {cancelAction.label}
        </Button>
      )}

      {saveDraftAction && (
        <Button
          variant={resolveSurfaceButtonVariant(saveDraftAction.variant)}
          icon={saveDraftAction.icon}
          disabled={config.behavior.disabled || saveDraftAction.disabled}
          loading={saveDraftAction.loading}
          onClick={() => saveDraftAction.onClick?.(resolvedValues)}
        >
          {saveDraftAction.label}
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
            title={tSurfaceOr('wizard.empty_title', 'No wizard steps available')}
            description={tSurfaceOr('wizard.empty_description', 'This flow does not have any steps configured yet.')}
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
    <Grid
      className="ds-surface ds-wizard"
      data-part="root"
      data-mobile={resolvedMobile ? 'true' : 'false'}
      data-loading={loading ? 'true' : 'false'}
      aria-busy={loading || undefined}
      columns={asideNode && !shouldStack ? 12 : 1}
      gap={sectionSpacing}
    >
      <Grid.Item span={asideNode && !shouldStack ? 8 : undefined}>
        <Stack spacing={sectionSpacing}>
          {config.presentation.description && (
            <Text data-part="description" as="p" color="subtle">
              {config.presentation.description}
            </Text>
          )}

          {config.presentation.error && (
            <Box data-part="error-banner" role="alert">
              <Card className="ds-wizard__error-card" variant={profileDefaults.cardVariant}>
                <Card.Body>{config.presentation.error}</Card.Body>
              </Card>
            </Box>
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
                    return (
                      Object.values(validationErrors)[0] ??
                      tSurfaceOr('wizard.step_error_fallback', 'Please review this step.')
                    );
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
              tSurfaceOr('wizard.step_counter', 'Step {current} of {total}: {title}', { current, total, title })
            }
            actionPosture={resolvedMobile && config.visual.mobileActionsSticky ? 'sticky-bottom' : 'inline'}
            nextLabel={config.behavior.nextLabel}
            prevLabel={config.behavior.prevLabel}
            completeLabel={submitAction?.label ?? tSurfaceOr('wizard.complete', 'Complete')}
            skipLabel={config.behavior.skipLabel}
            // Contract-documented use: navigation locks while async submit work
            // is in flight, so the user cannot step away mid-submission.
            actionsDisabled={config.behavior.disabled || submitAction?.loading}
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
    // Loading keeps the shell chrome mounted (title/breadcrumbs survive) so the
    // StepWizard's own skeleton -- progress + content shaped like the wizard --
    // is what the user sees instead of the generic page skeleton.
    <PageShellSurface chrome={chrome} loading={false}>
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
