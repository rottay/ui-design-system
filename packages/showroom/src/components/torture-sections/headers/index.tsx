'use client';

import { useState, type CSSProperties } from 'react';
import {
  Box,
  CollectionHeader,
  DashboardHeader,
  DetailHeader,
  EditHeader,
  FormHeader,
  Stack,
  Text,
} from '@rottay/design-system';
import { Icon } from '@rottay/design-system/icons';

// `EditHeader.icon` and `FormHeader.icon` are `ComponentType` slots whose owners
// render the icon without an accessibility prop, so the governed semantic role
// is bound here and the slot receives a component.
interface HeaderIconProps {
  readonly className?: string;
  readonly style?: CSSProperties;
  readonly 'data-part'?: string;
}

function WorkspaceEntityIcon(props: HeaderIconProps) {
  return <Icon name="entity.organization" decorative {...props} />;
}

// Fixed fixtures for the WO-SKIN-06 checkpoint CK-B/S structures/headers
// data-part probe (DetailHeader, EditHeader, FormHeader, CollectionHeader,
// DashboardHeader). Per the checkpoint contract this half is FOUR
// independent token sets (Edit=Form share one archetype recipe byte-for-
// byte; Detail is the same 8-layer shape with every numeric value
// diverging; Collection and Dashboard are unrelated) -- fixtures below are
// deliberately per-component and, for the archetype recipe, cover all four
// `archetype` values for Detail AND separately for Edit/Form, since their
// numbers are NOT interchangeable. Every instance is deterministic --
// controlled props only, no live clock, no real navigation -- so the grid
// renders identically on every load. Rendered only behind `?headers=1` so
// no flagship capture sees it. This page is the visual-evidence half;
// HeadersBatch.contract.test.tsx renders its own fixtures directly through
// React Testing Library.
//
// EditHeader's back-button/breadcrumb-link `<style>` block (§4 of the
// contract) is DEAD today -- both rules lose to inline styles on the same
// elements. This page renders EditHeader normally (the dead rule is not
// disarmed here); headers-structures-batch.spec.ts's hover pins are what
// prove the deadness photographically.
const HEADERS_DETAIL_ARCHETYPES = ['editorial', 'control', 'technical', 'governance'] as const;
const HEADERS_DETAIL_SECONDARY_ARCHETYPES = ['control', 'technical', 'governance'] as const;
const HEADERS_TABS = [
  { id: 'overview', label: 'Overview', count: 3 },
  { id: 'activity', label: 'Activity', count: 0 },
  { id: 'settings', label: 'Settings' },
];

function HeadersFbDetailHeader() {
  // Controlled `activeTab` state (not a fixed prop) so
  // headers-structures-batch.spec.ts's tab-click interaction pin actually
  // exercises the isActive->CSS mapping instead of clicking a tab whose
  // "active" prop never changes. This is the first-rendered DetailHeader
  // instance (archetype 'editorial') so the spec's `.first()` selector
  // reaches it.
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <Stack spacing="xs" data-testid="probe-headers-detail">
      <Text size="xs" color="secondary">
        DetailHeader (all 4 archetypes -- Detail-specific numbers, not Edit/Form&apos;s)
      </Text>
      <DetailHeader
        title="Acme Corp (editorial)"
        subtitle="Enterprise customer since 2019"
        avatar="AC"
        status={{ label: 'Active', variant: 'success' }}
        backHref="/customers"
        breadcrumb={[{ label: 'Customers', href: '/customers' }, { label: 'Acme Corp' }]}
        actions={[{ label: 'Edit', onClick: () => undefined }]}
        tabs={HEADERS_TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        metadata={[
          { label: 'Owner', value: 'Ada Lovelace' },
          { label: 'Region', value: 'EMEA', mono: true },
        ]}
        eyebrow="Customer"
        archetype="editorial"
      />
      {HEADERS_DETAIL_SECONDARY_ARCHETYPES.map((archetype) => (
        <DetailHeader
          key={archetype}
          title={`Acme Corp (${archetype})`}
          subtitle="Enterprise customer since 2019"
          avatar="AC"
          status={{ label: 'Active', variant: 'success' }}
          backHref="/customers"
          breadcrumb={[{ label: 'Customers', href: '/customers' }, { label: 'Acme Corp' }]}
          actions={[{ label: 'Edit', onClick: () => undefined }]}
          tabs={HEADERS_TABS}
          activeTab="overview"
          onTabChange={() => undefined}
          metadata={[
            { label: 'Owner', value: 'Ada Lovelace' },
            { label: 'Region', value: 'EMEA', mono: true },
          ]}
          eyebrow="Customer"
          archetype={archetype}
        />
      ))}
      <Text size="xs" color="secondary">
        DetailHeader (avatar image variant, no tabs, no metadata)
      </Text>
      {/* renderAvatarNode picks the image branch only for a string
          starting with 'http' or '/' -- a broken-image glyph is fine
          evidence for the chrome/layout this probe captures. */}
      <DetailHeader title="Grace Hopper" backHref="/people" avatar="/probe-avatar-placeholder.png" />
    </Stack>
  );
}

function HeadersFbEditHeader() {
  return (
    <Stack spacing="xs" data-testid="probe-headers-edit">
      <Text size="xs" color="secondary">
        EditHeader (all 4 archetypes -- byte-identical recipe to FormHeader, NOT Detail&apos;s)
      </Text>
      {HEADERS_DETAIL_ARCHETYPES.map((archetype) => (
        <EditHeader
          key={archetype}
          icon={WorkspaceEntityIcon}
          title={`Edit workspace (${archetype})`}
          subtitle="Editing workspace settings"
          entityId="ws_9f8e7d6c5b4a"
          backHref="/workspaces"
          colorVariant="primary"
          breadcrumb={[{ label: 'Workspaces', href: '/workspaces' }, { label: 'Current' }]}
          status={{ label: 'Draft', color: 'warning' }}
          archetype={archetype}
          eyebrow="Workspace"
          onSave={() => undefined}
          onCancel={() => undefined}
        />
      ))}
      <Text size="xs" color="secondary">
        EditHeader (loading)
      </Text>
      <EditHeader title="Loading" backHref="/x" loading />
    </Stack>
  );
}

function HeadersFbFormHeader() {
  return (
    <Stack spacing="xs" data-testid="probe-headers-form">
      <Text size="xs" color="secondary">
        FormHeader (all 4 archetypes -- byte-identical recipe to EditHeader)
      </Text>
      {HEADERS_DETAIL_ARCHETYPES.map((archetype) => (
        <FormHeader
          key={archetype}
          icon={WorkspaceEntityIcon}
          title={`Create workspace (${archetype})`}
          subtitle="Set up a new workspace"
          backHref="/workspaces"
          colorVariant="success"
          breadcrumb={[{ label: 'Workspaces', href: '/workspaces' }]}
          actions={[{ label: 'Create', onClick: () => undefined }]}
          archetype={archetype}
          eyebrow="New"
        />
      ))}
    </Stack>
  );
}

function HeadersFbCollectionHeader() {
  return (
    <Stack spacing="xs" data-testid="probe-headers-collection">
      <Text size="xs" color="secondary">
        CollectionHeader (dotted title, editorial-tech, quickActions all 3 variants, meta-item all 3 tones)
      </Text>
      <CollectionHeader
        eyebrow="Workspace"
        title="Candidates"
        titleTreatment="dotted"
        subtitle="All active candidates across the pipeline"
        layoutVariant="editorial-tech"
        metaItems={[
          { key: 'a', label: '12 active', tone: 'primary' },
          { key: 'b', label: '3 flagged', tone: 'success' },
          { key: 'c', label: 'Neutral', tone: 'neutral' },
        ]}
        shortcuts={[{ key: 's', label: '⌘K search' }]}
        quickActions={[
          {
            key: 'q1',
            label: 'Invite',
            onClick: () => undefined,
            variant: 'primary',
          },
          {
            key: 'q2',
            label: 'Export',
            onClick: () => undefined,
            variant: 'secondary',
          },
          { key: 'q3', label: 'More', onClick: () => undefined },
        ]}
        surfaceVariant="default"
      />
      <Text size="xs" color="secondary">
        CollectionHeader (display title, embedded, no quickActions -- title-accent + no-quickActions secondary-rail
        branch)
      </Text>
      <CollectionHeader
        eyebrow="Workspace"
        title="Overview"
        titleTreatment="display"
        subtitle="Program overview"
        metaItems={[{ key: 'a', label: '4 items', tone: 'neutral' }]}
        shortcuts={[{ key: 's', label: '⌘K search' }]}
        surfaceVariant="embedded"
      />
      <Text size="xs" color="secondary">
        CollectionHeader (default title treatment, default layout, not embedded)
      </Text>
      <CollectionHeader eyebrow="Workspace" title="Reports" subtitle="Weekly report summary" surfaceVariant="default" />
      {/* The quick-actions PILL container's background/boxShadow only
          branch on `editorialTech` when `embedded` is true (not-embedded
          collapses to one value regardless of editorialTech), and the pill
          only renders at all when quickActions is non-empty. These two
          instances cover the two embedded+quickActions states. */}
      <Text size="xs" color="secondary">
        CollectionHeader (embedded, editorial-tech, quickActions -- quick-actions pill embedded+editorialTech branch)
      </Text>
      <CollectionHeader
        eyebrow="Workspace"
        title="Pipeline"
        titleTreatment="dotted"
        subtitle="Embedded editorial-tech with quick actions"
        layoutVariant="editorial-tech"
        quickActions={[
          {
            key: 'q1',
            label: 'Invite',
            onClick: () => undefined,
            variant: 'primary',
          },
        ]}
        surfaceVariant="embedded"
      />
      <Text size="xs" color="secondary">
        CollectionHeader (embedded, default layout, quickActions -- quick-actions pill embedded+non-editorialTech
        branch)
      </Text>
      <CollectionHeader
        eyebrow="Workspace"
        title="Pipeline"
        subtitle="Embedded default layout with quick actions"
        quickActions={[{ key: 'q1', label: 'Invite', onClick: () => undefined }]}
        surfaceVariant="embedded"
      />
    </Stack>
  );
}

function HeadersFbDashboardHeader() {
  return (
    <Stack spacing="xs" data-testid="probe-headers-dashboard">
      <Text size="xs" color="secondary">
        DashboardHeader (compact, status=live -- animating; toHaveScreenshot freezes CSS animations by default, see REST
        TRUTH note in the spec)
      </Text>
      <DashboardHeader
        title="Overview"
        icon={<Icon name="analytics.dashboard" decorative style={{ width: 16, height: 16 }} />}
        status={{ state: 'live' }}
        metrics={[
          {
            key: 'm1',
            label: 'Users',
            value: 128,
            change: { value: '4%', direction: 'up' },
          },
        ]}
        actions={[{ key: 'a1', label: 'Refresh', onClick: () => undefined }]}
        compact
      />
      <Text size="xs" color="secondary">
        DashboardHeader (full, status=connected -- static, all 3 metric-change directions)
      </Text>
      <DashboardHeader
        title="Overview"
        subtitle="Live operational metrics"
        icon={<Icon name="analytics.dashboard" decorative style={{ width: 18, height: 18 }} />}
        status={{ state: 'connected' }}
        metrics={[
          {
            key: 'm1',
            label: 'Users',
            value: 128,
            change: { value: '4%', direction: 'up' },
          },
          {
            key: 'm2',
            label: 'Errors',
            value: 3,
            change: { value: '2%', direction: 'down' },
          },
          {
            key: 'm3',
            label: 'Latency',
            value: '120ms',
            change: { value: '0%', direction: 'flat' },
          },
        ]}
        actions={[
          { key: 'a1', label: 'Refresh', onClick: () => undefined },
          {
            key: 'a2',
            label: 'Export',
            onClick: () => undefined,
            variant: 'primary',
          },
        ]}
      />
      <Text size="xs" color="secondary">
        DashboardHeader (full, status=syncing -- animating)
      </Text>
      <DashboardHeader
        title="Overview"
        status={{ state: 'syncing' }}
        metrics={[{ key: 'm1', label: 'Sync', value: '82%' }]}
      />
      <Text size="xs" color="secondary">
        DashboardHeader (full, status=offline)
      </Text>
      <DashboardHeader title="Overview" status={{ state: 'offline' }} />
      <Text size="xs" color="secondary">
        DashboardHeader (full, status=warning)
      </Text>
      <DashboardHeader title="Overview" status={{ state: 'warning' }} />
    </Stack>
  );
}

export function HeadersFbStates() {
  return (
    <Box
      data-testid="probe-headers"
      style={{
        borderRadius: 16,
        border: '1px solid var(--ds-color-border)',
        background: 'var(--ds-color-bg-elevated)',
        padding: 16,
      }}
    >
      <Stack spacing="lg" fullWidth>
        <HeadersFbDetailHeader />
        <HeadersFbEditHeader />
        <HeadersFbFormHeader />
        <HeadersFbCollectionHeader />
        <HeadersFbDashboardHeader />
      </Stack>
    </Box>
  );
}
