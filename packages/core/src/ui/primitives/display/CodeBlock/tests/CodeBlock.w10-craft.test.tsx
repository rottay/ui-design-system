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
    '../../../../../foundation/tokens/css/presentation/components/skin/code-block.css',
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
      'var(--ds-code-block-motion-duration, var(--ds-duration-fast, 120ms))',
    );
    // The copy control's own font-size also rides the type scale now.
    expect(skin).toContain('font-size: var(--ds-font-size-xs)');
    expect(skin).not.toContain('font-size: 0.8125rem');
  });
});
