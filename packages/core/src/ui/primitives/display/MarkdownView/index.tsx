'use client';

/**
 * @fileoverview MarkdownView -- renders a bounded CommonMark subset as a leaf
 * display primitive.
 *
 * As a leaf primitive it emits its own DOM (the sanctioned raw-element tier of
 * the design system) and stays token-governed through CSS custom properties and
 * `data-part` anatomy so skins can restyle it per engine/tenant. The parser
 * (runtime/parser) produces an AST; this component walks it and constructs
 * React elements whose children are escaped text nodes.
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
  compact: 'var(--ds-spacing-2, 0.5rem)',
  comfortable: 'var(--ds-spacing-4, 1rem)',
};

const INLINE_CODE_STYLE: React.CSSProperties = {
  fontFamily: MONO_FONT,
  fontSize: '0.875em',
  padding: '0.1em 0.35em',
  borderRadius: 'var(--ds-radius-sm, 0.25rem)',
  background:
    'var(--ds-color-surface-sunken, var(--ds-color-fill-secondary, rgba(120,120,120,0.14)))',
  color: 'var(--ds-color-text-primary, inherit)',
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
      style={{ color: 'var(--ds-color-link, var(--ds-color-primary, inherit))' }}
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
  if (align === 'center') return 'center';
  if (align === 'right') return 'right';
  if (align === 'left') return 'left';
  return undefined;
}

function renderBlocks(
  nodes: MarkdownBlockNode[],
  props: MarkdownViewProps,
  density: 'compact' | 'comfortable',
  keyPrefix: string,
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
                  padding: 'var(--ds-spacing-3, 0.75rem)',
                  overflowX: 'auto',
                  borderRadius: 'var(--ds-radius-md, 0.5rem)',
                  background:
                    'var(--ds-color-surface-sunken, var(--ds-color-fill-secondary, rgba(120,120,120,0.12)))',
                  border: '1px solid var(--ds-color-border, rgba(120,120,120,0.2))',
                }}
              >
                <code
                  style={{
                    fontFamily: MONO_FONT,
                    fontSize: '0.85rem',
                    lineHeight: 1.6,
                    whiteSpace: 'pre',
                    color: 'var(--ds-color-text-primary, inherit)',
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
              marginLeft: 0,
              marginRight: 0,
              paddingLeft: 'var(--ds-spacing-4, 1rem)',
              borderLeft: '3px solid var(--ds-color-border, rgba(120,120,120,0.3))',
              color: 'var(--ds-color-text-secondary, inherit)',
            }}
          >
            {renderBlocks(node.children, props, density, key)}
          </blockquote>
        );
      case 'list': {
        const isTaskList = node.items.some((it) => it.checked !== null);
        const listStyle: React.CSSProperties = {
          marginTop: spacing,
          paddingLeft: 'var(--ds-spacing-6, 1.5rem)',
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
                marginTop: itemIndex === 0 ? undefined : 'var(--ds-spacing-1, 0.25rem)',
                display: isTask ? 'flex' : undefined,
                alignItems: isTask ? 'flex-start' : undefined,
                gap: isTask ? 'var(--ds-spacing-2, 0.5rem)' : undefined,
              }}
            >
              {isTask ? (
                <span
                  role="checkbox"
                  aria-checked={item.checked === true}
                  aria-disabled="true"
                  data-part="task-checkbox"
                  data-checked={item.checked ? 'true' : 'false'}
                  style={{
                    flex: '0 0 auto',
                    width: '0.95em',
                    height: '0.95em',
                    marginTop: '0.2em',
                    borderRadius: 'var(--ds-radius-sm, 0.25rem)',
                    border: '1px solid var(--ds-color-border, rgba(120,120,120,0.5))',
                    background: item.checked
                      ? 'var(--ds-color-primary, #4b5563)'
                      : 'transparent',
                    boxShadow: item.checked
                      ? 'inset 0 0 0 0.12em var(--ds-color-surface, #fff)'
                      : undefined,
                  }}
                />
              ) : null}
              <span data-part="list-item-content" style={{ flex: '1 1 auto', minWidth: 0 }}>
                {renderBlocks(item.children, props, density, itemKey)}
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
                        textAlign: alignToStyle(node.align[cellIndex] ?? null),
                        padding: 'var(--ds-spacing-2, 0.5rem)',
                        borderBottom: '2px solid var(--ds-color-border, rgba(120,120,120,0.3))',
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
                          padding: 'var(--ds-spacing-2, 0.5rem)',
                          borderBottom: '1px solid var(--ds-color-border, rgba(120,120,120,0.2))',
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
              borderTop: '1px solid var(--ds-color-border, rgba(120,120,120,0.3))',
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

  return (
    <div
      className={['ds-markdown-view', className].filter(Boolean).join(' ')}
      data-part="root"
      data-density={density}
    >
      {renderBlocks(blocks, props, density, 'md')}
    </div>
  );
}

MarkdownView.displayName = 'MarkdownView';
