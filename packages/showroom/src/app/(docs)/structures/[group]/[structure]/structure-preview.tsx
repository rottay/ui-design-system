'use client';

import type { ReactNode } from 'react';
import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Input,
  Stack,
  Text,
} from '@rottay/design-system';
import {
  SHOWROOM_SURFACES,
  mixWithCanvas,
  mixWithSurface,
} from '@/components/playground/surface-tokens';
import { structures } from '@/data/registry';
import type { StructureGroup } from '@/data/registry';
import { STRUCTURE_PREVIEWS } from './structure-preview-fixtures';

const GROUP_META: Record<
  StructureGroup,
  { label: string; note: string; minHeight: number }
> = {
  headers: {
    label: 'Header structure',
    note: 'Check whether the page starts with context, count, and action priority in the right order.',
    minHeight: 180,
  },
  workspace: {
    label: 'Workspace structure',
    note: 'Check how controls cluster together and whether the page feels operable instead of crowded.',
    minHeight: 196,
  },
  record: {
    label: 'Record structure',
    note: 'Check how detail information is sectioned and whether primary context survives long forms.',
    minHeight: 200,
  },
  dashboard: {
    label: 'Dashboard structure',
    note: 'Check whether insight modules cooperate and create a deliberate scan path.',
    minHeight: 228,
  },
  feedback: {
    label: 'Feedback structure',
    note: 'Check how waiting and transition states reassure the user without feeling dead or generic.',
    minHeight: 172,
  },
};

const GROUP_ACCENTS: Record<StructureGroup, string> = {
  headers: '#60a5fa',
  workspace: '#34d399',
  record: '#a78bfa',
  dashboard: '#f59e0b',
  feedback: '#fb7185',
};

function renderGenericStructurePreview(entry: {
  group: StructureGroup;
  name: string;
}): ReactNode {
  switch (entry.group) {
    case 'headers':
      return (
        <Box
          style={{
            padding: '12px 16px',
            borderRadius: 14,
            border: '1px solid var(--ds-color-border)',
            background: 'linear-gradient(180deg, var(--ds-color-bg-container) 0%, var(--ds-color-bg-secondary) 100%)',
          }}
        >
          <Flex align="center" justify="between" gap={12} style={{ flexWrap: 'wrap' }}>
            <Text size="lg" weight="bold" style={{ display: 'block', flex: '1 1 200px', minWidth: 0, lineHeight: 1.15 }}>
              {entry.name}
            </Text>
            <Flex gap={8} style={{ flexWrap: 'wrap' }}>
              <Badge variant="secondary">42 items</Badge>
              <Button size="sm" variant="primary">
                Primary action
              </Button>
            </Flex>
          </Flex>
        </Box>
      );
    case 'workspace':
      return (
        <Stack spacing={10}>
          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) auto auto',
              gap: 8,
            }}
          >
            <Input placeholder="Search workspace" style={{ minWidth: 0 }} />
            <Button size="sm">Filters</Button>
            <Button size="sm" variant="primary">
              Export
            </Button>
          </Box>
          <Box
            style={{
              padding: '12px 14px',
              borderRadius: 14,
              border: '1px solid var(--ds-color-border)',
              background: 'linear-gradient(180deg, var(--ds-color-bg-container) 0%, var(--ds-color-bg-secondary) 100%)',
            }}
          >
            <Text size="sm" style={{ display: 'block' }}>
              Workspace controls stay grouped and scannable here.
            </Text>
          </Box>
        </Stack>
      );
    case 'record':
      return (
        <Flex gap={12} style={{ flexWrap: 'wrap' }}>
          <Box
            style={{
              flex: '1 1 220px',
              padding: 14,
              borderRadius: 14,
              border: '1px solid var(--ds-color-border)',
              background: 'linear-gradient(180deg, var(--ds-color-bg-container) 0%, var(--ds-color-bg-secondary) 100%)',
            }}
          >
            <Text size="sm" weight="semibold" style={{ display: 'block' }}>
              Primary details
            </Text>
            <Text
              size="xs"
              style={{ display: 'block', marginTop: 8, color: 'var(--ds-color-text-secondary)' }}
            >
              Name, status, ownership, and critical metadata should land first.
            </Text>
          </Box>
          <Box
            style={{
              flex: '1 1 180px',
              padding: 14,
              borderRadius: 14,
              border: '1px solid var(--ds-color-border)',
              background: 'linear-gradient(180deg, var(--ds-color-bg-secondary) 0%, var(--ds-color-bg-container) 100%)',
            }}
          >
            <Text size="sm" weight="semibold" style={{ display: 'block' }}>
              Supporting aside
            </Text>
          </Box>
        </Flex>
      );
    case 'dashboard':
      return (
        <Stack spacing={10}>
          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: 10,
            }}
          >
            {['Revenue', 'Users', 'Completion'].map((stat) => (
              <Card
                key={stat}
                style={{
                  padding: 14,
                  border: '1px solid var(--ds-color-border)',
                  background: 'linear-gradient(180deg, var(--ds-color-bg-container) 0%, var(--ds-color-bg-secondary) 100%)',
                }}
              >
                <Text size="xs" style={{ display: 'block', color: 'var(--ds-color-text-muted)' }}>
                  {stat}
                </Text>
                <Text size="lg" weight="bold" style={{ display: 'block' }}>
                  94
                </Text>
              </Card>
            ))}
          </Box>
          <Card
            style={{
              padding: 14,
              border: '1px solid var(--ds-color-border)',
              background: 'linear-gradient(180deg, var(--ds-color-bg-container) 0%, var(--ds-color-bg-secondary) 100%)',
            }}
          >
            <Stack spacing={8}>
              <Flex align="center" justify="between" gap={10}>
                <Text size="sm" weight="semibold" style={{ display: 'block' }}>
                  Insight summary
                </Text>
                <Badge variant="secondary">Live</Badge>
              </Flex>
              <Box
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                  gap: 8,
                }}
              >
                {[42, 68, 57].map((value, index) => (
                  <Box
                    key={`${value}-${index}`}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 10,
                      background: 'var(--ds-color-bg-secondary)',
                      border: '1px solid var(--ds-color-border)',
                    }}
                  >
                    <Text
                      size="xs"
                      style={{ display: 'block', color: 'var(--ds-color-text-muted)' }}
                    >
                      Segment {index + 1}
                    </Text>
                    <Text
                      size="sm"
                      weight="semibold"
                      style={{ display: 'block', marginTop: 4 }}
                    >
                      {value}%
                    </Text>
                  </Box>
                ))}
              </Box>
            </Stack>
          </Card>
        </Stack>
      );
    case 'feedback':
      return (
        <Box
          style={{
            minHeight: 140,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 14,
            border: '1px solid var(--ds-color-border)',
            background: 'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-primary-500) 8%, var(--ds-color-bg-container)) 0%, var(--ds-color-bg-secondary) 100%)',
          }}
        >
          <Stack spacing={10} align="center">
            <Badge variant="primary">Loading</Badge>
            <Text size="sm" style={{ display: 'block' }}>
              Waiting state with purpose, not just emptiness.
            </Text>
          </Stack>
        </Box>
      );
    default:
      return null;
  }
}

export function StructurePreview({
  slug,
  compact = false,
}: {
  slug: string;
  compact?: boolean;
}) {
  const entry = structures.find((structure) => structure.slug === slug);
  const preview =
    STRUCTURE_PREVIEWS[slug] ??
    (entry ? renderGenericStructurePreview(entry) : null);
  const meta = entry ? GROUP_META[entry.group] : null;

  if (!preview) {
    return (
      <Box
        style={{
          minHeight: compact ? 144 : 200,
          padding: compact ? 16 : 20,
          textAlign: 'center',
          color: SHOWROOM_SURFACES.textTertiary,
          borderRadius: 18,
          border: `1px dashed ${SHOWROOM_SURFACES.border}`,
          background: `linear-gradient(180deg, ${SHOWROOM_SURFACES.subtle} 0%, ${SHOWROOM_SURFACES.surface} 100%)`,
        }}
      >
        <Stack spacing={8} align="center">
          <Text
            size="sm"
            weight="semibold"
            style={{ display: 'block', color: SHOWROOM_SURFACES.text }}
          >
            Preview coming soon
          </Text>
          <Text
            size="xs"
            style={{ display: 'block', color: SHOWROOM_SURFACES.textSecondary }}
          >
            No live scaffold is registered for <strong>{slug}</strong> yet.
          </Text>
        </Stack>
      </Box>
    );
  }

  const accent = entry ? GROUP_ACCENTS[entry.group] : 'var(--ds-color-primary, #60a5fa)';

  if (compact) {
    return (
      <Stack spacing={10}>
        <Box
          style={{
            padding: '10px 12px',
            borderRadius: 14,
            border: `1px solid ${SHOWROOM_SURFACES.border}`,
            background: `linear-gradient(180deg, ${mixWithCanvas(
              accent,
              8,
            )} 0%, ${SHOWROOM_SURFACES.subtle} 100%)`,
            boxShadow: SHOWROOM_SURFACES.shadow,
          }}
        >
          <Text size="xs" weight="semibold" style={{ display: 'block', color: SHOWROOM_SURFACES.textTertiary, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {meta?.label ?? 'Structure preview'}
          </Text>
          <Text size="xs" style={{ display: 'block', marginTop: 6, color: SHOWROOM_SURFACES.textSecondary, lineHeight: 1.55 }}>
            {meta?.note ?? 'Compact preview'}
          </Text>
        </Box>

        <Box
          style={{
            padding: 12,
            borderRadius: 18,
            border: `1px solid ${SHOWROOM_SURFACES.border}`,
            background: `linear-gradient(180deg, ${mixWithCanvas(
              accent,
              9,
            )} 0%, ${SHOWROOM_SURFACES.subtle} 100%)`,
            boxShadow: SHOWROOM_SURFACES.shadow,
          }}
        >
          <Box
            style={{
              minHeight: Math.max((meta?.minHeight ?? 200) - 88, 128),
              padding: 14,
              borderRadius: 14,
              border: `1px solid ${SHOWROOM_SURFACES.border}`,
              background: `linear-gradient(180deg, ${SHOWROOM_SURFACES.surface} 0%, ${mixWithSurface(
                accent,
                8,
                SHOWROOM_SURFACES.surface,
              )} 100%)`,
              overflowX: 'auto',
            }}
          >
            <Box style={{ width: '100%', minWidth: 0 }}>{preview}</Box>
          </Box>
        </Box>
      </Stack>
    );
  }

  return (
    <Stack spacing={10}>
      <Box
        style={{
          padding: '10px 12px',
          borderRadius: 14,
          border: `1px solid ${SHOWROOM_SURFACES.border}`,
          background: `linear-gradient(180deg, ${mixWithCanvas(
            accent,
            8,
          )} 0%, ${SHOWROOM_SURFACES.subtle} 100%)`,
          boxShadow: SHOWROOM_SURFACES.shadow,
        }}
      >
        <Flex align="start" justify="between" gap={10} style={{ flexWrap: 'wrap' }}>
          <Text size="xs" weight="semibold" style={{ display: 'block', color: SHOWROOM_SURFACES.textTertiary, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {meta?.label ?? 'Structure preview'}
          </Text>
          <Box
            style={{
              maxWidth: 360,
              padding: '6px 8px',
              borderRadius: 10,
              border: `1px solid ${SHOWROOM_SURFACES.border}`,
              background: SHOWROOM_SURFACES.surface,
            }}
          >
            <Text
              size="xs"
              style={{ display: 'block', color: SHOWROOM_SURFACES.textSecondary, lineHeight: 1.45 }}
            >
              {meta?.note ?? 'Rendered with the active tenant'}
            </Text>
          </Box>
        </Flex>
      </Box>

      <Box
        style={{
          padding: 12,
          borderRadius: 20,
          border: `1px solid ${SHOWROOM_SURFACES.border}`,
          background: `linear-gradient(180deg, ${mixWithCanvas(
            accent,
            8,
          )} 0%, ${SHOWROOM_SURFACES.subtle} 100%)`,
          boxShadow: `inset 0 1px 0 ${mixWithSurface(accent, 10, 'transparent')}`,
        }}
      >
        <Box
          style={{
            minHeight: Math.max((meta?.minHeight ?? 200) - 52, 140),
            padding: 16,
            borderRadius: 18,
            border: `1px solid ${SHOWROOM_SURFACES.border}`,
            background: `linear-gradient(180deg, ${SHOWROOM_SURFACES.surface} 0%, ${mixWithSurface(
              accent,
              8,
              SHOWROOM_SURFACES.surface,
            )} 100%)`,
            overflowX: 'auto',
          }}
        >
          <Flex gap={6} style={{ marginBottom: 12 }}>
            {['12%', '20%', '28%'].map((opacity, index) => (
              <Box
                key={`${slug}-${index}`}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  background: `color-mix(in srgb, ${accent} ${opacity}, ${SHOWROOM_SURFACES.text})`,
                }}
              />
            ))}
          </Flex>
          <Box style={{ width: '100%', minWidth: 0 }}>{preview}</Box>
        </Box>
      </Box>
    </Stack>
  );
}
