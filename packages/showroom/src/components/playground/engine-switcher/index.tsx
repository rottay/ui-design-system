'use client';

import { Box, Flex, Stack, Text, useTokens } from '@rottay/design-system';
import { SHOWROOM_SURFACES } from '../tokens/surfaces';
import { IMPLEMENTED_ENGINE_NAMES, type ImplementedEngineName } from '@rottay/design-system';

export interface EngineSwitcherProps {
  value: ImplementedEngineName;
  onChange: (engine: ImplementedEngineName) => void;
}

/** Copy per engine. TOTAL over the roster: a new engine is a type error here. */
const ENGINE_COPY: Record<ImplementedEngineName, { label: string; subtitle: string }> = {
  classic: { label: 'Classic', subtitle: 'Ant Design' },
  modern: { label: 'Modern', subtitle: 'Rottay-native' },
  rustic: { label: 'Rustic', subtitle: 'Vanilla CSS' },
};

const ENGINES = IMPLEMENTED_ENGINE_NAMES.map((id) => ({ id, ...ENGINE_COPY[id] }));

export function EngineSwitcher({ value, onChange }: EngineSwitcherProps) {
  const tokens = useTokens();

  return (
    <Flex
      gap={0}
      style={{
        borderRadius: tokens.borderRadius.xl,
        overflow: 'hidden',
        border: `1px solid ${SHOWROOM_SURFACES.border}`,
        background: SHOWROOM_SURFACES.surface,
        boxShadow: SHOWROOM_SURFACES.shadow,
      }}
    >
      {ENGINES.map((engine, index) => {
        const isActive = value === engine.id;
        return (
          <Box
            key={engine.id}
            as="button"
            onClick={() => onChange(engine.id)}
            style={{
              cursor: 'pointer',
              flex: 1,
              minWidth: 132,
              padding: tokens.spacing[3],
              textAlign: 'left',
              background: isActive ? SHOWROOM_SURFACES.subtle : SHOWROOM_SURFACES.surface,
              color: SHOWROOM_SURFACES.text,
              border: 'none',
              borderRight: index < ENGINES.length - 1 ? `1px solid ${SHOWROOM_SURFACES.border}` : 'none',
              transition: 'background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease',
              outline: 'none',
              boxShadow: isActive
                ? `inset 0 1px 0 ${SHOWROOM_SURFACES.borderStrong}`
                : 'none',
            }}
          >
            <Stack spacing={4}>
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
                  color: SHOWROOM_SURFACES.textSecondary,
                  lineHeight: 1.45,
                }}
              >
                {engine.subtitle}
              </Text>
            </Stack>
          </Box>
        );
      })}
    </Flex>
  );
}
