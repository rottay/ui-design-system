'use client';

import { type ReactNode } from 'react';
import {
  Box,
  LoadingOverlay,
  Stack,
  SurfaceCapabilityAnatomy,
  SurfaceEmptyState,
  SurfaceErrorState,
  SurfaceLoadingSkeleton,
  SurfaceOfflineBanner,
  SurfaceStaleBanner,
  Text,
} from '@rottay/design-system';

import { noop } from '../foundation';

function LoadingOverlayPreview() {
  return (
    <Box
      style={{
        position: 'relative',
        minHeight: 180,
        borderRadius: 18,
        overflow: 'hidden',
        border: '1px solid var(--ds-color-border-secondary)',
        background:
          'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-bg-secondary) 92%, transparent), color-mix(in srgb, var(--ds-color-bg-primary) 96%, transparent))',
      }}
    >
      <Stack spacing={12} style={{ padding: 18 }}>
        <Text size="sm" weight="semibold">
          Syncing workspace snapshots
        </Text>
        <Text
          size="sm"
          style={{ display: 'block', color: 'var(--ds-color-text-secondary)' }}
        >
          Refreshing queue totals, usage deltas, and escalation routing.
        </Text>
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: 10,
          }}
        >
          {[62, 48, 76].map((width, index) => (
            <Box
              key={`${width}-${index}`}
              style={{
                height: 72,
                borderRadius: 14,
                border: '1px solid var(--ds-color-border-secondary)',
                background:
                  'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-bg-primary) 86%, transparent), color-mix(in srgb, var(--ds-color-bg-secondary) 92%, transparent))',
                padding: 12,
              }}
            >
              <Box
                style={{
                  width: `${width}%`,
                  height: 10,
                  borderRadius: 999,
                  background: 'color-mix(in srgb, var(--ds-color-primary) 18%, transparent)',
                  marginBottom: 12,
                }}
              />
              <Box
                style={{
                  width: `${Math.max(width - 20, 28)}%`,
                  height: 8,
                  borderRadius: 999,
                  background: 'color-mix(in srgb, var(--ds-color-text-muted) 18%, transparent)',
                }}
              />
            </Box>
          ))}
        </Box>
      </Stack>

      <LoadingOverlay
        visible
        message="Syncing records"
        logo={
          <Box
            style={{
              width: 52,
              height: 52,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 16,
              background: 'color-mix(in srgb, var(--ds-color-primary) 18%, transparent)',
              border: '1px solid color-mix(in srgb, var(--ds-color-primary) 28%, transparent)',
            }}
          >
            <Text size="sm" weight="bold" style={{ color: 'var(--ds-color-primary)' }}>
              RT
            </Text>
          </Box>
        }
      />
    </Box>
  );
}

/**
 * One row of the lifecycle preview. The family's whole point is that a surface
 * shows exactly one of these at a time, so the preview labels each moment
 * instead of stacking them anonymously.
 */
function LifecycleMoment({ moment, children }: { moment: string; children: ReactNode }) {
  return (
    <Stack spacing={8}>
      <Text size="xs" color="muted">
        {moment}
      </Text>
      {children}
    </Stack>
  );
}

function SurfaceLifecyclePreview() {
  return (
    <Stack spacing={24}>
      <LifecycleMoment moment="loading — replaces content">
        <SurfaceLoadingSkeleton rows={3} showHeader />
      </LifecycleMoment>
      <LifecycleMoment moment="empty — replaces content">
        <SurfaceEmptyState
          title="No saved views yet"
          description="Save a filter combination to reuse it across sessions."
          action={{ id: 'create-view', label: 'Create view', variant: 'primary', onClick: noop }}
        />
      </LifecycleMoment>
      <LifecycleMoment moment="error — replaces content">
        <SurfaceErrorState
          error={new Error('Request timed out after 30s')}
          title="Could not load workspace"
          onRetry={noop}
        />
      </LifecycleMoment>
      <LifecycleMoment moment="stale — accompanies content">
        <SurfaceStaleBanner
          message="Showing data cached 12 minutes ago."
          onRefresh={noop}
        />
      </LifecycleMoment>
      <LifecycleMoment moment="offline — accompanies content">
        <SurfaceOfflineBanner
          message="You are offline. New records will not appear."
          showCachedNotice
        />
      </LifecycleMoment>
    </Stack>
  );
}

function SurfaceCapabilityAnatomyPreview() {
  return (
    <SurfaceCapabilityAnatomy
      capabilities={[
        { kind: 'route', id: 'workspace.overview', label: 'Overview route' },
        { kind: 'tab', id: 'members', label: 'Members tab' },
        { kind: 'column', id: 'last-seen', label: 'Last seen column' },
        { kind: 'field', id: 'billing-email', label: 'Billing email field' },
        { kind: 'action', id: 'export', label: 'Export', disabled: true },
      ]}
    />
  );
}

export { LoadingOverlayPreview, SurfaceLifecyclePreview, SurfaceCapabilityAnatomyPreview };
