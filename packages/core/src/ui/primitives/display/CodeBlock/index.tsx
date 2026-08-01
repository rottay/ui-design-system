'use client';

/**
 * @fileoverview CodeBlock -- source-code display primitive.
 *
 * Single engine-agnostic implementation. As a leaf display primitive it emits
 * its own DOM (the sanctioned raw-element tier of the design system, like every
 * primitive engine implementation and the chart renderers) and stays
 * token-governed through CSS custom properties and `data-part` anatomy so skins
 * can restyle it per engine/tenant. Paint ownership is per part: the inline
 * style objects own the static parts (root surface, header, gutter, code) with
 * canonical `--ds-*` tokens and logical directional properties, while the
 * family skin (`presentation/components/skin/code-block.css`) owns the
 * interactive copy-button part, the scroll region's focus ring and the
 * ::selection tint (inline styles cannot express :hover/:focus-visible or
 * selection state). The default renderer is honest
 * and dependency-free: a `pre`/`code` block with an optional line-number
 * gutter, a line-highlight band, and a selection-safe copy control.
 *
 * Syntax highlighting is delegated to an app-registered
 * {@link HighlighterAdapter}; the design system imports no tokenizer of its
 * own. When no adapter is registered the plain path renders. Code content is
 * placed as a React text child, never as HTML, so it can never execute or
 * inject markup.
 */

import React from 'react';

import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { CheckIcon, CopyIcon } from '../../../../graphics/icons';
import { VisuallyHidden } from '../../foundation';
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

// Fallback parity law: `--ds-font-family-mono` is a declared channel, so the
// var() stays bare and resolves to the governed default stack.
const MONO_FONT = 'var(--ds-font-family-mono)';
const ZERO_WIDTH_SPACE = String.fromCharCode(0x200b);

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

  // Component-owned strings: translated when an I18nProvider is mounted, with
  // the documented English fallbacks otherwise (a missing catalog key echoes
  // back the full key, which the endsWith guard detects). Behavior is
  // byte-identical until the locale JSONs land (K4-B guarded i18n channel).
  const i18n = useOptionalTranslation('components');
  const codeBlockLabel = (key: string, fallback: string): string => {
    const translated = i18n?.t(key);
    return translated && !translated.endsWith(key) ? translated : fallback;
  };

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
  // The scroll region only engages when horizontal scrolling is possible
  // (no wrap) or a maxHeight caps the block; only then does it need keyboard
  // reachability (axe scrollable-region-focusable, K4-B remediation R4).
  const scrollable = !wrap || maxHeight !== undefined;

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
        borderRadius: 'var(--ds-radius-md)',
        border: '1px solid var(--ds-color-border)',
        background: 'var(--ds-surface-inset)',
        overflow: 'hidden',
      }}
    >
      <div
        data-part="header"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--ds-spacing-2)',
          padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
          borderBottom: '1px solid var(--ds-color-border)',
          minHeight: '2.25rem',
          // Header/body hierarchy: a whisper of the source's own text ink lifts
          // the chrome off the inset code surface without stacking a second
          // box (mode-adaptive, hue-faithful; tenant escape hatch first).
          background:
            'var(--ds-code-block-header-bg, color-mix(in srgb, var(--ds-color-text-primary) 3%, transparent))',
        }}
      >
        <span
          data-part="title"
          data-language-badge={!title && language ? 'true' : undefined}
          style={{
            fontSize: 'var(--ds-font-size-xs)',
            color: 'var(--ds-color-text-secondary)',
            // The label is typed by role so the two cases never blur: an
            // explicit title (a filename) reads as code in mono; the bare
            // language tag reads as a tracked uppercase caption in sans.
            fontFamily: title ? MONO_FONT : undefined,
            fontWeight: title ? 500 : 600,
            textTransform: title ? undefined : 'uppercase',
            letterSpacing: title ? undefined : 'var(--ds-letter-spacing-wider)',
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
        >
          <span aria-hidden="true" data-part="copy-tick" data-copied={copied ? 'true' : 'false'}>
            {copied ? (
              <CheckIcon size={12} strokeWidth={2.4} aria-hidden />
            ) : (
              // Idle affordance: the governed copy role (same facade tier as the
              // confirmation tick) makes the control identifiable before use;
              // decorative -- the button's aria-label carries the name.
              <CopyIcon size={12} strokeWidth={2} aria-hidden />
            )}
          </span>
          <span>{copied ? copiedLabel : copyLabel}</span>
        </button>
      </div>

      {/* The copied announcement rides the canonical VisuallyHidden rule (P0
          primitive) instead of a local clip-inline style object. */}
      <VisuallyHidden as="div" aria-live="polite" data-part="copy-status">
        {copied ? copiedLabel : ''}
      </VisuallyHidden>

      <div
        data-part="scroll"
        role={scrollable ? 'region' : undefined}
        tabIndex={scrollable ? 0 : undefined}
        aria-label={
          scrollable
            ? (ariaLabel ?? codeBlockLabel('codeBlock.regionLabel', 'Code block'))
            : undefined
        }
        style={{
          overflowX: wrap ? 'hidden' : 'auto',
          overflowY: maxHeight ? 'auto' : undefined,
          maxHeight,
          // Channeled scrollbar: quiet thin track that follows the tenant's
          // border token instead of the UA default chrome.
          scrollbarWidth: 'thin',
          scrollbarColor: 'var(--ds-color-border-secondary) transparent',
          // Scroll containment: wheel/touch deltas dead-end inside the block
          // instead of chaining into the page scroll (the block never hijacks
          // the document's scroll, the document never steals the block's).
          overscrollBehavior: 'contain',
        }}
      >
        <pre
          role="group"
          aria-label={ariaLabel ?? codeBlockLabel('codeBlock.regionLabel', 'Code block')}
          data-part="pre"
          style={{
            margin: 0,
            padding: 'var(--ds-spacing-3)',
            fontFamily: MONO_FONT,
            fontSize: 'var(--ds-font-size-sm)',
            lineHeight: 'var(--ds-line-height-body)',
            // The block owns its inset surface, so it also owns the ink paired
            // with it (the MarkdownView fence law): code never inherits a
            // dimmed ancestor ink onto the inset floor. Adapter token spans
            // still override per token.
            color: 'var(--ds-color-text-primary)',
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
                      ? 'var(--ds-code-block-line-highlight-bg, color-mix(in srgb, var(--ds-color-warning) 14%, transparent))'
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
                        marginInlineEnd: 'var(--ds-spacing-3)',
                        textAlign: 'end',
                        userSelect: 'none',
                        // Line numbers align in columns across widths (tabular
                        // figures; the gutter is decorative and hidden from AT).
                        fontVariantNumeric: 'tabular-nums',
                        // CONTRAST LAW (K4-B remediation, axe color-contrast/
                        // serious): raw tertiary ink fails AA on the inset
                        // surface (3.27:1 measured on the bithire light pair;
                        // TMM DB rides the same vertical base). The ink deepens
                        // 45% toward the source's own primary text ink —
                        // hue-faithful, mode-adaptive (6.13:1 bithire, 6.09:1
                        // TMM, computed from the compiled themes). A tenant's
                        // explicit `--ds-code-block-gutter-ink` stays raw
                        // (escape hatch).
                        color:
                          'var(--ds-code-block-gutter-ink, color-mix(in srgb, var(--ds-color-text-tertiary) 55%, var(--ds-color-text-primary)))',
                      }}
                    >
                      {lineNumber}
                    </span>
                  ) : null}
                  <span
                    data-part="line-content"
                    style={{
                      flex: '1 1 auto',
                      minWidth: 0,
                      // Bidi law: each code line resolves its own base direction
                      // from its first strong character, so LTR source stays LTR
                      // inside an RTL document (and an Arabic comment line reads
                      // RTL) without reordering the gutter or line boundaries.
                      unicodeBidi: 'plaintext',
                    }}
                  >
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
