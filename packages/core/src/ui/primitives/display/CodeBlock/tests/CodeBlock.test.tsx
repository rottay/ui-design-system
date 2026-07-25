import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';

import { CodeBlock, registerHighlighter } from '../index';
import type { HighlighterAdapter } from '../index';

afterEach(() => {
  // Unmount before clearing the registry: `registerHighlighter(null)` emits to
  // `useSyncExternalStore` subscribers, and notifying a still-mounted block
  // re-renders it outside `act` (React act warning). Cleanup first keeps the
  // notification silent.
  cleanup();
  registerHighlighter(null);
  vi.restoreAllMocks();
});

const LABELS = { copyLabel: 'Copy', copiedLabel: 'Copied' };

describe('CodeBlock -- plain rendering', () => {
  it('renders the code verbatim inside a pre/code block', () => {
    const { container } = render(<CodeBlock code={'const a = 1;\nconst b = 2;'} {...LABELS} />);
    expect(container.querySelector('pre code')).toBeTruthy();
    expect(container.textContent).toContain('const a = 1;');
    expect(container.textContent).toContain('const b = 2;');
  });

  it('renders a line-number gutter when requested', () => {
    const { container } = render(<CodeBlock code={'one\ntwo\nthree'} showLineNumbers {...LABELS} />);
    expect(container.querySelectorAll('[data-part="line-number"]')).toHaveLength(3);
  });

  it('emphasizes highlighted lines', () => {
    const { container } = render(<CodeBlock code={'a\nb\nc'} highlightLines={[2]} {...LABELS} />);
    expect(container.querySelectorAll('[data-highlighted="true"]')).toHaveLength(1);
  });

  it('does not execute embedded markup (code is inert text)', () => {
    const { container } = render(<CodeBlock code={'<script>alert(1)</script>'} {...LABELS} />);
    expect(container.querySelector('script')).toBeNull();
    expect(container.textContent).toContain('<script>alert(1)</script>');
  });
});

describe('CodeBlock -- copy control', () => {
  it('exposes the idle copy label and copies to the clipboard', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });

    render(<CodeBlock code={'payload'} {...LABELS} />);
    const button = screen.getByRole('button', { name: 'Copy' });
    fireEvent.click(button);

    await waitFor(() => expect(writeText).toHaveBeenCalledWith('payload'));
    await screen.findByRole('button', { name: 'Copied' });
  });
});

describe('CodeBlock -- highlighter adapter', () => {
  it('renders adapter tokens with their colors when one is registered', async () => {
    const adapter: HighlighterAdapter = {
      id: 'test',
      ssr: true,
      highlight: () => [
        {
          tokens: [
            { content: 'const', color: 'rgb(1, 2, 3)', fontStyle: 'bold' },
            { content: ' x = 1;' },
          ],
        },
      ],
    };
    registerHighlighter(adapter);

    const { container } = render(<CodeBlock code={'const x = 1;'} {...LABELS} />);
    await screen.findByText('const');
    const tokenSpans = container.querySelectorAll('[data-part="token"]');
    expect(tokenSpans.length).toBeGreaterThanOrEqual(2);
    expect((tokenSpans[0] as HTMLElement).style.color).toBe('rgb(1, 2, 3)');
  });

  it('falls back to the plain renderer when no adapter is registered', () => {
    const { container } = render(<CodeBlock code={'plain text'} {...LABELS} />);
    expect(container.textContent).toContain('plain text');
    expect(container.querySelector('[data-part="token"]')).toBeNull();
  });
});
