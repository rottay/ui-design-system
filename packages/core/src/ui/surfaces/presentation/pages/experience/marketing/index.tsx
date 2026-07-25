'use client';

/**
 * @fileoverview MarketingSurface -- public/pre-auth editorial page shell.
 * @description Owns hero composition, responsive stacking, action placement,
 * and section rhythm for marketing/public-entry pages. Apps provide content;
 * the surface decides how that content rearranges across breakpoints.
 */

import React from 'react';
import { Badge, Box, Card, Flex, Grid, Stack, Text } from '../../../../../primitives';
import { SurfaceActionBar } from '../../../../runtime/helpers/rendering';
import { useSurfaceResponsiveLayout } from '../../../../runtime/responsive';
import type { MarketingSurfaceConfig } from '../../../../foundation/contracts';

export interface MarketingSurfaceProps {
  config: MarketingSurfaceConfig;
}

export function MarketingSurface({
  config,
}: MarketingSurfaceProps): React.ReactElement {
  const { shouldStack, isMobile } = useSurfaceResponsiveLayout(config.visual);
  const heroFirst = config.visual.heroPosition !== 'end';
  const heroContent =
    isMobile && config.presentation.mobileHero
      ? config.presentation.mobileHero
      : config.presentation.hero;
  const supportingContent =
    isMobile && config.presentation.mobileSupporting
      ? config.presentation.mobileSupporting
      : config.presentation.supporting;

  const heroNode = heroContent ? (
    <Box className="ds-marketing__hero" data-part="hero" style={{ width: '100%' }}>
      {heroContent}
    </Box>
  ) : null;

  const introNode = (
    <Stack spacing="lg">
      {(config.presentation.eyebrow || config.presentation.badge) && (
        <Flex align="center" gap={10} wrap="wrap">
          {config.presentation.eyebrow ? (
            <Text
              className="ds-marketing__muted-text"
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
              }}
            >
              {config.presentation.eyebrow}
            </Text>
          ) : null}
          {config.presentation.badge ? (
            <Badge variant="secondary" size="sm">
              {config.presentation.badge}
            </Badge>
          ) : null}
        </Flex>
      )}

      <Stack spacing="md">
        <Text
          style={{
            fontSize: isMobile ? 'clamp(2.45rem, 11vw, 3.6rem)' : 'clamp(3rem, 5.8vw, 5rem)',
            fontWeight: 800,
            lineHeight: 0.98,
            letterSpacing: '-0.07em',
            maxWidth: 620,
          }}
        >
          {config.presentation.title}
        </Text>
        {config.presentation.description ? (
          <Text
            className="ds-marketing__description"
            style={{
              fontSize: isMobile ? 16 : 18,
              lineHeight: isMobile ? 1.75 : 1.85,
              maxWidth: 640,
            }}
          >
            {config.presentation.description}
          </Text>
        ) : null}
      </Stack>

      {config.behavior.actions?.length ? (
        <SurfaceActionBar
          actions={config.behavior.actions}
          access={config.access}
          justify="start"
          size={isMobile ? 'sm' : 'md'}
        />
      ) : null}

      {supportingContent ? <Box>{supportingContent}</Box> : null}
    </Stack>
  );

  return (
    <Box
      className="ds-surface ds-marketing"
      data-part="root"
      data-layout={shouldStack ? 'stacked' : 'split'}
      data-mobile={isMobile ? 'true' : 'false'}
      data-hero-position={heroFirst ? 'start' : 'end'}
      style={{
        minHeight: '100vh',
        paddingBottom: isMobile ? 40 : 72,
      }}
    >
      <Stack
        spacing="xl"
        style={{
          maxWidth: config.visual.maxWidth ?? 1260,
          margin: '0 auto',
          padding: isMobile ? '28px 20px 0' : '48px 24px 0',
        }}
      >
        {config.presentation.topBar}

        {shouldStack ? (
          <Stack spacing="lg">
            {heroFirst && heroNode}
            {introNode}
            {!heroFirst && heroNode}
          </Stack>
        ) : (
          <Grid columns={12} gap="lg">
            {heroFirst && heroNode ? (
              <Grid.Item span={6}>{heroNode}</Grid.Item>
            ) : null}
            <Grid.Item span={heroNode ? 6 : 12}>{introNode}</Grid.Item>
            {!heroFirst && heroNode ? (
              <Grid.Item span={6}>{heroNode}</Grid.Item>
            ) : null}
          </Grid>
        )}

        {config.presentation.sections?.length ? (
          <Stack spacing="xl">
            {config.presentation.sections.map((section, index) => (
              <Box key={index}>{section}</Box>
            ))}
          </Stack>
        ) : null}

        {config.presentation.footer ? (
          <Card variant="ghost">
            <Card.Body>{config.presentation.footer}</Card.Body>
          </Card>
        ) : null}
      </Stack>
    </Box>
  );
}
