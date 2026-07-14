'use client';

/**
 * @fileoverview DetailFormSurface -- split-layout edit page with summary aside.
 * @description Combines PatternFormBuilder with an optional detail/summary sidebar.
 * Useful when edit screens need supporting context (entity preview, guidance, or
 * related metadata) alongside the form fields.
 */

import React from 'react';
import { Button, Card, Grid, Stack, Text } from '../../../../primitives';
import { PatternFormBuilder } from '../../../../patterns';
import { filterSurfaceFields, resolveSurfaceAction, resolveSurfaceButtonVariant } from '../../../foundation/helpers';
import { useSurfaceTranslations } from '../../../foundation/i18n';
import type { DetailFormSurfaceConfig } from '../../../foundation/types';
import { PageShellSurface } from '../../../layout/page-shell';
import { useSurfaceResponsiveLayout } from '../../../foundation/responsive';
import { SurfaceActionBar, SurfaceSectionCard } from '../../../foundation/shared';
import { SurfaceErrorState } from '../../../foundation/states';

export interface DetailFormSurfaceProps {
  config: DetailFormSurfaceConfig;
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void | Promise<void>;
}

export function DetailFormSurface({
  config,
  loading = false,
  error,
  onRetry,
}: DetailFormSurfaceProps): React.ReactElement {
  const { tSurface } = useSurfaceTranslations();
  const { shouldStack } = useSurfaceResponsiveLayout(config.visual);
  // Permission-aware field filtering removes fields the current user cannot
  // see before they reach the form builder, avoiding empty-field placeholders.
  const visibleFields = filterSurfaceFields(config.behavior.fields, config.permissions);
  const submitAction = resolveSurfaceAction(config.behavior.submitAction, config.permissions);
  // Surface maxWidth overrides chrome maxWidth so individual surfaces can
  // constrain form width without altering the shared chrome config.
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

  // Secondary and cancel actions are merged into a single bar. The submit
  // action is excluded here because it lives inside the form builder as
  // the HTML submit button, which enables native form validation.
  const actionBar = (
    <SurfaceActionBar
      actions={[
        ...(config.behavior.secondaryActions ?? []),
        ...(config.behavior.cancelAction ? [config.behavior.cancelAction] : []),
      ]}
      permissions={config.permissions}
    />
  );

  const formNode = (
    <SurfaceSectionCard
      title={config.presentation.description ? tSurface('detail_form.form_title') : undefined}
      description={config.presentation.description}
      actions={actionBar}
    >
      <Stack spacing="lg">
        {config.presentation.error && (
          <Card className="ds-detail-form__error-card" variant="outlined" style={{ borderColor: 'var(--ds-color-error-500)' }}>
            <Card.Body>{config.presentation.error}</Card.Body>
          </Card>
        )}

        <PatternFormBuilder
          fields={visibleFields}
          layout="vertical"
          columns={config.visual.columns}
          renderField={config.presentation.renderField}
          actions={
            submitAction ? (
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
        />

        {config.presentation.footer}
      </Stack>
    </SurfaceSectionCard>
  );

  const summaryNode = (
    <Stack spacing="lg">
      {config.presentation.summary && (
        <SurfaceSectionCard title={config.presentation.summaryTitle ?? tSurface('detail_form.summary_title')}>
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
  if (
    config.visual.layout === 'stacked' ||
    shouldStack ||
    (!config.presentation.summary && !config.presentation.aside)
  ) {
    return (
      <PageShellSurface chrome={chrome} loading={loading}>
        <Stack className="ds-surface ds-detail-form ds-detail-form--stacked" spacing="lg">
          {formNode}
          {(config.presentation.summary || config.presentation.aside) && summaryNode}
        </Stack>
      </PageShellSurface>
    );
  }

  return (
    <PageShellSurface chrome={chrome} loading={loading}>
      <Grid className="ds-surface ds-detail-form ds-detail-form--split" columns={12} gap="lg">
        <Grid.Item span={config.visual.formSpan ?? 8}>{formNode}</Grid.Item>
        <Grid.Item span={config.visual.summarySpan ?? 4}>{summaryNode}</Grid.Item>
      </Grid>
    </PageShellSurface>
  );
}
