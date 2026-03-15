'use client';

/**
 * EditorSurface
 *
 * Editing flows often need a content canvas, a toolbar, save/publish actions,
 * and sometimes a live preview. This surface standardizes that page skeleton
 * while allowing the app to plug in a simple textarea or a richer editor.
 */

import React, { useEffect, useState } from 'react';
import { Card, Grid, Stack, Text, Textarea } from '../../primitives';
import type { SurfaceAction } from '../types';
import type { EditorSurfaceConfig } from '../types';
import { useSurfaceTranslations } from '../i18n';
import { PageShellSurface } from '../page-shell';
import { useSurfaceResponsiveLayout } from '../responsive';
import { SurfaceActionBar, SurfaceSectionCard } from '../shared';

export interface EditorSurfaceProps {
  config: EditorSurfaceConfig;
  loading?: boolean;
}

export function EditorSurface({
  config,
  loading = false,
}: EditorSurfaceProps): React.ReactElement {
  const { tSurface } = useSurfaceTranslations();
  const { shouldStack } = useSurfaceResponsiveLayout(config.visual);
  const [internalValue, setInternalValue] = useState(config.behavior.initialValue ?? '');
  const value = config.behavior.value ?? internalValue;

  useEffect(() => {
    if (config.behavior.value === undefined) {
      setInternalValue(config.behavior.initialValue ?? '');
    }
  }, [config.behavior.initialValue, config.behavior.value]);

  const setValue = (nextValue: string): void => {
    if (config.behavior.value === undefined) {
      setInternalValue(nextValue);
    }

    config.behavior.onChange?.(nextValue);
  };

  const actions: SurfaceAction<void>[] = [];

  if (config.behavior.cancelAction) {
    actions.push(config.behavior.cancelAction);
  }

  if (config.behavior.saveAction) {
    actions.push({
      id: config.behavior.saveAction.id,
      label: config.behavior.saveAction.label,
      icon: config.behavior.saveAction.icon,
      variant: config.behavior.saveAction.variant,
      disabled: config.behavior.saveAction.disabled,
      loading: config.behavior.saveAction.loading,
      onClick: () => config.behavior.saveAction?.onClick?.(value),
    });
  }

  if (config.behavior.publishAction) {
    actions.push({
      id: config.behavior.publishAction.id,
      label: config.behavior.publishAction.label,
      icon: config.behavior.publishAction.icon,
      variant: config.behavior.publishAction.variant,
      disabled: config.behavior.publishAction.disabled,
      loading: config.behavior.publishAction.loading,
      onClick: () => config.behavior.publishAction?.onClick?.(value),
    });
  }

  return (
    <PageShellSurface
      chrome={{
        ...config.presentation.chrome,
        maxWidth: config.visual.maxWidth ?? config.presentation.chrome.maxWidth,
      }}
      actions={<SurfaceActionBar actions={actions} permissions={config.permissions} />}
      loading={loading}
    >
      <Grid columns={config.visual.layout === 'split' && config.presentation.preview && !shouldStack ? 12 : 1} gap="lg">
        <Grid.Item span={config.visual.layout === 'split' && config.presentation.preview && !shouldStack ? 8 : undefined}>
          <SurfaceSectionCard
            title={tSurface('editor.title')}
            description={config.presentation.description}
            actions={config.presentation.toolbar}
          >
            <Stack spacing="md">
              {config.presentation.helperText && (
                <Text style={{ color: 'var(--ds-color-text-muted)' }}>
                  {config.presentation.helperText}
                </Text>
              )}

              {config.presentation.renderEditor?.(value, setValue) ?? (
                <Textarea
                  value={value}
                  onChange={(nextValue) => setValue(nextValue)}
                  placeholder={config.behavior.placeholder}
                  disabled={config.behavior.disabled || config.behavior.saving}
                  readOnly={config.behavior.readOnly}
                  rows={12}
                  style={{ minHeight: config.visual.editorMinHeight }}
                />
              )}

              {config.presentation.statusBar}
            </Stack>
          </SurfaceSectionCard>
        </Grid.Item>

        {config.presentation.preview && (
          <Grid.Item span={!shouldStack ? 4 : undefined}>
            <Card variant="outlined">
              <Card.Body>{config.presentation.preview}</Card.Body>
            </Card>
          </Grid.Item>
        )}
      </Grid>
    </PageShellSurface>
  );
}
