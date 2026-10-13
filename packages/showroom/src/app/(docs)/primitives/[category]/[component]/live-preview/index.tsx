'use client';

import type { ReactNode } from 'react';
import {
  Badge,
  Box,
  Divider,
  Flex,
  Stack,
  Text,
} from '@rottay/design-system';
import { RuntimeFingerprint } from '@/components/runtime/fingerprint';
import { StateGallery, getFlagshipSpec } from '@/components/state-gallery';
import {
  SHOWROOM_SURFACES,
  mixWithCanvas,
  mixWithSurface,
} from '@/components/playground/tokens/surfaces';
import { primitives } from '@/data/registry';
import type {
  PrimitiveCategory,
  PrimitiveEntry,
} from '@/data/registry';
import { FOUNDATION_PREVIEWS } from './foundation';
import { INPUT_PREVIEWS } from './inputs';
import { DISPLAY_PREVIEWS } from './display';
import { LAYOUT_PREVIEWS } from './layout';
import { FEEDBACK_PREVIEWS } from './feedback';
import { NAVIGATION_PREVIEWS } from './navigation';
import { OVERLAY_PREVIEWS } from './overlay';

function AdapterPendingPreview({
  entry,
}: {
  entry: PrimitiveEntry;
}) {
  return (
    <Stack spacing="sm" style={{ maxWidth: 360 }}>
      <Badge variant="warning">Adapter pending</Badge>
      <Text size="sm" weight="semibold">
        {entry.name} still needs a dedicated showroom fixture.
      </Text>
      <Text
        size="sm"
        style={{ color: 'var(--ds-color-text-secondary)' }}
      >
        This state is intentionally explicit so the docs do not imply a verified
        engine-level preview that is not wired yet.
      </Text>
    </Stack>
  );
}

// ---------------------------------------------------------------------------
// Component map -- slug to rendered live example
// ---------------------------------------------------------------------------

export const COMPONENT_MAP: Record<string, ReactNode> = {
  ...FOUNDATION_PREVIEWS,
  ...INPUT_PREVIEWS,
  ...DISPLAY_PREVIEWS,
  ...LAYOUT_PREVIEWS,
  ...FEEDBACK_PREVIEWS,
  ...NAVIGATION_PREVIEWS,
  ...OVERLAY_PREVIEWS,
};

// ---------------------------------------------------------------------------
// Public component
// ---------------------------------------------------------------------------

export interface LivePreviewProps {
  slug: string;
}

const CATEGORY_META: Record<
  PrimitiveCategory,
  { label: string; note: string; minHeight: number }
> = {
  display: {
    label: 'Display',
    note: 'Check readability, fallback handling, and how much meaning survives with almost no supporting chrome.',
    minHeight: 180,
  },
  inputs: {
    label: 'Input',
    note: 'Check focus, affordance, and whether the control still feels trustworthy when styling shifts.',
    minHeight: 190,
  },
  feedback: {
    label: 'Feedback',
    note: 'Check urgency, motion, and clarity of what the system is telling the user to do next.',
    minHeight: 180,
  },
  layout: {
    label: 'Layout',
    note: 'Check rhythm, spacing, and whether the component creates obvious structure rather than empty scaffolding.',
    minHeight: 190,
  },
  navigation: {
    label: 'Navigation',
    note: 'Check orientation, active state clarity, and how quickly the interaction teaches itself.',
    minHeight: 190,
  },
  overlay: {
    label: 'Overlay',
    note: 'Check anchoring, exit paths, and how gently the layer interrupts the base interface.',
    minHeight: 190,
  },
};

const CATEGORY_ACCENTS: Record<PrimitiveCategory, string> = {
  display: '#60a5fa',
  inputs: '#34d399',
  feedback: '#f59e0b',
  layout: '#a78bfa',
  navigation: '#f472b6',
  overlay: '#f97316',
};

export function LivePreview({ slug }: LivePreviewProps) {
  const entry = primitives.find((primitive) => primitive.slug === slug);
  const hasFixture = Object.prototype.hasOwnProperty.call(COMPONENT_MAP, slug);
  const preview = hasFixture
    ? COMPONENT_MAP[slug]
    : entry
      ? <AdapterPendingPreview entry={entry} />
      : null;
  const meta = entry ? CATEGORY_META[entry.category] : null;

  if (!preview) {
    return (
      <Box
        style={{
          minHeight: 180,
          padding: 20,
          borderRadius: 20,
          border: `1px dashed ${SHOWROOM_SURFACES.border}`,
          background: `linear-gradient(180deg, ${SHOWROOM_SURFACES.subtle} 0%, ${SHOWROOM_SURFACES.surface} 100%)`,
        }}
      >
        <Stack spacing="sm" align="center" style={{ textAlign: 'center' }}>
          <Text
            size="sm"
            weight="semibold"
            style={{ color: SHOWROOM_SURFACES.text }}
          >
            Preview coming soon
          </Text>
          <Text
            size="xs"
            style={{ color: SHOWROOM_SURFACES.textSecondary }}
          >
            No live example was found for <strong>{slug}</strong>, but the
            detail page still documents how to evaluate and compose it.
          </Text>
        </Stack>
      </Box>
    );
  }

  const accent = entry
    ? CATEGORY_ACCENTS[entry.category]
    : 'var(--ds-color-primary, #60a5fa)';
  const isFlagship = Boolean(getFlagshipSpec(slug));

  return (
    <Box
      style={{
        width: '100%',
        height: '100%',
        padding: 16,
        borderRadius: 22,
        border: `1px solid ${SHOWROOM_SURFACES.border}`,
        background: `linear-gradient(180deg, ${mixWithCanvas(
          accent,
          10,
        )} 0%, ${SHOWROOM_SURFACES.subtle} 100%)`,
        boxShadow: SHOWROOM_SURFACES.shadow,
      }}
    >
      <Stack spacing="sm" style={{ height: '100%' }}>
        <Box
          style={{
            paddingBottom: 10,
            borderBottom: `1px solid ${SHOWROOM_SURFACES.border}`,
          }}
        >
          <Flex
            align="center"
            justify="between"
            gap={10}
            style={{ minWidth: 0, minHeight: 44 }}
          >
            <Box style={{ minWidth: 0, flex: 1 }}>
              {meta ? (
                <Text
                  size="xs"
                  weight="semibold"
                  style={{
                    display: 'block',
                    color: SHOWROOM_SURFACES.textTertiary,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    fontFamily: 'var(--font-geist-sans)',
                  }}
                >
                  {meta.label}
                </Text>
              ) : null}
              {entry ? (
                <Text
                  size="sm"
                  weight="semibold"
                  style={{
                    display: 'block',
                    marginTop: 4,
                    color: SHOWROOM_SURFACES.text,
                    lineHeight: 1.2,
                    fontFamily: 'var(--font-geist-sans)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {entry.name}
                </Text>
              ) : null}
            </Box>

            <Box
              style={{
                flexShrink: 0,
                padding: '6px 10px',
                borderRadius: 999,
                border: `1px solid ${SHOWROOM_SURFACES.border}`,
                background: SHOWROOM_SURFACES.surface,
                maxWidth: '52%',
              }}
            >
              <Text
                size="xs"
                weight="semibold"
                style={{
                  display: 'block',
                  color: SHOWROOM_SURFACES.textSecondary,
                  lineHeight: 1.2,
                  fontFamily: 'var(--font-geist-sans)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {entry ? `${entry.engines.length} live engines` : 'Live preview'}
              </Text>
            </Box>
          </Flex>
        </Box>

        <Flex
          style={{
            flex: 1,
            minHeight: 0,
            alignItems: 'stretch',
            justifyContent: 'stretch',
          }}
        >
          <Box
            style={{
              width: '100%',
              minWidth: 0,
              minHeight: 0,
              padding: 14,
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
              display: 'grid',
              gridTemplateRows: 'auto minmax(0, 1fr)',
            }}
          >
            <Flex
              align="center"
              justify="between"
              gap={8}
              style={{
                marginBottom: 12,
                paddingBottom: 12,
                borderBottom: `1px solid ${SHOWROOM_SURFACES.border}`,
                flexWrap: 'wrap',
              }}
            >
              <Flex gap={6}>
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
              <Text
                size="xs"
                style={{ display: 'block', color: SHOWROOM_SURFACES.textSecondary }}
              >
                Live DS output
              </Text>
            </Flex>
            <Box
              style={{
                width: '100%',
                minWidth: 0,
                display: 'flex',
                minHeight: 0,
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                overflowX: 'auto',
                overflowY: 'auto',
              }}
            >
              {preview}
            </Box>
          </Box>
        </Flex>

        <Box
          style={{
            padding: 12,
            borderRadius: 16,
            border: `1px solid ${SHOWROOM_SURFACES.border}`,
            background: `linear-gradient(180deg, ${SHOWROOM_SURFACES.surface} 0%, ${mixWithCanvas(
              accent,
              7,
            )} 100%)`,
          }}
        >
          <Text
            size="xs"
            weight="semibold"
            style={{
              display: 'block',
              marginBottom: 8,
              color: SHOWROOM_SURFACES.textTertiary,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            {isFlagship ? 'Variant + state gallery' : 'Runtime fingerprint'}
          </Text>
          <Divider />
          <Box style={{ marginTop: 10 }}>
            {isFlagship ? (
              <StateGallery slug={slug} />
            ) : (
              <RuntimeFingerprint compact compactColumns={2} itemLimit={6} showHeader={false} />
            )}
          </Box>
        </Box>

        {meta ? (
          <Box
            style={{
              padding: '10px 12px',
              borderRadius: 16,
              border: `1px solid ${SHOWROOM_SURFACES.border}`,
              background: SHOWROOM_SURFACES.subtle,
              minHeight: 72,
            }}
          >
            <Flex align="start" gap={10} style={{ minWidth: 0 }}>
              <Text
                size="xs"
                weight="semibold"
                style={{
                  display: 'block',
                  color: SHOWROOM_SURFACES.textTertiary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  minWidth: 44,
                  marginTop: 1,
                }}
              >
                Note
              </Text>
              <Box
                style={{
                  minWidth: 0,
                  maxHeight: 52,
                  overflow: 'auto',
                }}
              >
                <Text size="xs" style={{ color: SHOWROOM_SURFACES.textSecondary, lineHeight: 1.45 }}>
                  {meta.note}
                </Text>
              </Box>
            </Flex>
          </Box>
        ) : null}
      </Stack>
    </Box>
  );
}
