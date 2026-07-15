'use client';

/**
 * @fileoverview FormSurface - Rottay Design System
 * @description Reusable page-level form shell built on top of the schema-driven
 * form builder pattern.
 *
 * @remarks
 * This surface owns page chrome, responsive two-column layout, and action
 * presentation while delegating actual field rendering to `PatternFormBuilder`.
 */

import { Button, Card, Grid, Stack, Text, Flex } from '../../../../primitives';
import { PatternFormBuilder } from '../../../../patterns';
import { FadeIn } from '../../../../../motion';
import { filterSurfaceFields, resolveSurfaceAction, resolveSurfaceButtonVariant } from '../../../foundation/helpers';
import type { FormSurfaceConfig } from '../../../foundation/types';
import { PageShellSurface } from '../../../layout/page-shell';
import { useSurfaceProfileDefaults } from '../../../foundation/profile-defaults';
import { useSurfaceResponsiveLayout } from '../../../foundation/responsive';
import {
  resolveStackSpacing,
  resolveLabelTextTransform,
  SurfaceAccentBarWrapper,
} from '../../../foundation/personality-helpers';
import { SurfaceErrorState } from '../../../foundation/states';

export interface FormSurfaceProps {
  config: FormSurfaceConfig;
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void | Promise<void>;
}

/** Page-level form shell with error handling, action normalization, and optional aside content. */
export function FormSurface({
  config,
  loading = false,
  error,
  onRetry,
}: FormSurfaceProps): React.ReactElement {
  const profileDefaults = useSurfaceProfileDefaults();
  const { shouldStack, isMobile } = useSurfaceResponsiveLayout(config.visual);
  // Fields are permission-filtered before reaching the form builder so
  // restricted fields never appear in the DOM at all.
  const visibleFields = filterSurfaceFields(config.behavior.fields, config.access ?? config.permissions);
  const sectionSpacing = resolveStackSpacing(profileDefaults.sectionSpacing);
  // Label text transform (uppercase, capitalize, sentence) comes from the
  // product personality profile, keeping form labels consistent across
  // every form surface without per-instance configuration.
  const labelTransform = resolveLabelTextTransform(profileDefaults.labelStyle);
  const cancelAction = resolveSurfaceAction(config.behavior.cancelAction, config.access ?? config.permissions);
  const submitAction = resolveSurfaceAction(config.behavior.submitAction, config.access ?? config.permissions);
  const chrome = {
    ...config.presentation.chrome,
    maxWidth: config.visual.maxWidth ?? config.presentation.chrome.maxWidth,
  };
  const showAside =
    !!config.presentation.aside &&
    (!isMobile || config.visual.hideAsideOnMobile === false);
  const resolvedLayout =
    shouldStack && config.visual.layout === 'horizontal'
      ? 'vertical'
      : config.visual.layout;
  const resolvedColumns = shouldStack ? 1 : config.visual.columns;

  if (error) {
    return (
      <PageShellSurface chrome={chrome} loading={false}>
        <SurfaceErrorState error={error} onRetry={onRetry} />
      </PageShellSurface>
    );
  }

  // The sticky posture is a paint (a scrim gradient) plus a layout. `data-sticky`
  // carries the condition into the skin; the layout stays here.
  const actionsSticky = Boolean(isMobile && config.visual.mobileActionsSticky);

  const actionsNode = (
    <Flex
      data-part="actions"
      data-sticky={actionsSticky}
      direction={isMobile ? 'column' : 'row'}
      gap={8}
      wrap="wrap"
      justify="end"
      style={
        actionsSticky
          ? {
              position: 'sticky',
              bottom: 0,
              paddingTop: 12,
              paddingBottom: 4,
              zIndex: 1,
            }
          : undefined
      }
    >
      {cancelAction && (
        <Button
          variant={resolveSurfaceButtonVariant(cancelAction.variant)}
          disabled={cancelAction.disabled}
          loading={cancelAction.loading}
          icon={cancelAction.icon}
          onClick={() => cancelAction.onClick?.(undefined as void)}
          style={isMobile ? { width: '100%', justifyContent: 'center' } : undefined}
        >
          {cancelAction.label}
        </Button>
      )}
      {submitAction && (
        <Button
          variant={resolveSurfaceButtonVariant(submitAction.variant ?? 'primary')}
          htmlType="submit"
          disabled={submitAction.disabled}
          loading={submitAction.loading}
          icon={submitAction.icon}
          style={isMobile ? { width: '100%', justifyContent: 'center' } : undefined}
        >
          {submitAction.label}
        </Button>
      )}
    </Flex>
  );

  // Aside column only renders when content is provided AND viewport is wide
  // enough. This keeps the form full-width by default, matching the most
  // common create/edit screen layout without explicit configuration.
  const formContent = (
    <Grid className="ds-surface ds-form" columns={showAside && !shouldStack ? 12 : 1} gap={sectionSpacing} style={{ width: '100%' }}>
      <Grid.Item span={showAside && !shouldStack ? 8 : undefined}>
        <Card variant={profileDefaults.cardVariant} style={{ width: '100%' }}>
          <Card.Body>
            <Stack spacing={sectionSpacing}>
              {config.presentation.description && (
                <Text
                  data-part="description"
                  size="sm"
                  style={{
                    lineHeight: 1.5,
                  }}
                >
                  {config.presentation.description}
                </Text>
              )}

              {config.presentation.error && (
                <Card className="ds-form__error-card" variant={profileDefaults.cardVariant}>
                  <Card.Body>{config.presentation.error}</Card.Body>
                </Card>
              )}

              {/* The form builder owns field generation; the surface owns page framing and submit actions. */}
              <PatternFormBuilder
                fields={visibleFields}
                layout={resolvedLayout}
                columns={resolvedColumns}
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

      {showAside && (
        <Grid.Item span={!shouldStack ? 4 : undefined}>
          <Card
            className="ds-form__aside-card"
            variant={profileDefaults.cardVariant}
            style={{
              position: shouldStack ? undefined : 'sticky',
              top: shouldStack ? undefined : 16,
            }}
          >
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
