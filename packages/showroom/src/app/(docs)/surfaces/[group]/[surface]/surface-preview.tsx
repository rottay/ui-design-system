'use client';

import { Badge, Box, Card, Flex, Stack, Text } from '@rottay/design-system';
import {
  SHOWROOM_SURFACES,
  mixWithCanvas,
  mixWithSurface,
} from '@/components/playground/surface-tokens';
import { surfaces } from '@/data/registry';
import type { SurfaceGroup } from '@/data/registry';
import { renderSurfacePreview } from './surfaces-preview-fixtures';

const GROUP_META: Record<
  SurfaceGroup,
  { label: string; note: string; accent: string }
> = {
  admin: {
    label: 'Admin surface',
    note: 'Check whether a dense back-office screen still reads as calm, legible, and operable.',
    accent: '#60a5fa',
  },
  data: {
    label: 'Data surface',
    note: 'Check query-state clarity and how cleanly the screen moves from summary to detail to action.',
    accent: '#34d399',
  },
  experience: {
    label: 'Experience surface',
    note: 'Check narrative clarity and call-to-action priority — the screen should feel product-ready at a glance.',
    accent: '#a78bfa',
  },
  forms: {
    label: 'Form surface',
    note: 'Check progress pacing and validation rhythm while the flow stays fast for expert users.',
    accent: '#f472b6',
  },
  operations: {
    label: 'Operations surface',
    note: 'Check queue priority and real-time signal so the screen stays readable under live change.',
    accent: '#f59e0b',
  },
  workspace: {
    label: 'Workspace surface',
    note: 'Check mode switching, tool density, and whether persistent context survives multi-panel work.',
    accent: '#22d3ee',
  },
};

function MissingAdapterNotice({ slug, name }: { slug: string; name: string }) {
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
            The public DS export exists for <strong>{slug}</strong>, but this route has not been
            migrated to a live preview adapter yet. It fails honestly instead of rendering a fake
            local mock.
          </Text>
        </Stack>
      </Card.Body>
    </Card>
  );
}

export function SurfacePreview({ slug }: { slug: string }) {
  const entry = surfaces.find((surface) => surface.slug === slug);
  const preview = renderSurfacePreview(slug);
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
              No live recipe is registered for <strong>{slug}</strong>.
            </Text>
          </Stack>
        )}
      </Box>
    );
  }

  const accent = meta?.accent ?? '#60a5fa';

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
          padding: 12,
          borderRadius: 20,
          border: `1px solid ${SHOWROOM_SURFACES.border}`,
          background: `linear-gradient(180deg, ${mixWithSurface(accent, 6, SHOWROOM_SURFACES.surface)} 0%, ${SHOWROOM_SURFACES.surface} 100%)`,
          boxShadow: `inset 0 1px 0 ${mixWithSurface(accent, 12, 'transparent')}`,
        }}
      >
        <Box style={{ width: '100%', minWidth: 0, overflowX: 'auto' }}>{preview}</Box>
      </Box>
    </Stack>
  );
}
