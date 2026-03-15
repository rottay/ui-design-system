'use client';

/**
 * FormSurface
 *
 * Wraps the generic form builder pattern in page chrome and optional sidebar
 * content. This gives the app a declarative page-level form shell instead of a
 * one-off component for every create/edit screen.
 */

import { Button, Card, Grid, Stack, Text, Flex } from '../../primitives';
import { PatternFormBuilder } from '../../patterns';
import { FadeIn } from '../../../motion';
import { filterSurfaceFields, resolveSurfaceAction, resolveSurfaceButtonVariant } from '../helpers';
import type { FormSurfaceConfig } from '../types';
import { PageShellSurface } from '../page-shell';
import { useSurfaceProfileDefaults } from '../profile-defaults';
import { useSurfaceResponsiveLayout } from '../responsive';
import {
  resolveStackSpacing,
  resolveLabelTextTransform,
  SurfaceAccentBarWrapper,
} from '../personality-helpers';
import { SurfaceErrorState } from '../states';

export interface FormSurfaceProps {
  config: FormSurfaceConfig;
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void | Promise<void>;
}

export function FormSurface({
  config,
  loading = false,
  error,
  onRetry,
}: FormSurfaceProps): React.ReactElement {
  const profileDefaults = useSurfaceProfileDefaults();
  const { shouldStack } = useSurfaceResponsiveLayout(config.visual);
  const visibleFields = filterSurfaceFields(config.behavior.fields, config.permissions);
  const sectionSpacing = resolveStackSpacing(profileDefaults.sectionSpacing);
  const labelTransform = resolveLabelTextTransform(profileDefaults.labelStyle);
  const cancelAction = resolveSurfaceAction(config.behavior.cancelAction, config.permissions);
  const submitAction = resolveSurfaceAction(config.behavior.submitAction, config.permissions);
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

  const actionsNode = (
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
      {submitAction && (
        <Button
          variant={resolveSurfaceButtonVariant(submitAction.variant ?? 'primary')}
          htmlType="submit"
          disabled={submitAction.disabled}
          loading={submitAction.loading}
        >
          {submitAction.icon}
          <Text style={{ marginLeft: submitAction.icon ? 8 : 0 }}>
            {submitAction.label}
          </Text>
        </Button>
      )}
    </Flex>
  );

  const formContent = (
    <Grid columns={config.presentation.aside && !shouldStack ? 12 : 1} gap={sectionSpacing}>
      <Grid.Item span={config.presentation.aside && !shouldStack ? 8 : undefined}>
        <Card variant={profileDefaults.cardVariant}>
          <Card.Body>
            <Stack spacing={sectionSpacing}>
              {config.presentation.description && (
                <Text
                  style={{
                    color: 'var(--ds-color-text-muted)',
                    textTransform: labelTransform,
                  }}
                >
                  {config.presentation.description}
                </Text>
              )}

              {config.presentation.error && (
                <Card variant={profileDefaults.cardVariant} style={{ borderColor: 'var(--ds-color-error-500)' }}>
                  <Card.Body>{config.presentation.error}</Card.Body>
                </Card>
              )}

              <PatternFormBuilder
                fields={visibleFields}
                layout={config.visual.layout}
                columns={config.visual.columns}
                renderField={config.presentation.renderField}
                actions={actionsNode}
                onSubmit={(values) => submitAction?.onClick?.(values)}
                onValidationChange={config.behavior.onValidationChange}
                onChange={config.behavior.onChange}
                initialValues={config.behavior.initialValues}
                values={config.behavior.values}
                disabled={config.behavior.disabled}
                readOnly={config.behavior.readOnly}
                showLabels={config.behavior.showLabels}
                showRequired={config.behavior.showRequired}
                stepLabels={config.behavior.stepLabels}
                currentStep={config.behavior.currentStep}
                onStepChange={config.behavior.onStepChange}
              />
            </Stack>
          </Card.Body>
        </Card>
      </Grid.Item>

      {config.presentation.aside && (
        <Grid.Item span={!shouldStack ? 4 : undefined}>
          <Card variant={profileDefaults.cardVariant}>
            <Card.Body>{config.presentation.aside}</Card.Body>
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
            {formContent}
          </FadeIn>
        ) : (
          formContent
        )}
      </SurfaceAccentBarWrapper>
    </PageShellSurface>
  );
}
