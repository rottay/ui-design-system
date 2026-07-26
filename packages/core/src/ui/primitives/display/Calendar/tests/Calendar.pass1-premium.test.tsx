import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import { I18nProvider } from '@/infrastructure/runtime/i18n';
import { bithireBrandTheme } from '@/foundation/tokens/ts/presentation/brand-themes';
import { themanagementmiamiBrandTheme } from '@/foundation/tokens/ts/presentation/brand-themes/fixtures/themanagementmiami';
import { compileBrandTheme } from '@/infrastructure/compilers/kernel/runtime/brand-theme';

import CalendarModern from '../engines/modern';

// --- WCAG helpers for the contrast measurements ----------------------------

function relativeLuminance(hex: string): number {
  const c = hex.replace('#', '');
  const f = (i: number) => {
    const v = parseInt(c.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(0) + 0.7152 * f(2) + 0.0722 * f(4);
}

function contrastRatio(a: string, b: string): number {
  const x = relativeLuminance(a);
  const y = relativeLuminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

// The modern skin is the single paint owner for this engine. These assertions
// pin the Pass-1 ownership contract: header-control geometry and the
// today-ring width live in the skin (not inline, not a state-conditional
// Tailwind utility), and the direction-hardcoded nav glyphs flip under RTL.
const skin = readFileSync(
  join(__dirname, '../../../../../foundation/tokens/css/runtime/engines/modern/skin/calendar.css'),
  'utf8',
);
const engineSource = readFileSync(join(__dirname, '..', 'engines', 'modern', 'index.tsx'), 'utf8');

afterEach(cleanup);

/** A date inside the current month that is never today, so the today-ring state renders. */
function notToday(): Date {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), today.getDate() === 1 ? 2 : 1);
}

describe('Modern Calendar premium contract — Pass 1', () => {
  it('moves the six repeated header-control inline styles into the skin', () => {
    expect(engineSource).not.toContain("height: 32");
    expect(engineSource).not.toContain("padding: '0 12px'");
    expect(engineSource).not.toContain('fontSize: 13');
    expect(skin).toContain('block-size: 32px');
    expect(skin).toContain('padding-inline: 12px');
    expect(skin).toContain('font-size: 13px');
  });

  it('owns the today-ring border width in the skin, preserving the today-and-not-selected matrix', () => {
    // No more state-conditional Tailwind `border` utility in the engine.
    expect(engineSource).not.toContain("? 'border'");
    expect(skin).toMatch(
      /\[data-part='cell'\]\[data-today='true'\]:not\(\[data-selected='true'\]\)\s*\{\s*border:\s*1px solid var\(--ds-color-primary\)/,
    );
  });

  it('flips the direction-hardcoded nav glyphs under RTL via the skin, not a markup branch', () => {
    expect(skin).toMatch(
      /\[dir='rtl'\]\s+\.rottay-calendar\.rottay-calendar--modern\[data-part='root'\]\s+\[data-part='nav-button'\]\s*\{\s*transform:\s*scaleX\(-1\)/,
    );
    // Glyphs stay in DOM order; the flip is purely visual.
    expect(engineSource).toContain('data-direction="prev-year"');
    expect(engineSource).not.toMatch(/dir(?:ection)?\s*===?\s*'rtl'/i);
  });

  it('renders header controls without inline style, with glyph content and accessible names', () => {
    render(<CalendarModern defaultValue={notToday()} fullscreen={false} />);

    // Text content stays the glyph; the accessible name is the guarded label
    // (Pass 2 a11y: a bare '«' is not an accessible name).
    const navExpectations: Array<[string, string]> = [
      ['«', 'Previous year'],
      ['‹', 'Previous month'],
      ['›', 'Next month'],
      ['»', 'Next year'],
    ];
    for (const [glyph, name] of navExpectations) {
      const button = screen.getByRole('button', { name });
      expect(button.textContent).toBe(glyph);
      expect(button.getAttribute('style')).toBeNull();
      expect(button.getAttribute('data-part')).toBe('nav-button');
    }
    for (const toggle of screen.getAllByRole('button', { name: /year|^\w+ \d{4}$/i })) {
      if (toggle.getAttribute('data-part') === 'mode-toggle') {
        expect(toggle.getAttribute('style')).toBeNull();
      }
    }
  });

  it('paints the today cell without the border utility and anchors the cell overlay logically', () => {
    render(
      <CalendarModern
        defaultValue={notToday()}
        fullscreen={false}
        dateCellRender={() => <span>•</span>}
      />,
    );

    const todayCell = document.querySelector<HTMLElement>(
      '[data-part="cell"][data-today="true"][data-selected="false"]',
    );
    expect(todayCell).not.toBeNull();
    expect(todayCell!.className.split(/\s+/)).not.toContain('border');

    const overlay = todayCell!.querySelector<HTMLElement>('[data-part="cell-content"]');
    expect(overlay).not.toBeNull();
    expect(overlay!.className.split(/\s+/)).toEqual(expect.arrayContaining(['start-0', 'end-0']));
    expect(overlay!.className.split(/\s+/)).not.toEqual(expect.arrayContaining(['left-0', 'right-0']));
  });

  it('keeps one anatomy across writing directions', () => {
    const { container, rerender } = render(
      <div dir="ltr">
        <CalendarModern defaultValue={notToday()} fullscreen={false} />
      </div>,
    );
    const ltrParts = container.querySelectorAll('[data-part]').length;

    rerender(
      <div dir="rtl">
        <CalendarModern defaultValue={notToday()} fullscreen={false} />
      </div>,
    );
    expect(container.querySelectorAll('[data-part]').length).toBe(ltrParts);
  });
});

describe('Modern Calendar guarded i18n channel (K4-B)', () => {
  const CUSTOM_WEEKDAYS = {
    sun: 'dom',
    mon: 'lun',
    tue: 'mar',
    wed: 'mié',
    thu: 'jue',
    fri: 'vie',
    sat: 'sáb',
  } as const;
  const CUSTOM_MONTHS = {
    january: 'enero',
    february: 'febrero',
    march: 'marzo',
    april: 'abril',
    may: 'mayo',
    june: 'junio',
    july: 'julio',
    august: 'agosto',
    september: 'septiembre',
    october: 'octubre',
    november: 'noviembre',
    december: 'diciembre',
  } as const;
  const MONTH_KEY_BY_INDEX = Object.keys(CUSTOM_MONTHS) as Array<keyof typeof CUSTOM_MONTHS>;

  it('keeps the English labels when the keys are missing in locale AND fallback locale (echo guard)', () => {
    // fr/pt JSONs do not carry the calendar keys yet; pinning both locales to
    // fr keeps the catalog silent so the guard must fall back.
    render(
      <I18nProvider locale="fr" fallbackLocale="fr">
        <CalendarModern defaultValue={notToday()} />
      </I18nProvider>,
    );
    expect(screen.getByRole('button', { name: 'Year' })).toBeInTheDocument();
    expect(screen.getAllByText('Sun')).toHaveLength(1);
  });

  it('consumes calendar.weekdays.* / calendar.months.* / calendar.yearToggle once the keys land', () => {
    const viewMonth = notToday().getMonth();
    render(
      <I18nProvider
        locale="es"
        customTranslations={{
          components: {
            calendar: {
              weekdays: CUSTOM_WEEKDAYS,
              months: CUSTOM_MONTHS,
              yearToggle: 'Año',
            },
          },
        }}
      >
        <CalendarModern defaultValue={notToday()} fullscreen={false} />
      </I18nProvider>,
    );

    expect(screen.getByRole('button', { name: 'Año' })).toBeInTheDocument();
    // Compact mode shows the first letter of the (translated) weekday.
    expect(screen.getByText('d')).toBeInTheDocument();
    // The month toggle carries the translated month name for the viewed month.
    const expectedMonth = CUSTOM_MONTHS[MONTH_KEY_BY_INDEX[viewMonth]];
    expect(
      screen.getByRole('button', { name: new RegExp(`${expectedMonth} \\d{4}`) }),
    ).toBeInTheDocument();
  });
});

describe('Modern Calendar remediation (K4-B)', () => {
  it('paints the day-cell hover from the canonical interactive-hover chain, with a raw escape hatch (R5)', () => {
    // The old var(--ds-surface-inset) hover was invisible against the root's
    // surface-card on governed sources; the rule now rides
    // --ds-color-interactive-bg-hover with a color-mix fallback.
    expect(skin).toMatch(
      /\[data-part='cell'\]:hover:not\(\[data-selected='true'\]\):not\(\[data-disabled\]\)\s*\{\s*background:\s*var\(\s*--ds-calendar-cell-hover,\s*var\(--ds-color-interactive-bg-hover,\s*color-mix\(in srgb, var\(--ds-color-primary\) 8%, transparent\)\)\s*\)\s*;/,
    );
    // The invisible-inset paint is gone from the hover rule.
    expect(skin).not.toMatch(/:hover[^{]*\{\s*background:\s*var\(--ds-surface-inset\)/);
  });

  it('renders the DOM the hover selector targets: root classes, direct-child grid, gated cell attributes (R5)', () => {
    const { container } = render(<CalendarModern defaultValue={notToday()} fullscreen={false} />);

    const root = container.querySelector<HTMLElement>('[data-part="root"]')!;
    expect(root.classList.contains('rottay-calendar')).toBe(true);
    expect(root.classList.contains('rottay-calendar--modern')).toBe(true);

    const grid = container.querySelector<HTMLElement>('[data-part="grid"]')!;
    // The selector chains with `>`: grid must be a direct child of root.
    expect(grid.parentElement).toBe(root);

    const cells = Array.from(grid.children).filter(
      (el): el is HTMLElement => el instanceof HTMLElement && el.dataset.part === 'cell',
    );
    expect(cells.length).toBeGreaterThan(0);
    for (const cell of cells) {
      // Cells are direct children of the grid and carry the gating attributes
      // the :not() guards read (data-disabled present only when disabled).
      expect(cell.parentElement).toBe(grid);
      expect(cell.getAttribute('data-selected')).toMatch(/^(true|false)$/);
      if (!cell.hasAttribute('disabled')) {
        expect(cell.hasAttribute('data-disabled')).toBe(false);
      }
    }
    // At least one hoverable (non-disabled, non-selected) day exists.
    expect(
      cells.some(
        (cell) => !cell.hasAttribute('disabled') && cell.getAttribute('data-selected') === 'false',
      ),
    ).toBe(true);
  });

  it('carries no transition utility on cells, so the skin-owned hover paints at the hover instant (R2-1)', () => {
    // Tailwind's `utilities` layer sorts ABOVE the skin's `rottay-engines`
    // layer, so a utility `transition-colors` cannot be overridden by the
    // skin and defers hover paint through a 150ms fade from transparent --
    // an immediate computed-style sample reads rgba(0,0,0,0). Removed from
    // both cell types; motion re-ownership is a Pass-2 skin decision.
    expect(engineSource).not.toContain('transition-colors');

    const { container } = render(<CalendarModern defaultValue={notToday()} fullscreen={false} />);
    for (const cell of Array.from(container.querySelectorAll('[data-part="cell"]'))) {
      expect(cell.className.split(/\s+/)).not.toContain('transition-colors');
    }
  });

  it('pins the primary-fill inks to a white-guaranteed chain that clears AA on both raw primaries (R2-2)', () => {
    // The old inks broke on governed sources: --ds-color-text-inverse is
    // undeclared in the bithire light context (IACVT -> inherits dark body
    // ink, 3.80:1 on #3A6FB0) and --ds-color-text-on-primary's base #0C0C0E
    // fails on the TMM teal (3.57:1 on #0F766E). No DECLARATION may ride them
    // (rule comments mention them only to document why).
    expect(skin).not.toMatch(/color:\s*var\(--ds-color-text-inverse/);
    expect(skin).not.toMatch(/color:\s*var\(--ds-color-text-on-primary/);
    expect(skin).toContain(
      'color: var(--ds-calendar-selected-ink, var(--ds-color-white, #fff))',
    );
    expect(skin).toContain('color: var(--ds-calendar-active-ink, var(--ds-color-white, #fff))');

    // Measured on the compiled BrandThemes (same method as the CodeBlock
    // gutter measurement): white ink on BOTH raw primaries clears AA with
    // margin, so the fills stay raw.
    const bithire = compileBrandTheme({ brandTheme: bithireBrandTheme, tenantSlug: 'bithire' });
    const tmm = compileBrandTheme({
      brandTheme: themanagementmiamiBrandTheme,
      tenantSlug: 'themanagementmiami',
    });
    const white = '#FFFFFF';
    expect(contrastRatio(white, bithire.cssVariables['--ds-color-primary'])).toBeGreaterThanOrEqual(
      4.5,
    );
    expect(contrastRatio(white, tmm.cssVariables['--ds-color-primary'])).toBeGreaterThanOrEqual(4.5);

    // The documented defects, measured: both old ink candidates failed.
    expect(contrastRatio('#0C0C0E', tmm.cssVariables['--ds-color-primary'])).toBeLessThan(4.5);
    expect(contrastRatio('#14283B', bithire.cssVariables['--ds-color-primary'])).toBeLessThan(4.5);
  });

  it('levels the header chrome hover to the certified ghost-button grammar (Pass 2)', () => {
    // Same law as Transfer's move/pagination buttons: tenant ghost tint with a
    // surface-inset floor, gated :not(:disabled), family escape hatch, and the
    // ACTIVE mode toggle excluded so selected > rest stays discernible.
    expect(skin).toMatch(
      /\[data-part='nav-button'\]:not\(:disabled\):hover,\s*\n\.rottay-calendar\.rottay-calendar--modern\[data-part='root'\] > \[data-part='header'\] > div > \[data-part='mode-toggle'\]:not\(\[data-active='true'\]\):not\(:disabled\):hover\s*\{\s*background:\s*var\(--ds-calendar-nav-bg-hover, var\(--ds-button-ghost-bg-hover, var\(--ds-surface-inset\)\)\)/,
    );
    // The old "transcribed, not levelled" header claim is gone.
    expect(skin).not.toContain('transcribed, not');
    expect(skin).toContain('LEVELLED');
    // The month label never wraps inside the 32px control (capture evidence:
    // "July 2026" wrapped to two lines under bithire metrics).
    expect(skin).toContain('white-space: nowrap');
  });

  it('targets >= 44px day-cell touch targets on coarse pointers without clipping compact (Pass 2)', () => {
    expect(skin).toContain('@media (pointer: coarse)');
    expect(skin).toContain('min-block-size: 44px');
    expect(skin).toContain('min-inline-size: 44px');
    // The compact root widens through the engine's pointer-coarse utility so
    // 7x44px tracks + gaps + padding (364px) fit: no clipping trade-off.
    expect(engineSource).toContain('pointer-coarse:w-[22.75rem]');
  });

  it('re-maps the state channels to system colors under forced-colors (Pass 2)', () => {
    expect(skin).toContain('@media (forced-colors: active)');
    // selected + active toggle: Highlight fill; today ring: Highlight edge;
    // disabled: GrayText ink (the opacity-30 channel is utilities-owned).
    expect(skin).toMatch(/forced-colors: active\)[^{]*\{[^}]*\[data-selected='true'\][^{]*\{[^}]*background:\s*Highlight/s);
    expect(skin).toContain('color: HighlightText');
    expect(skin).toContain('border-color: Highlight');
    expect(skin).toContain('color: GrayText');
  });

  it('keeps the state cascade discernible: selected > today > hover > rest use distinct channels', () => {
    // selected: primary fill + white ink; today (not selected): primary ring
    // only; hover (rest): interactive-hover tint; rest: transparent. Each
    // state paints through a different channel so no two states collapse.
    expect(skin).toMatch(/\[data-selected='true'\]\s*\{\s*background:\s*var\(--ds-color-primary\)/);
    expect(skin).toMatch(
      /\[data-today='true'\]:not\(\[data-selected='true'\]\)\s*\{\s*border:\s*1px solid var\(--ds-color-primary\)/,
    );
    expect(skin).toContain('--ds-color-interactive-bg-hover');
  });
});

describe('Modern Calendar W10 second visual pass', () => {
  it('moves every radius off the fixed rounded-lg utility onto tenant-scaled skin steps', () => {
    // The engine ships NO radius utility anymore: Tailwind's rounded-lg is a
    // fixed 8px deaf to --ds-radius-scale; the skin rides the scaled steps.
    // (Precise class-context substrings -- the engine docblock cites the old
    // utility name when documenting the move.)
    expect(engineSource).not.toContain('rottay-calendar--modern rounded-lg');
    expect(engineSource).not.toContain('justify-center rounded-lg');
    expect(engineSource).not.toContain('p-4 rounded-lg');
    // Root = lg (panel), cells = md (SAME step as the header chrome) -- one
    // geometry law, both with a family escape hatch.
    expect(skin).toMatch(
      /\[data-part='root'\]\s*\{[^}]*border-radius:\s*var\(--ds-calendar-radius, var\(--ds-radius-lg\)\)/,
    );
    expect(skin).toContain(
      'border-radius: var(--ds-calendar-cell-radius, var(--ds-radius-md))',
    );

    const { container } = render(<CalendarModern defaultValue={notToday()} fullscreen={false} />);
    expect(container.querySelector('[data-part="root"]')!.className).not.toContain('rounded-lg');
    for (const cell of Array.from(container.querySelectorAll('[data-part="cell"]'))) {
      expect(cell.className.split(/\s+/)).not.toContain('rounded-lg');
    }
  });

  it('gives the panel a single surface edge and a header hairline instead of nested boxes', () => {
    expect(skin).toContain(
      'border: 1px solid var(--ds-calendar-border, var(--ds-color-border-subtle))',
    );
    expect(skin).toMatch(
      /\[data-part='header'\]\s*\{\s*padding-block-end:\s*10px;\s*border-block-end:\s*1px solid var\(--ds-calendar-header-border, var\(--ds-color-border-subtle\)\)/,
    );
  });

  it('establishes typographic hierarchy: period title semibold, weekday micro-labels', () => {
    expect(skin).toMatch(
      /\[data-part='mode-toggle'\]\[data-mode='month'\]\s*\{\s*font-size:\s*var\(--ds-font-size-sm, 14px\);\s*font-weight:\s*var\(--ds-font-weight-semibold, 600\)/,
    );
    expect(skin).toMatch(
      /\[data-part='weekday-header'\]\s*\{\s*font-size:\s*var\(--ds-font-size-xs, 12px\);\s*font-weight:\s*var\(--ds-font-weight-medium, 500\);\s*letter-spacing:\s*0\.04em;\s*text-transform:\s*uppercase/,
    );
    // The selected day is the grid's focal point (weight on the primary fill).
    expect(skin).toMatch(
      /\[data-selected='true'\]\s*\{[^}]*font-weight:\s*var\(--ds-font-weight-semibold, 600\)/,
    );
  });

  it('paints keyboard focus with the canonical ring on every interactive part', () => {
    expect(skin).toMatch(
      /\[data-part='nav-button'\]:focus-visible,\s*\n\.rottay-calendar\.rottay-calendar--modern\[data-part='root'\] > \[data-part='header'\] > div > \[data-part='mode-toggle'\]:focus-visible,\s*\n\.rottay-calendar\.rottay-calendar--modern\[data-part='root'\] > \[data-part='grid'\] > \[data-part='cell'\]:focus-visible\s*\{\s*box-shadow:\s*var\(--ds-calendar-focus-ring, var\(--ds-focus-ring\)\)/,
    );
    // Forced colors drops box-shadows: the ring re-maps to a Highlight outline.
    expect(skin).toMatch(/forced-colors: active\)[\s\S]*outline:\s*2px solid Highlight/);
  });

  it('adds a press channel one step deeper than hover, gated like hover, without transforms', () => {
    // Cells and header chrome both ride the WO-ENG-04 active token; the active
    // mode toggle stays excluded (same law as the hover grammar).
    expect(skin).toMatch(
      /\[data-part='cell'\]:active:not\(\[data-selected='true'\]\):not\(\[data-disabled\]\)\s*\{\s*background:\s*var\(\s*--ds-calendar-cell-active,\s*var\(--ds-color-interactive-bg-active/,
    );
    expect(skin).toContain('--ds-calendar-nav-bg-active');
    // No transform scale anywhere: the RTL glyph flip owns `transform` on nav
    // buttons and a scaling grid cell jitters its neighbours.
    expect(skin).not.toMatch(/:active[^{]*\{[^}]*transform/);
  });

  it('resolves the K4-B deferred motion re-ownership in the skin, clamped under reduced motion', () => {
    // The engine still ships no transition utility (utilities layer is
    // ungovernable from the skin); the unlayered skin owns the transition on
    // the repainted channels only.
    expect(engineSource).not.toContain('transition-colors');
    expect(skin).toMatch(
      /\[data-part='grid'\] > \[data-part='cell'\]\s*\{[^}]*transition:\s*background-color var\(--ds-motion-fast\) var\(--ds-motion-ease-out\)/,
    );
    expect(skin).toMatch(/prefers-reduced-motion: reduce\)\s*\{[\s\S]*transition-duration:\s*0\.01ms/);
  });
});
