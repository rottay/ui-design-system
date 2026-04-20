'use client';

import { useState, type ReactNode } from 'react';
import { Box, Flex, Text, Button } from '@rottay/design-system';

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

  return (
    <Box
      style={{
        borderRadius: 'var(--ds-border-radius-md, 8px)',
        border: '1px solid var(--ds-color-border, #e5e7eb)',
        overflow: 'hidden',
      }}
    >
      {(title || darkModeToggle) && (
        <Flex
          justify="between"
          align="center"
          style={{
            padding: '8px 16px',
            borderBottom: '1px solid var(--ds-color-border, #e5e7eb)',
            background: 'var(--ds-color-bg-elevated, #fafafa)',
          }}
        >
          <Flex direction="column" gap={4}>
            {title && (
              <Text size="sm" weight="semibold">
                {title}
              </Text>
            )}
            {description && (
              <Text
                size="xs"
                style={{ color: 'var(--ds-color-text-secondary, #666666)' }}
              >
                {description}
              </Text>
            )}
          </Flex>
          {darkModeToggle && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDark((prev) => !prev)}
              style={{ fontSize: 12 }}
            >
              {isDark ? 'Light' : 'Dark'}
            </Button>
          )}
        </Flex>
      )}
      <Flex
        justify="center"
        align="center"
        style={{
          padding: 32,
          minHeight: 120,
          background: isDark
            ? 'var(--ds-color-bg-dark, #1a1a1a)'
            : 'var(--ds-color-bg-container, #ffffff)',
          transition: 'background 0.2s ease',
        }}
      >
        <Box style={{ color: isDark ? 'var(--ds-color-text-inverse, #ffffff)' : undefined }}>
          {children}
        </Box>
      </Flex>
    </Box>
  );
}
