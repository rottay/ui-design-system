'use client';

/**
 * @fileoverview MarketingSurface -- public/pre-auth editorial page shell.
 * @description Owns the marketing page canvas and its editorial anatomy:
 * eyebrow/badge kicker, display title (the page's single h1), lede, CTA row,
 * hero preview slot, app-provided sections and a quiet footer. Apps provide
 * content; the surface owns the responsive split/stacked recipe, the state
 * choreography (loading mirror skeleton, error with retry under the live top
 * bar) and the canvas material (sanctioned surface-tint + the showcase-only
 * mesh channel, spec section 5).
 *
 * @remarks
 * Composition: canonical primitives only (Heading, Text, Badge, Card, Grid,
 * Stack, Flex, Box) + the governed SurfaceActionBar (access-filtered CTA row)
 * + the shared SurfaceErrorState kit. There is no marketing PATTERN to
 * compose: the contract is a slot vocabulary, not a data recipe, so the
 * surface keeps the layout ownership the contract documents ("The layout
 * system owns stacking and width decisions; apps only provide content").
 *
 * States: `loading` renders a surface-owned mirror skeleton with the
 * hero + features shape under the live top bar, so the swap to real content
 * is paint-only; `error`/`onRetry` compose the shared error kit under the
 * same stable root (component props, dashboard/chat precedent -- the
 * contract declares no loading/error axis, gap registered). The hero is
 * optional per contract; the split recipe collapses to a single column when
 * no hero is provided. Typography rides governed roles end to end (display
 * role for the h1, kicker tracking for the eyebrow, the lg body lede) --
 * zero inline paint remains.
 */

import React from 'react';
import {
  Badge,
  Box,
  Card,
  Flex,
  Grid,
  Heading,
  Stack,
  Text,
} from '../../../../../primitives';
import { FadeIn } from '@/graphics/motion';
import { SurfaceActionBar } from '../../../../runtime/helpers/rendering';
import { SurfaceErrorState } from '../../../../runtime/helpers/states';
import { useSurfaceProfileDefaultsWithOverrides } from '../../../../runtime/profile-defaults/overrides';
import { resolveStackSpacing } from '../../../../runtime/profile-defaults/personality';
import { useSurfaceResponsiveLayout } from '../../../../runtime/responsive';
import type { MarketingSurfaceConfig } from '../../../../foundation/contracts';

export interface MarketingSurfaceProps {
  config: MarketingSurfaceConfig;
  /** Payload pending; renders the mirror skeleton under the live top bar. */
  loading?: boolean;
  /** Load failure of the page payload; renders the shared error kit under the stable root. */
  error?: unknown;
  /** Retry handler wired to the error state's retry action. */
  onRetry?: () => void | Promise<void>;
}

/**
 * Loading mirror for the intro column: kicker bar, two display-scale title
 * lines, two lede lines and the CTA pill pair -- the same anatomy the loaded
 * intro renders, so the swap is paint-only, never a layout shift. Blocks are
 * decorative (`aria-hidden`) while the surface root carries `aria-busy`;
 * geometry and pulse live in the marketing skin.
 */
function MarketingIntroSkeleton(): React.ReactElement {
  return (
    <Stack spacing="lg" aria-hidden="true">
      <Box data-part="marketing-skeleton-eyebrow" />
      <Stack spacing="md">
        <Box data-part="marketing-skeleton-title" data-line="1" />
        <Box data-part="marketing-skeleton-title" data-line="2" />
      </Stack>
      <Stack spacing="sm">
        <Box data-part="marketing-skeleton-lede" data-line="1" />
        <Box data-part="marketing-skeleton-lede" data-line="2" />
      </Stack>
      <Flex gap={8} wrap="wrap">
        <Box data-part="marketing-skeleton-cta" data-variant="primary" />
        <Box data-part="marketing-skeleton-cta" />
      </Flex>
    </Stack>
  );
}

/** Loading mirror for the hero preview slot (single panel block). */
function MarketingHeroSkeleton(): React.ReactElement {
  return <Box data-part="marketing-skeleton-hero" aria-hidden="true" />;
}

/** Loading mirror for the features region (card row on the fluid track). */
function MarketingFeaturesSkeleton(): React.ReactElement {
  return (
    <Grid
      templateColumns="repeat(auto-fit, minmax(min(100%, 240px), 1fr))"
      gap="lg"
      aria-hidden="true"
    >
      <Box data-part="marketing-skeleton-feature" />
      <Box data-part="marketing-skeleton-feature" />
      <Box data-part="marketing-skeleton-feature" />
    </Grid>
  );
}

export function MarketingSurface({
  config,
  loading = false,
  error,
  onRetry,
}: MarketingSurfaceProps): React.ReactElement {
  const profileDefaults = useSurfaceProfileDefaultsWithOverrides(
    config.visual?.profileOverrides
  );
  const { shouldStack, isMobile } = useSurfaceResponsiveLayout(config.visual);
  const sectionSpacing = resolveStackSpacing(profileDefaults.sectionSpacing);
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
    <Box className="ds-marketing__hero" data-part="hero">
      {heroContent}
    </Box>
  ) : null;

  const introNode = (
    <Stack spacing="lg">
      {(config.presentation.eyebrow || config.presentation.badge) && (
        <Flex align="center" gap={10} wrap="wrap">
          {config.presentation.eyebrow ? (
            /* Pinned hook (`muted-text[data-part='root']`). The kicker's
               uppercase + wide tracking live in the marketing skin: the
               unlayered modern Typography skin never paints those channels
               on plain text, so the layered surface rule holds. Ink rides
               Typography's own `color` channel (SU22 idiom). */
            <Text
              className="ds-marketing__muted-text"
              size="xs"
              weight="bold"
              color="muted"
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
        {/* The marketing page's single h1 rides the governed display role
            (`--ds-type-display-*`, fluid size). `text-wrap: balance` lives in
            the skin: the Typography `wrap` channel is stamped but no engine
            skin paints it yet (dead channel, cited in the lane fragment). */}
        <Heading
          className="ds-marketing__title"
          level="h1"
          textStyle="display"
        >
          {config.presentation.title}
        </Heading>
        {config.presentation.description ? (
          /* Pinned hook (`description[data-part='root']`). The lede keeps the
             old 16/18px step through the governed size ramp and the
             text-secondary ink through Typography's `color` channel. */
          <Text
            className="ds-marketing__description"
            size={isMobile ? 'md' : 'lg'}
            color="secondary"
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

  // In loading the columns mirror the loaded anatomy: a hero skeleton only
  // appears when a hero slot is configured, so the split/stacked geometry
  // never shifts when real content arrives.
  const introColumn = loading ? <MarketingIntroSkeleton /> : introNode;
  const heroColumn = loading
    ? heroNode
      ? <MarketingHeroSkeleton />
      : null
    : heroNode;

  const mainNode = error ? (
    <SurfaceErrorState error={error} onRetry={onRetry} />
  ) : (
    <>
      {shouldStack ? (
        <Stack spacing="lg">
          {heroFirst && heroColumn}
          {introColumn}
          {!heroFirst && heroColumn}
        </Stack>
      ) : (
        <Grid columns={12} gap="lg">
          {heroFirst && heroColumn ? (
            <Grid.Item span={6}>{heroColumn}</Grid.Item>
          ) : null}
          <Grid.Item span={heroColumn ? 6 : 12}>{introColumn}</Grid.Item>
          {!heroFirst && heroColumn ? (
            <Grid.Item span={6}>{heroColumn}</Grid.Item>
          ) : null}
        </Grid>
      )}

      {loading ? (
        <MarketingFeaturesSkeleton />
      ) : (
        config.presentation.sections?.length ? (
          <Stack spacing={sectionSpacing}>
            {config.presentation.sections.map((section, index) => (
              <Box key={index}>{section}</Box>
            ))}
          </Stack>
        ) : null
      )}

      {!loading && config.presentation.footer ? (
        <Card variant="ghost">
          <Card.Body>{config.presentation.footer}</Card.Body>
        </Card>
      ) : null}
    </>
  );

  return (
    <Box
      className="ds-surface ds-marketing"
      data-part="root"
      data-layout={shouldStack ? 'stacked' : 'split'}
      data-mobile={isMobile ? 'true' : 'false'}
      data-hero-position={heroFirst ? 'start' : 'end'}
      data-loading={loading ? 'true' : 'false'}
      aria-busy={loading ? 'true' : undefined}
    >
      {/* `maxWidth` stays inline only when the contract declares it (instance
          value, detail precedent); the skin owns the 1260px default, the
          centering and the fluid padding. */}
      <Stack
        className="ds-marketing__container"
        data-part="container"
        spacing={sectionSpacing}
        style={
          config.visual.maxWidth != null
            ? { maxWidth: config.visual.maxWidth }
            : undefined
        }
      >
        {config.presentation.topBar}
        {/* Entrance motion rides the product personality; reduced/calm
            contexts render the final state by FadeIn's own contract. */}
        {profileDefaults.animateEntrance ? (
          <FadeIn durationMs={profileDefaults.entranceDuration}>{mainNode}</FadeIn>
        ) : (
          mainNode
        )}
      </Stack>
    </Box>
  );
}
