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
import { Box } from '../../../../primitives/layout/Box';
import { Stack } from '../../../../primitives/layout/Stack';
import { Flex } from '../../../../primitives/layout/Flex';
import { Text } from '../../../../primitives/display/Typography';
import { Button } from '../../../../primitives/inputs/Button';
import { Select } from '../../../../primitives/inputs/Select';
import { Card } from '../../../../primitives/display/Card';
import type { CardVariant } from '../../../../primitives/display/Card/Card.types';
import { Progress } from '../../../../primitives/feedback/Progress';
import { PatternStepWizard } from '../../../../patterns/forms/step-wizard';
import type { WizardStep } from '../../../../patterns/forms/step-wizard';
import { FadeIn } from '../../../../../motion';
import { useBreakpoints } from '../../../../../hooks/responsive/useBreakpoints';
import { useSurfaceProfileDefaults } from '../../../foundation/profile-defaults';
import {
  resolveStackSpacing,
  resolveHeadingFontWeight,
  SurfaceAccentBarWrapper,
} from '../../../foundation/personality-helpers';

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
}

// ---------------------------------------------------------------------------
// Draft status indicator
// ---------------------------------------------------------------------------

function DraftStatusBadge({ status, lastSavedAt }: { status: DraftStatus; lastSavedAt?: string }) {
  const statusMap: Record<DraftStatus, { label: string; color: string }> = {
    unsaved: { label: 'Unsaved changes', color: 'var(--ds-color-warning)' },
    saving: { label: 'Saving...', color: 'var(--ds-color-text-muted)' },
    saved: { label: lastSavedAt ? `Saved ${lastSavedAt}` : 'Saved', color: 'var(--ds-color-success)' },
    error: { label: 'Save failed', color: 'var(--ds-color-error)' },
  };
  const { label, color } = statusMap[status];

  return (
    <Flex
      align="center"
      gap={2}
      style={{
        padding: '4px 10px',
        borderRadius: 'var(--ds-radius-sm)',
        background: 'var(--ds-color-bg-tertiary)',
      }}
    >
      <Box
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: color,
          flexShrink: 0,
        }}
      />
      <Text size="xs" style={{ color, whiteSpace: 'nowrap' }}>{label}</Text>
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
      <Box style={{ marginBottom: 4 }}>
        <Text
          size="xs"
          weight="semibold"
          style={{
            color: 'var(--ds-color-text-muted)',
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
      <Box style={{ marginBottom: 4 }}>
        <Text
          size="xs"
          weight="semibold"
          style={{
            color: 'var(--ds-color-text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: 8,
            fontWeight: headingWeight,
          }}
        >
          Sections
        </Text>
        <Flex
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
                variant="ghost"
                size="sm"
                onClick={() => onSectionClick(section.key)}
                style={{
                  borderRadius: 'var(--ds-radius-full, 9999px)',
                  background: isActive
                    ? 'var(--ds-color-primary-bg, var(--ds-color-bg-tertiary))'
                    : 'var(--ds-color-bg-secondary, var(--ds-color-bg-tertiary))',
                  color: section.hasErrors
                    ? 'var(--ds-color-error)'
                    : isActive
                      ? 'var(--ds-color-primary)'
                      : 'var(--ds-color-text-secondary)',
                  fontWeight: isActive ? 600 : 400,
                  whiteSpace: 'nowrap',
                  padding: '6px 14px',
                  flexShrink: 0,
                  border: isActive
                    ? '1px solid var(--ds-color-primary)'
                    : '1px solid var(--ds-color-border, transparent)',
                  transition: 'all 150ms ease',
                }}
              >
                <Flex align="center" gap={1}>
                  {section.icon && (
                    <Box style={{ flexShrink: 0, opacity: isActive ? 1 : 0.7 }}>
                      {section.icon}
                    </Box>
                  )}
                  <Text size="sm" style={{ color: 'inherit', whiteSpace: 'nowrap' }}>
                    {section.title}
                  </Text>
                  {section.isComplete && (
                    <Text size="xs" style={{ color: 'var(--ds-color-success)', flexShrink: 0 }}>
                      ✓
                    </Text>
                  )}
                  {section.hasErrors && (
                    <Box
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: 'var(--ds-color-error)',
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
        size="xs"
        weight="semibold"
        style={{
          color: 'var(--ds-color-text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: 12,
          paddingLeft: 14,
          fontWeight: headingWeight,
        }}
      >
        Sections
      </Text>
      <Stack spacing="xs">
        {sections.map((section) => {
          const isActive = activeSection === section.key;
          return (
            <Button
              key={section.key}
              variant="ghost"
              size="sm"
              onClick={() => onSectionClick(section.key)}
              style={{
                borderRadius: 'var(--ds-radius-sm)',
                borderLeft: `3px solid ${
                  isActive ? 'var(--ds-color-primary)' : 'transparent'
                }`,
                background: isActive
                  ? 'var(--ds-color-primary-bg, var(--ds-color-bg-tertiary))'
                  : 'transparent',
                color: section.hasErrors
                  ? 'var(--ds-color-error)'
                  : isActive
                    ? 'var(--ds-color-primary)'
                    : 'var(--ds-color-text-secondary)',
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
                    <Box style={{ flexShrink: 0, opacity: isActive ? 1 : 0.7 }}>
                      {section.icon}
                    </Box>
                  )}
                  <Text
                    size="sm"
                    style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      color: 'inherit',
                    }}
                  >
                    {section.title}
                  </Text>
                </Flex>
                {section.isComplete && (
                  <Text size="xs" style={{ color: 'var(--ds-color-success)', flexShrink: 0 }}>
                    ✓
                  </Text>
                )}
                {section.hasErrors && (
                  <Box
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: 'var(--ds-color-error)',
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
      variant={cardVariant}
      style={{
        cursor: 'pointer',
        transition: 'all 150ms ease',
      }}
    >
      <Card.Body>
        <Button
          variant="ghost"
          onClick={onSelect}
          style={{
            padding: 0,
            textAlign: 'left',
            height: 'auto',
            whiteSpace: 'normal',
            display: 'block',
            width: '100%',
            background: 'transparent',
          }}
        >
          <Stack spacing="xs">
            {template.icon && (
              <Box
                style={{
                  fontSize: 24,
                  color: 'var(--ds-color-primary)',
                  marginBottom: 4,
                }}
              >
                {template.icon}
              </Box>
            )}
            <Text size="sm" weight="semibold" style={{ color: 'var(--ds-color-text-primary)' }}>
              {template.name}
            </Text>
            {template.description && (
              <Text size="xs" style={{ color: 'var(--ds-color-text-muted)' }}>
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
  } = props;

  const profileDefaults = useSurfaceProfileDefaults();
  const { isMobile, isTablet } = useBreakpoints();
  const sectionSpacing = resolveStackSpacing(profileDefaults.sectionSpacing);
  const headingWeight = resolveHeadingFontWeight(profileDefaults.headerWeight);

  // Responsive layout: desktop sidebar | tablet pills | mobile dropdown
  const sectionNavLayout: SectionNavLayout = isMobile
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
    <Stack spacing={sectionSpacing}>
      {headerSlot}

      {/* Draft recovery banner */}
      {draftRecovery?.hasDraft && (
        <Card
          variant={profileDefaults.cardVariant}
          style={{ borderColor: 'var(--ds-color-info)' }}
        >
          <Card.Body>
            <Flex align="center" gap={3}>
              <Box
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 'var(--ds-radius-sm)',
                  background: 'var(--ds-color-info-bg, var(--ds-color-bg-tertiary))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  color: 'var(--ds-color-info)',
                  fontSize: 14,
                }}
              >
                ↻
              </Box>
              <Box style={{ flex: 1 }}>
                <Text size="sm" weight="medium" style={{ color: 'var(--ds-color-text-primary)' }}>
                  Unsaved draft found
                </Text>
                <Text size="xs" style={{ color: 'var(--ds-color-text-muted)' }}>
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
        align={isMobile ? 'stretch' : 'center'}
        gap={3}
        style={{
          flexDirection: isMobile ? 'column' : 'row',
          flexWrap: isTablet ? 'wrap' : undefined,
        }}
      >
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Text
            size="xl"
            weight="semibold"
            style={{ fontWeight: headingWeight, color: 'var(--ds-color-text-primary)' }}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              size="sm"
              style={{ color: 'var(--ds-color-text-muted)', marginTop: 2 }}
            >
              {subtitle}
            </Text>
          )}
        </Box>
        {showProgress && (
          <Flex align="center" gap={2} style={{ minWidth: 120 }}>
            <Progress
              percent={progressPercent}
              strokeWidth={4}
              showInfo={false}
              style={{ flex: 1 }}
            />
            <Text size="xs" style={{ color: 'var(--ds-color-text-muted)', whiteSpace: 'nowrap' }}>
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
        <Stack spacing={sectionSpacing}>
          <SectionNav
            sections={sections}
            activeSection={activeSection}
            onSectionClick={handleSectionClick}
            headingWeight={headingWeight}
            layout={sectionNavLayout}
          />
          <Box style={{ minWidth: 0 }}>
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
                    variant={profileDefaults.cardVariant}
                    id={`section-${section.key}`}
                  >
                    <Card.Body>
                      <Stack spacing="sm">
                        <Box>
                          <Flex align="center" gap={2}>
                            {section.icon && (
                              <Box style={{ color: 'var(--ds-color-primary)', flexShrink: 0 }}>
                                {section.icon}
                              </Box>
                            )}
                            <Text
                              size="md"
                              weight="semibold"
                              style={{
                                fontWeight: headingWeight,
                                color: 'var(--ds-color-text-primary)',
                              }}
                            >
                              {section.title}
                            </Text>
                            {section.isComplete && (
                              <Text
                                size="xs"
                                style={{
                                  color: 'var(--ds-color-success)',
                                  marginLeft: 'auto',
                                }}
                              >
                                ✓ Complete
                              </Text>
                            )}
                            {section.hasErrors && (
                              <Text
                                size="xs"
                                style={{
                                  color: 'var(--ds-color-error)',
                                  marginLeft: section.isComplete ? 0 : 'auto',
                                }}
                              >
                                Has errors
                              </Text>
                            )}
                          </Flex>
                          {section.description && (
                            <Text
                              size="sm"
                              style={{
                                color: 'var(--ds-color-text-muted)',
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
        <Flex gap={5}>
          <SectionNav
            sections={sections}
            activeSection={activeSection}
            onSectionClick={handleSectionClick}
            headingWeight={headingWeight}
            layout="sidebar"
          />
          <Box style={{ flex: 1, minWidth: 0 }}>
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
                    variant={profileDefaults.cardVariant}
                    id={`section-${section.key}`}
                  >
                    <Card.Body>
                      <Stack spacing="sm">
                        <Box>
                          <Flex align="center" gap={2}>
                            {section.icon && (
                              <Box style={{ color: 'var(--ds-color-primary)', flexShrink: 0 }}>
                                {section.icon}
                              </Box>
                            )}
                            <Text
                              size="md"
                              weight="semibold"
                              style={{
                                fontWeight: headingWeight,
                                color: 'var(--ds-color-text-primary)',
                              }}
                            >
                              {section.title}
                            </Text>
                            {section.isComplete && (
                              <Text
                                size="xs"
                                style={{
                                  color: 'var(--ds-color-success)',
                                  marginLeft: 'auto',
                                }}
                              >
                                ✓ Complete
                              </Text>
                            )}
                            {section.hasErrors && (
                              <Text
                                size="xs"
                                style={{
                                  color: 'var(--ds-color-error)',
                                  marginLeft: section.isComplete ? 0 : 'auto',
                                }}
                              >
                                Has errors
                              </Text>
                            )}
                          </Flex>
                          {section.description && (
                            <Text
                              size="sm"
                              style={{
                                color: 'var(--ds-color-text-muted)',
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
          variant={profileDefaults.cardVariant}
          style={{
            borderColor: errorCount > 0
              ? 'var(--ds-color-error)'
              : 'var(--ds-color-warning)',
          }}
        >
          <Card.Body>
            <Stack spacing="sm">
              <Flex align="center" gap={2}>
                <Box
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: errorCount > 0
                      ? 'var(--ds-color-error)'
                      : 'var(--ds-color-warning)',
                    flexShrink: 0,
                  }}
                />
                <Text size="sm" weight="semibold" style={{ color: 'var(--ds-color-text-primary)' }}>
                  {errorCount > 0 ? `${errorCount} error${errorCount > 1 ? 's' : ''}` : ''}
                  {errorCount > 0 && warningCount > 0 ? ', ' : ''}
                  {warningCount > 0 ? `${warningCount} warning${warningCount > 1 ? 's' : ''}` : ''}
                </Text>
              </Flex>
              <Stack spacing="xs">
                {validationIssues.slice(0, 5).map((issue, i) => (
                  <Flex key={i} align="baseline" gap={2}>
                    <Box
                      style={{
                        width: 4,
                        height: 4,
                        borderRadius: '50%',
                        background: issue.severity === 'error'
                          ? 'var(--ds-color-error)'
                          : 'var(--ds-color-warning)',
                        flexShrink: 0,
                        marginTop: 6,
                      }}
                    />
                    <Text size="xs" style={{ color: 'var(--ds-color-text-secondary)' }}>
                      <Text
                        as="span"
                        size="xs"
                        weight="medium"
                        style={{
                          color: issue.severity === 'error'
                            ? 'var(--ds-color-error)'
                            : 'var(--ds-color-warning)',
                        }}
                      >
                        {issue.field}
                      </Text>
                      {': '}
                      {issue.message}
                    </Text>
                  </Flex>
                ))}
                {validationIssues.length > 5 && (
                  <Text size="xs" style={{ color: 'var(--ds-color-text-muted)' }}>
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
          variant={profileDefaults.cardVariant}
          style={{
            borderRadius: 0,
            borderLeft: 'none',
            borderRight: 'none',
            borderBottom: 'none',
          }}
        >
          <Card.Body>
            {isMobile ? (
              // Mobile: stack buttons vertically, full width
              <Stack spacing="sm">
                {showProgress && (
                  <Text
                    size="xs"
                    style={{
                      color: 'var(--ds-color-text-muted)',
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
                  <Text size="xs" style={{ color: 'var(--ds-color-text-muted)' }}>
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
        <FadeIn duration={profileDefaults.entranceDuration}>
          {content}
        </FadeIn>
      ) : (
        content
      )}
    </SurfaceAccentBarWrapper>
  );
}
