import type { ReactNode } from 'react';
import { ShowroomLink as Link } from '@/composition/components/showroom-link';
import { Box, Card, Flex, Stack, Text } from '@/composition/components/showroom-ui';

type Tone = 'default' | 'accent' | 'success' | 'warning';

interface DocsSectionHeaderProps {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
  tone?: Tone;
}

export interface DocsCompactListItem {
  label?: string;
  title: string;
  detail?: string;
  metaLabel?: string;
  meta?: string;
  href?: string;
  tone?: Tone;
}

interface DocsCompactListProps {
  items: DocsCompactListItem[];
  numbered?: boolean;
}

const SUBTLE_BORDER = '1px solid var(--ds-color-border-secondary)';
const SECTION_SHADOW = '0 10px 28px color-mix(in srgb, var(--ds-color-shadow, rgba(0, 0, 0, 0.18)) 28%, transparent)';

function getSectionToneStyles(tone: Tone) {
  switch (tone) {
    case 'accent':
      return {
        background:
          'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-info-bg) 70%, var(--ds-color-bg-elevated)) 0%, var(--ds-color-bg-elevated) 100%)',
        border:
          '1px solid color-mix(in srgb, var(--ds-color-info-border) 72%, var(--ds-color-border-secondary))',
        divider:
          'linear-gradient(90deg, var(--ds-color-info-border), color-mix(in srgb, var(--ds-color-info-border) 18%, transparent))',
      };
    case 'success':
      return {
        background:
          'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-success-bg) 70%, var(--ds-color-bg-elevated)) 0%, var(--ds-color-bg-elevated) 100%)',
        border:
          '1px solid color-mix(in srgb, var(--ds-color-success-border) 72%, var(--ds-color-border-secondary))',
        divider:
          'linear-gradient(90deg, var(--ds-color-success-border), color-mix(in srgb, var(--ds-color-success-border) 18%, transparent))',
      };
    case 'warning':
      return {
        background:
          'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-warning-bg) 72%, var(--ds-color-bg-elevated)) 0%, var(--ds-color-bg-elevated) 100%)',
        border:
          '1px solid color-mix(in srgb, var(--ds-color-warning-border) 72%, var(--ds-color-border-secondary))',
        divider:
          'linear-gradient(90deg, var(--ds-color-warning-border), color-mix(in srgb, var(--ds-color-warning-border) 18%, transparent))',
      };
    default:
      return {
        background:
          'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-bg-overlay) 84%, var(--ds-color-bg-elevated)) 0%, var(--ds-color-bg-elevated) 100%)',
        border: SUBTLE_BORDER,
        divider:
          'linear-gradient(90deg, var(--ds-color-border-secondary), color-mix(in srgb, var(--ds-color-border-secondary) 18%, transparent))',
      };
  }
}

function getItemToneStyles(tone: Tone) {
  switch (tone) {
    case 'accent':
      return {
        background:
          'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-info-bg) 68%, var(--ds-color-bg-elevated)) 0%, var(--ds-color-bg-overlay) 100%)',
        border:
          '1px solid color-mix(in srgb, var(--ds-color-info-border) 74%, var(--ds-color-border-secondary))',
        chipBackground:
          'color-mix(in srgb, var(--ds-color-info-border) 18%, white)',
        chipBorder:
          '1px solid color-mix(in srgb, var(--ds-color-info-border) 72%, var(--ds-color-border-secondary))',
      };
    case 'success':
      return {
        background:
          'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-success-bg) 72%, var(--ds-color-bg-elevated)) 0%, var(--ds-color-bg-overlay) 100%)',
        border:
          '1px solid color-mix(in srgb, var(--ds-color-success-border) 74%, var(--ds-color-border-secondary))',
        chipBackground:
          'color-mix(in srgb, var(--ds-color-success-border) 16%, white)',
        chipBorder:
          '1px solid color-mix(in srgb, var(--ds-color-success-border) 72%, var(--ds-color-border-secondary))',
      };
    case 'warning':
      return {
        background:
          'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-warning-bg) 74%, var(--ds-color-bg-elevated)) 0%, var(--ds-color-bg-overlay) 100%)',
        border:
          '1px solid color-mix(in srgb, var(--ds-color-warning-border) 74%, var(--ds-color-border-secondary))',
        chipBackground:
          'color-mix(in srgb, var(--ds-color-warning-border) 18%, white)',
        chipBorder:
          '1px solid color-mix(in srgb, var(--ds-color-warning-border) 72%, var(--ds-color-border-secondary))',
      };
    default:
      return {
        background:
          'linear-gradient(180deg, var(--ds-color-bg-overlay) 0%, var(--ds-color-bg-primary) 100%)',
        border: SUBTLE_BORDER,
        chipBackground: 'var(--ds-color-bg-primary)',
        chipBorder: SUBTLE_BORDER,
      };
  }
}

function formatSequenceLabel(index: number) {
  return `${index + 1}`.padStart(2, '0');
}

export function DocsSectionHeader({
  eyebrow = 'Editorial guide',
  title,
  description,
  actions,
  tone = 'default',
}: DocsSectionHeaderProps) {
  const styles = getSectionToneStyles(tone);

  return (
    <Card
      style={{
        padding: 16,
        background: styles.background,
        border: styles.border,
        boxShadow: SECTION_SHADOW,
      }}
    >
      <Stack spacing={10} fullWidth>
        <Flex align="center" justify="between" gap={12} style={{ flexWrap: 'wrap' }}>
          <Text
            size="xs"
            weight="semibold"
            style={{
              color: 'var(--ds-color-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
            }}
          >
            {eyebrow}
          </Text>
          {actions ? <Box style={{ minWidth: 0 }}>{actions}</Box> : null}
        </Flex>
        <Text
          as={"h2" as any}
          size="lg"
          weight="semibold"
          style={{
            lineHeight: 1.1,
            letterSpacing: '-0.025em',
            overflowWrap: 'anywhere',
          }}
        >
          {title}
        </Text>
        <Box
          aria-hidden="true"
          style={{
            height: 1,
            borderRadius: 999,
            background: styles.divider,
          }}
        />
        <Text
          size="sm"
          style={{
            color: 'var(--ds-color-text-secondary)',
            lineHeight: 1.62,
            maxWidth: 760,
            overflowWrap: 'anywhere',
          }}
        >
          {description}
        </Text>
      </Stack>
    </Card>
  );
}

export function DocsCompactList({
  items,
  numbered = false,
}: DocsCompactListProps) {
  return (
    <Stack spacing={10} fullWidth>
      {items.map((item, index) => {
        const styles = getItemToneStyles(item.tone ?? 'default');
        const label = item.label ?? (numbered ? formatSequenceLabel(index) : undefined);

        const content = (
          <Box
            style={{
              padding: 16,
              borderRadius: 20,
              background: styles.background,
              border: styles.border,
              boxShadow:
                '0 12px 30px color-mix(in srgb, var(--ds-color-shadow, rgba(15, 23, 42, 0.08)) 28%, transparent), inset 0 1px 0 color-mix(in srgb, white 70%, transparent)',
              height: '100%',
              minWidth: 0,
            }}
          >
            <Flex align="start" gap={14} style={{ minWidth: 0 }}>
              {label ? (
                <Box
                  style={{
                    minWidth: 40,
                    padding: '7px 10px',
                    borderRadius: 999,
                    background: styles.chipBackground,
                    border: styles.chipBorder,
                    textAlign: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Text
                    size="xs"
                    weight="semibold"
                    style={{
                      color: 'var(--ds-color-text-primary)',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {label}
                  </Text>
                </Box>
              ) : null}

              <Stack spacing={8} fullWidth>
                <Text
                  size="sm"
                  weight="semibold"
                  style={{
                    color: 'var(--ds-color-text-primary)',
                    lineHeight: 1.45,
                    overflowWrap: 'anywhere',
                  }}
                >
                  {item.title}
                </Text>
                {item.detail ? (
                  <Text
                    size="xs"
                    style={{
                      color: 'var(--ds-color-text-secondary)',
                      lineHeight: 1.62,
                      overflowWrap: 'anywhere',
                    }}
                  >
                    {item.detail}
                  </Text>
                ) : null}
                {item.meta ? (
                  <Box
                    style={{
                      padding: '11px 12px',
                      borderRadius: 14,
                      background:
                        'linear-gradient(180deg, color-mix(in srgb, white 76%, transparent) 0%, color-mix(in srgb, var(--ds-color-bg-primary) 82%, transparent) 100%)',
                      border: '1px solid color-mix(in srgb, var(--ds-color-border-secondary) 82%, white)',
                    }}
                  >
                    {item.metaLabel ? (
                      <Text
                        size="xs"
                        weight="semibold"
                        style={{
                          color: 'var(--ds-color-text-muted)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                        }}
                      >
                        {item.metaLabel}
                      </Text>
                    ) : null}
                    <Text
                      size="xs"
                      style={{
                        color: 'var(--ds-color-text-secondary)',
                        lineHeight: 1.55,
                        marginTop: item.metaLabel ? 6 : 0,
                        overflowWrap: 'anywhere',
                      }}
                    >
                      {item.meta}
                    </Text>
                  </Box>
                ) : null}
              </Stack>
            </Flex>
          </Box>
        );

        if (!item.href) {
          return <Box key={`${item.title}-${index}`}>{content}</Box>;
        }

        return (
          <Link
            key={`${item.title}-${index}`}
            href={item.href}
            style={{ textDecoration: 'none', display: 'block' }}
          >
            {content}
          </Link>
        );
      })}
    </Stack>
  );
}
