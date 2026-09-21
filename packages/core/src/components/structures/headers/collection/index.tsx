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
 * data as the rail's only framed object, keyboard affordances as key caps —
 * so the rail no longer reads as one undifferentiated strip of grey capsules:
 *   - eyebrow overline (identifies the workspace; the whole overline voice —
 *     family, size, case, tracking — is skin-owned on the part, because the
 *     eyebrow is a Box and no later-layer typography skin competes for it)
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
 *     framed objects in the rail, which is what makes the tones legible;
 *     `data-tone` is this family's closed variant domain, mirrored in the skin)
 *   - shortcuts (key caps on the governed `--ds-kbd-*` material, behind a
 *     rail overline; a tenant styles its key caps once and this rail follows)
 *
 * The family stamps anatomy — `data-part`, the posture/variant attributes
 * (`data-posture`, `data-embedded`, `data-compact`, `data-minimal`,
 * `data-editorial-tech`, `data-title-treatment`, `data-subtitle-treatment`,
 * `data-tone`) — and the shared interaction kernel's `data-state` on the two
 * chrome surfaces that lift on pointer contact (the root card and the
 * quick-actions pill). Paint and geometry live entirely in
 * `skin/collection-header`, reachable through
 * the `--ds-collection-header-*` channels `derivation/chrome/collection-header`
 * produces. The TSX carries NO visual values: the coarse-pointer action
 * floor the inline paint used to enforce is the composed Button's own
 * contract now (its skin raises the floor to the touch target under
 * `(hover: none), (pointer: coarse)`), so this family neither states it
 * inline nor repaints a later layer.
 *
 * `loading` renders the shared `AnatomySkeleton` built from this anatomy, so
 * the waiting state has the exact footprint of the header it stands in for
 * and late content never jumps.
 *
 * The compact composition is layout-sensitive in the strict sense: it decides
 * WHICH clusters render, so it resolves against the header's OWN box through
 * the shared adaptation runtime (`adapt` + `data-posture`, WO-FAM-10). The
 * viewport projection (`compact ?? isPhoneOrTablet`) is the base layer of that
 * resolution, not its last word.
 *
 * Visually distinct from `CockpitHeader` (detail-page style: 22px title,
 * plain background, simple actions) and `WorkbenchHeader` (briefing style:
 * exception count, saved view selector). Use this structures family when you want a
 * 36px hero title, a flat card background, and a packed right rail.
 *
 * The family stays domain-agnostic: it knows nothing about tenants,
 * users, or any specific entity. All copy comes from props.
 */

import { Fragment, useMemo, useState, type ReactNode } from 'react';

import { Box } from '../../../primitives/layout/box';
import { Button } from '../../../primitives/inputs/button';
import { Dropdown } from '../../../primitives/overlay/dropdown';
import { Flex } from '../../../primitives/layout/flex';
import { KeyboardIcon } from '@/graphics/icons';
import { NavigationMoreIcon } from '@/graphics/icons/semantic/generated/roles/navigation-more';
import { useResponsive } from '../../../../infrastructure/runtime/responsive';
import type { Adapt } from '../../../../foundation/contracts/kernel/adaptation';
import {
  COLLECTION_HEADER_ADAPT_DEFAULTS,
  type CollectionHeaderAdaptation,
  type ResolvedCollectionHeaderAdaptation,
} from '../../../../foundation/contracts/kernel/adaptation/composition/families/collection-header';
import { useAdaptation } from '@/infrastructure/runtime/adaptation';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { partAttributes, useInteractionState } from '@/foundation/behavior';
import { AnatomySkeleton } from '../../../primitives/feedback/skeleton';

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
   *
   * This is the BASE layer, not the last word: the header also measures its own
   * box, and a compact box narrows over whatever this resolves to. Declare
   * `adapt={{ compact: { compactLayout: false } }}` to keep the full
   * composition in a narrow rail.
   */
  compact?: boolean;
  /**
   * Per-posture deltas the application declares. The header measures its OWN
   * box, so the same header in a narrow rail runs compact while it keeps the
   * full editorial composition at page width -- on one and the same viewport.
   *
   * @example adapt={{ compact: { compactLayout: false } }}
   */
  adapt?: Adapt<CollectionHeaderAdaptation>;
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
  adapt,
  minimal = false,
  loading = false,
}: CollectionHeaderProps) {
  const i18n = useOptionalTranslation('common');
  const i18nComponents = useOptionalTranslation('components');
  const { isPhoneOrTablet } = useResponsive();
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
  const editorialTech = layoutVariant === 'editorial-tech';
  /* `compactLayout` decides WHICH CLUSTERS RENDER, so it follows the header's own
     box: viewport is the base layer, the family narrows it, `adapt` outranks both. */
  const [rootElement, setRootElement] = useState<HTMLElement | null>(null);
  const containerRef = useMemo(() => ({ current: rootElement }), [rootElement]);
  const base = useMemo<ResolvedCollectionHeaderAdaptation>(
    () => ({ compactLayout: compact ?? isPhoneOrTablet }),
    [compact, isPhoneOrTablet],
  );
  const { adaptation, postureAttribute } = useAdaptation(adapt, {
    base,
    defaults: COLLECTION_HEADER_ADAPT_DEFAULTS,
    containerRef,
  });
  const compactLayout = adaptation.compactLayout;
  const minimalLayout = minimal;
  const compactMetaItems = metaItems ?? [];
  const inlineMetaItems = metaItemsPlacement === 'inline-start' ? compactMetaItems : [];
  const eyebrowMetaItems = metaItemsPlacement === 'eyebrow-end' ? compactMetaItems : [];
  const belowMetaItems = metaItemsPlacement === 'below' ? compactMetaItems : [];

  /* Hover and press on the two chrome surfaces that lift on pointer contact
     (the root card and the quick-actions pill) are decided once, by the
     shared interaction kernel, and read off `data-state`; the skin pairs the
     kernel token with the platform pseudo as one rule (F-37). */
  const rootInteraction = useInteractionState();
  const quickActionsInteraction = useInteractionState();

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

  /* The eyebrow is a Box (not a composed Text), so no later-layer typography
     skin competes for it: the whole overline voice — family, size, weight,
     case, tracking — is skin-owned on the part, over the page-header overline
     channels the type profile drives. The subtitle below takes the same
     conversion, which is what lets its whole treatment ladder (display /
     dotted / mono-technical × compact) live in the skin keyed on the
     stamped attributes instead of inline paint. */
  const eyebrowChip = eyebrow ? (
    <Box as="span" data-part="eyebrow" data-embedded={embedded}>
      {eyebrow}
    </Box>
  ) : null;

  /* Meta chips are a Box, not a Text — no later-layer typography skin claims
     them, so their whole box (geometry, type role, tone frame) is skin-owned
     and reads the caption role. `data-tone` is this family's closed variant
     domain (neutral | primary | success), mirrored by the skin's tone rules. */
  const renderMetaItem = (item: CollectionHeaderMetaItem) => {
    return (
      <Box data-part="meta-item" data-tone={item.tone ?? 'neutral'} key={item.key}>
        {item.label}
      </Box>
    );
  };

  const chrome = (
    <Flex
      align="start"
      justify="between"
      gap={compactLayout ? 14 : editorialTech ? 24 : 18}
      wrap="wrap"
    >
      <Box
        data-part="identity"
        data-compact-layout={compactLayout}
        data-editorial-tech={editorialTech}
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
        >
          {title}
        </Box>
        {!minimalLayout && (editorialTech && !compactLayout ? (
          <Flex
            align="start"
            data-part="subtitle-row"
            data-variant="editorial-tech"
          >
            <Box data-part="subtitle-divider" aria-hidden="true" />
            <Box
              as="span"
              data-part="subtitle"
              data-variant="editorial-tech"
              data-title-treatment={titleTreatment}
              data-subtitle-treatment={subtitleTreatment}
            >
              {subtitle}
            </Box>
          </Flex>
        ) : (
          <Flex
            align="start"
            data-part="subtitle-row"
            data-variant="default"
            data-title-treatment={titleTreatment}
            data-compact-layout={compactLayout}
          >
            <Box
              as="span"
              data-part="subtitle"
              data-variant="default"
              data-title-treatment={titleTreatment}
              data-subtitle-treatment={subtitleTreatment}
              data-compact-layout={compactLayout}
            >
              {subtitle}
            </Box>
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
        <Box data-part="secondary-rail">
          {((!compactLayout && eyebrowChip) || eyebrowMetaItems.length > 0) && (
            <Flex
              align="center"
              gap={8}
              wrap="wrap"
              justify={compactLayout ? 'start' : 'end'}
            >
              {eyebrowMetaItems.map(renderMetaItem)}
              {!compactLayout && eyebrowChip}
            </Flex>
          )}
          <Box
            data-embedded={embedded}
            data-editorial-tech={editorialTech}
            {...quickActionsInteraction.handlers}
            {...partAttributes('quick-actions', quickActionsInteraction.state)}
          >
            {inlineMetaItems.length > 0 && (
              <Flex
                align="center"
                gap={6}
                wrap="wrap"
                justify={compactLayout ? 'start' : 'end'}
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
                    {/* The composed Button is the single paint owner of its
                       own sizing and variant chrome; the family requests pill
                       geometry through the Button contract (radius='full') and
                       paints nothing on it — the coarse-pointer floor the
                       retired inline style enforced is the Button's own
                       contract now. */}
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
                    >
                      {action.icon && (
                        <Box
                          data-part="quick-action-icon"
                          data-icon-only={iconOnly}
                          as="span"
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
                  />
                </Dropdown>
              )}
            </Flex>
          </Box>

          {(belowMetaItems.length > 0 || (shortcuts && shortcuts.length > 0)) && (
            <Box>
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
        <Box data-part="secondary-rail">
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
  );

  /* The loading state is BUILT FROM THE ANATOMY, not hand-written: the
     shared renderer reads the chrome's own `data-part` tree and draws one
     bone per part, so the wait has the shape of the header it stands in for
     and cannot drift from it. The root keeps the announcement (`role='status'`
     + `aria-busy` + a named label), so the renderer is told not to announce a
     second time. */
  return (
    <Box
      ref={setRootElement}
      data-embedded={embedded}
      data-compact={compactLayout}
      data-posture={postureAttribute}
      data-minimal={minimalLayout}
      data-editorial-tech={editorialTech}
      data-loading={loading ? 'true' : 'false'}
      className="ds-structure ds-collection-header"
      role={loading ? 'status' : undefined}
      aria-busy={loading ? true : undefined}
      aria-label={loading ? loadingLabel : undefined}
      {...rootInteraction.handlers}
      {...partAttributes('root', rootInteraction.state)}
    >
      {loading ? <AnatomySkeleton busy={false}>{chrome}</AnatomySkeleton> : chrome}
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
