'use client';

/**
 * @fileoverview EditorSurface - Rottay Design System
 * @description Reusable editing surface with content canvas, toolbar area,
 * save/publish actions, and optional preview panel.
 *
 * @remarks
 * The surface owns the split/stacked layout recipe, the
 * controlled/uncontrolled value mechanism, the save/publish/cancel action
 * adaptation, and the personality cascade. Apps plug in either the default
 * Textarea primitive or a richer custom editor (Monaco, TipTap, etc.) via
 * `renderEditor`; the preview slot is app-rendered (e.g. the shared
 * MarkdownView primitive or any custom renderer) and the surface only frames
 * it — a titled card inside a labeled region — never re-implements
 * rendering.
 *
 * States: `loading` renders a surface-owned mirror skeleton (input block
 * plus status line inside the same section card, and a preview block inside
 * the same preview card when the slot is configured, so the swap to real
 * content is paint-only — the page-shell loading early-return is
 * intentionally not engaged, dashboard idiom); `error` composes the shared
 * `SurfaceErrorState` kit with retry under the live page chrome, where only
 * the cancel action survives because save/publish act on the document value,
 * which never loaded; `behavior.saving` drives the busy posture (disabled
 * input plus `data-saving` on the root, with the async spin owned by the
 * caller's action `loading` flags). The editor surface carries NO live-region
 * semantics: the preview region is a labeled landmark, not an announcer.
 */

import React, { useEffect, useId, useState } from 'react';
import { Box, Card, Grid, Stack, Text, Textarea } from '../../../../../primitives';
import { FadeIn } from '@/graphics/motion';
import type { SurfaceAction } from '../../../../foundation/contracts';
import type { EditorSurfaceConfig } from '../../../../foundation/contracts';
import { useSurfaceTranslations } from '../../../../runtime/helpers/states/i18n';
import { useSurfaceProfileDefaultsWithOverrides } from '../../../../runtime/profile-defaults/overrides';
import {
  resolveStackSpacing,
  SurfaceAccentBarWrapper,
} from '../../../../runtime/profile-defaults/personality';
import { PageShellSurface } from '../../../../composition/layout/page-shell';
import { useSurfaceResponsiveLayout } from '../../../../runtime/responsive';
import { SurfaceActionBar, SurfaceSectionCard } from '../../../../runtime/helpers/rendering';
import { SurfaceErrorState } from '../../../../runtime/helpers/states';

export interface EditorSurfaceProps {
  config: EditorSurfaceConfig;
  loading?: boolean;
  /** Load failure of the document payload; renders the shared error kit under the live page chrome. */
  error?: unknown;
  /** Retry handler wired to the error state's retry action. */
  onRetry?: () => void | Promise<void>;
}

/** Editing surface with controlled/uncontrolled value handling and optional preview rail. */
export function EditorSurface({
  config,
  loading = false,
  error,
  onRetry,
}: EditorSurfaceProps): React.ReactElement {
  const { tSurfaceOr } = useSurfaceTranslations();
  const profileDefaults = useSurfaceProfileDefaultsWithOverrides(config.visual?.profileOverrides);
  const { shouldStack, isMobile, hasResolvedViewport } = useSurfaceResponsiveLayout(config.visual);
  const resolvedMobile = isMobile && hasResolvedViewport;
  const sectionSpacing = resolveStackSpacing(profileDefaults.sectionSpacing);
  const previewTitleId = useId();
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

  // Split layout with preview rail only activates when all three conditions
  // are met: split mode requested, preview content exists, and viewport is
  // wide enough. Otherwise the editor uses the full width and the preview
  // (when configured) stacks below as its own panel.
  const useSplit =
    config.visual.layout === 'split' && Boolean(config.presentation.preview) && !shouldStack;
  // `previewWidth` is contract-declared: when set, the split leaves the fixed
  // 12-column 8/4 recipe and gives the preview rail its own track; the editor
  // column stays fluid (`minmax(0, 1fr)`) so long content can never overflow
  // it (chat `sidebarWidth` idiom).
  const previewTrack =
    config.visual.previewWidth === undefined || config.visual.previewWidth === null
      ? undefined
      : typeof config.visual.previewWidth === 'number'
        ? `${config.visual.previewWidth}px`
        : config.visual.previewWidth;

  // Error state renders under the live page chrome so the header stays
  // usable (dashboard idiom). Only the cancel action survives here: save and
  // publish act on the document value, which never loaded.
  if (error) {
    return (
      <PageShellSurface
        chrome={{
          ...config.presentation.chrome,
          maxWidth: config.visual.maxWidth ?? config.presentation.chrome.maxWidth,
        }}
        actions={
          config.behavior.cancelAction ? (
            <SurfaceActionBar actions={[config.behavior.cancelAction]} access={config.access} />
          ) : undefined
        }
      >
        <SurfaceErrorState error={error} onRetry={onRetry} />
      </PageShellSurface>
    );
  }

  const editorContent = (
    <Grid
      className={`ds-surface ds-editor ds-editor--${useSplit ? 'split' : 'full'}${loading ? ' ds-editor--loading' : ''}`}
      data-part="root"
      data-layout={useSplit ? 'split' : 'full'}
      data-mobile={resolvedMobile ? 'true' : 'false'}
      data-loading={loading ? 'true' : 'false'}
      data-saving={config.behavior.saving ? 'true' : 'false'}
      aria-busy={loading ? 'true' : undefined}
      columns={useSplit ? 12 : 1}
      templateColumns={
        useSplit && previewTrack ? `minmax(0, 1fr) minmax(0, ${previewTrack})` : undefined
      }
      gap={sectionSpacing}
    >
      <Grid.Item span={useSplit && !previewTrack ? 8 : undefined}>
        <SurfaceSectionCard
          title={tSurfaceOr('editor.title', 'Editor')}
          description={config.presentation.description}
          /* The toolbar acts on the editor instance; during the mirror
             skeleton there is no editor to act on, so the slot stays out
             until the content resolves. */
          actions={loading ? undefined : config.presentation.toolbar}
        >
          <Stack spacing="md">
            {config.presentation.helperText && (
              <Text className="ds-editor__muted-text" color="muted" size="sm">
                {config.presentation.helperText}
              </Text>
            )}

            {loading ? (
              /* Mirror skeleton: the section frame, title, description and
                 helper copy stay live; only the input/status geometry is
                 blocked, so the swap to real content is paint-only. The
                 page-shell loading early-return is intentionally NOT engaged
                 (dashboard idiom) because it would drop the editor anatomy. */
              <>
                <Box data-part="editor-skeleton-block" data-size="input" aria-hidden="true" />
                {config.presentation.statusBar && (
                  <Box data-part="editor-skeleton-block" data-size="status" aria-hidden="true" />
                )}
              </>
            ) : (
              <>
                {/* Apps can replace the default textarea with a rich editor
                    (Monaco, TipTap, etc.) via renderEditor. The surface passes
                    value + setter so the custom editor integrates with the same
                    controlled/uncontrolled mechanism. */}
                {config.presentation.renderEditor?.(value, setValue) ?? (
                  <Textarea
                    className="ds-editor__input"
                    value={value}
                    onChange={(nextValue) => setValue(nextValue)}
                    placeholder={config.behavior.placeholder}
                    aria-label={
                      config.behavior.placeholder ?? tSurfaceOr('editor.input_label', 'Content editor')
                    }
                    disabled={config.behavior.disabled || config.behavior.saving}
                    readOnly={config.behavior.readOnly}
                    rows={12}
                    style={
                      config.visual.editorMinHeight !== undefined
                        ? // Contract-declared instance geometry, stamped as a
                          // logical property so RTL/vertical writing modes
                          // mirror it; the skin owns no editor height.
                          { minBlockSize: config.visual.editorMinHeight }
                        : undefined
                    }
                  />
                )}

                {config.presentation.statusBar && (
                  <Box data-part="status-bar">{config.presentation.statusBar}</Box>
                )}
              </>
            )}
          </Stack>
        </SurfaceSectionCard>
      </Grid.Item>

      {config.presentation.preview && (
        <Grid.Item span={useSplit && !previewTrack ? 4 : undefined}>
          {/* The preview is a labeled landmark (`<section>` + accessible name
              is the native region role): screen-reader users can jump straight
              to the rendered output. The visible card title doubles as the
              region label via `aria-labelledby`, so both stay in sync. */}
          <Box as="section" data-part="preview" aria-labelledby={previewTitleId}>
            <Card
              className="ds-editor__preview"
              variant={profileDefaults.cardVariant}
              title={<span id={previewTitleId}>{tSurfaceOr('editor.preview_title', 'Preview')}</span>}
              titleHeadingLevel={2}
            >
              <Card.Body>
                {loading ? (
                  <Box data-part="editor-skeleton-block" data-size="preview" aria-hidden="true" />
                ) : (
                  config.presentation.preview
                )}
              </Card.Body>
            </Card>
          </Box>
        </Grid.Item>
      )}
    </Grid>
  );

  return (
    /* The shell's loading early-return is intentionally not engaged: the
       surface owns a mirror skeleton that preserves the editor anatomy
       (dashboard idiom), so the page chrome and section frames stay live and
       the swap to real content is paint-only. */
    <PageShellSurface
      chrome={{
        ...config.presentation.chrome,
        maxWidth: config.visual.maxWidth ?? config.presentation.chrome.maxWidth,
      }}
      actions={<SurfaceActionBar actions={actions} access={config.access} />}
      loading={false}
    >
      <SurfaceAccentBarWrapper defaults={profileDefaults}>
        {profileDefaults.animateEntrance ? (
          <FadeIn durationMs={profileDefaults.entranceDuration}>{editorContent}</FadeIn>
        ) : (
          editorContent
        )}
      </SurfaceAccentBarWrapper>
    </PageShellSurface>
  );
}
