'use client';

/**
 * @fileoverview GuidedDraftFormSurface - draft-heavy create/edit flows.
 *
 * Composes: section navigation, draft recovery, template picker,
 * validation summary, submit bar, autosave status, progress indicator.
 *
 * For: job posting, event creation, candidate intake, complex forms.
 */

import React, { useState, useMemo, useCallback } from 'react';
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
import { PatternStepWizard } from '../../../../../patterns/forms/step-wizard';
import type { WizardStep } from '../../../../../patterns/forms/step-wizard';
import { FadeIn } from '@/graphics/motion';
import { useBreakpoints } from '@/infrastructure/runtime/responsive/composition/react/provider/breakpoint-state';
import { useAdaptivePosture } from '../../../../runtime/adaptive-posture';
import { useSurfaceProfileDefaults } from '../../../../runtime/profile-defaults';
import {
  resolveStackSpacing,
  resolveHeadingFontWeight,
  SurfaceAccentBarWrapper,
} from '../../../../runtime/profile-defaults/personality';

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

function DraftStatusBadge({ status, lastSavedAt }: { status: DraftStatus; lastSavedAt?: string }) {
  // Copy only. The dot and label take their colour from `data-status` in
  // `foundation/tokens/css/presentation/components/skin/guided-draft-form.css`.
  const statusLabel: Record<DraftStatus, string> = {
    unsaved: 'Unsaved changes',
    saving: 'Saving...',
    saved: lastSavedAt ? `Saved ${lastSavedAt}` : 'Saved',
    error: 'Save failed',
  };

  return (
    <Flex
      data-part="draft-status"
      data-status={status}
      align="center"
      gap={2}
      style={{
        padding: '4px 10px',
      }}
    >
      <Box
        data-part="draft-status-dot"
        data-status={status}
        style={{
          width: 6,
          height: 6,
          flexShrink: 0,
        }}
      />
      <Text data-part="draft-status-label" size="xs" style={{ whiteSpace: 'nowrap' }}>{statusLabel[status]}</Text>
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
}: {
  sections: FormSection[];
  activeSection: string;
  onSectionClick: (key: string) => void;
  headingWeight: number;
  layout: SectionNavLayout;
}) {
  // -- Mobile: dropdown select --------------------------------------------
  if (layout === 'dropdown') {
    const options = sections.map((s) => ({
      value: s.key,
      label: `${s.hasErrors ? '! ' : s.isComplete ? '\u2713 ' : ''}${s.title}`,
    }));

    return (
      <Box data-part="section-nav" data-layout="dropdown" style={{ marginBottom: 4 }}>
        <Text
          data-part="section-nav-label"
          size="xs"
          weight="semibold"
          style={{
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: 8,
            fontWeight: headingWeight,
          }}
        >
          Section
        </Text>
        <Select
          options={options}
          value={activeSection}
          onChange={(value) => {
            if (typeof value === 'string') onSectionClick(value);
          }}
          size="sm"
          style={{ width: '100%' }}
        />
      </Box>
    );
  }

  // -- Tablet: horizontal scrollable pill bar -----------------------------
  if (layout === 'pills') {
    return (
      <Box data-part="section-nav" data-layout="pills" style={{ marginBottom: 4 }}>
        <Text
          data-part="section-nav-label"
          size="xs"
          weight="semibold"
          style={{
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: 8,
            fontWeight: headingWeight,
          }}
        >
          Sections
        </Text>
        <Flex
          data-part="section-nav-list"
          gap={2}
          align="center"
          style={{
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
            paddingBottom: 4,
          }}
        >
          {sections.map((section) => {
            const isActive = activeSection === section.key;
            return (
              <Button
                key={section.key}
                className="ds-guided-draft-form__section-nav-item"
                data-active={isActive}
                data-errors={Boolean(section.hasErrors)}
                data-complete={Boolean(section.isComplete)}
                variant="ghost"
                size="sm"
                onClick={() => onSectionClick(section.key)}
                style={{
                  fontWeight: isActive ? 600 : 400,
                  whiteSpace: 'nowrap',
                  padding: '6px 14px',
                  flexShrink: 0,
                  transition: 'all 150ms ease',
                }}
              >
                <Flex align="center" gap={1}>
                  {section.icon && (
                    <Box data-part="section-nav-item-icon" style={{ flexShrink: 0, opacity: isActive ? 1 : 0.7 }}>
                      {section.icon}
                    </Box>
                  )}
                  <Text data-part="section-nav-item-label" size="sm" style={{ whiteSpace: 'nowrap' }}>
                    {section.title}
                  </Text>
                  {section.isComplete && (
                    <Text data-part="section-nav-item-complete" size="xs" style={{ flexShrink: 0 }}>
                      ✓
                    </Text>
                  )}
                  {section.hasErrors && (
                    <Box
                      data-part="section-nav-item-error-dot"
                      style={{
                        width: 6,
                        height: 6,
                        flexShrink: 0,
                      }}
                    />
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
      data-part="section-nav"
      data-layout="sidebar"
      style={{
        width: 220,
        minWidth: 180,
        maxWidth: 260,
        flexShrink: 0,
        flexGrow: 0,
        position: 'sticky',
        top: 16,
        alignSelf: 'flex-start',
      }}
    >
      <Text
        data-part="section-nav-label"
        size="xs"
        weight="semibold"
        style={{
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: 12,
          paddingLeft: 14,
          fontWeight: headingWeight,
        }}
      >
        Sections
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
              variant="ghost"
              size="sm"
              onClick={() => onSectionClick(section.key)}
              style={{
                fontWeight: isActive ? 600 : 400,
                justifyContent: 'flex-start',
                width: '100%',
                padding: '8px 12px',
                transition: 'all 150ms ease',
              }}
            >
              <Flex align="center" gap={2} style={{ width: '100%' }}>
                <Flex align="center" gap={2} style={{ flex: 1, minWidth: 0 }}>
                  {section.icon && (
                    <Box data-part="section-nav-item-icon" style={{ flexShrink: 0, opacity: isActive ? 1 : 0.7 }}>
                      {section.icon}
                    </Box>
                  )}
                  <Text
                    data-part="section-nav-item-label"
                    size="sm"
                    style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {section.title}
                  </Text>
                </Flex>
                {section.isComplete && (
                  <Text data-part="section-nav-item-complete" size="xs" style={{ flexShrink: 0 }}>
                    ✓
                  </Text>
                )}
                {section.hasErrors && (
                  <Box
                    data-part="section-nav-item-error-dot"
                    style={{
                      width: 6,
                      height: 6,
                      flexShrink: 0,
                    }}
                  />
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
// Template picker card
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
      style={{
        cursor: 'pointer',
        transition: 'all 150ms ease',
      }}
    >
      <Card.Body>
        <Button
          className="ds-guided-draft-form__template-card-trigger"
          variant="ghost"
          onClick={onSelect}
          style={{
            padding: 0,
            textAlign: 'left',
            height: 'auto',
            whiteSpace: 'normal',
            display: 'block',
            width: '100%',
          }}
        >
          <Stack spacing="xs">
            {template.icon && (
              <Box
                data-part="template-card-icon"
                style={{
                  fontSize: 24,
                  marginBottom: 4,
                }}
              >
                {template.icon}
              </Box>
            )}
            <Text data-part="template-card-title" size="sm" weight="semibold">
              {template.name}
            </Text>
            {template.description && (
              <Text data-part="template-card-description" size="xs">
                {template.description}
              </Text>
            )}
          </Stack>
        </Button>
      </Card.Body>
    </Card>
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
    draftStatus,
    lastSavedAt,
    draftRecovery,
    templates,
    validationIssues,
    onSubmit,
    submitLabel = 'Submit',
    submitDisabled,
    submitLoading,
    secondaryActions,
    headerSlot,
    footerSlot,
    adaptive,
  } = props;

  const profileDefaults = useSurfaceProfileDefaults();
  const { isMobile, isTablet } = useBreakpoints();
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

  const [activeSection, setActiveSection] = useState(sections[0]?.key ?? '');
  const [showTemplates, setShowTemplates] = useState(false);

  const errorCount = validationIssues?.filter(v => v.severity === 'error').length ?? 0;
  const warningCount = validationIssues?.filter(v => v.severity === 'warning').length ?? 0;

  // Progress indicator: percentage of completed sections
  const completedCount = sections.filter((s) => s.isComplete).length;
  const progressPercent = sections.length > 0 ? Math.round((completedCount / sections.length) * 100) : 0;
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

  // Handle sidebar section click -- scrolls in scroll mode
  const handleSectionClick = useCallback(
    (key: string) => {
      setActiveSection(key);
      if (mode === 'scroll') {
        document.getElementById(`section-${key}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },
    [mode],
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

  const content = (
    <Stack className="ds-surface ds-guided-draft-form" data-part="root" data-mode={mode} spacing={sectionSpacing}>
      {headerSlot}

      {/* Draft recovery banner */}
      {draftRecovery?.hasDraft && (
        <Card
          className="ds-guided-draft-form__draft-recovery"
          variant={profileDefaults.cardVariant}
        >
          <Card.Body>
            <Flex align="center" gap={3}>
              <Box
                data-part="draft-recovery-icon"
                style={{
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontSize: 14,
                }}
              >
                ↻
              </Box>
              <Box style={{ flex: 1 }}>
                <Text data-part="draft-recovery-title" size="sm" weight="medium">
                  Unsaved draft found
                </Text>
                <Text data-part="draft-recovery-description" size="xs">
                  {draftRecovery.draftDate
                    ? `Last edited ${draftRecovery.draftDate}`
                    : 'You have an unsaved draft.'}
                </Text>
              </Box>
              <Flex gap={2}>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={draftRecovery.onRecover}
                >
                  Recover
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={draftRecovery.onDiscard}
                >
                  Discard
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
        style={{
          flexDirection: isMobile ? 'column' : 'row',
          flexWrap: isTablet ? 'wrap' : undefined,
        }}
      >
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Text
            data-part="title"
            size="xl"
            weight="semibold"
            style={{ fontWeight: headingWeight }}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              data-part="subtitle"
              size="sm"
              style={{ marginTop: 2 }}
            >
              {subtitle}
            </Text>
          )}
        </Box>
        {showProgress && (
          <Flex data-part="progress" align="center" gap={2} style={{ minWidth: 120 }}>
            <Progress
              percent={progressPercent}
              strokeWidth={4}
              showInfo={false}
              style={{ flex: 1 }}
            />
            <Text data-part="progress-count" size="xs" style={{ whiteSpace: 'nowrap' }}>
              {completedCount}/{sections.length}
            </Text>
          </Flex>
        )}
        {draftStatus && <DraftStatusBadge status={draftStatus} lastSavedAt={lastSavedAt} />}
        {templates && (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setShowTemplates(!showTemplates)}
            style={isMobile ? { width: '100%' } : undefined}
          >
            {showTemplates ? 'Hide templates' : 'Templates'}
          </Button>
        )}
      </Flex>

      {/* Template picker */}
      {showTemplates && templates && (
        <Box
          data-part="template-picker"
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile
              ? '1fr'
              : 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 12,
          }}
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
          />
          <Box data-part="content-body" style={{ minWidth: 0 }}>
            {mode === 'wizard' ? (
              <PatternStepWizard
                steps={wizardSteps}
                currentStep={activeStepIndex}
                onStepChange={handleWizardStepChange}
                onComplete={onSubmit}
                completeLabel={submitLabel}
                completeDisabled={submitDisabled || submitLoading}
                actionsDisabled={submitLoading}
                showProgress={false}
                showCompleteAction={false}
                orientation="horizontal"
              />
            ) : (
              <Stack spacing={sectionSpacing}>
                {sections.map((section) => (
                  <Card
                    key={section.key}
                    className={[
                      'ds-guided-draft-form__section-card',
                      activeSection === section.key ? 'ds-guided-draft-form__section-card--active' : '',
                      section.isComplete ? 'ds-guided-draft-form__section-card--complete' : '',
                      section.hasErrors ? 'ds-guided-draft-form__section-card--errors' : '',
                    ].filter(Boolean).join(' ')}
                    variant={profileDefaults.cardVariant}
                    id={`section-${section.key}`}
                  >
                    <Card.Body>
                      <Stack spacing="sm">
                        <Box data-part="section-card-header">
                          <Flex align="center" gap={2}>
                            {section.icon && (
                              <Box data-part="section-card-icon" style={{ flexShrink: 0 }}>
                                {section.icon}
                              </Box>
                            )}
                            <Text
                              data-part="section-card-title"
                              size="md"
                              weight="semibold"
                              style={{
                                fontWeight: headingWeight,
                              }}
                            >
                              {section.title}
                            </Text>
                            {section.isComplete && (
                              <Text
                                data-part="section-card-complete"
                                size="xs"
                                style={{
                                  marginLeft: 'auto',
                                }}
                              >
                                ✓ Complete
                              </Text>
                            )}
                            {section.hasErrors && (
                              <Text
                                data-part="section-card-errors"
                                size="xs"
                                style={{
                                  marginLeft: section.isComplete ? 0 : 'auto',
                                }}
                              >
                                Has errors
                              </Text>
                            )}
                          </Flex>
                          {section.description && (
                            <Text
                              data-part="section-card-description"
                              size="sm"
                              style={{
                                marginTop: 4,
                              }}
                            >
                              {section.description}
                            </Text>
                          )}
                        </Box>
                        {section.render()}
                      </Stack>
                    </Card.Body>
                  </Card>
                ))}
              </Stack>
            )}
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
          />
          <Box data-part="content-body" style={{ flex: 1, minWidth: 0 }}>
            {mode === 'wizard' ? (
              <PatternStepWizard
                steps={wizardSteps}
                currentStep={activeStepIndex}
                onStepChange={handleWizardStepChange}
                onComplete={onSubmit}
                completeLabel={submitLabel}
                completeDisabled={submitDisabled || submitLoading}
                actionsDisabled={submitLoading}
                showProgress={false}
                showCompleteAction={false}
                orientation="horizontal"
              />
            ) : (
              <Stack spacing={sectionSpacing}>
                {sections.map((section) => (
                  <Card
                    key={section.key}
                    className={[
                      'ds-guided-draft-form__section-card',
                      activeSection === section.key ? 'ds-guided-draft-form__section-card--active' : '',
                      section.isComplete ? 'ds-guided-draft-form__section-card--complete' : '',
                      section.hasErrors ? 'ds-guided-draft-form__section-card--errors' : '',
                    ].filter(Boolean).join(' ')}
                    variant={profileDefaults.cardVariant}
                    id={`section-${section.key}`}
                  >
                    <Card.Body>
                      <Stack spacing="sm">
                        <Box data-part="section-card-header">
                          <Flex align="center" gap={2}>
                            {section.icon && (
                              <Box data-part="section-card-icon" style={{ flexShrink: 0 }}>
                                {section.icon}
                              </Box>
                            )}
                            <Text
                              data-part="section-card-title"
                              size="md"
                              weight="semibold"
                              style={{
                                fontWeight: headingWeight,
                              }}
                            >
                              {section.title}
                            </Text>
                            {section.isComplete && (
                              <Text
                                data-part="section-card-complete"
                                size="xs"
                                style={{
                                  marginLeft: 'auto',
                                }}
                              >
                                ✓ Complete
                              </Text>
                            )}
                            {section.hasErrors && (
                              <Text
                                data-part="section-card-errors"
                                size="xs"
                                style={{
                                  marginLeft: section.isComplete ? 0 : 'auto',
                                }}
                              >
                                Has errors
                              </Text>
                            )}
                          </Flex>
                          {section.description && (
                            <Text
                              data-part="section-card-description"
                              size="sm"
                              style={{
                                marginTop: 4,
                              }}
                            >
                              {section.description}
                            </Text>
                          )}
                        </Box>
                        {section.render()}
                      </Stack>
                    </Card.Body>
                  </Card>
                ))}
              </Stack>
            )}
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
              <Flex align="center" gap={2}>
                <Box
                  data-part="validation-summary-dot"
                  style={{
                    width: 8,
                    height: 8,
                    flexShrink: 0,
                  }}
                />
                <Text data-part="validation-summary-title" size="sm" weight="semibold">
                  {errorCount > 0 ? `${errorCount} error${errorCount > 1 ? 's' : ''}` : ''}
                  {errorCount > 0 && warningCount > 0 ? ', ' : ''}
                  {warningCount > 0 ? `${warningCount} warning${warningCount > 1 ? 's' : ''}` : ''}
                </Text>
              </Flex>
              <Stack spacing="xs">
                {validationIssues.slice(0, 5).map((issue, i) => (
                  <Flex key={i} data-part="validation-issue" data-severity={issue.severity} align="baseline" gap={2}>
                    <Box
                      data-part="validation-issue-dot"
                      data-severity={issue.severity}
                      style={{
                        width: 4,
                        height: 4,
                        flexShrink: 0,
                        marginTop: 6,
                      }}
                    />
                    <Text data-part="validation-issue-message" size="xs">
                      <Text
                        as="span"
                        data-part="validation-issue-field"
                        size="xs"
                        weight="medium"
                      >
                        {issue.field}
                      </Text>
                      {': '}
                      {issue.message}
                    </Text>
                  </Flex>
                ))}
                {validationIssues.length > 5 && (
                  <Text data-part="validation-issue-overflow" size="xs">
                    +{validationIssues.length - 5} more issue{validationIssues.length - 5 > 1 ? 's' : ''}
                  </Text>
                )}
              </Stack>
            </Stack>
          </Card.Body>
        </Card>
      )}

      {/* Sticky submit bar */}
      <Box
        data-part="submit-bar"
        style={{
          position: 'sticky',
          bottom: 0,
          zIndex: 10,
          marginLeft: -1,
          marginRight: -1,
          // Safe area inset for iOS notch / home indicator
          paddingBottom: isMobile
            ? 'env(safe-area-inset-bottom, 0px)'
            : undefined,
        }}
      >
        <Card
          className="ds-guided-draft-form__submit-bar-card"
          variant={profileDefaults.cardVariant}
        >
          <Card.Body>
            {isMobile ? (
              // Mobile: stack buttons vertically, full width
              <Stack spacing="sm">
                {showProgress && (
                  <Text
                    data-part="submit-bar-progress"
                    size="xs"
                    style={{
                      textAlign: 'center',
                    }}
                  >
                    {completedCount} of {sections.length} sections complete
                  </Text>
                )}
                <Button
                  variant="primary"
                  onClick={onSubmit}
                  disabled={submitDisabled || submitLoading}
                  loading={submitLoading}
                  style={{ width: '100%' }}
                >
                  {submitLoading ? 'Submitting...' : submitLabel}
                </Button>
                {secondaryActions && secondaryActions.length > 0 && (
                  <Flex gap={2} style={{ width: '100%' }}>
                    {secondaryActions.map((action) => (
                      <Button
                        key={action.key}
                        variant="secondary"
                        onClick={action.onClick}
                        disabled={action.disabled}
                        style={{ flex: 1 }}
                      >
                        {action.label}
                      </Button>
                    ))}
                  </Flex>
                )}
              </Stack>
            ) : (
              // Tablet / Desktop: horizontal row
              <Flex align="center" gap={3}>
                {showProgress && (
                  <Text data-part="submit-bar-progress" size="xs">
                    {completedCount} of {sections.length} sections complete
                  </Text>
                )}
                <Box style={{ flex: 1 }} />
                {secondaryActions?.map((action) => (
                  <Button
                    key={action.key}
                    variant="secondary"
                    onClick={action.onClick}
                    disabled={action.disabled}
                  >
                    {action.label}
                  </Button>
                ))}
                <Button
                  variant="primary"
                  onClick={onSubmit}
                  disabled={submitDisabled || submitLoading}
                  loading={submitLoading}
                >
                  {submitLoading ? 'Submitting...' : submitLabel}
                </Button>
              </Flex>
            )}
          </Card.Body>
        </Card>
      </Box>

      {footerSlot}
    </Stack>
  );

  return (
    <SurfaceAccentBarWrapper defaults={profileDefaults}>
      {profileDefaults.animateEntrance ? (
        <FadeIn durationMs={profileDefaults.entranceDuration}>
          {content}
        </FadeIn>
      ) : (
        content
      )}
    </SurfaceAccentBarWrapper>
  );
}
