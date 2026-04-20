'use client';

import { Flex, Box, Text } from '@rottay/design-system';

export interface EngineSwitcherProps {
  value: 'classic' | 'modern' | 'rustic';
  onChange: (engine: 'classic' | 'modern' | 'rustic') => void;
}

const ENGINES = [
  { id: 'classic' as const, label: 'Classic', subtitle: 'Ant Design' },
  { id: 'modern' as const, label: 'Modern', subtitle: 'DaisyUI' },
  { id: 'rustic' as const, label: 'Rustic', subtitle: 'Vanilla CSS' },
];

export function EngineSwitcher({ value, onChange }: EngineSwitcherProps) {
  return (
    <Flex gap={0} style={{ borderRadius: 'var(--ds-border-radius-md, 8px)', overflow: 'hidden', border: '1px solid var(--ds-color-border, #e5e7eb)' }}>
      {ENGINES.map((engine) => {
        const isActive = value === engine.id;
        return (
          <Box
            key={engine.id}
            as="button"
            onClick={() => onChange(engine.id)}
            padding="sm"
            style={{
              cursor: 'pointer',
              flex: 1,
              textAlign: 'center' as const,
              background: isActive
                ? 'var(--ds-color-primary, #0066cc)'
                : 'var(--ds-color-bg-container, #ffffff)',
              color: isActive
                ? 'var(--ds-color-text-inverse, #ffffff)'
                : 'var(--ds-color-text-primary, #1a1a1a)',
              border: 'none',
              borderRight: engine.id !== 'rustic' ? '1px solid var(--ds-color-border, #e5e7eb)' : 'none',
              transition: 'background 0.2s ease, color 0.2s ease',
              outline: 'none',
              minWidth: 120,
            }}
          >
            <Text
              size="sm"
              weight="semibold"
              style={{
                display: 'block',
                color: 'inherit',
              }}
            >
              {engine.label}
            </Text>
            <Text
              size="xs"
              style={{
                display: 'block',
                opacity: 0.7,
                color: 'inherit',
                marginTop: 2,
              }}
            >
              {engine.subtitle}
            </Text>
          </Box>
        );
      })}
    </Flex>
  );
}
