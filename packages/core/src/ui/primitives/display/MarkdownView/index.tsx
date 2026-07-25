'use client';

/**
 * @fileoverview MarkdownView -- renders a bounded CommonMark subset as a leaf
 * display primitive.
 *
 * As a leaf primitive it emits its own DOM (the sanctioned raw-element tier of
 * the design system) and stays token-governed through CSS custom properties and
 * `data-part` anatomy so skins can restyle it per engine/tenant. Paint
 * ownership is per part: the inline style objects own the static parts
 * (blockquote, lists, tables, code, task checkbox) with canonical `--ds-*`
 * tokens and logical directional properties, while the family skin
 * (`presentation/components/skin/markdown-view.css`) owns the interactive
 * link part including its underline and hover/focus-visible states (inline
 * styles cannot express pseudo-states). The parser
 * (runtime/parser) produces an AST; this component walks it and
 * constructs React elements whose children are escaped text nodes.
 *
 * Security invariant (independent of which element tag wraps the text):
 *   (a) every node is built via React element construction with escaped
 *       `{textNode}` children -- there is no `dangerouslySetInnerHTML` anywhere,
 *       including code fences;
 *   (b) the parser performs no raw-HTML passthrough -- HTML in the source is
 *       inert literal text, never elements;
 *   (c) every link destination is validated by `sanitizeHref` against the
 *       scheme allowlist before it reaches the DOM, and `rel="noopener
 *       noreferrer"` is always set.
 * Hostile markdown can therefore only ever become inert text -- XSS-safety is a
 * structural property, not a runtime scrub.
 */

import React from 'react';

import { densityScopeAttributes } from '@/infrastructure/runtime/foundation/density';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { parseMarkdown } from './runtime/parser';
import { sanitizeHref } from './runtime/link-safety';
import type {
  MarkdownBlockNode,
  MarkdownInlineNode,
  MarkdownLinkPolicy,
  MarkdownTableAlign,
  MarkdownViewProps,
} from './contracts';

export type {
  MarkdownViewProps,
  MarkdownDensity,
  MarkdownLinkPolicy,
  MarkdownLinkScheme,
  MarkdownCodeSlotProps,
  MarkdownNode,
  MarkdownBlockNode,
  MarkdownInlineNode,
  MarkdownHeadingNode,
  MarkdownParagraphNode,
  MarkdownCodeBlockNode,
  MarkdownBlockquoteNode,
  MarkdownListNode,
  MarkdownListItemNode,
  MarkdownTableNode,
  MarkdownTableCellNode,
  MarkdownTableAlign,
  MarkdownThematicBreakNode,
  MarkdownTextNode,
  MarkdownEmphasisNode,
  MarkdownStrongNode,
  MarkdownInlineCodeNode,
  MarkdownLinkNode,
} from './contracts';

export { parseMarkdown, parseInline } from './runtime/parser';
export { sanitizeHref } from './runtime/link-safety';

const MONO_FONT = 'var(--ds-font-family-mono, ui-monospace, SFMono-Regular, Menlo, monospace)';

const BLOCK_GAP: Record<'compact' | 'comfortable', string> = {
  compact: 'var(--ds-spacing-2)',
  comfortable: 'var(--ds-spacing-4)',
};

const INLINE_CODE_STYLE: React.CSSProperties = {
  fontFamily: MONO_FONT,
  fontSize: '0.875em',
  padding: '0.1em 0.35em',
  borderRadius: 'var(--ds-radius-sm)',
  background: 'var(--ds-surface-inset)',
  color: 'var(--ds-color-text-primary)',
};

// ---------------------------------------------------------------------------
// Inline rendering
// ---------------------------------------------------------------------------

function renderInline(
  nodes: MarkdownInlineNode[],
  policy: MarkdownLinkPolicy | undefined,
  keyPrefix: string,
): React.ReactNode[] {
  return nodes.map((node, index) => {
    const key = `${keyPrefix}-${index}`;
    switch (node.type) {
      case 'text':
        return <React.Fragment key={key}>{node.value}</React.Fragment>;
      case 'emphasis':
        return (
          <em key={key} data-part="emphasis">
            {renderInline(node.children, policy, key)}
          </em>
        );
      case 'strong':
        return (
          <strong key={key} data-part="strong">
            {renderInline(node.children, policy, key)}
          </strong>
        );
      case 'inlineCode':
        return (
          <code key={key} data-part="inline-code" style={INLINE_CODE_STYLE}>
            {node.value}
          </code>
        );
      case 'link':
        return renderLink(node, policy, key);
      default:
        return null;
    }
  });
}

function renderLink(
  node: Extract<MarkdownInlineNode, { type: 'link' }>,
  policy: MarkdownLinkPolicy | undefined,
  key: string,
): React.ReactNode {
  const safe = sanitizeHref(node.href, policy?.allow);
  const children = renderInline(node.children, policy, key);
  if (safe === null) {
    // Disallowed destination: render the label as inert text, never a link.
    return <React.Fragment key={key}>{children}</React.Fragment>;
  }
  const onNavigate = policy?.onNavigate;
  return (
    <a
      key={key}
      href={safe}
      rel="noopener noreferrer"
      data-part="link"
      onClick={
        onNavigate
          ? (event: React.MouseEvent<HTMLAnchorElement>) => {
              event.preventDefault();
              onNavigate(safe);
            }
          : undefined
      }
    >
      {children}
    </a>
  );
}

// ---------------------------------------------------------------------------
// Block rendering
// ---------------------------------------------------------------------------

function alignToStyle(align: MarkdownTableAlign): React.CSSProperties['textAlign'] {
  // Logical alignment: an authored `---:` column reads as "toward the end of
  // the line", so RTL tables mirror without a markup branch.
  if (align === 'center') return 'center';
  if (align === 'right') return 'end';
  if (align === 'left') return 'start';
  return undefined;
}

/**
 * Component-owned accessibility strings, resolved in the component through the
 * guarded i18n channel and threaded into the pure block walkers.
 */
interface MarkdownA11yLabels {
  /** Accessible name for a checked task-list indicator. */
  taskChecked: string;
  /** Accessible name for an unchecked task-list indicator. */
  taskUnchecked: string;
}

function renderBlocks(
  nodes: MarkdownBlockNode[],
  props: MarkdownViewProps,
  density: 'compact' | 'comfortable',
  keyPrefix: string,
  a11y: MarkdownA11yLabels,
): React.ReactNode[] {
  const policy = props.linkPolicy;
  const gap = BLOCK_GAP[density];

  return nodes.map((node, index) => {
    const key = `${keyPrefix}-${index}`;
    const spacing = index === 0 ? undefined : gap;

    switch (node.type) {
      case 'heading':
        return React.createElement(
          `h${node.level}`,
          { key, 'data-part': 'heading', style: { marginTop: spacing } },
          renderInline(node.children, policy, key),
        );
      case 'paragraph':
        return (
          <p key={key} data-part="paragraph" style={{ marginTop: spacing }}>
            {renderInline(node.children, policy, key)}
          </p>
        );
      case 'code':
        return (
          <div key={key} data-part="code-block" style={{ marginTop: spacing }}>
            {props.slots?.code ? (
              props.slots.code({ code: node.value, language: node.language })
            ) : (
              <pre
                data-part="code-block-pre"
                data-language={node.language}
                style={{
                  margin: 0,
                  padding: 'var(--ds-spacing-3)',
                  overflowX: 'auto',
                  borderRadius: 'var(--ds-radius-md)',
                  background: 'var(--ds-surface-inset)',
                  border: '1px solid var(--ds-color-border)',
                }}
              >
                <code
                  style={{
                    fontFamily: MONO_FONT,
                    fontSize: '0.85rem',
                    lineHeight: 'var(--ds-line-height-body)',
                    whiteSpace: 'pre',
                    color: 'var(--ds-color-text-primary)',
                  }}
                >
                  {node.value}
                </code>
              </pre>
            )}
          </div>
        );
      case 'blockquote':
        return (
          <blockquote
            key={key}
            data-part="blockquote"
            style={{
              marginTop: spacing,
              marginInline: 0,
              paddingInlineStart: 'var(--ds-spacing-4)',
              borderInlineStart: '3px solid var(--ds-color-border)',
              color: 'var(--ds-color-text-secondary)',
            }}
          >
            {renderBlocks(node.children, props, density, key, a11y)}
          </blockquote>
        );
      case 'list': {
        const isTaskList = node.items.some((it) => it.checked !== null);
        const listStyle: React.CSSProperties = {
          marginTop: spacing,
          paddingInlineStart: 'var(--ds-spacing-6)',
          listStyleType: isTaskList ? 'none' : undefined,
        };
        const items = node.items.map((item, itemIndex) => {
          const itemKey = `${key}-i${itemIndex}`;
          const isTask = item.checked !== null;
          return (
            <li
              key={itemKey}
              data-part="list-item"
              style={{
                marginTop: itemIndex === 0 ? undefined : 'var(--ds-spacing-1)',
                display: isTask ? 'flex' : undefined,
                alignItems: isTask ? 'flex-start' : undefined,
                gap: isTask ? 'var(--ds-spacing-2)' : undefined,
              }}
            >
              {isTask ? (
                <span
                  role="checkbox"
                  aria-checked={item.checked === true}
                  aria-disabled="true"
                  aria-label={item.checked ? a11y.taskChecked : a11y.taskUnchecked}
                  data-part="task-checkbox"
                  data-checked={item.checked ? 'true' : 'false'}
                  style={{
                    flex: '0 0 auto',
                    width: '0.95em',
                    height: '0.95em',
                    marginTop: '0.2em',
                    borderRadius: 'var(--ds-radius-sm)',
                    border: '1px solid var(--ds-color-border)',
                    background: item.checked
                      ? 'var(--ds-color-primary)'
                      : 'transparent',
                    boxShadow: item.checked
                      ? 'inset 0 0 0 0.12em var(--ds-surface-canvas)'
                      : undefined,
                  }}
                />
              ) : null}
              <span data-part="list-item-content" style={{ flex: '1 1 auto', minWidth: 0 }}>
                {renderBlocks(item.children, props, density, itemKey, a11y)}
              </span>
            </li>
          );
        });
        return node.ordered ? (
          <ol
            key={key}
            data-part="list"
            start={node.start !== 1 ? node.start : undefined}
            style={listStyle}
          >
            {items}
          </ol>
        ) : (
          <ul key={key} data-part="list" style={listStyle}>
            {items}
          </ul>
        );
      }
      case 'table':
        return (
          <div key={key} data-part="table-wrapper" style={{ marginTop: spacing, overflowX: 'auto' }}>
            <table data-part="table" style={{ borderCollapse: 'collapse', width: '100%' }}>
              <thead data-part="table-head">
                <tr>
                  {node.header.map((cell, cellIndex) => (
                    <th
                      key={`${key}-h${cellIndex}`}
                      data-part="table-header-cell"
                      style={{
                        // Null align defaults to logical start (UA centers th,
                        // which misaligns against the start-aligned body
                        // column below it).
                        textAlign: alignToStyle(node.align[cellIndex] ?? null) ?? 'start',
                        padding: 'var(--ds-spacing-2)',
                        borderBottom: '2px solid var(--ds-color-border)',
                        fontWeight: 600,
                      }}
                    >
                      {renderInline(cell.children, policy, `${key}-h${cellIndex}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody data-part="table-body">
                {node.rows.map((row, rowIndex) => (
                  <tr key={`${key}-r${rowIndex}`}>
                    {row.map((cell, cellIndex) => (
                      <td
                        key={`${key}-r${rowIndex}c${cellIndex}`}
                        data-part="table-cell"
                        style={{
                          textAlign: alignToStyle(node.align[cellIndex] ?? null),
                          padding: 'var(--ds-spacing-2)',
                          borderBottom: '1px solid var(--ds-color-border)',
                        }}
                      >
                        {renderInline(cell.children, policy, `${key}-r${rowIndex}c${cellIndex}`)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'thematicBreak':
        return (
          <hr
            key={key}
            data-part="thematic-break"
            style={{
              marginTop: spacing,
              border: 'none',
              borderTop: '1px solid var(--ds-color-border)',
            }}
          />
        );
      default:
        return null;
    }
  });
}

/**
 * Render a markdown source string onto token-governed DOM.
 */
export function MarkdownView({
  source,
  density = 'comfortable',
  linkPolicy,
  slots,
  className,
}: MarkdownViewProps): React.ReactElement {
  const blocks = React.useMemo(() => parseMarkdown(source), [source]);
  const props: MarkdownViewProps = { source, density, linkPolicy, slots, className };

  // Component-owned accessibility strings: translated when an I18nProvider is
  // mounted, with the documented English fallbacks otherwise (a missing
  // catalog key echoes the full key, which the endsWith guard detects).
  // Behavior is byte-identical until the locale JSONs land (K4-B guarded
  // i18n channel, remediation R1: axe aria-toggle-field-name).
  const i18n = useOptionalTranslation('components');
  const markdownLabel = (key: string, fallback: string): string => {
    const translated = i18n?.t(key);
    return translated && !translated.endsWith(key) ? translated : fallback;
  };
  const a11y: MarkdownA11yLabels = {
    taskChecked: markdownLabel('markdownView.taskChecked', 'Task completed'),
    taskUnchecked: markdownLabel('markdownView.taskUnchecked', 'Task not completed'),
  };

  return (
    <div
      className={['ds-markdown-view', className].filter(Boolean).join(' ')}
      data-part="root"
      {...densityScopeAttributes(density)}
      style={{
        // Unbroken hostile tokens (long URLs/identifiers) wrap instead of
        // overflowing the column (Pass 2 capture evidence: 390px overflow).
        overflowWrap: 'break-word',
      }}
    >
      {renderBlocks(blocks, props, density, 'md', a11y)}
    </div>
  );
}

MarkdownView.displayName = 'MarkdownView';
