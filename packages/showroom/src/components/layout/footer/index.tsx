'use client';

import { Flex, Text, Box, useTokens } from '@rottay/design-system';
import { ExternalLinkIcon } from '@rottay/design-system/icons';

interface FooterLink {
  label: string;
  href: string;
}

const FOOTER_LINKS: FooterLink[] = [
  { label: 'GitHub', href: 'https://github.com/rottay/design-system' },
  { label: 'Docs', href: '/developers/getting-started' },
  { label: 'Storybook', href: 'https://storybook.rottay.com' },
];

export function Footer() {
  const tokens = useTokens();

  return (
    <Flex
      align="center"
      justify="between"
      style={{
        padding: '16px 24px',
        borderTop: '1px solid var(--ds-color-neutral-200)',
        background: 'var(--ds-color-white)',
        flexShrink: 0,
      }}
    >
      <Flex align="center" gap={16}>
        <Text size="xs" style={{ color: "var(--ds-color-text-muted)" }}>v0.1.0</Text>
        <Text size="xs" style={{ color: "var(--ds-color-text-muted)" }}>
          Built with @rottay/design-system
        </Text>
      </Flex>

      <Flex align="center" gap={16}>
        {FOOTER_LINKS.map((link) => (
          <Box
            key={link.label}
            as="a"
            {...({ href: link.href, target: link.href.startsWith('http') ? '_blank' : undefined, rel: link.href.startsWith('http') ? 'noopener noreferrer' : undefined } as any)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              textDecoration: 'none',
              color: 'var(--ds-color-text-secondary)',
              fontSize: '0.75rem',
              transition: 'color 150ms ease',
            }}
          >
            {link.label}
            {link.href.startsWith('http') && <ExternalLinkIcon size={11} />}
          </Box>
        ))}
      </Flex>
    </Flex>
  );
}
