'use client';

import { useState, type ReactNode } from 'react';
import { Badge, Box, Button, Flex, Stack, Text, useTokens } from '@rottay/design-system';
import { useShowroomRuntime } from '@/components/showroom-context';
import {
  SHOWROOM_SURFACES,
  mixWithCanvas,
  mixWithSurface,
} from '../surface-tokens';

export interface ComponentPreviewProps {
  children: ReactNode;
  title?: string;
  description?: string;
  darkModeToggle?: boolean;
}

export function ComponentPreview({
  children,
  title,
  description,
  darkModeToggle = false,
}: ComponentPreviewProps) {
  const [isDark, setIsDark] = useState(false);
  const tokens = useTokens();
  const runtime = useShowroomRuntime();
  const frameSurface = isDark ? SHOWROOM_SURFACES.canvas : SHOWROOM_SURFACES.surface;
  const frameCanvas = isDark ? SHOWROOM_SURFACES.surface : SHOWROOM_SURFACES.canvas;
  const previewModeLabel = isDark ? 'Dark surface' : 'Light surface';

  return (
    <Box
      style={{
        borderRadius: tokens.borderRadius.xl,
        border: `1px solid ${SHOWROOM_SURFACES.borderStrong}`,
        overflow: 'hidden',
        background: `linear-gradient(180deg, ${mixWithSurface(
          'var(--ds-color-primary, #60a5fa)',
          8,
          SHOWROOM_SURFACES.surface,
        )} 0%, ${SHOWROOM_SURFACES.surface} 100%)`,
        boxShadow: SHOWROOM_SURFACES.shadowStrong,
      }}
    >
      {(title || description || darkModeToggle) && (
        <Flex
          justify="between"
          align="start"
          gap={12}
          style={{
            padding: '16px 18px',
            borderBottom: `1px solid ${SHOWROOM_SURFACES.border}`,
            background: SHOWROOM_SURFACES.subtle,
            flexWrap: 'wrap',
          }}
        >
          <Box style={{ minWidth: 0, maxWidth: 760 }}>
            {title ? (
              <Text size="sm" weight="semibold" style={{ color: SHOWROOM_SURFACES.text }}>
                {title}
              </Text>
            ) : null}
            {description ? (
              <Text
                size="xs"
                style={{
                  marginTop: 6,
                  color: SHOWROOM_SURFACES.textSecondary,
                  lineHeight: 1.6,
                }}
              >
                {description}
              </Text>
            ) : null}
          </Box>

          {darkModeToggle ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDark((previous) => !previous)}
              style={{
                fontSize: 12,
                padding: '6px 12px',
                minWidth: 132,
                border: `1px solid ${SHOWROOM_SURFACES.border}`,
                background: SHOWROOM_SURFACES.surface,
                color: SHOWROOM_SURFACES.textSecondary,
              }}
            >
              {isDark ? 'Light surface' : 'Dark surface'}
            </Button>
          ) : null}
        </Flex>
      )}

      <Box
        style={{
          position: 'relative',
          overflow: 'hidden',
          padding: 18,
          background: `linear-gradient(180deg, ${mixWithCanvas(
            'var(--ds-color-primary, #60a5fa)',
            6,
            frameCanvas,
          )} 0%, ${frameCanvas} 100%)`,
        }}
      >
        <Box
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background: [
              `radial-gradient(circle at top right, ${mixWithCanvas('var(--ds-color-primary, #60a5fa)', 18, 'transparent')} 0%, transparent 32%)`,
              `radial-gradient(circle at bottom left, ${mixWithCanvas('var(--ds-color-secondary, #34d399)', 12, 'transparent')} 0%, transparent 28%)`,
              `linear-gradient(180deg, ${mixWithSurface('var(--ds-color-text-primary, #ececec)', isDark ? 4 : 2, 'transparent')} 0%, transparent 100%)`,
            ].join(', '),
          }}
        />

        <Box
          style={{
            position: 'relative',
            minHeight: 156,
            padding: 22,
            borderRadius: tokens.borderRadius.xl,
            border: `1px solid ${SHOWROOM_SURFACES.borderStrong}`,
            background: `linear-gradient(180deg, ${frameSurface} 0%, ${mixWithSurface(
              'var(--ds-color-text-primary, #ececec)',
              4,
              frameSurface,
            )} 100%)`,
            boxShadow: [
              `inset 0 1px 0 ${mixWithSurface(
                'var(--ds-color-text-primary, #ececec)',
                12,
                'transparent',
              )}`,
              `0 16px 28px ${mixWithCanvas('var(--ds-color-text-primary, #020617)', isDark ? 28 : 10, 'transparent')}`,
            ].join(', '),
            overflow: 'hidden',
          }}
        >
          <Box
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              background: [
                `linear-gradient(0deg, ${mixWithSurface('var(--ds-color-text-primary, #ececec)', isDark ? 5 : 3, 'transparent')} 1px, transparent 1px)`,
                `linear-gradient(90deg, ${mixWithSurface('var(--ds-color-text-primary, #ececec)', isDark ? 5 : 3, 'transparent')} 1px, transparent 1px)`,
              ].join(', '),
              backgroundSize: '24px 24px',
              maskImage: 'linear-gradient(180deg, rgba(0,0,0,0.4), transparent 68%)',
            }}
          />

          <Stack spacing="md" style={{ position: 'relative', zIndex: 1 }}>
            <Flex align="center" justify="between" gap={12} style={{ flexWrap: 'wrap' }}>
              <Flex align="center" gap={10} style={{ minWidth: 0 }}>
                <Flex gap={6}>
                  {['18%', '28%', '38%'].map((opacity, index) => (
                    <Box
                      key={`preview-dot-${index}`}
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 999,
                        background: `color-mix(in srgb, var(--ds-color-primary, #60a5fa) ${opacity}, ${SHOWROOM_SURFACES.text})`,
                      }}
                    />
                  ))}
                </Flex>

                <Box style={{ minWidth: 0 }}>
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
                    Live DS scene
                  </Text>
                  <Text
                    size="xs"
                    style={{
                      display: 'block',
                      marginTop: 4,
                      color: SHOWROOM_SURFACES.textSecondary,
                      lineHeight: 1.45,
                    }}
                  >
                    {runtime.tenantName} / {runtime.engine} / {runtime.productProfileLabel}
                  </Text>
                </Box>
              </Flex>

              <Flex gap={6} style={{ flexWrap: 'wrap' }}>
                <Badge variant="secondary">{previewModeLabel}</Badge>
                <Badge variant="secondary">{runtime.verticalLabel}</Badge>
              </Flex>
            </Flex>

            <Box
              style={{
                paddingBottom: 14,
                borderBottom: `1px solid ${SHOWROOM_SURFACES.border}`,
              }}
            >
              <Flex gap={8} style={{ flexWrap: 'wrap' }}>
                {[
                  `Primary ${tokens.colors.primary}`,
                  `Radius ${tokens.borderRadius.lg}`,
                  `Badge ${tokens.personality.accent.badgeShape}`,
                ].map((entry) => (
                  <Badge key={entry} variant="secondary">
                    {entry}
                  </Badge>
                ))}
              </Flex>
            </Box>

            <Flex
              justify="center"
              align="center"
              style={{
                minHeight: 112,
                color: SHOWROOM_SURFACES.text,
              }}
            >
              <Box
                style={{
                  width: '100%',
                  color: SHOWROOM_SURFACES.text,
                }}
              >
                {children}
              </Box>
            </Flex>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
