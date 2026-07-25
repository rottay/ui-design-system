'use client';

/**
 * @fileoverview ProfileSurface -- user account management page.
 * @description Sectioned profile editing with avatar management, password changes,
 * and account deletion. Supports sidebar and stacked layouts. The app owns
 * save/update logic; this surface provides consistent page structure.
 */

import React, { useCallback, useState } from 'react';
import { Box, Button, Card, Flex, Grid, Input, Stack, Text, Textarea } from '../../../../../primitives';
import type { ProfileSection, ProfileSurfaceConfig } from '../../../../foundation/contracts';
import { PageShellSurface } from '../../../../composition/layout/page-shell';
import { useSurfaceResponsiveLayout } from '../../../../runtime/responsive';
import { SurfaceEmptyState } from '../../../../runtime/helpers/states';

export interface ProfileSurfaceProps {
  config: ProfileSurfaceConfig;
  loading?: boolean;
}

function readProfileValue(values: Record<string, unknown>, key: string): unknown {
  const value = Reflect.get(values, key);
  return typeof value === 'function' ? undefined : value;
}

// Each profile section manages its own edit/view toggle and local form state.
// This isolates section saves so editing one section does not force the entire
// profile into edit mode.
function ProfileSectionCard({
  section,
  onSave,
}: {
  section: ProfileSection;
  onSave?: (sectionKey: string, data: Record<string, unknown>) => void;
}): React.ReactElement {
  const [editing, setEditing] = useState(false);
  // Initialize field values from the section config. Empty string fallback
  // prevents uncontrolled-to-controlled React warnings on inputs.
  const [values, setValues] = useState<Record<string, unknown>>(() => {
    const initial: Record<string, unknown> = {};
    for (const field of section.fields) {
      initial[field.key] = field.value ?? '';
    }
    return initial;
  });

  const handleSave = useCallback(() => {
    onSave?.(section.key, values);
    setEditing(false);
  }, [onSave, section.key, values]);

  return (
    <Card className="ds-profile__section-card" variant="outlined">
      <Card.Body>
        <Stack spacing="md">
          <Flex justify="between" align="center">
            <Stack spacing="xs">
              <Text style={{ fontSize: 16, fontWeight: 600 }}>{section.label}</Text>
              {section.description && (
                <Text
                  className="ds-profile__muted-text"
                  style={{ fontSize: 13 }}
                >
                  {section.description}
                </Text>
              )}
            </Stack>
            {onSave && (
              <Button
                variant={editing ? 'primary' : 'secondary'}
                size="sm"
                onClick={editing ? handleSave : () => setEditing(true)}
              >
                <Text>{editing ? 'Save' : 'Edit'}</Text>
              </Button>
            )}
          </Flex>

          <Stack spacing="sm">
            {section.fields.map((field) => (
              <Stack key={field.key} spacing="xs">
                <Text
                  className="ds-profile__muted-text"
                  style={{ fontSize: 13, fontWeight: 500 }}
                >
                  {field.label}
                </Text>
                {editing && !field.readOnly ? (
                  field.type === 'textarea' ? (
                    <Textarea
                      value={String(readProfileValue(values, field.key) ?? '')}
                      // The `any` type on the event handles both DS primitives
                  // (which pass the value directly as a string) and native
                  // HTML inputs (which pass a SyntheticEvent). This dual
                  // handling avoids coupling to a specific engine's API.
                  onChange={(e: any) =>
                        setValues((prev) => ({ ...prev, [field.key]: typeof e === 'string' ? e : e?.target?.value ?? '' }))
                      }
                      placeholder={field.placeholder}
                    />
                  ) : (
                    <Input
                      value={String(readProfileValue(values, field.key) ?? '')}
                      onChange={(e: any) =>
                        setValues((prev) => ({ ...prev, [field.key]: typeof e === 'string' ? e : e?.target?.value ?? '' }))
                      }
                      placeholder={field.placeholder}
                      type={field.type ?? 'text'}
                    />
                  )
                ) : (
                  <Text>{String(readProfileValue(values, field.key) || '-')}</Text>
                )}
              </Stack>
            ))}
          </Stack>
        </Stack>
      </Card.Body>
    </Card>
  );
}

export function ProfileSurface({
  config,
  loading = false,
}: ProfileSurfaceProps): React.ReactElement {
  const isSidebarLayout = config.visual.layout === 'sidebar';
  // Sidebar layout stacks on tablet in addition to mobile because the
  // avatar + nav sidebar becomes too narrow on tablet viewports.
  const { shouldStack } = useSurfaceResponsiveLayout({
    stackOnMobile: true,
    stackOnTablet: isSidebarLayout,
  });

  const actionsNode = (
    <Flex gap={8} wrap="wrap" justify="end">
      {/* Password change is triggered with empty strings because the actual
          old/new password values come from a modal or separate form that the
          app manages. The surface just opens the flow. */}
      {config.behavior.onPasswordChange && (
        <Button variant="secondary" size="sm" onClick={() => config.behavior.onPasswordChange?.('', '')}>
          <Text>Change Password</Text>
        </Button>
      )}
      {config.behavior.onDeleteAccount && (
        <Button variant="danger" size="sm" onClick={config.behavior.onDeleteAccount}>
          <Text>Delete Account</Text>
        </Button>
      )}
    </Flex>
  );

  const sidebarContent = isSidebarLayout && !shouldStack ? (
    <Stack spacing="md">
      {config.presentation.avatar && (
        <Card variant="outlined">
          <Card.Body>
            <Flex justify="center">{config.presentation.avatar}</Flex>
          </Card.Body>
        </Card>
      )}
      {config.presentation.header}
    </Stack>
  ) : null;

  const mainContent = (
    <Stack
      className="ds-surface ds-profile"
      data-part="root"
      data-layout={isSidebarLayout && !shouldStack ? 'sidebar' : 'stacked'}
      data-loading={loading ? 'true' : 'false'}
      spacing="lg"
    >
      {!isSidebarLayout && config.presentation.avatar && (
        <Card variant="outlined">
          <Card.Body>
            <Flex justify="center">{config.presentation.avatar}</Flex>
          </Card.Body>
        </Card>
      )}
      {config.behavior.sections.length === 0 ? (
        <SurfaceEmptyState
          title="No profile sections"
          description="There are no profile sections configured."
        />
      ) : (
        config.behavior.sections.map((section) => (
          <ProfileSectionCard
            key={section.key}
            section={section}
            onSave={config.behavior.onSave}
          />
        ))
      )}
    </Stack>
  );

  return (
    <PageShellSurface
      chrome={config.presentation.chrome}
      actions={actionsNode}
      loading={loading}
    >
      {sidebarContent ? (
        <Grid columns={12} gap="lg">
          <Grid.Item span={4}>{sidebarContent}</Grid.Item>
          <Grid.Item span={8}>{mainContent}</Grid.Item>
        </Grid>
      ) : (
        mainContent
      )}
    </PageShellSurface>
  );
}
