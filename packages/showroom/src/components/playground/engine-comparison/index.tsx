'use client';

import type { ReactNode } from 'react';
import { Badge, Box, Flex, Stack, Text } from '@rottay/design-system';
import {
  useShowroom,
  type ShowroomEngine,
} from '@/components/showroom-context';
import {
  SHOWROOM_SURFACES,
  mixWithSurface,
} from '../tokens/surfaces';

export interface EngineComparisonProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

const ENGINES: Array<{
  id: ShowroomEngine;
  label: string;
  subtitle: string;
  accent: string;
}> = [
  {
    id: 'classic',
    label: 'Classic',
    subtitle: 'Ant Design',
    accent: '#60a5fa',
  },
  {
    id: 'modern',
    label: 'Modern',
    subtitle: 'DaisyUI',
    accent: '#34d399',
  },
  {
    id: 'rustic',
    label: 'Rustic',
    subtitle: 'Vanilla CSS',
    accent: '#fbbf24',
  },
];

export function EngineComparison({
  children,
  title = 'Engine comparison',
  description = 'One live preview, one engine at a time. Switch the selector to re-render the same tree under another engine; the active tenant and theme stay untouched.',
}: EngineComparisonProps) {
  const { engine, setEngine } = useShowroom();

  return (
    <Box
      style={{
        borderRadius: 22,
        border: `1px solid ${SHOWROOM_SURFACES.border}`,
        overflow: 'hidden',
        background: `linear-gradient(180deg, ${SHOWROOM_SURFACES.surface} 0%, ${SHOWROOM_SURFACES.canvas} 100%)`,
        boxShadow: SHOWROOM_SURFACES.shadow,
      }}
    >
      <Box
        style={{
          padding: 18,
          borderBottom: `1px solid ${SHOWROOM_SURFACES.border}`,
          background: SHOWROOM_SURFACES.subtle,
        }}
      >
        <Flex
          align="start"
          justify="between"
          gap={12}
          style={{ flexWrap: 'wrap' }}
        >
          <Box style={{ minWidth: 0, maxWidth: 760 }}>
            <Text
              size="xs"
              weight="semibold"
              style={{
                display: 'block',
                color: SHOWROOM_SURFACES.textTertiary,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Engine comparison
            </Text>
            <Text
              size="sm"
              weight="semibold"
              style={{
                display: 'block',
                color: SHOWROOM_SURFACES.text,
                marginTop: 6,
                lineHeight: 1.35,
              }}
            >
              {title}
            </Text>
            <Text
              size="xs"
              style={{
                display: 'block',
                marginTop: 6,
                color: SHOWROOM_SURFACES.textSecondary,
                lineHeight: 1.6,
              }}
            >
              {description}
            </Text>
          </Box>

          <Box
            style={{
              padding: '10px 12px',
              borderRadius: 16,
              border: `1px solid ${SHOWROOM_SURFACES.border}`,
              background: SHOWROOM_SURFACES.surface,
            }}
          >
            <Flex gap={8} style={{ flexWrap: 'wrap' }}>
              <Badge variant="secondary">Sequential live preview</Badge>
              <Badge variant="secondary">1 frame, {ENGINES.length} engines</Badge>
            </Flex>
          </Box>
        </Flex>
      </Box>

      <Box
        style={{
          padding: 12,
          borderBottom: `1px solid ${SHOWROOM_SURFACES.border}`,
          background: SHOWROOM_SURFACES.canvas,
        }}
      >
        <Flex role="group" aria-label="Engine selector" gap={8} style={{ flexWrap: 'wrap' }}>
          {ENGINES.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={engine === option.id}
              onClick={() => setEngine(option.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 14px',
                borderRadius: 14,
                border: `1px solid ${
                  engine === option.id ? option.accent : SHOWROOM_SURFACES.border
                }`,
                background:
                  engine === option.id
                    ? mixWithSurface(option.accent, 12, SHOWROOM_SURFACES.surface)
                    : SHOWROOM_SURFACES.surface,
                color: SHOWROOM_SURFACES.text,
                cursor: 'pointer',
                font: 'inherit',
                textAlign: 'left',
              }}
            >
              <span
                aria-hidden
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 999,
                  background: option.accent,
                  boxShadow: `0 0 0 4px ${mixWithSurface(option.accent, 18, 'transparent')}`,
                  flexShrink: 0,
                }}
              />
              <span style={{ display: 'grid', gap: 2 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{option.label}</span>
                <span style={{ fontSize: 11, color: SHOWROOM_SURFACES.textSecondary }}>
                  {option.subtitle}
                </span>
              </span>
            </button>
          ))}
        </Flex>
      </Box>

      <Box style={{ padding: 12, background: SHOWROOM_SURFACES.canvas }}>
        <Box
          style={{
            minHeight: 'clamp(560px, 68vh, 760px)',
            display: 'grid',
            gridTemplateRows: 'auto minmax(0, 1fr)',
            padding: 14,
            borderRadius: 20,
            border: `1px solid ${SHOWROOM_SURFACES.border}`,
            background: `linear-gradient(180deg, ${SHOWROOM_SURFACES.surface} 0%, ${SHOWROOM_SURFACES.subtle} 100%)`,
          }}
        >
          <Box
            style={{
              width: '100%',
              minWidth: 0,
              minHeight: 0,
              overflowX: 'hidden',
              overflowY: 'auto',
              paddingRight: 4,
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
