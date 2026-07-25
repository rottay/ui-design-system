'use client';

/**
 * @fileoverview AuthSurface -- branded authentication page shell.
 * @description Provides split-view layout with hero panel, centered card form,
 * and legal/footer slots. Supports responsive stacking and hero positioning.
 * The app owns the actual auth form component; this surface owns the page chrome.
 */

import React from 'react';
import { Box, Card, Grid, Stack, Text } from '../../../../../primitives';
import { useSurfaceResponsiveLayout } from '../../../../runtime/responsive';
import type { AuthSurfaceConfig } from '../../../../foundation/contracts';
import { SurfaceActionBar } from '../../../../runtime/helpers/rendering';

export interface AuthSurfaceProps {
  config: AuthSurfaceConfig;
}

export function AuthSurface({ config }: AuthSurfaceProps): React.ReactElement {
  const { shouldStack, isMobile } = useSurfaceResponsiveLayout(config.visual);
  // Split layout requires all three conditions: a non-centered layout preference,
  // hero content to display, and enough viewport width. Missing any one falls
  // back to the vertically-centered single-column design.
  const isSplitLayout =
    config.visual.layout !== 'centered' && !!config.presentation.hero && !shouldStack;
  // Default hero placement is "start" (left side). Only when explicitly set
  // to 'end' does the hero swap to the right/bottom position.
  const heroFirst = config.visual.heroPosition !== 'end';
  const heroContent =
    isMobile && config.presentation.mobileHero
      ? config.presentation.mobileHero
      : config.presentation.hero;

  const formPanel = (
      <Card className="ds-auth__form-panel" variant="outlined">
      <Card.Body>
        <Stack spacing="lg">
          <Stack spacing="sm">
            {config.presentation.eyebrow && (
              <Text
                className="ds-auth__muted-text"
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                }}
              >
                {config.presentation.eyebrow}
              </Text>
            )}
            <Text style={{ fontSize: 28, fontWeight: 700 }}>{config.presentation.title}</Text>
            {config.presentation.subtitle && (
              <Text className="ds-auth__muted-text">
                {config.presentation.subtitle}
              </Text>
            )}
          </Stack>

          {config.presentation.form}

          <SurfaceActionBar
            actions={config.behavior.actions}
            access={config.access}
            justify="start"
          />
          {config.presentation.footer}
          {config.presentation.legal}
        </Stack>
      </Card.Body>
    </Card>
  );

  const heroPanel = heroContent ? (
    <Card className="ds-auth__hero-panel" variant="elevated">
      <Card.Body>{heroContent}</Card.Body>
    </Card>
  ) : null;

  return (
    <Box
      className="ds-surface ds-auth"
      data-part="root"
      data-layout={isSplitLayout ? 'split' : 'centered'}
      data-mobile={isMobile ? 'true' : 'false'}
      data-hero-position={heroFirst ? 'start' : 'end'}
      style={{
        minHeight: '100vh',
      }}
    >
      <Stack
        spacing="xl"
        style={{
          maxWidth: config.visual.maxWidth ?? 1120,
          margin: '0 auto',
          padding: isMobile ? '28px 20px 40px' : '48px 24px',
        }}
      >
        {config.presentation.topBar}

        {/* Two layout branches:
            - Split: hero and form side by side (50/50 grid), hero position swappable
            - Centered: form constrained to 520px max, hero stacks above or below
            The centered branch uses gridColumn: '1 / -1' to break out of the
            12-column grid and center itself, since Grid.Item span alone cannot
            achieve horizontal centering. */}
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
    </Box>
  );
}
