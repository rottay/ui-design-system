'use client';

import { Badge, Box, Card, Flex, Stack, Text } from '@rottay/design-system';
import {
  SHOWROOM_SURFACES,
  mixWithCanvas,
  mixWithSurface,
} from '@/components/playground/surface-tokens';
import { patterns } from '@/data/registry';
import type { PatternGroup } from '@/data/registry';
import { renderPatternPreview } from './pattern-preview-fixtures';

const GROUP_META: Record<
  PatternGroup,
  { label: string; note: string; minHeight: number }
> = {
  data: {
    label: 'Data pattern',
    note: 'Check scanning speed, selection, and whether the runtime is coming from the real DS export.',
    minHeight: 220,
  },
  forms: {
    label: 'Form pattern',
    note: 'Check pacing, hierarchy, and whether the live component still feels teachable when the runtime changes.',
    minHeight: 220,
  },
  visualization: {
    label: 'Visualization pattern',
    note: 'Check signal readability, interaction cues, and how clearly real DS rendering survives engine changes.',
    minHeight: 220,
  },
  communication: {
    label: 'Communication pattern',
    note: 'Check freshness, authorship, and whether the information hierarchy stays legible across runtimes.',
    minHeight: 220,
  },
  workflow: {
    label: 'Workflow pattern',
    note: 'Check queue clarity, decision support, and whether state changes are driven by the shared DS contract.',
    minHeight: 220,
  },
  navigation: {
    label: 'Navigation pattern',
    note: 'Check discoverability, mode switching, and whether overlay patterns are rendered through the active runtime rather than mocked locally.',
    minHeight: 220,
  },
  feedback: {
    label: 'Feedback pattern',
    note: 'Check responsive posture, focus continuity, and whether dismissal stays clear across modal, drawer, and sheet containers.',
    minHeight: 220,
  },
  commerce: {
    label: 'Commerce pattern',
    note: 'Check comparison clarity, plan differentiation, and whether the call to action stays confident across engines.',
    minHeight: 220,
  },
  customization: {
    label: 'Customization pattern',
    note: 'Check live-preview fidelity and whether edits stay safely scoped to the surface being customized.',
    minHeight: 220,
  },
  identity: {
    label: 'Identity pattern',
    note: 'Check recognizability and whether density changes still keep the person legible.',
    minHeight: 220,
  },
  shell: {
    label: 'Shell pattern',
    note: 'Check chrome consistency and whether the frame stays coherent before content, data, or permissions resolve.',
    minHeight: 220,
  },
};

function MissingAdapterNotice({
  slug,
  name,
}: {
  slug: string;
  name: string;
}) {
  return (
    <Card
      style={{
        width: '100%',
        maxWidth: 560,
        border: `1px dashed ${SHOWROOM_SURFACES.border}`,
        background: `linear-gradient(180deg, ${SHOWROOM_SURFACES.surface} 0%, ${SHOWROOM_SURFACES.subtle} 100%)`,
        boxShadow: 'none',
      }}
    >
      <Card.Body>
        <Stack spacing="sm">
          <Flex align="center" justify="between" gap={10} style={{ flexWrap: 'wrap' }}>
            <Text size="sm" weight="semibold" style={{ lineHeight: 1.3 }}>
              Preview adapter pending
            </Text>
            <Badge variant="secondary">{name}</Badge>
          </Flex>
          <Text size="sm" style={{ color: SHOWROOM_SURFACES.textSecondary }}>
            The public DS export exists for <strong>{slug}</strong>, but this showroom route has not been
            migrated to a live preview adapter yet. It now fails honestly instead of rendering a fake local mock.
          </Text>
        </Stack>
      </Card.Body>
    </Card>
  );
}

export function PatternPreview({ slug }: { slug: string }) {
  const entry = patterns.find((pattern) => pattern.slug === slug);
  const preview = renderPatternPreview(slug);
  const meta = entry ? GROUP_META[entry.group] : null;

  if (!preview) {
    return (
      <Box
        style={{
          minHeight: 220,
          padding: 20,
          textAlign: 'center',
          color: SHOWROOM_SURFACES.textTertiary,
          borderRadius: 20,
          border: `1px dashed ${SHOWROOM_SURFACES.border}`,
          background: `linear-gradient(180deg, ${SHOWROOM_SURFACES.subtle} 0%, ${SHOWROOM_SURFACES.surface} 100%)`,
        }}
      >
        {entry ? (
          <MissingAdapterNotice slug={entry.slug} name={entry.name} />
        ) : (
          <Stack spacing={8} align="center">
            <Text size="sm" weight="semibold" style={{ color: SHOWROOM_SURFACES.text }}>
              Preview not found
            </Text>
            <Text size="xs" style={{ color: SHOWROOM_SURFACES.textSecondary }}>
              No live composition is registered for <strong>{slug}</strong>.
            </Text>
          </Stack>
        )}
      </Box>
    );
  }

  const accent =
    entry?.group === 'data'
      ? '#60a5fa'
      : entry?.group === 'forms'
        ? '#34d399'
        : entry?.group === 'visualization'
          ? '#a78bfa'
          : entry?.group === 'communication'
            ? '#f472b6'
            : entry?.group === 'workflow'
              ? '#f59e0b'
              : entry?.group === 'navigation'
                ? '#22d3ee'
                : '#fb7185';

  return (
    <Stack spacing={10} style={{ width: '100%', minWidth: 0 }}>
      <Box
        style={{
          padding: '10px 12px',
          borderRadius: 14,
          border: `1px solid ${SHOWROOM_SURFACES.border}`,
          background: `linear-gradient(180deg, ${mixWithCanvas(accent, 9)} 0%, ${SHOWROOM_SURFACES.subtle} 100%)`,
          boxShadow: SHOWROOM_SURFACES.shadow,
        }}
      >
        <Flex align="center" justify="between" gap={8} style={{ flexWrap: 'wrap' }}>
          <Flex align="center" gap={8} style={{ flexWrap: 'wrap' }}>
            {meta ? <Badge variant="secondary">{meta.label}</Badge> : null}
            {entry ? (
              <Text
                size="xs"
                weight="semibold"
                style={{
                  fontFamily: 'var(--font-geist-mono)',
                  color: SHOWROOM_SURFACES.text,
                }}
              >
                {entry.name}
              </Text>
            ) : null}
          </Flex>
          {meta ? (
            <Text size="xs" style={{ color: SHOWROOM_SURFACES.textSecondary, lineHeight: 1.45 }}>
              {meta.note}
            </Text>
          ) : null}
        </Flex>
      </Box>

      <Box
        style={{
          width: '100%',
          minWidth: 0,
          padding: 14,
          borderRadius: 22,
          border: `1px solid ${SHOWROOM_SURFACES.border}`,
          background: `linear-gradient(180deg, ${mixWithCanvas(accent, 10)} 0%, ${SHOWROOM_SURFACES.subtle} 100%)`,
          boxShadow: SHOWROOM_SURFACES.shadow,
        }}
      >
        <Box
          style={{
            width: '100%',
            minWidth: 0,
            minHeight: Math.max((meta?.minHeight ?? 220) - 76, 148),
            padding: 16,
            borderRadius: 18,
            border: `1px solid ${SHOWROOM_SURFACES.border}`,
            background: `linear-gradient(180deg, ${SHOWROOM_SURFACES.surface} 0%, ${mixWithSurface(
              accent,
              8,
              SHOWROOM_SURFACES.surface,
            )} 100%)`,
            boxShadow: `inset 0 1px 0 ${mixWithSurface(
              accent,
              14,
              'transparent',
            )}`,
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

          <Box
            style={{
              width: '100%',
              minWidth: 0,
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'flex-start',
              overflowX: 'auto',
            }}
          >
            {preview}
          </Box>
        </Box>
      </Box>
    </Stack>
  );
}
