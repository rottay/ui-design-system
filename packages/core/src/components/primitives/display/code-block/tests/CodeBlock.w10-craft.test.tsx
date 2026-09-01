import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';

import { CodeBlock } from '../index';

// W10 second visual pass (Modern craft). Paint-only changes: the existing
// suites keep passing untouched; this file pins the NEW grammar so a future
// regression is falsifiable. Ownership contract is unchanged -- static parts
// stay inline-painted in index.tsx, interaction/selection state stays in the
// family skin.
const source = readFileSync(join(__dirname, '..', 'index.tsx'), 'utf8');
const skin = readFileSync(
  join(
    __dirname,
    '../../../../../foundation/tokens/css/presentation/components/skin/code-block/index.css',
  ),
  'utf8',
);

const LABELS = { copyLabel: 'Copy', copiedLabel: 'Copied' };

afterEach(cleanup);

describe('CodeBlock W10 second visual pass (Modern craft)', () => {
  it('lifts the header chrome off the code surface with a governed tint (hierarchy without a second box)', () => {
    expect(source).toContain('--ds-code-block-header-bg');
    expect(source).toContain(
      'color-mix(in srgb, var(--ds-color-text-primary) 3%, transparent)',
    );
  });

  it('types the header label by role: filename in mono, bare language tag as a tracked uppercase caption', () => {
    expect(source).toContain('fontFamily: title ? MONO_FONT : undefined');
    expect(source).toContain('fontWeight: title ? 500 : 600');
    expect(source).toContain("textTransform: title ? undefined : 'uppercase'");
    expect(source).toContain(
      "letterSpacing: title ? undefined : 'var(--ds-letter-spacing-wider)'",
    );
    expect(source).toContain("fontSize: 'var(--ds-font-size-xs)'");
    // No font-size literal survives in the header label.
    expect(source).not.toContain("fontSize: '0.8125rem'");
  });

  it('sets the code on the type scale instead of a font-size literal', () => {
    expect(source).toContain("fontSize: 'var(--ds-font-size-sm)'");
    expect(source).not.toContain("fontSize: '0.85rem'");
  });

  it('keeps the header label rendered for both roles (language tag and filename)', () => {
    const { container, rerender } = render(
      <CodeBlock code={'const a = 1;'} language="ts" {...LABELS} />,
    );
    expect(container.querySelector('[data-part="title"]')?.textContent).toBe('ts');

    rerender(<CodeBlock code={'const a = 1;'} title="candidate.ts" {...LABELS} />);
    expect(container.querySelector('[data-part="title"]')?.textContent).toBe('candidate.ts');
  });

  it('confirms the copy with the success grammar (ink pulled toward the source text ink)', () => {
    expect(skin).toContain("[data-part='copy-button'][data-copied='true']");
    expect(skin).toContain('--ds-code-block-copied-ink');
    expect(skin).toContain(
      'color-mix(in srgb, var(--ds-color-success) 70%, var(--ds-color-text-primary))',
    );
    expect(skin).toContain('--ds-code-block-copied-frame');
  });

  it('paints selection from the primary tint, declared in the skin ownership header', () => {
    expect(skin).toContain(".ds-code-block[data-part='root'] ::selection");
    expect(skin).toContain('--ds-code-block-selection-bg');
    expect(skin).toContain('color-mix(in srgb, var(--ds-color-primary) 28%, transparent)');
  });

  it('animates the copy control on the governed fast-duration channel with a family escape hatch', () => {
    expect(skin).toContain(
      'var(--ds-code-block-motion-duration, var(--ds-motion-fast))',
    );
    expect(skin).not.toContain('var(--ds-motion-fast, 120ms)');
    // The copy control's own font-size also rides the type scale now.
    expect(skin).toContain('font-size: var(--ds-font-size-xs)');
    expect(skin).not.toContain('font-size: 0.8125rem');
  });
});

describe('CodeBlock highlighted lines carry a non-colour signal', () => {
  // The wash was the only carrier of `highlightLines`. Forced colors strips
  // backgrounds, so the emphasis disappeared in the mode that needs it most,
  // and it never reached a monochrome reader at all.
  const renderBlock = () =>
    render(
      <CodeBlock
        code={'const a = 1;\nconst b = 2;\nconst c = 3;'}
        highlightLines={[2]}
        copyLabel="Copy"
        copiedLabel="Copied"
      />,
    );

  it('gives the marked line a leading rail in addition to the wash', () => {
    const { container } = renderBlock();
    const marked = container.querySelector('[data-highlighted="true"]') as HTMLElement;

    expect(marked).toHaveTextContent('const b = 2;');
    expect(marked.style.borderInlineStart).toContain(
      'var(--ds-color-warning)',
    );
  });

  it('reserves the same rail width on unmarked lines so marking never shifts code', () => {
    const { container } = renderBlock();
    const lines = Array.from(
      container.querySelectorAll('[data-part="line"]'),
    ) as HTMLElement[];

    expect(lines).toHaveLength(3);
    const widths = new Set(
      lines.map((line) => line.style.borderInlineStart.split(' solid ')[0]),
    );
    expect(Array.from(widths)).toEqual([
      'var(--ds-border-width-medium, 2px)',
    ]);

    const unmarked = lines.filter((line) => !line.hasAttribute('data-highlighted'));
    expect(unmarked).toHaveLength(2);
    for (const line of unmarked) {
      expect(line.style.borderInlineStart).toContain('transparent');
    }
  });

  it('keeps the rail on the logical inline start so RTL needs no fork', () => {
    const { container } = renderBlock();
    const marked = container.querySelector('[data-highlighted="true"]') as HTMLElement;

    expect(marked.style.borderLeft).toBe('');
    expect(marked.style.borderRight).toBe('');
  });

  it('exposes the rail width as its own tenant channel', () => {
    const { container } = renderBlock();
    const marked = container.querySelector('[data-highlighted="true"]') as HTMLElement;

    expect(marked.style.borderInlineStart).toContain(
      '--ds-border-width-medium',
    );
  });
});
