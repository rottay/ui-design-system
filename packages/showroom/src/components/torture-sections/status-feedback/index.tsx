'use client';

import { Box, Stack, Text, Alert, Progress, Skeleton, Spinner, Rate } from '@rottay/design-system';

// Fixed fixtures for the WO-SKIN-03 checkpoint S status-family data-part
// probe (Skeleton, Alert, Progress, Spinner, Rate). Every instance below is
// deterministic -- controlled/defaultValue-seeded, never a live clock -- so
// the grid renders identically on every load. Rendered only behind
// `?statusfb=1` so no flagship capture sees it. This section is what
// `status-batch.spec.ts` photographs and `StatusBatch.contract.test.tsx`
// asserts the stamped data-part/data-status/data-tone/data-state attributes
// against (this page is the visual-evidence half; the contract test renders
// its own fixtures directly through React Testing Library).
export function StatusFbStates() {
  return (
    <Box
      data-testid="probe-statusfb"
      style={{
        borderRadius: 16,
        border: '1px solid var(--ds-color-border)',
        background: 'var(--ds-color-bg-elevated)',
        padding: 16,
      }}
    >
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 16,
        }}
      >
        <Stack spacing="xs" data-testid="probe-statusfb-alert">
          <Text size="xs" color="secondary">
            Alert
          </Text>
          <Alert type="info" message="Info alert" description="Informational description text." />
          <Alert type="success" message="Success alert" description="Everything worked." />
          <Alert type="warning" message="Warning alert" description="Something needs attention." />
          <Alert type="error" message="Error alert" description="Something went wrong." />
          <Alert type="info" message="Closable alert" closable onClose={() => undefined} />
        </Stack>

        <Stack spacing="xs" data-testid="probe-statusfb-progress">
          <Text size="xs" color="secondary">
            Progress
          </Text>
          <Progress type="line" percent={42} status="normal" />
          <Progress type="line" percent={42} status="success" />
          <Progress type="line" percent={42} status="error" />
          <Progress type="line" percent={42} status="active" />
          <Progress type="circle" percent={42} status="normal" />
          <Progress.Line percent={42} />
          <Progress.Circle percent={42} size={80} />
        </Stack>

        <Stack spacing="xs" data-testid="probe-statusfb-skeleton">
          <Text size="xs" color="secondary">
            Skeleton
          </Text>
          {/* Shape-variant branch (engines/*.tsx early return) */}
          <Skeleton variant="rounded" width="100%" height={80} />
          {/* Text/default-variant branch (avatar + title + paragraph) */}
          <Skeleton avatar title paragraph={{ rows: 3 }} />
          <Skeleton.Avatar size="lg" shape="circle" />
          <Skeleton.Text lines={3} />
          <Skeleton.Paragraph lines={3} lastLineWidth="45%" />
          <Skeleton.Button size="md" shape="round" />
          <Skeleton.Card hasImage lines={2} />
          <Skeleton.ListItem hasAvatar lines={2} />
          <Skeleton.Form fields={3} />
          <Skeleton.Table rows={3} columns={4} />
        </Stack>

        <Stack spacing="xs" data-testid="probe-statusfb-spinner">
          <Text size="xs" color="secondary">
            Spinner
          </Text>
          <Spinner size="sm" label="Small" />
          <Spinner size="md" label="Medium" />
          <Spinner size="lg" label="Large" />
          <Spinner size="xl" label="Extra large" />
        </Stack>

        <Stack spacing="xs" data-testid="probe-statusfb-rate">
          <Text size="xs" color="secondary">
            Rate
          </Text>
          <Rate defaultValue={5} count={5} onChange={() => undefined} />
          <Rate defaultValue={2.5} allowHalf onChange={() => undefined} />
          <Rate defaultValue={3} readOnly onChange={() => undefined} />
          <Rate defaultValue={3} disabled onChange={() => undefined} />
        </Stack>
      </Box>
    </Box>
  );
}
