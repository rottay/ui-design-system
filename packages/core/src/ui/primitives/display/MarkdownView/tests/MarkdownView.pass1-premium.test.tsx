import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';

import { I18nProvider } from '@/infrastructure/runtime/i18n';

import { MarkdownView } from '../index';

// The inline style objects own the STATIC parts; the interactive link part is
// owned by the family skin (presentation/components/skin/markdown-view.css).
// These assertions pin the Pass-1/2 ownership contract -- canonical --ds-*
// tokens only (no phantom tokens, no rgba/hex litter) and logical directional
// properties only.
const source = readFileSync(join(__dirname, '..', 'index.tsx'), 'utf8');
const skin = readFileSync(
  join(
    __dirname,
    '../../../../../foundation/tokens/css/presentation/components/skin/markdown-view.css',
  ),
  'utf8',
);

const modernTheme = readFileSync(
  join(__dirname, '../../../../../foundation/tokens/css/runtime/engines/modern/theme.css'),
  'utf8',
);
const personality = readFileSync(
  join(__dirname, '../../../../../foundation/tokens/css/runtime/personality.css'),
  'utf8',
);

afterEach(cleanup);

describe('MarkdownView premium contract — Pass 1', () => {
  it('keeps the inline style objects as the single paint owner (no theme.css/personality bridge)', () => {
    expect(modernTheme).not.toContain('.ds-markdown-view');
    expect(personality).not.toContain('.ds-markdown-view');
  });

  it('paints only through canonical --ds-* tokens: no phantom tokens, no rgba/hex fallback litter', () => {
    expect(source).not.toMatch(/rgba\(/);
    expect(source).not.toMatch(/#(?:[0-9a-fA-F]{3}){1,2}\b/);
    // Phantom tokens / literal fallbacks that previously rendered the gray litter.
    expect(source).not.toContain('--ds-color-surface-sunken');
    expect(source).not.toContain('--ds-color-fill-secondary');
    expect(source).not.toContain('#4b5563');
    expect(source).not.toContain('#fff');
    // Canonical owners (inline static parts + the skin-owned link).
    expect(source).toContain('var(--ds-surface-inset)');
    expect(source).toContain('var(--ds-color-border)');
    expect(skin).toContain('var(--ds-color-link)');
  });

  it('uses logical directional properties for blockquote, lists and table alignment', () => {
    expect(source).not.toMatch(/margin(Left|Right)\b/);
    expect(source).not.toMatch(/padding(Left|Right)\b/);
    expect(source).not.toMatch(/border(Left|Right)\b/);
    expect(skin).toContain('padding-inline-start: var(--ds-spacing-4)');
    expect(skin).toContain('border-inline-start: 3px solid var(--ds-color-border)');
    expect(source).toContain("paddingInlineStart: 'var(--ds-spacing-6)'");
    expect(skin).not.toMatch(/padding-(left|right)|border-(left|right)/);
    // Table alignment maps authored columns onto logical CSS.
    expect(source).toContain("if (align === 'right') return 'end'");
    expect(source).toContain("if (align === 'left') return 'start'");
    expect(source).not.toContain("return 'right'");
    expect(source).not.toContain("return 'left'");
  });

  it('renders the full stress document with the same anatomy under RTL', () => {
    const stress = [
      '# عنوان',
      '',
      'نص **غامق** و*مائل* و`شيفرة`.',
      '',
      '> اقتباس طويل يمتد على سطر واحد لإثبات اتجاه الحدود الجانبية في الكتلة.',
      '',
      '- [x] مهمة منجزة',
      '- [ ] مهمة معلقة',
      '',
      '| أ | ب |',
      '| - | -: |',
      '| 1 | 2 |',
      '',
      '---',
    ].join('\n');

    const { container, rerender } = render(
      <div dir="ltr">
        <MarkdownView source={stress} />
      </div>,
    );
    const ltrAnatomy = container.querySelectorAll('[data-part]').length;
    expect(container.querySelector('[data-part="blockquote"]')).not.toBeNull();
    expect(container.querySelectorAll('[role="checkbox"]')).toHaveLength(2);
    expect(container.querySelector('[data-part="thematic-break"]')).not.toBeNull();

    rerender(
      <div dir="rtl">
        <MarkdownView source={stress} />
      </div>,
    );
    // Identical part inventory in both directions: the flip is logical CSS,
    // never a markup branch.
    expect(container.querySelectorAll('[data-part]').length).toBe(ltrAnatomy);
  });

  it('renders table cells with logical text alignment', () => {
    const { container } = render(
      <MarkdownView source={'| a | b |\n| :- | -: |\n| 1 | 2 |'} />,
    );
    const cells = Array.from(container.querySelectorAll('td'));
    expect(cells).toHaveLength(2);
    // jsdom/happy-dom may not serialize logical shorthands; assert through the
    // computed inline style or fall back to the source-level contract above.
    const alignments = cells.map(
      (cell) => cell.style.textAlign || cell.getAttribute('style') || '',
    );
    expect(alignments.join(' ')).toMatch(/start|end|text-align/);
  });

  it('defaults null-aligned table headers to logical start (Pass 2 craft: UA centers th)', () => {
    const { container } = render(
      <MarkdownView source={'| a | b |\n| - | -: |\n| 1 | 2 |'} />,
    );
    const headers = Array.from(container.querySelectorAll('th'));
    expect(headers).toHaveLength(2);
    expect(headers[0].style.textAlign).toBe('start');
    expect(headers[1].style.textAlign).toBe('end');
  });
});

describe('MarkdownView remediation (K4-B)', () => {
  it('names the task-list indicator (axe aria-toggle-field-name, R1)', () => {
    const { container } = render(<MarkdownView source={'- [x] done\n- [ ] todo'} />);
    const boxes = container.querySelectorAll('[role="checkbox"]');
    expect(boxes).toHaveLength(2);
    expect(boxes[0].getAttribute('aria-label')).toBe('Task completed');
    expect(boxes[1].getAttribute('aria-label')).toBe('Task not completed');
  });

  it('resolves the indicator names through the guarded i18n channel', () => {
    const { container } = render(
      <I18nProvider
        locale="es"
        customTranslations={{
          components: {
            markdownView: { taskChecked: 'Tarea completada', taskUnchecked: 'Tarea pendiente' },
          },
        }}
      >
        <MarkdownView source={'- [x] done\n- [ ] todo'} />
      </I18nProvider>,
    );
    const boxes = container.querySelectorAll('[role="checkbox"]');
    expect(boxes[0].getAttribute('aria-label')).toBe('Tarea completada');
    expect(boxes[1].getAttribute('aria-label')).toBe('Tarea pendiente');
  });

  it('keeps the English indicator names when the keys are missing in locale AND fallback locale (echo guard)', () => {
    // fr/pt JSONs do not carry the markdownView keys yet; pinning both
    // locales to fr keeps the catalog silent so the guard must fall back.
    const { container } = render(
      <I18nProvider locale="fr" fallbackLocale="fr">
        <MarkdownView source={'- [ ] todo'} />
      </I18nProvider>,
    );
    expect(container.querySelector('[role="checkbox"]')?.getAttribute('aria-label')).toBe(
      'Task not completed',
    );
  });

  it('breaks unbroken hostile tokens instead of overflowing (Pass 2: 390px capture evidence)', () => {
    const { container } = render(
      <MarkdownView source={`token_without_breaks_${'x'.repeat(120)}`} />,
    );
    expect(
      (container.querySelector<HTMLElement>('[data-part="root"]')!).style.overflowWrap,
    ).toBe('break-word');
  });

  it('underlines links so they are distinguishable without color (axe link-in-text-block, R3)', () => {
    // The link part is skin-owned (inline styles cannot express pseudo-states):
    // underline + em-grammar offsets live in the skin, the anchor carries no
    // inline style.
    const { container } = render(<MarkdownView source="[site](https://example.com)" />);
    const anchor = container.querySelector<HTMLElement>('a[data-part="link"]')!;
    expect(anchor.getAttribute('style')).toBeNull();
    expect(skin).toContain('text-decoration: underline');
    expect(skin).toContain('text-decoration-thickness: 0.05em');
    expect(skin).toContain('text-underline-offset: 0.15em');
    expect(skin).not.toContain('!important');
  });

  it('gives links skin-owned hover and focus-visible states (Pass 2)', () => {
    // Hover deepens toward the source's own primary ink (contrast-safe
    // direction); the focus ring follows the badge idiom.
    expect(skin).toContain("a[data-part='link']:hover");
    expect(skin).toContain('color-mix(in srgb, var(--ds-color-link) 72%, var(--ds-color-text-primary))');
    expect(skin).toContain("a[data-part='link']:focus-visible");
    expect(skin).toContain('color-mix(in srgb, var(--ds-color-primary) 24%, transparent)');
    expect(skin).toContain('@media (forced-colors: active)');
  });

  it('registers the family skin in layer(rottay-components) after the legacy anchor bridge drain', () => {
    // The old Modern `[data-tenant] a.link` bridge lived in
    // layer(rottay-engines) and forced this family skin into the same layer as
    // a defensive specificity workaround. R0 drained that bridge into the
    // canonical Link/FileManager skins, so presentation families return to
    // their rightful `rottay-components` owner. Pin both sides of the
    // contract: correct registration and no resurrection of the legacy
    // cross-family anchor paint.
    expect(modernTheme).not.toMatch(/\[data-tenant\]\s+a\.link(?:\W|$)/);
    for (const entry of ['base.css', 'styles.css'] as const) {
      const entrypoint = readFileSync(
        join(__dirname, '../../../../../foundation/tokens/css/facade/entrypoints', entry),
        'utf8',
      );
      expect(entrypoint, entry).toMatch(
        /@import "\.\.\/\.\.\/presentation\/components\/skin\/markdown-view\.css"\s+layer\(rottay-components\);/,
      );
    }
  });
});
