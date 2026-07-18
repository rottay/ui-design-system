'use client';

/**
 * @fileoverview CodeBlock -- source-code display primitive.
 *
 * Single engine-agnostic implementation. As a leaf display primitive it emits
 * its own DOM (the sanctioned raw-element tier of the design system, like every
 * primitive engine implementation and the chart renderers) and stays
 * token-governed through CSS custom properties and `data-part` anatomy so skins
 * can restyle it per engine/tenant. The default renderer is honest and
 * dependency-free: a `pre`/`code` block with an optional line-number gutter, a
 * line-highlight band, and a selection-safe copy control.
 *
 * Syntax highlighting is delegated to an app-registered
 * {@link HighlighterAdapter}; the design system imports no tokenizer of its
 * own. When no adapter is registered the plain path renders. Code content is
 * placed as a React text child, never as HTML, so it can never execute or
 * inject markup.
 */

import React from 'react';

import { CODE_BLOCK_DEFAULTS } from './contracts';
import type { CodeBlockProps, HighlightTokenLine } from './contracts';
import { useHighlighter } from './runtime/highlighter';

export type {
  CodeBlockProps,
  HighlighterAdapter,
  HighlightTokenLine,
  HighlightTokenSpan,
} from './contracts';
export { CODE_BLOCK_DEFAULTS } from './contracts';
export { registerHighlighter, getHighlighter, useHighlighter } from './runtime/highlighter';

const MONO_FONT = 'var(--ds-font-family-mono, ui-monospace, SFMono-Regular, Menlo, monospace)';
const ZERO_WIDTH_SPACE = String.fromCharCode(0x200b);

const SR_ONLY: React.CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

function isPromise<T>(value: unknown): value is Promise<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { then?: unknown }).then === 'function'
  );
}

/**
 * Render source code with an optional gutter, highlight band, and copy control.
 */
export function CodeBlock({
  code,
  language,
  showLineNumbers = CODE_BLOCK_DEFAULTS.showLineNumbers,
  highlightLines,
  wrap = CODE_BLOCK_DEFAULTS.wrap,
  maxHeight,
  copyLabel,
  copiedLabel,
  ariaLabel,
  title,
  className,
}: CodeBlockProps): React.ReactElement {
  const adapter = useHighlighter();

  // For an SSR-capable synchronous adapter, resolve highlighting during render
  // so the server and first client render match. Everything else starts plain
  // and upgrades in an effect.
  const initialLines = React.useMemo<HighlightTokenLine[] | null>(() => {
    if (adapter && adapter.ssr) {
      try {
        const result = adapter.highlight(code, language);
        if (Array.isArray(result)) return result;
      } catch {
        return null;
      }
    }
    return null;
  }, [adapter, code, language]);

  const [lines, setLines] = React.useState<HighlightTokenLine[] | null>(initialLines);

  React.useEffect(() => {
    if (!adapter) {
      setLines(null);
      return;
    }
    let cancelled = false;
    let result: HighlightTokenLine[] | Promise<HighlightTokenLine[]>;
    try {
      result = adapter.highlight(code, language);
    } catch {
      setLines(null);
      return;
    }
    if (isPromise<HighlightTokenLine[]>(result)) {
      result
        .then((resolved) => {
          if (!cancelled) setLines(resolved);
        })
        .catch(() => {
          if (!cancelled) setLines(null);
        });
    } else if (!cancelled) {
      setLines(result);
    }
    return () => {
      cancelled = true;
    };
  }, [adapter, code, language]);

  const [copied, setCopied] = React.useState(false);
  const resetTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(
    () => () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    },
    [],
  );

  const handleCopy = React.useCallback(async () => {
    try {
      const clipboard = typeof navigator !== 'undefined' ? navigator.clipboard : undefined;
      if (clipboard?.writeText) {
        await clipboard.writeText(code);
      }
      setCopied(true);
      if (resetTimer.current) clearTimeout(resetTimer.current);
      resetTimer.current = setTimeout(() => setCopied(false), CODE_BLOCK_DEFAULTS.copiedResetMs);
    } catch {
      // Clipboard denial is non-fatal; leave the idle label in place.
    }
  }, [code]);

  const rawLines = React.useMemo(() => code.replace(/\n$/, '').split('\n'), [code]);
  const highlightSet = React.useMemo(() => new Set(highlightLines ?? []), [highlightLines]);
  const gutterWidth = `${String(rawLines.length).length + 1}ch`;

  const renderLineContent = (lineIndex: number): React.ReactNode => {
    const tokenLine = lines?.[lineIndex];
    if (tokenLine) {
      return tokenLine.tokens.map((token, tokenIndex) => (
        <span
          key={tokenIndex}
          data-part="token"
          style={{
            color: token.color,
            fontStyle: token.fontStyle === 'italic' ? 'italic' : undefined,
            fontWeight: token.fontStyle === 'bold' ? 700 : undefined,
          }}
        >
          {token.content}
        </span>
      ));
    }
    // Plain path: render the line verbatim. Empty lines keep height via a
    // zero-width space so the flex row does not collapse.
    return rawLines[lineIndex].length === 0 ? ZERO_WIDTH_SPACE : rawLines[lineIndex];
  };

  return (
    <div
      className={['ds-code-block', className].filter(Boolean).join(' ')}
      data-part="root"
      data-language={language}
      style={{
        borderRadius: 'var(--ds-radius-md, 0.5rem)',
        border: '1px solid var(--ds-color-border, rgba(120,120,120,0.2))',
        background:
          'var(--ds-color-surface-sunken, var(--ds-color-fill-secondary, rgba(120,120,120,0.08)))',
        overflow: 'hidden',
      }}
    >
      <div
        data-part="header"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--ds-spacing-2, 0.5rem)',
          padding: 'var(--ds-spacing-2, 0.5rem) var(--ds-spacing-3, 0.75rem)',
          borderBottom: '1px solid var(--ds-color-border, rgba(120,120,120,0.15))',
          minHeight: '2.25rem',
        }}
      >
        <span
          data-part="title"
          style={{
            fontSize: '0.8125rem',
            color: 'var(--ds-color-text-secondary, inherit)',
            fontFamily: title ? undefined : MONO_FONT,
          }}
        >
          {title ?? language ?? ''}
        </span>
        <button
          type="button"
          data-part="copy-button"
          data-copied={copied ? 'true' : 'false'}
          onClick={handleCopy}
          aria-label={copied ? copiedLabel : copyLabel}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--ds-spacing-1, 0.25rem)',
            padding: 'var(--ds-spacing-1, 0.25rem) var(--ds-spacing-2, 0.5rem)',
            borderRadius: 'var(--ds-radius-sm, 0.25rem)',
            border: '1px solid var(--ds-color-border, rgba(120,120,120,0.25))',
            background: 'transparent',
            color: 'var(--ds-color-text-secondary, inherit)',
            font: 'inherit',
            fontSize: '0.8125rem',
            cursor: 'pointer',
          }}
        >
          <span aria-hidden="true" data-part="copy-tick" data-copied={copied ? 'true' : 'false'}>
            {copied ? '✓' : ''}
          </span>
          <span>{copied ? copiedLabel : copyLabel}</span>
        </button>
      </div>

      <div aria-live="polite" data-part="copy-status" style={SR_ONLY}>
        {copied ? copiedLabel : ''}
      </div>

      <div
        data-part="scroll"
        style={{
          overflowX: wrap ? 'hidden' : 'auto',
          overflowY: maxHeight ? 'auto' : undefined,
          maxHeight,
        }}
      >
        <pre
          role="group"
          aria-label={ariaLabel ?? 'Code block'}
          data-part="pre"
          style={{
            margin: 0,
            padding: 'var(--ds-spacing-3, 0.75rem)',
            fontFamily: MONO_FONT,
            fontSize: '0.85rem',
            lineHeight: 1.6,
            tabSize: 2,
          }}
        >
          <code data-part="code" style={{ display: 'block', fontFamily: MONO_FONT }}>
            {rawLines.map((_, lineIndex) => {
              const lineNumber = lineIndex + 1;
              const highlighted = highlightSet.has(lineNumber);
              return (
                <span
                  key={lineIndex}
                  data-part="line"
                  data-highlighted={highlighted ? 'true' : undefined}
                  style={{
                    display: 'flex',
                    background: highlighted
                      ? 'var(--ds-color-warning-subtle, rgba(250,204,21,0.14))'
                      : undefined,
                    whiteSpace: wrap ? 'pre-wrap' : 'pre',
                    wordBreak: wrap ? 'break-word' : undefined,
                  }}
                >
                  {showLineNumbers ? (
                    <span
                      aria-hidden="true"
                      data-part="line-number"
                      style={{
                        flex: '0 0 auto',
                        width: gutterWidth,
                        marginRight: 'var(--ds-spacing-3, 0.75rem)',
                        textAlign: 'right',
                        userSelect: 'none',
                        color: 'var(--ds-color-text-tertiary, rgba(120,120,120,0.7))',
                      }}
                    >
                      {lineNumber}
                    </span>
                  ) : null}
                  <span data-part="line-content" style={{ flex: '1 1 auto', minWidth: 0 }}>
                    {renderLineContent(lineIndex)}
                  </span>
                </span>
              );
            })}
          </code>
        </pre>
      </div>
    </div>
  );
}

CodeBlock.displayName = 'CodeBlock';
