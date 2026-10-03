import React, { useRef } from 'react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { ResponsiveContextValue } from '@/infrastructure/runtime/responsive';
import { CollectionWorkspaceSurface } from '../index';
import { CollectionFilterDropdown } from '../filter-dropdown';
import { renderSurface } from '../../../../../foundation/common/test-utils';

const SKIN = readFileSync(
  join(
    __dirname,
    '../../../../../../../foundation/tokens/css/presentation/components/skin/collection-workspace/index.css',
  ),
  'utf8',
).replace(/\/\*[\s\S]*?\*\//g, '');

interface Rule {
  selector: string;
  body: string;
}

function rulesOf(css: string): Rule[] {
  return [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((match) => ({
    selector: match[1].trim().replace(/\s+/g, ' '),
    body: match[2],
  }));
}

function forcedColorsBlock(css: string): string {
  const start = css.indexOf('@media (forced-colors: active)');
  if (start === -1) return '';
  let depth = 0;
  for (let index = css.indexOf('{', start); index < css.length; index += 1) {
    if (css[index] === '{') depth += 1;
    if (css[index] === '}') depth -= 1;
    if (depth === 0) return css.slice(start, index + 1);
  }
  return css.slice(start);
}

const FORCED = forcedColorsBlock(SKIN);
const AUTHORED = rulesOf(SKIN.replace(FORCED, ''));

const declarations = (body: string) =>
  body
    .split(';')
    .map((declaration) => declaration.trim().replace(/\s+/g, ' '))
    .filter(Boolean);

const rulesFor = (rules: Rule[], selector: string) =>
  rules.filter((rule) => rule.selector === selector).map((rule) => declarations(rule.body));

const SURFACE_FOCUS =
  '.ds-collection-workspace__filter-dropdown[data-part="filter-dropdown-surface"]:focus-visible';
const PAGE_SIZE_FOCUS =
  '.ds-collection-page-size-control:has(.ds-collection-page-size-control__select:focus-visible)';
const PAGE_SIZE_LIFT = '0 8px 18px color-mix(in srgb, var(--ds-color-primary) 7%, transparent)';

const DESKTOP: ResponsiveContextValue = {
  hasResolvedViewport: true,
  deviceClass: 'desktop',
  activeBreakpoint: 'lg',
  isPhone: false,
  isTablet: false,
  isDesktop: true,
  pointer: 'fine',
  orientation: 'landscape',
  prefersReducedMotion: false,
  isPhoneOrTablet: false,
  isTabletOrDesktop: true,
  isTouchDevice: false,
  virtualKeyboardInset: 0,
  isVirtualKeyboardOpen: false,
};

type Row = { id: string; name: string };

function Dropdown() {
  const anchorRef = useRef<HTMLButtonElement>(null);
  return (
    <>
      <button ref={anchorRef} type="button">
        Advanced filters
      </button>
      <CollectionFilterDropdown
        anchorRef={anchorRef}
        open
        onOpenChange={vi.fn()}
        id="filters"
        ariaLabel="Advanced filters"
      >
        <p>No filters are available.</p>
      </CollectionFilterDropdown>
    </>
  );
}

describe('CollectionWorkspace — own focus targets wear the tenant focus signature', () => {
  it('renders the filter dropdown as a script-focusable dialog surface the skin selects', () => {
    render(<Dropdown />);

    const surface = screen.getByRole('dialog', { name: 'Advanced filters', hidden: true });
    expect(surface).toHaveAttribute('data-part', 'filter-dropdown-surface');
    expect(surface).toHaveAttribute('tabindex', '-1');
    expect(surface).toHaveClass('ds-collection-workspace__filter-dropdown');
  });

  it('overlays the page-size pill with the native select the skin reads focus from', async () => {
    const view = renderSurface(
      <CollectionWorkspaceSurface<Row>
        title="Records"
        data={[{ id: '1', name: 'Alpha' }]}
        columns={[{ key: 'name', dataIndex: 'name', title: 'Name' } as never]}
        rowKey="id"
        presentation={{ enhancedInteractions: true }}
        behavior={{
          pagination: { current: 1, pageSize: 500, total: 1200, pageSizeOptions: [500, 1000], onChange: vi.fn() },
        }}
      />,
      { engine: 'modern', responsiveContext: DESKTOP },
    );
    await waitFor(() => {
      expect(view.container.querySelector('[data-part="page-size-control"]')).not.toBeNull();
    });

    const control = view.container.querySelector<HTMLElement>('[data-part="page-size-control"]');
    expect(control).toHaveClass('ds-collection-page-size-control');
    const select = within(control as HTMLElement).getByRole('combobox', { name: 'Rows per page' });
    expect(select.tagName).toBe('SELECT');
    expect(select).toHaveClass('ds-collection-page-size-control__select');
    expect(select).not.toHaveAttribute('tabindex', '-1');
  });

  it('builds no solid outline from the tenant focus channels', () => {
    const offenders = [...AUTHORED, ...rulesOf(FORCED)].filter(
      (rule) =>
        /focus/.test(rule.selector) &&
        declarations(rule.body).some(
          (declaration) =>
            /^outline\s*:/.test(declaration) &&
            /solid/.test(declaration) &&
            /--ds-focus-ring-(width|color)/.test(declaration) &&
            !/transparent|Highlight/.test(declaration),
        ),
    );
    expect(offenders).toEqual([]);
    expect(SKIN).not.toContain('--ds-focus-ring-color');
  });

  it('composes the signature ahead of the popover elevation on the dropdown surface', () => {
    expect(rulesFor(AUTHORED, SURFACE_FOCUS)).toEqual([
      [
        'outline: var(--ds-focus-ring-width) solid transparent',
        'outline-offset: var(--ds-focus-ring-offset)',
        'box-shadow: var(--ds-focus-ring)',
      ],
      ['box-shadow: var(--ds-focus-ring), var(--ds-popover-shadow, var(--ds-elevation-3))'],
    ]);
    // A `none` elevation would void the whole shadow list, signature included.
    expect(SKIN.replace(/\s+/g, ' ')).toContain(
      `@container (not style(--ds-popover-shadow: none)) and (not style(--ds-elevation-3: none)) { ${SURFACE_FOCUS} { box-shadow: var(--ds-focus-ring), var(--ds-popover-shadow, var(--ds-elevation-3)); } }`,
    );
  });

  it('dresses the page-size pill in the signature for its hidden select, ahead of its lift', () => {
    expect(rulesFor(AUTHORED, PAGE_SIZE_FOCUS)).toEqual([
      [
        'outline: var(--ds-focus-ring-width) solid transparent',
        'outline-offset: var(--ds-focus-ring-offset)',
        `box-shadow: var(--ds-focus-ring), ${PAGE_SIZE_LIFT}`,
      ],
    ]);

    const resting = rulesFor(AUTHORED, '.ds-collection-page-size-control:focus-within');
    expect(resting).toHaveLength(1);
    expect(resting[0]).toContain(`box-shadow: ${PAGE_SIZE_LIFT}`);
    expect(resting[0].join(' ')).not.toMatch(/0 0 0 3px/);
  });

  it('keeps a system-colour outline on both in forced colors, where the signature is dropped', () => {
    const forced = rulesOf(FORCED).filter((rule) =>
      rule.selector.split(',').some((selector) => [SURFACE_FOCUS, PAGE_SIZE_FOCUS].includes(selector.trim())),
    );
    expect(forced.map((rule) => [rule.selector, declarations(rule.body)])).toEqual([
      [
        `${PAGE_SIZE_FOCUS}, ${SURFACE_FOCUS}`,
        [
          'outline: max(2px, var(--ds-focus-ring-width)) solid Highlight',
          'outline-offset: var(--ds-focus-ring-offset)',
          'box-shadow: none',
        ],
      ],
    ]);
  });
});
