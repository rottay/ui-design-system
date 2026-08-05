'use client';

import { type CSSProperties } from 'react';
import {
  Box,
  PatternEmptyState,
  PatternFileManager,
  PatternPricingTable,
  PatternUserProfileCard,
  Stack,
  Text,
  TokenInspector,
} from '@rottay/design-system';
import { Icon } from '@rottay/design-system/icons';

// ---------------------------------------------------------------------------
// WO-SKIN-06 CK-H2 -- category-A misc family torture section (?miscH2=1).
//
// Every bounded state that selects paint is present in the inert fixture:
// file-manager list/grid selection plus all MIME branches and empty/loading;
// user-profile full/compact, all four statuses, online/offline, action variants
// and loading; pricing monthly/yearly, highlighted/plain plans and all three
// feature values plus loading; empty-state actions plus loading. TokenInspector
// is mounted inactive because its public contract is keyboard-driven; the
// visual spec activates it, feeds it a deterministic target, then pins/unpins.
// ---------------------------------------------------------------------------

const MISC_H2_FILES = [
  {
    id: 'image-1',
    name: 'campaign-photo.jpg',
    type: 'file' as const,
    mimeType: 'image/jpeg',
    size: 512_000,
    modifiedAt: '2026-07-12T12:00:00.000Z',
  },
  {
    id: 'pdf-1',
    name: 'quarterly-report.pdf',
    type: 'file' as const,
    mimeType: 'application/pdf',
    size: 2_048_000,
    modifiedAt: '2026-07-11T12:00:00.000Z',
  },
  {
    id: 'text-1',
    name: 'release-notes.txt',
    type: 'file' as const,
    mimeType: 'text/plain',
    size: 8_192,
    modifiedAt: '2026-07-10T12:00:00.000Z',
  },
  {
    id: 'other-1',
    name: 'workspace.bin',
    type: 'file' as const,
    mimeType: 'application/octet-stream',
    size: 64_000,
    modifiedAt: '2026-07-09T12:00:00.000Z',
  },
];

const MISC_H2_FOLDERS = [
  {
    id: 'folder-1',
    name: 'Brand assets',
    type: 'folder' as const,
    childCount: 12,
    modifiedAt: '2026-07-13T12:00:00.000Z',
  },
];

const MISC_H2_SELECTED = ['folder-1', 'pdf-1'];

const MISC_H2_PROFILE_ACTIONS = [
  {
    key: 'message',
    label: 'Message',
    variant: 'primary' as const,
    onClick: () => undefined,
  },
  { key: 'archive', label: 'Archive', onClick: () => undefined },
  {
    key: 'remove',
    label: 'Remove',
    variant: 'danger' as const,
    disabled: true,
    onClick: () => undefined,
  },
];

const MISC_H2_PROFILES = [
  {
    name: 'Ari Chen',
    role: 'Platform lead',
    email: 'ari@example.test',
    department: 'Platform',
    status: 'active' as const,
  },
  {
    name: 'Bea Costa',
    role: 'Product designer',
    email: 'bea@example.test',
    department: 'Design',
    status: 'away' as const,
  },
  {
    name: 'Cy Diaz',
    role: 'Security engineer',
    email: 'cy@example.test',
    department: 'Security',
    status: 'busy' as const,
  },
  {
    name: 'Dee Evans',
    role: 'Support manager',
    email: 'dee@example.test',
    department: 'Support',
    status: 'offline' as const,
  },
];

const MISC_H2_PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 19,
    description: 'For small teams',
    priceNote: 'per workspace',
    cta: 'Start free',
    popular: false,
    features: { storage: '5 GB', automation: false, support: true },
  },
  {
    id: 'scale',
    name: 'Scale',
    price: 79,
    description: 'For growing operations',
    priceNote: 'per workspace',
    cta: 'Choose Scale',
    popular: true,
    features: { storage: 'Unlimited', automation: true, support: false },
  },
];

const MISC_H2_FEATURES = [
  {
    key: 'storage',
    label: 'Storage',
    description: 'Included object storage',
    category: 'Capacity',
  },
  { key: 'automation', label: 'Workflow automation', category: 'Operations' },
  { key: 'support', label: 'Priority support', category: 'Operations' },
];

const MISC_H2_GROUP_STYLE: CSSProperties = {
  border: '1px solid var(--ds-color-border)',
  borderRadius: 12,
  padding: 16,
};

export function MiscH2FbStates() {
  return (
    <Box
      data-testid="probe-misc-h2"
      style={{
        borderRadius: 16,
        border: '1px solid var(--ds-color-border)',
        background: 'var(--ds-color-bg-elevated)',
        padding: 16,
      }}
    >
      <Stack spacing="lg" fullWidth>
        <Stack spacing="sm" data-testid="probe-misc-h2-file-manager">
          <Text size="xs" color="secondary">
            File manager -- list/grid, MIME, selection, empty/loading
          </Text>
          <Box data-testid="probe-misc-h2-file-list" style={MISC_H2_GROUP_STYLE}>
            <PatternFileManager
              files={MISC_H2_FILES}
              folders={MISC_H2_FOLDERS}
              currentPath={['Workspace', 'Assets']}
              viewMode="list"
              selectedItems={MISC_H2_SELECTED}
              onUpload={() => undefined}
              onDelete={() => undefined}
              onRename={() => undefined}
              onNavigate={() => undefined}
              onSelectionChange={() => undefined}
              onViewModeChange={() => undefined}
            />
          </Box>
          <Box data-testid="probe-misc-h2-file-grid" style={MISC_H2_GROUP_STYLE}>
            <PatternFileManager
              files={MISC_H2_FILES}
              folders={MISC_H2_FOLDERS}
              viewMode="grid"
              selectedItems={MISC_H2_SELECTED}
              onNavigate={() => undefined}
              onSelectionChange={() => undefined}
              onViewModeChange={() => undefined}
            />
          </Box>
          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: 12,
            }}
          >
            <Box data-testid="probe-misc-h2-file-empty" style={MISC_H2_GROUP_STYLE}>
              <PatternFileManager files={[]} folders={[]} emptyMessage="No workspace files" />
            </Box>
            <Box data-testid="probe-misc-h2-file-loading" style={MISC_H2_GROUP_STYLE}>
              <PatternFileManager files={[]} folders={[]} loading />
            </Box>
          </Box>
        </Stack>

        <Stack spacing="sm" data-testid="probe-misc-h2-user-profile">
          <Text size="xs" color="secondary">
            User profile -- full/compact, statuses, online/offline, actions/loading
          </Text>
          <Box
            data-testid="probe-misc-h2-user-full"
            style={{
              ...MISC_H2_GROUP_STYLE,
              display: 'grid',
              gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
              gap: 12,
            }}
          >
            {MISC_H2_PROFILES.map((user, index) => (
              <PatternUserProfileCard
                key={user.name}
                user={user}
                variant="full"
                online={index % 2 === 0}
                actions={index === 0 ? MISC_H2_PROFILE_ACTIONS : []}
              />
            ))}
          </Box>
          <Box
            data-testid="probe-misc-h2-user-compact"
            style={{
              ...MISC_H2_GROUP_STYLE,
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: 12,
            }}
          >
            <PatternUserProfileCard user={MISC_H2_PROFILES[0]} variant="compact" online />
            <PatternUserProfileCard user={MISC_H2_PROFILES[3]} variant="compact" online={false} />
          </Box>
          <Box data-testid="probe-misc-h2-user-loading" style={MISC_H2_GROUP_STYLE}>
            <PatternUserProfileCard user={MISC_H2_PROFILES[0]} loading />
          </Box>
        </Stack>

        <Stack spacing="sm" data-testid="probe-misc-h2-pricing">
          <Text size="xs" color="secondary">
            Pricing -- monthly/yearly, highlighted/plain, feature tri-state, loading
          </Text>
          <Box data-testid="probe-misc-h2-pricing-monthly" style={MISC_H2_GROUP_STYLE}>
            <PatternPricingTable
              plans={MISC_H2_PLANS}
              features={MISC_H2_FEATURES}
              highlightedPlan="scale"
              billingCycle="monthly"
              onBillingCycleChange={() => undefined}
              onSelectPlan={() => undefined}
            />
          </Box>
          <Box data-testid="probe-misc-h2-pricing-yearly" style={MISC_H2_GROUP_STYLE}>
            <PatternPricingTable
              plans={MISC_H2_PLANS}
              features={MISC_H2_FEATURES}
              highlightedPlan="scale"
              billingCycle="yearly"
              onBillingCycleChange={() => undefined}
              onSelectPlan={() => undefined}
            />
          </Box>
          <Box data-testid="probe-misc-h2-pricing-loading" style={MISC_H2_GROUP_STYLE}>
            <PatternPricingTable plans={MISC_H2_PLANS} features={MISC_H2_FEATURES} billingCycle="monthly" loading />
          </Box>
        </Stack>

        <Stack spacing="sm" data-testid="probe-misc-h2-empty-state">
          <Text size="xs" color="secondary">
            Empty state -- primary/default/secondary actions and loading
          </Text>
          <Box
            data-testid="probe-misc-h2-empty-actions"
            style={{
              ...MISC_H2_GROUP_STYLE,
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: 12,
            }}
          >
            <PatternEmptyState
              icon={<Icon name="feedback.empty" decorative />}
              title="No candidates yet"
              description="Create the first candidate or review the guide."
              action={{
                label: 'Create candidate',
                variant: 'primary',
                onClick: () => undefined,
              }}
              secondaryAction={{
                label: 'Open guide',
                onClick: () => undefined,
              }}
            />
            <PatternEmptyState
              icon={<Icon name="action.refresh" decorative />}
              title="No matching records"
              description="Reset the current filters."
              action={{
                label: 'Reset filters',
                variant: 'default',
                onClick: () => undefined,
              }}
            />
          </Box>
          <Box data-testid="probe-misc-h2-empty-loading" style={MISC_H2_GROUP_STYLE}>
            <PatternEmptyState title="Loading records" loading />
          </Box>
        </Stack>

        <Stack spacing="sm" data-testid="probe-misc-h2-token-inspector">
          <Text size="xs" color="secondary">
            Token inspector -- activate with Ctrl+Shift+T, hover target, click to pin
          </Text>
          <Box
            data-testid="probe-misc-h2-token-target"
            style={
              {
                ...MISC_H2_GROUP_STYLE,
                '--ds-misc-h2-inspector-font': 'monospace',
                background: 'var(--ds-color-bg-primary)',
                color: 'var(--ds-color-text-primary)',
                boxShadow: 'var(--ds-elevation-1)',
                fontFamily: 'var(--ds-misc-h2-inspector-font)',
              } as CSSProperties
            }
          >
            Deterministic token target
          </Box>
          <TokenInspector />
        </Stack>
      </Stack>
    </Box>
  );
}
