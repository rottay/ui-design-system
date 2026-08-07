import React from 'react';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ModernDescriptions, { Item as ModernItem } from '../engines/modern';

describe('Descriptions modern advanced coverage', () => {
  it('covers horizontal layout, bordered headers, responsive columns, spans, and shared item styles', () => {
    const { container } = render(
      <ModernDescriptions
        title="Profile"
        extra={<button type="button">Manage</button>}
        bordered
        column={{ md: 2, lg: 4 }}
        size="small"
        styles={{
          label: { color: 'rgb(255, 0, 0)' },
          content: { fontWeight: 700 },
        }}
      >
        <ModernItem label="Name" span={2} styles={{ label: { fontStyle: 'italic' } }}>
          Ada Lovelace
        </ModernItem>
        <ModernItem label="Email">ada@rottay.dev</ModernItem>
      </ModernDescriptions>
    );

    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Manage' })).toBeInTheDocument();

    // K3-A Pass 1: the bordered/size utility classes are gone from the body --
    // the skin paints those channels keyed on data-bordered / data-size, so the
    // DOM carries the hooks only.
    const wrapper = container.querySelector('[data-engine="modern"] > [data-part="body"]') as HTMLDivElement;
    expect(wrapper.className).not.toContain('border');
    expect(wrapper.className).not.toContain('text-sm');

    const root = container.querySelector('[data-engine="modern"]') as HTMLDivElement;
    expect(root).toHaveAttribute('data-bordered', 'true');
    expect(root).toHaveAttribute('data-size', 'small');
    const grid = container.querySelector('[data-part="rows"]') as HTMLDivElement;
    // Retargeted, not weakened: the widest declared count governs the span clamp, both tiers
    // reach the skin, and the responsive posture writes no inline count.
    expect(root).toHaveAttribute('data-columns', 'responsive');
    expect(root).toHaveAttribute('data-column-count', '4');
    expect(root).toHaveAttribute('data-item-count', '2');
    expect(root).toHaveAttribute('data-has-header', 'true');
    expect(root.style.getPropertyValue('--ds-descriptions-column-count')).toBe('');
    expect(root.style.getPropertyValue('--_ds-descriptions-columns-md')).toBe('2');
    expect(root.style.getPropertyValue('--_ds-descriptions-columns-lg')).toBe('4');
    expect(grid).toHaveAttribute('role', 'list');
    expect(grid.querySelector('[data-part="row"]')).toHaveAttribute('data-span', '2');
    expect(screen.getByText('Name:')).toHaveStyle({ color: 'rgb(255, 0, 0)', fontStyle: 'italic' });
    expect(screen.getByText('Ada Lovelace')).toHaveStyle({ fontWeight: '700' });
  });

  it('covers vertical layout, colon=false, unbordered rendering, and standalone item wrappers', () => {
    const { container } = render(
      <>
        <ModernDescriptions layout="vertical" bordered={false} colon={false} size="middle">
          <ModernItem label="Status">Live</ModernItem>
          {null}
        </ModernDescriptions>
        <ModernItem label="Detached">Standalone</ModernItem>
      </>
    );

    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.queryByText('Status:')).not.toBeInTheDocument();
    // The vertical separator was a `divide-y` utility the bundle never
    // generated (dead class); it is gone -- the skin owns the row chrome.
    expect(container.querySelector('.divide-y')).toBeNull();
    // Vertical mode carries the data-layout hook the W6-D subgrid skin scopes to.
    expect(container.querySelector('[data-part="root"][data-layout="vertical"]')).toBeTruthy();
    expect(screen.getByText('Standalone')).toBeInTheDocument();
  });
});

describe('Descriptions modern — span is clamped to the row track count', () => {
  const SKIN = readFileSync(
    join(
      dirname(fileURLToPath(import.meta.url)),
      '../../../../../foundation/tokens/css/runtime/engines/modern/skin/descriptions.css'
    ),
    'utf8'
  );

  it('never lets an item span more tracks than the grid declares', () => {
    const { container } = render(
      <ModernDescriptions column={3}>
        <ModernItem label="Wide" span={5}>Overreaching</ModernItem>
        <ModernItem label="Normal">Fine</ModernItem>
      </ModernDescriptions>
    );

    const [wide, normal] = Array.from(
      container.querySelectorAll('[data-part="row"]')
    ) as HTMLElement[];

    // 5 > 3 would grow two implicit columns and re-track every other row.
    expect(wide).toHaveAttribute('data-span', '3');
    expect(wide.style.getPropertyValue('--ds-descriptions-item-span')).toBe('3');
    expect(normal).toHaveAttribute('data-span', '1');
  });

  it('floors a zero, negative, fractional or absent span at one track', () => {
    const { container } = render(
      <ModernDescriptions column={4}>
        <ModernItem label="Zero" span={0}>a</ModernItem>
        <ModernItem label="Negative" span={-2}>b</ModernItem>
        <ModernItem label="Fractional" span={2.7}>c</ModernItem>
        <ModernItem label="Absent">d</ModernItem>
      </ModernDescriptions>
    );

    const spans = Array.from(container.querySelectorAll('[data-part="row"]')).map((row) =>
      row.getAttribute('data-span')
    );
    // `span={0}` used to reach CSS as the invalid `grid-column: span 0`.
    expect(spans).toEqual(['1', '1', '2', '1']);
  });

  it('clamps the vertical layout the same way', () => {
    const { container } = render(
      <ModernDescriptions layout="vertical" column={2}>
        <ModernItem label="Wide" span={9}>x</ModernItem>
      </ModernDescriptions>
    );

    expect(container.querySelector('[data-part="row"]')).toHaveAttribute('data-span', '2');
  });

  it('falls back to the contract default when the column count is unusable', () => {
    const { container } = render(
      <ModernDescriptions column={0}>
        <ModernItem label="Wide" span={9}>x</ModernItem>
      </ModernDescriptions>
    );

    const root = container.querySelector('[data-part="root"]') as HTMLElement;
    // `repeat(0, ...)` is invalid CSS; the default track count takes over and
    // the span clamps to it.
    expect(root).toHaveAttribute('data-column-count', '3');
    expect(container.querySelector('[data-part="row"]')).toHaveAttribute('data-span', '3');
  });

  it('the narrow container query re-tracks a multi-span row instead of growing columns', () => {
    // At <=860px the grid drops to two tracks; a span authored for the wide
    // grid is still wider than that, so the skin gives it the whole row.
    expect(SKIN).toMatch(
      /@container \(max-width: 860px\)[\s\S]*?\[data-part='row'\]:not\(\[data-span='1'\]\)\s*\{\s*grid-column:\s*1 \/ -1;/
    );
  });
});
