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
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from 'react';

import { Box, Button, Flex, Stack, Text, Tooltip } from '../../../primitives';

/* -------------------------------------------------------------------------- */
/* Shared tokens                                                              */
/* -------------------------------------------------------------------------- */

const fastTransition = 'var(--ds-motion-fast) var(--ds-motion-ease-out)';
const normalTransition = 'var(--ds-motion-normal) var(--ds-motion-ease-out)';
const borderColor = 'var(--ds-color-border-secondary)';
const mutedText = 'var(--ds-color-text-muted)';

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
    <Stack spacing={0} className={className} style={{ minWidth: 0, width: '100%', ...style }}>
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
    <Box className={className} style={style}>
      {!headerless ? (
        <Flex align="start" justify="between" gap={14} wrap="wrap" style={{ paddingBottom: 14 }}>
          <Flex align="start" gap={12} style={{ minWidth: 0, flex: '1 1 420px' }}>
            {Icon ? (
              <Box
                aria-hidden
                style={{
                  width: 32,
                  height: 32,
                  flexShrink: 0,
                  display: 'grid',
                  placeItems: 'center',
                  borderRadius: 8,
                  color: 'var(--ds-color-primary)',
                  background: 'color-mix(in srgb, var(--ds-color-primary) 10%, var(--ds-surface-card, var(--ds-color-bg-elevated)))',
                  border: `1px solid color-mix(in srgb, var(--ds-color-primary) 22%, ${borderColor})`,
                }}
              >
                <Icon size={16} />
              </Box>
            ) : null}
            <Stack spacing={4} style={{ minWidth: 0 }}>
              {eyebrow ? (
                <Text
                  size="xs"
                  weight="bold"
                  style={{
                    color: mutedText,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    lineHeight: 1,
                  }}
                >
                  {eyebrow}
                </Text>
              ) : null}
              <Text weight="bold" style={{ color: 'var(--ds-color-text-primary)' }}>
                {title}
              </Text>
              {description ? (
                <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)', lineHeight: 1.45 }}>
                  {description}
                </Text>
              ) : null}
            </Stack>
          </Flex>
          {meta || actions ? (
            <Flex align="center" justify="end" gap={8} wrap="wrap" style={{ minWidth: 0, flex: '0 1 auto' }}>
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
      className={className}
      hidden={kind === 'advanced' && !expanded ? true : undefined}
      aria-hidden={kind === 'advanced' && !expanded ? true : undefined}
      style={{
        display: 'grid',
        gridTemplateColumns: columns,
        gap,
        width: '100%',
        alignItems: 'start',
        paddingBlock: 14,
        borderTop: `1px solid ${borderColor}`,
        ...style,
      }}
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
  return (
    <Box className={className} style={{ width: '100%', minWidth: 0, ...style }}>
      <Flex align="center" justify="between" gap={12} wrap="wrap" style={{ paddingBottom: 10 }}>
        <Flex align="center" gap={10} style={{ minWidth: 0, flex: '1 1 360px' }}>
          {Icon ? (
            <Box aria-hidden style={{ color: mutedText, display: 'flex' }}>
              <Icon size={15} />
            </Box>
          ) : null}
          <Stack spacing={3} style={{ minWidth: 0 }}>
            <Flex align="center" gap={8} wrap="wrap" style={{ minWidth: 0 }}>
              {sectionNumber ? (
                <Text
                  size="xs"
                  weight="bold"
                  style={{
                    color: mutedText,
                    fontFamily: 'var(--ds-font-family-mono, monospace)',
                    letterSpacing: '0.08em',
                  }}
                >
                  Section {sectionNumber}
                </Text>
              ) : null}
              <Text size="sm" weight="bold" style={{ color: 'var(--ds-color-text-primary)' }}>
                {title}
              </Text>
            </Flex>
            {description ? (
              <Text size="xs" style={{ color: mutedText, lineHeight: 1.4 }}>
                {description}
              </Text>
            ) : null}
          </Stack>
        </Flex>
        {actions ? (
          <Flex align="center" justify="end" gap={6} wrap="wrap" style={{ minWidth: 0 }}>
            {actions}
          </Flex>
        ) : null}
      </Flex>
      <Box style={contentStyle}>{children}</Box>
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
      className={className}
      style={{
        minWidth: 0,
        maxWidth: '100%',
        boxSizing: 'border-box',
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

const requirementDotColor: Record<InlineEditFieldRequirement, string> = {
  required: 'var(--ds-color-warning)',
  recommended: 'var(--ds-color-primary)',
  optional: mutedText,
};

const requirementDefaultCopy: Record<InlineEditFieldRequirement, string> = {
  required: 'Required',
  recommended: 'Recommended',
  optional: 'Optional',
};

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
  const autoId = useId();
  const hintId = hint ? `${autoId}-hint` : undefined;
  const resolvedErrorId = hasError && errorMessage ? errorMessageId ?? `${autoId}-error` : errorMessageId;
  const describedBy = [hintId, hasError ? resolvedErrorId : undefined].filter(Boolean).join(' ') || undefined;
  const shouldShowRequirement = showRequirement ?? requirement !== 'optional';
  const requirementCopy = requirementLabel ?? requirementDefaultCopy[requirement];
  const requirementTooltip =
    requirementTitle ??
    (requirement === 'required'
      ? 'Always shown. Saving depends on this value.'
      : requirement === 'recommended'
        ? 'Improves routing, reporting, or review quality. Safe to fill in later.'
        : 'Safe to leave blank.');

  return (
    <Box className={className} style={{ gridColumn: spanColumn[span], minWidth: 0, ...style }}>
      <Box
        style={{
          display: 'grid',
          gap: hint ? 3 : 0,
          marginBottom: 8,
          minWidth: 0,
        }}
      >
        <Flex align="center" gap={8} wrap="wrap">
          {fieldNumber ? (
            <Text
              aria-hidden
              size="xs"
              style={{
                color: mutedText,
                fontFamily: 'var(--ds-font-family-mono, monospace)',
                lineHeight: 1,
              }}
            >
              {fieldNumber}
            </Text>
          ) : null}
          {Icon ? (
            <Box aria-hidden style={{ color: mutedText, display: 'flex' }}>
              <Icon size={14} />
            </Box>
          ) : null}
          <Box
            as="label"
            htmlFor={htmlFor}
            style={{
              fontSize: 'var(--ds-font-size-sm, 0.875rem)',
              fontWeight: 'var(--ds-font-weight-semibold, 600)',
              color: 'var(--ds-color-text-secondary)',
              cursor: htmlFor ? 'pointer' : undefined,
            }}
            {...(hasError ? { 'aria-invalid': 'true' as const } : {})}
            {...(describedBy ? { 'aria-describedby': describedBy } : {})}
          >
            {label}
          </Box>
          {shouldShowRequirement ? (
            <Tooltip content={requirementTooltip}>
              <Flex align="center" gap={5} aria-hidden style={{ display: 'inline-flex' }}>
                <Box
                  aria-hidden
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: 999,
                    background: requirementDotColor[requirement],
                    flexShrink: 0,
                  }}
                />
                <Text size="xs" weight="bold" style={{ color: mutedText, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {requirementCopy}
                </Text>
              </Flex>
            </Tooltip>
          ) : null}
        </Flex>
        {hint ? (
          <Text id={hintId} size="xs" style={{ color: mutedText, lineHeight: 1.35, minWidth: 0 }}>
            {hint}
          </Text>
        ) : null}
      </Box>
      <InlineEditControl width={controlWidth} style={controlStyle}>
        {children}
      </InlineEditControl>
      {hasError && errorMessage ? (
        <Text
          id={resolvedErrorId}
          size="xs"
          style={{ color: 'var(--ds-color-error)', lineHeight: 1.4, marginTop: 5, display: 'block' }}
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
  showLabel = 'Show more fields',
  hideLabel = 'Hide more fields',
  sticky = false,
  stickyOffset = 72,
  className,
  style,
}: MoreFieldsToggleProps): React.ReactElement {
  return (
    <Box
      className={className}
      style={{
        display: 'flex',
        justifyContent: expanded ? 'flex-end' : 'center',
        width: '100%',
        minWidth: 0,
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
        aria-label={expanded ? hideLabel : showLabel}
        style={{ transition: `transform ${fastTransition}` }}
      >
        {expanded ? hideLabel : showLabel}
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
  cancelLabel = 'Cancel',
  saveLabel = 'Save changes',
  onCancel,
  onSave,
  cancelDisabled,
  saveDisabled,
  isSaving,
  className,
  style,
}: InlineEditFooterProps): React.ReactElement {
  const hasStructuredActions = Boolean(onCancel || onSave);
  const footerSummary = error ?? dirtySummary ?? hiddenDirtySummary ?? summary;
  const hasFooterSupport = Boolean(footerSummary || impactPreview);

  return (
    <Flex
      align="center"
      justify={hasFooterSupport ? 'between' : 'end'}
      gap={8}
      wrap="wrap"
      className={className}
      aria-live="polite"
      aria-busy={isSaving ? true : undefined}
      style={{
        paddingTop: 14,
        marginTop: 14,
        borderTop: `1px solid ${borderColor}`,
        transition: `border-color ${normalTransition}`,
        ...style,
      }}
    >
      {hasFooterSupport ? (
        <Stack spacing={2} style={{ minWidth: 0, flex: '1 1 280px' }}>
          {summary && error ? (
            <Text size="xs" style={{ color: mutedText }}>
              {summary}
            </Text>
          ) : null}
          {footerSummary ? (
            <Text size="xs" style={{ color: error ? 'var(--ds-color-error)' : mutedText }}>
              {footerSummary}
            </Text>
          ) : null}
          {dirtySummary && hiddenDirtySummary ? (
            <Text size="xs" style={{ color: mutedText }}>
              {hiddenDirtySummary}
            </Text>
          ) : null}
          {impactPreview ? <Box>{impactPreview}</Box> : null}
        </Stack>
      ) : null}
      <Flex align="center" justify="end" gap={8} wrap="wrap" style={{ minWidth: 0 }}>
        {hasStructuredActions ? (
          <>
            <Button
              htmlType="button"
              variant="secondary"
              size="sm"
              onClick={onCancel}
              disabled={cancelDisabled || isSaving}
            >
              {cancelLabel}
            </Button>
            <Button
              htmlType="button"
              variant="primary"
              size="sm"
              onClick={onSave}
              disabled={saveDisabled || isSaving}
              loading={isSaving}
            >
              {saveLabel}
            </Button>
          </>
        ) : (
          children
        )}
      </Flex>
    </Flex>
  );
}
