import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';

import { MarkdownView } from '../index';

afterEach(cleanup);

describe('MarkdownView -- rendering', () => {
  it('renders headings as semantic heading elements', () => {
    const { container } = render(<MarkdownView source="# Hello world" />);
    expect(container.querySelector('h1')?.textContent).toBe('Hello world');
  });

  it('renders strong and emphasis without raw markers', () => {
    const { container } = render(<MarkdownView source="This is **bold** and *italic*." />);
    expect(container.querySelector('[data-part="strong"]')?.textContent).toBe('bold');
    expect(container.querySelector('[data-part="emphasis"]')?.textContent).toBe('italic');
    expect(container.textContent).not.toContain('**');
  });

  it('renders inline code and fenced code blocks', () => {
    const { container } = render(
      <MarkdownView source={'Use `npm ci`.\n\n```js\nconst a = 1;\n```'} />,
    );
    expect(container.querySelector('[data-part="inline-code"]')?.textContent).toBe('npm ci');
    expect(container.querySelector('[data-part="code-block-pre"]')?.textContent).toContain(
      'const a = 1;',
    );
  });

  it('renders task list items with an aria checkbox reflecting state', () => {
    const { container } = render(<MarkdownView source={'- [x] done\n- [ ] todo'} />);
    const boxes = container.querySelectorAll('[role="checkbox"]');
    expect(boxes).toHaveLength(2);
    expect(boxes[0].getAttribute('aria-checked')).toBe('true');
    expect(boxes[1].getAttribute('aria-checked')).toBe('false');
  });

  it('renders GFM tables', () => {
    const { container } = render(<MarkdownView source={'| a | b |\n| - | - |\n| 1 | 2 |'} />);
    expect(container.querySelectorAll('th')).toHaveLength(2);
    expect(container.querySelectorAll('td')).toHaveLength(2);
  });

  it('reflects density on the root', () => {
    const { container } = render(<MarkdownView source="hi" density="compact" />);
    expect(container.querySelector('[data-part="root"]')?.getAttribute('data-density')).toBe(
      'compact',
    );
  });

  it('lets a code slot override the default fence renderer', () => {
    const { getByTestId } = render(
      <MarkdownView
        source={'```ts\nx\n```'}
        slots={{ code: ({ language }) => <div data-testid="slot">{language}</div> }}
      />,
    );
    expect(getByTestId('slot').textContent).toBe('ts');
  });
});

describe('MarkdownView -- links', () => {
  it('renders allowed links as anchors with a safe rel', () => {
    const { container } = render(<MarkdownView source="[site](https://example.com)" />);
    const anchor = container.querySelector('a');
    expect(anchor?.getAttribute('href')).toBe('https://example.com');
    expect(anchor?.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('downgrades disallowed-scheme links to inert text (no anchor)', () => {
    const { container } = render(<MarkdownView source="[click](javascript:alert(1))" />);
    expect(container.querySelector('a')).toBeNull();
    expect(container.textContent).toContain('click');
  });

  it('routes navigation through onNavigate when provided', () => {
    const onNavigate = vi.fn();
    const { container } = render(
      <MarkdownView source="[go](https://x.com)" linkPolicy={{ onNavigate }} />,
    );
    fireEvent.click(container.querySelector('a')!);
    expect(onNavigate).toHaveBeenCalledWith('https://x.com');
  });
});

describe('MarkdownView -- XSS safety', () => {
  it('never emits markup for raw HTML; the tag is inert text', () => {
    const { container } = render(<MarkdownView source={'<script>window.__pwned = 1;</script>'} />);
    expect(container.querySelector('script')).toBeNull();
    expect(container.textContent).toContain('<script>window.__pwned = 1;</script>');
    expect((window as unknown as { __pwned?: number }).__pwned).toBeUndefined();
  });

  it('does not create an img element from raw image HTML', () => {
    const { container } = render(<MarkdownView source={'<img src=x onerror="alert(1)">'} />);
    expect(container.querySelector('img')).toBeNull();
  });

  it('does not honor entity-encoded javascript hrefs', () => {
    const { container } = render(<MarkdownView source={'[x](&#106;avascript:alert(1))'} />);
    expect(container.querySelector('a')).toBeNull();
  });

  it('does not use dangerouslySetInnerHTML for any node type', () => {
    // A code fence containing markup must render as inert text, not markup.
    const { container } = render(
      <MarkdownView source={'```html\n<script>alert(1)</script>\n```'} />,
    );
    expect(container.querySelector('script')).toBeNull();
    expect(container.querySelector('[data-part="code-block-pre"]')?.textContent).toContain(
      '<script>alert(1)</script>',
    );
  });
});
