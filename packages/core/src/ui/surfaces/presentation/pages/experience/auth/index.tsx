'use client';

/**
 * @fileoverview AuthSurface -- branded authentication page shell.
 * @description Owns the public auth page canvas and its anatomy: optional top
 * bar, the form panel (eyebrow kicker, the page's single h1, subtitle, the
 * caller-owned form slot, governed SSO action row, footer and legal slots)
 * and the brand hero panel, in split (side-by-side, hero position swappable)
 * or centered recipes. The app owns the actual auth form component and every
 * visible string it contains; this surface owns the page chrome, the layout
 * recipe and the state choreography.
 *
 * @remarks
 * Composition: canonical primitives only (Box, Stack, Grid, Card, Heading,
 * Text) + the governed SurfaceActionBar (access-filtered) + the shared
 * SurfaceErrorState kit. There is no auth PATTERN to compose: the contract is
 * a slot vocabulary ("auth logic lives in the form"), so the surface keeps
 * the layout and chrome ownership the contract documents. The hero panel is
 * governed tenant branding, never free decoration: the surface paints NO
 * background, gradient or texture on it -- the Card material and the tenant
 * channels own its chrome, and the hero content arrives as a caller slot.
 *
 * States: `loading` renders a surface-owned mirror skeleton INSIDE the same
 * form-panel frame (two field blocks plus the primary-action pill) and a hero
 * block inside the same hero card, while the top bar, canvas, eyebrow, h1,
 * subtitle, footer and legal stay live -- they are config copy, not payload
 * -- so the swap to real content is paint-only, never a layout shift. The
 * action row is suppressed while loading because SSO actions act on an auth
 * flow that is not ready (editor toolbar idiom); the skeleton's CTA pill
 * mirrors it. `error`/`onRetry` (component props, dashboard/SU18 precedent --
 * the contract declares no error axis, gap registered) swap ONLY the form
 * column for the shared error kit: the brand hero is chrome, not payload, and
 * the split/centered geometry holds. Async submit is caller-owned: the form
 * slot lives in the app and the action row forwards each action's `loading`
 * flag to its Button (no surface-level pending axis exists in the contract).
 *
 * Accessibility: the form panel is a labeled region (`<section>` named by the
 * visible h1 via `aria-labelledby`, SU18 idiom), the hero is a complementary
 * landmark (`<aside>` with a governed generic label -- caller content is
 * never assumed decorative), and the title is the page's single h1 riding the
 * governed `pageTitle` type role. No live-region semantics are inferred.
 */
import React, { useId } from 'react';
import { Box, Card, Grid, Heading, Stack, Text } from '../../../../../primitives';
import { FadeIn } from '@/graphics/motion';
import { useSurfaceResponsiveLayout } from '../../../../runtime/responsive';
import type { AuthSurfaceConfig } from '../../../../foundation/contracts';
import { SurfaceActionBar } from '../../../../runtime/helpers/rendering';
import { SurfaceErrorState } from '../../../../runtime/helpers/states';
import { useSurfaceTranslations } from '../../../../runtime/helpers/states/i18n';
import { useSurfaceProfileDefaultsWithOverrides } from '../../../../runtime/profile-defaults/overrides';
import { resolveStackSpacing } from '../../../../runtime/profile-defaults/personality';

export interface AuthSurfaceProps {
  config: AuthSurfaceConfig;
  /** Payload pending; renders the mirror skeleton inside the live panel frames. */
  loading?: boolean;
  /** Load failure of the page payload; swaps the form column for the shared error kit. */
  error?: unknown;
  /** Retry handler wired to the error state's retry action. */
  onRetry?: () => void | Promise<void>;
}

export function AuthSurface({
  config,
  loading = false,
  error,
  onRetry,
}: AuthSurfaceProps): React.ReactElement {
  const { tSurfaceOr } = useSurfaceTranslations();
  const profileDefaults = useSurfaceProfileDefaultsWithOverrides(
    config.visual?.profileOverrides
  );
  const { shouldStack, isMobile } = useSurfaceResponsiveLayout(config.visual);
  const sectionSpacing = resolveStackSpacing(profileDefaults.sectionSpacing);
  const titleId = useId();
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
  // In error the payload never resolved, so no skeleton runs under it
  // (marketing idiom: error wins over loading).
  const showSkeleton = loading && !error;

  const formPanel = (
    /* The form panel is a labeled region: the visible h1 doubles as the
       region name (SU18 idiom), so screen-reader users can jump straight to
       the sign-in form. */
    <Box as="section" aria-labelledby={titleId}>
      <Card className="ds-auth__form-panel" variant={profileDefaults.cardVariant}>
        <Card.Body>
          <Stack spacing="lg">
            <Stack spacing="sm">
              {config.presentation.eyebrow && (
                /* Pinned hook (`muted-text[data-part='root']`) plus the
                   additive `ds-auth__eyebrow` kicker hook: uppercase + wide
                   tracking live in the auth skin (the unlayered modern
                   Typography skin never paints those channels on plain text,
                   so the layered surface rule holds, marketing idiom). Ink,
                   size and weight ride Typography's own governed channels. */
                <Text
                  className="ds-auth__muted-text ds-auth__eyebrow"
                  size="xs"
                  weight="bold"
                  color="muted"
                >
                  {config.presentation.eyebrow}
                </Text>
              )}
              {/* The auth page's single h1 rides the governed pageTitle role
                  (`--ds-type-page-title`, fluid size) -- replaces the bespoke
                  inline 28px/700 (deliberate scale change, SIGHTED). */}
              <Heading id={titleId} level="h1" textStyle="pageTitle">
                {config.presentation.title}
              </Heading>
              {config.presentation.subtitle && (
                /* Pinned hook (`muted-text[data-part='root']`); the muted ink
                   travels through Typography's `color` channel (SU22 idiom). */
                <Text className="ds-auth__muted-text" color="muted">
                  {config.presentation.subtitle}
                </Text>
              )}
            </Stack>

            {showSkeleton ? (
              /* Mirror skeleton: two field blocks plus the primary-action pill
                 inside the SAME form-panel frame, while the header copy,
                 footer and legal stay live (they are config, not payload), so
                 the swap to real content is paint-only. Blocks are decorative
                 (`aria-hidden`) while the surface root carries `aria-busy`;
                 geometry and pulse live in the auth skin. */
              <Stack spacing="md" aria-hidden="true">
                <Box data-part="auth-skeleton-field" />
                <Box data-part="auth-skeleton-field" />
                <Box data-part="auth-skeleton-cta" />
              </Stack>
            ) : (
              <>
                {config.presentation.form}
                {/* SSO / surface-level actions: access-filtered, each action's
                    `loading` flag drives its Button's async spinner (the
                    caller owns submit pending; the contract declares no
                    surface-level pending axis). */}
                <SurfaceActionBar
                  actions={config.behavior.actions}
                  access={config.access}
                  justify="start"
                  size={isMobile ? 'sm' : 'md'}
                />
              </>
            )}
            {config.presentation.footer}
            {config.presentation.legal}
          </Stack>
        </Card.Body>
      </Card>
    </Box>
  );

  const heroPanel = heroContent ? (
    /* The hero is governed tenant branding rendered as a complementary
       landmark: never assumed decorative (caller content stays in the a11y
       tree), never painted by the surface (the Card material and tenant
       channels own its chrome). */
    <Box as="aside" aria-label={tSurfaceOr('auth.hero_region_label', 'Brand showcase')}>
      <Card className="ds-auth__hero-panel" variant="elevated">
        <Card.Body>
          {showSkeleton ? (
            <Box data-part="auth-skeleton-hero" aria-hidden="true" />
          ) : (
            heroContent
          )}
        </Card.Body>
      </Card>
    </Box>
  ) : null;

  // In error only the form column swaps to the shared error kit: the brand
  // hero is chrome (not payload) and the split/centered geometry holds.
  const formColumn = error ? (
    <SurfaceErrorState error={error} onRetry={onRetry} />
  ) : (
    formPanel
  );

  /* Two layout branches:
     - Split: hero and form side by side (12-column 6/6 recipe, `minmax(0,1fr)`
       tracks owned by the modern Grid), hero position swappable.
     - Centered: form constrained to a 520px readable measure by the skin
       (keyed on `data-layout='centered'`), hero stacking above or below per
       `heroPosition`. */
  const mainNode = isSplitLayout ? (
    <Grid columns={12} gap="lg">
      {heroFirst && heroPanel && <Grid.Item span={6}>{heroPanel}</Grid.Item>}
      <Grid.Item span={heroPanel ? 6 : 12}>{formColumn}</Grid.Item>
      {!heroFirst && heroPanel && <Grid.Item span={6}>{heroPanel}</Grid.Item>}
    </Grid>
  ) : (
    <Stack spacing="lg">
      {heroFirst && heroPanel}
      {formColumn}
      {!heroFirst && heroPanel}
    </Stack>
  );

  return (
    <Box
      className="ds-surface ds-auth"
      data-part="root"
      data-layout={isSplitLayout ? 'split' : 'centered'}
      data-mobile={isMobile ? 'true' : 'false'}
      data-hero-position={heroFirst ? 'start' : 'end'}
      data-loading={loading ? 'true' : 'false'}
      aria-busy={loading ? 'true' : undefined}
    >
      {/* `maxWidth` stays inline only when the contract declares it (instance
          value, marketing idiom); the skin owns the 1120px default measure,
          the centering and the fluid padding. */}
      <Stack
        className="ds-auth__container"
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
