'use client';

import { useState } from 'react';
import {
  Badge,
  Box,
  Button,
  CollectionHeader,
  DashboardHeader,
  DetailHeader,
  EditHeader,
  Flex,
  FormHeader,
  HeaderSurface,
  Input,
  MobileHeader,
  SectionFrame,
  Stack,
  Text,
} from '@rottay/design-system';

import {
  ActionRefreshIcon,
  CommunicationMessageIcon,
  EntityGroupIcon,
  LocationGlobalIcon,
  AccessAdminIcon,
  IdentityProvisioningIcon,
  SecurityProtectionIcon,
  AnalyticsActivityIcon,
  AnalyticsBarIcon,
  BillingCreditCardIcon,
  noop,
} from '../foundation';

function CollectionHeaderPreview() {
  return (
    <CollectionHeader
      eyebrow="Rottay workspace"
      title="Tenant access reviews"
      subtitle="Permission changes, invite follow-up, and seat utilization in one operational collection."
      titleTreatment="dotted"
      subtitleTreatment="mono-technical"
      layoutVariant="editorial-tech"
      surfaceVariant="embedded"
      metaItems={[
        { key: 'records', label: '124 workspaces', tone: 'primary' },
        { key: 'flagged', label: '19 flagged', tone: 'success' },
      ]}
      metaItemsPlacement="inline-start"
      shortcuts={[
        { key: 'slash', label: '/ search' },
        { key: 'cmdk', label: 'Cmd+K actions' },
      ]}
      quickActions={[
        { key: 'invite', label: 'Invite teammate', onClick: noop, variant: 'primary' },
        { key: 'import', label: 'Import CSV', onClick: noop, variant: 'secondary' },
      ]}
    />
  );
}

function DashboardHeaderPreview() {
  return (
    <DashboardHeader
      title="Rottay health"
      subtitle="Live view of workspace utilization, queue pressure, and coverage drift."
      metrics={[
        {
          key: 'uptime',
          label: 'Uptime',
          value: '99.98%',
          change: { value: '0.2%', direction: 'up' },
        },
        {
          key: 'pending',
          label: 'Pending reviews',
          value: 18,
          change: { value: '3', direction: 'down' },
        },
        {
          key: 'sla',
          label: 'SLA hit rate',
          value: '94%',
          change: { value: '2%', direction: 'up' },
        },
      ]}
      status={{ state: 'live', label: 'Streaming now' }}
      actions={[
        {
          key: 'refresh',
          label: 'Refresh',
          icon: <ActionRefreshIcon size={14} />,
          onClick: noop,
        },
        { key: 'share', label: 'Share board', onClick: noop, variant: 'primary' },
      ]}
      searchSlot={
        <Input
          placeholder="Search metrics or drilldowns"
          style={{ width: 'min(100%, 240px)' }}
        />
      }
      timeRangeSlot={
        <Badge variant="secondary" size="sm">
          Last 24 hours
        </Badge>
      }
      icon={<AnalyticsBarIcon size={18} />}
    />
  );
}

function DetailHeaderPreview() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <DetailHeader
      title="Alice Johnson"
      subtitle="Primary owner for the shared access review queue."
      avatar="AJ"
      status={{ label: 'Healthy', variant: 'success' }}
      backHref="/members"
      backLabel="Back to workspace"
      breadcrumb={[
        { label: 'Workspace', href: '/workspace' },
        { label: 'Members', href: '/workspace/members' },
        { label: 'Alice Johnson' },
      ]}
      actions={[
        {
          label: 'Message owner',
          icon: CommunicationMessageIcon,
          onClick: noop,
          variant: 'secondary',
        },
        {
          label: 'Adjust access',
          icon: AccessAdminIcon,
          onClick: noop,
          variant: 'primary',
        },
      ]}
      tabs={[
        { id: 'overview', label: 'Overview', icon: EntityGroupIcon },
        { id: 'activity', label: 'Activity', count: 12, icon: AnalyticsActivityIcon },
        { id: 'billing', label: 'Billing', count: 2, icon: BillingCreditCardIcon },
      ]}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      metadata={[
        { label: 'Owner', value: 'Sarah Johnson', icon: EntityGroupIcon },
        { label: 'Region', value: 'North America', icon: LocationGlobalIcon },
        { label: 'Trust tier', value: 'Tier 1', icon: SecurityProtectionIcon },
      ]}
      eyebrow="Member detail"
      archetype="technical"
      contextRail={
        <Flex gap={8} wrap="wrap">
          <Badge variant="secondary" size="sm">
            Seat utilization 92%
          </Badge>
          <Badge variant="secondary" size="sm">
            Last review Apr 18
          </Badge>
        </Flex>
      }
    >
      <Text
        size="sm"
        style={{ display: 'block', color: 'var(--ds-color-text-secondary)' }}
      >
        Shared context and operational state stay attached to the header instead of being buried in the body.
      </Text>
    </DetailHeader>
  );
}

function EditHeaderPreview() {
  return (
    <EditHeader
      icon={AccessAdminIcon}
      title="Edit tenant access policy"
      subtitle="Adjust reviewers, escalation paths, and required approvals before publishing."
      entityId="tap_4918a21c"
      backHref="/workspace/policies"
      backLabel="Back to policies"
      colorVariant="primary"
      breadcrumb={[
        { label: 'Workspace', href: '/workspace' },
        { label: 'Policies', href: '/workspace/policies' },
        { label: 'Edit access policy' },
      ]}
      onSave={noop}
      onCancel={noop}
      extraActions={
        <Button size="sm" variant="ghost" onClick={noop}>
          Preview changes
        </Button>
      }
      status={{ label: 'Draft', color: 'warning' }}
      eyebrow="Policy editor"
      archetype="control"
      contextRail={
        <Badge variant="secondary" size="sm">
          Autosave off
        </Badge>
      }
    >
      <Text
        size="sm"
        style={{ display: 'block', color: 'var(--ds-color-text-secondary)' }}
      >
        Save, cancel, and draft-state cues stay in the header so the form body can focus on the policy rules.
      </Text>
    </EditHeader>
  );
}

function FormHeaderPreview() {
  return (
    <FormHeader
      icon={IdentityProvisioningIcon}
      title="Create teammate profile"
      subtitle="Start with workspace identity, access level, and routing preferences."
      backHref="/workspace/members"
      backLabel="Back to members"
      secondaryAction={{ label: 'Save draft', onClick: noop, variant: 'secondary' }}
      action={{ label: 'Create member', onClick: noop, variant: 'primary' }}
      colorVariant="primary"
      mode="create"
      breadcrumb={[
        { label: 'Workspace', href: '/workspace' },
        { label: 'Members', href: '/workspace/members' },
        { label: 'New member' },
      ]}
      eyebrow="Onboarding"
      archetype="editorial"
      contextRail={
        <Flex gap={8} wrap="wrap">
          <Badge variant="secondary" size="sm">
            3 required fields
          </Badge>
          <Badge variant="secondary" size="sm">
            Invite sends immediately
          </Badge>
        </Flex>
      }
    >
      <Text
        size="sm"
        style={{ display: 'block', color: 'var(--ds-color-text-secondary)' }}
      >
        The header carries route context, action intent, and field expectations before the form begins.
      </Text>
    </FormHeader>
  );
}

function MobileHeaderPreview() {
  return (
    <Box
      style={{
        maxWidth: 420,
        overflow: 'hidden',
        borderRadius: 16,
        border: '1px solid var(--ds-color-border-secondary)',
      }}
    >
      <MobileHeader
        title="Candidate review"
        onBack={noop}
        rightActions={<Button size="sm" variant="ghost">Share</Button>}
      />
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Header surfaces and page chrome
// ---------------------------------------------------------------------------

const HEADER_SURFACE_TABS = [
  {
    key: 'members',
    label: 'Members',
    badge: <Badge>12</Badge>,
    content: <Text>12 active members across 3 roles.</Text>,
  },
  { key: 'roles', label: 'Roles', content: <Text>3 roles: Admin, Editor, Viewer.</Text> },
  {
    key: 'defaults',
    label: 'Defaults',
    content: <Text>Default role for new invitations: Viewer.</Text>,
  },
];

function HeaderSurfacePreview() {
  return (
    <HeaderSurface
      config={{
        visual: { tabsType: 'line' },
        presentation: {
          chrome: {
            title: 'Team settings',
            subtitle: 'Manage members, roles and defaults for this workspace.',
            breadcrumbs: [{ label: 'Workspace', onClick: noop }, { label: 'Team settings' }],
            badge: <Badge>12 members</Badge>,
            back: { label: 'Workspace', onClick: noop },
          },
          description: 'Changes apply to every member of this workspace.',
          metadata: (
            <Text size="xs" color="muted">
              Last updated 2026-07-11
            </Text>
          ),
        },
        behavior: {
          tabs: HEADER_SURFACE_TABS,
          activeTab: 'members',
          onTabChange: noop,
          actions: [
            { id: 'invite', label: 'Invite member', variant: 'primary', onClick: noop },
            { id: 'export', label: 'Export roster', onClick: noop },
          ],
        },
      }}
    />
  );
}

function SectionFramePreview() {
  return (
    <Stack spacing={16}>
      <SectionFrame index={1} title="Framing" meta="Numbered boundary">
        <Text size="sm" style={{ display: 'block', color: 'var(--ds-color-text-secondary)' }}>
          The mono [01] marker and the rule carry the section boundary; the
          heading level stays a prop so the document outline remains correct.
        </Text>
      </SectionFrame>
      <SectionFrame index={2} title="Sequence" meta="Second section">
        <Text size="sm" style={{ display: 'block', color: 'var(--ds-color-text-secondary)' }}>
          Indices are authored, not derived, so a section keeps its number when
          the page is reordered.
        </Text>
      </SectionFrame>
    </Stack>
  );
}

export {
  CollectionHeaderPreview,
  DashboardHeaderPreview,
  DetailHeaderPreview,
  EditHeaderPreview,
  FormHeaderPreview,
  MobileHeaderPreview,
  HeaderSurfacePreview,
  SectionFramePreview,
};
