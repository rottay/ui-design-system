'use client';

/**
 * @fileoverview EditorSurface - Rottay Design System
 * @description Reusable editing surface with content canvas, toolbar area,
 * save/publish actions, and optional preview panel.
 *
 * @remarks
 * This surface gives apps a consistent authoring shell while allowing them to
 * plug in either a simple textarea or a richer custom editor.
 */

import React, { useEffect, useState } from 'react';
import { Card, Grid, Stack, Text, Textarea } from '../../../../primitives';
import type { SurfaceAction } from '../../../foundation/types';
import type { EditorSurfaceConfig } from '../../../foundation/types';
import { useSurfaceTranslations } from '../../../foundation/i18n';
import { PageShellSurface } from '../../../layout/page-shell';
import { useSurfaceResponsiveLayout } from '../../../foundation/responsive';
import { SurfaceActionBar, SurfaceSectionCard } from '../../../foundation/shared';

export interface EditorSurfaceProps {
  config: EditorSurfaceConfig;
  loading?: boolean;
}

/** Editing surface with controlled/uncontrolled value handling and optional preview rail. */
export function EditorSurface({
  config,
  loading = false,
}: EditorSurfaceProps): React.ReactElement {
  const { tSurface } = useSurfaceTranslations();
  const { shouldStack } = useSurfaceResponsiveLayout(config.visual);
  // Controlled/uncontrolled dual mode: when `value` is provided the app owns
  // the state; otherwise the surface manages it internally. This mirrors
  // React's standard input pattern.
  const [internalValue, setInternalValue] = useState(config.behavior.initialValue ?? '');
  const value = config.behavior.value ?? internalValue;

  // Re-sync internal state when initialValue changes (e.g. loading a
  // different document) but only when the surface is in uncontrolled mode.
  useEffect(() => {
    if (config.behavior.value === undefined) {
      setInternalValue(config.behavior.initialValue ?? '');
    }
  }, [config.behavior.initialValue, config.behavior.value]);

  /** Update the editor value while supporting both controlled and uncontrolled usage. */
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

  // Save and publish are adapted into generic surface actions so the shared
  // action bar can render them without knowing editor-specific semantics.
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
      {/* Split layout with preview rail only activates when all three conditions
          are met: split mode requested, preview content exists, and viewport is
          wide enough. Otherwise the editor uses the full width. */}
      <Grid
        className={`ds-surface ds-editor ds-editor--${config.visual.layout === 'split' && config.presentation.preview && !shouldStack ? 'split' : 'full'}${loading ? ' ds-editor--loading' : ''}`}
        columns={config.visual.layout === 'split' && config.presentation.preview && !shouldStack ? 12 : 1}
        gap="lg"
      >
        <Grid.Item span={config.visual.layout === 'split' && config.presentation.preview && !shouldStack ? 8 : undefined}>
          <SurfaceSectionCard
            title={tSurface('editor.title')}
            description={config.presentation.description}
            actions={config.presentation.toolbar}
          >
            <Stack spacing="md">
              {config.presentation.helperText && (
                <Text className="ds-editor__muted-text" data-part="muted-text" style={{ color: 'var(--ds-color-text-muted)' }}>
                  {config.presentation.helperText}
                </Text>
              )}

              {/* Apps can replace the default textarea with a rich editor (Monaco,
                  TipTap, etc.) via renderEditor. The surface passes value + setter
                  so the custom editor integrates with the same controlled/uncontrolled
                  mechanism. */}
              {config.presentation.renderEditor?.(value, setValue) ?? (
                <Textarea
                  className="ds-editor__input"
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
            <Card className="ds-editor__preview" variant="outlined">
              <Card.Body>{config.presentation.preview}</Card.Body>
            </Card>
          </Grid.Item>
        )}
      </Grid>
    </PageShellSurface>
  );
}
