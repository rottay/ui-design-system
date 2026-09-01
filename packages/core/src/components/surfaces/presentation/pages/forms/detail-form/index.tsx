'use client';

/**
 * @fileoverview DetailFormSurface -- split-layout edit page with summary aside.
 * @description Combines PatternFormBuilder with an optional detail/summary sidebar.
 * Useful when edit screens need supporting context (entity preview, guidance, or
 * related metadata) alongside the form fields.
 *
 * @remarks
 * This surface owns page framing, the split/stacked layout decision, and
 * submit-action normalization while delegating field rendering to
 * `PatternFormBuilder`. Loading keeps the shell chrome mounted so the
 * builder's own form-shaped skeleton (field rows, action bar) is what the
 * user sees instead of the generic page skeleton.
 */

import { Box, Button, Card, Grid, Stack } from '../../../../../primitives';
import { PatternFormBuilder } from '../../../../../patterns';
import { FadeIn } from '@/graphics/motion';
import { useUnsavedChangesGuard } from '../../../../../../infrastructure/runtime/application/forms';
import {
  filterSurfaceFields,
  resolveSurfaceAction,
  resolveSurfaceButtonVariant,
  hasSurfaceError,
} from '../../../../runtime/helpers';
import { useSurfaceTranslations } from '../../../../../structures/foundation/chrome/runtime/i18n';
import { useSurfaceProfileDefaultsWithOverrides } from '../../../../../structures/foundation/chrome/runtime/profile-defaults/overrides';
import { resolveStackSpacing, SurfaceAccentBarWrapper } from '../../../../../structures/foundation/chrome/runtime/profile-defaults/personality';
import type { DetailFormSurfaceConfig } from '../../../../foundation/contracts';
import { PageShellSurface } from '../../../../../structures/shell/page-shell-surface';
import { useSurfaceResponsiveLayout } from '../../../../../structures/foundation/chrome/runtime/responsive';
import { SurfaceActionBar, SurfaceSectionCard } from '../../../../../structures/shell/surface-chrome';
import { SurfaceErrorState } from '../../../../../structures/feedback/surface-lifecycle';

export interface DetailFormSurfaceProps {
  config: DetailFormSurfaceConfig;
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void | Promise<void>;
}

/** Split/stacked edit page: schema-driven form plus a read-only summary column. */
export function DetailFormSurface({
  config,
  loading = false,
  error,
  onRetry,
}: DetailFormSurfaceProps): React.ReactElement {
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
  const sectionSpacing = resolveStackSpacing(profileDefaults.sectionSpacing);
  // Permission-aware field filtering removes fields the current user cannot
  // see before they reach the form builder, avoiding empty-field placeholders.
  const visibleFields = filterSurfaceFields(config.behavior.fields, config.access);
  const submitAction = resolveSurfaceAction(config.behavior.submitAction, config.access);
  const cancelAction = config.behavior.cancelAction;
  // Surface maxWidth overrides chrome maxWidth so individual surfaces can
  // constrain form width without altering the shared chrome config.
  const chrome = {
    ...config.presentation.chrome,
    maxWidth: config.visual.maxWidth ?? config.presentation.chrome.maxWidth,
  };

  if (hasSurfaceError(error)) {
    return (
      <PageShellSurface chrome={chrome} loading={false}>
        <SurfaceErrorState error={error} onRetry={onRetry} />
      </PageShellSurface>
    );
  }

  // Secondary and cancel actions are merged into a single bar. The submit
  // action is excluded here because it lives inside the form builder as
  // the HTML submit button, which enables native form validation.
  // Contract-documented use (form precedent): cancel locks while async
  // submit work is in flight, so the user cannot navigate away
  // mid-submission.
  const actionBar = (
    <SurfaceActionBar
      actions={[
        ...(config.behavior.secondaryActions ?? []),
        ...(cancelAction
          ? [{
              ...cancelAction,
              disabled: cancelAction.disabled || submitAction?.loading,
              // Discard protection wraps the contract callback: a refused
              // confirmation must never reach the app's cancel handler.
              onClick: () => {
                if (requestDiscard('cancel')) cancelAction.onClick?.(undefined as void);
              },
            }]
          : []),
      ]}
      access={config.access}
    />
  );

  const formNode = (
    <SurfaceSectionCard
      title={config.presentation.description ? tSurfaceOr('detail_form.form_title', 'Form') : undefined}
      description={config.presentation.description}
      actions={actionBar}
    >
      <Stack spacing={sectionSpacing}>
        {config.presentation.error && (
          <Box data-part="error-banner" role="alert">
            <Card className="ds-detail-form__error-card" variant={profileDefaults.cardVariant}>
              <Card.Body>{config.presentation.error}</Card.Body>
            </Card>
          </Box>
        )}

        <PatternFormBuilder
          fields={visibleFields}
          layout="vertical"
          columns={config.visual.columns}
          autoAdaptive
          renderField={config.presentation.renderField}
          actions={
            submitAction ? (
              // The submit icon rides the Button primitive's own icon slot:
              // the engine owns the icon-label gap (logical, density-scaled),
              // so no inline geometry lives here.
              <Button
                variant={resolveSurfaceButtonVariant(submitAction.variant ?? 'primary')}
                htmlType="submit"
                disabled={config.behavior.disabled || submitAction.disabled}
                loading={submitAction.loading}
                icon={submitAction.icon}
              >
                {submitAction.label}
              </Button>
            ) : null
          }
          onSubmit={(values) => submitAction?.onClick?.(values)}
          onValidationChange={config.behavior.onValidationChange}
          onChange={config.behavior.onChange}
          initialValues={config.behavior.initialValues}
          values={config.behavior.values}
          disabled={config.behavior.disabled}
          readOnly={config.behavior.readOnly}
          showLabels={config.behavior.showLabels}
          showRequired={config.behavior.showRequired}
          loading={loading}
        />

        {config.presentation.footer}
      </Stack>
    </SurfaceSectionCard>
  );

  const summaryNode = (
    <Stack className="ds-detail-form__summary" spacing={sectionSpacing}>
      {config.presentation.summary && (
        <SurfaceSectionCard
          title={config.presentation.summaryTitle ?? tSurfaceOr('detail_form.summary_title', 'Summary')}
        >
          {config.presentation.summary}
        </SurfaceSectionCard>
      )}
      {config.presentation.aside && <SurfaceSectionCard>{config.presentation.aside}</SurfaceSectionCard>}
    </Stack>
  );

  // Three conditions force a stacked (single-column) layout:
  // 1. Explicit stacked layout preference
  // 2. Responsive breakpoint triggers stacking
  // 3. No summary/aside content to put in a sidebar
  const stacked =
    config.visual.layout === 'stacked' ||
    shouldStack ||
    (!config.presentation.summary && !config.presentation.aside);

  const content = stacked ? (
    <Stack
      className="ds-surface ds-detail-form ds-detail-form--stacked"
      data-part="root"
      data-mobile={resolvedMobile ? 'true' : 'false'}
      data-stacked="true"
      data-loading={loading ? 'true' : 'false'}
      aria-busy={loading || undefined}
      spacing={sectionSpacing}
    >
      {formNode}
      {(config.presentation.summary || config.presentation.aside) && summaryNode}
    </Stack>
  ) : (
    <Grid
      className="ds-surface ds-detail-form ds-detail-form--split"
      data-part="root"
      data-mobile={resolvedMobile ? 'true' : 'false'}
      data-stacked="false"
      data-loading={loading ? 'true' : 'false'}
      aria-busy={loading || undefined}
      columns={12}
      gap={sectionSpacing}
    >
      <Grid.Item span={config.visual.formSpan ?? 8}>{formNode}</Grid.Item>
      <Grid.Item span={config.visual.summarySpan ?? 4}>{summaryNode}</Grid.Item>
    </Grid>
  );

  return (
    // Loading keeps the shell chrome mounted (title/breadcrumbs survive) so the
    // FormBuilder's own skeleton -- field rows and action bar shaped like the
    // form -- is what the user sees instead of the generic page skeleton.
    <PageShellSurface chrome={chrome} loading={false}>
      <SurfaceAccentBarWrapper defaults={profileDefaults}>
        {profileDefaults.animateEntrance ? (
          <FadeIn durationMs={profileDefaults.entranceDuration}>{content}</FadeIn>
        ) : (
          content
        )}
      </SurfaceAccentBarWrapper>
    </PageShellSurface>
  );
}
