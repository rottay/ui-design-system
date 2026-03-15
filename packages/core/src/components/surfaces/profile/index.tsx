'use client';

/**
 * ProfileSurface
 *
 * User account management surface with support for sectioned profile editing,
 * avatar management, password changes, and account deletion. Supports both
 * sidebar and stacked layouts. The app owns actual save/update logic while this
 * surface provides consistent structure for profile pages.
 */

import React, { useCallback, useState } from 'react';
import { Box, Button, Card, Flex, Grid, Input, Stack, Text, Textarea } from '../../primitives';
import type { ProfileSection, ProfileSurfaceConfig } from '../types';
import { PageShellSurface } from '../page-shell';
import { useSurfaceResponsiveLayout } from '../responsive';
import { SurfaceEmptyState } from '../states';

export interface ProfileSurfaceProps {
  config: ProfileSurfaceConfig;
  loading?: boolean;
}

function ProfileSectionCard({
  section,
  onSave,
}: {
  section: ProfileSection;
  onSave?: (sectionKey: string, data: Record<string, unknown>) => void;
}): React.ReactElement {
  const [editing, setEditing] = useState(false);
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
    <Card variant="outlined">
      <Card.Body>
        <Stack spacing="md">
          <Flex justify="between" align="center">
            <Stack spacing="xs">
              <Text style={{ fontSize: 16, fontWeight: 600 }}>{section.label}</Text>
              {section.description && (
                <Text style={{ color: 'var(--ds-color-text-muted)', fontSize: 13 }}>
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
                <Text style={{ fontSize: 13, fontWeight: 500, color: 'var(--ds-color-text-muted)' }}>
                  {field.label}
                </Text>
                {editing && !field.readOnly ? (
                  field.type === 'textarea' ? (
                    <Textarea
                      value={String(values[field.key] ?? '')}
                      onChange={(e: any) =>
                        setValues((prev) => ({ ...prev, [field.key]: typeof e === 'string' ? e : e?.target?.value ?? '' }))
                      }
                      placeholder={field.placeholder}
                    />
                  ) : (
                    <Input
                      value={String(values[field.key] ?? '')}
                      onChange={(e: any) =>
                        setValues((prev) => ({ ...prev, [field.key]: typeof e === 'string' ? e : e?.target?.value ?? '' }))
                      }
                      placeholder={field.placeholder}
                      type={field.type ?? 'text'}
                    />
                  )
                ) : (
                  <Text>{String(values[field.key] || '-')}</Text>
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
  const { shouldStack } = useSurfaceResponsiveLayout({
    stackOnMobile: true,
    stackOnTablet: isSidebarLayout,
  });

  const actionsNode = (
    <Flex gap={8} wrap="wrap" justify="end">
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
    <Stack spacing="lg">
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
