import React from 'react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { SchedulerSurface } from '..';
import type { SchedulerSurfaceConfig } from '../../../../../foundation/contracts';
import {
  renderSurface,
  RESOLVED_PHONE_TEST_CONTEXT,
} from '../../../../../foundation/common/test-utils';

const SKIN = readFileSync(
  join(
    __dirname,
    '../../../../../../../foundation/tokens/css/presentation/components/skin/scheduler-surface/index.css',
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

const paintsSolidOutline = (rule: Rule) =>
  declarations(rule.body).some(
    (declaration) =>
      /^outline\s*:/.test(declaration) && /solid/.test(declaration) && !/transparent/.test(declaration),
  );

const AGENDA_EVENT =
  ".ds-surface.ds-scheduler button.ds-scheduler__agenda-event.ds-scheduler__agenda-event";
const AGENDA_EVENT_FOCUS = `${AGENDA_EVENT}:focus-visible`;

function buildConfig(onEventClick?: () => void): SchedulerSurfaceConfig {
  return {
    visual: { mobileView: 'list' },
    presentation: { chrome: { title: 'Schedule' } },
    behavior: {
      events: [
        {
          id: 'evt-1',
          title: 'Launch planning',
          start: new Date('2026-03-13T10:00:00Z'),
          end: new Date('2026-03-13T11:00:00Z'),
        },
      ],
      onEventClick,
      onViewChange: vi.fn(),
    },
    access: undefined,
  };
}

describe('SchedulerSurface — the agenda row wears the tenant focus signature', () => {
  it('renders an actionable agenda row as a DS Button tab stop the skin selects', async () => {
    const onEventClick = vi.fn();
    const { container } = renderSurface(<SchedulerSurface config={buildConfig(onEventClick)} />, {
      engine: 'modern',
      responsiveContext: RESOLVED_PHONE_TEST_CONTEXT,
    });
    await screen.findByText('Schedule');
    await waitFor(() =>
      expect(container.querySelector('button.ds-scheduler__agenda-event')).not.toBeNull(),
    );

    const row = container.querySelector<HTMLElement>('.ds-scheduler__agenda-event');
    expect(row?.tagName).toBe('BUTTON');
    expect(row).toHaveClass('ds-scheduler__agenda-event');
    expect(row).toHaveClass('ds-button');
    expect(row).toHaveAttribute('type', 'button');
    expect(row).not.toHaveAttribute('tabindex', '-1');
    expect(row?.closest('.ds-surface.ds-scheduler')).not.toBeNull();
    expect(row?.querySelector('time')).not.toBeNull();
    expect(row?.querySelector('[data-part="agenda-event-content"]')).toHaveTextContent('Launch planning');

    fireEvent.click(row as HTMLElement);
    expect(onEventClick).toHaveBeenCalledTimes(1);
    expect(onEventClick).toHaveBeenCalledWith(expect.objectContaining({ id: 'evt-1' }));
  });

  it('withdraws the Button chrome on the row and unboxes its wrappers', () => {
    const row = AUTHORED.find(
      (rule) =>
        rule.selector === AGENDA_EVENT && declarations(rule.body).includes('cursor: pointer'),
    );
    expect(declarations(row?.body ?? '')).toEqual(
      expect.arrayContaining([
        'position: static',
        'overflow: visible',
        'white-space: normal',
        'box-shadow: none',
        'filter: none',
        'transform: none',
      ]),
    );

    const wrappers = AUTHORED.find((rule) =>
      rule.selector.endsWith(`> [data-part='content'] > [data-part='label']`),
    );
    expect(wrappers?.selector).toBe(
      `${AGENDA_EVENT} > [data-part='content'], ${AGENDA_EVENT} > [data-part='content'] > [data-part='label']`,
    );
    expect(declarations(wrappers?.body ?? '')).toContain('display: contents');
  });

  it('leaves a read-only agenda row out of the tab order', async () => {
    const { container } = renderSurface(<SchedulerSurface config={buildConfig()} />, {
      engine: 'modern',
      responsiveContext: RESOLVED_PHONE_TEST_CONTEXT,
    });
    await screen.findByText('Schedule');

    const row = container.querySelector<HTMLElement>('.ds-scheduler__agenda-event');
    expect(row?.tagName).toBe('DIV');
    expect(row).not.toHaveAttribute('tabindex');
  });

  it('paints the signature, never a solid outline built from width and colour', () => {
    const focusRules = AUTHORED.filter((rule) => /focus/.test(rule.selector));

    expect(focusRules.filter(paintsSolidOutline)).toEqual([]);
    expect(SKIN).not.toContain('--ds-focus-ring-color');
    expect(focusRules.map((rule) => [rule.selector, declarations(rule.body)])).toEqual([
      [
        AGENDA_EVENT_FOCUS,
        [
          'outline: var(--ds-focus-ring-width) solid transparent',
          'outline-offset: var(--ds-focus-ring-offset)',
          'box-shadow: var(--ds-focus-ring)',
        ],
      ],
    ]);
  });

  it('keeps a system-colour outline for forced colors, where the signature is dropped', () => {
    expect(
      rulesOf(FORCED)
        .filter((rule) => /focus/.test(rule.selector))
        .map((rule) => [rule.selector, declarations(rule.body)]),
    ).toEqual([
      [
        AGENDA_EVENT_FOCUS,
        [
          'outline: max(2px, var(--ds-focus-ring-width)) solid Highlight',
          'outline-offset: var(--ds-focus-ring-offset)',
          'box-shadow: none',
        ],
      ],
    ]);
  });
});
