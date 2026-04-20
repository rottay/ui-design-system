'use client';

import type { ReactNode } from 'react';
import { Box, Flex, Text, DesignSystemProvider } from '@rottay/design-system';
import type { EngineName } from '@rottay/design-system';

export interface EngineComparisonProps {
  children: ReactNode;
  tenantSlug?: string;
}

const ENGINES: Array<{ id: EngineName; label: string; subtitle: string }> = [
  { id: 'classic', label: 'Classic', subtitle: 'Ant Design' },
  { id: 'modern', label: 'Modern', subtitle: 'DaisyUI' },
  { id: 'rustic', label: 'Rustic', subtitle: 'Vanilla CSS' },
];

export function EngineComparison({ children, tenantSlug = 'rottay' }: EngineComparisonProps) {
  return (
    <Box
      style={{
        borderRadius: 'var(--ds-border-radius-md, 8px)',
        border: '1px solid var(--ds-color-border, #e5e7eb)',
        overflow: 'hidden',
      }}
    >
      <Box
        padding="sm"
        style={{
          borderBottom: '1px solid var(--ds-color-border, #e5e7eb)',
          background: 'var(--ds-color-bg-elevated, #fafafa)',
        }}
      >
        <Text size="sm" weight="semibold">
          Engine Comparison
        </Text>
      </Box>
      <Flex
        style={{
          borderTop: 'none',
        }}
      >
        {ENGINES.map((engine, index) => {
          const isLast = index === ENGINES.length - 1;
          return (
            <Box
              key={engine.id}
              style={{
                flex: 1,
                borderRight: !isLast
                  ? '1px solid var(--ds-color-border, #e5e7eb)'
                  : 'none',
              }}
            >
              <Flex
                direction="column"
                align="center"
                gap={4}
                style={{
                  padding: '8px 12px',
                  borderBottom: '1px solid var(--ds-color-border, #e5e7eb)',
                  background: 'var(--ds-color-bg-container, #ffffff)',
                }}
              >
                <Text size="sm" weight="semibold">
                  {engine.label}
                </Text>
                <Text
                  size="xs"
                  style={{ color: 'var(--ds-color-text-muted, #999999)' }}
                >
                  {engine.subtitle}
                </Text>
              </Flex>
              <Flex
                justify="center"
                align="center"
                style={{
                  padding: 24,
                  minHeight: 100,
                  background: 'var(--ds-color-bg-container, #ffffff)',
                }}
              >
                <DesignSystemProvider
                  tenantSlug={tenantSlug}
                  forceEngine={engine.id}
                >
                  {children}
                </DesignSystemProvider>
              </Flex>
            </Box>
          );
        })}
      </Flex>
    </Box>
  );
}
