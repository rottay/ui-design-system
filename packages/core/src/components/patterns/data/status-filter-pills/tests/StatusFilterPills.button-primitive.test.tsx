import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import React from 'react';
import postcss from 'postcss';
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { renderWithEngine } from '@tests/support/engine';
import { StatusFilterPills } from '..';

const SKIN = readFileSync(
  join(__dirname, '../../../../../foundation/tokens/css/presentation/components/skin/status-filter-pills/index.css'),
  'utf8',
);
const Icon = (props: Record<string, unknown>) => <svg {...props} />;
const OPTIONS = [
  { value: 'open', label: 'Open', count: 4, icon: Icon },
  { value: 'closed', label: 'Closed' },
];
const PILL = 'ds-status-filter-pills__pill';
const ROSTER = JSON.parse(
  readFileSync(join(__dirname, '../../../../../../scripts/check/tokens/cascade/chrome-none/roster/index.json'), 'utf8'),
);
const NOT_FOCUSED = ":not(:where([data-state~='focused'], [data-state~='focus-visible'], :focus-visible))";

describe('StatusFilterPills -- each pill is the chrome-less Button', () => {
  it('composes the round chrome-less Button with toggle semantics and the Button anatomy', async () => {
    const onChange = vi.fn();
    renderWithEngine(<StatusFilterPills options={OPTIONS} value="open" onChange={onChange} showCounts size="sm" />, 'modern');
    const open = await screen.findByRole('button', { name: /Open/, pressed: true });
    const closed = screen.getByRole('button', { name: 'Closed', pressed: false });
    for (const pill of [open, closed]) {
      expect(pill).toHaveClass('ds-button', 'ds-button--modern', PILL);
      expect(pill).toHaveAttribute('data-chrome', 'none');
      expect(pill).toHaveAttribute('data-shape', 'round');
      expect(pill).toHaveAttribute('data-size', 'sm');
      expect(pill).not.toHaveAttribute('data-part', 'pill');
    }
    expect(open).toHaveAttribute('data-selected', 'true');
    expect(open.querySelector("[data-part='icon'] [data-part='pill-icon']")).not.toBeNull();
    expect(open.querySelector("[data-part='label'] [data-part='pill-label']")).toHaveTextContent('Open');
    expect(open.querySelector("[data-part='suffix'] [data-part='count-badge']")).toHaveTextContent('4');
    fireEvent.click(closed);
    expect(onChange).toHaveBeenCalledWith('closed');
  });

  it.each(['classic', 'rustic'] as const)('keeps the Modern chrome-less pill under a %s route, where only Modern honors chrome', async (engine) => {
    renderWithEngine(<StatusFilterPills options={OPTIONS} value="open" onChange={() => {}} showCounts />, engine);
    const open = await screen.findByRole('button', { name: /Open/, pressed: true });
    expect(open).toHaveClass('ds-button--modern', PILL);
    expect(open).toHaveAttribute('data-chrome', 'none');
  });

  it('is the markup the chrome-none gate measures as the pills host', async () => {
    const host = ROSTER.hosts.find((entry: { id: string }) => entry.id === 'status-filter-pills');
    const view = renderWithEngine(<StatusFilterPills options={[{ value: 'open', label: 'Open' }]} value="none" onChange={() => {}} size="md" />, 'modern');
    await screen.findByRole('button', { name: 'Open' });
    expect(view.container.innerHTML).toBe(host.markup);
  });

  it('paints only chrome on the pill, leaves focus to the Button, and passes its type as Button channels (A1, H3, Q11)', () => {
    const CHROME = /^(padding|padding-.+|background|background-.+|border|border-(?!.*radius).+|color|box-shadow|min-block-size|backdrop-filter|-webkit-backdrop-filter)$/;
    const onPill: postcss.Rule[] = [];
    let channels: Record<string, string> = {};
    postcss.parse(SKIN).walkRules((rule) => {
      if (rule.selector.trim().endsWith(".ds-pattern-status-filter-pills[data-part='root']")) {
        rule.walkDecls((decl) => {
          channels = { ...channels, [decl.prop]: decl.value };
        });
      }
      if (rule.selectors.some((selector) => new RegExp(`\\.${PILL}(\\.${PILL})*(\\.ds-button)?(\\[|:|$)`).test(selector.trim().split(/\s+/).pop() ?? ''))) onPill.push(rule);
    });
    expect(onPill.length).toBeGreaterThan(0);
    for (const rule of onPill) {
      rule.walkDecls((decl) => {
        expect(decl.prop, `${rule.selector} { ${decl.prop} }`).toMatch(CHROME);
        if (decl.prop === 'box-shadow') for (const selector of rule.selectors) expect(selector).toContain(NOT_FOCUSED);
      });
    }
    expect(SKIN).not.toMatch(/outline|--ds-filter-pill-focus-ring|\[data-part='pill'\]/);
    expect(Object.keys(channels).sort()).toEqual([
      '--ds-button-font-weight',
      '--ds-button-label-offset-y',
      '--ds-button-letter-spacing',
      '--ds-button-md-font-size',
      '--ds-button-md-gap',
      '--ds-button-md-icon-size',
      '--ds-button-md-line-height',
      '--ds-button-sm-font-size',
      '--ds-button-sm-gap',
      '--ds-button-sm-icon-size',
      '--ds-button-sm-line-height',
      '--ds-button-text-transform',
      'flex-wrap',
    ]);
  });
});
