'use client';

import { useState, useCallback } from 'react';
import { Box, Flex, Text, Button } from '@rottay/design-system';

export interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  title?: string;
}

export function CodeBlock({ code, language = 'tsx', showLineNumbers = false, title }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [code]);

  const lines = code.split('\n');

  return (
    <Box
      style={{
        borderRadius: 'var(--ds-border-radius-md, 8px)',
        border: '1px solid var(--ds-color-border, #e5e7eb)',
        overflow: 'hidden',
        background: 'var(--ds-color-bg-elevated, #1e1e1e)',
      }}
    >
      <Flex
        justify="between"
        align="center"
        style={{
          padding: '8px 12px',
          borderBottom: '1px solid var(--ds-color-border, #333333)',
          background: 'var(--ds-color-bg-container, #2d2d2d)',
        }}
      >
        <Flex gap={8} align="center">
          {title && (
            <Text
              size="xs"
              weight="semibold"
              style={{ color: 'var(--ds-color-text-secondary, #a0a0a0)' }}
            >
              {title}
            </Text>
          )}
          <Text
            size="xs"
            style={{
              color: 'var(--ds-color-text-muted, #666666)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {language}
          </Text>
        </Flex>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          style={{
            fontSize: 12,
            padding: '2px 8px',
            color: 'var(--ds-color-text-secondary, #a0a0a0)',
          }}
        >
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </Flex>
      <Box
        style={{
          padding: '12px 16px',
          overflowX: 'auto',
          fontFamily: 'var(--ds-font-mono, "Geist Mono", monospace)',
          fontSize: 13,
          lineHeight: 1.6,
          color: 'var(--ds-color-text-primary, #d4d4d4)',
          tabSize: 2,
        }}
      >
        {showLineNumbers ? (
          <Flex gap={16} style={{ margin: 0 }}>
            <Box
              as="code"
              style={{
                userSelect: 'none',
                color: 'var(--ds-color-text-muted, #555555)',
                textAlign: 'right',
                minWidth: lines.length >= 100 ? 36 : 24,
              }}
            >
              {lines.map((_, i) => `${i + 1}\n`).join('')}
            </Box>
            <Box as="code" style={{ flex: 1, whiteSpace: 'pre' }}>
              {code}
            </Box>
          </Flex>
        ) : (
          <Box as="pre" style={{ margin: 0 }}>
            <Box as="code" style={{ whiteSpace: 'pre' }}>
              {code}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
