'use client';

/**
 * @fileoverview FormSurface - Rottay Design System
 * @description Reusable page-level form shell built on top of the schema-driven
 * form builder pattern.
 *
 * @remarks
 * This surface owns page chrome, responsive two-column layout, and action
 * presentation while delegating actual field rendering to `PatternFormBuilder`.
 * Loading keeps the shell chrome mounted so the builder's own form-shaped
 * skeleton (title, field rows, action bar) is what the user sees.
 */

import { Box, Button, Card, Grid, Stack, Text, Flex } from '../../../../../primitives';
import { ActionDock } from '../../../../../structures/workspace/action-dock';
import { PatternFormBuilder } from '../../../../../patterns';
import { FadeIn } from '@/graphics/motion';
import { useUnsavedChangesGuard } from '../../../../../../infrastructure/runtime/application/forms';
import { filterSurfaceFields, resolveSurfaceAction, resolveSurfaceButtonVariant } from '../../../../runtime/helpers';
import type { FormSurfaceConfig } from '../../../../foundation/contracts';
import { PageShellSurface } from '../../../../composition/layout/page-shell';
import { useSurfaceProfileDefaultsWithOverrides } from '../../../../runtime/profile-defaults/overrides';
import { useSurfaceResponsiveLayout } from '../../../../runtime/responsive';
import { useSurfaceTranslations } from '../../../../runtime/helpers/states/i18n';
import {
  resolveStackSpacing,
  SurfaceAccentBarWrapper,
} from '../../../../runtime/profile-defaults/personality';
import { SurfaceErrorState } from '../../../../runtime/helpers/states';

export interface FormSurfaceProps {
  config: FormSurfaceConfig;
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void | Promise<void>;
}

/** Page-level form shell with error handling, action normalization, and optional aside content. */
export function FormSurface({ config, loading = false, error, onRetry }: FormSurfaceProps): React.ReactElement {
  const { tSurfaceOr } = useSurfaceTranslations();
  const profileDefaults = useSurfaceProfileDefaultsWithOverrides(config.visual?.profileOverrides);
  const { shouldStack, isMobile, hasResolvedViewport } = useSurfaceResponsiveLayout(config.visual);
  // Stamped state attributes follow the resolved viewport so SSR/first-paint
  // markup never claims a mobile posture the media query has not confirmed.
  const resolvedMobile = hasResolvedViewport && isMobile;
  const dirtyState = config.behavior.dirtyState;
  const { requestDiscard } = useUnsavedChangesGuard({
    isDirty: dirtyState?.isDirty ?? false,
    message: dirtyState?.message ?? tSurfaceOr('form.discard_changes', 'Discard unsaved form changes?'),
    confirmDiscard: dirtyState?.confirmDiscard,
    onDiscard: dirtyState?.onDiscard,
    onBlocked: dirtyState?.onBlocked,
  });
  // Fields use final app-resolved access before reaching the form builder so
  // restricted fields never appear in the DOM at all.
  const visibleFields = filterSurfaceFields(config.behavior.fields, config.access);
  const sectionSpacing = resolveStackSpacing(profileDefaults.sectionSpacing);
  const cancelAction = resolveSurfaceAction(config.behavior.cancelAction, config.access);
  const submitAction = resolveSurfaceAction(config.behavior.submitAction, config.access);
  const chrome = {
    ...config.presentation.chrome,
    maxWidth: config.visual.maxWidth ?? config.presentation.chrome.maxWidth,
  };
  const showAside = !!config.presentation.aside && (!isMobile || config.visual.hideAsideOnMobile === false);
  const resolvedLayout = shouldStack && config.visual.layout === 'horizontal' ? 'vertical' : config.visual.layout;
  const resolvedColumns = shouldStack ? 1 : config.visual.columns;

  if (error) {
    return (
      <PageShellSurface chrome={chrome} loading={false}>
        <SurfaceErrorState error={error} onRetry={onRetry} />
      </PageShellSurface>
    );
  }

  // Mobile persistence uses the canonical viewport-aware ActionDock; the
  // surface skin owns the reserved scroll space for the fixed bar.
  const actionsSticky = Boolean(resolvedMobile && config.visual.mobileActionsSticky);

  // Both actions ride the Button primitive's own `block` mode on mobile
  // (full-width, engine-owned geometry) instead of inline flex styles.
  const actionButtons = (
    <>
      {cancelAction && (
        <Button
          variant={resolveSurfaceButtonVariant(cancelAction.variant)}
          // Contract-documented use (wizard precedent): cancel locks while
          // async submit work is in flight, so the user cannot navigate away
          // mid-submission.
          disabled={cancelAction.disabled || submitAction?.loading}
          loading={cancelAction.loading}
          icon={cancelAction.icon}
          block={isMobile}
          onClick={() => {
            if (requestDiscard('cancel')) {
              cancelAction.onClick?.(undefined as void);
            }
          }}
        >
          {cancelAction.label}
        </Button>
      )}
      {submitAction && (
        <Button
          variant={resolveSurfaceButtonVariant(submitAction.variant ?? 'primary')}
          htmlType="submit"
          disabled={config.behavior.disabled || submitAction.disabled}
          loading={submitAction.loading}
          icon={submitAction.icon}
          block={isMobile}
        >
          {submitAction.label}
        </Button>
      )}
    </>
  );

  const actionsNode = actionsSticky ? (
    <ActionDock
      mode="fixed"
      position="bottom"
      className="ds-form__action-dock"
      data-testid="form-surface-action-dock"
      aria-label={tSurfaceOr('form.actions_aria', 'Form actions')}
    >
      {actionButtons}
    </ActionDock>
  ) : (
    <Flex data-part="actions" direction={isMobile ? 'column' : 'row'} gap={8} wrap="wrap" justify="end">
      {actionButtons}
    </Flex>
  );

  // Aside column only renders when content is provided AND viewport is wide
  // enough. This keeps the form full-width by default, matching the most
  // common create/edit screen layout without explicit configuration.
  const formContent = (
    <Grid
      className={['ds-surface ds-form', actionsSticky ? 'ds-form--sticky-actions' : undefined]
        .filter(Boolean)
        .join(' ')}
      data-part="root"
      data-mobile={resolvedMobile ? 'true' : 'false'}
      data-stacked={shouldStack ? 'true' : 'false'}
      data-loading={loading ? 'true' : 'false'}
      aria-busy={loading || undefined}
      columns={showAside && !shouldStack ? 12 : 1}
      gap={sectionSpacing}
    >
      <Grid.Item span={showAside && !shouldStack ? 8 : undefined}>
        <Card variant={profileDefaults.cardVariant}>
          <Card.Body>
            <Stack spacing={sectionSpacing}>
              {config.presentation.description && (
                <Text data-part="description" as="p" size="sm" color="subtle">
                  {config.presentation.description}
                </Text>
              )}

              {config.presentation.error && (
                <Box data-part="error-banner" role="alert">
                  <Card className="ds-form__error-card" variant={profileDefaults.cardVariant}>
                    <Card.Body>{config.presentation.error}</Card.Body>
                  </Card>
                </Box>
              )}

              {/* The form builder owns field generation and the form-shaped
                  loading skeleton; the surface owns page framing and submit actions. */}
              <PatternFormBuilder
                fields={visibleFields}
                layout={resolvedLayout}
                columns={resolvedColumns}
                autoAdaptive
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
                loading={loading}
              />
            </Stack>
          </Card.Body>
        </Card>
      </Grid.Item>

      {showAside && (
        <Grid.Item span={!shouldStack ? 4 : undefined}>
          <Card className="ds-form__aside-card" variant={profileDefaults.cardVariant}>
            <Card.Body>{config.presentation.aside}</Card.Body>
          </Card>
        </Grid.Item>
      )}
    </Grid>
  );

  return (
    // Loading keeps the shell chrome mounted (title/breadcrumbs survive) so the
    // FormBuilder's own skeleton -- title, field rows, action bar shaped like
    // the form -- is what the user sees instead of the generic page skeleton.
    <PageShellSurface chrome={chrome} loading={false}>
      <SurfaceAccentBarWrapper defaults={profileDefaults}>
        {profileDefaults.animateEntrance ? (
          <FadeIn durationMs={profileDefaults.entranceDuration}>{formContent}</FadeIn>
        ) : (
          formContent
        )}
      </SurfaceAccentBarWrapper>
    </PageShellSurface>
  );
}
