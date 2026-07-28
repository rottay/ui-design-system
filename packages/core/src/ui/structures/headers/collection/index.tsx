'use client';

/**
 * @fileoverview CollectionHeader — structures-tier hero header for
 * workspace landing pages with eyebrow chip, hero title, subtitle,
 * quick actions cluster, compact meta chips and shortcut hints.
 *
 * @description
 * Engine-free structures family that pairs with the EntityTableWorkspace family of
 * list/workspace pages. Sits visually above ListToolbar / TableToolbar.
 * The pattern packs four optional clusters around the title:
 *   - eyebrow chip (uppercase pill identifying the workspace)
 *   - quick actions cluster (right-side action buttons in a raised pill)
 *   - meta items (tone-coded compact chips for status/count signals)
 *   - shortcuts (compact pill hints for keyboard navigation)
 *
 * Visually distinct from `CockpitHeader` (detail-page style: 22px title,
 * plain background, simple actions) and `WorkbenchHeader` (briefing style:
 * exception count, saved view selector). Use this structures family when you want a
 * 36px hero title, a flat card background, and a packed right rail.
 *
 * The family stays domain-agnostic: it knows nothing about tenants,
 * users, or any specific entity. All copy comes from props.
 */

import type { ReactNode } from 'react';

import { Box, Button, Flex, Text } from '../../../primitives';
import { KeyboardIcon } from '@/graphics/icons';
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
}: CollectionHeaderProps) {
  const i18n = useOptionalTranslation('common');
  const { isPhoneOrTablet } = useResponsive();
  const shortcutsLabel = i18n?.tOr('shortcuts', 'Shortcuts') ?? 'Shortcuts';

  const embedded = surfaceVariant === 'embedded';
  const useDisplayTitle = titleTreatment === 'display';
  const useDottedTitle = titleTreatment === 'dotted';
  const useMonoSubtitle = subtitleTreatment === 'mono-technical';
  const editorialTech = layoutVariant === 'editorial-tech';
  const compactLayout = compact ?? isPhoneOrTablet;
  const minimalLayout = minimal;
  const displayInk = 'var(--ds-collection-header-display-color, var(--ds-color-primary))';
  const compactMetaItems = metaItems ?? [];
  const inlineMetaItems = metaItemsPlacement === 'inline-start' ? compactMetaItems : [];
  const eyebrowMetaItems = metaItemsPlacement === 'eyebrow-end' ? compactMetaItems : [];
  const belowMetaItems = metaItemsPlacement === 'below' ? compactMetaItems : [];
  const eyebrowChip = eyebrow ? (
    <Text
      data-part="eyebrow"
      data-embedded={embedded}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        minHeight: 'var(--ds-spacing-6, 24px)',
        padding: '0 var(--ds-spacing-2, 8px)',
        fontSize: 'var(--ds-font-size-xs, 12px)',
        fontWeight: 700,
        textTransform: 'uppercase' as const,
        letterSpacing: '0.13em',
        lineHeight: 1,
      }}
    >
      {eyebrow}
    </Text>
  ) : null;

  const renderMetaItem = (item: CollectionHeaderMetaItem) => {
    return (
      <Box
        data-part="meta-item"
        data-tone={item.tone ?? 'neutral'}
        key={item.key}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          minHeight: 'var(--ds-spacing-6, 24px)',
          padding: '0 var(--ds-spacing-2, 8px)',
          fontSize: 'var(--ds-font-size-xs, 12px)',
          fontWeight: 700,
          letterSpacing: '0.02em',
          whiteSpace: 'nowrap',
        }}
      >
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
          style={{
            minWidth: 0,
            flex: compactLayout
              ? '1 1 100%'
              : editorialTech
                ? '1 1 clamp(300px, 42%, 560px)'
                : '1 1 clamp(280px, 38%, 460px)',
            maxWidth: compactLayout ? '100%' : editorialTech ? 680 : 560,
            display: 'grid',
            gap: minimalLayout ? 'var(--ds-spacing-2, 8px)' : editorialTech ? 0 : undefined,
          }}
        >
          {minimalLayout && eyebrowChip}
          <Box
            data-part="title"
            data-title-treatment={titleTreatment}
            data-compact-layout={compactLayout}
            data-editorial-tech={editorialTech}
            as="h2"
            style={{
              fontFamily: useDisplayTitle
                ? 'var(--ds-font-family-display, var(--ds-font-family-heading))'
                : 'var(--ds-font-family-heading)',
              fontSize: minimalLayout
                ? 'var(--ds-font-size-fluid-3xl)'
                : useDisplayTitle
                  ? 'clamp(42px, 5.4vw, 58px)'
                  : useDottedTitle
                    ? compactLayout
                      ? 'clamp(26px, 8.8vw, 34px)'
                      : editorialTech
                        ? 'clamp(40px, 5.2vw, 54px)'
                        : 'clamp(38px, 4.8vw, 52px)'
                    : 'var(--ds-font-size-fluid-4xl)',
              fontWeight: useDisplayTitle
                ? ('var(--ds-font-weight-semibold, 600)' as any)
                : useDottedTitle
                  ? (compactLayout
                      ? 'var(--ds-font-weight-bold, 700)'
                      : editorialTech
                        ? 'var(--ds-font-weight-semibold, 600)'
                        : 'var(--ds-font-weight-extrabold, 800)') as any
                : ('var(--ds-font-weight-bold, 700)' as any),
              letterSpacing: useDisplayTitle
                ? '0.015em'
                : useDottedTitle
                  ? compactLayout
                    ? '-0.022em'
                    : editorialTech
                      ? '-0.052em'
                      : '-0.04em'
                  : 0,
              margin: 0,
              marginTop: 0,
              lineHeight: useDisplayTitle
                ? 0.9
                : useDottedTitle
                  ? compactLayout
                    ? 0.92
                    : editorialTech
                      ? 0.84
                      : 0.88
                  : 1.05,
              textWrap: 'balance',
              display: 'block',
              width: 'fit-content',
              textRendering: 'optimizeLegibility',
              textTransform: (useDisplayTitle || useDottedTitle) ? ('uppercase' as const) : undefined,
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
              <Box
                data-part="subtitle-divider"
                style={{
                  flexShrink: 0,
                  width: 28,
                  height: 1,
                  marginTop: 9,
                }}
              />
              <Text
                data-part="subtitle"
                data-variant="editorial-tech"
                data-title-treatment={titleTreatment}
                data-subtitle-treatment={subtitleTreatment}
                style={{
                  display: 'block',
                  fontSize: useDisplayTitle
                    ? 'var(--ds-font-size-xs, 12px)'
                    : useDottedTitle
                      ? '10px'
                      : 'var(--ds-font-size-sm, 14px)',
                  lineHeight: 1.56,
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
              style={{
                marginTop: useDisplayTitle
                  ? 'var(--ds-spacing-2, 8px)'
                  : useDottedTitle
                    ? compactLayout
                      ? 'var(--ds-spacing-2, 8px)'
                      : 'var(--ds-spacing-2, 8px)'
                    : 'var(--ds-spacing-3, 12px)',
                paddingTop: compactLayout ? 'var(--ds-spacing-2, 8px)' : 'var(--ds-spacing-3, 12px)',
                maxWidth: compactLayout ? '100%' : 620,
              }}
            >
              <Text
                data-part="subtitle"
                data-variant="default"
                data-title-treatment={titleTreatment}
                data-subtitle-treatment={subtitleTreatment}
                data-compact-layout={compactLayout}
                style={{
                  display: 'block',
                  fontSize: useDisplayTitle
                    ? 'var(--ds-font-size-xs, 12px)'
                    : useDottedTitle
                      ? compactLayout
                        ? '11px'
                        : 'var(--ds-font-size-xs, 12px)'
                      : 'var(--ds-font-size-sm, 14px)',
                  lineHeight: useDisplayTitle ? 1.65 : useDottedTitle ? (compactLayout ? 1.45 : 1.55) : 1.5,
                  textWrap: 'pretty',
                  fontFamily: useMonoSubtitle
                    ? 'var(--ds-font-family-mono, var(--ds-font-family-base))'
                    : undefined,
                  letterSpacing: useDisplayTitle
                    ? '0.03em'
                    : useMonoSubtitle
                      ? compactLayout
                        ? '0.05em'
                        : '0.09em'
                      : useDottedTitle
                        ? compactLayout
                          ? '0.03em'
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
              style={{
                marginTop: 'var(--ds-spacing-3, 12px)',
                height: 1,
                width: 'min(100%, 720px)',
              }}
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
            {(eyebrowChip || eyebrowMetaItems.length > 0) && (
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
                {eyebrowChip}
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
                {quickActions.map((action) => (
                  <Button
                    key={action.key}
                    size="sm"
                    variant={
                      action.variant === 'primary'
                        ? 'primary'
                        : action.variant === 'secondary'
                          ? 'secondary'
                          : 'default'
                    }
                    onClick={action.onClick}
                    className={`ds-collection-header__quick-action ds-collection-header__quick-action--${action.variant ?? 'default'}`}
                    style={{
                      minHeight: 'var(--ds-spacing-8, 32px)',
                      paddingInline: action.variant === 'primary' ? 'var(--ds-spacing-3, 12px)' : 'var(--ds-spacing-3, 12px)',
                      fontSize: 'var(--ds-font-size-xs, 12px)',
                    }}
                  >
                    {action.icon && (
                      <Box
                        data-part="quick-action-icon"
                        as="span"
                        style={{
                          display: 'inline-flex',
                          marginInlineEnd: 'var(--ds-spacing-1, 4px)',
                        }}
                      >
                        {action.icon}
                      </Box>
                    )}
                    {action.label}
                  </Button>
                ))}
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
                    <Box
                      data-part="shortcuts-label"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 'var(--ds-spacing-1, 4px)',
                        minHeight: 'var(--ds-spacing-5, 20px)',
                        padding: '0 var(--ds-spacing-2, 8px)',
                        fontSize: 'var(--ds-font-size-xs, 12px)',
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase' as const,
                      }}
                    >
                      <KeyboardIcon data-part="shortcuts-label-icon" style={{ width: 10, height: 10 }} />
                      {shortcutsLabel}
                    </Box>
                    {shortcuts.map((shortcut) => (
                      <Box
                        data-part="shortcut-pill"
                        key={shortcut.key}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          minHeight: 'var(--ds-spacing-5, 20px)',
                          padding: '0 var(--ds-spacing-2, 8px)',
                          fontSize: 'var(--ds-font-size-xs, 12px)',
                          fontWeight: 700,
                          letterSpacing: '0.03em',
                          lineHeight: 1,
                        }}
                      >
                        {shortcut.label}
                      </Box>
                    ))}
                  </Flex>
                )}
              </Box>
            )}
          </Box>
        )}

        {!minimalLayout && !quickActions?.length && (eyebrowChip || compactMetaItems.length > 0 || (shortcuts && shortcuts.length > 0)) && (
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
            {(eyebrowChip || eyebrowMetaItems.length > 0) && (
              <Flex align="center" gap={8} wrap="wrap" justify={compactLayout ? 'start' : 'end'}>
                {eyebrowMetaItems.map(renderMetaItem)}
                {eyebrowChip}
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
                  <Box
                    data-part="shortcut-pill"
                    key={shortcut.key}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      minHeight: 'var(--ds-spacing-5, 20px)',
                      padding: '0 var(--ds-spacing-2, 8px)',
                      fontSize: 'var(--ds-font-size-xs, 12px)',
                      fontWeight: 700,
                      letterSpacing: '0.03em',
                      lineHeight: 1,
                    }}
                  >
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
