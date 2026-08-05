'use client';

import { useState } from 'react';
import {
  Box,
  DetailFormSurface,
  FormFactsCard,
  FormSections,
  FormSurface,
  GuidedDraftFormSurface,
  InlineEditField,
  InlineEditFooter,
  InlineEditGrid,
  InlineEditor,
  InlineEditorGroup,
  Input,
  MoreFieldsToggle,
  PatternApprovalWorkflow,
  RecordActionBar,
  RecordField,
  RecordFieldGrid,
  RecordPanel,
  RecordSummaryStrip,
  Stack,
  Text,
  WizardSurface,
  type ApprovalStep,
  type DetailFormSurfaceConfig,
  type FormSection,
  type FormSurfaceConfig,
  type WizardSurfaceConfig,
} from '@rottay/design-system';

// Fixed fixtures for the WO-SKIN-06 checkpoint CK-D/R data-part probe
// (FormSections, FormFactsCard, record's five exports, edit-fields' eight
// exports, ApprovalWorkflow, GuidedDraftFormSurface, and the three tiny
// composition-only surfaces FormSurface/WizardSurface/DetailFormSurface).
// Per the checkpoint contract these are SIX INDEPENDENT SKINS -- form-sections'
// tone map and record's variant map share two border values by coincidence,
// not by shared code, so fixtures are deliberately per-component. Every
// instance is deterministic: controlled props stand in for internal state
// (isOpen via activeKeys, currentStep via a fixed index) so the grid renders
// identically on every load. Rendered only behind `?record=1` so no flagship
// capture sees it. This page is the visual-evidence half; RecordBatch.
// contract.test.tsx renders its own fixtures directly through React Testing
// Library.
const RECORD_FORM_SECTIONS = [
  {
    key: 'fs-default',
    title: 'General',
    description: 'Default tone, open.',
    tone: 'default' as const,
    required: true,
    children: <Text size="xs">Default tone content</Text>,
  },
  {
    key: 'fs-editorial',
    title: 'Narrative',
    description: 'Editorial tone, open, with a summary chip.',
    tone: 'editorial' as const,
    optional: true,
    summary: '3 fields',
    children: <Text size="xs">Editorial tone content</Text>,
  },
  {
    key: 'fs-technical',
    title: 'Configuration',
    description: 'Technical tone, closed.',
    tone: 'technical' as const,
    children: <Text size="xs">Technical tone content</Text>,
  },
  {
    key: 'fs-governance',
    title: 'Compliance',
    description: 'Governance tone, closed.',
    tone: 'governance' as const,
    children: <Text size="xs">Governance tone content</Text>,
  },
];

function RecordFbFormSections() {
  return (
    <Stack spacing="xs" data-testid="probe-record-form-sections">
      <Text size="xs" color="secondary">
        FormSections (card, collapsible -- two open, two closed)
      </Text>
      <FormSections
        sections={RECORD_FORM_SECTIONS}
        collapsible
        activeKeys={['fs-default', 'fs-editorial']}
        onChange={() => undefined}
      />
      <Text size="xs" color="secondary">
        FormSections (divided, non-collapsible)
      </Text>
      <FormSections sections={RECORD_FORM_SECTIONS.slice(0, 2)} appearance="divided" />
      <Text size="xs" color="secondary">
        FormFactsCard
      </Text>
      <FormFactsCard
        eyebrow="Summary"
        title="Account facts"
        description="Read-only key facts."
        items={[
          { label: 'Plan', value: 'Enterprise', helper: 'Renews annually' },
          { label: 'Owner', value: 'Ada Lovelace', mono: false },
          { label: 'Reference', value: 'ACC-0042', mono: true },
        ]}
      />
    </Stack>
  );
}

const RECORD_SUMMARY_VARIANTS = ['default', 'editorial', 'technical', 'governance', 'metrics'] as const;
const RECORD_SUMMARY_ITEMS = [
  { label: 'Status', value: 'Active' },
  { label: 'Owner', value: 'Ada Lovelace', helper: 'Assigned 3 days ago' },
  { label: 'Reference', value: 'REC-0091', mono: true },
];

function RecordFbRecord() {
  return (
    <Stack spacing="xs" data-testid="probe-record-record">
      <Text size="xs" color="secondary">
        RecordSummaryStrip (all 5 variants)
      </Text>
      {RECORD_SUMMARY_VARIANTS.map((variant) => (
        <RecordSummaryStrip key={variant} items={RECORD_SUMMARY_ITEMS} variant={variant} />
      ))}
      <Text size="xs" color="secondary">
        RecordFieldGrid (plain / mono / empty / href / copy)
      </Text>
      <RecordFieldGrid>
        <RecordField label="Name" value="Ada Lovelace" />
        <RecordField label="Reference" value="REC-0091" mono />
        <RecordField label="Notes" value={undefined} />
        <RecordField label="Profile" value="View profile" href="/probe/record" />
        <RecordField label="API key" value="sk_live_••••" mono copyValue="sk_live_secret" />
      </RecordFieldGrid>
      <Text size="xs" color="secondary">
        RecordActionBar
      </Text>
      <RecordActionBar
        meta="3 unsaved changes"
        actionItems={[
          { label: 'Cancel', onClick: () => undefined },
          { label: 'Save', variant: 'primary', onClick: () => undefined },
        ]}
      />
      <Text size="xs" color="secondary">
        RecordPanel
      </Text>
      <RecordPanel>
        <Text size="sm">Generic panel content.</Text>
      </RecordPanel>
    </Stack>
  );
}

function RecordFbEditFields() {
  const [advancedExpanded, setAdvancedExpanded] = useState(true);
  return (
    <Stack spacing="xs" data-testid="probe-record-edit-fields">
      <Text size="xs" color="secondary">
        InlineEditorGroup (two editors, one headerless)
      </Text>
      <InlineEditorGroup>
        <InlineEditor title="Profile" eyebrow="Section 01" description="Primary identity fields.">
          <InlineEditGrid kind="primary">
            <InlineEditField label="Full name" fieldNumber="01" requirement="required" htmlFor="probe-edit-name">
              <Input id="probe-edit-name" defaultValue="Ada Lovelace" />
            </InlineEditField>
            <InlineEditField label="Nickname" fieldNumber="02" requirement="recommended">
              <Input placeholder="Optional" />
            </InlineEditField>
            <InlineEditField
              label="Email"
              fieldNumber="03"
              requirement="optional"
              hasError
              errorMessage="Enter a valid email address"
            >
              <Input defaultValue="not-an-email" />
            </InlineEditField>
          </InlineEditGrid>
          <InlineEditGrid kind="advanced" expanded={advancedExpanded} unmountWhenCollapsed={false}>
            <InlineEditField label="Internal ID" fieldNumber="04" requirement="optional">
              <Input disabled defaultValue="usr_0042" />
            </InlineEditField>
          </InlineEditGrid>
          <MoreFieldsToggle expanded={advancedExpanded} onToggle={() => setAdvancedExpanded((v) => !v)} />
        </InlineEditor>
        <InlineEditor title="Preferences" headerless>
          <InlineEditGrid kind="primary" columns="repeat(2, minmax(0, 1fr))">
            <InlineEditField label="Timezone" requirement="recommended">
              <Input defaultValue="UTC" />
            </InlineEditField>
          </InlineEditGrid>
        </InlineEditor>
      </InlineEditorGroup>
      <Text size="xs" color="secondary">
        InlineEditFooter (plain / error / saving)
      </Text>
      <InlineEditFooter summary="No changes yet" onCancel={() => undefined} onSave={() => undefined} />
      <InlineEditFooter
        error="Fix the highlighted fields before saving"
        onCancel={() => undefined}
        onSave={() => undefined}
      />
      <InlineEditFooter dirtySummary="3 fields changed" onCancel={() => undefined} onSave={() => undefined} isSaving />
    </Stack>
  );
}

const APPROVAL_WORKFLOW_STEPS: ApprovalStep[] = [
  {
    key: 'manager',
    approver: 'Jane Smith',
    status: 'approved',
    timestamp: '2026-07-01T09:00:00Z',
    comments: 'Looks good',
  },
  { key: 'director', approver: 'Bob Johnson', status: 'pending' },
  { key: 'finance', approver: 'Finance Team', status: 'skipped' },
  {
    key: 'legal',
    approver: 'Legal Dept',
    status: 'rejected',
    comments: 'Needs revision',
  },
  { key: 'exec', approver: 'Executive Sponsor', status: 'escalated' },
];

function RecordFbApprovalWorkflow() {
  return (
    <Stack spacing="xs" data-testid="probe-record-approval-workflow">
      <Text size="xs" color="secondary">
        ApprovalWorkflow (all 5 statuses, current step pending)
      </Text>
      <PatternApprovalWorkflow
        title="Expense Report"
        entity="EXP-9981"
        steps={APPROVAL_WORKFLOW_STEPS}
        currentStep={1}
        onApprove={() => undefined}
        onReject={() => undefined}
        onEscalate={() => undefined}
      />
      <Text size="xs" color="secondary">
        ApprovalWorkflow (loading)
      </Text>
      <PatternApprovalWorkflow title="Loading" steps={[]} loading />
    </Stack>
  );
}

function buildGuidedDraftSections(): FormSection[] {
  return [
    {
      key: 'basics',
      title: 'Basics',
      render: () => <Text size="xs">Basics content</Text>,
      isComplete: true,
    },
    {
      key: 'details',
      title: 'Details',
      render: () => <Text size="xs">Details content</Text>,
      hasErrors: true,
    },
    {
      key: 'review',
      title: 'Review',
      render: () => <Text size="xs">Review content</Text>,
    },
  ];
}

function RecordFbGuidedDraftForm() {
  const sections = buildGuidedDraftSections();
  return (
    <Stack spacing="xs" data-testid="probe-record-guided-draft-form">
      <Text size="xs" color="secondary">
        GuidedDraftFormSurface (scroll, sidebar nav, unsaved)
      </Text>
      <GuidedDraftFormSurface
        title="New job posting"
        subtitle="Draft-heavy create flow"
        sections={sections}
        draftStatus="unsaved"
        onSubmit={() => undefined}
        adaptive={{ desktop: { formLayout: 'sidebar-nav' } }}
      />
      <Text size="xs" color="secondary">
        GuidedDraftFormSurface (scroll, pill nav, saving)
      </Text>
      <GuidedDraftFormSurface
        title="New job posting"
        sections={sections}
        draftStatus="saving"
        onSubmit={() => undefined}
        adaptive={{ desktop: { formLayout: 'pill-nav' } }}
      />
      <Text size="xs" color="secondary">
        GuidedDraftFormSurface (scroll, dropdown nav, saved, with templates + recovery)
      </Text>
      <GuidedDraftFormSurface
        title="New job posting"
        sections={sections}
        draftStatus="saved"
        lastSavedAt="2 min ago"
        onSubmit={() => undefined}
        adaptive={{ desktop: { formLayout: 'dropdown-nav' } }}
        draftRecovery={{
          hasDraft: true,
          onRecover: () => undefined,
          onDiscard: () => undefined,
          draftDate: 'yesterday',
        }}
        templates={{
          items: [
            {
              id: 't1',
              name: 'Standard template',
              description: 'Common fields pre-filled.',
            },
          ],
          onSelect: () => undefined,
        }}
      />
      <Text size="xs" color="secondary">
        GuidedDraftFormSurface (wizard mode, error status, validation issues)
      </Text>
      <GuidedDraftFormSurface
        title="New job posting"
        sections={sections}
        mode="wizard"
        draftStatus="error"
        onSubmit={() => undefined}
        validationIssues={[
          { field: 'Title', message: 'Title is required', severity: 'error' },
          {
            field: 'Budget',
            message: 'Budget looks unusually high',
            severity: 'warning',
          },
        ]}
      />
    </Stack>
  );
}

function RecordFbSurfaces() {
  const formConfig: FormSurfaceConfig = {
    visual: { layout: 'horizontal', columns: 2 },
    presentation: {
      chrome: { title: 'Create record' },
      description: 'Standard single-page form shell.',
      aside: <Text size="xs">Helpful aside content</Text>,
      error: <Text size="xs">Something went wrong saving this record.</Text>,
    },
    behavior: {
      fields: [],
      submitAction: {
        id: 'submit-record',
        label: 'Create record',
        variant: 'primary',
        onClick: () => undefined,
      },
      cancelAction: {
        id: 'cancel-record',
        label: 'Cancel',
        onClick: () => undefined,
      },
    },
  };

  const wizardConfig: WizardSurfaceConfig = {
    visual: {},
    presentation: {
      chrome: { title: 'Setup flow' },
      error: <Text size="xs">A step failed validation.</Text>,
      aside: <Text size="xs">Setup guidance</Text>,
    },
    behavior: {
      steps: [
        {
          key: 'review',
          title: 'Review',
          content: <Text size="xs">Review the setup</Text>,
        },
      ],
      submitAction: {
        id: 'complete-setup',
        label: 'Complete setup',
        variant: 'primary',
        onClick: () => undefined,
      },
    },
  };

  const detailFormConfig: DetailFormSurfaceConfig = {
    visual: {},
    presentation: {
      chrome: { title: 'Edit workspace' },
      summary: <Text size="xs">Workspace summary</Text>,
      error: <Text size="xs">Unable to save this workspace.</Text>,
    },
    behavior: {
      fields: [],
      submitAction: {
        id: 'save-workspace',
        label: 'Save changes',
        variant: 'primary',
        onClick: () => undefined,
      },
      cancelAction: {
        id: 'cancel-edit',
        label: 'Cancel',
        onClick: () => undefined,
      },
    },
  };

  return (
    <Stack spacing="xs" data-testid="probe-record-surfaces">
      <Text size="xs" color="secondary">
        FormSurface
      </Text>
      <FormSurface config={formConfig} />
      <Text size="xs" color="secondary">
        WizardSurface
      </Text>
      <WizardSurface config={wizardConfig} />
      <Text size="xs" color="secondary">
        DetailFormSurface
      </Text>
      <DetailFormSurface config={detailFormConfig} />
    </Stack>
  );
}

export function RecordFbStates() {
  return (
    <Box
      data-testid="probe-record"
      style={{
        borderRadius: 16,
        border: '1px solid var(--ds-color-border)',
        background: 'var(--ds-color-bg-elevated)',
        padding: 16,
      }}
    >
      <Stack spacing="lg" fullWidth>
        <RecordFbFormSections />
        <RecordFbRecord />
        <RecordFbEditFields />
        <RecordFbApprovalWorkflow />
        <RecordFbGuidedDraftForm />
        <RecordFbSurfaces />
      </Stack>
    </Box>
  );
}
