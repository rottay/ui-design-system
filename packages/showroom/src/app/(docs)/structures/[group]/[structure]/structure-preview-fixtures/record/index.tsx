'use client';

import { useState } from 'react';
import {
  Badge,
  Button,
  Flex,
  FormSections,
  InlineEditField,
  InlineEditGrid,
  InlineEditor,
  InlineEditorGroup,
  Input,
  MoreFieldsToggle,
  RecordActionBar,
  RecordField,
  RecordFieldGrid,
  RecordPanel,
  RecordSummaryStrip,
  Select,
  Stack,
  Text,
} from '@rottay/design-system';

import { noop } from '../foundation';

// The record group used to have a single composite preview keyed "record",
// standing in for five components at once. Each component is now catalogued on
// its own, so each renders on its own here: a preview that shows five things is
// evidence for none of them.

function RecordSummaryStripPreview() {
  return (
    <RecordSummaryStrip
      variant="metrics"
      items={[
        { label: 'Role', value: 'Operations Admin' },
        { label: 'Status', value: <Badge variant="success">Active</Badge> },
        { label: 'Owner', value: 'Sarah Johnson' },
        { label: 'Region', value: 'North America' },
      ]}
    />
  );
}

function RecordFieldPreview() {
  return (
    <Stack spacing={12}>
      <RecordField
        label="Member"
        value="Alice Johnson"
        helper="Primary reviewer for shared workspace coverage."
      />
      <RecordField label="Email" value="alice@rottay.com" href="/members/alice-johnson" />
      <RecordField label="Seat ID" value="seat_01HYN4K92" mono copyValue="seat_01HYN4K92" />
    </Stack>
  );
}

function RecordFieldGridPreview() {
  return (
    <RecordFieldGrid columns="repeat(auto-fit, minmax(220px, 1fr))">
      <RecordField label="Member" value="Alice Johnson" />
      <RecordField label="Email" value="alice@rottay.com" />
      <RecordField label="Seat ID" value="seat_01HYN4K92" mono copyValue="seat_01HYN4K92" />
      <RecordField label="Joined" value="2026-01-15" />
    </RecordFieldGrid>
  );
}

function RecordPanelPreview() {
  return (
    <RecordPanel>
      <Stack spacing={12}>
        <Text size="sm" weight="semibold">
          Core record facts
        </Text>
        <Text size="sm" style={{ display: 'block', color: 'var(--ds-color-text-secondary)' }}>
          The panel contributes frame, padding and elevation, and deliberately no
          behavior of its own.
        </Text>
      </Stack>
    </RecordPanel>
  );
}

function RecordActionBarPreview() {
  return (
    <RecordActionBar
      meta="High-signal details stay grouped while supporting actions remain pinned to the bottom."
      actions={
        <Flex gap={8} wrap="wrap">
          <Button size="sm" variant="ghost" onClick={noop}>
            View timeline
          </Button>
          <Button size="sm" onClick={noop}>
            Edit member
          </Button>
        </Flex>
      }
    />
  );
}

function FormSectionsPreview() {
  const [activeKeys, setActiveKeys] = useState<string[]>(['identity', 'access']);

  return (
    <FormSections
      appearance="card"
      tone="technical"
      sections={[
        {
          key: 'identity',
          title: 'Identity',
          description: 'Name, email, and workspace routing.',
          summary: <Badge variant="secondary">Required</Badge>,
          required: true,
          defaultOpen: true,
          children: (
            <Stack spacing={10}>
              <Input placeholder="Full name" value="Alice Johnson" onChange={noop} />
              <Input placeholder="Work email" value="alice@rottay.com" onChange={noop} />
            </Stack>
          ),
        },
        {
          key: 'access',
          title: 'Access & role',
          description: 'Assign the operational role and review scope.',
          summary: <Badge variant="secondary">2 fields</Badge>,
          defaultOpen: true,
          children: (
            <Stack spacing={10}>
              <Select
                value="platform-admin"
                onChange={noop}
                options={[
                  { value: 'operations-admin', label: 'Operations Admin' },
                  { value: 'operations-analyst', label: 'Operations Analyst' },
                  { value: 'success-lead', label: 'Success Lead' },
                ]}
              />
              <Input placeholder="Primary scope" value="Core platform" onChange={noop} />
            </Stack>
          ),
        },
        {
          key: 'notifications',
          title: 'Notifications',
          description: 'Choose how review changes should reach the owner.',
          optional: true,
          children: (
            <Stack spacing={8}>
              <Text
                size="sm"
                style={{ display: 'block', color: 'var(--ds-color-text-secondary)' }}
              >
                Weekly digest enabled for escalations and new-seat review.
              </Text>
              <Flex gap={8} wrap="wrap">
                <Badge variant="secondary">Email digest</Badge>
                <Badge variant="secondary">Slack handoff</Badge>
              </Flex>
            </Stack>
          ),
        },
      ]}
      activeKeys={activeKeys}
      onChange={(nextKeys) => {
        setActiveKeys(Array.isArray(nextKeys) ? nextKeys : [nextKeys]);
      }}
    />
  );
}

function EditFieldsPreview() {
  const [expanded, setExpanded] = useState(false);

  return (
    <InlineEditorGroup>
      <InlineEditor
        eyebrow="Edit"
        title="Member profile"
        description="Fields save to the same record; advanced fields stay collapsed until needed."
        footerProps={{
          dirtySummary: '2 fields changed',
          saveLabel: 'Save changes',
          onCancel: () => setExpanded(false),
          onSave: () => setExpanded(false),
        }}
      >
        <InlineEditGrid kind="primary" columns="repeat(2, minmax(0, 1fr))">
          <InlineEditField label="Full name" htmlFor="preview-name" requirement="required">
            <Input id="preview-name" value="Alice Johnson" onChange={noop} />
          </InlineEditField>
          <InlineEditField label="Work email" htmlFor="preview-email" requirement="required">
            <Input id="preview-email" value="alice@rottay.com" onChange={noop} />
          </InlineEditField>
        </InlineEditGrid>
        <InlineEditGrid kind="advanced" expanded={expanded} columns="repeat(2, minmax(0, 1fr))">
          <InlineEditField label="Secondary phone" htmlFor="preview-phone" requirement="optional" hint="Used only for after-hours escalation.">
            <Input id="preview-phone" placeholder="+1 (555) 000-0000" onChange={noop} />
          </InlineEditField>
          <InlineEditField label="Internal notes" htmlFor="preview-notes" requirement="recommended">
            <Input id="preview-notes" placeholder="Visible to teammates only" onChange={noop} />
          </InlineEditField>
        </InlineEditGrid>
        <MoreFieldsToggle expanded={expanded} onToggle={() => setExpanded((value) => !value)} />
      </InlineEditor>
    </InlineEditorGroup>
  );
}

export {
  RecordSummaryStripPreview,
  RecordFieldPreview,
  RecordFieldGridPreview,
  RecordPanelPreview,
  RecordActionBarPreview,
  FormSectionsPreview,
  EditFieldsPreview,
};
