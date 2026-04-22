'use client';

import { useState } from 'react';
import { Box, Button, Flex, Text } from '@rottay/design-system';
import {
  SHOWROOM_SURFACES,
  mixWithCanvas,
  mixWithSurface,
} from '../surface-tokens';

export interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  title?: string;
}

function getSnippetAccent(title?: string) {
  const value = title?.toLowerCase() ?? '';

  if (value.includes('import')) {
    return 'var(--ds-color-primary, #60a5fa)';
  }

  if (value.includes('usage')) {
    return 'var(--ds-color-success, #34d399)';
  }

  if (value.includes('contract')) {
    return 'var(--ds-color-warning, #f59e0b)';
  }

  return 'var(--ds-color-info, #38bdf8)';
}

function getSnippetSummary(title?: string) {
  const value = title?.toLowerCase() ?? '';

  if (value.includes('import')) {
    return 'Published package entrypoint, ready to copy.';
  }

  if (value.includes('usage')) {
    return 'Paste-ready example that shows the base contract first.';
  }

  if (value.includes('contract')) {
    return 'Reference snippet for the supported consumption path.';
  }

  return 'Token-aware snippet from the active showroom runtime.';
}

export function CodeBlock({
  code,
  language = 'tsx',
  showLineNumbers = false,
  title,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const lines = code.split('\n');
  const accent = getSnippetAccent(title);
  const summary = getSnippetSummary(title);
  const codeCanvas = `color-mix(in srgb, #05070b 84%, ${SHOWROOM_SURFACES.canvas})`;
  const codeSurface = `color-mix(in srgb, #0d1118 72%, ${SHOWROOM_SURFACES.surface})`;
  const codeText = 'color-mix(in srgb, white 88%, var(--ds-color-text-primary, #ececec))';
  const codeTextSecondary =
    'color-mix(in srgb, white 62%, var(--ds-color-text-secondary, #94a3b8))';

  function handleCopy() {
    navigator.clipboard
      .writeText(code)
      .then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        setCopied(false);
      });
  }

  return (
    <Box
      style={{
        position: 'relative',
        borderRadius: 22,
        border: `1px solid ${SHOWROOM_SURFACES.borderStrong}`,
        overflow: 'hidden',
        background: `linear-gradient(180deg, ${mixWithSurface(
          accent,
          8,
          SHOWROOM_SURFACES.surface,
        )} 0%, ${SHOWROOM_SURFACES.surface} 100%)`,
        boxShadow: SHOWROOM_SURFACES.shadowStrong,
      }}
    >
      <Box
        style={{
          position: 'absolute',
          inset: '0 0 auto 0',
          height: 3,
          background: `linear-gradient(90deg, ${accent} 0%, color-mix(in srgb, ${accent} 26%, transparent) 100%)`,
          opacity: 0.9,
        }}
      />
      <Flex
        align="start"
        justify="between"
        gap={12}
        style={{
          padding: '18px 18px 16px',
          borderBottom: `1px solid ${SHOWROOM_SURFACES.border}`,
          background: `linear-gradient(180deg, ${mixWithSurface(
            accent,
            16,
            SHOWROOM_SURFACES.subtle,
          )} 0%, ${mixWithSurface(
            accent,
            8,
            SHOWROOM_SURFACES.subtle,
          )} 100%)`,
        }}
      >
        <Flex align="start" gap={14} style={{ minWidth: 0, flex: 1 }}>
          <Flex gap={6} style={{ paddingTop: 4 }}>
            {['28%', '44%', '64%'].map((opacity, index) => (
              <Box
                key={`${language}-${index}`}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  background: `color-mix(in srgb, ${accent} ${opacity}, ${SHOWROOM_SURFACES.text})`,
                  boxShadow:
                    index === 2
                      ? `0 0 0 5px color-mix(in srgb, ${accent} 12%, transparent)`
                      : 'none',
                }}
              />
            ))}
          </Flex>

          <Box style={{ minWidth: 0, flex: 1 }}>
            <Flex
              align="start"
              justify="between"
              gap={12}
              style={{ minWidth: 0, flexWrap: 'wrap' }}
            >
              <Box style={{ minWidth: 0, flex: 1 }}>
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
                    marginTop: title ? 5 : 0,
                    color: SHOWROOM_SURFACES.textSecondary,
                    lineHeight: 1.45,
                    maxWidth: '42ch',
                  }}
                >
                  {summary}
                </Text>
              </Box>

              <Flex gap={8} style={{ flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                <Box
                  style={{
                    padding: '5px 8px',
                    borderRadius: 999,
                    border: `1px solid ${SHOWROOM_SURFACES.borderStrong}`,
                    background: mixWithSurface(
                      accent,
                      14,
                      SHOWROOM_SURFACES.surface,
                    ),
                  }}
                >
                  <Text
                    size="xs"
                    weight="semibold"
                    style={{
                      display: 'block',
                      color: SHOWROOM_SURFACES.textSecondary,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                    }}
                  >
                    {language}
                  </Text>
                </Box>

                <Box
                  style={{
                    padding: '5px 8px',
                    borderRadius: 999,
                    border: `1px solid ${SHOWROOM_SURFACES.borderStrong}`,
                    background: mixWithSurface(accent, 5, SHOWROOM_SURFACES.surface),
                  }}
                >
                  <Text
                    size="xs"
                    style={{ display: 'block', color: SHOWROOM_SURFACES.textSecondary }}
                  >
                    {lines.length} {lines.length === 1 ? 'line' : 'lines'}
                  </Text>
                </Box>
              </Flex>
            </Flex>
            <Flex gap={8} style={{ marginTop: 10, flexWrap: 'wrap' }}>
              <Box
                style={{
                  padding: '5px 8px',
                  borderRadius: 999,
                  border: `1px solid ${SHOWROOM_SURFACES.borderStrong}`,
                  background: mixWithSurface(
                    accent,
                    14,
                    SHOWROOM_SURFACES.surface,
                  ),
                }}
              >
                <Text
                  size="xs"
                  weight="semibold"
                  style={{
                    display: 'block',
                    color: SHOWROOM_SURFACES.textSecondary,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  Consumption
                </Text>
              </Box>

              <Box
                style={{
                  padding: '5px 8px',
                  borderRadius: 999,
                  border: `1px solid ${SHOWROOM_SURFACES.borderStrong}`,
                  background: mixWithSurface(accent, 5, SHOWROOM_SURFACES.surface),
                }}
              >
                <Text
                  size="xs"
                  style={{ display: 'block', color: SHOWROOM_SURFACES.textSecondary }}
                >
                  Runtime-aware snippet
                </Text>
              </Box>
            </Flex>
          </Box>
        </Flex>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          style={{
            fontSize: 12,
            padding: '4px 10px',
            color: SHOWROOM_SURFACES.text,
            border: `1px solid ${SHOWROOM_SURFACES.borderStrong}`,
            background: mixWithSurface(accent, 10, SHOWROOM_SURFACES.surface),
            boxShadow: `0 8px 18px color-mix(in srgb, ${accent} 14%, transparent)`,
          }}
        >
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </Flex>

      <Box
        style={{
          padding: 16,
          background: `linear-gradient(180deg, ${mixWithCanvas(accent, 8)} 0%, ${SHOWROOM_SURFACES.canvas} 100%)`,
        }}
      >
        <Box
          style={{
            overflowX: 'auto',
            borderRadius: 18,
            border: `1px solid ${SHOWROOM_SURFACES.borderStrong}`,
            background: `linear-gradient(180deg, ${codeSurface} 0%, ${codeCanvas} 100%)`,
            boxShadow: `inset 0 1px 0 color-mix(in srgb, white 8%, transparent), 0 16px 36px color-mix(in srgb, ${accent} 10%, transparent)`,
          }}
        >
          <Flex
            align="center"
            justify="between"
            gap={10}
            style={{
              padding: '10px 14px',
              borderBottom: `1px solid color-mix(in srgb, ${SHOWROOM_SURFACES.borderStrong} 72%, transparent)`,
              background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
            }}
          >
            <Flex align="center" gap={8} style={{ minWidth: 0, flexWrap: 'wrap' }}>
              <Text
                size="xs"
                weight="semibold"
                style={{
                  display: 'block',
                  color: codeTextSecondary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                {title ?? 'Snippet'}
              </Text>
              <Text size="xs" style={{ color: codeTextSecondary }}>
                {language.toUpperCase()}
              </Text>
            </Flex>
            <Text size="xs" style={{ color: codeTextSecondary }}>
              {showLineNumbers ? 'Line indexed' : 'Quick copy'}
            </Text>
          </Flex>

          {showLineNumbers ? (
            <Flex gap={0} style={{ margin: 0 }}>
              <Box
                as="code"
                style={{
                  userSelect: 'none',
                  padding: '16px 12px 16px 16px',
                  color: codeTextSecondary,
                  textAlign: 'right',
                  minWidth: lines.length >= 100 ? 48 : 38,
                  borderRight: `1px solid color-mix(in srgb, ${SHOWROOM_SURFACES.borderStrong} 72%, transparent)`,
                  background: 'rgba(255,255,255,0.03)',
                  fontFamily: 'var(--font-geist-mono, monospace)',
                  fontSize: 12,
                  lineHeight: 1.75,
                  whiteSpace: 'pre',
                }}
              >
                {lines.map((_, index) => `${index + 1}\n`).join('')}
              </Box>

              <Box
                as="pre"
                style={{
                  flex: 1,
                  margin: 0,
                  padding: '16px 18px',
                  minWidth: 0,
                }}
              >
                <Box
                  as="code"
                  style={{
                    display: 'block',
                    whiteSpace: 'pre',
                    fontFamily: 'var(--font-geist-mono, monospace)',
                    fontSize: 13,
                    lineHeight: 1.75,
                    color: codeText,
                    tabSize: 2,
                  }}
                >
                  {code}
                </Box>
              </Box>
            </Flex>
          ) : (
            <Box
              as="pre"
              style={{
                margin: 0,
                padding: '16px 18px',
                minWidth: 0,
              }}
            >
              <Box
                as="code"
                style={{
                  display: 'block',
                  whiteSpace: 'pre',
                  fontFamily: 'var(--font-geist-mono, monospace)',
                  fontSize: 13,
                  lineHeight: 1.75,
                  color: codeText,
                  tabSize: 2,
                }}
              >
                {code}
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
