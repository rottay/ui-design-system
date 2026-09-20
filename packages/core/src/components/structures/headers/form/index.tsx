'use client';

/**
 * @fileoverview FormHeader — structures-tier create-form header with
 * required icon badge, back navigation, breadcrumb trail, hero title
 * cluster, and an action rail.
 *
 * @description
 * Engine-free structures family for create-form pages. Sibling to the
 * other three header families in `chrome/`:
 *
 *   - DetailHeader: read-only detail pages with optional tabs and
 *     metadata strips
 *   - EditHeader: edit pages with built-in Save / Cancel buttons,
 *     saving state, optional entityId chip, and an optional icon
 *   - FormHeader (this file): create-form pages with a REQUIRED icon
 *     badge, a simpler action rail (one or two actions, or a custom
 *     array), and a `mode` discriminator for create / edit / view
 *     contexts
 *
 * FormHeader is chrome, not a surface. The heavier DS `FormSurface` is
 * a full-page config object with `FormSurfaceConfig` + presentation/
 * behavior/visual/permissions layers and an integrated field renderer.
 * FormHeader is just the header strip — consumers compose it with
 * their own form body. Use this when you want a rich create-form
 * header without committing to the full surface config contract.
 *
 * Features:
 *   - Required supplier-independent icon badge (displayed in a colored box; the
 *     `colorVariant` prop controls the box tone -- 5 options:
 *     primary, secondary, success, warning, info)
 *   - Back button (uses NavigationLinkProvider Link adapter when
 *     mounted, falls back to native `<a>`)
 *   - Breadcrumb trail (same Link adapter resolution)
 *   - Hero title cluster: optional eyebrow chip, title, optional
 *     subtitle
 *   - Action rail: a single `action`, or `secondaryAction` + `action`
 *     pair, or a free-form `actions[]` array using
 *     `FormHeaderAction` with the SharedHeaderActionKind vocabulary
 *     from the shared header-actions helper. The rail sits in the hero
 *     row beside the title cluster (the EditHeader posture) -- the top
 *     bar is navigation only
 *   - `mode` indicator (`'create' | 'edit' | 'view'`) -- stamped on the
 *     root as `data-mode` so a skin or a tenant sheet can key on it;
 *     the DS paints no mode-specific rule (the meaning is the
 *     consumer's, not the design system's)
 *   - Optional context-rail / children slot inside a card below the
 *     hero
 *   - 4 archetype variants (control, editorial, technical,
 *     governance) each with their own gradient + grid background
 *     pattern
 *
 * The family stays domain-agnostic. All copy is consumer-supplied;
 * the component knows nothing about tenants, users, or any specific
 * entity.
 */

import { type ReactNode } from 'react';

import { NavigationBackIcon } from '@/graphics/icons/semantic/generated/roles/navigation-back';
import type { ComponentType } from 'react';
type FormHeaderIcon = ComponentType<any>;

import { partAttributes, serializeState, useInteractionState } from '@/foundation/behavior';

import { Box, Breadcrumb, Button, Flex, Stack, Text, Tooltip } from '../../../primitives';
import {
  useNavigationLink,
  type NavigationLinkInteractionStamp,
} from '../../../../infrastructure/runtime/adapters/presentation/react/navigation';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { resolveHeaderTone } from '../../foundation/chrome/runtime/header-tone';
import {
  type SharedHeaderActionKind,
  resolveSharedHeaderActionIcon,
  resolveSharedHeaderActionTooltip,
  resolveSharedHeaderActionVariant,
} from '../../../patterns/foundation/header-actions';

export interface FormHeaderAction {
  label: string;
  kind?: SharedHeaderActionKind;
  icon?: FormHeaderIcon;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost' | 'error';
  tooltip?: string;
}

export interface FormHeaderProps {
  /** Main icon displayed next to title */
  icon: FormHeaderIcon;
  /** Page title */
  title: string;
  /** Subtitle/description */
  subtitle?: string;
  /** Back navigation URL */
  backHref: string;
  /** Back button label */
  backLabel?: string;
  /** Primary action button */
  action?: FormHeaderAction;
  /** Secondary action button */
  secondaryAction?: FormHeaderAction;
  /** Optional action cluster for richer create flows */
  actions?: FormHeaderAction[];
  /** Color variant for accent elements */
  colorVariant?: 'primary' | 'secondary' | 'success' | 'warning' | 'info';
  /** Form mode indicator */
  mode?: 'create' | 'edit' | 'view';
  /** Optional breadcrumb items */
  breadcrumb?: Array<{ label: string; href?: string }>;
  /** Additional content to render below header */
  children?: ReactNode;
  /** Visual archetype for the hero shell */
  archetype?: 'editorial' | 'control' | 'technical' | 'governance';
  /** Short eyebrow label above the title */
  eyebrow?: string;
  /** Optional context rail rendered below the hero copy */
  contextRail?: ReactNode;
}

export function FormHeader({
  icon: MainIcon,
  title,
  subtitle,
  backHref,
  backLabel,
  action,
  secondaryAction,
  actions,
  colorVariant = 'secondary',
  mode = 'create',
  breadcrumb,
  children,
  archetype = 'control',
  eyebrow,
  contextRail,
}: FormHeaderProps) {
  // Resolve the framework-specific Link component once. Falls back to a
  // native <a> tag when no NavigationLinkProvider is mounted, which keeps
  // the DS package framework-agnostic.
  const NavLink = useNavigationLink();
  // Visible chrome copy rides the DS i18n channel with an English floor.
  const i18n = useOptionalTranslation('common');
  const resolvedBackLabel = backLabel ?? i18n?.tOr('back', 'Back') ?? 'Back';
  const actionsLabel = i18n?.tOr('actions', 'Actions') ?? 'Actions';
  // Hover and press on the back chip are decided once, by the shared kernel, and
  // read off `data-state`. The KEYBOARD ring is decided on the anchor ABOVE the
  // chip, because that is the focusable element; the skin pairs that stamp with
  // `:focus-visible`, so a host Link that drops it loses nothing.
  const backInteraction = useInteractionState();
  const backAnchor = useInteractionState();
  // The underline reset lives in the skin (`a:has(> [data-part='back-button'])`),
  // so the anchor carries no inline style of its own.
  const renderHrefAnchor = (href: string, content: ReactNode, stamp?: NavigationLinkInteractionStamp) => {
    if (NavLink) {
      return <NavLink href={href} {...stamp}>{content}</NavLink>;
    }
    return <a href={href} {...stamp}>{content}</a>;
  };
  const breadcrumbItems = breadcrumb?.map((item, index) => ({
    key: String(index),
    label: item.href ? renderHrefAnchor(item.href, item.label) : item.label,
  }));
  const resolvedActions = actions ?? [secondaryAction, action].filter(Boolean) as FormHeaderAction[];

  return (
    <Box
      data-part="root"
      data-structure="form-header"
      data-mode={mode}
      className="ds-structure ds-form-header"
    >
      <Box data-part="top-bar">
        <Flex align="center" gap={16} wrap="wrap">
          {renderHrefAnchor(
            backHref,
            <Flex
              {...backInteraction.handlers}
              {...partAttributes('back-button', {
                ...backInteraction.state,
                focusVisible: backAnchor.state.focusVisible,
              })}
              align="center"
              gap={8}
            >
              {/* Governed semantic role (autoMirror: the arrow flips in
                  RTL); the retired catalog ArrowLeftIcon carried no
                  mirroring contract. */}
              <NavigationBackIcon data-part="back-icon" decorative size={14} />
              <Text data-part="back-label" size="xs" color="secondary">
                {resolvedBackLabel}
              </Text>
            </Flex>,
            { 'data-state': serializeState(backAnchor.state), ...backAnchor.handlers },
          )}

          {breadcrumbItems && breadcrumbItems.length > 0 ? (
            <>
              <Box data-part="breadcrumb-divider" />
              <Breadcrumb items={breadcrumbItems} />
            </>
          ) : null}
        </Flex>
      </Box>

      <Box data-part="hero-panel" data-archetype={archetype}>
        <Flex data-part="hero-row" justify="between" align="start" wrap="wrap">
          <Flex align="center" gap={16} data-part="hero-cluster">
            <Box data-part="icon-badge" data-variant={resolveHeaderTone(colorVariant)}>
              <MainIcon data-part="icon-badge-glyph" />
            </Box>
            <Stack spacing="xs" data-part="hero-copy">
              {eyebrow ? (
                <Text
                  data-part="eyebrow"
                  size="xs"
                  weight="bold"
                  color="subtle"
                >
                  {eyebrow}
                </Text>
              ) : null}
              {/* Box as="h1" (the DetailHeader precedent): a composed Text
                  resolved its size inline, which left the skin's display
                  type dead — the h1 is fully skin-owned now. */}
              <Box data-part="title" as="h1">
                {title}
              </Box>
              {subtitle && (
                <Text data-part="subtitle" size="sm" color="secondary">
                  {subtitle}
                </Text>
              )}
            </Stack>
          </Flex>

          {resolvedActions.length > 0 ? (
            <Flex
              data-part="actions"
              role="group"
              aria-label={actionsLabel}
              align="center"
              gap={12}
              wrap="wrap"
            >
              {resolvedActions.map((headerAction, index) => {
                const ActionIcon = resolveSharedHeaderActionIcon(headerAction);

                return (
                  <Tooltip key={`${headerAction.label}-${index}`} content={resolveSharedHeaderActionTooltip(headerAction)}>
                    <Button
                      variant={resolveSharedHeaderActionVariant(headerAction)}
                      icon={ActionIcon ? <ActionIcon data-part="action-icon" /> : undefined}
                      onClick={headerAction.onClick}
                      loading={headerAction.loading}
                      disabled={headerAction.disabled}
                    >
                      {headerAction.label}
                    </Button>
                  </Tooltip>
                );
              })}
            </Flex>
          ) : null}
        </Flex>

        {contextRail || children ? (
          <Box data-part="context-card">
            {contextRail ? <Box data-part="context-rail">{contextRail}</Box> : null}
            {children ? (
              <Box data-part="context-card-children">
                {children}
              </Box>
            ) : null}
          </Box>
        ) : null}
      </Box>
    </Box>
  );
}

export default FormHeader;
