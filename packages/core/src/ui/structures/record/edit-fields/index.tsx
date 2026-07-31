'use client';

/**
 * @fileoverview edit-fields — structures-tier chrome for a single-surface
 * record EDIT form: numbered/labeled fields, a primary/advanced disclosure
 * region, and a save/cancel footer.
 *
 * @description
 * Companion to `record` (read-only field display) and `form-sections`
 * (collapsible thematic sections). Where those two show a record or group
 * unrelated content, `edit-fields` is the chrome for EDITING one record on
 * one page-level surface — the shape behind the "forms are not card
 * stacks" rule: one page-level surface at most, fields kept in the same
 * visual rhythm, and a primary/advanced split instead of nested field
 * cards.
 *
 * Exports:
 *   - `InlineEditorGroup` — stacks multiple `InlineEditor` blocks with no
 *     gap between them, for a page that edits more than one logical
 *     surface (e.g. "Profile" then "Preferences").
 *   - `InlineEditor` — one edit surface: header (icon, eyebrow, title,
 *     description, actions, meta) + field content + optional footer.
 *   - `InlineEditGrid` — a self-contained CSS-grid field region. `kind`
 *     distinguishes the always-visible `primary` region from the
 *     collapsible `advanced` region; the advanced region unmounts its
 *     children while collapsed by default so hidden controls do not sit
 *     in the tab order or run validation.
 *   - `InlineEditSection` — an optional titled sub-group within a grid,
 *     for forms long enough to need a second heading level.
 *   - `InlineEditField` — one field: an icon/number/requirement-pill
 *     label row plus a width-bounded control slot. The label is a plain
 *     `<label htmlFor>` — association is explicit through `htmlFor`, not
 *     inferred by walking the DOM for a following control.
 *   - `InlineEditControl` — the width-bounded wrapper around the actual
 *     form control, used standalone when a field needs custom label
 *     markup `InlineEditField` does not cover.
 *   - `MoreFieldsToggle` — the show/hide control for the advanced region.
 *     `sticky` docks it with CSS `position: sticky` while expanded so it
 *     stays reachable without a scroll-driven reposition loop.
 *   - `InlineEditFooter` — the save/cancel row, with summary, dirty
 *     summary, impact-preview, and error slots.
 *
 * The family stays domain-agnostic. All labels, hints, and content are
 * consumer-supplied; no export here knows about tenants, users, or any
 * specific entity. Token-pure: colors and motion resolve through
 * `var(--ds-*)`; there are no hardcoded colors and no bare millisecond
 * literals outside a token reference.
 */

import {
  useId,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from 'react';

import { Box, Button, Flex, Stack, Text, Tooltip } from '../../../primitives';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';

/* -------------------------------------------------------------------------- */
/* Shared chrome copy (i18n channel with an English floor)                    */
/* -------------------------------------------------------------------------- */

/**
 * Chrome copy with an English floor: the family renders standalone (no
 * I18nProvider) without crashing, and never echoes a raw key. All defaults
 * below (requirement pills, toggle labels, footer actions, section number)
 * resolve through this channel; explicit props always win.
 */
function useEditFieldsCopy() {
  const i18n = useOptionalTranslation('components');
  const tOr = (key: string, floor: string, params?: Record<string, string | number>): string =>
    i18n?.tOr(key, floor, params) ?? floor;
  return {
    required: tOr('editFields.requirement.required', 'Required'),
    recommended: tOr('editFields.requirement.recommended', 'Recommended'),
    optional: tOr('editFields.requirement.optional', 'Optional'),
    requiredTitle: tOr('editFields.requirement.required_title', 'Always shown. Saving depends on this value.'),
    recommendedTitle: tOr('editFields.requirement.recommended_title', 'Improves routing, reporting, or review quality. Safe to fill in later.'),
    optionalTitle: tOr('editFields.requirement.optional_title', 'Safe to leave blank.'),
    cancel: tOr('editFields.footer.cancel', 'Cancel'),
    save: tOr('editFields.footer.save', 'Save changes'),
    showMore: tOr('editFields.toggle.show_more', 'Show more fields'),
    hideMore: tOr('editFields.toggle.hide_more', 'Hide more fields'),
    sectionNumber: (n: string) => tOr('editFields.section.number', 'Section {number}', { number: n }),
  };
}

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type InlineEditFieldRequirement = 'required' | 'recommended' | 'optional';
export type InlineEditFieldSpan = 1 | 2 | 3 | 'full';
export type InlineEditControlWidth = 'full' | 'wide' | 'compact' | 'natural';

export interface InlineEditorGroupProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export interface InlineEditorFooterSlotProps {
  summary?: ReactNode;
  dirtySummary?: ReactNode;
  hiddenDirtySummary?: ReactNode;
  impactPreview?: ReactNode;
  error?: ReactNode;
  cancelLabel?: ReactNode;
  saveLabel?: ReactNode;
  onCancel?: () => void;
  onSave?: () => void;
  cancelDisabled?: boolean;
  saveDisabled?: boolean;
  isSaving?: boolean;
  className?: string;
  style?: CSSProperties;
}

export interface InlineEditorProps {
  children: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  icon?: ElementType;
  actions?: ReactNode;
  meta?: ReactNode;
  footer?: ReactNode;
  footerProps?: InlineEditorFooterSlotProps;
  headerless?: boolean;
  className?: string;
  style?: CSSProperties;
}

export interface InlineEditGridProps {
  children: ReactNode;
  kind?: 'primary' | 'advanced';
  expanded?: boolean;
  unmountWhenCollapsed?: boolean;
  /** CSS `grid-template-columns` value. @default 'repeat(3, minmax(0, 1fr))' */
  columns?: string;
  gap?: number;
  className?: string;
  style?: CSSProperties;
}

export interface InlineEditSectionProps {
  children: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  sectionNumber?: string;
  icon?: ElementType;
  actions?: ReactNode;
  className?: string;
  style?: CSSProperties;
  contentStyle?: CSSProperties;
}

export interface InlineEditControlProps {
  children: ReactNode;
  width?: InlineEditControlWidth;
  className?: string;
  style?: CSSProperties;
}

export interface InlineEditFieldProps {
  children: ReactNode;
  label: string;
  /** Optional editorial field number (e.g. "01", "02.1"). */
  fieldNumber?: string;
  hint?: string;
  requirement?: InlineEditFieldRequirement;
  requirementLabel?: string;
  requirementTitle?: string;
  showRequirement?: boolean;
  icon?: ElementType;
  span?: InlineEditFieldSpan;
  controlWidth?: InlineEditControlWidth;
  /** Id of the associated form control, for the label's `htmlFor`. */
  htmlFor?: string;
  hasError?: boolean;
  errorMessageId?: string;
  errorMessage?: ReactNode;
  className?: string;
  style?: CSSProperties;
  controlStyle?: CSSProperties;
}

export interface MoreFieldsToggleProps {
  expanded: boolean;
  onToggle: () => void;
  controls?: string;
  showLabel?: string;
  hideLabel?: string;
  /** Docks the control with CSS `position: sticky` while expanded. @default false */
  sticky?: boolean;
  /** Distance from the top of the scroll container when `sticky`. @default 72 */
  stickyOffset?: number;
  className?: string;
  style?: CSSProperties;
}

export type InlineEditFooterProps = InlineEditorFooterSlotProps & {
  children?: ReactNode;
};

/* -------------------------------------------------------------------------- */
/* InlineEditorGroup                                                         */
/* -------------------------------------------------------------------------- */

export function InlineEditorGroup({
  children,
  className,
  style,
}: InlineEditorGroupProps): React.ReactElement {
  return (
    <Stack
      spacing={0}
      className={['ds-structure', 'ds-edit-fields', className].filter(Boolean).join(' ')}
      data-part="group"
      style={style}
    >
      {children}
    </Stack>
  );
}

/* -------------------------------------------------------------------------- */
/* InlineEditor                                                              */
/* -------------------------------------------------------------------------- */

export function InlineEditor({
  children,
  title,
  description,
  eyebrow,
  icon: Icon,
  actions,
  meta,
  footer,
  footerProps,
  headerless = false,
  className,
  style,
}: InlineEditorProps): React.ReactElement {
  const hasFooter = Boolean(footer || footerProps);

  return (
    <Box
      className={['ds-structure', 'ds-edit-fields', className].filter(Boolean).join(' ')}
      data-part="editor"
      data-headerless={headerless}
      style={style}
    >
      {!headerless ? (
        <Flex data-part="editor-header" align="start" justify="between" gap={14} wrap="wrap">
          <Flex align="start" gap={12} data-part="editor-lead">
            {Icon ? (
              <Box
                data-part="editor-icon"
                aria-hidden
              >
                <Icon size={16} />
              </Box>
            ) : null}
            <Stack spacing={4} data-part="editor-copy">
              {eyebrow ? (
                <Text
                  data-part="editor-eyebrow"
                  size="xs"
                  weight="bold"
                >
                  {eyebrow}
                </Text>
              ) : null}
              <Text data-part="editor-title" weight="bold">
                {title}
              </Text>
              {description ? (
                <Text data-part="editor-description" size="sm">
                  {description}
                </Text>
              ) : null}
            </Stack>
          </Flex>
          {meta || actions ? (
            <Flex data-part="editor-actions" align="center" justify="end" gap={8} wrap="wrap">
              {meta}
              {actions}
            </Flex>
          ) : null}
        </Flex>
      ) : null}
      {children}
      {hasFooter ? <InlineEditFooter {...footerProps}>{footer}</InlineEditFooter> : null}
    </Box>
  );
}

/* -------------------------------------------------------------------------- */
/* InlineEditGrid                                                            */
/* -------------------------------------------------------------------------- */

export function InlineEditGrid({
  children,
  kind = 'primary',
  expanded = true,
  unmountWhenCollapsed = true,
  columns = 'repeat(3, minmax(0, 1fr))',
  gap = 14,
  className,
  style,
}: InlineEditGridProps): React.ReactElement | null {
  if (kind === 'advanced' && !expanded && unmountWhenCollapsed) {
    return null;
  }

  return (
    <Box
      className={['ds-structure', 'ds-edit-fields', className].filter(Boolean).join(' ')}
      data-part="grid"
      data-kind={kind}
      data-expanded={kind === 'advanced' ? expanded : undefined}
      hidden={kind === 'advanced' && !expanded ? true : undefined}
      aria-hidden={kind === 'advanced' && !expanded ? true : undefined}
      style={{
        /* Consumer layout values ride quoted channels; the skin applies them
           and owns the narrow container cut. */
        '--ds-edit-fields-grid-columns': columns,
        '--ds-edit-fields-grid-gap': `${gap}px`,
        ...style,
      } as CSSProperties}
    >
      {children}
    </Box>
  );
}

/* -------------------------------------------------------------------------- */
/* InlineEditSection                                                         */
/* -------------------------------------------------------------------------- */

export function InlineEditSection({
  children,
  title,
  description,
  sectionNumber,
  icon: Icon,
  actions,
  className,
  style,
  contentStyle,
}: InlineEditSectionProps): React.ReactElement {
  const copy = useEditFieldsCopy();
  return (
    <Box
      className={['ds-structure', 'ds-edit-fields', className].filter(Boolean).join(' ')}
      data-part="section"
      style={style}
    >
      <Flex data-part="section-header" align="center" justify="between" gap={12} wrap="wrap">
        <Flex align="center" gap={10} data-part="section-lead">
          {Icon ? (
            <Box data-part="section-icon" aria-hidden>
              <Icon size={15} />
            </Box>
          ) : null}
          <Stack spacing={3} data-part="section-copy">
            <Flex align="center" gap={8} wrap="wrap">
              {sectionNumber ? (
                <Text
                  data-part="section-number"
                  size="xs"
                  weight="bold"
                >
                  {copy.sectionNumber(sectionNumber)}
                </Text>
              ) : null}
              <Text data-part="section-title" size="sm" weight="bold">
                {title}
              </Text>
            </Flex>
            {description ? (
              <Text data-part="section-description" size="xs">
                {description}
              </Text>
            ) : null}
          </Stack>
        </Flex>
        {actions ? (
          <Flex data-part="section-actions" align="center" justify="end" gap={6} wrap="wrap">
            {actions}
          </Flex>
        ) : null}
      </Flex>
      <Box data-part="section-content" style={contentStyle}>{children}</Box>
    </Box>
  );
}

/* -------------------------------------------------------------------------- */
/* InlineEditControl                                                         */
/* -------------------------------------------------------------------------- */

const controlWidthStyles: Record<InlineEditControlWidth, CSSProperties> = {
  full: { width: '100%' },
  wide: { width: 'min(100%, 520px)' },
  compact: { width: 'min(100%, 280px)' },
  natural: { width: 'fit-content' },
};

export function InlineEditControl({
  children,
  width = 'full',
  className,
  style,
}: InlineEditControlProps): React.ReactElement {
  return (
    <Box
      className={['ds-structure', 'ds-edit-fields', className].filter(Boolean).join(' ')}
      data-part="control"
      data-width={width}
      /* The per-width style is a pinned runtime value (the public test
         asserts the inline `style.width` per variant), so it stays inline. */
      style={{
        ...controlWidthStyles[width],
        ...style,
      }}
    >
      {children}
    </Box>
  );
}

/* -------------------------------------------------------------------------- */
/* InlineEditField                                                           */
/* -------------------------------------------------------------------------- */

const spanColumn: Record<InlineEditFieldSpan, string> = {
  1: 'span 1',
  2: 'span 2',
  3: 'span 3',
  full: '1 / -1',
};

export function InlineEditField({
  children,
  label,
  fieldNumber,
  hint,
  requirement = 'recommended',
  requirementLabel,
  requirementTitle,
  showRequirement,
  icon: Icon,
  span = 1,
  controlWidth = 'full',
  htmlFor,
  hasError,
  errorMessageId,
  errorMessage,
  className,
  style,
  controlStyle,
}: InlineEditFieldProps): React.ReactElement {
  const copy = useEditFieldsCopy();
  const autoId = useId();
  const hintId = hint ? `${autoId}-hint` : undefined;
  const resolvedErrorId = hasError && errorMessage ? errorMessageId ?? `${autoId}-error` : errorMessageId;
  const describedBy = [hintId, hasError ? resolvedErrorId : undefined].filter(Boolean).join(' ') || undefined;
  const shouldShowRequirement = showRequirement ?? requirement !== 'optional';
  const requirementCopy =
    requirementLabel ??
    (requirement === 'required' ? copy.required : requirement === 'recommended' ? copy.recommended : copy.optional);
  const requirementTooltip =
    requirementTitle ??
    (requirement === 'required'
      ? copy.requiredTitle
      : requirement === 'recommended'
        ? copy.recommendedTitle
        : copy.optionalTitle);

  return (
    <Box
      className={['ds-structure', 'ds-edit-fields', className].filter(Boolean).join(' ')}
      data-part="field"
      data-requirement={requirement}
      data-error={Boolean(hasError)}
      /* The span → grid-column mapping is a pinned runtime value (the public
         test asserts the inline `style.gridColumn`), so it stays inline. */
      style={{ gridColumn: spanColumn[span], ...style }}
    >
      <Box data-part="field-label-row" data-has-hint={Boolean(hint)}>
        <Flex align="center" gap={8} wrap="wrap">
          {fieldNumber ? (
            <Text
              data-part="field-number"
              aria-hidden
              size="xs"
            >
              {fieldNumber}
            </Text>
          ) : null}
          {Icon ? (
            <Box data-part="field-icon" aria-hidden>
              <Icon size={14} />
            </Box>
          ) : null}
          <Box
            as="label"
            data-part="field-label"
            data-linked={Boolean(htmlFor)}
            htmlFor={htmlFor}
            {...(hasError ? { 'aria-invalid': 'true' as const } : {})}
            {...(describedBy ? { 'aria-describedby': describedBy } : {})}
          >
            {label}
          </Box>
          {shouldShowRequirement ? (
            <Tooltip content={requirementTooltip}>
              {/* The pill copy MUST reach AT (the dot alone would be a
                  colour-only signal); only the dot stays aria-hidden. */}
              <Flex data-part="field-requirement" data-requirement={requirement} align="center" gap={5}>
                <Box
                  data-part="field-requirement-dot"
                  aria-hidden
                />
                <Text data-part="field-requirement-copy" size="xs" weight="bold">
                  {requirementCopy}
                </Text>
              </Flex>
            </Tooltip>
          ) : null}
        </Flex>
        {hint ? (
          <Text data-part="field-hint" id={hintId} size="xs">
            {hint}
          </Text>
        ) : null}
      </Box>
      <InlineEditControl width={controlWidth} style={controlStyle}>
        {children}
      </InlineEditControl>
      {hasError && errorMessage ? (
        <Text
          data-part="field-error"
          id={resolvedErrorId}
          size="xs"
        >
          {errorMessage}
        </Text>
      ) : null}
    </Box>
  );
}

/* -------------------------------------------------------------------------- */
/* MoreFieldsToggle                                                          */
/* -------------------------------------------------------------------------- */

export function MoreFieldsToggle({
  expanded,
  onToggle,
  controls,
  showLabel,
  hideLabel,
  sticky = false,
  stickyOffset = 72,
  className,
  style,
}: MoreFieldsToggleProps): React.ReactElement {
  const copy = useEditFieldsCopy();
  const resolvedShowLabel = showLabel ?? copy.showMore;
  const resolvedHideLabel = hideLabel ?? copy.hideMore;

  return (
    <Box
      className={['ds-structure', 'ds-edit-fields', className].filter(Boolean).join(' ')}
      data-part="toggle"
      data-expanded={expanded}
      data-sticky={sticky}
      /* The sticky dock (position/top) is a pinned runtime value (the public
         test asserts the inline `style.position`/`style.top`), so it stays
         inline; the rest of the frame is skin-owned. */
      style={{
        ...(sticky && expanded ? { position: 'sticky', top: stickyOffset, zIndex: 1 } : null),
        ...style,
      }}
    >
      <Button
        htmlType="button"
        variant="secondary"
        size="sm"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={controls}
        aria-label={expanded ? resolvedHideLabel : resolvedShowLabel}
      >
        {expanded ? resolvedHideLabel : resolvedShowLabel}
      </Button>
    </Box>
  );
}

/* -------------------------------------------------------------------------- */
/* InlineEditFooter                                                          */
/* -------------------------------------------------------------------------- */

export function InlineEditFooter({
  children,
  summary,
  dirtySummary,
  hiddenDirtySummary,
  impactPreview,
  error,
  cancelLabel,
  saveLabel,
  onCancel,
  onSave,
  cancelDisabled,
  saveDisabled,
  isSaving,
  className,
  style,
}: InlineEditFooterProps): React.ReactElement {
  const copy = useEditFieldsCopy();
  const resolvedCancelLabel = cancelLabel ?? copy.cancel;
  const resolvedSaveLabel = saveLabel ?? copy.save;
  const hasStructuredActions = Boolean(onCancel || onSave);
  const footerSummary = error ?? dirtySummary ?? hiddenDirtySummary ?? summary;
  const hasFooterSupport = Boolean(footerSummary || impactPreview);

  return (
    <Flex
      align="center"
      justify={hasFooterSupport ? 'between' : 'end'}
      gap={8}
      wrap="wrap"
      className={['ds-structure', 'ds-edit-fields', className].filter(Boolean).join(' ')}
      data-part="footer"
      data-saving={Boolean(isSaving)}
      data-error={Boolean(error)}
      aria-live="polite"
      aria-busy={isSaving ? true : undefined}
      style={style}
    >
      {hasFooterSupport ? (
        <Stack data-part="footer-support" spacing={2}>
          {summary && error ? (
            <Text data-part="footer-note" size="xs">
              {summary}
            </Text>
          ) : null}
          {footerSummary ? (
            <Text data-part="footer-summary" size="xs">
              {footerSummary}
            </Text>
          ) : null}
          {dirtySummary && hiddenDirtySummary ? (
            <Text data-part="footer-hidden-summary" size="xs">
              {hiddenDirtySummary}
            </Text>
          ) : null}
          {impactPreview ? <Box data-part="footer-impact-preview">{impactPreview}</Box> : null}
        </Stack>
      ) : null}
      <Flex align="center" justify="end" gap={8} wrap="wrap" data-part="footer-actions">
        {hasStructuredActions ? (
          <>
            <Button
              htmlType="button"
              variant="secondary"
              size="sm"
              onClick={onCancel}
              disabled={cancelDisabled || isSaving}
            >
              {resolvedCancelLabel}
            </Button>
            <Button
              htmlType="button"
              variant="primary"
              size="sm"
              onClick={onSave}
              disabled={saveDisabled || isSaving}
              loading={isSaving}
            >
              {resolvedSaveLabel}
            </Button>
          </>
        ) : (
          children
        )}
      </Flex>
    </Flex>
  );
}
