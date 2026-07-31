'use client';

/**
 * @fileoverview GuidedDraftFormSurface - draft-heavy create/edit flows.
 *
 * Composes: section navigation, draft recovery, template picker,
 * validation summary, submit bar, autosave status, progress indicator.
 *
 * For: job posting, event creation, candidate intake, complex forms.
 *
 * Implementation notes (2026-07-30 premium pass):
 * - Every visible string flows through `tSurfaceOr` under
 *   `surfaces.guided_draft_form.*` with an English floor.
 * - Geometry and paint live in `skin/guided-draft-form.css`. Composed
 *   primitives are retuned through their public channels (`--ds-button-*`,
 *   `--ds-card-*`) because this surface's skin sorts in `rottay-components`,
 *   BEFORE the engine skins (`rottay-engines`): declarations painted over a
 *   composed primitive would lose by layer, while channel overrides resolve
 *   per-element and hold honestly.
 * - The only inline styles left are `fontWeight` values resolved at runtime
 *   from the tenant personality (heading weight bias) — instance values, not
 *   reusable paint.
 */

import React, { useCallback, useId, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Box } from '../../../../../primitives/layout/Box';
import { Stack } from '../../../../../primitives/layout/Stack';
import { Flex } from '../../../../../primitives/layout/Flex';
import { Text } from '../../../../../primitives/display/Typography';
import { Button } from '../../../../../primitives/inputs/Button';
import { Select } from '../../../../../primitives/inputs/Select';
import { Card } from '../../../../../primitives/display/Card';
import type { CardVariant } from '../../../../../primitives/display/Card/contracts';
import { Progress } from '../../../../../primitives/feedback/Progress';
import { Skeleton } from '../../../../../primitives/feedback';
import { PatternStepWizard } from '../../../../../patterns/forms/step-wizard';
import type { WizardStep } from '../../../../../patterns/forms/step-wizard';
import { FadeIn } from '@/graphics/motion';
import { StatusDraftIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-draft';
import { StatusSuccessIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-success';
import { StatusErrorIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-error';
import { StatusWarningIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-warning';
import { WorkflowTemplateIcon } from '@/graphics/icons/presentation/semantic/generated/roles/workflow-template';
import { useBreakpoints } from '@/infrastructure/runtime/responsive/composition/react/provider/breakpoint-state';
import { useTokens } from '@/infrastructure/runtime/theming/composition/react/tokens';
import { useAdaptivePosture } from '../../../../runtime/adaptive-posture';
import { useSurfaceProfileDefaults } from '../../../../runtime/profile-defaults';
import {
  resolveStackSpacing,
  resolveHeadingFontWeight,
  SurfaceAccentBarWrapper,
} from '../../../../runtime/profile-defaults/personality';
import { useSurfaceTranslations } from '../../../../runtime/helpers/states/i18n';
import {
  SurfaceEmptyState,
  SurfaceErrorState,
} from '../../../../runtime/helpers/states';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FormSection {
  key: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  render: () => ReactNode;
  /** Whether this section has validation errors. */
  hasErrors?: boolean;
  /** Whether this section is complete. */
  isComplete?: boolean;
}

export interface FormTemplate {
  id: string;
  name: string;
  description?: string;
  icon?: ReactNode;
}

export interface ValidationIssue {
  field: string;
  message: string;
  severity: 'error' | 'warning';
  sectionKey?: string;
}

export type DraftStatus = 'unsaved' | 'saving' | 'saved' | 'error';

export interface GuidedDraftFormSurfaceProps {
  /** Form title. */
  title: string;
  /** Subtitle or description. */
  subtitle?: string;

  /** Form sections (steps or scrollable sections). */
  sections: FormSection[];

  /** Navigation mode: wizard (step by step) or scroll (all visible). */
  mode?: 'wizard' | 'scroll';

  /** Loading state: replaces the form body with a structural skeleton. */
  loading?: boolean;
  /** Error state: replaces the form body with the shared error kit. */
  error?: unknown;
  /** Retry handler rendered by the error kit. */
  onRetry?: () => void | Promise<void>;

  /** Draft status for autosave indicator. */
  draftStatus?: DraftStatus;
  /** Last saved timestamp. */
  lastSavedAt?: string;

  /** Draft recovery banner. */
  draftRecovery?: {
    hasDraft: boolean;
    onRecover: () => void;
    onDiscard: () => void;
    draftDate?: string;
  };

  /** Template picker. */
  templates?: {
    items: FormTemplate[];
    onSelect: (templateId: string) => void;
  };

  /** Validation issues. */
  validationIssues?: ValidationIssue[];

  /** Submit action. */
  onSubmit: () => void;
  /** Submit button label. */
  submitLabel?: string;
  /** Whether submit is disabled. */
  submitDisabled?: boolean;
  /** Whether submit is loading. */
  submitLoading?: boolean;

  /** Secondary actions (save draft, preview, etc.). */
  secondaryActions?: Array<{
    key: string;
    label: string;
    onClick: () => void;
    disabled?: boolean;
  }>;

  /** Header/footer slots. */
  headerSlot?: ReactNode;
  footerSlot?: ReactNode;

  /**
   * Adaptive posture config — overrides default breakpoint behavior.
   *
   * @example
   * ```ts
   * adaptive={{
   *   desktop: { formLayout: 'sidebar-nav', actionBar: 'inline' },
   *   phone: { formLayout: 'stacked', actionBar: 'sticky-bottom', compactHeader: true },
   * }}
   * ```
   */
  adaptive?: import('../../../../foundation/contracts/adaptive').AdaptiveConfig;
}

// ---------------------------------------------------------------------------
// Draft status indicator
// ---------------------------------------------------------------------------

function DraftStatusBadge({
  status,
  lastSavedAt,
}: {
  status: DraftStatus;
  lastSavedAt?: string;
}) {
  const { tSurfaceOr } = useSurfaceTranslations();
  // `role="status"` is not severity-inferred: the `DraftStatus` prop contract
  // declares these four states and this badge is their only rendering — it IS
  // a status indicator by contract, so autosave transitions are announced.
  const statusCopy: Record<DraftStatus, string> = {
    unsaved: tSurfaceOr('guided_draft_form.draft_status_unsaved', 'Unsaved changes'),
    saving: tSurfaceOr('guided_draft_form.draft_status_saving', 'Saving…'),
    saved: lastSavedAt
      ? tSurfaceOr('guided_draft_form.draft_status_saved_at', 'Saved {time}', {
          time: lastSavedAt,
        })
      : tSurfaceOr('guided_draft_form.draft_status_saved', 'Saved'),
    error: tSurfaceOr('guided_draft_form.draft_status_error', 'Save failed'),
  };
  const statusTone: Record<DraftStatus, 'warning' | 'muted' | 'success' | 'error'> = {
    unsaved: 'warning',
    saving: 'muted',
    saved: 'success',
    error: 'error',
  };

  return (
    <Flex
      data-part="draft-status"
      data-status={status}
      role="status"
      align="center"
      gap={2}
    >
      <Box data-part="draft-status-dot" data-status={status} aria-hidden="true" />
      <Text data-part="draft-status-label" size="xs" color={statusTone[status]}>
        {statusCopy[status]}
      </Text>
    </Flex>
  );
}

// ---------------------------------------------------------------------------
// Section navigation -- responsive: sidebar | pill bar | dropdown
// ---------------------------------------------------------------------------

type SectionNavLayout = 'sidebar' | 'pills' | 'dropdown';

function SectionNav({
  sections,
  activeSection,
  onSectionClick,
  headingWeight,
  layout,
  mode,
}: {
  sections: FormSection[];
  activeSection: string;
  onSectionClick: (key: string) => void;
  headingWeight: number;
  layout: SectionNavLayout;
  mode: 'wizard' | 'scroll';
}) {
  const { tSurfaceOr } = useSurfaceTranslations();
  // aria-current vocabulary follows each mode's navigation semantics: wizard
  // jumps between steps, scroll repositions the viewport location.
  const ariaCurrent = mode === 'wizard' ? ('step' as const) : ('location' as const);
  const navAriaLabel = tSurfaceOr('guided_draft_form.section_nav_aria', 'Form sections');

  // -- Mobile: dropdown select --------------------------------------------
  if (layout === 'dropdown') {
    const options = sections.map((s) => ({
      value: s.key,
      label: s.title,
      icon: s.hasErrors ? (
        <StatusErrorIcon decorative size={14} />
      ) : s.isComplete ? (
        <StatusSuccessIcon decorative size={14} />
      ) : undefined,
    }));

    return (
      <Box
        as="nav"
        data-part="section-nav"
        data-layout="dropdown"
        aria-label={navAriaLabel}
      >
        <Text
          data-part="section-nav-label"
          size="xs"
          weight="semibold"
          color="muted"
          style={{ fontWeight: headingWeight }}
        >
          {tSurfaceOr('guided_draft_form.section_nav_label', 'Section')}
        </Text>
        <Box data-part="section-nav-select">
          <Select
            options={options}
            value={activeSection}
            onChange={(value) => {
              if (typeof value === 'string') onSectionClick(value);
            }}
            size="sm"
            aria-label={navAriaLabel}
          />
        </Box>
      </Box>
    );
  }

  // -- Tablet: horizontal scrollable pill bar -----------------------------
  if (layout === 'pills') {
    return (
      <Box
        as="nav"
        data-part="section-nav"
        data-layout="pills"
        aria-label={navAriaLabel}
      >
        <Text
          data-part="section-nav-label"
          size="xs"
          weight="semibold"
          color="muted"
          style={{ fontWeight: headingWeight }}
        >
          {tSurfaceOr('guided_draft_form.section_nav_label_plural', 'Sections')}
        </Text>
        <Flex data-part="section-nav-list" gap={2} align="center">
          {sections.map((section) => {
            const isActive = activeSection === section.key;
            return (
              <Button
                key={section.key}
                className="ds-guided-draft-form__section-nav-item"
                data-active={isActive}
                data-errors={Boolean(section.hasErrors)}
                data-complete={Boolean(section.isComplete)}
                aria-current={isActive ? ariaCurrent : undefined}
                variant="ghost"
                size="sm"
                onClick={() => onSectionClick(section.key)}
              >
                <Flex align="center" gap={1}>
                  {section.icon && (
                    <Box data-part="section-nav-item-icon" aria-hidden="true">
                      {section.icon}
                    </Box>
                  )}
                  <Text data-part="section-nav-item-label" size="sm" color="inherit">
                    {section.title}
                  </Text>
                  {section.isComplete && <StatusSuccessIcon decorative size={14} />}
                  {section.hasErrors && (
                    <Box data-part="section-nav-item-error-dot" aria-hidden="true" />
                  )}
                </Flex>
              </Button>
            );
          })}
        </Flex>
      </Box>
    );
  }

  // -- Desktop: vertical sticky sidebar -----------------------------------
  return (
    <Box
      as="nav"
      data-part="section-nav"
      data-layout="sidebar"
      aria-label={navAriaLabel}
    >
      <Text
        data-part="section-nav-label"
        size="xs"
        weight="semibold"
        color="muted"
        style={{ fontWeight: headingWeight }}
      >
        {tSurfaceOr('guided_draft_form.section_nav_label_plural', 'Sections')}
      </Text>
      <Stack data-part="section-nav-list" spacing="xs">
        {sections.map((section) => {
          const isActive = activeSection === section.key;
          return (
            <Button
              key={section.key}
              className="ds-guided-draft-form__section-nav-item"
              data-active={isActive}
              data-errors={Boolean(section.hasErrors)}
              data-complete={Boolean(section.isComplete)}
              aria-current={isActive ? ariaCurrent : undefined}
              variant="ghost"
              size="sm"
              onClick={() => onSectionClick(section.key)}
            >
              <Flex data-part="section-nav-item-row" align="center" gap={2}>
                <Flex data-part="section-nav-item-main" align="center" gap={2}>
                  {section.icon && (
                    <Box data-part="section-nav-item-icon" aria-hidden="true">
                      {section.icon}
                    </Box>
                  )}
                  <Text data-part="section-nav-item-label" size="sm" color="inherit">
                    {section.title}
                  </Text>
                </Flex>
                {section.isComplete && <StatusSuccessIcon decorative size={14} />}
                {section.hasErrors && (
                  <Box data-part="section-nav-item-error-dot" aria-hidden="true" />
                )}
              </Flex>
            </Button>
          );
        })}
      </Stack>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Template picker card -- the Card itself is the trigger (real button
// semantics: role/tabIndex/keydown come from the Card's actionable contract).
// ---------------------------------------------------------------------------

function TemplateCard({
  template,
  onSelect,
  cardVariant,
}: {
  template: FormTemplate;
  onSelect: () => void;
  cardVariant: CardVariant;
}) {
  return (
    <Card
      className="ds-guided-draft-form__template-card"
      variant={cardVariant}
      hoverable
      clickable
      onClick={onSelect}
    >
      <Card.Body>
        <Stack spacing="xs">
          {template.icon && (
            <Box data-part="template-card-icon" aria-hidden="true">
              {template.icon}
            </Box>
          )}
          <Text data-part="template-card-title" size="sm" weight="semibold" as="p">
            {template.name}
          </Text>
          {template.description && (
            <Text data-part="template-card-description" size="xs" color="muted" as="p">
              {template.description}
            </Text>
          )}
        </Stack>
      </Card.Body>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Section card (scroll mode) -- single implementation shared by the stacked
// and side-by-side content layouts.
// ---------------------------------------------------------------------------

function GuidedDraftFormSectionCard({
  section,
  isActive,
  cardVariant,
  headingWeight,
  completeLabel,
  errorsLabel,
}: {
  section: FormSection;
  isActive: boolean;
  cardVariant: CardVariant;
  headingWeight: number;
  completeLabel: string;
  errorsLabel: string;
}) {
  return (
    <Card
      className={[
        'ds-guided-draft-form__section-card',
        isActive ? 'ds-guided-draft-form__section-card--active' : '',
        section.isComplete ? 'ds-guided-draft-form__section-card--complete' : '',
        section.hasErrors ? 'ds-guided-draft-form__section-card--errors' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      variant={cardVariant}
      id={`section-${section.key}`}
    >
      <Card.Body>
        <Stack spacing="sm">
          <Box data-part="section-card-header">
            <Flex align="center" gap={2}>
              {section.icon && (
                <Box data-part="section-card-icon" aria-hidden="true">
                  {section.icon}
                </Box>
              )}
              <Text
                data-part="section-card-title"
                size="md"
                weight="semibold"
                style={{ fontWeight: headingWeight }}
              >
                {section.title}
              </Text>
              {section.isComplete && (
                <Flex data-part="section-card-complete" align="center" gap={1}>
                  <StatusSuccessIcon decorative size={14} />
                  <Text size="xs" color="success">
                    {completeLabel}
                  </Text>
                </Flex>
              )}
              {section.hasErrors && (
                <Flex data-part="section-card-errors" align="center" gap={1}>
                  <StatusErrorIcon decorative size={14} />
                  <Text size="xs" color="error">
                    {errorsLabel}
                  </Text>
                </Flex>
              )}
            </Flex>
            {section.description && (
              <Text data-part="section-card-description" size="sm" color="muted" as="p">
                {section.description}
              </Text>
            )}
          </Box>
          {section.render()}
        </Stack>
      </Card.Body>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Loading skeleton -- mirrors the section-card anatomy so the swap to real
// content does not shift layout.
// ---------------------------------------------------------------------------

function FormLoadingSkeleton({
  cardVariant,
  sectionSpacing,
}: {
  cardVariant: CardVariant;
  sectionSpacing: 'sm' | 'md' | 'lg';
}) {
  const tokens = useTokens();
  const { prefersReducedMotion } = useBreakpoints();
  // Same animation governance as the shared states kit: reduced motion or a
  // calm personality falls back to pulse.
  const skeletonAnimation =
    prefersReducedMotion || tokens.personality.animation.skeletonStyle === 'pulse'
      ? 'pulse'
      : 'wave';

  return (
    <Stack data-part="loading-skeleton" spacing={sectionSpacing}>
      {[0, 1].map((index) => (
        <Card
          key={index}
          className="ds-guided-draft-form__section-card"
          variant={cardVariant}
        >
          <Card.Body>
            <Stack spacing="sm">
              <Box data-part="loading-skeleton-title">
                <Skeleton variant="text" rows={1} animation={skeletonAnimation} active />
              </Box>
              <Skeleton variant="text" rows={3} animation={skeletonAnimation} active />
            </Stack>
          </Card.Body>
        </Card>
      ))}
    </Stack>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function GuidedDraftFormSurface(props: GuidedDraftFormSurfaceProps) {
  const {
    title,
    subtitle,
    sections,
    mode = 'scroll',
    loading = false,
    error,
    onRetry,
    draftStatus,
    lastSavedAt,
    draftRecovery,
    templates,
    validationIssues,
    onSubmit,
    submitLabel,
    submitDisabled,
    submitLoading,
    secondaryActions,
    headerSlot,
    footerSlot,
    adaptive,
  } = props;

  const { tSurfaceOr } = useSurfaceTranslations();
  const profileDefaults = useSurfaceProfileDefaults();
  const { isMobile, isTablet, prefersReducedMotion } = useBreakpoints();
  const sectionSpacing = resolveStackSpacing(profileDefaults.sectionSpacing);
  const headingWeight = resolveHeadingFontWeight(profileDefaults.headerWeight);

  // Adaptive posture resolution
  const posture = useAdaptivePosture(adaptive);

  // Responsive layout: adaptive override -> breakpoint defaults
  const formLayoutMap: Record<string, SectionNavLayout> = {
    'stacked': 'dropdown',
    'dropdown-nav': 'dropdown',
    'pill-nav': 'pills',
    'sidebar-nav': 'sidebar',
  };
  const sectionNavLayout: SectionNavLayout = posture.formLayout
    ? (formLayoutMap[posture.formLayout] ?? 'sidebar')
    : isMobile
    ? 'dropdown'
    : isTablet
      ? 'pills'
      : 'sidebar';
  const shouldStack = isMobile || isTablet;
  // Action bar posture: sticky-bottom (default) | inline | floating.
  const actionBarPosture = posture.actionBar ?? 'sticky-bottom';
  const compactHeader = Boolean(posture.compactHeader);

  const [activeSection, setActiveSection] = useState(sections[0]?.key ?? '');
  const [showTemplates, setShowTemplates] = useState(false);
  const templatePickerId = useId();

  const errorCount = validationIssues?.filter((v) => v.severity === 'error').length ?? 0;
  const warningCount =
    validationIssues?.filter((v) => v.severity === 'warning').length ?? 0;

  // Progress indicator: percentage of completed sections
  const completedCount = sections.filter((s) => s.isComplete).length;
  const progressPercent =
    sections.length > 0 ? Math.round((completedCount / sections.length) * 100) : 0;
  const showProgress = sections.some((s) => s.isComplete !== undefined);

  // Map FormSection[] to WizardStep[] for PatternStepWizard composition
  const wizardSteps: WizardStep[] = useMemo(
    () =>
      sections.map((section) => ({
        key: section.key,
        title: section.title,
        description: section.description,
        icon: section.icon,
        content: section.render(),
      })),
    [sections],
  );

  // Derive current wizard step index from activeSection key
  const activeStepIndex = useMemo(
    () => Math.max(0, sections.findIndex((s) => s.key === activeSection)),
    [sections, activeSection],
  );

  // Handle section navigation -- scrolls in scroll mode, jumps in wizard mode.
  // Smooth scrolling honors reduced motion (instant jump when preferred).
  const handleSectionClick = useCallback(
    (key: string) => {
      setActiveSection(key);
      if (mode === 'scroll') {
        document
          .getElementById(`section-${key}`)
          ?.scrollIntoView({
            behavior: prefersReducedMotion ? 'auto' : 'smooth',
            block: 'start',
          });
      }
    },
    [mode, prefersReducedMotion],
  );

  // Sync activeSection when PatternStepWizard changes step
  const handleWizardStepChange = useCallback(
    (stepIndex: number) => {
      const section = sections[stepIndex];
      if (section) {
        setActiveSection(section.key);
      }
    },
    [sections],
  );

  const resolvedSubmitLabel =
    submitLabel ?? tSurfaceOr('guided_draft_form.submit', 'Submit');
  const submittingLabel = tSurfaceOr('guided_draft_form.submitting', 'Submitting…');

  const hasError = error !== undefined && error !== null;
  const isEmpty = sections.length === 0;
  // Full chrome (recovery, progress, draft status, templates, validation,
  // submit bar) only renders once the form itself is present.
  const showFullChrome = !loading && !hasError && !isEmpty;

  const sectionKeys = useMemo(() => new Set(sections.map((s) => s.key)), [sections]);

  const completeLabel = tSurfaceOr(
    'guided_draft_form.section_state_complete',
    'Complete',
  );
  const sectionErrorsLabel = tSurfaceOr(
    'guided_draft_form.section_state_errors',
    'Has errors',
  );

  const sectionCards = (
    <Stack spacing={sectionSpacing}>
      {sections.map((section) => (
        <GuidedDraftFormSectionCard
          key={section.key}
          section={section}
          isActive={activeSection === section.key}
          cardVariant={profileDefaults.cardVariant}
          headingWeight={headingWeight}
          completeLabel={completeLabel}
          errorsLabel={sectionErrorsLabel}
        />
      ))}
    </Stack>
  );

  const wizardContent = (
    <PatternStepWizard
      steps={wizardSteps}
      currentStep={activeStepIndex}
      onStepChange={handleWizardStepChange}
      onComplete={onSubmit}
      completeLabel={resolvedSubmitLabel}
      completeDisabled={submitDisabled || submitLoading}
      actionsDisabled={submitLoading}
      showProgress={false}
      showCompleteAction={false}
      orientation="horizontal"
    />
  );

  const formBody = (
    <>
      {/* Content: section nav + form body */}
      {shouldStack ? (
        // Tablet / Mobile: stack vertically -- nav on top, form below
        <Stack data-part="content" data-layout="stacked" spacing={sectionSpacing}>
          <SectionNav
            sections={sections}
            activeSection={activeSection}
            onSectionClick={handleSectionClick}
            headingWeight={headingWeight}
            layout={sectionNavLayout}
            mode={mode}
          />
          <Box data-part="content-body">
            {mode === 'wizard' ? wizardContent : sectionCards}
          </Box>
        </Stack>
      ) : (
        // Desktop: side-by-side layout with sidebar
        <Flex data-part="content" data-layout="sidebar" gap={5}>
          <SectionNav
            sections={sections}
            activeSection={activeSection}
            onSectionClick={handleSectionClick}
            headingWeight={headingWeight}
            layout="sidebar"
            mode={mode}
          />
          <Box data-part="content-body">
            {mode === 'wizard' ? wizardContent : sectionCards}
          </Box>
        </Flex>
      )}

      {/* Validation summary */}
      {validationIssues && validationIssues.length > 0 && (
        <Card
          className={[
            'ds-guided-draft-form__validation-summary',
            errorCount > 0
              ? 'ds-guided-draft-form__validation-summary--error'
              : 'ds-guided-draft-form__validation-summary--warning',
          ].join(' ')}
          variant={profileDefaults.cardVariant}
        >
          <Card.Body>
            <Stack spacing="sm">
              <Flex data-part="validation-summary-header" align="center" gap={2}>
                {errorCount > 0 ? (
                  <StatusErrorIcon decorative size={16} />
                ) : (
                  <StatusWarningIcon decorative size={16} />
                )}
                <Text data-part="validation-summary-title" size="sm" weight="semibold">
                  {[
                    errorCount > 0
                      ? tSurfaceOr(
                          'guided_draft_form.validation_summary_errors',
                          'Errors: {count}',
                          { count: errorCount },
                        )
                      : '',
                    warningCount > 0
                      ? tSurfaceOr(
                          'guided_draft_form.validation_summary_warnings',
                          'Warnings: {count}',
                          { count: warningCount },
                        )
                      : '',
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </Text>
              </Flex>
              <Box role="list" data-part="validation-issue-list">
                <Stack spacing="xs">
                  {validationIssues.slice(0, 5).map((issue, i) => {
                    const navigable =
                      issue.sectionKey !== undefined && sectionKeys.has(issue.sectionKey);
                    return (
                      <Box
                        role="listitem"
                        key={`${issue.field}-${i}`}
                        data-part="validation-issue"
                        data-severity={issue.severity}
                      >
                        <Flex align="start" gap={2}>
                          <Box
                            data-part="validation-issue-dot"
                            data-severity={issue.severity}
                            aria-hidden="true"
                          />
                          <Text data-part="validation-issue-message" size="xs" color="secondary">
                            {navigable ? (
                              <Button
                                variant="link"
                                size="xs"
                                className="ds-guided-draft-form__validation-issue-link"
                                onClick={() => handleSectionClick(issue.sectionKey as string)}
                              >
                                {issue.field}
                              </Button>
                            ) : (
                              <Text
                                as="span"
                                data-part="validation-issue-field"
                                size="xs"
                                weight="medium"
                                color={issue.severity === 'error' ? 'error' : 'warning'}
                              >
                                {issue.field}
                              </Text>
                            )}
                            {': '}
                            {issue.message}
                          </Text>
                        </Flex>
                      </Box>
                    );
                  })}
                </Stack>
              </Box>
              {validationIssues.length > 5 && (
                <Text data-part="validation-issue-overflow" size="xs" color="muted" as="p">
                  {tSurfaceOr(
                    'guided_draft_form.validation_issue_overflow',
                    'Additional issues: {count}',
                    { count: validationIssues.length - 5 },
                  )}
                </Text>
              )}
            </Stack>
          </Card.Body>
        </Card>
      )}

      {/* Submit bar (sticky by default; posture-driven) */}
      <Box data-part="submit-bar" data-action-bar={actionBarPosture}>
        <Box data-part="submit-bar-panel">
          {isMobile ? (
            // Mobile: stacked, full-width actions
            <Stack spacing="sm">
              {showProgress && (
                <Text data-part="submit-bar-progress" size="xs" color="muted" as="p">
                  {tSurfaceOr(
                    'guided_draft_form.submit_bar_progress',
                    'Sections complete: {completed} of {total}',
                    { completed: completedCount, total: sections.length },
                  )}
                </Text>
              )}
              <Button
                variant="primary"
                className="ds-guided-draft-form__submit-primary"
                onClick={onSubmit}
                disabled={submitDisabled || submitLoading}
                loading={submitLoading}
              >
                {submitLoading ? submittingLabel : resolvedSubmitLabel}
              </Button>
              {secondaryActions && secondaryActions.length > 0 && (
                <Flex data-part="submit-bar-secondary" gap={2}>
                  {secondaryActions.map((action) => (
                    <Button
                      key={action.key}
                      variant="secondary"
                      className="ds-guided-draft-form__submit-secondary"
                      onClick={action.onClick}
                      disabled={action.disabled}
                    >
                      {action.label}
                    </Button>
                  ))}
                </Flex>
              )}
            </Stack>
          ) : (
            // Tablet / Desktop: progress left, actions right
            <Flex align="center" justify="between" gap={3}>
              {showProgress ? (
                <Text data-part="submit-bar-progress" size="xs" color="muted">
                  {tSurfaceOr(
                    'guided_draft_form.submit_bar_progress',
                    'Sections complete: {completed} of {total}',
                    { completed: completedCount, total: sections.length },
                  )}
                </Text>
              ) : (
                <Box data-part="submit-bar-progress-placeholder" aria-hidden="true" />
              )}
              <Flex data-part="submit-bar-actions" align="center" gap={2}>
                {secondaryActions?.map((action) => (
                  <Button
                    key={action.key}
                    variant="secondary"
                    className="ds-guided-draft-form__submit-secondary"
                    onClick={action.onClick}
                    disabled={action.disabled}
                  >
                    {action.label}
                  </Button>
                ))}
                <Button
                  variant="primary"
                  className="ds-guided-draft-form__submit-primary"
                  onClick={onSubmit}
                  disabled={submitDisabled || submitLoading}
                  loading={submitLoading}
                >
                  {submitLoading ? submittingLabel : resolvedSubmitLabel}
                </Button>
              </Flex>
            </Flex>
          )}
        </Box>
      </Box>
    </>
  );

  const content = (
    <Stack
      className="ds-surface ds-guided-draft-form"
      data-part="root"
      data-mode={mode}
      data-mobile={isMobile ? 'true' : 'false'}
      data-loading={loading ? 'true' : 'false'}
      aria-busy={loading || undefined}
      spacing={sectionSpacing}
    >
      {headerSlot}

      {/* Draft recovery banner */}
      {showFullChrome && draftRecovery?.hasDraft && (
        <Card
          className="ds-guided-draft-form__draft-recovery"
          variant={profileDefaults.cardVariant}
        >
          <Card.Body>
            <Flex align="center" gap={3} wrap="wrap">
              <Box data-part="draft-recovery-icon" aria-hidden="true">
                <StatusDraftIcon decorative size={16} />
              </Box>
              <Box data-part="draft-recovery-copy">
                <Text data-part="draft-recovery-title" size="sm" weight="medium" as="p">
                  {tSurfaceOr(
                    'guided_draft_form.draft_recovery_title',
                    'Unsaved draft found',
                  )}
                </Text>
                <Text data-part="draft-recovery-description" size="xs" color="muted" as="p">
                  {draftRecovery.draftDate
                    ? tSurfaceOr(
                        'guided_draft_form.draft_recovery_description_date',
                        'Last edited {date}',
                        { date: draftRecovery.draftDate },
                      )
                    : tSurfaceOr(
                        'guided_draft_form.draft_recovery_description',
                        'Your work from a previous session is waiting.',
                      )}
                </Text>
              </Box>
              <Flex data-part="draft-recovery-actions" gap={2}>
                <Button size="sm" variant="primary" onClick={draftRecovery.onRecover}>
                  {tSurfaceOr('guided_draft_form.draft_recovery_recover', 'Recover')}
                </Button>
                <Button size="sm" variant="ghost" onClick={draftRecovery.onDiscard}>
                  {tSurfaceOr('guided_draft_form.draft_recovery_discard', 'Discard')}
                </Button>
              </Flex>
            </Flex>
          </Card.Body>
        </Card>
      )}

      {/* Title bar with progress */}
      <Flex
        data-part="title-bar"
        align={isMobile ? 'stretch' : 'center'}
        gap={3}
        direction={isMobile ? 'column' : 'row'}
        wrap={isTablet ? 'wrap' : undefined}
      >
        <Box data-part="title-copy">
          <Text
            data-part="title"
            size="xl"
            weight="semibold"
            as="p"
            style={{ fontWeight: headingWeight }}
          >
            {title}
          </Text>
          {subtitle && !compactHeader && (
            <Text data-part="subtitle" size="sm" color="muted" as="p">
              {subtitle}
            </Text>
          )}
        </Box>
        {showFullChrome && showProgress && (
          <Flex data-part="progress" align="center" gap={2}>
            <Box data-part="progress-bar">
              <Progress percent={progressPercent} strokeWidth={4} showInfo={false} />
            </Box>
            <Text data-part="progress-count" size="xs" color="muted">
              {tSurfaceOr('guided_draft_form.progress_count', '{completed}/{total}', {
                completed: completedCount,
                total: sections.length,
              })}
            </Text>
          </Flex>
        )}
        {showFullChrome && draftStatus && (
          <DraftStatusBadge status={draftStatus} lastSavedAt={lastSavedAt} />
        )}
        {showFullChrome && templates && (
          <Button
            size="sm"
            variant="secondary"
            className="ds-guided-draft-form__templates-toggle"
            icon={<WorkflowTemplateIcon decorative size={16} />}
            aria-expanded={showTemplates}
            aria-controls={templatePickerId}
            onClick={() => setShowTemplates(!showTemplates)}
          >
            {showTemplates
              ? tSurfaceOr('guided_draft_form.templates_toggle_hide', 'Hide templates')
              : tSurfaceOr('guided_draft_form.templates_toggle_show', 'Templates')}
          </Button>
        )}
      </Flex>

      {/* Template picker */}
      {showFullChrome && showTemplates && templates && (
        <Box
          data-part="template-picker"
          id={templatePickerId}
          role="region"
          aria-label={tSurfaceOr(
            'guided_draft_form.template_picker_aria',
            'Form templates',
          )}
        >
          {templates.items.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onSelect={() => {
                templates.onSelect(template.id);
                setShowTemplates(false);
              }}
              cardVariant={profileDefaults.cardVariant}
            />
          ))}
        </Box>
      )}

      {/* Body: error kit | structural skeleton | empty kit | form */}
      {hasError ? (
        <SurfaceErrorState error={error} onRetry={onRetry} />
      ) : loading ? (
        <FormLoadingSkeleton
          cardVariant={profileDefaults.cardVariant}
          sectionSpacing={sectionSpacing}
        />
      ) : isEmpty ? (
        <SurfaceEmptyState
          title={tSurfaceOr(
            'guided_draft_form.empty_sections_title',
            'No form sections',
          )}
          description={tSurfaceOr(
            'guided_draft_form.empty_sections_description',
            'This form does not have any sections configured yet.',
          )}
        />
      ) : (
        formBody
      )}

      {footerSlot}
    </Stack>
  );

  return (
    <SurfaceAccentBarWrapper defaults={profileDefaults}>
      {profileDefaults.animateEntrance ? (
        <FadeIn durationMs={profileDefaults.entranceDuration}>{content}</FadeIn>
      ) : (
        content
      )}
    </SurfaceAccentBarWrapper>
  );
}
