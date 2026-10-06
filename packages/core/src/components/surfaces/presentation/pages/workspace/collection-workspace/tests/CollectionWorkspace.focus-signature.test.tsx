import React, { useRef } from 'react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { ResponsiveContextValue } from '@/infrastructure/runtime/responsive';
import { CollectionWorkspaceSurface } from '../index';
import { Popover } from '../../../../../../primitives/overlay/popover';
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

const POPOVER_SKIN = readFileSync(
  join(
    __dirname,
    '../../../../../../../foundation/tokens/css/runtime/engines/modern/skin/popover/index.css',
  ),
  'utf8',
).replace(/\/\*[\s\S]*?\*\//g, '');
const POPOVER_SURFACE_FOCUS =
  ".ds-popover.ds-popover--modern[data-part='trigger'] > [data-part='surface']:is([data-state~='focus-visible'], :focus-visible)";
const PAGE_SIZE_FOCUS =
  '.ds-collection-page-size-control:has(.ds-collection-page-size-control__select select:focus-visible)';
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
      <Popover
        anchor={anchorRef}
        open
        onOpenChange={vi.fn()}
        id="filters"
        aria-label="Advanced filters"
        overlayClassName="ds-collection-workspace__filter-dropdown"
        content={<p>No filters are available.</p>}
      />
    </>
  );
}

describe('CollectionWorkspace — own focus targets wear the tenant focus signature', () => {
  it('renders the filter dropdown as a script-focusable Popover surface the skin selects', async () => {
    renderSurface(<Dropdown />, { engine: 'modern', responsiveContext: DESKTOP });

    const surface = await screen.findByRole('dialog', { name: 'Advanced filters', hidden: true });
    expect(surface).toHaveAttribute('data-part', 'surface');
    expect(surface).toHaveAttribute('tabindex', '-1');
    expect(surface).toHaveClass('ds-collection-workspace__filter-dropdown');
    expect(surface.parentElement).toHaveAttribute('data-anchor-scope', 'external');
  });

  it('overlays the page-size pill with the chrome-less Select whose native trigger the skin reads focus from', async () => {
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
    const select = await within(control as HTMLElement).findByRole('combobox', { name: 'Rows per page' });
    expect(select.tagName).toBe('SELECT');
    expect(select).toHaveAttribute('data-chrome', 'none');
    expect(select.parentElement).toHaveClass('ds-collection-page-size-control__select');
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

  it('leaves the dropdown surface focus signature to the Popover skin that paints it', () => {
    // The workspace lands only measure tokens on the surface; it authors no focus paint there.
    const workspaceSurfaceRules = AUTHORED.filter((rule) =>
      rule.selector.includes('ds-collection-workspace__filter-dropdown[data-part="surface"]'),
    );
    expect(workspaceSurfaceRules).toHaveLength(1);
    expect(declarations(workspaceSurfaceRules[0].body)).toEqual([
      '--ds-popover-min-width: var(--ds-collection-filter-dropdown-width, 22.5rem)',
      '--ds-popover-bordered-padding-block: var( --ds-collection-filter-dropdown-padding, var(--ds-popover-padding, var(--ds-spacing-md, 1rem)) )',
      '--ds-popover-bordered-padding-inline: var( --ds-collection-filter-dropdown-padding, var(--ds-popover-padding, var(--ds-spacing-md, 1rem)) )',
    ]);
    expect(SKIN).not.toContain('filter-dropdown-surface');
    expect(rulesFor(rulesOf(POPOVER_SKIN), POPOVER_SURFACE_FOCUS)).not.toHaveLength(0);
  });

  it('dresses the page-size pill in the signature for its hidden select, ahead of its lift', () => {
    expect(rulesFor(AUTHORED, PAGE_SIZE_FOCUS)).toEqual([
      [
        '--_ds-collection-page-size-focus-layer: var(--ds-focus-ring),',
        'outline: var(--ds-focus-ring-width) solid transparent',
        'outline-offset: var(--ds-focus-ring-offset)',
      ],
    ]);

    // The lift is stated once; the signature leads it through a layer that is
    // empty until the select holds keyboard focus.
    const resting = rulesFor(AUTHORED, '.ds-collection-page-size-control:focus-within');
    expect(resting).toHaveLength(1);
    expect(resting[0]).toContain(
      `box-shadow: var(--_ds-collection-page-size-focus-layer,) ${PAGE_SIZE_LIFT}`,
    );
    expect(resting[0].join(' ')).not.toMatch(/0 0 0 3px/);
    expect(SKIN.split(PAGE_SIZE_LIFT)).toHaveLength(2);
    expect(SKIN.match(/--_ds-collection-page-size-focus-layer\s*:/g)).toHaveLength(1);
  });

  it('spaces the disclosure action row from its own content box, never from the workspace root', () => {
    // The disclosure mounts beside the root; a root-scoped rule would never reach the row.
    expect(
      rulesFor(
        AUTHORED,
        '.ds-collection-workspace__filter-dropdown-content[data-part="filter-dropdown-content"] > .ds-collection-workspace__filter-dropdown-actions[data-part="filter-dropdown-actions"]',
      ),
    ).toEqual([['margin-block-start: var(--ds-spacing-md)']]);
    expect(
      AUTHORED.filter(
        (rule) => rule.selector.includes('filter-dropdown-actions') && rule.selector.includes('.ds-surface'),
      ),
    ).toEqual([]);
  });

  it('keeps a system-colour outline on the page-size pill in forced colors, where the signature is dropped', () => {
    const forced = rulesOf(FORCED).filter((rule) =>
      rule.selector.split(',').some((selector) => selector.trim() === PAGE_SIZE_FOCUS),
    );
    expect(forced.map((rule) => [rule.selector, declarations(rule.body)])).toEqual([
      [
        PAGE_SIZE_FOCUS,
        [
          'outline: max(2px, var(--ds-focus-ring-width)) solid Highlight',
          'outline-offset: var(--ds-focus-ring-offset)',
          'box-shadow: none',
        ],
      ],
    ]);
  });
});
