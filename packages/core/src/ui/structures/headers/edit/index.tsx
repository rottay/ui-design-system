'use client';

/**
 * @fileoverview EditHeader — structures-tier edit-form header with back
 * navigation, breadcrumb trail, hero title cluster, status badge, dirty
 * indicator, save/cancel actions, and optional structured action rail.
 *
 * @description
 * Engine-free structures family for entity-edit pages. Pairs with the
 * `record` building blocks (`RecordFieldGrid`,
 * `RecordField`) and with `form-sections` (`FormSections`)
 * to compose a full edit screen.
 *
 * EditHeader is chrome, not a surface. The heavier DS `FormSurface` is
 * a full-page config object with `FormSurfaceConfig` + presentation/
 * behavior/visual/permissions layers and an integrated field renderer.
 * EditHeader is just the header strip — consumers compose it with their
 * own form body. Use this when you want a rich edit-page header without
 * committing to the full surface config contract.
 *
 * Sibling chrome families:
 *   - DetailHeader — read-only detail pages with optional tabs and
 *     metadata strips
 *   - FormHeader — create-form pages with required-icon badge and a
 *     lighter action rail
 *   - EditHeader (this file) — edit pages with Save / Cancel / saving
 *     state built into the header action rail
 *
 * Features:
 *   - Back button (uses NavigationLinkProvider Link adapter when
 *     mounted, falls back to native `<a>`)
 *   - Breadcrumb trail (same Link adapter resolution; OWN grammar — the
 *     §4 anatomy tests pin `breadcrumb-link/separator/item`, so composing
 *     the Breadcrumb primitive is a contract-level migration, documented)
 *   - Optional entityId chip (monospace, truncated to 8 chars)
 *   - Hero title cluster: optional eyebrow chip, title, optional status
 *     pill, optional subtitle
 *   - Dirty indicator (dot + localized label, additive `dirty` prop)
 *   - Optional icon badge (supplier-independent icon, displayed in a colored box; the
 *     `colorVariant` prop controls the box tone)
 *   - Action rail with Save / Cancel built-ins, optional structured
 *     `actions[]` (using SharedHeaderActionDescriptor from the shared
 *     header-actions helper), and an `extraActions` ReactNode slot
 *   - `saving` state on the Save button (the certified Button owns the
 *     width-stable loading posture — the ConfirmDialog precedent)
 *   - `loading` state for the entire header (renders a centered Spinner
 *     placeholder)
 *   - Optional context-rail / children slot inside a card below the hero
 *   - 4 archetype variants (control, editorial, technical, governance)
 *     each with their own gradient + grid background pattern
 *
 * DOCUMENTED NON-GOALS (not in the contract, not invented): cancel/discard
 * confirmation via Popconfirm (cancel fires the callback directly), a
 * Ctrl+S save shortcut (no keybinding contract), sticky-on-scroll chrome
 * (the header is static page chrome).
 *
 * The family stays domain-agnostic. All record copy is consumer-supplied;
 * only chrome labels ride the i18n channel (English floor).
 */

import { type CSSProperties, type ReactNode } from 'react';

import { NavigationBackIcon } from '@/graphics/icons/presentation/semantic/generated/roles/navigation-back';
import {
  SaveIcon as Save,
  XIcon as X,
} from '../../../../graphics/icons';
import type { ComponentType } from 'react';
type HeaderIcon = ComponentType<any>;

import { Box, Button, Flex, Spinner, Stack, Text, Tooltip } from '../../../primitives';
import { useNavigationLink } from '../../../../infrastructure/runtime/adapters/presentation/react/navigation';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import {
  type SharedHeaderActionDescriptor,
  resolveSharedHeaderActionIcon,
  resolveSharedHeaderActionTooltip,
  resolveSharedHeaderActionVariant,
} from '../../../patterns/foundation/header-actions';

/* ============================================================================
 * TYPES
 * ========================================================================== */

export interface EditHeaderProps {
  /** Supplier-independent icon to display. */
  icon?: HeaderIcon;
  /** Main title */
  title: string;
  /** Subtitle/description */
  subtitle?: string;
  /** Entity ID to display */
  entityId?: string;
  /** Back link href */
  backHref: string;
  /** Back link label */
  backLabel?: string;
  /** Color variant for accents */
  colorVariant?: 'primary' | 'warning' | 'info' | 'success' | 'error' | 'secondary';
  /** Loading state */
  loading?: boolean;
  /** Save button loading state */
  saving?: boolean;
  /** Unsaved-changes indicator: renders a dot + localized label chip next to
   * the title. Additive contract — the header never infers dirtiness itself. */
  dirty?: boolean;
  /** Breadcrumb items */
  breadcrumb?: Array<{ label: string; href?: string }>;
  /** Save action */
  onSave?: () => void;
  /** Cancel action */
  onCancel?: () => void;
  /** Additional actions */
  extraActions?: ReactNode;
  /** Structured quick actions shown before Save/Cancel */
  actions?: SharedHeaderActionDescriptor[];
  /** Status badge */
  status?: {
    label: string;
    color: 'success' | 'warning' | 'error' | 'info' | 'secondary';
  };
  /** Additional content rendered below the header chrome */
  children?: ReactNode;
  /** Visual archetype for the hero shell */
  archetype?: 'editorial' | 'control' | 'technical' | 'governance';
  /** Short eyebrow label above the title */
  eyebrow?: string;
  /** Optional context rail rendered below the hero copy */
  contextRail?: ReactNode;
}

const VARIANT_TOKEN_MAP: Record<'primary' | 'warning' | 'info' | 'success' | 'error' | 'secondary', string> = {
  primary: 'primary',
  warning: 'warning',
  info: 'info',
  success: 'success',
  error: 'error',
  secondary: 'secondary',
};

// The tone is prop-selected (colorVariant/status.color) and the pre-step stamped
// no variant attribute to key a CSS rule on, so the computed tone rides a `--ds-*`
// custom property (set inline, consumed by edit-header.css). The return keys are
// deliberately NOT named `background`/`border`/`color`: those are custom-property
// VALUES, not inline paint, and must not read as paint to the skin ratchet.
function getVariantTone(variant?: 'primary' | 'warning' | 'info' | 'success' | 'error' | 'secondary') {
  const token = VARIANT_TOKEN_MAP[variant || 'secondary'];

  if (token === 'secondary') {
    return {
      bg: 'color-mix(in srgb, var(--ds-color-bg-secondary) 92%, transparent)',
      bd: 'var(--ds-color-border-secondary)',
      fg: 'var(--ds-color-text-secondary)',
    };
  }

  return {
    bg: `color-mix(in srgb, var(--ds-color-${token}) 10%, var(--ds-color-bg-secondary) 90%)`,
    bd: `color-mix(in srgb, var(--ds-color-${token}) 18%, var(--ds-color-border-secondary) 82%)`,
    fg: `color-mix(in srgb, var(--ds-color-${token}) 78%, var(--ds-color-text-primary) 22%)`,
  };
}

/* ============================================================================
 * COMPONENT
 * ========================================================================== */

export function EditHeader({
  icon: Icon,
  title,
  subtitle,
  entityId,
  backHref,
  backLabel,
  colorVariant = 'secondary',
  loading = false,
  saving = false,
  dirty = false,
  breadcrumb,
  onSave,
  onCancel,
  extraActions,
  actions = [],
  status,
  children,
  archetype = 'control',
  eyebrow,
  contextRail,
}: EditHeaderProps) {
  // Resolve the framework-specific Link component once. Falls back to a
  // native <a> tag when no NavigationLinkProvider is mounted, which keeps
  // the DS package framework-agnostic.
  const NavLink = useNavigationLink();
  // Visible chrome copy rides the DS i18n channel with an English floor, so the
  // header still renders complete labels outside an I18nProvider.
  const i18n = useOptionalTranslation('common');
  const resolvedBackLabel = backLabel ?? i18n?.tOr('back', 'Back') ?? 'Back';
  const cancelLabel = i18n?.tOr('cancel', 'Cancel') ?? 'Cancel';
  const saveLabel = i18n?.tOr('save_changes', 'Save Changes') ?? 'Save Changes';
  const entityIdLabel = i18n?.tOr('entity_id', 'ID') ?? 'ID';
  const dirtyLabel = i18n?.tOr('unsaved_changes', 'Unsaved changes') ?? 'Unsaved changes';
  const renderHrefAnchor = (href: string, content: ReactNode, style?: CSSProperties) => {
    if (NavLink) {
      return (
        <NavLink href={href} style={style}>
          {content}
        </NavLink>
      );
    }
    return (
      <a href={href} style={style}>
        {content}
      </a>
    );
  };

  const iconTone = getVariantTone(colorVariant);
  const statusTone = getVariantTone(status?.color ?? 'secondary');

  if (loading) {
    return (
      <Box
        data-part="root"
        className="ds-structure ds-edit-header"
        data-loading="true"
      >
        <Spinner size="lg" />
      </Box>
    );
  }

  return (
    <Box
      data-part="root"
      className="ds-structure ds-edit-header"
      data-loading={false}
    >
      <Box data-part="top-bar">
        <Flex justify="between" align="center" wrap="wrap" gap={12}>
          <Flex align="center" gap={20}>
            {renderHrefAnchor(
              backHref,
              <Flex
                data-part="back-button"
                align="center"
                gap={8}
              >
                {/* Governed semantic role (autoMirror: the arrow flips in
                    RTL); the retired catalog ArrowLeftIcon carried no
                    mirroring contract. The chip's visible label makes the
                    glyph decorative. */}
                <NavigationBackIcon data-part="back-icon" decorative size={14} />
                <Text data-part="back-label" size="xs" weight="medium" color="secondary">
                  {resolvedBackLabel}
                </Text>
              </Flex>,
            )}

            {breadcrumb && breadcrumb.length > 0 && (
              <>
                <Box data-part="breadcrumb-divider" />
                <Flex align="center" gap={8}>
                  {breadcrumb.map((item, index) => (
                    <Flex key={index} align="center" gap={8}>
                      {index > 0 && (
                        <Text data-part="breadcrumb-separator" size="xs" color="subtle">/</Text>
                      )}
                      {item.href ? (
                        renderHrefAnchor(
                          item.href,
                          <Text data-part="breadcrumb-link" size="xs" color="secondary">
                            {item.label}
                          </Text>,
                        )
                      ) : (
                        <Text data-part="breadcrumb-item" size="xs" color="secondary">
                          {item.label}
                        </Text>
                      )}
                    </Flex>
                  ))}
                </Flex>
              </>
            )}
          </Flex>

          <Flex align="center" gap={16}>
            {entityId && (
              <Text
                data-part="entity-id"
                size="xs"
                color="secondary"
                title={entityId.length > 8 ? entityId : undefined}
              >
                {entityIdLabel}: {entityId.slice(0, 8)}{entityId.length > 8 ? '…' : ''}
              </Text>
            )}
          </Flex>
        </Flex>
      </Box>

      <Box data-part="hero-panel" data-archetype={archetype}>
        <Flex justify="between" align="center" gap={20} wrap="wrap">
          <Flex align="center" gap={20} data-part="hero-copy">
            {Icon && (
              <Box
                data-part="icon-badge"
                style={{
                  '--ds-header-icon-tone-bg': iconTone.bg,
                  '--ds-header-icon-tone-bd': iconTone.bd,
                  '--ds-header-icon-tone-fg': iconTone.fg,
                } as CSSProperties}
              >
                <Icon data-part="icon-badge-glyph" style={{ width: 24, height: 24 }} />
              </Box>
            )}
            <Stack spacing="xs">
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
              <Flex align="center" gap={12} wrap="wrap">
                {/* Box as="h1" (the DetailHeader precedent): a composed Text
                    resolves its size inline, which left the skin's display
                    type dead — the h1 is fully skin-owned now. */}
                <Box data-part="title" as="h1">
                  {title}
                </Box>
                {status && (
                  <Box
                    data-part="status-pill"
                    style={{
                      '--ds-edit-header-status-tone-bg': statusTone.bg,
                      '--ds-edit-header-status-tone-bd': statusTone.bd,
                      '--ds-edit-header-status-tone-fg': statusTone.fg,
                    } as CSSProperties}
                  >
                    <Text data-part="status-pill-text" size="xs" weight="medium">
                      {status.label}
                    </Text>
                  </Box>
                )}
                {dirty && (
                  <Box data-part="dirty-chip">
                    <Box data-part="dirty-dot" aria-hidden="true" />
                    <Text data-part="dirty-label" size="xs" weight="medium">
                      {dirtyLabel}
                    </Text>
                  </Box>
                )}
              </Flex>
              {subtitle && (
                <Text data-part="subtitle" size="sm" color="secondary">{subtitle}</Text>
              )}
            </Stack>
          </Flex>

          <Flex data-part="actions" gap={12} wrap="wrap">
            {actions.map((action, index) => {
              const ActionIcon = resolveSharedHeaderActionIcon(action);

              return (
                <Tooltip key={`${action.label}-${index}`} content={resolveSharedHeaderActionTooltip(action)}>
                  <Button
                    variant={resolveSharedHeaderActionVariant(action)}
                    icon={ActionIcon ? <ActionIcon style={{ width: 14, height: 14 }} /> : undefined}
                    onClick={action.onClick}
                    href={action.href}
                    loading={action.loading}
                    disabled={action.disabled}
                  >
                    {action.label}
                  </Button>
                </Tooltip>
              );
            })}
            {extraActions}
            {onCancel && (
              <Button
                variant="secondary"
                icon={<X style={{ width: 14, height: 14 }} />}
                onClick={onCancel}
              >
                {cancelLabel}
              </Button>
            )}
            {onSave && (
              <Button
                variant="primary"
                icon={<Save style={{ width: 14, height: 14 }} />}
                onClick={onSave}
                loading={saving}
              >
                {saveLabel}
              </Button>
            )}
          </Flex>
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

export default EditHeader;
