/**
 * @fileoverview GuidedDraftFormSurface - draft-heavy create/edit flows.
 *
 * Composes: section navigation, draft recovery, template picker,
 * validation summary, submit bar, autosave status.
 *
 * For: job posting, event creation, candidate intake, complex forms.
 */

import React, { useState, useMemo, useCallback } from 'react';
import type { ReactNode } from 'react';
import { Box } from '../../primitives/layout/Box';
import { Stack } from '../../primitives/layout/Stack';
import { Flex } from '../../primitives/layout/Flex';
import { Text } from '../../primitives/display/Typography';
import { PatternStepWizard } from '../../patterns/step-wizard';
import type { WizardStep } from '../../patterns/step-wizard';

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
    <Flex align="center" gap={2}>
      <Box
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: color,
        }}
      />
      <Text size="xs" style={{ color }}>{label}</Text>
    </Flex>
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

  const [activeSection, setActiveSection] = useState(sections[0]?.key ?? '');
  const [showTemplates, setShowTemplates] = useState(false);

  const errorCount = validationIssues?.filter(v => v.severity === 'error').length ?? 0;
  const warningCount = validationIssues?.filter(v => v.severity === 'warning').length ?? 0;

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

  return (
    <Stack spacing="md">
      {headerSlot}

      {/* Draft recovery banner */}
      {draftRecovery?.hasDraft && (
        <Flex
          align="center"
          gap={3}
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--ds-radius-md, 8px)',
            border: '1px solid var(--ds-color-info)',
            background: 'var(--ds-color-info-bg, var(--ds-color-bg-secondary))',
          }}
        >
          <Text size="sm" style={{ flex: 1 }}>
            You have an unsaved draft{draftRecovery.draftDate ? ` from ${draftRecovery.draftDate}` : ''}.
          </Text>
          <button
            onClick={draftRecovery.onRecover}
            style={{
              padding: '4px 12px',
              border: '1px solid var(--ds-color-primary)',
              borderRadius: 'var(--ds-radius-sm, 6px)',
              background: 'var(--ds-color-primary)',
              color: 'var(--ds-color-text-on-primary, #fff)',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            Recover
          </button>
          <button
            onClick={draftRecovery.onDiscard}
            style={{
              padding: '4px 12px',
              border: '1px solid var(--ds-color-border-primary)',
              borderRadius: 'var(--ds-radius-sm, 6px)',
              background: 'transparent',
              color: 'var(--ds-color-text-muted)',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            Discard
          </button>
        </Flex>
      )}

      {/* Title bar */}
      <Flex align="center">
        <Box style={{ flex: 1 }}>
          <Text size="xl" weight="semibold">{title}</Text>
          {subtitle && <Text size="sm" color="muted">{subtitle}</Text>}
        </Box>
        {draftStatus && <DraftStatusBadge status={draftStatus} lastSavedAt={lastSavedAt} />}
        {templates && (
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            style={{
              marginLeft: '12px',
              padding: '6px 12px',
              border: '1px solid var(--ds-color-border-primary)',
              borderRadius: 'var(--ds-radius-sm, 6px)',
              background: 'var(--ds-color-bg-secondary)',
              color: 'var(--ds-color-text-secondary)',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            Templates
          </button>
        )}
      </Flex>

      {/* Template picker */}
      {showTemplates && templates && (
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '12px',
          }}
        >
          {templates.items.map((template) => (
            <button
              key={template.id}
              onClick={() => { templates.onSelect(template.id); setShowTemplates(false); }}
              style={{
                padding: '16px',
                border: '1px solid var(--ds-color-border-primary)',
                borderRadius: 'var(--ds-radius-md, 8px)',
                background: 'var(--ds-color-bg-secondary)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'border-color var(--ds-duration-fast, 0.15s) var(--ds-ease-out)',
              }}
            >
              {template.icon && <Box style={{ marginBottom: '8px' }}>{template.icon}</Box>}
              <Text size="sm" weight="medium">{template.name}</Text>
              {template.description && <Text size="xs" color="muted">{template.description}</Text>}
            </button>
          ))}
        </Box>
      )}

      {/* Content: section nav + form body */}
      <Flex gap={5}>
        {/* Section navigation */}
        <Box style={{ width: '200px', flexShrink: 0 }}>
          <Stack spacing="xs">
            {sections.map((section, i) => (
              <button
                key={section.key}
                onClick={() => handleSectionClick(section.key)}
                style={{
                  padding: '8px 12px',
                  border: 'none',
                  borderLeft: activeSection === section.key
                    ? '2px solid var(--ds-color-primary)'
                    : '2px solid transparent',
                  background: activeSection === section.key
                    ? 'var(--ds-color-bg-tertiary)'
                    : 'transparent',
                  color: section.hasErrors
                    ? 'var(--ds-color-error)'
                    : activeSection === section.key
                      ? 'var(--ds-color-text-primary)'
                      : 'var(--ds-color-text-muted)',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: activeSection === section.key ? 500 : 400,
                  textAlign: 'left',
                  transition: 'all var(--ds-duration-fast, 0.15s) var(--ds-ease-out)',
                }}
              >
                <Flex align="center" gap={2}>
                  {section.isComplete && (
                    <span style={{ color: 'var(--ds-color-success)', fontSize: '12px' }}>✓</span>
                  )}
                  {section.hasErrors && (
                    <span style={{ color: 'var(--ds-color-error)', fontSize: '12px' }}>!</span>
                  )}
                  {section.title}
                </Flex>
              </button>
            ))}
          </Stack>
        </Box>

        {/* Form body */}
        <Box style={{ flex: 1, minWidth: 0 }}>
          {mode === 'wizard' ? (
            // Wizard mode: delegate step navigation to PatternStepWizard
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
            // Scroll mode: show all sections
            <Stack spacing="lg">
              {sections.map((section) => (
                <Box
                  key={section.key}
                  id={`section-${section.key}`}
                  style={{
                    paddingBottom: '24px',
                    borderBottom: '1px solid var(--ds-color-border-secondary)',
                  }}
                >
                  <Text size="md" weight="semibold" style={{ marginBottom: '4px' }}>{section.title}</Text>
                  {section.description && (
                    <Text size="sm" color="muted" style={{ marginBottom: '16px' }}>{section.description}</Text>
                  )}
                  {section.render()}
                </Box>
              ))}
            </Stack>
          )}
        </Box>
      </Flex>

      {/* Validation summary */}
      {validationIssues && validationIssues.length > 0 && (
        <Box
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--ds-radius-md, 8px)',
            border: `1px solid ${errorCount > 0 ? 'var(--ds-color-error)' : 'var(--ds-color-warning)'}`,
            background: errorCount > 0 ? 'var(--ds-color-error-bg, var(--ds-color-bg-secondary))' : 'var(--ds-color-warning-bg, var(--ds-color-bg-secondary))',
          }}
        >
          <Text size="sm" weight="medium" style={{ marginBottom: '8px' }}>
            {errorCount > 0 ? `${errorCount} error${errorCount > 1 ? 's' : ''}` : ''}
            {errorCount > 0 && warningCount > 0 ? ', ' : ''}
            {warningCount > 0 ? `${warningCount} warning${warningCount > 1 ? 's' : ''}` : ''}
          </Text>
          <Stack spacing="xs">
            {validationIssues.slice(0, 5).map((issue, i) => (
              <Text key={i} size="xs" style={{ color: issue.severity === 'error' ? 'var(--ds-color-error)' : 'var(--ds-color-warning)' }}>
                {issue.field}: {issue.message}
              </Text>
            ))}
          </Stack>
        </Box>
      )}

      {/* Sticky submit bar */}
      <Flex
        align="center"
        gap={3}
        style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--ds-color-border-primary)',
          background: 'var(--ds-color-bg-primary)',
          position: 'sticky',
          bottom: 0,
          zIndex: 10,
        }}
      >
        <Box style={{ flex: 1 }} />
        {secondaryActions?.map((action) => (
          <button
            key={action.key}
            onClick={action.onClick}
            disabled={action.disabled}
            style={{
              padding: '8px 16px',
              border: '1px solid var(--ds-color-border-primary)',
              borderRadius: 'var(--ds-radius-md, 8px)',
              background: 'var(--ds-color-bg-secondary)',
              color: 'var(--ds-color-text-secondary)',
              cursor: action.disabled ? 'not-allowed' : 'pointer',
              opacity: action.disabled ? 0.5 : 1,
              fontSize: '14px',
            }}
          >
            {action.label}
          </button>
        ))}
        <button
          onClick={onSubmit}
          disabled={submitDisabled || submitLoading}
          style={{
            padding: '8px 20px',
            border: 'none',
            borderRadius: 'var(--ds-radius-md, 8px)',
            background: 'var(--ds-color-primary)',
            color: 'var(--ds-color-text-on-primary, #fff)',
            cursor: submitDisabled || submitLoading ? 'not-allowed' : 'pointer',
            opacity: submitDisabled ? 0.5 : 1,
            fontSize: '14px',
            fontWeight: 600,
            transition: 'background var(--ds-duration-fast, 0.15s) var(--ds-ease-out)',
          }}
        >
          {submitLoading ? 'Submitting...' : submitLabel}
        </button>
      </Flex>

      {footerSlot}
    </Stack>
  );
}
