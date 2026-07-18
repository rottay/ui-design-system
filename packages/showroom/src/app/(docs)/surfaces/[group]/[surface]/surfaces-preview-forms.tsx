'use client';

import { useState, type ReactNode } from 'react';
import {
  DetailFormSurface,
  FormSurface,
  GuidedDraftFormSurface,
  WizardSurface,
  createFormSurfaceConfig,
  Box,
  Stack,
  Flex,
  Text,
  Badge,
  Input,
  Select,
  type DetailFormSurfaceConfig,
  type WizardSurfaceConfig,
  type WizardSurfaceStepRenderContext,
  type FormSection,
} from '@rottay/design-system';
import { noop } from './surfaces-preview-shared';

// --- detail-form -----------------------------------------------------------

function DetailFormSurfacePreview() {
  const [values, setValues] = useState<Record<string, unknown>>({
    displayName: 'Jordan Blake',
    contactEmail: 'jordan@workspace.io',
    accessLevel: 'editor',
  });

  const config: DetailFormSurfaceConfig = {
    visual: { layout: 'split', columns: 2, formSpan: 8, summarySpan: 4, maxWidth: 1080 },
    presentation: {
      chrome: {
        title: 'Edit workspace profile',
        subtitle: 'Update the primary details for this account.',
        breadcrumbs: [{ label: 'Workspaces', href: '#' }, { label: 'Profile' }],
      },
      description: 'Changes apply to everyone with access to this workspace.',
      summaryTitle: 'Summary',
      summary: (
        <Stack spacing="sm">
          <Flex align="center" justify="between" gap={8}>
            <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>Display name</Text>
            <Text size="sm" weight="semibold">{String(values.displayName ?? '—')}</Text>
          </Flex>
          <Flex align="center" justify="between" gap={8}>
            <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>Access level</Text>
            <Badge variant="secondary">{String(values.accessLevel ?? '—')}</Badge>
          </Flex>
          <Flex align="center" justify="between" gap={8}>
            <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>Records affected</Text>
            <Text size="sm" weight="semibold">128</Text>
          </Flex>
        </Stack>
      ),
      aside: (
        <Stack spacing="xs">
          <Text size="sm" weight="semibold">Need a hand?</Text>
          <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
            Access levels can be changed later from the account settings page.
          </Text>
        </Stack>
      ),
    },
    behavior: {
      fields: [
        { name: 'displayName', label: 'Display name', type: 'text', required: true, placeholder: 'Jordan Blake' },
        { name: 'contactEmail', label: 'Contact email', type: 'email', required: true, placeholder: 'jordan@workspace.io' },
        {
          name: 'accessLevel',
          label: 'Access level',
          type: 'select',
          options: [
            { label: 'Administrator', value: 'admin' },
            { label: 'Editor', value: 'editor' },
            { label: 'Viewer', value: 'viewer' },
          ],
        },
        { name: 'summary', label: 'Summary', type: 'textarea', colSpan: 2, placeholder: 'Short description of this workspace' },
      ],
      initialValues: values,
      onChange: setValues,
      submitAction: { id: 'save', label: 'Save changes', variant: 'primary', onClick: noop },
      cancelAction: { id: 'cancel', label: 'Cancel', variant: 'ghost', onClick: noop },
      secondaryActions: [{ id: 'preview', label: 'Preview', variant: 'secondary', onClick: noop }],
      showLabels: true,
      showRequired: true,
    },
    access: { mode: 'all' },
  };

  return (
    <Box style={{ width: '100%' }}>
      <DetailFormSurface config={config} />
    </Box>
  );
}

// --- form ------------------------------------------------------------------

function FormSurfacePreview() {
  const [values, setValues] = useState<Record<string, unknown>>({
    projectName: '',
    category: 'standard',
    visibility: 'private',
  });

  const config = createFormSurfaceConfig({
    visual: { layout: 'vertical', columns: 2, maxWidth: 960 },
    presentation: {
      chrome: {
        title: 'Create a project',
        subtitle: 'Projects group related records, documents, and reports.',
      },
      description: 'Give the project a name and choose who can see it.',
      aside: (
        <Stack spacing="xs">
          <Text size="sm" weight="semibold">Tips</Text>
          <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
            You can invite people and adjust visibility after the project is created.
          </Text>
        </Stack>
      ),
    },
    behavior: {
      fields: [
        { name: 'projectName', label: 'Project name', type: 'text', required: true, placeholder: 'Q3 Migration', colSpan: 2 },
        {
          name: 'category',
          label: 'Category',
          type: 'select',
          options: [
            { label: 'Standard', value: 'standard' },
            { label: 'Premium', value: 'premium' },
            { label: 'Internal', value: 'internal' },
          ],
        },
        {
          name: 'visibility',
          label: 'Visibility',
          type: 'radio',
          options: [
            { label: 'Private', value: 'private' },
            { label: 'Shared', value: 'shared' },
          ],
        },
        { name: 'description', label: 'Description', type: 'textarea', colSpan: 2, placeholder: 'What is this project for?' },
      ],
      initialValues: values,
      onChange: setValues,
      submitAction: { id: 'create', label: 'Create project', variant: 'primary', onClick: noop },
      cancelAction: { id: 'cancel', label: 'Cancel', variant: 'ghost', onClick: noop },
      dirtyState: { isDirty: false },
    },
    access: { mode: 'all' },
  });

  return (
    <Box style={{ width: '100%' }}>
      <FormSurface config={config} />
    </Box>
  );
}

// --- guided-draft-form -----------------------------------------------------

function GuidedDraftFormSurfacePreview() {
  const [values, setValues] = useState<Record<string, string>>({
    title: 'Quarterly rollout plan',
    category: 'standard',
    audience: '',
    summary: '',
  });
  const setField = (key: string) => (value: string) =>
    setValues((current) => ({ ...current, [key]: value }));

  const sections: FormSection[] = [
    {
      key: 'basics',
      title: 'Basics',
      description: 'Name the plan and pick a category.',
      isComplete: true,
      render: () => (
        <Stack spacing="sm">
          <Input placeholder="Plan title" value={values.title} onChange={setField('title')} />
          <Select
            value={values.category}
            onChange={(value) => setField('category')(String(value))}
            options={[
              { label: 'Standard', value: 'standard' },
              { label: 'Priority', value: 'priority' },
            ]}
          />
        </Stack>
      ),
    },
    {
      key: 'details',
      title: 'Details',
      description: 'Describe the audience and goals.',
      render: () => (
        <Stack spacing="sm">
          <Input placeholder="Primary audience" value={values.audience} onChange={setField('audience')} />
          <Input placeholder="Short summary" value={values.summary} onChange={setField('summary')} />
        </Stack>
      ),
    },
    {
      key: 'review',
      title: 'Review',
      description: 'Confirm before publishing.',
      hasErrors: true,
      render: () => (
        <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
          Resolve the outstanding items, then submit the plan for approval.
        </Text>
      ),
    },
  ];

  return (
    <Box style={{ width: '100%' }}>
      <GuidedDraftFormSurface
        title="Draft a publishing plan"
        subtitle="Everything saves automatically as you go."
        mode="scroll"
        sections={sections}
        draftStatus="saved"
        lastSavedAt="2 min ago"
        draftRecovery={{
          hasDraft: true,
          draftDate: 'yesterday at 4:20 PM',
          onRecover: noop,
          onDiscard: noop,
        }}
        templates={{
          items: [
            { id: 'blank', name: 'Blank plan', description: 'Start from scratch' },
            { id: 'standard', name: 'Standard rollout', description: 'A common three-step plan' },
          ],
          onSelect: noop,
        }}
        validationIssues={[
          { field: 'Primary audience', message: 'This field is required.', severity: 'error', sectionKey: 'details' },
          { field: 'Short summary', message: 'Add at least one sentence.', severity: 'warning', sectionKey: 'details' },
        ]}
        secondaryActions={[{ key: 'save-draft', label: 'Save draft', onClick: noop }]}
        submitLabel="Submit for approval"
        onSubmit={noop}
      />
    </Box>
  );
}

// --- wizard ----------------------------------------------------------------

function WizardSurfacePreview() {
  const config: WizardSurfaceConfig = {
    visual: { orientation: 'horizontal', showProgress: true, allowSkip: true, maxWidth: 1040 },
    presentation: {
      chrome: {
        title: 'Set up a new workspace',
        subtitle: 'Three quick steps to get started.',
      },
      description: 'You can change any of these settings later.',
      aside: (context: WizardSurfaceStepRenderContext) => (
        <Stack spacing="xs">
          <Text size="sm" weight="semibold">
            Step {context.currentStep + 1} of 3
          </Text>
          <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
            {context.isLastStep ? 'Review and finish.' : 'Fill in the fields, then continue.'}
          </Text>
        </Stack>
      ),
      footer: () => (
        <Text size="xs" style={{ color: 'var(--ds-color-text-secondary)' }}>
          Progress is kept as you move between steps.
        </Text>
      ),
    },
    behavior: {
      initialValues: { workspaceName: '', region: 'us', plan: 'starter' },
      steps: [
        {
          key: 'basics',
          title: 'Basics',
          description: 'Name your workspace.',
          fields: [
            { name: 'workspaceName', label: 'Workspace name', type: 'text', required: true, placeholder: 'Acme HQ' },
            {
              name: 'region',
              label: 'Region',
              type: 'select',
              options: [
                { label: 'North America', value: 'us' },
                { label: 'Europe', value: 'eu' },
                { label: 'Asia Pacific', value: 'apac' },
              ],
            },
          ],
        },
        {
          key: 'plan',
          title: 'Plan',
          description: 'Choose a starting plan.',
          fields: [
            {
              name: 'plan',
              label: 'Plan',
              type: 'radio',
              options: [
                { label: 'Starter', value: 'starter' },
                { label: 'Growth', value: 'growth' },
                { label: 'Scale', value: 'scale' },
              ],
            },
            { name: 'seats', label: 'Seats', type: 'number', placeholder: '10' },
          ],
        },
        {
          key: 'confirm',
          title: 'Confirm',
          description: 'Review and finish.',
          content: (
            <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
              Everything looks good. Create the workspace to finish setup.
            </Text>
          ),
        },
      ],
      submitAction: { id: 'finish', label: 'Create workspace', variant: 'primary', onClick: noop },
      cancelAction: { id: 'cancel', label: 'Cancel', variant: 'ghost', onClick: noop },
      saveDraftAction: { id: 'draft', label: 'Save draft', variant: 'secondary', onClick: noop },
    },
    access: { mode: 'all' },
  };

  return (
    <Box style={{ width: '100%' }}>
      <WizardSurface config={config} />
    </Box>
  );
}

export const FORMS_SURFACE_PREVIEWS: Record<string, ReactNode> = {
  'detail-form': <DetailFormSurfacePreview />,
  form: <FormSurfacePreview />,
  'guided-draft-form': <GuidedDraftFormSurfacePreview />,
  wizard: <WizardSurfacePreview />,
};
