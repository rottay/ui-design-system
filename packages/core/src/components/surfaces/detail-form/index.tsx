'use client';

/**
 * DetailFormSurface
 *
 * Edit screens often need more than a plain form: a summary, supporting
 * guidance, or side detail about the entity being edited. This surface keeps
 * that split layout in the DS instead of forcing every app to rebuild it.
 */

import React from 'react';
import { Button, Card, Grid, Stack, Text } from '../../primitives';
import { PatternFormBuilder } from '../../patterns';
import { filterSurfaceFields, resolveSurfaceAction, resolveSurfaceButtonVariant } from '../helpers';
import { useSurfaceTranslations } from '../i18n';
import type { DetailFormSurfaceConfig } from '../types';
import { PageShellSurface } from '../page-shell';
import { useSurfaceResponsiveLayout } from '../responsive';
import { SurfaceActionBar, SurfaceSectionCard } from '../shared';
import { SurfaceErrorState } from '../states';

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
  const visibleFields = filterSurfaceFields(config.behavior.fields, config.permissions);
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
          <Card variant="outlined" style={{ borderColor: 'var(--ds-color-error-500)' }}>
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

  if (
    config.visual.layout === 'stacked' ||
    shouldStack ||
    (!config.presentation.summary && !config.presentation.aside)
  ) {
    return (
      <PageShellSurface chrome={chrome} loading={loading}>
        <Stack spacing="lg">
          {formNode}
          {(config.presentation.summary || config.presentation.aside) && summaryNode}
        </Stack>
      </PageShellSurface>
    );
  }

  return (
    <PageShellSurface chrome={chrome} loading={loading}>
      <Grid columns={12} gap="lg">
        <Grid.Item span={config.visual.formSpan ?? 8}>{formNode}</Grid.Item>
        <Grid.Item span={config.visual.summarySpan ?? 4}>{summaryNode}</Grid.Item>
      </Grid>
    </PageShellSurface>
  );
}
