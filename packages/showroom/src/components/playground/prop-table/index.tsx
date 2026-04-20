'use client';

import { Box, Flex, Text, Tag } from '@rottay/design-system';

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

export function PropTable({ props, title }: PropTableProps) {
  return (
    <Box
      style={{
        borderRadius: 'var(--ds-border-radius-md, 8px)',
        border: '1px solid var(--ds-color-border, #e5e7eb)',
        overflow: 'hidden',
      }}
    >
      {title && (
        <Box
          padding="sm"
          style={{
            borderBottom: '1px solid var(--ds-color-border, #e5e7eb)',
            background: 'var(--ds-color-bg-elevated, #fafafa)',
          }}
        >
          <Text size="sm" weight="semibold">
            {title}
          </Text>
        </Box>
      )}
      <Box style={{ overflowX: 'auto' }}>
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(120px, 1fr) minmax(140px, 1.5fr) minmax(80px, 0.7fr) minmax(60px, 0.5fr) minmax(180px, 2fr)',
            minWidth: 640,
          }}
        >
          {/* Header row */}
          {['Name', 'Type', 'Default', 'Required', 'Description'].map((heading) => (
            <Box
              key={heading}
              padding="sm"
              style={{
                background: 'var(--ds-color-bg-elevated, #fafafa)',
                borderBottom: '2px solid var(--ds-color-border, #e5e7eb)',
              }}
            >
              <Text
                size="xs"
                weight="semibold"
                style={{
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--ds-color-text-secondary, #666666)',
                }}
              >
                {heading}
              </Text>
            </Box>
          ))}

          {/* Data rows */}
          {props.map((prop, index) => {
            const isEven = index % 2 === 0;
            const rowBg = isEven
              ? 'var(--ds-color-bg-container, #ffffff)'
              : 'var(--ds-color-bg-elevated, #fafafa)';

            return (
              <Box key={prop.name} style={{ display: 'contents' }}>
                <Box
                  padding="sm"
                  style={{
                    background: rowBg,
                    borderBottom: '1px solid var(--ds-color-border, #e5e7eb)',
                  }}
                >
                  <Text
                    size="sm"
                    weight="semibold"
                    style={{
                      fontFamily: 'var(--ds-font-mono, monospace)',
                      color: 'var(--ds-color-primary, #0066cc)',
                    }}
                  >
                    {prop.name}
                  </Text>
                </Box>
                <Box
                  padding="sm"
                  style={{
                    background: rowBg,
                    borderBottom: '1px solid var(--ds-color-border, #e5e7eb)',
                  }}
                >
                  <Text
                    size="xs"
                    style={{
                      fontFamily: 'var(--ds-font-mono, monospace)',
                      color: 'var(--ds-color-text-secondary, #666666)',
                      wordBreak: 'break-word',
                    }}
                  >
                    {prop.type}
                  </Text>
                </Box>
                <Box
                  padding="sm"
                  style={{
                    background: rowBg,
                    borderBottom: '1px solid var(--ds-color-border, #e5e7eb)',
                  }}
                >
                  <Text
                    size="xs"
                    style={{
                      fontFamily: 'var(--ds-font-mono, monospace)',
                      color: 'var(--ds-color-text-muted, #999999)',
                    }}
                  >
                    {prop.defaultValue ?? '-'}
                  </Text>
                </Box>
                <Box
                  padding="sm"
                  style={{
                    background: rowBg,
                    borderBottom: '1px solid var(--ds-color-border, #e5e7eb)',
                  }}
                >
                  <Flex align="center">
                    {prop.required ? (
                      <Tag variant="error" size="sm">Yes</Tag>
                    ) : (
                      <Text size="xs" style={{ color: 'var(--ds-color-text-muted, #999999)' }}>
                        No
                      </Text>
                    )}
                  </Flex>
                </Box>
                <Box
                  padding="sm"
                  style={{
                    background: rowBg,
                    borderBottom: '1px solid var(--ds-color-border, #e5e7eb)',
                  }}
                >
                  <Text size="sm" style={{ color: 'var(--ds-color-text-primary, #1a1a1a)' }}>
                    {prop.description}
                  </Text>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}
