'use client';

/**
 * @fileoverview CollectionHeader — structures-tier hero header for
 * workspace landing pages with eyebrow chip, hero title, subtitle,
 * quick actions cluster, compact meta chips and shortcut hints.
 *
 * @description
 * Engine-free structures family that pairs with the EntityTableWorkspace family of
 * list/workspace pages. Sits visually above ListToolbar / TableToolbar.
 * The pattern packs four optional clusters around the title. They carry three
 * distinct materials, one per semantic region — identity reads as an overline,
 * data as the rail's only framed object, keyboard affordances as key caps — so
 * the rail no longer reads as one undifferentiated strip of grey capsules:
 *   - eyebrow overline (identifies the workspace; size/case/tracking ride the
 *     governed page-header channels, family rides the shared page-hierarchy
 *     proto with an `inherit` fallback, and a single accent tick carries the
 *     identity column's only brand chroma). In the compact composition the
 *     overline leads the identity column above the title instead of sinking
 *     into the secondary rail — reading order IS the hierarchy.
 *   - quick actions cluster (right-side action buttons in a raised pill;
 *     a stable primary-first partition applies in EVERY posture with a
 *     hairline divider marking the seam, so the dominant action never
 *     changes position between desktop and mobile. Compact overflow is
 *     deliberate: with 3+ actions and a primary present, the quiet actions
 *     move into a real more-actions menu (Dropdown primitive, labelled
 *     trigger); without a primary, non-primary icon actions collapse to
 *     labelled icon-only buttons — the primary action never loses its
 *     label and a collapsed action never becomes an unlabeled glyph)
 *   - meta items (tone-coded compact chips for status/count signals; the only
 *     framed objects in the rail, which is what makes the tones legible)
 *   - shortcuts (key caps on the governed `--ds-kbd-*` material, behind a
 *     rail overline; a tenant styles its key caps once and this rail follows)
 *
 * Every value the family paints resolves through the chain
 * `foundation token -> semantic channel -> group recipe -> family-private
 * --_ds-collection-header-* -> stable DOM part`. `Box` parts own their whole
 * ladder in the skin; `Text` parts (eyebrow, subtitle) keep type on the caller
 * channel because their typography skin sits in a LATER cascade layer than
 * this family's skin, where a declaration would be inert.
 *
 * `loading` renders the hierarchy skeleton (eyebrow + title + subtitle +
 * action/meta blocks) on the final footprint, so late content never jumps.
 *
 * Visually distinct from `CockpitHeader` (detail-page style: 22px title,
 * plain background, simple actions) and `WorkbenchHeader` (briefing style:
 * exception count, saved view selector). Use this structures family when you want a
 * 36px hero title, a flat card background, and a packed right rail.
 *
 * The family stays domain-agnostic: it knows nothing about tenants,
 * users, or any specific entity. All copy comes from props.
 */

import { Fragment, type ReactNode } from 'react';

import { Box } from '../../../primitives/layout/Box';
import { Button } from '../../../primitives/inputs/Button';
import { Dropdown } from '../../../primitives/overlay/Dropdown';
import { Flex } from '../../../primitives/layout/Flex';
import { Text } from '../../../primitives/display/Typography/compound/Text';
import { KeyboardIcon } from '@/graphics/icons';
import { NavigationMoreIcon } from '@/graphics/icons/presentation/semantic/generated/roles/navigation-more';
import { useResponsive } from '../../../../infrastructure/runtime/responsive';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';

export interface CollectionHeaderQuickAction {
  key: string;
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'default';
}

export interface CollectionHeaderMetaItem {
  key: string;
  label: string;
  tone?: 'neutral' | 'primary' | 'success';
}

export interface CollectionHeaderShortcut {
  key: string;
  label: string;
}

export interface CollectionHeaderProps {
  /** Uppercase eyebrow chip rendered above the action cluster. */
  eyebrow: string;
  /** Hero title (36px). */
  title: string;
  /** Typography treatment for the hero title. */
  titleTreatment?: 'default' | 'display' | 'dotted';
  /** Subtitle rendered below the title. */
  subtitle: string;
  /** Tone/treatment for the subtitle copy. */
  subtitleTreatment?: 'default' | 'mono-technical';
  /** Overall composition variant for premium workspace headers. */
  layoutVariant?: 'default' | 'editorial-tech';
  /** Compact tone-coded chips rendered below the action cluster. */
  metaItems?: CollectionHeaderMetaItem[];
  /** Placement for meta items relative to the action rail. */
  metaItemsPlacement?: 'below' | 'inline-start' | 'eyebrow-end';
  /** Compact pill hints rendered after the meta items. */
  shortcuts?: CollectionHeaderShortcut[];
  /** Right-side action buttons rendered in a raised pill cluster. */
  quickActions?: CollectionHeaderQuickAction[];
  /** When embedded, the header becomes visually transparent to a parent shell. */
  surfaceVariant?: 'default' | 'embedded';
  /**
   * Overrides the responsive layout projection. When omitted, phone and tablet
   * device classes from `ResponsiveProvider` use the compact composition.
   */
  compact?: boolean;
  /**
   * Identity-only projection intended for constrained mobile contexts. Keeps
   * the eyebrow and title while omitting supporting and interactive clusters.
   */
  minimal?: boolean;
  /**
   * When true, renders the hierarchy skeleton (eyebrow + title + subtitle +
   * action/meta blocks) on the exact footprint of the final content, so the
   * late header lands without a layout jump.
   */
  loading?: boolean;
}

export function CollectionHeader({
  eyebrow,
  title,
  titleTreatment = 'default',
  subtitle,
  subtitleTreatment = 'default',
  layoutVariant = 'default',
  metaItems,
  metaItemsPlacement = 'below',
  shortcuts,
  quickActions,
  surfaceVariant = 'default',
  compact,
  minimal = false,
  loading = false,
}: CollectionHeaderProps) {
  const i18n = useOptionalTranslation('common');
  const i18nComponents = useOptionalTranslation('components');
  const { isPhoneOrTablet, pointer, isTouchDevice } = useResponsive();
  const shortcutsLabel = i18n?.tOr('shortcuts', 'Shortcuts') ?? 'Shortcuts';
  const loadingLabel = i18n?.tOr('loading', 'Loading') ?? 'Loading';
  /* Overflow menu trigger label (ActionDock idiom): the key already lives in
     the components catalog for EN/ES/AR; without an I18nProvider — or while a
     locale lacks it — the endsWith guard catches the echoed key and the
     English floor renders. */
  const translatedOverflowLabel = i18nComponents?.t('actionDock.overflow.label');
  const overflowActionsLabel =
    translatedOverflowLabel && !translatedOverflowLabel.endsWith('actionDock.overflow.label')
      ? translatedOverflowLabel
      : 'More actions';

  const embedded = surfaceVariant === 'embedded';
  const useDisplayTitle = titleTreatment === 'display';
  const useDottedTitle = titleTreatment === 'dotted';
  const useMonoSubtitle = subtitleTreatment === 'mono-technical';
  const editorialTech = layoutVariant === 'editorial-tech';
  const compactLayout = compact ?? isPhoneOrTablet;
  const minimalLayout = minimal;
  /* Coarse pointers raise the quick-action floor to the canonical touch
     target without inflating the painted size for fine pointers (the
     cluster's sizing rides caller-inline styles, so the floor lives here
     on the same channel). */
  const coarsePointer = pointer === 'coarse' || isTouchDevice;
  const actionMinHeight = coarsePointer
    ? 'var(--ds-touch-target-min, 44px)'
    : 'var(--ds-spacing-8, 32px)';
  const displayInk = 'var(--ds-collection-header-display-color, var(--ds-color-primary))';
  const compactMetaItems = metaItems ?? [];
  const inlineMetaItems = metaItemsPlacement === 'inline-start' ? compactMetaItems : [];
  const eyebrowMetaItems = metaItemsPlacement === 'eyebrow-end' ? compactMetaItems : [];
  const belowMetaItems = metaItemsPlacement === 'below' ? compactMetaItems : [];

  /* Stable primary-first partition (DashboardHeader recipe): the primary
     action leads the cluster in EVERY posture and can never be wrapped out
     of reach by secondary/utility actions. Array#sort is stable, so the
     consumer's relative order survives inside each group. C1: the partition
     leaves the compact-only gate — a primary action that changes position
     between desktop and mobile never reads as deliberate, and the hairline
     divider (data-part='action-divider') now marks the partition seam. */
  const orderedQuickActions = quickActions
    ? [...quickActions].sort(
        (a, b) => Number(b.variant === 'primary') - Number(a.variant === 'primary'),
      )
    : quickActions;

  /* Overflow law (ActionDock idiom — deterministic, posture-driven, never
     measured): in the compact composition with more than two actions and at
     least one primary, every non-primary action moves into the more-actions
     menu. The primary keeps its full label and thumb reach; the menu is a
     deliberate destination (icon + label rows), not a clipped row of twin
     glyphs. When no action carries the primary variant every action is a
     peer, so the C0 labelled icon-only collapse stays — hiding ALL of them
     behind a menu would read worse. */
  const hasPrimaryQuickAction = Boolean(
    orderedQuickActions?.some((action) => action.variant === 'primary'),
  );
  const collapseActionsToMenu = Boolean(
    compactLayout && hasPrimaryQuickAction && (orderedQuickActions?.length ?? 0) > 2,
  );
  const inlineQuickActions = collapseActionsToMenu
    ? orderedQuickActions?.filter((action) => action.variant === 'primary')
    : orderedQuickActions;
  const overflowQuickActions = collapseActionsToMenu
    ? (orderedQuickActions ?? []).filter((action) => action.variant !== 'primary')
    : [];

  /* ---- Loading skeleton: the hierarchy's final footprint, mirrored with
          skeleton blocks whose geometry lives in the skin keyed on
          data-block (page-shell/cockpit-header idiom). ---- */
  if (loading) {
    return (
      <Box
        data-part="root"
        data-embedded={embedded}
        data-compact={compactLayout}
        data-minimal={minimalLayout}
        data-loading="true"
        aria-busy="true"
        /* The skeleton is the only state with no readable content of its own;
           without a name a screen reader announces an empty busy region. */
        aria-label={loadingLabel}
        className="ds-structure ds-collection-header"
        style={{
          position: 'relative',
          overflow: 'hidden',
          padding: embedded
            ? 'var(--ds-spacing-4, 16px) var(--ds-spacing-5, 20px) var(--ds-spacing-1, 4px)'
            : 'var(--ds-spacing-5, 20px) var(--ds-spacing-5, 20px) var(--ds-spacing-3, 12px)',
        }}
      >
        <Flex
          align="start"
          justify="between"
          gap={compactLayout ? 14 : 18}
          wrap="wrap"
          style={{ position: 'relative' }}
        >
          <Box
            style={{
              minWidth: 0,
              flex: compactLayout ? '1 1 100%' : '1 1 clamp(280px, 38%, 460px)',
              maxWidth: compactLayout ? '100%' : 560,
              display: 'grid',
              gap: 'var(--ds-spacing-2, 8px)',
            }}
          >
            {(minimalLayout || compactLayout) && eyebrow ? <Box data-part="skeleton" data-block="eyebrow" /> : null}
            <Box data-part="skeleton" data-block="title" />
            {!minimalLayout && subtitle ? <Box data-part="skeleton" data-block="subtitle" /> : null}
          </Box>
          {!minimalLayout && (
            <Box
              data-part="skeleton-rail"
              style={{
                display: 'grid',
                gap: 'var(--ds-spacing-2, 8px)',
                justifyItems: compactLayout ? 'start' : 'end',
              }}
            >
              {!compactLayout && eyebrow ? <Box data-part="skeleton" data-block="eyebrow" /> : null}
              {quickActions && quickActions.length > 0 && (
                <Flex align="center" gap={8} justify={compactLayout ? 'start' : 'end'}>
                  {quickActions.slice(0, 3).map((action) => (
                    <Box key={`skeleton-action-${action.key}`} data-part="skeleton" data-block="action" />
                  ))}
                </Flex>
              )}
              {compactMetaItems.length > 0 && (
                <Flex align="center" gap={8} justify={compactLayout ? 'start' : 'end'}>
                  {compactMetaItems.slice(0, 4).map((item) => (
                    <Box key={`skeleton-meta-${item.key}`} data-part="skeleton" data-block="meta-item" />
                  ))}
                </Flex>
              )}
            </Box>
          )}
        </Flex>
      </Box>
    );
  }

  const eyebrowChip = eyebrow ? (
    <Text
      data-part="eyebrow"
      data-embedded={embedded}
      color="subtle"
      style={{
        /* Overline voice: family is the one facet the expressive type axis
           leaves family-authored (B1.2), so it rides the shared page-hierarchy
           proto (fallback: inherit — byte-identical to the pre-proto render);
           size, case and tracking ride the governed page-header overline
           channels the type profile already drives (the same three PageShell
           reads), with the exact authored fallbacks. Type stays on this caller
           channel and does NOT move to the skin: the composed Text's
           typography skin lives in the LATER `rottay-engines` layer, so a
           font declaration in this family's `rottay-components` skin would be
           inert. Box geometry, the frame and the accent tick are skin-owned. */
        fontFamily: 'var(--_ds-page-hierarchy-eyebrow-family, inherit)',
        fontSize: 'var(--ds-page-header-eyebrow-size, var(--ds-font-size-xs, 12px))',
        fontWeight: 'var(--ds-font-weight-bold, 700)' as any,
        textTransform: 'var(--ds-page-header-eyebrow-text-transform, uppercase)' as any,
        letterSpacing: 'var(--ds-page-header-eyebrow-tracking, 0.13em)',
        lineHeight: 1,
      }}
    >
      {eyebrow}
    </Text>
  ) : null;

  /* Meta chips are a Box, not a Text — no later-layer typography skin claims
     them, so their whole box (geometry, type role, tone frame) is skin-owned
     and reads the caption role. */
  const renderMetaItem = (item: CollectionHeaderMetaItem) => {
    return (
      <Box data-part="meta-item" data-tone={item.tone ?? 'neutral'} key={item.key}>
        {item.label}
      </Box>
    );
  };

  return (
    <Box
      data-part="root"
      data-embedded={embedded}
      data-compact={compactLayout}
      data-minimal={minimalLayout}
      data-loading="false"
      className="ds-structure ds-collection-header"
      style={{
        position: 'relative',
        overflow: 'hidden',
        padding: minimalLayout
          ? embedded
            ? 'var(--ds-spacing-2, 8px) var(--ds-spacing-3, 12px)'
            : 'var(--ds-spacing-3, 12px)'
          : embedded
            ? editorialTech
              ? compactLayout
                ? 'var(--ds-spacing-4, 16px) var(--ds-spacing-4, 16px) var(--ds-spacing-1, 4px)'
                : 'var(--ds-spacing-4, 16px) var(--ds-spacing-5, 20px) var(--ds-spacing-1, 4px)'
              : 'var(--ds-spacing-5, 20px) var(--ds-spacing-5, 20px) var(--ds-spacing-2, 8px)'
            : editorialTech
              ? compactLayout
                ? 'var(--ds-spacing-4, 16px) var(--ds-spacing-4, 16px) var(--ds-spacing-2, 8px)'
                : 'var(--ds-spacing-5, 20px) var(--ds-spacing-5, 20px) var(--ds-spacing-3, 12px)'
              : 'var(--ds-spacing-5, 20px) var(--ds-spacing-5, 20px) var(--ds-spacing-3, 12px)',
      }}
    >
      <Flex
        align="start"
        justify="between"
        gap={compactLayout ? 14 : editorialTech ? 24 : 18}
        wrap="wrap"
        style={{ position: 'relative' }}
      >
        <Box
          data-part="identity"
          data-compact-layout={compactLayout}
          data-editorial-tech={editorialTech}
          style={{
            minWidth: 0,
            display: 'grid',
            gap:
              minimalLayout || (compactLayout && eyebrowChip)
                ? 'var(--ds-spacing-2, 8px)'
                : editorialTech
                  ? 0
                  : undefined,
          }}
        >
          {/* C1 mobile reorder: in the compact composition the eyebrow leads
             the identity column (overline → title → supporting) instead of
             sinking into the secondary rail below the title — the reading
             order is the hierarchy, not a stack of the desktop row. */}
          {(minimalLayout || compactLayout) && eyebrowChip}
          <Box
            data-part="title"
            data-title-treatment={titleTreatment}
            data-compact-layout={compactLayout}
            data-editorial-tech={editorialTech}
            as="h1"
            style={{
              /* The whole type ladder (family / size / weight / tracking /
                 leading / case) is skin-owned, keyed on the three attributes
                 stamped above plus the root's `data-minimal`. The title is a
                 Box, so no later-layer typography skin competes for it and
                 every step becomes tenant-reachable instead of frozen here.
                 The default treatment still binds the authored display
                 typography role (`--ds-type-display-*`): a technical tenant
                 renders its tight grotesk hero, an editorial tenant its serif
                 zero-track display. Every channel falls back to the exact
                 pre-wave value where the artifact does not emit the role.
                 What stays inline is uncounted `-webkit-*` glyph-clip paint
                 (the prior lane's adjudicated placement) plus box layout. */
              margin: 0,
              marginTop: 0,
              textWrap: 'balance',
              /* Long unbroken words wrap instead of breaching the measure at
                 320/390px (long-title strategy, never coward truncation). */
              overflowWrap: 'break-word',
              display: 'block',
              width: 'fit-content',
              textRendering: 'optimizeLegibility',
              WebkitBackgroundClip: useDottedTitle ? ('text, text' as any) : undefined,
              WebkitTextFillColor: useDottedTitle ? 'transparent' : undefined,
              WebkitTextStroke: useDottedTitle
                ? compactLayout
                  ? `0.24px color-mix(in srgb, ${displayInk} 20%, transparent)`
                  : editorialTech
                    ? `0.32px color-mix(in srgb, ${displayInk} 24%, transparent)`
                    : `1px color-mix(in srgb, ${displayInk} 28%, transparent)`
                : undefined,
            }}
          >
            {title}
          </Box>
          {!minimalLayout && (editorialTech && !compactLayout ? (
            <Flex
              align="start"
              gap={12}
              style={{
                marginTop: 'var(--ds-spacing-2, 8px)',
                maxWidth: 760,
              }}
            >
              <Box data-part="subtitle-divider" aria-hidden="true" />
              <Text
                data-part="subtitle"
                data-variant="editorial-tech"
                data-title-treatment={titleTreatment}
                data-subtitle-treatment={subtitleTreatment}
                color="secondary"
                style={{
                  display: 'block',
                  /* The composed Text's typography skin sits in the LATER
                     `rottay-engines` layer, so subtitle type must stay on this
                     caller channel; what it can do is read the authored
                     supporting/caption roles instead of a frozen px step. */
                  fontSize: useDisplayTitle
                    ? 'var(--ds-type-caption-font-size, var(--ds-font-size-xs, 12px))'
                    : useDottedTitle
                      ? 'var(--ds-type-caption-font-size, var(--ds-font-size-xs, 12px))'
                      : 'var(--ds-type-supporting-font-size, var(--ds-font-size-sm, 14px))',
                  lineHeight: 'var(--ds-type-supporting-line-height, 1.5)',
                  textWrap: 'pretty',
                  fontFamily: useMonoSubtitle
                    ? 'var(--ds-font-family-mono, var(--ds-font-family-base))'
                    : undefined,
                  letterSpacing: useMonoSubtitle ? '0.135em' : useDottedTitle ? '0.08em' : undefined,
                  textTransform: (useDisplayTitle || useDottedTitle || useMonoSubtitle) ? ('uppercase' as const) : undefined,
                  opacity: 0.92,
                  maxWidth: 680,
                }}
              >
                {subtitle}
              </Text>
            </Flex>
          ) : (
            <Flex
              align="start"
              gap={10}
              data-part="subtitle-row"
              data-compact-layout={compactLayout}
              style={{
                marginTop: useDisplayTitle
                  ? 'var(--ds-spacing-2, 8px)'
                  : useDottedTitle
                    ? compactLayout
                      ? 'var(--ds-spacing-2, 8px)'
                      : 'var(--ds-spacing-2, 8px)'
                    : 'var(--ds-spacing-3, 12px)',
                /* Compact: the hairline retires (skin) and so does its
                   padding — rhythm alone separates title from supporting
                   copy on a narrow measure; the rule kept reading as chrome
                   noise between two stacked text blocks. */
                paddingTop: compactLayout ? 0 : 'var(--ds-spacing-3, 12px)',
                maxWidth: compactLayout ? '100%' : 620,
              }}
            >
              <Text
                data-part="subtitle"
                data-variant="default"
                data-title-treatment={titleTreatment}
                data-subtitle-treatment={subtitleTreatment}
                data-compact-layout={compactLayout}
                color="secondary"
                style={{
                  display: 'block',
                  /* Same layer constraint as the editorial-tech twin: subtitle
                     type stays on the caller channel and reads the authored
                     caption/supporting roles rather than frozen px steps. */
                  fontSize:
                    useDisplayTitle || useDottedTitle || compactLayout
                      ? 'var(--ds-type-caption-font-size, var(--ds-font-size-xs, 12px))'
                      : 'var(--ds-type-supporting-font-size, var(--ds-font-size-sm, 14px))',
                  lineHeight: useDisplayTitle
                    ? 'var(--ds-type-supporting-line-height, 1.5)'
                    : useDottedTitle
                      ? 'var(--ds-type-caption-line-height, 1.35)'
                      : 'var(--ds-type-supporting-line-height, 1.5)',
                  textWrap: 'pretty',
                  fontFamily: useMonoSubtitle
                    ? 'var(--ds-type-code-font-family, var(--ds-font-family-mono, var(--ds-font-family-base)))'
                    : undefined,
                  /* The technical voice tracks on the authored code role; the
                     compact step keeps the tighter authored value because a
                     wide track eats the measure at 320px. */
                  letterSpacing: useDisplayTitle
                    ? 'var(--ds-type-caption-letter-spacing, 0.03em)'
                    : useMonoSubtitle
                      ? compactLayout
                        ? '0.05em'
                        : 'var(--ds-type-code-letter-spacing, 0.09em)'
                      : useDottedTitle
                        ? compactLayout
                          ? 'var(--ds-type-caption-letter-spacing, 0.03em)'
                          : '0.08em'
                        : undefined,
                  textTransform: (useDisplayTitle || useDottedTitle || useMonoSubtitle) ? ('uppercase' as const) : undefined,
                  opacity: (useDisplayTitle || useDottedTitle) ? 0.88 : undefined,
                  maxWidth: '100%',
                }}
              >
                {subtitle}
              </Text>
            </Flex>
          ))}
          {!minimalLayout && editorialTech && !compactLayout && (
            <Box
              data-part="editorial-tech-rule"
              aria-hidden="true"
            />
          )}
        </Box>

        {!minimalLayout && quickActions && quickActions.length > 0 && (
          <Box
            data-part="secondary-rail"
            style={{
              flexShrink: 1,
              flex: compactLayout ? '1 1 100%' : '1 1 min(100%, 420px)',
              width: compactLayout ? '100%' : 'auto',
              maxWidth: compactLayout ? '100%' : 560,
              minWidth: compactLayout ? 0 : 300,
              marginInlineStart: compactLayout ? 0 : 'auto',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
            }}
          >
            {((!compactLayout && eyebrowChip) || eyebrowMetaItems.length > 0) && (
              <Flex
                align="center"
                gap={8}
                wrap="wrap"
                justify={compactLayout ? 'start' : 'end'}
                style={{
                  marginBottom: editorialTech ? 'var(--ds-spacing-2, 8px)' : 'var(--ds-spacing-3, 12px)',
                }}
              >
                {eyebrowMetaItems.map(renderMetaItem)}
                {!compactLayout && eyebrowChip}
              </Flex>
            )}
            <Box
              data-part="quick-actions"
              data-embedded={embedded}
              data-editorial-tech={editorialTech}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: compactLayout ? 'flex-start' : 'flex-end',
                flexWrap: 'wrap',
                gap: editorialTech ? 6 : 8,
                padding: 'var(--ds-spacing-1, 4px)',
                width: compactLayout ? '100%' : 'fit-content',
                maxWidth: '100%',
                alignSelf: compactLayout ? 'stretch' : 'flex-end',
              }}
            >
              {inlineMetaItems.length > 0 && (
                <Flex
                  align="center"
                  gap={6}
                  wrap="wrap"
                  justify={compactLayout ? 'start' : 'end'}
                  style={{
                    paddingInlineStart: 'var(--ds-spacing-2, 8px)',
                  }}
                >
                  {inlineMetaItems.map(renderMetaItem)}
                </Flex>
              )}
              <Flex align="center" gap={8} wrap="wrap" justify={compactLayout ? 'start' : 'end'}>
                {inlineQuickActions?.map((action, actionIndex) => {
                  /* Compact priority collapse: non-primary actions that carry
                     an icon render icon-only (deliberate, labelled); the
                     primary action ALWAYS keeps its full label, and any
                     action without an icon keeps its label too — a collapsed
                     action never becomes an unlabeled glyph. */
                  const iconOnly = compactLayout && action.variant !== 'primary' && Boolean(action.icon);
                  /* Partition seam: one hairline divider marks where the
                     dominant primary group ends and the quiet cluster begins
                     (primary-first sort makes the seam a single index). */
                  const showPartitionDivider =
                    actionIndex > 0 &&
                    inlineQuickActions[actionIndex - 1]?.variant === 'primary' &&
                    action.variant !== 'primary';
                  return (
                    <Fragment key={action.key}>
                      {showPartitionDivider && <Box data-part="action-divider" aria-hidden="true" />}
                      <Button
                        size="sm"
                        radius="full"
                        variant={
                          action.variant === 'primary'
                            ? 'primary'
                            : action.variant === 'secondary'
                              ? 'secondary'
                              : 'default'
                        }
                        onClick={action.onClick}
                        aria-label={iconOnly ? action.label : undefined}
                        title={iconOnly ? action.label : undefined}
                        data-priority={action.variant === 'primary' ? 'primary' : 'standard'}
                        className={`ds-collection-header__quick-action ds-collection-header__quick-action--${action.variant ?? 'default'}`}
                        style={{
                          /* Caller-inline sizing (always wins, no layer fight):
                             the cluster's buttons never shrink below their
                             natural width. Pill geometry travels the public
                             Button prop instead of reaching into a private
                             resolved channel. Coarse pointers raise the floor
                             to the canonical touch target (responsive
                             authority, not a media query). */
                          flexShrink: 0,
                          minWidth: iconOnly ? actionMinHeight : 'max-content',
                          width: 'auto',
                          minHeight: actionMinHeight,
                          paddingInline: iconOnly ? 0 : 'var(--ds-spacing-3, 12px)',
                          fontSize: 'var(--ds-font-size-xs, 12px)',
                        }}
                      >
                        {action.icon && (
                          <Box
                            data-part="quick-action-icon"
                            as="span"
                            style={{
                              display: 'inline-flex',
                              marginInlineEnd: iconOnly ? 0 : 'var(--ds-spacing-1, 4px)',
                            }}
                          >
                            {action.icon}
                          </Box>
                        )}
                        {!iconOnly && action.label}
                      </Button>
                    </Fragment>
                  );
                })}
                {overflowQuickActions.length > 0 && (
                  /* Deliberate overflow (ActionDock idiom): the quiet actions
                     live in a real menu — icon + label rows, top-layer,
                     focus and Escape owned by the Dropdown primitive — never
                     a row of ambiguous glyphs clipped off the measure. */
                  <Dropdown
                    trigger={['click']}
                    placement="bottomRight"
                    menu={{
                      items: overflowQuickActions.map((action) => ({
                        key: action.key,
                        label: action.label,
                        icon: action.icon,
                        onClick: action.onClick,
                      })),
                    }}
                  >
                    <Button
                      size="sm"
                      radius="full"
                      variant="ghost"
                      icon={<NavigationMoreIcon decorative size={15} />}
                      aria-label={overflowActionsLabel}
                      title={overflowActionsLabel}
                      /* The composed Button drops a caller `data-part` (it
                         stamps its own last) — anatomy on a composed Button
                         rides the className, never data-part (HeadersBatch
                         contract note). */
                      className="ds-collection-header__quick-action ds-collection-header__quick-action--overflow"
                      style={{
                        flexShrink: 0,
                        minWidth: actionMinHeight,
                        width: 'auto',
                        minHeight: actionMinHeight,
                        paddingInline: 0,
                      }}
                    />
                  </Dropdown>
                )}
              </Flex>
            </Box>

            {(belowMetaItems.length > 0 || (shortcuts && shortcuts.length > 0)) && (
              <Box
                style={{
                  marginTop: 'var(--ds-spacing-3, 12px)',
                  display: 'grid',
                  gap: 'var(--ds-spacing-1, 4px)',
                  justifyItems: compactLayout ? 'start' : 'end',
                }}
              >
                {belowMetaItems.length > 0 && (
                  <Flex align="center" gap={8} wrap="wrap" justify={compactLayout ? 'start' : 'end'}>
                    {belowMetaItems.map(renderMetaItem)}
                  </Flex>
                )}

                {shortcuts && shortcuts.length > 0 && (
                  <Flex align="center" gap={8} wrap="wrap" justify={compactLayout ? 'start' : 'end'}>
                    {/* Rail label: an overline, not a chip. The framed pill it
                        used to wear was indistinguishable from the eyebrow and
                        from every neutral meta chip beside it. */}
                    <Box data-part="shortcuts-label">
                      <KeyboardIcon data-part="shortcuts-label-icon" />
                      {shortcutsLabel}
                    </Box>
                    {shortcuts.map((shortcut) => (
                      /* Key caps, not pills: geometry and the cap material are
                         skin-owned and ride the governed `--ds-kbd-*` channels,
                         so a tenant styles its keys once and this rail follows. */
                      <Box data-part="shortcut-pill" key={shortcut.key}>
                        {shortcut.label}
                      </Box>
                    ))}
                  </Flex>
                )}
              </Box>
            )}
          </Box>
        )}

        {!minimalLayout && !quickActions?.length && ((!compactLayout && eyebrowChip) || compactMetaItems.length > 0 || (shortcuts && shortcuts.length > 0)) && (
          <Box
            data-part="secondary-rail"
            style={{
              flexShrink: 1,
              flex: compactLayout ? '1 1 100%' : '1 1 min(100%, 420px)',
              width: compactLayout ? '100%' : 'auto',
              maxWidth: compactLayout ? '100%' : 560,
              minWidth: compactLayout ? 0 : 260,
              marginInlineStart: compactLayout ? 0 : 'auto',
              display: 'grid',
              gap: 'var(--ds-spacing-2, 8px)',
              justifyItems: compactLayout ? 'start' : 'end',
            }}
          >
            {((!compactLayout && eyebrowChip) || eyebrowMetaItems.length > 0) && (
              <Flex align="center" gap={8} wrap="wrap" justify={compactLayout ? 'start' : 'end'}>
                {eyebrowMetaItems.map(renderMetaItem)}
                {!compactLayout && eyebrowChip}
              </Flex>
            )}

            {(inlineMetaItems.length > 0 || belowMetaItems.length > 0) && (
              <Flex align="center" gap={8} wrap="wrap" justify={compactLayout ? 'start' : 'end'}>
                {[...inlineMetaItems, ...belowMetaItems].map(renderMetaItem)}
              </Flex>
            )}

            {shortcuts && shortcuts.length > 0 && (
              <Flex align="center" gap={8} wrap="wrap" justify={compactLayout ? 'start' : 'end'}>
                {shortcuts.map((shortcut) => (
                  <Box data-part="shortcut-pill" key={shortcut.key}>
                    {shortcut.label}
                  </Box>
                ))}
              </Flex>
            )}
          </Box>
        )}
      </Flex>
    </Box>
  );
}

// Compatibility aliases for pre-Checkpoint-D names. Deprecated —
// migrate to the canonical new names above. Scheduled for removal in
// Checkpoint F if no consumers remain.
export { CollectionHeader as WorkspaceHeader };
export type {
  CollectionHeaderProps as WorkspaceHeaderProps,
  CollectionHeaderQuickAction as WorkspaceHeaderQuickAction,
  CollectionHeaderMetaItem as WorkspaceHeaderMetaItem,
  CollectionHeaderShortcut as WorkspaceHeaderShortcut,
};
