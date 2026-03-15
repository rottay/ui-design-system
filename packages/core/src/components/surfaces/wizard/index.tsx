'use client';

/**
 * WizardSurface
 *
 * This surface is the page-level wrapper for guided multi-step flows.
 *
 * Why it exists separately from FormSurface:
 * - FormSurface solves "one page, one form"
 * - WizardSurface solves "ordered progression across multiple steps"
 *
 * The surface stays generic by owning only the progression mechanics. The app
 * still owns the step content, fields, and domain-specific validation.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Card, Flex, Grid, Stack, Text } from '../../primitives';
import { PatternFormBuilder, PatternStepWizard } from '../../patterns';
import { FadeIn, SlideIn } from '../../../animations';
import { filterSurfaceFields, resolveSurfaceAction, resolveSurfaceButtonVariant } from '../helpers';
import { useSurfaceTranslations } from '../i18n';
import { useSurfaceProfileDefaults } from '../profile-defaults';
import {
  resolveStackSpacing,
  SurfaceAccentBarWrapper,
} from '../personality-helpers';
import type {
  WizardSurfaceConfig,
  WizardSurfaceStepConfig,
  WizardSurfaceStepRenderContext,
} from '../types';
import { PageShellSurface } from '../page-shell';
import { useSurfaceResponsiveLayout } from '../responsive';
import { SurfaceEmptyState, SurfaceErrorState } from '../states';

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
  const contentNode =
    typeof step.content === 'function'
      ? step.content(context)
      : step.content;

  const visibleFields = filterSurfaceFields(step.fields ?? [], config.permissions);

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
      <SlideIn direction="up" distance={16} duration={options.entranceDuration}>
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

export function WizardSurface({
  config,
  loading = false,
  error,
  onRetry,
}: WizardSurfaceProps): React.ReactElement {
  const { tSurface } = useSurfaceTranslations();
  const profileDefaults = useSurfaceProfileDefaults();
  const { shouldStack } = useSurfaceResponsiveLayout(config.visual);
  const sectionSpacing = resolveStackSpacing(profileDefaults.sectionSpacing);
  const [internalValues, setInternalValues] = useState<Record<string, unknown>>(
    config.behavior.initialValues ?? {}
  );
  const [internalStep, setInternalStep] = useState(config.behavior.currentStep ?? 0);
  const [stepErrors, setStepErrors] = useState<Record<string, Record<string, string>>>({});

  const isControlledValues = config.behavior.values !== undefined;
  const resolvedValues = isControlledValues
    ? (config.behavior.values ?? {})
    : internalValues;
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
  }, [config, currentStep, goToStep, resolvedValues, setValues, tSurface, profileDefaults.cardVariant, profileDefaults.animateEntrance, profileDefaults.entranceDuration]);

  const activeContext: WizardSurfaceStepRenderContext = {
    values: resolvedValues,
    currentStep,
    stepIndex: currentStep,
    isLastStep: currentStep === visibleSteps.length - 1,
    setValues,
    goToStep,
  };

  const footerNode =
    typeof config.presentation.footer === 'function'
      ? config.presentation.footer(activeContext)
      : config.presentation.footer;

  const cancelAction = resolveSurfaceAction(config.behavior.cancelAction, config.permissions);
  const saveDraftAction = resolveSurfaceAction(config.behavior.saveDraftAction, config.permissions);
  const submitAction = resolveSurfaceAction(config.behavior.submitAction, config.permissions);

  const wizardFooter = (
    <Flex gap={8} wrap="wrap" justify="end">
      {cancelAction && (
        <Button
          variant={resolveSurfaceButtonVariant(cancelAction.variant)}
          disabled={cancelAction.disabled}
          loading={cancelAction.loading}
          onClick={() => cancelAction.onClick?.(undefined as void)}
        >
          {cancelAction.icon}
          <Text style={{ marginLeft: cancelAction.icon ? 8 : 0 }}>
            {cancelAction.label}
          </Text>
        </Button>
      )}

      {saveDraftAction && (
        <Button
          variant={resolveSurfaceButtonVariant(saveDraftAction.variant)}
          disabled={saveDraftAction.disabled}
          loading={saveDraftAction.loading}
          onClick={() => saveDraftAction.onClick?.(resolvedValues)}
        >
          {saveDraftAction.icon}
          <Text style={{ marginLeft: saveDraftAction.icon ? 8 : 0 }}>
            {saveDraftAction.label}
          </Text>
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

  const asideNode =
    typeof config.presentation.aside === 'function'
      ? config.presentation.aside(activeContext)
      : config.presentation.aside;

  const wizardContent = (
    <Grid columns={asideNode && !shouldStack ? 12 : 1} gap={sectionSpacing}>
      <Grid.Item span={asideNode && !shouldStack ? 8 : undefined}>
        <Stack spacing={sectionSpacing}>
          {config.presentation.description && (
            <Text style={{ color: 'var(--ds-color-text-muted)' }}>
              {config.presentation.description}
            </Text>
          )}

          {config.presentation.error && (
            <Card variant={profileDefaults.cardVariant} style={{ borderColor: 'var(--ds-color-error-500)' }}>
              <Card.Body>{config.presentation.error}</Card.Body>
            </Card>
          )}

          <PatternStepWizard
            steps={visibleSteps.map((step) => {
              const validationErrors = stepErrors[step.key];

              return {
                key: step.key,
                title: step.title,
                description: step.description,
                icon: step.icon,
                optional: step.optional,
                content: step.renderedContent,
                validate: async () => {
                  if (validationErrors && Object.keys(validationErrors).length > 0) {
                    return (
                      Object.values(validationErrors)[0] ??
                      tSurface('wizard.step_error_fallback')
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
            orientation={config.visual.orientation}
            nextLabel={config.behavior.nextLabel}
            prevLabel={config.behavior.prevLabel}
            completeLabel={submitAction?.label ?? tSurface('wizard.complete')}
            skipLabel={config.behavior.skipLabel}
            actionsDisabled={false}
            completeDisabled={submitAction?.disabled || submitAction?.loading}
            showCompleteAction={!!submitAction}
            footer={wizardFooter}
            loading={loading}
          />
        </Stack>
      </Grid.Item>

      {asideNode && (
        <Grid.Item span={!shouldStack ? 4 : undefined}>
          <Card variant={profileDefaults.cardVariant}>
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
          <FadeIn duration={profileDefaults.entranceDuration}>
            {wizardContent}
          </FadeIn>
        ) : (
          wizardContent
        )}
      </SurfaceAccentBarWrapper>
    </PageShellSurface>
  );
}
