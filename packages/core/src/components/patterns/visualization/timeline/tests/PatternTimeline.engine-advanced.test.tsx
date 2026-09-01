import React from 'react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { StableEngineName } from '@tests/support/engine';
import { STABLE_ENGINES, renderWithEngine } from '@tests/support/engine';
import type { TimelinePatternProps } from '../contracts';
import ClassicTimeline from '../engines/classic';
import ModernTimeline from '../engines/modern';
import RusticTimeline from '../engines/rustic';

type AuditItem = { actor: string };

const COMPONENTS: Record<StableEngineName, React.ComponentType<TimelinePatternProps<AuditItem>>> = {
  classic: ClassicTimeline,
  modern: ModernTimeline,
  rustic: RusticTimeline,
};

const items = [
  {
    key: 'created',
    timestamp: new Date('2026-03-01T10:00:00Z'),
    title: 'Created',
    description: 'Record was created',
    type: 'success' as const,
    user: { name: 'Ana', avatar: 'https://example.com/a.png' },
    data: { actor: 'Ana' },
  },
  {
    key: 'failed',
    timestamp: new Date('2026-03-02T12:30:00Z'),
    title: 'Validation failed',
    description: 'The audit flagged a mismatch',
    type: 'error' as const,
    icon: <span>!</span>,
    data: { actor: 'System' },
  },
];

function createProps(overrides: Partial<TimelinePatternProps<AuditItem>> = {}): TimelinePatternProps<AuditItem> {
  return {
    items,
    header: <div>Timeline header</div>,
    footer: <div>Timeline footer</div>,
    ...overrides,
  };
}

describe('PatternTimeline advanced engine coverage', () => {
  it.each(STABLE_ENGINES)('covers loading and empty states through the %s engine', (engine) => {
    const Component = COMPONENTS[engine];
    const { rerender } = renderWithEngine(
      <Component {...createProps()} loading />,
      engine
    );

    expect(screen.queryByText('Created')).not.toBeInTheDocument();

    rerender(
      <Component
        {...createProps({
          items: [],
          emptyState: <div>Nothing happened yet</div>,
          loading: false,
        })}
      />
    );

    expect(screen.getByText('Nothing happened yet')).toBeInTheDocument();
  });

  it.each(STABLE_ENGINES)('covers grouped rendering, custom item rendering, timestamp toggles, and click flows through the %s engine', async (engine) => {
    const Component = COMPONENTS[engine];
    const onItemClick = vi.fn();
    const { rerender } = renderWithEngine(
      <Component
        {...createProps({
          groupByDate: true,
          mode: 'alternate',
          onItemClick,
          renderItem: (item, defaultRender) => (
            <div data-testid={`timeline-item-${item.key}`}>{defaultRender}</div>
          ),
        })}
      />,
      engine
    );

    expect(await screen.findByText('Timeline header')).toBeInTheDocument();
    expect(screen.getByText('Timeline footer')).toBeInTheDocument();
    expect(screen.getByTestId('timeline-item-created')).toBeInTheDocument();
    expect(screen.getByText('Validation failed')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Validation failed'));
    expect(onItemClick).toHaveBeenCalledWith(expect.objectContaining({ key: 'failed' }));

    if (engine === 'rustic') {
      const failedCard = screen.getByText('Validation failed').closest('div');
      if (failedCard instanceof HTMLElement) {
        fireEvent.mouseEnter(failedCard);
        fireEvent.mouseLeave(failedCard);
      }
    }

    rerender(
      <Component
        {...createProps({
          showTimestamp: false,
          onItemClick,
        })}
      />
    );

    expect(await screen.findByText('Created')).toBeInTheDocument();
  });
});

describe('PatternTimeline modern marker glyph carries the semantic type', () => {
  const typed: TimelinePatternProps<AuditItem>['items'] = [
    { key: 'ok', timestamp: new Date('2026-03-01T10:00:00Z'), title: 'Deployed', type: 'success' },
    { key: 'warn', timestamp: new Date('2026-03-02T10:00:00Z'), title: 'Quota near limit', type: 'warning' },
    { key: 'bad', timestamp: new Date('2026-03-03T10:00:00Z'), title: 'Deploy failed', type: 'error' },
    { key: 'note', timestamp: new Date('2026-03-04T10:00:00Z'), title: 'Config read', type: 'info' },
  ];

  function markerIconNameFor(dataType: string): string | null {
    const marker = document.querySelector(`[data-part="marker-icon"][data-type="${dataType}"]`);
    return marker?.querySelector('[data-icon-name]')?.getAttribute('data-icon-name') ?? null;
  }

  it('renders a distinct governed status role per item type, not a shared checkmark', async () => {
    renderWithEngine(<ModernTimeline<AuditItem> items={typed} />, 'modern');

    expect(await screen.findByText('Deploy failed')).toBeInTheDocument();

    // The failing case before this contract existed: every marker resolved to
    // status.success, so an error entry rendered a (red) checkmark.
    expect(markerIconNameFor('error')).toBe('status.error');
    expect(markerIconNameFor('warning')).toBe('status.warning');
    expect(markerIconNameFor('info')).toBe('status.info');
    expect(markerIconNameFor('success')).toBe('status.success');

    const names = ['success', 'warning', 'error', 'info'].map(markerIconNameFor);
    expect(new Set(names).size).toBe(4);
  });

  it('still lets a consumer icon win over the type-derived glyph', async () => {
    renderWithEngine(
      <ModernTimeline<AuditItem>
        items={[{ ...typed[2], icon: <span>custom-marker</span> }]}
      />,
      'modern'
    );

    expect(await screen.findByText('custom-marker')).toBeInTheDocument();
    expect(markerIconNameFor('error')).toBeNull();
  });
});

describe('PatternTimeline modern colour, avatar and date-group semantics', () => {
  it('routes item.color onto the timeline line-color channel the skin consumes', async () => {
    renderWithEngine(
      <ModernTimeline<AuditItem>
        items={[
          { key: 'a', timestamp: new Date('2026-03-01T10:00:00Z'), title: 'Tinted', color: 'rgb(10, 20, 30)' },
          { key: 'b', timestamp: new Date('2026-03-02T10:00:00Z'), title: 'Untinted' },
        ]}
      />,
      'modern'
    );

    expect(await screen.findByText('Tinted')).toBeInTheDocument();

    const rows = document.querySelectorAll('[data-part="item"]');
    expect(rows).toHaveLength(2);
    expect((rows[0] as HTMLElement).style.getPropertyValue('--ds-timeline-line-color')).toBe('rgb(10, 20, 30)');
    expect((rows[1] as HTMLElement).style.getPropertyValue('--ds-timeline-line-color')).toBe('');
  });

  it('announces the actor name once, not twice via the avatar alt', async () => {
    renderWithEngine(
      <ModernTimeline<AuditItem>
        items={[
          {
            key: 'a',
            timestamp: new Date('2026-03-01T10:00:00Z'),
            title: 'Approved',
            user: { name: 'Ana Ruiz', avatar: 'https://example.com/a.png' },
          },
        ]}
      />,
      'modern'
    );

    expect(await screen.findByText('Approved')).toBeInTheDocument();
    expect(screen.getAllByText('Ana Ruiz')).toHaveLength(1);

    const avatarImg = document.querySelector('[data-part="avatar"] img');
    expect(avatarImg).not.toBeNull();
    expect(avatarImg?.getAttribute('alt')).toBe('');
  });

  it('relates each date group and its list to the date heading', async () => {
    renderWithEngine(
      <ModernTimeline<AuditItem>
        groupByDate
        items={[
          { key: 'a', timestamp: new Date('2026-03-01T10:00:00Z'), title: 'First' },
          { key: 'b', timestamp: new Date('2026-03-05T10:00:00Z'), title: 'Second' },
        ]}
      />,
      'modern'
    );

    expect(await screen.findByText('First')).toBeInTheDocument();

    const headings = screen.getAllByRole('heading');
    expect(headings).toHaveLength(2);
    expect(headings[0].getAttribute('aria-level')).toBe('3');

    const groups = document.querySelectorAll('[data-part="date-group"][role="group"]');
    expect(groups).toHaveLength(2);

    for (const group of Array.from(groups)) {
      const headingId = group.getAttribute('aria-labelledby');
      expect(headingId).toBeTruthy();
      expect(group.querySelector(`#${CSS.escape(headingId as string)}`)).not.toBeNull();
      expect(group.querySelector('[data-part="list"]')?.getAttribute('aria-labelledby')).toBe(headingId);
    }
  });

  it('lets item.color override the type colour on both the connector and the marker', () => {
    const { container } = renderWithEngine(
      <ModernTimeline
        items={[
          { key: 'a', title: 'Override', timestamp: '2026-03-15', type: 'error', color: 'rgb(10, 20, 30)' },
          { key: 'b', title: 'Plain', timestamp: '2026-03-15', type: 'error' },
        ]}
      />,
      'modern',
    );

    const items = container.querySelectorAll('[data-part="item"]');
    const overridden = items[0] as HTMLElement;
    const plain = items[1] as HTMLElement;

    expect(overridden.style.getPropertyValue('--ds-timeline-line-color')).toBe('rgb(10, 20, 30)');
    // The marker tint is a channel, not an inline `color`: the engine stamps
    // it and the skin's four tone rules read it ahead of their semantic token.
    const overriddenMarker = overridden.querySelector('[data-part="marker-icon"]') as HTMLElement;
    expect(overriddenMarker.style.getPropertyValue('--_ds-timeline-marker-color')).toBe(
      'rgb(10, 20, 30)',
    );
    expect(overriddenMarker.style.color).toBe('');

    expect(plain.style.getPropertyValue('--ds-timeline-line-color')).toBe('');
    const plainMarker = plain.querySelector('[data-part="marker-icon"]') as HTMLElement;
    expect(plainMarker.style.getPropertyValue('--_ds-timeline-marker-color')).toBe('');
    expect(plainMarker.style.color).toBe('');
    expect(plainMarker.getAttribute('data-type')).toBe('error');

    // The override only lands because every marker TONE reads the channel
    // first -- a rule that kept a bare semantic token would ignore it. The
    // forced-colors neutralisation (`color: CanvasText`) is deliberately not a
    // tone rule and must keep overriding the caller's tint.
    const toneRules = cssRules(MODERN_SKIN).filter(
      (rule) =>
        rule.selector.includes("data-part='marker-icon'") && /color:\s*var\(/.test(rule.body),
    );
    expect(toneRules).toHaveLength(4);
    for (const rule of toneRules) {
      expect(rule.body).toContain('var(--_ds-timeline-marker-color,');
    }
    expect(MODERN_SKIN).toMatch(/color:\s*CanvasText;/);
  });
});

const MODERN_SKIN = readFileSync(
  join(
    __dirname,
    '../../../../../foundation/tokens/css/runtime/engines/modern/skin/pattern-timeline/index.css',
  ),
  'utf8',
);

/** Flat `selector { body }` rules, including the ones nested in at-rules. */
function cssRules(source: string): { selector: string; body: string }[] {
  const stripped = source.replace(/\/\*[\s\S]*?\*\//g, '');
  return (stripped.match(/[^{}]+\{[^{}]*\}/g) ?? []).map((rule) => {
    const brace = rule.indexOf('{');
    return { selector: rule.slice(0, brace).trim(), body: rule.slice(brace + 1, -1) };
  });
}

function narrowContainerBlock(): string {
  const start = MODERN_SKIN.indexOf('@container ds-pattern-timeline (max-width: 30rem)');
  const open = MODERN_SKIN.indexOf('{', start);
  let depth = 0;
  for (let index = open; index < MODERN_SKIN.length; index += 1) {
    if (MODERN_SKIN[index] === '{') depth += 1;
    else if (MODERN_SKIN[index] === '}') {
      depth -= 1;
      if (depth === 0) return MODERN_SKIN.slice(open + 1, index);
    }
  }
  return '';
}

function narrowGridAreasFor(part: string): string[] {
  return cssRules(narrowContainerBlock())
    .filter((rule) => rule.selector.includes(`data-part='${part}'`))
    .map((rule) => /grid-area:\s*([^;]+);/.exec(rule.body)?.[1]?.trim())
    .filter((area): area is string => Boolean(area));
}

describe('PatternTimeline modern — narrow containers recompose instead of stacking', () => {
  it('never gives the timestamp slot and the item card the same grid area', () => {
    const slotAreas = narrowGridAreasFor('timestamp-slot');
    const cardAreas = narrowGridAreasFor('item-card');

    expect(slotAreas.length).toBeGreaterThan(0);
    expect(cardAreas.length).toBeGreaterThan(0);

    // The failing case before this contract existed: both parts resolved to
    // `grid-area: 1 / 2 / 4 / 3`, so the opaque card painted over its own
    // timestamp inside one grid cell.
    const collisions = slotAreas.filter((area) => cardAreas.includes(area));
    expect(collisions, `overlapping narrow grid areas: ${collisions.join(' | ')}`).toEqual([]);
  });

  it('keeps the leading connector from collapsing when the timestamp is off', () => {
    const leading = cssRules(narrowContainerBlock()).filter((rule) =>
      rule.selector.includes("data-part='connector'") && rule.selector.includes("data-edge='leading'"),
    );

    expect(leading).toHaveLength(1);
    expect(leading[0].body).toContain('min-block-size:');
  });
});

describe('PatternTimeline modern — one boxed region per item', () => {
  it('leaves every frame declaration on the item card, never on the timestamp slot', () => {
    const framedSlotRules = cssRules(MODERN_SKIN).filter(
      (rule) =>
        rule.selector.includes("data-part='timestamp-slot'") &&
        /(?:^|[;\s])(?:border|border-color|background):/.test(rule.body),
    );

    // The failing case before this contract existed: the right-side slot took
    // the boxed treatment while rendering no timestamp of its own, so every
    // right-side item carried an empty bordered counterweight box.
    expect(
      framedSlotRules.map((rule) => rule.selector.trim()),
      'timestamp-slot still paints a frame',
    ).toEqual([]);
  });

  it('gives the timestamp one home on both sides of the rail', async () => {
    const { container } = renderWithEngine(
      <ModernTimeline
        mode="alternate"
        items={[
          { key: 'a', title: 'Left item', timestamp: '2026-03-15T10:00:00Z' },
          { key: 'b', title: 'Right item', timestamp: '2026-03-15T12:00:00Z' },
        ]}
      />,
      'modern',
    );

    expect(await screen.findByText('Right item')).toBeInTheDocument();

    const slots = container.querySelectorAll("[data-part='timestamp-slot']");
    expect(slots).toHaveLength(2);
    expect(Array.from(slots).map((slot) => slot.getAttribute('data-side'))).toEqual(['left', 'right']);

    // Before: the right-side item rendered its <time> inside the card and left
    // the opposite slot empty.
    for (const slot of Array.from(slots)) {
      expect(slot.querySelector("time[data-part='timestamp']")).not.toBeNull();
    }
    expect(container.querySelector("[data-part='item-card'] [data-part='timestamp']")).toBeNull();
    expect(container.querySelectorAll("[data-part='timestamp']")).toHaveLength(2);
  });
});

describe('PatternTimeline modern — the type badge is product copy, not an enum token', () => {
  it('routes each badge through the translation channel with a human floor', async () => {
    const { container } = renderWithEngine(
      <ModernTimeline
        items={[
          { key: 'w', title: 'Quota near limit', timestamp: '2026-03-15T10:00:00Z', type: 'warning' },
          { key: 'e', title: 'Deploy failed', timestamp: '2026-03-15T11:00:00Z', type: 'error' },
        ]}
      />,
      'modern',
    );

    expect(await screen.findByText('Deploy failed')).toBeInTheDocument();

    // Before: the badge printed the raw union member (`warning`, `error`)
    // verbatim in every locale.
    const badges = Array.from(container.querySelectorAll("[data-part='type-badge']"));
    expect(badges.map((badge) => badge.textContent)).toEqual(['Warning', 'Error']);
    expect(screen.queryByText('warning')).toBeNull();
    expect(screen.queryByText('error')).toBeNull();
  });

  it('bidi-isolates the locale-formatted timestamp and date heading', async () => {
    const { container } = renderWithEngine(
      <ModernTimeline
        groupByDate
        items={[{ key: 'a', title: 'Approved', timestamp: '2026-03-15T10:00:00Z' }]}
      />,
      'modern',
    );

    expect(await screen.findByText('Approved')).toBeInTheDocument();
    expect(container.querySelector("[data-part='timestamp']")?.getAttribute('dir')).toBe('auto');
    expect(container.querySelector("[data-part='date-heading']")?.getAttribute('dir')).toBe('auto');
  });
});

describe('PatternTimeline modern — loading preserves the surrounding frame', () => {
  it('keeps header and footer mounted and announces the busy region', async () => {
    const { container, rerender } = renderWithEngine(
      <ModernTimeline
        loading
        header={<div>Activity</div>}
        footer={<div>Load more</div>}
        items={[{ key: 'a', title: 'Approved', timestamp: '2026-03-15T10:00:00Z' }]}
      />,
      'modern',
    );

    const root = container.querySelector("[data-part='root']") as HTMLElement;
    expect(root.getAttribute('data-loading')).toBe('true');

    // Before: the loading branch dropped header and footer, so both appeared
    // for the first time only after the data arrived.
    expect(screen.getByText('Activity')).toBeInTheDocument();
    expect(screen.getByText('Load more')).toBeInTheDocument();
    expect(root.getAttribute('aria-busy')).toBe('true');

    rerender(
      <ModernTimeline
        header={<div>Activity</div>}
        footer={<div>Load more</div>}
        items={[{ key: 'a', title: 'Approved', timestamp: '2026-03-15T10:00:00Z' }]}
      />,
    );

    expect(await screen.findByText('Approved')).toBeInTheDocument();
    expect(screen.getByText('Activity')).toBeInTheDocument();
    expect(screen.getByText('Load more')).toBeInTheDocument();
    expect(
      container.querySelector("[data-part='root']")?.getAttribute('aria-busy'),
    ).toBeNull();
  });

  it('stacks the loading frame so the preserved chrome does not sit beside the spinner', () => {
    const loadingFrame = cssRules(MODERN_SKIN).find(
      (rule) =>
        rule.selector.includes("[data-loading='true']") && !rule.selector.includes('spinner'),
    );

    expect(loadingFrame).toBeDefined();
    expect(loadingFrame?.body).toContain('flex-direction: column;');
  });
});
