'use client';

import { Badge, Box, Flex, Stack, Text } from '@rottay/design-system';
import {
  SHOWROOM_SURFACES,
  mixWithCanvas,
  mixWithSurface,
} from '../surface-tokens';

export interface PropDefinition {
  name: string;
  type: string;
  defaultValue?: string;
  required?: boolean;
  description: string;
}

export interface PropTableProps {
  props: PropDefinition[];
  title?: string;
}

function ValueChip({
  value,
  tone = 'default',
}: {
  value: string;
  tone?: 'default' | 'muted';
}) {
  return (
    <Box
      as="code"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '5px 8px',
        borderRadius: 10,
        border: `1px solid ${SHOWROOM_SURFACES.border}`,
        background:
          tone === 'muted'
            ? SHOWROOM_SURFACES.subtle
            : mixWithCanvas('var(--ds-color-primary, #60a5fa)', 8),
        color:
          tone === 'muted'
            ? SHOWROOM_SURFACES.textSecondary
            : SHOWROOM_SURFACES.text,
        fontFamily: 'var(--font-geist-mono, monospace)',
        fontSize: 12,
        lineHeight: 1.4,
        wordBreak: 'break-word',
      }}
    >
      {value}
    </Box>
  );
}

export function PropTable({ props, title }: PropTableProps) {
  const requiredCount = props.filter((prop) => prop.required).length;
  const optionalCount = props.length - requiredCount;

  return (
    <Box
      style={{
        borderRadius: 22,
        border: `1px solid ${SHOWROOM_SURFACES.border}`,
        overflow: 'hidden',
        background: `linear-gradient(180deg, ${mixWithSurface(
          'var(--ds-color-primary, #60a5fa)',
          8,
          SHOWROOM_SURFACES.surface,
        )} 0%, ${SHOWROOM_SURFACES.surface} 100%)`,
        boxShadow: SHOWROOM_SURFACES.shadow,
      }}
    >
      <Flex
        align="center"
        justify="between"
        gap={12}
        style={{
          padding: '16px 18px',
          borderBottom: `1px solid ${SHOWROOM_SURFACES.border}`,
          background: `linear-gradient(180deg, ${SHOWROOM_SURFACES.subtle} 0%, ${mixWithSurface(
            'var(--ds-color-text-primary, #ececec)',
            5,
            SHOWROOM_SURFACES.subtle,
          )} 100%)`,
          flexWrap: 'wrap',
        }}
      >
        <Box>
          {title ? (
            <Text
              size="sm"
              weight="semibold"
              style={{ display: 'block', color: SHOWROOM_SURFACES.text, lineHeight: 1.35 }}
            >
              {title}
            </Text>
          ) : null}
          <Text
            size="xs"
            style={{
              display: 'block',
              marginTop: 6,
              color: SHOWROOM_SURFACES.textSecondary,
              lineHeight: 1.45,
            }}
          >
            Prop contracts stay readable across dark-first and light-first tenants.
          </Text>
        </Box>

        <Flex gap={8} style={{ flexWrap: 'wrap' }}>
          <Badge variant="secondary">{props.length} props</Badge>
          <Badge variant="secondary">{requiredCount} required</Badge>
          <Badge variant="secondary">{optionalCount} optional</Badge>
        </Flex>
      </Flex>

      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 10,
          padding: '14px 18px 0',
          background: `linear-gradient(180deg, ${mixWithSurface(
            'var(--ds-color-primary, #60a5fa)',
            4,
            SHOWROOM_SURFACES.surface,
          )} 0%, ${SHOWROOM_SURFACES.surface} 100%)`,
        }}
      >
        <Box
          style={{
            padding: '10px 12px',
            borderRadius: 14,
            border: `1px solid ${SHOWROOM_SURFACES.border}`,
            background: SHOWROOM_SURFACES.subtle,
          }}
        >
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
            Fast read
          </Text>
          <Text
            size="sm"
            style={{
              display: 'block',
              marginTop: 6,
              color: SHOWROOM_SURFACES.textSecondary,
              lineHeight: 1.5,
            }}
          >
            Start with required props, then scan defaults before dropping to per-row details.
          </Text>
        </Box>

        <Box
          style={{
            padding: '10px 12px',
            borderRadius: 14,
            border: `1px solid ${SHOWROOM_SURFACES.border}`,
            background: SHOWROOM_SURFACES.subtle,
          }}
        >
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
            Contract posture
          </Text>
          <Text
            size="sm"
            style={{
              display: 'block',
              marginTop: 6,
              color: SHOWROOM_SURFACES.textSecondary,
              lineHeight: 1.5,
            }}
          >
            This reference stays intentionally concise so the primitive contract remains scannable.
          </Text>
        </Box>
      </Box>

      <Box className="showroom-prop-table-desktop" style={{ overflowX: 'auto' }}>
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns:
              'minmax(170px, 1.1fr) minmax(180px, 1.25fr) minmax(120px, 0.8fr) minmax(120px, 0.7fr) minmax(260px, 1.8fr)',
            minWidth: 920,
          }}
        >
          {['Name', 'Type', 'Default', 'Required', 'Description'].map((heading) => (
            <Box
              key={heading}
              style={{
                padding: '12px 14px',
                borderBottom: `1px solid ${SHOWROOM_SURFACES.border}`,
                background: `linear-gradient(180deg, ${SHOWROOM_SURFACES.subtle} 0%, ${mixWithSurface(
                  'var(--ds-color-primary, #60a5fa)',
                  5,
                  SHOWROOM_SURFACES.subtle,
                )} 100%)`,
              }}
            >
              <Text
                size="xs"
                weight="semibold"
                style={{
                  display: 'block',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: SHOWROOM_SURFACES.textTertiary,
                }}
              >
                {heading}
              </Text>
            </Box>
          ))}

          {props.map((prop, index) => {
            const rowBackground =
              index % 2 === 0
                ? SHOWROOM_SURFACES.surface
                : mixWithCanvas('var(--ds-color-primary, #60a5fa)', 4);

            return (
              <Box key={prop.name} style={{ display: 'contents' }}>
                <Box
                  style={{
                    padding: '14px',
                    borderBottom: `1px solid ${SHOWROOM_SURFACES.border}`,
                    background: rowBackground,
                  }}
                >
                  <Text
                    size="sm"
                    weight="semibold"
                    style={{
                      display: 'block',
                      color: SHOWROOM_SURFACES.text,
                      fontFamily: 'var(--font-geist-mono, monospace)',
                      lineHeight: 1.35,
                    }}
                  >
                    {prop.name}
                  </Text>
                </Box>

                <Box
                  style={{
                    padding: '14px',
                    borderBottom: `1px solid ${SHOWROOM_SURFACES.border}`,
                    background: rowBackground,
                  }}
                >
                  <ValueChip value={prop.type} tone="muted" />
                </Box>

                <Box
                  style={{
                    padding: '14px',
                    borderBottom: `1px solid ${SHOWROOM_SURFACES.border}`,
                    background: rowBackground,
                  }}
                >
                  <ValueChip value={prop.defaultValue ?? 'none'} />
                </Box>

                <Box
                  style={{
                    padding: '14px',
                    borderBottom: `1px solid ${SHOWROOM_SURFACES.border}`,
                    background: rowBackground,
                  }}
                >
                  <Flex align="center">
                    <Badge variant={prop.required ? 'error' : 'secondary'}>
                      {prop.required ? 'Required' : 'Optional'}
                    </Badge>
                  </Flex>
                </Box>

                <Box
                  style={{
                    padding: '14px',
                    borderBottom: `1px solid ${SHOWROOM_SURFACES.border}`,
                    background: rowBackground,
                  }}
                >
                  <Text
                    size="sm"
                    style={{
                      display: 'block',
                      color: SHOWROOM_SURFACES.textSecondary,
                      lineHeight: 1.6,
                    }}
                  >
                    {prop.description}
                  </Text>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>

      <Stack className="showroom-prop-table-mobile" spacing="sm" style={{ padding: 16 }}>
        {props.map((prop) => (
          <Box
            key={prop.name}
            style={{
              padding: 16,
              borderRadius: 18,
              border: `1px solid ${SHOWROOM_SURFACES.border}`,
              background: `linear-gradient(180deg, ${SHOWROOM_SURFACES.surface} 0%, ${mixWithCanvas(
                'var(--ds-color-primary, #60a5fa)',
                5,
              )} 100%)`,
            }}
          >
            <Stack spacing="sm">
              <Flex
                align="center"
                justify="between"
                gap={10}
                style={{ flexWrap: 'wrap' }}
              >
                <Text
                  size="sm"
                  weight="semibold"
                  style={{
                    display: 'block',
                    color: SHOWROOM_SURFACES.text,
                    fontFamily: 'var(--font-geist-mono, monospace)',
                    lineHeight: 1.35,
                  }}
                >
                  {prop.name}
                </Text>
                <Badge variant={prop.required ? 'error' : 'secondary'}>
                  {prop.required ? 'Required' : 'Optional'}
                </Badge>
              </Flex>

              <Flex gap={8} style={{ flexWrap: 'wrap' }}>
                <ValueChip value={prop.type} tone="muted" />
                <ValueChip value={prop.defaultValue ?? 'none'} />
              </Flex>

              <Text
                size="sm"
                style={{
                  display: 'block',
                  color: SHOWROOM_SURFACES.textSecondary,
                  lineHeight: 1.6,
                }}
              >
                {prop.description}
              </Text>
            </Stack>
          </Box>
        ))}
      </Stack>

      <style>{`
        .showroom-prop-table-mobile {
          display: none;
        }

        @media (max-width: 960px) {
          .showroom-prop-table-desktop {
            display: none;
          }

          .showroom-prop-table-mobile {
            display: flex;
          }
        }
      `}</style>
    </Box>
  );
}
