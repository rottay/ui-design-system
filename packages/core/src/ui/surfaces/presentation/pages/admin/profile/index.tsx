'use client';

/**
 * @fileoverview ProfileSurface -- user account management page.
 * @description Sectioned profile editing with avatar management, password changes,
 * and account deletion. Supports sidebar and stacked layouts. The app owns
 * save/update logic; this surface provides consistent page structure.
 *
 * Composition: PageShellSurface chrome + per-section Cards (view/edit toggle
 * with per-section save) + shared state kits (loading skeleton, empty, error
 * with retry). Visible copy resolves through `tSurfaceOr` under
 * `surfaces.profile.*` with an English floor, and visual defaults cascade
 * config -> product profile -> DS defaults via
 * `useSurfaceProfileDefaultsWithOverrides`.
 */

import { densityScopeAttributes } from '@/infrastructure/runtime/foundation/density';
import { FadeIn } from '@/graphics/motion';
import { ActionDeleteIcon } from '@/graphics/icons/presentation/semantic/generated/roles/action-delete';
import { ActionEditIcon } from '@/graphics/icons/presentation/semantic/generated/roles/action-edit';
import { ActionSaveIcon } from '@/graphics/icons/presentation/semantic/generated/roles/action-save';
import { AuthPasswordIcon } from '@/graphics/icons/presentation/semantic/generated/roles/auth-password';
import { NavigationProfileIcon } from '@/graphics/icons/presentation/semantic/generated/roles/navigation-profile';
import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Button, Card, Flex, Grid, Heading, Input, Stack, Text, Textarea } from '../../../../../primitives';
import type { ProfileSection, ProfileSurfaceConfig } from '../../../../foundation/contracts';
import { PageShellSurface } from '../../../../composition/layout/page-shell';
import { useSurfaceResponsiveLayout } from '../../../../runtime/responsive';
import {
  SurfaceEmptyState,
  SurfaceErrorState,
  SurfaceLoadingSkeleton,
} from '../../../../runtime/helpers/states';
import { useSurfaceTranslations } from '../../../../runtime/helpers/states/i18n';
import { useSurfaceProfileDefaultsWithOverrides } from '../../../../runtime/profile-defaults/overrides';
import { resolveStackSpacing } from '../../../../runtime/profile-defaults/personality';

export interface ProfileSurfaceProps {
  config: ProfileSurfaceConfig;
  loading?: boolean;
  /** Load/render failure surfaced as an error state (ListSurface prop precedent). */
  error?: unknown;
  /** Retry handler rendered inside the error state when provided. */
  onRetry?: () => void | Promise<void>;
}

function readProfileValue(values: Record<string, unknown>, key: string): unknown {
  const value = Reflect.get(values, key);
  return typeof value === 'function' ? undefined : value;
}

// Initialize field values from the section config. Empty string fallback
// prevents uncontrolled-to-controlled React warnings on inputs.
function buildSectionValues(section: ProfileSection): Record<string, unknown> {
  const initial: Record<string, unknown> = {};
  for (const field of section.fields) {
    initial[field.key] = field.value ?? '';
  }
  return initial;
}

/**
 * The contract types `onSave` as returning void, but apps increasingly hand
 * back the promise of their mutation. Detected at runtime (never via types)
 * so async saves get a busy toggle without a contract change.
 */
function isThenable(value: unknown): value is PromiseLike<unknown> {
  return (
    !!value &&
    (typeof value === 'object' || typeof value === 'function') &&
    typeof (value as { then?: unknown }).then === 'function'
  );
}

// Each profile section manages its own edit/view toggle and local form state.
// This isolates section saves so editing one section does not force the entire
// profile into edit mode.
function ProfileSectionCard({
  section,
  cardVariant,
  onSave,
}: {
  section: ProfileSection;
  cardVariant: React.ComponentProps<typeof Card>['variant'];
  onSave?: (sectionKey: string, data: Record<string, unknown>) => void;
}): React.ReactElement {
  const { tSurfaceOr } = useSurfaceTranslations();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState<Record<string, unknown>>(() => buildSectionValues(section));
  const toggleRef = useRef<HTMLButtonElement>(null);
  const wasEditingRef = useRef(false);
  const idPrefix = useId();

  // Focus returns to the Edit/Save toggle whenever edit mode closes: the
  // Cancel button unmounts on close and would otherwise strand focus on
  // document.body. After a save the toggle already holds focus, so the
  // re-focus is a no-op there.
  useEffect(() => {
    if (wasEditingRef.current && !editing) {
      toggleRef.current?.focus();
    }
    wasEditingRef.current = editing;
  }, [editing]);

  const handleCancel = useCallback(() => {
    setValues(buildSectionValues(section));
    setEditing(false);
  }, [section]);

  const handleSave = useCallback(() => {
    if (!onSave) {
      setEditing(false);
      return;
    }
    const result: unknown = onSave(section.key, values);
    if (!isThenable(result)) {
      setEditing(false);
      return;
    }
    // Async app handler: hold the section in edit mode with a busy toggle
    // until the promise settles. On rejection the section stays editable so
    // no input is lost -- the contract declares no per-section error slot,
    // so the app owns surfacing the failure.
    setSaving(true);
    void Promise.resolve(result)
      .then(() => setEditing(false))
      .catch(() => undefined)
      .finally(() => setSaving(false));
  }, [onSave, section.key, values]);

  return (
    <Card className="ds-profile__section-card" variant={cardVariant}>
      <Card.Body>
        <Stack spacing="md">
          <Flex justify="between" align="start" wrap="wrap" gap={8}>
            <Stack spacing="xs">
              <Heading level="h2" size="md" weight="semibold">
                {section.label}
              </Heading>
              {section.description && (
                <Text className="ds-profile__muted-text" size="sm" color="muted">
                  {section.description}
                </Text>
              )}
            </Stack>
            {onSave && (
              <Flex gap={8} wrap="wrap" justify="end">
                {editing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={saving}
                    aria-label={tSurfaceOr('profile.section_cancel_aria', 'Cancel editing {section}', {
                      section: section.label,
                    })}
                    onClick={handleCancel}
                  >
                    {tSurfaceOr('profile.cancel_action', 'Cancel')}
                  </Button>
                )}
                <Button
                  ref={toggleRef}
                  variant={editing ? 'primary' : 'secondary'}
                  size="sm"
                  icon={editing ? <ActionSaveIcon decorative size={15} /> : <ActionEditIcon decorative size={15} />}
                  loading={saving}
                  aria-label={
                    editing
                      ? tSurfaceOr('profile.section_save_aria', 'Save {section}', { section: section.label })
                      : tSurfaceOr('profile.section_edit_aria', 'Edit {section}', { section: section.label })
                  }
                  onClick={editing ? handleSave : () => setEditing(true)}
                >
                  {editing
                    ? tSurfaceOr('profile.save_action', 'Save')
                    : tSurfaceOr('profile.edit_action', 'Edit')}
                </Button>
              </Flex>
            )}
          </Flex>

          <Stack spacing="sm">
            {section.fields.map((field) => {
              const fieldId = `${idPrefix}-${section.key}-${field.key}`;
              const fieldValue = String(readProfileValue(values, field.key) ?? '');
              const editable = editing && !field.readOnly;
              return (
                <Stack key={field.key} spacing="xs">
                  {/* In edit mode the label becomes a real `<label>` bound to
                      its control; in view mode it stays a muted caption. */}
                  <Text
                    as={editable ? 'label' : undefined}
                    htmlFor={editable ? fieldId : undefined}
                    className="ds-profile__muted-text"
                    size="sm"
                    weight="medium"
                    color="muted"
                  >
                    {field.label}
                  </Text>
                  {editable ? (
                    field.type === 'textarea' ? (
                      <Textarea
                        id={fieldId}
                        value={fieldValue}
                        // DS inputs pass the value first (InputProps contract);
                        // no native-event dual handling needed.
                        onChange={(value: string) =>
                          setValues((prev) => ({ ...prev, [field.key]: value }))
                        }
                        placeholder={field.placeholder}
                        disabled={saving}
                      />
                    ) : (
                      <Input
                        id={fieldId}
                        value={fieldValue}
                        onChange={(value: string) =>
                          setValues((prev) => ({ ...prev, [field.key]: value }))
                        }
                        placeholder={field.placeholder}
                        type={field.type ?? 'text'}
                        disabled={saving}
                      />
                    )
                  ) : (
                    // `-` is a locale-neutral empty-value glyph (typography,
                    // not copy), so it stays out of the i18n catalog.
                    <Text className="ds-profile__field-value" color={fieldValue ? undefined : 'muted'}>
                      {fieldValue || '-'}
                    </Text>
                  )}
                </Stack>
              );
            })}
          </Stack>
        </Stack>
      </Card.Body>
    </Card>
  );
}

export function ProfileSurface({
  config,
  loading = false,
  error,
  onRetry,
}: ProfileSurfaceProps): React.ReactElement {
  const profileDefaults = useSurfaceProfileDefaultsWithOverrides(
    config.visual?.profileOverrides
  );
  const { tSurfaceOr } = useSurfaceTranslations();
  const isSidebarLayout = config.visual.layout === 'sidebar';
  // Sidebar layout stacks on tablet in addition to mobile because the
  // avatar + nav sidebar becomes too narrow on tablet viewports.
  const { isMobile, shouldStack } = useSurfaceResponsiveLayout({
    stackOnMobile: true,
    stackOnTablet: isSidebarLayout,
  });
  const isCompact = profileDefaults.density === 'compact';

  const hasPageActions =
    !!config.behavior.onPasswordChange || !!config.behavior.onDeleteAccount;
  const actionsNode = hasPageActions ? (
    <Flex gap={8} wrap="wrap" justify="end">
      {/* Password change is triggered with empty strings because the actual
          old/new password values come from a modal or separate form that the
          app manages. The surface just opens the flow. */}
      {config.behavior.onPasswordChange && (
        <Button
          variant="secondary"
          size="sm"
          icon={<AuthPasswordIcon decorative size={15} />}
          onClick={() => config.behavior.onPasswordChange?.('', '')}
        >
          {tSurfaceOr('profile.action_change_password', 'Change Password')}
        </Button>
      )}
      {config.behavior.onDeleteAccount && (
        <Button
          variant="danger"
          size="sm"
          icon={<ActionDeleteIcon decorative size={15} />}
          onClick={config.behavior.onDeleteAccount}
        >
          {tSurfaceOr('profile.action_delete_account', 'Delete Account')}
        </Button>
      )}
    </Flex>
  ) : undefined;

  // Error short-circuits the whole body: the shell keeps the page chrome and
  // actions so retry never loses context (ListSurface precedent).
  if (error) {
    return (
      <PageShellSurface
        chrome={config.presentation.chrome}
        actions={actionsNode}
        loading={false}
      >
        <SurfaceErrorState error={error} onRetry={onRetry} />
      </PageShellSurface>
    );
  }

  const showSidebar = isSidebarLayout && !shouldStack;

  // When the sidebar is not rendered (stacked layout, or sidebar layout
  // stacked on mobile/tablet), the avatar and header slots move into the
  // main column so consumer content is never dropped at narrow widths.
  const identityContent = (config.presentation.avatar || config.presentation.header) ? (
    <Stack spacing="md">
      {config.presentation.avatar && (
        <Card variant={profileDefaults.cardVariant}>
          <Card.Body>
            <Flex justify="center">{config.presentation.avatar}</Flex>
          </Card.Body>
        </Card>
      )}
      {config.presentation.header}
    </Stack>
  ) : null;

  const sidebarContent = showSidebar ? identityContent : null;

  const mainContent = (
    <Stack
      className="ds-surface ds-profile"
      data-part="root"
      data-layout={showSidebar ? 'sidebar' : 'stacked'}
      data-mobile={isMobile ? 'true' : 'false'}
      {...densityScopeAttributes(profileDefaults.density)}
      data-loading={loading ? 'true' : 'false'}
      aria-busy={loading}
      spacing={resolveStackSpacing(profileDefaults.sectionSpacing)}
    >
      {!showSidebar && identityContent}

      {/*
        Loading keeps the real page chrome and renders section-shaped body
        skeletons instead of the shell's whole-page placeholder:
        PatternPageShell's `loading` early return never renders children, so
        a section-shaped skeleton can only exist here. Two skeleton cards
        mirror the typical sections footprint and avoid layout shift; row
        count scales with density.
      */}
      {loading ? (
        <>
          {[0, 1].map((skeletonIndex) => (
            <Card key={skeletonIndex} variant={profileDefaults.cardVariant}>
              <Card.Body>
                <SurfaceLoadingSkeleton rows={isCompact ? 8 : 5} />
              </Card.Body>
            </Card>
          ))}
        </>
      ) : config.behavior.sections.length === 0 ? (
        <Card variant={profileDefaults.cardVariant}>
          <Card.Body>
            <SurfaceEmptyState
              title={tSurfaceOr('profile.empty_title', 'No profile sections')}
              description={tSurfaceOr(
                'profile.empty_description',
                'There are no profile sections configured.'
              )}
              icon={<NavigationProfileIcon decorative size={32} />}
            />
          </Card.Body>
        </Card>
      ) : (
        config.behavior.sections.map((section) => (
          <ProfileSectionCard
            key={section.key}
            section={section}
            cardVariant={profileDefaults.cardVariant}
            onSave={config.behavior.onSave}
          />
        ))
      )}
    </Stack>
  );

  const bodyContent = profileDefaults.animateEntrance ? (
    <FadeIn durationMs={profileDefaults.entranceDuration}>{mainContent}</FadeIn>
  ) : (
    mainContent
  );

  return (
    <PageShellSurface
      chrome={config.presentation.chrome}
      actions={actionsNode}
      loading={false}
    >
      {sidebarContent ? (
        <Grid columns={12} gap="lg">
          <Grid.Item span={4}>{sidebarContent}</Grid.Item>
          <Grid.Item span={8}>{bodyContent}</Grid.Item>
        </Grid>
      ) : (
        bodyContent
      )}
    </PageShellSurface>
  );
}
