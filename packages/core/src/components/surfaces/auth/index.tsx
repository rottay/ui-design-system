'use client';

/**
 * AuthSurface
 *
 * Authentication screens need stronger layout ownership than a plain card
 * because the product often wants a branded split view, contextual guidance,
 * and legal/footer content. This surface keeps that shell in the DS while the
 * app still owns the actual auth form component.
 */

import React from 'react';
import { Card, Grid, Stack, Text } from '../../primitives';
import { useSurfaceResponsiveLayout } from '../responsive';
import type { AuthSurfaceConfig } from '../types';
import { SurfaceActionBar } from '../shared';

export interface AuthSurfaceProps {
  config: AuthSurfaceConfig;
}

export function AuthSurface({ config }: AuthSurfaceProps): React.ReactElement {
  const { shouldStack } = useSurfaceResponsiveLayout(config.visual);
  const isSplitLayout =
    config.visual.layout !== 'centered' && !!config.presentation.hero && !shouldStack;
  const heroFirst = config.visual.heroPosition !== 'end';

  const formPanel = (
    <Card variant="outlined">
      <Card.Body>
        <Stack spacing="lg">
          <Stack spacing="sm">
            <Text style={{ fontSize: 28, fontWeight: 700 }}>{config.presentation.title}</Text>
            {config.presentation.subtitle && (
              <Text style={{ color: 'var(--ds-color-text-muted)' }}>
                {config.presentation.subtitle}
              </Text>
            )}
          </Stack>

          {config.presentation.form}

          <SurfaceActionBar
            actions={config.behavior.actions}
            permissions={config.permissions}
            justify="start"
          />
          {config.presentation.footer}
          {config.presentation.legal}
        </Stack>
      </Card.Body>
    </Card>
  );

  const heroPanel = config.presentation.hero ? (
    <Card variant="elevated">
      <Card.Body>{config.presentation.hero}</Card.Body>
    </Card>
  ) : null;

  return (
    <Stack
      spacing="xl"
      style={{
        maxWidth: config.visual.maxWidth ?? 1120,
        margin: '0 auto',
        padding: '48px 24px',
      }}
    >
      {config.presentation.topBar}

      {isSplitLayout ? (
        <Grid columns={12} gap="lg">
          {heroFirst && heroPanel && <Grid.Item span={6}>{heroPanel}</Grid.Item>}
          <Grid.Item span={heroPanel ? 6 : 12}>{formPanel}</Grid.Item>
          {!heroFirst && heroPanel && <Grid.Item span={6}>{heroPanel}</Grid.Item>}
        </Grid>
      ) : (
        <Stack spacing="lg">
          {heroFirst && heroPanel}
          <Grid columns={12} gap="lg">
            <Grid.Item span={6} style={{ gridColumn: '1 / -1', maxWidth: 520, margin: '0 auto' }}>
              {formPanel}
            </Grid.Item>
          </Grid>
          {!heroFirst && heroPanel}
        </Stack>
      )}
    </Stack>
  );
}
